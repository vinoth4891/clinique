//
//  PDFViewerPlugin.m
//  Clinique
//
//  Created by BRINDHA_S on 22/07/14.
//
//

#import "PDFViewerPlugin.h"
#import "AppDelegate.h"
#import "CacheManager.h"
#import "CLQHelper.h"
#import "CLQConstants.h"
#import "CLQScormViewController.h"
#import "CLQDataBaseManager.h"

@implementation PDFViewerPlugin

- (void) openPdf:(CDVInvokedUrlCommand*)sender
{
    NSLog(@"sender : %@",sender.arguments);
    @try {
        [CacheManager defaultManager].currentCache.courseModuleId = sender.arguments.count > 0 ? sender.arguments[0] : @"";
        [CacheManager defaultManager].currentCache.pdfId = sender.arguments.count > 0 ? sender.arguments[0] : @"";
        NSInteger time;
        if(sender.arguments.count > 1){
          time =  sender.arguments[1] != [NSNull null]  ?[sender.arguments[1] integerValue] : 0;
            NSTimeInterval timeInterval = time;
            NSDate *date = [NSDate dateWithTimeIntervalSince1970:timeInterval];
            [CacheManager defaultManager].currentCache.lastModifiedDate =[CLQHelper stringFromModifiedDate:date];
        }
        else{
            [CacheManager defaultManager].currentCache.lastModifiedDate  =  @"";
        }

        [CacheManager defaultManager].currentCache.pdfFilePath = sender.arguments.count > 2 ? sender.arguments[2] : @"";
        [CacheManager defaultManager].currentCache.token = sender.arguments.count > 3 ? sender.arguments[3] : @"";
        [self setlanguage:sender.arguments.count > 4 ?sender.arguments[4] : @"en"];
        
        [CacheManager defaultManager].currentCache.serviceUrl  = sender.arguments.count > 5 ? sender.arguments[5] :@"";
        [CacheManager defaultManager].currentCache.isFromFavourite = sender.arguments.count > 6 ? [sender.arguments[6] boolValue] : NO;
        AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        [appdelegate openPdf:sender];

        NSLog(@"modified date : %@",[CacheManager defaultManager].currentCache.lastModifiedDate );
    }
    @catch (NSException *exception) {
        NSLog(@"Exceptuon :%@",exception.description);
    }

}

-(void)openExportFile:(CDVInvokedUrlCommand *)sender{
    
    @try {
        NSLog(@"sender : %@",sender.arguments);
       [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(detectOrientation)
                                                     name:UIDeviceOrientationDidChangeNotification
                                                   object:nil];
        
        AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        // [appdelegate openExportFile:sender];
        [self setlanguage:sender.arguments.count > 1 ?sender.arguments[1] : @"en"];
        //   NSString *fileurlString =sender.arguments.count > 0 ? sender.arguments[0] : @"";
        [self createActivityIndicator];
        if(sender.arguments.count > 2)
        {
            NSArray *modulesIds = sender.arguments[2];
            NSString *filePath = [CLQHelper createCsvFile:modulesIds];
            //[CLQHelper downloadExportFile:fileurlString withCompletion:^(NSString *filePath){
            if(self.controller)
                [self.controller dismissMenuAnimated:NO];
            self.controller = [UIDocumentInteractionController interactionControllerWithURL:[NSURL fileURLWithPath:filePath]];
            self.controller .delegate = self;
            [self.indicator stopAnimating];
            [self.indicator removeFromSuperview];
            CGRect rect;
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
            {
                rect = [self getRectForView];
            }
            else
            {
                rect = appdelegate.viewController.view.frame;
            }
            
            if(![self.controller  presentOpenInMenuFromRect:rect inView:appdelegate.viewController.view animated:YES]){
                self.alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(ALERT_EXPORT_FILE) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK) uppercaseString] otherButtonTitles:nil, nil];
                self.alert.tag = 1;
                [self.alert show];
                [NSTimer scheduledTimerWithTimeInterval:3.0 target:self selector:@selector(dismissAlert) userInfo:nil repeats:NO];
            }
        }
        // }];
    }
    
    @catch (NSException *exception) {
        NSLog(@"Exception openExportFile: %@",exception.description);
    }
}

-(void)scorm:(CDVInvokedUrlCommand *)command{
    if(command.arguments.count > 0){
        AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        CLQScormViewController *readerViewController = [[CLQScormViewController alloc]init];
        readerViewController.filePath  = command.arguments[0];
        [appdelegate.viewController presentViewController:readerViewController animated:NO completion:nil];
        
        [CLQDataBaseManager dataBaseManager].isIdle = NO;
        [appdelegate resumeIdleTimer:YES];
    }
}

-(void)openReportExportFile:(CDVInvokedUrlCommand *)sender{
    
    @try {
        NSLog(@"sender : %@",sender.arguments);
        [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(detectOrientation)
                                                     name:UIDeviceOrientationDidChangeNotification
                                                   object:nil];
        
        AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
        // [appdelegate openExportFile:sender];
        [self setlanguage:sender.arguments.count > 1 ?sender.arguments[1] : @"en"];
           NSString *fileurlString =sender.arguments.count > 0 ? sender.arguments[0] : @"";
        [self createActivityIndicator];
        if(sender.arguments.count > 1)
        {
          //  NSArray *modulesIds = sender.arguments[2];
        //    NSString *filePath = [CLQHelper createCsvFile:modulesIds];
            [CLQHelper downloadExportFile:fileurlString withCompletion:^(NSString *filePath){
            if(self.controller)
                [self.controller dismissMenuAnimated:NO];
            self.controller = [UIDocumentInteractionController interactionControllerWithURL:[NSURL fileURLWithPath:filePath]];
            self.controller .delegate = self;
            [self.indicator stopAnimating];
            [self.indicator removeFromSuperview];
            CGRect rect;
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
            {
                rect = [self getRectForView];
            }
            else
            {
                rect = appdelegate.viewController.view.frame;
            }
            
            if(![self.controller  presentOpenInMenuFromRect:rect inView:appdelegate.viewController.view animated:YES]){
                self.alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(ALERT_EXPORT_FILE) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK) uppercaseString] otherButtonTitles:nil, nil];
                self.alert.tag = 1;
                [self.alert show];
                [NSTimer scheduledTimerWithTimeInterval:3.0 target:self selector:@selector(dismissAlert) userInfo:nil repeats:NO];
            }
            }];
         };
    }
    
    @catch (NSException *exception) {
        NSLog(@"Exception openReportExportFile: %@",exception.description);
    }
}
-(void)setlanguage:(NSString *)languageString{
  
    NSString *path;
    if(languageString.length > 0){
        path = [[NSBundle mainBundle] pathForResource:languageString ofType:@"lproj"];
        if(path == nil)
            path = [[NSBundle mainBundle] pathForResource:@"en" ofType:@"lproj"];
    }
    else{
        path = [[NSBundle mainBundle] pathForResource:@"en" ofType:@"lproj"];
    }
    [CacheManager defaultManager].languageBundle = [NSBundle bundleWithPath:path];
}

-(NSString *)parseToken:(NSString *)urlString{
    NSString *url=urlString;
    NSString *value;
    NSArray *comp1 = [url componentsSeparatedByString:@"?"];
    NSString *query = [comp1 lastObject];
    NSArray *queryElements = [query componentsSeparatedByString:@"&"];
    for (NSString *element in queryElements) {
        NSArray *keyVal = [element componentsSeparatedByString:@"="];
        if (keyVal.count > 0) {
           // NSString *variableKey = [keyVal objectAtIndex:0];
            value = (keyVal.count == 2) ? [keyVal lastObject] : nil;
        }
    }
    return value;
}

-(void)createActivityIndicator{

    self.indicator = [[UIActivityIndicatorView alloc]initWithFrame:CGRectMake(0, 0, 100, 100)];
    self.indicator.activityIndicatorViewStyle  = UIActivityIndicatorViewStyleGray;
    AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    self.indicator.center = appdelegate.viewController.view.center;
    [appdelegate.viewController.view addSubview:self.indicator];
    [self.indicator startAnimating];
    [self setIndicatorOrientation];
    
}
-(CGRect)getRectForView{
     CGRect rect = [UIScreen mainScreen].bounds;
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    if(UIInterfaceOrientationIsLandscape(orientation)){
        rect.size.width = [UIScreen mainScreen].bounds.size.height;
        rect.size.height = [UIScreen mainScreen].bounds.size.width;
    }
    else{
        rect.size.width = [UIScreen mainScreen].bounds.size.width;
        rect.size.height = [UIScreen mainScreen].bounds.size.height;
        
    }
    rect = CGRectMake(rect.size.width- 200, rect.size.height- 200,  100,  100);
    return rect;
}
-(void)setIndicatorOrientation{
    CGRect rect = [UIScreen mainScreen].bounds;
    if(self.indicator != nil){
        UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
        if(UIInterfaceOrientationIsLandscape(orientation)){
            rect.size.width = [UIScreen mainScreen].bounds.size.height;
            rect.size.height = [UIScreen mainScreen].bounds.size.width;
        }
        else{
            rect.size.width = [UIScreen mainScreen].bounds.size.width;
            rect.size.height = [UIScreen mainScreen].bounds.size.height;
            
        }
        self.indicator.frame = rect;
        self.indicator.center = [self.indicator convertPoint: self.indicator.center fromView: self.indicator.superview];
    }

}

-(void) detectOrientation {
    if (([[UIDevice currentDevice] orientation] == UIDeviceOrientationLandscapeLeft) ||
        ([[UIDevice currentDevice] orientation] == UIDeviceOrientationLandscapeRight)) {
        [self setIndicatorOrientation];
    } else if ([[UIDevice currentDevice] orientation] == UIDeviceOrientationPortrait || [[UIDevice currentDevice] orientation] == UIDeviceOrientationPortraitUpsideDown) {
        [self setIndicatorOrientation];
    }
}

-(void)dismissAlert{
    if(self.alert.isVisible && self.alert.tag == 1) [self.alert dismissWithClickedButtonIndex:0 animated:YES];
}

- (void) documentInteractionControllerDidDismissOpenInMenu:(UIDocumentInteractionController *)controller{
    controller = nil;
}


- (void) documentInteractionControllerDidDismissOptionsMenu:(UIDocumentInteractionController *)controller{
   controller = nil;
}
@end


