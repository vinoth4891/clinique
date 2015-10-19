//
//  ReachabilityManager.m
//  Burgerator
//
//  Created by Benoit on 16/12/13.
//
//

#import "ReachabilityManager.h"
#import "Reachability.h"
#import "AppDelegate.h"
#import "CLQDataBaseManager.h"

static ReachabilityManager *defaultManager =  nil;
@implementation ReachabilityManager


+(ReachabilityManager *)defaultManager{
    if(defaultManager == nil){
        defaultManager = [[ReachabilityManager alloc]init];
        defaultManager.reachability = [Reachability reachabilityForInternetConnection];
        if(!defaultManager.reachability.isReachable){
            defaultManager.isNetworkAvailable = NO;
        }
        else{
            defaultManager.isNetworkAvailable = YES;
        }

        [[NSNotificationCenter defaultCenter] addObserver:defaultManager
                                                 selector:@selector(handleNetworkChange:)
                                                     name:kReachabilityChangedNotification object:nil];
        [defaultManager.reachability startNotifier];
       
    }
    return defaultManager;
}


- (void) handleNetworkChange:(NSNotification *)notice {
    id object = notice.object;
    if([object isKindOfClass:[Reachability class]]){
        Reachability *reachability  = (Reachability *)object;
        
        AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        if(!reachability.isReachable)
        {
            defaultManager.isNetworkAvailable = NO;
            if([CLQDataBaseManager dataBaseManager].isSyncInprogress)
            {
                [CLQDataBaseManager dataBaseManager].isSyncInprogress = NO;
                [CLQDataBaseManager dataBaseManager].isIdle = YES;
                NSDictionary *dict =  @{Key_Error_Code : @"ERR10001",key_Error_Message : kERR10001};
                NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
                NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                
                [appdelegate.viewController syncExceptionPluginCalled:response];
                
            }
        }else{
            defaultManager.isNetworkAvailable = YES;
        }
        
        [appdelegate.viewController javascriptNetworkPlugin:defaultManager.isNetworkAvailable];
    }
    
}

+(BOOL)hasConnectivity {
    struct sockaddr_in zeroAddress;
    bzero(&zeroAddress, sizeof(zeroAddress));
    zeroAddress.sin_len = sizeof(zeroAddress);
    zeroAddress.sin_family = AF_INET;
    
    SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithAddress(kCFAllocatorDefault, (const struct sockaddr*)&zeroAddress);
    if(reachability != NULL) {
        //NetworkStatus retVal = NotReachable;
        SCNetworkReachabilityFlags flags;
        if (SCNetworkReachabilityGetFlags(reachability, &flags)) {
            if ((flags & kSCNetworkReachabilityFlagsReachable) == 0)
            {
                // if target host is not reachable
                return NO;
            }
            
            if ((flags & kSCNetworkReachabilityFlagsConnectionRequired) == 0)
            {
                // if target host is reachable and no connection is required
                //  then we'll assume (for now) that your on Wi-Fi
                return YES;
            }
            
            
            if ((((flags & kSCNetworkReachabilityFlagsConnectionOnDemand ) != 0) ||
                 (flags & kSCNetworkReachabilityFlagsConnectionOnTraffic) != 0))
            {
                // ... and the connection is on-demand (or on-traffic) if the
                //     calling application is using the CFSocketStream or higher APIs
                
                if ((flags & kSCNetworkReachabilityFlagsInterventionRequired) == 0)
                {
                    // ... and no [user] intervention is needed
                    return YES;
                }
            }
            
            if ((flags & kSCNetworkReachabilityFlagsIsWWAN) == kSCNetworkReachabilityFlagsIsWWAN)
            {
                // ... but WWAN connections are OK if the calling application
                //     is using the CFNetwork (CFSocketStream?) APIs.
                return YES;
            }
        }
    }
    
    return NO;
}
@end
