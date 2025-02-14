import { render, screen } from '@testing-library/react-native'
import { BackHandler } from 'react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import { applicationSlice } from 'reducers/application'

import AppModal, { ModalTypes } from 'component/AppModal'
import { colors } from 'component/theme'

const __getMockStore = (initialState: unknown) => {
  return configureStore({
    reducer: {
      [applicationSlice.name]: applicationSlice.reducer,
    },
    preloadedState: initialState,
  })
}

const getAppModalStoreMocked = ({
  showModal = false,
  queue = [{ modalType: null }],
}: any) =>
  __getMockStore({
    application: {
      appModal: {
        showModal,
        queue,
      },
    },
  })

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn().mockReturnValue(() => {}),
}))
jest.mock('../../lib/media', () => ({}))
jest.mock('../../lib/share', () => ({}))
jest.mock('../../lib/download', () => ({}))
jest.mock('../../lib/uploads', () => ({}))
jest.mock('../../lib/hooks/useFile', () => ({}))
jest.mock('../../component/MarkDown')
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn().mockReturnValue({
    top: 0,
    bottom: 0,
  }),
}))
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useFocusEffect: jest.fn().mockImplementation((f) => f()),
}))

let addEventListenerMocked = {} as jest.SpyInstance<any>

beforeEach(() => {
  addEventListenerMocked = jest.spyOn(BackHandler, 'addEventListener')
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('App modal works correctly', () => {
  it('should not render any component when modalType is null', () => {
    const store = getAppModalStoreMocked({})
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    expect(screen.root).toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should render the correct component when modalType is provided', async () => {
    const store = getAppModalStoreMocked({
      showModal: true,
      queue: [{ modalType: ModalTypes.NEW_VERSION }],
    })
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    expect(screen.root).not.toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should prevent closing modal until user accept consent', () => {
    const store = getAppModalStoreMocked({
      showModal: true,
      queue: [{ modalType: ModalTypes.IDENTITY }],
    })
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    const backAction = addEventListenerMocked.mock.calls[0][1]
    const result = backAction()
    expect(result).toBeTruthy()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should prevent closing modal until user setup name', () => {
    const store = getAppModalStoreMocked({
      showModal: true,
      queue: [{ modalType: ModalTypes.SETUP_NAME }],
    })
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    const backAction = addEventListenerMocked.mock.calls[0][1]
    const result = backAction()
    expect(result).toBeTruthy()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should close modal successfully on back action', () => {
    const store = getAppModalStoreMocked({
      showModal: true,
      queue: [{ modalType: null, config: {} }],
    })
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    const backAction = addEventListenerMocked.mock.calls[0][1]
    const result = backAction()
    expect(result).toBeFalsy()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should have background color set', () => {
    const store = getAppModalStoreMocked({
      showModal: true,
      queue: [{ modalType: ModalTypes.SETUP_NAME }],
    })
    render(
      <Provider store={store}>
        <AppModal />
      </Provider>,
    )
    expect(screen.root).toHaveStyle({
      backgroundColor: colors.keet_grey_800,
    })
  })
})
