//
//  OfflineServicePlugin.m
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import "OfflineServicePlugin.h"
#import "CLQDataBaseManager.h"
#import "Favorite.h"
#import "Notes.h"
#import "CLQServiceManager.h"
#import "ReachabilityManager.h"
#import "Module.h"
#import "Asset.h"
#import "UserBadges.h"
#import "Course.h"
#import "CLQHelper.h"
#import "DependentActivities.h"
#import "CompletedActivities.h"

#define kInsertPdfBookMark @"insert_course_pdf_bookmark"
#define kInsertComment @"insert_replace_course_resource_comment"
#define kDeletePdfBookMark @"delete_course_pdf_bookmark"
#define kCreatefavorite @"create_favorite"
#define kRemoveFavorite @"remove_favorite"
#define kUpdateUser @"core_user_update_users"

@implementation OfflineServicePlugin

#pragma mark - Users
-(void)core_user_update_users:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict = command.arguments[0];
            if(dict[kId]){
                
                NSDictionary *userDict = @{kId :  dict[kId],
                                           kFirstName : dict[kFirstName] !=[NSNull null] && dict[kFirstName]  ? dict[kFirstName] : @"",
                                           kLastName : dict[kLastName] !=[NSNull null] && dict[kLastName]  ? dict[kLastName] : @"" ,
                                           kEmail : dict[kEmail] !=[NSNull null] && dict[kEmail] ? dict[kEmail] : @"" ,
                                           kCountry :  dict[kCountry] !=[NSNull null] && dict[kCountry] ? dict[kCountry] : @"",
                                           kStatus : @(1),
                                           Key_Profile : @{kRetailer : dict[kRetailer] !=[NSNull null] && dict[kRetailer] ? dict[kRetailer] : @"",
                                                           kRegion : dict[kRegion] !=[NSNull null] && dict[kRegion] ? dict[kRegion] : @"",
                                                           kjobTitle : dict[kjobTitle] !=[NSNull null]  && dict[kjobTitle]? dict[kjobTitle] : @"",
                                                           kStore : dict[kStore] !=[NSNull null] && dict[kStore] ? dict[kStore] : @""}};
                [User updateUserProfile:userDict];
                
                self.jsonOutput = [NSJSONSerialization dataWithJSONObject:@{kStatus : Key_Success} options:kNilOptions error:nil];
                [self sendPluginsendPlugin:command];
                
                if([ReachabilityManager defaultManager].isNetworkAvailable){
                    User *user = [User getUserForUserId:@([dict[kId] intValue])];
                    [CLQServiceManager updateRecordsToServerWithParams:@{kEntityUser : @{kUser :user }} withCompletion:^(id object,BOOL completed){}];
                }
                
            }
            
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception core_user_update_users :%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

#pragma mark - get course contents
-(void)core_course_get_contents:(CDVInvokedUrlCommand *)command{
    self.jsCommand = command;
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict= command.arguments[0];
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getTopicsJsonForCourseId:@([dict[Key_CourseId] intValue])];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception core_course_get_contents :%@",exception.description);
        [self sendErrorPlugin:command];
    }
}
#pragma mark - Favorites
-(void)favorite:(CDVInvokedUrlCommand *)command{
    @try {
        self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getFavoritesJson];
        [self sendPluginsendPlugin:command];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception favorite:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

-(void)create_favorite:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count >0){
        NSDictionary *params = command.arguments[0];
           // title":"1637@course@Topic 1 quiz 1 dependenct@quiz@undefined
            NSArray *array = [params[@"title"] componentsSeparatedByString:@"@"];
            if(array.count>0){
                
                NSString *courseType = array.count>1 ? array[1] : @"";
                NSString *fileName = array.count > 2 ? array[2] : @"";
                NSString *fileType  = array.count >3 ? array[3] : @"";
                NSString *fnameUpload = array.count > 4 ?array[4] : @"";
                //  Module *module = [Module getModuleForModuleId:@([params[key_CourseModuleid] intValue])];
                if(params[key_CourseModuleid] != [NSNull null] && params[key_CourseModuleid] != nil){
                    
                    NSString *moduleId = [NSString stringWithFormat:@"%@",params[key_CourseModuleid]];
                   
                      NSString *url =  @"" ;
                    if([fileType isEqualToString:@"quiz"] || [fileType isEqualToString:@"puzzle"]){
                        Module *module = [Module getModuleForModuleId:@([moduleId intValue])];
                        if(module.json != nil) {
                            NSDictionary *moduleDict = [NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil];
                            
                            if(moduleDict[@"url"]){
                                url = moduleDict[@"url"];
                            }
                        }
                    }
                    else{
                         NSArray *assets = [Asset getAssetsForReferenceId:@([moduleId intValue])];
                        for (Asset *asset in assets) {
                            url = asset.onlineUrl;
                        }
                    }
      
                    NSDictionary *dict = [NSDictionary dictionary];
    
                    if([fileType isEqualToString:@"scorm"]){
                        Module *module = [Module getModuleForModuleId:@([moduleId intValue])];
                        
                        if(module.json != nil) {
                            NSDictionary *moduleDict = [NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil];
                            
                            if(moduleDict[@"url"]){
                                url = moduleDict[@"url"];
                            }
                        dict = @{key_CourseModuleid : params[key_CourseModuleid],
                                               Key_User_Id : params[key_uid],
                                               kId :moduleId,
                                               @"file_name" :fileName,
                                               @"file_type" : fileType,
                                               @"fname_upload" : fnameUpload,
                                               @"course_type" : courseType,
                                               @"url" : url,
                                                @"manifest_path" :url,
                                                @"modname" : @"scorm",
                                               kStatus : @"N"};
                        }
                    }
                    else{
                        dict = @{key_CourseModuleid : params[key_CourseModuleid],
                                               Key_User_Id : params[key_uid],
                                               kId :moduleId,
                                               @"file_name" :fileName,
                                               @"file_type" : fileType,
                                               @"fname_upload" : fnameUpload,
                                               @"course_type" : courseType,
                                               @"url" : url,
                                               kStatus : @"N"};
                    }
                   
                    [Favorite saveFavoriteWithParams:dict];
                    
                    self.jsonOutput = [NSJSONSerialization dataWithJSONObject:@{kStatus : Key_Success} options:kNilOptions error:nil];
                    [self sendPluginsendPlugin:command];
                    
                    if([ReachabilityManager defaultManager].isNetworkAvailable){
                         [CLQServiceManager syncBackToServer:^(BOOL completion){}];
                        /*NSArray *favorites = [Favorite getAllUpdatedFavoritesForUserId:@([params[key_uid] intValue])];
                        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityFavorite : @{Key_Favorites : favorites}} withCompletion:^(id object, BOOL completed){
                            
                        }];*/
                    }
                }
            }
           
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception create_favorite :%@",exception.description);
       [self sendErrorPlugin:command];
    }
}

-(void)remove_favorite:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count >0){
            NSDictionary *params = command.arguments[0];
            [Favorite deleteFavorite:@{kModuleId : params[key_CourseModuleid]}];

            self.jsonOutput = [NSJSONSerialization dataWithJSONObject:@{kStatus : Key_Success} options:kNilOptions error:nil];
            [self sendPluginsendPlugin:command];
            
            if([ReachabilityManager defaultManager].isNetworkAvailable){
                [CLQServiceManager syncBackToServer:^(BOOL completion){}];
               /* NSArray *favorites = [Favorite getAllUpdatedFavoritesForUserId:@([params[key_uid] intValue])];
                [CLQServiceManager updateRecordsToServerWithParams:@{kEntityFavorite : @{Key_Favorites : favorites}} withCompletion:^(id object, BOOL completed){
                    
                }];*/
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception remove_favorite :%@",exception.description);
        [self sendErrorPlugin:command];
    }
}


#pragma mark - Comments
-(void)get_course_resource_comment:(CDVInvokedUrlCommand *)command{
    
    @try {
        if(command.arguments.count >0){
            NSDictionary *dict= command.arguments[0];
            NSLog(@"Dict :%@", dict);
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getNotesJsonForModuleId:@([dict[key_CourseModuleid] intValue]) andUserId:@([dict[@"uid"] intValue])];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception get_course_resource_comment:%@",exception.description);
       [self sendErrorPlugin:command];
    }
}

-(void)get_course_resource_comments:(CDVInvokedUrlCommand *)command{
    
    @try {
        if(command.arguments.count >0){
            NSDictionary *dict= command.arguments[0];
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getNotesJsonForModuleId:nil andUserId:@([dict[@"uid"] intValue])];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception get_course_resource_comments:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

-(void)insert_replace_course_resource_comment:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count >0){
            
            NSDictionary *dict= command.arguments[0];
            NSLog(@"Dict :%@", dict);
            if(dict[key_cid]){
                Module *module = [Module getModuleForModuleId:@([dict[key_CourseModuleid] integerValue])];
                NSString *modulename = @"";
                NSString *coursename = @"";
                if(module != nil){
                    Course *course  = [Course getCourseForCourseId:module.courseId andCategoryId:nil];
                    if(course != nil){
                        NSDictionary *courseDict   = [NSJSONSerialization JSONObjectWithData:course.json options:kNilOptions error:nil];
                        coursename  = courseDict[@"fullname"];
                    }
                    NSDictionary * moduleDict  = [NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil];
                    modulename  = moduleDict[@"name"];
                }
                NSDictionary *notesDict  = @{key_CourseModuleid :@([dict[key_CourseModuleid] intValue]),
                                             Key_User_Id :@([dict[key_uid] intValue]),
                                             key_Comment :dict[key_Comment] != [NSNull null]  ? dict[key_Comment] : @"",
                                             kStatus: @(1),
                                             Key_Type :dict[Key_Type] != [NSNull null] ? dict[Key_Type] : @"",
                                             @"course_name" :coursename.length > 0 ? coursename : @"",
                                             @"resource_name" : modulename.length > 0 ? modulename : @""
                                             };
                [Notes updateNotesForParams:@{key_Notes :notesDict}];
                
                NSDictionary *respDict = @{Key_Error : @(0), Key_Message : Key_Success, Key_Response : @{kStatus : Key_Success} };
                self.jsonOutput = [NSJSONSerialization dataWithJSONObject:respDict options:kNilOptions error:nil];
                [self sendPluginsendPlugin:command];
                if([ReachabilityManager defaultManager].isNetworkAvailable){
                    [CLQServiceManager syncBackToServer:^(BOOL completion){}];
                    /*NSArray *notes = [Notes getAllUpdatedNotesWithUserId:@([dict[key_uid] intValue])];
                     [CLQServiceManager updateRecordsToServerWithParams:@{kEntityNotes : @{key_Notes : notes}} withCompletion:^(id object, BOOL completed){}];*/
                }
                
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception insert_replace_course_resource_comment :%@",exception.description);
        [self sendErrorPlugin:command];
    }
}


#pragma mark - Progress
-(void)progress:(CDVInvokedUrlCommand *)command{
    @try {
        NSDictionary *dict= command.arguments[0];
        self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getProgressJsonForUserId:@([dict[key_uid] intValue])];
        [self sendPluginsendPlugin:command];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception progress:%@",exception.description);
       [self sendErrorPlugin:command];
    }
}


#pragma mark - Players
-(void)players:(CDVInvokedUrlCommand *)command{
    @try {
        NSDictionary *dict= command.arguments[0];
        self.jsonOutput   = [[CLQDataBaseManager dataBaseManager]getPlayerJsonForUserId:@([dict[key_uid] intValue]) andCourseId:@([dict[key_cid] intValue])];
        [self sendPluginsendPlugin:command];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception players:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

#pragma mark - Badges
-(void)badges:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict= command.arguments[0];
            self.jsonOutput   = [[CLQDataBaseManager dataBaseManager]getBadgesForUserId:@([dict[key_uid] intValue])];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception getBadges:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

-(void)update_user_badges:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict= command.arguments[0];
            NSDictionary *userBadgeDict = @{Key_UserBadgeId : dict[@"bid"],Key_BadgeValue : dict[@"bval"],Key_BadgeName : dict[@"bname"],kStatus : @(1)};
            //[UserBadges updateUserBadgeWithParams:userBadgeDict];
            [UserBadges insertUserBadge:userBadgeDict];
            if([ReachabilityManager defaultManager].isNetworkAvailable){
                [CLQServiceManager syncBackToServer:^(BOOL completion){}];
                /*NSArray *userBadges = [UserBadges getAllUpdatedUserBadges];
                [CLQServiceManager updateRecordsToServerWithParams:@{kEntityUserBadges : @{Key_Userbadges : userBadges}} withCompletion:^(id object, BOOL completed){}];*/
            }
            NSDictionary *respDict = @{Key_Error : @(0), Key_Message : Key_Success, Key_Response : @{kStatus : Key_Success} };
            self.jsonOutput = [NSJSONSerialization dataWithJSONObject:respDict options:kNilOptions error:nil];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception getBadges:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

#pragma mark - Get Terms and Conditions and Privacy policy

-(void)getTermsAndConditions:(CDVInvokedUrlCommand *)command{
    @try {
     if(command.arguments.count > 1){
         NSString *type = command.arguments[0];
         NSString *languageCode= command.arguments[1];
         Asset *asset;
         if([type isEqualToString:@"termsCondition"]){
             asset = [Asset getAssetForUrlKey:languageCode andGroup:kAsset_TermsAndConditions];
         }
         else{
             asset = [Asset getAssetForUrlKey:languageCode andGroup:kAsset_PrivacyPolicy];
         }
         
         NSString *filePath = [CLQHelper getAssetPath:asset];
         NSDictionary *respDict = @{Key_Error : @(0), Key_Message : Key_Success, Key_Response : @{@"getFilePath" :[filePath lastPathComponent], @"downloadFilePath" :filePath} };;
         self.jsonOutput = [NSJSONSerialization dataWithJSONObject:respDict options:kNilOptions error:nil];
         [self sendPluginsendPlugin:command];
     }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception getTermsAndConditions:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

#pragma mark - Get dependent activities

-(void)getDependentModules:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count > 1){
            self.jsonOutput = [[CLQDataBaseManager dataBaseManager]getDependentActivities];
            [self sendPluginsendPlugin:command];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception getDependentModules:%@",exception.description);
        [self sendErrorPlugin:command];
    }

}

-(void)updateCompletedModules:(CDVInvokedUrlCommand *)command{
    @try {
        if(command.arguments.count > 0){
            NSDictionary *dict = command.arguments[0];
            
            [CompletedActivities saveCompletionActivityWithParams:@{kModuleId : dict[@"modId"],kStatus : @(1)}];
            NSDictionary *respDict = @{Key_Error : @(0), Key_Message : Key_Success, Key_Response : @{}};
            self.jsonOutput = [NSJSONSerialization dataWithJSONObject:respDict options:kNilOptions error:nil];
            [self sendPluginsendPlugin:command];
            
            if([ReachabilityManager defaultManager].isNetworkAvailable){
                [CLQServiceManager syncBackToServer:^(BOOL completion){}];
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception getDependentModules:%@",exception.description);
        [self sendErrorPlugin:command];
    }
}

#pragma mark - Helper Method
-(void)sendErrorPlugin:(CDVInvokedUrlCommand *)command
{
    NSDictionary *dict =  @{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004};
    NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    CDVPluginResult *pluginResult=[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:response];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)sendPluginsendPlugin:(CDVInvokedUrlCommand *)command
{
    if (self.jsonOutput)
    {
        NSString *response = [[NSString alloc] initWithData:self.jsonOutput encoding:NSUTF8StringEncoding];
        NSLog(@"Response :%@",response);
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:response];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
    else
    {
        [self sendErrorPlugin:command];
    }
}




@end
