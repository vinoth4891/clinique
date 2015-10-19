//
//  PDFReaderContentPage.h
//  PDFReader
//
//  Created by BRINDHA_S on 15/07/14.
//  Copyright (c) 2014 BRINDHA_S. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreGraphics/CGPDFDocument.h>
#import "CLQPdfReaderContentView.h"
#import "Scanner.h"

@class ReaderHighLight;
@protocol PDFReaderContentPageDelegate <NSObject>

-(void)didFinishPageDownload;

@end

@interface CLQPdfReaderContentPage : UIView
@property (strong, nonatomic)Scanner *scanner;
@property (unsafe_unretained, nonatomic)id<PDFReaderContentPageDelegate>delegate;

-(void)initWithURL:(NSURL *)fileURL page:(NSInteger)page password:(NSString *)phrase searchText:(NSString *)searchText selectionPoint:(CGPoint)selectionPoint withCompletion:(void(^)(id view))completion;
-(id)processSingleTap:(UITapGestureRecognizer *)recognizer;
-(void)drawHighLightWithStartPoint:(CGPoint)startPoint withEndpoint:(CGPoint)endPoint;
@end

#pragma mark -

//
//	ReaderDocumentLink class interface
//

@interface ReaderDocumentLink : NSObject <NSObject>

@property (nonatomic, assign, readonly) CGRect rect;
@property (nonatomic, assign, readonly) CGPDFDictionaryRef dictionary;


+ (id)newWithRect:(CGRect)linkRect dictionary:(CGPDFDictionaryRef)linkDictionary;
- (id)initWithRect:(CGRect)linkRect dictionary:(CGPDFDictionaryRef)linkDictionary;

@end


@interface ReaderHighLight : NSObject <NSObject>

@property (nonatomic, assign, readonly) CGRect rect;
@property (nonatomic, assign, readonly) CGPDFDictionaryRef dictionary;


+ (id)newWithRect:(CGRect)highlightRect dictionary:(CGPDFDictionaryRef)highlightDictionary;
- (id)initWithRect:(CGRect)highlightRect dictionary:(CGPDFDictionaryRef)highlightDictionary;
@end