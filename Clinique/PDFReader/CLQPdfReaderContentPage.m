//
//  PDFReaderContentPage.m
//  PDFReader
//
//  Created by BRINDHA_S on 15/07/14.
//  Copyright (c) 2014 BRINDHA_S. All rights reserved.
//

#import "CLQPdfReaderContentPage.h"
#import "CLQPdfReaderContentTile.h"
#import "CGPDFDocument.h"
#import "PDFRequestManager.h"
#import "PDFResponse.h"
#import "CacheManager.h"
#import "Selection.h"


@implementation CLQPdfReaderContentPage
{
	NSMutableArray *_links;
    NSMutableArray *highLightTexts;
    
	CGPDFDocumentRef _PDFDocRef;
	CGPDFPageRef _PDFPageRef;
	NSInteger _pageAngle;
    
    NSString *keyword;
	NSArray *selections;
	
    
	CGFloat _pageWidth;
	CGFloat _pageHeight;
    
	CGFloat _pageOffsetX;
	CGFloat _pageOffsetY;
    
    CGPoint point;
    CGRect pageRect;
}

#pragma mark ReaderContentPage class methods

+ (Class)layerClass
{
	return [CLQPdfReaderContentTile class];
}

#pragma mark ReaderContentPage PDF link methods

- (void)highlightPageLinks
{
	if (_links.count > 0) // Add highlight views over all links
	{
		UIColor *hilite = [UIColor colorWithRed:0.0f green:0.0f blue:1.0f alpha:0.15f];
        
		for (ReaderDocumentLink *link in _links) // Enumerate the links array
		{
			UIView *highlight = [[UIView alloc] initWithFrame:link.rect];
			highlight.autoresizesSubviews = NO;
			highlight.userInteractionEnabled = NO;
			highlight.contentMode = UIViewContentModeRedraw;
			highlight.autoresizingMask = UIViewAutoresizingNone;
			highlight.backgroundColor = hilite; // Color
			[self addSubview:highlight];
		}
	}
}

- (ReaderDocumentLink *)linkFromAnnotation:(CGPDFDictionaryRef)annotationDictionary
{
	ReaderDocumentLink *documentLink = nil; // Document link object
    
	CGPDFArrayRef annotationRectArray = NULL; // Annotation co-ordinates array
    // CGPDFDictionaryRef annotationDict = NULL;
	if (CGPDFDictionaryGetArray(annotationDictionary, "Rect", &annotationRectArray))
	{ //CGPDFDictionaryApplyFunction(annotationDictionary, printPDFKeys, NULL);
		CGPDFReal ll_x = 0.0f; CGPDFReal ll_y = 0.0f; // PDFRect lower-left X and Y
		CGPDFReal ur_x = 0.0f; CGPDFReal ur_y = 0.0f; // PDFRect upper-right X and Y
        
		CGPDFArrayGetNumber(annotationRectArray, 0, &ll_x); // Lower-left X co-ordinate
		CGPDFArrayGetNumber(annotationRectArray, 1, &ll_y); // Lower-left Y co-ordinate
        
		CGPDFArrayGetNumber(annotationRectArray, 2, &ur_x); // Upper-right X co-ordinate
		CGPDFArrayGetNumber(annotationRectArray, 3, &ur_y); // Upper-right Y co-ordinate
        
		if (ll_x > ur_x) { CGPDFReal t = ll_x; ll_x = ur_x; ur_x = t; } // Normalize Xs
		if (ll_y > ur_y) { CGPDFReal t = ll_y; ll_y = ur_y; ur_y = t; } // Normalize Ys
        
		ll_x -= _pageOffsetX; ll_y -= _pageOffsetY; // Offset lower-left co-ordinate
		ur_x -= _pageOffsetX; ur_y -= _pageOffsetY; // Offset upper-right co-ordinate
        
		switch (_pageAngle) // Page rotation angle (in degrees)
		{
			case 90: // 90 degree page rotation
			{
				CGPDFReal swap;
				swap = ll_y; ll_y = ll_x; ll_x = swap;
				swap = ur_y; ur_y = ur_x; ur_x = swap;
				break;
			}
                
			case 270: // 270 degree page rotation
			{
				CGPDFReal swap;
				swap = ll_y; ll_y = ll_x; ll_x = swap;
				swap = ur_y; ur_y = ur_x; ur_x = swap;
				ll_x = ((0.0f - ll_x) + _pageWidth);
				ur_x = ((0.0f - ur_x) + _pageWidth);
				break;
			}
                
			case 0: // 0 degree page rotation
			{
				ll_y = ((0.0f - ll_y) + _pageHeight);
				ur_y = ((0.0f - ur_y) + _pageHeight);
				break;
			}
		}
        
		NSInteger vr_x = ll_x; NSInteger vr_w = (ur_x - ll_x); // Integer X and width
		NSInteger vr_y = ll_y; NSInteger vr_h = (ur_y - ll_y); // Integer Y and height
        
		CGRect viewRect = CGRectMake(vr_x, vr_y, vr_w, vr_h); // View CGRect from PDFRect
        
		documentLink = [ReaderDocumentLink newWithRect:viewRect dictionary:annotationDictionary];
	}
    
	return documentLink;
}
- (void)buildAnnotationLinksList
{
	_links = [NSMutableArray new]; // Links list array
    highLightTexts = [NSMutableArray array];
	CGPDFArrayRef pageAnnotations = NULL; // Page annotations array
    
	CGPDFDictionaryRef pageDictionary = CGPDFPageGetDictionary(_PDFPageRef);
    //CGPDFDictionaryApplyFunction(pageDictionary, printPDFKeys, NULL);
   // CGPDFDictionaryRef catalog = CGPDFDocumentGetCatalog(_PDFDocRef);
   // CGPDFDictionaryApplyFunction(catalog, streamInfoFunction, catalog);
	if (CGPDFDictionaryGetArray(pageDictionary, "Annots", &pageAnnotations) == true)
	{
        for(size_t n = 0; n < CGPDFArrayGetCount(pageAnnotations); n += 2)
        {
            if(n >= CGPDFArrayGetCount(pageAnnotations))
                continue;
            
            CGPDFStringRef string;
            BOOL success = CGPDFArrayGetString(pageAnnotations, n, &string);
            CGPDFReal real;
            success = CGPDFArrayGetNumber(pageAnnotations, n+1, &real);
            if(success)
            {
                NSLog(@"array real : %f", real);
            }
        }
		NSInteger count = CGPDFArrayGetCount(pageAnnotations); // Number of annotations
        
		for (NSInteger index = 0; index < count; index++) // Iterate through all annotations
		{
			CGPDFDictionaryRef annotationDictionary = NULL; // PDF annotation dictionary
            
            
			if (CGPDFArrayGetDictionary(pageAnnotations, index, &annotationDictionary) == true)
			{
                
				const char *annotationSubtype = NULL; // PDF annotation subtype string
                
                CGPDFObjectRef mediaObject =NULL;
                
                if(CGPDFDictionaryGetObject(annotationDictionary, "RichMediaContent", &mediaObject) == true){
                    if( CGPDFObjectGetType(mediaObject)== kCGPDFObjectTypeDictionary){
                        CGPDFDictionaryRef value  = NULL;
                        CGPDFDictionaryGetDictionary(annotationDictionary, "RichMediaContent", &value);
                    }
                }
                if(CGPDFDictionaryGetObject(annotationDictionary, "RichMediaSettings", &mediaObject) == true){;
                    if( CGPDFObjectGetType(mediaObject)== kCGPDFObjectTypeDictionary){
                        CGPDFDictionaryRef mediaValue  = NULL;
                        const char *mediaSubtype = NULL;
                        CGPDFDictionaryGetDictionary(annotationDictionary, "RichMediaSettings", &mediaValue);
                        CGPDFDictionaryRef configValue  = NULL;
                        if( CGPDFDictionaryGetDictionary(annotationDictionary, "Configuration", &configValue) == true){
                        }
                        
                        if (CGPDFDictionaryGetName(mediaValue, "Subtype", &mediaSubtype) == true)
                        {
                            if (strcmp(annotationSubtype, "Video") == 0) // Found annotation subtype of 'Link'
                            { }
                        }
                    }
                }
				if (CGPDFDictionaryGetName(annotationDictionary, "Subtype", &annotationSubtype) == true)
				{
					if (strcmp(annotationSubtype, "Link") == 0) // Found annotation subtype of 'Link'
					{
						ReaderDocumentLink *documentLink = [self linkFromAnnotation:annotationDictionary];
                        
						if (documentLink != nil) [_links insertObject:documentLink atIndex:0]; // Add link
					}
                    
                    if (strcmp(annotationSubtype, "RichMedia") == 0) {
                        ReaderDocumentLink *documentLink = [self linkFromAnnotation:annotationDictionary];
                        if (documentLink != nil) [_links insertObject:documentLink atIndex:0];
                    }
                    
                    if (strcmp(annotationSubtype, "Highlight") == 0){
                        NSLog(@"Highlight");
                    }
				}
			}
		}
		//[self highlightPageLinks]; // Link support debugging
	}
}

void streamInfoFunction ( const char *key,CGPDFObjectRef object, void *info )
{
    NSLog(@"---------------------------------------------------------------------------------------------");
    NSLog(@"Processing Stream Info");
    
    NSString *keyStr = [NSString stringWithCString:key encoding:NSUTF8StringEncoding];
    CGPDFDictionaryRef contentDict = (CGPDFDictionaryRef)info;
    
    CGPDFObjectType objectType = CGPDFObjectGetType(object);
    if(objectType == kCGPDFObjectTypeDictionary)
    {
        CGPDFDictionaryRef value  = NULL;
        CGPDFDictionaryGetDictionary(contentDict, key, &value);
        NSLog(@"Value for dict key %@ is %zu",keyStr,CGPDFDictionaryGetCount(value));
        // CGPDFDictionaryApplyFunction(value, streamInfoFunction, value);
    }
    else if(objectType == kCGPDFObjectTypeArray)
    {
        CGPDFArrayRef value  = NULL;
        CGPDFDictionaryGetArray(contentDict, key, &value);
        NSLog(@"Value for key %@ is %zu",keyStr,CGPDFArrayGetCount(value));
        //S.SNSLog(@"%@",value);
    }
    else if(objectType == kCGPDFObjectTypeStream)
    {
        CGPDFStreamRef value  = NULL;
        CGPDFDictionaryGetStream(contentDict, key, &value);
        NSLog(@"Processing for key %@",keyStr);
        CGPDFDataFormat dataFormat;
        CFDataRef streamData = CGPDFStreamCopyData(value, &dataFormat);
        CFShow(streamData);
        NSString *contentString = [[NSString alloc]initWithBytes:[(__bridge NSData*)streamData bytes] length:[(__bridge NSData*)streamData length] encoding:NSUTF8StringEncoding];
        NSLog(@"%@",contentString);
        
    }
    else if(objectType == kCGPDFObjectTypeInteger)
    {
        CGPDFInteger integerValue;
        CGPDFDictionaryGetInteger(contentDict, key, &integerValue);
        NSLog(@"Processing for Key %@ value %ld",keyStr,integerValue);
        
    }
    else if(objectType == kCGPDFObjectTypeName)
    {
        const char *name;
        CGPDFDictionaryGetName(contentDict, key, &name);
        NSLog(@"Processing for key %@ value %@",keyStr,[NSString stringWithCString:name encoding:NSUTF8StringEncoding]);
    }
    
    NSLog(@"---------------------------------------------------------------------------------------------");
    
}
- (CGPDFArrayRef)destinationWithName:(const char *)destinationName inDestsTree:(CGPDFDictionaryRef)node
{
	CGPDFArrayRef destinationArray = NULL;
    
	CGPDFArrayRef limitsArray = NULL; // Limits array
    
	if (CGPDFDictionaryGetArray(node, "Limits", &limitsArray) == true)
	{
		CGPDFStringRef lowerLimit = NULL; CGPDFStringRef upperLimit = NULL;
        
		if (CGPDFArrayGetString(limitsArray, 0, &lowerLimit) == true) // Lower limit
		{
			if (CGPDFArrayGetString(limitsArray, 1, &upperLimit) == true) // Upper limit
			{
				const char *ll = (const char *)CGPDFStringGetBytePtr(lowerLimit); // Lower string
				const char *ul = (const char *)CGPDFStringGetBytePtr(upperLimit); // Upper string
                
				if ((strcmp(destinationName, ll) < 0) || (strcmp(destinationName, ul) > 0))
				{
					return NULL; // Destination name is outside this node's limits
				}
			}
		}
	}
    
	CGPDFArrayRef namesArray = NULL; // Names array
    
	if (CGPDFDictionaryGetArray(node, "Names", &namesArray) == true)
	{
		NSInteger namesCount = CGPDFArrayGetCount(namesArray);
        
		for (NSInteger index = 0; index < namesCount; index += 2)
		{
			CGPDFStringRef destName; // Destination name string
            
			if (CGPDFArrayGetString(namesArray, index, &destName) == true)
			{
				const char *dn = (const char *)CGPDFStringGetBytePtr(destName);
                
				if (strcmp(dn, destinationName) == 0) // Found the destination name
				{
					if (CGPDFArrayGetArray(namesArray, (index + 1), &destinationArray) == false)
					{
						CGPDFDictionaryRef destinationDictionary = NULL; // Destination dictionary
                        
						if (CGPDFArrayGetDictionary(namesArray, (index + 1), &destinationDictionary) == true)
						{
							CGPDFDictionaryGetArray(destinationDictionary, "D", &destinationArray);
						}
					}
                    
					return destinationArray; // Return the destination array
				}
			}
		}
	}
    
	CGPDFArrayRef kidsArray = NULL; // Kids array
    
	if (CGPDFDictionaryGetArray(node, "Kids", &kidsArray) == true)
	{
		NSInteger kidsCount = CGPDFArrayGetCount(kidsArray);
        
		for (NSInteger index = 0; index < kidsCount; index++)
		{
			CGPDFDictionaryRef kidNode = NULL; // Kid node dictionary
            
			if (CGPDFArrayGetDictionary(kidsArray, index, &kidNode) == true) // Recurse into node
			{
				destinationArray = [self destinationWithName:destinationName inDestsTree:kidNode];
                
				if (destinationArray != NULL) return destinationArray; // Return destination array
			}
		}
	}
    
	return NULL;
}

- (id)annotationLinkTarget:(CGPDFDictionaryRef)annotationDictionary
{
	id linkTarget = nil; // Link target object
    
	CGPDFStringRef destName = NULL; const char *destString = NULL;
    
	CGPDFDictionaryRef actionDictionary = NULL; CGPDFArrayRef destArray = NULL;
    
	if (CGPDFDictionaryGetDictionary(annotationDictionary, "A", &actionDictionary) == true)
	{
		const char *actionType = NULL; // Annotation action type string
        
		if (CGPDFDictionaryGetName(actionDictionary, "S", &actionType) == true)
		{
			if (strcmp(actionType, "GoTo") == 0) // GoTo action type
			{
				if (CGPDFDictionaryGetArray(actionDictionary, "D", &destArray) == false)
				{
					CGPDFDictionaryGetString(actionDictionary, "D", &destName);
				}
			}
			else // Handle other link action type possibility
			{
				if (strcmp(actionType, "URI") == 0) // URI action type
				{
					CGPDFStringRef uriString = NULL; // Action's URI string
                    
					if (CGPDFDictionaryGetString(actionDictionary, "URI", &uriString) == true)
					{
						const char *uri = (const char *)CGPDFStringGetBytePtr(uriString); // Destination URI string
                        
						NSString *target = [NSString stringWithCString:uri encoding:NSUTF8StringEncoding]; // NSString - UTF8
                        
						linkTarget = [NSURL URLWithString:[target stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
                        
						if (linkTarget == nil) NSLog(@"%s Bad URI '%@'", __FUNCTION__, target);
					}
				}
			}
		}
	}
	else // Handle other link target possibilities
	{
		if (CGPDFDictionaryGetArray(annotationDictionary, "Dest", &destArray) == false)
		{
			if (CGPDFDictionaryGetString(annotationDictionary, "Dest", &destName) == false)
			{
				CGPDFDictionaryGetName(annotationDictionary, "Dest", &destString);
			}
		}
	}
    
	if (destName != NULL) // Handle a destination name
	{
		CGPDFDictionaryRef catalogDictionary = CGPDFDocumentGetCatalog(_PDFDocRef);
        
		CGPDFDictionaryRef namesDictionary = NULL; // Destination names in the document
        
		if (CGPDFDictionaryGetDictionary(catalogDictionary, "Names", &namesDictionary) == true)
		{
			CGPDFDictionaryRef destsDictionary = NULL; // Document destinations dictionary
            
			if (CGPDFDictionaryGetDictionary(namesDictionary, "Dests", &destsDictionary) == true)
			{
				const char *destinationName = (const char *)CGPDFStringGetBytePtr(destName); // Name
                
				destArray = [self destinationWithName:destinationName inDestsTree:destsDictionary];
			}
		}
	}
    
	if (destString != NULL) // Handle a destination string
	{
		CGPDFDictionaryRef catalogDictionary = CGPDFDocumentGetCatalog(_PDFDocRef);
        
		CGPDFDictionaryRef destsDictionary = NULL; // Document destinations dictionary
        
		if (CGPDFDictionaryGetDictionary(catalogDictionary, "Dests", &destsDictionary) == true)
		{
			CGPDFDictionaryRef targetDictionary = NULL; // Destination target dictionary
            
			if (CGPDFDictionaryGetDictionary(destsDictionary, destString, &targetDictionary) == true)
			{
				CGPDFDictionaryGetArray(targetDictionary, "D", &destArray);
			}
		}
	}
    
	if (destArray != NULL) // Handle a destination array
	{
		NSInteger targetPageNumber = 0; // The target page number
        
		CGPDFDictionaryRef pageDictionaryFromDestArray = NULL; // Target reference
        
		if (CGPDFArrayGetDictionary(destArray, 0, &pageDictionaryFromDestArray) == true)
		{
			NSInteger pageCount = CGPDFDocumentGetNumberOfPages(_PDFDocRef); // Pages
            
			for (NSInteger pageNumber = 1; pageNumber <= pageCount; pageNumber++)
			{
				CGPDFPageRef pageRef = CGPDFDocumentGetPage(_PDFDocRef, pageNumber);
                
				CGPDFDictionaryRef pageDictionaryFromPage = CGPDFPageGetDictionary(pageRef);
                
				if (pageDictionaryFromPage == pageDictionaryFromDestArray) // Found it
				{
					targetPageNumber = pageNumber; break;
				}
			}
		}
		else // Try page number from array possibility
		{
			CGPDFInteger pageNumber = 0; // Page number in array
            
			if (CGPDFArrayGetInteger(destArray, 0, &pageNumber) == true)
			{
				targetPageNumber = (pageNumber + 1); // 1-based
			}
		}
        
		if (targetPageNumber > 0) // We have a target page number
		{
			linkTarget = [NSNumber numberWithInteger:targetPageNumber];
		}
	}
    
	return linkTarget;
}

- (id)processSingleTap:(UITapGestureRecognizer *)recognizer
{
    [self endEditing:YES];
	id result = nil; // Tap result object
    
	if (recognizer.state == UIGestureRecognizerStateRecognized)
	{
		if (_links.count > 0) // Process the single tap
		{
			CGPoint points = [recognizer locationInView:self];
            
			for (ReaderDocumentLink *link in _links) // Enumerate links
			{
				if (CGRectContainsPoint(link.rect, points) == true) // Found it
				{
					result = [self annotationLinkTarget:link.dictionary]; break;
				}
			}
		}
	}
    
	return result;
}
#pragma mark ReaderContentPage instance methods
- (void)resetSelectedText
{
    if (_scanner)
    {
        _scanner.selectedObject = nil;
        _scanner.selectedString = nil;
        
        _scanner.wordObject = nil;
        _scanner.selectedWord = nil;
    }
}

- (void)setKeyword:(NSString *)str
{
   
    _scanner = [Scanner scannerWithPage:_PDFPageRef];
	keyword = [str copy];
	selections = nil;
}

- (NSArray *)selections
{
	@synchronized (self)
	{
		if (!selections)
		{
			selections =  [_scanner select:keyword touchPoint:point pageRect:pageRect];
		}
		return selections;
	}
}
#pragma mark ReaderContentPage instance methods

- (id)initWithFrame:(CGRect)frame
{
	id view = nil; // UIView
    
	if (CGRectIsEmpty(frame) == false)
	{
		if ((self = [super initWithFrame:frame]))
		{
			self.autoresizesSubviews = NO;
			self.userInteractionEnabled = NO;
			self.contentMode = UIViewContentModeRedraw;
			self.autoresizingMask = UIViewAutoresizingNone;
			self.backgroundColor = [UIColor greenColor];
             [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keywordChangeNotification:) name:@"KeywordChangeNotify" object:nil];
			view = self; // Return self//
		}
	}
	else // Handle invalid frame size
	{
		self = nil;
	}
    
	return view;
}
-(void)initWithURL:(NSURL *)fileURL page:(NSInteger)page password:(NSString *)phrase searchText:(NSString *)searchText selectionPoint:(CGPoint)selectionPoint withCompletion:(void(^)(id view))completion{
    CGRect viewRect = CGRectZero; // View rect
    
	if (fileURL != nil) // Check for non-nil file URL
	{
		_PDFDocRef = CGPDFDocumentCreateX((__bridge CFURLRef)fileURL, phrase);
        
		if (_PDFDocRef != NULL) // Check for non-NULL CGPDFDocumentRef
		{
			if (page < 1) page = 1; // Check the lower page bounds
            
			NSInteger pages = CGPDFDocumentGetNumberOfPages(_PDFDocRef);
            
			if (page > pages) page = pages; // Check the upper page bounds
            
			_PDFPageRef = CGPDFDocumentGetPage(_PDFDocRef, page); // Get page
            
			if (_PDFPageRef != NULL) // Check for non-NULL CGPDFPageRef
			{
				CGPDFPageRetain(_PDFPageRef); // Retain the PDF page
                
				CGRect cropBoxRect = CGPDFPageGetBoxRect(_PDFPageRef, kCGPDFCropBox);
				CGRect mediaBoxRect = CGPDFPageGetBoxRect(_PDFPageRef, kCGPDFMediaBox);
				CGRect effectiveRect = CGRectIntersection(cropBoxRect, mediaBoxRect);
                
				_pageAngle = CGPDFPageGetRotationAngle(_PDFPageRef); // Angle
                
				switch (_pageAngle) // Page rotation angle (in degrees)
				{
					default: // Default case
					case 0: case 180: // 0 and 180 degrees
					{
						_pageWidth = effectiveRect.size.width;
						_pageHeight = effectiveRect.size.height;
						_pageOffsetX = effectiveRect.origin.x;
						_pageOffsetY = effectiveRect.origin.y;
						break;
					}
                        
					case 90: case 270: // 90 and 270 degrees
					{
						_pageWidth = effectiveRect.size.height;
						_pageHeight = effectiveRect.size.width;
						_pageOffsetX = effectiveRect.origin.y;
						_pageOffsetY = effectiveRect.origin.x;
						break;
					}
				}
                
				NSInteger page_w = _pageWidth + 0.5f; // Integer width
				NSInteger page_h = _pageHeight + 0.5f; // Integer height
                
				if (page_w % 2) page_w--; if (page_h % 2) page_h--; // Even
                
				viewRect.size = CGSizeMake(page_w, page_h); // View size
                
                pageRect = CGRectMake(0, 0, page_w, page_h);
                
                if ((selectionPoint.x != -1) && (selectionPoint.y != -1))
                {
                    point = selectionPoint;
                }
                
                if (searchText)
                {
                    [self setKeyword:searchText];
                }
                else
                {
                    [self setKeyword:[NSString stringWithFormat:@"%C%C",0xFFFF,0xFFFF]];
                }
			}
			else // Error out with a diagnostic
			{
				CGPDFDocumentRelease(_PDFDocRef), _PDFDocRef = NULL;
                
				NSAssert(NO, @"CGPDFPageRef == NULL");
			}
		}
		else // Error out with a diagnostic
		{
			NSAssert(NO, @"CGPDFDocumentRef == NULL");
		}
	}
	else // Error out with a diagnostic
	{
		NSAssert(NO, @"fileURL == nil");
	}
    
	id view = [self initWithFrame:viewRect]; // UIView setup
    [self setKeyword:searchText];
	if (view != nil) [self buildAnnotationLinksList]; // Links
    
	completion(view);

}

- (void)removeFromSuperview
{
	self.layer.delegate = nil;
	//self.layer.contents = nil;
	[super removeFromSuperview];
}

- (void)dealloc
{
	CGPDFPageRelease(_PDFPageRef), _PDFPageRef = NULL;
	CGPDFDocumentRelease(_PDFDocRef), _PDFDocRef = NULL;
    @try {
        [[NSNotificationCenter defaultCenter] removeObserver:self name:@"KeywordChangeNotify" object:nil];
    }
    @catch (NSException *exception) {
        NSLog(@"exception KeywordChangeNotify: %@",exception.description);
    }
}

#if (READER_DISABLE_RETINA == TRUE) // Option

- (void)didMoveToWindow
{
	self.contentScaleFactor = 1.0f; // Override scale factor
}


#endif // end of READER_DISABLE_RETINA Option

#pragma mark CATiledLayer delegate methods
-(void)drawHighLightWithStartPoint:(CGPoint)startPoint withEndpoint:(CGPoint)endPoint{
    CGRect rect = CGRectMake(startPoint.x, startPoint.y, _pageWidth, endPoint.y-startPoint.y);
    ReaderHighLight *highlight   = [[ReaderHighLight alloc]initWithRect:rect dictionary:nil];
    [self setNeedsDisplay];
    [highLightTexts addObject:highlight];
  // highLightTexts addObject:<#(id)#>
}
- (void) keywordChangeNotification:(NSNotification*)notification
{
    NSString *userKeywordSearch = notification.object;
    self.keyword = userKeywordSearch;
    [self setNeedsDisplay];
}

- (void)drawLayer:(CATiledLayer *)layer inContext:(CGContextRef)context
{
	CLQPdfReaderContentPage *readerContentPage = self; // Retain self
    
	CGContextSetRGBFillColor(context, 1.0f, 1.0f, 1.0f, 1.0f); // White
    
	CGContextFillRect(context, CGContextGetClipBoundingBox(context)); // Fill
    
	//NSLog(@"%s %@", __FUNCTION__, NSStringFromCGRect(CGContextGetClipBoundingBox(context)));
    
	CGContextTranslateCTM(context, 0.0f, self.bounds.size.height); CGContextScaleCTM(context, 1.0f, -1.0f);
    
	CGContextConcatCTM(context, CGPDFPageGetDrawingTransform(_PDFPageRef, kCGPDFCropBox, self.bounds, 0, true));
    
	//CGContextSetRenderingIntent(context, kCGRenderingIntentDefault); CGContextSetInterpolationQuality(context, kCGInterpolationDefault);
    
	CGContextDrawPDFPage(context, _PDFPageRef); // Render the PDF page into the context
    if (keyword)
    {
        CGContextSetFillColorWithColor(context, [[UIColor colorWithRed:0/255.0 green:213/255.0 blue:17/255.0 alpha:0.39] CGColor]);
        CGContextSetBlendMode(context, kCGBlendModeMultiply);
        for (Selection *s in self.selections)
        {
            CGContextSaveGState(context);
            CGContextConcatCTM(context, s.transform);
            CGContextFillRect(context, s.frame);
            CGContextRestoreGState(context);
        }
    }
	if (readerContentPage != nil) readerContentPage = nil; // Release self

}
@end

#pragma mark -

//
//	ReaderDocumentLink class implementation
//

@implementation ReaderDocumentLink
{
	CGPDFDictionaryRef _dictionary;
    
	CGRect _rect;
}

#pragma mark Properties

@synthesize rect = _rect;
@synthesize dictionary = _dictionary;

#pragma mark ReaderDocumentLink class methods

+ (id)newWithRect:(CGRect)linkRect dictionary:(CGPDFDictionaryRef)linkDictionary
{
	return [[ReaderDocumentLink alloc] initWithRect:linkRect dictionary:linkDictionary];
}

#pragma mark ReaderDocumentLink instance methods

- (id)initWithRect:(CGRect)linkRect dictionary:(CGPDFDictionaryRef)linkDictionary
{
	if ((self = [super init]))
	{
		_dictionary = linkDictionary;
        
		_rect = linkRect;
	}
    
	return self;
}

@end

@implementation ReaderHighLight{
 
}

#pragma mark ReaderHighlighttLink class methods

+ (id)newWithRect:(CGRect)highlightRect dictionary:(CGPDFDictionaryRef)highlightDictionary
{
	return [[ReaderHighLight alloc] initWithRect:highlightRect dictionary:highlightDictionary];
}

#pragma mark ReaderHighlightLink instance methods

- (id)initWithRect:(CGRect)highlightRect dictionary:(CGPDFDictionaryRef)highlightDictionary
{
	if ((self = [super init]))
	{
		_dictionary = highlightDictionary;
        
		_rect = highlightRect;
	}
    
	return self;
}
@end
