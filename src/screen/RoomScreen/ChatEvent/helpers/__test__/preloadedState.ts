import { fileSlice, FileStats } from '@holepunchto/keet-store/store/media/file'

export const roomId = 'testRoomId'
export const roomTitle = 'testRoomTitle'
export const route = { params: { roomId } }

export const FILE_1_STATS: FileStats = {
  peers: 1,
  downloadStats: {
    speed: 100,
    blocks: 1,
    peers: 1,
  },
  uploadStats: {
    speed: 50,
    blocks: 1,
    peers: 1,
  },
  blob: {
    byteLength: 1024,
    blockLength: 1023,
    blockOffset: 1022,
    byteOffset: 1021,
  },
}

export const FILE_2_STATS: FileStats = {
  peers: 5,
  downloadStats: {
    speed: 200,
    blocks: 5,
    peers: 5,
  },
  uploadStats: {
    speed: 100,
    blocks: 1,
    peers: 1,
  },
  blob: {
    byteLength: 2048,
    blockLength: 2047,
    blockOffset: 2046,
    byteOffset: 2045,
  },
}

export const preloadedStateWithoutFileStats = {
  [fileSlice.name]: {
    ...fileSlice.getInitialState(),
    file: {
      statsById: {},
    },
  },
}

export const preloadedStateWithFileStats = {
  ...preloadedStateWithoutFileStats,
  [fileSlice.name]: {
    ...fileSlice.getInitialState(),
    file: {
      statsById: {
        file1: FILE_1_STATS,
        file2: FILE_2_STATS,
      },
    },
  },
}
