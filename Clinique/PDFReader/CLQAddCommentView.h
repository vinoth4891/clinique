//
//  CLQAddCommentView.h
//  Clinique
//
//  Created by BRINDHA_S on 23/07/14.
//
//

#import <UIKit/UIKit.h>
#import "CacheManager.h"
#import "PDFReaderDocument.h"

@class CLQAddCommentView;
typedef enum {
    CommentStateAdd,
    CommentStateDelete,
    CommentStateNone,
}CommentSate;

@protocol CLQAddcommentsViewDelegate  <NSObject>
-(void)didFinishComment:(CommentSate)state withComment:(NSString *)comment;
@end

@interface CLQAddCommentView : UIView<UITextViewDelegate>

@property (strong, nonatomic)PDFReaderDocument *pdfPage;
@property (strong, nonatomic) NSString *comment;
@property (strong, nonatomic)IBOutlet UIView *commentView;
@property (strong, nonatomic)IBOutlet UITextView *textView;
@property (strong, nonatomic)IBOutlet UIButton *closeButton;
@property (strong, nonatomic)IBOutlet UIButton *saveButton;
@property (strong, nonatomic) IBOutlet UIButton *deleteButton;
@property (strong, nonatomic) IBOutlet UILabel *verticalLine1;
@property (strong, nonatomic)IBOutlet UILabel *verticalLine2;
@property (strong, nonatomic)IBOutlet UILabel *helplabel;

@property (unsafe_unretained, nonatomic)id<CLQAddcommentsViewDelegate> delegate;

-(id)initWithComment:(NSString *)comment;

@end
