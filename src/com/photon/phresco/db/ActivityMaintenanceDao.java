package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.ActivityMaintenance;
import com.photon.phresco.model.Note;
import com.photon.phresco.model.UserMapping;

public class ActivityMaintenanceDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public ActivityMaintenanceDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addCompletionStatus(ActivityMaintenance activity) {
		Log.d("addCompletionStatus", activity.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, activity.getUserId());
		values.put(KEY_MODULEID, activity.getModuleId());
		values.put(KEY_COMPLETION, activity.getIsCompletion());
		values.put(KEY_STATUS, activity.getStatus());

		long result = mDb.insert(TABLE_ACT_MAIN, null, values);
		return (result > 0);
	}

	public List<ActivityMaintenance> getCompletionStatus(int userId) {
		List<ActivityMaintenance> activity = new ArrayList<ActivityMaintenance>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_ACT_MAIN, ACT_MAIN_COLUMNS, KEY_USERID
						+ " = ? ", new String[] {
						String.valueOf(userId)},
						null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					activity.add(cursorToActivity(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getCompletionStatus()", userId+"");
		return activity;
	}
	
	public ActivityMaintenance getCompletionStatus(int userId, int moduleId) {
		ActivityMaintenance activity = new ActivityMaintenance();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_ACT_MAIN, ACT_MAIN_COLUMNS, KEY_USERID
						+ " = ? and " + KEY_MODULEID + " = ? ", new String[] {
						String.valueOf(userId), String.valueOf(moduleId) },
						null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				activity = cursorToActivity(cursor);
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getCompletionStatus()", userId + "," + +moduleId);
		return activity;
	}

	public boolean updateCompletionStatus(ActivityMaintenance activity) {
		if (activity.getId() == 0) {
			return addCompletionStatus(activity);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_STATUS, activity.getStatus());
		values.put(KEY_COMPLETION, activity.getIsCompletion());
		int i = mDb.update(
				TABLE_ACT_MAIN,
				values,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(activity.getUserId()),
						String.valueOf(activity.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private ActivityMaintenance cursorToActivity(Cursor cursor) {
		ActivityMaintenance activity = new ActivityMaintenance();
		activity.setId(cursor.getInt(0));
		activity.setUserId(cursor.getInt(1));
		activity.setModuleId(cursor.getInt(2));
		activity.setIsCompletion(cursor.getInt(3));
		activity.setStatus(cursor.getString(4));
		return activity;
	}

}
