package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.CharArrayBuffer;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.photon.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Player;

public class PlayersDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public PlayersDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addPlayer(Player player) {
		Log.d("addPlayer", player.toString());
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_USERID, player.getUserId());
		values.put(KEY_COURSEID, player.getCourseId());
		values.put(KEY_JSON, player.getJson());
		values.put(KEY_TIMEMODIFIED, player.getTimeModified());

		long result = mDb.insert(TABLE_PLAYERS, null, values);
		return (result > 0);
	}

	public List<Player> getPlayers(int userId) {
		List<Player> players = new ArrayList<Player>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_PLAYERS, PLAYERS_COLUMNS, KEY_USERID
				+ " = ? ", new String[] { String.valueOf(userId) }, null, null,
				null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					players.add(cursorToPlayer(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getPlayers()", userId + "");
		return players;
	}

	public Player getPlayer(int userId, int courseId) {
		Player player = new Player();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb
				.query(TABLE_PLAYERS,
						PLAYERS_COLUMNS,
						KEY_USERID + " = ? and " + KEY_COURSEID + " = ? ",
						new String[] { String.valueOf(userId),
								String.valueOf(courseId) }, null, null, null,
						null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					player = (cursorToPlayer(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getPlayer()", userId + "," + courseId);
		return player;
	}

	public boolean updatePlayer(Player player) {
		if (player.getId() == 0) {
			return addPlayer(player);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_JSON, player.getJson());
		values.put(KEY_TIMEMODIFIED, player.getTimeModified());
		int i = mDb.update(
				TABLE_PLAYERS,
				values,
				KEY_USERID + " = ? and " + KEY_COURSEID + " = ? ",
				new String[] { String.valueOf(player.getUserId()),
						String.valueOf(player.getCourseId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean deletePlayer(Player player) {
		mDb = mDbHelper.getWritableDatabase();
		int i = mDb.delete(
				TABLE_PLAYERS,
				KEY_USERID + " = ? and " + KEY_COURSEID + " = ? ",
				new String[] { String.valueOf(player.getUserId()),
						String.valueOf(player.getCourseId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Player cursorToPlayer(Cursor cursor) {
		Player player = new Player();
		player.setId(cursor.getInt(0));
		player.setUserId(cursor.getInt(1));
		player.setCourseId(cursor.getInt(2));
		CharArrayBuffer buff = new CharArrayBuffer(10);
		cursor.copyStringToBuffer(3, buff);
		player.setJson(new String(buff.data));
		return player;
	}

}
