//
//  Region.m
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import "Region.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"

@implementation Region
@synthesize name;
@synthesize json;

+(id)objectFormRegion:(id)object{
    Region *region = [[Region alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        FMResultSet *result = (FMResultSet *)object;
        region.name = [result stringForColumn:kName];
        region.json = [result dataForColumn:kjson];
    }
    else{
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kName] != [NSNull null])
            region.name = dict[kName];
        region.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    return region;
}

+(Region*)getRegionFromName:(NSString *)name{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Region where name= ?",name];
    
    Region *region = nil;
    while([results next]) {
        region = [Region objectFormRegion:results];
                  
    }
    [database close];
    return region;
}

+(void)saveRegion:(NSDictionary *)dict{
    @try {
        Region *region = [Region getRegionFromName:dict[kName]];
        if(region == nil){
            [Region insertregion:dict];
        }
        else{
            [Region updateRegion:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveRegion :%@",exception.description);
    }
}

+(void)insertregion:(NSDictionary *)dict{
    Region *region = [Region objectFormRegion:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Region (name,json) VALUES (?, ?)",region.name,region.json, nil];
    
    [database close];
}

+(void)updateRegion:(NSDictionary *)dict{
    Region *region = [Region objectFormRegion:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Region set name = ?, json= ? where name= ?",region.name,region.json,region.name, nil];
    [database close];
}

@end
