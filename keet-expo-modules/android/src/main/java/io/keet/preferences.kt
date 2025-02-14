package io.keet

import android.content.Context
import android.content.SharedPreferences

fun Context.getKeetSharedPreferences(): SharedPreferences =
    getSharedPreferences("keet-expo-modules", Context.MODE_PRIVATE)
