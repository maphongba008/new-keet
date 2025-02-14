#import "KeetUserDefaultsEnv.h"

#import "GeneratedDotEnv.m"

@implementation KeetUserDefaultsEnv

+(NSString*)appSuffix;
{
  NSDictionary* env = (NSDictionary*)DOT_ENV;
  return env[@"KEET_APP_SUFFIX"];
}

+(NSString*)appPrefix;
{
  NSDictionary* env = (NSDictionary*)DOT_ENV;
  return env[@"KEET_SCHEME_PEAR"];
}

@end
