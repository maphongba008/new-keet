import { SeedWord } from 'component/RecoveryPhrase/RecoveryPhrase.Verification'
import { getPaymentBackend } from 'lib/wallet'

const seed = getPaymentBackend().newWallet()

export const generatedSeedPhrase = () => {
  return seed
    .split(' ')
    .reduce((acc: SeedWord[], seedPhrase: string, index: number) => {
      acc.push({ index, value: seedPhrase })
      return acc
    }, [])
}

export const getSeedPhraseVerifyItems = (
  seedPhrase: SeedWord[],
  index: number = 15,
) => {
  if (seedPhrase.length !== 24) {
    throw new Error('Seed phrase must contain exactly 24 words')
  }
  return seedPhrase.splice(0, index)
}
