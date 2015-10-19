//
//  Login.h
//  Clinique
//
//  Created by SRIKANTH_A on 17/02/15.
//
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>


@interface Login : NSManagedObject

@property (nonatomic, retain) NSString * username;
@property (nonatomic, retain) NSString * password;
@property (nonatomic, retain) NSData * json;

@end
