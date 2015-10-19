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
//  MainViewController.h
//  Clinique
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "MainViewController.h"
#import "CLQPdfReaderViewController.h"
#import "CLQServiceManager.h"
#import "ReachabilityManager.h"
#import "AppDelegate.h"
#import "CLQConstants.h"
#import "CacheManager.h"
#import "CLQDefaultAlertView.h"
#import "ASAMService.h"

@implementation MainViewController

- (id)initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}

- (id)init
{
    self = [super init];
    if (self) {
        // Uncomment to override the CDVCommandDelegateImpl used
        // _commandDelegate = [[MainCommandDelegate alloc] initWithViewController:self];
        // Uncomment to override the CDVCommandQueue used
        // _commandQueue = [[MainCommandQueue alloc] initWithViewController:self];
    }
    return self;
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];

    // Release any cached data, images, etc that aren't in use.
}

#pragma mark View lifecycle

- (void)viewWillAppear:(BOOL)animated
{
    // View defaults to full size.  If you want to customize the view's size, or its subviews (e.g. webView),
    // you can do so here.

    [super viewWillAppear:animated];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7) {
        CGRect viewBounds = [self.webView bounds];
        viewBounds.origin.y = 20;
        viewBounds.size.height = viewBounds.size.height - 20;
        self.webView.frame = viewBounds;
    }
    self.view.backgroundColor = [UIColor grayColor];
    [ReachabilityManager defaultManager];
   /* if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
    {
        UILongPressGestureRecognizer *gesture = [[UILongPressGestureRecognizer alloc]initWithTarget:self action:@selector(handleGesture:)];
        gesture.minimumPressDuration = 1;
        [self.gestureView addGestureRecognizer:gesture];
        self.gestureView.hidden = NO;
    }
    else{
        self.gestureView.hidden = YES;
    }*/
    
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return [super shouldAutorotateToInterfaceOrientation:interfaceOrientation];
}
- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation duration:(NSTimeInterval)duration{
    //if (isVisible == NO) return; // iOS present modal bodge
     AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    NSLog(@"Frame :%@",NSStringFromCGRect(appdelegate.window.frame));
    self.backButton.frame = CGRectMake((appdelegate.window.frame.size.width/2-(self.backButton.frame.size.width/2)) , 20, self.backButton.frame.size.width, self.backButton.frame.size.height);
    self.gestureView.frame   = CGRectMake(0, 0, self.gestureView.frame.size.width, self.gestureView.frame.size.height);
   
}

-(void)handleGesture:(UILongPressGestureRecognizer *)gesture{
    if(!self.isAlertShowing){
        CLQDefaultAlertView *alert = [[CLQDefaultAlertView alloc]initWithTitle:@"" message:CLQLocalizedString(kUnlockDeviceMsg) delegate:self cancelButtonTitle:CLQLocalizedString(CANCEL) otherButtonTitles:CLQLocalizedString(kOk), nil];
        alert.alertViewStyle= UIAlertViewStyleSecureTextInput;
        alert.dontDisppear = YES;
        self.isAlertShowing = YES;
        [alert show];
    }
    
}
-(IBAction)openPdf:(id)sender{
    CLQPdfReaderViewController *readerViewController = [[CLQPdfReaderViewController alloc]init];
    [self presentViewController:readerViewController animated:NO completion:nil];
}

-(IBAction)buttonClicked:(id)sender{
    AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
    if(appdelegate.isFromBlueOcean && UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad){
        
            if([appdelegate.alertTimer isValid])
                [appdelegate.alertTimer invalidate];
            UIApplication *ourApplication = [UIApplication sharedApplication];
            
            NSString *ourPath =[NSString stringWithFormat:kBlueoceanUrlScheme] ;//blueocean://
            NSURL *ourURL = [NSURL URLWithString:ourPath];
            if ([ourApplication canOpenURL:ourURL]) {
                [appdelegate.alert dismissWithClickedButtonIndex:1 animated:YES];
                [ourApplication openURL:ourURL];
            }
        }
   
      
}
-(void)alertView:(CLQDefaultAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex{
    if(buttonIndex == 1){
       [[ASAMService sharedInstance]unlockDeviceWithCompletiopn:^(BOOL completd){
           
       }];
    }
    self.isAlertShowing = NO;
}
/*-(void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex{
    if(buttonIndex == 1){
        UITextField *textField = [alertView textFieldAtIndex:0];
        if([[textField.text lowercaseString] isEqualToString:[kUnlockPassCode lowercaseString]]){
            
        }
        else{
            textField.text =  nil;
            [textField setPlaceholder:@"Invalid password"];
        }
}
}*/


/* Comment out the block below to over-ride */

/*
- (UIWebView*) newCordovaViewWithFrame:(CGRect)bounds
{
    return[super newCordovaViewWithFrame:bounds];
}
*/

#pragma mark UIWebDelegate implementation

- (void)webViewDidFinishLoad:(UIWebView*)theWebView
{
    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor blackColor];

    return [super webViewDidFinishLoad:theWebView];
}

/* Comment out the block below to over-ride */

/*

- (void) webViewDidStartLoad:(UIWebView*)theWebView
{
    return [super webViewDidStartLoad:theWebView];
}

- (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error
{
    return [super webView:theWebView didFailLoadWithError:error];
}

- (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return [super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
}
*/

@end

@implementation MainCommandDelegate

/* To override the methods, uncomment the line in the init function(s)
   in MainViewController.m
 */

#pragma mark CDVCommandDelegate implementation

- (id)getCommandInstance:(NSString*)className
{
    return [super getCommandInstance:className];
}

/*
   NOTE: this will only inspect execute calls coming explicitly from native plugins,
   not the commandQueue (from JavaScript). To see execute calls from JavaScript, see
   MainCommandQueue below
*/
- (BOOL)execute:(CDVInvokedUrlCommand*)command
{
    return [super execute:command];
}

- (NSString*)pathForResource:(NSString*)resourcepath;
{
    return [super pathForResource:resourcepath];
}

@end

@implementation MainCommandQueue

/* To override, uncomment the line in the init function(s)
   in MainViewController.m
 */
- (BOOL)execute:(CDVInvokedUrlCommand*)command
{
    return [super execute:command];
}

@end
