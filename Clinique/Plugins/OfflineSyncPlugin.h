//
//  OfflineSyncPlugin.h
//  Clinique
//
//  Created by Brindha_shiva on 3/11/15.
//
//

#import <Cordova/CDVViewController.h>
#import "CacheManager.h"

#define kFirstLaunch @"FirstLaunchSync"
#define kFavorite @"favorite"
#define kGetComments @"get_course_resource_comment"
#define kProgressFunc @"progress"

@interface OfflineSyncPlugin : CDVPlugin

@property (strong, nonatomic)NSDictionary *responseDict;
@property NSData * jsonOutput;
@property (strong, nonatomic)CDVInvokedUrlCommand* jsCommand;

- (void)FirstLaunchSync:(CDVInvokedUrlCommand*)command;
- (void)DeltaSync:(CDVInvokedUrlCommand*)command;
-(void)ManualSync:(CDVInvokedUrlCommand *)command;
-(void)ScormSync:(CDVInvokedUrlCommand *)command;
-(void)SyncBack:(CDVInvokedUrlCommand *)command;
@end
