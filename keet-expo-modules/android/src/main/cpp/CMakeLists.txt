cmake_minimum_required(VERSION 3.25)

set(PACKAGE_NAME "keet_core_native")
project(${PACKAGE_NAME})

add_library(${PACKAGE_NAME} SHARED
        KeetCore.cpp)

# includes

include_directories(
        "${ROOT_DIR}/cpp"
        "${ROOT_DIR}/keet-expo-modules/cpp"
        "${KEET_CORE}/include"
        "${ROOT_DIR}/node_modules/react-native/ReactAndroid/src/main/jni/react/turbomodule"
        "${ROOT_DIR}/node_modules/react-native/ReactAndroid/src/main/jni/react/jni"
        "${ROOT_DIR}/node_modules/react-native/ReactCommon"
        "${ROOT_DIR}/node_modules/react-native/ReactCommon/jsi"
        "${ROOT_DIR}/node_modules/react-native/ReactCommon/callinvoker"
        "${ROOT_DIR}/node_modules/react-native/ReactCommon/runtimeexecutor"
        "${ROOT_DIR}/node_modules/react-native/ReactCommon/react/nativemodule/core")

target_include_directories(
        ${PACKAGE_NAME}
        PRIVATE
        ./)

# libs

add_library(v8 STATIC IMPORTED)
set_target_properties(
        v8
        PROPERTIES IMPORTED_LOCATION
        "${KEET_CORE}/android/${ANDROID_ABI}/libv8.a")

add_library(c++ STATIC IMPORTED)
set_target_properties(
        c++
        PROPERTIES IMPORTED_LOCATION
        "${KEET_CORE}/android/${ANDROID_ABI}/misc/libc++.a")

add_library(js STATIC IMPORTED)
set_target_properties(
        js
        PROPERTIES IMPORTED_LOCATION
        "${KEET_CORE}/android/${ANDROID_ABI}/libjs.a")

add_library(bare STATIC IMPORTED)
set_target_properties(
        bare
        PROPERTIES IMPORTED_LOCATION
        "${KEET_CORE}/android/${ANDROID_ABI}/libbare.a")

add_library(keet-core STATIC IMPORTED)
set_target_properties(
        keet-core
        PROPERTIES IMPORTED_LOCATION
        "${KEET_CORE}/android/${ANDROID_ABI}/libkeet_core.a")

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)
find_library(log-lib log)

# linking

target_link_libraries(${PACKAGE_NAME}
        ${log-lib}
        fbjni::fbjni
        ReactAndroid::jsi
        ReactAndroid::reactnative
        v8
        c++
        js
        $<LINK_LIBRARY:WHOLE_ARCHIVE,bare>
        $<LINK_LIBRARY:WHOLE_ARCHIVE,keet-core>
        android)
