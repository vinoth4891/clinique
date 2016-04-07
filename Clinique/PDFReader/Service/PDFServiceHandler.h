//
//  PDFServiceHandler.h
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import <Foundation/Foundation.h>
#import "NSMutableURLRequest+PDFUrlRequest.h"
#import "PDFResponse.h"

@interface PDFServiceHandler : NSObject
+(void)sendRequestToService:(NSString *)service withQuery:(NSDictionary *)dictionary withMethod:(HttpMethod)method withBody:(NSDictionary *)body completion:(void (^)(PDFResponse *, NSError *))completion;
+(void)CLQsendRequestToService:(NSString *)service withQuery:(NSDictionary *)dictionary withMethod:(HttpMethod)method withBody:(NSDictionary *)body completion:(void (^)(PDFResponse *, NSError *))completion;

@end
