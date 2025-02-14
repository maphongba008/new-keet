package io.keet

import android.app.Application
import java.util.concurrent.ConcurrentHashMap

typealias KeetVideoCache = Pair<String, Long>
open class KeetApplication : Application() {
  companion object {
    var videosCache: ConcurrentHashMap<String, KeetVideoCache> = ConcurrentHashMap()
  }

  override fun onCreate() {
    super.onCreate()

    ensureKeetCoreBundleFiles()
  }
}
