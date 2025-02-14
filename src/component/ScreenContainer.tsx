import { ReactNode } from 'react'
import { ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import s from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'

interface GestureDetectorProps {
  children?: ReactNode

  containerStyle?: ViewProps['style']
}

const ScreenContainer = ({
  children,
  containerStyle,
}: GestureDetectorProps) => {
  return (
    <SafeAreaView style={[s.container, containerStyle]} edges={SAFE_EDGES}>
      {children}
    </SafeAreaView>
  )
}

export default ScreenContainer
