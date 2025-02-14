import { appSlice } from '@holepunchto/keet-store/store/app'
import {
  INITIAL_STATE as CALL_INITIAL_STATE,
  CALL_SETTINGS_INITIAL_STATE,
  CALL_STATE_KEY,
} from '@holepunchto/keet-store/store/call'
import { DEVICE_STATE_KEY } from '@holepunchto/keet-store/store/media'
import { roomSlice } from '@holepunchto/keet-store/store/room'

import { FACE_CAM_DEVICE_STATIC_ID } from 'sagas/callSaga'

export const roomId = 'testRoomId'
export const roomTitle = 'testRoomTitle'
export const route = { params: { roomId } }

export const preloadedStateWithCall = {
  [appSlice.name]: {
    ...appSlice.getInitialState(),
    currentCallRoomId: roomId,
  },
  [CALL_STATE_KEY]: {
    ...CALL_INITIAL_STATE,
    presenceMemberIds: ['member1', 'member2'],
  },
  [roomSlice.name]: {
    ...roomSlice.getInitialState(),
    roomById: {
      [roomId]: {
        canCall: 'true',
        title: roomTitle,
      },
    },
  },
}

export const preloadedStateWithAudioMuted = {
  ...preloadedStateWithCall,
  [CALL_STATE_KEY]: {
    ...preloadedStateWithCall[CALL_STATE_KEY],
    settings: {
      ...CALL_SETTINGS_INITIAL_STATE,
      isAudioMuted: true,
    },
  },
}

export const preloadedStateVideoLimit = {
  ...preloadedStateWithCall,
  [CALL_STATE_KEY]: {
    ...CALL_INITIAL_STATE,
    settings: {
      ...CALL_SETTINGS_INITIAL_STATE,
      isVideoMuted: false,
    },
    mediaBySwarmId: {
      xawdtpcatw9e457csykoaad44q7kbeij4pncfgkrmsrra1pwmcco: {
        id: 'xawdtpcatw9e457csykoaad44q7kbeij4pncfgkrmsrra1pwmcco',
        memberId: 'pk8p8fz8j3b3sqiee6gg9xu4s1tua86ouy71ay199tiarjgb4qao',
        isAudioMuted: true,
        isVideoMuted: false,
        streamByName: {
          camera: {
            id: 'd0e1c5e8-b148-4e72-8406-567fc6758f0d',
          },
        },
      },
    },
  },
}

export const preloadedStateWithTwoVideo = {
  ...preloadedStateVideoLimit,
  [CALL_STATE_KEY]: {
    ...preloadedStateVideoLimit[CALL_STATE_KEY],
    memberId: 'ownMember',
    presenceMemberSwarmIds: ['member1', 'member2'],
    presenceBySwarmId: {
      member1: {
        streamByName: {
          camera: {
            id: 'd0e1c5e8-b148-4e72-8406-567fc6758f0d_1',
          },
        },
      },
      member2: {
        streamByName: {
          camera: {
            id: 'd0e1c5e8-b148-4e72-8406-567fc6758f0d_2',
          },
        },
      },
    },
    settings: {
      ...preloadedStateVideoLimit[CALL_STATE_KEY].settings,
      videoQuality: 2,
    },
    mediaBySwarmId: {
      ...preloadedStateVideoLimit[CALL_STATE_KEY].mediaBySwarmId,
      member1: {
        id: 'member1',
        memberId: 'member1',
        isAudioMuted: true,
        isVideoMuted: false,
        streamByName: {
          camera: {
            id: 'd0e1c5e8-b148-4e72-8406-567fc6758f0d_2',
          },
        },
      },
      member2: {
        id: 'member2',
        memberId: 'member2',
        isAudioMuted: false,
        isVideoMuted: false,
        streamByName: {
          camera: {
            id: 'd0e1c5e8-b148-4e72-8406-567fc6758f0d_2',
          },
        },
      },
    },
  },
}

export const preloadedStateMyVideoDevice = {
  ...preloadedStateWithCall,
  [CALL_STATE_KEY]: {
    ...CALL_INITIAL_STATE,
    settings: {
      ...CALL_SETTINGS_INITIAL_STATE,
      isVideoMuted: false,
    },
  },
  [DEVICE_STATE_KEY]: {
    devicesMap: {
      [FACE_CAM_DEVICE_STATIC_ID]: {
        deviceStaticId: FACE_CAM_DEVICE_STATIC_ID,
      },
    },
    video: {
      activeDev: {
        deviceStaticId: FACE_CAM_DEVICE_STATIC_ID,
      },
      devices: [
        {
          deviceStaticId: FACE_CAM_DEVICE_STATIC_ID,
        },
      ],
    },
  },
}
