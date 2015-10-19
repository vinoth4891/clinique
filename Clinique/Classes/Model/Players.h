//
//  Players.h
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import <Foundation/Foundation.h>

@interface Players : NSObject

@property (strong, nonatomic)NSNumber *courseId;
@property (strong,nonatomic)NSData *json;
@property (strong, nonatomic)NSNumber *timeCreated;
@property (strong, nonatomic)NSNumber *timeModified;
+(void)savePlayers:(NSDictionary *)dict;
+(Players *)getPlayerForCourseId:(NSNumber *)courseId;
@end
