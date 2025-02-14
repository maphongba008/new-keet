package io.keet

import android.util.Log
import expo.modules.core.errors.ModuleDestroyedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import expo.modules.kotlin.Promise
import kotlinx.coroutines.Dispatchers

import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.File


class KeetVideoThumbnailModule : Module() {
  private var keetVideoThumbnailScope: CoroutineScope? = null

  override fun definition() = ModuleDefinition {
    Name("KeetVideoThumbnailModule")

    View(KeetVideoThumbnailView::class) {
      Events("onDurationRetrieved", "onLoad", "onError")

      Prop("source") { view: KeetVideoThumbnailView, source: FileReadOptions? ->
        keetVideoThumbnailScope = view.keetVideoThumbnailScope
        if (view.source != source) {
          view.source = source
        }
      }
    }

    AsyncFunction("clearCache") { maybeClearKey: String?, promise: Promise ->
      removeImageCache(promise, maybeClearKey)
    }

    OnDestroy {
      try {
        keetVideoThumbnailScope?.cancel(ModuleDestroyedException())
      } catch (e: IllegalStateException) {
        Log.e(TAG, "The scope does not have a job in it")
      }
    }
  }

  private fun removeImageCache(promise: Promise, cacheKey: String?) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        if (cacheKey == null) {
          KeetApplication.videosCache.forEach { (filePath) ->
            removeImageFile(filePath)
          }
          KeetApplication.videosCache.clear()
          promise.resolve(true)
          return@launch
        }
        val cachedDetails = KeetApplication.videosCache[cacheKey]
        var result = false

        if (cachedDetails == null) {
          promise.resolve(result)
          return@launch
        }
        val (filePath) = cachedDetails

        result = removeImageFile(filePath, cacheKey)

        promise.resolve(result)
        return@launch
      } catch (e: Exception) {
        e.printStackTrace()
        promise.resolve(false)
        return@launch
      }
    }
  }

  private fun removeImageFile(filePath: String, cacheKey: String? = null): Boolean {
    KeetApplication.videosCache.remove(cacheKey)
    val file = File(filePath)
    var result = false

    if (file.exists()) {
      result = file.delete()
    }

    return result
  }

  companion object {
    private const val TAG = "KeetVideoThumbnailModule"
    private const val ERROR_TAG = "K_VIDEO_THUMBNAIL"
  }
}
