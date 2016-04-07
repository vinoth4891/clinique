//
//  Topics.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Topics.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "CLQHelper.h"
#import "Course.h"
#import "Module.h"

@implementation Topics

@synthesize  courseId;
@synthesize json;
@synthesize timeCreated;
@synthesize timeModified;
@synthesize topicsId;

+(id)objectFromTopics:(id )object{
    Topics    *topic = [[Topics alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        topic.courseId  =  @([results intForColumn:kCourseId]);
        topic.topicsId = @([results intForColumn:kTopicsId]);
        
        topic.json = [results dataForColumn:kjson];
        
        topic.timeModified =@([results intForColumn:ktimeModified]);
        topic.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kId] != [NSNull null])
            topic.topicsId = @([dict[kId] integerValue]);
        
        if( dict[Key_CourseId] != [NSNull null])
            topic.courseId = @([dict[Key_CourseId] integerValue]);
        
        if(dict[Key_Summary] != [NSNull null]){
            Course *course= [Course getCourseForCourseId:topic.courseId andCategoryId:nil];
            if(course != nil){
                if([course.categoryId intValue] != 2){
                    topic.assetArray = [Course getAssetDict:@{Key_Images : [Course getImageUrls:dict[Key_Summary]], kRefrenceId : topic.topicsId,kAssetGroup : kAsset_Topics,Key_Type : kAsset_Topics} ];
                }
            }
        }
        if(dict[ktimeCreated] != [NSNull null])
            topic.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            topic.timeModified  = dict[ktimeModified];
        
        NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        topic.json= data;
        
    }
    return topic;
}

+(Topics *)getTopicsForTopicsId:(NSNumber *)topicsId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Topics where topicsId= ?",topicsId];
    
    Topics *topic = nil;
    while([results next]) {
        topic = [Topics objectFromTopics:results];
    }
    [database close];
    return topic;
}

+(void)saveTopics:(NSDictionary *)dict{
    @try {
        Topics *course = [Topics getTopicsForTopicsId:@([dict[kId] intValue])];
        if(course == nil){
            [Topics insertTopics:dict];
        }
        else{
            if([CLQHelper isLastModifiedChanged:course.timeModified  withServerTimeStamp:dict[ktimeModified]])
              [Topics updateTopics:dict];
        }
        
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveTopics :%@",exception.description);
    }
}

+(void)insertTopics:(NSDictionary *)dict{
    Topics *topics = [Topics objectFromTopics:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Topics (topicsId,courseId, json,timecreated,timemodified) VALUES (?, ?, ?, ?,?)",topics.topicsId,topics.courseId ,topics.json, topics.timeCreated,topics.timeModified, nil];
    [database close];
    if(topics.assetArray != nil)
        [Asset saveAsset:@{kAsset :topics.assetArray}];
    //[Topics saveModules:dict];
}

+(void)updateTopics:(NSDictionary *)dict{
    Topics *topics = [Topics objectFromTopics:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Topics set courseId= ?, json= ?, timecreated= ?,timemodified= ? where topicsId= ?",topics.courseId,topics.json,topics.timeCreated ,topics.timeModified,topics.topicsId, nil];
    [database close];
    if(topics.assetArray != nil)
        [Asset saveAsset:@{kAsset :topics.assetArray}];
   // [Topics saveModules:dict];
    
}

+(void)saveModules:(NSDictionary *)dict{
    if(dict[Key_Modules] != [NSNull null] && dict[Key_Modules]){
        id object = dict[Key_Modules] ;
        if([object isKindOfClass:[NSArray class]]){
            NSArray *modules = (NSArray *)object;
            for (id modulesObject in modules) {
                if([modulesObject isKindOfClass:[NSDictionary class]]){
                    NSDictionary *moduleDict = (NSDictionary *)modulesObject;
                    NSMutableDictionary *module  = [NSMutableDictionary dictionaryWithDictionary:moduleDict];
                    module[Key_Topic_Id] =dict[kId];
                    [Module saveModule:[NSDictionary dictionaryWithDictionary:module]];
                }
            }
        }
    }
}

+(id)getTopicsForCourseId:(NSNumber *)courseId{
    NSMutableArray *topics = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Topics where courseId= ?",courseId];
    
    Topics *topic = nil;
    while([results next]) {
        topic = [Topics objectFromTopics:results];
        [topics addObject:topic];
    }
    [database close];
    return [NSArray arrayWithArray:topics];
}

@end
