package com.example.pdfwriter;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;

import android.graphics.Bitmap;
import android.graphics.PointF;

import com.artifex.mupdf.MuPDFCore;

/**
 * User: jbruchanov Date: 02/04/2014 Time: 12:36
 */
public class PDFConvertHelper {

	/**
	 * Convert 1 page from pdf file into bitmap
	 * 
	 * @param core
	 * @param page
	 * @return
	 */
	public synchronized static Bitmap convert(MuPDFCore core, int page) {
		PointF size = core.getPageSize(page);
		// round up in case that page doesn't have integers
		Bitmap result = Bitmap.createBitmap((int) (size.x + .5f), (int) (size.y + .5f), core.getBitmapConfig());
		core.drawSinglePage(page, result, 100, 100);
		return result;
	}

	/**
	 * Saves bitmap into jpg file with quality 80.<br/>
	 * Be sure you have proper permissions if you are writing to SDCard
	 * 
	 * @param bitmap
	 * @param file
	 */
	public static void saveBitmap(Bitmap bitmap, String file) throws FileNotFoundException {
		saveBitmap(bitmap, file, 80);
	}

	/**
	 * Saves bitmap into jpg file with quality 80.<br/>
	 * 
	 * @param bitmap
	 * @param file
	 * @param jpegQuality
	 */
	public static void saveBitmap(Bitmap bitmap, String file, int jpegQuality) throws FileNotFoundException {
		bitmap.compress(Bitmap.CompressFormat.JPEG, jpegQuality, new FileOutputStream(file));
	}
}
