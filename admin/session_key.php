<?php
require('/config.php');
global $CFG;
$sesskey = "";

class favourite{
	function init(){

		session_name('MoodleSession');
		session_start();
		$sesskey = $_SESSION['USER']->sesskey;
		print $sesskey;
	}

}
 $obj    = new favourite();
 $sesskey = $obj->init();
?>