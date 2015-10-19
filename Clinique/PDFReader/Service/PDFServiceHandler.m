//
//  PDFServiceHandler.m
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import "PDFServiceHandler.h"

@implementation PDFServiceHandler

+(void)sendRequestToService:(NSString *)service withQuery:(NSDictionary *)dictionary withMethod:(HttpMethod)method withBody:(NSDictionary *)body completion:(void (^)(PDFResponse *, NSError *))completion{
    __block NSError * error;
    __block PDFResponse* bnpResponse;
      NSOperation* requestOperation = [NSBlockOperation blockOperationWithBlock:^{
          NSMutableURLRequest *request = [NSMutableURLRequest requestWithUrlString:service method:method parameters:dictionary withBody:body];
          NSHTTPURLResponse* response;
          NSError* connectionError;
          NSData* data;
          data = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&connectionError];
          
          if(!(error = connectionError)){
             
            //  NSDictionary* responseDictionary = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
              NSString* jsonString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
              NSLog(@"json response : %@",jsonString);
              if(!(error = connectionError)){
                  
                  /*NSMutableDictionary *  dictionary;
                  if([responseDictionary isKindOfClass:[NSDictionary class]])
                      dictionary = [NSMutableDictionary dictionaryWithDictionary:responseDictionary];
                  bnpResponse = [PDFResponse responseWithDictionary:dictionary];*/
                  bnpResponse   = [[PDFResponse alloc]init];
                  bnpResponse.data = [[PDFData alloc]init];
                  bnpResponse.data.result =[NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
              }
          }
      }];
     requestOperation.completionBlock = ^{
         if(error){
             NSOperation* callback = [NSBlockOperation blockOperationWithBlock:^{
                 completion(nil, error);
             }];
             [[NSOperationQueue mainQueue] addOperation:callback];
         }
         else{
             NSOperation* callback = [NSBlockOperation blockOperationWithBlock:^{
                 completion(bnpResponse, nil);
             }];
             [[NSOperationQueue mainQueue] addOperation:callback];
         }
     };
    NSOperationQueue* requestOperationQueue = [NSOperationQueue new];
    [requestOperationQueue addOperation:requestOperation];
}

+(void)CLQsendRequestToService:(NSString *)service withQuery:(NSDictionary *)dictionary withMethod:(HttpMethod)method withBody:(NSDictionary *)body completion:(void (^)(PDFResponse *, NSError *))completion{
    __block NSError * error;
    __block PDFResponse* bnpResponse;
    NSOperation* requestOperation = [NSBlockOperation blockOperationWithBlock:^{
        NSMutableURLRequest *request = [NSMutableURLRequest CLQrequestWithUrlString:service method:method parameters:dictionary withBody:body];
        NSHTTPURLResponse* response;
        NSError* connectionError;
        NSData* data;
        data = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&connectionError];
        NSString* jsonString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        NSLog(@"json response : %@",jsonString);
        if(!(error = connectionError)){
            
            NSDictionary* responseDictionary = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
            if(!(error = connectionError)){
                
                NSMutableDictionary *  dictionary;
                if([responseDictionary isKindOfClass:[NSDictionary class]])
                    dictionary = [NSMutableDictionary dictionaryWithDictionary:responseDictionary];
                bnpResponse = [PDFResponse CLQresponseWithDictionary:dictionary];
            }
        }
    }];
    requestOperation.completionBlock = ^{
        if(error){
            NSOperation* callback = [NSBlockOperation blockOperationWithBlock:^{
                completion(nil, error);
            }];
            [[NSOperationQueue mainQueue] addOperation:callback];
        }
        else{
            NSOperation* callback = [NSBlockOperation blockOperationWithBlock:^{
                completion(bnpResponse, nil);
            }];
            [[NSOperationQueue mainQueue] addOperation:callback];
        }
    };
    NSOperationQueue* requestOperationQueue = [NSOperationQueue new];
    [requestOperationQueue addOperation:requestOperation];
}

@end
