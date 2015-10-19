//
//  Store.m
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import "Store.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"


@implementation Store

@synthesize name;
@synthesize json;
@synthesize region;
@synthesize retailer;
@synthesize country;

+(id)objectFormStore:(id)object{
    
    Store *store = [[Store alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        FMResultSet *result = (FMResultSet *)object;
        store.name = [result stringForColumn:kName];
        store.json = [result dataForColumn:kjson];
        store.retailer = [result stringForColumn:kRetailer];
        store.country = [result stringForColumn:kCountry];
        store.region = [result stringForColumn:kRegion];
    }
    else{
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kName])
            store.name = dict[kName];
        if(dict[kRetailer])
            store.retailer = dict[kRetailer];
        if(dict[kRegion])
            store.region = dict[kRegion];
        if(dict[kCountry])
            store.country = dict[kCountry];
        store.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    return store;
}

+(Store*)getStroreForName:(NSString *)name andRegion:(NSString *)region andRetailer:(NSString *)retailer andCountry:(NSString *)country{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Strores where name= ? and region = ? and retailer = ? and country = ? ",name,region,retailer,country];
    
    Store *store = nil;
    while([results next]) {
        store = [Store objectFormStore:results];
    }
    [database close];
    return store;
}

+(void)saveStore:(NSDictionary *)dict{
    @try {
        Store *country = [Store getStroreForName:dict[kName] andRegion:dict[kRegion] andRetailer:dict[kRetailer] andCountry:dict[kCountry]];
        if(country == nil){
            [Store insertStore:dict];
        }
        else{
            [Store updateStore:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveStore :%@",exception.description);
    }
}

+(void)insertStore:(NSDictionary *)dict{
    Store *store = [Store objectFormStore:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Stores (name,retailer,country,region,json) VALUES (?, ?,?, ?, ?)",store.name,store.retailer,store.country,store.region,store.json, nil];
    
    [database close];
}

+(void)updateStore:(NSDictionary *)dict{
    Store *store = [Store objectFormStore:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Stores set name = ?, retailer= ?,country = ?,region = ?, json= ? where name= ? and retailer = ? and region = ? and country = ? ",store.name,store.retailer,store.country,store.region,store.name,store.retailer,store.region,store.country, nil];
    [database close];
}

@end
