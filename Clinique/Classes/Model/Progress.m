//
//  Progress.m
//  Clinique
//
//  Created by Brindha_shiva on 3/16/15.
//
//

#import "Progress.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "QuizCourse.h"

@implementation Progress

+(id)objectFromProgress:(id)object{
    Progress    *progress = [[Progress alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        progress.progressId =  @([results intForColumn:kProgressId]);
        progress.userId = @([results intForColumn:kuserId]);
        progress.courseId = @([results intForColumn:kCourseId]);
        progress.courseIndex = [results intForColumn:kCourseIndex];
        progress.courseScore = [results stringForColumn:kCourseScore];
        progress.courseName  = [results stringForColumn:kName];
        progress.timeModified =@([results intForColumn:ktimeModified]);
        progress.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            progress.progressId = @([dict[kId] intValue]);
        
        if(dict[kuserId] != [NSNull null])
            progress.userId = @([dict[kuserId] intValue]);
        
        if(dict[kCourseId] != [NSNull null])
            progress.courseId = @([dict[kCourseId] intValue]);
        
        if(dict[kCourseIndex] != [NSNull null])
            progress.courseIndex = [dict[kCourseIndex] intValue];
        
         if(dict[kName] != [NSNull null])
             progress.courseName = dict[kName];
        if(dict[kCourseScore] != [NSNull null])
            progress.courseScore =[NSString stringWithFormat:@"%@",dict[kCourseScore]]  ;
        
        if(dict[ktimeCreated] != [NSNull null])
            progress.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            progress.timeModified  = dict[ktimeModified];
        
    }
    
    return progress;
}
+(Progress *)getProgressForCourseId:(NSNumber *)courseId andUserId:(NSNumber *)userId andCourseIndex:(int)courseIndex{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Progress where userId= ? and courseId = ? and courseIndex = ?",userId,courseId,@(courseIndex)];
    
    Progress *progress = nil;
    while([results next]) {
        progress = [Progress objectFromProgress:results];
    }
    [database close];
    return progress;
}

+(Progress *)getProgressForCourseId:(NSNumber *)courseId andUserId:(NSNumber *)userId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Progress where userId= ? and courseId = ?",userId,courseId];
    
    Progress *progress = nil;
    while([results next]) {
        progress = [Progress objectFromProgress:results];
    }
    [database close];
    return progress;
}

+(id)getProgressForUserId:(NSNumber *)userId{
    NSMutableArray *progreses = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Progress where userId= ?",userId];
    
    Progress *progress = nil;
    while([results next]) {
        progress = [Progress objectFromProgress:results];
        [progreses addObject:progress];
        //[jsonArray addObject:[NSJSONSerialization JSONObjectWithData:retailers.json options:kNilOptions error:nil]];
    }
    [database close];
    return [NSArray arrayWithArray:progreses];
}

+(void)saveProgress:(NSDictionary *)dict{
    @try {
        if(dict[Key_Course_Id]){
            NSArray *courseIds = dict[Key_Course_Id];
            
            for (int i= 0; i< courseIds.count ; i++) {
                NSString *courseId = courseIds[i];
                NSString *courseName = @"";
                NSString *courseScore = @"";
                if(dict[Key_CourseName]){
                    NSArray *courseNames = dict[Key_CourseName];
                    if(courseNames.count > i)
                        courseName =  courseNames[i];
                }
                if(dict[Key_CourseScore]){
                    NSArray *courseScores = dict[Key_CourseScore];
                    if(courseScores.count > i){
                        if(courseScores[i] != [NSNull null])
                          courseScore = courseScores[i] ;
                    }
                }
                
                Progress *progress = [Progress getProgressForCourseId:@([courseId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                if(progress == nil){
                    [Progress insertProgress:@{kName : courseName, kCourseIndex : @(i),kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId,kCourseId :@([courseId intValue]),kCourseScore : courseScore,Key_Course : dict[Key_Course]}];
                }
                else{
                    [Progress updateProgress:@{kName : courseName, kCourseIndex : @(i),kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId,kCourseId :@([courseId intValue]),kCourseScore : courseScore,Key_Course : dict[Key_Course]}];
                }
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : saveProgress %@",exception.description);
    }


}


+(void)insertProgress:(NSDictionary *)dict{
    Progress *progress = [Progress objectFromProgress:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO Progress (progressId,userId,courseId,name,courseIndex,courseScore) VALUES (?, ?,?,?,?,?)",progress.progressId,progress.userId,progress.courseId,progress.courseName,@(progress.courseIndex),progress.courseScore, nil];
    [database close];
    if(dict[Key_Course] != [NSNull null] && dict[Key_Course]){
        [QuizCourse saveQuizCourse:dict[Key_Course]];
    }
}

+(void)updateProgress:(NSDictionary *)dict{
    Progress *progress = [Progress objectFromProgress:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Progress set progressId = ?, userId= ?,courseId = ?, name= ?,courseIndex =?, courseScore= ? where userId= ? and courseId = ? and courseIndex = ?",progress.progressId,progress.userId,progress.courseId,progress.courseName,@(progress.courseIndex),progress.courseScore,progress.userId,progress.courseId,@(progress.courseIndex), nil];
    [database close];
    if(dict[Key_Course] != [NSNull null] && dict[Key_Course] != [NSNull null]){
        [QuizCourse saveQuizCourse:dict[Key_Course]];
    }
    
}

@end
