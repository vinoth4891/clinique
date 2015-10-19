//
//	ThumbsMainToolbar.m
//	Reader v2.6.2
//
//	Created by Julius Oklamcak on 2011-09-01.
//	Copyright © 2011-2013 Julius Oklamcak. All rights reserved.
//
//	Permission is hereby granted, free of charge, to any person obtaining a copy
//	of this software and associated documentation files (the "Software"), to deal
//	in the Software without restriction, including without limitation the rights to
//	use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
//	of the Software, and to permit persons to whom the Software is furnished to
//	do so, subject to the following conditions:
//
//	The above copyright notice and this permission notice shall be included in all
//	copies or substantial portions of the Software.
//
//	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//	CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

#import "CLQReaderConstants.h"
#import "ThumbsMainToolbar.h"
#import "CacheManager.h"
#import "CLQConstants.h"

@implementation ThumbsMainToolbar

#pragma mark Constants

#define BUTTON_X 8.0f
#define BUTTON_Y 23.0f
#define BUTTON_SPACE 8.0f
#define BUTTON_HEIGHT 40.0f

#define DONE_BUTTON_WIDTH 56.0f
#define SHOW_CONTROL_WIDTH 78.0f

#define TITLE_HEIGHT 28.0f

#pragma mark Properties


#pragma mark ThumbsMainToolbar instance methods

- (id)initWithFrame:(CGRect)frame
{
	return [self initWithFrame:frame title:nil];
}

- (id)initWithFrame:(CGRect)frame title:(NSString *)title
{
	if ((self = [super initWithFrame:frame]))
	{

        self.backgroundColor = [UIColor colorWithPatternImage:[UIImage imageNamed:@"top_bar_with_status_bar"]];
		CGFloat viewWidth = self.bounds.size.width;

		UIImage *imageH = [UIImage imageNamed:@"done.png"];
		UIImage *imageN = [UIImage imageNamed:@"done.png"];

		UIImage *buttonH = [imageH stretchableImageWithLeftCapWidth:5 topCapHeight:0];
		UIImage *buttonN = [imageN stretchableImageWithLeftCapWidth:5 topCapHeight:0];

		CGFloat titleX = BUTTON_X; CGFloat titleWidth = (viewWidth - (titleX + titleX));

		UIButton *doneButton = [UIButton buttonWithType:UIButtonTypeCustom];

		doneButton.frame = CGRectMake(BUTTON_X, 28, DONE_BUTTON_WIDTH, 30);
		[doneButton setTitle:CLQLocalizedString(DONE) forState:UIControlStateNormal];
		[doneButton setTitleColor:[UIColor colorWithWhite:0.0f alpha:1.0f] forState:UIControlStateNormal];
		[doneButton setTitleColor:[UIColor colorWithWhite:1.0f alpha:1.0f] forState:UIControlStateHighlighted];
		[doneButton addTarget:self action:@selector(doneButtonTapped:) forControlEvents:UIControlEventTouchUpInside];
		[doneButton setBackgroundImage:buttonH forState:UIControlStateHighlighted];
		[doneButton setBackgroundImage:buttonN forState:UIControlStateNormal];
		doneButton.titleLabel.font = [UIFont systemFontOfSize:14.0f];
		doneButton.autoresizingMask = UIViewAutoresizingNone;
		doneButton.exclusiveTouch = YES;

		[self addSubview:doneButton];

		titleX += (DONE_BUTTON_WIDTH + BUTTON_SPACE); titleWidth -= (DONE_BUTTON_WIDTH + BUTTON_SPACE);

#if (READER_BOOKMARKS == TRUE) // Option

		/*CGFloat showControlX = (viewWidth - (SHOW_CONTROL_WIDTH + BUTTON_SPACE));

		UIImage *thumbsImage = [UIImage imageNamed:@"Reader-Thumbs"];
		UIImage *bookmarkImage = [UIImage imageNamed:@"list_bookmark"];
		NSArray *buttonItems = [NSArray arrayWithObjects:thumbsImage, bookmarkImage, nil];

		BOOL useTint = [self respondsToSelector:@selector(tintColor)]; // iOS 7 and up

		UISegmentedControl *showControl = [[UISegmentedControl alloc] initWithItems:buttonItems];

		showControl.frame = CGRectMake(showControlX, BUTTON_Y, SHOW_CONTROL_WIDTH, BUTTON_HEIGHT);
		showControl.tintColor = (useTint ? [UIColor blackColor] : [UIColor colorWithRed:83 green:168 blue:135 alpha:1.0]);
		showControl.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin;
		showControl.segmentedControlStyle = UISegmentedControlStyleBar;
		showControl.selectedSegmentIndex = 0; // Default segment index
		showControl.exclusiveTouch = YES;
        showControl.tintColor = [UIColor colorWithRed:83/255.0 green:168/255.0 blue:135/255.0 alpha:1.0];
        [showControl addTarget:self action:@selector(showControlTapped:) forControlEvents:UIControlEventValueChanged];
		[self addSubview:showControl]; */
        
        CGFloat showControlX = (viewWidth - (85 + BUTTON_SPACE));
        _thumbnail  = [UIButton buttonWithType:UIButtonTypeCustom];
        [_thumbnail setFrame:CGRectMake(showControlX, BUTTON_Y, 40, BUTTON_HEIGHT)];
        _thumbnail.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin;
        [_thumbnail setTag:1];
        [_thumbnail setSelected:YES];
        [_thumbnail setImage:[UIImage imageNamed:@"list"] forState:UIControlStateNormal];
        [_thumbnail setImage:[UIImage imageNamed:@"list_select"] forState:UIControlStateSelected];
        [_thumbnail addTarget:self action:@selector(showControlTapped:) forControlEvents:UIControlEventTouchUpInside];
        [self addSubview:_thumbnail];
        
        showControlX = (viewWidth - (45 + BUTTON_SPACE));

        _bookmark  = [UIButton buttonWithType:UIButtonTypeCustom];
        [_bookmark setFrame:CGRectMake(showControlX, BUTTON_Y, 50, BUTTON_HEIGHT)];
        _bookmark.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin;
        [_bookmark setImage:[UIImage imageNamed:@"bookmark"] forState:UIControlStateNormal];
        [_bookmark setImage:[UIImage imageNamed:@"bookmark_select"] forState:UIControlStateSelected];
        [_bookmark setTag:2];
        [_bookmark addTarget:self action:@selector(showControlTapped:) forControlEvents:UIControlEventTouchUpInside];
        
        [self addSubview:_bookmark];
		titleWidth -= (SHOW_CONTROL_WIDTH + BUTTON_SPACE);

#endif // end of READER_BOOKMARKS Option

		if ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad)
		{
			/*CGRect titleRect = CGRectMake(titleX, BUTTON_Y, titleWidth, TITLE_HEIGHT);

			UILabel *titleLabel = [[UILabel alloc] initWithFrame:titleRect];

			titleLabel.textAlignment = NSTextAlignmentCenter;
			titleLabel.font = [UIFont systemFontOfSize:19.0f];
			titleLabel.autoresizingMask = UIViewAutoresizingFlexibleWidth;
			titleLabel.baselineAdjustment = UIBaselineAdjustmentAlignCenters;
			titleLabel.textColor = [UIColor colorWithWhite:0.0f alpha:1.0f];
			titleLabel.shadowColor = [UIColor colorWithWhite:0.65f alpha:1.0f];
			titleLabel.backgroundColor = [UIColor clearColor];
			titleLabel.shadowOffset = CGSizeMake(0.0f, 1.0f);
			titleLabel.adjustsFontSizeToFitWidth = YES;
			titleLabel.minimumScaleFactor = 0.75f;
			titleLabel.text = title;

			[self addSubview:titleLabel]; */
		}
	}

	return self;
}

#pragma mark UISegmentedControl action methods

- (void)showControlTapped:(UIButton *)control
{
    if(control.tag== 1){
        [_thumbnail setSelected:YES];
        [_bookmark setSelected:NO];
    }
    else{
        [_thumbnail setSelected:NO];
        [_bookmark setSelected:YES];
    }
	[_delegate tappedInToolbar:self showControl:control];
}

#pragma mark UIButton action methods

- (void)doneButtonTapped:(UIButton *)button
{
	[_delegate tappedInToolbar:self doneButton:button];
}

@end
