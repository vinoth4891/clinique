//
//  ElearningPlugin.h
//  Clinique
//
//  Created by ANANTHAN_S on 08/04/15.
//
//

#import <Cordova/CDVViewController.h>

@interface ElearningPlugin : CDVPlugin

-(void)backToBlueOcean:(CDVInvokedUrlCommand *)command;
-(void)videoTapped:(CDVInvokedUrlCommand *)command;
-(void)isFromBlueocean:(CDVInvokedUrlCommand *)command;
@end
