package io.keet

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.Future
import linc.com.amplituda.Amplituda
import linc.com.amplituda.Compress

class KeetWaveformModule : Module() {
  private val executorService: ExecutorService
  private val mainHandler: Handler
  private val cacheLimit: Int
  private val waveformCache: LinkedHashMap<String, Array<Float>>
  private lateinit var amplituda: Amplituda

  override fun definition() = ModuleDefinition {
    Name("KeetWaveformModule")

    AsyncFunction("extractWaveform") { audioUri: String, promise: Promise ->
      return@AsyncFunction extractWaveformFromURI(audioUri, promise)
    }

    amplituda = Amplituda(context)
  }

  private val context
    get() = requireNotNull(appContext.reactContext)

  private fun extractWaveformFromURI(audioUri: String, promise: Promise) {
    if (waveformCache.containsKey(audioUri)) {
      promise.resolve(waveformCache[audioUri])
      return
    }

    val future: Future<*> =
            executorService.submit {
              try {
                lateinit var amplitudesData: List<Int>

                amplituda.processAudio(audioUri, Compress.withParams(Compress.AVERAGE, 1)).get({
                                result ->
                          amplitudesData = result.amplitudesAsList()
                        }) { exception -> promise.resolve(arrayOf<Float>()) }

                lateinit var normalizedData: Array<Float>
                if (amplitudesData.size < 100) {
                  normalizedData = multiplyAmplitudesData(amplitudesData)
                } else {
                  normalizedData = compressAmplitudesData(amplitudesData)
                }
                waveformCache[audioUri] = normalizedData
                promise.resolve(normalizedData)
              } catch (e: IOException) {
                e.printStackTrace()
                promise.resolve(arrayOf<Float>())
              }
            }

    mainHandler.postDelayed(
            {
              if (!future.isDone) {
                future.cancel(true)
                promise.resolve(arrayOf<Float>())
              }
            },
            60000
    )
  }

  init {
    executorService = Executors.newFixedThreadPool(3)
    mainHandler = Handler(Looper.getMainLooper())
    cacheLimit = 10
    waveformCache =
            object : LinkedHashMap<String, Array<Float>>(cacheLimit + 1, 0.75F, true) {
              override fun removeEldestEntry(eldest: Map.Entry<String, Array<Float>>): Boolean {
                return size > cacheLimit
              }
            }
  }

  private fun multiplyAmplitudesData(data: List<Int>): Array<Float> {
    val result = ArrayList<Float>()

    var currentIndex = 0
    val multiplier = 100 / data.size

    while (currentIndex < data.size) {
      for (i in 0 until multiplier) {
        result.add(data.elementAt(currentIndex).toFloat())
      }
      currentIndex++
    }

    return result.toTypedArray()
  }

  private fun compressAmplitudesData(data: List<Int>): Array<Float> {
    val result = ArrayList<Float>()

    var index = 0f
    val dataCount = data.size.toFloat()
    val itemCountPerSample = dataCount / 100f

    while (index < dataCount) {
      val start = Math.min(index, dataCount - 1).toInt()
      val end = Math.min(index + itemCountPerSample, dataCount - 1).toInt()
      val slicedArray = data.subList(start, end)
      val rms = rootMeanSquare(slicedArray)

      result.add(rms)

      index += itemCountPerSample
    }

    return result.toTypedArray()
  }

  private fun rootMeanSquare(list: List<Int>): Float {
    if (list.size == 0) {
      return 0f
    }

    var sum: Double = 0.0

    for (item in list) {
      val _item = item / 2000000f
      sum += _item * _item
    }

    val mean = sum / list.size.toDouble()

    return Math.sqrt(mean).toFloat()
  }
}
