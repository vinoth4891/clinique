//
//  CLQHelper.m
//  Clinique
//
//  Created by BRINDHA_S on 22/07/14.
//
//

#import "CLQHelper.h"
#import "CLQConstants.h"
#import "ReachabilityManager.h"
#import "CacheManager.h"
#import "CLQStrings.h"
#import "Module.h"
#import "Notes.h"
#import "CLQDataBaseManager.h"

@implementation CLQHelper
+(NSString *)getPdfPath:(NSString *)pdfId forPageNumber:(int)page {
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:pdfId];
    BOOL isDir;
    
    NSFileManager *fileManager= [NSFileManager defaultManager];
    
    if(![fileManager fileExistsAtPath:directory isDirectory:&isDir])
        if(![fileManager createDirectoryAtPath:directory withIntermediateDirectories:YES attributes:nil error:NULL])
            NSLog(@"Error: Create folder failed %@", directory);
   if([CacheManager defaultManager].currentCache.isFromFavourite){
       NSArray *fileList = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:directory error:nil];
       if(fileList.count > 0){
           NSString *fileName = fileList[0];
           if([fileName.pathExtension isEqualToString:@"pdf"])
              directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/%@",fileList[0]]];
           else
            directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/%@.pdf",[CacheManager defaultManager].currentCache.lastModifiedDate]];
       }
       else
         directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/%@.pdf",[CacheManager defaultManager].currentCache.lastModifiedDate]];
   }
   else{
         directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/%@.pdf",[CacheManager defaultManager].currentCache.lastModifiedDate]];
   }
    return directory;
}

+(BOOL)fileExixtsAtPath:(NSString *)pdfId{
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:pdfId];
    
    NSArray *fileList = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:directory error:nil];
    NSLog(@"file list  : %@",fileList);
    for (NSString *filePath in fileList){
        NSLog(@"file%@", filePath);
         ;
        if([CacheManager defaultManager].currentCache.isFromFavourite){
            //directory =  [directory stringByAppendingString:@"/Favouriote.pdf"];
            //if([[NSFileManager defaultManager] fileExistsAtPath:directory isDirectory:NO])
            if([filePath.pathExtension isEqualToString:@"pdf"])
                return YES;
        }
        else{
            if([[[filePath lastPathComponent]stringByDeletingPathExtension] isEqualToString:[CacheManager defaultManager].currentCache.lastModifiedDate]){
                return YES;
                
            }else{
                [[NSFileManager defaultManager] removeItemAtPath:directory error:nil];
                return NO;
            }
        }
        
    }
     directory =  [directory stringByAppendingString:[NSString stringWithFormat:@"/%@.pdf",[CacheManager defaultManager].currentCache.lastModifiedDate]];
    if([[NSFileManager defaultManager] fileExistsAtPath:directory isDirectory:NO])
        return YES;
    return NO;
}

+(BOOL)showReachabilityAlert:(NSString *)alertMsg{
    if(![ReachabilityManager defaultManager].isNetworkAvailable){
        UIAlertView *alert = [[UIAlertView alloc]initWithTitle:CLQLocalizedString(ALERT__NETWORK_TITLE) message:CLQLocalizedString(ALERT_NETWORK_MSG) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK)uppercaseString] otherButtonTitles:nil];
        [alert show];
        return YES;
    }
    return NO;
}

+(void)downloadExportFile:(NSString *)fileUrlString withCompletion:(void(^)(NSString *filepath))completion{
   dispatch_queue_t backgroundQueue = dispatch_queue_create("dispatch_queue_#1", 0);
    dispatch_async(backgroundQueue, ^{
        NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *directory = paths[0];
       
        directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/Reports.csv"]];
         dispatch_async(dispatch_get_main_queue(), ^{
            NSData *data = [[NSData alloc]initWithContentsOfURL:[NSURL URLWithString:fileUrlString]];
            [data writeToFile:directory atomically:YES];
       

            completion(directory);
            
        });
    });
    
    

}

+(NSString *)createCsvFile:(NSArray *)moduleIds{
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    
    directory = [directory stringByAppendingString:[NSString stringWithFormat:@"/Notes.csv"]];
    
    if([[NSFileManager defaultManager] fileExistsAtPath:directory]){
        [[NSFileManager defaultManager]removeItemAtPath:directory error:nil];
        [[NSFileManager defaultManager]createFileAtPath:directory contents:nil attributes:nil];
    }
    
    CHCSVWriter *csvWriter=[[CHCSVWriter alloc]initForWritingToCSVFile:directory];
    
    [csvWriter writeField:CLQLocalizedString(kCSV_Courses)];
    [csvWriter writeField:CLQLocalizedString(kCSV_FileName)];
    [csvWriter writeField:CLQLocalizedString(kCSv_Comments)];
    [csvWriter finishLine];
    
    for (id object in moduleIds) {
        if(object != [NSNull null]){
            NSNumber *mouduleId = (NSNumber *)object;
            if(mouduleId != nil){
                NSArray *notes = [Notes getNotesForModuleId:@([mouduleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                if(notes.count >0 ){
                    Notes *note = notes[0];
                    NSDictionary *notesDict = [NSJSONSerialization JSONObjectWithData:note.json options:kNilOptions error:nil];
                    
                    [csvWriter writeField:notesDict[@"course_name"]];
                    [csvWriter writeField:notesDict[@"resource_name"]];
                    [csvWriter writeField:note.comments];
                    [csvWriter finishLine];
                }
            }
        }
    }
    [csvWriter closeStream];
    return directory;
}
+(NSString *)stringFromModifiedDate:(NSDate *)date{
    NSDateFormatter *df = [[NSDateFormatter alloc]init];
    [df setDateFormat:@"dd-mm-yyyy hh:mm:ss"];
    return [df stringFromDate:date];
}

+(NSString *)createLocalAssetPath:(Asset *)asset{
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    // filePath = [[NSString stringWithFormat:@"%@/Private Documents/Presentation/%@",[NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0],assetObj.assetId] mutableCopy];
    
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:@"Contents"];
    if(![fileManager fileExistsAtPath:directory]){
        [fileManager createDirectoryAtPath:directory withIntermediateDirectories:YES attributes:nil error:nil];
    }
    directory = [directory stringByAppendingFormat:@"/[%@-%@-%d]%@",asset.assetGroup,asset.referenceId,asset.assetIndex,[asset.assetName stringByReplacingOccurrencesOfString:@"%" withString:@""]];
    // directory = [directory stringByReplacingOccurrencesOfString:@" " withString:@"_"];
    
    if(![[NSFileManager defaultManager]fileExistsAtPath:directory]){
        [[NSFileManager defaultManager]createFileAtPath:directory contents:nil attributes:nil];
    }
    return directory;
    
}
+(NSString *)getAssetPath:(Asset *)asset{
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:@"Contents"];
    directory = [directory stringByAppendingFormat:@"/[%@-%@-%d]%@",asset.assetGroup,asset.referenceId,asset.assetIndex,[asset.assetName stringByReplacingOccurrencesOfString:@"%" withString:@""]];
  //  directory = [directory stringByReplacingOccurrencesOfString:@" " withString:@"_"];
    
      if(![[NSFileManager defaultManager]fileExistsAtPath:directory])
          return @"file://";
    return directory;
}

-(NSString *)getPdfOfflineFilepath:(id)object{
    NSString *filePath = @"";
    return filePath;
}

+(NSString *)createScormPathModule:(NSString *)moduleId{
    NSFileManager *fileManager = [NSFileManager defaultManager];

    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:@"Contents/Scorm"];
    if(![fileManager fileExistsAtPath:directory]){
        [fileManager createDirectoryAtPath:directory withIntermediateDirectories:YES attributes:nil error:nil];
    }
    directory = [directory stringByAppendingFormat:@"/[%@-%@].zip",@"Scorm",moduleId];
  
    if([[NSFileManager defaultManager]fileExistsAtPath:directory]){
        [[NSFileManager defaultManager]removeItemAtPath:directory error:nil];
    }
    [[NSFileManager defaultManager]createFileAtPath:directory contents:nil attributes:nil];
    return directory;

}

+(NSString *)getScormPathForModuleId:(NSString *)moduleId{
    NSArray  *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *directory = paths[0];
    directory = [directory stringByAppendingPathComponent:@"Contents/Scorm"];
    directory = [directory stringByAppendingFormat:@"/[%@-%@]",@"Scorm",moduleId];
    //  directory = [directory stringByReplacingOccurrencesOfString:@" " withString:@"_"];
    
    if(![[NSFileManager defaultManager]fileExistsAtPath:directory])
      return @"file://";
    return directory;

}

+(BOOL)isLastModifiedChanged:(NSNumber *)oldTimeStamp withServerTimeStamp:(NSNumber *)serverTimeStamp{

    /*double dif = serverTimeStamp  - oldTimeStamp;
    if(dif > 0)
        return YES;
    else*/
        return YES;
}
    
+(BOOL)isContentModifiedForAsset:(Asset *)asset{
    
    return YES;
}
#pragma mark - Sha1
+(NSString*) sha1:(NSString*)input
{
    NSLog(@"Passwpord : %@",input);
    const char *cstr = [input cStringUsingEncoding:NSUTF8StringEncoding];
    NSData *data = [NSData dataWithBytes:cstr length:input.length];
    
    uint8_t digest[CC_SHA1_DIGEST_LENGTH];
    
    CC_SHA1(data.bytes, data.length, digest);
    
    NSMutableString* output = [NSMutableString stringWithCapacity:CC_SHA1_DIGEST_LENGTH * 2];
    
    for(int i = 0; i < CC_SHA1_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    
    return output;
}
+(NSString *) md5:(NSString *) input
{
    if(input.length > 0){
        const char *cStr = [input UTF8String];
        unsigned char digest[16];
        CC_MD5( cStr, strlen(cStr), digest ); // This is the md5 call
        
        NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
        
        for(int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
            [output appendFormat:@"%02x", digest[i]];
        
        return  output;
    }
    return @"";
    
}

+ (long long)getFreeSpace {
    long long freeSpace = 0.0f;
    NSError *error = nil;
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSDictionary *dictionary = [[NSFileManager defaultManager] attributesOfFileSystemForPath:[paths lastObject] error: &error];
    
    if (dictionary) {
        NSNumber *fileSystemFreeSizeInBytes = [dictionary objectForKey: NSFileSystemFreeSize];
        NSLog(@"fileSystemFreeSizeInBytes : %@", fileSystemFreeSizeInBytes);
        freeSpace = [fileSystemFreeSizeInBytes longLongValue];
        /* NSError *error = nil;
         NSDictionary *attribs = [[NSFileManager defaultManager] attributesOfItemAtPath:path error:&error];
         if (attribs) {
         NSString *string = [NSByteCountFormatter stringFromByteCount:[attribs fileSize] countStyle:NSByteCountFormatterCountStyleFile];
         NSLog(@"%@", string);
         }*/
        
       
    } else {
        //Handle error
    }  
    return freeSpace;
}

+(NSString *)getContentSizeInBytes:(NSString *)contentSize{
    
    // NSArray *tokens = [NSArray arrayWithObjects:@"bytes",@"KB",@"MB",@"GB",@"TB",nil];
  
    FileSize fileSize = FileSizeBytes;
    NSRange range = [contentSize rangeOfString:@"KB"];
    if(range.length > 0){
        fileSize = FileSizeKB;
    }
    range = [contentSize rangeOfString:@"MB"];
    if(range.length > 0){
        fileSize = FileSizeMB;
    }
    range = [contentSize rangeOfString:@"GB"];
    if(range.length > 0){
        fileSize = FileSizeGB;
    }
    range = [contentSize rangeOfString:@"TB"];
    if(range.length > 0){
        fileSize = FileSizeTB;
    }

    NSMutableString *strippedString = [NSMutableString
                                       stringWithCapacity:contentSize.length];
    
    NSScanner *scanner = [NSScanner scannerWithString:contentSize];
    NSCharacterSet *numbers = [NSCharacterSet
                               characterSetWithCharactersInString:@"0123456789."];
    
    while ([scanner isAtEnd] == NO) {
        NSString *buffer;
        if ([scanner scanCharactersFromSet:numbers intoString:&buffer]) {
            [strippedString appendString:buffer];
            
        } else {
            [scanner setScanLocation:([scanner scanLocation] + 1)];
        }
    }
    double convertedValue = [strippedString doubleValue];
    if(fileSize == FileSizeBytes){
        convertedValue = convertedValue;
    }
    else if(fileSize == FileSizeKB){
        convertedValue *= 1024;
    }
    else if(fileSize == FileSizeMB){
        convertedValue *= 1024*1024;
    }
    else if(fileSize == FileSizeGB){
        convertedValue *= 1024*1024*1024;
    }
    else if(fileSize == FileSizeTB){
        convertedValue *= 1024*1024*1024*1024;
    }

    
    
    return [NSString stringWithFormat:@"%f",convertedValue] ;
}

+(NSString *)getMBFromBytes:(long long)remaingSpace{
    NSByteCountFormatter *formatter = [[NSByteCountFormatter alloc] init];
    formatter.allowedUnits = NSByteCountFormatterUseMB;
    formatter.countStyle = NSByteCountFormatterCountStyleMemory;
    return  [formatter stringFromByteCount:remaingSpace];
}

+(NSString *)getReamaingSpaceSize:(long long)downloadedSize{
    long long availableSpaceInMemory = [CLQHelper getFreeSpace];
    NSString *totalContentSize = [CLQHelper getContentSizeInBytes:[CLQDataBaseManager dataBaseManager].contentSize];
    NSLog(@"Total Content Size :%@", totalContentSize);
    NSLog(@"Available space in memory :%lld",availableSpaceInMemory);
    long long needSpaceToDownload = [totalContentSize longLongValue] - downloadedSize;
    NSLog(@"needSpaceToDownload :%lld",needSpaceToDownload);
   
    NSString *remaingSapceNeed =  @"";
    if(availableSpaceInMemory <= needSpaceToDownload )
    {
        long long remaingSpace = needSpaceToDownload  - availableSpaceInMemory;
        remaingSapceNeed = [CLQHelper getMBFromBytes:(remaingSpace+5242880)];// 5 more MB 
    }
     NSLog(@"remaingSapceNeed :%@",remaingSapceNeed);
    return remaingSapceNeed;
}
+(NSString *)urlEncodeUsingEncoding:(NSStringEncoding)encoding forString:(NSString *)string{
    return (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(NULL,
                                                                                 (CFStringRef)string,
                                                                                 NULL,
                                                                                 (CFStringRef)@"!*'\"();:@&=+$,/?%#[]% ",
                                                                                 CFStringConvertNSStringEncodingToEncoding(encoding)));
}

+(NSString *)urlEncodeUsingEncodingForPDFURl:(NSStringEncoding)encoding forString:(NSString *)string{
    return (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(NULL,
                                                                                 (CFStringRef)string,
                                                                                 NULL,
                                                                                 (CFStringRef)@"!*'\"();@+$,%#[]% ",
                                                                                 CFStringConvertNSStringEncodingToEncoding(encoding)));
}

/* NSByteCountFormatter *formatter = [[NSByteCountFormatter alloc] init];
 formatter.allowedUnits = NSByteCountFormatterUseBytes;
 formatter.countStyle = NSByteCountFormatterCountStyleMemory;
 long long byteCount = 8475891734;
 NSLog(@"%@", [formatter stringFromByteCount:byteCount]);*/
/*#include <stdio.h>
#include <string.h>
#include <stdint.h>

#define SIZE_BUFSZ 7
static char const SIZE_PREFIXES[] = "kMGTPEZY";

void
format_size(char buf[SIZE_BUFSZ], uint64_t sz)
{
    int pfx = 0;
    unsigned int m, n, rem, hrem;
    uint64_t a;
    if (sz <= 0) {
        memcpy(buf, "0 B", 3);
        return;
    }
    a = sz;
    if (a < 1000) {
        n = a;
        snprintf(buf, SIZE_BUFSZ, "%u B", n);
        return;
    }
    for (pfx = 0, hrem = 0; ; pfx++) {
        rem = a % 1000ULL;
        a = a / 1000ULL;
        if (!SIZE_PREFIXES[pfx + 1] || a < 1000ULL)
        break;
        hrem |= rem;
    }
    n = a;
    if (n < 10) {
        if (rem >= 950) {
            buf[0] = '1';
            buf[1] = '0';
            buf[2] = ' ';
            buf[3] = SIZE_PREFIXES[pfx];
            buf[4] = 'B';
            buf[5] = '\0';
            return;
        } else {
            m = rem / 100;
            rem = rem % 100;
            if (rem > 50 || (rem == 50 && ((m & 1) || hrem)))
            m++;
            snprintf(buf, SIZE_BUFSZ,
                     "%u.%u %cB", n, m, SIZE_PREFIXES[pfx]);
        }
    } else {
        if (rem > 500 || (rem == 500 && ((n & 1) || hrem)))
        n++;
        if (n >= 1000 && SIZE_PREFIXES[pfx + 1]) {
            buf[0] = '1';
            buf[1] = '.';
            buf[2] = '0';
            buf[3] = ' ';
            buf[4] = SIZE_PREFIXES[pfx+1];
            buf[5] = 'B';
            buf[6] = '\0';
        } else {
            snprintf(buf, SIZE_BUFSZ,
                     "%u %cB", n, SIZE_PREFIXES[pfx]);
        }
    }
}
enum {
    kUnitStringBinaryUnits     = 1 << 0,
    kUnitStringOSNativeUnits   = 1 << 1,
    kUnitStringLocalizedFormat = 1 << 2
};
-(NSString*) unitStringFromBytes:(double) bytes andUnit:(uint8_t )flags{
    
    static const char units[] = { '\0', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' };
    static int maxUnits = sizeof units - 1;
    
    int multiplier = 1024;
    int exponent = 0;
    
    while (bytes <= multiplier) {
        bytes *= multiplier;
       // exponent++;
    }
    NSNumberFormatter* formatter = [[NSNumberFormatter alloc] init];
    [formatter setMaximumFractionDigits:2];
    if (flags & kUnitStringLocalizedFormat) {
        [formatter setNumberStyle: NSNumberFormatterDecimalStyle];
    }
    // Beware of reusing this format string. -[NSString stringWithFormat] ignores \0, *printf does not.
    return [NSString stringWithFormat:@"%@ %cB", [formatter stringFromNumber: [NSNumber numberWithDouble: bytes]], units[exponent]];
}*/
@end

