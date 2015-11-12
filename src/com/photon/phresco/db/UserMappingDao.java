package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Note;
import com.photon.phresco.model.UserMapping;

public class UserMappingDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public UserMappingDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addUserMapping(UserMapping userMapping) {
		Log.d("addUserMapping", userMapping.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, userMapping.getUserId());
		values.put(KEY_MAPPING_TYPE, userMapping.getMappingType());
		values.put(KEY_REFERENCEID, userMapping.getReferenceId());
		values.put(KEY_STATUS, userMapping.getStatus());

		long result = mDb.insert(TABLE_USERMAPPINGS, null, values);
		return (result > 0);
	}

	public List<UserMapping> getUserMappings(int userId, String mappingType) {
		List<UserMapping> userMappings = new ArrayList<UserMapping>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_USERMAPPINGS, USERMAPPINGS_COLUMNS,
				KEY_USERID + " = ? and " + KEY_MAPPING_TYPE + " = ? ",
				new String[] { String.valueOf(userId), mappingType }, null,
				null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					userMappings.add(cursorToUserMapping(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getUserMappings()", userId + "," + mappingType);
		return userMappings;
	}

	public UserMapping getUserMapping(int userId, String mappingType,
			int referenceId) {
		UserMapping userMapping = new UserMapping();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(
				TABLE_USERMAPPINGS,
				USERMAPPINGS_COLUMNS,
				KEY_USERID + " = ? and " + KEY_MAPPING_TYPE + " = ? and "
						+ KEY_REFERENCEID + " = ? ",
				new String[] { String.valueOf(userId), mappingType,
						String.valueOf(referenceId) }, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				userMapping = cursorToUserMapping(cursor);
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getUserMapping()", userId + "," + mappingType + ","
				+ referenceId);
		return userMapping;
	}

	public boolean updateUserMapping(UserMapping userMapping) {
		if (userMapping.getId() == 0) {
			return addUserMapping(userMapping);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_STATUS, userMapping.getStatus());
		int i = mDb.update(
				TABLE_USERMAPPINGS,
				values,
				KEY_USERID + " = ? and " + KEY_MAPPING_TYPE + " = ? and "
						+ KEY_REFERENCEID + " = ? ",
				new String[] { String.valueOf(userMapping.getUserId()),
						userMapping.getMappingType(),
						String.valueOf(userMapping.getReferenceId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteUserMapping(int userId, String mappingType,
			String courseIds) {
		int i = 0;
		Log.d("deleteUserMapping()", courseIds);
		try {
			mDb = mDbHelper.getWritableDatabase();
			if (!"".equals(courseIds)) {
				i = mDb.delete(
						TABLE_USERMAPPINGS,
						KEY_USERID + " = ? and " + KEY_MAPPING_TYPE
								+ " = ? and " + KEY_REFERENCEID + " not in("
								+ courseIds + ") ",
						new String[] { String.valueOf(userId),
								String.valueOf(mappingType) });
				mDbHelper.closeDB();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return (i > 0);
	}

	private UserMapping cursorToUserMapping(Cursor cursor) {
		UserMapping userMapping = new UserMapping();
		userMapping.setId(cursor.getInt(0));
		userMapping.setUserId(cursor.getInt(1));
		userMapping.setMappingType(cursor.getString(2));
		userMapping.setReferenceId(cursor.getInt(3));
		return userMapping;
	}

}
