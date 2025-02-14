import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import LabeledCheckbox from 'component/Checkbox'

const mockOnPress = jest.fn()

const defaultProps = {
  value: true,
  onChange: mockOnPress,
}

const styles = StyleSheet.create({
  customStyle: {
    height: 25,
    width: 25,
  },
})

describe('Checkbox component tests', () => {
  it('renders correctly when default props is passed', () => {
    render(<LabeledCheckbox {...defaultProps} />)
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should be checked when value is true', () => {
    render(<LabeledCheckbox {...defaultProps} />)
    expect(screen.getByTestId('checkbox_checked')).not.toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should be unchecked when value is false', () => {
    render(<LabeledCheckbox value={false} onChange={mockOnPress} />)
    expect(screen.getByTestId('checkbox_checked')).toBeEmptyElement()
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('toggles correctly when clicked on', () => {
    render(<LabeledCheckbox value={false} onChange={mockOnPress} />)
    const button = screen.getByRole('button')
    fireEvent.press(button)
    expect(mockOnPress).toHaveBeenCalled()
  })
  it('renders Checkbox Button label correctly', () => {
    const btnLabel = 'Test Label'
    render(<LabeledCheckbox {...defaultProps} label={btnLabel} />)
    expect(screen.getByText(btnLabel)).toBeOnTheScreen()
  })
  it('renders correct styles', () => {
    render(<LabeledCheckbox {...defaultProps} style={styles.customStyle} />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      height: 25,
      width: 25,
    })
  })
})
