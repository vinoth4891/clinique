package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Module;

public class ModuleDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public ModuleDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addModule(Module module) {
		Log.d("addModule", module.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_TOPICSID, module.getTopicsId());
		values.put(KEY_MODULEID, module.getModuleId());
		values.put(KEY_COURSEID, module.getCourseId());
		values.put(KEY_JSON, module.getJson());
		values.put(KEY_OFFLINE_JSON, module.getOfflineJson());
		values.put(KEY_TIMEMODIFIED, module.getTimeModified());

		long result = mDb.insert(TABLE_MODULES, null, values);
		mDbHelper.closeDB();
		return (result > 0);
	}

	public boolean updateModule(Module module) {
		Log.d("updateModule()", "" + module.getModuleId());
		if (module.getId() == 0) {
			return addModule(module);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		if (module.getJson() != null) {
			values.put(KEY_JSON, module.getJson());
		}
		if (module.getOfflineJson() != null) {
			values.put(KEY_OFFLINE_JSON, module.getOfflineJson());
		}
		values.put(KEY_TIMEMODIFIED, module.getTimeModified());

		int i = mDb.update(TABLE_MODULES, values, KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(module.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public List<Module> getModules(String moduleId) {
		List<Module> modules = new ArrayList<Module>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_MODULES, MODULES_COLUMNS, KEY_MODULEID
				+ " in(" + moduleId + ") ", null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				modules.add(cursorToModules(cursor));
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getModules()", "");
		return modules;
	}

	public Module getModule(int moduleId) {
		Module module = new Module();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_MODULES, MODULES_COLUMNS, KEY_MODULEID
				+ " = " + moduleId, null, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				module = cursorToModules(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getModule()", "");
		return module;
	}

	public List<Module> getModulesByTopicsId(int topicsId, int courseId) {
		List<Module> modules = new ArrayList<Module>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_MODULES, MODULES_COLUMNS, KEY_TOPICSID
				+ " = " + topicsId + " and " + KEY_COURSEID + " = " + courseId,
				null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				modules.add(cursorToModules(cursor));
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getModulesByTopicsId()", "");
		return modules;
	}

	public List<Integer> getModuleIdByTopics(int topicsId, int courseId) {
		List<Integer> modules = new ArrayList<Integer>();
		mDb = mDbHelper.getReadableDatabase();
		String[] columns = { KEY_MODULEID };
		Cursor cursor = mDb.query(TABLE_MODULES, columns, KEY_TOPICSID + " = "
				+ topicsId + " and " + KEY_COURSEID + " = " + courseId, null,
				null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					modules.add(cursor.getInt(0));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		return modules;
	}

	public boolean deleteModuleIdMappings(int courseId, String moduleIds) {
		mDb = mDbHelper.getWritableDatabase();
		int i = 0;
		Log.d("deleteModuleIdMappings()", moduleIds);
		try {
			if (!"".equals(moduleIds)) {
				i = mDb.delete(TABLE_MODULES, KEY_COURSEID + " = ? and "
						+ KEY_MODULEID + " not in(" + moduleIds + ") ",
						new String[] { String.valueOf(courseId) });
				mDbHelper.closeDB();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return (i > 0);
	}

	private Module cursorToModules(Cursor cursor) {
		Module module = new Module();
		module.setId(cursor.getInt(0));
		module.setModuleId(cursor.getInt(1));
		module.setTopicsId(cursor.getInt(2));
		module.setCourseId(cursor.getInt(3));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(4, buff);
		module.setJson(new String(buff.data));
		module.setOfflineJson(cursor.getString(5));
		return module;
	}

}
