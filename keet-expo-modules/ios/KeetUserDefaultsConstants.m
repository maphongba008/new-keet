#import "KeetUserDefaultsConstants.h"

#import <KeetUserDefaults-Swift.h>

@implementation KeetUserDefaultsConstants

+(NSString*)groupId;
{
  return KeetUserDefaults.groupId;
}

+(void)setCanRunPushHandler:(BOOL)value
{
  KeetUserDefaults* defaults = NSUserDefaults.keet;
  [defaults setCanRunPushHandlerWithValue:value];
}

+(BOOL)canRunPushHandler
{
  KeetUserDefaults* defaults = NSUserDefaults.keet;
  return [defaults getCanRunPushHandler];
}

+(NSString*)stringForSharedImage:(NSString*)profileName
{
  KeetPushStrings* strings = [NSUserDefaults.keet getPushStrings];
  return [strings.sharedImage stringByReplacingOccurrencesOfString:@"$1" withString:profileName];
}

+(NSString*)stringForSharedVideo:(NSString*)profileName
{
  KeetPushStrings* strings = [NSUserDefaults.keet getPushStrings];
  return [strings.sharedVideo stringByReplacingOccurrencesOfString:@"$1" withString:profileName];
}

+(NSString*)stringForSharedFile:(NSString*)profileName
{
  KeetPushStrings* strings = [NSUserDefaults.keet getPushStrings];
  return [strings.sharedFile stringByReplacingOccurrencesOfString:@"$1" withString:profileName];
}

+(NSString*)stringForCallStarted:(NSString*)profileName
{
  KeetPushStrings* strings = [NSUserDefaults.keet getPushStrings];
  return [strings.callStarted stringByReplacingOccurrencesOfString:@"$1" withString:profileName];
}

@end
