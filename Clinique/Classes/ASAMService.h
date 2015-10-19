//
//  ASAMService.h
//  Clinique
//
//  Created by Brindha_shiva on 6/3/15.
//
//

#import <Foundation/Foundation.h>

@interface ASAMService : NSObject

@property (assign, nonatomic)BOOL deviceSupportsSingleMode;
+ (ASAMService *)sharedInstance;
-(void)unlockDeviceWithCompletiopn:(void(^)(BOOL isUnlockDeviceCompleted))completion;
- (void)lockDeviceWithCompletion:(void(^)(BOOL completed))completion;
@end
