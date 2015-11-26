package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.QuizCourse;

public class QuizCourseDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public QuizCourseDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addQuizCourse(QuizCourse quizCourse) {
		Log.d("addQuizCourse", quizCourse.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_PROGRESS_ID, quizCourse.getProgressId());
		values.put(KEY_QUIZ_NAME, quizCourse.getQuizName());
		values.put(KEY_QUIZ_INDEX, quizCourse.getQuizIndex());
		values.put(KEY_QUIZ_SCORE, quizCourse.getQuizScore());
		values.put(KEY_TIMEMODIFIED, quizCourse.getTimeModified());

		long result = mDb.insert(TABLE_QUIZ_COURSE, null, values);
		return (result > 0);
	}

	public List<QuizCourse> getQuizCourses(int progressId) {
		List<QuizCourse> quizCourseList = new ArrayList<QuizCourse>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_QUIZ_COURSE, QUIZ_COURSE_COLUMNS,
				KEY_PROGRESS_ID + " = ? ",
				new String[] { String.valueOf(progressId) }, null, null, null,
				null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					quizCourseList.add(cursorToQuizCourse(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getQuizCourses()", progressId + "");
		return quizCourseList;
	}

	public QuizCourse getQuizCourse(int progressId, int index) {
		QuizCourse quizCourse = new QuizCourse();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(
				TABLE_QUIZ_COURSE,
				QUIZ_COURSE_COLUMNS,
				KEY_PROGRESS_ID + " = ? and " + KEY_QUIZ_INDEX + " = ? ",
				new String[] { String.valueOf(progressId),
						String.valueOf(index) }, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					quizCourse = (cursorToQuizCourse(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getQuizCourse()", progressId + "," + index);
		return quizCourse;
	}

	public boolean updateQuizCourse(QuizCourse quizCourse) {
		if (quizCourse.getId() == 0) {
			return addQuizCourse(quizCourse);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_QUIZ_SCORE, quizCourse.getQuizScore());
		values.put(KEY_QUIZ_NAME, quizCourse.getQuizName());
		values.put(KEY_QUIZ_INDEX, quizCourse.getQuizIndex());
		values.put(KEY_TIMEMODIFIED, quizCourse.getTimeModified());
		int i = mDb.update(TABLE_QUIZ_COURSE, values, KEY_QUIZ_INDEX
				+ " = ? and " + KEY_PROGRESS_ID + " = ? ",
				new String[] { String.valueOf(quizCourse.getQuizIndex()),
						String.valueOf(quizCourse.getProgressId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteqQuizCourse(int progressId) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(TABLE_QUIZ_COURSE, KEY_USERID + " = ? and "
				+ KEY_PROGRESS_ID + " = ? ",
				new String[] { String.valueOf(progressId) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private QuizCourse cursorToQuizCourse(Cursor cursor) {
		QuizCourse quizCourse = new QuizCourse();
		quizCourse.setId(cursor.getInt(0));
		quizCourse.setProgressId(cursor.getInt(1));
		quizCourse.setQuizName(cursor.getString(2));
		quizCourse.setQuizIndex(cursor.getInt(3));
		quizCourse.setQuizScore(cursor.getDouble(4));
		return quizCourse;
	}

}
