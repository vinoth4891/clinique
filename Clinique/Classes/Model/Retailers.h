//
//  Retailors.h
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import <Foundation/Foundation.h>

@interface Retailers : NSObject

@property (strong, nonatomic)NSString *name;
@property (strong, nonatomic)NSData *json;
@property (strong, nonatomic)NSString *region;

+(void)saveRetailer:(NSDictionary *)dict;
+(id)objectFormRetalier:(id)object;
@end
