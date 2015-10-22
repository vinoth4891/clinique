<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');

$region = $_REQUEST['region'];
$type = $_REQUEST['type'];

if($type == 'country') {
	//$region = implode('","', $region);
	$region = $region;
	$countryname = array_values($DB->get_records_sql('SELECT DISTINCT(UPPER(cr.country)) AS country,c.country_code AS code FROM {cascade_region} cr LEFT JOIN {country} c ON c.country_name=cr.country WHERE cr.region IN ("'.$region.'") ORDER BY cr.country ASC'));
	echo json_encode($countryname);
}	

 //$countryname = array_values($DB->get_records_sql('SELECT DISTINCT(UPPER(cr.country)) AS country,c.country_code AS code FROM {cascade_region} cr LEFT JOIN {country} c ON c.country_name=cr.country WHERE cr.region=? ORDER BY cr.country ASC', array('region'=>$region)));
               
  //(count($countryname) > 0) ? $response->response(false, 'country_success', $countryname) : $response->response(true, 'country_failure', 'empty');

?>