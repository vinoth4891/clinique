//
//  UserBadges.m
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import "UserBadges.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation UserBadges

+(id)objectFromUserBadges:(id)object{
    UserBadges    *userBadge = [[UserBadges alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        userBadge.userbadgeId =  @([results intForColumn:kUserBadgeId]);
        userBadge.badgeId =  @([results intForColumn:kBadgeId]);
        userBadge.badgeName = [results stringForColumn:kBadgeName];
        userBadge.badgeValue = @([results intForColumn:kBadgeValue]);
        userBadge.json = [results dataForColumn:kjson];
        userBadge.status = @([results intForColumn:kStatus]);
        userBadge.timeModified = @([results intForColumn:ktimeModified]);
        userBadge.timeCreated = @([results intForColumn:ktimeCreated]);
        userBadge.userId = @([results intForColumn:kuserId]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            userBadge.userbadgeId = @([dict[kId] intValue]);
        
        if(dict[Key_UserBadgeId] != [NSNull null])
            userBadge.badgeId = @([dict[Key_UserBadgeId] intValue]);
        
        if(dict[Key_BadgeValue] != [NSNull null])
            userBadge.badgeValue = @([dict[Key_BadgeValue] intValue]);
        
        if(dict[Key_BadgeName] != [NSNull null])
            userBadge.badgeName = dict[Key_BadgeName];
        
        if(dict[kStatus] != [NSNull null] && dict[kStatus])
            userBadge.status =dict[kStatus];
        else
            userBadge.status = @(0);
        
        if(dict[ktimeCreated] != [NSNull null])
            userBadge.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            userBadge.timeModified  = dict[ktimeModified];
        
        userBadge.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        userBadge.userId = [CLQDataBaseManager dataBaseManager].currentUser.userId;
        
    }
    
    return userBadge;
}

+(UserBadges *)getUserBadgeForUserBadgeId:(NSNumber *)userBadgeId andUserId:(NSNumber *)userId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from UserBadges where userBadgeId= ? and userId = ?",userBadgeId, userId];
    
    UserBadges *badges = nil;
    while([results next]) {
        badges = [UserBadges objectFromUserBadges:results];
    }
    [database close];
    return badges;
}

+(void)saveUserBadge:(NSDictionary *)dict{
    @try {
        UserBadges *userBadge = [UserBadges getUserBadgeForUserBadgeId:dict[kId] andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(userBadge == nil){
            [UserBadges insertUserBadge:dict];
        }
        else{
            if([userBadge.status intValue]!= 1)
              [UserBadges updateUserBadge:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : saveUserBadge %@", exception.description);
    }
 
}

+(void)insertUserBadge:(NSDictionary *)dict{
    UserBadges *badges = [UserBadges objectFromUserBadges:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO UserBadges (userBadgeId,badgeId,userId, badgeName,badgeValue,json,status,timecreated,timemodified) VALUES (?, ?,?, ?, ?,?,?, ?, ?)",badges.userbadgeId,badges.badgeId,badges.userId,badges.badgeName,badges.badgeValue,badges.json,badges.status,badges.timeCreated,badges.timeModified ,nil];
    
    [database close];

}

+(void)updateUserBadge:(NSDictionary *)dict{
    UserBadges *badges = [UserBadges objectFromUserBadges:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE UserBadges set userBadgeId = ?,badgeId = ?,userId = ?, badgeName= ?,badgeValue = ?,json= ?,status= ?,timecreated = ?, timemodified= ? where badgeId= ?",badges.userbadgeId,badges.badgeId,badges.userId,badges.badgeName,badges.badgeValue,badges.timeCreated,badges.json,badges.status,badges.timeModified,badges.userbadgeId, nil];
    [database close];

}

+(void)updateUserBadgeWithParams:(NSDictionary *)dict{
    
    UserBadges *userBadge = [UserBadges getUserBadgeForUserBadgeId:dict[kId] andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
    if(userBadge == nil){
        [UserBadges insertUserBadge:dict];
    }
    else{
       [UserBadges updateUserBadge:dict];
    }
}

+(void)deleteUserBadgesAfterSyncBack{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"DELETE FROM UserBadges WHERE status = ? and userId= ?", @(1),[CLQDataBaseManager dataBaseManager].currentUser.userId];
    [database close];
}


+(NSArray *)getAllUpdatedUserBadges{
    NSMutableArray *userBadges = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from UserBadges where status = ? and userId = ?",@(1),[CLQDataBaseManager dataBaseManager].currentUser.userId];
    
    UserBadges *badges = nil;
    while([results next]) {
        badges = [UserBadges objectFromUserBadges:results];
        [userBadges addObject:badges];
    }
    [database close];
    return [NSArray arrayWithArray:userBadges];
}


@end
