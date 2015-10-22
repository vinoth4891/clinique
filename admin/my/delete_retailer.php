<?php 
require_once('../config.php');
require_once($CFG->libdir.'/adminlib.php');
$id = required_param('id', PARAM_INT);
$confirm = optional_param('confirm', '0', PARAM_INT);
require_login();
admin_externalpage_setup('addstore');

$systemcontext = context_system::instance();
$header = "$SITE->shortname: ".get_string('deleteretailer');
$heading_title = get_string('deleteretailer');
$url = new moodle_url($CFG->wwwroot.'/my/delete_retailer.php', array('id' => $id));

$cancelurl = new moodle_url($CFG->wwwroot.'/my/stores.php');


if($confirm == 0) {
	$PAGE->set_url($url);
	$PAGE->set_context($systemcontext);
	$PAGE->set_pagelayout('admin');

	$PAGE->set_title($header);
	$PAGE->set_heading($header);
	echo $OUTPUT->header();
	echo $OUTPUT->heading($heading_title);
	
	$storedata = $DB->get_record('cascade_region', array('id' => $id));
	if($storedata) {
		$get_user_id = $DB->get_records_sql("SELECT DISTINCT ( userid) FROM 
							(SELECT userid FROM {user_info_data} WHERE ( fieldid = 7 && data = '".$storedata->retailer."' ) AND userid IN  
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 2 && data = '".$storedata->region."' ))) AS tmp 
							JOIN {user} u ON tmp.userid = u.id 
							JOIN {country} c ON BINARY u.`country` = BINARY c.`country_code` 
							WHERE  c.`country_name` LIKE '".$storedata->country."'");
		
		foreach($get_user_id as $key => $value) {
			$userIdList[] = $value->userid;
		}
		echo '<h5 style="text-align:center;">' . get_string('store_info_data_affected', 'admin', count($userIdList)) . '</h5>';
		echo '<h5 style="text-align:center;">' . get_string('store_retailer_confirm_delete', 'admin', $storedata->retailer) . '</h5>';
	}
	$deleteurl = new moodle_url($CFG->wwwroot.'/my/delete_retailer.php', array('id' => $id, 'confirm' => '1')); // required, but you can use a string instead
	$cancelurl = new moodle_url($CFG->wwwroot.'/my/stores.php');
	echo '<div style="text-align:center;"><a href="'.$deleteurl.'">' . get_string('delete') . '</a>&nbsp;&nbsp;&nbsp;'; 
	echo '<a href="'.$cancelurl.'">' . get_string('cancel') . '</a></div>'; 
	echo $OUTPUT->footer();
	exit;
}


if($id != "" && $confirm == 1) {
	$storedata = $DB->get_record('cascade_region', array('id' => $id));
	if($storedata) {
		$get_user_id = $DB->get_records_sql("SELECT DISTINCT ( userid) FROM 
							(SELECT userid FROM {user_info_data} WHERE ( fieldid = 7 && data = '".$storedata->retailer."' ) AND userid IN 
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 2 && data = '".$storedata->region."' ))) AS tmp 
							JOIN {user} u ON tmp.userid = u.id 
							JOIN {country} c ON BINARY u.`country` = BINARY c.`country_code` 
							WHERE  c.`country_name` LIKE '".$storedata->country."'");
		
		foreach($get_user_id as $key => $value) {
			$userIdList[] = $value->userid;
		}
		$userIds = implode('","', $userIdList);
		if($userIdList) {
			try {
				$transaction = $DB->start_delegated_transaction();
				$country_count = $DB->count_records_sql("SELECT COUNT(*) FROM {cascade_region} WHERE region = '".$storedata->region."' AND country = '".$storedata->country."'");
				if($country_count > 1) {
					$DB->delete_records('cascade_region', array('region' => $storedata->region, 'country'=> $storedata->country, 'retailer' => $storedata->retailer));
				} else {
					$DB->execute("UPDATE {cascade_region} SET store='', retailer = '' WHERE region = '".$storedata->region."' AND country = '".$storedata->country."' AND retailer = '".$storedata->retailer."'");
				}				
				$user_delete_sql_query = 'DELETE FROM {user_info_data} WHERE userid IN ("' . $userIds . '") AND fieldid = 7 AND data = "'.$storedata->retailer.'"';
				$DB->execute($user_delete_sql_query);
				$transaction->allow_commit();
				$error_sql = 0;
			} catch(Exception $e) {
				$transaction->rollback($e);
				$error_sql = 1;
			}
		} else {
			$country_count = $DB->count_records_sql("SELECT COUNT(*) FROM {cascade_region} WHERE region = '".$storedata->region."' AND country = '".$storedata->country."'");
			if($country_count > 1) {
				$DB->delete_records('cascade_region', array('region' => $storedata->region, 'country'=> $storedata->country, 'retailer' => $storedata->retailer));
			} else {
				$DB->execute("UPDATE {cascade_region} SET store='', retailer = '' WHERE region = '".$storedata->region."' AND country = '".$storedata->country."' AND retailer = '".$storedata->retailer."'");
			}
			$message = get_string('store_retailer_flash_delete_success', 'admin');
			$redirecturl = new moodle_url($CFG->wwwroot.'/my/stores.php');
			redirect($redirecturl, $message);
		}
	}
}
if($error_sql) {
	$message = 'Error while deleting records.';
} else {
	$message = get_string('store_retailer_info_delete_stat_success', 'admin', count($userIdList));
}
$redirecturl = new moodle_url($CFG->wwwroot.'/my/stores.php');
redirect($redirecturl, $message);