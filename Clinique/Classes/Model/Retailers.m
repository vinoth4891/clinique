//
//  Retailors.m
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import "Retailers.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"

@implementation Retailers

+(id)objectFormRetalier:(id)object{
    Retailers *country = [[Retailers alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        FMResultSet *result = (FMResultSet *)object;
        country.name = [result stringForColumn:kName];
        country.json = [result dataForColumn:kjson];
        country.region = [result stringForColumn:kRegion];
    }
    else{
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kName])
            country.name = dict[kName];
        if(dict[kRegion])
            country.region = dict[kRegion];
        country.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
    }
    return country;
}

+(Retailers*)getRetailerForName:(NSString *)name andRegion:(NSString *)region{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Retailers where name= ? and region = ?",name,region];
    
    Retailers *retailer = nil;
    while([results next]) {
        retailer = [Retailers objectFormRetalier:results];
    }
    [database close];
    return retailer;
}

+(void)saveRetailer:(NSDictionary *)dict{
    @try {
        Retailers *retailer = [Retailers getRetailerForName:dict[kcode] andRegion:dict[kRegion]];
        if(retailer == nil){
            [Retailers insertregion:dict];
        }
        else{
            [Retailers updateRegion:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveRetailer :%@",exception.description);
    }
}

+(void)insertregion:(NSDictionary *)dict{
    Retailers *retalier = [Retailers objectFormRetalier:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO Retailers (name,json,region) VALUES (?, ?,?)",retalier.name,retalier.json,retalier.region, nil];
    [database close];
}

+(void)updateRegion:(NSDictionary *)dict{
    Retailers *retalier = [Retailers objectFormRetalier:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Retailers set name = ?, json= ?,region = ? where name= ?",retalier.name,retalier.json,retalier.region,retalier.name, nil];
    [database close];
}
@end
