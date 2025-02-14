import { Dispatch, Reducer, useReducer, useRef } from 'react'
import _isEqual from 'react-fast-compare'

// Same functionality as useState, with added deep equality check to avoid re-render for the same state updates
function useStateDeepEqual<S>(initialState?: S): [S, Dispatch<any>] {
  const previousState = useRef<S | undefined>(initialState)

  const [state, dispatch] = useReducer<Reducer<S, any>>((_state, action) => {
    const resolvedAction = typeof action === 'function' ? action?.() : action
    if (!_isEqual(previousState.current, resolvedAction)) {
      previousState.current = resolvedAction
      return resolvedAction
    }
    return _state
  }, initialState!)

  return [state, dispatch]
}

export default useStateDeepEqual
