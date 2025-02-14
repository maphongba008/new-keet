import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { Selector } from '@reduxjs/toolkit'

export const useDeepEqualSelector = <State = unknown, ReturnType = unknown>(
  selector: Selector<State, ReturnType>,
) => {
  return useSelector<State, ReturnType>(selector, isEqual)
}
