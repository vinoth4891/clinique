//
//  Asset.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Asset.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "UserMapping.h"
#import "Module.h"
#import "Course.h"
#import "CLQHelper.h"
#import "CLQDataBaseManager.h"

@implementation Asset

@synthesize  assetCreated;
@synthesize assetGroup;
@synthesize assetLastModified;
@synthesize assetName;
@synthesize assetSize;
@synthesize fileExtn;
@synthesize fileType;
@synthesize offlineUrl;
@synthesize onlineUrl;
@synthesize referenceId;
@synthesize updateRequired;
@synthesize urlKey;
@synthesize assetIndex;

+(id)objectFromAseet:(id )object{
    Asset    *asset = [[Asset alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        asset.referenceId  =  @([results intForColumn:kRefrenceId]);
        
        asset.assetName = [results stringForColumn:kName];
        asset.assetGroup = [results stringForColumn:kAssetGroup];
        asset.fileType  = [results stringForColumn:kfileType];
        asset.fileExtn  = [results stringForColumn:kFileExtn];
        asset.onlineUrl = [results stringForColumn:kOnlineUrl];
        asset.offlineUrl = [results stringForColumn:kOfflineUrl];
        asset.assetSize = [results stringForColumn:kAssetSize];
        asset.urlKey = [results stringForColumn:kUrlKey];
        asset.assetIndex  = [results intForColumn:kAssetIndex];
        
        asset.assetCreated =@([results intForColumn:ktimeModified]);
        asset.assetLastModified = @([results intForColumn:ktimeCreated]);
        asset.updateRequired  = [results stringForColumn:kUpdateRequired];
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kRefrenceId] != [NSNull null])
            asset.referenceId = @([dict[kRefrenceId] integerValue]);
        
        if(dict[kUrlKey] != [NSNull null])
            asset.urlKey = dict[kUrlKey];
        
        if(dict[kAssetGroup] != [NSNull null])
            asset.assetGroup = dict[kAssetGroup];
        
        if(dict[kAssetIndex] != [NSNull null])
            asset.assetIndex  = [dict[kAssetIndex] intValue];
        
        if( dict[Key_FileName] != [NSNull null]){
            asset.assetName = dict[Key_FileName];
            asset.fileExtn  = [asset.assetName pathExtension];
        }
        
       // if( dict[Key_FileSize] != [NSNull null] )
           // asset.assetSize = [dict[Key_FileSize] ;
        
        if( dict[Key_Type] != [NSNull null] )
            asset.fileType = dict[Key_Type];
        
        if(dict[Key_FileUrl] != [NSNull null])
            asset.onlineUrl = dict[Key_FileUrl];
        
        if(dict[ktimeCreated] != [NSNull null])
            asset.assetCreated = dict[ktimeCreated] ;
        
        if(dict[ktimeModified] != [NSNull null])
            asset.assetLastModified  = dict[ktimeModified] ;
        if([CLQDataBaseManager dataBaseManager].isDeltaSync)
            asset.updateRequired = @"DS"; // Delta Sync
        else{
            if(dict[kUpdateRequired])
                asset.updateRequired  = dict[kUpdateRequired];
            else
              asset.updateRequired = @"FS"; //First Sync
        }
        
       /* if(dict[kAsset]){
            NSDictionary *assetDict = dict[kAsset];
            if( assetDict[Key_FileName] != [NSNull null]){
                asset.assetName = assetDict[Key_FileName];
                asset.fileExtn  = [asset.assetName pathExtension];
            }
            
            if( assetDict[Key_FileSize] != [NSNull null] )
                asset.assetSize =@([assetDict[Key_FileSize] integerValue]);
            
            if( assetDict[Key_Type] != [NSNull null] )
                asset.fileType = assetDict[Key_Type];
            
            if(assetDict[Key_FileUrl] != [NSNull null])
                asset.onlineUrl = assetDict[Key_FileUrl];
        
           if(assetDict[ktimeCreated] != [NSNull null])
                asset.assetCreated = assetDict[ktimeCreated] ;
            
            if(assetDict[ktimeModified] != [NSNull null])
                asset.assetLastModified  = assetDict[ktimeModified] ;
        }*/
        //asset.assetGroup  = kUser_Mapping_Group_Asset;
    }
    return asset;
}
+(id)getAssetsForReferenceId:(NSNumber *)referenceId{
    NSMutableArray *assets = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Assets where refrenceId= ? and  (asset_group != ? and asset_group != ?)",referenceId, kAsset_TermsAndConditions, kAsset_PrivacyPolicy];
    
    Asset *asset = nil;
    while([results next]) {
        asset = [Asset objectFromAseet:results];
        [assets addObject:asset];
    }
    [database close];
    return [NSArray arrayWithArray:assets] ;
}

+(id)getAllKindAssetsForReferenceId:(NSNumber *)referenceId{
    NSMutableArray *assets = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Assets where refrenceId= ?",referenceId];
    
    Asset *asset = nil;
    while([results next]) {
        asset = [Asset objectFromAseet:results];
        [assets addObject:asset];
    }
    [database close];
    return [NSArray arrayWithArray:assets] ;
}

+(id)getAllAssets{
    NSMutableArray *assets = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Assets"];
    
    Asset *asset = nil;
    while([results next]) {
        asset = [Asset objectFromAseet:results];
        [assets addObject:asset];
    }
    [database close];
    return [NSArray arrayWithArray:assets] ;
}

+(id)getAssetsForReferenceId:(NSNumber *)referenceId withIndex:(NSNumber *)index withGroup:(NSString *)group{
    NSMutableArray *assets = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Assets where refrenceId= ? and assetIndex = ? and asset_group = ?",referenceId,index,group];
    
    Asset *asset = nil;
    while([results next]) {
        asset = [Asset objectFromAseet:results];
        [assets addObject:asset];
    }
    [database close];
    return [NSArray arrayWithArray:assets] ;

}

+(id)getAssetForUrlKey:(NSString *)urlKey andGroup:(NSString *)assetGroup{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Assets where urlKey= ?  and asset_group = ?",urlKey,assetGroup];
    
    Asset *asset = nil;
    while([results next]) {
        asset = [Asset objectFromAseet:results];
        
    }
    [database close];
    return asset;
}
+(void)saveAsset:(NSDictionary *)dict{
    @try {
        
        for (NSDictionary *assetDict in dict[kAsset]) {
            NSLog(@"Asset Dict :%@",assetDict);
            NSArray *assets = [Asset getAssetsForReferenceId:@([assetDict[kRefrenceId] intValue]) withIndex:@([assetDict[kAssetIndex] intValue]) withGroup:assetDict[kAssetGroup]];
            for (Asset *asset in assets) {
                if(asset== nil){
                    [Asset insertAsset:assetDict];
                }
                else{
                    if(assetDict != nil){
                        // NSDictionary *assetDict = dict[kAsset];
                        //if([CLQHelper isLastModifiedChanged:[asset.assetLastModified longValue] withServerTimeStamp:assetDict[ktimeModified]])
                        NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithDictionary:assetDict];
                        if(asset.updateRequired.length > 0) 
                          dict[kUpdateRequired]  =  asset.updateRequired;
                        [Asset updateAsset:[NSDictionary  dictionaryWithDictionary:dict]];
                    }
                }
            }
            if(assets.count == 0){
                [Asset insertAsset:assetDict];
            }
        }
        
    }
    
    @catch (NSException *exception) {
        NSLog(@"Exception :saveAsset :%@",exception.description);
    }
}

+(void)saveTermsAndConditionAssets:(NSArray *)array{
     for (NSDictionary *assetDict in array) {
         Asset *asset = [Asset getAssetForUrlKey:assetDict[kUrlKey] andGroup:assetDict[kAssetGroup]];
         if(asset == nil)
             [Asset insertAsset:assetDict];
         else
             [Asset updateAsset:assetDict];
     }
}

+(void)saveAssetSize:(Asset *)asset{
    NSLog(@"Asset refe ID :  %@ size : %@ asset Index :%d",asset.referenceId,asset.assetSize,asset.assetIndex);
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Assets set size= ?, updateRequired= ? where refrenceId= ? and assetIndex = ? and asset_group = ? ",asset.assetSize, @"0",asset.referenceId,@(asset.assetIndex),asset.assetGroup, nil];
    [database close];

}

+(void)insertAsset:(NSDictionary *)dict{
    Asset *asset = [Asset objectFromAseet:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO Assets (refrenceId, asset_group,urlKey,onlineUrl,Offlineurl,fileType,fileExtn,name,assetIndex,updateRequired,timecreated,timemodified) VALUES (?, ?, ?,? ,? ,?, ? ,? ,? ,?,?,?)",asset.referenceId,asset.assetGroup,asset.urlKey,asset.onlineUrl,asset.offlineUrl,asset.fileType,asset.fileExtn,asset.assetName ,@(asset.assetIndex),asset.updateRequired,asset.assetCreated,asset.assetLastModified, nil];
    
    [database close];
    [UserMapping saveUserMapping:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId, kRefrenceId : @([dict[kRefrenceId]  intValue]), kUserMappingType :kUser_Mapping_Group_Asset}];
}

+(void)updateAsset:(NSDictionary *)dict{
    Asset *asset = [Asset objectFromAseet:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Assets set refrenceId= ? ,asset_group = ?, urlKey= ?, onlineUrl= ?,Offlineurl=?,fileType= ?, fileExtn= ?,name = ?,assetIndex= ?,updateRequired = ?, timecreated= ?,timemodified= ? where refrenceId= ? and assetIndex = ? and asset_group= ?", asset.referenceId, asset.assetGroup, asset.urlKey,asset.onlineUrl,asset.offlineUrl,asset.fileType,asset.fileExtn,asset.assetName,@(asset.assetIndex),asset.updateRequired,asset.assetCreated ,asset.assetLastModified,asset.referenceId,@(asset.assetIndex),asset.assetGroup, nil];
    [database close];
     [UserMapping saveUserMapping:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId, kRefrenceId : asset.referenceId, kUserMappingType :kUser_Mapping_Group_Asset}];
}

@end
