import ExpoModulesCore
import UniformTypeIdentifiers
import Social
import CoreServices
import KeetUserDefaults

public class KeetReceiveContentModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KeetReceiveContentModule")

    Function("getShareContent") { () -> Any? in
      let sharedDefaults = UserDefaults.keet
      let shareData = sharedDefaults.object(forKey: "shareContentURL") as? [[String: Any]]
      return shareData
    }
      
    Function ("resetShareContent") { () -> Any? in
      let sharedDefaults = UserDefaults.keet
      sharedDefaults.removeObject(forKey: "shareContentURL")
      return nil
    }
      
    Function ("deleteAppGroupFile") { (path: String) -> Any? in
      guard let appGroupURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: KeetUserDefaults.groupId) else {
        print("Could not find the App Group container.")
        return nil
      }
              
      let fileURL = appGroupURL.appendingPathComponent(URL(fileURLWithPath: path).lastPathComponent)
      do {
        try FileManager.default.removeItem(at: fileURL)
      } catch let error {
        print("Error deleting file: \(error.localizedDescription)")
      }
      return nil
    }
  }
}
