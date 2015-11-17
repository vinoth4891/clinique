package com.photon.phresco.db;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.JSONparser.Utilities;
import com.photon.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.User;

public class UserDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public UserDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addUser(User user) {
		Log.d("addUser", user.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERNAME, user.getUsername());
		values.put(KEY_PASSWORD, user.getPassword());
		values.put(KEY_USERID, user.getUserId());
		values.put(KEY_TOKEN, user.getToken());
		values.put(KEY_JSON, user.getJson());
		values.put(KEY_OFFLINE_JSON, user.getOfflineJson());
		values.put(KEY_ACTIVE_COURSES, user.getActiveCourses());
		values.put(KEY_QUIZ_DATA, user.getQuizData());
		values.put(KEY_FIRSTTIME, user.getFirstTime());
		values.put(KEY_SERVER_TIME, user.getServerTime());
		values.put(KEY_PASS, user.getPass());

		long result = mDb.insert(TABLE_USERS, null, values);
		return (result > 0);
	}

	public User getUser(String username) {
		User user = new User();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_USERS, USER_COLUMNS, KEY_USERNAME
				+ " = ?", new String[] { String.valueOf(username) }, null,
				null, null, null);
		try {
			if (cursor.moveToFirst()) {
				user = cursorToUser(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getUser()", username);

		return user;
	}

	public User getUser(int userId) {
		User user = new User();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_USERS, USER_COLUMNS, KEY_USERID
				+ " = ?", new String[] { String.valueOf(userId) }, null, null,
				null, null);
		try {
			if (cursor.moveToFirst()) {
				user = cursorToUser(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getUser()", "" + userId);

		return user;
	}

	public boolean updateUser(User user) {
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERNAME, user.getUsername());
		values.put(KEY_PASSWORD, user.getPassword());
		values.put(KEY_TOKEN, user.getToken());
		values.put(KEY_ACTIVE_COURSES, user.getActiveCourses());
		values.put(KEY_QUIZ_DATA, user.getQuizData());
		values.put(KEY_FIRSTTIME, user.getFirstTime());
		values.put(KEY_SERVER_TIME, user.getServerTime());
		if(user.getPass()!=null){
			values.put(KEY_PASS, user.getPass());
		}

		if (user.getJson() != null)
			values.put(KEY_JSON, user.getJson());
		if (user.getOfflineJson() != null)
			values.put(KEY_OFFLINE_JSON, user.getOfflineJson());
		int i = mDb.update(TABLE_USERS, values, KEY_USERID + " = ?",
				new String[] { String.valueOf(user.getUserId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private User cursorToUser(Cursor cursor) {
		User user = new User();
		user.setId(cursor.getInt(0));
		user.setUsername(cursor.getString(1));
		user.setPassword(cursor.getString(2));
		user.setUserId(cursor.getInt(3));
		user.setToken(cursor.getString(4));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(5, buff);
		user.setJson(new String(buff.data));
		CharArrayBuffer buff1 = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(6, buff1);
		user.setOfflineJson(new String(buff1.data));
		user.setActiveCourses(cursor.getString(7));
		user.setQuizData(cursor.getString(8));
		user.setFirstTime(cursor.getInt(9));
		user.setServerTime(cursor.getInt(10));
		user.setPass(cursor.getString(11));
		return user;
	}

}
