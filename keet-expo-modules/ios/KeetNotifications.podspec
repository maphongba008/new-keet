require 'json'

root = File.join(__dir__, '..', '..')
package = JSON.parse(File.read(File.join(root, 'package.json')))
podspec_root = File.dirname(__FILE__)

Pod::Spec.new do |s|
  s.name           = 'KeetNotifications'
  s.summary        = "Notifications for Keet"
  s.version        = package['version']
  s.homepage       = "https://github.com/holepunchto/keet-mobile"
  s.license        = "Apache-2.0"
  s.authors        = "Holepunch"
  s.platform       = :ios, '14.0'
  s.swift_version  = '5.4'
  s.source       = { :git => "https://github.com/holepunchto/keet-mobile.git", :tag => "#{s.version}" }
  s.pod_target_xcconfig = {
    'USE_HEADERMAP' => 'YES',
    'DEFINES_MODULE' => 'YES',
  }
  # s.user_target_xcconfig = {
  #   "HEADER_SEARCH_PATHS" => "\"${PODS_CONFIGURATION_BUILD_DIR}/KeetNotifications/Swift Compatibility Header\"",
  # }

  s.dependency "KeetLogging"
  s.dependency "KeetUserDefaults"

  s.source_files = "KeetNotifications*.{swift,h,m,mm}"
end
