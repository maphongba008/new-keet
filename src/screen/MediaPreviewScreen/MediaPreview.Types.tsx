export interface MediaPreviewPosition {
  x: number
  y: number
  width: number
  height: number
}
export type MediaFileMimeType = `${'image' | 'video'}${'' | `/${string}`}`
export interface MediaPreviewEntryBase {
  id: string
  uri: string
  previewUri?: string
  groupId: string
  mediaType: MediaFileMimeType
  aspectRatio?: number
}
export interface MediaPreviewEntry extends MediaPreviewEntryBase {
  index: number | null
  isReversed?: boolean
}
export interface MediaPreviewType extends MediaPreviewEntryBase {
  name: string
  position: MediaPreviewPosition
}

export enum PageScrollStateTypes {
  DRAGGING = 'dragging',
  SETTLING = 'settling',
  IDLE = 'idle',
}
