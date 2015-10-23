<?php

require_once('response.php');
//error_reporting(E_ALL);
//ini_set('display_errors', '1');

class CourseResource {

	public static function __getCoursePDFBookmarks($userid, $coursemoduleid) {

		global $CFG, $DB;

		$bookmarks = $DB->get_records('user_pdf_bookmarks',array(
			'userid' => $userid,
			'coursemoduleid' => $coursemoduleid,
		));

		$bookmarks_data = array();
		foreach($bookmarks as $bookmark) {
			array_push($bookmarks_data, array(
				'pageno' => $bookmark->page_number,
				'timecreated' => $bookmark->timecreated,
			));
		}

		$data = array(
			'bookmarks' => $bookmarks_data,
		);

		$response = new CliniqueServiceResponce();
		$response->response(false, null, $data);
	}	

	public static function __insertCoursePDFBookmark($userid, $coursemoduleid, $pageid) {

		global $CFG, $DB;

		$record = new stdClass();
		$record->userid = $userid;
		$record->coursemoduleid = $coursemoduleid;
		$record->page_number = $pageid;

		$bookmark = $DB->get_records('user_pdf_bookmarks',array(
			'userid' => $userid,
			'coursemoduleid' => $coursemoduleid,
			'page_number' => $pageid,
		));
		
		$response = new CliniqueServiceResponce();

		if(empty($bookmark)) {
			$lastinsertid = $DB->insert_record('user_pdf_bookmarks', $record);

			if( ! empty($lastinsertid)) {
				$data = array('bookmarked' => true);
			} else {
				$data = array('bookmarked' => false);
			}			
			
			$response->response(false, null, $data);
		} else {
			$response->response(true, 'Bookmark already exists');
		}


		

	}

	public static function __deleteCoursePDFBookmark($userid, $coursemoduleid, $pageid) {

		global $CFG, $DB;
		$res = $DB->delete_records('user_pdf_bookmarks', array(
			'userid' => $userid,
			'coursemoduleid' => $coursemoduleid,
			'page_number' => $pageid,
			));

		if( ! empty($res)) {
			$data = array('deleted' => true);
		} else {
			$data = array('deleted' => false);
		}
		$response = new CliniqueServiceResponce();
		$response->response(false, null, $data);
	}	

	public static function __getCourseResourceComment($userid, $coursemoduleid, $type) {
		global $CFG, $DB;

		$criteria = array(
			'userid' => $userid,
			'coursemoduleid' => $coursemoduleid,
		);

		if( ! empty($type) && in_array($type, array('pdf', 'video'))) {
			$criteria['type'] = $type;
		}

		$comments = $DB->get_records('user_resource_comments', $criteria);

		$comments_data = array();

		if( ! empty($comments)) {
			foreach($comments as $comment) {
				$comments_data[] = array(
					'type' => $comment->type,
					'comment' => $comment->comment,
					'timecreated' => $comment->timecreated,
				);
			}
		}
		$data = array(
			'comment' => $comments_data,
		);

		$response = new CliniqueServiceResponce();
		$response->response(false, null, $comments_data);
	}	

	public static function __getCourseResourceComments($userid, $offset, $limit) {
		global $CFG, $DB;
		
		if($limit == "") {
			$limit = 10;
		}
		
		$fav_comment_sql = 'SELECT urc.id AS commentid, urc.coursemoduleid, urc.type, urc.timecreated, c.fullname AS course_name, r.name AS resource_name, urc.comment
			FROM mdl_user_resource_comments urc
			 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
			 JOIN mdl_course c ON cm.course = c.id
			 JOIN mdl_resource r ON cm.instance = r.id
			WHERE urc.userid = ' . $userid .  " AND TRIM(COALESCE(urc.comment, '')) != '' ORDER BY urc.id DESC LIMIT $offset, $limit";
		$comments = $DB->get_records_sql($fav_comment_sql);							
		$fav_comment_count_sql = 'SELECT COUNT(urc.id) AS comment_count
			FROM mdl_user_resource_comments urc
			 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
			 JOIN mdl_course c ON cm.course = c.id
			 JOIN mdl_resource r ON cm.instance = r.id
			WHERE urc.userid = ' . $userid . " AND TRIM(COALESCE(urc.comment, '')) != ''";
		$comments_count = current($DB->get_records_sql($fav_comment_count_sql));
		$comments_data = array();

		if( ! empty($comments)) {
			foreach($comments as $comment) {
				$resource_name = preg_replace('/^(.*?:\s*)/sm', '', $comment->resource_name);
				$comments_data[] = array(
					'id' => $comment->commentid,
					'coursemoduleid' => $comment->coursemoduleid,
					'type' => $comment->type,
					'course_name' => $comment->course_name,
					'resource_name' => $resource_name,
					'comment' => $comment->comment,
					'timecreated' => strtotime($comment->timecreated),
				);
			}
		}

		$response = new CliniqueServiceResponce();
		$response->response(false, null, array('data' => $comments_data, 'totalcount' => $comments_count->comment_count));
	}

	public static function __getCourseResourceCommentsExport($userid, $recordrow) {
		global $CFG, $DB;
		require_once($CFG->libdir . '/csvlib.class.php');
		
		$fields = array(
			'Course Name' => 'Courses',
			'File Name' => 'File Name',			
			'Comments' => 'Comments'
		);
		
		$filename  = time();
		$csvexport = new csv_export_writer();
		$csvexport->set_filename($filename);
		$csvexport->add_data($fields);
		if($recordrow != "") {
			$fav_comment_sql = 'SELECT urc.id AS commentid, r.name AS resource_name, c.fullname AS course_name, urc.comment
				FROM mdl_user_resource_comments urc
				 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
				 JOIN mdl_course c ON cm.course = c.id
				 JOIN mdl_resource r ON cm.instance = r.id
				WHERE urc.userid = ' . $userid ." AND TRIM(COALESCE(urc.comment, '')) != '' AND urc.id IN($recordrow) ORDER BY urc.id DESC";
		} else {
			$fav_comment_sql = "SELECT urc.id AS commentid, r.name AS resource_name, c.fullname AS course_name, urc.comment
				FROM mdl_user_resource_comments urc
				 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
				 JOIN mdl_course c ON cm.course = c.id
				 JOIN mdl_resource r ON cm.instance = r.id
				WHERE urc.userid = '$userid' AND TRIM(COALESCE(urc.comment, '')) != '' ORDER BY urc.id DESC";
									
		}

		$comments = $DB->get_recordset_sql($fav_comment_sql);
				
		if( ! empty($comments)) {
			foreach($comments as $comment) {
				$commentsdata['Course Name']  = $comment->course_name;
				//$commentsdata['File Name']  = $comment->resource_name;
				$resource_name = explode(": ",$comment->resource_name);
				if($resource_name[1] !=""):
					$commentsdata['File Name']  =  $resource_name[1];
				else:
					$commentsdata['File Name']  =  $resource_name[0];
				endif; 
				$commentsdata['Comments']  = $comment->comment;
				$csvexport->add_data($commentsdata);
			}
		}
		
		$csvexport->download_file();				
		exit;
	}

	public static function __insertReplaceCourseResourceComment($userid, $coursemoduleid, $type, $comment) {
		global $CFG, $DB;
		
		$commentRecord = $DB->get_record('user_resource_comments',array(
			'userid' => $userid,
			'type' => $type,
			'coursemoduleid' => $coursemoduleid,
		));

		$record = new stdClass();
		$record->comment = $comment;
		
		if(empty($commentRecord->id)) {
			$record->userid = $userid;
			$record->coursemoduleid = $coursemoduleid;
			$record->type = $type;			
			$ret = $DB->insert_record('user_resource_comments', $record);
		} else {
			$record->id = $commentRecord->id;
			$ret = $DB->update_record('user_resource_comments', $record, $bulk=false);
		}

		if( ! empty($ret)) {
			$comment_data = array(
				'status' => 'success',
			);
		} else {
			$comment_data = array(
				'status' => 'failure',
			);
		}

		$response = new CliniqueServiceResponce();
		$response->response(false, null, $comment_data);
	}	
}
