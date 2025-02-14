import { render, screen } from '@testing-library/react-native'

import { Avatar } from 'component/Avatar'
import { APPIUM_IDs } from 'lib/appium'

jest.mock('../SvgIcon.tsx')

describe('Avatar component tests', () => {
  it('should render default avatar icon when no props are provided', () => {
    render(<Avatar />)
    const emptyIcon = screen.getByText('icon - keetOutline')
    expect(emptyIcon).toBeOnTheScreen()
  })
  it('should match snapshot and apply RGB color', () => {
    render(<Avatar color="#ff0000" />)
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should match snapshot and apply named color', () => {
    const color = 'red'
    render(<Avatar color="red" />)
    expect(screen.toJSON()).toMatchSnapshot()
    const emptyIcon = screen.getByTestId(APPIUM_IDs.avatar_image)
    expect(JSON.stringify(emptyIcon.props.style)).toMatch(color)
  })
  it('should match snapshot and apply base64 icon', () => {
    const base64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAg='
    render(<Avatar base64={base64} />)
    expect(screen.toJSON()).toMatchSnapshot()
    const img = screen.getByTestId(APPIUM_IDs.avatar_image)
    expect(img.props.source.uri).toMatch(base64)
  })
  it('should apply small style when small prop is provided', () => {
    const base64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAg='
    render(<Avatar base64={base64} small />)
    expect(screen.toJSON()).toMatchSnapshot()
    const img = screen.getByTestId(APPIUM_IDs.avatar_image)
    expect(img).toHaveStyle({
      borderRadius: 15,
      height: 30,
      width: 30,
    })
  })
})
