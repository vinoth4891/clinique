package com.artifex.mupdf;

import android.app.Activity;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;

import com.clinique.phresco.hybrid.R;

public class MuPlayerActivity extends Activity implements
android.view.View.OnClickListener {

	private WebView webView;
	private Button btnClose;

	/*@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		setContentView(R.layout.activity_player);
	}
	 */
	public void onCreate(Bundle savedInstanceState) {
		String manifestURL = "";
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_player);

		webView = (WebView) findViewById(R.id.webView1);
		btnClose = (Button) findViewById(R.id.button1);
		btnClose.setOnClickListener(this);

		WebSettings webSettings = webView.getSettings();
		webSettings.setDomStorageEnabled(true);
		webSettings.setJavaScriptEnabled(true);
		webSettings.setPluginState(WebSettings.PluginState.ON);
		webSettings.setAppCacheEnabled(false);
		webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
		webSettings.setUseWideViewPort(true);
		webSettings.setLoadWithOverviewMode(true);
		webSettings.setBuiltInZoomControls(true);
		webSettings.setSupportZoom(true);
		//webSettings.setDefaultZoom(WebSettings.ZoomDensity.FAR);
		webSettings.setDatabaseEnabled(true);
		webSettings.setDatabasePath("/data/data/"
				+ webView.getContext().getPackageName() + "/databases/");
		
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			android.webkit.WebView.setWebContentsDebuggingEnabled(true);
		}
		/*
		 * Intent intent = getIntent(); if
		 * (Intent.ACTION_VIEW.equals(intent.getAction())) { manifestURL =
		 * intent.getStringExtra("manifestURL"); }
		 */
		if(savedInstanceState == null){
			String customHtml = "file:///android_asset/www/html/player.html";
			webView.loadUrl(customHtml);
		}else
		{
			webView.restoreState(savedInstanceState);
		}

	}

	@Override
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onRestoreInstanceState(savedInstanceState);
		webView.restoreState(savedInstanceState);
	}

	@Override
	protected void onSaveInstanceState(Bundle outState) {
		// TODO Auto-generated method stub
		super.onSaveInstanceState(outState);

		webView.saveState(outState);
	}

	@Override
	public void onClick(View v) {
		finish();
	}

}
