package io.keet

import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.ktx.messaging
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch

class KeetPushModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KeetPushModule")

    Function("setDefaultStrings") { strings: KeetPushStrings ->
      appContext.reactContext?.let { context ->
        appContext.mainQueue.launch {
          setPushDefaultStrings(context, strings)
        }
      }
    }

    Function("clearRoomNotifications") { roomKey: String ->
      appContext.reactContext?.let { context ->
        appContext.mainQueue.launch {
          clearRoomNotifications(context, roomKey)
        }
      }
    }

    Function("getLaunchUrl") {
      return@Function null
    }

    AsyncFunction("getToken") { promise: Promise ->
      FirebaseMessaging.getInstance().token.addOnCompleteListener {
        if (!it.isSuccessful) {
          promise.resolve(null)
          return@addOnCompleteListener
        }
        promise.resolve(null)
      }
    }

    AsyncFunction("subscribeToRoomNotifications") { topic: String, promise: Promise ->
      appContext.mainQueue.launch {
        FirebaseMessaging.getInstance().token.addOnCompleteListener {
          if (!it.isSuccessful) {
            promise.resolve(null)
            return@addOnCompleteListener
          }
          val token = it.result
          Firebase.messaging.subscribeToTopic(topic)
            .addOnCompleteListener { task ->
              if (!task.isSuccessful) {
                promise.resolve(null)
              }
              else {
                promise.resolve(token)
              }
            }
        }
      }
    }

    AsyncFunction("unsubscribeRoomNotifications") { topic: String, promise: Promise ->
      appContext.mainQueue.launch {
        Firebase.messaging.unsubscribeFromTopic(topic)
          .addOnCompleteListener { task ->
            promise.resolve(task.isSuccessful)
          }
      }
    }
  }
}
