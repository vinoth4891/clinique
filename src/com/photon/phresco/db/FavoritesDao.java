package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Favorite;

public class FavoritesDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public FavoritesDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addFavorite(Favorite favorite) {
		Log.d("addFavorite", favorite.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, favorite.getUserId());
		values.put(KEY_MODULEID, favorite.getModuleId());
		values.put(KEY_JSON, favorite.getJson());
		values.put(KEY_STATUS, favorite.getStatus());

		long result = mDb.insert(TABLE_FAVORITES, null, values);
		return (result > 0);
	}

	public List<Favorite> getFavorites(int userId) {
		List<Favorite> favorites = new ArrayList<Favorite>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_FAVORITES, FAVORITES_COLUMNS,
				KEY_USERID + " = ? ", new String[] { String.valueOf(userId) },
				null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					favorites.add(cursorToFavorite(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getFavorites()", userId + "");
		return favorites;
	}

	public Favorite getFavorite(int userId, int moduleId) {
		Favorite favorite = new Favorite();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_FAVORITES, FAVORITES_COLUMNS, KEY_USERID
						+ " = ? and " + KEY_MODULEID + " = ? ", new String[] {
						String.valueOf(userId), String.valueOf(moduleId) },
						null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					favorite = (cursorToFavorite(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getFavorite()", userId + "," + moduleId);
		return favorite;
	}

	public boolean updateFavorite(Favorite favorite) {
		if (favorite.getId() == 0) {
			return addFavorite(favorite);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_STATUS, favorite.getStatus());
		values.put(KEY_JSON, favorite.getJson());
		int i = mDb.update(
				TABLE_FAVORITES,
				values,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(favorite.getUserId()),
						String.valueOf(favorite.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteFavorite(Favorite favorite) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(
				TABLE_FAVORITES,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(favorite.getUserId()),
						String.valueOf(favorite.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteFavorite(int userId) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(TABLE_FAVORITES, KEY_USERID + " = ? and "
				+ KEY_STATUS + " = ? ", new String[] { String.valueOf(userId),
				"D" });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Favorite cursorToFavorite(Cursor cursor) {
		Favorite favorite = new Favorite();
		favorite.setId(cursor.getInt(0));
		favorite.setModuleId(cursor.getInt(1));
		favorite.setUserId(cursor.getInt(2));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(3, buff);
		favorite.setJson(new String(buff.data));
		favorite.setStatus(cursor.getString(4));
		return favorite;
	}

}
