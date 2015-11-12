
package com.JSONparser;

import com.clinique.phresco.hybrid.activity.MainActivity;

public class Variable {
	public static String	SERVICES_URL			= "http://01847-stg.photoninfotech.com/clinique/admin/v2/clinique_webservice/services.php";
	public static String	SYNC_SERVICES_URL		= "http://01847-stg.photoninfotech.com/clinique/admin/v2/clinique_webservice/sync_service.php";
	public static String 	DOWNLOAD_POST_URL 		= "http://01847-stg.photoninfotech.com/clinique/admin/webservice/pluginfile.php";
	public static String 	DOC_DOWNLOAD_URL 		= "http://01847-stg.photoninfotech.com/clinique/language/";

	public static int	DATABASE_VERSION	= 1;
	public static String	PDF_TOKEN		= "token";
	public static String	PDF_URL			= "pdfURL";
	public static String	PAGE_ID			= "pageid";
	public static String	COMMENT			= "comment";
	public static String	TYPE			= "type";
	public static String	ACTION			= "action";
	public static String	MODULE_ID		= "coursemoduleid";
	public static String	USERID			= "userid";
	public static String	COURSEID		= "courseid";
	public static String	ID				= "id";
	public static String	U_ID			= "uid";
	public static String	C_ID			= "cid";
	public static String	B_ID			= "bid";
	public static String	B_VAL			= "bval";
	public static String	B_NAME			= "bname";
	public static String	MODULE			= "module";
	public static String	CATEGORYID		= "categoryid";
	public static String	TIMEMODIFIED	= "timemodified";
	public static String	PAGES	= "pages";
	public static String	HTTP			= "http";
	public static String	CONTENTS			= "contents";
	public static String	CHOICES			= "choices";
	public static String	QUESTIONS			= "questions";
	public static String	ALREADYATTEMPTED			= "alreadyattempted";
	public static String	ATTEMPTEDCOUNT			= "attemptedcount";
	public static String	ANYFINISHED			= "anyfinished";
	public static String	ATTEMPTS			= "attempts";
	public static String	NEWATTEMPTS			= "newattempts";
	public static String	QUIZLIST			= "quizlist";
	public static String	QUIZINFO			= "quizinfo";
	public static String	QUIZ			= "quiz";
	public static String	QUIZSYNC			= "quizsync";
	public static String	FEEDBACK			= "feedback";
	
	public static String	STATUS_Y		= "Y";
	public static String	STATUS_U		= "U";
	public static String	STATUS_S		= "S";
	public static String	STATUS_C		= "C";
	public static String	IMAGE_TYPE		= "image";
	public static String	BOOKMARK_URL	= "bookmarkurl";
	public static String	TITLE			= "title";
	public static String	GET_BOOKMARK	= "get_course_pdf_bookmarks";
	public static String	GET_COMMENT		= "get_course_resource_comment";
	public static String	INSERT_BOOKMARK	= "insert_course_pdf_bookmark";
	public static String	DELETE_BOOKMARK	= "delete_course_pdf_bookmark";
	public static String	INSERT_COMMENT	= "insert_replace_course_resource_comment";
	public static String	FILE_NAME		= "FileName";
	public static String	BOOKMARK_PAGS	= "Bookmark";
	public static String	TOTAL_PAGES		= "TotalPages";
	public static String	PAGE_NO			= "PageNo";
	public static String	CORE			= "core";
	public static String	LANGUAGE		= "lang";
	public static String	BASE_URL		= "serviceURl";
	public static String	USERNAME		= "username";
	public static String	PASSWORD		= "password";
	public static String	TOKEN			= "token";
	public static String	FROM			= "from";
	public static String	DATABASE_NAME	= "CliniqueDB.db";
	public static String	SERVICE			= "service";
	
	public static String	PUBLIC_STORAGE	= (MainActivity.context!=null ? (MainActivity.context.getExternalFilesDir("Clinique").getAbsolutePath()):"");//"/storage/emulated/0/Clinique";
	public static String	SECURE_STORAGE	= (MainActivity.context!=null ? (MainActivity.context.getExternalFilesDir("Clinique").getAbsolutePath()):"");
	public static String	PRIVACY_DOC_NAME	= "Clinique_Education_Privacy_Policy_WEBSITE";
	public static String	TERMS_DOC_NAME	= "Clinique_Education_Terms_And_Conditions_WEBSITE";
	
	public static String 	FILE_PATH_PREFIX 		= "file://";
	public static String 	CONTENTS_DOWNLOAD_TAG 	= "fileurl";
	public static String 	PRIVACY_DOWNLOAD_TAG 	= "privacy";
	public static String 	TERMS_DOWNLOAD_TAG 		= "terms";
	public static String 	SCORM_MANIFEST_PATH_TAG 	= "manifest_path";
	public static String 	WIDGET_QUESTION_TEXT_DOWNLOAD_TAG 	= "questiontext";
	public static String 	QUIZ_QUESTION_TEXT_DOWNLOAD_TAG 	= "question";
	public static String 	QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG 	= "feedbacktext";
	public static String 	QUIZ_CHOICES_LABEL_DOWNLOAD_TAG 	= "label";
	public static String 	QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG 	= "subquestion";
	public static String 	WIDGET_ANSWER_TEXT_DOWNLOAD_TAG 	= "answertext";
	public static String 	SUMMARY_IMAGE_DOWNLOAD_TAG 	= "summary";
	public static String 	ASSET_GROUP_LINKS 			= "LINKS";
	public static String 	ASSET_GROUP_CONTENT 		= "CONTENT";
	public static String 	ASSET_GROUP_SCORM			= "SCORM";
	public static String 	ASSET_GROUP_WIDGET 			= "WIDGET";
	public static String 	ASSET_GROUP_QUIZ 			= "QUIZ";
	public static String 	ASSET_GROUP_SUMMARY_TAG 	= "SUMMARY_TAG";
	public static String 	USER_MAPPING_GROUP_COURSE 	= "COURSE";
	public static String 	USER_MAPPING_GROUP_ASSET	= "ASSET";
	public static String 	LOOKUP_GROUP_BADGES			= "BADGES";
	public static String[] languages = {"en", "en_us","ar", "zh_ct","cs", "da","nl", "fi","fr_ca", "fr","de", "el","he", "hu","id", "it","ja", "ko","zh_cn", "zh_tw","no", "pl","pt_br", "pt_br","ru", "es_mx","es", "sv","th","tr","vi"};


	
}
