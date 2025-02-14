import ExpoModulesCore

public class KeetVideoUtilsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KeetVideoUtilsModule")

    AsyncFunction("getSize") { (videoUri: URL, promise: Promise) in
      guard let size = getVideoDimensions(from: videoUri) else {
        promise.resolve(nil)
        return
      }

      promise.resolve([
        "width": size.width,
        "height": size.height,
      ])
    }
  }

  func getVideoDimensions(from url: URL) -> CGSize? {
    let asset = AVURLAsset(url: url)
    let tracks = asset.tracks(withMediaType: .video)
    let track = tracks.first

    return track?.naturalSize
  }
}
