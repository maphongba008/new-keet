import { useCallback, useEffect, useState } from 'react'
import _sortBy from 'lodash/sortBy'

import { useMember } from 'lib/hooks/useMember'
import { MemberType } from 'lib/types'

type EventMemberProps = {
  roomId: string
  memberId: string
  onMember: (member: MemberType) => void
}

const MemberLoader = ({ roomId, memberId, onMember }: EventMemberProps) => {
  const { member } = useMember(roomId, memberId)

  useEffect(() => {
    if (member?.id) onMember(member)
    // only run when member.displayName changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMember, member.displayName])
  return null
}

export const useMembers = (roomId: string, memberIds: string[]) => {
  const [members, setMembers] = useState<MemberType[]>([])
  const onMember = useCallback(
    (member: MemberType) => {
      setMembers((previousMembers) => {
        const index = previousMembers.findIndex((m) => m.id === member.id)
        const found = index !== -1
        if (found) previousMembers[index] = member
        return found ? [...previousMembers] : [...previousMembers, member]
      })
    },
    [setMembers],
  )

  const loadMember = useCallback(
    (memberId: string) => (
      <MemberLoader key={memberId} {...{ memberId, onMember, roomId }} />
    ),
    [onMember, roomId],
  )
  return {
    load: () => {
      return memberIds.map(loadMember)
    },
    members: _sortBy(members, (member) => memberIds.indexOf(member.id)),
  }
}
