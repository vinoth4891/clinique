//
//  LoginPlugin.h
//  Clinique
//
//  Created by SRIKANTH_A on 17/02/15.
//
//

#import <Cordova/CDVViewController.h>
#import "CLQServiceManager.h"
@interface LoginPlugin : CDVPlugin <UIDocumentInteractionControllerDelegate,UIAlertViewDelegate>

-(void) login:(CDVInvokedUrlCommand*)command;
-(void)forcePasswordChange:(CDVInvokedUrlCommand *)command;
-(void)core_course_get_categories:(CDVInvokedUrlCommand *)command;
-(void)core_course_get_contents:(CDVInvokedUrlCommand *)command;
-(void)core_enrol_get_users_courses_subcat:(CDVInvokedUrlCommand *)command;
-(void) sendPluginsendPlugin;
-(BOOL) checkLoginInLcoalDB;
@end
