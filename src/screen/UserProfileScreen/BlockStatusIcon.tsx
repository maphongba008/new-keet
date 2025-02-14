import React from 'react'
import { type ColorValue } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { UI_SIZE_20 } from 'lib/commonStyles'

const BlockStatusIcon = (props: { blocked: boolean; color?: ColorValue }) => (
  <SvgIcon
    name={props.blocked ? 'ban' : 'xCircle'}
    width={UI_SIZE_20}
    height={UI_SIZE_20}
    color={props.color}
  />
)

export default BlockStatusIcon
