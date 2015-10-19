#import <Foundation/Foundation.h>

@class StringDetector;

@protocol StringDetectorDelegate <NSObject>
@optional
- (void)detectorDidStartScanning:(StringDetector *)stringDetector;
- (void)detectorDidStartWord:(StringDetector *)stringDetector;
- (void)detectorDidStartMatching:(StringDetector *)stringDetector;
- (void)detectorFoundString:(StringDetector *)detector;
- (void)detectorCompletedString:(StringDetector *)detector;
- (void)detectorCompletedWord:(StringDetector *)detector;
- (void)detector:(StringDetector *)detector didScanCharacter:(unichar)character unicodeCharacter:(unsigned char)unicodeCharacter;
@end
