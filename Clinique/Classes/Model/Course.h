//
//  Course.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Course : NSObject

@property (nonatomic, retain) NSDate * activateTime;
@property (nonatomic, retain) NSNumber * courseId;
@property (nonatomic, retain) NSNumber * categoryId;
@property (nonatomic, retain) NSData * json;
//@property (nonatomic, retain) NSDictionary * assetDict;
@property (nonatomic, retain) NSArray * assetArray;
@property (nonatomic, retain) NSString * status;
@property (nonatomic, retain) NSNumber *timeCreated;
@property (nonatomic, retain) NSNumber *timeModified;
@property (strong, nonatomic)NSNumber *courseOrder;

-(NSDictionary *)dictionaryFromObject:(Course *)login;
+(id)objectFromCourse:(id )object;
+(Course *)getCourseForCourseId:(NSNumber *)courseId andCategoryId:(NSNumber *)categoryId;
+(void)saveCourse:(NSDictionary *)dict;
+(id)getCourseForUserId:(NSNumber *)userId andCategoryId:(NSNumber *)categoryId;
+(NSDictionary *)getImageUrls:(NSString *)htmlString;
+(id)getAssetDict:(NSDictionary *)dict;
+(void)deleteCourseAndModules:(NSMutableArray *)activeCourseIds andActiveModuleIds:(NSMutableArray *)moduleIds;
@end
