<?php

require_once('response.php');

class Favorite {

	public static function add($userid,  $url, $title, $return = false) {

		global $CFG, $DB;

		$coursemoduleid = self::extractCourseModuleId($title);
		$url = self::cleanUrl($url);
		self::addFavorite($userid,  $coursemoduleid, $url, $title);

		if(empty($return)) {
			$response = new CliniqueServiceResponce();
			$response->response(false, 'Added Favourite Successfully');
		}
	}	

	public static function cleanUrl($url) {
		$parsedUrl = parse_url($url);
		parse_str($parsedUrl['query'], $queryParams);

		if(array_key_exists('token', $queryParams))
			unset($queryParams['token']);

		if( ! empty($queryParams))
			return strtok($url,'?') . '?' . http_build_query($queryParams);

		return strtok($url,'?');
	}

	public static function extractCourseModuleId($tile) {
		list($coursemoduleid) = explode('@', $tile);

		return $coursemoduleid;
	}

	public static function getFavoritesFromPreferences($user) {
		$favourites_user = get_user_preferences('user_bookmarks');	
	}

	public static function getFreshToken($userid) {
		global $DB;
		$tokensql = "SELECT token FROM mdl_external_tokens "
				. "WHERE userid = ? ORDER BY timecreated DESC LIMIT 1";
		$token = $DB->get_record_sql($tokensql, array($userid)); 
		return ! empty($token->token) ? $token->token : null;
	}

	public static function fetchAll($userid, $return = false){
		global $DB;
		$favorites = array();
		$rows = $DB->get_records('users_favorites',array(
			'userid' => $userid,
		));

		$token = self::getFreshToken($userid);
		foreach($rows as $row) {
			$mod = $DB->get_record('course_modules', array('id' => $row->coursemoduleid));

			if(empty($mod))
				continue;

			$separator = (parse_url($row->url, PHP_URL_QUERY) == NULL) ? '?' : '&';
   			$row->url .= $separator . 'token=' . $token;
			$favorites[] = array(
				'id' => $row->coursemoduleid,
				'url' => $row->url,
				'coursemoduleid' => $row->coursemoduleid,
				'course_type' => $row->course_type,
				'file_name' => $row->file_name,
				'file_type' => $row->file_type,
				'fname_upload' => $row->fname_upload,
			);
		}

		if(empty($return)) {
			$fav_comment_count_sql = 'SELECT COUNT(urc.id) AS comment_count
				FROM mdl_user_resource_comments urc
				 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
				 JOIN mdl_course c ON cm.course = c.id
				 JOIN mdl_resource r ON cm.instance = r.id
				WHERE urc.userid = ' . $userid;
			$comments_count = current($DB->get_records_sql($fav_comment_count_sql));							

			$favorites['resource_comment_count'] = $comments_count->comment_count;
			$response = new CliniqueServiceResponce();
		   $response->response(false, 'success',$favorites);
			
		}

		return $favorites;
	}

	public static function delete($userid,  $url, $title, $return = false) {

		global $CFG, $DB;

		$coursemoduleid = self::extractCourseModuleId($title);
		$url = self::cleanUrl($url);
		self::deleteFavorite($userid,  $coursemoduleid);

		if(empty($return)) {
			$response = new CliniqueServiceResponce();
			$response->response(false, 'Removed Favorite Successfully');
		}
	}	

	public static function deleteFavorite($userid, $coursemoduleid) {
		global $CFG, $DB;
		return $DB->delete_records('users_favorites', array(
				'userid' => $userid,
				'coursemoduleid' => $coursemoduleid,
			));
	}	

	public static function addFavorite($userid, $coursemoduleid, $url, $title) {
		global $DB;
		$exists = $DB->get_record('users_favorites',array(
			'userid' => $userid,
			'coursemoduleid' => $coursemoduleid,
		));

		if( ! empty($exists)) {
			return false;
		}

		$id = null; $course_type = null; $file_name = null; $file_type = null; $fname_upload = null;
		list($id, $course_type, $file_name, $file_type, $fname_upload) = explode("@",$title);
		$record = new stdClass();
		$record->userid = $userid;
		$record->coursemoduleid = $coursemoduleid;
		$record->course_type =  ! empty($course_type) ? $course_type : null;
		$record->file_name = ! empty($file_name) ? $file_name : null;
		$record->file_type = ! empty($file_type) ? $file_type : null;
		$record->fname_upload = ! empty($fname_upload) ? $fname_upload : null;
		$record->url = $url;
		$DB->insert_record('users_favorites', $record);		
	}

	public static function deleteFavoriteById($userid, $coursemoduleid) {
	}


	public static function addFavoriteByUrlandTitle($userid, $topicurl, $title) {
	}

	public static function deleteFavoriteByUrlandTitle($userid,  $topicurl, $title) {
	}

	public static function deleteFavorites($userid, $favorites) {
		global $DB;

		foreach($favorites as $favorite) {
			$DB->delete_records('users_favorites', array(
				'userid' => $userid,
				'coursemoduleid' => $favorite->coursemoduleid,
			));
		}	
	}
}