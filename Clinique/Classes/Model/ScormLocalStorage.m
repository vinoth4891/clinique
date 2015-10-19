//
//  ScormLocalStorage.m
//  Clinique
//
//  Created by ANANTHAN_S on 03/04/15.
//
//

#import "ScormLocalStorage.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation ScormLocalStorage

+(id)objectFromLocalStorage:(id)object{
    ScormLocalStorage    *localStoarge = [[ScormLocalStorage alloc]init];
    if([object isKindOfClass:[FMResultSet class]])
    {
        FMResultSet *results = (FMResultSet *)object;
        localStoarge.moduleId = [results stringForColumn:@"modId"];
        localStoarge.courseId  = [results stringForColumn:@"courseId"];
        localStoarge.userId = [results stringForColumn:@"userId"];
        localStoarge.jsonBody = [results stringForColumn:@"jsonBody"];
        localStoarge.scormUpdateFlag = [results stringForColumn:@"scormUpdateFlag"];
        localStoarge.scoreRow = [results stringForColumn:@"scoreRow"];
        localStoarge.completionStatus = [results stringForColumn:@"completionStatus"];
        localStoarge.objectives_location = [results stringForColumn:@"objectives_location"];
        localStoarge.objectives_min = [results stringForColumn:@"objectives_min"];
        localStoarge.objectives_max = [results stringForColumn:@"objectives_max"];
        localStoarge.pollId = [results stringForColumn:@"pollId"];
        localStoarge.pollJSON = [results stringForColumn:@"pollJSON"];
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        
    }
    return localStoarge;
}

+(id)getScormLocalStorageForUserId:(NSNumber *)userId{
    NSMutableArray *userBadges = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
     FMResultSet *results = [database executeQuery:@"SELECT * from scorm_Progress_Update where userId = ?", userId];
   
    ScormLocalStorage *localStorage = nil;
    while([results next]) {
        localStorage = [ScormLocalStorage objectFromLocalStorage:results];
        [userBadges addObject:localStorage];
    }
    [database close];
    return [NSArray arrayWithArray:userBadges];
}

+(id)getScormLocalStorageForCourseId:(NSString *)courseId andModuleId:(NSString *)moduleId andUserId:(NSString *)userId{
    
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from scorm_Progress_Update where userId = ?  and modId =?", userId,moduleId];
    
    //FMResultSet *results = [database executeQuery:@"SELECT * from clinique_quizLocalStorage"];
    ScormLocalStorage *localStorage = nil;
    while([results next]) {
        localStorage = [ScormLocalStorage objectFromLocalStorage:results];
    }
    [database close];
    return localStorage;
}

+(void)updateJson:(id)object forModuleId:(NSString *)moduleId{
    NSData *data = [NSJSONSerialization dataWithJSONObject:object options:kNilOptions error:nil];
    NSString *json = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    NSString *userId = [NSString stringWithFormat:@"%@", [CLQDataBaseManager dataBaseManager].currentUser.userId];
    [database executeUpdate:@"UPDATE scorm_Progress_Update set value = ? WHERE modId = ? and userId = ?",json,moduleId ,userId];
    [database close];
    
}

@end
