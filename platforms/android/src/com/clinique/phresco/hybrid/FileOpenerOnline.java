/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

package com.clinique.phresco.hybrid;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Locale;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.Log;

import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.artifex.mupdf.MuPDFOnlineActivity;

public class FileOpenerOnline extends CordovaPlugin {

	boolean	isValid		= false;
	String	filename	= null;

	class FetchPDF extends AsyncTask<Void, Void, Void> {

		ProgressDialog	loading	= null;

		@Override
		protected Void doInBackground(Void... params) {
			if (PDFurl != "") {
				int count;
				try {
					
					Log.e("param", PDFurl);
					URL url = new URL(PDFurl);

					URLConnection conection = url.openConnection();
					conection.connect();
					int lenghtOfFile = conection.getContentLength();
					if (lenghtOfFile > 1000) {
						isValid = true;
						InputStream input = new BufferedInputStream(url.openStream(), 8192);
						OutputStream output = new FileOutputStream(FileName);
						byte data[] = new byte[1024];
						long total = 0;
						while ((count = input.read(data)) != -1) {
							total += count;
							// publishProgress(""+(int)((total*100)/lenghtOfFile));
							output.write(data, 0, count);
						}
						output.flush();
						output.close();
						input.close();
					}

				} catch (Exception e) {
					Log.e("Error: ", e.getMessage());
				}
			} else {
				Log.e("Else: ", "PDF url empty");
			}
			return null;
		}

		@Override
		protected void onPostExecute(Void file_url) {

			if (isValid) {
				Uri uri = Uri.parse(FileName);
				Context context = cordova.getActivity().getApplicationContext();
				Intent intent = new Intent(context, MuPDFOnlineActivity.class);
				intent.setAction(Intent.ACTION_VIEW);
				intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				intent.setData(uri);
				// intent.putExtra(Variable.C_ID, cid);
				// intent.putExtra(Variable.U_ID, uid);
				intent.putExtra(Variable.MODULE_ID, ModuleID);
				intent.putExtra(Variable.PDF_TOKEN, PDFToken);
				intent.putExtra(Variable.PDF_URL, PDFurl);
				intent.putExtra(Variable.LANGUAGE, Language);
				intent.putExtra(Variable.BASE_URL, BaseURL);
				context.startActivity(intent);
			} else {
				count = 0;
				Utilities.AlertView(cordova.getActivity(), "Not a valid PDF file");
			}
		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();

		}

	}

	String				storagePath		= Environment.getExternalStorageDirectory().toString();
	String				Path			= "Cliniques";
	String				ModuleID		= "";
	String				timemodified	= "";
	String				timecreated		= "";
	// String uid = "";
	// String cid = "";
	String				PDFurl			= "";
	String				FileName		= "";
	String				PDFToken		= "";
	String				Language		= "";
	String				BaseURL			= "";
	String				filePath		= "";
	String				language		= "";
	String				isFav			= "";
	public static int	count			= 0;
	DownloadManager		downloadManager;

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";
		MainActivity.context = this.cordova.getActivity().getApplicationContext();
		try {
			if (action.equals("openFile")) {
				openFile(args.getString(0));
			} else if (action.equals("openVideoFile")) {
				openVideoFile(args.getString(0));
			} else if (action.equals("openCSVFile")) {
				openCSVFile(args.getString(0));
			} else {
				status = PluginResult.Status.INVALID_ACTION;

			}
			callbackContext.sendPluginResult(new PluginResult(status, result));
			return true;
		} catch (JSONException e) {
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
		    return false;
		} catch (IOException e) {
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
			return false;
		}
	}

	private void folderCreation() {
		checkForStorage();

		Log.e("name", "isFave" + isFav);

		FileName = storagePath + "/" + Path + "/" + ModuleID + "/" + timemodified + ".pdf";

		File parentDirectory = new File(storagePath, "Cliniques");
		if (!parentDirectory.exists()) {
			parentDirectory.mkdirs();
			parentDirectory = new File(storagePath + "/" + Path, ModuleID);
			parentDirectory.mkdir();
			new FetchPDF().execute();

		} else {
			File myDirectory = new File(storagePath + "/" + Path, ModuleID);
			if (!myDirectory.exists()) {
				myDirectory.mkdirs();
				new FetchPDF().execute();

			} else {

				File myFile = new File(FileName);
				if (myFile.exists()) {
					Uri uri = Uri.parse(FileName);
					Context context = cordova.getActivity().getApplicationContext();
					Intent intent = new Intent(context, MuPDFOnlineActivity.class);
					intent.setAction(Intent.ACTION_VIEW);
					intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
					intent.setData(uri);
					intent.putExtra(Variable.MODULE_ID, ModuleID);
					intent.putExtra(Variable.PDF_TOKEN, PDFToken);
					intent.putExtra(Variable.PDF_URL, PDFurl);
					intent.putExtra(Variable.LANGUAGE, Language);
					intent.putExtra(Variable.BASE_URL, BaseURL);
					context.startActivity(intent);
				} else {
					String[] flist = myDirectory.list();
					for (int i = 0; i < flist.length; i++) {
						System.out.println(" " + myDirectory.getAbsolutePath());
						File temp = new File(myDirectory.getAbsolutePath() + "/" + flist[i]);
						temp.delete();
					}
					new FetchPDF().execute();
				}
			}
		}
	}

	private void folderCreationForFav() {
		checkForStorage();

		Log.e("name", "isFave" + isFav);

		FileName = storagePath + "/" + Path + "/" + ModuleID + "/Favourite.pdf";

		File myDirectory = new File(storagePath + "/" + Path, ModuleID);
		Log.e("name", "isFave");
		if (myDirectory.exists()) {
			Log.e("name", "isFave" + "exists");
			for (File f : myDirectory.listFiles()) {
				if (f.isFile()) {
					Log.e("name", f.getAbsoluteFile() + "");
					Uri uri = Uri.parse(f.getAbsoluteFile().toString());
					Context context = cordova.getActivity().getApplicationContext();
					Intent intent = new Intent(context, MuPDFOnlineActivity.class);
					intent.setAction(Intent.ACTION_VIEW);
					intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
					intent.setData(uri);
					intent.putExtra(Variable.MODULE_ID, ModuleID);
					intent.putExtra(Variable.PDF_TOKEN, PDFToken);
					intent.putExtra(Variable.PDF_URL, PDFurl);
					intent.putExtra(Variable.LANGUAGE, Language);
					intent.putExtra(Variable.BASE_URL, BaseURL);
					context.startActivity(intent);
				}
				else{
					new FetchPDF().execute();
				}				
			}
			if(myDirectory.listFiles().length==0){
				new FetchPDF().execute();
			}
		} else {
			myDirectory.mkdir();
			new FetchPDF().execute();
		}
	}

	@SuppressLint("NewApi")
	void checkForStorage() {
		String state = Environment.getExternalStorageState();

		if (Environment.MEDIA_MOUNTED.equals(state)) {
			storagePath = Environment.getExternalStorageDirectory().toString();
		} else if (Environment.isExternalStorageEmulated()) {
			storagePath = Environment.getExternalStorageDirectory().toString();
		} else {
			storagePath = cordova.getActivity().getApplicationContext().getFilesDir().toString();
		}
	}

	private void openFile(String param) {
		Log.e("param", param);
		//if (count == 0) {
			count = 1;
			Log.e("param---->", param);
			try {
				JSONObject object = new JSONObject(param);
				ModuleID = object.getString("modID");
				timemodified = object.getString("timemodified");
				// cid = object.getString("courseID");
				// uid = object.getString("userID");
				PDFurl = object.getString("pdfURL");
				PDFToken = object.getString("pdfToken");
				Language = object.getString("language");
				BaseURL = object.getString("serviceURl");
				isFav = object.getString("isFavour");

				Log.e("param---->", isFav);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			if (isFav.equals("true")) {
				folderCreationForFav();
			} else {
				folderCreation();

			}

		//}

	}

	@SuppressLint("NewApi")
	private void openCSVFile(String url) throws IOException {
		try {
			JSONObject object = new JSONObject(url);
			filePath = object.getString("filePath");
			filePath = filePath.replace(" ", "%20");
			Log.e("Download_Uri", filePath);
			language = object.getString("language");
			settingLanguage(language, cordova.getActivity().getApplicationContext());
		} catch (JSONException e) {
			e.printStackTrace();
		}
		if (Utilities.isNetworkAvailable(cordova.getActivity().getApplicationContext())) {
			downloadManager = (DownloadManager) cordova.getActivity().getApplicationContext().getSystemService(cordova.getActivity().getApplicationContext().DOWNLOAD_SERVICE);
			Uri Download_Uri = Uri.parse(filePath);
			DownloadManager.Request request = new DownloadManager.Request(Download_Uri);
			request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
			request.setAllowedOverRoaming(false);
			request.setTitle("Clinique");
			request.setDescription("Clinique Export Document");
			String state = Environment.getExternalStorageState();
			if (Environment.MEDIA_MOUNTED.equals(state)) {
				request.setDestinationInExternalPublicDir("/Clinique", "Clinique_Export_Document.csv");
				// request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
				downloadManager.enqueue(request);
			}
		} else {
			Utilities.AlertView(cordova.getActivity());

		}
	}

	void settingLanguage(String lang, Context context) {
		try {
			if (lang != null || lang != "" || lang != "en_us") {
				if (lang.contains("_")) {
					String[] split = lang.split("_");
					lang = split[0] + "-r" + split[1].toUpperCase();
				}
				Locale myLocale = null;
				if (lang.equals("zh-rCN")) {
					myLocale = Locale.SIMPLIFIED_CHINESE;
				} else if (lang.equals("zh-rTW")) {
					myLocale = Locale.TRADITIONAL_CHINESE;
				} else {
					myLocale = new Locale(lang);
				}
				Locale.setDefault(myLocale);
				Configuration config = new Configuration();
				config.locale = myLocale;
				context.getResources().updateConfiguration(config, context.getResources().getDisplayMetrics());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void openVideoFile(String url) throws IOException {
		// Create URI
		Uri uri = Uri.parse(url);

		Intent intent = null;
		// Check what kind of file you are trying to open, by comparing the url
		// with extensions.
		// When the if condition is matched, plugin sets the correct intent
		// (mime) type,
		// so Android knew what application to use to open the file

		if (url.contains(".doc") || url.contains(".docx")) {
			// Word document
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/msword");
		} else if (url.contains(".pdf")) {
			// PDF file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/pdf");
		} else if (url.contains(".ppt") || url.contains(".pptx")) {
			// Powerpoint file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/vnd.ms-powerpoint");
		} else if (url.contains(".xls") || url.contains(".xlsx")) {
			// Excel file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/vnd.ms-excel");
		} else if (url.contains(".rtf")) {
			// RTF file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/rtf");
		} else if (url.contains(".wav")) {
			// WAV audio file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "audio/x-wav");
		} else if (url.contains(".gif")) {
			// GIF file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "image/gif");
		} else if (url.contains(".jpg") || url.contains(".jpeg")) {
			// JPG file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "image/jpeg");
		} else if (url.contains(".txt")) {
			// Text file
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "text/plain");
		} else if (url.contains(".mpg") || url.contains(".mpeg") || url.contains(".mpe") || url.contains(".mp4") || url.contains(".avi")) {
			// Video files
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "video/*");
		}

		// if you want you can also define the intent type for any other file

		// additionally use else clause below, to manage other unknown
		// extensions
		// in this case, Android will show all applications installed on the
		// device
		// so you can choose which application to use

		else {
			intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "*/*");
		}

		this.cordova.getActivity().startActivity(intent);
	}

}
