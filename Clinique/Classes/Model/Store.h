//
//  Store.h
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import <Foundation/Foundation.h>

@interface Store : NSObject
@property (strong, nonatomic)NSString *name;
@property (strong, nonatomic)NSString *country;
@property (strong, nonatomic)NSData *json;
@property (strong, nonatomic)NSString *region;
@property (strong, nonatomic)NSString *retailer;
+(void)saveStore:(NSDictionary *)dict;
+(id)objectFormStore:(id)object;
@end
