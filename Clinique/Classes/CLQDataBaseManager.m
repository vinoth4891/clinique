//
//  CLQDataBaseManager.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "CLQDataBaseManager.h"
#import "FMDatabase.h"
#import "CLQStrings.h"
#import "User.h"
#import "Course.h"
#import "Categories.h"
#import "Topics.h"
#import "Favorite.h"
#import "Notes.h"
#import "Bookmarks.h"
#import "Module.h"
#import "Region.h"
#import "Retailers.h"
#import "Countries.h"
#import "Store.h"
#import "CLQHelper.h"
#import "Progress.h"
#import "QuizCourse.h"
#import "CacheManager.h"
#import "Players.h"
#import "Badges.h"
#import "UserBadges.h"
#import "DependentActivities.h"
#import "CompletedActivities.h"

static CLQDataBaseManager* dataBaseManager = nil;
@implementation CLQDataBaseManager
+(CLQDataBaseManager*) dataBaseManager
{
    if (dataBaseManager == nil) {
        dataBaseManager = [[CLQDataBaseManager alloc] init];
    }
    return dataBaseManager;
}

-(void)createDatabase{
    @try {
        NSString *path = [self getDBPath];
        if(![[NSFileManager defaultManager]fileExistsAtPath:path]){
            [[NSFileManager defaultManager]createFileAtPath:path contents:nil attributes:nil];
            [self createTables:path];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"DB not created");
    }
}

-(NSString *)getDBPath{
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *docsPath = [paths objectAtIndex:0];
   // NSString *path = [docsPath stringByAppendingPathComponent:@"CliniqueOffline.sqlite"];//CliniqueDB
     NSString *path = [docsPath stringByAppendingPathComponent:@"CliniqueDB.db"];
    return path;
}



-(void)createTables:(NSString *)dbPath{
    @try {
        FMDatabase *database = [FMDatabase databaseWithPath:dbPath];
        [database open];
        
        //create user table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ TEXT,%@ TEXT,%@ TEXT,%@ TEXT,%@ TEXT ,%@ TEXT,%@ TEXT,%@ TEXT,%@ TEXT,%@ TEXT,%@ TEXT, %@ BLOB, %@ TEXT, %@ INTEGER)",kEntityUser, kId,kuserId,kUserName,kFirstName,kLastName,kEmail,kPassword,kToken,kCountry,kRetailer,kRegion,kStore,kjobTitle,kjson,kFirstTime,kStatus]];
        
        // create user mapping table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ TEXT ,%@ INTEGER DEFAULT NULL,%@ long, %@ long, courseOrder INTEGER, %@ BLOB)",kEntityUserMapping, kId,kuserId,kUserMappingType,kRefrenceId,ktimeCreated,ktimeModified,kAttemptsJson]];
        
        //Create Assets table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT, %@ INTEGER, %@ TEXT, %@ INTEGER, %@ TEXT, %@ TEXT, %@ TEXT, %@ TEXT, %@ TEXT, %@ TEXT, %@ TEXT,%@ INTEGER, %@ INTEGER, %@ INTEGER, %@ TEXT)",kEntityAsset, kId,kuserId,kAssetGroup,kRefrenceId,kUrlKey,kOnlineUrl,kOfflineUrl,kfileType,kFileExtn,kAssetSize,kName,kAssetIndex,ktimeCreated,ktimeModified,kUpdateRequired]];
        
        //Create categories table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT, %@ INTEGER, %@ TEXT, %@ BLOB,%@ INTEGER, %@ INTEGER)",kEntityCategory, kId,kCategoryId,kName,kjson,ktimeCreated,ktimeModified]];
        
        // Create  Courses table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT, %@ INTEGER,%@ INTEGER,  %@ BLOB,%@ INTEGER, %@ INTEGER)",kEntityCourse, kId,kCourseId,kCategoryId, kjson,ktimeCreated,ktimeModified]];
        
        // Create Topics table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@  INTEGER, %@ INTEGER,%@ BLOB, %@ INTEGER, %@ INTEGER)",kEntityTopics, kId,kTopicsId,kCourseId,kjson,ktimeCreated,ktimeModified]];
        
        // Create module table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER, %@ INTEGER,%@ INTEGER, %@ BLOB,%@ BLOB,moduleOrder INTEGER,%@ INTEGER, %@ INTEGER)",kEntityModule, kId,kModuleId,kTopicsId,kCourseId,kjson,kOfflineJson,ktimeCreated,ktimeModified]];
        
        // Create favorites  table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER, %@ INTEGER,%@ BLOB, %@ TEXT,%@ INTEGER, %@ INTEGER)",kEntityFavorite, kId,kFavoriteId, kModuleId,kuserId,kjson,kStatus,ktimeCreated,ktimeModified]];
        
        //Create Notes table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER,%@ INTEGER, %@ TEXT, %@ INTEGER,%@ BLOB, %@ TEXT, %@ TEXT)",kEntityNotes,kId,kNotesId,kModuleId,kuserId,kComments,kStatus,kjson,ktimeCreated,ktimeModified]];
        
        // Create Bookmarks table
        
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER,%@ INTEGER, %@ INTEGER,%@ BLOB, %@ TEXT,%@ TEXT,%@ TEXT, %@ INTEGER, %@ INTEGER)",kEntityBookmarks,kId,kBookmarkId,kModuleId,kuserId,kPageNo,kjson,kStatus,kAddedBookmarks,kDeletedBookmarks,ktimeCreated,ktimeModified]];
        
        //Create region
        /*[database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ TEXT, %@ BLOB)",KEntityRegion,kId,kName,kjson]];
        
        // Create Country table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ TEXT,%@ BLOB,%@ TEXT)",KEntityCountry,kId,kName,kjson,kRegion]];
        
        //Create Retailer table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ TEXT,%@ BLOB,%@ TEXT)",kEntityRetailers,kId,kName,kjson,kRegion]];
        
        //Create Store table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ TEXT,%@ BLOB,%@ TEXT,%@ TEXT,%@ TEXT)",kEntityStore,kId,kName,kjson,kRegion,kRetailer,kCountry]];*/
        
        //Create Progress table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER, %@ TEXT,%@ INTEGER,%@ INTEGER,%@ INTEGER,%@ TEXT,%@ INTEGER, %@ INTEGER)",kEntityProgress,kId,kProgressId, kName,kuserId,kCourseId,kCourseIndex,kCourseScore,ktimeCreated,ktimeModified]];
        
        //Create Quiz Course table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER, %@ TEXT,%@ INTEGER,%@ FLOAT,%@ INTEGER, %@ INTEGER)",kEntityQuizCourse,kId,kQuizCourseRefId, kQuizName,kQuizIndex,kQuizScore,ktimeCreated,ktimeModified]];
        
        //Create Badges Table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER, %@ TEXT,%@ INTEGER,%@ BLOB,%@ INTEGER, %@ INTEGER)",kEntityBadges,kId,kBadgeId, kBadgeName,kBadgeValue,kjson,ktimeCreated,ktimeModified]];
        
        //Create User Badges table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER,%@ INTEGER, %@ TEXT,%@ INTEGER,%@ BLOB,%@ INTEGER,%@ INTEGER, %@ INTEGER)",kEntityUserBadges,kId,kUserBadgeId,kBadgeId,kuserId, kBadgeName,kBadgeValue,kjson,kStatus,ktimeCreated,ktimeModified]];
        
        // Create Player Table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER, %@ BLOB,%@ INTEGER, %@ INTEGER)",kEntityPlayers,kId,kCourseId, kjson,ktimeCreated,ktimeModified]];
        
        //Create clinique_quizLocalStorage table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE IF NOT EXISTS clinique_quizLocalStorage (%@ INTEGER PRIMARY KEY AUTOINCREMENT,userId TEXT,courseId TEXT, modId TEXT,key TEXT, value TEXT,inProgress TEXT)",kId]];
        
        //Create Scorm local stoarge
        [database executeUpdate:@"CREATE TABLE IF NOT EXISTS scorm_Progress_Update(JSONBody TEXT, InteractionJSON TEXT, scormUpdateFlag TEXT, score_raw TEXT, completion_status TEXT, objectives_location TEXT, objectives_scaled TEXT, objectives_min TEXT, objectives_max TEXT, pollId TEXT, pollJSON TEXT, success_status TEXT,modId TEXT,courseId TEXT,userId TEXT)"];
        
        //Create Dependent activity
       [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER, %@ INTEGER,%@ TEXT,%@ BLOB,%@ INTEGER)",kEntityDependentActivity,kId,kModuleId,kuserId, kCompleted,kDependsOn, kjson,kStatus]];
        
        //Create  Completion Table
        [database executeUpdate:[NSString stringWithFormat:@"CREATE TABLE %@ (%@ INTEGER PRIMARY KEY AUTOINCREMENT,%@ INTEGER,%@ INTEGER,%@ INTEGER)",kEntityActivityCompletion,kId,kuserId,kCompletedMoudleId,kStatus]];

        //  tx.executeSql("CREATE TABLE IF NOT EXISTS clinique_quizLocalStorage( courseId TEXT, modId TEXT, key TEXT, value TEXT)",

        [database close];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : createTables %@",exception.description);
    }
    
    
}
#pragma mark - Get Region
-(id)getAllRegionJson{
    @try {
        NSMutableArray *jsonArray   = [NSMutableArray array];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        FMResultSet *results = [database executeQuery:@"SELECT * from Region"];
        
        Region *region = nil;
        while([results next]) {
            region = [Region objectFormRegion:results];
            [jsonArray addObject:[NSJSONSerialization JSONObjectWithData:region.json options:kNilOptions error:nil]];
        }
        [database close];
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getAllRegionJson : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get allCountries
-(id)getAllCountriesJsonForRegion:(NSString *)region{
    @try {
        NSMutableArray *jsonArray   = [NSMutableArray array];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        FMResultSet *results = [database executeQuery:@"SELECT * from Countries where region = ?", region];
        
        Countries *country = nil;
        while([results next]) {
            country = [Countries objectFormCountry:results];
            [jsonArray addObject:[NSJSONSerialization JSONObjectWithData:country.json options:kNilOptions error:nil]];
        }
        [database close];
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
        
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getAllCountriesJsonForRegion : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get all Retailers
-(id)getAllRetailersJsonForRegion:(NSString *)region{
    @try {
        NSMutableArray *jsonArray   = [NSMutableArray array];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        FMResultSet *results = [database executeQuery:@"SELECT * from Retailers where region = ?",region];
        
        Retailers *retailers = nil;
        while([results next]) {
            retailers = [Retailers objectFormRetalier:results];
            [jsonArray addObject:[NSJSONSerialization JSONObjectWithData:retailers.json options:kNilOptions error:nil]];
        }
        [database close];
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getAllRetailersJsonForRegion : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get stores

-(id)getAllStoreJsonForRegion:(NSString *)region andRetailers:(NSString *)retailers andCountry:(NSString *)country{
    @try {
        NSMutableArray *jsonArray   = [NSMutableArray array];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        FMResultSet *results = [database executeQuery:@"SELECT * from Stores where region= ? and country =  ? and retailer = ?", region,country,retailers];
        
        Store *store = nil;
        while([results next]) {
            store = [Store objectFormStore:results];
            [jsonArray addObject:[NSJSONSerialization JSONObjectWithData:store.json options:kNilOptions error:nil]];
        }
        [database close];
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getAllStoreJsonForRegion : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get categories
-(id)getAllCategoriesJson{
    @try {
        NSArray *categories = [Categories getAllCategories];
        
        NSMutableArray *jsonArray   = [NSMutableArray array];
        for (Categories *category in categories){
            [jsonArray addObject:[NSJSONSerialization JSONObjectWithData:category.json options:kNilOptions error:nil]];
        }
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getAllCategoriesJson : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get courses

-(id)getCousersJsonwithUserId:(NSNumber *)userId andCategoryId:(NSNumber *)categoryId{
    @try {
        
        NSArray *courses = [Course getCourseForUserId:userId andCategoryId:categoryId];
        NSMutableArray *jsonArray = [NSMutableArray array];
        for (Course *couse in courses) {
            NSMutableDictionary *courseDict = [NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:couse.json options:kNilOptions error:nil]];
            
            
            if(courseDict[Key_Summary] != [NSNull null] && courseDict[Key_Summary]){
                NSString *summary = courseDict[Key_Summary];
                NSArray *assets  = [Asset getAssetsForReferenceId:couse.courseId];
                
                for (Asset *asset in assets) {
                    NSString *filepath = [CLQHelper getAssetPath:asset];
                    NSString *string = [summary stringByReplacingOccurrencesOfString:asset.urlKey withString:filepath];
                    
                    [courseDict removeObjectForKey:Key_Summary];
                    courseDict[Key_Summary] = string.length > 0 ?string : @"";
                }
                
            }
            
            if(courseDict[Key_Modules] != [NSNull null] && courseDict[Key_Modules ]){
                id object  = courseDict[Key_Modules];
                if([object isKindOfClass:[NSArray class]]){
                    NSArray *moduleArray = (NSArray *)object;
                    NSMutableArray   *modules = [NSMutableArray array] ;
                    for (NSDictionary *moduleDict in moduleArray) {
                        [modules addObjectsFromArray:[Module getModulesForCourseId:couse.courseId andModuleId:@([moduleDict[kId] intValue])]];
                    }

                    [courseDict removeObjectForKey:Key_Modules];
                    courseDict[Key_Modules] = [self getModules:modules];
                }
             
            }
            NSString *startDateStr = courseDict[@"startdate"];
            double unixTimeStamp =[startDateStr doubleValue];
            NSTimeInterval _interval=unixTimeStamp;
            NSDate *startDate = [NSDate dateWithTimeIntervalSince1970:_interval];
            
            NSDate *todayDate = [NSDate date];
            NSDateComponents *dateComponents = [[NSDateComponents alloc] init];
            [dateComponents setDay:-30];
            NSDate *sevenDaysAgo = [[NSCalendar currentCalendar] dateByAddingComponents:dateComponents toDate:todayDate options:0];
           // NSLog(@"\ncurrentDate: %@\nseven days ago: %@ \n start date %@", todayDate, sevenDaysAgo, startDate);
            NSString *courseStatus= @"";
            if([startDate compare:todayDate] == NSOrderedDescending){
                courseStatus = @"Coming Soon";
            }
            else if(([startDate compare:sevenDaysAgo] == NSOrderedDescending || NSOrderedSame) && ([startDate compare:todayDate] == NSOrderedAscending || NSOrderedSame)){
                courseStatus = @"New";
            }
            else{
                courseStatus = @"Old";
            }
            courseDict[@"coursearrival"]   = courseStatus;
            [jsonArray addObject:courseDict];
        }
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch(NSException *exception){
        NSLog(@"Exception : getCousersJsonwithUserId : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get Topics

-(id)getTopicsJsonForCourseId:(NSNumber *)courseId{
    @try {
        
        NSArray *topics = [Topics getTopicsForCourseId:courseId];
        NSMutableArray *jsonArray = [NSMutableArray array];
        
        for (Topics *topic in topics) {
            NSMutableDictionary *topicDict =[NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:topic.json options:kNilOptions error:nil]];
            
            if(topicDict[Key_Summary] &&  topicDict[Key_Summary] != [NSNull null]){
                NSString *summary = topicDict[Key_Summary];
                NSArray *assets  = [Asset getAssetsForReferenceId:topic.topicsId];
                
                for (Asset *asset in assets) {
                    NSString *filepath = [CLQHelper getAssetPath:asset];
                    summary = [summary stringByReplacingOccurrencesOfString:asset.urlKey withString:filepath];
                    
                }
                [topicDict removeObjectForKey:Key_Summary];
                topicDict[Key_Summary] = summary.length > 0 ?summary : @"";
            }
            
            NSArray *modules = [Module getModuleForTopicsId:topic.topicsId andCourseId:courseId];
          ;
            NSArray *modulesArray = [self getModules:modules];
            topicDict[Key_Modules] = modulesArray;
            [jsonArray addObject:topicDict];
            
        }
        return [NSJSONSerialization dataWithJSONObject:jsonArray options:kNilOptions error:nil];
    }
    @catch(NSException *exception){
        NSLog(@"Exception : getTopicsJsonForCourseId : %@", exception.description);
        return nil;
    }
}

#pragma mark - Get modules
-(NSArray *)getModules:(NSArray *)modules{
    NSMutableArray *modulesArray  = [NSMutableArray array];

    for (Module *module in modules) {
        NSArray *assets = [Asset getAssetsForReferenceId:module.moduleId];
        NSMutableDictionary *moduleDict  = [NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil]];
        for (Asset *asset in assets) {
            
            if(moduleDict[Key_Contents] != [NSNull null] && moduleDict[Key_Contents]){
                id contentObject = moduleDict[Key_Contents];
                if([contentObject isKindOfClass:[NSDictionary class]]){
                    NSMutableDictionary *contentDict = [NSMutableDictionary dictionaryWithDictionary:moduleDict[Key_Contents]];
                    if(contentDict[Key_FileUrl]){
                        [contentDict removeObjectForKey:Key_FileUrl];
                        NSString *filePath = [CLQHelper getAssetPath:asset];
                        
                        contentDict[Key_FileUrl] = filePath.length > 0 ? filePath : @"";
                    }
                    
                    [moduleDict removeObjectForKey:Key_Contents];
                    moduleDict[Key_Contents] = contentDict;
                }
                else if([contentObject isKindOfClass:[NSArray class]]){
                    NSArray *contents = (NSArray *)contentObject;
                    NSMutableArray *contentArray = [NSMutableArray array];
                    for (NSDictionary *content in contents) {
                        NSMutableDictionary *contentDict = [NSMutableDictionary dictionaryWithDictionary:content];
                        if(contentDict[Key_FileUrl]){
                            [contentDict removeObjectForKey:Key_FileUrl];
                            NSString *filePath = [CLQHelper getAssetPath:asset];
                            
                            contentDict[Key_FileUrl] = filePath.length > 0 ? filePath : @"";
                        }
                        [contentArray addObject:contentDict];
                    }
                    [moduleDict removeObjectForKey:Key_Contents];
                    moduleDict[Key_Contents] = contentArray;
                }
                
            }
            if(moduleDict[Key_Widget] != [NSNull null] && moduleDict[Key_Widget]){
                
                NSMutableDictionary *widgetDict = [NSMutableDictionary dictionaryWithDictionary:moduleDict[Key_Widget]];
                if(widgetDict[Key_QuestionText] != [NSNull null] && widgetDict[Key_QuestionText]){
                    
                    id object = widgetDict[Key_QuestionText];
                    if([object isKindOfClass:[NSDictionary class]]){
                      
                        NSMutableDictionary *questionDict  =[NSMutableDictionary dictionaryWithDictionary:(NSDictionary *)object] ;
                        
                        for (id obejctKey in questionDict.allKeys) {
                            
                            NSString *key = [NSString stringWithFormat:@"%@",obejctKey];
                            id object = questionDict[key];
                            if([object isKindOfClass:[NSString class]]){
                                
                                NSString *imageUrl = (NSString *)object;
                               // if([imageUrl containsString:asset.urlKey]){
                                    [questionDict removeObjectForKey:key];
                                    imageUrl = [imageUrl stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                    questionDict[key]= imageUrl;
                              //  }
                            }
                        }
                        [widgetDict removeObjectForKey:Key_QuestionText];
                        widgetDict[Key_QuestionText] = questionDict;
                    }
                    else if([object isKindOfClass:[NSArray class]])
                    {
                        NSArray *array = (NSArray *)object;
                        NSMutableArray *questionArray = [NSMutableArray arrayWithArray:array];
                        for (id object in array)
                        {
                            if([object isKindOfClass:[NSString class]])
                            {
                                NSString *imageUrl = (NSString *)object;
                                int index = [questionArray indexOfObject:imageUrl];
                                NSString *url = imageUrl;
                                if([imageUrl isKindOfClass:[NSString class]])
                                {
                                    //if([imageUrl containsString:asset.urlKey])
                                   // {
                                        url =  [url stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                        [questionArray replaceObjectAtIndex:index withObject:url];
                                        
                                    //}
                            }
                            }
                        }
                        [widgetDict removeObjectForKey:Key_QuestionText];
                        widgetDict[Key_QuestionText] = questionArray;
                    }
                    
                    
                }
                if(widgetDict[Key_Question_Answer_Text] != [NSNull null] && widgetDict[Key_Question_Answer_Text]){
                    id object  = widgetDict[Key_Question_Answer_Text];
                    if([object isKindOfClass:[NSArray class]]){
                        NSArray *array = (NSArray *)object;
                        NSMutableArray *questionAnswerArray = [NSMutableArray arrayWithArray:array];
                        for (id object in array) {
                            if([object isKindOfClass:[NSString class]])
                            {
                                NSString *content =  (NSString *)object;
                            
                            if([content isKindOfClass:[NSString class]])
                            {
                                //if([content containsString:asset.urlKey]){
                                    int index = [questionAnswerArray indexOfObject:content];
                                    NSString *string = content;
                                    string = [string stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                    [questionAnswerArray replaceObjectAtIndex:index withObject:string];
                               // }
                                }
                            }
                        }
                        [widgetDict removeObjectForKey:Key_Question_Answer_Text];
                        widgetDict[Key_Question_Answer_Text] = questionAnswerArray;
                    }
                }
                if(widgetDict[Key_Answertext] != [NSNull null] && widgetDict[Key_Answertext]){
                    id object  = widgetDict[Key_Answertext];
                    if([object isKindOfClass:[NSArray class]]){
                        NSArray *array = (NSArray *)object;
                        NSMutableArray *answerArray = [NSMutableArray arrayWithArray:array];
                        for (id object in array) {
                            if([object isKindOfClass:[NSString class]]){
                                NSString *content = (NSString *)object;
                               // if([content containsString:asset.urlKey]){
                                    int index = [answerArray indexOfObject:content];
                                    NSString *string = content;
                                    string = [string stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                    [answerArray replaceObjectAtIndex:index withObject:string];
                               // }
                            }
                        }
                        [widgetDict removeObjectForKey:Key_Answertext];
                        widgetDict[Key_Answertext] = answerArray;
                        
                    }
                }
                [moduleDict removeObjectForKey:Key_Widget];
                moduleDict[Key_Widget] = widgetDict;
            }
            
            if(moduleDict[Key_Quiz] != [NSNull null] && moduleDict[Key_Quiz]){
                NSDictionary *quizDict = [self getQuizDictionary:moduleDict forAsset:asset];
                [moduleDict removeObjectForKey:Key_Quiz];
                moduleDict[Key_Quiz] = quizDict;
            }
            if(moduleDict[kModName] != [NSNull null] && moduleDict[kModName]){
                NSString *modName = moduleDict[kModName];
                if([modName caseInsensitiveCompare:kScormType]== NSOrderedSame){
                    moduleDict[kManiFestPath] =  [CLQHelper getScormPathForModuleId:[asset.referenceId stringValue]];
                }
            }
            
        }
        //change favorite key
        if(moduleDict[Key_Favorite] != [NSNull null] && moduleDict[Key_Favorite]){
            Favorite *favorite  = [Favorite getFavoritesForModuleId:module.moduleId andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
            [moduleDict removeObjectForKey:Key_Favorite];
            if(favorite != nil){
                
                moduleDict[Key_Favorite] = @"Yes";
            }
            else{
                moduleDict[Key_Favorite] = @"No";
            }
        }
        // Change show availability based on dependent activity
        
        
        DependentActivities *dependent   = [DependentActivities getDependentActivitiesForModuleId:@([moduleDict[kId] intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(dependent != nil){
            NSArray * dependsOn = [dependent.dependsOn componentsSeparatedByString:@","];
            NSMutableArray *remainingActivityIDs  = [NSMutableArray array];
            for (NSString *activityId in dependsOn) {
                CompletedActivities *completedActivities = [CompletedActivities getCompletedActivitiesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId andModuleId:@([activityId intValue])];
                
                if(completedActivities == nil){
                    [remainingActivityIDs addObject:activityId];
                }
            }
            int status = 0;

            if(remainingActivityIDs.count > 0){
                status = 2;
            }
            else
                status = 1;
    
            if(moduleDict[Key_ShowAvailability]){
                [moduleDict removeObjectForKey:Key_ShowAvailability];
               
            }
             moduleDict[Key_ShowAvailability] = @(status);
            
        }
        moduleDict[Key_DependentFlag]  = @(0);
        NSArray *dependents = [DependentActivities getAllDependentActivitiesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        BOOL isAvailable = NO;
        for (id object in dependents) {
            if(!isAvailable){
                DependentActivities *dependentObject = (DependentActivities *)object;
                NSArray *dependsOn  = [dependentObject.dependsOn componentsSeparatedByString:@","];
                if([dependsOn containsObject:moduleDict[kId] ]){
                    isAvailable   = YES;
                    moduleDict[Key_DependentFlag]  = @(1);
                    break;
                }
            }
            else{
                break;
            }
        }
        
        [modulesArray addObject:moduleDict];
        // topicDict[Key_Modules] = modulesArray;
    }
    return [NSArray arrayWithArray:modulesArray];
}

-(id)getContentDictionary:(NSDictionary *)dict{
    return nil;
}

-(id)getQuizDictionary:(NSDictionary *)dict forAsset:(Asset *)asset{
    @try {
        NSMutableDictionary *quizDict  = [NSMutableDictionary dictionaryWithDictionary:dict[Key_Quiz]];
        NSMutableArray *quizListArray = [NSMutableArray array];
        NSMutableArray *quizInfoArray = [NSMutableArray array];
        NSArray *array  = quizDict[Key_QuizList];
        for (NSDictionary *quizlist in array)
        {
            NSMutableDictionary *quizListDict = [NSMutableDictionary dictionaryWithDictionary:quizlist];
            if(quizListDict[Key_Questions] != [NSNull null] && quizListDict[Key_Questions])
            {
                NSArray *questions = quizListDict[Key_Questions];
                NSMutableArray *questionsArray   = [NSMutableArray array];
                for (NSDictionary *quesDict in questions)
                {
                    NSMutableDictionary *questionDict = [NSMutableDictionary dictionaryWithDictionary:quesDict];
                    
                    if(questionDict[Key_Question] != [NSNull null] && questionDict[Key_Question])
                    {
                        NSString *question =questionDict[Key_Question];
                       // if([question containsString:asset.urlKey])
                        //{
                            NSString *string = [question stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                            [questionDict removeObjectForKey:Key_Question];
                            questionDict[Key_Question] = string;
                        //}
                    }
                    
                    if(questionDict[Key_Choices] != [NSNull null] && questionDict[Key_Choices])
                    {
                        NSArray *choices =questionDict[Key_Choices];
                        NSMutableArray *choicesArray  = [NSMutableArray array];
                        for (NSDictionary *choice in choices)
                        {
                            NSMutableDictionary *choiceDict = [NSMutableDictionary dictionaryWithDictionary:choice];
                            if(choiceDict[Key_Label] != [NSNull null] && choiceDict[Key_Label])
                            {
                                NSString *choiceString = choiceDict[Key_Label];
                               // if([choiceString containsString:asset.urlKey])
                               // {
                                    NSString *string  = [choiceString stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                    [choiceDict removeObjectForKey:Key_Label];
                                    choiceDict[Key_Label] = string;
                               // }
                            }
                            if(choiceDict[Key_SubQuestion] != [NSNull null] && choiceDict[Key_SubQuestion])
                            {
                                NSString *choiceString = choiceDict[Key_SubQuestion];
                                // if([choiceString containsString:asset.urlKey])
                                // {
                                NSString *string  = [choiceString stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                [choiceDict removeObjectForKey:Key_SubQuestion];
                                choiceDict[Key_SubQuestion] = string;
                                // }
                            }
                            [choicesArray addObject:choiceDict];
                        }
                        [questionDict removeObjectForKey:Key_Choices];
                        questionDict[Key_Choices] = choicesArray;
                    }
                    [questionsArray addObject:questionDict];
                }
                if(quizListDict[Key_Questions])
                {
                    [quizListDict removeObjectForKey:Key_Questions];
                   quizListDict[Key_Questions] = questionsArray;
                }
            }

            [quizListArray addObject:quizListDict];
        }
        if(quizDict[Key_QuizList]){
            [quizDict removeObjectForKey:Key_QuizList];
            quizDict[Key_QuizList]  = quizListArray;
        }
        NSArray *quizInfos = quizDict[Key_Quiz_Info];
        for (NSDictionary *quizInfo in quizInfos)
        {
             NSMutableDictionary *quizInfoDict = [NSMutableDictionary dictionaryWithDictionary:quizInfo];
            if(quizInfoDict[Key_FeedBack] != [NSNull null] && quizInfoDict[Key_FeedBack])
            {
                NSMutableArray *feedBackArray  = [NSMutableArray array];
                NSArray *feedbacks = quizInfoDict[Key_FeedBack];
                for (NSDictionary *feedBack in feedbacks) {
                    NSMutableDictionary *feedbackDict  = [NSMutableDictionary dictionaryWithDictionary:feedBack];
                    if(feedBack[Key_Feedbacktext] != [NSNull null] && feedBack[Key_Feedbacktext]){
                        NSString *feedbackUrl = [NSString stringWithFormat:@"%@",feedBack[Key_Feedbacktext]];
                        NSString *string  = [feedbackUrl stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                        [feedbackDict removeObjectForKey:Key_Feedbacktext];
                        feedbackDict[Key_Feedbacktext] = string;
                        
                    }
                    [feedBackArray addObject:feedbackDict];
                }
                if(quizInfoDict[Key_FeedBack]){
                    [quizInfoDict removeObjectForKey:Key_FeedBack];
                    quizInfoDict[Key_FeedBack]  = feedBackArray;
                }
            }
            [quizInfoArray addObject:quizInfoDict];
        }
        
        
        if(quizDict[Key_Quiz_Info]){
            [quizDict removeObjectForKey:Key_Quiz_Info];
            quizDict[Key_Quiz_Info]  = quizInfoArray;
        }
        return quizDict;
        
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getQuizDictionary :%@",exception.description);
        return [NSDictionary dictionary];
    }

  }
-(id)getWidgetDictionary:(NSDictionary *)dict{
    return nil;
}



#pragma mark - Get favorites

-(id)getFavoritesJson{
    @try {
        NSArray *favorites = [Favorite getFavoritesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        NSMutableDictionary *jsonDict = [NSMutableDictionary dictionary];
        int index = 0;
        for (int i= 0; i< favorites.count ; i++) {
            Favorite *favorite= favorites[i];
           
            
            NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:favorite.json options:kNilOptions error:nil]];
            
            Module *module = [Module getModuleForModuleId:@([dict[key_CourseModuleid] intValue])]; // add modules to fav dict
            if(module != nil){
                 NSString *key = [NSString stringWithFormat:@"%d",index];
                index = index+1;
                NSArray *modules = [self getModules:@[module]];
                if(modules.count > 0){
                    dict[@"module"] = modules[0];
                }
                if(dict[kfileType] && dict[kfileType] != [NSNull null]){ // add scorm module manualy
                    NSString *fileType  =dict[kfileType];
                    if([fileType isEqualToString:kScormType]){
                        dict[kManiFestPath] =dict[Key_Url];
                        dict[kModName]  = dict[kfileType];
                    }
                    else if ([fileType isEqualToString:Key_Quiz]){
                        
                        
                    }
                }
                
                if(dict[Key_Url] != [NSNull null] && dict[Key_Url]){
                    
                    
                    NSArray *assets = [Asset getAssetsForReferenceId:dict[key_CourseModuleid]];
                    for (Asset *asset in assets) {
                        if(dict[kManiFestPath]){ // replace scorm asset url
                            NSString *filePath  =  [CLQHelper getScormPathForModuleId:[asset.referenceId stringValue]];
                            NSString *manifestpath = dict[kManiFestPath];
                            manifestpath = [manifestpath stringByReplacingOccurrencesOfString:asset.urlKey withString:filePath];
                            [dict removeObjectForKey:kManiFestPath];
                            dict[kManiFestPath] =filePath;
                        }
                        else{
                            NSString *filePath  =  [CLQHelper getAssetPath:asset];
                            NSString *url = dict[Key_Url];
                            url = [url stringByReplacingOccurrencesOfString:asset.urlKey withString:filePath];
                            [dict removeObjectForKey:Key_Url];
                            dict[Key_Url] =filePath;
                        }
                    }
                }
                jsonDict[key] = dict;

            }
        }
         NSArray *notes = [Notes getNotesForModuleId:nil andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        
        jsonDict[Key_Resource_comment_count] = @(notes.count);
        NSDictionary *dict = @{Key_Error : @(0), Key_Message :Key_Success,Key_Response : jsonDict};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    @catch(NSException *exception){
        NSDictionary *dict = @{Key_Error : @(1), Key_Message :Key_Error ,Key_Response : [NSDictionary dictionary]};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        NSLog(@"Exception : getTopicsJsonForCourseId : %@", exception.description);
        
    }
}

#pragma mark- Get Notes
-(id)getNotesJsonForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId{
    @try {
        
        NSArray *notes = [Notes getNotesForModuleId:moduleId andUserId:userId];
        NSMutableArray *notesArray = [NSMutableArray array];
        for (int i =0 ; i < notes.count; i++) {
            Notes *note = notes[i];
            //NSString *key = [NSString stringWithFormat:@"%d",i];
           // jsonDict[key] = [NSJSONSerialization JSONObjectWithData:note.json options:kNilOptions error:nil];
            [notesArray addObject:[NSJSONSerialization JSONObjectWithData:note.json options:kNilOptions error:nil]];
            
        }
        NSDictionary *dict  = [NSDictionary dictionary];
        if(moduleId == nil){
            dict = @{Key_Error : @(0), Key_Message :Key_Success,Key_Response :@{Key_Data : notesArray,Key_TotalCount : @(notesArray.count)}};
        }
        else{
            dict = @{Key_Error : @(0), Key_Message :Key_Success,Key_Response : notesArray};
        }
      
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    @catch(NSException *exception){
        NSLog(@"Exception : getNotesJsonForModuleId : %@", exception.description);
        NSDictionary *dict = @{Key_Error : @(1), Key_Message :Key_Error,Key_Response : [NSDictionary dictionary]};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        
    }
}

#pragma mark _ Get Bookmarks
-(void)getBookmarksJsonForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId withCompletion:(void(^)(Bookmarks *bookMark, BOOL completed))completion{
    @try {
        NSArray *bookmarks = [Bookmarks getBookMarksForModuleId:moduleId andUserId:userId];
        if(bookmarks.count > 0){
            Bookmarks *bookmark = bookmarks[0];
            NSArray *pageNumbers = [bookmark.pageNumbers componentsSeparatedByString:@","];
            [CacheManager defaultManager].currentCache.bookMarks = [NSMutableArray array];
            for (NSString *pageNumber in pageNumbers ) {
                if(![[CacheManager defaultManager].currentCache.bookMarks containsObject:@([pageNumber intValue])])
                [[CacheManager defaultManager].currentCache.bookMarks addObject:@([pageNumber intValue])];
            }
            [[CacheManager defaultManager]saveCache];
            completion(bookmark ,YES);
        }
    }
    @catch(NSException *exception){
        NSLog(@"Exception : getBookmarksJsonForModuleId : %@", exception.description);
        completion(nil,NO);
    }
}

#pragma mark - Get progress
-(id)getProgressJsonForUserId:(NSNumber *)userId{
    @try {
        NSMutableArray *courseIds = [NSMutableArray array];
        NSMutableArray *courseNames = [NSMutableArray array];
        NSMutableArray *courseScores = [NSMutableArray array];
        NSMutableDictionary *courses = [NSMutableDictionary dictionary];
        int  totalScore = 0;
        NSArray *progressArray  = [Progress getProgressForUserId:userId];
        progressArray  = [progressArray sortedArrayUsingDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:@"self.courseIndex" ascending:YES]]];
        
        for (Progress *progress in progressArray) {
            [courseIds addObject: progress.courseId != nil ? progress.courseId : @(0)];
            [courseNames addObject: progress.courseName.length > 0 ? progress.courseName : @""];
            NSString *courseScore =[NSString stringWithFormat:@"%@",progress.courseScore];
            if(courseScore.length == 0)
                courseScore = @"0";
            [courseScores addObject:courseScore];
            NSLog(@"progress.courseScore : %f", [progress.courseScore doubleValue] );
            totalScore = totalScore +[courseScore intValue];
            NSArray *quizCourses = [QuizCourse getQuizCourseForCourseRefId:progress.courseId];
            
            NSMutableArray *names = [NSMutableArray array];
            NSMutableArray *scores = [NSMutableArray array];
            
            for (QuizCourse *quizCourse in quizCourses) {
                [names addObject:quizCourse.quizName.length > 0 ? quizCourse.quizName : @""];
                NSString *quizScore =[NSString stringWithFormat:@"%f",quizCourse.score];
                if(quizScore.length == 0)
                    quizScore = @"0";
                [scores addObject:quizScore];
            }
            NSString *courseId  = [NSString stringWithFormat:@"%@",progress.courseId];
            courses[courseId] =@{Key_Quiz :@{kName : names,Key_Score : scores}};
        }
        NSDictionary *jsonDict =  @{Key_Error : @(0),
                                    Key_Message: @"done",
                                    Key_Response :  @{Key_Course_Id : courseIds, Key_CourseName : courseNames, Key_CourseScore : courseScores, Key_Course : courses,Key_Totalscore  :@(totalScore)
                                                      }};
        return [NSJSONSerialization dataWithJSONObject:jsonDict options:kNilOptions error:nil];
    }
    @catch(NSException *exception){
        NSLog(@"Exception : getProgressJsonForUserId : %@", exception.description);
        NSDictionary *jsonDict =  @{Key_Error : @(1),
                                    Key_Message: @"error",
                                    Key_Response :  @{}};
        return [NSJSONSerialization dataWithJSONObject:jsonDict options:kNilOptions error:nil];;
    }
    
}

#pragma mark - Get Players
-(id)getPlayerJsonForUserId:(NSNumber *)userId andCourseId:(NSNumber *)courseId{
    @try {
        Players *player  = [Players getPlayerForCourseId:courseId];
        NSMutableDictionary *playerDict = [NSMutableDictionary dictionary];
        if(player != nil){
            playerDict  =[NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:player.json options:kNilOptions error:nil]];
            
            if(playerDict[Key_User_Id] != [NSNull null] && playerDict[Key_Totalscore] != [NSNull null]){
                
                NSArray *users = playerDict[Key_User_Id];
                NSMutableArray *totalScore = playerDict[Key_Totalscore];
                
                if([users containsObject:userId]){
                    
                    int index = [users indexOfObject:userId];
                    if(totalScore.count > index){
                        Progress *progress = [Progress getProgressForCourseId:courseId andUserId:userId];
                        [totalScore replaceObjectAtIndex:index withObject:progress.courseScore];
                    }
                    [playerDict removeObjectForKey:Key_Totalscore];
                    playerDict[Key_Totalscore] = totalScore;
                }
            }

        }
        NSDictionary *dict = @{Key_Error : @(0), Key_Message : @"done", Key_Response : playerDict};
        
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getPlayerJsonForUserId : %@", exception.description);
        NSDictionary *dict = @{Key_Error : @(1), Key_Message : @"error", Key_Response :[NSDictionary dictionary]};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
}


#pragma mark -  Get Badges
-(id)getBadgesForUserId:(NSNumber *)userId{
    @try {
        //Get badges
        NSMutableArray *badges  = [NSMutableArray array];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        FMResultSet *results = [database executeQuery:@"SELECT * from Badges"];
        
        Badges *badge = nil;
        while([results next]) {
            badge = [Badges objectFromBadges:results];
            [badges addObject:[NSJSONSerialization JSONObjectWithData:badge.json options:kNilOptions error:nil]];
        }
        [database close];
        
        // Get user badges
        NSMutableArray *userBadges = [NSMutableArray array];
        database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        results = [database executeQuery:@"SELECT * from UserBadges where userId = ?", [CLQDataBaseManager dataBaseManager].currentUser.userId];
        
        UserBadges *userBadge = nil;
        while([results next]) {
            userBadge = [UserBadges objectFromUserBadges:results];
            [userBadges addObject:[NSJSONSerialization JSONObjectWithData:userBadge.json options:kNilOptions error:nil]];
        }
        [database close];
        NSDictionary *dict = @{ Key_Error : @(0), Key_Message : @"done", Key_Response :@{Key_Badges : badges, Key_Userbadges : userBadges}};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        
        NSLog(@"Exception : getBadgesForUserId : %@", exception.description);
        NSDictionary *dict = @{Key_Error : @(1), Key_Message : @"error", Key_Response :[NSDictionary dictionary]};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
}

#pragma mark - Get Dependent activities
-(id)getDependentActivities{
   /* @try {
        NSArray *dependentActivities = [DependentActivities getAllDependentActivities];
        NSMutableArray *dependents = [NSMutableArray array];
        for (DependentActivities *dependent in  dependentActivities) {
            [dependents addObject:[NSJSONSerialization JSONObjectWithData:dependent.json options:kNilOptions error:nil]];
            
        }
        NSArray * completedModules  = [DependentActivities getCompletedStatusIds];
        NSDictionary *dict = @{ Key_Error : @(0), Key_Message : @"done", Key_Response :@{Key_Module_Dependencies :dependents,Key_CompletedModules : completedModules}};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getDependentActivities : %@", exception.description);
        NSDictionary *dict = @{Key_Error : @(1), Key_Message : @"error", Key_Response :[NSDictionary dictionary]};
        return [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        
    }*/
    return nil;
}

@end

