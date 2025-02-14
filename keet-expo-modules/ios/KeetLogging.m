#import "KeetLogging.h"

@implementation KeetLogging

+(os_log_t)logger
{
  static os_log_t logger;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    logger = os_log_create("io.keet", "javascript");
  });
  return logger;
}

@end
