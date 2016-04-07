//
//  CDVPdfReaderViewController.h
//  CordovaLib
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import <UIKit/UIKit.h>
#import "CLQCustomAlertView.h"
#import "PDFReaderDocument.h"
#import "ThumbsViewController.h"
#import "BookMarks.h"
#import "Notes.h"

static  NSMutableArray *filterResults =  nil;

@class CLQPdfReaderViewController;
@protocol CLQPdfReaderViewControllerDelegate <NSObject>

@optional // Delegate protocols
- (void)dismissReaderViewController:(CLQPdfReaderViewController *)viewController;
@end

@interface CLQPdfReaderViewController : UIViewController<CLQCustomAlertViewDelegate,UIDocumentInteractionControllerDelegate>

@property (strong, nonatomic)IBOutlet UIButton *doneButton;
@property (strong, nonatomic)IBOutlet UIButton *bookMarkbutton;
@property (strong, nonatomic)IBOutlet UIButton *searchButton;
@property (strong, nonatomic)IBOutlet UIButton *commentButton;
@property (strong, nonatomic)IBOutlet UIButton *prevButton;
@property (strong, nonatomic)IBOutlet UIButton *nextButton;
@property (strong, nonatomic)IBOutlet UIButton *thumbnailButton;
@property (strong, nonatomic)IBOutlet UISearchBar *searchBar;
@property (strong, nonatomic)IBOutlet UIButton *goToPageButton;
@property (strong, nonatomic) NSString *keyword;

@property (strong, nonatomic) ThumbsViewController *thumbsViewController;
@property (nonatomic, strong) PDFReaderDocument *document;
@property (nonatomic, strong) CLQCustomAlertView *goToPageView;

@property (strong, nonatomic)Bookmarks *currentBookmark;
@property (strong, nonatomic)Notes *currentNote;

@property (nonatomic, unsafe_unretained) id <CLQPdfReaderViewControllerDelegate> delegate;
-(void)downloadPdf:(NSURL *)urlPath withCompletion:(void(^)(NSString *filePath ))completion;
@end


