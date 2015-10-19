#import <Foundation/Foundation.h>
#import "StringDetector.h"
#import "FontCollection.h"
#import "RenderingState.h"
#import "Selection.h"
#import "RenderingStateStack.h"

@interface Scanner : NSObject <StringDetectorDelegate> {
	CGPDFPageRef pdfPage;
	NSMutableArray *selections;
    Selection *possibleSelection;
    Selection *completeText;
    Selection *completeWord;
	
	StringDetector *stringDetector;
	FontCollection *fontCollection;
	RenderingStateStack *renderingStateStack;
	NSMutableString *content;
    NSMutableString *asciiCharacters;
}

+ (Scanner *)scannerWithPage:(CGPDFPageRef)page;

- (NSArray *)select:(NSString *)keyword touchPoint:(CGPoint)point pageRect:(CGRect)pageRect;

@property (nonatomic, readonly) RenderingState *renderingState;

@property (nonatomic, retain) RenderingStateStack *renderingStateStack;
@property (nonatomic, retain) FontCollection *fontCollection;
@property (nonatomic, retain) StringDetector *stringDetector;
@property (nonatomic, retain) NSMutableString *content;

@property (nonatomic, strong) Selection *selectedObject;
@property (nonatomic, strong) NSString *selectedString;
@property (nonatomic, strong) Selection *wordObject;
@property (nonatomic, strong) NSString *selectedWord;
@property (nonatomic, assign) CGPoint touchPoint;
@property (nonatomic, assign) CGRect textFrame;


@property (nonatomic, retain) NSMutableArray *selections;

@property (nonatomic, retain) NSMutableArray *textList;
@property (nonatomic, retain) NSMutableArray *transformList;
@property (nonatomic, retain) NSMutableArray *statusList;

@end
