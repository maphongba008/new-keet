#include <fbjni/fbjni.h>
#include <jsi/jsi.h>
#include <ReactCommon/CallInvokerHolder.h>

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>

#include <unistd.h>
#include <ctime>
#include <cstdio>
#include <utility>

#include <keet-core.h>

#include "jsi_macros.h"

using namespace facebook;
using namespace facebook::react;

#define EL_LOG(M, block) {\
      KC_LOG(M " BEGIN")\
      std::clock_t start = std::clock();\
      block \
      KC_LOG(M " END %f", static_cast<double>(std::clock() - start) / static_cast<double>(CLOCKS_PER_SEC));}

using push_handler_result_t =
        void(std::string, std::string, std::string, std::string, std::string, std::string);

struct KeetPushHandler : jni::JavaClass<KeetPushHandler> {
    static constexpr auto kJavaDescriptor = "Lio/keet/KeetPushHandler;";

    void onResult(
            const std::string& room_key,
            const std::string& message_id,
            const std::string& type,
            const std::string& room_name,
            const std::string& profile_name,
            const std::string& text) {
      static const auto method =
              getClass()->getMethod<push_handler_result_t>("onResult");
      method(self(), room_key, message_id, type, room_name, profile_name, text);
    }
};

struct KeetBackgroundReadyHandler : jni::JavaClass<KeetBackgroundReadyHandler> {
    static constexpr auto kJavaDescriptor = "Lio/keet/KeetBackgroundReadyHandler;";

    void onBackgroundReady() {
      static const auto method =
              getClass()->getMethod<void(void)>("onBackgroundReady");
      method(self());
    }
};

class KeetCoreData {
public:
    KeetCoreData(jsi::Runtime* _jsiRuntime,
                 react::CallInvoker* _callInvoker,
                 jni::global_ref<KeetBackgroundReadyHandler::javaobject> _bgReadyHandler,
                 jni::global_ref<KeetPushHandler::javaobject> _pushHandler) :
            jsiRuntime(_jsiRuntime),
            callInvoker(_callInvoker),
            bgReadyHandler(_bgReadyHandler),
            pushHandler(_pushHandler) {}

    jsi::Runtime* jsiRuntime;
    react::CallInvoker* callInvoker;
    jni::global_ref<KeetBackgroundReadyHandler::javaobject> bgReadyHandler;
    jni::global_ref<KeetPushHandler::javaobject> pushHandler;
};

class PushData {
public:
    PushData(jni::global_ref<KeetPushHandler::javaobject> _pushHandler) :
    pushHandler(_pushHandler) {}
    jni::global_ref<KeetPushHandler::javaobject> pushHandler;
};

class KeetCoreJSI : public jsi::HostObject {
public:
    ~KeetCoreJSI() override {
      void* data = kc_get_data();
      if (data) {
        delete (KeetCoreData*)data;
      }
      kc_set_data(nullptr);
    }

    jsi::Value get(jsi::Runtime &rt, jsi::PropNameID const &name) override {
      auto propertyName = name.utf8(rt);

      JSI_HOSTOBJECT_METHOD("sync", 1, {
        JSI_ARGV_TYPEDARRAY(msg, 0);
        JSI_TYPEDARRAY_BYTELENGTH(msg);

        kc_sync_send(msg_data, msg_byteLength);

        return jsi::Value::undefined();
      });

      return jsi::Value::undefined();
    }
};

#define RUNTIME_KC "__kc"
#define RUNTIME_LOG_LISTENER RUNTIME_KC"_logListener"
#define RUNTIME_SYNC_LISTENER RUNTIME_KC"_syncListener"

static void on_log(const char* msg, void* data) {
  if (!data) {
    KC_LOG("%s", msg);
    return;
  }

  KeetCoreData* kcData = (KeetCoreData*)data;
  if (!kcData->callInvoker) {
    KC_LOG("%s", msg);
    return;
  }

  std::string std_msg = msg;
  kcData->callInvoker->invokeAsync([=]() {
      jsi::Runtime& rt = *kcData->jsiRuntime;
      if (!rt.global().hasProperty(rt, RUNTIME_LOG_LISTENER)) {
        return;
      }
      auto jsMessage = jsi::String::createFromUtf8(rt, std_msg);
      rt.global().getPropertyAsFunction(rt, RUNTIME_LOG_LISTENER).call(rt, jsMessage);
  });
}

static void on_sync_signal(void* data) {
  if (!data) {
    KC_LOG("on_sync_signal out (1)");
    return;
  }

  KeetCoreData* kcData = (KeetCoreData*)data;
  if (!kcData->callInvoker) {
    KC_LOG("on_sync_signal out (2)");
    return;
  }

  kcData->callInvoker->invokeAsync([]() {
      kc_sync_receive();
  });
}

static void on_sync(void* buf, size_t len, void* data) {
  if (!data) {
    KC_LOG("on_sync out (1)");
    return;
  }

  KeetCoreData* kcData = (KeetCoreData*)data;
  if (!kcData->callInvoker) {
    KC_LOG("on_sync_signal out (2)");
    return;
  }

  jsi::Runtime& rt = *kcData->jsiRuntime;
  if (!rt.global().hasProperty(rt, RUNTIME_SYNC_LISTENER)) {
    KC_LOG("on_sync out (3)");
    return;
  }

  JSI_MAKE_UINT8ARRAY(arr, buf, len);
  rt.global().getPropertyAsFunction(rt, RUNTIME_SYNC_LISTENER).call(rt, arr);
  free(buf);
}

static void on_background_ready(void* data) {
  if (!data) {
    KC_LOG("on_background_ready out (1)");
    return;
  }

  KeetCoreData* kcData = (KeetCoreData*)data;
  if (!kcData->bgReadyHandler) {
    KC_LOG("on_background_ready out (2)");
    return;
  }

  facebook::jni::Environment::ensureCurrentThreadIsAttached();
  kcData->bgReadyHandler->onBackgroundReady();
}

static void on_push(
        const char* room_key,
        const char* message_id,
        const char* type,
        const char* room_name,
        const char* profile_name,
        const char* text,
        void* data) {
  if (!data) {
    KC_LOG("on_push out (1)");
    return;
  }

  auto pushData = (PushData*)data;
  facebook::jni::Environment::ensureCurrentThreadIsAttached();
  pushData->pushHandler->onResult(
          room_key,
          message_id,
          type,
          room_name,
          profile_name,
          text);
  delete pushData;
}

static void on_push_app(
        const char* room_key,
        const char* message_id,
        const char* type,
        const char* room_name,
        const char* profile_name,
        const char* text,
        void* data) {
  if (!data) {
    KC_LOG("on_push out (1)");
    return;
  }

  auto kcData = (KeetCoreData*)data;
  facebook::jni::Environment::ensureCurrentThreadIsAttached();
  kcData->pushHandler->onResult(
          room_key,
          message_id,
          type,
          room_name,
          profile_name,
          text);
}

static double get_bg_time() {
  return 0.0;
}

struct KeetCore : jni::JavaClass<KeetCore> {
    static constexpr auto kJavaDescriptor = "Lio/keet/KeetCore;";

    static void registerNatives() {
      javaClassStatic()->registerNatives({
        makeNativeMethod("ensureKeetCoreBundleFiles", KeetCore::ensureKeetCoreBundleFiles),
        makeNativeMethod("init", KeetCore::init),
        makeNativeMethod("suspend", KeetCore::suspend),
        makeNativeMethod("resume", KeetCore::resume),
        makeNativeMethod("receivePush", KeetCore::receivePush),
        makeNativeMethod("installJSI", KeetCore::installJSI),
      });
    }

    static void writeFile(
      AAssetManager* manager,
      const char* in,
      const char* out) {

      auto asset = AAssetManager_open(
        manager, in, AASSET_MODE_BUFFER);
      auto buffer = AAsset_getBuffer(asset);
      auto len = AAsset_getLength(asset);
      FILE* file;
      file = fopen(out, "wb");
      fwrite(buffer, 1, len, file);
      AAsset_close(asset);
      fclose(file);
    }

    static void ensureKeetCoreBundleFiles(
      jni::alias_ref<jni::JClass>,
      jobject java_asset_manager,
      const std::string& main_in,
      const std::string& main_out,
      const std::string& push_in,
      const std::string& push_out) {

      auto env = jni::Environment::current();
      auto manager = AAssetManager_fromJava(
        env, java_asset_manager);

      EL_LOG("copy main bundle", {
        writeFile(manager, main_in.c_str(), main_out.c_str());
      });

      EL_LOG("copy push bundle", {
        writeFile(manager, push_in.c_str(), push_out.c_str());
      });
    }

    static void init(
            jni::alias_ref<jni::JClass>,
            const std::string& homeDir,
            const std::string& tmpDir,
            const std::string& bundlePath,
            const std::string& app_id) {
      EL_LOG("init bare and load bundle", {
        kc_init(on_background_ready,
                on_sync_signal,
                on_sync,
                on_log,
                on_push_app,
                get_bg_time,
                strdup(homeDir.c_str()),
                strdup(tmpDir.c_str()),
                strdup(bundlePath.c_str()),
                strdup(app_id.c_str())
        );
      });
    }

    static void suspend(jni::alias_ref<jni::JClass>) {
      kc_suspend();
    }

    static void resume(jni::alias_ref<jni::JClass>) {
      kc_resume();
    }

    static void receivePush(
            jni::alias_ref<jni::JClass>,
            const std::string& payload,
            const std::string& homeDir,
            const std::string& bundlePath,
            jni::alias_ref<KeetPushHandler::javaobject> j_pushHandler) {

      static std::once_flag once;
      std::call_once(once, [bundlePath]() {
          kc_push_init(bundlePath.c_str());
      });

      auto pushData = new PushData(jni::make_global(j_pushHandler));
      kc_push(payload.c_str(),
              homeDir.c_str(),
              on_push,
              pushData);
    }

    static void installJSI(
            jni::alias_ref<jni::JClass>,
            jlong jsi,
            jni::alias_ref<react::CallInvokerHolder::javaobject> j_callInvoker,
            jni::alias_ref<KeetBackgroundReadyHandler::javaobject> j_bgReadyHandler,
            jni::alias_ref<KeetPushHandler::javaobject> j_pushHandler) {
      KC_LOG("install jsi");

      auto kcData = new KeetCoreData(
              reinterpret_cast<jsi::Runtime*>(jsi),
              j_callInvoker->cthis()->getCallInvoker().get(),
              jni::make_global(j_bgReadyHandler),
              jni::make_global(j_pushHandler));
      void* data = kc_get_data();
      if (data) {
        delete (KeetCoreData*)data;
      }
      kc_set_data(kcData);

      jsi::Object hostObject = jsi::Object::createFromHostObject(
              *kcData->jsiRuntime,
              std::make_shared<KeetCoreJSI>());
      kcData->jsiRuntime->global().setProperty(*kcData->jsiRuntime, RUNTIME_KC, std::move(hostObject));
    }
};

jint JNI_OnLoad(JavaVM *vm, void *) {
  return jni::initialize(vm, [] {
      KeetCore::registerNatives();
  });
}
