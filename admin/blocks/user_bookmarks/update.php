<?php
/**
 * Created on Jul 20, 2012
 *
 * @author Gurvinder Singh
 */

require('../../config.php');

require_login();

if ($bookmarkurl = htmlspecialchars_decode($_GET["bookmarkurl"])
    and $newtitle = htmlspecialchars_decode($_GET["title"]) and confirm_sesskey()) {

    if (get_user_preferences('user_bookmarks')) {

        $bookmarks = explode(',', get_user_preferences('user_bookmarks'));

        $bookmarkupdated = false;

        foreach($bookmarks as $bookmark) {
        	$tempBookmark = explode(';', $bookmark);
        	if ($tempBookmark[0] == $bookmarkurl && $tempBookmark[1] == $newtitle) {
        		$keyToRemove = array_search($bookmark, $bookmarks);
        		$newBookmark = $bookmarkurl . ";" . $newtitle;
        		$bookmarks[$keyToRemove] = $newBookmark;
        		$bookmarkupdated = true;
        	}
        }

        if ($bookmarkupdated == false) {
            //print_error('nonexistentbookmark','admin');
			print("The bookmark you requested does not exist");
            die;
        }

        $bookmarks = implode(',', $bookmarks);
        set_user_preference('user_bookmarks', $bookmarks);

        global $CFG;
        //header("Location: " . $CFG->wwwroot . "/");
		print("Updated  Favorite Successfully");
        die;
    }

    print_error('nobookmarksforuser','admin');
    die;

} else {
    //print_error('invalidsection', 'admin');
	print('Invalid section');
    die;
}
