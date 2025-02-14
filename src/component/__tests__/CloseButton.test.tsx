import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { CloseButton } from 'component/CloseButton'
import { colors } from 'component/theme'

jest.mock('../SvgIcon', () => {
  return 'SvgIcon'
})

const styles = StyleSheet.create({
  customStyle: {
    backgroundColor: colors.green_300,
  },
})

describe('CloseButton component tests', () => {
  it('renders correctly with default props', () => {
    render(<CloseButton />)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with a different color', () => {
    render(<CloseButton color={colors.blue_400} />)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with height changed to 16', () => {
    render(<CloseButton height={16} />)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with different width and height', () => {
    render(<CloseButton width={32} height={32} />)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with a different onPress handler', () => {
    const mockOnPress = jest.fn()
    render(<CloseButton onPress={mockOnPress} />)
    const button = screen.getByRole('button')
    fireEvent.press(button)
    expect(mockOnPress).toHaveBeenCalled()
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('has correct accessibility role and label', () => {
    render(<CloseButton accessibilityLabel="Close" />)
    const button = screen.getByRole('button')
    expect(button).toHaveProp('accessibilityLabel', 'Close')
  })

  it('applies custom styles correctly', () => {
    render(<CloseButton style={styles.customStyle} />)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ backgroundColor: colors.green_300 })
  })

  it('forwards additional props to IconButton', () => {
    render(<CloseButton testID="close-button" />)
    const button = screen.getByTestId('close-button')
    expect(button).toBeTruthy()
  })

  it('renders correctly with conditional rendering', () => {
    const ConditionalCloseButton = ({ show }: { show: boolean }) =>
      show ? <CloseButton /> : null
    const { rerender } = render(<ConditionalCloseButton show={false} />)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(<ConditionalCloseButton show={true} />)
    expect(screen.getByRole('button')).toBeTruthy()
  })
})
