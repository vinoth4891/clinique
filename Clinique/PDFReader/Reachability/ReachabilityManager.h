//
//  ReachabilityManager.h
//  Burgerator
//
//  Created by Benoit on 16/12/13.
//
//

#import <Foundation/Foundation.h>
#import "Reachability.h"

@interface ReachabilityManager : NSObject

@property (strong, nonatomic)Reachability *reachability;
@property (assign,nonatomic)BOOL isNetworkAvailable;
+(ReachabilityManager *)defaultManager;
+(BOOL)hasConnectivity;
@end
