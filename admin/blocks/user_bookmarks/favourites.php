<?php
	/**
	* @ display favourites avialable for particular users
	*/
	require('../../config.php');
	$favourites_user = get_user_preferences('user_bookmarks');
	$favourites_user = explode(',', get_user_preferences('user_bookmarks'));
            /// Accessibility: markup as a list.
            $favBookmark = array();
            foreach($favourites_user as $favourite_bookmark) {
                $favBookmark = explode(';', $favourite_bookmark);
				echo json_encode($favBookmark); // return json format
			}
			die();

?>