import os.log

extension OSLog {
  private static var subsystem = "io.keet"

  public static let Keet = OSLog(subsystem: subsystem, category: "javascript")
}
