//
//  PDFData.h
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import <Foundation/Foundation.h>

#define Pages @"Page"
#define Content @"content"
#define HasMore @"hasmore"

@interface PDFData : NSObject

@property (nonatomic, strong) id result;
@property (nonatomic, assign) int pages;
@property (nonatomic, assign) BOOL hasMore;

+ (instancetype)dataWithDictionary:(NSDictionary*)dictionary;
+ (instancetype)CLQdataWithDictionary:(NSDictionary *)dictionary;
@end
