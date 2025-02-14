import React from 'react'
import { render, screen } from '@testing-library/react-native'

import { ButtonBase } from 'component/Button'

// refer to CloseButton tests for related button test cases
describe('ButtonBase component tests', () => {
  it('renders correctly with default props', () => {
    render(<ButtonBase />)
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('has correct testID prop when passed', () => {
    render(<ButtonBase testID="button_base" />)
    const button = screen.getByRole('button')
    expect(button).toHaveProp('testID', 'button_base')
  })
  it('renders styles with correct opacity if disabled', () => {
    render(<ButtonBase disabled testID="button_base" />)
    expect(screen.getByTestId('button_base')).toHaveStyle({
      opacity: 0.5,
    })
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
