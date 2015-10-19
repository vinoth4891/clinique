//
//  NSMutableURLRequest+BNPUrlRequest.h
//  BNPCardif
//
//  Created by Benoit on 04/03/14.
//  Copyright (c) 2014 Lesmobilizers. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef enum {
    HttpMethodGET,
    HttpMethodPOST,
    HttpMethodDELETE
}HttpMethod;

@interface NSMutableURLRequest (PDFUrlRequest)

+ (instancetype) requestWithUrlString:(NSString *)urlString method:(HttpMethod)method parameters:(NSDictionary*)parameters withBody:(NSDictionary *)body;
+ (instancetype) CLQrequestWithUrlString:(NSString *)urlString method:(HttpMethod)method parameters:(NSDictionary*)parameters withBody:(NSDictionary *)body;
@end
