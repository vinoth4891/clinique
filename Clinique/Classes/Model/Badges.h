//
//  Badges.h
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import <Foundation/Foundation.h>

@interface Badges : NSObject

@property (strong, nonatomic)NSNumber *badgeId;
@property (strong, nonatomic)NSString *badgeName;
@property (strong, nonatomic)NSNumber *badgeValue;
@property (strong, nonatomic)NSData *json;
@property (strong ,nonatomic)NSNumber *timeCreated;
@property (strong ,nonatomic)NSNumber *timeModified;

+(id)objectFromBadges:(id)object;
+(id)getAllBadges;
+(void)saveBadges:(NSDictionary *)dict;
@end
