//
//  Favorite.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Favorite : NSObject

@property (nonatomic, retain) NSData * json;
@property (nonatomic, retain) NSNumber * moduleId;
@property (nonatomic, retain) NSNumber * favoriteId;
@property (nonatomic, retain) NSString * status;
@property (nonatomic, retain) NSNumber *timeCreated;
@property (nonatomic, retain) NSNumber *timeModified;
@property (nonatomic, retain) NSNumber * userId;

+(id)objectFromFavorites:(id)object;
+(Favorite *)getFavoritesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId;
+(void)saveFavorite:(NSDictionary *)dict;
+(void)deleteFavorite:(NSDictionary *)dict;
+(id)getFavoritesForUserId:(NSNumber *)userId;
+(id)getAllUpdatedFavoritesForUserId:(NSNumber *)userId;
+(void)updateFavoritesWithParams:(NSDictionary *)dict;
+(id)getAllFavoritesForUserId:(NSNumber *)userId;
+(void)saveFavoriteWithParams:(NSDictionary *)dict;
@end
