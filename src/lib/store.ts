// Created new store file to avoid require cycle and to get access to store without using hooks or components which does not have access

interface Store {
  getState?: any
  dispatch?: any
}

export let store: Store = {}

export const injectStore = (_store: Store) => {
  store = _store
}

export const getStore = () => store
export const getDispatch = () => store?.dispatch || function () {}
export const getState = () => store?.getState?.()
