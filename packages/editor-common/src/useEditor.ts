import { BaseEditor, Element } from 'slate'
import { HistoryEditor } from 'slate-history'
import { ReactEditor, useSlate, useSlateStatic } from 'slate-react'

export type TElement<T = string> = Element & { type: T; nodeType?: string }

export type Projected = {
  depth: number
  maxDepth: number
  minDepth: number
  parentId: string | null
}

export type PenxEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    elementMaps: any
    onKeyDownFns: any
    onBlurFns: any
    onClickBullet: any
    isBlockSelectorOpened: boolean
    isTagSelectorOpened: boolean
    nodeToDecorations: Map<any, Range[]>

    projected: Projected | null

    // save flattened node to editor
    flattenedItems: any[]
  }

export function useEditor() {
  return useSlate() as PenxEditor
}

export function useEditorStatic() {
  return useSlateStatic() as PenxEditor
}
