import * as FileSystem from 'expo-file-system'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { MAX_SHARE_COUNT } from './constants'
import { deleteAttachmentsFromCache } from './download'
import { getDecodedLocalUri, getFileName, getPathFromUri } from './fs'
import { getMimeTypeAsync } from './KeetVideoUtilsModule'
import { localStorage } from './localStorage'
import { getUploadFile } from './media/getUploadFile'
import { prefetchImage } from './previewLink'
import { getState } from './store'
import { SendFilesInfo } from './types'

export interface LinkPreviewObjectType {
  [key: string]: {
    url: string
    title: string
    description?: string
    mimeType?: string
    image?: string // Safely handle empty images
    icon?: string
  }
}

export interface UploadFile {
  id: string
  name?: string
  path: string | null
  type: string | undefined
  dimensions?: {
    width: number
    height: number
  } | null
  byteLength: number
  isUploading?: boolean
  isDownloading?: boolean
  avatar?: string
  previewPath?: string
  title?: string
  description?: string
  isLinkPreview?: boolean
  icon?: string
  duration?: number
}

interface UploadsDataState {
  pendingAmount: number
  uploads: Partial<Record<string, UploadFile>>
  rooms: Partial<Record<string, string[]>>
}
interface UploadsState extends UploadsDataState {
  set: (uploadId: string, data: UploadFile, roomId: string) => void
  setRemoteFiles: (
    uri: string[],
    roomId: string,
    filenames: {
      [key: string]: string
    },
    previewData?: {},
  ) => Promise<void>
  decrementPendingAmount: () => void
  uploadFileToState: (roomId: string, file: UploadFile, id: string) => void
  updateFileState: (id: string, updates: FileUploadStateHelperType) => void
  removeFileFromState: (roomID: string, id: string) => void
  setPendingAmount: (pendingAmount: number) => void
  get: (uploadId: string) => UploadFile | undefined
  getUploadByRoomId: (roomId: string) => string[]
  startUploading: (uploadIds: string[]) => void
  clear: (params?: { roomId: string } | { id: string }) => void
}

interface FileUploadStateHelperType {
  path?: string
  byteLength?: number
  type?: string
  name?: string
  dimensions?: {
    height: number
    width: number
  } | null
  previewData: LinkPreviewObjectType['key']
}
const getDefaultUploadsState = (): UploadsDataState => ({
  pendingAmount: 0,
  uploads: {},
  rooms: {},
})

const fileUploadStateHelper = (
  state: any,
  id: string,
  data: FileUploadStateHelperType,
) => {
  const upload = state.uploads[id]
  upload.isDownloading = false
  upload.path = data.path ?? null
  upload.byteLength = data.byteLength ?? 0
  upload.type = data.type ?? null
  upload.name = data.name ?? ''
  upload.dimensions = data.dimensions ?? null
  upload.isLinkPreview = !!data.previewData
  upload.title = data.previewData?.title ?? ''
  upload.description = data.previewData?.description ?? ''
  upload.icon = data.previewData?.icon ?? null
  if (state.pendingAmount > 0) state.pendingAmount -= 1
}

async function getFileSize(fileUri: string): Promise<number> {
  const fileInfo = await FileSystem.getInfoAsync(fileUri)
  return fileInfo.exists ? fileInfo.size : 0
}

export const useUploadsStore = create<UploadsState>()(
  persist(
    (set, get) => ({
      ...getDefaultUploadsState(),
      set: (uploadId, data, roomId) => {
        set(
          produce((state) => {
            if (state.pendingAmount > 0) state.pendingAmount -= 1
            state.uploads = {
              ...state.uploads,
              [uploadId]: data,
            }
            state.rooms = {
              ...state.rooms,
              [roomId]: [...(state.rooms[roomId] || []), uploadId],
            }
          }),
        )
      },
      setRemoteFiles: async (urls, roomId, filenames = {}) => {
        urls.forEach(async (url) => {
          const hasFilenames = Object.keys(filenames).length > 0
          const id = hasFilenames
            ? filenames?.[url]
            : getFileName(url) || `${Date.now()}`
          const roomUploadIds = get().rooms[roomId] || []

          if (roomUploadIds.includes(id)) return

          try {
            const file: UploadFile = {
              id,
              path: url,
              byteLength: 0,
              type: await getMimeTypeAsync(url),
              isDownloading: true,
            }

            set(
              produce((state) => {
                state.uploads[id] = file
                state.rooms[roomId] = [...(state.rooms[roomId] || []), id]
              }),
            )
            const localUrl = await prefetchImage(url)
            const byteLength = await getFileSize(localUrl)

            set(
              produce((state) => {
                state.uploads[id].isDownloading = false
                state.uploads[id].path = getPathFromUri(localUrl)
                state.uploads[id].byteLength = byteLength
              }),
            )
          } catch (error) {
            set(
              produce((state) => {
                delete state.uploads[id]
                state.rooms[id] = state.rooms[roomId].filter(
                  (uploadId: string) => uploadId !== id,
                )
              }),
            )
          }
        })
      },
      decrementPendingAmount: () => {
        set(
          produce((state) => {
            if (state.pendingAmount > 0) state.pendingAmount -= 1
          }),
        )
      },
      uploadFileToState: (roomId, file, id) => {
        set(
          produce((state) => {
            state.uploads[id] = file
            state.rooms[roomId] = [...(state.rooms[roomId] || []), id]
          }),
        )
        decrementPendingUploadsAmount()
      },
      updateFileState: (id, updates) => {
        let savedFileInfo = get().uploads[id]
        savedFileInfo &&
          set(
            produce((state) => {
              fileUploadStateHelper(state, id, updates)
            }),
          )
      },
      removeFileFromState: (roomId, id) => {
        set(
          produce((state) => {
            delete state.uploads[id]
            state.rooms[roomId] = state.rooms[roomId]?.filter(
              (uploadId: string) => uploadId !== id,
            )
          }),
        )
        decrementPendingUploadsAmount()
      },
      setPendingAmount: (pendingAmount) => {
        set(produce((_) => ({ pendingAmount })))
      },
      startUploading: (uploadIds) => {
        set(
          produce((state) => {
            uploadIds.forEach((uploadId) => {
              const upload = state.uploads[uploadId]

              if (!upload) {
                return
              }

              upload.isUploading = true
            })
          }),
        )
      },
      get: (uploadId) => {
        const upload = get().uploads[uploadId]

        if (!upload) return upload
        const { path } = upload
        return {
          ...upload,
          path: path ? getDecodedLocalUri(path) : null,
        }
      },
      getUploadByRoomId: (roomId) => {
        return get().rooms[roomId] ?? []
      },
      clear: (params) => {
        if (!params) {
          set(getDefaultUploadsState)
          return
        }

        if ('id' in params) {
          const uploads = { ...get().uploads }
          const rooms = { ...get().rooms }

          delete uploads[params.id]

          Object.keys(rooms).forEach((roomId) => {
            const roomUploadKeys = rooms[roomId]
            if (roomUploadKeys && roomUploadKeys.includes(params.id)) {
              rooms[roomId] = roomUploadKeys.filter(
                (uploadKey) => uploadKey !== params.id,
              )
            }
          })

          set({
            pendingAmount: 0,
            uploads,
            rooms,
          })
        }
      },
    }),
    {
      name: 'upload-storage',
      storage: createJSONStorage(() => localStorage as StateStorage),
    },
  ),
)

export const set: UploadsState['set'] = (uploadId, data, roomId) =>
  useUploadsStore.getState().set(uploadId, data, roomId)

export const addUploadFile = async (filesInfo: SendFilesInfo) => {
  if (!filesInfo.uri) return
  const roomId = getAppCurrentRoomId(getState())
  const _file: UploadFile = await getUploadFile(filesInfo)

  set(_file.id, _file, roomId)
}

export const setRemoteFiles: UploadsState['setRemoteFiles'] = (
  urls,
  roomId,
  filenames,
  previewData,
) =>
  useUploadsStore
    .getState()
    .setRemoteFiles(urls, roomId, filenames, previewData)

export const get: UploadsState['get'] = (uploadId) =>
  useUploadsStore.getState().get(uploadId)

export const clear: UploadsState['clear'] = (params) => {
  const allUploads = Object.values(
    useUploadsStore.getState().uploads,
  ) as UploadFile[]

  let uploads: UploadFile[] = []
  if (!params) {
    uploads = allUploads
  } else if ('id' in params) {
    uploads = allUploads.filter(({ id }) => id === params.id)
  } else if ('roomId' in params) {
    const roomUploads = useUploadsStore.getState().rooms[params.roomId] || []
    uploads = allUploads.filter(({ id }) => roomUploads.includes(id))
  }

  useUploadsStore.getState().clear(params)
  deleteAttachmentsFromCache(uploads)
}

export const del = (id: string) => {
  if (!id) return
  clear({ id })
}

export const startUploading: UploadsState['startUploading'] = (params) =>
  useUploadsStore.getState().startUploading(params)

const MEMOIZED_ARRAY: any = []
const selectAllUploads = (
  state: UploadsState,
  roomId: string,
): UploadFile[] => {
  const { uploads, rooms } = state
  const uploadKeys = rooms[roomId]

  if (uploadKeys) {
    return uploadKeys.reduce((result, key) => {
      const uploadFile = uploads[key]

      if (uploadFile && !uploadFile.isUploading) {
        result.push(uploadFile)
      }

      return result
    }, [] as UploadFile[])
  }

  return MEMOIZED_ARRAY
}

export const getAllUploads = (roomId: string): UploadFile[] =>
  selectAllUploads(useUploadsStore.getState(), roomId)

export const useRoomUploads = (roomId: string): UploadFile[] =>
  useUploadsStore(useShallow((state) => selectAllUploads(state, roomId)))

export const useRoomUploadsAndPending = (
  roomId: string,
): Array<UploadFile | null> =>
  useUploadsStore(
    useShallow((state) => [
      ...selectAllUploads(state, roomId),
      ...Array(state.pendingAmount).fill(null),
    ]),
  )

export const clearAllUploads = () => useUploadsStore.getState().clear()

export const decrementPendingUploadsAmount = () =>
  useUploadsStore.getState().decrementPendingAmount()

export const uploadFileToState = (
  roomId: string,
  file: UploadFile,
  id: string,
) => useUploadsStore.getState().uploadFileToState(roomId, file, id)

export const updateFileState = (
  id: string,
  updates: FileUploadStateHelperType,
) => useUploadsStore.getState().updateFileState(id, updates)

export const removeFileFromState = (roomId: string, id: string) =>
  useUploadsStore.getState().removeFileFromState(roomId, id)

export const getUploadByRoomId = (roomId: string) =>
  useUploadsStore.getState().getUploadByRoomId(roomId)

export const setPendingUploadsAmount = (pendingAmount: number) =>
  useUploadsStore.getState().setPendingAmount(pendingAmount)

export const allowMoreUploads = (roomId: string) => {
  const roomUploads = useUploadsStore.getState().rooms[roomId] || []

  return roomUploads.length < MAX_SHARE_COUNT
}
