package io.keet

import io.keet.BuildConfig
import android.Manifest
import android.app.PendingIntent
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationChannelCompat
import androidx.core.app.NotificationChannelGroupCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.serialization.Serializable
import net.edwardday.serialization.preferences.Preferences
import net.edwardday.serialization.preferences.decode
import net.edwardday.serialization.preferences.encode

private val URI_PREFIX = "${BuildConfig.KEET_SCHEME_PEAR}://push"

private const val CHANNELS_PREFIX = "io.keet.notifications"
private const val ROOMS_GROUP = "${CHANNELS_PREFIX}.group_rooms"
private const val NEW_MESSAGES_CHANNEL = "${ROOMS_GROUP}.channel_new_messages"
private const val CALLS_CHANNEL = "${ROOMS_GROUP}.channel_calls"

private const val SUMMARY_GROUP_KEY = "io.keet.notifications.rooms"
private const val CALL_ID = 10
private const val SUMMARY_ID = 612

private const val STRINGS_PREFS_KEY = "push-strings"

@Serializable
data class KeetPushStrings(
  @Field
  val defaultUsername: String = "Someone",
  @Field
  val roomsHaveUnread: String = "\$1 rooms have unread messages",
  @Field
  val unreadMessages: String = "\$1 unread messages",
  @Field
  val roomsGroup: String = "Rooms",
  @Field
  val roomsNewMessagesChannel: String = "New messages",
  @Field
  val roomsCallsChannel: String = "Calls",
  @Field
  val sharedImage: String = "\$1 shared an image \uD83D\uDDBC",
  @Field
  val sharedVideo: String = "\$1 shared a video \uD83D\uDCF9",
  @Field
  val sharedFile: String = "\$1 shared a file \uD83D\uDCC1",
  @Field
  val callStarted: String = "\$1 has started a call \uD83D\uDCDE",
  @Field
  val joinCall: String = "Join call",
  @Field
  val dismissCall: String = "Dismiss",
): Record

private fun getPushStrings(context: Context): KeetPushStrings {
  Preferences(context.getKeetSharedPreferences())
    .decode<KeetPushStrings?>(STRINGS_PREFS_KEY)?.let {
      return it
    }
  return KeetPushStrings()
}

fun setPushDefaultStrings(context: Context, strings: KeetPushStrings) {
  Preferences(context.getKeetSharedPreferences()).encode(STRINGS_PREFS_KEY, strings)

  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
    val notificationManager = NotificationManagerCompat.from(context)

    // Rooms notification group

    val channelGroup =
      NotificationChannelGroupCompat.Builder(ROOMS_GROUP)
        .setName(strings.roomsGroup)
        .build()
    notificationManager.createNotificationChannelGroup(channelGroup)

    // channels

    // cleanup old channels
    notificationManager.notificationChannels.forEach { notificationChannel ->
      if (!notificationChannel.id.startsWith(CHANNELS_PREFIX)) {
        notificationManager.deleteNotificationChannel(notificationChannel.id)
      }
    }

    // new messages

    val newMessageSoundUri = Uri.parse(
      ContentResolver.SCHEME_ANDROID_RESOURCE + "://" +
        context.packageName + "/raw/keet"
    )

    val newMessagesChannel= NotificationChannelCompat.Builder(
      NEW_MESSAGES_CHANNEL,
      NotificationManagerCompat.IMPORTANCE_DEFAULT)
      .setName(strings.roomsNewMessagesChannel)
      .setGroup(ROOMS_GROUP)
      .setSound(
        newMessageSoundUri,
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_NOTIFICATION)
          .build()
      )
      .setShowBadge(true)
      .build()
    notificationManager.createNotificationChannel(newMessagesChannel)

    // calls

    val callsSoundUri = Uri.parse(
      ContentResolver.SCHEME_ANDROID_RESOURCE + "://" +
        context.packageName + "/raw/keet"
        // context.packageName + "/raw/keet_ringtone"
    )

    val callsChannel= NotificationChannelCompat.Builder(
      CALLS_CHANNEL,
      NotificationManagerCompat.IMPORTANCE_DEFAULT)
      .setName(strings.roomsCallsChannel)
      .setGroup(ROOMS_GROUP)
      .setSound(
        callsSoundUri,
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
          .build()
      )
      .setShowBadge(false)
      .build()
    notificationManager.createNotificationChannel(callsChannel)
  }
}

private val summaries = HashMap<String, Array<String>>()

open class KeetPushHandler {
  companion object {
    const val TAG = "KeetPushHandler"
  }

  lateinit var context: Context

  @Suppress("unused")
  fun onResult(
    roomKey: String,
    messageId: String,
    messageType: String,
    roomName: String,
    profileName: String,
    messageText: String) {

    Log.v(TAG, "push result")

    if (roomKey.isEmpty()) {
      Log.v(TAG, "push discarded")
      return
    }

    val permission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      ActivityCompat.checkSelfPermission(
        context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    } else {
      true
    }
    if (!permission) {
      return
    }

    val strings = getPushStrings(context)
    val notificationManager = NotificationManagerCompat.from(context)

    val profileNameNotEmpty = if (profileName.isNotEmpty()) profileName else strings.defaultUsername

    val notificationTitle = if (roomName.isEmpty()) profileNameNotEmpty else roomName

    if (messageType.startsWith("call")) {
      val notificationTitleBody = strings.callStarted.replace("\$1", profileNameNotEmpty)

      val joinIntent = Intent(Intent.ACTION_VIEW)
      Uri.parse("${URI_PREFIX}/$roomKey/join-call").also { joinIntent.data = it }
      val joinPendingIntent = PendingIntent.getActivity(
        context,
        0,
        joinIntent,
        PendingIntent.FLAG_IMMUTABLE
      )

      val joinRoomAction =
        NotificationCompat.Action.Builder(
          android.R.drawable.ic_menu_call,
          strings.joinCall,
          joinPendingIntent)
          .setSemanticAction(NotificationCompat.Action.SEMANTIC_ACTION_CALL)
          .build()

      val dismissIntent = Intent(
        context, DismissNotificationBroadcastReceiver::class.java).apply {
          action = DismissNotificationBroadcastReceiver.ACTION_DISMISS_NOTIFICATION
        putExtra(
          DismissNotificationBroadcastReceiver.EXTRA_ROOM_KEY,
          roomKey)
        putExtra(
          DismissNotificationBroadcastReceiver.EXTRA_NOTIFICATION_ID,
          CALL_ID)
      }
      val dismissPendingIntent =
        PendingIntent.getBroadcast(context, 1, dismissIntent, PendingIntent.FLAG_IMMUTABLE)
      val dismissAction = NotificationCompat.Action.Builder(
        android.R.drawable.ic_menu_call, strings.dismissCall, dismissPendingIntent)
        .build()

      val callNotificationBuilder =
        NotificationCompat.Builder(context, CALLS_CHANNEL)
          .setContentTitle(notificationTitle)
          .setContentText(notificationTitleBody)
          .setSmallIcon(R.drawable.ic_notifications)
          .addAction(joinRoomAction)
          .addAction(dismissAction)
      val callNotification = callNotificationBuilder.build()
      // callNotification.flags +=
        // NotificationCompat.FLAG_ONGOING_EVENT +
        // NotificationCompat.FLAG_INSISTENT
      notificationManager.notify(roomKey, CALL_ID, callNotification)
      return
    }

    val intent = Intent(Intent.ACTION_VIEW)
    Uri.parse("${URI_PREFIX}/$roomKey/0").also { intent.data = it }
    val pendingIntent = PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_IMMUTABLE
    )

    if (!hasRoomNotifications(context, roomKey)) {
      // clear summaries for room just in case user cleared notifications
      summaries.remove(roomKey)
    }


    var messageBody = "$profileNameNotEmpty: $messageText"
    if (messageType.startsWith("image")) {
      messageBody = strings.sharedImage.replace("\$1", profileNameNotEmpty)
    }
    else if (messageType.startsWith("video")) {
      messageBody = strings.sharedVideo.replace("\$1", profileNameNotEmpty)
    }
    else if (messageType.isNotEmpty()) {
      messageBody = strings.sharedFile.replace("\$1", profileNameNotEmpty)
    }
    else if (roomName.isEmpty()) {
      messageBody = messageText
    }

    if (summaries.contains(roomKey)) {
      summaries[roomKey] = arrayOf(messageBody) + summaries[roomKey]!!
    }
    else {
      summaries[roomKey] = arrayOf(messageBody)
    }

    val roomSummary = summaries[roomKey]!!
    val summaryStyle = NotificationCompat.InboxStyle()
    if (summaries.size > 1) {
      val summaryText =
        strings.roomsHaveUnread.replace("\$1", "${summaries.size}")
      summaryStyle.setSummaryText(summaryText)
    }
    val summaryNotificationBuilder =
      NotificationCompat.Builder(context, NEW_MESSAGES_CHANNEL)
        .setSmallIcon(R.drawable.ic_notifications)
        .setStyle(summaryStyle)
        .setGroup(SUMMARY_GROUP_KEY)
        .setGroupSummary(true)
        .setNumber(summaries.size)

    val roomSummaryStyle = NotificationCompat.InboxStyle()
    roomSummary.forEach { line ->
      roomSummaryStyle.addLine(line)
    }
    if (roomSummary.size > 1) {
      val roomSummaryText =
        strings.unreadMessages.replace("\$1", "${roomSummary.size}")
      roomSummaryStyle.setSummaryText(roomSummaryText)
    }

    val roomNotificationBuilder =
      NotificationCompat.Builder(context, NEW_MESSAGES_CHANNEL)
        .setContentTitle(notificationTitle)
        .setContentText(roomSummary.first())
        .setStyle(roomSummaryStyle)
        .setSmallIcon(R.drawable.ic_notifications)
        .setGroup(SUMMARY_GROUP_KEY)
        .setContentIntent(pendingIntent)

    notificationManager.notify(SUMMARY_GROUP_KEY, SUMMARY_ID, summaryNotificationBuilder.build())
    notificationManager.notify(roomKey, SUMMARY_ID + 1, roomNotificationBuilder.build())
  }
}

fun hasRoomNotifications(context: Context, roomKey: String): Boolean {
  val manager = NotificationManagerCompat.from(context)
  for (notification in manager.activeNotifications) {
    if (notification.tag.contains(roomKey) || notification.groupKey.contains(roomKey)) {
      return true
    }
  }
  return false
}

fun clearRoomNotifications(context: Context, roomKey: String) {
  summaries.remove(roomKey)

  val manager = NotificationManagerCompat.from(context)

  if (summaries.size == 0) {
    manager.cancelAll()
    return
  }

  for (notification in manager.activeNotifications) {
    if (notification.tag.contains(roomKey) || notification.groupKey.contains(roomKey)) {
      manager.cancel(notification.tag, notification.id)
    }
  }
}
