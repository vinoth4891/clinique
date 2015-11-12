/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

package com.clinique.phresco.hybrid.activity;

import org.json.JSONObject;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.photon.phresco.db.UserDao;
import com.photon.phresco.model.User;

public class OfflineStore {
	private JSONObject jbj;
	private String username;
	private String password;
	private UserDao userDao = new UserDao(MainActivity.dbStore.getMDbHelper());

	public JSONObject validateLogin(String jsonParam) throws CliniqueException {
		try {
			jbj = null;
			JSONObject object = new JSONObject(jsonParam);
			username = object.getString("username");
			password = object.getString("password");
			User user = userDao.getUser(username);
			if(user.getId()!=0){
				if (username.equalsIgnoreCase(user.getUsername())) {
					if (Utilities.computeMD5Hash(password).equals(
							user.getPassword())) {
						jbj = new JSONObject(user.getOfflineJson());
					} else {
						throw new CliniqueException(ErrorConstants.ERR_10005,ErrorConstants.ERR10005);
					}
				} else {
					throw new CliniqueException(ErrorConstants.ERR_10004,
							ErrorConstants.ERR10004);
				}
			}
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(e.getErrorCode(), e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10001,
					e.getMessage());
		}
		return jbj;
	}

	public boolean upsertUser(User user) {
		boolean result;
		User tempUser = getUser(user.getUsername());
		if (tempUser == null || tempUser.getUsername() == null) {
			user.setPassword(Utilities.computeMD5Hash(user.getPass()));
			result = userDao.addUser(user);
		} else {
			user.setPassword(Utilities.computeMD5Hash(user.getPass()));
			result = userDao.updateUser(user);
		}
		return result;
	}

	public boolean updateUser(User user) {
		boolean result;
		result = userDao.updateUser(user);
		return result;
	}

	public User getUser(String username) {
		User user = userDao.getUser(username);
		return user;
	}

	public User getUser(int userId) {
		User user = userDao.getUser(userId);
		return user;
	}

}
