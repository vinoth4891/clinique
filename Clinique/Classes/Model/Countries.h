//
//  Countries.h
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import <Foundation/Foundation.h>

@interface Countries : NSObject
@property (strong, nonatomic)NSString *name;
@property (strong, nonatomic)NSString *code;
@property (strong, nonatomic)NSData *json;
@property (strong, nonatomic)NSString *region;

+(void)saveCountry:(NSDictionary *)dict;
+(id)objectFormCountry:(id)object;
@end
