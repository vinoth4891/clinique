//
//  Badges.m
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import "Badges.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation Badges

+(id)objectFromBadges:(id)object{
    Badges    *badge = [[Badges alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        badge.badgeId =  @([results intForColumn:kBadgeId]);
        badge.badgeName = [results stringForColumn:kBadgeName];
        badge.badgeValue = @([results intForColumn:kBadgeValue]);
        badge.json = [results dataForColumn:kjson];
        badge.timeModified =@([results intForColumn:ktimeModified]);
        badge.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kId])
            badge.badgeId = @([dict[kId] intValue]);
        if(dict[Key_BadgeValue] != [NSNull null])
            badge.badgeValue = @([dict[Key_BadgeValue] intValue]);
        if(dict[Key_BadgeName])
            badge.badgeName = dict[Key_BadgeName];

        if(dict[ktimeCreated])
            badge.timeCreated = dict[ktimeCreated];
        badge.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        if(dict[ktimeModified])
            badge.timeModified  = dict[ktimeModified];
    }
    
    return badge;
}

+(Badges *)getBadgesForBadgesId:(NSNumber *)badgesId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Badges where badgeId= ?",badgesId];
    
    Badges *badges = nil;
    while([results next]) {
        badges = [Badges objectFromBadges:results];
    }
    [database close];
    return badges;
}

+(id)getAllBadges{
    NSMutableArray *badges  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Badges"];
    
    Badges *badge = nil;
    while([results next]) {
        badge = [Badges objectFromBadges:results];
        [badges addObject:badge];
    }
    [database close];
    return [NSArray arrayWithArray:badges];
}

+(void)saveBadges:(NSDictionary *)dict{
    @try {
        if(dict[kId] != [NSNull null]){
            Badges *badges = [Badges getBadgesForBadgesId:@([dict[kId] intValue])];
            if(badges == nil){
                [Badges insertBadges:dict];
            }
            else{
                [Badges updateBadges:dict];
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveBadges :%@",exception.description);
    }
}

+(void)insertBadges:(NSDictionary *)dict{
    Badges *badges = [Badges objectFromBadges:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Badges (badgeId, badgeName,badgeValue,json,timecreated,timemodified) VALUES (?, ?,?, ?, ?,?)",badges.badgeId,badges.badgeName,badges.badgeValue,badges.json,badges.timeCreated,badges.timeModified,nil];
    
    [database close];
}

+(void)updateBadges:(NSDictionary *)dict{
    Badges *badges = [Badges objectFromBadges:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Badges set badgeId = ?, badgeName= ?,badgeValue = ?,json= ?,timecreated = ?, timemodified= ? where badgeId= ?",badges.badgeId,badges.badgeName,badges.badgeValue,badges.json,badges.timeCreated,badges.timeModified,badges.badgeId, nil];
    [database close];
}

@end
