<?php 
require_once('../../config.php');
require_once('clinique_cascade_dropdown.php');
class LookupService {
    public static function getBadges() {
	   global $CFG, $DB;
	   $badgedetails = array_values($DB->get_records_sql('SELECT id,badge_name,badge_value FROM {badge} ORDER BY badge_value'));
	   self::send($badgedetails);
	
	}
	public static function send($data) {
		header('Content-Type: application/json');		
        echo json_encode($data);
		exit;
	}
	

}
if ( $_REQUEST['type'] == "badges" ) {
    LookupService::getBadges();
} elseif ( !empty($_REQUEST['type'])) {
	$type = $_REQUEST['type'];
	$region = $_REQUEST['region'];
	$country = $_REQUEST['country'];
	$retailer = $_REQUEST['retailer'];	
   CascadeDropdown::__cascadedatas($type, $region, $country, $retailer);
}

?>