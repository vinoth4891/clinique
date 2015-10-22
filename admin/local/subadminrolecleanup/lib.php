<?php

defined('MOODLE_INTERNAL') || die();

function local_on_role_unassigned($ra) {
	global $DB;
	$removedrole = $DB->get_record('role', array(
		'id' => $ra->roleid,
	));

	if(is_subadmin_role($removedrole)) {
		remove_all_assigned_languages($ra->userid);
	}

	return true;
}

function is_subadmin_role($removedrole) {
	return $removedrole->shortname === 'subadmin';
}

function remove_all_assigned_languages($userid) {
	global $DB;
	
	return $DB->delete_records('country_user', array('userid' => $userid));
}

