//
//  Module.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>
#import "Asset.h"

@interface Module : NSObject

@property (nonatomic, retain) NSNumber * courseId;
@property (nonatomic, retain) NSData * json;
@property (nonatomic, retain) NSNumber * moduleId;
@property (nonatomic, retain) NSData * offlineJson;
@property (nonatomic, retain) NSNumber  *timeCreated;
@property (nonatomic, retain) NSNumber  *timeModified;
@property (nonatomic, retain) NSNumber * topicsId;
@property (nonatomic, retain) NSDictionary *assetDict;
@property (nonatomic ,strong) NSArray *assetsArray;
@property (nonatomic, strong)NSString *assetType;
@property (nonatomic, strong)NSNumber *moduleOrder;

+(id)objectFromModule:(id )object;
+(void)saveModule:(NSDictionary *)dict;
+(void)updateModuleOrder:(Module *)module;
+(id)getModuleForTopicsId:(NSNumber *)topicsId andCourseId:(NSNumber*)courseId;
+(Module *)getModuleForModuleId:(NSNumber *)moduleId;
+(id)getModulesForCourseId:(NSNumber *)courseId andModuleId:(NSNumber *)moduleId;
@end
