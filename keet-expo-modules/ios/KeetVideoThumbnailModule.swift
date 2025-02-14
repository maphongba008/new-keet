import AVFoundation
import ExpoModulesCore

struct ImageSource: Record {
  @Field
  var url: URL?

  @Field
  var cacheKey: String?
}

public class KeetVideoThumbnailModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KeetVideoThumbnailModule")

    View(KeetVideoThumbnail.self) {
      Events("onLoad", "onError", "onDurationRetrieved")

      Prop("source") { (view: KeetVideoThumbnail, source: ImageSource) in
        guard let cacheKey = source.cacheKey else {
          return
        }
        guard let url = source.url else {
          return
        }

        view.processVideoDetails(url: url, cacheKey: cacheKey)
      }
    }

    AsyncFunction("clearCache") { (mayberClearKey: String?, promise: Promise) in
      guard let clearKey = mayberClearKey else {
        VideoDetailsStore.videosCache.removeAllObjects()
        promise.resolve(true)
        return
      }

      let result = KeetVideoThumbnail.removeImageCache(withCacheKey: clearKey)
      promise.resolve(result)
    }
  }
}
