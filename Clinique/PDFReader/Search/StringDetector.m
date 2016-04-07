#import "StringDetector.h"

@implementation StringDetector

+ (StringDetector *)detectorWithKeyword:(NSString *)keyword delegate:(id<StringDetectorDelegate>)delegate{
	StringDetector *detector = [[StringDetector alloc] initWithKeyword:keyword];
	detector.delegate = delegate;
	return [detector autorelease];
}

- (id)initWithKeyword:(NSString *)string{
	if (self = [super init]) {
        keyword = [[string lowercaseString] retain];
        self.unicodeContent = [NSMutableString string];
	}

	return self;
}

- (NSString *)appendString:(NSString *)inputString unicodeString:(unsigned char *)unicodeString{
	NSString *lowercaseString = [inputString lowercaseString];
    int position = 0;

    if (lowercaseString) {
        [unicodeContent appendString:lowercaseString];
    }
    
    if (keywordPosition == 0 && [delegate respondsToSelector:@selector(detectorDidStartScanning:)]) {
        [delegate detectorDidStartScanning:self];
    }
    
    if (keywordPosition == 0 && [delegate respondsToSelector:@selector(detectorDidStartWord:)]) {
        [delegate detectorDidStartWord:self];
    }

    while (position < inputString.length) {
		unichar inputCharacter = [inputString characterAtIndex:position];
        unsigned char unicodeCharacter = 0xFF;
        if (unicodeString)
        {
            unicodeCharacter = unicodeString[position];
        }
        
		unichar actualCharacter = [lowercaseString characterAtIndex:position++];
        unichar expectedCharacter = keyword.length > 0 ? [keyword characterAtIndex:keywordPosition] : 0;

        if (actualCharacter == ' ')
        {
            if ([delegate respondsToSelector:@selector(detectorCompletedWord:)]) {
                [delegate detectorCompletedWord:self];
            }
            
            if (keywordPosition == 0 && [delegate respondsToSelector:@selector(detectorDidStartWord:)]) {
                [delegate detectorDidStartWord:self];
            }
        }
        
        if (actualCharacter != expectedCharacter) {
            if (keywordPosition > 0) {
                // Read character again
                position--;
            }
			else if ([delegate respondsToSelector:@selector(detector:didScanCharacter:unicodeCharacter:)]) {
				[delegate detector:self didScanCharacter:inputCharacter unicodeCharacter:unicodeCharacter];
			}

            // Reset keyword position
            keywordPosition = 0;
            continue;
        }

        if (keywordPosition == 0 && [delegate respondsToSelector:@selector(detectorDidStartMatching:)]) {
            [delegate detectorDidStartMatching:self];
        }

        if ([delegate respondsToSelector:@selector(detector:didScanCharacter:unicodeCharacter:)]) {
            [delegate detector:self didScanCharacter:inputCharacter unicodeCharacter:unicodeCharacter];
        }

        if (++keywordPosition < keyword.length) {
            // Keep matching keyword
            continue;
        }

        // Reset keyword position
        keywordPosition = 0;
        if ([delegate respondsToSelector:@selector(detectorFoundString:)]) {
            [delegate detectorFoundString:self];
        }
    }
    
    if ([delegate respondsToSelector:@selector(detectorCompletedWord:)]) {
        [delegate detectorCompletedWord:self];
    }
    
    if ([delegate respondsToSelector:@selector(detectorCompletedString:)]) {
        [delegate detectorCompletedString:self];
    }

    return inputString;
}

- (void)setKeyword:(NSString *)kword {
    [keyword release];
    keyword = [[kword lowercaseString] retain];

    keywordPosition = 0;
}

- (void)reset {
    keywordPosition = 0;
}

- (void)dealloc {
    [unicodeContent release];
	[keyword release];
	[super dealloc];
}

@synthesize delegate, unicodeContent;
@end
