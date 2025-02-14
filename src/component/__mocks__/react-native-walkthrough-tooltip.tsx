import { View } from 'react-native'

const Tooltip = (props: any) => {
  const { children, content, ...restProps } = props
  return (
    <View {...restProps} testID="tooltip">
      {content}
      {children}
    </View>
  )
}

export default Tooltip
