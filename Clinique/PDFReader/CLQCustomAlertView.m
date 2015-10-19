//
//  CLQCustomAlertView.m
//  Clinique
//
//  Created by BRINDHA_S on 21/07/14.
//
//

#import "CLQCustomAlertView.h"
#import "CacheManager.h"
#import "CLQCustomAlertView.h"
#import "CLQConstants.h"

#define isiPhone5  ([[UIScreen mainScreen] bounds].size.height == 568)? 140:100
@implementation CLQCustomAlertView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
    }
    return self;
}

-(void)loadStrings{
    [self.cancelButton setTitle:CLQLocalizedString(CANCEL) forState:UIControlStateNormal];
    [self.goToButton setTitle:[CLQLocalizedString(ALERT_OK)uppercaseString] forState:UIControlStateNormal];
    [self.titleLabel setText:CLQLocalizedString(GO_TO_PAGE_TITLE)];
    self.goToView.layer.cornerRadius = 5.0;
    self.goToView.layer.masksToBounds = YES;
   // self.goToView.center = [UIApplication sharedApplication].keyWindow.center;
    [self.placeHolderLabel setTextColor:[UIColor grayColor]];
    [self.placeHolderLabel setText:CLQLocalizedString(GO_TO_PAGE_PLACE_HOLDER)];
    
    [self.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.placeHolderLabel setAdjustsFontSizeToFitWidth:YES];
    [self.cancelButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    [self.goToButton.titleLabel setAdjustsFontSizeToFitWidth:YES];
    
    [self.placeHolderLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    [self.cancelButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    [self.goToButton.titleLabel setMinimumScaleFactor:MINIMUM_FONT_SZIE];
    
    [self.textField.layer setBorderColor:[UIColor colorWithRed:161/255.0 green:161/255.0 blue:161/255.0 alpha:1.0].CGColor];
    [self.textField.layer setBorderWidth:0.5];
    [self.textField becomeFirstResponder];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillShow:) name:UIKeyboardWillShowNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardWillHide:) name:UIKeyboardWillHideNotification object:nil];
    
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

-(IBAction)goToPageButtonClicked:(id)sender{
    if(![self validatePageNumber:self.textField.text] || [self.textField.text intValue] > self.pageCount || self.textField.text.length == 0 || [self.textField.text intValue] == 0){
        self.placeHolderLabel.hidden = NO;
        [self.placeHolderLabel setText:[NSString stringWithFormat:@"%@ - (1-%d)",[CLQLocalizedString(GO_TO_PAGE_TEXT) capitalizedString],self.pageCount]];

        self.textField.text = @"";
        [self.placeHolderLabel setTextColor:[UIColor redColor]];
    }
    else{
        if([self.delegate respondsToSelector:@selector(goToPage:)])
            [self.delegate goToPage:[self.textField.text intValue]];
        [self removeFromSuperview];
    }
}

-(IBAction)cancelButtonClicked:(id)sender{
    [self removeFromSuperview];
}

-(IBAction)dismissView:(id)sender{
    [self.textField resignFirstResponder];
    //[self removeFromSuperview];
    
}

-(BOOL)validatePageNumber:(NSString *)str{
    BOOL valid;
    NSCharacterSet *validCharacterSet = [NSCharacterSet characterSetWithCharactersInString:@"0123456789"];
    NSCharacterSet *inStringSet = [NSCharacterSet characterSetWithCharactersInString:str];
    valid = [validCharacterSet isSupersetOfSet:inStringSet];
    return valid;
}

-(void)textFieldDidBeginEditing:(UITextField *)textField{

   // self.placeHolderLabel.hidden  = YES;
    [self.placeHolderLabel setText:CLQLocalizedString(GO_TO_PAGE_PLACE_HOLDER)];
}
-(BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string{
 
    [self.placeHolderLabel setTextColor:[UIColor grayColor]];
    NSString *str = [textField.text stringByReplacingCharactersInRange:range withString:string];
    [self.placeHolderLabel setHidden:str.length == 0 ? NO : YES];
    [self.placeHolderLabel setText:CLQLocalizedString(GO_TO_PAGE_PLACE_HOLDER)];
    return YES;
}
-(void)textFieldDidEndEditing:(UITextField *)textField{

}

-(BOOL)textFieldShouldReturn:(UITextField *)textField{
    return YES;
}
-(void)keyboardWillHide:(NSNotification *)notification{
    [UIView animateWithDuration:0.3 animations:^{
        self.goToView.center = [self convertPoint: self.center fromView: self.superview];
    }];
}
-(void)setGoToViewFrame{
    UIInterfaceOrientation orientation = [UIApplication sharedApplication].statusBarOrientation;
    [UIView animateWithDuration:0.3 animations:^{
        if(!UIInterfaceOrientationIsLandscape(orientation)){
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone){
                CGRect rect = self.goToView.frame ;
                rect.origin.y  = isiPhone5;
                self.goToView.frame = rect;
            }
            
        }else{
            CGRect rect = self.goToView.frame ;
            if (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone)
                rect.origin.y = 0;
            else
                rect.origin.y = 200;
            self.goToView.frame = rect;
        }
    }];

}

- (void)keyboardWillShow:(NSNotification*)notification
{
    [self setGoToViewFrame];
}
@end
