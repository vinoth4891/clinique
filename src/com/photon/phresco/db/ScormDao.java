package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Scorm;

public class ScormDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public ScormDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public Scorm getScorm(int userId, int courseId, int modId) {
		Scorm scorm = new Scorm();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_SCORM, null,
				"userId = ? and courseId= ? and modId=? ", new String[] {
						String.valueOf(userId), String.valueOf(courseId),
						String.valueOf(modId) }, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				scorm = cursorToScorm(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getScorm()", userId + "," + courseId + "," + modId);

		return scorm;
	}

	public List<Scorm> getScorms(int userId) {
		List<Scorm> Scorms = new ArrayList<Scorm>();

		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_SCORM, null, "userId = ?",
						new String[] { String.valueOf(userId) }, null, null,
						null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					Scorms.add(cursorToScorm(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getScorms()", "" + userId);

		return Scorms;
	}

	public boolean updateScorm(Scorm scorm) {
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put("success_status", scorm.getStatus());

		int i = mDb.update(
				TABLE_SCORM,
				values,
				"userId = ? and courseId= ? and modId=? ",
				new String[] { String.valueOf(scorm.getUserId()),
						String.valueOf(scorm.getCourseId()),
						String.valueOf(scorm.getModId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Scorm cursorToScorm(Cursor cursor) {
		Scorm Scorm = new Scorm();
		Scorm.setValue(cursor.getString(0));
		Scorm.setStatus(cursor.getString(11));
		Scorm.setModId(cursor.getInt(12));
		Scorm.setCourseId(cursor.getInt(13));
		Scorm.setUserId(cursor.getInt(14));
		return Scorm;
	}

}
