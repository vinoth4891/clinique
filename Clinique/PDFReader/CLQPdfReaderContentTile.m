//
//  PDFReaderContentTile.m
//  SamplePSPDFViewer
//
//  Created by BRINDHA_S on 15/07/14.
//  Copyright (c) 2014 BRINDHA_S. All rights reserved.
//

#import "CLQPdfReaderContentTile.h"

@implementation CLQPdfReaderContentTile

#pragma mark Constants

#define LEVELS_OF_DETAIL 16

#pragma mark ReaderContentTile class methods

+ (CFTimeInterval)fadeDuration
{
	return 0.001; // iOS bug (flickering tiles) workaround
}

#pragma mark ReaderContentTile instance methods

- (id)init
{
	if ((self = [super init]))
	{
		self.levelsOfDetail = LEVELS_OF_DETAIL; // Zoom levels

		self.levelsOfDetailBias = (LEVELS_OF_DETAIL - 1); // Bias

		UIScreen *mainScreen = [UIScreen mainScreen]; // Main screen

		CGFloat screenScale = [mainScreen scale]; // Main screen scale

		CGRect screenBounds = [mainScreen bounds]; // Main screen bounds

		CGFloat w_pixels = (screenBounds.size.width * screenScale);

		CGFloat h_pixels = (screenBounds.size.height * screenScale);

		CGFloat max = ((w_pixels < h_pixels) ? h_pixels : w_pixels);

		CGFloat sizeOfTiles = ((max < 512.0f) ? 512.0f : 1024.0f);

		self.tileSize = CGSizeMake(sizeOfTiles, sizeOfTiles);
	}

	return self;
}

@end
