import { useEffect } from 'react'

// @ts-ignore
import { getCoreBackend } from '@holepunchto/keet-store/backend'

import { SearchProfile, SearchProfileObj } from 'lib/types'

/**
 * Fetch and cache room participants when entering a room, limited to 20 profiles.
 *
 * ## Normal Scenario
 * 1. User types `@` to mention someone.
 * 2. The app searches for the `memberId` given the `displayName` and caches the `memberSuggestionsList` (type: `SearchProfileObj[]`).
 * 3. When sending the message, `@name` is matched with the `memberSuggestionsList` and converted into the corresponding `memberId` found in that list.
 *
 * ## Negative Scenario (this hook's scenario)
 * 1. User types multiple `@mentions`, then quits the app.
 * 2. Upon relaunch, the draft is auto-loaded, but `memberSuggestionsList` is missing.
 * 3. To resolve this, we auto-fetch 20 members on room launch to automatically match IDs to `@mentions`.
 */

export function usePreFetchSearchProfiles(
  roomId: string,
  setSearchProfileObj: React.Dispatch<React.SetStateAction<SearchProfileObj>>,
) {
  useEffect(() => {
    const preFetchSearchProfiles = async () => {
      const profiles = await getCoreBackend().getSearchMembers(roomId, '', {
        limit: 20,
      })
      if (profiles?.length > 0) {
        const profileObj = profiles.reduce(
          (obj: SearchProfileObj, item: SearchProfile) =>
            Object.assign(obj, { [item.memberId]: item }),
          {},
        )
        setSearchProfileObj((prev) => {
          return { ...prev, ...profileObj }
        })
      }
    }
    roomId && preFetchSearchProfiles()
  }, [roomId, setSearchProfileObj])
}
