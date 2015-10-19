//
//  PDFResponse.h
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import <Foundation/Foundation.h>
#import "PDFData.h"
#define Response @"response"

@interface PDFResponse : NSObject

@property (nonatomic, readonly) int status;
@property (nonatomic, readonly) int code;
@property (nonatomic, strong, readonly) NSString *description;
@property (nonatomic, strong, readonly) NSHTTPURLResponse* httpUrlReponse;
@property (nonatomic, strong) PDFData* data;
+ (instancetype)responseWithDictionary:(NSDictionary *)dictionary;
+ (instancetype)CLQresponseWithDictionary:(NSDictionary *)dictionary;
@end
