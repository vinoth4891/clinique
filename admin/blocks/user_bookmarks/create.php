<?php

require('../../config.php');

//require_login();
// and confirm_sesskey()
if ($bookmarkurl = htmlspecialchars_decode($_GET["bookmarkurl"]) and $title = htmlspecialchars_decode($_GET["title"])) {

    /**
     * This gets the user_bookmarks
     */
    if (get_user_preferences('user_bookmarks')) {
        $bookmarks = explode(',', get_user_preferences('user_bookmarks'));

        if (in_array(($bookmarkurl . ";" . $title), $bookmarks)) {
            //print_error('bookmarkalreadyexists','admin');
			print("You have already bookmarked this page");
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
	print "Added Favourite Successfully";
	die;
} else {
    print('invalidsection');
    die;
}


