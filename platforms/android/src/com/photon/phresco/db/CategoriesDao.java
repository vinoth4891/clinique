package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Category;

public class CategoriesDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public CategoriesDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addCategory(Category category) {
		Log.d("addUser", category.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_CATEGORYID, category.getCategoryId());
		values.put(KEY_NAME, category.getName());
		values.put(KEY_JSON, category.getJson());
		values.put(KEY_TIMEMODIFIED, category.getTimeModified());

		long result = mDb.insert(TABLE_CATEGORIES, null, values);
		mDbHelper.closeDB();
		return (result > 0);
	}

	public boolean updateCategory(Category category) {
		Log.d("updateCategory()", "" + category.getCategoryId());
		if (category.getId() == 0) {
			return addCategory(category);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_NAME, category.getName());
		values.put(KEY_JSON, category.getJson());
		values.put(KEY_TIMEMODIFIED, category.getTimeModified());

		int i = mDb.update(
				TABLE_CATEGORIES,
				values,
				KEY_CATEGORYID + " = ? ",
				new String[] { String.valueOf(category.getCategoryId())});
		mDbHelper.closeDB();
		return (i > 0);
	}

	public List<Category> getAllCategories() {
		List<Category> categories = new ArrayList<Category>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_CATEGORIES, CATEGORY_COLUMNS, null,
				null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				categories.add(cursorToCategory(cursor));
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getAllCategories()", "");
		return categories;
	}

	public Category getCategory(int categoryId) {
		Category category = new Category();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_CATEGORIES, CATEGORY_COLUMNS,
				KEY_CATEGORYID + " = " + categoryId, null, null, null, null,
				null);
		try {
			if (cursor.moveToFirst()) {
				category = cursorToCategory(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getCategory()", "" + categoryId);
		return category;
	}

	private Category cursorToCategory(Cursor cursor) {
		Category category = new Category();
		category.setId(cursor.getInt(0));
		category.setCategoryId(cursor.getInt(1));
		category.setName(cursor.getString(2));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(3, buff);
		category.setJson(new String(buff.data));
		return category;
	}

}
