package com.clinique.phresco.hybrid;

import java.io.File;

import android.app.Dialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import com.JSONparser.Utilities;
import com.clinique.phresco.hybrid.R;

public class Reciever extends BroadcastReceiver {
	Dialog	dialog	= null;

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.e("-->", "onReciver");
		DownloadManager downloadManager = (DownloadManager) context.getSystemService(context.DOWNLOAD_SERVICE);
		Bundle extras = intent.getExtras();
		DownloadManager.Query q = new DownloadManager.Query();
		q.setFilterById(extras.getLong(DownloadManager.EXTRA_DOWNLOAD_ID));
		Cursor c = downloadManager.query(q);
		// int resultCode =
		// extras.getInt(DownloadManager.ACTION_DOWNLOAD_COMPLETE);

		String action = intent.getAction();
		if (DownloadManager.ACTION_DOWNLOAD_COMPLETE.equals(action)) {
			Log.e("sfsdf", "downloaded");
		}

		if (c.moveToFirst()) {

			int status = c.getInt(c.getColumnIndex(DownloadManager.COLUMN_STATUS));
			// String path =
			// c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_URI));
			if (status == DownloadManager.STATUS_SUCCESSFUL) {
				String title = c.getString(c.getColumnIndex(DownloadManager.COLUMN_LOCAL_FILENAME));
				File file = new File(title);
				if (file.exists() && title.endsWith("csv")) {

					try {
						Intent intentPDF = new Intent(Intent.ACTION_VIEW);
						intentPDF.setDataAndType(Uri.fromFile(file), "text/csv");
						intentPDF.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
						context.startActivity(intentPDF);
						Log.e("-->", "try");
					} catch (Exception e) {
						Utilities.AlertView(context, context.getResources().getString(R.string.csvMSG));
						// "File is Located in \""
						// +
						// path
						// +
						// "\"");
					}
				} else if (file.exists() && title.endsWith("pdf")) {
					try {
						Intent intentPDF = new Intent(Intent.ACTION_VIEW);
						intentPDF.setDataAndType(Uri.fromFile(file), "application/pdf");
						intentPDF.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
						context.startActivity(intentPDF);
					} catch (Exception e) {
						// e.printStackTrace();
						Utilities.AlertView(context, context.getResources().getString(R.string.pdfMSG));// "File is Located in \""
						// +
						// path
						// +
						// "\"");
					}
				}
			}

		}
		c.close();
	}

}
