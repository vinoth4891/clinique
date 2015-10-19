//
//  CLQCustomAlertView.h
//  Clinique
//
//  Created by BRINDHA_S on 21/07/14.
//
//

#import <UIKit/UIKit.h>

@class CLQCustomAlertView;
@protocol CLQCustomAlertViewDelegate <NSObject>

-(void)goToPage:(int)page;

@end

@interface CLQCustomAlertView : UIView<UITextFieldDelegate>

@property (strong, nonatomic)IBOutlet UIView *goToView;
@property (strong, nonatomic)IBOutlet UILabel *titleLabel;
@property (strong, nonatomic)IBOutlet UIButton *goToButton;
@property (strong, nonatomic)IBOutlet UIButton *cancelButton;
@property (strong, nonatomic)IBOutlet UITextField *textField;
@property (strong, nonatomic)IBOutlet UILabel *placeHolderLabel;
@property (unsafe_unretained, nonatomic)id<CLQCustomAlertViewDelegate>delegate;
@property (assign, nonatomic)int pageCount;

-(void)loadStrings;
@end
