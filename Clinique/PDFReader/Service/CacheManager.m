//
//  CacheManager.m
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import "CacheManager.h"
#import "PDFService.h"
#define KEY_PDF_PAGES @"PdfPages"
#define KEY_BOOK_MARK @"BookMarks"
#define KEY_PDF_URL_PATH @"pdfUrl"
#define KEY_SERVICE_URL @"ServiceUrl"

@implementation Cache
-(id)initWithCoder:(NSCoder *)aDecoder{
    if(self = [super init]){
        self.pdfId = [aDecoder decodeObjectForKey:KEY_PDF_PAGES];
        self.bookMarks = [aDecoder decodeObjectForKey:KEY_BOOK_MARK];
        self.comments = [aDecoder decodeObjectForKey:KEY_COMMENT];
        self.pdfFilePath = [aDecoder decodeObjectForKey:KEY_PDF_URL_PATH];
        self.courseModuleId = [aDecoder decodeObjectForKey:KEY_COURSE_MODULE_ID];
        self.token = [aDecoder decodeObjectForKey:KEY_TOKEN];
        self.serviceUrl = [aDecoder decodeObjectForKey:KEY_SERVICE_URL];
                               
    }
    return self;
}
- (void)encodeWithCoder:(NSCoder *)aCoder{
    [aCoder encodeObject:self.pdfId forKey:KEY_PDF_PAGES];
    [aCoder encodeObject:self.bookMarks forKey:KEY_BOOK_MARK];
    [aCoder encodeObject:self.comments forKey:KEY_COMMENT];
    [aCoder encodeObject:self.pdfFilePath forKey:KEY_PDF_URL_PATH];
    [aCoder encodeObject:self.courseModuleId forKey:KEY_COURSE_MODULE_ID];
    [aCoder encodeObject:self.token forKey:KEY_TOKEN];
    [aCoder encodeObject:self.serviceUrl forKey:KEY_SERVICE_URL];
}
@end

#define CACHE_FILE_NAME @"clinique_cache"
@implementation CacheManager{
    NSString* filePath;
}

@synthesize currentCache = _currentCache;
static CacheManager *defaultManager;

- (id)init{
    if(self = [super init]){
        filePath = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES).count > 0 ? NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0] : nil;
        filePath = [filePath stringByAppendingPathComponent:CACHE_FILE_NAME];
        if(filePath && [[NSFileManager defaultManager] fileExistsAtPath:filePath]){
            _currentCache = [NSKeyedUnarchiver unarchiveObjectWithFile:filePath];
        }
        else{
            _currentCache = [[Cache alloc] init];
            _currentCache.bookMarks = [NSMutableArray array];
        }
    }
    return self;
}

+(CacheManager*)defaultManager{
    if (defaultManager == nil) {
        defaultManager = [[CacheManager alloc] init];
          NSString * path = [[NSBundle mainBundle] pathForResource:@"en" ofType:@"lproj"];
        defaultManager.languageBundle = [NSBundle bundleWithPath:path];
    }
    return defaultManager;
}

- (void) saveCache{
    [NSKeyedArchiver archiveRootObject:_currentCache toFile:filePath];
}

- (void) clearCache{
    _currentCache = [[Cache alloc]init];
    [NSKeyedArchiver archiveRootObject:_currentCache toFile:filePath];
}

- (Cache*)currentCache{
    return _currentCache;
}

@end