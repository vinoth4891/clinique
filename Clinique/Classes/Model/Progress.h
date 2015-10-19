//
//  Progress.h
//  Clinique
//
//  Created by Brindha_shiva on 3/16/15.
//
//

#import <Foundation/Foundation.h>

@interface Progress : NSObject

@property (strong, nonatomic)NSNumber *progressId;
@property (strong, nonatomic)NSNumber *userId;
@property (strong, nonatomic)NSNumber *courseId;
@property (assign, nonatomic)int courseIndex;
@property (strong, nonatomic)NSString *courseName;
@property (strong, nonatomic)NSString *courseScore;
@property (strong ,nonatomic)NSNumber *timeCreated;
@property (strong ,nonatomic)NSNumber *timeModified;

+(Progress *)getProgressForCourseId:(NSNumber *)courseId andUserId:(NSNumber *)userId;
+(id)getProgressForUserId:(NSNumber *)userId;
+(void)saveProgress:(NSDictionary *)dict;
+(id)objectFromProgress:(id)object;
@end
