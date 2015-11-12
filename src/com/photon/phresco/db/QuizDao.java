package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Quiz;

public class QuizDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public QuizDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public Quiz getQuiz(int userId, int courseId, int modId) {
		Quiz quiz = new Quiz();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_QUIZ, null,
				"userId = ? and courseId= ? and modId=? ", new String[] {
						String.valueOf(userId), String.valueOf(courseId),
						String.valueOf(modId) }, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				quiz = cursorToQuiz(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getQuiz()", userId + "," + courseId + "," + modId);

		return quiz;
	}

	public List<Quiz> getQuizzes(int userId) {
		List<Quiz> quizzes = new ArrayList<Quiz>();

		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_QUIZ, null, "userId = ?",
						new String[] { String.valueOf(userId) }, null, null,
						null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					quizzes.add(cursorToQuiz(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getQuizzes()", "" + userId);

		return quizzes;
	}

	public boolean updateQuiz(Quiz quiz) {
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put("value", quiz.getValue());

		int i = mDb.update(
				TABLE_QUIZ,
				values,
				"userId = ? and courseId= ? and modId=? ",
				new String[] { String.valueOf(quiz.getUserId()),
						String.valueOf(quiz.getCourseId()),
						String.valueOf(quiz.getModId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Quiz cursorToQuiz(Cursor cursor) {
		Quiz quiz = new Quiz();
		quiz.setId(cursor.getInt(0));
		quiz.setCourseId(cursor.getInt(1));
		quiz.setModId(cursor.getInt(2));
		quiz.setKey(cursor.getString(3));
		quiz.setValue(cursor.getString(4));
		quiz.setUserId(cursor.getInt(5));

		return quiz;
	}

}
