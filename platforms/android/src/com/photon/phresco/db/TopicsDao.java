package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Topics;

public class TopicsDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public TopicsDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addTopics(Topics topics) {
		Log.d("addTopics", topics.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_TOPICSID, topics.getTopicsId());
		values.put(KEY_COURSEID, topics.getCourseId());
		values.put(KEY_JSON, topics.getJson());
		values.put(KEY_TIMEMODIFIED, topics.getTimeModified());

		long result = mDb.insert(TABLE_TOPICS, null, values);
		mDbHelper.closeDB();
		return (result > 0);
	}

	public boolean updateTopics(Topics topics) {
		Log.d("updateTopics()", "" + topics.getTopicsId());
		if (topics.getId() == 0) {
			return addTopics(topics);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_JSON, topics.getJson());

		int i = mDb.update(TABLE_TOPICS, values, KEY_TOPICSID + " = ? ",
				new String[] { String.valueOf(topics.getTopicsId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public List<Topics> getTopics(String topicsId) {
		List<Topics> topics = new ArrayList<Topics>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_TOPICS, TOPICS_COLUMNS, KEY_TOPICSID
				+ " in(" + topicsId + ") ", null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				topics.add(cursorToTopics(cursor));
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getTopics()", "");
		return topics;
	}

	public Topics getTopic(int topicsId) {
		Topics topics = new Topics();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_TOPICS, TOPICS_COLUMNS, KEY_TOPICSID
				+ " = " + topicsId + " ", null, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				topics = cursorToTopics(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getTopic()", "");
		return topics;
	}

	public List<Topics> getTopicsByCourseId(int courseId) {
		List<Topics> topics = new ArrayList<Topics>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_TOPICS, TOPICS_COLUMNS, KEY_COURSEID
				+ " = " + courseId + " ", null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				topics.add(cursorToTopics(cursor));
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getTopicsByCourseId()", "");
		return topics;
	}

	private Topics cursorToTopics(Cursor cursor) {
		Topics topics = new Topics();
		topics.setId(cursor.getInt(0));
		topics.setTopicsId(cursor.getInt(1));
		topics.setCourseId(cursor.getInt(2));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(3, buff);
		topics.setJson(new String(buff.data));
		topics.setTimeModified(cursor.getLong(4));
		return topics;
	}

}
