//
//  QuizCourse.h
//  Clinique
//
//  Created by Brindha_shiva on 3/16/15.
//
//

#import <Foundation/Foundation.h>
//quiz_course Table
//id course_ref_id quiz_name quiz_index score  created_date modified date
@interface QuizCourse : NSObject

@property (strong, nonatomic)NSNumber *courseRefId;
@property (strong, nonatomic)NSString *quizName;
@property (assign, nonatomic)int quizIndex;
@property (assign, nonatomic)float score;
@property (strong ,nonatomic)NSNumber *timeCreated;
@property (strong ,nonatomic)NSNumber *timeModified;
+(id)getQuizCourseForCourseRefId:(NSNumber *)courseRefId;
+(void)saveQuizCourse:(NSDictionary *)dict;
@end
