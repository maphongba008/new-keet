#import <Foundation/Foundation.h>

#import <React/RCTBridge.h>

@interface KeetCore : NSObject

+(instancetype)sharedInstance;
-(instancetype)init UNAVAILABLE_ATTRIBUTE;
+(instancetype)new UNAVAILABLE_ATTRIBUTE;

-(void)install:(RCTBridge*)bridge;
-(void)suspend;
-(void)resume;
-(void)terminate;

@end
