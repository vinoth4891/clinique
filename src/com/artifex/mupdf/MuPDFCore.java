package com.artifex.mupdf;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PointF;
import android.graphics.RectF;

public class MuPDFCore {
	/* load our native library */
	static {
		System.loadLibrary("mupdf");
	}

	/* Readable members */
	private int		pageNum		= -1;	;
	private int		numPages	= -1;
	public float	pageWidth;
	public float	pageHeight;

	/* The native functions */
	private static native int openFile(String filename);

	private static native int countPagesInternal();

	private static native void gotoPageInternal(int localActionPageNum);

	private static native float getPageWidth();

	private static native float getPageHeight();

	private final int	displayPages	= 1;

	public static native void drawPage(Bitmap bitmap, int pageW, int pageH, int patchX, int patchY, int patchW, int patchH);

	public static native RectF[] searchPage(String text);

	public static native int getPageLink(int page, float x, float y);

	public static native LinkInfo[] getPageLinksInternal(int page);

	public static native OutlineItem[] getOutlineInternal();

	public static native boolean hasOutlineInternal();

	public static native boolean needsPasswordInternal();

	public static native boolean authenticatePasswordInternal(String password);

	public static native void destroying();

	public MuPDFCore(String filename) throws Exception {
		if (openFile(filename) <= 0) {
			throw new Exception("Failed to open " + filename);
		}
	}

	public int countPages() {
		if (numPages < 0) {
			numPages = countPagesSynchronized();
		}

		return numPages;
	}

	private synchronized int countPagesSynchronized() {
		return countPagesInternal();
	}

	/* Shim function */
	public void gotoPage(int page) {
		if (page > numPages - 1) {
			page = numPages - 1;
		} else if (page < 0) {
			page = 0;
		}
		if (this.pageNum == page) {
			return;
		}
		gotoPageInternal(page);
		this.pageNum = page;
		this.pageWidth = getPageWidth();
		this.pageHeight = getPageHeight();
	}

	public synchronized PointF getPageSize(int page) {
		gotoPage(page);
		return new PointF(pageWidth, pageHeight);
	}

	public synchronized void onDestroy() {
		destroying();
	}

	public synchronized void drawPage(int page, Bitmap bitmap, int pageW, int pageH, int patchX, int patchY, int patchW, int patchH) {
		gotoPage(page);
		drawPage(bitmap, pageW, pageH, patchX, patchY, patchW, patchH);
	}

	public synchronized int hitLinkPage(int page, float x, float y) {
		return getPageLink(page, x, y);
	}

	public synchronized LinkInfo[] getPageLinks(int page) {
		return getPageLinksInternal(page);
	}

	public synchronized RectF[] searchPage(int page, String text) {
		gotoPage(page);
		return searchPage(text);
	}

	public synchronized boolean hasOutline() {
		return hasOutlineInternal();
	}

	public synchronized OutlineItem[] getOutline() {
		return getOutlineInternal();
	}

	public synchronized boolean needsPassword() {
		return needsPasswordInternal();
	}

	public synchronized boolean authenticatePassword(String password) {
		return authenticatePasswordInternal(password);
	}

	public Config getBitmapConfig() {
		return Config.ARGB_8888;
	}

	public synchronized void drawSinglePage(int page, Bitmap bitmap, int pageW, int pageH) {
		drawPageSynchronized(page, bitmap, pageW, pageH, 0, 0, pageW, pageH);
	}

	public synchronized void drawPageSynchronized(int page, Bitmap bitmap, int pageW, int pageH, int patchX, int patchY, int patchW, int patchH) {
		gotoPage(page);
		drawPage(bitmap, pageW, pageH, patchX, patchY, patchW, patchH);
	}

	public synchronized void drawPageSynchrinized(int page, Bitmap bitmap, int pageW, int pageH, int patchX, int patchY, int patchW, int patchH) {
		gotoPage(page);
		drawPage(bitmap, pageW, pageH, patchX, patchY, patchW, patchH);
	}

	public synchronized Bitmap drawPage(final int page, int pageW, int pageH, int patchX, int patchY, int patchW, int patchH) {

		Canvas canvas = null;
		Bitmap bitmap = null;
		try {
			bitmap = Bitmap.createBitmap(patchW, patchH, Config.ARGB_8888);
			canvas = new Canvas(bitmap);
			canvas.drawColor(Color.TRANSPARENT);

			// If we have only one page (portrait), or if is the first, we show
			// only one page (centered).
			if (displayPages == 1 || page == 0) {
				gotoPage(page);
				drawPage(bitmap, pageW, pageH, patchX, patchY, patchW, patchH);
				return bitmap;
				// If we are on two pages mode (landscape), and at the last
				// page, we show only one page (centered).
			} else if (displayPages == 2 && page == numPages / 2) {
				gotoPage(page * 2 + 1); // need to multiply per 2, because page
										// counting is being divided by 2
										// (landscape mode)
				drawPage(bitmap, pageW, pageH, patchX, patchY, patchW, patchH);
				return bitmap;
			} else {
				final int drawPage = (page == 0) ? 0 : page * 2 - 1;
				int leftPageW = pageW / 2;
				int rightPageW = pageW - leftPageW;

				// If patch overlaps both bitmaps (left and right) - return the
				// width of overlapping left bitpam part of the patch
				// or return full patch width if it's fully inside left bitmap
				int leftBmWidth = Math.min(leftPageW, leftPageW - patchX);

				// set left Bitmap width to zero if patch is fully overlay right
				// Bitmap
				leftBmWidth = (leftBmWidth < 0) ? 0 : leftBmWidth;

				// set the right part of the patch width, as a rest of the patch
				int rightBmWidth = patchW - leftBmWidth;

				if (drawPage == numPages - 1) {
					// draw only left page
					canvas.drawColor(Color.BLACK);
					if (leftBmWidth > 0) {
						Bitmap leftBm = Bitmap.createBitmap(leftBmWidth, patchH, getBitmapConfig());
						gotoPage(drawPage);
						drawPage(leftBm, leftPageW, pageH, (leftBmWidth == 0) ? patchX - leftPageW : 0, patchY, leftBmWidth, patchH);
						Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);
						canvas.drawBitmap(leftBm, 0, 0, paint);
						leftBm.recycle();
					}
				} else if (drawPage == 0) {
					// draw only right page
					canvas.drawColor(Color.BLACK);
					if (rightBmWidth > 0) {
						Bitmap rightBm = Bitmap.createBitmap(rightBmWidth, patchH, getBitmapConfig());
						gotoPage(drawPage);
						drawPage(rightBm, rightPageW, pageH, (leftBmWidth == 0) ? patchX - leftPageW : 0, patchY, rightBmWidth, patchH);
						Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);
						canvas.drawBitmap(rightBm, leftBmWidth, 0, paint);
						rightBm.recycle();
					}
				} else {
					// Need to draw two pages one by one: left and right
					// Log.d("bitmap width", "" + bitmap.getWidth());
					// canvas.drawColor(Color.BLACK);
					Paint paint = new Paint(Paint.FILTER_BITMAP_FLAG);
					if (leftBmWidth > 0) {
						Bitmap leftBm = Bitmap.createBitmap(leftBmWidth, patchH, getBitmapConfig());
						gotoPage(drawPage);
						drawPage(leftBm, leftPageW, pageH, patchX, patchY, leftBmWidth, patchH);
						canvas.drawBitmap(leftBm, 0, 0, paint);
						leftBm.recycle();
					}
					if (rightBmWidth > 0) {
						Bitmap rightBm = Bitmap.createBitmap(rightBmWidth, patchH, getBitmapConfig());
						gotoPage(drawPage + 1);
						drawPage(rightBm, rightPageW, pageH, (leftBmWidth == 0) ? patchX - leftPageW : 0, patchY, rightBmWidth, patchH);

						canvas.drawBitmap(rightBm, leftBmWidth, 0, paint);
						rightBm.recycle();
					}

				}
				return bitmap;
			}
		} catch (OutOfMemoryError e) {
			if (canvas != null) {
				canvas.drawColor(Color.TRANSPARENT);
			}
			return bitmap;
		}
	}

}
