package io.keet

import com.facebook.react.bridge.CatalystInstanceImpl
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.annotations.FrameworkAPI
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

@Suppress("unused")
class KeetCoreModule: Module()  {
  private val bgReadyHandler = object : KeetBackgroundReadyHandler() {
    override fun onBackgroundReady() {
      KeetCore.setCanRunPushHandler()
    }
  }

  private val pushHandler = object : KeetPushHandler() {}

  @OptIn(FrameworkAPI::class)
  override fun definition() = ModuleDefinition {
    Name("KeetCoreModule")

    Function("installKeetCoreNative") {
      val reactContext = appContext.reactContext as ReactApplicationContext
      val catalyst = reactContext.catalystInstance as CatalystInstanceImpl
      appContext.reactContext!!.applicationContext.also { pushHandler.context = it }
      val holderImpl = catalyst.jsCallInvokerHolder as CallInvokerHolderImpl
      KeetCore.maybeInit(
        reactContext.filesDir.absolutePath,
        reactContext.cacheDir.absolutePath,
        reactContext.getMainBundlePath(),
        reactContext.packageName)

      KeetCore.installJSI(
        reactContext.javaScriptContextHolder!!.get(),
        holderImpl,
        bgReadyHandler,
        pushHandler)

    }
  }
}
