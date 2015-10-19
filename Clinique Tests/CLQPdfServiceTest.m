//
//  CLQPdfServiceTest.m
//  Clinique
//
//  Created by BRINDHA_S on 12/08/14.
//
//

#import <XCTest/XCTest.h>
#import "CLQPdfReaderViewController.h"
#import "XCTest+Async.h"
#import "PDFRequestManager.h"
#import "CacheManager.h"

@interface CLQPdfServiceTest : XCTestCase
@property (nonatomic, strong)   CLQPdfReaderViewController *viewController;
@end

@implementation CLQPdfServiceTest

- (void)setUp
{
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
    
    //
   // self.viewController = [[CLQPdfReaderViewController alloc]initWithNibName:@"CLQPdfReaderViewController" bundle:nil];
    [CacheManager defaultManager].currentCache.pdfId = @"458";
    [CacheManager defaultManager].currentCache.courseId  = @(421);
    [CacheManager defaultManager].currentCache.courseModuleId  =@"458";
    [CacheManager defaultManager].currentCache.serviceUrl  =@"http://172.16.17.42/cliniquedev/admin/clinique_webservice/services.php";
    [CacheManager defaultManager].currentCache.token  =@"1fcb473f3d26e89639c7f25f46026eb2";
    [CacheManager defaultManager].currentCache.userId  =@"2";
   // [CacheManager defaultManager].currentCache.pdfFilePath = [NSURL URLWithString:[@"http://172.16.17.42/cliniquedev/admin/webservice/pluginfile.php/16754/mod_resource/content/1/Confident%20Colour.pdf?forcedownload=1&token=1fcb473f3d26e89639c7f25f46026eb2" stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    [CacheManager defaultManager].currentCache.lastModifiedDate = @"01-Aug-2014";
    //[self.viewController view];
}

- (void)tearDown
{
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

-(void)testGetBookmarkService{
    ASYNC_TEST_START;
    
    [[PDFRequestManager defaultManager] getBookMarks:@"458" withCompletion:^(PDFResponse *response, NSError *error){
        if(response){
            if(error)
                XCTFail(@"The data was not a dictionary");
            else{
                XCTAssertNotNil(response.data.result, @"XCTest-Async repo:");
                NSArray *array = response.data.result[@"bookmarks"];
                XCTAssertTrue([array isKindOfClass:[NSArray class]],@"Result should be in array format");
                
                NSLog(@"Repos %@", response.data.result);

                for (NSDictionary *dict in array) {
                     XCTAssertTrue([dict.allKeys containsObject:@"pageno"],@"Result should be in array format");
                    int pageNumber = [dict[@"pageno"] intValue];
                    XCTAssertNotNil(@(pageNumber), @"Page number should not be nil");
                    
                }
            }
        }
        else{
            XCTFail(@"The operation couldn't be completed");
        }
        ASYNC_TEST_DONE;
        
    }];
    ASYNC_TEST_END;
}

-(void)testGetCommentService{
    ASYNC_TEST_START;
    
    [[PDFRequestManager defaultManager] getComments:@"418" withCompletion:^(NSString *comments,NSError *error){
        if(comments){
            if(error)
                XCTFail(@"The data was not a dictionary");
            else{
                XCTAssertNotNil(comments, @"XCTest-Async repo:");

                NSLog(@"Repos %@", comments);

            }
        }
        else{
            XCTFail(@"The operation couldn't be completed");
        }
        ASYNC_TEST_DONE;
        
    }];
    ASYNC_TEST_END;
}

-(void)testAddBookMarkService
{
    ASYNC_TEST_START;
    [[PDFRequestManager defaultManager] updateBookMark:@"418" forPage:1 forServiceType:InsertBookMark withCompletion:^(PDFResponse *response, NSError *error){
        if(response.data.result){
            if(error)
                XCTFail(@"The data was not a dictionary");
            else{
                XCTAssertNotNil(response.data.result, @"XCTest-Async repo:");

                NSLog(@"Repos %@", response.data.result);
                XCTAssertTrue([response.data.result isKindOfClass:[NSDictionary class]], @"Response should be in dictionary format");
            }
        }
        else{
            XCTAssertNil(response.data.result,@"Already bookmarked or operation couldn't be completed");
        }
        ASYNC_TEST_DONE;
    }];
    ASYNC_TEST_END;
}

-(void)testDeleteBookmarkService{
    ASYNC_TEST_START;
    
   [[PDFRequestManager defaultManager] updateBookMark:@"418" forPage:1 forServiceType:DeleteBookMark withCompletion:^(PDFResponse *response, NSError *error){
       if(response){
           if(error)
               XCTFail(@"The data was not a dictionary");
           else{
               XCTAssertNotNil(response.data.result, @"XCTest-Async repo:");
               
               NSLog(@"Repos %@", response.data.result);
               XCTAssertTrue([response.data.result isKindOfClass:[NSDictionary class]], @"Response should be in dictionary format");
           }
       }
       else{
           XCTFail(@"The operation couldn't be completed");
       }

        ASYNC_TEST_DONE;
    }];
    ASYNC_TEST_END;
}

-(void)testAddCommentService{
    ASYNC_TEST_START;
    [[PDFRequestManager defaultManager] updateComment:@"418" forService:InsertComment withComment:@"Test sample" withCompletion:^(PDFResponse *response, NSError *error){
        if(response){
            if(error)
                XCTFail(@"The data was not a dictionary");
            else{
                XCTAssertNotNil(response.data.result, @"XCTest-Async repo:");
                XCTAssertTrue([response.data.result isKindOfClass:[NSDictionary class]],@"Result should be in dictionary format");
                NSLog(@"Repos %@", response.data.result);
            }
        }
        else{
            XCTFail(@"The operation couldn't be completed");
        }
        ASYNC_TEST_DONE;
        
    }];
    ASYNC_TEST_END;
}


@end
