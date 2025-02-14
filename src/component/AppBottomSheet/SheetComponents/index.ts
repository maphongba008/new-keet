import { lazy } from 'react'

import { withSuspense } from 'lib/hoc/withSuspense'

import BottomSheetEnum from './BottomSheetEnum'
import MessageOptionsSheet from './MessageOptionSheet'
import RoomActionSheet from './RoomActionSheet'

const CallAutoEndPopup = withSuspense(lazy(() => import('./CallAutoEndPopup')))
const CallStarted = withSuspense(lazy(() => import('./CallStarted')))
const ChatEventDeleteConfirmSheet = withSuspense(
  lazy(() => import('./ChatEventDeleteConfirmSheet')),
)
const ChatEventOptionsSheet = withSuspense(
  lazy(() => import('./ChatEventOptionsSheet')),
)
const ChatLinkConfirmation = withSuspense(
  lazy(() => import('./ChatLinkConfirmation')),
)
const CleanDevice = withSuspense(lazy(() => import('./CleanDevice')))
const ClearAllFiles = withSuspense(lazy(() => import('./ClearAllFiles')))
const CommunityContacts = withSuspense(
  lazy(() => import('./CommunityContacts')),
)
const ConfirmBlockDialog = withSuspense(
  lazy(() => import('./ConfirmBlockDialog')),
)
const ConfirmDialog = withSuspense(lazy(() => import('./ConfirmDialog')))
const ConfirmInappropriateMessageDialog = withSuspense(
  lazy(() => import('./ConfirmInappropriateMessageDialog')),
)
const DeviceDetailsSheet = withSuspense(
  lazy(() => import('./DeviceDetailsSheet')),
)
const Dialog = withSuspense(lazy(() => import('./Dialog')))
const DMRequest = withSuspense(lazy(() => import('./DMRequest')))
const EmojiSourceSheet = withSuspense(lazy(() => import('./EmojiSourceSheet')))
const FeedbackForm = withSuspense(lazy(() => import('./FeedbackForm')))
const IdentityBackupConfirmSheet = withSuspense(
  lazy(() => import('./IdentityBackupConfirmSheet')),
)
const InviteTypeOptionsSheet = withSuspense(
  lazy(() => import('./InviteTypeOptionsSheet')),
)
const ListOptionsSheet = withSuspense(lazy(() => import('./ListOptionsSheet')))
const NetworkBottomSheet = withSuspense(
  lazy(() => import('./NetworkBottomSheet')),
)
const OptionsSheet = withSuspense(lazy(() => import('./OptionsSheet')))
const ParticipantsSheet = withSuspense(
  lazy(() => import('./ParticipantsSheet')),
)
const PermissionRequired = withSuspense(
  lazy(() => import('./PermissionRequired')),
)
const RecoverWalletSheet = withSuspense(
  lazy(() => import('./RecoverWalletSheet')),
)
const RoleChangeConfirm = withSuspense(
  lazy(() => import('./RoleChangeConfirm')),
)
const RoomAdminReset = withSuspense(lazy(() => import('./RoomAdminReset')))
const RoomAvatarBottomSheet = withSuspense(lazy(() => import('./RoomAvatar')))
const RoomInviteType = withSuspense(lazy(() => import('./RoomInvitationInfo')))
const RoomOptionsStats = withSuspense(lazy(() => import('./RoomOptionsStats')))
const TurnOffPasscode = withSuspense(lazy(() => import('./TurnOffPasscode')))
const WalletDelete = withSuspense(lazy(() => import('./WalletDelete')))
const WalletSettings = withSuspense(lazy(() => import('./WalletSettings')))
const ChannelRoomTips = withSuspense(
  lazy(() => import('screen/CreateChannel/ChannelRoomTips')),
)

export default {
  [BottomSheetEnum.MessageOptionsSheet]: MessageOptionsSheet,
  [BottomSheetEnum.ConfirmDialog]: ConfirmDialog,
  [BottomSheetEnum.ConfirmBlockDialog]: ConfirmBlockDialog,
  [BottomSheetEnum.ConfirmInappropriateMessageDialog]:
    ConfirmInappropriateMessageDialog,
  [BottomSheetEnum.RecoverWalletSheet]: RecoverWalletSheet,
  [BottomSheetEnum.ParticipantsSheet]: ParticipantsSheet,
  [BottomSheetEnum.OptionsSheet]: OptionsSheet,
  [BottomSheetEnum.CallStarted]: CallStarted,
  [BottomSheetEnum.RoomActionSheet]: RoomActionSheet,
  [BottomSheetEnum.NetworkBottomSheet]: NetworkBottomSheet,
  [BottomSheetEnum.ChatEventOptionsSheet]: ChatEventOptionsSheet,
  [BottomSheetEnum.PermissionRequired]: PermissionRequired,
  [BottomSheetEnum.RoomInviteType]: RoomInviteType,
  [BottomSheetEnum.ClearAllFiles]: ClearAllFiles,
  [BottomSheetEnum.Dialog]: Dialog,
  [BottomSheetEnum.FeedbackFormSheet]: FeedbackForm,
  [BottomSheetEnum.EmojiSourceSheet]: EmojiSourceSheet,
  [BottomSheetEnum.InviteTypeOptionsSheet]: InviteTypeOptionsSheet,
  [BottomSheetEnum.RoomAvatarBottomSheet]: RoomAvatarBottomSheet,
  [BottomSheetEnum.ChannelRoomTips]: ChannelRoomTips,
  [BottomSheetEnum.IdentityBackupConfirmSheet]: IdentityBackupConfirmSheet,
  [BottomSheetEnum.CleanDeviceBottomSheet]: CleanDevice,
  [BottomSheetEnum.TurnOffPasscodeSheet]: TurnOffPasscode,
  [BottomSheetEnum.ChatLinkConfirmationSheet]: ChatLinkConfirmation,
  [BottomSheetEnum.RoomOptionsStats]: RoomOptionsStats,
  [BottomSheetEnum.CommunityContacts]: CommunityContacts,
  [BottomSheetEnum.RoomAdminReset]: RoomAdminReset,
  [BottomSheetEnum.DeviceDetailsBottomSheet]: DeviceDetailsSheet,
  [BottomSheetEnum.DMRequest]: DMRequest,
  [BottomSheetEnum.ChatEventDeleteConfirmSheet]: ChatEventDeleteConfirmSheet,
  [BottomSheetEnum.WalletSettings]: WalletSettings,
  [BottomSheetEnum.WalletDelete]: WalletDelete,
  [BottomSheetEnum.RoleChangeConfirm]: RoleChangeConfirm,
  [BottomSheetEnum.ListOptionsSheet]: ListOptionsSheet,
  [BottomSheetEnum.CallAutoEndPopup]: CallAutoEndPopup,
}
