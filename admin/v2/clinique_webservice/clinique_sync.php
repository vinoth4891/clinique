<?php
require_once 'clinique_complete_user_data.php';
require_once 'favorite.php';
require_once('quiz_update.php');
require_once('scorm_update.php');
require_once('completion_tracking.php');
class Sync {
	public static function syncBookmarks($userid, $bookmarks) {

		if(isset($bookmarks->deleted) && is_array($bookmarks->deleted)){
			self::deleteBookmarks($userid, $bookmarks->deleted);
		}
		if(isset($bookmarks->added) && is_array($bookmarks->added)){
			self::addBookmarks($userid, $bookmarks->added);
		}

		$syncedbookmarks = CompleteUserData::getBookmarks($userid);
		self::send($syncedbookmarks);
	}

	public static function syncFavorites($userid, $favorites) {

		if(isset($favorites->deleted) && is_array($favorites->deleted)){
			self::deleteFavorites($userid, $favorites->deleted);
		}
		if(isset($favorites->added) && is_array($favorites->added)){
			self::addFavorites($userid, $favorites->added);
		}

		$syncedfavorites = Favorite::fetchAll($userid, true);
		self::send($syncedfavorites);
	}

	public static function addBookmarks($userid, $bookmarks) {
		global $DB;

		foreach($bookmarks as $bookmark) {
			$record = new stdClass();
			$record->userid = $userid;
			$record->coursemoduleid = $bookmark->coursemoduleid;

			foreach($bookmark->pages as $page) {
				$record->page_number = $page;
				$bookmarkRecord = $DB->get_record('user_pdf_bookmarks',array(
					'userid' => $userid,
					'coursemoduleid' => $bookmark->coursemoduleid,
					'page_number' => $page
				));
              if(empty($bookmarkRecord->id)){
                 $DB->insert_record('user_pdf_bookmarks', $record);
              }			  
			}
		}		
	}

	public static function deleteBookmarks($userid, $bookmarks) {
		global $DB;

		foreach($bookmarks as $bookmark) {
			foreach($bookmark->pages as $page) {
				$record->page_number = $page;
				$DB->delete_records('user_pdf_bookmarks', array(
					'userid' => $userid,
					'coursemoduleid' => $bookmark->coursemoduleid,
					'page_number' => $page,
				));
			}
		}	
	}

	public static function addFavorites($userid, $favorites) {
		global $DB;

		foreach($favorites as $favorite) {
			$exists = $DB->get_record('users_favorites',array(
				'userid' => $userid,
				'coursemoduleid' => $favorite->coursemoduleid,
			));

			if( ! empty($exists) || empty($favorite->url) || ! filter_var($favorite->url, FILTER_VALIDATE_URL)) {
				continue;
			}

			$favorite->userid = $userid;
			$DB->insert_record('users_favorites', $favorite);
		}		
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
	public static function send($data) {
		header('Content-Type: application/json');		
        echo json_encode($data);
		exit;

         /* $response = new CliniqueServiceResponce();
		if(!empty($data)){
			$response->response(false, 'null', $data);
		} else{
		$response->response(true, 'msg', "No records");
			}*/
		}

	//Notes sync code starts
	public static function syncNotes($userid, $notes) {

		if(isset($notes->deleted) && is_array($notes->deleted)){
			self::deleteNotes($userid, $notes->deleted);
		}
		if(isset($notes->added) && is_array($notes->added)){
			self::addNotes($userid, $notes->added);
		}

		$syncednotes = CompleteUserData::getNotes($userid);
		self::send($syncednotes);
	}
   public static function addNotes($userid, $notes) {
		global $DB;
	     $now = new DateTime();
         $date = $now->format('Y-m-d H:i:s');

		foreach($notes as $note) {
        $commentRecord = $DB->get_record('user_resource_comments',array(
			'userid' => $userid,
			'coursemoduleid' => $note->coursemoduleid,
		));
          $record = new stdClass();
          if(empty($commentRecord->id)) {
              $record->userid = $userid;
			  $record->coursemoduleid = $note->coursemoduleid;		
			  $record->comment = $note->comment;	
			  $DB->insert_record('user_resource_comments', $record); 
          } else {
              $record->id = $commentRecord->id;
              $record->coursemoduleid = $note->coursemoduleid;		
			  $record->comment = $note->comment;
			  $record->timemodified = $date;
			  $ret = $DB->update_record('user_resource_comments', $record, $bulk=false);
          }				
		}		
	}

	public static function deleteNotes($userid, $notes) {
		global $DB;

		foreach($notes as $note) {			
				$DB->delete_records('user_resource_comments', array(
					'userid' => $userid,
					'coursemoduleid' => $note->coursemoduleid					
				));
		}	
	}
	
	//Badges starts here
	public static function syncBadges($userid, $badges) {
		if(isset($badges->added) && is_array($badges->added)){
			foreach($badges->added as $badge) {
				BadgeDisplay::__DisplayBadges($userid, 'getBadges', $badge->id, true);
			}
		}

		$badges = BadgeDisplay::__DisplayBadges($userid, 'getBadges', null, true);
		$badges = ! empty($badges) ? $badges : array();
		self::send($badges);	
	}

	//QUIZ PROCESS STARTS HERE
    public static function syncQuiz($userid, $request) {
		global $DB;
	     QuizUpdate::__QuizUpdate($userid,$request);
	}
    public static function syncCompletion($userid, $request) {
	     CompletionUpdate::__CompletionUpdate($userid,$request);
	}    
	//Scorm 
	public static function syncScorm($userid, $request) {
		global $DB;
	     ScormUpdate::__ScormUpdate($userid,$request);
	}
}
