#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface KeetUserDefaultsConstants : NSObject

+(NSString*)groupId;

+(void)setCanRunPushHandler:(BOOL)value;
+(BOOL)canRunPushHandler;

+(NSString*)stringForSharedImage:(NSString*)profileName;
+(NSString*)stringForSharedVideo:(NSString*)profileName;
+(NSString*)stringForSharedFile:(NSString*)profileName;
+(NSString*)stringForCallStarted:(NSString*)profileName;

@end

NS_ASSUME_NONNULL_END
