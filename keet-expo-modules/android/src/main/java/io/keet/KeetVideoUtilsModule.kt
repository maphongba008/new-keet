package io.keet

import android.media.MediaMetadataRetriever
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.FileInputStream

class KeetVideoUtilsModule: Module() {
  override fun definition() = ModuleDefinition {
    Name("KeetVideoUtilsModule")

    AsyncFunction("getSize") { videoUri: String, promise: Promise ->
      println(videoUri)
      CoroutineScope(Dispatchers.IO).launch {
        promise.resolve(getVideoDimensions(videoUri))
      }
    }
  }

  private suspend fun getVideoDimensions(videoUrl: String): Map<String, Int>? {
    return withContext(Dispatchers.IO) {
      try {
        val retriever = MediaMetadataRetriever()

        if (videoUrl.startsWith("file://") || videoUrl.startsWith("/")) {
          val inputStream = FileInputStream(videoUrl.replace("file://", ""));
          retriever.setDataSource(inputStream.fd)
        } else {
          retriever.setDataSource(videoUrl)
        }

        val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toInt()
        val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toInt()
        retriever.release()

        if (width != null && height != null) {
          mapOf(
            "width" to width,
            "height" to height,
          )
        } else {
          null
        }
      } catch (e: Exception) {
        e.printStackTrace()
        null
      }
    }
  }
}
