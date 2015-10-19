//
//  Bookmarks.m
//  Clinique
//
//  Created by Brindha_shiva on 3/13/15.
//
//

#import "Bookmarks.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"
#import "CLQHelper.h"

@implementation Bookmarks
@synthesize bookmarksId;
@synthesize moduleId;
@synthesize userId;
@synthesize pageNumbers;
@synthesize status;
@synthesize timeCreated;
@synthesize timeModified;

+(id)objectFromBookMarks:(id)object{
    Bookmarks    *bookmarks = [[Bookmarks alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        bookmarks.bookmarksId = @([results intForColumn:kBookmarkId]);
        bookmarks.moduleId = @([results intForColumn:kModuleId]);
        bookmarks.userId = @([results intForColumn:kuserId]);
        //notes.pageNumbers = [results ob:kPageNo];
        bookmarks.status = @([results intForColumn:kStatus]);
        bookmarks.json = [results dataForColumn:kjson];
        bookmarks.pageNumbers  = [results stringForColumn:kPageNo];
        bookmarks.addedBookmarks = [results stringForColumn:kAddedBookmarks];
        bookmarks.deletedBookmarks = [results stringForColumn:kDeletedBookmarks];

        bookmarks.timeModified = @([results intForColumn:ktimeModified]);
        bookmarks.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            bookmarks.bookmarksId = @([dict[kId] intValue]);
        if(dict[key_CourseModuleid] != [NSNull null])
            bookmarks.moduleId = @([dict[key_CourseModuleid] intValue]);
        
        if(dict[Key_User_Id] != [NSNull null])
            bookmarks.userId = @([dict[Key_User_Id] intValue]);
        
        if(dict[kStatus] != [NSNull null])
            bookmarks.status = dict[kStatus];
        
        if(dict[key_Pages] != [NSNull null]){
            bookmarks.pageNumbers = [dict[key_Pages] componentsJoinedByString:@","];
        }
        
        bookmarks.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        if(dict[ktimeCreated] != [NSNull null])
            bookmarks.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            bookmarks.timeModified  = dict[ktimeModified];
        
    }
    
    return bookmarks;

}

+(Bookmarks *)getBookmarksForBookmarksId:(NSNumber *)bookmarkId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Bookmarks where bookmarksId= ?",bookmarkId];
    
    Bookmarks *bookmark = nil;
    while([results next]) {
        bookmark = [Bookmarks objectFromBookMarks:results];
    }
    [database close];
    return bookmark;
}

+(void)saveBookMarks:(NSDictionary *)dict{
    @try {
        NSArray *bookmarks = [Bookmarks getBookMarksForModuleId:@([dict[key_CourseModuleid] intValue]) andUserId:@([dict[Key_User_Id] intValue])];
        
        Bookmarks *bookmark = nil;
        if(bookmarks.count >0)
            bookmark = (Bookmarks *)bookmarks[0];
        if(bookmark == nil){
            [Bookmarks inserBookMarks:dict];
        }
        else{
            // if([CLQHelper isLastModifiedChanged:bookmark.timeModified withServerTimeStamp:dict[ktimeModified]])
            NSLog(@"Bookmark :%@",bookmark.timeModified);
           
            if([bookmark.timeModified intValue] != 0){ // this record updated locally. first have to update server, so that shpuld not update this record if it is come from delta sync
                [Bookmarks updateBookMarks:dict];
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveBookMarks :%@",exception.description);
    }
}

+(void)inserBookMarks:(NSDictionary *)dict{
    Bookmarks *bookmarks = [Bookmarks objectFromBookMarks:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Bookmarks (bookmarksId,moduleId, userId,json,status,pageNumbers,timecreated,timemodified) VALUES (?, ?, ?, ?,  ?,?, ?,?)",bookmarks.bookmarksId,bookmarks.moduleId , bookmarks.userId,bookmarks.json,bookmarks.status,bookmarks.pageNumbers, bookmarks.timeCreated,bookmarks.timeModified, nil];
    
    [database close];
}

+(void)updateBookMarks:(NSDictionary *)dict{
    Bookmarks *bookmarks = [Bookmarks objectFromBookMarks:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Bookmarks set bookmarksId = ?, moduleId= ?,userId = ?,json= ?,status= ?,pageNumbers= ?, timecreated=  ?,timemodified= ? where moduleId= ? and userId = ?",bookmarks.bookmarksId,bookmarks.moduleId,bookmarks.userId,bookmarks.json,bookmarks.status,bookmarks.pageNumbers,bookmarks.timeCreated ,bookmarks.timeModified,bookmarks.moduleId,bookmarks.userId, nil];
    [database close];
}

+(void)updateBookMarkWithParams:(NSDictionary *)params{
    
    if([params[key_Bookmarks] isKindOfClass:[Bookmarks class]] ){
        Bookmarks *bookmark = (Bookmarks *)params[key_Bookmarks];
  
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        [database executeUpdate:@"UPDATE Bookmarks set pageNumbers= ?,addedBookmarks = ?, deletedBookmarks = ?, status= ?, timemodified = ?  where moduleId= ? and userId = ?",bookmark.pageNumbers,bookmark.addedBookmarks,bookmark.deletedBookmarks,bookmark.status,bookmark.timeModified,bookmark.moduleId,bookmark.userId, nil];
        [database close];
      
    }
    else{
        
    }
}

+(id)getBookMarksForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId{
    NSLog(@"module Id :%@ and user ID :%@",moduleId,userId);
    NSMutableArray *bookmarks  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Bookmarks where moduleId= ? and userId =  ?",moduleId,userId];
    
    Bookmarks *bookmark = nil;
    while([results next]) {
        bookmark = [Bookmarks objectFromBookMarks:results];
        [bookmarks addObject:bookmark];
    }
    [database close];
    return bookmarks;
}

+(NSArray *)getAllUpdatedBookmarksWithUserId:(NSNumber *)userId{
    NSMutableArray *bookmarks  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Bookmarks where  userId =  ? and status = ?",userId,@(1)];
    
    Bookmarks *bookmark = nil;
    while([results next]) {
        bookmark = [Bookmarks objectFromBookMarks:results];
        [bookmarks addObject:bookmark];
    }
    [database close];
    return [NSArray arrayWithArray:bookmarks] ;
}

+(id)getAllBookmarksForUserId:(NSNumber *)userId{
    NSMutableArray *bookmarks  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Bookmarks where  userId =  ?",userId];
    
    Bookmarks *bookmark = nil;
    while([results next]) {
        bookmark = [Bookmarks objectFromBookMarks:results];
        [bookmarks addObject:[bookmark.moduleId stringValue]];
    }
    [database close];
    return bookmarks ;
}
@end
