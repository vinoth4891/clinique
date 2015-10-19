//
//  ElearningPlugin.m
//  Clinique
//
//  Created by ANANTHAN_S on 08/04/15.
//
//

#import "ElearningPlugin.h"
#import "Appdelegate.h"
#import "CLQDatabaseManager.h"
#import "ASAMService.h"

@implementation ElearningPlugin

-(void)backToBlueOcean:(CDVInvokedUrlCommand *)command{
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;

    if(UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad){
  
        if([appDelegate.alertTimer isValid])
            [appDelegate.alertTimer invalidate];
        
        if(appDelegate.idleTimer.isValid)
            [appDelegate.idleTimer invalidate];

        [[ASAMService sharedInstance] unlockDeviceWithCompletiopn:^(BOOL isCompleted){
 
            UIApplication *ourApplication = [UIApplication sharedApplication];
            
            NSString *ourPath =[NSString stringWithFormat:kBlueoceanUrlScheme] ;//blueocean://
            NSURL *ourURL = [NSURL URLWithString:ourPath];
            if ([ourApplication canOpenURL:ourURL]) {
                appDelegate.isAppQuitFromBlueOcean = YES;
                [ourApplication openURL:ourURL];
                if([appDelegate.singleModeTimer isValid])
                    [appDelegate.singleModeTimer invalidate];
                
                
                //[appDelegate.alert dismissWithClickedButtonIndex:0 animated:YES];
            }
        }];

    }
   
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@""];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

-(void)videoTapped:(CDVInvokedUrlCommand *)command
{
    if(command.arguments.count > 0)
    {
        NSDictionary *dict =command.arguments[0];
        BOOL isVideoOpned =  [dict[@"VideoTapped"] boolValue];
        [CLQDataBaseManager dataBaseManager].isIdle = !isVideoOpned;
        AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
        [appDelegate resumeIdleTimer:isVideoOpned];
    }                                                                
}

-(void)isFromBlueocean:(CDVInvokedUrlCommand *)command{
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;

    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:!appDelegate.isFromBlueOcean];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
@end
