//
//  DependentActivities.h
//  Clinique
//
//  Created by ANANTHAN_S on 17/04/15.
//
//

#import <Foundation/Foundation.h>

@interface DependentActivities : NSObject

@property (strong, nonatomic)NSNumber *moduleId;
@property (strong, nonatomic)NSNumber *userId;
@property (strong, nonatomic)NSData *json;
@property (strong, nonatomic)NSNumber *completed;
@property (strong, nonatomic)NSNumber *status;
@property (strong, nonatomic)NSString *dependsOn;

+(DependentActivities *)getDependentActivitiesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId;
+(void)saveDependentActivity:(NSDictionary *)dict;
+(void)updateCompletedStatus:(DependentActivities *)dependent;
+(id)getCompletedStatusIdsForUser:(NSNumber *)userId;
+(NSArray *)getAllDependentActivitiesForUserId:(NSNumber *)userId;
+(id)getUpdatedCompletedStatusIdsForUser:(NSNumber *)userId;
@end
