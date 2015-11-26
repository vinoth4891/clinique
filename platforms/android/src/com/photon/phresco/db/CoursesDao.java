package com.photon.phresco.db;

import java.util.HashMap;
import java.util.Map;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Course;

public class CoursesDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public CoursesDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addCourse(Course course) {
		Log.d("addCourse", course.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_COURSEID, course.getCourseId());
		values.put(KEY_CATEGORYID, course.getCategoryId());
		values.put(KEY_JSON, course.getJson());
		values.put(KEY_TIMEMODIFIED, course.getTimeModified());

		long result = mDb.insert(TABLE_COURSES, null, values);
		mDbHelper.closeDB();
		return (result > 0);
	}

	public boolean updateCourse(Course course) {
		Log.d("updateCourse()", "" + course.getCourseId());
		if (course.getId() == 0) {
			return addCourse(course);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_JSON, course.getJson());
		values.put(KEY_TIMEMODIFIED, course.getTimeModified());

		int i = mDb.update(
				TABLE_COURSES,
				values,
				KEY_COURSEID + " = ? ",
				new String[] { String.valueOf(course.getCourseId())});
		mDbHelper.closeDB();
		return (i > 0);
	}

	public Map<Integer,Course> getCourses(String courseIds, int categoryId) {
		Map<Integer,Course> courses = new HashMap<Integer,Course>();
		Course course;
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_COURSES, COURSES_COLUMNS, KEY_COURSEID
				+ " in(" + courseIds + ") and " + KEY_CATEGORYID + " = "
				+ categoryId, null, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				course = cursorToCourse(cursor);
				courses.put(course.getCourseId(),course);
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getCourses()", courseIds + "," + categoryId);
		return courses;
	}

	public Course getCourse(int courseId, int categoryId) {
		Course course = new Course();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_COURSES, COURSES_COLUMNS, KEY_COURSEID
				+ " in(" + courseId + ") and " + KEY_CATEGORYID + " = "
				+ categoryId, null, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				course = cursorToCourse(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		mDbHelper.closeDB();
		Log.d("getCourse()", courseId + "");
		return course;
	}

	private Course cursorToCourse(Cursor cursor) {
		Course course = new Course();
		course.setId(cursor.getInt(0));
		course.setCourseId(cursor.getInt(1));
		course.setCategoryId(cursor.getInt(2));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(3, buff);
		course.setJson(new String(buff.data));
		course.setTimeModified(cursor.getLong(4));
		return course;
	}

}
