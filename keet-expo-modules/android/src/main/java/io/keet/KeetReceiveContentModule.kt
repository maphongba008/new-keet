package io.keet

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import android.widget.Toast

const val MAX_SHARE_COUNT = 10

class KeetReceiveContentModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KeetReceiveContentModule")

    Function("resetShareContent") {
      shareContent.clear()
      val context = appContext.reactContext
      if (context != null) {
        getSharedDir(context).delete()
      }
      return@Function null
    }

    Function("getShareContent") {
      if (shareContent.isNullOrEmpty()) {
        return@Function null
      } else {
        return@Function shareContent
      }
    }
  }

  companion object {
    val shareContent: MutableList<Bundle?> = mutableListOf()

    fun ClipData.toUriList(): MutableList<Uri> {
      val length = itemCount
      val result = mutableListOf<Uri>()
      for (i in 0 until length) {
        try {
          result.add(getItemAt(i).uri)
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
      return result
    }

    @SuppressLint("NewApi")
    fun handleIntent(context: Context, intent: Intent) {
      try {
        val intentType = intent.type ?: return

        if (intentType == "text/plain") {
          val sharedText: String? = intent.getStringExtra(Intent.EXTRA_TEXT) ?: return

          shareContent.add(bundleOf("mimeType" to intentType, "text" to sharedText))
          return
        }

        val clipList = intent.clipData?.let { clipData ->
          return@let clipData.toUriList()
        }
        clipList?.forEachIndexed { index, uri  ->
          if (uri is Uri) {
            if (index >= MAX_SHARE_COUNT) {
              shareContent.add(bundleOf("maxShareSize" to true))
              return
            }
            val mimeType = context.contentResolver.getType(uri) ?: intentType
            if (mimeType.startsWith("image/")) {
              val mediaInfo = getImageInfoFromContentUri(context!!, uri)
              shareContent.add(bundleOf("mimeType" to mimeType, "media" to mediaInfo))
            } else if (mimeType.startsWith("video/")) {
              val mediaInfo = getVideoInfoFromContentUri(context!!, uri)
              shareContent.add(bundleOf("mimeType" to mimeType, "media" to mediaInfo))
            } else {
              val mediaInfo = getFileInfoFromContentUri(context!!, uri)
              shareContent.add(bundleOf("mimeType" to mimeType, "media" to mediaInfo))
            }
          }
        }
      } catch (e: Exception) {
        e.printStackTrace()
      }
    }

    private fun getImageInfoFromContentUri(context: Context, contentUri: Uri): Bundle? {
      var inputStream: InputStream? = null
      try {
        val contentResolver: ContentResolver = context.contentResolver
        inputStream = contentResolver.openInputStream(contentUri)
        val byteLength = inputStream?.available()?.toLong()
        val byteArray = inputStream!!.readBytes()
        val bitmap = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.size)

        val width = bitmap.width
        val height = bitmap.height
        val name = getFileNameFromMediaStore(contentResolver, contentUri) ?: "cache_file"
        val fileUri = convertContentByteArrayToFileCacheUri(context, byteArray, name)!!.path

        return bundleOf(
          "uri" to fileUri,
          "name" to name,
          "width" to width,
          "height" to height,
          "byteLength" to byteLength
        )
      } catch (e: Exception) {
        e.printStackTrace()
      } finally {
        inputStream?.close()
      }
      return null
    }

    private fun getVideoInfoFromContentUri(context: Context, contentUri: Uri): Bundle? {
      var mediaInfo: Bundle? = null
      try {
        val contentResolver: ContentResolver = context.contentResolver
        val name = getFileNameFromMediaStore(contentResolver, contentUri) ?: "cache_file"
        val fileUri = convertContentUriToFileCacheUri(context, contentUri, name)
        mediaInfo = getVideoMeta(context, contentUri)
        val byteLength: Long = getFileSize(contentResolver, contentUri)
        mediaInfo.putAll(bundleOf("uri" to fileUri, "name" to name, "byteLength" to byteLength))
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return mediaInfo
    }

    private fun getFileInfoFromContentUri(context: Context, contentUri: Uri): Bundle? {
      var mediaInfo: Bundle? = null
      try {
        val contentResolver: ContentResolver = context.contentResolver
        val name = getFileNameFromMediaStore(contentResolver, contentUri) ?: "cache_file"
        val fileUri = convertContentUriToFileCacheUri(context, contentUri, name)
        val byteLength: Long = getFileSize(contentResolver, contentUri)
        mediaInfo = bundleOf("uri" to fileUri, "name" to name, "byteLength" to byteLength)
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return mediaInfo
    }


    // ToDo: Used the code from internet. Need to test for better alternative
    private fun getFileNameFromMediaStore(
      contentResolver: ContentResolver,
      imageUri: Uri
    ): String? {
      val projection = arrayOf(MediaStore.Images.Media.DISPLAY_NAME)
      val cursor: Cursor? = contentResolver.query(imageUri, projection, null, null, null)
      cursor?.use {
        if (it.moveToFirst()) {
          return it.getString(it.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME))
            .replace(" ", "_")
        }
      }
      return null
    }

    private const val SHARED_TAG = "shared"

    fun getSharedDir(context: Context): File {
      val cacheDir = File(context.cacheDir, SHARED_TAG)
      if (!cacheDir.exists()) {
        cacheDir.mkdirs()
      }

      return cacheDir
    }

    private fun convertContentByteArrayToFileCacheUri(
      context: Context,
      byteArray: ByteArray,
      name: String
    ): Uri? {
      try {
        val cacheDir = File(context.cacheDir, SHARED_TAG)
        if (!cacheDir.exists()) {
          cacheDir.mkdirs()
        }
        val cacheFile = File(cacheDir, name)

        val outputStream = FileOutputStream(cacheFile)
        outputStream.write(byteArray)
        outputStream.close()

        return Uri.fromFile(cacheFile)
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return null
    }

    private fun convertContentUriToFileCacheUri(
      context: Context,
      contentUri: Uri,
      name: String
    ): Uri? {
      try {
        val contentResolver: ContentResolver = context.contentResolver
        val inputStream: InputStream = contentResolver.openInputStream(contentUri) ?: return null
        return copyToCacheDir(context, inputStream, name)
      } catch (e: Exception) {
        e.printStackTrace()
      }
      return null
    }

    private fun copyToCacheDir(
      context: Context,
      inputStream: InputStream,
      name: String
    ): Uri? {
      val cacheDir = File(context.cacheDir, SHARED_TAG)
      if (!cacheDir.exists()) {
        cacheDir.mkdirs()
      }
      val cacheFile = File(cacheDir, name)
      val outputStream = FileOutputStream(cacheFile)

      try {
        val buffer = ByteArray(5 * 1024 * 1024) // 5MB buffer size
        var bytesRead: Int
        // Copy the content
        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
          outputStream.write(buffer, 0, bytesRead)
        }
        return  Uri.fromFile(cacheFile)
      } catch (e: Exception) {
        e.printStackTrace()
        return null
      } finally {
        inputStream.close()
        outputStream.close()
      }
    }

    private fun getFileSize(contentResolver: ContentResolver, uri: Uri): Long {
      var size: Long = 0
      val projection = arrayOf(MediaStore.Video.Media.SIZE)
      contentResolver.query(uri, projection, null, null, null)?.use { cursor ->
        val sizeColumnIndex = cursor.getColumnIndex(MediaStore.Video.Media.SIZE)
        if (cursor.moveToFirst()) {
          size = cursor.getLong(sizeColumnIndex)
        }
      }
      return size
    }


    private fun getVideoMeta(context: Context, videoUri: Uri): Bundle {
      var retriever = MediaMetadataRetriever()
      var meta = bundleOf()
      return try {
        retriever.setDataSource(context, videoUri)
        meta.putInt(
          "width",
          retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toInt() ?: 0
        )
        meta.putInt(
          "height",
          retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toInt() ?: 0
        )
        meta.putLong(
          "duration",
          retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
            ?.floorDiv(1000) ?: 0
        )
        meta
      } catch (e: Exception) {
        e.printStackTrace()
        meta
      } finally {
        retriever.release()
      }
    }
  }
}

