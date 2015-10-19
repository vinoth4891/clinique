//
//  Notes.m
//  Clinique
//
//  Created by Brindha_shiva on 3/13/15.
//
//

#import "Notes.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"
#import "CLQHelper.h"

@implementation Notes
@synthesize notesId;
@synthesize moduleId;
@synthesize userId;
@synthesize comments;
@synthesize status;
@synthesize timeCreated;
@synthesize timeModified;

+(id)objectFromNotes:(id)object{
    Notes    *notes = [[Notes alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        notes.notesId = @([results intForColumn:kNotesId]);
        notes.moduleId = @([results intForColumn:kModuleId]);
        notes.userId = @([results intForColumn:kuserId]);
        notes.comments = [results stringForColumn:kComments];
        notes.status = @([results intForColumn:kStatus]);
        notes.json   = [results dataForColumn:kjson];
        notes.timeModified =[results stringForColumn:ktimeModified];
        notes.timeCreated = [results stringForColumn:ktimeCreated];
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            notes.notesId = @([dict[kId] intValue]);
        
        if(dict[key_CourseModuleid] != [NSNull null])
            notes.moduleId = @([dict[key_CourseModuleid] intValue]);
        
        if(dict[Key_User_Id] != [NSNull null])
            notes.userId = @([dict[Key_User_Id] intValue]);
        
        if(dict[kStatus] != [NSNull null])
            notes.status = @([dict[kStatus] intValue]);
        
        if(dict[key_Comment] != [NSNull null])
            notes.comments = dict[key_Comment];
        
       
        if(dict[ktimeCreated] != [NSNull null])
            notes.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            notes.timeModified  = dict[ktimeModified];
        
        notes.json = [NSJSONSerialization dataWithJSONObject:dict  options:kNilOptions error:nil];
    }
    
    return notes;
}

+(Notes *)getNotesForNotesId:(NSNumber *)notesId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Notes where notesId= ?",notesId];
    
    Notes *notes = nil;
    while([results next]) {
        notes = [Notes objectFromNotes:results];
    }
    [database close];
    return notes;
}

+(void)saveNotes:(NSDictionary *)dict{
    @try {
        
        NSArray *array = [Notes getNotesForModuleId:@([dict[key_CourseModuleid] intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(array.count > 0){
            Notes *note = (Notes *)array[0];
            if(note == nil){
                [Notes insertNotes:dict];
            }
            else{
               // if([CLQHelper isLastModifiedChanged:note.timeModified withServerTimeStamp:dict[ktimeModified]])
                if([note.status intValue] == 0) // While delta  sync update the non chnaged notes only
                    [Notes updateNotes:dict];
            }
        }
        else{
            [Notes insertNotes:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveNotes :%@",exception.description);
    }
}



+(void)insertNotes:(NSDictionary *)dict{
    Notes *notes = [Notes objectFromNotes:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Notes (notesId,moduleId, userId,comments,status,json,timecreated,timemodified) VALUES (?, ?, ?, ?,  ?,?, ?,?)",notes.notesId,notes.moduleId , notes.userId,notes.comments,notes.status,notes.json, notes.timeCreated,notes.timeModified, nil];
    
    [database close];
}

+(void)updateNotes:(NSDictionary *)dict{
    Notes *notes = [Notes objectFromNotes:dict];
    NSLog(@"notes : %@ and ststus :%@", notes.comments,notes.status);
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Notes set notesId = ?, moduleId= ?,userId = ?,comments= ?,status= ?,json= ?, timecreated=  ?,timemodified= ? where moduleId= ? and userId = ?",notes.notesId,notes.moduleId,notes.userId,notes.comments,notes.status,notes.json,notes.timeCreated ,notes.timeModified,notes.moduleId,notes.userId, nil];
    [database close];
}

+(void)updateNotesForParams:(NSDictionary *)params{
    // [Notes saveNotes:params];
    if([params[key_Notes] isKindOfClass:[Notes class]] ){
        Notes *notes = (Notes *)params[key_Notes];
        
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        [database executeUpdate:@"UPDATE Notes set notesId = ?, moduleId= ?,userId = ?,comments= ?,status= ?,json= ?, timecreated=  ?,timemodified= ? where moduleId= ? and userId = ?",notes.notesId,notes.moduleId,notes.userId,notes.comments,notes.status,notes.json,notes.timeCreated ,notes.timeModified,notes.moduleId,notes.userId, nil];
        //  [database executeUpdate:@"UPDATE Notes set status= ? where moduleId= ? and userId = ?",notes.status,@(1109),(67417), nil];
        [database close];
        
    }else{
        NSDictionary *dict  = params[key_Notes];
        NSArray *array = [Notes getNotesForModuleId:@([dict[key_CourseModuleid] intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(array.count > 0){
             Notes *note = (Notes *)array[0];
            if(note == nil)
               [Notes insertNotes:dict];
            else{
                [Notes updateNotes:dict];
            }
        }
        else{
            [Notes insertNotes:dict];
        }
        
    }
}

+(id)getNotesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId{
    NSMutableArray *notes  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results;
    if(moduleId != nil)
        results = [database executeQuery:@"SELECT * from Notes where moduleId = ? and userId = ?",moduleId,userId];
    else
        results = [database executeQuery:@"SELECT * from Notes where  userId = ?",userId];
    
    Notes *note = nil;
    while([results next]) {
        note = [Notes objectFromNotes:results];
        [notes addObject:note];
    }
    [database close];
    return [NSArray arrayWithArray:notes];
}

+(NSArray *)getAllUpdatedNotesWithUserId:(NSNumber *)userId{
    NSMutableArray *notes  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Notes where status = ? and userId = ?",@(1),userId];
    
    Notes *note = nil;
    while([results next]) {
        note = [Notes objectFromNotes:results];
        [notes addObject:note];
    }
    [database close];
    return [NSArray arrayWithArray:notes];

}

+(id)getAllNotesForUser:(NSNumber *)userId{
    NSMutableArray *notes  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Notes where userId = ?",userId];
    
    Notes *note = nil;
    while([results next]) {
        note = [Notes objectFromNotes:results];
        [notes addObject:[NSString stringWithFormat:@"%@",note.moduleId]];
    }
    [database close];
    return notes;
}

@end
