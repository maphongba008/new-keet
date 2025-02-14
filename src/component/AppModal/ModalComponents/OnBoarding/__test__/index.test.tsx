import { fireEvent, screen } from '@testing-library/react-native'

import * as actions from 'reducers/application'

import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import OnBoardingScreen from '../index'

jest.mock('../../../../../lib/media', () => ({}))
jest.mock('../../../../../lib/share', () => ({}))
jest.mock('../../../../../lib/KeetVideoUtilsModule', () => ({}))
jest.mock('../../../../../lib/download', () => ({}))
jest.mock('../../../../../lib/uploads', () => ({}))
jest.mock('../../../../../lib/hooks/useFile', () => ({}))
jest.mock('../../../../../sagas/appEventsSaga', () => ({
  appEvents: jest.fn(),
}))
jest.mock('react-native-pager-view', () => {
  const React = require('react')
  const View = require('react-native').View

  class ViewPager extends React.Component {
    constructor(props: any) {
      super()
      this.state = {
        page: props.initialPage || 0,
      }
    }

    setPage(selectedPage: number) {
      this.setState({ page: selectedPage })
      this.props.onPageSelected({
        nativeEvent: {
          position: selectedPage,
        },
      })
    }
    setPageWithoutAnimation() {}
    setScrollEnabled() {}

    render() {
      const {
        children,
        initialPage,
        onPageScroll,
        onPageScrollStateChanged,
        style,
        scrollEnabled,
        accessibilityLabel,
      } = this.props

      return (
        <View
          testID={this.props.testID}
          initialPage={initialPage}
          onPageScroll={onPageScroll}
          onPageScrollStateChanged={onPageScrollStateChanged}
          style={style}
          scrollEnabled={scrollEnabled}
          accessibilityLabel={accessibilityLabel}
        >
          {children[this.state.page]}
        </View>
      )
    }
  }

  return ViewPager
})
jest.mock('../../../../../sagas/workflowSaga', () => ({
  handlePriorityModals: jest.fn(),
}))
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn().mockReturnValue({
    navigate: jest.fn(),
  }),
}))

jest.spyOn(actions, 'closeAppModal')
jest.mock('../../../../../lib/navigation', () => ({
  ...jest.requireActual('../../../../../lib/navigation'),
  back: jest.fn(),
}))
describe('OnBoardingScreen', () => {
  test('render correctly', async () => {
    const element = <OnBoardingScreen />
    const result = renderWithProviders(element)
    expect(result.toJSON()).toMatchSnapshot()
    // check step 0
    expect(screen.getByText('Keet is fully private & encrypted')).toBeTruthy()
    expect(
      screen.getByText(
        'Your activity isn’t tracked, and no one’s collecting any data on you. It is fully peer-to-peer',
      ),
    ).toBeTruthy()
    // click next
    fireEvent.press(screen.getByTestId(APPIUM_IDs.onboarding_btn_next))
    // check step 1
    expect(screen.getByText('You are in control!')).toBeTruthy()
    // click next
    fireEvent.press(screen.getByTestId(APPIUM_IDs.onboarding_btn_next))
    // check step 2
    expect(screen.getByText('Stay updated.\nWe move fast!')).toBeTruthy()
    // click finish
    fireEvent.press(screen.getByTestId(APPIUM_IDs.onboarding_btn_finish))
    // check modal closed
    expect(actions.closeAppModal).toHaveBeenCalled()
  })
})
