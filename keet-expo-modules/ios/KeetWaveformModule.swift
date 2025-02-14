import AVFoundation
import ExpoModulesCore
import Foundation

public class KeetWaveformModule: Module {
  var waveformCache: [String: [Float]] = [:]
  var cacheLimit: UInt = 10
  var sampleCount: Int = 100

  public func definition() -> ModuleDefinition {
    Name("KeetWaveformModule")

    AsyncFunction("extractWaveform") { (audioUri: String, promise: Promise) in
      return extractWaveformFromURI(audioUri, promise)
    }
  }

  func constantsToExport() -> [AnyHashable: Any] {
    return ["cacheLimit": cacheLimit]
  }

  func extractWaveformFromURI(_ audioUri: String, _ promise: Promise) {
    if let cachedWaveform = waveformCache[audioUri] {
      promise.resolve(cachedWaveform)
      return
    }

    var isRejected = false
    // Perform waveform extraction asynchronously
    let extractionQueue = DispatchQueue.global(qos: .default)
    let mainQueue = DispatchQueue.main

    // Work item for waveform extraction
    let extractionWorkItem = DispatchWorkItem {
      var audioLocalUriString: String? = audioUri
      if audioUri.hasPrefix("http://") || audioUri.hasPrefix("https://") {
        audioLocalUriString = self.downloadHTTPAudio(url: URL(string: audioUri))
      }

      if audioLocalUriString == nil {
        promise.resolve([Float]())
        return
      }

      let waveformData = self.generateWaveformDataFromURL(url: URL(string: audioLocalUriString!))

      mainQueue.async {
        if isRejected {
          return
        }

        self.waveformCache[audioUri] = waveformData
        promise.resolve(waveformData)
      }
    }

    // Work item for the timeout
    let timeoutWorkItem = DispatchWorkItem {
      isRejected = true
      promise.resolve([Float]())
    }

    // Execute extraction and timeout work items
    extractionQueue.async(execute: extractionWorkItem)
    mainQueue.asyncAfter(deadline: .now() + 60, execute: timeoutWorkItem)

    // Cancel the timeout if the extraction completes in time
    extractionWorkItem.notify(queue: mainQueue) {
      timeoutWorkItem.cancel()
    }
  }

  func downloadHTTPAudio(url: URL?) -> String? {
    if url == nil {
      return nil
    }

    let documentsUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
    let destinationUrl = documentsUrl.appendingPathComponent(url!.lastPathComponent)

    if FileManager().fileExists(atPath: destinationUrl.path) {
      return destinationUrl.path
    }

    if let dataFromURL = NSData(contentsOf: url!) {
      if dataFromURL.write(to: destinationUrl, atomically: true) {
        return destinationUrl.path
      }
    }

    return nil
  }

  func generateWaveformDataFromURL(url: URL?) -> [Float] {
    var samples: [Float] = Array()

    if url == nil {
      return samples
    }

    do {
      guard let file = try? AVAudioFile(forReading: url!) else {
        return samples
      }

      let audioFormat = file.processingFormat
      let audioFrameCount = UInt32(file.length)
      guard let buffer = AVAudioPCMBuffer(pcmFormat: audioFormat, frameCapacity: audioFrameCount)
      else {
        return samples
      }

      try file.read(into: buffer)

      let bufferData = UnsafeBufferPointer(
        start: buffer.floatChannelData![0], count: Int(buffer.frameLength))

      var index = 0
      let dataCount = bufferData.count
      let itemCountPerSample = dataCount / sampleCount

      while index < dataCount {
        let start = min(index, dataCount - 1)
        let end = min(index + itemCountPerSample, dataCount - 1)
        let slicedArray = Array(bufferData[start..<end])
        let rms = vDSP.rootMeanSquare(slicedArray)

        samples.append(rms)

        index += itemCountPerSample
      }

      return samples

    } catch {
      return samples
    }
  }

}
