//
//  PDFRequestManager.h
//  Clinique
//
//  Created by BRINDHA_S on 16/07/14.
//
//

#import <Foundation/Foundation.h>
#import "PDFResponse.h"

typedef enum {
    InsertComment,
    DeleteComment,
}CommentServiceType;

typedef enum{
    InsertBookMark,
    DeleteBookMark
    
}BookMarkServiceType;

@interface PDFRequestManager : NSObject

+(PDFRequestManager *)defaultManager;

-(void)getBookMarks:(NSString *)pdfId  withCompletion:(void (^)(id , NSError *))completion;

-(void)getComments:(NSString *)pdfId withCompletion:(void (^)(NSString *, NSError *))completion;

-(void)updateComment:(NSString *)pdfId  forService:(CommentServiceType )serviceTye withComment : (NSString *)comment withCompletion:(void (^)(PDFResponse *response,NSError *))completion;

-(void)updateBookMark:(NSString *)pdfId forPage:(int)page forServiceType:(BookMarkServiceType)type withCompletion:(void (^)(PDFResponse*, NSError *))completion;
@end
