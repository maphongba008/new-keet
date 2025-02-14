@file:OptIn(FrameworkAPI::class)

package io.keet

import android.util.Log
import com.facebook.react.common.annotations.FrameworkAPI
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.flow.map

private const val TAG = "KeetFirebaseMessagingService"

class KeetFirebaseMessagingService : FirebaseMessagingService() {
  private val pushHandler = object : KeetPushHandler() {}

  override fun onCreate() {
    super.onCreate()
    pushHandler.context = applicationContext
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    Log.v(TAG, "new push")

    remoteMessage.data["payload"]?.let { payload ->
      KeetCore.maybeRunPushHandler(
        payload,
        filesDir.absolutePath,
        getPushBundlePath(),
        pushHandler
      )
    }
  }

  // unused

  override fun onNewToken(token: String) {}
}
