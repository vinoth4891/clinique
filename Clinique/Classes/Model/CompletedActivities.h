//
//  CompletedActivities.h
//  Clinique
//
//  Created by ANANTHAN_S on 17/04/15.
//
//

#import <Foundation/Foundation.h>

@interface CompletedActivities : NSObject

@property (strong, nonatomic)NSNumber *userId;
@property (strong, nonatomic)NSNumber *completedModuleId;
@property (strong, nonatomic)NSNumber *status;
+(void)saveCompletedActivities:(NSArray *)activityIds;
+(void)saveCompletionActivityWithParams:(NSDictionary *)dict;
+(id)getCompletedActivitiesForUserId:(NSNumber *)userId;
+(id)getCompletedActivitiesForUserId:(NSNumber *)userId andModuleId:(NSNumber *)moduleId;
+(id)getUpdatedCompletedActivitiesForUserId:(NSNumber *)userId;
@end
