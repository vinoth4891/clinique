package com.photon.phresco.service;

import java.util.Date;
import java.util.TimerTask;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.util.Log;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.clinique.phresco.hybrid.activity.OfflineStore;
import com.photon.phresco.model.User;

public class HourlyTask extends TimerTask {
	private OfflineStore offlineStore = new OfflineStore();
	private LoginService loginService = new LoginService();

	SyncBackService service = new SyncBackService();
	private int userId;
	private Activity activity;

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public Activity getActivity() {
		return activity;
	}

	public void setActivity(Activity activity) {
		this.activity = activity;
	}

	@Override
	public void run() {
		Log.d("Hourly run", new Date() + ": ----- "+getUserId());
		try {
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext()) && !"0".equals(getUserId())) {
				User user = offlineStore.getUser(userId);
				User userNew = new User();
				userNew.setUsername(user.getUsername());
				userNew.setPassword(user.getPass());
				JSONObject jbj = loginService.validateLogin(userNew);
				Log.d("loginAuthenticate==>", "" + jbj);
				if (jbj == null
						|| (jbj.opt("error") != null && !"null".equals(jbj
								.getString("error")))) {
					throw new CliniqueException(ErrorConstants.ERR_10002,
							ErrorConstants.ERR10002);
				}
				JSONObject userObject = jbj.getJSONObject("USER");
				user = offlineStore.getUser(userObject.getInt("id"));
				user.setUsername(userNew.getUsername());
				user.setPassword(userNew.getPassword());
				user.setToken(userObject.getString("token"));
				JSONObject offlineJson = new JSONObject();
				offlineJson.put("user", userObject);
				user.setOfflineJson(offlineJson.toString());
				offlineStore.updateUser(user);
				service.syncBackAll(userId, activity);
			}
		} catch (CliniqueException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}