package com.photon.phresco.db;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.UserBadges;

public class UserBadgesDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public UserBadgesDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addUserBadges(UserBadges userBadge) {
		Log.d("addUserBadges", userBadge.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, userBadge.getUserId());
		values.put(KEY_BADGES, userBadge.getBadges());
		values.put(KEY_ADDED, userBadge.getAdded());
		values.put(KEY_STATUS, userBadge.getStatus());
		values.put(KEY_TIMEMODIFIED, userBadge.getTimeModified());

		long result = mDb.insert(TABLE_USERBADGES, null, values);
		return (result > 0);
	}

	public UserBadges getUserBadges(int userId) {
		UserBadges userBadge = new UserBadges();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_USERBADGES, USERBADGES_COLUMNS,
				KEY_USERID + " = ? ", new String[] { String.valueOf(userId) },
				null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				userBadge = cursorToUserBadges(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getUserBadges()", userId + "");
		return userBadge;
	}

	public boolean updateUserBadges(UserBadges userBadge) {
		if (userBadge.getId() == 0) {
			return addUserBadges(userBadge);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_BADGES, userBadge.getBadges());
		values.put(KEY_ADDED, userBadge.getAdded());
		values.put(KEY_STATUS, userBadge.getStatus());
		values.put(KEY_TIMEMODIFIED, userBadge.getTimeModified());
		int i = mDb.update(TABLE_USERBADGES, values, KEY_USERID + " = ? ",
				new String[] { String.valueOf(userBadge.getUserId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private UserBadges cursorToUserBadges(Cursor cursor) {
		UserBadges userBadge = new UserBadges();
		userBadge.setId(cursor.getInt(0));
		userBadge.setUserId(cursor.getInt(1));
		userBadge.setBadges(cursor.getString(2));
		userBadge.setAdded(cursor.getString(3));
		userBadge.setStatus(cursor.getString(4));
		return userBadge;
	}

}
