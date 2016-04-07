//
//  Bookmarks.h
//  Clinique
//
//  Created by Brindha_shiva on 3/13/15.
//
//

#import <Foundation/Foundation.h>

@interface Bookmarks : NSObject

@property (strong,nonatomic)NSNumber *bookmarksId;
@property (strong,nonatomic)NSNumber *moduleId;
@property (strong,nonatomic)NSNumber *userId;
//@property (strong,nonatomic)NSArray *pageNumbers;
@property (strong, nonatomic)NSString *pageNumbers;
@property (strong, nonatomic)NSString *addedBookmarks;
@property (strong, nonatomic)NSString *deletedBookmarks;

@property (strong,nonatomic)NSNumber *status;
@property (strong,nonatomic)NSData *json;
@property (strong,nonatomic)NSNumber *timeCreated;
@property (strong,nonatomic)NSNumber *timeModified;

+(id)objectFromBookMarks:(id)object;
+(id)getBookMarksForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId;
+(NSArray *)getAllUpdatedBookmarksWithUserId:(NSNumber *)userId;
+(void)saveBookMarks:(NSDictionary *)dict;
+(void)updateBookMarkWithParams:(NSDictionary *)params;
+(id)getAllBookmarksForUserId:(NSNumber *)userId;
@end
