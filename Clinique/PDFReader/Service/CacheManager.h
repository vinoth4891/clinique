//
//  CacheManager.h
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//
#import <Foundation/Foundation.h>
@class Link;

#define CLQLocalizedString(key) [[CacheManager defaultManager].languageBundle localizedStringForKey:key value:key table:nil]
#define KEY_TOKEN @"token"

@interface Cache : NSObject<NSCoding>
@property (strong, nonatomic) NSString *pdfId;
@property (strong, nonatomic) NSString *pdfFilePath;
@property (strong, nonatomic) NSString *lastModifiedDate;
@property (strong, nonatomic) NSString *token;
@property (strong, nonatomic) NSNumber *courseId;
@property (strong, nonatomic) NSString *userId;
@property (strong, nonatomic) NSString *courseModuleId;
@property (strong, nonatomic) NSString *serviceUrl;
@property (assign, nonatomic) BOOL isFromFavourite;
@property (strong, nonatomic) NSMutableArray *bookMarks;
@property (strong, nonatomic) NSString *comments;
@end

@interface CacheManager : NSObject

@property (nonatomic, strong) NSBundle *languageBundle;
@property (nonatomic, readonly) Cache *currentCache;

+ (CacheManager*) defaultManager;

- (void) saveCache;
- (void) clearCache;
@end
