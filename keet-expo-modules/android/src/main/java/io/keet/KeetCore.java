package io.keet;

import android.util.Log;

import androidx.annotation.OptIn;

import com.facebook.react.common.annotations.FrameworkAPI;
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl;

import java.util.concurrent.atomic.AtomicBoolean;

public final class KeetCore {
  static {
    try {
      System.loadLibrary("keet_core_native");
    } catch (Exception ignored) {
    }
  }

  private static final AtomicBoolean isInited = new AtomicBoolean(false);

  private static final AtomicBoolean uiIsVisible = new AtomicBoolean(false);

  private static final AtomicBoolean canRunPushHandler = new AtomicBoolean(true);
  static void setCanRunPushHandler() {
    canRunPushHandler.set(!uiIsVisible.get());
  }

  /** @noinspection JavaJniMissingFunction*/
  private static native void init(
    String homeDir,
    String tmpDir,
    String bundlePath,
    String appId);
  public static void maybeInit(
    String homeDir,
    String tmpDir,
    String bundlePath,
    String appId) {
    if (!isInited.get()) {
      init(homeDir, tmpDir, bundlePath, appId);
      isInited.set(true);
    }
  }

  /** @noinspection JavaJniMissingFunction*/
  private static native void suspend();
  public static void maybeSuspend() {
    uiIsVisible.set(false);
    canRunPushHandler.set(false);

    if (!isInited.get()) {
      return;
    }
    suspend();
  }

  /** @noinspection JavaJniMissingFunction*/
  private static native void resume();
  public static void maybeResume() {
    uiIsVisible.set(true);
    canRunPushHandler.set(false);

    if (!isInited.get()) {
      return;
    }
    resume();
  }

  /** @noinspection JavaJniMissingFunction*/
  private static native void receivePush(
    String payload,
    String homeDir,
    String bundlePath,
    KeetPushHandler handler);
  public static void maybeRunPushHandler(
    String payload,
    String homeDir,
    String bundlePath,
    KeetPushHandler handler) {
    if (uiIsVisible.get() || !canRunPushHandler.get()) {
      Log.d("KeetCoreNative", "won't run push handler");
      return;
    }
    receivePush(payload, homeDir, bundlePath, handler);
  }

  /** @noinspection JavaJniMissingFunction*/
  public static native void ensureKeetCoreBundleFiles(
    Object assetManager,
    String mainIn,
    String mainOut,
    String pushIn,
    String pushOut);

  /** @noinspection JavaJniMissingFunction*/
  @OptIn(markerClass = FrameworkAPI.class)
  public static native void installJSI(
    long jsi,
    CallInvokerHolderImpl callInvoker,
    KeetBackgroundReadyHandler bgReadyHandler,
    KeetPushHandler pushHandler);
}
