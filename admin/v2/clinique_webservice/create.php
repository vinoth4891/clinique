<?php
require_once('response.php');

require_once('favorites.php');


class CreateFavorites{

	public function __create($bookmarkurl,$title,$tokenval){
	     global $CFG,$DB;

		  $response = new CliniqueServiceResponce();

		  $token_val = array('token'=>$tokenval);

		  $userId = array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', $token_val));

		  if($userId){

				$user_id = array('id' => $userId[0]->userid);

				//if(confirm_sesskey()){

				$user = array_values($DB->get_records_sql('SELECT * FROM {user} u WHERE u.id=?', $user_id));

				Favorites::__fav_user_login($user['0']);

				if (get_user_preferences('user_bookmarks')) {

					$bookmarks = explode(',', get_user_preferences('user_bookmarks'));

				if (in_array(($bookmarkurl . ";" . $title), $bookmarks)) {

					$response->response(true, 'You have already bookmarked');
					die;

				}

				} else {

					$bookmarks = array();
				}

			//adds the bookmark at end of array
			$bookmarks[] = $bookmarkurl . ";" . $title;
			$bookmarks = implode(',', $bookmarks);

			//adds to preferences table
			set_user_preference('user_bookmarks', $bookmarks);

			global $CFG;
			//header("Location: " . $CFG->wwwroot . "/");
			//print "Added Favourite Successfully";
			 $response->response(false, 'Added Favourite Successfully');
			die;
		}else{
			$response->response(false, 'Invalid user');
			die;

		}

	}

}


