package com.JSONparser;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Environment;
import android.os.StatFs;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.clinique.phresco.hybrid.activity.MainActivity;
import com.clinique.phresco.hybrid.R;

public class Utilities {

	public static void AlertView(Context context) {
		final Dialog pgDialog = new Dialog(context);
		pgDialog.setTitle("Clinique");
		pgDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
		pgDialog.setContentView(R.layout.inflate_alert);
		pgDialog.getWindow().setBackgroundDrawable(
				new ColorDrawable(Color.argb(0, 0, 0, 0)));
		Button pgDone = (Button) pgDialog.findViewById(R.id.btnOk);
		((TextView) pgDialog.findViewById(R.id.txtMessage)).setText(context
				.getResources().getString(R.string.chk_internet_conec));
		pgDone.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				pgDialog.cancel();

			}
		});
		pgDialog.setCancelable(false);
		pgDialog.show();
	}

	public static Dialog AlertView(Context context, String msg) {
		final Dialog pgDialog = new Dialog(context);
		pgDialog.setTitle("Clinique");
		pgDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
		pgDialog.setContentView(R.layout.inflate_alert);
		pgDialog.getWindow().setBackgroundDrawable(
				new ColorDrawable(Color.argb(0, 0, 0, 0)));
		Button pgDone = (Button) pgDialog.findViewById(R.id.btnOk);
		((TextView) pgDialog.findViewById(R.id.txtMessage)).setText(msg);
		pgDone.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				pgDialog.cancel();

			}
		});
		pgDialog.setCancelable(false);
		pgDialog.show();
		return pgDialog;
	}

	public static boolean hasActiveInternetConnection(Context context) {

		try {
			if (isNetworkAvailable(context)) {
				/*HttpURLConnection urlc = (HttpURLConnection) (new URL(
						"http://www.google.com").openConnection());
				urlc.setRequestProperty("User-Agent", "Test");
				urlc.setRequestProperty("Connection", "close");
				urlc.setConnectTimeout(1500);
				urlc.connect();*/
				return true;//(urlc.getResponseCode() == 200);
			} else {
				Log.d("CLinique", "No network available!");
			}
		} catch (Exception e) {
			Log.e("CLinique", "Error checking internet connection", e);
			return false;
		}

		return false;
	}

	public static boolean isNetworkAvailable(Context context) {
		ConnectivityManager connectivityManager = (ConnectivityManager) context
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo activeNetworkInfo = connectivityManager
				.getActiveNetworkInfo();
		return (activeNetworkInfo != null && activeNetworkInfo.isAvailable() && activeNetworkInfo.isConnected());
	}

	public static String computeMD5Hash(String password) {
		String result = "";

		try {
			Log.e("pass:",password);
			// Create MD5 Hash
			MessageDigest digest = java.security.MessageDigest
					.getInstance("MD5");
			digest.update(password.getBytes());
			byte messageDigest[] = digest.digest();

			StringBuilder MD5Hash = new StringBuilder();
			for (int i = 0; i < messageDigest.length; i++) {
				String h = Integer.toHexString(0xFF & messageDigest[i]);
				while (h.length() < 2)
					h = "0" + h;
				MD5Hash.append(h);
			}

			result = MD5Hash.toString();
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return result;
	}

	public static String buildErrorResponse(String errorCode, String message) {
		JSONObject json = new JSONObject();
		try {
			json.put("error", true);
			json.put("errorCode", errorCode);
			json.put("message", message);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return json.toString();

	}

	public static String buildSuccessResponse(String data) throws JSONException {
		JSONObject json = new JSONObject();
		json.put("error", false);
		json.put("msg", "done");
		try {
			if (!"".equals(data)) {
				json.put("response", new JSONObject(data));
			}
		} catch (JSONException e) {
			//e.printStackTrace();
			try {
			json.put("response", new JSONArray(data));
			}catch (Exception e1) {
				//e1.printStackTrace();
			}
		}
		Log.d("offline-->Response-->", json.toString());
		return json.toString();

	}

	public static List<String> htmlImageParsing(String html) {
		List<String> urls = new ArrayList<String>();
		String imageTag = "";
		while (html.toLowerCase().contains("<img")) {
			imageTag = html.substring(
					html.toLowerCase().indexOf("src=\"") + 5,
					html.toLowerCase().indexOf("\"",
							html.toLowerCase().indexOf("src=\"") + 5));
			html = html.substring(html.toLowerCase().indexOf("src=\"") + 5
					+ imageTag.length() + 2, html.length());
			urls.add(imageTag);
		}
		return urls;
	}

	public static void makeDirectories(String path) {
		/*File dbfile = new File(path);
		if (!dbfile.exists()) {
		    dbfile.getParentFile().mkdirs();
		}*/

		StringBuilder folderBuff = new StringBuilder();
		String[] folders = path.split("/");
		for (String currentFolder : folders) {
			if (!"".equals(currentFolder)) {
				// Log.d("currentFolder:", "/" + currentFolder);
				folderBuff.append("/" + currentFolder);
				File rootPath = new File(folderBuff.toString());
				if (!rootPath.exists()) {
					rootPath.mkdirs();
				}
				// Log.d("folderBuff:", folderBuff.toString());
			}
		}	
	}

	public static void copy(Context context, String src, String dst) {
		try {
			if(src.indexOf("file:///")!=-1){
				src = src.substring(6);
			}
			InputStream in = new FileInputStream(src);
			OutputStream out = new FileOutputStream(dst);
			// Transfer bytes from in to out
			byte[] buf = new byte[1024];
			int len;
			while ((len = in.read(buf)) > 0) {
				out.write(buf, 0, len);
			}
			in.close();
			out.close();
		} catch (IOException io) {
			io.printStackTrace();
			// Toast.makeText(context, "Error: " + io,
			// Toast.LENGTH_LONG).show();
		}
	}

	public static long currentTime() {
		return System.currentTimeMillis() / 1000;
	}

	public static void unzip(String zipFile, String targetDirectory)
			throws IOException {
		ZipInputStream zis = new ZipInputStream(new BufferedInputStream(
				new FileInputStream(new File(zipFile))));
		try {
			ZipEntry ze;
			int count;
			byte[] buffer = new byte[8192];
			while ((ze = zis.getNextEntry()) != null) {
				File file = new File(targetDirectory, ze.getName());
				File dir = ze.isDirectory() ? file : file.getParentFile();
				if (!dir.isDirectory() && !dir.mkdirs())
					throw new FileNotFoundException(
							"Failed to ensure directory: "
									+ dir.getAbsolutePath());
				if (ze.isDirectory())
					continue;
				FileOutputStream fout = new FileOutputStream(file);
				try {
					while ((count = zis.read(buffer)) != -1)
						fout.write(buffer, 0, count);
				} finally {
					fout.close();
				}
			}
		} finally {
			zis.close();
		}
	}

	public static boolean deleteDirectory(File file) {
		File[] files = file.listFiles();
		if (files != null)
			for (File f : files)
				deleteDirectory(f);
		return file.delete();
	}

	public static boolean deleteFile(String strPath) {

		File file = new File(strPath);
		boolean deleted = file.delete();

		return deleted;
	}

	public static long getAvailableSpaceInMB() {
		final long SIZE_KB = 1024L;
		final long SIZE_MB = SIZE_KB * SIZE_KB;
		long availableSpace = -1L;
		StatFs stat = new StatFs(Environment.getExternalStorageDirectory()
				.getPath());
		availableSpace = stat.getAvailableBlocksLong()
				* stat.getBlockSizeLong();
		return availableSpace / SIZE_MB;
	}

	public static double getAvailableSpaceInGB() {
		final long SIZE_KB = 1024L;
		final long SIZE_GB = SIZE_KB * SIZE_KB * SIZE_KB;
		long availableSpace = -1L;
		StatFs stat = new StatFs(Environment.getExternalStorageDirectory()
				.getPath());
		availableSpace = stat.getAvailableBlocksLong()
				* stat.getBlockSizeLong();
		return availableSpace / SIZE_GB;
	}
}
