import { fireEvent, render, screen } from '@testing-library/react-native'

import LabeledRadio from 'component/RadioButton'
import { APPIUM_IDs } from 'lib/appium'

const mockOnPress = jest.fn()

const defaultProps = {
  value: true,
  onChange: mockOnPress,
}

describe('Radio button component tests', () => {
  it('should be checked when value is true', () => {
    render(<LabeledRadio value={true} onChange={mockOnPress} />)
    expect(
      screen.getByTestId(APPIUM_IDs.radio_btn_checked),
    ).not.toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should be unchecked when value is false', () => {
    render(<LabeledRadio value={false} onChange={mockOnPress} />)
    expect(screen.getByTestId(APPIUM_IDs.radio_btn_checked)).toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('toggles correctly when clicked on', () => {
    render(<LabeledRadio value={false} onChange={mockOnPress} />)
    const button = screen.getByRole('button')
    fireEvent.press(button)
    expect(mockOnPress).toHaveBeenCalled()
  })
  it('renders Radio Button label correctly', () => {
    const btnLabel = 'Test Radio Label'
    render(<LabeledRadio label={btnLabel} {...defaultProps} />)
    expect(screen.getByText(btnLabel)).toBeOnTheScreen()
  })
})
