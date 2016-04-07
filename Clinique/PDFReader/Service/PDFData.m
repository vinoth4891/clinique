//
//  PDFData.m
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import "PDFData.h"
#import "PDFResponse.h"

@implementation PDFData

+ (instancetype)dataWithDictionary:(NSDictionary *)dictionary{
    PDFData* data = [[PDFData alloc] initWithDictionary:dictionary];
    return data;
}

- (id)initWithDictionary:(NSDictionary*)dictionary{
    if(self = [super init]){
        _result  = dictionary;
     
    }
    return self;
}

+ (instancetype)CLQdataWithDictionary:(NSDictionary *)dictionary{
    PDFData* data = [[PDFData alloc] initWithDictionaryForClq:dictionary];
    return data;
}

- (id)initWithDictionaryForClq:(NSDictionary*)dictionary{
    if(self = [super init]){
        
        _result  = dictionary;
        /* _result = dictionary[Response][Content];
         if(dictionary[Response][Pages])
         _pages = [dictionary[Response][Pages] intValue];
         if(dictionary[Response][HasMore])
         _hasMore  = [dictionary[Response][HasMore]boolValue];*/
    }
    return self;
}

@end
