#import "KeetNotificationsCoreRunner.h"

#import <KeetCore/keet-core.h>

#import "KeetLogging.h"
#import "KeetUserDefaultsConstants.h"

typedef struct {
  CFTypeRef ref;
} delegate_wrapper_t;

static void on_push(const char* room_key,
                    const char* message_id,
                    const char* type,
                    const char* room_name,
                    const char* profile_name,
                    const char* text,
                    void* data) {

  delegate_wrapper_t* wrapper = (delegate_wrapper_t*)data;
  id<KeetNotificationsCoreRunnerDelegate> delegate = (__bridge_transfer id<KeetNotificationsCoreRunnerDelegate>)wrapper->ref;
  [delegate onPayloadResultWithRoomKey:[NSString stringWithUTF8String:room_key]
                             messageId:[NSString stringWithUTF8String:message_id]
                           messageType:[NSString stringWithUTF8String:type]
                              roomName:[NSString stringWithUTF8String:room_name]
                           profileName:[NSString stringWithUTF8String:profile_name]
                           messageText:[NSString stringWithUTF8String:text]];
  free(wrapper);
}

@implementation KeetNotificationsCoreRunner

+(void)runKeetCoreWithPushPayload:(NSString*)payload delegate:(id<KeetNotificationsCoreRunnerDelegate>)delegate
{
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSString* pushBundle = [NSBundle.mainBundle pathForResource:@"push" ofType:@"bundle"];
    kc_push_init(pushBundle.UTF8String);
  });
  
  NSString* pwdGroup = [[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:KeetUserDefaultsConstants.groupId].path;

  delegate_wrapper_t* wrapper = (delegate_wrapper_t*)malloc(sizeof(delegate_wrapper_t));
  wrapper->ref = (__bridge_retained CFTypeRef)delegate;

  kc_push(payload.UTF8String, pwdGroup.UTF8String, on_push, wrapper);
}

@end
