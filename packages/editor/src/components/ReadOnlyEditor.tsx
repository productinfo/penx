import { useCallback, useEffect, useState } from 'react'
import { Editor, Transforms } from 'slate'
import { Editable, RenderElementProps, Slate } from 'slate-react'
import { ElementProps } from '@penx/extension-typings'
import { Node } from '@penx/model'
import { INode } from '@penx/model-types'
import { Paragraph } from '@penx/paragraph'
import { StoreProvider } from '@penx/store'
import { useCreateEditor } from '../hooks/useCreateEditor'
import { NodeEditorEditable } from './NodeEditorEditable'

interface Props {
  content: any[]
  nodes: INode[]
}

export function ReadOnlyEditor({ content, nodes }: Props) {
  const editor = useCreateEditor()

  editor.isReadonly = true
  editor.items = nodes.map((n) => new Node(n))

  return (
    <StoreProvider>
      <Slate editor={editor} initialValue={content}>
        <NodeEditorEditable readOnly />
      </Slate>
    </StoreProvider>
  )
}
