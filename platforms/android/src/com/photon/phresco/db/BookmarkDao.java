package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Bookmark;

public class BookmarkDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public BookmarkDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addBookmark(Bookmark bookmark) {
		Log.d("addFavorite", bookmark.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, bookmark.getUserId());
		values.put(KEY_MODULEID, bookmark.getModuleId());
		values.put(KEY_PAGENO, bookmark.getPageNo());
		values.put(KEY_ADDED, bookmark.getAdded());
		values.put(KEY_DELETED, bookmark.getDeleted());
		values.put(KEY_STATUS, bookmark.getStatus());

		long result = mDb.insert(TABLE_BOOKMARKS, null, values);
		return (result > 0);
	}

	public List<Bookmark> getBookmarks(int userId) {
		List<Bookmark> bookmarks = new ArrayList<Bookmark>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_BOOKMARKS, BOOKMARKS_COLUMNS,
				KEY_USERID + " = ? ", new String[] { String.valueOf(userId) },
				null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					bookmarks.add(cursorToBookmark(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getBookmarks()", userId + "");
		return bookmarks;
	}

	public Bookmark getBookmark(int userId, int moduleId) {
		Bookmark bookmark = new Bookmark();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_BOOKMARKS, BOOKMARKS_COLUMNS, KEY_USERID
						+ " = ? and " + KEY_MODULEID + " = ? ", new String[] {
						String.valueOf(userId), String.valueOf(moduleId) },
						null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					bookmark = (cursorToBookmark(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getBookmark()", userId + "," + moduleId);
		return bookmark;
	}

	public boolean updateBookmark(Bookmark bookmark) {
		if (bookmark.getId() == 0) {
			return addBookmark(bookmark);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_STATUS, bookmark.getStatus());
		values.put(KEY_PAGENO, bookmark.getPageNo());
		values.put(KEY_ADDED, bookmark.getAdded());
		values.put(KEY_DELETED, bookmark.getDeleted());
		int i = mDb.update(
				TABLE_BOOKMARKS,
				values,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(bookmark.getUserId()),
						String.valueOf(bookmark.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteBookmark(Bookmark bookmark) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(
				TABLE_BOOKMARKS,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(bookmark.getUserId()),
						String.valueOf(bookmark.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteBookmark(int userId) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(TABLE_BOOKMARKS, KEY_USERID + " = ? and "
				+ KEY_STATUS + " = ? ", new String[] { String.valueOf(userId),
				"U" });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Bookmark cursorToBookmark(Cursor cursor) {
		Bookmark bookmark = new Bookmark();
		bookmark.setId(cursor.getInt(0));
		bookmark.setModuleId(cursor.getInt(1));
		bookmark.setUserId(cursor.getInt(2));
		bookmark.setPageNo(cursor.getString(3));
		bookmark.setAdded(cursor.getString(4));
		bookmark.setDeleted(cursor.getString(5));
		bookmark.setStatus(cursor.getString(6));
		return bookmark;
	}

}
