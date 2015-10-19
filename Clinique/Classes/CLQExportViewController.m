//
//  CLQExportViewController.m
//  Clinique
//
//  Created by BRINDHA_S on 13/08/14.
//
//

#import "CLQExportViewController.h"

@interface CLQExportViewController ()<UIWebViewDelegate>
@property (strong, nonatomic)IBOutlet UIWebView *webView;
@property (strong, nonatomic)IBOutlet UIButton *doneButton;
@property (strong, nonatomic) NSString *filePath;
@property (strong, nonatomic)IBOutlet UIActivityIndicatorView *indicator;
@end

@implementation CLQExportViewController


-(id)initWithFilePath:(NSString *)filePath{
    if(self == [super initWithNibName:NSStringFromClass([CLQExportViewController class]) bundle:nil]){
        self.filePath = filePath;
    }
    return self;
}
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    //[self.webView loadRequest:[NSMutableURLRequest requestWithURL:[NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"bycourse_49602.csv" ofType:nil]]]];
    [self.indicator setHidden:NO];
    [self.indicator startAnimating];
    [self setIndicatorOrientation];
   
    [self.webView loadRequest:[NSMutableURLRequest requestWithURL:[NSURL URLWithString:[self.filePath  stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]]]];
     NSLog(@"file path : %@",[NSURL URLWithString:[self.filePath  stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]]);
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (BOOL)prefersStatusBarHidden
{
	return YES;
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
	[self setIndicatorOrientation];
    
	
}
-(IBAction)doneButtonClicked:(id)sender{
    [self dismissViewControllerAnimated:YES completion:nil];
}

-(void)webViewDidFinishLoad:(UIWebView *)webView{
    [self.indicator stopAnimating];
    [self.indicator setHidden:YES];
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
@end
