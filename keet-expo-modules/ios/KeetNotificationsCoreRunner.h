#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@protocol KeetNotificationsCoreRunnerDelegate

-(void)onPayloadResultWithRoomKey:(NSString*)roomKey
                        messageId:(NSString*)messageId
                      messageType:(NSString*)messageType
                         roomName:(NSString*)roomName
                      profileName:(NSString*)profileName
                      messageText:(NSString*)messageText;

@end

@interface KeetNotificationsCoreRunner : NSObject

+(void)runKeetCoreWithPushPayload:(NSString*)payload delegate:(id<KeetNotificationsCoreRunnerDelegate>)delegate;

@end

NS_ASSUME_NONNULL_END
