package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.photon.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.ActivityMaintenance;
import com.photon.phresco.model.DependentActivity;

public class DependentActivityDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public DependentActivityDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addDependentActivity(DependentActivity activity) {
		Log.d("addDependentActivity", activity.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, activity.getUserId());
		values.put(KEY_MODULEID, activity.getModuleId());
		values.put(KEY_REFERENCEID, activity.getReferenceId());
		long result = mDb.insert(TABLE_DEPENDENT_ACT, null, values);
		return (result > 0);
	}

	public List<DependentActivity> getDependentActivity(int userId,int moduleId) {
		List<DependentActivity> activity = new ArrayList<DependentActivity>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_DEPENDENT_ACT, DEPENDENT_ACT_COLUMNS, KEY_USERID
						+ " = ? and "+KEY_MODULEID+" = ? ", new String[] {
						String.valueOf(userId),String.valueOf(moduleId)},
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
		Log.d("getDependentActivity()", userId+"");
		return activity;
	}
	
	public DependentActivity getDependentActivity(int userId, int moduleId,int referenceId) {
		DependentActivity activity = new DependentActivity();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_DEPENDENT_ACT, DEPENDENT_ACT_COLUMNS, KEY_USERID
						+ " = ? and " + KEY_MODULEID + " = ? and "+KEY_REFERENCEID+" = ? ", new String[] {
						String.valueOf(userId), String.valueOf(moduleId),String.valueOf(referenceId) },
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
		Log.d("getDependentActivity()", userId + "," + +moduleId+","+referenceId);
		return activity;
	}

	private DependentActivity cursorToActivity(Cursor cursor) {
		DependentActivity activity = new DependentActivity();
		activity.setId(cursor.getInt(0));
		activity.setUserId(cursor.getInt(1));
		activity.setModuleId(cursor.getInt(2));
		activity.setReferenceId(cursor.getInt(3));
		return activity;
	}

}
