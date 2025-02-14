@file:OptIn(FrameworkAPI::class)

package io.keet

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.common.annotations.FrameworkAPI

open class KeetActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)

    val receivedIntent: Intent? = intent
    if (receivedIntent?.action == Intent.ACTION_SEND || receivedIntent?.action == Intent.ACTION_SEND_MULTIPLE) {
      KeetReceiveContentModule.handleIntent(this, receivedIntent)
    }
  }

  override fun onPause() {
    KeetCore.maybeSuspend()
    super.onPause()
  }

  override fun onResume() {
    super.onResume()
    KeetCore.maybeResume()
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    if (intent?.action == Intent.ACTION_SEND || intent?.action == Intent.ACTION_SEND_MULTIPLE) {
      KeetReceiveContentModule.handleIntent(this, intent)
    }
  }
}
