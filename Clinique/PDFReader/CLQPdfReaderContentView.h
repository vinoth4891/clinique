//
//  PDFReaderContentView.h
//  PDFReader
//
//  Created by BRINDHA_S on 15/07/14.
//  Copyright (c) 2014 BRINDHA_S. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PDFRequestManager.h"
#import "PDFResponse.h"
#import "CLQPdfReaderContentPage.h"

@class CLQPdfReaderContentPage;
@class CLQPdfReaderContentView;

@protocol PDFReaderContentViewDelegate <NSObject>

@required // Delegate protocols

- (void)contentView:(CLQPdfReaderContentView *)contentView touchesBegan:(NSSet *)touches;

@end
@interface CLQPdfReaderContentView : UIScrollView

@property (strong, nonatomic)CLQPdfReaderContentPage *contentPage;
@property (unsafe_unretained, nonatomic) id <PDFReaderContentViewDelegate> contentDelegate;

- (id)initWithFrame:(CGRect)frame fileURL:(NSURL *)fileURL page:(NSUInteger)page password:(NSString *)phrase selectionPoint:(CGPoint)point searchWord:(NSString *)word;

- (void)showPageThumb:(NSURL *)fileURL page:(NSInteger)page password:(NSString *)phrase guid:(NSString *)guid;

- (id)processSingleTap:(UITapGestureRecognizer *)recognizer;

- (void)zoomIncrement;
- (void)zoomDecrement;
- (void)zoomReset;

@end
