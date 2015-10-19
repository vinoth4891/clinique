//
//  Players.m
//  Clinique
//
//  Created by Brindha_shiva on 3/17/15.
//
//

#import "Players.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation Players

+(id)objectFromPlayers:(id)object{
    Players    *player = [[Players alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        player.courseId =  @([results intForColumn:kCourseId]);
        player.json = [results dataForColumn:kjson];
      
        player.timeModified =@([results intForColumn:ktimeModified]);
        player.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[Key_CourseId]!= [NSNull null])
            player.courseId = @([dict[Key_CourseId] intValue]);
        
        player.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];

        if(dict[ktimeCreated]  != [NSNull null])
            player.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified]  != [NSNull null])
            player.timeModified  = dict[ktimeModified];
    }
    return player;
}

+(Players *)getPlayerForCourseId:(NSNumber *)courseId
{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Players where courseId= ?",courseId];
    
    Players *player = nil;
    while([results next]) {
        player = [Players objectFromPlayers:results];
    }
    [database close];
    return player;
}


+(void)savePlayers:(NSDictionary *)dict{
    @try {
        Players *player = [Players getPlayerForCourseId:@([dict[Key_CourseId] intValue])];
        if(player == nil){
            [Players insertPlayer:dict];
        }
        else{
            [Players updatePlayer:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :savePlayers :%@",exception.description);
    }
}

+(void)insertPlayer:(NSDictionary *)dict{
    Players *player = [Players objectFromPlayers:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO Players (courseId,json,timecreated,timemodified) VALUES (?, ?,?, ?)",player.courseId,player.json,player.timeCreated,player.timeModified, nil];
    [database close];
}

+(void)updatePlayer:(NSDictionary *)dict
{
    Players *player = [Players objectFromPlayers:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Players set courseId = ?, json= ?,timecreated = ?,timemodified = ? where courseId= ?",player.courseId,player.json,player.timeCreated,player.timeModified,player.courseId, nil];
    [database close];
}

@end
