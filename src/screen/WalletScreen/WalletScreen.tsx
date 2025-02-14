import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { createThemedStylesheet } from 'component/theme'
import WalletCard from 'component/WalletCard'
import s, { UI_SIZE_16, UI_SIZE_24 } from 'lib/commonStyles'
import { useWalletStore } from 'lib/wallet'

import GetStarted from './GetStarted'
import Transactions from './Transactions/Transactions'

export const WalletScreen = () => {
  const styles = getStyles()
  const { hasWalletSetup }: any = useWalletStore()

  return (
    <SafeAreaView style={styles.container}>
      {hasWalletSetup ? (
        <>
          <WalletCard />
          <Transactions />
        </>
      ) : (
        <GetStarted />
      )}
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
      gap: UI_SIZE_24,
      marginHorizontal: UI_SIZE_16,
      paddingTop: UI_SIZE_24,
    },
  })
  return styles
})

export default WalletScreen
