package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.photon.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Note;

public class NoteDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public NoteDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addNote(Note note) {
		Log.d("addFavorite", note.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, note.getUserId());
		values.put(KEY_MODULEID, note.getModuleId());
		values.put(KEY_COMMENTS, note.getComment());
		values.put(KEY_STATUS, note.getStatus());
		values.put(KEY_TIMEMODIFIED, note.getTimeModified());

		long result = mDb.insert(TABLE_NOTES, null, values);
		return (result > 0);
	}

	public List<Note> getNotes(int userId) {
		List<Note> notes = new ArrayList<Note>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_NOTES, NOTES_COLUMNS, KEY_USERID
				+ " = ? ", new String[] { String.valueOf(userId) }, null, null,
				null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					notes.add(cursorToNote(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getNotes()", userId + "");
		return notes;
	}

	public Note getNote(int userId, int moduleId) {
		Note note = new Note();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_NOTES,
						NOTES_COLUMNS,
						KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
						new String[] { String.valueOf(userId),
								String.valueOf(moduleId) }, null, null, null,
						null);
		try {
			if (cursor.moveToFirst()) {
				note = (cursorToNote(cursor));
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getNote()", userId + "," + moduleId);
		return note;
	}

	public boolean updateNote(Note note) {
		if (note.getId() == 0) {
			return addNote(note);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_STATUS, note.getStatus());
		values.put(KEY_COMMENTS, note.getComment());
		int i = mDb.update(
				TABLE_NOTES,
				values,
				KEY_USERID + " = ? and " + KEY_MODULEID + " = ? ",
				new String[] { String.valueOf(note.getUserId()),
						String.valueOf(note.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deleteNote(Note note) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(TABLE_NOTES, KEY_USERID + " = ? and " + KEY_MODULEID
				+ " = ? ", new String[] { String.valueOf(note.getUserId()),
				String.valueOf(note.getModuleId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Note cursorToNote(Cursor cursor) {
		Note note = new Note();
		note.setId(cursor.getInt(0));
		note.setModuleId(cursor.getInt(1));
		note.setUserId(cursor.getInt(2));
		note.setComment(cursor.getString(3));
		note.setStatus(cursor.getString(4));
		return note;
	}

}
