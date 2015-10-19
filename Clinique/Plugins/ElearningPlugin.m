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

@implementation ElearningPlugin

-(void)backToBlueOcean:(CDVInvokedUrlCommand *)command{
    AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;

    if(appDelegate.isFromBlueOcean && UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad){
        if([appDelegate.alertTimer isValid])
            [appDelegate.alertTimer invalidate];
            UIApplication *ourApplication = [UIApplication sharedApplication];
            
            NSString *ourPath =[NSString stringWithFormat:kBlueoceanUrlScheme] ;//blueocean://
            NSURL *ourURL = [NSURL URLWithString:ourPath];
            if ([ourApplication canOpenURL:ourURL]) {
                [ourApplication openURL:ourURL];
                //[appDelegate.alert dismissWithClickedButtonIndex:0 animated:YES];
            }
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
