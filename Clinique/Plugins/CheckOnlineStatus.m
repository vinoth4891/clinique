//
//  CheckOnlineStatus.m
//  Clinique
//
//  Created by ANANTHAN_S on 17/04/15.
//
//

#import "CheckOnlineStatus.h"
#import "ReachabilityManager.h"

@implementation CheckOnlineStatus

-(void)status:(CDVInvokedUrlCommand *)command{
    BOOL status = 0;
    if([ReachabilityManager hasConnectivity]){
        status = 1;
    }
    else{
        status = 0;
    }
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:status];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
@end
