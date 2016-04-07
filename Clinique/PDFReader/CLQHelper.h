//
//  CLQHelper.h
//  Clinique
//
//  Created by BRINDHA_S on 22/07/14.
//
//

#import <Foundation/Foundation.h>
#import "Asset.h"
#import "CHCSVParser.h"
#import <CommonCrypto/CommonDigest.h>

typedef enum{
    FileSizeBytes,
    FileSizeKB,
    FileSizeMB,
    FileSizeGB,
    FileSizeTB
}FileSize;

@interface CLQHelper : NSObject

+(NSString *)getPdfPath:(NSString *)pdfId forPageNumber:(int)page ;
+(BOOL)fileExixtsAtPath:(NSString *)pdfId;
+(BOOL)showReachabilityAlert:(NSString *)alertMsg;
+(NSString *)stringFromModifiedDate:(NSDate *)date;
+(void)downloadExportFile:(NSString *)fileUrlString withCompletion:(void(^)(NSString *filepath))completion;
+(NSString *)createLocalAssetPath:(Asset *)asset;
+(BOOL)isLastModifiedChanged:(NSNumber *)oldTimeStamp withServerTimeStamp:(NSNumber *)serverTimeStamp;
+(NSString *)getAssetPath:(Asset *)asset;
+(NSString*) sha1:(NSString*)input;
+ (NSString *) md5:(NSString *) input;
+(NSString *)createCsvFile:(NSArray *)notes;
+(NSString *)createScormPathModule:(NSString *)moduleId;
+(NSString *)getScormPathForModuleId:(NSString *)moduleId;
+(NSString *)getReamaingSpaceSize:(long long)downloadedSize;
+(NSString *)urlEncodeUsingEncoding:(NSStringEncoding)encoding forString:(NSString *)string;
+(NSString *)urlEncodeUsingEncodingForPDFURl:(NSStringEncoding)encoding forString:(NSString *)string;
@end
