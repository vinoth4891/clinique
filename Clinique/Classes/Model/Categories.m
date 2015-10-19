//
//  Category.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Categories.h"
#import "FMDB.h"
#import "CLQDataBaseManager.h"
#import "CLQStrings.h"
#import "CLQHelper.h"

@implementation Categories

@synthesize  categoryId;
@synthesize json;
@synthesize name;
@synthesize timeCreated;
@synthesize timeModified;

+(id)objectFromCategories:(id)object{
    Categories    *category = [[Categories alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
    
        category.categoryId = @([results intForColumn:kCategoryId]);
        category.name = [results stringForColumn:kName];
      
        category.json = [results dataForColumn:kjson];

        category.timeModified = @([results intForColumn:ktimeModified]);
        category.timeCreated = @([results intForColumn:ktimeCreated]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kId] != [NSNull null])
            category.categoryId = @([dict[kId] intValue]);
        
        if(dict[kName] != [NSNull null])
            category.name = dict[kName];
        
        category.json = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        
        if(dict[ktimeCreated] != [NSNull null])
            category.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            category.timeModified  = dict[ktimeModified];

    }
    
    return category;
}

+(Categories *)getCategoriesForCategoryId:(NSNumber *)categoryId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Categories where categoryId= ?",categoryId];
    
    Categories *categories = nil;
    while([results next]) {
        categories = [Categories objectFromCategories:results];
    }
    [database close];
    return categories;

}

+(Categories *)getCategoriesForcategpryName:(NSString *)name{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Categories where upper(name) = upper(?)",name];
    
    Categories *categories = nil;
    while([results next]) {
        categories = [Categories objectFromCategories:results];
    }
    [database close];
    return categories;
    
}

+(void)saveCategory:(NSDictionary *)dict{
    @try {
        Categories *category = [Categories getCategoriesForCategoryId:@([dict[kId] intValue])];
        if(category == nil){
            [Categories insertCategory:dict];
        }
        else{
            if([CLQHelper isLastModifiedChanged:category.timeModified withServerTimeStamp:dict[ktimeModified]])
             [Categories updateCategory:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveCategory :%@",exception.description);
    }

}

+(void)insertCategory:(NSDictionary *)dict{
    Categories *category = [Categories objectFromCategories:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Categories (categoryId, name, json,timecreated,timemodified) VALUES (?, ?, ?, ?,  ?)",category.categoryId , category.name,category.json, category.timeCreated,category.timeModified, nil];
    
    [database close];
}

+(void)updateCategory:(NSDictionary *)dict{
     Categories *category = [Categories objectFromCategories:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Categories set name= ?,json= ?, timecreated=  ?,timemodified= ? where categoryId= ?",category.name,category.json,category.timeCreated ,category.timeModified,category.categoryId, nil];
    [database close];
}

+(id)getAllCategories{
    NSMutableArray *categories = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Categories"];
    
    Categories *category = nil;
    while([results next]) {
        category = [Categories objectFromCategories:results];
        [categories addObject:category];
    }
    [database close];
    return [NSArray arrayWithArray:categories];
}

@end
