//
//  CLQScormViewController.m
//  Clinique
//
//  Created by ANANTHAN_S on 20/04/15.
//
//

#import "CLQScormViewController.h"
#import "CLQDataBaseManager.h"
#import "AppDelegate.h"

@interface CLQScormViewController ()

@end

@implementation CLQScormViewController


- (void)viewDidLoad {
    [super viewDidLoad];
    self.webView.delegate = self;
    [_webView setOpaque:NO];
    
  /* NSString *localFilepath = [[NSBundle mainBundle]pathForResource:@"player.html" ofType:nil inDirectory:@"www/html"];
   NSString *fileUrl = [NSString stringWithFormat:@"%@?manifestURL=%@",localFilepath,self.filePath];
   ////// NSString *fileUrl = [NSString stringWithFormat:@"%@",localFilepath];
    NSLog(@"fileUrl :%@",[NSURL fileURLWithPath:[fileUrl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]]);
    NSURLRequest *urlRequest = [[NSURLRequest alloc]initWithURL:[NSURL fileURLWithPath:[fileUrl stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]] ];
    [_webView loadRequest:urlRequest];*/
    _webView.scrollView.scrollEnabled = NO;
    _webView.scrollView.bounces = NO;
    
    NSURL *url = [[NSBundle mainBundle] URLForResource:@"player" withExtension:@"html" subdirectory:@"www/html"];
    [_webView loadRequest:[NSURLRequest requestWithURL:url]];
  //  [self.webView loadRequest:urlRequest];
    // Do any additional setup after loading the view from its nib.
}
-(void)webViewDidFinishLoad:(UIWebView *)webView{
    
}
-(void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error{
    
}
- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (BOOL)prefersStatusBarHidden
{
    return NO;
}

- (UIStatusBarStyle)preferredStatusBarStyle
{
    return UIStatusBarStyleDefault;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation{
    return YES;
}

- (void)willRotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation duration:(NSTimeInterval)duration{
    //if (isVisible == NO) return; // iOS present modal bodge
    
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation duration:(NSTimeInterval)duration{
    //if (isVisible == NO) return; // iOS present modal bodge
    // Resize button and views
    
 
}
-(IBAction)closeButtonClicked:(id)sender{
     AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    [CLQDataBaseManager dataBaseManager].isIdle = YES;
    [appdelegate resumeIdleTimer:NO];
    [self dismissViewControllerAnimated:YES completion:nil];
}
/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
