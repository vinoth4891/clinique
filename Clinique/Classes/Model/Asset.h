//
//  Asset.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Asset : NSObject

@property (nonatomic, retain) NSNumber  *assetCreated;
@property (nonatomic, retain) NSString * assetGroup;
@property (nonatomic, retain) NSNumber  *assetLastModified;
@property (nonatomic, retain) NSString * assetName;
@property (nonatomic, retain) NSString * assetSize;
@property (nonatomic, retain) NSString * fileExtn;
@property (nonatomic, retain) NSString * fileType;
@property (nonatomic, retain) NSString * offlineUrl;
@property (nonatomic, retain) NSString * onlineUrl;
@property (nonatomic, retain) NSNumber * referenceId;
@property (nonatomic, retain) NSString * updateRequired;
@property (nonatomic, retain) NSString * urlKey;
@property (nonatomic, assign) int assetIndex;

+(id)objectFromAseet:(id )object;
+(id)getAssetsForReferenceId:(NSNumber *)referenceId;
+(id)getAllKindAssetsForReferenceId:(NSNumber *)referenceId;
+(void)saveAsset:(NSDictionary *)dict;
+(void)saveAssetSize:(Asset *)asset;
+(void)saveTermsAndConditionAssets:(NSArray *)array;
+(id)getAssetForUrlKey:(NSString *)urlKey andGroup:(NSString *)assetGroup;
+(id)getAssetsForReferenceId:(NSNumber *)referenceId withIndex:(NSNumber *)index withGroup:(NSString *)group;
+(id)getAllAssets;
@end
