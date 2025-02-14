import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import {
  getMemberListData,
  getMemberListIsError,
  getMemberListIsLoading,
  initializeMemberListSubscriptionCmd,
} from '@holepunchto/keet-store/store/member-list'

export const MEMBER_QUERY_LIMIT = 15

export const useMemberListSubscription = ({
  limit = MEMBER_QUERY_LIMIT,
  subscribeToPeers = true,
  subscribeToAdminsAndModerators = true,
}) => {
  const memberIds: string[] = useSelector(getMemberListData)
  const isLoading: boolean = useSelector(getMemberListIsLoading)
  const isError: boolean = useSelector(getMemberListIsError)

  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      dispatch(
        initializeMemberListSubscriptionCmd({
          limit,
          subscribeToPeers,
          subscribeToAdminsAndModerators,
        }),
      )
    }, [dispatch, limit, subscribeToAdminsAndModerators, subscribeToPeers]),
  )

  return {
    memberIds,
    isLoading,
    isError,
  }
}
