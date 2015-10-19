//
//  CLQDataBaseManager.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>
#import "sqlite3.h"
#import "User.h"
#import "Bookmarks.h"

@interface CLQDataBaseManager : NSObject

@property (strong, nonatomic)User *currentUser;
@property (strong, nonatomic)NSString *currentPassword;
@property (assign, nonatomic)BOOL isSyncInprogress;
@property (strong, nonatomic)NSString *lastSyncedDate;
@property (strong, nonatomic)NSString *contentSize;

@property (assign, nonatomic)BOOL isDeltaSync;
@property (assign, nonatomic)BOOL isIdle;

+ (CLQDataBaseManager*) dataBaseManager;


-(void)createDatabase;
-(NSString *)getDBPath;

-(id)getAllCategoriesJson;
-(id)getCousersJsonwithUserId:(NSNumber *)userId andCategoryId:(NSNumber *)categoryId;
-(id)getTopicsJsonForCourseId:(NSNumber *)courseId;
-(id)getFavoritesJson;
-(id)getNotesJsonForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId;
-(void)getBookmarksJsonForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId withCompletion:(void(^)(Bookmarks *bookMark,BOOL completed))completion;
-(id)getAllRegionJson;
-(id)getAllCountriesJsonForRegion:(NSString *)region;
-(id)getAllRetailersJsonForRegion:(NSString *)region;
-(id)getAllStoreJsonForRegion:(NSString *)region andRetailers:(NSString *)retailers andCountry:(NSString *)country;
-(id)getProgressJsonForUserId:(NSNumber *)userId;
-(id)getPlayerJsonForUserId:(NSNumber *)userId andCourseId:(NSNumber *)courseId;
-(id)getBadgesForUserId:(NSNumber *)userId;
-(id)getDependentActivities;
@end
