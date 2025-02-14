package io.keet

import android.content.Context

private const val MAIN_BUNDLE = "main.bundle"
private const val PUSH_BUNDLE = "push.bundle"

fun Context.getMainBundlePath() = "${filesDir.absolutePath}/$MAIN_BUNDLE"

fun Context.getPushBundlePath() = "${filesDir.absolutePath}/$PUSH_BUNDLE"

fun Context.ensureKeetCoreBundleFiles() {
  KeetCore.ensureKeetCoreBundleFiles(
    assets,
    MAIN_BUNDLE,
    getMainBundlePath(),
    PUSH_BUNDLE,
    getPushBundlePath())
}
