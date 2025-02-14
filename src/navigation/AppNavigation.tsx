import { lazy } from 'react'
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack'

import AppModal from 'component/AppModal'
import RoomScreen from 'screen/RoomScreen/RoomScreenContainer'
import { withSuspense } from 'lib/hoc/withSuspense'
import { Keys, localStorage } from 'lib/localStorage'
import {
  APP_ROOT,
  DISCOVER_COMMUNITY,
  SCREEN_ACCOUNT_EDIT_DETAILS,
  SCREEN_ADMINS_AND_MODS,
  SCREEN_APP_AUTO_LOCK,
  SCREEN_CREATE_CHANNEL,
  SCREEN_CREATE_CHANNEL_DISCLAIMER,
  SCREEN_CUSTOM_SERVER_SETUP,
  SCREEN_DEBUGGING,
  SCREEN_DM_REQUESTS,
  SCREEN_EDIT_ROOM_DETAILS,
  SCREEN_ERROR_LOG,
  SCREEN_ERROR_LOG_DETAILS,
  SCREEN_ERROR_LOG_REPORT,
  SCREEN_IDENTITY_BACKUP_AGREEMENT,
  SCREEN_IDENTITY_BACKUP_COMPLETE,
  SCREEN_IDENTITY_BACKUP_DEVICE,
  SCREEN_IDENTITY_BACKUP_DISPLAY,
  SCREEN_IDENTITY_BACKUP_QUICK_SETUP,
  SCREEN_IDENTITY_BACKUP_SETUP,
  SCREEN_IDENTITY_BACKUP_VERIFICATION,
  SCREEN_IDENTITY_DEVICE_ADD,
  SCREEN_IDENTITY_SYNC,
  SCREEN_INVITE_SOMEONE,
  SCREEN_LANGUAGE,
  SCREEN_LONG_TEXT_PREVIEW,
  SCREEN_MANAGE_MEMBER,
  SCREEN_MEDIA_PREVIEW,
  SCREEN_MEMBER_ROLE,
  SCREEN_META,
  SCREEN_MODAL,
  SCREEN_MY_DEVICES,
  SCREEN_NOTIFICATION_SETTINGS,
  SCREEN_NOTIFICATION_SOUND,
  SCREEN_PAIRING_ROOMS,
  SCREEN_PASSCODE_CHANGE,
  SCREEN_PASSCODE_CHANGE_CONFIRM_NEW,
  SCREEN_PASSCODE_CHANGE_SET_NEW,
  SCREEN_PASSCODE_CHECK,
  SCREEN_PASSCODE_CONFIRMATION,
  SCREEN_PASSCODE_SETUP,
  SCREEN_PINNED_MESSAGES,
  SCREEN_QA_HELPERS,
  SCREEN_RECOVER_ACCOUNT,
  SCREEN_RECOVER_ACCOUNT_AGREEMENT,
  SCREEN_RECOVERY_PHRASE_SETTINGS,
  SCREEN_ROOM,
  SCREEN_ROOM_CALL,
  SCREEN_ROOM_FILES,
  SCREEN_ROOM_INVITE,
  SCREEN_ROOM_MEMBERS,
  SCREEN_ROOM_OPTIONS,
  SCREEN_SECURITY,
  SCREEN_SETTINGS,
  SCREEN_SHARE_PROFILE,
  SCREEN_SUCCESSFULLY_CLEANED_DEVICE,
  SCREEN_SVG_ICONS,
  SCREEN_TOS,
  SCREEN_USER_PROFILE,
  SCREEN_VIEW_RECOVERY_PHRASE,
  SCREEN_WALLET_CREATE,
  SCREEN_WALLET_ENTER_AMOUNT,
  SCREEN_WALLET_IMPORT,
  SCREEN_WALLET_IMPORT_COMPLETE,
  SCREEN_WALLET_RECEIVE,
  SCREEN_WALLET_RECOVERY_COMPLETE,
  SCREEN_WALLET_RECOVERY_PHRASE,
  SCREEN_WALLET_RECOVERY_PHRASE_VERIFICATION,
  SCREEN_WALLET_SCANNER_VIEW,
  SCREEN_WALLET_SEND,
  SCREEN_WALLET_SETTINGS,
} from 'lib/navigation'
import { isAndroid } from 'lib/platform'

import { isRTL } from 'i18n/strings'

import BottomTabNavigator from './BottomTabNavigation'
import DebuggingHeader from './DebuggingHeader'

const Stack = createNativeStackNavigator()

// Lazy import tradeoff is added init time (~1.5sec) when nav to that screen
const CallScreen = withSuspense(lazy(() => import('screen/CallScreen')))
const RoomOptionsScreen = withSuspense(
  lazy(() => import('screen/RoomScreen/RoomOptions/RoomOptions')),
)
const EditRoomDetailsScreen = withSuspense(
  lazy(() => import('screen/RoomScreen/RoomOptions/EditRoomDetails')),
)
const RoomMembers = withSuspense(
  lazy(() => import('screen/RoomScreen/RoomMembers')),
)
const PinnedMessages = withSuspense(
  lazy(() => import('screen/RoomScreen/Pinned/PinnedMessageScreen')),
)
const AdminsAndMods = withSuspense(lazy(() => import('screen/AdminsAndMods')))
const ManageMember = withSuspense(
  lazy(() => import('screen/AdminsAndMods/ManageMember')),
)
const MemberRole = withSuspense(
  lazy(() => import('screen/AdminsAndMods/MemberRole')),
)
const MetaScreen = withSuspense(lazy(() => import('screen/MetaScreen')))
const InviteScreen = withSuspense(
  lazy(() => import('screen/InviteScreen/InviteScreen')),
)
const SettingsScreen = withSuspense(
  lazy(() => import('screen/AccountScreen/SettingsScreen')),
)
const CreateChannel = withSuspense(
  lazy(() => import('screen/CreateChannel/CreateChannel')),
)
const CreateChannelDisclaimer = withSuspense(
  lazy(() => import('screen/CreateChannel/CreateChannelDisclaimer')),
)
const DebuggingScreen = withSuspense(
  lazy(() => import('screen/DebuggingScreen')),
)
const DMRequestsScreen = withSuspense(
  lazy(() => import('screen/DMRequestsScreen/DMRequestsScreen')),
)
const IdentityBackupAgreement = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.agreement')),
)
const IdentityBackupSetupCompletion = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.complete')),
)
const IdentityBackupDevice = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.device')),
)
const IdentityBackupDisplay = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.display')),
)
const IdentityBackupSetup = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.setup')),
)
const IdentityBackupVerification = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.verification')),
)
const IdentityBackupQuickSetup = withSuspense(
  lazy(() => import('screen/IdentityBackupScreen/IdentityBackup.quickSetup')),
)
const IdentitySyncScreen = withSuspense(
  lazy(() => import('screen/IdentitySyncScreen/IdentitySync')),
)
const LanguageScreen = withSuspense(lazy(() => import('screen/LanguageScreen')))
const MediaPreviewScreen = withSuspense(
  lazy(() => import('screen/MediaPreviewScreen/MediaPreview')),
)
const LongTextPreviewScreen = withSuspense(
  lazy(() => import('screen/LongTextPreviewScreen')),
)
const DeviceAddScreen = withSuspense(
  lazy(() => import('screen/MyDevicesScreen/DeviceAdd')),
)
const MyDevicesScreen = withSuspense(
  lazy(() => import('screen/MyDevicesScreen/MyDevices')),
)
const NotificationSettingsScreen = withSuspense(
  lazy(() => import('screen/NotificationSettingsScreen')),
)
const NotificationSoundScreen = withSuspense(
  lazy(() => import('screen/NotificationSoundScreen')),
)
const PairingRoomsList = withSuspense(
  lazy(() => import('screen/PairingRoomsScreen/PairingRoomList')),
)
const PasscodeConfirmationScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeConfirmationScreen')),
)
const PasscodeSetupScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeSetupScreen')),
)
const PasscodeChangeScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeChangeScreen')),
)
const PasscodeChangeConfirmNewScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeChangeConfirmNewScreen')),
)
const PasscodeChangeSetNewScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeChangeSetNewScreen')),
)
const PasscodeCheckScreen = withSuspense(
  lazy(() => import('screen/Passcode/PasscodeCheckScreen')),
)
const RecoverAccount = withSuspense(
  lazy(() => import('screen/RecoverAccountScreen/RecoverAccount')),
)
const RecoverAccountAgreement = withSuspense(
  lazy(() => import('screen/RecoverAccountScreen/RecoverAccount.agreement')),
)
const RoomFilesScreen = withSuspense(
  lazy(() => import('screen/RoomFilesScreen/RoomFilesScreen')),
)
const RoomInvite = withSuspense(
  lazy(() => import('screen/RoomScreen/Invite/RoomInvite')),
)
const SecurityScreen = withSuspense(lazy(() => import('screen/SecurityScreen')))
const RecoveryPhraseSettingsScreen = withSuspense(
  lazy(() => import('screen/SecurityScreen/RecoveryPhraseSettings')),
)
const ViewRecoveryPhraseScreen = withSuspense(
  lazy(
    () =>
      import('screen/SecurityScreen/RecoveryPhraseSettings/ViewRecoveryPhrase'),
  ),
)
const AppAutoLockScreen = withSuspense(
  lazy(() => import('screen/SecurityScreen/AppAutoLockScreen')),
)
const DiscoverCommunity = withSuspense(
  lazy(() => import('screen/DiscoverCommunity/DiscoverCommunity')),
)
const UserProfileScreen = withSuspense(
  lazy(() => import('screen/UserProfileScreen')),
)
const ErrorLogScreen = withSuspense(lazy(() => import('screen/ErrorLog')))
const ErrorLogDetailsScreen = withSuspense(
  lazy(() => import('screen/ErrorLog/ErrorDetails')),
)
const ErrorLogReportScreen = withSuspense(
  lazy(() => import('screen/ErrorLog/ReportError')),
)
const QAHelpersScreen = withSuspense(
  lazy(() => import('screen/QAHelpersScreen')),
)
const SvgIconsScreen = withSuspense(lazy(() => import('screen/SvgIcons')))
// wallet
const WalletSettingsScreen = withSuspense(
  lazy(() => import('screen/WalletSettingsScreen')),
)
const WalletTransfer = withSuspense(
  lazy(() => import('screen/WalletSendScreen/WalletTransfer')),
)
const WalletEnterAmount = withSuspense(
  lazy(() => import('screen/WalletSendScreen/EnterAmount')),
)
const WalletScannerView = withSuspense(
  lazy(() => import('screen/WalletSendScreen/WalletScannerView')),
)
const WalletReceive = withSuspense(
  lazy(() => import('screen/WalletReceiveScreen/WalletReceiveScreen')),
)
const WalletCustomServerSetup = withSuspense(
  lazy(() => import('screen/WalletCustomServer/CustomServerSetup')),
)
const TosScreen = withSuspense(lazy(() => import('screen/TosScreen')))
const EditAccountScreen = withSuspense(
  lazy(() => import('screen/AccountScreen/EditAccountDetails')),
)
const ShareProfile = withSuspense(
  lazy(() => import('screen/ShareProfile/ShareProfile')),
)
const WalletRecovery = withSuspense(
  lazy(() => import('screen/WalletRecoveryScreen/WalletRecovery')),
)
const WalletImportComplete = withSuspense(
  lazy(() => import('screen/WalletRecoveryScreen/WalletRecovery.complete')),
)
const WalletRecoveryComplete = withSuspense(
  lazy(() => import('screen/WalletScreen/Wallet.Complete')),
)
const CreateWallet = withSuspense(
  lazy(() => import('screen/WalletScreen/Wallet.Create')),
)
const WalletPhraseVerification = withSuspense(
  lazy(() => import('screen/WalletScreen/Wallet.PhraseVerification')),
)
const SetupRecoveryPhrase = withSuspense(
  lazy(() => import('screen/WalletScreen/Wallet.RecoveryPhrase')),
)
const SuccessfullyCleanedDeviceScreen = withSuspense(
  lazy(
    () =>
      import(
        'component/AppBottomSheet/SheetComponents/CleanDevice/SuccessfullyCleanedDeviceScreen'
      ),
  ),
)

const transparentModalOptions: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'none',
}
function AppNavigation() {
  const showDebuggingHeader = !!localStorage.getItem(Keys.HYPERTRACE_KEY)

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: showDebuggingHeader,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        freezeOnBlur: true,
        animation: isAndroid
          ? isRTL
            ? 'slide_from_right'
            : 'ios_from_right'
          : 'default',
        headerBackButtonMenuEnabled: false,
        animationDuration: 300,
        // eslint-disable-next-line react/no-unstable-nested-components
        header: () => <DebuggingHeader />,
        navigationBarTranslucent: true,
      }}
      initialRouteName={APP_ROOT}
    >
      <Stack.Screen name={APP_ROOT} component={BottomTabNavigator} />
      <Stack.Screen
        name={SCREEN_ROOM}
        component={RoomScreen}
        options={{
          freezeOnBlur: false,
        }}
      />
      <Stack.Screen name={SCREEN_ROOM_CALL} component={CallScreen} />
      <Stack.Screen
        name={SCREEN_ROOM_OPTIONS}
        component={RoomOptionsScreen}
        options={{
          freezeOnBlur: false,
        }}
      />
      <Stack.Screen
        name={SCREEN_EDIT_ROOM_DETAILS}
        component={EditRoomDetailsScreen}
      />
      <Stack.Screen name={SCREEN_ROOM_MEMBERS} component={RoomMembers} />
      <Stack.Screen name={SCREEN_PINNED_MESSAGES} component={PinnedMessages} />
      <Stack.Screen name={SCREEN_ADMINS_AND_MODS} component={AdminsAndMods} />
      <Stack.Screen name={SCREEN_MANAGE_MEMBER} component={ManageMember} />
      <Stack.Screen name={SCREEN_MEMBER_ROLE} component={MemberRole} />
      <Stack.Screen name={SCREEN_META} component={MetaScreen} />
      <Stack.Screen name={SCREEN_INVITE_SOMEONE} component={InviteScreen} />
      <Stack.Screen name={SCREEN_SECURITY} component={SecurityScreen} />
      <Stack.Screen
        name={SCREEN_NOTIFICATION_SOUND}
        component={NotificationSoundScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_SETUP}
        component={PasscodeSetupScreen}
      />
      <Stack.Screen
        name={SCREEN_SUCCESSFULLY_CLEANED_DEVICE}
        component={SuccessfullyCleanedDeviceScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_CONFIRMATION}
        component={PasscodeConfirmationScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_CHANGE}
        component={PasscodeChangeScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_CHANGE_SET_NEW}
        component={PasscodeChangeSetNewScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_CHECK}
        component={PasscodeCheckScreen}
      />
      <Stack.Screen
        name={SCREEN_PASSCODE_CHANGE_CONFIRM_NEW}
        component={PasscodeChangeConfirmNewScreen}
      />
      <Stack.Screen name={SCREEN_APP_AUTO_LOCK} component={AppAutoLockScreen} />
      <Stack.Screen
        name={SCREEN_RECOVERY_PHRASE_SETTINGS}
        component={RecoveryPhraseSettingsScreen}
      />
      <Stack.Screen
        name={SCREEN_VIEW_RECOVERY_PHRASE}
        component={ViewRecoveryPhraseScreen}
      />
      <Stack.Screen name={SCREEN_ROOM_INVITE} component={RoomInvite} />
      <Stack.Screen
        name={SCREEN_MEDIA_PREVIEW}
        component={MediaPreviewScreen}
        options={transparentModalOptions}
      />
      <Stack.Screen
        name={SCREEN_LONG_TEXT_PREVIEW}
        component={LongTextPreviewScreen}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_AGREEMENT}
        component={IdentityBackupAgreement}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_SETUP}
        component={IdentityBackupSetup}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_DEVICE}
        component={IdentityBackupDevice}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_DISPLAY}
        component={IdentityBackupDisplay}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_VERIFICATION}
        component={IdentityBackupVerification}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_QUICK_SETUP}
        component={IdentityBackupQuickSetup}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_BACKUP_COMPLETE}
        component={IdentityBackupSetupCompletion}
      />
      <Stack.Screen
        name={SCREEN_IDENTITY_SYNC}
        component={IdentitySyncScreen}
      />
      <Stack.Screen name={SCREEN_MY_DEVICES} component={MyDevicesScreen} />
      <Stack.Screen
        name={SCREEN_IDENTITY_DEVICE_ADD}
        component={DeviceAddScreen}
      />
      <Stack.Screen name={SCREEN_RECOVER_ACCOUNT} component={RecoverAccount} />
      <Stack.Screen
        name={SCREEN_RECOVER_ACCOUNT_AGREEMENT}
        component={RecoverAccountAgreement}
      />
      <Stack.Screen name={SCREEN_DEBUGGING} component={DebuggingScreen} />
      <Stack.Screen name={SCREEN_LANGUAGE} component={LanguageScreen} />
      <Stack.Screen
        name={SCREEN_NOTIFICATION_SETTINGS}
        component={NotificationSettingsScreen}
      />
      <Stack.Screen
        options={{
          gestureEnabled: false,
          animation: 'slide_from_bottom',
        }}
        name={SCREEN_MODAL}
        component={AppModal}
      />
      <Stack.Screen name={SCREEN_ROOM_FILES} component={RoomFilesScreen} />
      <Stack.Screen name={SCREEN_CREATE_CHANNEL} component={CreateChannel} />
      <Stack.Screen
        name={SCREEN_CREATE_CHANNEL_DISCLAIMER}
        component={CreateChannelDisclaimer}
      />
      <Stack.Screen name={SCREEN_SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={SCREEN_DM_REQUESTS} component={DMRequestsScreen} />
      <Stack.Screen name={SCREEN_PAIRING_ROOMS} component={PairingRoomsList} />
      <Stack.Screen name={DISCOVER_COMMUNITY} component={DiscoverCommunity} />
      <Stack.Screen name={SCREEN_USER_PROFILE} component={UserProfileScreen} />
      <Stack.Screen name={SCREEN_ERROR_LOG} component={ErrorLogScreen} />
      <Stack.Screen
        name={SCREEN_ERROR_LOG_DETAILS}
        component={ErrorLogDetailsScreen}
      />
      <Stack.Screen
        name={SCREEN_ERROR_LOG_REPORT}
        component={ErrorLogReportScreen}
      />
      <Stack.Screen name={SCREEN_QA_HELPERS} component={QAHelpersScreen} />
      <Stack.Screen name={SCREEN_SVG_ICONS} component={SvgIconsScreen} />
      <Stack.Screen name={SCREEN_WALLET_CREATE} component={CreateWallet} />
      <Stack.Screen
        name={SCREEN_WALLET_RECOVERY_PHRASE}
        component={SetupRecoveryPhrase}
      />
      <Stack.Screen
        name={SCREEN_WALLET_RECOVERY_PHRASE_VERIFICATION}
        component={WalletPhraseVerification}
      />
      <Stack.Screen
        name={SCREEN_WALLET_RECOVERY_COMPLETE}
        component={WalletRecoveryComplete}
      />
      <Stack.Screen
        name={SCREEN_WALLET_SETTINGS}
        component={WalletSettingsScreen}
      />
      <Stack.Screen name={SCREEN_WALLET_IMPORT} component={WalletRecovery} />
      <Stack.Screen
        name={SCREEN_WALLET_IMPORT_COMPLETE}
        component={WalletImportComplete}
      />
      <Stack.Screen name={SCREEN_WALLET_SEND} component={WalletTransfer} />
      <Stack.Screen
        name={SCREEN_WALLET_ENTER_AMOUNT}
        component={WalletEnterAmount}
      />
      <Stack.Screen
        name={SCREEN_WALLET_SCANNER_VIEW}
        component={WalletScannerView}
      />
      <Stack.Screen name={SCREEN_WALLET_RECEIVE} component={WalletReceive} />
      <Stack.Screen
        name={SCREEN_CUSTOM_SERVER_SETUP}
        component={WalletCustomServerSetup}
      />
      <Stack.Screen name={SCREEN_TOS} component={TosScreen} />
      <Stack.Screen
        name={SCREEN_ACCOUNT_EDIT_DETAILS}
        component={EditAccountScreen}
      />
      <Stack.Screen name={SCREEN_SHARE_PROFILE} component={ShareProfile} />
    </Stack.Navigator>
  )
}

export default AppNavigation
