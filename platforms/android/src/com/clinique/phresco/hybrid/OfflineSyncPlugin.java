/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

package com.clinique.phresco.hybrid;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.apache.cordova.CordovaWebView;
import android.annotation.TargetApi;
import android.os.Build;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.photon.phresco.service.LoginService;
import com.photon.phresco.service.SyncBackService;

public class OfflineSyncPlugin extends CordovaPlugin {

	private MainActivity activity;
	private LoginService loginService = new LoginService();
	private SyncBackService syncBackService = new SyncBackService();

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		activity = (MainActivity) cordova.getActivity();
		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";
		try {
			if (action.equals("FirstLaunchSync")) {
				result = firstLaunchSync(args.getString(0), args.getString(1));
			} else if (action.equals("DeltaSync")) {
				result = Utilities
						.buildSuccessResponse(syncBackService.deltaSync(
								new JSONObject(args.getString(0)), activity));
			} else if (action.equals("ManualSync")) {
				result = Utilities
						.buildSuccessResponse(syncBackService.manualSync(
								new JSONObject(args.getString(0)), activity));
			} else if (action.equals("SyncBack")) {
				JSONObject jbj = new JSONObject(args.getString(0));
				int userId = jbj.getInt(Variable.U_ID);
				syncBackService.syncBackAll(userId, activity);
				result = Utilities.buildSuccessResponse(result);
			} else if (action.equals("QuizSync")) {
				JSONObject jbj = new JSONObject(args.getString(0));
				int userId = jbj.getInt(Variable.U_ID);
				syncBackService.syncBackAll(userId, activity);
				result = Utilities.buildSuccessResponse(result);
			} else if (action.equals("ScormSync")) {
				result = Utilities
						.buildSuccessResponse(syncBackService.scormSync(
								new JSONObject(args.getString(0)), activity));
			}
			callbackContext.sendPluginResult(new PluginResult(status, result));
			return true;
		} catch (CliniqueException e) {
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(e.getErrorCode(),
							e.getMessage())));
			return false;
		} catch (Exception e) {
			if(action.equals("ManualSync")){
				this.webView.sendJavascript("progressFailiure("
						+ Utilities.buildErrorResponse(ErrorConstants.ERR_10001,
								e.getLocalizedMessage()) + ");");
			}
			callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(ErrorConstants.ERR_10001,
							e.getMessage())));
			return false;
		}
	}

	private String firstLaunchSync(String userId, String token)
			throws CliniqueException {
		String result = "";
		if (Utilities.hasActiveInternetConnection(activity
				.getApplicationContext())) {
			loginService.firstLaunchSync(activity, Integer.parseInt(userId));
			result = "Sync success";
		} else {
			this.webView.sendJavascript("progressFailiure("
					+ Utilities.buildErrorResponse(ErrorConstants.ERR_10008,
							ErrorConstants.ERR10008) + ");");
		}
		return result;
	}
	

}
