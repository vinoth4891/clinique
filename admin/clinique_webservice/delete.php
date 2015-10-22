<?php
 require_once('response.php');

 require_once('favorites.php');

class RemoveFavorites{

	public function __remove($bookmarkurl,$title,$tokenval){

		global $CFG,$DB;

        $bookmarkurl = htmlspecialchars_decode($bookmarkurl);

		$title       = htmlspecialchars_decode($title);

		$response = new CliniqueServiceResponce();

        $token_val = array('token'=>$tokenval); // Get user token

		/**
		 * @get user id from external_tokens table
		 *
		 */
		$userId = array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', $token_val));

		if($userId){

			$user_id = array('id' => $userId[0]->userid);

			//if(confirm_sesskey()){

			$user = array_values($DB->get_records_sql('SELECT * FROM {user} u WHERE u.id=?', $user_id));

			Favorites::__fav_user_login($user['0']);

			$bookmarks = explode(',', get_user_preferences('user_bookmarks'));

			$bookmarkremoved = false;

			foreach($bookmarks as $bookmark) { // check the bookmarkurl and title given values to delete from preference
				$tempBookmark = explode(';', $bookmark);

				if ($tempBookmark[0] == $bookmarkurl && $tempBookmark[1] == $title) {
					$keyToRemove = array_search($bookmark, $bookmarks);
					unset($bookmarks[$keyToRemove]);
					$bookmarkremoved = true;
				}
			}
			if ($bookmarkremoved == false) {

				$response->response(true, 'The bookmark you requested does not exist');
				die;
			}

			$bookmarks = implode(',', $bookmarks);
			set_user_preference('user_bookmarks', $bookmarks);

			global $CFG;
			//header("Location: " . $CFG->wwwroot . $bookmarkurl);
			$response->response(false, 'Removed Favorite Successfully');
			die;
		} else{

			$response->response(true, 'Invalid user');
			die;

		}

	}
}

		?>