//
//	ReaderDocument.h
//	Reader v2.6.0
//
//	Created by Julius Oklamcak on 2011-07-01.
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

#import <Foundation/Foundation.h>

@interface CLQPdfReaderDocument : NSObject <NSObject, NSCoding>

@property (nonatomic, strong) NSString *guid;
@property (nonatomic, strong) NSDate *fileDate;
@property (nonatomic, strong) NSDate *lastOpen;
@property (nonatomic, strong) NSNumber *fileSize;
@property (nonatomic, strong) NSNumber *pageCount;
@property (nonatomic, strong) NSNumber *pageNumber;
@property (nonatomic, strong) NSMutableIndexSet *bookmarks;
@property (nonatomic, strong) NSString *fileName;
@property (nonatomic, strong) NSString *password;
@property (nonatomic, strong) NSURL *fileURL;

+ (CLQPdfReaderDocument *)withDocumentFilePath:(NSString *)filename password:(NSString *)phrase;

+ (CLQPdfReaderDocument *)unarchiveFromFileName:(NSString *)filename password:(NSString *)phrase;

- (id)initWithFilePath:(NSString *)fullFilePath password:(NSString *)phrase;

- (void)saveReaderDocument;

- (void)updateProperties;

@end
