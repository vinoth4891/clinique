//
//  UserMapping.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "UserMapping.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"

@implementation UserMapping

@synthesize  mappingType;
@synthesize refrenceId;
@synthesize timeCreated;
@synthesize timeModified;
@synthesize userId;

+(id)objectFromUserMapping:(id )object{
    UserMapping    *course = [[UserMapping alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        course.userId  =  @([results intForColumn:kuserId]);
        course.refrenceId = @([results intForColumn:kRefrenceId]);
        course.mappingType = [results stringForColumn:kUserMappingType];
        
        course.timeModified =[results longForColumn:ktimeModified];
        course.timeCreated = [results longForColumn:ktimeCreated];
        course.courseOrder  =@([results intForColumn:@"courseOrder"]);
        course.attemptsJson = [results dataForColumn:kAttemptsJson];
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        course.userId = [CLQDataBaseManager dataBaseManager].currentUser.userId;
        if( dict[kRefrenceId])
            course.refrenceId = @([dict[kRefrenceId] integerValue]);
        
        if(dict[kUserMappingType])
            course.mappingType  = dict[kUserMappingType];
        
        if(dict[ktimeCreated])
            course.timeCreated = (long)dict[ktimeCreated] ;
        
        if(dict[ktimeModified])
            course.timeModified  = (long)dict[ktimeModified] ;
        if(dict[kAttempts] != [NSNull null] && dict[kAttempts])
            course.attemptsJson = [NSJSONSerialization dataWithJSONObject:dict[kAttempts] options:kNilOptions error:nil];
            
    }
    return course;
}

+(UserMapping *)getUserMapping:(NSDictionary *)dict{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from UserMappings where userId= ? and refrenceId= ? and mappingType = ?",@([dict[kuserId] intValue]), @([dict[kRefrenceId] intValue]), dict[kUserMappingType]];
    
    UserMapping *usermapping = nil;
    while([results next]) {
        usermapping = [UserMapping objectFromUserMapping:results];
    }
    [database close];
    return usermapping;
}


+(void)saveUserMapping:(NSDictionary *)dict{
    @try {
        UserMapping *userMapping = [UserMapping getUserMapping:dict];
        if(userMapping == nil){
            [UserMapping insertUserMapping:dict];
        }
        else{
            [UserMapping updateUserMapping:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveUserMapping :%@",exception.description);
    }
}

+(void)insertUserMapping:(NSDictionary *)dict{
    UserMapping *userMapping = [UserMapping objectFromUserMapping:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO UserMappings (userId,refrenceId,mappingType,attemptsJson) VALUES (?, ?, ?, ?)",userMapping.userId ,userMapping.refrenceId,userMapping.mappingType ,userMapping.attemptsJson, nil];
    
    [database close];
}

+(void)updateUserMapping:(NSDictionary *)dict{
    UserMapping *category = [UserMapping objectFromUserMapping:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE UserMappings set userId= ?, refrenceId= ?,mappingType= ?, attemptsJson = ? where userId= ? and refrenceId = ? and mappingType =  ?",category.userId,category.refrenceId,category.mappingType,category.attemptsJson ,category.userId,category.refrenceId,category.mappingType, nil];
    [database close];
}


+(void)updateUserMappingCourseorder:(UserMapping *)usermapping{

    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE UserMappings set courseOrder= ? where userId= ? and refrenceId = ? and mappingType =  ? ",usermapping.courseOrder,usermapping.userId,usermapping.refrenceId,usermapping.mappingType, nil];
    [database close];
}

+(id)getUserMappingWithParams:(NSDictionary *)dict{
    NSMutableArray *userMappings = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from UserMappings where userId= ? and  mappingType = ?",dict[kuserId], dict[kUserMappingType]];
    
    UserMapping *usermapping = nil;
    while([results next]) {
        usermapping = [UserMapping objectFromUserMapping:results];
        [userMappings addObject:usermapping];
    }
    [database close];
    return [NSMutableArray arrayWithArray:userMappings] ;
}
@end
