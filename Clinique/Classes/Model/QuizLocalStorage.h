//
//  QuizLocalStorage.h
//  Clinique
//
//  Created by ANANTHAN_S on 01/04/15.
//
//

#import <Foundation/Foundation.h>

@interface QuizLocalStorage : NSObject

@property (strong, nonatomic)NSString *moduleId;
@property (strong, nonatomic)NSString *userId;
@property (strong, nonatomic)NSString *courseId;
@property (strong,nonatomic)NSString *key;
@property (strong, nonatomic)NSString *json;
@property (strong, nonatomic)NSString *inProgress;
+(id)getQuizLocalStoargeForUserId:(NSNumber *)userId;
+(id)getQuizLocalStoargeForCourseId:(NSString *)courseId andModuleId:(NSString *)moduleId andUserId:(NSString *)userId;
+(void)updateJson:(id)object forModuleId:(NSString *)moduleId;
+(void)updateProgressStatusForQuiz:(QuizLocalStorage *)localStoarge andInProgress:(NSString *)inProgress;
+(void)updateJsonForQuiz:(QuizLocalStorage *)localStoarge;
+(void)saveLocalStorage:(NSDictionary *)dict;
@end
