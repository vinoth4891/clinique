<?php

header('Access-Control-Allow-Origin: *');
define('AJAX_SCRIPT', true);
require_once('../../config.php');
require_once('response.php');
require_once('clinique_sync.php');


class SyncService {

    public static function invokeService() {
		$request = file_get_contents('php://input');
		$request = json_decode($request);
		$userId = self::get_user_id( $request->token);

		if(empty($userId)) {
			$response = new CliniqueServiceResponce();
			$response->response(true, 'Invalid user');
			die;
		}
        switch ($request->type) {
			case 'bookmark':
				Sync::syncBookmarks($userId, $request->data);
				break;
			case 'notes':			
				Sync::syncNotes($userId, $request->data);
				break;	
			case 'favorite':
				Sync::syncFavorites($userId, $request->data);
				break;								
			case 'badges':
			    Sync::syncBadges($userId, $request->data);				
				break;
			case 'quiz':
			    Sync::syncQuiz($userId, $request);				
				break;	
			case 'scorm':
			    Sync::syncScorm($userId, $request);				
				break;
            case 'completion':
			    Sync::syncCompletion($userId, $request);				
				break;
        }
    }

	private static function get_user_id($token) {
		global $DB;
		$user = current(array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', array('token' => $token))));
		return empty($user->userid) ? null : $user->userid;
	}
}

SyncService::invokeService();
