package io.keet

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.os.bundleOf
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.io.File
import java.net.URI


class KeetDownloadsModule : Module() {
    companion object {
      const val DOWNLOAD_PROGRESS = "onDownloadProgress"
      const val DOWNLOAD_DIR = "Keet"
      const val PROGRESS_UPDATE_TIMEOUT: Long = 500
      val DOWNLOAD_STATUS = bundleOf(
        "PENDING" to DownloadManager.STATUS_PENDING,
        "RUNNING" to DownloadManager.STATUS_RUNNING,
        "PAUSED" to DownloadManager.STATUS_PAUSED,
        "SUCCESSFUL" to DownloadManager.STATUS_SUCCESSFUL,
        "STATUS_FAILED" to DownloadManager.STATUS_FAILED,
      )
    }

    private val downloadManager: DownloadManager?
      get() = appContext.reactContext?.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

    private val downloadCoroutine = CoroutineScope(Dispatchers.IO)


    override fun definition() = ModuleDefinition {
        Name("KeetDownloadsModule")
        Events(DOWNLOAD_PROGRESS)

        Constants(
          "DOWNLOAD_PROGRESS_LISTENER_KEY" to DOWNLOAD_PROGRESS,
          "DOWNLOAD_STATUS" to DOWNLOAD_STATUS
        )

        AsyncFunction("addAssetAndroid") { uri: String, video: Boolean, promise: Promise ->
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                promise.resolve(false)
                return@AsyncFunction
            }
            val resolver = appContext.reactContext?.contentResolver
            if (resolver == null) {
                promise.reject(CodedException("No Context"))
                return@AsyncFunction
            }
            val file = File(URI.create(uri).path)
            val mime = resolver.getType(Uri.fromFile(file))
            val name = Uri.parse(uri).lastPathSegment
            val values = ContentValues()
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, name)
            values.put(MediaStore.MediaColumns.MIME_TYPE, mime)
            values.put(
                MediaStore.MediaColumns.RELATIVE_PATH,
                 "${
                     if (video) Environment.DIRECTORY_MOVIES
                     else Environment.DIRECTORY_PICTURES
                 }/Keet")
            values.put(MediaStore.MediaColumns.IS_PENDING, 1)

            val out = resolver.insert(
                if (video) MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                else MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                values)
            if (out == null) {
                promise.reject(CodedException("Failed to create asset"))
                return@AsyncFunction
            }
            val stream = resolver.openOutputStream(out)
            if (stream == null) {
                promise.reject(CodedException("Failed to create output stream"))
                return@AsyncFunction
            }
            val inp = file.inputStream()
            val buf = ByteArray(1024)
            var read = inp.read(buf)
            while (read > 0) {
                stream.write(buf)
                read = inp.read(buf)
            }
            stream.flush()
            stream.close()
            inp.close()
            values.clear()
            values.put(MediaStore.MediaColumns.IS_PENDING, 0)
            resolver.update(out, values, null, null)

            promise.resolve(true)
            return@AsyncFunction
        }


        AsyncFunction("download") { uri: String, promise: Promise ->
          CoroutineScope(Dispatchers.IO).launch {
            val context = appContext.reactContext
              ?: return@launch promise.reject(
                "KeetDownloadsModuleError",
                "React context is not available",
                Error()
              )

            val requestUri = Uri.parse(uri)
            val fileName = getFileNameFromUri(requestUri)
            val request = DownloadManager.Request(requestUri)
            request.setDescription("Downloading file...")
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            request.setDestinationInExternalPublicDir(
              Environment.DIRECTORY_DOWNLOADS,
              "$DOWNLOAD_DIR${File.separator}$fileName"
            )

            val manager = downloadManager
              ?: return@launch promise.reject(
                "KeetDownloadsModuleError",
                "Download manager is not available",
                Error()
              )

            val downloadId = manager.enqueue(request)
            val downloadReceiver = object : BroadcastReceiver() {
              override fun onReceive(broadcastContext: Context?, intent: Intent?) {
                val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)

                if (id == downloadId) {
                  println("KeetDownloadsModule::download is completed $fileName")
                  downloadCoroutine.cancel()
                  onProgressStatus(downloadId, 100, DownloadManager.STATUS_SUCCESSFUL)
                }
              }
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
              context.registerReceiver(
                downloadReceiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                Context.RECEIVER_EXPORTED
              )
            } else {
              context.registerReceiver(
                downloadReceiver,
                IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                Context.RECEIVER_EXPORTED
              )
            }
            handleDownloadProgress(downloadId)
            promise.resolve(downloadId)
          }.start()
        }

        AsyncFunction("openDownload") { downloadId: Long, promise: Promise ->
          val context = appContext.reactContext
            ?: return@AsyncFunction promise.reject(
              "KeetDownloadsModuleError",
              "React context is not available",
              Error()
            )

          val fileIntent = Intent(Intent.ACTION_VIEW)
          val uri: Uri = downloadManager!!.getUriForDownloadedFile(downloadId)
          val mime: String? =
            downloadManager?.getMimeTypeForDownloadedFile(downloadId) ?: "*/*"
          println("KeetDownloadsModule::try to open file (${uri.path}) with mime type = $mime ")
          fileIntent.setDataAndType(uri, mime)
          fileIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
          val chooserIntent = Intent.createChooser(fileIntent, "Open File...");
          chooserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          chooserIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
          context.startActivity(chooserIntent);
        }

        AsyncFunction("cancelDownload") { downloadId: Long, promise: Promise ->
          if (downloadManager == null) {
            println("KeetDownloadsModule::downloadManager is not available")
            return@AsyncFunction promise.resolve(false)
          }

          val removedDownloads = downloadManager!!.remove(downloadId)

          println("KeetDownloadsModule::removed downloads => $removedDownloads")
          promise.resolve(true)
        }

    }

    private fun onProgressStatus(downloadId: Long, progress: Int, status: Int) {
      println("KeetDownloadsModule::progress = $progress ; status = $status")
      this@KeetDownloadsModule.sendEvent(
        DOWNLOAD_PROGRESS,
        bundleOf(
          "progress" to progress,
          "downloadId" to downloadId,
          "status" to status
        )
      )
    }
    private suspend fun delayProgressUpdate() {
      return delay(PROGRESS_UPDATE_TIMEOUT)
    }
    private fun handleDownloadProgress(downloadId: Long) {
      downloadCoroutine.launch {
        var lastProgress = 0
        var status = DownloadManager.STATUS_PENDING
        onProgressStatus(downloadId, lastProgress, status)

        while ((status == DownloadManager.STATUS_PENDING || status == DownloadManager.STATUS_RUNNING) && downloadCoroutine.isActive) {
          val query = DownloadManager.Query().setFilterById(downloadId)
          val cursor = downloadManager?.query(query)

          if (cursor?.moveToFirst() != true) {
            cursor?.close()
            delayProgressUpdate()
            continue
          }
          val bytesDownloadedIndex = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR)
          val bytesDownloaded = cursor.getInt(bytesDownloadedIndex)

          val bytesTotalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES)
          val bytesTotal = cursor.getInt(bytesTotalIndex)

          val columnStatus = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS)
          status = cursor.getInt(columnStatus)

          if (bytesTotal <= 0) {
            cursor.close()
            delayProgressUpdate()
            continue
          }

          var progress = ((bytesDownloaded * 100L) / bytesTotal).toInt()
          if (progress == 0 || bytesDownloaded > 0) {
            progress += 1
          }
          if (progress > lastProgress) {
            lastProgress = progress

            onProgressStatus(downloadId, progress, status)
          }
          cursor.close()
          delayProgressUpdate()
        }
      }.start()
    }

    private fun getFileNameFromUri(uri: Uri): String {
      var fileName = uri.path ?: ""
      val cut = fileName.lastIndexOf('/')
      if (cut != -1) {
        fileName = fileName.substring(cut!! + 1)
      }

      return fileName
    }
}
