//
//  PDFReaderContentView.m
//  PDFReader
//
//  Created by BRINDHA_S on 15/07/14.
//  Copyright (c) 2014 BRINDHA_S. All rights reserved.
//

#import "CLQPdfReaderContentView.h"
#import "CLQPdfReaderContentPage.h"
#import "CGPDFDocument.h"

#pragma mark Constants

#define ZOOM_FACTOR 2.0f
#define ZOOM_MAXIMUM 16.0f

#if (READER_SHOW_SHADOWS == TRUE) // Option
#define CONTENT_INSET 4.0f
#else
#define CONTENT_INSET 2.0f
#endif // end of READER_SHOW_SHADOWS Option

#define PAGE_THUMB_LARGE 240
#define PAGE_THUMB_SMALL 144

#define TOOL_BAR_HEIGHT 44.0f
#define PAGE_BAR_HEIGHT 44.0f


static void *ReaderContentViewContext = &ReaderContentViewContext;

@interface CLQPdfReaderContentView()<UIScrollViewDelegate,PDFReaderContentPageDelegate>


@property (strong, nonatomic) UIView *containerView;
@property (assign, nonatomic)CGFloat lastScale;
@property (assign, nonatomic)CGPoint prevPoint;
@property (assign, nonatomic)CGPoint curPoint;
@property (strong, nonatomic)UIActivityIndicatorView *indicator;
@end

@implementation CLQPdfReaderContentView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        
    }
    return self;
}

#pragma mark ReaderContentView functions

static inline CGFloat ZoomScaleThatFits(CGSize target, CGSize source)
{
	CGFloat w_scale = (target.width / source.width);
    
	CGFloat h_scale = (target.height / source.height);
    
	return ((w_scale < h_scale) ? w_scale : h_scale);
}

#pragma mark ReaderContentView instance methods

- (void)updateMinimumMaximumZoom
{
	CGRect targetRect = CGRectInset(self.bounds, CONTENT_INSET, CONTENT_INSET);
    
	CGFloat zoomScale = ZoomScaleThatFits(targetRect.size, self.contentPage.bounds.size);
    
	self.minimumZoomScale = zoomScale; // Set the minimum and maximum zoom scales
    
	self.maximumZoomScale = (zoomScale * ZOOM_MAXIMUM); // Max number of zoom levels
}

- (id)initWithFrame:(CGRect)frame fileURL:(NSURL *)fileURL page:(NSUInteger)page password:(NSString *)phrase selectionPoint:(CGPoint)point searchWord:(NSString *)word
{
	if ((self = [super initWithFrame:frame]))
	{
		self.scrollsToTop = NO;
		self.delaysContentTouches = NO;
		self.showsVerticalScrollIndicator = NO;
		self.showsHorizontalScrollIndicator = NO;
		self.contentMode = UIViewContentModeRedraw;
		self.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
		self.backgroundColor = [UIColor whiteColor];
		self.userInteractionEnabled = YES;
		self.autoresizesSubviews = NO;
		self.bouncesZoom = YES;
		self.delegate = self;
        
        self.containerView = [[UIView alloc] initWithFrame:frame];
        
        self.containerView.autoresizesSubviews = NO;
        self.containerView.userInteractionEnabled = NO;
        self.containerView.contentMode = UIViewContentModeRedraw;
        self.containerView.autoresizingMask = UIViewAutoresizingNone;
        self.containerView.backgroundColor = [UIColor whiteColor];
        [self addSubview:self.containerView];
       
        self.indicator = [[UIActivityIndicatorView alloc]initWithFrame:CGRectMake(0, 0, 25, 25)];
       
        self.indicator.activityIndicatorViewStyle = UIActivityIndicatorViewStyleGray;
        self.indicator.backgroundColor = [UIColor clearColor];
        [self.indicator startAnimating];
      
        [self.containerView addSubview:self.indicator];
        [self setOrientationForIndicator];
        
        [[CLQPdfReaderContentPage alloc] initWithURL:fileURL page:page password:phrase searchText:word selectionPoint:point withCompletion:^(id view){
            self.contentPage = (CLQPdfReaderContentPage *)view;
            self.contentPage.backgroundColor = [UIColor whiteColor];
            self.contentPage.delegate = self;
            
            if (self.contentPage != nil) // Must have a valid and initialized content view
            {
                self.containerView.frame = self.contentPage.bounds;
                 [self setOrientationForIndicator];
                
#if (READER_SHOW_SHADOWS == TRUE) // Option
                
                theContainerView.layer.shadowOffset = CGSizeMake(0.0f, 0.0f);
                theContainerView.layer.shadowRadius = 4.0f; theContainerView.layer.shadowOpacity = 1.0f;
                theContainerView.layer.shadowPath = [UIBezierPath bezierPathWithRect:theContainerView.bounds].CGPath;
                
#endif // end of READER_SHOW_SHADOWS Option
                
                self.contentSize = self.contentPage.bounds.size; // Content size same as view size
                self.contentOffset = CGPointMake((0.0f - CONTENT_INSET), (0.0f - CONTENT_INSET)); // Offset
                self.contentInset = UIEdgeInsetsMake(CONTENT_INSET, CONTENT_INSET, CONTENT_INSET, CONTENT_INSET);
                
#if (READER_ENABLE_PREVIEW == TRUE) // Option
                
                theThumbView = [[ReaderContentThumb alloc] initWithFrame:theContentView.bounds]; // Page thumb view
                
                [theContainerView addSubview:theThumbView]; // Add the thumb view to the container view
                
#endif // end of READER_ENABLE_PREVIEW Option
                
                [self.containerView addSubview:self.contentPage]; // Add the content view to the container view
               // [self addSubview:self.containerView]; // Add the container view to the scroll view
                [self updateMinimumMaximumZoom]; // Update the minimum and maximum zoom scales
                self.backgroundColor = [UIColor clearColor];
                self.zoomScale = self.minimumZoomScale; // Set zoom to fit page content
            }
            [self addObserver:self forKeyPath:@"frame" options:0 context:ReaderContentViewContext];
            
            self.tag = page;
        
        }];
        // Tag the view with the page number
	}
    
	return self;
}

- (void)dealloc
{
	[self removeObserver:self forKeyPath:@"frame" context:ReaderContentViewContext];
   
}

- (void)showPageThumb:(NSString *)fileURL page:(NSInteger)page password:(NSString *)phrase guid:(NSString *)guid
{
#if (READER_ENABLE_PREVIEW == TRUE) // Option
    
	BOOL large = ([UIDevice currentDevice].userInterfaceIdiom == UIUserInterfaceIdiomPad); // Page thumb size
    
	CGSize size = (large ? CGSizeMake(PAGE_THUMB_LARGE, PAGE_THUMB_LARGE) : CGSizeMake(PAGE_THUMB_SMALL, PAGE_THUMB_SMALL));
    
	ReaderThumbRequest *request = [ReaderThumbRequest newForView:theThumbView fileURL:fileURL password:phrase guid:guid page:page size:size];
	UIImage *image = [[ReaderThumbCache sharedInstance] thumbRequest:request priority:YES]; // Request the page thumb
	if ([image isKindOfClass:[UIImage class]]) [theThumbView showImage:image]; // Show image from cache
    
#endif // end of READER_ENABLE_PREVIEW Option
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
	if (context == ReaderContentViewContext) // Our context
	{
		if ((object == self) && [keyPath isEqualToString:@"frame"])
		{
			CGFloat oldMinimumZoomScale = self.minimumZoomScale;
            
			[self updateMinimumMaximumZoom]; // Update zoom scale limits
            
			if (self.zoomScale == oldMinimumZoomScale) // Old minimum
			{
				self.zoomScale = self.minimumZoomScale;
			}
			else // Check against minimum zoom scale
			{
				if (self.zoomScale < self.minimumZoomScale)
				{
					self.zoomScale = self.minimumZoomScale;
				}
				else // Check against maximum zoom scale
				{
					if (self.zoomScale > self.maximumZoomScale)
					{
						self.zoomScale = self.maximumZoomScale;
					}
				}
			}
		}
	}
}

- (void)layoutSubviews
{
	[super layoutSubviews];
    
	CGSize boundsSize = self.bounds.size;
	CGRect viewFrame = self.containerView.frame;
    
	if (viewFrame.size.width < boundsSize.width)
		viewFrame.origin.x = (((boundsSize.width - viewFrame.size.width) / 2.0f) + self.contentOffset.x);
	else
		viewFrame.origin.x = 0.0f;
    
	if (viewFrame.size.height < boundsSize.height)
		viewFrame.origin.y = (((boundsSize.height - viewFrame.size.height) / 2.0f) + self.contentOffset.y);
	else
		viewFrame.origin.y = 0.0f;
    
	self.containerView.frame = viewFrame;
}

- (id)processSingleTap:(UITapGestureRecognizer *)recognizer
{
	return [self.contentPage processSingleTap:recognizer];
}

- (void)zoomIncrement
{
	CGFloat zoomScale = self.zoomScale;
	if (zoomScale < self.maximumZoomScale)
	{
		zoomScale *= ZOOM_FACTOR; // Zoom in
		if (zoomScale > self.maximumZoomScale)
		{
			zoomScale = self.maximumZoomScale;
		}
        
		[self setZoomScale:zoomScale animated:YES];
	}
}

- (void)zoomDecrement
{
	CGFloat zoomScale = self.zoomScale;
    
	if (zoomScale > self.minimumZoomScale)
	{
		zoomScale /= ZOOM_FACTOR; // Zoom out
		if (zoomScale < self.minimumZoomScale)
		{
			zoomScale = self.minimumZoomScale;
		}
		[self setZoomScale:zoomScale animated:YES];
	}
}

- (void)zoomReset
{
	if (self.zoomScale > self.minimumZoomScale)
	{
		self.zoomScale = self.minimumZoomScale;
	}
}
#pragma mark PDFReaderContentViewDelegate

-(void)didFinishPageDownload{
    //[self.indicator stopAnimating];
  
}
-(void)setOrientationForIndicator{
        self.indicator.center = [self.containerView convertPoint: self.containerView.center fromView: self.containerView.superview];
}

#pragma mark UIScrollViewDelegate methods

- (UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView
{
	return self.containerView;
}

#pragma mark UIResponder instance methods

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
	[super touchesBegan:touches withEvent:event]; // Message superclass
    
    UITouch *touch = [[touches allObjects] objectAtIndex:0];
    self.prevPoint= [touch locationInView:self];
    [self endEditing:YES];
	//[self.contentDelegate contentView:self touchesBegan:touches]; // Message delegate
}

- (void)touchesCancelled:(NSSet *)touches withEvent:(UIEvent *)event
{
	[super touchesCancelled:touches withEvent:event]; // Message superclass
}

- (void)touchesEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
    UITouch *touch = [[touches allObjects] objectAtIndex:0];
    self.self.curPoint= [touch locationInView:self];

	[super touchesEnded:touches withEvent:event]; // Message superclass
    [self.contentPage drawHighLightWithStartPoint:self.prevPoint withEndpoint:self.curPoint];
}

- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
	[super touchesMoved:touches withEvent:event]; // Message superclass
}

- (void)handlePinchGesture:(UIPinchGestureRecognizer *)gestureRecognizer {
    
    if([gestureRecognizer state] == UIGestureRecognizerStateBegan) {
        // Reset the last scale, necessary if there are multiple objects with different scales
        _lastScale = [gestureRecognizer scale];
    }
    
    if ([gestureRecognizer state] == UIGestureRecognizerStateBegan ||
        [gestureRecognizer state] == UIGestureRecognizerStateChanged) {
        
        CGFloat currentScale = [[[gestureRecognizer view].layer valueForKeyPath:@"transform.scale"] floatValue];
        
        // Constants to adjust the max/min values of zoom
        const CGFloat kMaxScale = 2.0;
        const CGFloat kMinScale = 1.0;
        
        CGFloat newScale = 1 -  (_lastScale - [gestureRecognizer scale]);
        newScale = MIN(newScale, kMaxScale / currentScale);
        newScale = MAX(newScale, kMinScale / currentScale);
        CGAffineTransform transform = CGAffineTransformScale([[gestureRecognizer view] transform], newScale, newScale);
        [gestureRecognizer view].transform = transform;
        
        _lastScale = [gestureRecognizer scale];  // Store the previous scale factor for the next pinch gesture call
    }
}
@end
