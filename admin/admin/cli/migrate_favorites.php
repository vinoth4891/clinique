<?php

define('CLI_SCRIPT', true);
require_once('../../config.php');
require_once('../../v2/clinique_webservice/favorite.php');
require_once($CFG->libdir . '/adminlib.php');

global $CFG, $DB;

ini_set('memory_limit', '1024M');
set_time_limit(0);

$bookmarks = $DB->get_records('user_preferences',array(
	'name' => 'user_bookmarks',
));

foreach($bookmarks as $bookmark_comma_separtaed) {
	if(empty($bookmark_comma_separtaed))
		continue;

	$favorites = explode(',', $bookmark_comma_separtaed->value);

	foreach($favorites as $favorite) {
		if(empty($favorite))
			continue;

		$url = null; $title = null;
		list($url, $title) = explode(';', $favorite);

		if(empty($url) || empty($title))
			continue;

		$url = Favorite::cleanUrl($url);
		$coursemoduleid = Favorite::extractCourseModuleId($title);
		Favorite::addFavorite($bookmark_comma_separtaed->userid,  $coursemoduleid, $url, $title);
	}
}				
