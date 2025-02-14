package io.keet

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Log
import android.webkit.URLUtil
import android.widget.ImageView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.URL
import java.net.URLDecoder

class FileReadOptions : Record {
  @Field
  var url: URL? = null

  @Field
  var cacheKey: String? = null
}


private const val FETCH_META_TIMEOUT = 15000L

@SuppressLint("ViewConstructor")
class KeetVideoThumbnailView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {
  internal var source: FileReadOptions? = null
  internal val keetVideoThumbnailScope = CoroutineScope(Dispatchers.IO)

  private val bitmapChannel = Channel<Bitmap>()
  private val durationChannel = Channel<Long>()

  private val onError by EventDispatcher()
  private val onDurationRetrieved by EventDispatcher<Map<String, Long>>()
  private val onLoad by EventDispatcher<Map<String, Int>>()

  internal val image = ImageView(context).also {
    it.layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )
    it.scaleType = ImageView.ScaleType.CENTER_CROP

    addView(it)


    keetVideoThumbnailScope.launch {
      for (bitmap in bitmapChannel) {
        val bitmapHeight = bitmap.height
        val bitmapWidth = bitmap.width
        onLoad(mapOf("height" to bitmapHeight, "width" to bitmapWidth))
        it.setImageBitmap(bitmap)
      }
    }

    keetVideoThumbnailScope.launch {
      for (duration in durationChannel) {
        onDurationRetrieved(mapOf("videoDuration" to duration))
      }
    }
  }

  private fun saveBitmapLocally(bitmap: Bitmap?, cacheKey: String): File? {
    if (bitmap == null) return null
    val cacheDir = context.cacheDir
    val directory = File(cacheDir, URLDecoder.decode(cacheKey, "UTF-8"))

    if (!directory.exists()) {
      directory.mkdirs()
    }

    try {
      val thumbnailFile = File(directory, "$cacheKey.jpg")
      FileOutputStream(thumbnailFile).use { out ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 50, out)
      }
      return thumbnailFile
    } catch (e: Exception) {
      e.printStackTrace()
    }

    return null
  }

  private fun fetchVideoThumbnailAndDuration(videoUrl: String): Pair<Bitmap, Long> {
    val retriever = MediaMetadataRetriever()

    if (URLUtil.isFileUrl(videoUrl)) {
      retriever.setDataSource(Uri.decode(videoUrl).replace("file://", ""))
    } else if (URLUtil.isContentUrl(videoUrl)) {
      val fileUri = Uri.parse(videoUrl)
      val fileDescriptor = context.contentResolver.openFileDescriptor(fileUri, "r")!!.fileDescriptor
      FileInputStream(fileDescriptor).use { inputStream ->
        retriever.setDataSource(inputStream.fd)
      }
    } else {
      retriever.setDataSource(videoUrl, HashMap())
    }
    Log.d(TAG, "Video asset was downloaded (videoUrl: $videoUrl)")

    val durationMs: Long =
      retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0
    val durationS: Long = durationMs.floorDiv(1000)
    val bitmap = retriever.getFrameAtTime(0, MediaMetadataRetriever.OPTION_CLOSEST_SYNC)!!

    retriever.release()

    return Pair(bitmap, durationS)
  }

  private fun saveVideoDetailsToCache(bitmap: Bitmap, durationS: Long, cacheKey: String) {
    val thumbnailFile = saveBitmapLocally(bitmap, cacheKey)
    val thumbnailFileUrl = thumbnailFile?.path

    if (thumbnailFile !== null && thumbnailFileUrl !== null) {
      KeetApplication.videosCache[cacheKey] = Pair(thumbnailFileUrl, durationS)
      Log.d(TAG, "Thumbnail and duration were successfully saved to cache (cacheKey: $cacheKey)")
    }
  }

  private fun restoreVideoThumbnailFromCache(cacheKey: String): Pair<Bitmap?, Long?> {
    val cachedThumbnailData = KeetApplication.videosCache[cacheKey] ?: return Pair(null, null)

    val (cachedThumbnailURL, cachedVideoDuration) = cachedThumbnailData

    return Pair(BitmapFactory.decodeFile(cachedThumbnailURL), cachedVideoDuration)
  }

  private fun handleError(e: Exception, callback: (() -> Unit)? = null) {
    val errorMsg = e.message ?: "Could not generate thumbnail"
    Log.e(ERROR_TAG, "fetchVideoThumbnailAndCache: $errorMsg")
    e.printStackTrace()
    onError(mapOf("error" to errorMsg))
    callback?.invoke()
    keetVideoThumbnailScope.cancel()
  }
  
  @SuppressLint("SuspiciousIndentation")
  private fun fetchVideoThumbnailAndCache(videoUrl: String, cacheKey: String) =
    keetVideoThumbnailScope.launch {
      val thumbnailJob = async {
        try {
          withTimeout(FETCH_META_TIMEOUT) {
            fetchVideoThumbnailAndDuration(videoUrl)
          }
        } catch (e: Exception) {
          handleError(e)
          null
        }
      }

      try {
        Log.d(TAG, "Getting cached thumbnail cacheKey: $cacheKey")
        val (cachedBitmap, cachedDuration) = restoreVideoThumbnailFromCache(cacheKey)

        if (cachedDuration != null) {
          durationChannel.send(cachedDuration)
        }
        if (cachedBitmap != null) {
          bitmapChannel.send(cachedBitmap)

          return@launch
        }

        Log.d(TAG, "Cached thumbnail is not found (cacheKey: $cacheKey)")
        withTimeout(FETCH_META_TIMEOUT) {
          Log.d(TAG, "Start asset download (cacheKey: $videoUrl)")
          val (thumbnailBitmap, durationS) = thumbnailJob.await() ?: return@withTimeout
          Log.d(TAG, "Thumbnail and duration were successfully retrieved (cacheKey: $cacheKey)")
          saveVideoDetailsToCache(thumbnailBitmap, durationS, cacheKey)
          bitmapChannel.send(thumbnailBitmap)
          durationChannel.send(durationS)
        }
      } catch (e: Exception) {
        handleError(e) { thumbnailJob.cancel() }
        keetVideoThumbnailScope.cancel()
      }
    }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)

    val cacheKey = source?.cacheKey
    val url = source?.url
    if (url === null || cacheKey == null) {
      return
    }

    fetchVideoThumbnailAndCache(url.toString(), cacheKey)
  }

  companion object {
    private const val TAG = "KeetVideoThumbnailView"
    private const val ERROR_TAG = "K_VIDEO_THUMBNAIL"
  }
}
