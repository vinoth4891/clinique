/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

package com.clinique.phresco.hybrid.activity;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Log;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.JSONParser;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.photon.phresco.model.User;
import com.photon.phresco.service.HourlyTask;
import com.photon.phresco.service.LoginService;

public class LoginPlugin extends Plugin {

	private LoginService loginService = new LoginService();
	private JSONObject jbj;
	private OfflineStore offlineStore = new OfflineStore();
	private MainActivity activity;

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		Log.d("execute---->", action);
		activity = (MainActivity) cordova.getActivity();
		PluginResult.Status status = PluginResult.Status.OK;

		String result = "";
		try {
			if (action.equals("login")) {
				result = loginAuthenticate(args.getString(0));
			} else if (action.equals("core_course_get_categories")) {
				result = loginService.getCategories(new JSONObject(args
						.getString(0)));
			} else if (action.equals("core_enrol_get_users_courses_subcat")) {
				result = loginService.getCoursesData(new JSONObject(args
						.getString(0)));
			} else if (action.equals("core_course_get_contents")) {
				result = loginService.getTopicsData(new JSONObject(args
						.getString(0)));
			} else if (action.equals("secure_details")) {
				result = loginService.getSecureDetails(
						new JSONObject(args.getString(0)), activity);
			}else if (action.equals("logout")) {
				if(MainActivity.timer!=null){
					Log.d("logout==>", "" + jbj);
					MainActivity.timer.cancel();
					MainActivity.userId ="0";
				}
			}
			return new PluginResult(status, result);
		} catch (CliniqueException e) {
			return new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(e.getErrorCode(),
							e.getMessage()));
		} catch (Exception e) {
			return new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(ErrorConstants.ERR_10001,
							e.getMessage()));
		}
	}

	public String loginAuthenticate(String jsonParam) throws CliniqueException {
		Log.d("jsonParam---->", jsonParam);
		User user = new User();
		try {
			JSONObject object = new JSONObject(jsonParam);
			user.setUsername(object.getString("username"));
			user.setPassword(object.getString("password"));
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				jbj = loginService.validateLogin(user);
				Log.d("loginAuthenticate==>", "" + jbj);
				if (jbj == null
						|| (jbj.opt("error") != null && !"null".equals(jbj
								.getString("error")))) {
					throw new CliniqueException(ErrorConstants.ERR_10002,
							ErrorConstants.ERR10002);
				}
				JSONObject userObject = jbj.getJSONObject("USER");
				user = offlineStore.getUser(userObject.getInt("id"));
				user.setUsername(object.getString("username"));
				user.setPassword(object.getString("password"));
				user.setPass(object.getString("password"));
				user.setUserId(userObject.getInt("id"));
				user.setToken(userObject.getString("token"));
				JSONObject offlineJson = new JSONObject();
				offlineJson.put("user", userObject);
				user.setOfflineJson(offlineJson.toString());
				offlineStore.upsertUser(user);
				jbj = offlineJson;
				jbj.put("FIRST_TIME_USER", user.getFirstTime() == 0 ? "Y" : "N");
				Log.d("loginAuthenticate==>", "" + jbj);
			} else {
				jbj = offlineStore.validateLogin(jsonParam);

				Log.d("loginAuthenticate==>", "" + jbj);
				if (jbj == null) {
					throw new CliniqueException(ErrorConstants.ERR_10004,
							ErrorConstants.ERR10004);
				}
				object = jbj.getJSONObject("user");
				user = offlineStore.getUser(object.getInt("id"));
				jbj.put("FIRST_TIME_USER", user.getFirstTime() == 0 ? "Y" : "N");
			}
			if (user.getFirstTime() != 0
					&& (MainActivity.timer == null || !(user.getUserId() + "")
							.equals(MainActivity.userId))) {
				if(MainActivity.timer!=null){
					MainActivity.timer.cancel();
				}
				MainActivity.timer = new Timer();
				HourlyTask task = new HourlyTask();
				task.setUserId(user.getUserId());
				task.setActivity(activity);
				MainActivity.userId = user.getUserId() + "";
				MainActivity.timer.schedule(task, 3600000, 3600000);// Every one hour and start one hour delay - 3600000 ms
			}
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(e.getErrorCode(), e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10002,
					ErrorConstants.ERR10002);
		}

		return jbj.toString();
	}

}
