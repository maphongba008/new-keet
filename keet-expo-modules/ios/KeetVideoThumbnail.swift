import ExpoModulesCore
import WebKit

class VideoDetails {
  var duration: Double
  var thumbnailURL: URL

  init(duration: Double, thumbnailURL: URL) {
    self.duration = duration
    self.thumbnailURL = thumbnailURL
  }
}

class VideoDetailsStore: NSObject {
  static let videosCache = NSCache<NSString, VideoDetails>()
}

class KeetVideoThumbnail: ExpoView {
  let imageView = UIImageView()
  let onLoad = EventDispatcher()
  let onError = EventDispatcher()
  let onDurationRetrieved = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    addSubview(imageView)
  }

  override func layoutSubviews() {
    imageView.frame = bounds
    imageView.contentMode = .scaleAspectFill
  }

  func getVideoDuration(asset: AVAsset) async throws -> Double {
    let duration: CMTime
    if #available(iOS 15, *) {
      duration = try await asset.load(.duration)
    } else {
      duration = asset.duration
    }

    let durationTime = CMTimeGetSeconds(duration)

    return durationTime
  }

  func processVideoDetails(url: URL, cacheKey: String) {
    Task(priority: .background) {
      do {
        let cacheKeyToNSString = cacheKey as NSString
        if let cachedVideoDetails = VideoDetailsStore.videosCache.object(forKey: cacheKeyToNSString) {
          onDurationRetrieved([
            "videoDuration": cachedVideoDetails.duration,
          ])
          if let imageData = try? Data(contentsOf: cachedVideoDetails.thumbnailURL),
             let image = UIImage(data: imageData)
          {
            imageView.image = image
            onLoad([
              "height": image.size.height,
              "width": image.size.width,
            ])
          } else {
            onError()
            VideoDetailsStore.videosCache.removeObject(forKey: cacheKeyToNSString)
          }
        } else {
          guard let decodedCacheKey = cacheKey.removingPercentEncoding else {
            return
          }
          let filePath = FileManager.default.temporaryDirectory.appendingPathComponent(decodedCacheKey)
          let asset: AVAsset = .init(url: url)
          let videoDuration = try await getVideoDuration(asset: asset)

          onDurationRetrieved([
            "videoDuration": videoDuration,
          ])
          let thumbnailImage = try await generateThumbnailImage(asset: asset)

          imageView.image = thumbnailImage
          onLoad([
            "height": thumbnailImage.size.height,
            "width": thumbnailImage.size.width,
          ])
          if saveUIImageToFile(uiImage: thumbnailImage, fileUrl: filePath) {
            VideoDetailsStore.videosCache.setObject(VideoDetails(duration: videoDuration, thumbnailURL: filePath), forKey: cacheKeyToNSString)
          }
        }
      } catch {
        print("processVideoDetails", url, error.localizedDescription)
        onError()
      }
    }
  }

  private func saveUIImageToFile(uiImage: UIImage, fileUrl: URL) -> Bool {
    if let imageData = uiImage.jpegData(compressionQuality: 0.5) {
      do {
        try imageData.write(to: fileUrl, options: .atomic)
        return true
      } catch {
        print("Error writing image data to file:", error.localizedDescription)
        return false
      }
    } else {
      print("Error creating JPEG data from image")
      return false
    }
  }

  static func removeImageCache(withCacheKey cacheKey: String) -> Bool {
    do {
      let cacheKeyToNSString = cacheKey as NSString
      if let cachedVideoDetails = VideoDetailsStore.videosCache.object(forKey: cacheKeyToNSString) {
        VideoDetailsStore.videosCache.removeObject(forKey: cacheKeyToNSString)
        try FileManager.default.removeItem(at: cachedVideoDetails.thumbnailURL)
      }
      return true
    } catch {
      print("Error removing file: \(error)", cacheKey)
      return false
    }
  }

  private func generateThumbnailImage(asset: AVAsset) async throws -> UIImage {
    let imageGenerator = AVAssetImageGenerator(asset: asset)
    let seconds: Int64 = 0
    let timescale: Int32 = 60

    imageGenerator.appliesPreferredTrackTransform = true
    var thumbnailImage: CGImage
    if #available(iOS 16, *) {
      thumbnailImage = try await imageGenerator.image(at: CMTime(seconds: Double(seconds), preferredTimescale: timescale)).image
    } else {
      thumbnailImage = try imageGenerator.copyCGImage(at: CMTimeMake(value: seconds, timescale: timescale), actualTime: nil)
    }

    return UIImage(cgImage: thumbnailImage)
  }
}
