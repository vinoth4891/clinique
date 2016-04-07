//
//  Course.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Course.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "UserMapping.h"
#import "Asset.h"
#import "CLQHelper.h"
#import "Module.h"

@implementation Course

@synthesize  activateTime;
@synthesize courseId;
@synthesize assetArray;
@synthesize json;
@synthesize status;
@synthesize timeCreated;
@synthesize timeModified;

-(NSDictionary *)dictionaryFromObject:(Course *)course{
    NSDictionary *dict  = [NSDictionary dictionary];
    
    return dict;
}

+(id)objectFromCourse:(id )object{
    
    Course    *course = [[Course alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        course.courseId  =  @([results intForColumn:kCourseId]);
        course.categoryId =  @([results intForColumn:kCategoryId]);
    
        course.json = [results dataForColumn:kjson];
        
        course.timeModified = @([results intForColumn:ktimeModified]);
        course.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if( dict[kId] != [NSNull null])
            course.courseId = @([dict[kId] integerValue]);
        
        if( dict[Key_Category_Id] != [NSNull null])
            course.categoryId = @([dict[Key_Category_Id] integerValue]);
        
        if(dict[kActivateTime] != [NSNull null])
            course.activateTime  = dict[kActivateTime];
        
        course.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        if(dict[Key_Summary] != [NSNull null]){
            course.assetArray = [self getAssetDict:@{Key_Images : [Course getImageUrls:dict[Key_Summary]], kRefrenceId : course.courseId,kAssetGroup : kAsset_Course,Key_Type : kAsset_Course} ];
        }
        
        if(dict[ktimeCreated] != [NSNull null])
            course.timeCreated = dict[ktimeCreated] ;
        
        if(dict[ktimeModified] != [NSNull null])
            course.timeModified  = dict[ktimeModified];
    }
    return course;

}

+(id)getAssetDict:(NSDictionary *)dict{
    NSMutableArray *assetsArray = [NSMutableArray array];
    NSDictionary *imageUrlsDict  = [NSDictionary dictionaryWithDictionary:dict[Key_Images]];
    
    for (NSString *key  in imageUrlsDict.allKeys) {
        NSString *imageurl = imageUrlsDict[key];
        // make asset details dict
        if(imageurl != nil && dict[kRefrenceId] != nil){
            NSString *filename =[imageurl lastPathComponent].length > 0 ? [imageurl lastPathComponent] : @"";
            NSString *fileType = [[imageurl lastPathComponent]pathExtension].length > 0 ? [[imageurl lastPathComponent]pathExtension] : @"";
            NSDictionary *assetDict = @{kRefrenceId : dict[kRefrenceId],
                                        Key_FileName :filename,
                                        Key_Type :fileType,
                                        Key_FileUrl  : imageurl.length > 0 ? imageurl : @"",
                                        kUrlKey :imageurl.length > 0 ?imageurl : @"",
                                        kAssetGroup : dict[kAssetGroup],
                                        kAssetIndex : dict[kAssetIndex] ? dict[kAssetIndex] : @([key intValue]),
                                        Key_Type :dict[Key_Type]
                                        };

            [assetsArray addObject:assetDict];
        }
    }
    return [NSArray arrayWithArray:assetsArray];
}

+(Course *)getCourseForCourseId:(NSNumber *)courseId andCategoryId:(NSNumber *)categoryId{

    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results;
    if(categoryId != nil)
        results = [database executeQuery:@"SELECT * from Courses where courseId= ? and categoryId = ?",courseId,categoryId];
    else
        results = [database executeQuery:@"SELECT * from Courses where courseId= ? ",courseId];
    
    Course *course = nil;
    while([results next]) {
        course = [Course objectFromCourse:results];
    }
    [database close];
    return course;
}

+(void)saveCourse:(NSDictionary *)dict{
    @try {
        Course *course = [Course getCourseForCourseId:@([dict[kId] intValue]) andCategoryId:@([dict[Key_Category_Id] intValue])];
        if(course == nil){
            [Course insertCourse:dict];
        }
        else{
            if([CLQHelper isLastModifiedChanged:course.timeModified withServerTimeStamp:dict[ktimeModified]])
              [Course updateCourse:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveCourse :%@",exception.description);
    }

}

+(void)insertCourse:(NSDictionary *)dict{
    Course *course = [Course objectFromCourse:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Courses (courseId,categoryId, json,timecreated,timemodified) VALUES (?,?, ?, ?, ?)",course.courseId,course.categoryId ,course.json, course.timeCreated,course.timeModified, nil];
 
    [database close];
    [UserMapping saveUserMapping:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId, kRefrenceId : course.courseId, kUserMappingType :kUser_Mapping_Group_Course}];
    if(course.assetArray != nil)
        [Asset saveAsset:@{kAsset :course.assetArray}];
    //[Course saveModules:dict];
   
}

+(void)updateCourse:(NSDictionary *)dict{
    Course *course = [Course objectFromCourse:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Courses set courseId= ? ,categoryId = ?, json= ?, timecreated= ?,timemodified= ? where courseId= ?", course.courseId, course.categoryId, course.json,course.timeCreated ,course.timeModified,course.courseId, nil];
    [database close];
    [UserMapping saveUserMapping:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId, kRefrenceId : course.courseId, kUserMappingType :kUser_Mapping_Group_Course}];
    if(course.assetArray != nil)
        [Asset saveAsset:@{kAsset : course.assetArray}];
    //[Course saveModules:dict];
}


+(id)getCourseForUserId:(NSNumber *)userId andCategoryId:(NSNumber *)categoryId{
    
    @try {
        NSMutableArray *courses = [NSMutableArray array];
        
        NSArray *userMappings = [UserMapping getUserMappingWithParams:@{kuserId:userId, kUserMappingType : kUser_Mapping_Group_Course}];
        
        for (UserMapping *userMapping in userMappings) {
            FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
            [database open];
            FMResultSet *results = [database executeQuery:@"SELECT * from Courses where courseId= ? and categoryId = ?",userMapping.refrenceId,categoryId];
            //FMResultSet *results = [database executeQuery:@"SELECT * from Courses where courseId= ?",userMapping.refrenceId];
            Course *course = nil;
            while([results next]) {
                course = [Course objectFromCourse:results];
                course.courseOrder= userMapping.courseOrder;
                NSLog(@"Course :%@",course.courseId);
                [courses addObject:course];
            }
           
            [database close];
            
        }
        NSArray *sortedArray;
        sortedArray = [courses sortedArrayUsingComparator:^NSComparisonResult(id a, id b) {
            NSNumber *first = [(Course*)a courseOrder];
            NSNumber *second = [(Course*)b courseOrder];
            return [first compare:second];
        }];
        return [NSArray arrayWithArray:sortedArray];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : getCourseForUserId :%@", exception.description);
    }

   
}

+(NSDictionary *)getImageUrls:(NSString *)htmlString{
    NSMutableDictionary *imageUrls = [NSMutableDictionary dictionary];
    NSString *url = nil;
    if([htmlString hasPrefix:@"http"]){
        imageUrls[@(0)] = htmlString;
    }
    else{
        NSScanner *theScanner = [NSScanner scannerWithString:htmlString];
        // find start of IMG tag
        [theScanner scanUpToString:@"<img" intoString:nil];
        int i= 0;
        while (![theScanner isAtEnd]) {
            url = nil;
            [theScanner scanUpToString:@"src" intoString:nil];
            NSCharacterSet *charset = [NSCharacterSet characterSetWithCharactersInString:@"\"'"];
            [theScanner scanUpToCharactersFromSet:charset intoString:nil];
            [theScanner scanCharactersFromSet:charset intoString:nil];
            [theScanner scanUpToCharactersFromSet:charset intoString:&url];
            if(url != nil){
                if([url hasPrefix:@"http"])
                    imageUrls[@(i)] = url;
            }
            i++;
            // "url" now contains the URL of the img
        }

    }
       return [NSDictionary dictionaryWithDictionary:imageUrls];
}

+(void)deleteCourseAndModules:(NSMutableArray *)activeCourseIds andActiveModuleIds:(NSMutableArray *)moduleIds{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
   
    NSLog(@"activeCourseIds :%@",activeCourseIds);
    NSLog(@"andActiveModuleIds :%@",moduleIds);

   // FMResultSet *results = [database executeQuery:@"SELECT * from Courses"];
    FMResultSet *results = [database executeQuery:@"SELECT * from UserMappings where userId= ?  and mappingType = ?",[CLQDataBaseManager dataBaseManager].currentUser.userId, kUser_Mapping_Group_Course];
    while([results next]) {
        
        NSNumber *courseId = @([results intForColumn:kRefrenceId]);
         NSLog(@"Course ID :%@", courseId);
        if([activeCourseIds containsObject:[courseId stringValue]]){
            [activeCourseIds removeObject:[courseId stringValue]];
        }
        else if ([activeCourseIds containsObject:courseId]){
            [activeCourseIds removeObject:courseId ];
        }
        else{
            [activeCourseIds addObject:[courseId stringValue]];
        }
        
        FMResultSet *moduleResults = [database executeQuery:@"SELECT * from Modules where courseId= ?",@([courseId intValue])];
        
        while([moduleResults next])
        {
            NSNumber *moduleId = @([moduleResults intForColumn:kModuleId]);
            if([moduleIds containsObject:[moduleId stringValue]])
                [moduleIds removeObject:[moduleId stringValue]];
            else if ([moduleIds containsObject:moduleId])
            {
                [moduleIds removeObject:moduleId];
            }
            else
                [moduleIds addObject:[moduleId stringValue]];
        }
    }
    if(moduleIds.count > 0){// Delete modules
        for (NSString *moduleId in moduleIds) {
           [database executeUpdate:@"DELETE FROM Modules WHERE moduleId = ?", @([moduleId intValue])];
        }
        
    }
    if(activeCourseIds.count > 0){// Delete course
        for (NSString *courseId in activeCourseIds) {
            
           [database executeUpdate:@"DELETE  from UserMappings where userId= ? and refrenceId= ? and mappingType = ?",[CLQDataBaseManager dataBaseManager].currentUser.userId, @([courseId intValue]), kUser_Mapping_Group_Course];
        //[database executeUpdate:@"DELETE FROM Courses WHERE courseId = ?", @([courseId intValue])];
        }
    }
    [database close];

}

@end
