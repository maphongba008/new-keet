import UserNotifications
import KeetLogging

let canRunPushHandlerKey = "keet:can_run_push_handler"
let pushStringsKey = "keet:push_strings"

@objc public class KeetPushStrings: NSObject, Codable {
  @objc
  public var defaultUsername = "Someone"

  @objc
  public var roomsHaveUnread = "$1 rooms have unread messages"

  @objc
  public var unreadMessages = "$1 unread messages"

  @objc
  public var roomsGroup = "Rooms"

  @objc
  public var roomsNewMessagesChannel = "New messages"

  @objc
  public var roomsCallsChannel = "Calls"

  @objc
  public var sharedImage = "$1 shared an image 🖼️"

  @objc
  public var sharedVideo = "$1 shared a video 📹"

  @objc
  public var sharedFile = "$1 shared a file 📁"

  @objc
  public var callStarted = "$1 has started a call 📞"

  @objc
  public var joinCall = "Join call"

  @objc
  public var dismissCall = "Dismiss"
}

@objc public class KeetUserDefaults: UserDefaults {
  @objc
  public static let groupId = "group.io.keet\(KeetUserDefaultsEnv.appSuffix())"

  public static let ROOM_CALL_CATEGORY = "ROOM_CALL_CATEGORY"
  public static let ROOM_CALL_JOIN_ACTION_ID = "join-call"
  public static let ROOM_CALL_DISMISS_ACTION_ID = "dismiss-call"

  init() {
    super.init(suiteName: KeetUserDefaults.groupId)!
  }

  @objc public func setCanRunPushHandler(value: Bool) {
    setValue(value, forKey: canRunPushHandlerKey)
  }
  @objc public func getCanRunPushHandler() -> Bool {
    return bool(forKey: canRunPushHandlerKey)
  }

  public func setPushStrings(strings: KeetPushStrings) {
    let encoder = JSONEncoder()
    if let encoded = try? encoder.encode(strings) {
      set(encoded, forKey: pushStringsKey)
    }
  }
  @objc public func getPushStrings() -> KeetPushStrings {
    if let stringsData = object(forKey: pushStringsKey) as? Data {
        let decoder = JSONDecoder()
        if let strings = try? decoder.decode(KeetPushStrings.self, from: stringsData) {
            return strings
        }
    }
    return KeetPushStrings()
  }
}

let keetUserDefaults = KeetUserDefaults()

@objc public extension UserDefaults {
  @objc static let keet = keetUserDefaults
}
