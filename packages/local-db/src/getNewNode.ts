import { nanoid } from 'nanoid'
import { ELEMENT_P } from '@penx/constants'
import { INode, NodeStatus, NodeType } from '@penx/types'

type Input = {
  spaceId: string
  type?: NodeType
}

export function getNewNode(input: Input, text = ''): INode {
  return {
    id: nanoid(),
    type: NodeType.COMMON,
    element: {
      id: nanoid(),
      type: ELEMENT_P,
      children: [{ text }],
    },
    props: {},
    status: NodeStatus.NORMAL,
    collapsed: false,
    children: [],
    openedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...input,
  }
}