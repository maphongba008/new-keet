import { NativeModules } from 'react-native'
import { requireNativeModule } from 'expo-modules-core'
import RPC from 'tiny-buffer-rpc'

// @ts-ignore
import type KeetBackend from '@holepunchto/keet-backend'
import APIS from '@holepunchto/keet-core-api/api.json'
import { makeBackend } from 'mobile-core/backend'

import { isAndroid } from './platform'

// declare API entrypoints from keet-core-api
const keetApis = Object.fromEntries(
  APIS.filter((apiData) => apiData.api).map((apiData) => [apiData.api, {}]),
)

const backend: KeetBackend = {
  api: {
    mobile: {},
    ...keetApis,
  },
} as any

const rpc = new RPC((data) => {
  // use !process.env.JEST_WORKER_ID to make sure it won't run on jest test
  // __kc was init in native thread
  !process.env.JEST_WORKER_ID && __kc.sync(data)
})

__kc_syncListener = (data) => {
  rpc.recv(data)
}

let installing: null | Promise<void> = null
const makeInstall = async () => {
  if (isAndroid) {
    const module = requireNativeModule('KeetCoreModule')
    module.installKeetCoreNative()
  } else {
    await NativeModules.KeetNativeModule.setup()
  }
  makeBackend(rpc, backend)
}

export const installKeetCore = () => {
  if (installing) return installing
  installing = makeInstall()
  return installing
}

export const getKeetBackend = () => backend
