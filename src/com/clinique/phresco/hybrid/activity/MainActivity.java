/*
 * ###
 * Archetype - phresco-android-hybrid-archetype
 * 
 * Copyright (C) 1999 - 2012 Photon Infotech Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ###
 */
package com.clinique.phresco.hybrid.activity;

import java.util.Timer;

import org.apache.cordova.DroidGap;

import android.annotation.SuppressLint;
import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.view.Window;

public class MainActivity extends DroidGap {
	public static Context context;
	public static CliniqueDBStore dbStore;
	public static Timer timer;
	public static String userId;
	ProgressDialog dialog;

	/** Called when the activity is first created. */

	@SuppressLint("NewApi")
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			android.webkit.WebView.setWebContentsDebuggingEnabled(true);
		}
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		context = MainActivity.this;
		dbStore = new CliniqueDBStore(getApplicationContext());
		super.loadUrl("file:///android_asset/www/html/index.html", 2000);

	}

}