//
//  CLQCustomAlertView.m
//  Clinique
//
//  Created by Brindha_shiva on 6/24/15.
//
//

#import "CLQDefaultAlertView.h"
#import "CLQConstants.h"
#import "CLQStrings.h"
#import "CacheManager.h"
@implementation CLQDefaultAlertView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/
- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
    }
    return self;
}

-(void)dismissWithClickedButtonIndex:(NSInteger)buttonIndex animated:(BOOL)animated {
     self.dontDisppear = NO;
    if(buttonIndex == 1){
        UITextField *textField = [self textFieldAtIndex:0];
        if([[textField.text lowercaseString] isEqualToString:[kUnlockPassCode lowercaseString]]){
            self.dontDisppear = NO;
        }
        else{
            self.dontDisppear = YES;
            textField.text =  nil;
            [textField setPlaceholder:CLQLocalizedString(kInvalidPassowrd)];
        }
    }
    
    if(self.dontDisppear)
        return;
    [super dismissWithClickedButtonIndex:buttonIndex animated:animated];
}

@end
