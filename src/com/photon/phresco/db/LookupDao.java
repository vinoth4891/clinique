package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.JSONparser.Variable;
import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Lookup;

public class LookupDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public LookupDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addLookup(Lookup lookup) {
		Log.d("addLookup", lookup.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_GROUP, lookup.getGroup());
		values.put(KEY_TYPE, lookup.getType());
		values.put(KEY_VALUE1, lookup.getValue1());
		values.put(KEY_VALUE2, lookup.getValue2());
		values.put(KEY_VALUE3, lookup.getValue3());
		values.put(KEY_TIMEMODIFIED, lookup.getTimeModified());

		long result = mDb.insert(TABLE_LOOKUP, null, values);
		return (result > 0);
	}

	public List<Lookup> getLookups(String group) {
		List<Lookup> lookups = new ArrayList<Lookup>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_LOOKUP, LOOKUP_COLUMNS, KEY_GROUP
				+ " = ? ", new String[] { String.valueOf(group) }, null, null,
				null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					lookups.add(cursorToLookup(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getLookups()", group + "");
		return lookups;
	}

	public Lookup getLookup(String group, String value1) {
		Lookup lookup = new Lookup();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_LOOKUP, LOOKUP_COLUMNS, KEY_GROUP
				+ " = ? and " + KEY_VALUE1 + " = ? ",
				new String[] { String.valueOf(group), String.valueOf(value1) },
				null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					lookup = (cursorToLookup(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getLookup()", group + "," + value1);
		return lookup;
	}

	public boolean updatelookup(Lookup lookup) {
		if (lookup.getId() == 0) {
			return addLookup(lookup);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_GROUP, lookup.getGroup());
		values.put(KEY_TYPE, lookup.getType());
		values.put(KEY_VALUE1, lookup.getValue1());
		values.put(KEY_VALUE2, lookup.getValue2());
		values.put(KEY_VALUE3, lookup.getValue3());
		values.put(KEY_TIMEMODIFIED, lookup.getTimeModified());
		int i = mDb.update(
				TABLE_LOOKUP,
				values,
				KEY_GROUP + " = ? and " + KEY_VALUE1 + " = ? ",
				new String[] { String.valueOf(lookup.getGroup()),
						String.valueOf(lookup.getValue1()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Lookup cursorToLookup(Cursor cursor) {
		Lookup lookup = new Lookup();
		lookup.setId(cursor.getInt(0));
		lookup.setGroup(cursor.getString(1));
		lookup.setType(cursor.getString(2));
		lookup.setValue1(cursor.getString(3));
		lookup.setValue2(cursor.getString(4));
		lookup.setValue3(cursor.getString(5));
		return lookup;
	}

	public JSONArray getBadges() throws JSONException {
		JSONArray badges = new JSONArray();

		List<Lookup> lookups = getLookups(Variable.LOOKUP_GROUP_BADGES);
		for (Lookup lookup : lookups) {
			JSONObject badge = new JSONObject();
			badge.put("id", lookup.getValue1());
			badge.put("badge_name", lookup.getValue2());
			badge.put("badge_value", lookup.getValue3());
			badges.put(badge);
		}

		return badges;
	}

}
