import { render, screen } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import { networkSlice } from '@holepunchto/keet-store/store/network'

import NetworkStatusMessage from 'component/NetworkStatusMessage'
import { getTheme } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import { NETWORK_WARNING } from 'lib/commonStyles'

import { getStrings } from 'i18n/strings'

jest.mock('../SvgIcon.tsx')

const __getMockStore = (initialState: unknown) => {
  return configureStore({
    reducer: {
      [networkSlice.name]: networkSlice.reducer,
    },
    preloadedState: initialState,
  })
}

const ONLINE_STATE = {
  host: '',
  port: 1,
  online: true,
  connections: '',
}

const OFFLINE_STATE = {
  host: '',
  port: 0,
  online: false,
  connections: '',
}

const TRICKY_STATE = {
  host: '',
  port: 0,
  online: true,
  connections: '',
}

const getNetworkStoreMocked = ({
  host = '',
  port = 0,
  online = false,
  connections = '',
}) =>
  __getMockStore({
    network: {
      host,
      port,
      online,
      connections,
    },
  })

describe('Network Status Message component tests', () => {
  const strings = getStrings()
  const theme = getTheme()
  it('Network Status Message with Online Connection and onPress', () => {
    const store = getNetworkStoreMocked(ONLINE_STATE)
    render(
      <Provider store={store}>
        <NetworkStatusMessage onPress={jest.fn()} />
      </Provider>,
    )
    const button = screen.getByTestId(APPIUM_IDs.profile_network_status)
    expect(button).toHaveTextContent(strings.networkStatus.ok)
    expect(button.props.style.backgroundColor).toMatch(theme.color.green_300)
    expect(button).not.toBeDisabled()
  })
  it('Network Status Message with Tricky Connection', () => {
    const store = getNetworkStoreMocked(TRICKY_STATE)
    render(
      <Provider store={store}>
        <NetworkStatusMessage />
      </Provider>,
    )
    const button = screen.getByTestId(APPIUM_IDs.profile_network_status)
    expect(button).toHaveTextContent(strings.networkStatus.bad)
    expect(button.props.style.backgroundColor).toMatch(NETWORK_WARNING)
    expect(button).toBeDisabled()
  })
  it('Network Status Message with Offline Connection and Right Icon', () => {
    const store = getNetworkStoreMocked(OFFLINE_STATE)
    render(
      <Provider store={store}>
        <NetworkStatusMessage showRightIcon />
      </Provider>,
    )
    const button = screen.getByTestId(APPIUM_IDs.profile_network_status)
    expect(button).toHaveTextContent(
      `${strings.networkStatus.offline}icon - chevronRight`,
    )
    expect(button.props.style.backgroundColor).toMatch(theme.color.danger)
    expect(button).toBeDisabled()
  })
})
