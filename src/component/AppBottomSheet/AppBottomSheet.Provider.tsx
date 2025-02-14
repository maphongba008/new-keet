import React from 'react'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'
import { BackdropPressBehavior } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types'

import { ChannelRoomTipsProps } from 'screen/CreateChannel/ChannelRoomTips'

// Enum for bottom sheet types
import BottomSheetEnum from './SheetComponents/BottomSheetEnum'
// Import props/interfaces from various components
import { CallStartedInterface } from './SheetComponents/CallStarted'
import { ChatEventDeleteConfirmSheetI } from './SheetComponents/ChatEventDeleteConfirmSheet'
import { ChatEventOptionsSheetProp } from './SheetComponents/ChatEventOptionsSheet'
import { ChatLinkConfirmationInterface } from './SheetComponents/ChatLinkConfirmation'
import { ClearAllFilesInterface } from './SheetComponents/ClearAllFiles'
import { ConfirmBlockDialogInterface } from './SheetComponents/ConfirmBlockDialog'
import { ConfirmDialogInterface } from './SheetComponents/ConfirmDialog'
import { ConfirmInappropriateMessageDialogInterface } from './SheetComponents/ConfirmInappropriateMessageDialog'
import { DeviceDetailsInterface } from './SheetComponents/DeviceDetailsSheet'
import { DialogInterface } from './SheetComponents/Dialog'
import { DMRequestInterface } from './SheetComponents/DMRequest'
import { EmojiSourceSheetInterface } from './SheetComponents/EmojiSourceSheet'
import { FeedbackFormSheetInterface } from './SheetComponents/FeedbackForm'
import { IdentityBackupConfirmSheetInterface } from './SheetComponents/IdentityBackupConfirmSheet'
import { InviteTypeOptionsSheetProps } from './SheetComponents/InviteTypeOptionsSheet'
import { ListOptionSheetPropsI } from './SheetComponents/ListOptionsSheet'
import { MessageOptionsSheetInterface } from './SheetComponents/MessageOptionSheet'
import { OptionSheetProps } from './SheetComponents/OptionsSheet'
import { ParticipantsSheetProps } from './SheetComponents/ParticipantsSheet'
import { PermissionRequiredInterface } from './SheetComponents/PermissionRequired'
import { RoleChangeConfirmInterface } from './SheetComponents/RoleChangeConfirm'
import { RoomAdminResetInterface } from './SheetComponents/RoomAdminReset'
import { RoomAvatarSheetProps } from './SheetComponents/RoomAvatar'
import { RoomOptionsStatsI } from './SheetComponents/RoomOptionsStats'

// props specific for bottom sheet
interface BaseBottomSheetProps {
  bottomSheetIsTransparent?: boolean
  bottomSheetOnDismissCallback?: () => void
  bottomSheetBackdropPressBehaviour?: BackdropPressBehavior
  bottomSheetEnablePanDownToClose?: boolean
}

// props specific for bottom sheet's rendered component
type BottomSheetComponentProps = {
  [BottomSheetEnum.MessageOptionsSheet]: MessageOptionsSheetInterface
  [BottomSheetEnum.ConfirmDialog]: ConfirmDialogInterface
  [BottomSheetEnum.ConfirmBlockDialog]: ConfirmBlockDialogInterface
  [BottomSheetEnum.ConfirmInappropriateMessageDialog]: ConfirmInappropriateMessageDialogInterface
  [BottomSheetEnum.InviteTypeOptionsSheet]: InviteTypeOptionsSheetProps
  [BottomSheetEnum.RecoverWalletSheet]: {}
  [BottomSheetEnum.ParticipantsSheet]: ParticipantsSheetProps
  [BottomSheetEnum.OptionsSheet]: OptionSheetProps
  [BottomSheetEnum.CallStarted]: CallStartedInterface
  [BottomSheetEnum.RoomActionSheet]: {}
  [BottomSheetEnum.NetworkBottomSheet]: {}
  [BottomSheetEnum.ChatEventOptionsSheet]: ChatEventOptionsSheetProp
  [BottomSheetEnum.PermissionRequired]: PermissionRequiredInterface
  [BottomSheetEnum.RoomInviteType]: {}
  [BottomSheetEnum.ClearAllFiles]: ClearAllFilesInterface
  [BottomSheetEnum.ChatLinkConfirmationSheet]: ChatLinkConfirmationInterface
  [BottomSheetEnum.Dialog]: DialogInterface
  [BottomSheetEnum.FeedbackFormSheet]: FeedbackFormSheetInterface
  [BottomSheetEnum.EmojiSourceSheet]: EmojiSourceSheetInterface
  [BottomSheetEnum.RoomAvatarBottomSheet]: RoomAvatarSheetProps
  [BottomSheetEnum.ChannelRoomTips]: ChannelRoomTipsProps
  [BottomSheetEnum.IdentityBackupConfirmSheet]: IdentityBackupConfirmSheetInterface
  [BottomSheetEnum.CleanDeviceBottomSheet]: {}
  [BottomSheetEnum.TurnOffPasscodeSheet]: {}
  [BottomSheetEnum.RoomOptionsStats]: RoomOptionsStatsI
  [BottomSheetEnum.CommunityContacts]: {}
  [BottomSheetEnum.RoomAdminReset]: RoomAdminResetInterface
  [BottomSheetEnum.DeviceDetailsBottomSheet]: DeviceDetailsInterface
  [BottomSheetEnum.DMRequest]: DMRequestInterface
  [BottomSheetEnum.ChatEventDeleteConfirmSheet]: ChatEventDeleteConfirmSheetI
  [BottomSheetEnum.WalletSettings]: {}
  [BottomSheetEnum.WalletDelete]: {}
  [BottomSheetEnum.RoleChangeConfirm]: RoleChangeConfirmInterface
  [BottomSheetEnum.ListOptionsSheet]: ListOptionSheetPropsI
  [BottomSheetEnum.CallAutoEndPopup]: {}
}

type BottomSheetProps = {
  [K in keyof BottomSheetComponentProps]: {
    bottomSheetType: K
  } & BottomSheetComponentProps[K]
}[keyof BottomSheetComponentProps]

// All types are combined here so that when showing a sheet, you only need to provide the enum.
// Call showBottomSheet({ bottomSheetType: BottomSheetEnum }) and the appropriate interface/type will be inferred automatically.
export type AppSheetType = BottomSheetProps & BaseBottomSheetProps

class BottomSheetProviderClass {
  bottomSheetContext: AppSheetType
  constructor() {
    this.bottomSheetContext = {
      bottomSheetType: BottomSheetEnum.RoomActionSheet, // Default type
    }
  }
}

export const BottomSheetProvider = new BottomSheetProviderClass()

export const BottomSheetRef = React.createRef<BottomSheetModal>()
