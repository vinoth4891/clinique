//
//  User.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import <Foundation/Foundation.h>
#import "CLQStrings.h"

@interface User : NSObject

@property (nonatomic, retain) NSString * userName;
@property (nonatomic, retain) NSString * firstName;
@property (nonatomic, retain) NSString * lastName;
@property (nonatomic, retain) NSString * email;
@property (nonatomic, retain) NSString * country;
@property (nonatomic, retain) NSString * password;
@property (nonatomic, retain) NSString *retailer;
@property (nonatomic, retain) NSString *region;
@property (nonatomic, retain) NSString *store;
@property (nonatomic, retain) NSString * token;
@property (nonatomic, retain) NSString * jobTitle;
@property (nonatomic, retain) NSNumber *userId;
@property (nonatomic, retain) NSData * json;
@property (nonatomic, retain) NSString * firstTime;
@property (nonatomic, retain) NSNumber * status;

-(NSDictionary *)dictionaryFromObject:(User *)login;

+(id)objectFromUser:(id)object;
+(User *)getUserForUserId:(NSNumber *)userId;
+(void)saveUser:(NSDictionary *)dict;
+(void)insertUser:(NSDictionary *)dict;
+(void)updateUser:(id )dict;
+(void)updateFirstTimeUser:(User*)user;
+(id)getUserDetails:(NSDictionary *)dict;
+(void)updateUserProfile:(NSDictionary *)dict;
+(void)updateUserPassword:(id)dict;
+(NSString *)getUserName:(NSString *)userName;
@end
