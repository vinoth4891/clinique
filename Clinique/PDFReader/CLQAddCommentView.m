//
//  CLQAddCommentView.m
//  Clinique
//
//  Created by BRINDHA_S on 23/07/14.
//
//

#import "CLQAddCommentView.h"
#import "CLQConstants.h"

#define isiPhone5  ([[UIScreen mainScreen] bounds].size.height == 568)?130:60
@implementation CLQAddCommentView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
    }
    return self;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/
-(id)initWithComment:(NSString *)comment{
    self = [[[NSBundle mainBundle]loadNibNamed:NSStringFromClass([CLQAddCommentView class]) owner:nil options:nil]lastObject];
    
    self.comment = comment;
    self.textView.text = comment;
    self.commentView.layer.masksToBounds = YES;
    self.commentView.layer.cornerRadius = 5.0;
    [self.textView becomeFirstResponder];
    self.commentView.center = [self convertPoint: self.center fromView: self.superview];
    [self.saveButton setTitle:CLQLocalizedString(SAVE) forState:UIControlStateNormal];
    [self.closeButton setTitle:CLQLocalizedString(CANCEL) forState:UIControlStateNormal];
    [self.deleteButton setTitle:CLQLocalizedString(DELETE) forState:UIControlStateNormal];
    [self.helplabel setText:[NSString stringWithFormat:@"*%@",CLQLocalizedString(HELP_TEXT)]];
    
    [self.helplabel setAdjustsFontSizeToFitWidth:YES];
    
    [self.saveButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.saveButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    
    [self.closeButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.closeButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    
    [self.deleteButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.deleteButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillShow:) name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
    return self;
}

-(void)dealloc{
    @try {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillShowNotification object:nil];
        [[NSNotificationCenter defaultCenter] removeObserver:self name:UIKeyboardWillHideNotification object:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"exception NSNotificationCenter: %@",exception.description);
    }
}

-(IBAction)saveButtonClicked:(id)sender{
    [self.textView resignFirstResponder];
    if([self.delegate respondsToSelector:@selector(didFinishComment:withComment:)])
        [self.delegate didFinishComment:CommentStateAdd withComment:self.textView.text];
}

-(IBAction)closeButtonClicked:(id)sender{
     [self.textView resignFirstResponder];
    if([self.delegate respondsToSelector:@selector(didFinishComment:withComment:)])
        [self.delegate didFinishComment:CommentStateNone withComment:@""];
}

-(IBAction)deleteClicked:(id)sender{
     [self.textView resignFirstResponder];
    if([self.delegate respondsToSelector:@selector(didFinishComment:withComment:)])
        [self.delegate didFinishComment:CommentStateDelete withComment:@""];
}

-(IBAction)dismissClicked:(id)sender{
    //[self removeFromSuperview];
    [self.textView resignFirstResponder];
}

-(void)textViewDidBeginEditing:(UITextView *)textView{

}
-(BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text{
    [textView scrollRangeToVisible:range];
    return YES;
}
-(void)textViewDidEndEditing:(UITextView *)textView{
    [UIView animateWithDuration:0.3 animations:^{
    self.commentView.center = [self convertPoint: self.center fromView: self.superview];
    }];
}
-(void)textViewDidChange:(UITextView *)textView{
    if(textView.text.length > 1){
    NSRange range = NSMakeRange(textView.text.length - 1, 1);
    [textView scrollRangeToVisible:range];
    }
}
-(void)keyboardWillHide:(NSNotification *)notification{
    [UIView animateWithDuration:0.3 animations:^{
        self.commentView.center = [self convertPoint: self.center fromView: self.superview];
    }];
}
-(void)setCommentViewFrame{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    [UIView animateWithDuration:0.3 animations:^{
        if(!UIInterfaceOrientationIsLandscape(orientation)){
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone){
                CGRect rect = self.commentView.frame ;
                rect.origin.y  = isiPhone5;
                self.commentView.frame = rect;
                
            }
        }else{
            CGRect rect = self.commentView.frame ;
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone)
                rect.origin.y = 0;
            else
                rect.origin.y = 100;
            self.commentView.frame = rect;
        }
    }];
}

- (void)keyboardWillShow:(NSNotification*)notification
{
    [self setCommentViewFrame];
   
}
@end
