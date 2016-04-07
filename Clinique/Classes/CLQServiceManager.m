//
//  CLQDatabaseHandler.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "CLQServiceManager.h"
#import "CLQDataBaseManager.h"
#import "User.h"
#import "course.h"
#import "PDFServiceHandler.h"
#import "FMDB.h"
#import "UserMapping.h"
#import "Categories.h"
#import "Module.h"
#import "Topics.h"
#import "CLQStrings.h"
#import "Favorite.h"
#import "User.h"
#import "Bookmarks.h"
#import "Notes.h"
#import "CLQHelper.h"
#import "AppDelegate.h"
#import "Progress.h"
#import "Badges.h"
#import "UserBadges.h"
#import "Players.h"
#import "PDFService.h"
#include "ReachabilityManager.h"
#import "SSZipArchive/SSZipArchive.h"
#import "QuizLocalStorage.h"
#import "CacheManager.h"
#import "ScormLocalStorage.h"
#import "DependentActivities.h"
#import "CompletedActivities.h"


static CLQServiceManager* defaultManager = nil;
@implementation CLQServiceManager

+(CLQServiceManager*) defaultManager
{
    if (defaultManager == nil) {
        defaultManager = [[CLQServiceManager alloc] init];
    }
    return defaultManager;
}

+(void)validateLogin:(NSDictionary *)dict withCompletion:(void (^)(id userResponse))completion{
    NSDictionary *body =  @{kUserName : dict[kUserName],
                            kPassword : dict[kPassword],
                            kAction : @"login",
                            @"service" : kLoginActionName};
    [PDFServiceHandler CLQsendRequestToService:kServiceUrl withQuery:nil withMethod:HttpMethodPOST withBody:body completion:^(PDFResponse *response,NSError *error){
      
        if(response.data.result[@"USER"]){
            
            NSMutableDictionary *respDict = [NSMutableDictionary dictionaryWithDictionary:response.data.result[@"USER"]];
            // adding password
            respDict[kPassword] = dict[kPassword];
            // save  NO in JSOn to fetch next time
            User *user = [User getUserForUserId:@([respDict[kId] intValue])];
            if(user == nil)
                [User insertUser:[NSDictionary dictionaryWithDictionary:respDict]];
            else{
                respDict[kFirstTime] = user.firstTime != nil ? user.firstTime : @"Y";
                [User updateUser:[NSDictionary dictionaryWithDictionary:respDict]];
            }
            
            //Build dict with First time user as Y for first time response
        
            completion(@{kUser : respDict,KEY_FIRST_TIME_USER : user.firstTime != nil ? user.firstTime : @"Y"});
        }
        else{
           completion(nil);
        }
    }];
}

+(void)firstLaunchSyncWithuserId:(NSNumber *)userId andToken:(NSString *)token withCompletion:(void(^)(BOOL completed))completion{
    @try {
        [CLQDataBaseManager dataBaseManager].isSyncInprogress = YES;
        
        [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:NO];// To stop schedular
        [CLQDataBaseManager dataBaseManager].isDeltaSync = NO;
        [CLQDataBaseManager dataBaseManager].isIdle = NO;
        AppDelegate *appdelegate= (AppDelegate *)[UIApplication sharedApplication].delegate;
        [appdelegate resumeIdleTimer:YES]; // To stop idle timer
        
        [CLQServiceManager getContentFromServerForType:ServiceTypeFirst withParameters:@{kuserId : userId, kToken:token} withCopmpletion:^(BOOL completed,BOOL isnewContent,id object){
            
            if(completed && isnewContent){
                [CLQServiceManager getContentSyncWithUserId:userId andToken:token];
            }
            completion(completed);
        }];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : firstLaunchSyncWithuserId %@", exception.description);
    }
}

+(void)deltaSyncWithParams:(NSDictionary *)params withCompletion:(void(^)(BOOL completed,BOOL isnewContent, id object))completion{
    @try {
        [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:NO]; // To stop timer
        [CLQDataBaseManager dataBaseManager].isDeltaSync = YES;
        [CLQServiceManager getContentFromServerForType:ServiceTypeDelta withParameters:params withCopmpletion:^(BOOL completed,BOOL isnewContent,id object){
            
            
            completion(completed, isnewContent,object);
            
            /*if(completed && isnewContent && object != nil){
                completion(YES, YES,object);
            }
            else{
                completion(NO, NO,object);
            }*/
            [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:YES];
            //completion(completed,isnewContent);
        }];
 
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : deltaSyncWithParams %@", exception.description);
       /*NSDictionary *dict =  @{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004};
        NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        [appdelegate.viewController syncExceptionPluginCalled:response];*/
        
    }
}


+(void)getContentFromServerForType:(ServiceType)serviceType withParameters:(NSDictionary *)params withCopmpletion:(void(^)(BOOL completed,BOOL isnewContent,id object))completion{//%@=%@&//action=complete_user_data&token=<token>
   
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
    NSDictionary *body = [NSDictionary dictionary];
    if (serviceType == ServiceTypeFirst){
        body =  @{kAction : kGetAllUserData,kToken:params[kToken]};
    }
    else{
        body =  @{kAction : kGetAllUserData,kToken:params[kToken],@"from" : params[@"from"]};
    }
    dispatch_queue_t backgroundQueue = dispatch_queue_create("Dispatch_Delta_Sync", 0);
    dispatch_async(backgroundQueue, ^{
    [[CLQServiceManager defaultManager] beginBackgroundUpdateTask];
    [PDFServiceHandler CLQsendRequestToService:kServiceUrl withQuery:nil withMethod:HttpMethodPOST withBody:body completion:^(PDFResponse *response,NSError *error){
        NSLog(@"Error :%@",error);
        dispatch_async(dispatch_get_main_queue(), ^{
        [[CLQServiceManager defaultManager] endBackgroundUpdateTask];
        @try {
            
            if(response == nil){
                completion(NO,NO,nil);
                return ;
            }
       
            id responseData = response.data.result[Key_Response];
            if([responseData isKindOfClass:[NSDictionary class]]){
                NSDictionary *dict  = (NSDictionary *)responseData;
                if(serviceType == ServiceTypeFirst){
                    
                    [CLQServiceManager saveSyncDataInDatabase:dict withParams:params forServiceType:ServiceTypeFirst withCompletion:^(BOOL completeion){
                        completion(completeion, YES,nil);
                        return;
                    }];
                }
                
                else if(serviceType == ServiceTypeDelta){
                    // Check course
                    if(dict[kCourse] != [NSNull null] && dict[kCourse]){
                        NSArray *courses = dict[kCourse];
                        if(courses.count > 0)
                        {
                            completion(YES, YES,dict);
                            return;
                            
                        }
                    }
                    // Check Module
                    if(dict[Key_Modules] != [NSNull null] && dict[Key_Modules]){
                        NSArray *modules = dict[Key_Modules];
                        if(modules.count > 0)
                        {
                            completion(YES, YES,dict);
                            return;
                            
                        }
                        
                    }
                    
                    // Save Resources
                    if(dict[Key_Resources] != [NSNull null] && dict[Key_Resources]  ){
                        id object = dict[Key_Resources];
                        if([object isKindOfClass:[NSDictionary class]]){
                            NSDictionary *newsDict  = (NSDictionary *)object;
                            
                            if(newsDict[Key_Courses] != [NSNull null] && newsDict[Key_Courses]){
                                NSArray *courses =newsDict[Key_Courses];
                                if(courses.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
                                
                            }
                            if(newsDict[Key_Topics] != [NSNull null] && newsDict[Key_Topics]){
                                NSArray *topics =newsDict[Key_Topics];
                                if(topics.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
                               
                            }
                            if(newsDict[Key_Modules] != [NSNull null] && newsDict[Key_Modules]){
                                NSArray *modules =newsDict[Key_Modules];
                                if(modules.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
                                
                            }
                        }
                    }
                    // Check in news
                    if(dict[Key_News] != [NSNull null] && dict[Key_News]  ){
                        id object = dict[Key_News];
                        if([object isKindOfClass:[NSDictionary class]]){
                            NSDictionary *newsDict  = (NSDictionary *)object;
                            
                            if(newsDict[Key_Courses] != [NSNull null] && newsDict[Key_Courses]){
                                NSArray *courses =newsDict[Key_Courses];
                                if(courses.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
                               
                            }
                            if(newsDict[Key_Topics] != [NSNull null] && newsDict[Key_Topics]){
                                NSArray *topics =newsDict[Key_Topics];
                                if(topics.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
                               
                            }
                            if(newsDict[Key_Modules] != [NSNull null] && newsDict[Key_Modules]){
                                NSArray *topics =newsDict[Key_Modules];
                                if(topics.count > 0)
                                {
                                    completion(YES, YES,dict);
                                    return;
                                    
                                }
  
                            }
                        }
                    }
                    
                }
               
                completion(YES, NO,dict);
            }
            else{
                NSLog(@"getserverdate failied ");
                completion(NO,NO,nil);
            }
        }
        @catch (NSException *exception) {
            NSLog(@"Exception : getContentFromServerForType : %@", exception.description);
            completion(NO,NO,nil);
        }
            });
   // });
    }];
    });
}

+(void)saveSyncDataInDatabase:(NSDictionary *)dict withParams:(NSDictionary *)params forServiceType:(ServiceType)serviceType withCompletion:(void(^)(BOOL completed))completion{
    
    // Save user data
    if(dict[kUser]){
        NSMutableDictionary *userDict = [NSMutableDictionary dictionaryWithDictionary:dict[kUser]];
        userDict[kPassword] = [CLQDataBaseManager dataBaseManager].currentPassword;
        userDict[kToken] = params[kToken];
        if(serviceType == ServiceTypeDelta)
            userDict[kFirstTime] =  @"N";
        else
            userDict[kFirstTime] =  @"Y";
        [User saveUser:userDict];
    }
    else{//Handle  invalid response
        completion(NO);
        return;
    }
   
    // Save categories
    if(dict[Key_Course_Categories] != [NSNull null] && dict[Key_Course_Categories]){
        for (NSDictionary *categoryDict in dict[Key_Course_Categories]) {
            [Categories saveCategory:categoryDict];
        }
    }
    // Save Courses
    if(dict[kCourse] != [NSNull null] && dict[kCourse]){
        NSArray *courses = dict[kCourse];
        for (NSDictionary *courseDict in courses) {
            Categories *category = [Categories getCategoriesForcategpryName:Key_Courses];
            if(category != nil){
                NSMutableDictionary *course = [NSMutableDictionary dictionaryWithDictionary:courseDict];
                course[Key_Category_Id] = category.categoryId;
                [Course saveCourse:course];
            }
        }
    }
    
    //Save Modules
    if(dict[Key_Modules] != [NSNull null] && dict[Key_Modules]){
        NSArray *modules = dict[Key_Modules];
        for (NSDictionary *moduleDict in modules) {
            [Module saveModule:moduleDict];
            
        }
    }
    
    
    // Save topics
    if(dict[Key_Topics] != [NSNull null] && dict[Key_Topics] ){
        NSArray *topics = dict[Key_Topics];
        for (NSDictionary *topicDict in topics) {
            [Topics saveTopics:topicDict];
        }
    }
    
    // Save Dependent activities
    if(dict[Key_Module_Dependencies] != [NSNull null] && dict[Key_Module_Dependencies] ){
        NSArray *dependents = dict[Key_Module_Dependencies];
        for (NSDictionary *dependentDict in dependents) {
            [DependentActivities saveDependentActivity:dependentDict];
        }
    }
    // Update dependent activity with completed modules
    if(dict[Key_CompletedModules] !=[NSNull null] && dict[Key_CompletedModules]){
        NSArray *completedModules  = dict[Key_CompletedModules];
        [CompletedActivities saveCompletedActivities:completedModules];
    }
    // Save Favorites
    if(dict[Key_Favorites] != [NSNull null] && dict[Key_Favorites]){
        NSArray *favorites = dict[Key_Favorites];
        for (NSDictionary  *favDict in favorites) {
            if([favDict isKindOfClass:[NSDictionary class]]){
                NSMutableDictionary *favoriteDict = [NSMutableDictionary dictionaryWithDictionary:favDict];
                favoriteDict[Key_User_Id] = [CLQDataBaseManager dataBaseManager].currentUser.userId;
                if(favoriteDict[kId]){
                    favoriteDict[key_CourseModuleid] =favDict[kId];
                }
                [Favorite saveFavorite:favoriteDict];
                
            }
        }
    }
    
    // Save Bookmarks
    if(dict[key_Bookmarks] != [NSNull null] && dict[key_Bookmarks]){
        NSArray *bookmarks = dict[key_Bookmarks];
        for (NSDictionary *favDict in bookmarks) {
            NSMutableDictionary *bookMarkDict = [NSMutableDictionary dictionaryWithDictionary:favDict];
            bookMarkDict[Key_User_Id] = [CLQDataBaseManager dataBaseManager].currentUser.userId;
            [Bookmarks saveBookMarks:[NSDictionary dictionaryWithDictionary:bookMarkDict]];
        }
    }
    // Save Notes
    if(dict[key_Notes] != [NSNull null] && dict[key_Notes]){
        NSArray *notes = dict[key_Notes];
        for (NSDictionary *favDict in notes) {
            NSMutableDictionary *notesDict = [NSMutableDictionary dictionaryWithDictionary:favDict];
            notesDict[Key_User_Id] = [CLQDataBaseManager dataBaseManager].currentUser.userId;
            [Notes saveNotes:[NSDictionary dictionaryWithDictionary:notesDict]];
        }
    }
    
    //Save progress
    if(dict[Key_Progress] != [NSNull null] && dict[Key_Progress]){
        [Progress saveProgress:dict[Key_Progress]];
        
    }
    // Save Badges
    if(dict[Key_Badges]!= [NSNull null]){
        NSArray *badges = dict[Key_Badges][Key_Badges];
        for (NSDictionary *dict in badges) {
            [Badges saveBadges:dict];
        }
        NSArray *userBadges = dict[Key_Badges][Key_Userbadges];
        for (NSDictionary *dict in userBadges) {
            [UserBadges saveUserBadge:dict];
        }
    }
    
    // Save Players
    if(dict[Key_Players] != [NSNull null]){
        NSArray *players  = dict[Key_Players];
        for (NSDictionary *dict in players) {
            [Players savePlayers:dict];
        }
    }
    // Save News
    if(dict[Key_News] != [NSNull null] && dict[Key_News]  ){
        id object = dict[Key_News];
        if([object isKindOfClass:[NSDictionary class]]){
            NSDictionary *newsDict  = (NSDictionary *)object;
            
            if(newsDict[Key_Courses] != [NSNull null] && newsDict[Key_Courses]){
                NSArray *courses =newsDict[Key_Courses];
                for (NSDictionary *courseDict in courses) {
                    [Course saveCourse:courseDict];
                }
            }
            if(newsDict[Key_Topics] != [NSNull null] && newsDict[Key_Topics]){
                NSArray *topics =newsDict[Key_Topics];
                for (NSDictionary *topicsDict in topics) {
                    [Topics saveTopics:topicsDict];
                }
            }
            if(newsDict[Key_Modules] != [NSNull null] && newsDict[Key_Modules]){
                NSArray *modules =newsDict[Key_Modules];
                for (NSDictionary *modulesDict in modules) {
                    [Module saveModule:modulesDict];
                }
                
            }
        }
    }
    // Save Resources
    if(dict[Key_Resources] != [NSNull null] && dict[Key_Resources]  ){
        id object = dict[Key_Resources];
        if([object isKindOfClass:[NSDictionary class]]){
            NSDictionary *newsDict  = (NSDictionary *)object;
            
            if(newsDict[Key_Courses] != [NSNull null] && newsDict[Key_Courses]){
                NSArray *courses =newsDict[Key_Courses];
                for (NSDictionary *courseDict in courses) {
                    
                    [Course saveCourse:courseDict];
                }
            }
            if(newsDict[Key_Topics] != [NSNull null] && newsDict[Key_Topics]){
                NSArray *topics =newsDict[Key_Topics];
                for (NSDictionary *topicsDict in topics) {
                    [Topics saveTopics:topicsDict];
                }
            }
            if(newsDict[Key_Modules] != [NSNull null] && newsDict[Key_Modules]){
                NSArray *modules =newsDict[Key_Modules];
                for (NSDictionary *modulesDict in modules) {
                    
                    [Module saveModule:modulesDict];
                }
                
            }
        }
    }
    
    // Save Quiz list
   /* if(dict[Key_Quiz_Sync] != [NSNull null] && dict[Key_Quiz_Sync])
    {
        [QuizLocalStorage saveLocalStorage:dict[Key_Quiz_Sync]];
    }*/
    
    // Save Asset for Terms and condition and Privacy policy
    if(serviceType == ServiceTypeFirst){
        NSArray *languages = kLanguages;
        NSMutableArray *assets  = [NSMutableArray array];
        int i= 0;
        for (NSString *languageCode in languages) {
            NSString *fileurl  = [NSString stringWithFormat:kTermsAndConditionUrl,languageCode,languageCode];
            NSDictionary *termsAndConditionDict = @{kRefrenceId : @(i),
                                                    Key_FileName :[fileurl lastPathComponent],
                                                    Key_Type :[fileurl pathExtension],
                                                    Key_FileUrl  : fileurl,
                                                    kUrlKey : languageCode,
                                                    kAssetGroup : kAsset_TermsAndConditions,
                                                    kAssetIndex : @(0),
                                                    Key_Type :@"file"
                                                    };
            [assets addObject:termsAndConditionDict];
            fileurl = [NSString stringWithFormat:kPrivacyPolicyUrl,languageCode,languageCode];
            NSDictionary *privacyPolicyDict = @{kRefrenceId : @(i),
                                                Key_FileName :[fileurl lastPathComponent],
                                                Key_Type :[fileurl pathExtension],
                                                Key_FileUrl  : fileurl,
                                                kUrlKey : languageCode,
                                                kAssetGroup : kAsset_PrivacyPolicy,
                                                kAssetIndex : @(0),
                                                Key_Type :@"file"
                                                };
            [assets addObject:privacyPolicyDict];
            i++;
            
            
        }
        [Asset saveTermsAndConditionAssets:assets];
        
    }
    
    
    // Delete Modules and course
    if(dict[Key_ActiveCourses] != [NSNull null] && dict[Key_ActiveCourses]){
        NSArray *activeCourses = dict[Key_ActiveCourses];
        NSMutableArray *activeCourseIds = [NSMutableArray array];
        NSMutableArray *activeModulesIds = [NSMutableArray array];
        int courseIndex = 1;
        int moduleIndex = 1;
        for (NSDictionary *activeCourseDict in activeCourses)
        {
            if(![activeCourseIds containsObject:activeCourseDict[kId]])
               [activeCourseIds addObject:activeCourseDict[kId]];
            // Update course order based on Active courses
            UserMapping *userMapping = [UserMapping getUserMapping:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId,kRefrenceId :activeCourseDict[kId],kUserMappingType : kUser_Mapping_Group_Course }];//@([dict[kuserId] intValue]), @([dict[kRefrenceId] intValue]), dict[kUserMappingType]
            if(userMapping != nil){
                userMapping.courseOrder= @(courseIndex);
                [UserMapping updateUserMappingCourseorder:userMapping];
            }
            courseIndex = courseIndex +1;
            NSArray *modules = activeCourseDict[Key_Modules];
            moduleIndex  =1;
            for (NSString *modulesId in modules)
            {
                if(![activeModulesIds containsObject:modulesId])
                    [activeModulesIds addObject: modulesId];
                Module *module = [Module getModuleForModuleId:@([modulesId intValue])];
                if(module != nil)
                {  module.moduleOrder   = @(moduleIndex);
                    [Module updateModuleOrder:module];
                }
                moduleIndex = moduleIndex +1;
            }
        }
        [Course deleteCourseAndModules:activeCourseIds andActiveModuleIds:activeModulesIds];
    }
    
    
    [CLQDataBaseManager dataBaseManager].lastSyncedDate = [NSString stringWithFormat:@"%@",dict[@"server_time"]];
    [[NSUserDefaults standardUserDefaults]setObject:[CLQDataBaseManager dataBaseManager].lastSyncedDate forKey:@"lastSyncedDate"];
    [[NSUserDefaults standardUserDefaults]synchronize];
    [CLQDataBaseManager dataBaseManager].contentSize= [NSString stringWithFormat:@"%@",dict[@"contentsize"]];
    completion(YES);
}

-(void)downloadScormContent:(NSDictionary *)params withCompletion:(void(^)(BOOL completed))completion{
    
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc]init];
  
    NSString *paramtersStr =  [NSString stringWithFormat:@"?action=%@&courseid=%@&cmid=%@",kScormDownload,params[kCourseId],params[kModuleId]];
    request.URL  = [NSURL URLWithString:[kServiceUrl stringByAppendingString:paramtersStr]];
    [request setHTTPMethod:@"GET"];
    [request setTimeoutInterval:300];
    self.urlResponse = nil;
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    //[self beginBackgroundUpdateTask];
    dispatch_queue_t backgroundQueue = dispatch_queue_create("Scorm_ContentDownload", 0);
    dispatch_async(backgroundQueue, ^{
        NSLog(@"Scorm resquest :%@",request);
        [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response,NSData *data,NSError *eror){
            dispatch_async(dispatch_get_main_queue(), ^{
               // if(data != nil){
                NSString *filePath = [CLQHelper createScormPathModule:params[kModuleId]];
                BOOL createFile = [SSZipArchive createZipFileAtPath:filePath withFilesAtPaths:nil];
                if(createFile){
                    BOOL isSuccess =    [data writeToFile:filePath atomically:YES];
                    if(isSuccess){
                        //If unzip folder already exits remove that
                        NSString *unzippedfilePath = [filePath stringByDeletingPathExtension];
                        if([[NSFileManager defaultManager]fileExistsAtPath:unzippedfilePath])
                        {
                            [[NSFileManager defaultManager] removeItemAtPath:unzippedfilePath error:nil];
                        }
                        
                        [SSZipArchive unzipFileAtPath:filePath  toDestination:unzippedfilePath];
                        // Remove Zip file after extracting that
                        if([[NSFileManager defaultManager]fileExistsAtPath:filePath])
                          [[NSFileManager defaultManager] removeItemAtPath:filePath error:nil];
                        
                       
                    }
                }
                self.currentDownloadingAsset.assetSize= [NSString stringWithFormat:@"%lld",response.expectedContentLength]  ;
                self.currentDownloadingAsset.updateRequired= @"0";
                [Asset saveAssetSize:self.currentDownloadingAsset];
                NSDictionary *dict = @{KEY_CURRENT_FILE_NO : @(self.currentAssetIndex+1 +([CLQServiceManager defaultManager].totalAssetCount - self.assets.count)), KEY_TOTAL_FILE_COUNT : @([CLQServiceManager defaultManager].totalAssetCount)};
                
                [self sendProgressJson:dict];
                [self callNextAssetWithDelay];
               // [self endBackgroundUpdateTask];
                completion(YES);
                
               
            });
        }];
    });
}

#pragma mark- ContentSync methods

+(void)syncBackToServer:(void(^)(BOOL completed))completion{
    
    if([ReachabilityManager defaultManager].isNetworkAvailable){
        [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:NO]; // To stop
        
        //Push user to server
        User *user = [User getUserForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if([user.status intValue] == 1){
            [CLQServiceManager updateRecordsToServerWithParams:@{kEntityUser : @{kUser : user}} withCompletion:^(id object,BOOL completed){}];
            
        }
        
        // Push Book marks to server
        NSArray *bookmarks = [Bookmarks getAllUpdatedBookmarksWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityBookmarks : @{key_Bookmarks :bookmarks }} withCompletion:^(id object,BOOL completed){}];
        
        //Push notes to server
        NSArray *notes = [Notes getAllUpdatedNotesWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityNotes : @{key_Notes : notes}} withCompletion:^(id object,BOOL completed){}];
        
        
        //Push user Badges To server
        NSArray *userBadges = [UserBadges getAllUpdatedUserBadges];
        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityUserBadges : @{Key_Userbadges : userBadges}} withCompletion:^(id object,BOOL completed){}];
        
        
        //Push Favorites to server
        NSArray *favorites = [Favorite getAllUpdatedFavoritesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityFavorite : @{Key_Favorites : favorites}} withCompletion:^(id object,BOOL completed){}];
        
        
        //Push  Quiz to server
        NSArray *quiz = [QuizLocalStorage getQuizLocalStoargeForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        for (QuizLocalStorage *localStorage in quiz) {
            if(![[CLQServiceManager defaultManager].syncingQuizIds containsObject:localStorage.moduleId]){
               // [QuizLocalStorage updateProgressStatusForQuiz:localStorage];
                [CLQServiceManager updateRecordsToServerWithParams:@{kEntityClinique_Quiz : @{Key_Quiz : localStorage}} withCompletion:^(id object,BOOL completed){
                    
                }];
            }
        }
        //Push  Scorm to server
        NSArray *scorm =[ScormLocalStorage getScormLocalStorageForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        for (ScormLocalStorage *localStorage in scorm) {
            [CLQServiceManager updateRecordsToServerWithParams:@{kEntityScorm : @{Key_Scorm : localStorage}} withCompletion:^(id object,BOOL completed){}];
        }
        
        NSArray *dependents = [CompletedActivities getUpdatedCompletedActivitiesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        [CLQServiceManager updateRecordsToServerWithParams:@{kEntityActivityCompletion : @{kEntityActivityCompletion : dependents}} withCompletion:^(id object,BOOL completed){}];
        
        [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:YES];
        
    }
    completion(YES);
}

#pragma mark - Sync Back services

+(void)updateRecordsToServerWithParams:(NSDictionary *)params withCompletion:(void(^)(id object,BOOL completion))completion{
    @try {
        for (NSString *key in params.allKeys) {
            __block  SyncBackTable syncbacktable ;
            __block  NSMutableArray *bookMarkIds = [NSMutableArray array];
            __block NSMutableArray *notesIds = [NSMutableArray array];
            __block NSMutableArray *favoriotIds = [NSMutableArray array];
            NSDictionary *bodyDict = [NSDictionary dictionary];
            
            if([key isEqualToString:kEntityUser]){
                syncbacktable = SyncBackTableUser;
                User *user = (User *)params[kEntityUser][kUser];
                if(user != nil){
                    bodyDict = @{ Key_Type : Key_Profile,
                                  kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                                  Key_Data : @{Key_Firstname : user.firstName.length > 0 ? user.firstName : @"",
                                               Key_Lastname : user.lastName.length > 0 ? user.lastName : @"",
                                               kEmail : user.email.length > 0 ? user.email : @"",
                                               kCountry : user.country.length > 0 ? user.country : @"",
                                               kRetailer : user.retailer.length > 0 ? user.retailer : @"",
                                               kRegion : user.region.length > 0 ? user.region : @"",
                                               kStore : user.store.length > 0 ? user.store : @"",
                                               kjobTitle : user.jobTitle.length > 0 ? user.jobTitle : @""}};
                }
            }
            else if ([key isEqualToString:kEntityBookmarks])
            {
                syncbacktable = SyncBackTableBookmark;
                NSArray *bookmarks =params[kEntityBookmarks][key_Bookmarks];
            
                    NSMutableArray *addedArray  = [NSMutableArray array];
                    NSMutableArray *deledAry = [NSMutableArray array];
                  bookMarkIds = [Bookmarks getAllBookmarksForUserId:[CLQDataBaseManager  dataBaseManager].currentUser.userId];
                
                    for (Bookmarks *bookmark in bookmarks) {
                        NSArray *addedBookmarksAry  = [bookmark.addedBookmarks componentsSeparatedByString:@","];
                        
                        NSMutableArray *pages = [NSMutableArray array];
                        
                        if(addedBookmarksAry.count > 0){
                            for (NSString *page in addedBookmarksAry) {
                                if([page intValue] != 0)
                                    [pages addObject:@([page intValue])];
                            }
                            [addedArray addObject:@{key_CourseModuleid :bookmark.moduleId, key_Pages :pages}];
                            
                        }
                        
                        NSArray *deletedBookMarkAry = [bookmark.deletedBookmarks componentsSeparatedByString:@","];
                        
                        pages = [NSMutableArray array];
                        if(deletedBookMarkAry.count > 0){
                            for (NSString *page in deletedBookMarkAry) {
                                if([page intValue] != 0)
                                    [pages addObject:@([page intValue])];
                            }
                            [deledAry addObject:@{key_CourseModuleid :bookmark.moduleId, key_Pages :pages}];
                            
                        }
                    }
                    bodyDict = @{ Key_Type : key_Bookmark,
                                  kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                                  Key_Data : @{Key_Deleted : deledAry,Key_Added : addedArray}};
               
            }
            else if ([key isEqualToString:kEntityNotes])
            {
                syncbacktable = SyncBackTableNotes;
                NSArray *notes  = params[kEntityNotes][key_Notes];
                
                NSMutableArray *addedArray  = [NSMutableArray array];
                NSMutableArray *deletedAry = [NSMutableArray array];
                notesIds = [Notes getAllNotesForUser:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                for (Notes *note in notes)
                {
                    [addedArray addObject:@{key_CourseModuleid :note.moduleId, key_Comment :note.comments}];
                }
                bodyDict  = @{Key_Type : key_Notes,
                              kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                              Key_Data : @{Key_Deleted : deletedAry,Key_Added : addedArray}};
                
            }
            else if ([key isEqualToString:kEntityClinique_Quiz])
            {
                syncbacktable = SyncBackTableQuiz;
                QuizLocalStorage *localStorage = params[kEntityClinique_Quiz][Key_Quiz];
               
                NSMutableDictionary *quizDict = [CLQServiceManager getQuizRequestBodyForQuizes:localStorage];
                NSMutableArray *quizArray = [NSMutableArray array];
                if(quizDict != nil)
                 [quizArray addObject:quizDict];
              /*  NSData *data = [NSData data];
                if(localStorage.json != nil){
                   data = [localStorage.json dataUsingEncoding:NSUTF8StringEncoding];
                id object = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
                [quizArray addObject:object];
                }*/
                
                if(quizArray.count  > 0){
                    bodyDict  = @{Key_Type : Key_Quiz,
                                  kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                                  kSession : @"h5yQqojxpC",
                                  Key_Data : quizArray};
                }
            }
            else if ([key isEqualToString:kEntityUserBadges])
            {
                syncbacktable = SyncBackTableBadges;
                NSMutableArray *addedArray  = [NSMutableArray array];
                NSArray *userBadges  = params[kEntityUserBadges][Key_Userbadges];
            
                    for (UserBadges *userbadge in userBadges) {
                        [addedArray addObject:@{kId :userbadge.badgeId, Key_BadgeName :userbadge.badgeName,Key_BadgeValue : userbadge.badgeValue}];
                    }
                    
                    bodyDict  = @{Key_Type : Key_Badges,
                                  kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                                  Key_Data : @{Key_Added : addedArray}};
                
                
            }
            else if ([key isEqualToString:kEntityFavorite])
                
            {
                syncbacktable = SyncBackTableFavorites;
                NSMutableArray *addedArray  = [NSMutableArray array];
                NSMutableArray *deletedAry = [NSMutableArray array];
                NSArray *favorites =  params[kEntityFavorite][Key_Favorites];
                favoriotIds= [Favorite getAllFavoritesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                    for (Favorite *favorite in favorites) {
                        if([favorite.status isEqualToString:@"N"]){
                            [addedArray addObject:[NSJSONSerialization JSONObjectWithData:favorite.json options:kNilOptions error:nil]];
                        }
                        else if ([favorite.status isEqualToString:@"D"]){
                            [deletedAry addObject:@{key_CourseModuleid : favorite.moduleId}];
                        }
                    }
                    
                    bodyDict  = @{Key_Type : Key_Favorite,
                                  kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                                  Key_Data : @{Key_Deleted : deletedAry,Key_Added : addedArray}};
                
                
            }
            else if ([key isEqualToString:kEntityScorm])
            {
                syncbacktable = SyncBackTableScorm;
                ScormLocalStorage *localStoarge =  params[kEntityScorm][Key_Scorm];
                NSData *data = [NSData data];
                if(localStoarge.jsonBody != nil){
                    data = [localStoarge.jsonBody dataUsingEncoding:NSUTF8StringEncoding];
                
                
                id object = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
                bodyDict  = @{Key_Type : @"scorm",
                              kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                              kSession : @"h5yQqojxpC",
                              Key_CourseId : localStoarge.courseId,
                              Key_ModId : localStoarge.moduleId,
                              
                              Key_Data : @[object]};
             }
            
            }
            
             else if([key isEqualToString:kEntityActivityCompletion])
             {
                 syncbacktable = SyncBackTableDependentActivity;
                 NSArray *moduleIds = params[kEntityActivityCompletion][kEntityActivityCompletion];
                 NSMutableArray *completedModuleids = [NSMutableArray array];
                 for (NSString *moduleId in moduleIds) {
                     [completedModuleids addObject:@{kId : moduleId}];
                 }
                 bodyDict  = @{Key_Type : @"completion",
                               kToken : [CLQDataBaseManager dataBaseManager].currentUser.token,
                               Key_Data :@[@{@"completion_tracking" :completedModuleids}] };
                 
             }
            if(bodyDict.allKeys.count == 0)
            {
                completion(nil, YES);
                return;
            }
            [PDFServiceHandler sendRequestToService:kSyncServiceUrl withQuery:nil withMethod:HttpMethodPOST withBody:bodyDict completion:^(PDFResponse *response,NSError *error){
                if(response == nil){
                    completion(nil,YES);
                    return ;
                }
                if(syncbacktable == SyncBackTableUser)
                {
                    for (id object in response.data.result) {
                        if([object isKindOfClass:[NSDictionary class]]){
                            NSDictionary *user = (NSDictionary *)object;
                            NSMutableDictionary *userDict= [NSMutableDictionary dictionaryWithDictionary:user];
                            userDict[kPassword] = [CLQDataBaseManager dataBaseManager].currentPassword;
                            userDict[kToken] = [CLQDataBaseManager dataBaseManager].currentUser.token;
                            userDict[kFirstTime] =  @"Y";
                            [User saveUser:userDict];
                        }
                    }
                    
                }
                else if(syncbacktable == SyncBackTableBookmark){
                    
                    for (id object in response.data.result) {
                        
                        if([object isKindOfClass:[NSDictionary class]]){
                            NSDictionary *dict = (NSDictionary *)object;
                            
                            NSArray *bookmarks = [Bookmarks getBookMarksForModuleId:@([dict[key_CourseModuleid] intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                            if(bookmarks.count > 0){
                                Bookmarks *bookmark = (Bookmarks *)bookmarks[0];
                                if(bookmark != nil){
                                    bookmark.status = @(0);
                                    bookmark.addedBookmarks = @"";
                                    bookmark.deletedBookmarks = @"";
                                    bookmark.pageNumbers   = [dict[key_Pages] componentsJoinedByString:@","];
                                    int timestamp = [[NSDate date] timeIntervalSince1970];
                                    bookmark.timeModified  = @(timestamp);
                                    [Bookmarks updateBookMarkWithParams:@{key_Bookmarks : bookmark}];
                                }
                            }
                            if([bookMarkIds containsObject:dict[key_CourseModuleid]]){
                                [bookMarkIds removeObject:dict[key_CourseModuleid]];
                            }
                            
                        }
                    }
                    //Update deleted bookmrak in local DB
                    for (NSString *bookMarkId in bookMarkIds) {
                        NSArray *bookmarks    = [Bookmarks getBookMarksForModuleId:@([bookMarkId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                        if(bookmarks.count > 0){
                            Bookmarks *bookmark = (Bookmarks *)bookmarks[0];
                            bookmark.status = @(0);
                            bookmark.addedBookmarks = @"";
                            bookmark.deletedBookmarks = @"";
                            bookmark.pageNumbers   =@"";
                            int timestamp = [[NSDate date] timeIntervalSince1970];
                            bookmark.timeModified  = @(timestamp);
                            [Bookmarks updateBookMarkWithParams:@{key_Bookmarks : bookmark}];
                            
                            
                        }
                    }
                    
                }
                else if(syncbacktable == SyncBackTableNotes)
                {
                    
                    for (id object in response.data.result) {
                        
                        if([object isKindOfClass:[NSDictionary class]]){
                            NSDictionary *dict = (NSDictionary *)object;
                            
                            NSDictionary *notesDict  = @{key_CourseModuleid :@([dict[key_CourseModuleid] intValue]),
                                                         Key_User_Id :[CLQDataBaseManager dataBaseManager].currentUser.userId,
                                                         key_Comment :dict[key_Comment] != [NSNull null]  ? dict[key_Comment] : @"",
                                                         kStatus: @(0),
                                                         ktimeCreated : dict[ktimeCreated] != [NSNull null]  ? dict[ktimeCreated] : @"" ,
                                                         ktimeModified :dict[ktimeModified] != [NSNull null]  ?dict[ktimeModified] : @"" ,
                                                         @"type"  :dict[@"type"] != [NSNull null] ? dict[@"type"] : @"",
                                                         @"course_name" : dict[@"course_name"] != [NSNull null]  ? dict[@"course_name"] : @"",
                                                         @"resource_name" : dict[@"resource_name"] != [NSNull null] ? dict[@"resource_name"] : @"",
                                                         kId : dict[kId] != [NSNull null] ?dict[kId] : @""
                                                         };
                            [Notes updateNotesForParams:@{key_Notes : notesDict}];
                            if([notesIds containsObject:dict[key_CourseModuleid]]){
                                [notesIds removeObject:dict[key_CourseModuleid]];
                            }
                            
                        }
                        
                    }
                    for (NSString *notesId in notesIds) {// Mostly this block will not be called
                        NSArray *array = [Notes getNotesForModuleId:@([notesId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                        if(array.count > 0){
                            Notes *note = array[0];
                            note.status = @(0);
                            note.comments= @"";
                            [Notes updateNotesForParams:@{key_Notes :note}];
                        }
                    }
                    
                }
                else if(syncbacktable == SyncBackTableQuiz)
                {
                    
                    if([response.data.result isKindOfClass:[NSDictionary class]]){
                        NSDictionary *responseDict =response.data.result;
                        if(responseDict[Key_Response] != [NSNull null] && responseDict[Key_Response]){
                        if([responseDict[Key_Response] isKindOfClass:[NSDictionary class]])
                          [CLQServiceManager saveQuizDictionary:responseDict[Key_Response][Key_Data]];
                        }
                    }
                    
                }
                else if(syncbacktable == SyncBackTableBadges)
                {
                    NSArray *badgesArray = response.data.result[Key_Badges];
                    
                    for (NSDictionary *badgesDict in badgesArray) {
                        [Badges saveBadges:badgesDict];
                    }

                    NSArray *userBadgesArray = response.data.result[Key_Userbadges];
                    
                    for (NSDictionary *userBadge in userBadgesArray) {
                        [UserBadges updateUserBadgeWithParams:userBadge];
                    }
                    [UserBadges deleteUserBadgesAfterSyncBack]; // Delete localy saved(sync bcak completed) user badges,
                    
                }
                else if (syncbacktable == SyncBackTableFavorites)
                {
                    for (id object in response.data.result) {
                        
                        if([object isKindOfClass:[NSDictionary class]])
                        {
                            NSDictionary *dict   =(NSDictionary *)object;
                            [Favorite updateFavoritesWithParams:@{@"Update" : @(1),kModuleId : dict[key_CourseModuleid],Key_Favorite : dict}];
                            
                            if([favoriotIds containsObject:dict[key_CourseModuleid]]){
                                [favoriotIds removeObject:dict[key_CourseModuleid]];
                            }
                        }
                    }
                    for (NSString *favoriteId in favoriotIds) {
                        [Favorite updateFavoritesWithParams:@{@"Update" : @(0),kModuleId : favoriteId}];
                    }
                    
                }
                else if (syncbacktable == SyncBackTableScorm){
                    
                }
                else if (syncbacktable == SyncBackTableDependentActivity){
                    // Save Dependent activities
                    NSDictionary *dict =response.data.result;
                    if(dict[Key_Module_Dependencies] != [NSNull null] && dict[Key_Module_Dependencies] ){
                        NSArray *dependents = dict[Key_Module_Dependencies];
                        for (NSDictionary *dependentDict in dependents) {
                            NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithDictionary:dependentDict];
                            dict[kStatus] = @(0);
                            [DependentActivities saveDependentActivity:dependentDict];
                        }
                    }
                    // Update dependent activity with completed modules
                    if(dict[Key_CompletedModules] !=[NSNull null] && dict[Key_CompletedModules]){
                        NSArray *completedModules  = dict[Key_CompletedModules];
                        [CompletedActivities saveCompletedActivities:completedModules];
                    }
                }
                completion(nil,YES);
            }];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception updateRecordsToServerWithParams:%@",exception.description);
        completion(nil,NO);
    }
}

+(id)getQuizRequestBodyForQuizes:(QuizLocalStorage *)localStoarge{
    NSMutableDictionary *quizDict= [NSMutableDictionary dictionary];
    
    NSData *data = [localStoarge.json dataUsingEncoding:NSUTF8StringEncoding];
    id object = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
    if([object isKindOfClass:[NSDictionary class]])
    {
        quizDict = [NSMutableDictionary dictionaryWithDictionary:(NSDictionary *)object];
        BOOL isFinishedAttemptsAvailable =  NO;
        if(quizDict[Key_QuizList] != [ NSNull null] && quizDict[Key_QuizList])
        {
            NSArray *quizList = quizDict[Key_QuizList];
            NSMutableArray *quizListArray = [NSMutableArray array];
            
            for (NSDictionary * quizListDict in quizList)
            {
                NSMutableDictionary *requestQuizListDict = [NSMutableDictionary dictionaryWithDictionary:quizListDict];
                NSArray *attempts = requestQuizListDict[kAttempts];
                NSMutableArray *reqAttempts = [NSMutableArray array];
                for (NSDictionary *attemptDict in attempts)
                {
                    NSString *state = attemptDict[@"state"];
                    if([state isEqualToString:@"finished"]){
                        [reqAttempts addObject:attemptDict];
                        isFinishedAttemptsAvailable = YES;
                        // To restrict multiple time same quiz attempt sync
                        if([CLQServiceManager defaultManager].syncingQuizIds == nil)
                          [CLQServiceManager defaultManager].syncingQuizIds  = [NSMutableArray array];
                        
                        if(![[CLQServiceManager defaultManager].syncingQuizIds containsObject:localStoarge.moduleId] )
                            [[CLQServiceManager defaultManager].syncingQuizIds addObject:localStoarge.moduleId];
                        //[QuizLocalStorage updateProgressStatusForQuiz:localStoarge andInProgress:@"1"];
                        [quizListArray addObject:requestQuizListDict];
                        
                    }
                    /* if(reqAttempts.count > 0){
                     [requestQuizListDict removeObjectForKey:kAttempts];
                     requestQuizListDict[kAttempts] =reqAttempts;
                     [quizListArray addObject:requestQuizListDict];
                     }
                     else{
                     [requestQuizListDict removeObjectForKey:kAttempts];
                     [requestQuizListDict removeObjectForKey:Key_Questions];
                     }*/
                    
                }
            }
            if(!isFinishedAttemptsAvailable)
            return nil;
            [quizDict removeObjectForKey:Key_QuizList];
            quizDict[Key_QuizList]=quizListArray;
        }
        
    }
    
    return quizDict;
}

+(void)saveQuizDictionary:(id)object{
    if([object isKindOfClass:[NSArray class]]){
        NSArray *data = (NSArray *)object;
        
        for (NSDictionary *quizDict in data)
        {
           // NSMutableDictionary *quizDictionary = [NSMutableDictionary dictionaryWithDictionary:quizDict];
            NSArray *quizInfoArray = quizDict[Key_Quiz_Info];
            NSString *courseId = @""; NSString *moduleId = @"";
            for (NSDictionary *quizInfoDict in quizInfoArray)
            {
                courseId = quizInfoDict[Key_Course];
                moduleId  = quizInfoDict[Key_ModId];
            }
            if(courseId.length > 0 && moduleId.length > 0){
                NSString *userId = [NSString stringWithFormat:@"%@",[CLQDataBaseManager dataBaseManager].currentUser.userId];
                QuizLocalStorage *localStorage = [QuizLocalStorage getQuizLocalStoargeForCourseId:courseId  andModuleId:moduleId  andUserId:userId];
                if(localStorage != nil)
                {
                    NSData *data = [localStorage.json dataUsingEncoding:NSUTF8StringEncoding];
                    id object = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
                    NSMutableDictionary *jsonDict = [NSMutableDictionary dictionaryWithDictionary:object];
                    
                    if(jsonDict[Key_Quiz_Info] != [NSNull null] && jsonDict[Key_Quiz_Info] )
                    {
                        [jsonDict removeObjectForKey:Key_Quiz_Info];
                        jsonDict[Key_Quiz_Info] = quizInfoArray;
                    }
                    
                    if(jsonDict [Key_QuizList] != [NSNull null] && jsonDict[Key_QuizList])
                    {
                        NSArray *responseQuizLists = quizDict[Key_QuizList];
                        
                        NSArray *localStorageQuizList =jsonDict [Key_QuizList];
                        NSMutableArray *mutableQuizListArray = [NSMutableArray array];
                        for (int i =0; i< localStorageQuizList.count; i++)
                        {
                            NSMutableDictionary *localStorageQuizListDict = [NSMutableDictionary dictionaryWithDictionary:localStorageQuizList[i]];
                            if(localStorageQuizListDict[kAttempts]){
                                
                                for (NSDictionary *dict in localStorageQuizListDict[kAttempts])
                                {
                                    int dbAttemptIndex = [dict[kAttempt] intValue];
                                    
                                    for (NSDictionary *responseQuizListDict in responseQuizLists )
                                    {
                                        if(responseQuizListDict[kAttempts]){
                                            for (NSDictionary *responseAttemptDict in responseQuizListDict[kAttempts])
                                            {
                                                int  responseAttemptIndex = [responseAttemptDict[kAttempt] intValue];
                                                if (dbAttemptIndex == responseAttemptIndex)
                                                {
                                                     [localStorageQuizListDict removeObjectForKey:kAttempts];
                                                    localStorageQuizListDict[kAttempts]  = responseQuizListDict[kAttempts];
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                               /* if(responseQuizLists.count > i){
                                    [localStorageQuizListDict removeObjectForKey:kAttempts];
                                    localStorageQuizListDict[kAttempts]  = responseQuizLists[i][kAttempts];
                                }*/
                            }
                            //localStorageQuizListDict[@"dddd"] =  @"dfdff";
                            [mutableQuizListArray addObject:localStorageQuizListDict];
                        }
                        [jsonDict removeObjectForKey:Key_QuizList];
                        jsonDict[Key_QuizList] =mutableQuizListArray;
                    }
                    if([[CLQServiceManager defaultManager].syncingQuizIds containsObject:moduleId])
                       [[CLQServiceManager defaultManager].syncingQuizIds removeObject:moduleId];
                    [QuizLocalStorage updateJson:jsonDict forModuleId:moduleId];
                }
            }
        }
    }
}

-(void)resumeHourlySyncToStart:(BOOL)isStartSync{
    if(isStartSync)
    {
        if(![self.timer isValid]){
            self.timer= [NSTimer scheduledTimerWithTimeInterval:60*60 target:self
                                                       selector:@selector(callHourlySync:) userInfo:nil repeats:YES];
        }
    }
    else{
        if([self.timer isValid])
            [self.timer invalidate];
    }
}

-(void)callHourlySync:(NSTimer *)timer
{
    if([timer isValid]){
        if([ReachabilityManager defaultManager].isNetworkAvailable){
            [CLQServiceManager syncBackToServer:^(BOOL completed){}];
        }
    }
}

+(void)getContentSyncWithUserId:(NSNumber *)userId andToken:(NSString *)token{
 
    User *user = [User getUserForUserId:userId];
    CLQServiceManager *serviceManager = [[CLQServiceManager alloc]init];
    [serviceManager downloadAttachments:user];
}

-(void)downloadAttachments:(User *)user{
    self.currentUser = user;
    self.assets = [CLQServiceManager getDownloadingAssets:user];
       if(self.assets.count > 0)
    {
        
        NSString *needSapceToDownload = [CLQHelper getReamaingSpaceSize:[CLQServiceManager defaultManager].totalDownloadedContentSize];
        NSLog(@"needSapceToDownload :%@", needSapceToDownload);
        if(needSapceToDownload.length > 0){
            
            NSDictionary *dict =  @{Key_Error_Code : @"ERR10009",key_Error_Message : needSapceToDownload};
            NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
            NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
            [appdelegate.viewController syncExceptionPluginCalled:response];
            
        }
        else{
            [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:NO]; // To stop hourly call
            self.currentAssetIndex = 0;
            self.notDownloadedAssets = [NSMutableArray array];
            [self createUrlRequestForAssetAtIndex:self.currentAssetIndex];
            [self sendProgressJson:nil];
        }

    }
    else{
        // save last synced server date
        [[NSUserDefaults standardUserDefaults]setObject:[CLQDataBaseManager dataBaseManager].lastSyncedDate forKey:@"lastSyncedDate"];
        [[NSUserDefaults standardUserDefaults]synchronize];
        [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:YES];
        [CLQDataBaseManager dataBaseManager].isSyncInprogress = NO;
        [CLQDataBaseManager dataBaseManager].isIdle = YES;
        [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
        AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        [appdelegate.viewController progressStopPlugin];
        [appdelegate resumeIdleTimer:NO];
        
        
    }
}

+(NSArray *)getDownloadingAssets:(User *)user{
    NSArray *userMappings = [UserMapping getUserMappingWithParams:@{kuserId:user.userId, kUserMappingType : kUser_Mapping_Group_Asset}];
    NSMutableArray *assets = [NSMutableArray array];
    int i = 0;
    long long totalDownloadedContentSize = 0;
    for (UserMapping *usermapping in userMappings)
    {
        NSArray *assetsArray = [Asset getAllKindAssetsForReferenceId:usermapping.refrenceId];
        for (Asset *asset in assetsArray)
        {
            i++;
            NSString *filepath = @"";
            if([asset.assetGroup isEqualToString:Key_Scorm]){
                filepath = [CLQHelper getScormPathForModuleId:[asset.referenceId stringValue] ];
            }
            else{
                filepath =  [CLQHelper getAssetPath:asset];
            }
            if([asset.updateRequired isEqualToString:@"DS"] || [asset.updateRequired isEqualToString:@"FS"] || ![[NSFileManager defaultManager]fileExistsAtPath:filepath] )
            {
                NSLog(@"asset  ref ID :%@",asset.referenceId);
                if([[NSFileManager defaultManager]fileExistsAtPath:filepath])
                    [[NSFileManager  defaultManager]removeItemAtPath:filepath error:nil];
                [assets addObject:asset];
                
            }
            else{
               
                if([[NSFileManager defaultManager]fileExistsAtPath:filepath])
                {
                    NSDictionary *fileDict =  [[NSFileManager defaultManager]attributesOfItemAtPath:filepath error:nil];
                    if([asset.assetSize longLongValue] == [fileDict[@"NSFileSize"]longLongValue]){
                        totalDownloadedContentSize = totalDownloadedContentSize + [asset.assetSize longLongValue];
                        //[assets addObject:asset];
                        //[[NSFileManager  defaultManager]removeItemAtPath:filepath error:nil];
                    }
                    
                   /* if([asset.updateRequired isEqualToString:@"1"]){ // Download delta sync assets
                        [[NSFileManager  defaultManager]removeItemAtPath:filepath error:nil];
                        [assets addObject:asset];
                    }*/
                }
            }
        
        }
    }
 
    [CLQServiceManager defaultManager].totalAssetCount   = i;
    [CLQServiceManager defaultManager].totalDownloadedContentSize   = totalDownloadedContentSize;
    return [NSArray arrayWithArray:assets];
}

-(void)createUrlRequestForAssetAtIndex:(int)index;
{
    @try {
        BOOL hasConnectivity =[ReachabilityManager hasConnectivity];
       
        if(hasConnectivity){
            NSLog(@"asset count :%d and current index :%d",self.assets.count,index);
            if(self.assets.count > index){
                Asset *asset = self.assets[index];
                self.downloadingAsset= asset;
   
                NSString *urlString =  asset.onlineUrl;
                
                if([asset.assetGroup isEqualToString:kAsset_Scorm]){
                    // Down load scorm content
                    Module *module = [Module getModuleForModuleId:asset.referenceId];
                    if(module.courseId != nil){
                        self.currentDownloadingAsset =asset;
                        [self downloadScormContent:@{kModuleId : asset.referenceId,kCourseId : module.courseId} withCompletion:^(BOOL completed){

                        }];
                    }
                    else{
                        [self callNextAssetWithDelay];
                    }
                }
                else if ([asset.assetGroup isEqualToString:kAsset_TermsAndConditions] || [asset.assetGroup isEqualToString:kAsset_PrivacyPolicy]){
                    //Download Terms and conditions and privacy policy
                    NSMutableURLRequest *request = [[NSMutableURLRequest alloc]init];
                    self.downloadedMutableData = [[NSMutableData alloc]init];
                    [self beginBackgroundUpdateTask];
                    
                    request.URL  = [NSURL URLWithString:asset.onlineUrl];
                    [request setTimeoutInterval:300];
                    [request setHTTPMethod:@"GET"];
                     NSLog(@"Online url :%@",request.URL);
                    self.urlResponse = nil;
                    NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
                    [connection scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
                    [connection start];
                     //CFRunLoopRun();
                }
                else{
                    
                    // Down load other contents
                    NSArray *paths = [urlString componentsSeparatedByString:@"pluginfile.php"];
                    
                    if(paths.count > 1){
                        //NSString *subString1 = paths[0];
                        NSString *subString2 = paths[1];
                        
                        subString2 = [subString2 stringByReplacingOccurrencesOfString:@"?forcedownload=1" withString:@""];
                        
                        NSMutableURLRequest *request = [[NSMutableURLRequest alloc]init];
                        self.downloadedMutableData = [[NSMutableData alloc]init];
                        [self beginBackgroundUpdateTask];
                        NSString *paramtersStr =  [NSString stringWithFormat:@"file=%@&token=%@",subString2,self.currentUser.token];
                        request.URL  = [NSURL URLWithString:[kContentDownloadUrl stringByAppendingString:paramtersStr]];
                        [request setTimeoutInterval:300];
                        [request setHTTPMethod:@"GET"];
                        NSLog(@"Online url :%@",asset.onlineUrl);
                        NSLog(@"Url :%@",request.URL);
                        self.urlResponse = nil;
                        NSURLConnection *connection = [[NSURLConnection alloc]initWithRequest:request delegate:self];
                        [connection scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
                        [connection start];
                         //CFRunLoopRun();
                        
                    }
                    else{
                        [self callNextAssetWithDelay];
                    }
                }

            }
            else{// Content download completed
                 if(self.notDownloadedAssets.count == 0)
                 {
                     //Save last synced date
                     [[NSUserDefaults standardUserDefaults]setObject:[CLQDataBaseManager dataBaseManager].lastSyncedDate forKey:@"lastSyncedDate"];
                     [[NSUserDefaults standardUserDefaults]synchronize];
                     
                     // Udpate first time user as NO
                     self.currentUser.firstTime = @"N";
                     [User updateFirstTimeUser:self.currentUser];
                     [CLQDataBaseManager dataBaseManager].isSyncInprogress = NO;
                     [CLQDataBaseManager dataBaseManager].isIdle= YES;
                     NSLog(@"sync finisehd called");
                     [[CLQServiceManager defaultManager ]resumeHourlySyncToStart:YES]; // To start scedular
                     [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
                     
                     AppDelegate *appdelegate= (AppDelegate *)[UIApplication sharedApplication].delegate;// Start the idle timer
                     [appdelegate resumeIdleTimer:NO];
                 }
            }
        }
            else{
                
                NSLog(@"Connectiviuty falied");
            }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :createUrlRequestForAssetAtIndex : %@ ", exception.description);
    }
}

- (void) beginBackgroundUpdateTask
{
    self.backgroundUpdateTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
        [self endBackgroundUpdateTask];
    }];
}

- (void) endBackgroundUpdateTask
{
    [[UIApplication sharedApplication] endBackgroundTask: self.backgroundUpdateTask];
    self.backgroundUpdateTask = UIBackgroundTaskInvalid;
}

#pragma mark - NSUrl connection delegates
-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data{
    @try {
        if(data != nil){
            NSString *filePath = @"";
            NSMutableData *downlaodData  = self.downloadedMutableData;
            
            filePath =   [CLQHelper createLocalAssetPath:self.currentDownloadingAsset];
            [downlaodData appendData:data];
            
            NSFileHandle *myHandle = [NSFileHandle fileHandleForUpdatingAtPath:filePath];
            [myHandle seekToEndOfFile];
            [myHandle writeData:data];
            [myHandle closeFile];
            
            NSLog(@"%.0f%%", ((100.0/self.urlResponse.expectedContentLength)*downlaodData.length));
        }
        else{
             NSString *filePath = [CLQHelper getAssetPath:self.currentDownloadingAsset]; // Remove invalid file
            if([[NSFileManager defaultManager] fileExistsAtPath:filePath])
                [[NSFileManager defaultManager]removeItemAtPath:filePath error:nil];
        }
    }
    @catch (NSException *exception) {
        NSLog(@" Exception : Did Receive Data :%@", exception.description);
    }
}

-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response{
    NSLog(@"Response :%@",response);
    
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) response;
    self.currentDownloadingAsset = self.downloadingAsset;
    self.urlResponse = response;
    if([httpResponse statusCode]== 200){
        self.currentDownloadingAsset.assetSize= [NSString stringWithFormat:@"%lld",response.expectedContentLength]  ;
        [Asset saveAssetSize:self.currentDownloadingAsset];
        
    }
    else{
        self.currentDownloadingAsset.updateRequired= @"0";    // Remove invalid file if exixts
        [Asset saveAssetSize:self.currentDownloadingAsset];
        NSString *filePath = [CLQHelper getAssetPath:self.currentDownloadingAsset];
        if([[NSFileManager defaultManager] fileExistsAtPath:filePath])
            [[NSFileManager defaultManager]removeItemAtPath:filePath error:nil];
    }
    
}

-(void)connectionDidFinishLoading:(NSURLConnection *)connection{
    //CFRunLoopStop(CFRunLoopGetCurrent());
    NSLog(@"connectionDidFinishLoading");
    self.currentDownloadingAsset.updateRequired= @"0";
    [Asset saveAssetSize:self.currentDownloadingAsset];
    NSDictionary *dict = @{KEY_CURRENT_FILE_NO : @(self.currentAssetIndex+1 +([CLQServiceManager defaultManager].totalAssetCount - self.assets.count)),
                           KEY_TOTAL_FILE_COUNT : @([CLQServiceManager defaultManager].totalAssetCount)};
    
    [self sendProgressJson:dict];
    [self endBackgroundUpdateTask];
     [self callNextAssetWithDelay];
}

-(void)callNextAssetWithDelay{
    self.currentAssetIndex = self.currentAssetIndex +1;
    [self createUrlRequestForAssetAtIndex:self.currentAssetIndex];
}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error{
    NSLog(@"didFailWithError :%@",error);
    //CFRunLoopStop(CFRunLoopGetCurrent());
    // Check http status code, if status code is equal to 200,400,404, then call nest asset dwonload,other wise,log out the app.
    if(self.urlResponse != nil){
        NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *) self.urlResponse ;
        
        if([httpResponse statusCode] != 200  || [httpResponse statusCode] != 400 || [httpResponse statusCode] != 404){
            [self hanldeFailResponse];
        }
        else{
            [self callNextAssetWithDelay];
        }
    }
    else{
        [self hanldeFailResponse];
    }
}

-(void)hanldeFailResponse{
    [self.notDownloadedAssets addObject:@(self.currentAssetIndex)];
    [CLQDataBaseManager dataBaseManager].isSyncInprogress =  NO;
    [CLQDataBaseManager dataBaseManager].isIdle= YES;
    
    AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    NSDictionary *dict =  @{Key_Error_Code : @"ERR10007",key_Error_Message : kERR10007};
    NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    [appdelegate.viewController syncExceptionPluginCalled:response];
    [appdelegate resumeIdleTimer:NO];
}

#pragma mark- Javascript progress bar plugin
-(void)sendProgressJson:(NSDictionary *)progress{
    @try {
        if(progress != nil){
            NSData *dictData = [NSJSONSerialization dataWithJSONObject:progress options:kNilOptions error:nil];
            NSString *progResponse = [[NSString alloc] initWithData:dictData encoding:NSUTF8StringEncoding];
            // [self.progressBarView updateProgressBar:progress];
            AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
            [appDelegate.viewController iosPlugin:progResponse];
        }
        else{
            AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
            [appDelegate.viewController iosPlugin:nil];
        }
    }
    @catch(NSException *error){
        NSLog(@"Exception :sendProgressJson %@",error.description);
    }
}

@end


