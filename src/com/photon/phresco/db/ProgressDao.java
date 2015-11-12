package com.photon.phresco.db;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Progress;

public class ProgressDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public ProgressDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addProgress(Progress progress) {
		Log.d("addProgress", progress.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, progress.getUserId());
		values.put(KEY_JSON, progress.getJson());
		values.put(KEY_TIMEMODIFIED, progress.getTimeModified());

		long result = mDb.insert(TABLE_PROGRESS, null, values);
		return (result > 0);
	}

	public Progress getProgress(int userId) {
		Progress progress = new Progress();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_PROGRESS, PROGRESS_COLUMNS, KEY_USERID
				+ " = ? ", new String[] { String.valueOf(userId) }, null, null,
				null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					progress = (cursorToProgress(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getProgress()", userId + "");
		return progress;
	}

	public boolean updateProgress(Progress progress) {
		if (progress.getId() == 0) {
			return addProgress(progress);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_JSON, progress.getJson());
		values.put(KEY_TIMEMODIFIED, progress.getTimeModified());
		int i = mDb.update(TABLE_PROGRESS, values, KEY_USERID + " = ? ",
				new String[] { String.valueOf(progress.getUserId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteProgress(Progress progress) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(TABLE_PROGRESS, KEY_USERID + " = ?",
				new String[] { String.valueOf(progress.getUserId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Progress cursorToProgress(Cursor cursor) {
		Progress progress = new Progress();
		progress.setId(cursor.getInt(0));
		progress.setUserId(cursor.getInt(1));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(2, buff);
		progress.setJson(new String(buff.data));
		return progress;
	}

}
