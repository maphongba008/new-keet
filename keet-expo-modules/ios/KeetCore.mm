#import "KeetCore.h"

#import <UserNotifications/UserNotifications.h>

#import <React/RCTBridge.h>
#import <ReactCommon/RCTTurboModule.h>

#import "keet-core.h"
#import "KeetLogging.h"
#import "KeetUserDefaultsConstants.h"

#import "jsi_macros.h"

#define RUNTIME_KC "__kc"
#define RUNTIME_LOG_LISTENER RUNTIME_KC"_logListener"
#define RUNTIME_SYNC_LISTENER RUNTIME_KC"_syncListener"

@interface KeetCore ()

@property (nonatomic, assign) UIBackgroundTaskIdentifier bgTaskId;
@property (nonatomic, assign) BOOL inited;
@property (nonatomic, assign) BOOL visible;

-(void)maybeEndBgTask;

@end

@interface RCTBridge (KeetCore)

-(void*)runtime;

@end

typedef struct {
  jsi::Runtime* jsiRuntime;
  __weak RCTBridge* rnBridge;
} rn_data_t;

class KeetCoreJSI : public jsi::HostObject {
public:

  ~KeetCoreJSI() override {
    KC_LOG("runtime destroyed");
    void* data = kc_get_data();
    if (data) {
      free(data);
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

static void on_log(const char* msg, void* data) {
  if (!data) {
    KC_LOG("%s", msg);
    return;
  }

  rn_data_t* rn_data = (rn_data_t*)data;
  std::string std_msg = msg;
  rn_data->rnBridge.jsCallInvoker->invokeAsync([=]() {
    jsi::Runtime& rt = *rn_data->jsiRuntime;
    if (!rt.global().hasProperty(rt, RUNTIME_LOG_LISTENER)) {
      return;
    }
    auto jsMessage = jsi::String::createFromUtf8(rt, std_msg);
    rt.global().getPropertyAsFunction(rt, RUNTIME_LOG_LISTENER).call(rt, jsMessage);
  });
}

static void on_sync_signal(void* data) {
  if (!data) {
    KC_LOG("on_sync_signal out");
    return;
  }

  rn_data_t* rn_data = (rn_data_t*)data;
  rn_data->rnBridge.jsCallInvoker->invokeAsync([=]() {
    kc_sync_receive();
  });
}

static void on_sync(void* buf, size_t len, void* data) {
  if (!data) {
    KC_LOG("on_sync out (1)");
    return;
  }

  rn_data_t* rn_data = (rn_data_t*)data;
  jsi::Runtime& rt = *rn_data->jsiRuntime;
  if (!rt.global().hasProperty(rt, RUNTIME_SYNC_LISTENER)) {
    KC_LOG("on_sync out (2)");
    return;
  }

  JSI_MAKE_UINT8ARRAY(arr, buf, len);
  rt.global().getPropertyAsFunction(rt, RUNTIME_SYNC_LISTENER).call(rt, arr);
  free(buf);
}

static void on_background_ready(void*) {
  BOOL canRunPushHandler = !KeetCore.sharedInstance.visible;
  [KeetUserDefaultsConstants setCanRunPushHandler:canRunPushHandler];

  dispatch_async(dispatch_get_main_queue(), ^{
    [KeetCore.sharedInstance maybeEndBgTask];
  });
}

static void on_push(const char* room_key,
                    const char* message_id,
                    const char* type,
                    const char* room_name,
                    const char* profile_name,
                    const char* text,
                    void* data) {
  NSString* roomKey = [NSString stringWithUTF8String:room_key];
  NSString* messageId = [NSString stringWithUTF8String:message_id];
  NSString* messageType = [NSString stringWithUTF8String:type];
  NSString* profileName = [NSString stringWithUTF8String:profile_name];
  NSString* roomName = [NSString stringWithUTF8String:room_name];
  NSString* messageText = [NSString stringWithUTF8String:text];
  
  static UNNotificationSound* sound = [UNNotificationSound soundNamed:@"keet.mp3"];

  dispatch_async(dispatch_get_main_queue(), ^{
    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];
    if (roomName.length == 0) {
      content.title = profileName;
    } else {
      content.title = roomName;
    }
    if ([messageType hasPrefix:@"call"]) {
      content.body = [KeetUserDefaultsConstants stringForCallStarted:profileName];
    }
    else if ([messageType hasPrefix:@"image"]) {
      content.body = [KeetUserDefaultsConstants stringForSharedImage:profileName];
    }
    else if ([messageType hasPrefix:@"video"]) {
      content.body = [KeetUserDefaultsConstants stringForSharedVideo:profileName];
    }
    else if (messageType.length > 0) {
      content.body = [KeetUserDefaultsConstants stringForSharedFile:profileName];
    }
    else if (roomName.length == 0) {
      content.body = messageText;
    }
    else {
      content.body = [NSString stringWithFormat:@"%@: %@", profileName, messageText];
    }
    content.threadIdentifier = roomKey;
    content.summaryArgument = roomName;
    content.sound = sound;
    content.userInfo = @{
      @"roomKey": roomKey,
      @"messageId": messageId
    };
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:messageId
                                                                          content:content
                                                                          trigger:nil];
    [UNUserNotificationCenter.currentNotificationCenter addNotificationRequest:request
                                                         withCompletionHandler:nil];
  });
}

static double get_bg_time() {
  __block NSTimeInterval time;
  dispatch_sync(dispatch_get_main_queue(),^{
    time = UIApplication.sharedApplication.backgroundTimeRemaining;
  });
  return time == DBL_MAX ? 0.0 : time;
}

@implementation KeetCore

-(instancetype)init
{
  self = [super init];
  if (self) {
    self.inited = NO;
    self.bgTaskId = UIBackgroundTaskInvalid;
  }
  return self;
}

+(instancetype)sharedInstance
{
  static KeetCore* sharedInstance;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    sharedInstance = [[KeetCore alloc] init];
  });
  return sharedInstance;
}

-(void)install:(RCTBridge*)bridge
{
  KC_LOG("install jsi");

  static dispatch_once_t once;
  dispatch_once(&once, ^{
    [KeetUserDefaultsConstants setCanRunPushHandler:NO];

    dispatch_async(dispatch_get_main_queue(), ^{
      self.inited = YES;
      self.visible = YES;
    });

    NSURL* rootURL = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:KeetUserDefaultsConstants.groupId];
    NSError* err;
    [rootURL setResourceValue:@YES forKey:NSURLIsExcludedFromBackupKey error:&err];
    if (err) {
      NSLog(@"couldn't exclude data directories from iCloud");
    }
    NSString* tmp = NSTemporaryDirectory();

    NSBundle* mainBundle = NSBundle.mainBundle;
    NSString* bareBundle = [mainBundle pathForResource:@"main" ofType:@"bundle"];
    kc_init(on_background_ready,
            on_sync_signal,
            on_sync,
            on_log,
            on_push,
            get_bg_time,
            strdup(rootURL.path.UTF8String),
            strdup(tmp.UTF8String),
            strdup(bareBundle.UTF8String),
            strdup(mainBundle.bundleIdentifier.UTF8String));
  });

  auto jsiRuntime = [bridge respondsToSelector:@selector(runtime)] ? reinterpret_cast<jsi::Runtime*>(bridge.runtime) : nullptr;
  if (jsiRuntime != nullptr) {
    rn_data_t* rn_data = (rn_data_t*)malloc(sizeof(rn_data_t));
    rn_data->jsiRuntime = jsiRuntime;
    rn_data->rnBridge = bridge;
    void* data = kc_get_data();
    if (data) {
      free(data);
    }
    kc_set_data((void*)rn_data);

    jsi::Object hostObject = jsi::Object::createFromHostObject(
            *jsiRuntime,
            std::make_shared<KeetCoreJSI>());
    jsiRuntime->global().setProperty(*jsiRuntime, RUNTIME_KC, std::move(hostObject));
  }
}

-(void)suspend
{
  [KeetUserDefaultsConstants setCanRunPushHandler:NO];

  dispatch_async(dispatch_get_main_queue(), ^{
    self.visible = NO;

    if (!self.inited) {
      return;
    }

    [self maybeEndBgTask];
    self.bgTaskId = [UIApplication.sharedApplication beginBackgroundTaskWithName:@"keet:tear_down" expirationHandler:^{
      [self maybeEndBgTask];
    }];
    
    kc_suspend();
  });
}

-(void)resume
{
  self.visible = YES;
  [KeetUserDefaultsConstants setCanRunPushHandler:NO];

  dispatch_async(dispatch_get_main_queue(), ^{
    if (!self.inited) {
      return;
    }
    kc_resume();
  });
}

-(void)terminate
{
  [KeetUserDefaultsConstants setCanRunPushHandler:YES];
}

-(void)maybeEndBgTask
{
  if (_bgTaskId != UIBackgroundTaskInvalid) {
    [UIApplication.sharedApplication endBackgroundTask:_bgTaskId];
    _bgTaskId = UIBackgroundTaskInvalid;
  }
}

@end
