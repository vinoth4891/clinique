//
//  QuizLocalStorage.m
//  Clinique
//
//  Created by ANANTHAN_S on 01/04/15.
//
//

#import "QuizLocalStorage.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation QuizLocalStorage

+(id)objectFromLocalStorage:(id)object{
    QuizLocalStorage    *localStoarge = [[QuizLocalStorage alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        localStoarge.moduleId = [results stringForColumn:@"modId"];
        localStoarge.courseId  = [results stringForColumn:@"courseId"];
        localStoarge.userId = [results stringForColumn:@"userId"];
        localStoarge.key = [results stringForColumn:@"key"];
        localStoarge.json = [results stringForColumn:@"value"];
        localStoarge.inProgress= [results stringForColumn:@"inProgress"];
    }
    else if([object isKindOfClass:[NSDictionary class]]){
       
    }
    return localStoarge;
}

+(id)getQuizLocalStoargeForUserId:(NSNumber *)userId{
    NSMutableArray *userBadges = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from clinique_quizLocalStorage where userId = ?", userId];
   // FMResultSet *results = [database executeQuery:@"SELECT * from clinique_quizLocalStorage"];

    QuizLocalStorage *localStorage = nil;
    while([results next]) {
        localStorage = [QuizLocalStorage objectFromLocalStorage:results];
        [userBadges addObject:localStorage];
    }
    [database close];
    return [NSArray arrayWithArray:userBadges];
}

+(void)saveLocalStorage:(NSDictionary *)dict{
    NSString *moduleId = [NSString stringWithFormat:@"%@",dict[kId]];
    NSString *userId = [NSString stringWithFormat:@"%@",[CLQDataBaseManager dataBaseManager].currentUser.userId];
    QuizLocalStorage *localStoarge  = [QuizLocalStorage getQuizLocalStoargeForCourseId:@"" andModuleId:moduleId andUserId:userId];

    if(localStoarge != nil)
    {
        NSData *data = [localStoarge.json dataUsingEncoding:NSUTF8StringEncoding];
        id object = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
        NSMutableDictionary *quizDict = [NSMutableDictionary dictionaryWithDictionary:object];
        if(quizDict[Key_AlreadyAttempted]){
            [quizDict removeObjectForKey:Key_AlreadyAttempted];
            
        }
        
     
        
         NSMutableArray *quizInfoArray  = [NSMutableArray array];
        if(quizDict[Key_Quiz_Info]){
            NSArray *quizInfos = quizDict[Key_Quiz_Info];
           
            for (NSDictionary *quizInfoDict in  quizInfos) {
                NSMutableDictionary *quizInfoDictionary= [NSMutableDictionary dictionaryWithDictionary:quizInfoDict];
                if(quizInfoDictionary[Key_AttemptedCount]){
                    [quizInfoDictionary removeObjectForKey:Key_AttemptedCount];
                }
                quizInfoDictionary[Key_AttemptedCount] = dict[Key_Quiz][Key_AttemptedCount];
                if(quizInfoDictionary[Key_Anyfinished]){
                    [quizInfoDictionary removeObjectForKey:Key_Anyfinished];
                }
                quizInfoDictionary[Key_Anyfinished] = dict[Key_Quiz][Key_Anyfinished];
                [quizInfoArray addObject:quizInfoDictionary];
            }
            [quizDict removeObjectForKey:Key_Quiz_Info];
        }
        quizDict[Key_AlreadyAttempted] = dict[Key_Quiz][kAttempts];
        quizDict[Key_Quiz_Info] = quizInfoArray;
        data = [NSJSONSerialization dataWithJSONObject:quizDict options:kNilOptions error:nil];
        NSString *json = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        NSString *userId = [NSString stringWithFormat:@"%@", [CLQDataBaseManager dataBaseManager].currentUser.userId];
        [database executeUpdate:@"UPDATE clinique_quizLocalStorage set value = ?  WHERE modId = ? and userId = ?",json,moduleId ,userId];
        [database close];
    }
}



+(id)getQuizLocalStoargeForCourseId:(NSString *)courseId andModuleId:(NSString *)moduleId andUserId:(NSString *)userId{
   
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
     FMResultSet *results = [database executeQuery:@"SELECT * from clinique_quizLocalStorage where userId = ?  and modId =?", userId,moduleId];
    
    //FMResultSet *results = [database executeQuery:@"SELECT * from clinique_quizLocalStorage"];
    QuizLocalStorage *localStorage = nil;
    while([results next]) {
        localStorage = [QuizLocalStorage objectFromLocalStorage:results];
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
    [database executeUpdate:@"UPDATE clinique_quizLocalStorage set value = ?,inProgress = ?  WHERE modId = ? and userId = ?",json,@"0",moduleId ,userId];
    [database close];

}

+(void)updateProgressStatusForQuiz:(QuizLocalStorage *)localStoarge andInProgress:(NSString *)inProgress{
      FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
   // NSString *userId = [NSString stringWithFormat:@"%@", [CLQDataBaseManager dataBaseManager].currentUser.userId];
    [database executeUpdate:@"UPDATE clinique_quizLocalStorage set inProgress = ?  WHERE modId = ? and userId = ?",inProgress,localStoarge.moduleId ,localStoarge.userId];
    [database close];
    
}



+(void)updateJsonForQuiz:(QuizLocalStorage *)localStoarge{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    // NSString *userId = [NSString stringWithFormat:@"%@", [CLQDataBaseManager dataBaseManager].currentUser.userId];
    [database executeUpdate:@"UPDATE clinique_quizLocalStorage set value = ?  WHERE modId = ? and userId = ?",localStoarge.json ,localStoarge.moduleId ,localStoarge.userId];
    [database close];
    
}
@end
