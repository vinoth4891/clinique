//
//  CDVPdfReaderViewController.m
//  CordovaLib
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import "CLQPdfReaderViewController.h"
#import "CLQReaderConstants.h"
#import "CLQPdfReaderContentView.h"
#import "ReachabilityManager.h"
#import "ReaderThumbCache.h"
#import "ReaderThumbQueue.h"
#import "CLQAddCommentView.h"
#import "PDFRequestManager.h"
#import "PDFReaderDocument.h"
#import "CacheManager.h"
#import "CLQConstants.h"
#import "CLQHelper.h"
#import "Font.h"
#import "Bookmarks.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "Notes.h"
#import "CLQServiceManager.h"
#import "AppDelegate.h"
#import "Module.h"
#import "Course.h"

static NSMutableDictionary *dictionaryOfFonts = nil;
static NSMutableArray *arrayOfFoundStrings = nil;
static int pageSearching = 1;
float _getNumericalValue(CGPDFObjectRef pdfObject, CGPDFObjectType type) {
	if (type == kCGPDFObjectTypeReal) {
		CGPDFReal tx;
		CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeReal, &tx);
		return tx;
	}
	else if (type == kCGPDFObjectTypeInteger) {
		CGPDFInteger tx;
		CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeInteger, &tx);
		return tx;
	}
    
	return 0;
}

void printPDFKeys(const char *key, CGPDFObjectRef ob, void *info) {
    //    NSLog(@"key = %s", key);
}
CGPDFObjectRef _getObject(CGPDFArrayRef pdfArray, int index) {
    CGPDFObjectRef pdfObject;
    CGPDFArrayGetObject(pdfArray, index, &pdfObject);
    return pdfObject;
}
CGPDFArrayRef _getArray(CGPDFScannerRef pdfScanner) {
	CGPDFArrayRef pdfArray;
	CGPDFScannerPopArray(pdfScanner, &pdfArray);
	return pdfArray;
}
CGPDFStringRef _getStringValue(CGPDFObjectRef pdfObject) {
	CGPDFStringRef string;
	CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeString, &string);
	return string;
}
void _didScanFont(const char *key, CGPDFObjectRef object, void *collection)
{
	if (!CGPDFObjectGetType(object) == kCGPDFObjectTypeDictionary) return;
	CGPDFDictionaryRef dict;
	if (!CGPDFObjectGetValue(object, kCGPDFObjectTypeDictionary, &dict)) return;
	Font *font = [Font fontWithDictionary:dict];
	if (!font) return;
	NSString *name = [NSString stringWithUTF8String:key];
	[(__bridge NSMutableDictionary *)collection setObject:font forKey:name];
}
static NSString *unicodeWithPDFString (CGPDFStringRef pdfString, Font *font)
{
	const unsigned char *bytes = CGPDFStringGetBytePtr(pdfString);
	NSInteger length = CGPDFStringGetLength(pdfString);
	if (font.toUnicode)
	{
		NSMutableString *unicodeString = [NSMutableString string];
		for (int i = 0; i < length; i++)
		{
            const unsigned char cid = bytes[i];
		 	[unicodeString appendFormat:@"%C", [font.toUnicode unicodeCharacter:cid]];
		}
		return unicodeString;
	}
    else {
    }
    return nil;
}

static void op_Tj (CGPDFScannerRef s,void *info)
{
    CGPDFStringRef string;
    if (CGPDFScannerPopString(s, &string)&& [(__bridge NSString*)(CGPDFStringCopyTextString(string)) rangeOfString:(__bridge NSString*) info options:NSCaseInsensitiveSearch].location != NSNotFound) {
        NSString *strWordFoundInLine = (__bridge NSString*)(CGPDFStringCopyTextString(string));
        NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:[strWordFoundInLine copy]];
        NSRange range = [strWordFoundInLine rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch];
        [attributedString beginEditing];
        [attributedString addAttribute:NSFontAttributeName value:[UIFont boldSystemFontOfSize:17] range:range];
        [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor redColor] range:range];
        [attributedString endEditing];
        //NSLog(@"String IDentified : %@",[attributedString string]);
        NSDictionary *dictionary =@{@"attributedString": attributedString,@"page": [NSNumber numberWithInt:pageSearching]};
        if(![filterResults containsObject:@(pageSearching)])
            [filterResults addObject:@(pageSearching)];
        [arrayOfFoundStrings addObject:[dictionary mutableCopy]];
    }
    else{
        for (NSString *key in [dictionaryOfFonts allKeys]) {
            Font *font = [dictionaryOfFonts objectForKey:key];
            NSString *unicodeStr = unicodeWithPDFString(string,font);
            NSRange range = [unicodeStr rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch];
            if (range.location != NSNotFound && unicodeStr != nil) {
                NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:[unicodeStr copy]];
                
                [attributedString beginEditing];
                [attributedString addAttribute:NSFontAttributeName value:[UIFont boldSystemFontOfSize:17] range:range];
                [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor redColor] range:range];
                [attributedString endEditing];
                NSDictionary *dictionary =@{@"attributedString": attributedString,@"page": [NSNumber numberWithInt:pageSearching]};
                [arrayOfFoundStrings addObject:[dictionary mutableCopy]];
                if(![filterResults containsObject:@(pageSearching)])
                    [filterResults addObject:@(pageSearching)];
            }
        }
        
    }
}

static void op_TJ (CGPDFScannerRef s,void *info)
{
    NSString *stringIdentified = @"";
    CGPDFArrayRef array = _getArray(s);
    
	for (int i = 0; i < CGPDFArrayGetCount(array); i++) {
		CGPDFObjectRef pdfObject = _getObject(array, i);
		CGPDFObjectType valueType = CGPDFObjectGetType(pdfObject);
        
		if (valueType == kCGPDFObjectTypeString) {
            NSString *stringI = (__bridge NSString*)(CGPDFStringCopyTextString(_getStringValue(pdfObject)));
            if (stringI!=nil) {
                stringIdentified = [stringIdentified stringByAppendingString:stringI];
            }
		}
		else {
            float value = _getNumericalValue(pdfObject, valueType);
            if (value == 0) {
                
            }
            else{
                //stringIdentified = [stringIdentified stringByAppendingString:@" "];
            }
		}
	}
    //NSLog(@"String Identified : %@",stringIdentified);
    if ([stringIdentified rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch].location!=NSNotFound) {
        NSString *strWordFoundInLine = stringIdentified;
        NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:[strWordFoundInLine copy]];
        NSRange range = [strWordFoundInLine rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch];
        [attributedString beginEditing];
        [attributedString addAttribute:NSFontAttributeName value:[UIFont boldSystemFontOfSize:17] range:range];
        [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor redColor] range:range];
        [attributedString endEditing];
        NSDictionary *dictionary =@{@"attributedString": attributedString,@"page": [NSNumber numberWithInt:pageSearching+1]};
        [arrayOfFoundStrings addObject:[dictionary mutableCopy]];
        if(![filterResults containsObject:@(pageSearching)])
            [filterResults addObject:@(pageSearching)];
        
    }
    else{
        for (NSString *key in [dictionaryOfFonts allKeys]) {
            Font *font = [dictionaryOfFonts objectForKey:key];
            NSString *stringIdentified = @"";
            for (int i = 0; i < CGPDFArrayGetCount(array); i++) {
                CGPDFObjectRef pdfObject = _getObject(array, i);
                CGPDFObjectType valueType = CGPDFObjectGetType(pdfObject);
                
                if (valueType == kCGPDFObjectTypeString) {
                    NSString *stringI = unicodeWithPDFString(_getStringValue(pdfObject),font);
                    if (stringI !=nil) {
                        stringIdentified = [stringIdentified stringByAppendingString:stringI];
                    }
                }
                else {
                    float value = _getNumericalValue(pdfObject, valueType);
                    if (value == 0) {
                        
                    }
                    else{
                        //stringIdentified = [stringIdentified stringByAppendingString:@" "];
                    }
                }
            }
            if ([stringIdentified rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch].location!=NSNotFound) {
                NSString *strWordFoundInLine = stringIdentified;
                NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:[strWordFoundInLine copy]];
                NSRange range = [strWordFoundInLine rangeOfString:(__bridge NSString*)(info) options:NSCaseInsensitiveSearch];
                [attributedString beginEditing];
                [attributedString addAttribute:NSFontAttributeName value:[UIFont boldSystemFontOfSize:17] range:range];
                [attributedString addAttribute:NSForegroundColorAttributeName value:[UIColor redColor] range:range];
                [attributedString endEditing];
                NSDictionary *dictionary =@{@"attributedString": attributedString,@"page": [NSNumber numberWithInt:pageSearching+1]};
                [arrayOfFoundStrings addObject:[dictionary mutableCopy]];
                if(![filterResults containsObject:@(pageSearching)])
                    [filterResults addObject:@(pageSearching)];
                
            }
        }
        
    }
    
}



@interface CLQPdfReaderViewController ()<UIScrollViewDelegate, UIGestureRecognizerDelegate,
PDFReaderContentViewDelegate, ThumbsViewControllerDelegate,CLQAddcommentsViewDelegate,UIDocumentInteractionControllerDelegate>


@property (strong, nonatomic)IBOutlet UILabel *pageNumberLabel;
@property (strong, nonatomic)IBOutlet UIScrollView *scrollView;
@property (strong, nonatomic)IBOutlet UIActivityIndicatorView *indicator;
@property (strong, nonatomic)IBOutlet UIView *searchView;

@property (strong, nonatomic) UIPopoverController *popController;
@property (strong, nonatomic) UIAlertView *alert;
@property (assign, nonatomic) NSInteger currentSearchPageIndex;
@property (nonatomic, strong) UIDocumentInteractionController *controller;

@property (nonatomic, strong) CLQAddCommentView *commentView;

@property (nonatomic, strong) CLQPdfReaderContentView *currentContainer;
@property (nonatomic, assign)CGPoint lastContentOffset;

@end

@implementation CLQPdfReaderViewController
{
    NSMutableDictionary *contentViews;
    NSInteger currentPage;
    CGSize lastAppearSize;
    NSDate *lastHideTime;
    BOOL isVisible;
}

#pragma mark Constants

#define PAGING_VIEWS 3
#define STATUS_HEIGHT 20.0f
#define TOOLBAR_HEIGHT 44.0f
#define PAGEBAR_HEIGHT 48.0f
#define TAP_AREA_SIZE 48.0f
#pragma mark Properties
#pragma mark Support methods

- (void)updateScrollViewContentSize
{
	NSInteger count = [self.document.pageCount integerValue] ;
	if (count > PAGING_VIEWS) count = PAGING_VIEWS; // Limit
	CGFloat contentHeight = self.scrollView.bounds.size.height;
	CGFloat contentWidth = (self.scrollView.bounds.size.width *count);
	self.scrollView.contentSize = CGSizeMake(contentWidth, contentHeight);
}

- (void)updateScrollViewContentViews
{
	[self updateScrollViewContentSize]; // Update the content size
	NSMutableIndexSet *pageSet = [NSMutableIndexSet indexSet]; // Page set
    [contentViews enumerateKeysAndObjectsUsingBlock: // Enumerate content views
     ^(id key, id object, BOOL *stop)
     {
         CLQPdfReaderContentView *contentView = object; [pageSet addIndex:contentView.tag];
     }
     ];
	__block CGRect viewRect = CGRectZero; viewRect.size = self.scrollView.bounds.size;
	__block CGPoint contentOffset = CGPointZero; NSInteger page = [self.document.pageNumber integerValue] ;
    
	[pageSet enumerateIndexesUsingBlock: // Enumerate page number set
     ^(NSUInteger number, BOOL *stop)
     {
         NSNumber *key = [NSNumber numberWithInteger:number]; // # key
         CLQPdfReaderContentView *contentView = [contentViews objectForKey:key];
         contentView.frame = viewRect; if (page == number) contentOffset = viewRect.origin;
         viewRect.origin.x += viewRect.size.width; // Next view frame position
     }
     ];
	if (CGPointEqualToPoint(self.scrollView.contentOffset, contentOffset) == false)
	{
		self.scrollView.contentOffset = contentOffset; // Update content offset
	}
}

- (void)updateToolbarBookmarkIcon
{
	//NSInteger page =  [self.document.pageNumber integerValue];
    NSLog(@"Book marks :%@ and current page :%d",self.currentBookmark.pageNumbers,currentPage);
	//BOOL bookmarked = [[CacheManager defaultManager].currentCache.bookMarks containsObject:@(currentPage)];
    NSArray *pageNumbers = [self.currentBookmark.pageNumbers componentsSeparatedByString:@","];
    BOOL bookmarked = [pageNumbers containsObject:[NSString stringWithFormat:@"%d",currentPage]];
	[self.bookMarkbutton setSelected:bookmarked];
}

- (void)showDocumentPage:(NSInteger)page forceToReload:(BOOL)forceToReload selectionPoint:(CGPoint)point withKeywordHighlighted:(NSString*)keyword

{
    @try {
        self.keyword = keyword;
        if (page != currentPage) // Only if different
        {
            
            NSInteger minValue; NSInteger maxValue;
            NSInteger maxPage = [self.document.pageCount integerValue];
            NSInteger minPage = 1;
            
            if ((page < minPage) || (page > maxPage)) return;
            
            if (maxPage <= PAGING_VIEWS) // Few pages
            {
                minValue = minPage;
                maxValue = maxPage;
            }
            else // Handle more pages
            {
                minValue = (page - 1);
                maxValue = (page + 1);
                
                if (minValue < minPage)
                {minValue++; maxValue++;}
                else
                    if (maxValue > maxPage)
                    {minValue--; maxValue--;}
            }
            NSMutableIndexSet *newPageSet = [NSMutableIndexSet new];
            
            NSMutableDictionary *unusedViews = [contentViews mutableCopy];
            
            CGRect viewRect = CGRectZero; viewRect.size = self.scrollView.bounds.size;
            for (NSInteger number = minValue; number <= maxValue; number++)
            {
                NSNumber *key = [NSNumber numberWithInteger:number]; // # key
                
                CLQPdfReaderContentView *contentView = [contentViews objectForKey:key];
                
                if (contentView == nil) // Create a brand new document content view
                {
                    NSURL *fileURL = self.document.fileURL; NSString *phrase = self.document.password; // Document properties
                    
                    contentView = [[CLQPdfReaderContentView alloc] initWithFrame:viewRect fileURL:fileURL page:number password:phrase selectionPoint:point searchWord:self.keyword];
                    
                    [self.scrollView addSubview:contentView]; [contentViews setObject:contentView forKey:key];
                    
                    contentView.contentDelegate = self; [newPageSet addIndex:number];
                }
                else // Reposition the existing content view
                {
                    contentView.frame = viewRect; [contentView zoomReset];
                    [unusedViews removeObjectForKey:key];
                }
                
                viewRect.origin.x += viewRect.size.width;
            }

            [unusedViews enumerateKeysAndObjectsUsingBlock: // Remove unused views
             ^(id key, id object, BOOL *stop)
             {
                 [contentViews removeObjectForKey:key];
                 
                 CLQPdfReaderContentView *contentView = object;
                 
                 [contentView removeFromSuperview];
             }
             ];
            
            unusedViews = nil; // Release unused views
            
            CGFloat viewWidthX1 = viewRect.size.width;
            CGFloat viewWidthX2 = (viewWidthX1 * 2.0f);
            
            CGPoint contentOffset = CGPointZero;
            
            if (maxPage >= PAGING_VIEWS)
            {
                if (page == maxPage)
                    contentOffset.x = viewWidthX2;
                else
                    if (page != minPage)
                        contentOffset.x = viewWidthX1;
            }
            else
                if (page == (PAGING_VIEWS - 1))
                    contentOffset.x = viewWidthX1;
            
           if (CGPointEqualToPoint(self.scrollView.contentOffset, contentOffset) == false)
           {
               [UIView animateWithDuration:1.0 animations:nil completion:^(BOOL finished){
                   CGPoint ofset = CGPointMake(320, contentOffset.y);
                   self.scrollView.contentOffset =ofset;
                   if(finished){
                       self.scrollView.contentOffset = contentOffset;
                   }
                   
               }];
               [UIView animateWithDuration:1.0 animations:^{
                   
               }];
               
                 // Update content offset
            }
            
            //  self.scrollView.contentOffset = CGPointMake((page-1)*self.scrollView.frame.size.width, 0);
            if ([self.document.pageNumber integerValue] != page) // Only if different
            {
                self.document.pageNumber = [NSNumber numberWithInteger:page]; // Update page number
            }
            
            NSURL *fileURL = self.document.fileURL; NSString *phrase = self.document.password; NSString *guid = self.document.guid;
            
            if ([newPageSet containsIndex:page] == YES) // Preview visible page first
            {
                NSNumber *key = [NSNumber numberWithInteger:page]; // # key
                CLQPdfReaderContentView *targetView = [contentViews objectForKey:key];
                [targetView showPageThumb:fileURL page:page password:phrase guid:guid];
                [newPageSet removeIndex:page]; // Remove visible page from set
            }
            
            [newPageSet enumerateIndexesWithOptions:NSEnumerationReverse usingBlock: // Show previews
             ^(NSUInteger number, BOOL *stop)
             {
                 NSNumber *key = [NSNumber numberWithInteger:number]; // # key
                 CLQPdfReaderContentView *targetView = [contentViews objectForKey:key];
                 [targetView showPageThumb:fileURL page:number password:phrase guid:guid];
             }
             ];
            
            newPageSet = nil; // Release new page set
            currentPage = page; // Track current page number
            [self updateToolbarBookmarkIcon]; // Update bookmark
            [self updatePageNumberText:page];
            if(currentPage == 1)
                [self.prevButton setEnabled:NO];
            if(currentPage == [self.document.pageCount intValue]-1)
                [self.nextButton setEnabled:NO];
            if(filterResults.count > 0){
                NSArray *result = [filterResults filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"self < %d",currentPage]];
                [self.prevButton setEnabled:result.count > 0 ? YES : NO];
                result = [filterResults filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"self > %d",currentPage]];
                [self.nextButton setEnabled:result.count > 0 ? YES : NO];
            }
        }
        //currentPage = page;
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

- (void)showDocument:(id)object
{
    @try {
        [self updateScrollViewContentSize]; // Set content size
        [self showDocumentPage:[_document.pageNumber integerValue] forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
        isVisible = YES; // iOS present modal bodge
        
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(void)loadStrings{
    [self.doneButton setTitle:CLQLocalizedString(DONE) forState:UIControlStateNormal];
    [self.doneButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.doneButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
}

#pragma mark UIViewController methods

- (void)viewDidLoad
{
	[super viewDidLoad];
	//assert(_document != nil); // Must have a valid ReaderDocument
    @try {
        self.view.backgroundColor = [UIColor grayColor]; // Neutral gray
        [self loadStrings];
        // UIScrollView
        self.scrollView.contentMode = UIViewContentModeRedraw;
        self.scrollView.scrollsToTop = NO; self.scrollView.delaysContentTouches = NO;
        self.scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        self.scrollView.backgroundColor = [UIColor whiteColor];
        
        UITapGestureRecognizer *singleTapOne = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleSingleTap:)];
        //singleTapOne.numberOfTouchesRequired = 1;
        singleTapOne.numberOfTapsRequired = 1; singleTapOne.delegate = self;
      // [self.view addGestureRecognizer:singleTapOne];
        
        UISwipeGestureRecognizer *rightSwap = [[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(handleRightSwap:)];
       // [rightSwap requireGestureRecognizerToFail:singleTapOne];
        //rightSwap.delegate = self;
        rightSwap.direction = UISwipeGestureRecognizerDirectionRight;
        [self.view addGestureRecognizer:rightSwap];
        
        UISwipeGestureRecognizer *leftSwap = [[UISwipeGestureRecognizer alloc]initWithTarget:self action:@selector(handleLeftSwap:)];
        leftSwap.direction = UISwipeGestureRecognizerDirectionLeft;
       // leftSwap.delegate = self;
      //  [leftSwap requireGestureRecognizerToFail:singleTapOne];
        [self.view addGestureRecognizer:leftSwap];
        
        [_scrollView.panGestureRecognizer requireGestureRecognizerToFail:rightSwap];
        [_scrollView.panGestureRecognizer requireGestureRecognizerToFail:leftSwap];
        
        contentViews = [NSMutableDictionary new]; lastHideTime = [NSDate date];
        [self.indicator startAnimating];
        [[UITextField appearanceWhenContainedIn:[UISearchBar class], nil] setFont:[UIFont fontWithName:@"Helvetica" size:20]];
        [[UITextField appearanceWhenContainedIn:[UISearchBar class], nil] setTextColor:[UIColor colorWithRed:3/255.0 green:3/255.0 blue:3/255.0 alpha:1.0]];
        
        
        // down load pdf
        //[self.collectionView registerClass:[CLQContentViewCell class] forCellWithReuseIdentifier:@"CLQContentViewCell"];
        //_collectionView.contentInset = UIEdgeInsetsMake(0, (self.view.frame.size.width-320)/2, 0, (self.view.frame.size.width-480)/2);
        
        
        //Load pdf from  local path
        
        self.document = [[PDFReaderDocument alloc]initWithFilePath:[CacheManager defaultManager].currentCache.pdfFilePath  password:@""];
        if(self.document == nil){
            UIAlertView *alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(ALERT_INVALID_FILE) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK)uppercaseString] otherButtonTitles:nil, nil];
            [alert show];
            return ;
        }
        [self performSelector:@selector(showDocument:) withObject:nil afterDelay:0.2];
        [self updateScrollViewContentViews];
        [self updatePageNumberText:[self.document.pageNumber integerValue]];
        [self.scrollView setBackgroundColor:[UIColor clearColor]];
        [self.indicator stopAnimating];
        // get book marks

        [[CLQDataBaseManager dataBaseManager]getBookmarksJsonForModuleId:@([[CacheManager defaultManager].currentCache. courseModuleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId withCompletion:^(Bookmarks *bookmark, BOOL completion){
            self.currentBookmark = bookmark;
            [self updateToolbarBookmarkIcon];
        }];
        
        NSArray  *notes = [Notes getNotesForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        if(notes.count > 0) self.currentNote = notes[0];
        [self.commentButton setSelected:self.currentNote.comments.length> 0  ? YES : NO];
       
        
        // Comment this because of Offline capability
       /* [self downloadPdf:[CacheManager defaultManager].currentCache.pdfUrl withCompletion:^(NSString *filePath){
      
            [self.indicator stopAnimating];
            self.document = [[PDFReaderDocument alloc]initWithFilePath:filePath password:@""];
            if(self.document == nil){
                UIAlertView *alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(ALERT_INVALID_FILE) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK)uppercaseString] otherButtonTitles:nil, nil];
                [alert show];
                return ;
            }
            [self performSelector:@selector(showDocument:) withObject:nil afterDelay:0.2];
            [self updateScrollViewContentViews];
            [self updatePageNumberText:[self.document.pageNumber integerValue]];
            [self.scrollView setBackgroundColor:[UIColor clearColor]];
            
            if([CLQHelper showReachabilityAlert:nil]) return;
            // get book marks
            [[PDFRequestManager defaultManager]getBookMarks:[CacheManager defaultManager].currentCache.pdfId withCompletion:^(PDFResponse *response , NSError *error){
                [self updateToolbarBookmarkIcon];
            }];
            // get notes
            [[PDFRequestManager defaultManager]getComments:[CacheManager defaultManager].currentCache.pdfId withCompletion:^(NSString * comment, NSError *error){
                [self.commentButton setSelected:comment.length> 0  ? YES : NO];
            }];
        }];*/
    }
    @catch (NSException *exception) {
        NSLog(@"Excetion : %@",exception.description);
    }
    
}

-(void)downloadPdf:(NSURL *)urlPath withCompletion:(void(^)(NSString *filePath ))completion{
   
    dispatch_queue_t backgroundQueue = dispatch_queue_create("dispatch_queue_#1", 0);
    dispatch_async(backgroundQueue, ^{
        NSString *path;
        if(![CLQHelper fileExixtsAtPath:[CacheManager defaultManager].currentCache.pdfId]){
            path = [CLQHelper getPdfPath:[CacheManager defaultManager].currentCache.pdfId forPageNumber:0];
            
            NSData *data = [[NSData alloc]initWithContentsOfURL:urlPath];
            [data writeToFile:path atomically:YES];
        }
        else{
            path =[CLQHelper getPdfPath:[CacheManager defaultManager].currentCache.pdfId forPageNumber:0];
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(path);
            
        });
    });
}

- (void)viewWillAppear:(BOOL)animated
{
	[super viewWillAppear:animated];
	if (CGSizeEqualToSize(lastAppearSize, CGSizeZero) == false)
	{
		lastAppearSize = CGSizeZero; // Reset view size tracking
	}
}

- (void)viewDidAppear:(BOOL)animated
{
	[super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated{
	[super viewWillDisappear:animated];
	lastAppearSize = self.view.bounds.size; // Track view size
}

- (void)viewDidDisappear:(BOOL)animated{
	[super viewDidDisappear:animated];
}

- (void)viewDidUnload
{
#ifdef DEBUG
	NSLog(@"%s", __FUNCTION__);
#endif
    
	self.scrollView = nil; contentViews = nil; lastHideTime = nil;
	lastAppearSize = CGSizeZero; currentPage = 1;
	[super viewDidUnload];
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
    
	[self updateScrollViewContentViews]; // Update content views
    [self setOrientationForGoToView];
    [self setOrientationForComments];
	lastAppearSize = CGSizeZero; // Reset view size tracking
}

/*
 - (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
 {
 //if (isVisible == NO) return; // iOS present modal bodge
 
 //if (fromInterfaceOrientation == self.interfaceOrientation) return;
 }
 */

- (void)didReceiveMemoryWarning{
#ifdef DEBUG
	NSLog(@"%s", __FUNCTION__);
#endif
    
	[super didReceiveMemoryWarning];
}

- (void)dealloc{
	[[NSNotificationCenter defaultCenter] removeObserver:self];
    
}

#pragma mark UIScrollViewDelegate methods

-(void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    self.lastContentOffset = scrollView.contentOffset;
}

-(void)scrollViewDidScroll:(UIScrollView *)scrollView{

}
/*-(void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate{
    __block NSInteger page = 0;
    CGFloat contentOffsetX = scrollView.contentOffset.x;
     [contentViews enumerateKeysAndObjectsUsingBlock: // Enumerate content views
     ^(id key, id object, BOOL *stop)
     {
     CLQPdfReaderContentView *contentView = object;
     if (contentView.frame.origin.x == contentOffsetX)
     {
     page = contentView.tag; *stop = YES;
     }
     }];
     if(page == 0){
     if (scrollView.contentOffset.x<self.lastContentOffset.x) {
     page = [self.document.pageNumber integerValue]-1;
     
     } else if (scrollView.contentOffset.x>self.lastContentOffset.x) {
     page = [self.document.pageNumber integerValue]+1;
     }
     }
     [self showDocumentPage:page forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword]; // Show the page
     [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
}*/
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView{
    __block NSInteger page = 0;
    CGFloat contentOffsetX = scrollView.contentOffset.x;
    [contentViews enumerateKeysAndObjectsUsingBlock: // Enumerate content views
     ^(id key, id object, BOOL *stop)
     {
         CLQPdfReaderContentView *contentView = object;
         if (contentView.frame.origin.x == contentOffsetX)
         {
             page = contentView.tag; *stop = YES;
         }
     }];
    if(page == 0){
        if (scrollView.contentOffset.x<self.lastContentOffset.x) {
            page = [self.document.pageNumber integerValue]-1;
            
        } else if (scrollView.contentOffset.x>self.lastContentOffset.x) {
            page = [self.document.pageNumber integerValue]+1;
        }
    }
    [self showDocumentPage:page forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword]; // Show the page
    [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView{
    
   // [self.scrollView.delegate scrollViewDidEndDecelerating:self.scrollView];
    
    [self showDocumentPage:scrollView.tag forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];  // Show page
    self.scrollView.tag = 0; // Clear page number tag
    [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
}

#pragma mark UIGestureRecognizerDelegate methods

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)recognizer shouldReceiveTouch:(UITouch *)touch{
	if ([touch.view isKindOfClass:[UIScrollView class]]) return YES;
	return NO;
}

/*- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer{

    return YES;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer{
    return YES;
}*/



/*- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldBeRequiredToFailByGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer{
    return NO;
}*/
#pragma mark UIGestureRecognizer action methods

- (void)decrementPageNumber{
	if (self.scrollView.tag == 0) // Scroll view did end
	{
		NSInteger page = [self.document.pageNumber integerValue] ;
		NSInteger maxPage = [self.document.pageCount integerValue];
		NSInteger minPage = 1; // Minimum
        
		if ((maxPage > minPage) && (page != minPage))
		{
			CGPoint contentOffset = self.scrollView.contentOffset;
			contentOffset.x -= self.scrollView.bounds.size.width; // -= 1
			[self.scrollView setContentOffset:contentOffset animated:YES];
			self.scrollView.tag = (page - 1); // Decrement page number
		}
	}
}

- (void)incrementPageNumber{
	if (self.scrollView.tag == 0) // Scroll view did end
	{
		NSInteger page = [self.document.pageNumber  integerValue];
		NSInteger maxPage = [self.document.pageCount integerValue] ;
		NSInteger minPage = 1; // Minimum
        
		if ((maxPage > minPage) && (page != maxPage))
		{
			CGPoint contentOffset = self.scrollView.contentOffset;
			contentOffset.x += self.scrollView.bounds.size.width; // += 1
			[self.scrollView setContentOffset:contentOffset animated:YES];
			self.scrollView.tag = (page + 1); // Increment page number
		}
	}
}

- (void)handleSingleTap:(UITapGestureRecognizer *)recognizer{
    [self.view endEditing:YES];
	if (recognizer.state == UIGestureRecognizerStateRecognized)
	{
		CGRect viewRect = recognizer.view.bounds; // View bounds
		CGPoint point = [recognizer locationInView:recognizer.view];
		CGRect areaRect = CGRectInset(viewRect, TAP_AREA_SIZE, 0.0f); // Area
		if (CGRectContainsPoint(areaRect, point)) // Single tap is inside the area
		{
			NSInteger page = [self.document.pageNumber integerValue] ; // Current page #
			NSNumber *key = [NSNumber numberWithInteger:page]; // Page number key
			CLQPdfReaderContentView *targetView = [contentViews objectForKey:key];
			id target = [targetView processSingleTap:recognizer]; // Target
            //if(self.pdfState == PDFNone){
            if (target != nil) // Handle the returned target object
            {
                if ([target isKindOfClass:[NSURL class]]) // Open a URL
                {
                    NSURL *url = (NSURL *)target; // Cast to a NSURL object
                    if (url.scheme == nil) // Handle a missing URL scheme
                    {
                        NSString *www = url.absoluteString; // Get URL string
                        if ([www hasPrefix:@"www"] == YES) // Check for 'www' prefix
                        {
                            NSString *http = [NSString stringWithFormat:@"http://%@", www];
                            url = [NSURL URLWithString:http]; // Proper http-based URL
                        }
                    }
                    if ([[UIApplication sharedApplication] openURL:url] == NO)
                    {
#ifdef DEBUG
                        NSLog(@"%s '%@'", __FUNCTION__, url); // Bad or unknown URL
#endif
                    }
                }
                else // Not a URL, so check for other possible object type
                {
                    if ([target isKindOfClass:[NSNumber class]]) // Goto page
                    {
                        NSInteger value = [target integerValue]; // Number
                        [self showDocumentPage:value forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword]; // Show the page
                    }
                }
            }
            //}
			return;
		}
		CGRect nextPageRect = viewRect;
		nextPageRect.size.width = TAP_AREA_SIZE;
		nextPageRect.origin.x = (viewRect.size.width - TAP_AREA_SIZE);
        
		if (CGRectContainsPoint(nextPageRect, point)) // page++ area
		{
			[self incrementPageNumber]; return;
		}
		CGRect prevPageRect = viewRect;
		prevPageRect.size.width = TAP_AREA_SIZE;
		if (CGRectContainsPoint(prevPageRect, point)) // page-- area
		{
			[self decrementPageNumber]; return;
		}
	}
}
-(void)handleRightSwap:(UISwipeGestureRecognizer *)gesture{
    NSInteger page = [self.document.pageNumber integerValue];
  //  currentPage  = page -1;
    //[self decrementPageNumber];
    
    [self showDocumentPage:page -1 forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
}

-(void)handleLeftSwap:(UISwipeGestureRecognizer *)gesture{
    NSInteger page = [self.document.pageNumber integerValue];
  //  currentPage  = page +1;
   // [self incrementPageNumber];
    [self showDocumentPage:page +1 forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
   
}
-(IBAction)tapRightButton:(id)sender{
    NSInteger page = [self.document.pageNumber integerValue];
    [self showDocumentPage:page+1 forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
}

-(IBAction)tapLeftButton:(id)sender{
    NSInteger page = [self.document.pageNumber integerValue];
    [self showDocumentPage:page -1 forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
}

- (void)handleDoubleTap:(UITapGestureRecognizer *)recognizer{
	
}

-(void)hidePopover{
    if([self.popController isPopoverVisible])
        [self.popController dismissPopoverAnimated:YES];
}

#pragma mark ReaderContentViewDelegate methods
- (void)contentView:(CLQPdfReaderContentView *)contentView touchesBegan:(NSSet *)touches{
	
}

#pragma mark- Button actions
-(IBAction)doneBuutonClicked:(id)sender{
    @try {
        [self hidePopover];
        [self dismissViewControllerAnimated:YES completion:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)thumnailButtonClicked:(id)sender{
    @try {
        if(self.document != nil){
            self.thumbsViewController = [[ThumbsViewController alloc] initWithReaderDocument:self.document];
            self.thumbsViewController.delegate = self; self.thumbsViewController.title = self.title;
            self.thumbsViewController.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
            self.thumbsViewController.modalPresentationStyle = UIModalPresentationFullScreen;
            [self presentViewController:self.thumbsViewController animated:NO completion:NULL];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)bookMarkClicked:(id)sender{
    @try {
        
       	NSString *page = [self.document.pageNumber stringValue] ;
        
        if(self.currentBookmark == nil){
            [Bookmarks saveBookMarks:@{kId : @(0),
                                       key_CourseModuleid :@([[CacheManager defaultManager].currentCache.courseModuleId  intValue]),
                                       Key_User_Id : [CLQDataBaseManager dataBaseManager].currentUser.userId,
                                       kStatus  : @(1)}];
            NSArray *bookMarks = [Bookmarks getBookMarksForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId  intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
            if(bookMarks.count > 0)
                self.currentBookmark = bookMarks[0];
        }
        
        //NSMutableArray *bookMarks = [CacheManager defaultManager].currentCache.bookMarks;
        NSMutableArray *bookMarks = [NSMutableArray arrayWithArray:[self.currentBookmark.pageNumbers componentsSeparatedByString:@","]];
        NSMutableArray *addedBookmarks = [NSMutableArray arrayWithArray:[self.currentBookmark.addedBookmarks componentsSeparatedByString:@","]];
        NSMutableArray *deletedBookmarks = [NSMutableArray arrayWithArray:[self.currentBookmark.deletedBookmarks componentsSeparatedByString:@","]];
        
        BookMarkServiceType type ;
        if ([bookMarks containsObject:page]) // Remove bookmark
        {
            [self.bookMarkbutton setSelected:NO];
            [bookMarks removeObject:page];
            type = DeleteBookMark;
            if(![deletedBookmarks containsObject:page]){
                [deletedBookmarks addObject:page];
                
                if([addedBookmarks containsObject:page]){
                    [addedBookmarks removeObject:page];
                }
            }
            
        }
        else // Add the bookmarked page index to the bookmarks set
        {
            [self.bookMarkbutton setSelected:YES];
            [bookMarks addObject:page];
            type = InsertBookMark;
            
            if(![addedBookmarks containsObject:page]){
                [addedBookmarks addObject:page];
                
                if([deletedBookmarks containsObject:page])
                    [deletedBookmarks removeObject:page];
            }
        }
 
        if([page intValue] > 0 && [page intValue] <= [self.document.pageCount intValue]){
            [CacheManager defaultManager].currentCache.bookMarks = bookMarks;
            [[CacheManager defaultManager]saveCache];
            
            self.currentBookmark.pageNumbers = [bookMarks componentsJoinedByString:@","];
            self.currentBookmark.addedBookmarks = [addedBookmarks componentsJoinedByString:@","];
            self.currentBookmark.deletedBookmarks = [deletedBookmarks componentsJoinedByString:@","];
            self.currentBookmark.status = @(1);
            self.currentBookmark.timeModified = @(0);
   
            NSLog(@"");
            if(self.currentBookmark != nil){
                [Bookmarks updateBookMarkWithParams:@{key_Bookmarks : self.currentBookmark}];
                if([ReachabilityManager defaultManager].isNetworkAvailable){
                    [CLQServiceManager syncBackToServer:^(BOOL completion){}];
                   // NSArray *bookmarks = [Bookmarks getAllUpdatedBookmarksWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                   // NSDictionary *updateDict = @{kEntityBookmarks : @{key_Bookmarks : bookmarks}};
                    
                    //[CLQServiceManager updateRecordsToServerWithParams:updateDict withCompletion:^(id object,BOOL completed){
                   // }];
                }
                else{
                    
                }
            }
           
        }
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)commentsButtonClicked:(id)sender{
    @try {
        NSLog(@"notes :%@",self.currentNote.comments);
        if(self.currentNote == nil){
            NSArray  *notes = [Notes getNotesForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
            
            if(notes.count > 0)
                self.currentNote = notes[0];
        }
        [self.commentButton setSelected:self.currentNote.comments.length> 0  ? YES : NO];
        self.commentView = [[CLQAddCommentView alloc]initWithComment:self.currentNote.comments];
        self.commentView.delegate = self;
        [self setOrientationForComments];
        self.commentView.commentView.center = [self.commentView convertPoint: self.commentView.center fromView: self.commentView.superview];
        [self.view addSubview:self.commentView];
        
      /* self.commentButton.userInteractionEnabled = NO;
        [self.indicator stopAnimating];
        [self.indicator setHidden:NO];
        [self.indicator startAnimating];
        [[PDFRequestManager defaultManager]getComments:[CacheManager defaultManager].currentCache.pdfId  withCompletion:^(NSString  *comment, NSError *error){
            [self.indicator stopAnimating];
            self.commentView = [[CLQAddCommentView alloc]initWithComment:comment];
            self.commentView.delegate = self;
            [self setOrientationForComments];
            self.commentView.commentView.center = [self.commentView convertPoint: self.commentView.center fromView: self.commentView.superview];
            [self.view addSubview:self.commentView];
        }];*/
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)searchButtonClicked:(id)sender{
    @try {
        [self.searchView setHidden:NO];
        [self.prevButton setEnabled:NO];
        [self.nextButton setEnabled:NO];
        [self.searchBar becomeFirstResponder];
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
    
}
-(IBAction)searhBarCloseClicked:(id)sender{
    [self.view endEditing:YES];
}

-(IBAction)goToViewClicked:(id)sender{
    @try {
        self.goToPageView= [[[NSBundle mainBundle]loadNibNamed:NSStringFromClass([CLQCustomAlertView class]) owner:self options:nil]lastObject];
        [self setOrientationForGoToView];
        self.goToPageView.pageCount = [self.document.pageCount integerValue];
        self.goToPageView.delegate = self;
        [self.goToPageView loadStrings];
        [self.view addSubview:self.goToPageView];
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)downloadPdfClicked:(id)sender{
    @try {
        if (self.document.fileURL)
        {
                self.controller = [UIDocumentInteractionController interactionControllerWithURL:self.document.fileURL];
                self.controller.delegate = self;
                // Present "Open In Menu"
                if(![self.controller presentOpenInMenuFromRect:[sender frame] inView:self.view animated:YES])
                {
                    self.alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(FILE_SAVE_LOCATION)  delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK) uppercaseString] otherButtonTitles:nil, nil];
                    self.alert.tag = 1;
                    [self.alert show];
                    [NSTimer scheduledTimerWithTimeInterval:3.0 target:self selector:@selector(dismissAlert) userInfo:nil repeats:NO];
                }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"exception downloadPdfClicked : %@",exception.description);
    }
}

-(void)dismissAlert{
    if(self.alert.isVisible && self.alert.tag == 1) [self.alert dismissWithClickedButtonIndex:0 animated:YES];
}

#pragma mark - UIDocumentInteractionController Delegate
- (void) documentInteractionControllerDidDismissOpenInMenu:(UIDocumentInteractionController *)controller{
    controller = nil;
}

- (void) documentInteractionControllerDidDismissOptionsMenu:(UIDocumentInteractionController *)controller{
    controller = nil;
}

#pragma mark - Helper methods
- (void)updatePageNumberText:(NSInteger)page
{
	if (page != self.pageNumberLabel.tag) // Only if page number changed
	{
		NSInteger pages = [self.document.pageCount integerValue] ; // Total pages
		NSString *format =@"%i %@ %i"; // Format
		NSString *number = [NSString stringWithFormat:format, page,CLQLocalizedString(OF), pages]; // Text
		self.pageNumberLabel.text = number; // Update the page number label text
		self.pageNumberLabel.tag = page; // Update the last page number tag
	}
}

-(void)setOrientationForGoToView{
    CGRect rect = [UIScreen mainScreen].bounds;
    if(self.goToPageView != nil){
        if([[UIDevice currentDevice].systemVersion floatValue] < 8.0){
        UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
        if(UIInterfaceOrientationIsLandscape(orientation)){
            rect.size.width = [UIScreen mainScreen].bounds.size.height;
            rect.size.height = [UIScreen mainScreen].bounds.size.width;
        }
        else{
            rect.size.width = [UIScreen mainScreen].bounds.size.width;
            rect.size.height = [UIScreen mainScreen].bounds.size.height;
            
        }
        self.goToPageView.frame = rect;
        self.goToPageView.goToView.center = [self.goToPageView convertPoint: self.goToPageView.center fromView: self.goToPageView.superview];
        }
        else{
            AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
            
            NSLog(@"Frame :%@",NSStringFromCGRect(appdelegate.window.frame));
            self.goToPageView.frame = appdelegate.window.frame;
            self.goToPageView.goToView.center = [self.goToPageView convertPoint: self.goToPageView.center fromView: self.goToPageView.superview];
        }
    }
}

-(void)setOrientationForComments{
    CGRect rect = [UIScreen mainScreen].bounds;
    if(self.commentView != nil){
        if([[UIDevice currentDevice].systemVersion floatValue] < 8.0){
            UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
            if(UIInterfaceOrientationIsLandscape(orientation)){
                rect.size.width = [UIScreen mainScreen].bounds.size.height;
                rect.size.height = [UIScreen mainScreen].bounds.size.width;
            }
            else{
                rect.size.width = [UIScreen mainScreen].bounds.size.width;
                rect.size.height = [UIScreen mainScreen].bounds.size.height;
            }
            self.commentView.frame = rect;
        }
        else{
            AppDelegate *appdelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
            
            NSLog(@"Frame :%@",NSStringFromCGRect(appdelegate.window.frame));
            self.commentView.frame = appdelegate.window.frame;
        }
    }
}

#pragma mark CustomALertView delegate
-(void)goToPage:(int)page{
    [self showDocumentPage:page forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
}

#pragma mark CLQAddCommentsViewControllerDelegate methods
-(void)didFinishComment:(CommentSate)state withComment:(NSString *)comment{
    @try {
        self.commentButton.userInteractionEnabled = YES;
        if(state == CommentStateAdd){
            [self.commentButton setSelected:comment.length > 0 ? YES : NO];
           // if([CLQHelper showReachabilityAlert:nil]) return;
            [self.commentView removeFromSuperview];
            [CacheManager defaultManager].currentCache.comments =comment;
            self.currentNote.comments = comment;
            
            Module *module = [Module getModuleForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId intValue])];
            NSString *modulename = @"";
            NSString *coursename = @"";
            if(module != nil){
                Course *course  = [Course getCourseForCourseId:module.courseId andCategoryId:nil];
                if(course != nil){
                    NSDictionary *courseDict   = [NSJSONSerialization JSONObjectWithData:course.json options:kNilOptions error:nil];
                    coursename  = courseDict[@"fullname"];
                }
                NSDictionary * moduleDict  = [NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil];
                modulename  = moduleDict[@"name"];
            }
            
            [Notes saveNotes:@{key_CourseModuleid : @([[CacheManager defaultManager].currentCache.courseModuleId intValue]) ,Key_User_Id : [CLQDataBaseManager dataBaseManager].currentUser.userId,key_Comment :comment,kStatus: @(1),  @"course_name" :coursename.length > 0 ? coursename : @"",@"resource_name" : modulename.length > 0 ? modulename : @""} ];
            
            [Notes updateNotesForParams:@{key_Notes : @{key_CourseModuleid : @([[CacheManager defaultManager].currentCache.courseModuleId intValue]) ,Key_User_Id : [CLQDataBaseManager dataBaseManager].currentUser.userId,key_Comment :comment,kStatus: @(1),  @"course_name" :coursename.length > 0 ? coursename : @"",@"resource_name" : modulename.length > 0 ? modulename : @""}}];
            if([ReachabilityManager defaultManager].isNetworkAvailable){
              /*  NSArray *notes = [Notes getAllUpdatedNotesWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
                NSDictionary *updateDict = @{kEntityNotes : @{key_Notes : notes}};
                [CLQServiceManager updateRecordsToServerWithParams:updateDict withCompletion:^(id object,BOOL completed){
                } ];*/
                 [CLQServiceManager syncBackToServer:^(BOOL completion){}];
            }
     
        }
        else{
            [self.commentView removeFromSuperview];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"error : didFinishComment %@",exception.description);
    }
    
}

#pragma mark ThumbsViewControllerDelegate methods

- (void)dismissThumbsViewController:(ThumbsViewController *)viewController{
	[self updateToolbarBookmarkIcon]; // Update bookmark icon
    [viewController dismissViewControllerAnimated:YES completion:NULL];
    //[self dismissViewControllerAnimated:YES completion:NULL]; // Dismiss
}

- (void)thumbsViewController:(ThumbsViewController *)viewController gotoPage:(NSInteger)page{
    [self showDocumentPage:page forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
}

#pragma mark - UIsearchBar delegates
- (void)searchBarTextDidBeginEditing:(UISearchBar *)searchBar{
    
}

- (void)searchBar:(UISearchBar *)theSearchBar textDidChange:(NSString *)searchText {
    // [self getSearchResult:theSearchBar.text];
    if(searchText.length == 0){
        self.keyword = nil;
        [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
    }
}

-(void)searchBarCancelButtonClicked:(UISearchBar *)searchBar{
    [self.searchView setHidden:YES];
    [searchBar resignFirstResponder];
}
-(void)searchBarSearchButtonClicked:(UISearchBar *)searchBar{
    [self.searchBar resignFirstResponder];
    NSString *rawString = [searchBar text];
    NSCharacterSet *whitespace = [NSCharacterSet whitespaceAndNewlineCharacterSet];
    NSString *trimmed = [rawString stringByTrimmingCharactersInSet:whitespace];
    if ([trimmed length] == 0) {
        return;
    }
    [self getSearchResult:searchBar.text];
}

-(void)getSearchResult:(NSString *)string{
    @try {
        [self searchStringInPdf:string  withCompletion:^(NSArray *results){
            if(results.count == 0 && string.length != 0){
                [self.nextButton setEnabled:NO];
                [self.prevButton setEnabled:NO];
                self.currentSearchPageIndex = 0;
                [filterResults removeAllObjects];
                if(!self.alert.visible){
                    self.alert = [[UIAlertView alloc]initWithTitle:nil message:CLQLocalizedString(ALERT_NO_KEYWORD) delegate:nil cancelButtonTitle:[CLQLocalizedString(ALERT_OK)uppercaseString] otherButtonTitles:nil, nil];
                    [self.alert show];
                }
            }else{
                self.currentSearchPageIndex = 0;
                if(filterResults.count > 0){
                    NSLog(@"filter results: %@",filterResults);
                    if([filterResults containsObject:@(currentPage)]){
                        [self showDocumentPage:currentPage forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
                        self.currentSearchPageIndex = [filterResults indexOfObject:@(currentPage)];
                    }else{
                        [self showDocumentPage:[filterResults[self.currentSearchPageIndex] integerValue] forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
                    }
                    [self.prevButton setEnabled:self.currentSearchPageIndex == 0 ? NO : YES];
                    [self.nextButton setEnabled:self.currentSearchPageIndex == filterResults.count -1 ? NO : YES];
                }
            }
        }];
        
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(void)searchStringInPdf:(NSString *)str withCompletion:(void(^)(NSArray *results))completion{
    
    pageSearching = 1;
    self.keyword = str;
    CGPDFDocumentRef document = CGPDFDocumentCreateWithURL((CFURLRef)self.document.fileURL);
    CGPDFOperatorTableRef operatorTableRef = CGPDFOperatorTableCreate();
    CGPDFOperatorTableSetCallback (operatorTableRef, "Tj", &op_Tj);
    CGPDFOperatorTableSetCallback (operatorTableRef, "TJ", &op_TJ);
    
    if(arrayOfFoundStrings ==nil)
        arrayOfFoundStrings = NSMutableArray.new;
    else
        [arrayOfFoundStrings removeAllObjects];
    
    if(filterResults == nil)
        filterResults = [NSMutableArray array];
    else
        [filterResults removeAllObjects];
    CGPDFPageRef myPage;
    CGPDFScannerRef myScanner;
    CGPDFContentStreamRef myContentStream;
    
    int numOfPages = CGPDFDocumentGetNumberOfPages (document);// 1
    for (pageSearching = 1; pageSearching <= numOfPages; pageSearching++) {
        
        myPage = CGPDFDocumentGetPage (document, pageSearching  );// 2
        CGPDFDictionaryRef dict = CGPDFPageGetDictionary(myPage);
        if (!dict) 	{
            NSLog(@"Scanner: fontCollectionWithPage: page dictionary missing");
            return;
        }
        
        CGPDFDictionaryRef resources;
        if (!CGPDFDictionaryGetDictionary(dict, "Resources", &resources)) {
            NSLog(@"Scanner: fontCollectionWithPage: page dictionary missing Resources dictionary");
            return;
        }
        //CGPDFDictionaryApplyFunction(resources, printPDFKeys, NULL);
        
        CGPDFDictionaryRef fonts;
        if (!CGPDFDictionaryGetDictionary(resources, "Font", &fonts)) {
            fonts = NULL;
            //return;
        }
        dictionaryOfFonts=nil;
        dictionaryOfFonts = [[NSMutableDictionary alloc] init];
        if (fonts != NULL) {
            CGPDFDictionaryApplyFunction(fonts, _didScanFont, (__bridge void *)(dictionaryOfFonts));
        }
        myContentStream = CGPDFContentStreamCreateWithPage (myPage);// 3
        myScanner = CGPDFScannerCreate (myContentStream, operatorTableRef, (__bridge void *)(str));// 4
        CGPDFScannerScan (myScanner);// 5
        CGPDFPageRelease (myPage);// 6
        CGPDFScannerRelease (myScanner);// 7
        CGPDFContentStreamRelease (myContentStream);// 8
    }
    
    CGPDFOperatorTableRelease(operatorTableRef);
    //CGPDFDocumentRelease(document); // Releasing document causing crash
    [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:str userInfo:nil];
    completion(arrayOfFoundStrings);
}

-(IBAction)prevClicked:(id)sender{
    @try {
        if(filterResults.count > 0){
            if(self.currentSearchPageIndex != 0)
                self.currentSearchPageIndex = self.currentSearchPageIndex -1;
            NSLog(@"search index : %ld",(long)self.currentSearchPageIndex);
            int searchPage = [filterResults[self.currentSearchPageIndex]intValue];
            if(currentPage == searchPage){
                if(self.currentSearchPageIndex != 0)
                    self.currentSearchPageIndex = self.currentSearchPageIndex -1;
            }
            [self.prevButton setEnabled:self.currentSearchPageIndex == 0 ? NO : YES];
            [self.nextButton setEnabled:YES];
            [self showDocumentPage:[filterResults[self.currentSearchPageIndex] integerValue] forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
    
}

-(IBAction)nextClicked:(id)sender{
    @try {
        if(filterResults.count > 0){
            if(self.currentSearchPageIndex != filterResults.count-1 ){
                self.currentSearchPageIndex = self.currentSearchPageIndex +1;
                int searchPage = [filterResults[self.currentSearchPageIndex]intValue];
                if(currentPage == searchPage){
                    if(self.currentSearchPageIndex != filterResults.count-1)
                        self.currentSearchPageIndex = self.currentSearchPageIndex +1;
                }
            }
            [self.nextButton setEnabled:self.currentSearchPageIndex == filterResults.count-1 ? NO : YES];
            [self.prevButton setEnabled:YES];
            [self showDocumentPage:[filterResults[self.currentSearchPageIndex] integerValue] forceToReload:NO selectionPoint:CGPointMake(-1, -1) withKeywordHighlighted:self.keyword];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
        }
        
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
}

-(IBAction)cancelClicked:(id)sender{
    @try {
        [self.searchView setHidden:YES];
        [self.searchBar resignFirstResponder];
        [self.searchBar setText:@""];
        self.keyword = nil;
        [[NSNotificationCenter defaultCenter] postNotificationName:@"KeywordChangeNotify" object:self.keyword userInfo:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"error : %@",exception.description);
    }
    
}
#pragma mark UIApplication notification methods

- (void)applicationWill:(NSNotification *)notification{
	//[_pdfPage saveReaderDocument]; // Save any ReaderDocument object changes
}
@end
