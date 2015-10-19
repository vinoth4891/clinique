//
//  PDFRequestManager.m
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//
#import "PDFRequestManager.h"
#import "PDFServiceHandler.h"
#import "PDFService.h"
#import "CLQHelper.h"
#import "CacheManager.h"
#import "CLQDataBaseManager.h"
#import "Bookmarks.h"
#import "Notes.h"

static PDFRequestManager *defaultManager = nil;
@implementation PDFRequestManager

+(PDFRequestManager *)defaultManager{
    if(defaultManager == nil)
        defaultManager = [[PDFRequestManager alloc]init];
    return defaultManager;
}


-(void)getBookMarks:(NSString *)pdfId  withCompletion:(void (^)(id , NSError *))completion{
    //cid=newuser11&coursemoduleid=Photon%40123&pdfid=moodle_mobile_app&action=get_course_pdf_bookmarks&uid=3
   /* NSDictionary *query = @{KEY_COURSE_MODULE_ID :[CacheManager defaultManager].currentCache.courseModuleId,
                            KEY_PDF_ID : [CacheManager defaultManager].currentCache.pdfId,
                            KEY_ACTION : ServiceGetBookMark,
                            KEY_TOKEN : [CacheManager defaultManager].currentCache.token };
    
    [PDFServiceHandler sendRequestToService:[CacheManager defaultManager].currentCache.serviceUrl withQuery:query withMethod:HttpMethodGET withBody:nil completion:^(PDFResponse *response,NSError *error){
        [CacheManager defaultManager].currentCache.bookMarks = [NSMutableArray array];
        NSMutableArray *array = [NSMutableArray array];
        NSDictionary *dict = response.data.result;
        NSArray *bookMarks = dict[KEY_BOOKMARK_DETAIL];
        for (NSDictionary *dict in bookMarks) {
            
            [array addObject:[NSNumber numberWithInt:[dict[KEY_BOOK_MARK_PAGE_NO] intValue]]];
        }
        NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:@"self" ascending:YES];
        [array sortUsingDescriptors:@[sortDescriptor]];
        [CacheManager defaultManager].currentCache.bookMarks = array;
        [[CacheManager defaultManager]saveCache];
        completion(response, nil);
    }];*/
    @try {
        NSArray *bookMarks  = [Bookmarks getBookMarksForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        NSMutableArray *array = [NSMutableArray array];
        for (Bookmarks *bookmark in bookMarks) {
            
            NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:bookmark.json options:kNilOptions error:nil];
            
            for (NSString *pageNumber in jsonDict[key_Pages]) {
                     [array addObject:pageNumber];
            }
        }
        NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:@"self" ascending:YES];
        [array sortUsingDescriptors:@[sortDescriptor]];
        [CacheManager defaultManager].currentCache.bookMarks = array;
        [[CacheManager defaultManager]saveCache];
        completion(nil, nil);
    }
    @catch (NSException *exception) {
         NSLog(@"Exception : Get book marks :%@",exception.description);
          completion(exception.description,nil);
    }
}


-(void)updateBookMark:(NSString *)pdfId  forPage:(int)page forServiceType:(BookMarkServiceType)type withCompletion:(void (^)(PDFResponse *response,NSError *))completion{
    NSDictionary *query = nil;
    if(type == InsertBookMark){
        query = @{KEY_COURSE_MODULE_ID :[CacheManager defaultManager].currentCache.courseModuleId,
                  KEY_PDF_ID : [CacheManager defaultManager].currentCache.pdfId,
                  KEY_ACTION : SerViceInsertBookMark,
                  KEY_PAGE_ID : @(page),
                  KEY_TOKEN : [CacheManager defaultManager].currentCache.token};
    }
    else {
        query = @{
                  KEY_COURSE_MODULE_ID :[CacheManager defaultManager].currentCache.courseModuleId,
                  KEY_PDF_ID : [CacheManager defaultManager].currentCache.pdfId,
                  KEY_ACTION : ServiceDeleteBookMark,
                  KEY_PAGE_ID : @(page),
                  KEY_TOKEN : [CacheManager defaultManager].currentCache.token};

    }
    [PDFServiceHandler sendRequestToService:[CacheManager defaultManager].currentCache.serviceUrl withQuery:query withMethod:HttpMethodGET withBody:nil completion:^(PDFResponse *response,NSError *error){
        NSLog(@"Bookmarks response : %@",response.data.result);
        completion(response,nil);
    }];
}

-(void)getComments:(NSString *)pdfId  withCompletion:(void (^)(NSString *, NSError *))completion{
    
    @try {
        NSArray *notes  = [Notes getNotesForModuleId:@([[CacheManager defaultManager].currentCache.courseModuleId intValue]) andUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        NSMutableArray *array = [NSMutableArray array];
         NSString *comment = @"";
        for (Notes *note in notes) {
            NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:note.json options:kNilOptions error:nil];
              comment =[comment stringByAppendingString:jsonDict[KEY_COMMENT]];
        }
        NSSortDescriptor *sortDescriptor = [NSSortDescriptor sortDescriptorWithKey:@"self" ascending:YES];
        [array sortUsingDescriptors:@[sortDescriptor]];
        [CacheManager defaultManager].currentCache.comments = comment;
        [[CacheManager defaultManager] saveCache];
        completion(comment,nil);
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : Get book marks :%@",exception.description);
          completion(exception.description,nil);
    }

//cid=1&coursemoduleid=1&action=get_course_resource_comments&uid=2&type=pdf
   /* NSDictionary *query = @{
                            KEY_COURSE_MODULE_ID :[CacheManager defaultManager].currentCache.courseModuleId,
                            KEY_TYPE : KEY_PDF,
                            KEY_ACTION : ServiceGetComment,
                            KEY_TOKEN : [CacheManager defaultManager].currentCache.token};
    
    [PDFServiceHandler sendRequestToService:[CacheManager defaultManager].currentCache.serviceUrl withQuery:query withMethod:HttpMethodGET withBody:nil completion:^(PDFResponse *response,NSError *error){
        NSArray *comments =  response.data.result;
         NSString *comment = @"";
        for (NSDictionary *commentDict in comments) {
              comment =[comment stringByAppendingString:commentDict[KEY_COMMENT]];
        }
      
        [CacheManager defaultManager].currentCache.comments = comment;
        [[CacheManager defaultManager] saveCache];
        completion(comment,nil);
    }];*/
}

-(void)updateComment:(NSString *)pdfId  forService:(CommentServiceType )serviceTye withComment : (NSString *)comment withCompletion:(void (^)(PDFResponse *response, NSError *))completion{
    NSDictionary *query  = @{
                             KEY_COURSE_MODULE_ID : [CacheManager defaultManager].currentCache.courseModuleId,
                             KEY_TYPE: KEY_PDF,
                             KEY_ACTION : ServiceInsertComment ,
                             KEY_COMMENT :comment,
                             KEY_TOKEN : [CacheManager defaultManager].currentCache.token};
    [PDFServiceHandler sendRequestToService:[CacheManager defaultManager].currentCache.serviceUrl withQuery:query withMethod:HttpMethodGET withBody:nil completion:^(PDFResponse *response,NSError *error){
        [CacheManager defaultManager].currentCache.comments = comment;
        [[CacheManager defaultManager] saveCache];
        completion(response,nil);
    }];
}

@end
