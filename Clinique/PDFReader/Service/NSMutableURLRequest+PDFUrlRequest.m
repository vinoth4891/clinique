//
//  NSMutableURLRequest+BNPUrlRequest.m
//  BNPCardif
//
//  Created by Benoit on 04/03/14.
//  Copyright (c) 2014 Lesmobilizers. All rights reserved.
//

#import "NSMutableURLRequest+PDFUrlRequest.h"
#import "CLQHelper.h"

@implementation NSMutableURLRequest (PDFUrlRequest)

+ (instancetype) requestWithUrlString:(NSString *)urlString method:(HttpMethod)method parameters:(NSDictionary*)parameters withBody:(NSDictionary *)body{

    NSMutableURLRequest* urlRequest = [[NSMutableURLRequest alloc] init];
    NSArray* keys = parameters.allKeys;
    NSString* paramtersStr = @"?";
    for (NSString* key in keys) {
        paramtersStr = [paramtersStr stringByAppendingFormat:@"%@=%@&", [key stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding], parameters[key]];
    }
    if(paramtersStr.length >0)
        paramtersStr = [paramtersStr substringToIndex:paramtersStr.length-1];
    
    switch (method) {
        case HttpMethodGET:
        {
            urlRequest.HTTPMethod = @"POST";
            
            urlRequest.URL = [NSURL URLWithString:[[urlString stringByAppendingString:paramtersStr]
                                                   stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            
        }
            break;
            
        case HttpMethodPOST:
        {
            urlRequest.HTTPMethod = @"POST";
           
           // urlRequest.URL = [NSURL URLWithString:[[urlString stringByAppendingString:paramtersStr]
                                                   //stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
         // urlString = @"http://clinique-dev.photoninfotech.com/seng/admin/clinique_webservice/services.php?courseid=newuser11&coursemoduleid=Photon%40123&pdfid=moodle_mobile_app&action=get_course_pdf_details";
             urlRequest.URL = [NSURL URLWithString:[urlString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            [urlRequest setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
            [urlRequest setValue:@"application/json" forHTTPHeaderField:@"Accept"];
            if(body != nil)
              urlRequest.HTTPBody = [NSJSONSerialization dataWithJSONObject:body options:kNilOptions error:nil];
        }
            break;
            
        case HttpMethodDELETE:
        {
            urlRequest.HTTPMethod = @"DELETE";
            urlRequest.URL = [NSURL URLWithString:[[urlString stringByAppendingString:paramtersStr]
                                                   stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
            break;
        default:
            break;
    }
    NSLog(@"request is: %@ and body: %@", urlRequest.URL, [[NSString alloc] initWithData:urlRequest.HTTPBody encoding:NSUTF8StringEncoding]);
    return urlRequest;
}

+ (instancetype) CLQrequestWithUrlString:(NSString *)urlString method:(HttpMethod)method parameters:(NSDictionary*)parameters withBody:(NSDictionary *)body{
    
    NSMutableURLRequest* urlRequest = [[NSMutableURLRequest alloc] init];
    NSArray* keys = parameters.allKeys;
    NSString* paramtersStr = @"?";
    for (NSString* key in keys) {
        paramtersStr = [paramtersStr stringByAppendingFormat:@"%@=%@&", [key stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding], parameters[key]];
    }
    if(paramtersStr.length >0)
        paramtersStr = [paramtersStr substringToIndex:paramtersStr.length-1];
    
    switch (method) {
        case HttpMethodGET:
        {
            urlRequest.HTTPMethod = @"GET";
            
            urlRequest.URL = [NSURL URLWithString:[[urlString stringByAppendingString:paramtersStr]
                                                   stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            
        }
            break;
            
        case HttpMethodPOST:
        {
            urlRequest.HTTPMethod = @"POST";
            [urlRequest setTimeoutInterval:180];
            urlRequest.URL = [NSURL URLWithString:[urlString stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            [urlRequest setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
            [urlRequest setValue:@"application/json" forHTTPHeaderField:@"Accept"];
            for (NSString* key in body.allKeys) {
                paramtersStr = [paramtersStr stringByAppendingFormat:@"%@=%@&", [key stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding],[CLQHelper urlEncodeUsingEncoding:NSUTF8StringEncoding forString:body[key]]];
            }
            if(paramtersStr.length >0)
                paramtersStr = [paramtersStr substringToIndex:paramtersStr.length-1];
            NSLog(@"paramtersStr :%@",paramtersStr);
            
            // urlRequest.HTTPBody = [NSJSONSerialization dataWithJSONObject:body options:kNilOptions error:nil];
            [urlRequest setHTTPBody:[paramtersStr dataUsingEncoding:NSUTF8StringEncoding]];
        }
            break;
            
        case HttpMethodDELETE:
        {
            urlRequest.HTTPMethod = @"DELETE";
            urlRequest.URL = [NSURL URLWithString:[[urlString stringByAppendingString:paramtersStr]
                                                   stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
            break;
        default:
            break;
    }
    NSLog(@"request is: %@ and body: %@", urlRequest.URL, [[NSString alloc] initWithData:urlRequest.HTTPBody encoding:NSUTF8StringEncoding]);
    return urlRequest;
}


@end
