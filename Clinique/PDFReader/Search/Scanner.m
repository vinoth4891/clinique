#import "Scanner.h"
//#import "pdfScannerCallbacks.mm"

@implementation Scanner

+ (Scanner *)scannerWithPage:(CGPDFPageRef)page {
	return [[Scanner alloc] initWithPage:page];
}

- (id)initWithPage:(CGPDFPageRef)page {
    
	if (self = [super init]) {
        
		pdfPage = page;
        
        self.selectedObject = nil;
        self.selectedString = nil;
        
        self.wordObject = nil;
        self.selectedWord = nil;
        
		self.fontCollection = [self fontCollectionWithPage:pdfPage];
		self.selections = [NSMutableArray array];
        
        self.textList = [NSMutableArray array];
        self.transformList = [NSMutableArray array];
        self.statusList = [NSMutableArray array];
        
        if (!asciiCharacters)
        {
            asciiCharacters = [[NSMutableString string] retain];
            for (NSInteger i = 32; i < 127; i++)
            {
                [asciiCharacters appendFormat:@"%c", i];
            }
        }
	}
	
	return self;
}

- (NSArray *)select:(NSString *)keyword touchPoint:(CGPoint)point pageRect:(CGRect)pageRect{
    self.content = [NSMutableString string];
    self.touchPoint = point;
	self.stringDetector = [StringDetector detectorWithKeyword:keyword delegate:self];
	[self.selections removeAllObjects];
    self.renderingStateStack = [RenderingStateStack stack];
    
 	CGPDFOperatorTableRef operatorTable = [self newOperatorTable];
	CGPDFContentStreamRef contentStream = CGPDFContentStreamCreateWithPage(pdfPage);
	CGPDFScannerRef scanner = CGPDFScannerCreate(contentStream, operatorTable, self);
	CGPDFScannerScan(scanner);
	
	CGPDFScannerRelease(scanner);
	CGPDFContentStreamRelease(contentStream);
	CGPDFOperatorTableRelease(operatorTable);
	
    self.stringDetector.delegate = nil;
    self.stringDetector = nil;
    
    //===============================//
    
    UIInterfaceOrientation orientation = [[UIApplication sharedApplication] statusBarOrientation];
    
    CGFloat AdjX = 1;
    CGFloat AdjY = 1;
    
    CGRect mainRect = [UIScreen mainScreen].bounds;
    
    if ((orientation == UIInterfaceOrientationLandscapeLeft) || (orientation == UIInterfaceOrientationLandscapeRight))
    {
        float width = mainRect.size.width;
        mainRect.size.width = mainRect.size.height;
        mainRect.size.height = width;
    }

    
    // Offset relative to top left corner of rectangle where the page will be displayed
    float offsetX = 0;
    float offsetY = 0;
    float scale = 1;
    
    float rectangleAspectRatio = mainRect.size.width / mainRect.size.height;
    float pageAspectRatio = pageRect.size.width / pageRect.size.height;
    
    if (pageAspectRatio < rectangleAspectRatio)
    {
        // The page is narrower than the rectangle, we place it at center on the horizontal
        offsetX = (mainRect.size.width - (pageRect.size.width * scale)) / 2;
        
        if (offsetX < 0)
        {
            offsetX = (mainRect.size.width * (rectangleAspectRatio - pageAspectRatio)) / 2;
        }

        AdjX = (mainRect.size.width - (offsetX * 2)) / pageRect.size.width;
        AdjY = (mainRect.size.height - (offsetY * 2)) / pageRect.size.height;
    }
    else
    {
        AdjX = (mainRect.size.width - (offsetX * 2)) / pageRect.size.width;
        
        // The page is wider than the rectangle, we place it at center on the vertical
        offsetY = (mainRect.size.height - (pageRect.size.height * AdjX)) / 2;
        
        AdjY = (mainRect.size.height - (offsetY * 2)) / pageRect.size.height;
    }
    
    
    //===============================//
    
    int i = 0;
    for (Selection *sWord in self.transformList)
    {
        CGRect frame;
        frame.origin.x = (sWord.transform.a * sWord.frame.origin.x) + (sWord.transform.c * sWord.frame.origin.y) + sWord.transform.tx;
        frame.origin.y = pageRect.size.height - ((sWord.transform.b * sWord.frame.origin.x) + (sWord.transform.d * sWord.frame.origin.y) + sWord.transform.ty);
        
        frame.size.width = (sWord.transform.a * (sWord.frame.origin.x + sWord.frame.size.width)) + (sWord.transform.c * (sWord.frame.origin.y + sWord.frame.size.height)) + sWord.transform.tx;
        frame.size.height = pageRect.size.height - ((sWord.transform.b * (sWord.frame.origin.x + sWord.frame.size.width)) + (sWord.transform.d * (sWord.frame.origin.y + sWord.frame.size.height)) + sWord.transform.ty);
        
        frame.size.width -= frame.origin.x;
        frame.size.height -= frame.origin.y;
        frame.origin.y += frame.size.height;
        frame.size.height *= -1;
        
        CGRect frameSelected = frame;
        
        frame.origin.x *= AdjX;
        frame.size.width *= AdjX;
        frame.origin.y *= AdjY;
        frame.size.height *= AdjY;
        
        frame.origin.x += offsetX;
        frame.origin.y += offsetY;
        
//        NSLog(@"\n\n%@ :: %@ : %@ : %@\n\n", (NSString *)[self.textList objectAtIndex:i], NSStringFromCGRect(frameSelected), NSStringFromCGRect(frame), NSStringFromCGPoint(self.touchPoint));
        
        if (CGRectContainsPoint(frame, self.touchPoint) == YES)
        {
            //NSLog(@"\n\nSELECTED >>>>>>> %@ :: %@ = %@\n\n", (NSString *)[self.textList objectAtIndex:i], NSStringFromCGRect(frame), NSStringFromCGPoint(self.touchPoint));
            
            //NSLog(@"\n\nFRAME = %@ : %@\n\n", NSStringFromCGRect(frame), NSStringFromCGRect(frameSelected));
            
            if (self.selectedObject || self.selectedWord)
            {
                self.selectedObject = nil;
                self.selectedString = nil;
                self.wordObject = nil;
                self.selectedWord = nil;
            }
            
            self.textFrame = frameSelected;
            self.wordObject = sWord;
            self.selectedWord = (NSString *)[self.textList objectAtIndex:i];
            
            for (int k = i+1; k < [self.textList count]; k++)
            {
                NSString *status = (NSString *)[self.statusList objectAtIndex:k];
                
                if ([status isEqualToString:@"T"])
                {
                    self.selectedObject = (Selection *)[self.transformList objectAtIndex:k];
                    self.selectedString = (NSString *)[self.textList objectAtIndex:k];
                    break;
                }
            }
            
            break;
        }
        
        i++;
    }
    
	return self.selections;
}

- (CGPDFOperatorTableRef)newOperatorTable {
	CGPDFOperatorTableRef operatorTable = CGPDFOperatorTableCreate();

	// Text-showing operators
	CGPDFOperatorTableSetCallback(operatorTable, "Tj", printString);
	CGPDFOperatorTableSetCallback(operatorTable, "\'", printStringNewLine);
	CGPDFOperatorTableSetCallback(operatorTable, "\"", printStringNewLineSetSpacing);
	CGPDFOperatorTableSetCallback(operatorTable, "TJ", printStringsAndSpaces);
	
	// Text-positioning operators
	CGPDFOperatorTableSetCallback(operatorTable, "Tm", setTextMatrix);
	CGPDFOperatorTableSetCallback(operatorTable, "Td", newLineWithLeading);
	CGPDFOperatorTableSetCallback(operatorTable, "TD", newLineSetLeading);
	CGPDFOperatorTableSetCallback(operatorTable, "T*", newLine);
	
	// Text state operators
	CGPDFOperatorTableSetCallback(operatorTable, "Tw", setWordSpacing);
	CGPDFOperatorTableSetCallback(operatorTable, "Tc", setCharacterSpacing);
	CGPDFOperatorTableSetCallback(operatorTable, "TL", setTextLeading);
	CGPDFOperatorTableSetCallback(operatorTable, "Tz", setHorizontalScale);
	CGPDFOperatorTableSetCallback(operatorTable, "Ts", setTextRise);
	CGPDFOperatorTableSetCallback(operatorTable, "Tf", setFont);
	
	// Graphics state operators
	CGPDFOperatorTableSetCallback(operatorTable, "cm", applyTransformation);
	CGPDFOperatorTableSetCallback(operatorTable, "q", pushRenderingState);
	CGPDFOperatorTableSetCallback(operatorTable, "Q", popRenderingState);
	
	CGPDFOperatorTableSetCallback(operatorTable, "BT", newParagraph);
	
	return operatorTable;
}

/* Create a font dictionary given a PDF page */
- (FontCollection *)fontCollectionWithPage:(CGPDFPageRef)page {
	CGPDFDictionaryRef dict = CGPDFPageGetDictionary(page);
	if (!dict) 	{
		NSLog(@"Scanner: fontCollectionWithPage: page dictionary missing");
		return nil;
	}
	
	CGPDFDictionaryRef resources;
	if (!CGPDFDictionaryGetDictionary(dict, "Resources", &resources)) {
		NSLog(@"Scanner: fontCollectionWithPage: page dictionary missing Resources dictionary");
		return nil;
	}

	CGPDFDictionaryRef fonts;
	if (!CGPDFDictionaryGetDictionary(resources, "Font", &fonts)) {
		return nil;
	}

	FontCollection *collection = [[FontCollection alloc] initWithFontDictionary:fonts];
	return [collection autorelease];
}

- (void)detector:(StringDetector *)detector didScanCharacter:(unichar)character unicodeCharacter:(unsigned char)unicodeCharacter{
    
    Font *font = self.renderingState.font;
    unichar cid = character;

    if (font.toUnicode) {
        cid = [font.toUnicode cidCharacter:character];
    }

	CGFloat width = [font widthOfCharacter:cid withFontSize:self.renderingState.fontSize];
    if (width == 0)
    {
        width = [font widthOfCharacter:character withFontSize:self.renderingState.fontSize];
        
        if (width == 0)
        {
            width = [font widthOfCharacter:unicodeCharacter withFontSize:self.renderingState.fontSize];
        }
    }
    
	width /= 1000;
	width += self.renderingState.characterSpacing;
	if (character == 32) {
		width += self.renderingState.wordSpacing;
	}

	[self.renderingState translateTextPosition:CGSizeMake(width, 0)];
}

- (void)addWordsFrom:(NSString *)string
{
    NSArray *oList = [string  componentsSeparatedByString:@" "];

    for (NSString *word in oList)
    {
        [self.textList addObject:word];
        [self.statusList addObject:@"W"];
    }
    
    [self.textList addObject:string];
    [self.statusList addObject:@"T"];
}

- (void)detectorDidStartScanning:(StringDetector *)detector {
    completeText = [[Selection selectionWithState:self.renderingState] retain];
}

- (void)detectorDidStartWord:(StringDetector *)detector {
    completeWord = [[Selection selectionWithState:self.renderingState] retain];
}

- (void)detectorDidStartMatching:(StringDetector *)detector {
    possibleSelection = [[Selection selectionWithState:self.renderingState] retain];
}

- (void)detectorFoundString:(StringDetector *)detector {
    if (possibleSelection) {
	    possibleSelection.finalState = self.renderingState;
        [self.selections addObject:possibleSelection];
        [possibleSelection release];
        possibleSelection = nil;
    }
}

- (void)detectorCompletedWord:(StringDetector *)detector {
    if (completeWord) {
	    completeWord.finalState = self.renderingState;
        [self.transformList addObject:completeWord];
        [completeWord release];
        completeWord = nil;
    }
}

- (void)detectorCompletedString:(StringDetector *)detector {
    if (completeText) {
	    completeText.finalState = self.renderingState;
        [self.transformList addObject:completeText];
        [completeText release];
        completeText = nil;
    }
}

- (RenderingState *)renderingState {
	return [self.renderingStateStack topRenderingState];
}

- (void)dealloc {

    self.selectedObject = nil;
    self.selectedString = nil;
    self.wordObject = nil;
    self.selectedWord = nil;
    
    [possibleSelection release];
    [completeText release];
	[fontCollection release];
	[selections release];
	[renderingStateStack release];
	[stringDetector release];
	[content release];
	[super dealloc];
}

@synthesize stringDetector, fontCollection, renderingStateStack, content, selections, renderingState;




BOOL isSpace(float width, Scanner *scanner) {
	return abs(width) >= scanner.renderingState.font.widthOfSpace;
}

void didScanSpace(float value, void *info, bool bReset) {
	Scanner *scanner = (Scanner *) info;
    float width = [scanner.renderingState convertToUserSpace:value];
    [scanner.renderingState translateTextPosition:CGSizeMake(-width, 0)];
    if (isSpace(value, scanner)) {
        if (bReset) [scanner.stringDetector reset];
    }
}

void didScanString(const unsigned char *bytes, unsigned int length, void *info) {
	Scanner *scanner = (Scanner *) info;
	StringDetector *stringDetector = scanner.stringDetector;
	Font *font = scanner.renderingState.font;
    NSString *string =  [font stringWithPDFString:bytes length:length];

    if (string) {
        [scanner addWordsFrom:string];
        [stringDetector appendString:string unicodeString:NULL];
        [scanner.content appendString:string];
        [scanner.content appendString:@" "];
    }
}

NSString * didScanUnicode(const unsigned char *bytes, unsigned int length, void *info) {
	Scanner *scanner = (Scanner *) info;
	Font *font = scanner.renderingState.font;
    
    NSString *string = [font unicodeWithPDFString:bytes length:length];
    return string;
}

void didAppendUnicode(NSString *string, unsigned char *unicodeString, void *info) {
	Scanner *scanner = (Scanner *) info;
	StringDetector *stringDetector = scanner.stringDetector;

    if (string) {
        [scanner addWordsFrom:string];
        [stringDetector appendString:string unicodeString:unicodeString];
        [scanner.content appendString:string];
        [scanner.content appendString:@" "];
    }
}

void didScanNewLine(CGPDFScannerRef pdfScanner, Scanner *scanner, BOOL persistLeading) {
	CGPDFReal tx, ty;
	CGPDFScannerPopNumber(pdfScanner, &ty);
	CGPDFScannerPopNumber(pdfScanner, &tx);
	[scanner.renderingState newLineWithLeading:-ty indent:tx save:persistLeading];
}

CGPDFStringRef getString(CGPDFScannerRef pdfScanner) {
	CGPDFStringRef pdfString;
	CGPDFScannerPopString(pdfScanner, &pdfString);
	return pdfString;
}

CGPDFReal getNumber(CGPDFScannerRef pdfScanner) {
	CGPDFReal value;
	CGPDFScannerPopNumber(pdfScanner, &value);
	return value;
}

CGPDFArrayRef getArray(CGPDFScannerRef pdfScanner) {
	CGPDFArrayRef pdfArray;
	CGPDFScannerPopArray(pdfScanner, &pdfArray);
	return pdfArray;
}

CGPDFObjectRef getObject(CGPDFArrayRef pdfArray, int index) {
	CGPDFObjectRef pdfObject;
	CGPDFArrayGetObject(pdfArray, index, &pdfObject);
	return pdfObject;
}

CGPDFStringRef getStringValue(CGPDFObjectRef pdfObject) {
	CGPDFStringRef string;
	CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeString, &string);
	return string;
}

float getNumericalValue(CGPDFObjectRef pdfObject, CGPDFObjectType type) {
	if (type == kCGPDFObjectTypeReal) {
		CGPDFReal tx;
		CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeReal, &tx);
		return tx;
	}
	else if (type == kCGPDFObjectTypeInteger) {
		CGPDFInteger tx;
		CGPDFObjectGetValue(pdfObject, kCGPDFObjectTypeInteger, &tx);
		return tx;
	}
    
	return 0;
}

CGAffineTransform getTransform(CGPDFScannerRef pdfScanner) {
	CGAffineTransform transform;
	transform.ty = getNumber(pdfScanner);
	transform.tx = getNumber(pdfScanner);
	transform.d = getNumber(pdfScanner);
	transform.c = getNumber(pdfScanner);
	transform.b = getNumber(pdfScanner);
	transform.a = getNumber(pdfScanner);
	return transform;
}

- (BOOL)isStringASCII:(NSString *)string
{
    NSCharacterSet *nonAsciiCharacterSet = [[NSCharacterSet characterSetWithCharactersInString:asciiCharacters] invertedSet];
    
    NSString *asciiStr = [[string componentsSeparatedByCharactersInSet:nonAsciiCharacterSet] componentsJoinedByString:@""];
    
    return ([string length] == [asciiStr length])? YES : NO;
}

#pragma mark Text parameters

void setHorizontalScale(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setHorizontalScaling:getNumber(pdfScanner)];
}

void setTextLeading(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setLeadning:getNumber(pdfScanner)];
}

void setFont(CGPDFScannerRef pdfScanner, void *info) {
	CGPDFReal fontSize;
	const char *fontName;
	CGPDFScannerPopNumber(pdfScanner, &fontSize);
	CGPDFScannerPopName(pdfScanner, &fontName);

	Scanner *scanner = (Scanner *) info;
	RenderingState *state = scanner.renderingState;
	Font *font = [scanner.fontCollection fontNamed:[NSString stringWithUTF8String:fontName]];
	[state setFont:font];
	[state setFontSize:fontSize];
}

void setTextRise(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setTextRise:getNumber(pdfScanner)];
}

void setCharacterSpacing(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setCharacterSpacing:getNumber(pdfScanner)];
}

void setWordSpacing(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setWordSpacing:getNumber(pdfScanner)];
}


#pragma mark Set position

void newLine(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState newLine];
}

void newLineWithLeading(CGPDFScannerRef pdfScanner, void *info) {
	didScanNewLine(pdfScanner, (Scanner *) info, NO);
}

void newLineSetLeading(CGPDFScannerRef pdfScanner, void *info) {
	didScanNewLine(pdfScanner, (Scanner *) info, YES);
}

void newParagraph(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setTextMatrix:CGAffineTransformIdentity replaceLineMatrix:YES];
}

void setTextMatrix(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingState setTextMatrix:getTransform(pdfScanner) replaceLineMatrix:YES];
}


#pragma mark Print strings

void printString(CGPDFScannerRef pdfScanner, void *info)
{
    Scanner *scanner = (Scanner *) info;
    CGPDFStringRef pdfString = getString(pdfScanner);
    
    const unsigned char *characterString = CGPDFStringGetBytePtr(pdfString);
    unsigned int iLength = CGPDFStringGetLength(pdfString);
    
    NSString *string = didScanUnicode(characterString, iLength, info);
    
    if (![scanner isStringASCII:string])
    {
        didScanString(characterString, iLength, info);
        return;
    }
    
    unsigned int iIndex = 0;
    unsigned char unicodeString[1024];
    
    for (int j = 0; j < iLength; j++)
    {
        unicodeString[iIndex++] = characterString[j];
    }
    
    unicodeString[iIndex] = '\0';
    
    didAppendUnicode(string, unicodeString, info);
}

void printStringNewLine(CGPDFScannerRef scanner, void *info) {
	newLine(scanner, info);
	printString(scanner, info);
}

void printStringNewLineSetSpacing(CGPDFScannerRef scanner, void *info) {
	setWordSpacing(scanner, info);
	setCharacterSpacing(scanner, info);
	printStringNewLine(scanner, info);
}

void printStringsAndSpaces(CGPDFScannerRef pdfScanner, void *info)
{
	CGPDFArrayRef array = getArray(pdfScanner);
    NSMutableString *string = [NSMutableString string];
    
    unsigned int iIndex = 0;
    unsigned char unicodeString[2048];
    
	for (int i = 0; i < CGPDFArrayGetCount(array); i++)
    {
		CGPDFObjectRef pdfObject = getObject(array, i);
		CGPDFObjectType valueType = CGPDFObjectGetType(pdfObject);
        
		if (valueType == kCGPDFObjectTypeString)
        {
            CGPDFStringRef pdfString = getStringValue(pdfObject);
            
            const unsigned char *characterString = CGPDFStringGetBytePtr(pdfString);
            unsigned int iLength = CGPDFStringGetLength(pdfString);
            
            NSString *str = didScanUnicode(characterString, iLength, info);
			[string appendString:str];
            
            for (int j = 0; j < iLength; j++)
            {
                unicodeString[iIndex++] = characterString[j];
            }
		}
		else
        {
			didScanSpace(getNumericalValue(pdfObject, valueType), info, NO);
		}
	}
    
    unicodeString[iIndex] = '\0';
    
    Scanner *scanner = (Scanner *) info;
    
    if ([scanner isStringASCII:string])
    {
        didAppendUnicode(string, unicodeString, info);
        return;
    }
    
    
	for (int i = 0; i < CGPDFArrayGetCount(array); i++)
    {
		CGPDFObjectRef pdfObject = getObject(array, i);
		CGPDFObjectType valueType = CGPDFObjectGetType(pdfObject);
        
		if (valueType == kCGPDFObjectTypeString)
        {
            CGPDFStringRef pdfString = getStringValue(pdfObject);
            
            const unsigned char *characterString = CGPDFStringGetBytePtr(pdfString);
            unsigned int iLength = CGPDFStringGetLength(pdfString);
            
            didScanString(characterString, iLength, info);
		}
		else
        {
			didScanSpace(getNumericalValue(pdfObject, valueType), info, YES);
		}
	}
}



#pragma mark Graphics state operators

void pushRenderingState(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	RenderingState *state = [scanner.renderingState copy];
	[scanner.renderingStateStack pushRenderingState:state];
	[state release];
}

void popRenderingState(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	[scanner.renderingStateStack popRenderingState];
}

/* Update CTM */
void applyTransformation(CGPDFScannerRef pdfScanner, void *info) {
	Scanner *scanner = (Scanner *) info;
	RenderingState *state = scanner.renderingState;
	state.ctm = CGAffineTransformConcat(getTransform(pdfScanner), state.ctm);
}

@end
