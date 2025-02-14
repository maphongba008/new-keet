require 'json'

root = File.join(__dir__, '..', '..')
package = JSON.parse(File.read(File.join(root, 'package.json')))
podspec_root = File.dirname(__FILE__)

Pod::Spec.new do |s|
  s.name           = 'KeetExpoModules'
  s.summary        = "Local Expo modules for Keet"
  s.version        = package['version']
  s.homepage       = "https://github.com/holepunchto/keet-mobile"
  s.license        = "Apache-2.0"
  s.authors        = "Holepunch"
  s.platform       = :ios, '14.0'
  s.swift_version  = '5.4'
  s.source       = { :git => "https://github.com/holepunchto/keet-mobile.git", :tag => "#{s.version}" }

  s.pod_target_xcconfig = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "HEADER_SEARCH_PATHS" => "#{podspec_root}/../cpp",
  }

  s.dependency 'KeetCore'

  s.dependency 'React-Core'
  s.dependency 'ReactCommon/turbomodule/core'
  s.dependency 'ExpoModulesCore'

  s.dependency 'FirebaseCore'
  s.dependency 'FirebaseMessaging'
  s.dependency 'GoogleUtilities'

  s.dependency 'KeetLogging'
  s.dependency 'KeetUserDefaults'
  s.dependency 'KeetNotifications'

  s.source_files = "KeetCore.{h,mm}", "KeetCoreModule.swift", "KeetExpoPushModule.swift", "KeetReceiveContentModule.swift", "KeetWaveformModule.swift", "KeetVideoThumbnailModule.swift", "KeetVideoThumbnail.swift", "KeetVideoUtilsModule.swift"
  s.preserve_paths = "*.h"
end
