require 'json'

root = File.join(__dir__, '..', '..')
package = JSON.parse(File.read(File.join(root, 'package.json')))
podspec_root = File.dirname(__FILE__)

Pod::Spec.new do |s|
  s.name           = 'KeetLogging'
  s.summary        = "os_log based logging"
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

  s.source_files = "KeetLoggingExt.swift", "KeetLogging.{h,m}"
  s.preserve_paths = "*.h"
end
