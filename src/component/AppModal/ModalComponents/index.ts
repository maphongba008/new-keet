import IdentityModal from './Identity'
import IdentityIntro from './IdentityIntro'
import NewVersionModal from './NewVersion'
import OnBoarding from './OnBoarding'
import SetupName from './SetupName'
import {
  IDENTITY,
  IDENTITY_INTRO,
  NEW_VERSION,
  ON_BOARDING,
  SETUP_NAME,
} from '../types'

export default {
  [ON_BOARDING]: OnBoarding,
  [SETUP_NAME]: SetupName,
  [NEW_VERSION]: NewVersionModal,
  [IDENTITY]: IdentityModal,
  [IDENTITY_INTRO]: IdentityIntro,
}
