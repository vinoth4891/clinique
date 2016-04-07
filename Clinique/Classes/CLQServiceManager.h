//
//  CLQDatabaseHandler.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <JavaScriptCore/JavaScriptCore.h>
#import <Foundation/Foundation.h>
#import "Asset.h"
#import "User.h"

typedef enum {
    ServiceTypeFirst,
    ServiceTypeDelta,
    ServiceTypeOff,
    ServiceTypeCheckContentAvailbale
}ServiceType;

typedef enum{
    SyncBackTableUser,
    SyncBackTableBookmark,
    SyncBackTableNotes,
    SyncBackTableBadges,
    SyncBackTableQuiz,
    SyncBackTableFavorites,
    SyncBackTableScorm,
    SyncBackTableDependentActivity
}SyncBackTable;
@interface CLQServiceManager : NSObject<NSURLConnectionDelegate,NSURLConnectionDataDelegate>


@property (strong, nonatomic)NSArray *assets;
@property (strong, nonatomic)User *currentUser;
@property (strong, nonatomic)Asset *downloadingAsset;
@property (strong, nonatomic)Asset *currentDownloadingAsset;
@property (strong, nonatomic) NSMutableArray *notDownloadedAssets;
@property (assign, nonatomic)int totalAssetCount;
@property (assign, nonatomic)int currentAssetIndex;

@property (assign, nonatomic)long long totalDownloadedContentSize;

@property (strong, nonatomic)NSTimer *timer;
@property (assign, nonatomic)UIBackgroundTaskIdentifier backgroundUpdateTask;

@property (strong, nonatomic)NSMutableData *downloadedMutableData;
@property (strong, nonatomic)NSURLResponse *urlResponse;
@property (strong, nonatomic)NSMutableArray *syncingQuizIds;

+ (CLQServiceManager*) defaultManager;

+(void)validateLogin:(NSDictionary *)dict withCompletion:(void (^)(id userResponse))completion;

+(void)firstLaunchSyncWithuserId:(NSNumber *)userId andToken:(NSString *)token withCompletion:(void(^)(BOOL completed))completion;
+(void)deltaSyncWithParams:(NSDictionary *)params withCompletion:(void(^)(BOOL completed,BOOL isnewContent, id object))completion;

+(void)syncBackToServer:(void(^)(BOOL completed))completion;
+(void)updateRecordsToServerWithParams:(NSDictionary *)params withCompletion:(void(^)(id object,BOOL completion))completion;

+(void)saveSyncDataInDatabase:(NSDictionary *)dict withParams:(NSDictionary *)params forServiceType:(ServiceType)serviceType withCompletion:(void(^)(BOOL completed))completion;

-(void)resumeHourlySyncToStart:(BOOL)isStartSync;
+(void)getContentSyncWithUserId:(NSNumber *)userId andToken:(NSString *)token;
+(NSArray *)getDownloadingAssets:(User *)user;
@end
