import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import * as Cellular from 'expo-cellular'
import { useNetInfo } from '@react-native-community/netinfo'

import { getProfileSoftwareVersion } from '@holepunchto/keet-store/store/userProfile'

import { consoleError } from 'lib/errors'

import { useStrings } from 'i18n/strings'

export function useNetworkInfo() {
  const strings = useStrings()
  const netInfo = useNetInfo()
  const [carrier, setCarrier] = useState(strings.networkStatus.unknown)
  const profileSoftwareVersion = useSelector(getProfileSoftwareVersion)

  const networkDhtVersion = profileSoftwareVersion.dependencies?.dhtVersion

  useEffect(() => {
    if (netInfo.type === 'cellular') {
      Cellular.getCarrierNameAsync()
        .then((carrierName) => {
          setCarrier(carrierName ?? strings.networkStatus.unknown)
        })
        .catch((err: any) => {
          consoleError('Network Error:', err)
        })
    } else if (netInfo.type === 'wifi') {
      setCarrier(strings.networkStatus.wifi)
    } else if (netInfo.type === 'none') {
      setCarrier(strings.networkStatus.offline)
    } else {
      setCarrier(strings.networkStatus.unknown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netInfo])

  return { carrier, networkDhtVersion }
}
