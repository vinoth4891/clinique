//
//  OfflineServicePlugin.h
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import <Cordova/CDVViewController.h>
#import "OfflineSyncPlugin.h"

@interface OfflineServicePlugin : CDVPlugin
@property NSData * jsonOutput;
@property (strong, nonatomic)CDVInvokedUrlCommand* jsCommand;

-(void)favorite:(CDVInvokedUrlCommand *)command;
-(void)get_course_resource_comments:(CDVInvokedUrlCommand *)command;
-(void)get_course_resource_comment:(CDVInvokedUrlCommand *)command;
-(void)progress:(CDVInvokedUrlCommand *)command;
-(void)players:(CDVInvokedUrlCommand *)command;
-(void)badges:(CDVInvokedUrlCommand *)command;
-(void)getTermsAndConditions:(CDVInvokedUrlCommand *)command;
-(void)getDependentModules:(CDVInvokedUrlCommand *)command;
-(void)updateCompletedModules:(CDVInvokedUrlCommand *)command;
@end
