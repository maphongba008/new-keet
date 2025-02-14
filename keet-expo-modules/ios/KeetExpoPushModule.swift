import ExpoModulesCore

import UserNotifications

import FirebaseCore
import FirebaseMessaging

import KeetUserDefaults
import KeetLogging
import KeetNotifications

struct KeetPushStringsArg: Record {
  @Field
  var defaultUsername = "Someone"
  @Field
  var roomsHaveUnread = "$1 rooms have unread messages"
  @Field
  var unreadMessages = "$1 unread messages"
  @Field
  var roomsGroup = "Rooms"
  @Field
  var roomsNewMessagesChannel = "New messages"
  @Field
  var roomsCallsChannel = "Calls"
  @Field
  var sharedImage = "$1 shared an image 🖼️"
  @Field
  var sharedVideo = "$1 shared a video 📹"
  @Field
  var sharedFile = "$1 shared a file 📁"
  @Field
  var callStarted = "$1 has started a call 📞"
  @Field
  var joinCall = "Join call"
  @Field
  var dismissCall = "Dismiss"
}

public class KeetPushModule: Module {
  static var launchRoomUrl: String?

  public func definition() -> ModuleDefinition {
    Name("KeetPushModule")

    Function("setDefaultStrings") { (stringsArg: KeetPushStringsArg) in
      DispatchQueue.main.async {
        let joinCallAction = UNNotificationAction(
          identifier: KeetUserDefaults.ROOM_CALL_JOIN_ACTION_ID,
          title: stringsArg.joinCall,
          options: [.foreground])
        let dismissAction = UNNotificationAction(
          identifier: KeetUserDefaults.ROOM_CALL_DISMISS_ACTION_ID,
          title: stringsArg.dismissCall,
          options: [.destructive])
        let roomCallCategory = UNNotificationCategory(
          identifier: KeetUserDefaults.ROOM_CALL_CATEGORY,
          actions: [joinCallAction, dismissAction],
          intentIdentifiers: [],
          hiddenPreviewsBodyPlaceholder: "",
          options: .customDismissAction)
        let notificationCenter = UNUserNotificationCenter.current()
        notificationCenter.setNotificationCategories([roomCallCategory])

        // TODO:
        // Record is from expo modules api, we don't want KeetUserDefaults has expo deps
        // but must be a way to avoid dedup here
        let strings = KeetPushStrings()
        strings.defaultUsername = stringsArg.defaultUsername
        strings.roomsHaveUnread = stringsArg.roomsHaveUnread
        strings.unreadMessages = stringsArg.unreadMessages
        strings.roomsGroup = stringsArg.roomsGroup
        strings.roomsNewMessagesChannel = stringsArg.roomsNewMessagesChannel
        strings.roomsCallsChannel = stringsArg.roomsCallsChannel
        strings.sharedImage = stringsArg.sharedImage
        strings.sharedVideo = stringsArg.sharedVideo
        strings.sharedFile = stringsArg.sharedFile
        strings.callStarted = stringsArg.callStarted
        strings.joinCall = stringsArg.joinCall
        strings.dismissCall = stringsArg.dismissCall
        UserDefaults.keet.setPushStrings(strings: strings)
      }
    }

    Function("clearRoomNotifications") { (roomKey: String) in
      DispatchQueue.main.async {
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [roomKey])
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [roomKey])
      }
    }

    Function("setBadgeCount") { (badgeCount: Int) in
      DispatchQueue.main.async {
        UIApplication.shared.applicationIconBadgeNumber = badgeCount
      }
    }

    Function("getLaunchUrl") {
      return KeetPushModule.launchRoomUrl
    }

    AsyncFunction("getToken") { (promise: Promise) in
      Messaging.messaging().token { token, error in
        if let _ = error {
          promise.resolve(nil)
        }
        else if token != nil {
          promise.resolve(token)
        }
      }
    }

    AsyncFunction("subscribeToRoomNotifications") { (topic: String, promise: Promise) in
      DispatchQueue.main.async {
        Messaging.messaging().token { token, error in
          if let _ = error {
            promise.resolve(nil)
          }
          else if token != nil {
            Messaging.messaging().subscribe(toTopic: topic) { error in
              if let _ = error {
                promise.resolve(nil)
                return
              }
              promise.resolve(token)
            }
          }
        }
      }
    }

    AsyncFunction("unsubscribeRoomNotifications") { (topic: String, promise: Promise) in
      DispatchQueue.main.async {
        Messaging.messaging().unsubscribe(fromTopic: topic) { error in
          promise.resolve(error == nil)
        }
      }
    }
  }
}


public class KeetPushDelegateSubscriber: ExpoAppDelegateSubscriber {
  static let once: Void = {
    FirebaseApp.configure()
    return ()
  }()

  private var appPrefix = KeetUserDefaultsEnv.appPrefix()

  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {

    UNUserNotificationCenter.current().delegate = self

    let _: Void = KeetPushDelegateSubscriber.once
    Messaging.messaging().delegate = self

    let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
    UNUserNotificationCenter.current().requestAuthorization(
      options: authOptions,
      completionHandler: { granted, error in
        if (!granted) {
          DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
          }
        }
      }
    )

    if let userInfo = launchOptions?[.remoteNotification] as? NSDictionary {
      if let roomKey = userInfo["roomKey"] as? String,
         let url = URL(string: "\(appPrefix)://push/\(roomKey)") {
        os_log("did launch with launch url", log: OSLog.Keet)
        KeetPushModule.launchRoomUrl = url.absoluteString
      }
      else {
        os_log("did not launch with launch url", log: OSLog.Keet)
      }
    }
    else {
      os_log("did not launch with options", log: OSLog.Keet)
    }

    return true
  }
}

extension KeetPushDelegateSubscriber: UNUserNotificationCenterDelegate {

  // MARK: will happen in fg, no matter local / remote

  public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.badge, .banner, .sound, .list])
  }

  // MARK: When user taps the notification

  public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {

    if response.actionIdentifier == UNNotificationDismissActionIdentifier ||
        response.actionIdentifier == KeetUserDefaults.ROOM_CALL_DISMISS_ACTION_ID {
      completionHandler()
      return
    }

    let userInfo = response.notification.request.content.userInfo
    os_log("did click notification", log: OSLog.Keet)

    if let roomKey = userInfo["roomKey"] as? String,
        let url = URL(string: "\(appPrefix)://push/\(roomKey)/\(response.actionIdentifier)") {
      UIApplication.shared.open(url)
    }
    else {
      os_log("will ignore notification interaction", log: OSLog.Keet)
    }

    completionHandler();
  }
}

extension KeetPushDelegateSubscriber: MessagingDelegate {
  public func messaging(_ messaging: Messaging, didReceiveRegistrationToken token: String?) {
  }
}
