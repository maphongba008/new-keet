import React from 'react'
import { render, screen } from '@testing-library/react-native'

import SvgIcon, { getDefaultIconDimensions } from 'component/SvgIcon'

describe('SvgIcon component tests', () => {
  it('renders correctly with custom dimensions', () => {
    const customWidth = 150
    const customHeight = 100
    render(
      <SvgIcon name="astronaut" width={customWidth} height={customHeight} />,
    )

    const svgIcon = screen.getByTestId('svg-icon-astronaut')

    expect(svgIcon.props.width).toBe(customWidth)
    expect(svgIcon.props.height).toBe(customHeight)

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with default dimensions', () => {
    render(<SvgIcon name="astronaut" />)

    const defaultDimensions = getDefaultIconDimensions('astronaut')
    const svgIcon = screen.getByTestId('svg-icon-astronaut')

    expect(svgIcon.props.width).toBe(defaultDimensions?.width)
    expect(svgIcon.props.height).toBe(defaultDimensions?.height)

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders correctly with a custom color', () => {
    const customColor = 'red'
    render(<SvgIcon name="checkCircle" color={customColor} />)

    const svgIcon = screen.getByTestId('svg-icon-checkCircle')
    expect(svgIcon.props.fill).toBe(customColor)

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('applies custom styles', () => {
    const customStyle = { margin: 10 }
    render(<SvgIcon name="checkCircle" style={customStyle} />)

    const svgIcon = screen.getByTestId('svg-icon-checkCircle')

    const flattenedStyles = Object.assign({}, ...svgIcon.props.style)

    expect(flattenedStyles).toMatchObject(customStyle)

    expect(screen.toJSON()).toMatchSnapshot()
  })
})
