//
//  DependentActivities.m
//  Clinique
//
//  Created by ANANTHAN_S on 17/04/15.
//
//

#import "DependentActivities.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation DependentActivities

+(id)objectFromDependentActivities:(id )object{
    DependentActivities    *dependent = [[DependentActivities alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        dependent.moduleId  =  @([results intForColumn:kModuleId]);
        dependent.json = [results dataForColumn:kjson];
        dependent.completed = @([results intForColumn:kCompleted]);
        dependent.userId=@([results intForColumn:kuserId]);
        dependent.dependsOn =[results stringForColumn:kDependsOn];
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        if( dict[kId])
            dependent.moduleId = @([dict[kId] integerValue]);
        if(dict[kStatus])
            dependent.status = @([dict[kStatus] integerValue]);
        if(dict[Key_Depends_On])
        {
            dependent.dependsOn = [dict[Key_Depends_On] componentsJoinedByString:@","];
        }
        dependent.userId = [CLQDataBaseManager dataBaseManager].currentUser.userId;
        NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        dependent.json= data;
    }
    return dependent;
}

+(DependentActivities *)getDependentActivitiesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from DependentActivities where moduleId= ? and userId = ?",moduleId,userId];
    
    DependentActivities *dependent = nil;
    while([results next]) {
        dependent = [DependentActivities objectFromDependentActivities:results];
    }
    [database close];
    return dependent;
}

+(void)saveDependentActivity:(NSDictionary *)dict
{
    @try {
        DependentActivities *dependent = [DependentActivities getDependentActivitiesForModuleId:@([dict[kId] intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(dependent == nil){
            [DependentActivities insertDependentActivities:dict];
        }
        else{
            if([dependent.status intValue] != 1)
               [DependentActivities updateDependentActivities:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveUserMapping :%@",exception.description);
    }
}

+(void)insertDependentActivities:(NSDictionary *)dict
{
    DependentActivities *dependent = [DependentActivities objectFromDependentActivities:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO DependentActivities (moduleId,userId,json,completed, dependsOn) VALUES (?,?, ?, ?,?)",dependent.moduleId,dependent.userId ,dependent.json,dependent.completed ,dependent.dependsOn, nil];
    
    [database close];
}

+(void)updateDependentActivities:(NSDictionary *)dict
{
    DependentActivities *dependent = [DependentActivities objectFromDependentActivities:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE DependentActivities set moduleId= ?,userId = ?, json= ?,completed= ?, status = ?,dependsOn =  ? where moduleId= ? and userId = ?",dependent.moduleId,dependent.userId,dependent.json,dependent.completed,dependent.dependsOn,dependent.moduleId,dependent.userId, nil];
    [database close];
}

+(void)updateCompletedStatus:(DependentActivities *)dependent{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE DependentActivities set moduleId= ?,userId = ?, json= ?,completed= ?, status = ?, dependsOn = ? where moduleId= ? and userId = ?",dependent.moduleId,dependent.userId,dependent.json,dependent.completed,dependent.dependsOn,dependent.moduleId,dependent.userId,dependent.status, nil];
    [database close];
}

+(id)getCompletedStatusIdsForUser:(NSNumber *)userId{
    NSMutableArray *array  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from DependentActivities where completed= ? and userId = ?",@(1),userId];
    
    DependentActivities *dependent = nil;
    while([results next]) {
        dependent = [DependentActivities objectFromDependentActivities:results];
        [array addObject:dependent.moduleId];
    }
    [database close];
    return array;
}

+(id)getUpdatedCompletedStatusIdsForUser:(NSNumber *)userId{
    NSMutableArray *array  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from DependentActivities where completed= ? and userId = ? and status = ?",@(1),userId, @(1)];
    
    DependentActivities *dependent = nil;
    while([results next]) {
        dependent = [DependentActivities objectFromDependentActivities:results];
        [array addObject:dependent.moduleId];
    }
    [database close];
    return array;
}

+(NSArray *)getAllDependentActivitiesForUserId:(NSNumber *)userId{
    NSMutableArray *array  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from DependentActivities where userId = ?", userId];
    
    DependentActivities *dependent = nil;
    while([results next]) {
        dependent = [DependentActivities objectFromDependentActivities:results];
        [array addObject:dependent];
    }
    [database close];
    return [NSArray arrayWithArray:array] ;

}
@end
