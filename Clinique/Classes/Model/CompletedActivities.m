//
//  CompletedActivities.m
//  Clinique
//
//  Created by ANANTHAN_S on 17/04/15.
//
//

#import "CompletedActivities.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "DependentActivities.h"

@implementation CompletedActivities

+(id)objectFromCompletedActivities:(id )object{
    CompletedActivities    *dependent = [[CompletedActivities alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        dependent.completedModuleId  =  @([results intForColumn:kCompletedMoudleId]);
        dependent.userId=@([results intForColumn:kuserId]);
        dependent.status = @([results intForColumn:kStatus]);
    }
    else if([object isKindOfClass:[NSDictionary class]]){

    }
    return dependent;
}

+(id)getCompletedActivitiesForUserId:(NSNumber *)userId andModuleId:(NSNumber *)moduleId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from CompletedActivities where  userId = ? and completedMoudleId = ?",userId, moduleId];
    
     CompletedActivities *dependent = nil;
    while([results next]) {
        dependent = [CompletedActivities objectFromCompletedActivities:results];
    }
    [database close];
    return dependent;
}

+(id)getCompletedActivitiesForUserId:(NSNumber *)userId{
    NSMutableArray *array  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from CompletedActivities where  userId = ?",userId];
    
   // CompletedActivities *dependent = nil;
    while([results next]) {
        //dependent = [CompletedActivities objectFromCompletedActivities:results];
        NSString *string = [NSString stringWithFormat:@"%d",[results intForColumn:kCompletedMoudleId] ];
        [array addObject:string];
    }
    [database close];
    return array;
}

+(void)saveCompletedActivities:(NSArray *)activityIds{
    for (NSString *moduleIds in activityIds) {
        CompletedActivities *completedActivity = [CompletedActivities getCompletedActivitiesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId andModuleId:@([moduleIds intValue])];
        if(completedActivity == nil){
            [CompletedActivities insertCompletedActivities:moduleIds];
        }
        else{
            [CompletedActivities updateCompletedActivities:moduleIds];
        }
    }
}

+(void)insertCompletedActivities:(NSString *)moduleId{
    //CompletedActivities *dependent = [CompletedActivities objectFromDependentActivities:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO CompletedActivities (userId,completedMoudleId,status) VALUES (?,?, ?)",[CLQDataBaseManager dataBaseManager].currentUser.userId,@([moduleId intValue]),@(0), nil];
    
    [database close];
}

+(void)updateCompletedActivities:(NSString *)moduleId
{
    //DependentActivities *dependent = [DependentActivities objectFromDependentActivities:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE CompletedActivities set completedMoudleId= ?,userId = ?, status = ? where completedMoudleId= ? and userId = ?",@([moduleId intValue]),[CLQDataBaseManager dataBaseManager].currentUser.userId,@(0), @([moduleId intValue]),[CLQDataBaseManager dataBaseManager].currentUser.userId,nil];
    [database close];
}

+(void)saveCompletionActivityWithParams:(NSDictionary *)dict{
    NSNumber *moduleId = @([dict[kModuleId] intValue]);
    CompletedActivities *activity = [CompletedActivities getCompletedActivitiesForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId andModuleId:moduleId];
     FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    if(activity == nil){
        [database executeUpdate:@"INSERT INTO CompletedActivities (userId,completedMoudleId,status) VALUES (?,?, ?)",[CLQDataBaseManager dataBaseManager].currentUser.userId,moduleId,@([dict[kStatus] intValue]), nil];
    }
    else{
        [database executeUpdate:@"UPDATE CompletedActivities set completedMoudleId= ?,userId = ?, status = ? where completedMoudleId= ? and userId = ?",@([moduleId intValue]),[CLQDataBaseManager dataBaseManager].currentUser.userId,@([dict[kStatus] intValue]),@([moduleId intValue]),[CLQDataBaseManager dataBaseManager].currentUser.userId, nil];
        
    }
    [database close];
}

+(id)getUpdatedCompletedActivitiesForUserId:(NSNumber *)userId{
    NSMutableArray *array  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from CompletedActivities where  userId = ? and status =  ?",userId, @(1)];
    
    // CompletedActivities *dependent = nil;
    while([results next]) {
        //dependent = [CompletedActivities objectFromCompletedActivities:results];
        NSString *string = [NSString stringWithFormat:@"%d",[results intForColumn:kCompletedMoudleId] ];
        [array addObject:string];
    }
    [database close];
    return array;
}
@end
