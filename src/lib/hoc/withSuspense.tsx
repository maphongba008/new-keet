import React, { Suspense } from 'react'
import { View } from 'react-native'

import { KeetLoading } from 'component/Loading'

import s from '../commonStyles'

const Loading = () => (
  <View style={[s.container, s.centeredLayout]}>
    <KeetLoading />
  </View>
)

/**
 * supplies WrappedComponent which is lazy import component to be wrapped inside <Suspense />
 * @param {Object} extraProps : additional props to the WrappedComponent
 * @returns React component to Suspense
 */
export const withSuspense =
  (WrappedComponent: any, extraProps: object = {}) =>
  (props: any) => (
    <Suspense fallback={<Loading />}>
      <WrappedComponent {...props} {...extraProps} />
    </Suspense>
  )
