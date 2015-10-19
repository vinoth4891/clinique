//
//  Topics.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Topics : NSObject

@property (nonatomic, retain) NSNumber * courseId;
@property (nonatomic, retain) NSNumber * topicsId;
@property (nonatomic, retain) NSData * json;
@property (nonatomic, retain) NSNumber  *timeCreated;
@property (nonatomic, retain) NSNumber  *timeModified;
@property (nonatomic, retain)NSArray *assetArray;

+(id)objectFromTopics:(id )object;
+(Topics *)getTopicsForTopicsId:(NSNumber *)topicsId;
+(void)saveTopics:(NSDictionary *)dict;
+(id)getTopicsForCourseId:(NSNumber *)courseId;
@end
