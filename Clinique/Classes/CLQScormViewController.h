//
//  CLQScormViewController.h
//  Clinique
//
//  Created by ANANTHAN_S on 20/04/15.
//
//

#import <UIKit/UIKit.h>

@interface CLQScormViewController : UIViewController<UIWebViewDelegate>

@property (strong, nonatomic)IBOutlet UIWebView *webView;
@property (strong, nonatomic)NSString *filePath;
@property (strong, nonatomic)NSString *manifestPath;
@end
