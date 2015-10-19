//
//  PDFResponse.m
//  Cliqnue
//
//  Created by Benoit on 04/03/14.
//  Copyright (c) 2014 Lesmobilizers. All rights reserved.
//

#import "PDFResponse.h"

#define Status @"status"
#define Error @"error"
#define Code @"code"
#define Description @"msg"

#define UrlResponse @"urlresponse"

@implementation PDFResponse

+ (instancetype)responseWithDictionary:(NSDictionary *)dictionary{
    PDFResponse* pdfResponse = [[PDFResponse alloc] initWithDictionary:dictionary];
    return pdfResponse;
    
}

- (id)initWithDictionary:(NSDictionary*)dictionary{
    if(self = [super init]){
        
        _httpUrlReponse = dictionary[UrlResponse];
        if(dictionary[Error]){
            _status = [dictionary[Error] intValue];
        }
        //_code = [dictionary[Response][Error][Code] intValue];
        //_description = dictionary[Description];
        _data = [PDFData dataWithDictionary:[NSDictionary dictionaryWithDictionary:dictionary]];
    }
    return self;
}

+ (instancetype)CLQresponseWithDictionary:(NSDictionary *)dictionary{
    PDFResponse* pdfResponse = [[PDFResponse alloc] initWithDictionaryForCLQ:dictionary];
    return pdfResponse;
    
}

- (id)initWithDictionaryForCLQ:(NSDictionary*)dictionary{
    if(self = [super init]){
        
        _httpUrlReponse = dictionary[UrlResponse];
        if(dictionary[Error]){
            _status = [dictionary[Error] intValue];
        };
        _data = [PDFData CLQdataWithDictionary:[NSDictionary dictionaryWithDictionary:dictionary]];
    }
    return self;
}
@end
