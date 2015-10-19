//
//  Clinique_Tests.m
//  Clinique Tests
//
//  Created by BRINDHA_S on 05/08/14.
//
//

#import <XCTest/XCTest.h>
#import "CLQPdfReaderViewController.h"
#import "CacheManager.h"
#import "CLQAddCommentView.h"
#import "PDFRequestManager.h"
#import "XCTest+Async.h"
#import "PDFReaderDocument.h"
#import "CLQHelper.h"

@interface CLQPdfReaderTest : XCTestCase
{
    CLQAddCommentView *commentView;
    PDFReaderDocument *document;
}
 @property (nonatomic, strong)   CLQPdfReaderViewController *viewController;
@end

@implementation CLQPdfReaderTest

- (void)setUp
{
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
   // self.viewController = [[CLQPdfReaderViewController alloc]init];
    // http://172.16.17.42/cliniquedev/admin/clinique_webservice/services.php?coursemoduleid=458&type=pdf&action=get_course_resource_comment&uid=2&token=1fcb473f3d26e89639c7f25f46026eb2&cid=421
    self.viewController = [[CLQPdfReaderViewController alloc]init];
    [self.viewController view];
    
    [CacheManager defaultManager].currentCache.pdfId = @"458";
    [CacheManager defaultManager].currentCache.courseId  =@(421);
    [CacheManager defaultManager].currentCache.courseModuleId  =@"458";
    [CacheManager defaultManager].currentCache.serviceUrl  =@"http://172.16.17.42/cliniquedev/admin/clinique_webservice/services.php";
    [CacheManager defaultManager].currentCache.token  =@"1fcb473f3d26e89639c7f25f46026eb2";
    [CacheManager defaultManager].currentCache.userId  =@"2";
    //[CacheManager defaultManager].currentCache.pdfUrl = [NSURL URLWithString:[@"http://172.16.17.42/cliniquedev/admin/webservice/pluginfile.php/16754/mod_resource/content/1/Confident%20Colour.pdf?forcedownload=1&token=1fcb473f3d26e89639c7f25f46026eb2" stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    [CacheManager defaultManager].currentCache.lastModifiedDate = @"01-Aug-2014";
}

- (void)tearDown
{
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}
-(void )getPdfDocument{
    NSString *path;
    if(![CLQHelper fileExixtsAtPath:[CacheManager defaultManager].currentCache.pdfId]){
        path = [CLQHelper getPdfPath:[CacheManager defaultManager].currentCache.pdfId forPageNumber:0];
        
       // NSData *data = [[NSData alloc]initWithContentsOfURL:[CacheManager defaultManager].currentCache.pdfUrl];
        NSData *data =[NSData dataWithContentsOfFile:[CacheManager defaultManager].currentCache.pdfFilePath];
        [data writeToFile:path atomically:YES];
    }
    else{
        path =[CLQHelper getPdfPath:[CacheManager defaultManager].currentCache.pdfId forPageNumber:0];
    }
    self.viewController.document  =[[PDFReaderDocument alloc]initWithFilePath:path password:@""];
}

#pragma mark - Test View loadings
-(void)testPdfViewControllerViewExists {
    XCTAssertNotNil([self.viewController view], @"ViewController should contain a view");
}

-(void)testPdfDocumentExists{
    [self getPdfDocument];
    XCTAssertNotNil(self.viewController.document, @"Pdf document should not be nil");
}

-(void)testBookMarkButtonConnection{
     XCTAssertNotNil([self.viewController bookMarkbutton], @"Bookmark button should be connected");
}

-(void)testCommentButtonConnection{
     XCTAssertNotNil([self.viewController commentButton], @"Comment button should be connected");
}

-(void)testThumbnailButtonConnection{
     XCTAssertNotNil([self.viewController thumbnailButton], @"Thumbnail button should be connected");
}

-(void)testSearchButtonConnection{
     XCTAssertNotNil([self.viewController searchButton], @"Search button should be connected");
}

#pragma mark - Test Button IBActions
-(void)testBookmarkButtonIBAction{
    
    NSArray *actions = [self.viewController.bookMarkbutton actionsForTarget:self.viewController
                                                  forControlEvent:UIControlEventTouchUpInside];
    XCTAssertTrue([actions containsObject:@"bookMarkClicked:"], @"");
}

-(void)testCommentButtonIBAction{
    NSArray *actions = [self.viewController.commentButton actionsForTarget:self.viewController
                                                       forControlEvent:UIControlEventTouchUpInside];
    XCTAssertTrue([actions containsObject:@"commentsButtonClicked:"], @"");
}

-(void)testThumbnailButtonIBAction{
    NSArray *actions = [self.viewController.thumbnailButton actionsForTarget:self.viewController
                                                       forControlEvent:UIControlEventTouchUpInside];
    XCTAssertTrue([actions containsObject:@"thumnailButtonClicked:"], @"");
}

-(void)testSearchButtonIBAction{
    NSArray *actions = [self.viewController.searchButton actionsForTarget:self.viewController
                                                       forControlEvent:UIControlEventTouchUpInside];
    XCTAssertTrue([actions containsObject:@"searchButtonClicked:"], @"");
}

#pragma mark- Test Bookmarks
-(void)testAddBookmarks{
    [self getPdfDocument];
    NSArray *array =@[@(1),@(2)];
    [CacheManager defaultManager].currentCache.bookMarks = [NSMutableArray arrayWithArray:@[@(1)]];
    self.viewController.document.pageNumber = @(2);
   [self.viewController.bookMarkbutton sendActionsForControlEvents: UIControlEventTouchUpInside];
    XCTAssertEqualObjects([CacheManager defaultManager].currentCache.bookMarks,array , @"Should be equal");

}

-(void)testDeleteBookmarks{
    [self getPdfDocument];
    NSArray *array =@[@(1)];
    [CacheManager defaultManager].currentCache.bookMarks = [NSMutableArray arrayWithArray:@[@(1),@(2)]];
    self.viewController.document.pageNumber = @(2);
    [self.viewController.bookMarkbutton sendActionsForControlEvents: UIControlEventTouchUpInside];
    XCTAssertEqualObjects([CacheManager defaultManager].currentCache.bookMarks,array , @"Should be equal");;
}


#pragma mark- Test comments
-(void)testGetComments{
    commentView  = [[CLQAddCommentView alloc]initWithComment:@"test"];
    commentView.delegate = (id)self.viewController;
    XCTAssertEqualObjects(commentView.textView.text, @"test", @"Text should  be equal");
}

-(void)testAddComment{
    commentView  = [[CLQAddCommentView alloc]initWithComment:@"test"];
    commentView.delegate = (id)self.viewController;
    commentView.textView.text = @"sample";
    [commentView.saveButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    XCTAssertEqualObjects([CacheManager defaultManager].currentCache.comments, @"sample", @"Text should be equal");
    
}

#pragma mark - Test Thumbnail view
-(void)testShowThumbnailViewExists{
    [self getPdfDocument];
    [self.viewController.thumbnailButton sendActionsForControlEvents: UIControlEventTouchUpInside];
    XCTAssertNotNil(self.viewController.thumbsViewController, @"Thumbnailview should not be nil");
}

#pragma mark -  Test search
-(void)testSearchKeyFound{
    [self getPdfDocument];
    self.viewController.searchBar.text = @"Cli";
    [self.viewController.searchBar.delegate searchBarSearchButtonClicked:self.viewController.searchBar];
    XCTAssertTrue(filterResults.count >= 0, @"Filter result should not be zero");
}

-(void)testSearchKeyNotFound{
    [self getPdfDocument];
    self.viewController.searchBar.text = @"ssssss";
    [self.viewController.searchBar.delegate searchBarSearchButtonClicked:self.viewController.searchBar];
    XCTAssertTrue(filterResults.count == 0, @"Filter result should be zero");
}


#pragma mark - Test Go to page
-(void)testGotoPageViewExixts{
   [self.viewController.goToPageButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    XCTAssertNotNil(self.viewController.goToPageView, @"Go to page view should not be nil");
}

-(void)testGoTopage{
    [self.viewController.goToPageButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    self.viewController.goToPageView.textField.text = @"10";
    self.viewController.goToPageView.pageCount = 19;
    
    [self.viewController.goToPageView.goToButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    XCTAssertTrue(![self.viewController.view.subviews containsObject:self.viewController.goToPageView], @"Go to page view should not be nil");
}

-(void)testGotoPageNotFound{
   
    [self.viewController.goToPageButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    self.viewController.goToPageView.textField.text = @"ddd";
    self.viewController.goToPageView.pageCount = 19;
    
    [self.viewController.goToPageView.goToButton sendActionsForControlEvents:UIControlEventTouchUpInside];
    XCTAssertTrue([self.viewController.view.subviews containsObject:self.viewController.goToPageView], @"Go to page view should not be nil");
    XCTAssertTrue([self.viewController.goToPageView.textField.text isEqualToString:@""], @"Filter result should be zero");
    XCTAssertTrue(![self.viewController.goToPageView.placeHolderLabel isHidden], @"Place holder should not be hidden");
    XCTAssertNotNil(self.viewController.goToPageView, @"Go to page view should not be nil");
}

@end
