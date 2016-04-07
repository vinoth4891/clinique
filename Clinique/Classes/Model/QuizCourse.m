//
//  QuizCourse.m
//  Clinique
//
//  Created by Brindha_shiva on 3/16/15.
//
//

#import "QuizCourse.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation QuizCourse
+(id)objectFromQuizCourse:(id)object{
    QuizCourse    *quizCourse = [[QuizCourse alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        quizCourse.courseRefId =  @([results intForColumn:kQuizCourseRefId]);
        quizCourse.quizIndex = [results intForColumn:kQuizIndex];
        quizCourse.quizName = [results stringForColumn:kQuizName];
        quizCourse.score = [results longForColumn:kQuizScore];
        quizCourse.timeModified =@([results intForColumn:ktimeModified]);
        quizCourse.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kQuizCourseRefId])
            quizCourse.courseRefId = @([dict[kQuizCourseRefId] intValue]);
        if(dict[kQuizIndex])
            quizCourse.quizIndex = [dict[kQuizIndex] intValue];
        if(dict[kQuizName])
            quizCourse.quizName = dict[kQuizName];
        if(dict[kQuizScore])
            quizCourse.score = [dict[kQuizScore] floatValue];
        if(dict[ktimeCreated])
            quizCourse.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified])
            quizCourse.timeModified  = dict[ktimeModified];
        
    }
    
    return quizCourse;
}

+(QuizCourse *)getQuizCourseForCourseRefId:(NSNumber *)courseRefId andQuizIndex:(int)quizIndex{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from QuizCourse where courseRefId= ? and quizIndex = ?",courseRefId,@(quizIndex)];
    
    QuizCourse *quizCourse = nil;
    while([results next]) {
        quizCourse = [QuizCourse objectFromQuizCourse:results];
    }
    [database close];
    return quizCourse;
}

+(id)getQuizCourseForCourseRefId:(NSNumber *)courseRefId{
    NSMutableArray *array = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from QuizCourse where courseRefId= ? ",courseRefId];
    
    QuizCourse *quizCourse = nil;
    while([results next]) {
        quizCourse = [QuizCourse objectFromQuizCourse:results];
        [array addObject:quizCourse];
    }
    [database close];
    NSArray *result = [NSArray arrayWithArray:array];
    result = [result sortedArrayUsingDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:@"self.quizIndex" ascending:YES]]];
    return result;
}
+(void)saveQuizCourse:(NSDictionary *)dict{
    @try {
        for (NSString *courseIdKey in dict.allKeys) {
            NSDictionary *quizDict = dict[courseIdKey];
            if(quizDict[Key_Quiz]){
                //NSLog(@"quizDict[kName] :%@",quizDict);
                NSArray *names = quizDict[Key_Quiz][kName];
                for (int i= 0; i <names.count ; i++) {
                    NSString *name = names[i];
                    float score = 0;
                    NSArray *scores  = quizDict[Key_Quiz][Key_Score];
                    if(scores.count > i  && scores[i] != [NSNull null]){
                        score = [scores[i] floatValue];
                    }
                    QuizCourse *quizCourse = [QuizCourse getQuizCourseForCourseRefId:@([courseIdKey intValue]) andQuizIndex:i];
                    if(quizCourse == nil){
                        [QuizCourse insertQuizCourse:@{kQuizCourseRefId :@([courseIdKey intValue]), kQuizIndex : @(i), kQuizName : name.length > 0 ? name : @"",kQuizScore : @(score)}];
                    }
                    else{
                        [QuizCourse updateQuizCourse:@{kQuizCourseRefId :@([courseIdKey intValue]), kQuizIndex : @(i), kQuizName : name.length > 0 ? name : @"",kQuizScore : @(score)}];
                    }
                }
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveQuizCourse :%@",exception.description);
    }

}

+(void)insertQuizCourse:(NSDictionary *)dict{
    QuizCourse *quizCourse = [QuizCourse objectFromQuizCourse:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO QuizCourse (courseRefId,quizName,quizIndex,score) VALUES (?, ?,?,?)",quizCourse.courseRefId,quizCourse.quizName,@(quizCourse.quizIndex),@(quizCourse.score), nil];
    [database close];

}

+(void)updateQuizCourse:(NSDictionary *)dict{
    QuizCourse *quizCourse = [QuizCourse objectFromQuizCourse:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE QuizCourse set courseRefId = ?, quizName= ?,quizIndex =?, score= ? where courseRefId= ? and quizIndex = ?",quizCourse.courseRefId,quizCourse.quizName,@(quizCourse.quizIndex),@(quizCourse.score),quizCourse.courseRefId,@(quizCourse.quizIndex), nil];
    [database close];
}

@end
