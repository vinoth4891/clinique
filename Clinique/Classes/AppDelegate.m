/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.m
//  Clinique
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "AppDelegate.h"
#import "MainViewController.h"
#import "CLQPdfReaderViewController.h"
#import <Cordova/CDVPlugin.h>
#import "CLQExportViewController.h"
#import "CLQDataBaseManager.h"
#import "CLQServiceManager.h"
#import "ReachabilityManager.h"
#import "ELCUIApplication.h"
#import "Asset.h"
#import "Module.h"
#import "Course.h"
#import "ASAMService.h"

@implementation AppDelegate

@synthesize window, viewController;
@synthesize managedObjectContext = __managedObjectContext;
@synthesize persistentStoreCoordinator = __persistentStoreCoordinator;
@synthesize managedObjectModel = __managedObjectModel;
- (id)init
{
    /** If you need to do any extra app-specific initialization, you can do it here
     *  -jm
     **/
    NSHTTPCookieStorage* cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];

    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    int cacheSizeMemory = 8 * 1024 * 1024; // 8MB
    int cacheSizeDisk = 32 * 1024 * 1024; // 32MB
#if __has_feature(objc_arc)
        NSURLCache* sharedCache = [[NSURLCache alloc] initWithMemoryCapacity:cacheSizeMemory diskCapacity:cacheSizeDisk diskPath:@"nsurlcache"];
#else
        NSURLCache* sharedCache = [[[NSURLCache alloc] initWithMemoryCapacity:cacheSizeMemory diskCapacity:cacheSizeDisk diskPath:@"nsurlcache"] autorelease];
#endif
    [NSURLCache setSharedURLCache:sharedCache];

    self = [super init];
    return self;
}

#pragma mark UIApplicationDelegate implementation

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    CGRect screenBounds = [[UIScreen mainScreen] bounds];

#if __has_feature(objc_arc)
        self.window = [[UIWindow alloc] initWithFrame:screenBounds];
#else
        self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
#endif
    self.window.autoresizesSubviews = YES;

#if __has_feature(objc_arc)
        self.viewController = [[MainViewController alloc] init];
#else
        self.viewController = [[[MainViewController alloc] init] autorelease];
#endif
self.viewController.useSplashScreen = YES;

    // Set your app's start page by setting the <content src='foo.html' /> tag in config.xml.
    // If necessary, uncomment the line below to override it.
    // self.viewController.startPage = @"index.html";

    // NOTE: To customize the view's frame size (which defaults to full screen), override
    // [self.viewController viewWillAppear:] in your view controller.

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];
    NSLog(@"path : %@",NSHomeDirectory());
    [[CLQDataBaseManager dataBaseManager]createDatabase];
    [self.viewController showOrHideBackButton:YES];
      [ReachabilityManager defaultManager];
    /// To log all assets details with course id
  //[NSTimer scheduledTimerWithTimeInterval:5 target:self selector:@selector(unlockDevice:) userInfo:nil repeats:YES];
    [self enableSingleModeApp];
    return YES;
}

- (void) applicationDidTimeout:(NSNotification *) notif {
    [self showTimeOutAlert];
}

-(void)unlockDevice:(NSTimer *)timer{
    [[ASAMService sharedInstance] unlockDeviceWithCompletiopn:^(BOOL isCompleted){
        
    }];
}
- (void)applicationWillEnterForeground:(UIApplication *)application{
    NSLog(@"applicationWillEnterForeground");
    /*if(!self.isFromBlueOcean){
        if([self.alertTimer isValid])
            [self.alertTimer invalidate];
        
        if([self.idleTimer isValid])
            [self.idleTimer invalidate];
        if(self.alert != nil){
           // [self.alert removeFromSuperview];
          //  self.alert = nil;
        }
       // CFRunLoopStop(CFRunLoopGetCurrent());
        [self.alert dismissWithClickedButtonIndex:1 animated:YES];
        
    }
   
    self.isFromBlueOcean = NO;
    MainViewController *mainVc  = (MainViewController *)self.viewController;
    mainVc.backButton.hidden = YES;*/
    //[self.viewController.webView stringByEvaluatingJavaScriptFromString:[NSString //stringWithFormat:@"BObuttonactive(%hhd)",YES]];
    [self enableSingleModeApp];
}

-(void)applicationDidEnterBackground:(UIApplication *)application{
    NSLog(@"applicationDidEnterBackground");
}

-(void)applicationDidBecomeActive:(UIApplication *)application{
    [self enableSingleModeApp];
   /* NSUserDefaults  *standardDefaults = [NSUserDefaults standardUserDefaults];
    
    NSString *settingsBundle = [[NSBundle mainBundle] pathForResource:@"Settings" ofType:@"bundle"];
    if(!settingsBundle) {
        NSLog(@"Could not find Settings.bundle");
        return;
    }
    NSDictionary *settings = [NSDictionary dictionaryWithContentsOfFile:[settingsBundle stringByAppendingPathComponent:@"Root~ipad.plist"]];
    NSArray *preferences = [settings objectForKey:@"PreferenceSpecifiers"];
    
    NSMutableDictionary *defaultsToRegister = [[NSMutableDictionary alloc] initWithCapacity:[preferences count]];
    for(NSDictionary *prefSpecification in preferences) {
        NSString *key = [prefSpecification objectForKey:@"Key"];
        if([key isEqualToString:kIsForBlueOcean]){
            
            [defaultsToRegister setObject :@([[[NSUserDefaults standardUserDefaults] objectForKey:key]boolValue]) forKey:key];
        }
        else if(key) {
            [defaultsToRegister setObject:[prefSpecification objectForKey:@"DefaultValue"] forKey:key];
            NSLog(@"writing as default %@ to the key %@",[prefSpecification objectForKey:@"DefaultValue"],key);
        }
        
    }
     [[NSUserDefaults standardUserDefaults] registerDefaults:defaultsToRegister];
    if ([standardDefaults boolForKey:kIsForBlueOcean])
    {
        [self enableSingleModeApp];
    }
    else{
        [self disableSingleAppMode];
    }*/
   
}

-(void)applicationWillResignActive:(UIApplication *)application{
     [[NSNotificationCenter defaultCenter]removeObserver:self name:kApplicationDidTimeoutNotification object:nil];
}

-(BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation{
     NSLog(@"Source application:%@  url :%@  Annotation :%@",sourceApplication,url.scheme,annotation);
    [self enableSingleModeApp];
    return YES;
}
-(void)enableSingleModeApp{
     // NSUserDefaults  *standardDefaults = [NSUserDefaults standardUserDefaults];
    //BOOL isForBlueOcean  = [standardDefaults boolForKey:kIsForBlueOcean];
    if(kIsForBlueOcean){
        if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
        {
            [self.viewController showOrHideBackButton:NO];
            self.isFromBlueOcean = YES;
            self.isAppQuitFromBlueOcean = NO;
            if(![CLQDataBaseManager dataBaseManager].isSyncInprogress){
                [CLQDataBaseManager dataBaseManager].isIdle =  YES;
//                if(![self.idleTimer isValid]){
//                    self.idleTimer = [NSTimer scheduledTimerWithTimeInterval:kBlueOceanTimeOut target:self
//                                                                    selector:@selector(showTimeOutAlert:) userInfo:nil repeats:YES];
//                }
                [[NSNotificationCenter defaultCenter]removeObserver:self name:kApplicationDidTimeoutNotification object:nil];
                [[ELCUIApplication application]resetIdleTimer];
                [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidTimeout:) name:kApplicationDidTimeoutNotification object:nil];
            }
            [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
            
            
            MainViewController *mainVc  = (MainViewController *)self.viewController;
            mainVc.backButton.hidden = NO;
            mainVc.backButton.frame = CGRectMake((self.window.frame.size.width/2-(mainVc.backButton.frame.size.width/2)) , 20, mainVc.backButton.frame.size.width, mainVc.backButton.frame.size.height);
            // [[ASAMService sharedInstance] lockDevice];
            self.singleModeTimer =  [NSTimer scheduledTimerWithTimeInterval:0 target:self selector:@selector(lockDevice:) userInfo:nil repeats:NO];
            
        }
    }
}
-(void)disableSingleAppMode{
    self.isFromBlueOcean = NO;
    if([self.alertTimer isValid])
        [self.alertTimer invalidate];
    if([self.idleTimer isValid])
        [self.idleTimer invalidate];
    if([self.singleModeTimer isValid])
        [self.singleModeTimer invalidate];
    [self.viewController showOrHideBackButton:YES];
    [[ASAMService sharedInstance] unlockDeviceWithCompletiopn:^(BOOL isCompleted){
    }];
    
}
-(void)lockDevice:(NSTimer *)timer{
     NSLog(@"****** Lock device timer called ******");
    if([timer isValid]){
        NSLog(@"****** Lock device timer valid ******");
        if(![ASAMService sharedInstance].deviceSupportsSingleMode){
             NSLog(@"****** Device is not in single app mode ******");
            [[ASAMService sharedInstance] lockDeviceWithCompletion:^(BOOL completed){
                if(completed){
                    [timer invalidate];
                }
                else{
                    self.singleModeTimer =  [NSTimer scheduledTimerWithTimeInterval:0 target:self selector:@selector(lockDevice:) userInfo:nil repeats:NO];
                }
            }];
        }
        else{
            NSLog(@"****** Timer invalidate ******");
            [timer invalidate];
        }
        
    }
    
}

-(void)resumeIdleTimer:(BOOL)isIdleTimerStopped{
    if(self.isFromBlueOcean && UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
    {
        if([self.alertTimer isValid])
            [self.alertTimer invalidate];
        
        if(isIdleTimerStopped){
            [[NSNotificationCenter defaultCenter]removeObserver:self name:kApplicationDidTimeoutNotification object:nil];
            if(self.alert != nil){
                [self.alert removeFromSuperview];
                self.alert = nil;
            }
        }
        else{
                if(self.alert != nil){
                    [self.alert removeFromSuperview];
                    self.alert = nil;
                }
            [[ELCUIApplication application]resetIdleTimer];
            [[NSNotificationCenter defaultCenter]removeObserver:self name:kApplicationDidTimeoutNotification object:nil];
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationDidTimeout:) name:kApplicationDidTimeoutNotification object:nil];
        }
    }
}


-(void)showTimeOutAlert
{
    if(self.isFromBlueOcean && UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad){
        
            if([CLQDataBaseManager dataBaseManager].isIdle){
                self.alertTimer =  [NSTimer scheduledTimerWithTimeInterval:kBlueOceanCloseTimeOut target:self
                                                                  selector:@selector(quitFromApp:) userInfo:nil repeats:NO];
                
                //  self.alert = [[UIAlertView alloc]initWithTitle:@"" message:kBlueoceanAlert delegate:self cancelButtonTitle:kBlueOceanCancel otherButtonTitles:nil];
                if(self.alert == nil){
                    self.alert = [[CLQAlertView alloc]init];
                    self.alert.message= kBlueoceanAlert;
                    self.alert.width = 250;
                    
                    self.alert.delegate = self;
                    [self.alert addButtonWithTitle:@"" withBackgroundImage:[UIImage imageNamed:@"btn_green"]];
                    [self.alert show];
                
                for(int i = kBlueOceanCloseTimeOut; i>=0; i--){
                    NSString *tmp = kBlueoceanAlert;
                    NSString *str = [NSString stringWithFormat:tmp, i];
                    [self.alert setMessage:str];
                    CFRunLoopRunInMode(kCFRunLoopDefaultMode,1, false);
                }
                // CFRunLoopStop(CFRunLoopGetCurrent());
                [self.alert dismissWithClickedButtonIndex:0 animated:TRUE];
                }
            }
          
    }
}

-(void)quitFromApp:(NSTimer *)timer{
    if(UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad){

        if([self.alertTimer isValid])
            [self.alertTimer invalidate];
        if([self.idleTimer isValid])
            [self.idleTimer invalidate];
        if([self.singleModeTimer isValid])
            [self.singleModeTimer invalidate];
        self.isAppQuitFromBlueOcean   = YES;
        if(self.alert != nil){
            [self.alert removeFromSuperview];
            self.alert = nil;
        }
        [[ASAMService sharedInstance] unlockDeviceWithCompletiopn:^(BOOL isCompleted){
            
            UIApplication *ourApplication = [UIApplication sharedApplication];
            
            NSString *ourPath =[NSString stringWithFormat:kBlueoceanUrlScheme] ;//blueocean://
            NSURL *ourURL = [NSURL URLWithString:ourPath];
            if ([ourApplication canOpenURL:ourURL]) {
               
                [ourApplication openURL:ourURL];
                //[appDelegate.alert dismissWithClickedButtonIndex:0 animated:YES];
            }
        }];
        
    }
}

#pragma mark - CLQAleertView Ddelegate
-(void)alertView:(CLQAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex{
    if([self.alertTimer isValid])
        [self.alertTimer invalidate];
    
    if([self.idleTimer isValid])
        [self.idleTimer invalidate];
    if(self.alert != nil){
        [self.alert removeFromSuperview];
        self.alert = nil;
    }
    if(buttonIndex == 0){
        if(!self.isAppQuitFromBlueOcean)
             [self resumeIdleTimer:NO];// To start
    }
    
   
 
}


// this happens while we are running ( in the background, or from within our own app )
// only valid if Clinique-Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication*)application handleOpenURL:(NSURL*)url
{
    NSLog(@"");
    if (!url) {
        return NO;
    }
   
    // calls into javascript global function 'handleOpenURL'
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];

    return YES;
}

// repost the localnotification using the default NSNotificationCenter so multiple plugins may respond
- (void)            application:(UIApplication*)application
    didReceiveLocalNotification:(UILocalNotification*)notification
{
    // re-post ( broadcast )
    [[NSNotificationCenter defaultCenter] postNotificationName:CDVLocalNotification object:notification];
}

- (NSUInteger)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
{
    // iPhone doesn't support upside down by default, while the iPad does.  Override to allow all orientations always, and let the root view controller decide what's allowed (the supported orientations mask gets intersected).
    NSUInteger supportedInterfaceOrientations = (1 << UIInterfaceOrientationPortrait) | (1 << UIInterfaceOrientationLandscapeLeft) | (1 << UIInterfaceOrientationLandscapeRight) | (1 << UIInterfaceOrientationPortraitUpsideDown);

    return supportedInterfaceOrientations;
}

- (void)applicationDidReceiveMemoryWarning:(UIApplication*)application
{
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
}
-(void)openPdf:(id)sender{
    CLQPdfReaderViewController *readerViewController = [[CLQPdfReaderViewController alloc]init];
    [self.viewController presentViewController:readerViewController animated:NO completion:nil];

}

-(void)openScorm:(id)sender{
    CLQPdfReaderViewController *readerViewController = [[CLQPdfReaderViewController alloc]init];
    [self.viewController presentViewController:readerViewController animated:NO completion:nil];
    
}

-(void)openExportFile:(id)sender{
    @try {
        NSString *filepath =(NSString *)sender;
        CLQExportViewController *exportViewController = [[CLQExportViewController alloc]initWithFilePath:filepath];
        [self.viewController presentViewController:exportViewController animated:NO completion:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception  openExportFile: %@",exception.description);
    }
}

@end
