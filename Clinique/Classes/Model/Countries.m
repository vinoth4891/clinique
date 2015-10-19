//
//  Countries.m
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import "Countries.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"

@implementation Countries
@synthesize name;
@synthesize json;
@synthesize code;
+(id)objectFormCountry:(id)object{
    Countries *country = [[Countries alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        FMResultSet *result = (FMResultSet *)object;
        country.name = [result stringForColumn:kName];
        country.json = [result dataForColumn:kjson];
        country.code = [result stringForColumn:kcode];
        country.region = [result stringForColumn:kRegion];
    }
    else{
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kName])
            country.name = dict[kName];
        if(dict[kcode])
            country.code = dict[kcode];
        if(dict[kRegion])
            country.region = dict[kRegion];
        country.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    return country;
}

+(Countries*)getCountryForCode:(NSString *)code andRegion:(NSString *)region{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Countries where code= ? and region = ?",code,region];
    
    Countries *country = nil;
    while([results next]) {
        country = [Countries objectFormCountry:results];
        
    }
    [database close];
    return country;
}

+(void)saveCountry:(NSDictionary *)dict{
    @try {
        Countries *country = [Countries getCountryForCode:dict[kcode] andRegion:dict[kRegion]];
        if(country == nil){
            [Countries insertregion:dict];
        }
        else{
            [Countries updateRegion:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveCountry :%@",exception.description);
    }
}

+(void)insertregion:(NSDictionary *)dict{
    Countries *country = [Countries objectFormCountry:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Countries (name,json,code,region) VALUES (?, ?,?, ?)",country.name,country.json,country.code,country.region, nil];
    
    [database close];
}

+(void)updateRegion:(NSDictionary *)dict{
    Countries *country = [Countries objectFormCountry:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Countries set name = ?, json= ?,code = ?,region = ? where name= ? and region= ?",country.name,country.json,country.code,country.region,country.name,country.region, nil];
    [database close];
}
@end
