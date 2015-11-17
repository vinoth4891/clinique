package com.photon.phresco.db;

public class DBConstants {
	public static final String TABLE_USERS = "users";
	public static final String TABLE_USERMAPPINGS = "user_mappings";
	public static final String TABLE_USERBADGES = "user_badges";
	public static final String TABLE_ASSETS = "assets";
	public static final String TABLE_CATEGORIES = "categories";
	public static final String TABLE_COURSES = "courses";
	public static final String TABLE_TOPICS = "topics";
	public static final String TABLE_MODULES = "modules";
	public static final String TABLE_FAVORITES = "favorites";
	public static final String TABLE_BOOKMARKS = "bookmarks";
	public static final String TABLE_NOTES = "notes";
	public static final String TABLE_PROGRESS = "progress";
	public static final String TABLE_QUIZ_COURSE = "quiz_course";
	public static final String TABLE_PLAYERS = "players";
	public static final String TABLE_LOOKUP = "lookup";
	public static final String TABLE_QUIZ = "clinique_quizLocalStorage";
	public static final String TABLE_SCORM = "scorm_Progress_Update";
	public static final String TABLE_ACT_MAIN = "activity_maintenance";
	public static final String TABLE_DEPENDENT_ACT = "dependent_activity";

	// common column names
	public static final String KEY_ID = "id";
	public static final String KEY_TIMEMODIFIED = "timemodified";
	public static final String KEY_JSON = "json";
	public static final String KEY_OFFLINE_JSON = "offline_json";
	public static final String KEY_NAME = "name";
	public static final String KEY_COURSEID = "course_id";
	public static final String KEY_TOPICSID = "topics_id";
	public static final String KEY_MODULEID = "module_id";
	public static final String KEY_COHORTID = "cohort_id";
	public static final String KEY_REFERENCEID = "reference_id";

	public static final String KEY_USERNAME = "username";
	public static final String KEY_PASSWORD = "password";
	public static final String KEY_PASS = "pass";
	public static final String KEY_TOKEN = "token";
	public static final String KEY_FIRSTTIME = "first_time";
	public static final String KEY_USERID = "user_id";
	public static final String KEY_ACTIVE_COURSES = "active_course";
	public static final String KEY_QUIZ_DATA = "quiz_data";
	public static final String KEY_BADGES = "badges";
	public static final String KEY_SERVER_TIME = "server_time";
	public static final String KEY_MAPPING_TYPE = "mapping_type";

	public static final String KEY_ASSETGROUP = "asset_group";
	public static final String KEY_URLKEY = "url_key";
	public static final String KEY_INDEX = "index_id";
	public static final String KEY_ONLINEURL = "online_url";
	public static final String KEY_OFFLINEURL = "offline_url";
	public static final String KEY_FILETYPE = "file_type";
	public static final String KEY_FILEEXTN = "file_extn";
	public static final String KEY_ASSETSIZE = "size";
	public static final String KEY_ASSETNAME = "name";
	public static final String KEY_UPDATEREQUIRED = "update_required";

	public static final String KEY_CATEGORYID = "category_id";

	public static final String KEY_STATUS = "status";
	public static final String KEY_COMPLETION = "is_completion";
	public static final String KEY_PAGENO = "page_no";
	public static final String KEY_ADDED = "added";
	public static final String KEY_DELETED = "deleted";
	public static final String KEY_COMMENTS = "comments";
	public static final String KEY_PROGRESS_ID = "progress_id";
	public static final String KEY_QUIZ_NAME = "quiz_name";
	public static final String KEY_QUIZ_INDEX = "quiz_index";
	public static final String KEY_QUIZ_SCORE = "quiz_score";

	public static final String KEY_GROUP = "key_group";
	public static final String KEY_TYPE = "key_type";
	public static final String KEY_VALUE1 = "value1";
	public static final String KEY_VALUE2 = "value2";
	public static final String KEY_VALUE3 = "value3";

	public static final String[] USER_COLUMNS = { KEY_ID, KEY_USERNAME,
			KEY_PASSWORD, KEY_USERID, KEY_TOKEN, KEY_JSON, KEY_OFFLINE_JSON,KEY_ACTIVE_COURSES,KEY_QUIZ_DATA,
			KEY_FIRSTTIME,KEY_SERVER_TIME,KEY_PASS };
	
	public static final String[] USERBADGES_COLUMNS = { KEY_ID, KEY_USERID,
			KEY_BADGES, KEY_ADDED,KEY_STATUS };

	public static final String[] USERMAPPINGS_COLUMNS = { KEY_ID, KEY_USERID,
			KEY_MAPPING_TYPE, KEY_REFERENCEID};

	public static final String[] ASSET_COLUMNS = { KEY_ID, KEY_ASSETGROUP,
			KEY_REFERENCEID, KEY_INDEX, KEY_URLKEY, KEY_ONLINEURL,
			KEY_OFFLINEURL, KEY_FILETYPE, KEY_FILEEXTN, KEY_ASSETSIZE,
			KEY_ASSETNAME, KEY_UPDATEREQUIRED };

	public static final String[] CATEGORY_COLUMNS = { KEY_ID, KEY_CATEGORYID,
			KEY_NAME, KEY_JSON};

	public static final String[] COURSES_COLUMNS = { KEY_ID, KEY_COURSEID,
			KEY_CATEGORYID, KEY_JSON,KEY_TIMEMODIFIED};

	public static final String[] TOPICS_COLUMNS = { KEY_ID, KEY_TOPICSID,
			KEY_COURSEID, KEY_JSON,KEY_TIMEMODIFIED };

	public static final String[] MODULES_COLUMNS = { KEY_ID, KEY_MODULEID,
			KEY_TOPICSID, KEY_COURSEID, KEY_JSON, KEY_OFFLINE_JSON};

	public static final String[] FAVORITES_COLUMNS = { KEY_ID, KEY_MODULEID,
			KEY_USERID, KEY_JSON, KEY_STATUS};

	public static final String[] BOOKMARKS_COLUMNS = { KEY_ID, KEY_MODULEID,
			KEY_USERID, KEY_PAGENO, KEY_ADDED, KEY_DELETED, KEY_STATUS
			};

	public static final String[] NOTES_COLUMNS = { KEY_ID, KEY_MODULEID,
			KEY_USERID, KEY_COMMENTS, KEY_STATUS};

	public static final String[] PROGRESS_COLUMNS = { KEY_ID, KEY_USERID,
			KEY_JSON };

	public static final String[] QUIZ_COURSE_COLUMNS = { KEY_ID,
			KEY_PROGRESS_ID, KEY_QUIZ_NAME, KEY_QUIZ_INDEX, KEY_QUIZ_SCORE
			 };

	public static final String[] PLAYERS_COLUMNS = { KEY_ID, KEY_USERID,
			KEY_COURSEID, KEY_JSON};

	public static final String[] LOOKUP_COLUMNS = { KEY_ID, KEY_GROUP,
			KEY_TYPE, KEY_VALUE1, KEY_VALUE2, KEY_VALUE3 };
	
	public static final String[] ACT_MAIN_COLUMNS = { KEY_ID, KEY_USERID,
		KEY_MODULEID, KEY_COMPLETION, KEY_STATUS };
	
	public static final String[] DEPENDENT_ACT_COLUMNS = { KEY_ID, KEY_USERID,
		KEY_MODULEID, KEY_REFERENCEID };
}
