package io.keet

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat

class DismissNotificationBroadcastReceiver: BroadcastReceiver() {
  companion object {
    const val ACTION_DISMISS_NOTIFICATION = "io.keet.DISMISS_NOTIFICATION"
    const val EXTRA_ROOM_KEY = "io.keet.EXTRA_ROOM_KEY"
    const val EXTRA_NOTIFICATION_ID = "io.keet.EXTRA_NOTIFICATION_ID"
  }
  override fun onReceive(context: Context?, intent: Intent?) {
    val roomKey = intent?.getStringExtra(EXTRA_ROOM_KEY)!!
    val id = intent.getIntExtra(EXTRA_NOTIFICATION_ID, 0)
    val notificationManager = NotificationManagerCompat.from(context!!)
    notificationManager.cancel(roomKey, id)
  }
}
