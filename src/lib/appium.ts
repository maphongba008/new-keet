import { ViewProps } from 'react-native'
import _includes from 'lodash/includes'

type NamedEnum<Key extends string> = { [v in Key]: v }

function inferGeneric<T extends string>(t: NamedEnum<T>) {
  return t
}

export const APPIUM_IDs = inferGeneric({
  back_button: 'back_button',
  // LobbyScreen
  lobby_btn_join_room: 'lobby_btn_join_room',
  lobby_btn_create_room: 'lobby_btn_create_room',
  lobby_btn_create_chat: 'lobby_btn_create_chat',
  lobby_btn_create_broadcast: 'lobby_btn_create_broadcast',
  lobby_btn_create_back: 'lobby_btn_create_back',
  lobby_input_room_name: 'lobby_input_room_name',
  lobby_input_room_description: 'lobby_input_room_description',
  lobby_btn_paste: 'lobby_btn_paste',
  lobby_btn_qr: 'lobby_btn_qr',
  lobby_btn_submit: 'lobby_btn_submit',
  lobby_btn_add_room: 'lobby_btn_add_room',
  lobby_tap_to_call: 'lobby_tap_to_call',
  lobby_input_search: 'lobby_input_search',
  lobby_btn_clear_search: 'lobby_btn_clear_search',
  lobby_btn_rooms: 'lobby_btn_rooms',
  lobby_btn_profile: 'lobby_btn_profile',
  lobby_dm: 'lobby_dm',
  lobby_filter: 'lobby_filter',
  lobby_selected_filter: 'lobby_selected_filter',
  lobby_joining_rooms: 'lobby_joining_rooms',
  lobby_swipable_btn_mute: 'lobby_swipable_btn_mute',
  lobby_swipable_btn_leave: 'lobby_swipable_btn_leave',
  lobby_bottomsheet_btn_leave: 'lobby_bottomsheet_btn_leave',
  // CreateBroadcastRoomScreen
  broadcast_accept_admin: 'broadcast_accept_admin',
  broadcast_btn_create: 'broadcast_btn_create',
  // RoomScreen
  room_call_join: 'room_call_join',
  room_call_mute: 'room_call_mute',
  room_call_video: 'room_call_video',
  room_call_speaker: 'room_call_speaker',
  room_call_end: 'room_call_end',
  room_btn_attach: 'room_btn_attach',
  room_btn_send: 'room_btn_send',
  room_input_msg: 'room_input_msg',
  room_attach_doc: 'room_attach_doc',
  room_attach_media: 'room_attach_media',
  room_capture_video: 'room_capture_video',
  room_capture_img: 'room_capture_img',
  room_btn_edit: 'room_btn_edit',
  room_btn_reply: 'room_btn_reply',
  room_btn_download: 'room_btn_download',
  room_btn_copy_msg: 'room_btn_copy_msg',
  room_btn_copy_msg_link: 'room_btn_copy_msg_link',
  room_btn_copy_img: 'room_btn_copy_img',
  room_btn_share: 'room_btn_share',
  room_btn_forward: 'room_btn_forward',
  room_btn_flag: 'room_btn_flag',
  room_btn_del: 'room_btn_del',
  room_btn_clear: 'room_btn_clear',
  room_btn_invite: 'room_btn_invite',
  room_btn_pin: 'room_btn_pin',
  room_profile_name: 'room_profile_name',
  room_profile_avatar: 'room_profile_avatar',
  room_pinned_message_header: 'room_pinned_message_header',
  // RoomOptionsScreen
  options_edit_details: 'options_edit_details',
  options_btn_files: 'options_btn_files',
  options_btn_share_link: 'options_btn_share_link',
  options_btn_share_qr: 'options_btn_share_qr',
  options_btn_clear_files: 'options_btn_clear_files',
  options_btn_leave: 'options_btn_leave',
  options_btn_toggle_notifications: 'options_btn_toggle_notifications',
  options_btn_toggle_call: 'options_btn_toggle_call',
  // InviteQRScreen
  invite_btn_type: 'invite_btn_type',
  invite_btn_expires_hours: 'invite_btn_expires_hours',
  invite_btn_expires_days: 'invite_btn_expires_days',
  invite_btn_expires_weeks: 'invite_btn_expires_weeks',
  invite_btn_no_expire: 'invite_btn_no_expire',
  invite_btn_accept_admin: 'invite_btn_accept_admin',
  invite_btn_generate: 'invite_btn_generate',
  // RoomMembersScreen
  members_search: 'members_search',
  // AccountScreen
  profile_pick_avatar: 'profile_pick_avatar',
  profile_edit_name: 'profile_edit_name',
  profile_network_status: 'profile_network_status',
  account_btn_share_network_info: 'account_btn_share_network_info',
  account_btn_copy_network_info: 'account_btn_copy_network_info',
  profile_tos: 'profile_tos',
  // list
  list_item: 'list_item_' as any,
  create_channel_btn: 'create_channel_btn',
  // Avatar
  avatar_image: 'avatar_image',
  // onboarding
  onboarding_btn_skip: 'onboarding_btn_skip',
  onboarding_btn_next: 'onboarding_btn_next',
  onboarding_btn_prev: 'onboarding_btn_prev',
  onboarding_btn_finish: 'onboarding_btn_finish',
  onboarding_tos_btn_let_in: 'onboarding_tos_btn_let_in',
  onboarding_input_username: 'onboarding_input_username',
  onboarding_btn_save_username: 'onboarding_btn_save_username',
  // IdentityScreen
  identity_btn_create: 'identity_btn_create',
  identity_btn_link: 'identity_btn_link',
  identity_btn_skip: 'identity_btn_skip',
  // Room Participant list
  participant_item: 'participant_item_' as any,
  participant_btn_all: 'participant_btn_all',
  // Tooltips
  tooltip_btn_profile: 'tooltip_btn_profile',
  tooltip_btn_join_room: 'tooltip_btn_join_room',
  // PasscodeScreen
  passcode_btn_back: 'passcode_btn_back',
  passcode_btn_close: 'passcode_btn_close',
  passcode_btn_delete: 'passcode_btn_delete',
  passcode_confirm_btn_back: 'passcode_confirm_btn_back',
  passcode_confirm_btn_close: 'passcode_confirm_btn_close',
  // RecoverAccountScreen
  recover_btn_link: 'recover_btn_link',
  recover_btn_recover: 'recover_btn_recover',
  recover_input_passphrase: 'recover_input_passphrase',
  recover_btn_continue: 'recover_btn_continue',
  recover_btn_paste: 'recover_btn_paste',
  recover_btn_success: 'recover_btn_success',
  // IdentitySyncScreen
  identity_accept_checkbox: 'identity_accept_checkbox',
  identity_btn_accept: 'identity_btn_accept',
  identity_btn_use_camera_action: 'identity_btn_use_camera_action',
  identity_btn_use_invite_link: 'identity_btn_use_invite_link',
  identity_sync_invite_link_input: 'identity_sync_invite_link_input',
  identity_sync_invite_link_submit: 'identity_sync_invite_link_submit',
  identity_sync_invite_link_declined: 'identity_sync_invite_link_declined',
  identity_sync_invite_request_confirm: 'identity_sync_invite_request_confirm',
  identity_sync_invite_request_notMyDevice:
    'identity_sync_invite_request_notMyDevice',
  identity_sync_invite_request_success: 'identity_sync_invite_request_success',
  // Create ID
  create_identity_agreement_btn: 'create_identity_agreement_btn',
  create_identity_view_phrase_btn: 'create_identity_view_phrase_btn',
  create_identity_copy_phrase_btn: 'create_identity_copy_phrase_btn',
  create_identity_setup_continue_btn: 'create_identity_setup_continue_btn',
  create_id_verification_word: 'create_id_verification_word',
  create_id_submit_verification: 'create_id_submit_verification',
  create_id_onFinish_btn: 'create_id_onFinish_btn',
  // Components
  radio_btn: 'radio_btn',
  radio_btn_checked: 'radio_btn_checked',
  // Call Screen
  call_shared_screen_expand_button: 'call_shared_screen_expand_button',
  // MediaPreviewScreen
  media_preview_video_view: 'media_preview_video_view',
  media_preview_btn_custom_play: 'media_preview_btn_custom_play',
  media_preview_loading: 'media_preview_loading',
  // Discover Community
  discover_community_join_room: 'discover_community_join_room',
  discover_community_select_room: 'discover_community_select_room',

  // wallet
  wallet_default_server_action: 'wallet_default_server_action',
  wallet_custom_server_action: 'wallet_custom_server_action',
  wallet_server_get_started: 'wallet_server_get_started',
  wallet_setup_onFinish_btn: 'wallet_setup_onFinish_btn',
  wallet_create_agreement_btn: 'wallet_create_agreement_btn',
  wallet_settings_option_any: 'wallet_settings_option_any',
  wallet_settings_option_custom: 'wallet_settings_option_custom',
  wallet_settings_amount_input: 'wallet_settings_amount_input',
  wallet_settings_save_btn: 'wallet_settings_save_btn',
  wallet_send_submit_btn: 'wallet_send_submit_btn',
  wallet_send_scanner_btn: 'wallet_send_scanner_btn',
  wallet_send_scanner_back_btn: 'wallet_send_scanner_back_btn',
  wallet_send_open_scanner_btn: 'wallet_send_open_scanner_btn',
  wallet_send_paste_btn: 'wallet_send_paste_btn',
  wallet_input_wallet_address: 'wallet_input_wallet_address',
  wallet_input_transaction_description: 'wallet_input_transaction_description',
  wallet_btn_transfer_next: 'wallet_btn_transfer_next',
  wallet_btn_select_keet_contact: 'wallet_btn_select_keet_contact',
  wallet_btn_select_crypto_wallet: 'wallet_btn_select_crypto_wallet',
  wallet_receive_generate_invoice_btn: 'wallet_receive_generate_invoice_btn',
  wallet_receive_copy_invoice_btn: 'wallet_receive_copy_invoice_btn',
  wallet_receive_share_invoice_btn: 'wallet_receive_share_invoice_btn',
  wallet_custom_server_set_mode_btn: 'wallet_custom_server_set_mode_btn',
  wallet_custom_server_continue_btn: 'wallet_custom_server_continue_btn',
  wallet_custom_server_host_input: 'wallet_custom_server_host_input',
  wallet_custom_server_port_input: 'wallet_custom_server_port_input',
  wallet_custom_server_eth_indexer_input:
    'wallet_custom_server_eth_indexer_input',
  wallet_custom_server_connect_btn: 'wallet_custom_server_connect_btn',
  // User Profile Screen
  user_profile_chat: 'user_profile_chat',
  user_profile_call: 'user_profile_call',
  user_profile_send_dm: 'user_profile_send_dm',
} as const)

const DYNAMIC_KEY = [APPIUM_IDs.list_item]

export const appiumTestProps = (
  id?: keyof typeof APPIUM_IDs | string,
): Pick<ViewProps, 'accessible' | 'testID' | 'accessibilityLabel'> => {
  try {
    if (!id) {
      return {}
    }

    const appId = APPIUM_IDs[id as keyof typeof APPIUM_IDs]
    if (appId)
      return { accessible: true, testID: appId, accessibilityLabel: appId }

    if (DYNAMIC_KEY.some((substring) => _includes(id, substring))) {
      return { accessible: true, testID: id, accessibilityLabel: id }
    }
    return {}
  } catch (e) {
    console.log(e)
    return {}
  }
}
