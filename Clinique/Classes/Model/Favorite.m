//
//  Favorite.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Favorite.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"
#import "CLQHelper.h"

@implementation Favorite

@synthesize json;
@synthesize moduleId;
@synthesize status;
@synthesize timeCreated;
@synthesize timeModified;
@synthesize userId;

+(id)objectFromFavorites:(id)object{
    Favorite    *favorite = [[Favorite alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        favorite.favoriteId = @([results intForColumn:kFavoriteId]);
        favorite.moduleId = @([results intForColumn:kModuleId]);
        favorite.userId = @([results intForColumn:kuserId]);
        favorite.status = [results stringForColumn:kStatus];
        favorite.json = [results dataForColumn:kjson];
        
        favorite.timeModified =@([results intForColumn:ktimeModified]);
        favorite.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            favorite.favoriteId = @([dict[kId] intValue]);
        
        if(dict[key_CourseModuleid] != [NSNull null])
            favorite.moduleId = @([dict[key_CourseModuleid] intValue]);
        
        if(dict[Key_User_Id] != [NSNull null])
            favorite.userId = @([dict[Key_User_Id] intValue]);
        
        if(dict[kStatus] != [NSNull null] && dict[kStatus]){
            NSString *status = dict[kStatus];
            if([status isEqualToString:@"N"] || [status isEqualToString:@"D"])
               favorite.status = dict[kStatus];
            else
                favorite.status = @"0";
        }
        else{
            favorite.status = @"0";
        }
        
        if(dict[ktimeCreated] != [NSNull null])
            favorite.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            favorite.timeModified  = dict[ktimeModified];
        
        favorite.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    return favorite;
}


+(Favorite *)getFavoritesForFavoriteId:(NSNumber *)favoriteId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Favorites where favoriteId= ? ",favoriteId];
    
    Favorite *favorite = nil;
    while([results next]) {
        favorite = [Favorite objectFromFavorites:results];
    }
    [database close];
    return favorite;
}

+(Favorite *)getFavoritesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Favorites where moduleId= ? and userId= ? and status != ?",moduleId,userId,@"D"];
    
    Favorite *favorite = nil;
    while([results next]) {
        favorite = [Favorite objectFromFavorites:results];
    }
    [database close];
    return favorite;
}

+(id)getFavoritesForUserId:(NSNumber *)userId{
    NSMutableArray *favorites = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Favorites where userId= ? and (status =  ? OR status = ? )",userId, @"0", @"N"];
    
    Favorite *favorite = nil;
    while([results next]) {
        favorite = [Favorite objectFromFavorites:results];
        [favorites addObject:favorite];
    }
    [database close];
    return [NSArray arrayWithArray:favorites];
}

+(id)getAllUpdatedFavoritesForUserId:(NSNumber *)userId{
    NSMutableArray *favorites = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Favorites where userId= ? and (status = ? OR status = ?) ",userId,@"D",@"N"];
    
    Favorite *favorite = nil;
    while([results next]) {
        favorite = [Favorite objectFromFavorites:results];
        [favorites addObject:favorite];
    }
    [database close];
    return favorites;
}

+(id)getAllFavoritesForUserId:(NSNumber *)userId{
    NSMutableArray *favorites = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Favorites where userId= ? ",userId];
    
    Favorite *favorite = nil;
    while([results next]) {
        favorite = [Favorite objectFromFavorites:results];
        [favorites addObject:[NSString stringWithFormat:@"%@",favorite.moduleId]];
    }
    [database close];
    return favorites;
}

+(void)saveFavorite:(NSDictionary *)dict{
    @try {
        if(dict [key_CourseModuleid] != [NSNull null]){
            Favorite *favorite = [Favorite getFavoritesForModuleId:@([dict [key_CourseModuleid] intValue]) andUserId:@([dict [Key_User_Id] intValue])];
            if(favorite == nil){
                [Favorite insertFavorites:dict];
            }
            else{
                if([CLQHelper isLastModifiedChanged:favorite.timeModified withServerTimeStamp:dict[ktimeModified]])
                if([favorite.status intValue] == 0)
                    [Favorite updateFavorites:dict];
            }
        }
       
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveFavorite :%@",exception.description);
    }
}

+(void)insertFavorites:(NSDictionary *)dict{
    Favorite *favorite = [Favorite objectFromFavorites:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Favorites (favoriteId,moduleId, userId,status, json,timecreated,timemodified) VALUES (?, ?, ?, ?,  ?,?,?)",favorite.favoriteId,favorite.moduleId , favorite.userId,favorite.status,favorite.json, favorite.timeCreated,favorite.timeModified, nil];
    
    [database close];
}

+(void)updateFavorites:(NSDictionary *)dict{
    Favorite *category = [Favorite objectFromFavorites:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Favorites set favoriteId = ?, moduleId= ?,userId = ?,status= ?,json= ?, timecreated=  ?,timemodified= ? where moduleId= ? and userId = ?",category.favoriteId,category.moduleId,category.userId,category.status,category.json,category.timeCreated ,category.timeModified,category.moduleId,category.userId, nil];
    [database close];
}

+(void)deleteFavorite:(NSDictionary *)dict{
    if(dict[kModuleId] != nil){
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        [database executeUpdate:@"UPDATE Favorites set status = ? WHERE moduleId = ? and userId = ?",@"D", dict[kModuleId],[CLQDataBaseManager dataBaseManager].currentUser.userId];
        [database close];
    }
}


+(void)saveFavoriteWithParams:(NSDictionary *)dict{
    @try {
        if(dict [key_CourseModuleid] != [NSNull null]){
            Favorite *favorite = [Favorite getFavoritesForModuleId:@([dict [key_CourseModuleid] intValue]) andUserId:@([dict [Key_User_Id] intValue])];
            if(favorite == nil){
                [Favorite insertFavorites:dict];
            }
            else{
                if([CLQHelper isLastModifiedChanged:favorite.timeModified withServerTimeStamp:dict[ktimeModified]])
                [Favorite updateFavorites:dict];
            }
        }
        
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveFavorite :%@",exception.description);
    }
}

+(void)updateFavoritesWithParams:(NSDictionary *)dict{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    if([dict[@"Update"] boolValue] ==  YES){
        Favorite *favorite = [Favorite getFavoritesForFavoriteId:@([dict[kModuleId] intValue])];
        if(favorite != nil)
          [database executeUpdate:@"UPDATE Favorites set status = ? WHERE moduleId = ? and userId = ?",@"0", dict[kModuleId],[CLQDataBaseManager dataBaseManager].currentUser.userId];
        else{
            Favorite *favorite = [ Favorite objectFromFavorites:dict[Key_Favorite]];
            favorite.userId = [CLQDataBaseManager dataBaseManager].currentUser.userId;
            [database executeUpdate:@"INSERT INTO Favorites (favoriteId,moduleId, userId,status, json,timecreated,timemodified) VALUES (?, ?, ?, ?,  ?,?,?)",favorite.favoriteId,favorite.moduleId , favorite.userId,favorite.status,favorite.json, favorite.timeCreated,favorite.timeModified, nil];
        }
        
    }
    else if ([dict[@"Update"] boolValue] ==  NO){ //Deleste record from local DB
        [database executeUpdate:@"DELETE FROM Favorites WHERE moduleId = ? and userId= ?", dict[kModuleId],[CLQDataBaseManager dataBaseManager].currentUser.userId];
        
    }
    [database close];
}


@end
