import Foundation
import UserNotifications
import OSLog

import KeetLogging
import KeetUserDefaults

// MARK: will happen when remote, no matter bg / fg

extension KeetNotificationServiceExtension: KeetNotificationsCoreRunnerDelegate {
  public func onPayloadResult(withRoomKey roomKey: String, messageId: String, messageType: String, roomName: String, profileName: String, messageText: String) {
    os_log("(nse) result", log: OSLog.Keet)

    if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
      if !roomKey.isEmpty {
        os_log("(nse) delivering", log: OSLog.Keet)

        let strings = UserDefaults.keet.getPushStrings()
        let isCall = messageType.hasPrefix("call")
        let profileNameNotEmpty = profileName.isEmpty ? strings.defaultUsername : profileName

        bestAttemptContent.title = roomName.isEmpty ? profileNameNotEmpty : roomName

        if isCall {
          bestAttemptContent.body = strings.callStarted.replacingOccurrences(of: "$1", with: profileNameNotEmpty)
          bestAttemptContent.categoryIdentifier = KeetUserDefaults.ROOM_CALL_CATEGORY
        }
        else if messageType.hasPrefix("image") {
          bestAttemptContent.body = strings.sharedImage.replacingOccurrences(of: "$1", with: profileNameNotEmpty)
        }
        else if messageType.hasPrefix("video") {
          bestAttemptContent.body = strings.sharedVideo.replacingOccurrences(of: "$1", with: profileNameNotEmpty)
        }
        else if !messageType.isEmpty {
          bestAttemptContent.body = strings.sharedFile.replacingOccurrences(of: "$1", with: profileNameNotEmpty)
        }
        else if roomName.isEmpty {
          bestAttemptContent.body = messageText
        }
        else {
          bestAttemptContent.body = "\(profileNameNotEmpty): \(messageText)"
        }
        bestAttemptContent.userInfo = [
          "roomKey": roomKey,
          "messageId": messageId
        ]
        bestAttemptContent.threadIdentifier = roomKey
        bestAttemptContent.summaryArgument = roomName
        bestAttemptContent.sound = UNNotificationSound(
          named: UNNotificationSoundName(rawValue: "keet.mp3"))
          // named: UNNotificationSoundName(rawValue: !isCall ? "keet.mp3" : "keet_ringtone.mp3"))
        contentHandler(bestAttemptContent)
        return
      }
    }

    os_log("(nse) ignoring", log: OSLog.Keet)
    ignoreIncomingNotification()
  }
}

@objc
open class KeetNotificationServiceExtension: UNNotificationServiceExtension {
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  public override func didReceive(_ request: UNNotificationRequest, withContentHandler handler: @escaping (UNNotificationContent) -> Void) {
    os_log("(nse) new push", log: OSLog.Keet)
    //os_log("(nse) pid=%{public}s", log: OSLog.Keet, "\(getpid())")
    //os_log("(nse) thread=%{public}s", log: OSLog.Keet, "\(Thread.current.description)")

    if !KeetUserDefaultsConstants.canRunPushHandler() {
      os_log("(nse) won't run", log: OSLog.Keet)
      handler(UNNotificationContent())
      return
    }

    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
    contentHandler = handler

    let userInfo = request.content.userInfo
    if let payload = userInfo["payload"] as? String {
      KeetNotificationsCoreRunner.runKeetCore(withPushPayload: payload, delegate: self)
    }
    else {
      os_log("(nse) no payload", log: OSLog.Keet)
      ignoreIncomingNotification()
    }
  }

  public override func serviceExtensionTimeWillExpire() {
    os_log("(nse) expired", log: OSLog.Keet)
    ignoreIncomingNotification()
  }

  private func ignoreIncomingNotification() {
    if let contentHandler = contentHandler {
      contentHandler(UNNotificationContent())
    }
  }
}
