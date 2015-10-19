//
//  ScormLocalStorage.h
//  Clinique
//
//  Created by ANANTHAN_S on 03/04/15.
//
//

#import <Foundation/Foundation.h>

@interface ScormLocalStorage : NSObject
/*JSONBody TEXT, InteractionJSON TEXT, scormUpdateFlag TEXT, score_raw TEXT, completion_status TEXT, objectives_location TEXT, objectives_scaled TEXT, objectives_min TEXT, objectives_max TEXT, pollId TEXT, pollJSON TEXT, success_status TEXT,modId TEXT,courseId TEXT,userId TEXT*/

@property (strong, nonatomic)NSString *moduleId;
@property (strong, nonatomic)NSString *userId;
@property (strong, nonatomic)NSString *courseId;
@property (strong,nonatomic)NSString *jsonBody;
@property (strong, nonatomic)NSString *interactionJson;
@property (strong, nonatomic)NSString *scormUpdateFlag;
@property (strong, nonatomic)NSString *scoreRow;
@property (strong, nonatomic)NSString *completionStatus;
@property (strong, nonatomic)NSString *objectives_location;
@property (strong, nonatomic)NSString *objectives_min;
@property (strong, nonatomic)NSString *objectives_max;
@property (strong, nonatomic)NSString *pollId;
@property (strong, nonatomic)NSString *pollJSON;

+(id)getScormLocalStorageForUserId:(NSNumber *)userId;
+(id)getScormLocalStorageForCourseId:(NSString *)courseId andModuleId:(NSString *)moduleId andUserId:(NSString *)userId;
+(void)updateJson:(id)object forModuleId:(NSString *)moduleId;
@end
