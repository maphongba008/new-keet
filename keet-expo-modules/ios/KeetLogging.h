#import <Foundation/Foundation.h>

#import <os/log.h>

@interface KeetLogging : NSObject

+(os_log_t)logger;

@end

#define KEET_OSLOG(...) os_log([KeetLogging logger], "+++ " __VA_ARGS__)
