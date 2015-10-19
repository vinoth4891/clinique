//
//  UserMapping.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface UserMapping : NSObject

@property (nonatomic, retain) NSString * mappingType;
@property (nonatomic, retain) NSNumber * refrenceId;
@property (nonatomic, assign) long  timeCreated;
@property (nonatomic, assign) long  timeModified;
@property (nonatomic, retain) NSNumber * userId;
@property (nonatomic, strong)NSNumber *courseOrder;
@property (nonatomic, strong)NSData *attemptsJson;

+(id)objectFromUserMapping:(id )object;
+(id)getUserMappingWithParams:(NSDictionary *)dict;
+(UserMapping *)getUserMapping:(NSDictionary *)dict;
+(void)saveUserMapping:(NSDictionary *)dict;
+(void)updateUserMappingCourseorder:(UserMapping *)usermapping;
@end
