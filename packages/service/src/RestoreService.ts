import { Octokit } from 'octokit'
import { db } from '@penx/local-db'
import { decryptByMnemonic } from '@penx/mnemonic'
import { Node, SnapshotDiffResult, Space, User } from '@penx/model'
import { IFile, INode, ISpace, NodeType } from '@penx/model-types'
import { normalizeNodes } from '@penx/shared'
import { api } from '@penx/trpc-client'

export type TreeItem = {
  path: string
  // mode: '100644' | '100755' | '040000' | '160000' | '120000'
  mode: '100644'
  // type: 'blob' | 'tree' | 'commit'
  type: 'blob'
  content?: string
  sha?: string | null
}

type FileNode = {
  fileId: string
  mime: string
}

interface SharedParams {
  owner: string
  repo: string
  headers: {
    'X-GitHub-Api-Version': string
  }
}

type Content = {
  content?: string
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'file' | 'dir'
}

export class RestoreService {
  mnemonic: string

  private params: SharedParams

  user: User

  nodes: INode[]

  space: ISpace

  filesTree: Content[]

  private app: Octokit

  spaceId: string

  commitHash: string

  get baseBranchName() {
    return 'main'
  }

  get pagesDir() {
    return this.spaceId + '/pages'
  }

  getNodePath(id: string) {
    return `${this.pagesDir}/${id}.json`
  }

  setSharedParams(repoOwner: string, repoName: string) {
    const sharedParams = {
      owner: repoOwner,
      repo: repoName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
    this.params = sharedParams
  }

  static async init(
    user: User,
    space: Space,
    commitHash: string,
    mnemonic: string,
  ) {
    const s = new RestoreService()
    s.user = user

    s.commitHash = commitHash
    s.spaceId = space.id

    const token = await api.github.getTokenByUserId.query({
      userId: user.id,
    })

    s.setSharedParams(user.repoOwner, user.repoName)

    s.app = new Octokit({ auth: token })

    s.mnemonic = mnemonic

    return s
  }

  async pull() {
    let nodes: INode[] = []
    try {
      await this.pullSpaceInfo()
      const pagesTree = await this.getPagesTreeInfo()

      for (const item of pagesTree) {
        const pageRes: any = await this.app.request(
          'GET /repos/{owner}/{repo}/contents/{path}',
          {
            ...this.params,
            ref: this.commitHash,
            path: item.path,
          },
        )

        const originalContent = JSON.parse(decodeBase64(pageRes.data.content))
        nodes = [...nodes, ...originalContent]
      }
    } catch (error) {
      throw new Error('GitHub backup url is invalid')
    }

    try {
      this.nodes = nodes.map<INode>((n) => ({
        ...n,
        element: JSON.parse(
          decryptByMnemonic(n.element as string, this.mnemonic),
        ),
        props: JSON.parse(decryptByMnemonic(n.props as any, this.mnemonic)),
      }))
    } catch (error) {
      console.log('=========error:', error)
      throw new Error('Recover phrase is wrong')
    }

    this.nodes = normalizeNodes(this.nodes)

    /**
     * save to local db
     */
    if (this.space && this.nodes.length) {
      const currentSpace = await db.getSpace(this.space.id)

      if (currentSpace) {
        await db.deleteSpace(this.space.id)

        await db.createSpace({
          ...this.space,
          pageSnapshot: currentSpace.pageSnapshot,
          nodeSnapshot: currentSpace.nodeSnapshot,
        })
      } else {
        await db.createSpace({
          ...this.space,
        })
      }

      const currentNodes = await db.listNodesBySpaceId(this.space.id)

      for (const item of currentNodes) {
        await db.deleteNode(item.id)
      }

      // console.log('=========nodes:', this.nodes)

      for (const item of this.nodes) {
        await db.createNode({
          ...item,
        })
      }
    }

    return this.space
  }

  private async pullSpaceInfo() {
    const spaceRes: any = await this.app.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        ...this.params,
        // ref: `heads/${this.baseBranchName}`,
        ref: this.commitHash,
        path: `${this.spaceId}/space.json`,
      },
    )

    if (spaceRes.data.content) {
      const originalContent = atob(spaceRes.data.content)
      const space: ISpace = JSON.parse(originalContent)

      this.space = space
    }
  }

  async getPagesTreeInfo() {
    try {
      const contentRes = await this.app.request(
        'GET /repos/{owner}/{repo}/contents/{path}',
        {
          ...this.params,
          ref: this.commitHash,
          path: this.pagesDir,
        },
      )

      console.log(
        'commitHash:',
        this.commitHash,
        'this.pagesDir:',
        this.pagesDir,
      )

      this.filesTree = contentRes.data as any
    } catch (error) {
      console.log('======pull pages error:', error)

      this.filesTree = []
    }

    console.log('this.pagesTree:', this.filesTree)

    return this.filesTree
  }
}

function decodeBase64(base64String: string): string {
  const decodedArray = new Uint8Array(
    atob(base64String)
      .split('')
      .map((char) => char.charCodeAt(0)),
  )
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(decodedArray)
}
