//
//  Region.h
//  Clinique
//
//  Created by Brindha_shiva on 3/14/15.
//
//

#import <Foundation/Foundation.h>

@interface Region : NSObject

@property (strong, nonatomic)NSString *name;
@property (strong, nonatomic)NSData *json;
+(void)saveRegion:(NSDictionary *)dict;
+(id)objectFormRegion:(id)object;
@end
