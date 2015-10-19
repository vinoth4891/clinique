//
//  Category.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Categories : NSObject

@property (nonatomic, retain) NSNumber * categoryId;
@property (nonatomic, retain) NSData * json;
@property (nonatomic, retain) NSString * name;
@property (nonatomic, retain) NSNumber *timeCreated;
@property (nonatomic, retain) NSNumber *timeModified;

+(id)objectFromCategories:(id)object;
+(Categories *)getCategoriesForCategoryId:(NSNumber *)categoryId;
+(Categories *)getCategoriesForcategpryName:(NSString *)name;
+(void)saveCategory:(NSDictionary *)dict;
+(id)getAllCategories;
@end
