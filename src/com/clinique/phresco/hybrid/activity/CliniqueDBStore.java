package com.clinique.phresco.hybrid.activity;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.JSONparser.Variable;
import com.photon.phresco.db.DBConstants;

public class CliniqueDBStore extends DBConstants {

	private DBHelper mDbHelper;
	private SQLiteDatabase mDb;
	private final Context mCtx;

	public CliniqueDBStore(Context ctx) {
		mCtx = ctx;
		mDbHelper = new DBHelper(mCtx);
	}

	public static class DBHelper extends SQLiteOpenHelper {

		public DBHelper(Context context) {
			super(context, Variable.DATABASE_NAME, null,
					Variable.DATABASE_VERSION);
		}

		@Override
		public void onCreate(SQLiteDatabase db) {
			// SQL statement to create tables
			String CREATE_USERS_TABLE = "CREATE TABLE " + TABLE_USERS + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_USERNAME
					+ " TEXT, " + KEY_PASSWORD + " TEXT, " + KEY_USERID
					+ " INTEGER, " + KEY_TOKEN + " TEXT, " + KEY_JSON
					+ " TEXT," + KEY_OFFLINE_JSON + " TEXT,"
					+ KEY_ACTIVE_COURSES + " TEXT," + KEY_QUIZ_DATA + " TEXT,"
					+ KEY_FIRSTTIME + " INTEGER," + KEY_SERVER_TIME + " long, "
					+ KEY_PASS + " TEXT)";

			String CREATE_USERBADGES_TABLE = "CREATE TABLE " + TABLE_USERBADGES
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_USERID + " INTEGER, " + KEY_BADGES + " TEXT,"
					+ KEY_ADDED + " TEXT," + KEY_STATUS + " TEXT,"
					+ KEY_TIMEMODIFIED + " long)";

			String CREATE_USERMAPPINGS_TABLE = "CREATE TABLE "
					+ TABLE_USERMAPPINGS + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_USERID
					+ " INTEGER, " + KEY_MAPPING_TYPE + " TEXT, "
					+ KEY_REFERENCEID + " INTEGER, " + KEY_STATUS
					+ " TEXT)";

			String CREATE_ASSETS_TABLE = "CREATE TABLE " + TABLE_ASSETS + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_USERID
					+ " INTEGER, " + KEY_ASSETGROUP + " TEXT, "
					+ KEY_REFERENCEID + " INTEGER, " + KEY_INDEX + " INTEGER, "
					+ KEY_URLKEY + " TEXT, " + KEY_ONLINEURL + " TEXT, "
					+ KEY_OFFLINEURL + " TEXT, " + KEY_FILETYPE + " TEXT, "
					+ KEY_FILEEXTN + " TEXT, " + KEY_ASSETSIZE + " long, "
					+ KEY_ASSETNAME + " TEXT, " + KEY_TIMEMODIFIED + " long, "
					+ KEY_UPDATEREQUIRED + " TEXT )";
			String CREATE_CATEGORIES_TABLE = "CREATE TABLE " + TABLE_CATEGORIES
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_CATEGORYID + " INTEGER, " + KEY_NAME + " TEXT, "
					+ KEY_JSON + " TEXT, " + KEY_TIMEMODIFIED + " long)";

			String CREATE_COURSES_TABLE = "CREATE TABLE " + TABLE_COURSES
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_COURSEID + " INTEGER, " + KEY_CATEGORYID
					+ " INTEGER, " + KEY_JSON + " TEXT, " + KEY_TIMEMODIFIED
					+ " long)";
			String CREATE_TOPICS_TABLE = "CREATE TABLE " + TABLE_TOPICS + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_TOPICSID
					+ " INTEGER, " + KEY_COURSEID + " INTEGER, " + KEY_JSON
					+ " TEXT,"+KEY_TIMEMODIFIED+" LONG)";

			String CREATE_MODULES_TABLE = "CREATE TABLE " + TABLE_MODULES
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_MODULEID + " INTEGER, " + KEY_TOPICSID + " INTEGER, "
					+ KEY_COURSEID + " INTEGER, " + KEY_JSON + " TEXT, "
					+ KEY_OFFLINE_JSON + " TEXT, " + KEY_TIMEMODIFIED
					+ " long)";

			String CREATE_FAVORITES_TABLE = "CREATE TABLE " + TABLE_FAVORITES
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_MODULEID + " INTEGER, " + KEY_USERID + " INTEGER, "
					+ KEY_JSON + " TEXT, " + KEY_STATUS + " TEXT, "
					+ KEY_TIMEMODIFIED + " long)";

			String CREATE_BOOKMARKS_TABLE = "CREATE TABLE " + TABLE_BOOKMARKS
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_MODULEID + " INTEGER, " + KEY_USERID + " INTEGER, "
					+ KEY_PAGENO + " TEXT, " + KEY_ADDED + " TEXT, "
					+ KEY_DELETED + " TEXT, " + KEY_STATUS + " TEXT, "
					+ KEY_TIMEMODIFIED + " long)";

			String CREATE_NOTES_TABLE = "CREATE TABLE " + TABLE_NOTES + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_MODULEID
					+ " INTEGER, " + KEY_USERID + " INTEGER, " + KEY_COMMENTS
					+ " TEXT, " + KEY_STATUS + " TEXT, " + KEY_TIMEMODIFIED
					+ " long)";

			String CREATE_PROGRESS_TABLE = "CREATE TABLE " + TABLE_PROGRESS
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_USERID + " INTEGER, " + KEY_JSON + " TEXT, "
					+ KEY_TIMEMODIFIED + " long)";

			String CREATE_QUIZ_COURSE_TABLE = "CREATE TABLE "
					+ TABLE_QUIZ_COURSE + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_PROGRESS_ID + " INTEGER, " + KEY_QUIZ_NAME
					+ " TEXT, " + KEY_QUIZ_INDEX + " INTEGER, "
					+ KEY_QUIZ_SCORE + " TEXT, " + KEY_TIMEMODIFIED + " long)";

			String CREATE_PLAYERS_TABLE = "CREATE TABLE " + TABLE_PLAYERS
					+ " ( " + "id INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ KEY_USERID + " INTEGER, " + KEY_COURSEID + " INTEGER, "
					+ KEY_JSON + " TEXT, " + KEY_TIMEMODIFIED + " long)";

			String CREATE_LOOKUP_TABLE = "CREATE TABLE " + TABLE_LOOKUP + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_GROUP
					+ " TEXT, " + KEY_TYPE + " TEXT, " + KEY_VALUE1 + " TEXT, "
					+ KEY_VALUE2 + " TEXT, " + KEY_VALUE3 + " TEXT, "
					+ KEY_TIMEMODIFIED + " long)";
			
			String CREATE_ACT_MAIN_TABLE = "CREATE TABLE " + TABLE_ACT_MAIN + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_USERID
					+ " INTEGER, " + KEY_MODULEID + " INTEGER, " + KEY_COMPLETION + " INTEGER, "
					+ KEY_STATUS + " TEXT)";
			
			String CREATE_DEPENDENT_ACT_TABLE = "CREATE TABLE " + TABLE_DEPENDENT_ACT + " ( "
					+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " + KEY_USERID
					+ " INTEGER, " + KEY_MODULEID + " INTEGER, " + KEY_REFERENCEID+ " INTEGER)";

			String CREATE_QUIZ_TABLE = "CREATE TABLE IF NOT EXISTS clinique_quizLocalStorage( id INTEGER PRIMARY KEY AUTOINCREMENT,courseId TEXT, modId TEXT, key TEXT, value TEXT,userId TEXT)";
			
			String CREATE_SCORM_TABLE = "CREATE TABLE IF NOT EXISTS scorm_Progress_Update(JSONBody TEXT, InteractionJSON TEXT, scormUpdateFlag TEXT, score_raw TEXT, completion_status TEXT, objectives_location TEXT, objectives_scaled TEXT, objectives_min TEXT, objectives_max TEXT, pollId TEXT, pollJSON TEXT, success_status TEXT,modId TEXT,courseId TEXT,userId TEXT)";

			// create all tables
			db.execSQL(CREATE_USERS_TABLE);
			db.execSQL(CREATE_USERBADGES_TABLE);
			db.execSQL(CREATE_USERMAPPINGS_TABLE);
			db.execSQL(CREATE_ASSETS_TABLE);
			db.execSQL(CREATE_CATEGORIES_TABLE);
			db.execSQL(CREATE_COURSES_TABLE);
			db.execSQL(CREATE_TOPICS_TABLE);
			db.execSQL(CREATE_MODULES_TABLE);
			db.execSQL(CREATE_FAVORITES_TABLE);
			db.execSQL(CREATE_BOOKMARKS_TABLE);
			db.execSQL(CREATE_NOTES_TABLE);
			db.execSQL(CREATE_PROGRESS_TABLE);
			db.execSQL(CREATE_QUIZ_COURSE_TABLE);
			db.execSQL(CREATE_PLAYERS_TABLE);
			db.execSQL(CREATE_LOOKUP_TABLE);
			db.execSQL(CREATE_QUIZ_TABLE);
			db.execSQL(CREATE_SCORM_TABLE);
			db.execSQL(CREATE_ACT_MAIN_TABLE);
			db.execSQL(CREATE_DEPENDENT_ACT_TABLE);

		}

		@Override
		public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
			// Drop older users,assets table if existed
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERBADGES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_USERMAPPINGS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_ASSETS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_CATEGORIES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_COURSES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_TOPICS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_MODULES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_FAVORITES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_BOOKMARKS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_NOTES);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_PROGRESS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_QUIZ_COURSE);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_PLAYERS);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_LOOKUP);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_QUIZ);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_SCORM);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_ACT_MAIN);
			db.execSQL("DROP TABLE IF EXISTS " + TABLE_DEPENDENT_ACT);

			// create fresh tables
			this.onCreate(db);
		}

		public void closeDB() {

			/*mDb1 = this.getReadableDatabase();
			if (mDb1 != null && mDb1.isOpen()) {
				mDb1.close();
			}*/

		}
	}

	public DBHelper getMDbHelper() {
		return mDbHelper;
	}

	public void closeDB() {
		mDb = mDbHelper.getReadableDatabase();
		if (mDb != null && mDb.isOpen()) {
			mDb.close();
		}
	}
}
