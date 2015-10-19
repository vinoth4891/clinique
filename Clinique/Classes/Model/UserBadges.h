//
//  UserBadges.h
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import <Foundation/Foundation.h>

@interface UserBadges : NSObject

@property (strong, nonatomic)NSNumber *badgeId;
@property (strong, nonatomic)NSNumber *userbadgeId;
@property (strong, nonatomic)NSString *badgeName;
@property (strong, nonatomic)NSNumber *badgeValue;
@property (strong, nonatomic)NSData  *json;
@property (strong, nonatomic)NSNumber *status;
@property (strong, nonatomic)NSNumber *userId;
@property (strong ,nonatomic)NSNumber *timeCreated;
@property (strong ,nonatomic)NSNumber *timeModified;

+(void)saveUserBadge:(NSDictionary *)dict;
+(void)updateUserBadgeWithParams:(NSDictionary *)dict;
+(id)objectFromUserBadges:(id)object;
+(NSArray *)getAllUpdatedUserBadges;
+(void)insertUserBadge:(NSDictionary *)dict;
+(void)deleteUserBadgesAfterSyncBack;
@end
