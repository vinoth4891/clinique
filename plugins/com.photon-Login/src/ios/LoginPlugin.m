//
//  LoginPlugin.m
//  Clinique
//
//  Created by SRIKANTH_A on 17/02/15.
//
//

#import "LoginPlugin.h"
#import "AppDelegate.h"
#import "CacheManager.h"
#import "CLQHelper.h"
#import "CLQConstants.h"
#import "User.h"
#import "Reachability.h"
#import "ReachabilityManager.h"
#import "CLQDataBaseManager.h"
#import "User.h"
#import "CLQServiceManager.h"
#import "ReachabilityManager.h"
#import "Categories.h"

#define kLogin @"login"
#define kGetCategories @"core_course_get_categories"
#define kGetuserCourses @"core_enrol_get_users_courses_subcat"
#define kGetTopics @"core_course_get_contents"
#define kGetFavorite @"favorite"


@interface LoginPlugin ()

@property NSData * jsonOutput;
@property NSManagedObjectContext *context;
@property NSString * userName;
@property NSString * password;
@property CDVPluginResult *pluginResult;
@property CDVInvokedUrlCommand* jsCommand;

@end

@implementation LoginPlugin

- (void)login:(CDVInvokedUrlCommand*)command {
    self.jsCommand = command;
    @try {
        if([command.methodName caseInsensitiveCompare:kLogin] == NSOrderedSame){
            if(command.arguments.count >0){
                NSDictionary *dict= command.arguments[0];
                self.userName = dict[kUserName];
                self.password = dict[kPassword];
            }
            [self authendicateLogin];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception Login :%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
}
-(void)logout:(CDVInvokedUrlCommand *)command{
    @try {
        [[CLQServiceManager defaultManager]resumeHourlySyncToStart:NO];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception logout:%@", exception.description);
    }

}
-(void)forcePasswordChange:(CDVInvokedUrlCommand *)command{
    NSLog(@"forcePasswordChange Arguments: %@", command.arguments);
    self.jsCommand = command;
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict  = command.arguments[0];
            // [User updateUserPassword:@{kPassword :dict[@"new_pwd"]}];
            if([ReachabilityManager defaultManager].isNetworkAvailable){
                [CLQDataBaseManager dataBaseManager].currentPassword = dict[@"new_pwd"];
                self.userName = dict[kUserName];
                self.password = dict[@"new_pwd"];
                [CLQServiceManager validateLogin:@{kUserName : self.userName, kPassword : self.password} withCompletion:^(id response){
                    if(response != nil){
                        self.jsonOutput = [NSJSONSerialization dataWithJSONObject:response options:kNilOptions error:nil];
                    }
                    else{
                        //self.jsonOutput = [NSJSONSerialization dataWithJSONObject:@{Key_Message : @"F" } options:kNilOptions error:nil];
                        [self sendPluginsendPluginForError:@{Key_Error_Code : @"Err10010",key_Error_Message : kErr10010}];
                        
                    }
                }];
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception forcePasswordChange :%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
    
}

-(void)secure_details:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        if(command.arguments.count > 0){
           NSDictionary *dict  = command.arguments[0];
            User *user = [User getUserForUserId:@([dict[Key_User_Id] intValue])];//67429
            
            if(user != nil){
                NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:user.json options:kNilOptions error:nil];
                NSDictionary *respDict = @{kUserName : user.userName,@"pass" : jsonDict[kUser][kPassword]};
                self.jsonOutput = [NSJSONSerialization dataWithJSONObject:respDict options:kNilOptions error:nil];
                [self sendPluginsendPlugin];
            }
        }
        
    }
    @catch (NSException *exception) {
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
    
}

-(void)core_course_get_categories:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        self.jsonOutput =   [[CLQDataBaseManager dataBaseManager]getAllCategoriesJson];
        [self sendPluginsendPlugin];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception core_course_get_categories :%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
}

-(void)core_enrol_get_users_courses_subcat:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        if(command.arguments.count > 0){
            NSLog(@"Arguments : core_enrol_get_users_courses_subcat %@",command.arguments);
            NSDictionary *dict= command.arguments[0];
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getCousersJsonwithUserId:@([dict[[kuserId  lowercaseString]] intValue]) andCategoryId:@([dict[Key_Category_Id] intValue])];
            [self sendPluginsendPlugin];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception core_enrol_get_users_courses_subcat :%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
}

-(void)core_course_get_contents:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict= command.arguments[0];
            
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getTopicsJsonForCourseId:@([dict[Key_CourseId] intValue])];
            [self sendPluginsendPlugin];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception core_course_get_contents :%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
}

-(void)favorite:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getFavoritesJson];
        [self sendPluginsendPlugin];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception favorite:%@",exception.description);
        CDVPluginResult *pluginResult  = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

-(void)cascade_dropdown:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        
        NSDictionary *dict= command.arguments[0];
        
        if([dict[@"type"] caseInsensitiveCompare:kRegion]){ // get regions
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getAllRegionJson];
            [self sendPluginsendPlugin];
        }
        else if ([dict[@"type"] caseInsensitiveCompare:kRetailer]){ // get retailers
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getAllRetailersJsonForRegion:dict[kRegion]];
            [self sendPluginsendPlugin];
            
        }
        else if ([dict[@"type"] caseInsensitiveCompare:kCountry]){ // get countries
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getAllCountriesJsonForRegion:dict[kRegion]];
            [self sendPluginsendPlugin];
        }
        else if ([dict[@"type"] caseInsensitiveCompare:kStore]){ // get Stores
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getAllStoreJsonForRegion:dict[kRegion] andRetailers:dict[kRetailer] andCountry:dict[kCountry]];
            [self sendPluginsendPlugin];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception cascade_dropdown:%@",exception.description);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
}

-(void)authendicateLogin{
    
    if (self.userName == nil && self.password == nil) {
        self.jsonOutput = nil;
        
    }
    
    [CLQDataBaseManager dataBaseManager].currentPassword = self.password;
   /* if([self checkLoginInLcoalDB] == NO){
        if(![ReachabilityManager defaultManager].isNetworkAvailable){
            [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10006",key_Error_Message : kERR10006}];
            return;
        }
        [CLQServiceManager validateLogin:@{kUserName : self.userName, kPassword : self.password} withCompletion:^(id response){
            
            if(response == nil){
                if(![ReachabilityManager hasConnectivity]){
                    [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10006",key_Error_Message : kERR10006}];
                    
                }else{
                    
                    [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10003",key_Error_Message : kERR10003}];
                }
            }
            else{
                self.jsonOutput = [NSJSONSerialization dataWithJSONObject:response options:kNilOptions error:nil];
                [self sendPluginsendPlugin];
            }
        }];
    }
    else{
        [[CLQServiceManager defaultManager]resumeHourlySyncToStart:YES];  // To start schedular
        [self sendPluginsendPlugin];
    }*/
    
    if([ReachabilityManager defaultManager].isNetworkAvailable){
        [CLQServiceManager validateLogin:@{kUserName : self.userName, kPassword : self.password} withCompletion:^(id response){
            
            if(response == nil){
               /* if([self checkLoginInLcoalDB]){
                    [[CLQServiceManager defaultManager]resumeHourlySyncToStart:YES];  // To start schedular
                    [self sendPluginsendPlugin];
                }
                else{*/
                    if(![ReachabilityManager hasConnectivity]){
                        [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10006",key_Error_Message : kERR10006}];
                        
                    }else{
                        
                        [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10003",key_Error_Message : kERR10003}];
                    }
                //}
            }
            else{
                [[CLQServiceManager defaultManager]resumeHourlySyncToStart:YES];
                self.jsonOutput = [NSJSONSerialization dataWithJSONObject:response options:kNilOptions error:nil];
                [self sendPluginsendPlugin];
            }
        }];
    }
    else{
        if([self checkLoginInLcoalDB]){
            [[CLQServiceManager defaultManager]resumeHourlySyncToStart:YES];  // To start schedular
            [self sendPluginsendPlugin];
        }
        else{
             [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10006",key_Error_Message : kERR10006}];
        }
        
    }
}
-(void)sendPluginsendPluginForError:(NSDictionary *)dict{
    NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    CDVPluginResult *plugin = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:response];
    [self.commandDelegate sendPluginResult:plugin callbackId:self.jsCommand.callbackId];

}
-(BOOL) checkLoginInLcoalDB
{
    //check the login details
    BOOL locaLoginAvailable = NO;
    // IF true
    //set the jsonOutput -jsonOutput
    id userDetail =  [User getUserDetails:@{kUserName : self.userName, kPassword :[CLQHelper md5:self.password]}];
    [CLQDataBaseManager dataBaseManager].currentPassword = self.password;
     if(userDetail != nil)
     {
          locaLoginAvailable = YES;
          self.jsonOutput =[NSJSONSerialization dataWithJSONObject:userDetail options:kNilOptions error:nil];
     }
    return locaLoginAvailable;
}

-(void) sendPluginsendPlugin
{
    if (self.jsonOutput)
    {
        NSString *response = [[NSString alloc] initWithData:self.jsonOutput encoding:NSUTF8StringEncoding];
        NSLog(@"Response :%@",response);
        self.pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:response];
        [self.commandDelegate sendPluginResult:self.pluginResult callbackId:self.jsCommand.callbackId];
    }
    else
    {    NSDictionary *dict =  @{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004};
        [self sendPluginsendPluginForError:dict];
    }
}

-(void)setlanguage:(NSString *)languageString{
    
    NSString *path;
    if(languageString.length > 0){
        path = [[NSBundle mainBundle] pathForResource:languageString ofType:@"lproj"];
        if(path == nil)
            path = [[NSBundle mainBundle] pathForResource:@"en" ofType:@"lproj"];
    }
    else{
        path = [[NSBundle mainBundle] pathForResource:@"en" ofType:@"lproj"];
    }
    [CacheManager defaultManager].languageBundle = [NSBundle bundleWithPath:path];
}

-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex{
    if(buttonIndex == 1){
        [CLQServiceManager getContentSyncWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId andToken:[CLQDataBaseManager dataBaseManager].currentUser.token];
        
    }
    else{
        [self sendPluginsendPlugin];
    }
}

@end
