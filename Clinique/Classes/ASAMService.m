//
//  ASAMService.m
//  Clinique
//
//  Created by Brindha_shiva on 6/3/15.
//
//

#import "ASAMService.h"

@implementation ASAMService

+ (ASAMService *)sharedInstance {
    static dispatch_once_t once;
    static id state;
    dispatch_once(&once, ^{
        if (!state) {
            state = [[self alloc] init];
        }
    });
    return state;
}

- (void)lockDeviceWithCompletion:(void(^)(BOOL completed))completion {
      NSLog(@"*****ASAMService LockDevice Called *****");
    if ([UIDevice currentDevice].systemVersion.floatValue >= 7.0) {
        UIAccessibilityRequestGuidedAccessSession(YES, ^(BOOL didSucceed) {
            NSLog(@"*****ASAMService LockDevice Response %hhd *****",didSucceed);
            _deviceSupportsSingleMode = UIAccessibilityIsGuidedAccessEnabled();
            NSLog(@"*****_deviceSupportsSingleMode %hhd *****",_deviceSupportsSingleMode);
            completion(didSucceed);
        });
    }
}
 
-(void)unlockDeviceWithCompletiopn:(void(^)(BOOL isUnlockDeviceCompleted))completion{
     NSLog(@"*****ASAMService UnLockDevice Called *****");
    if ([UIDevice currentDevice].systemVersion.floatValue >= 7.0) {
        UIAccessibilityRequestGuidedAccessSession(NO, ^(BOOL didSucceed) {
            NSLog(@"UnlockDevice :%hhd",didSucceed);
             NSLog(@"*****ASAMService UnlockDevice Response :%hhd *****",didSucceed);
            _deviceSupportsSingleMode = UIAccessibilityIsGuidedAccessEnabled();
             NSLog(@"*****_deviceSupportsSingleMode Unlock device :%hhd *****",_deviceSupportsSingleMode);
            completion(YES);
        });
    }
}
@end
