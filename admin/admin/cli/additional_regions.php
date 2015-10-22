<?php

define('CLI_SCRIPT', true);
require_once('../../config.php');
require_once($CFG->libdir . '/adminlib.php');

global $CFG, $DB;

ini_set('memory_limit', '1024M');
set_time_limit(0);

//Requirment #1
define('TRAVEL_RETAIL_EUROPE_MIDDLE_EAST_AFRICA', 'TRAVEL RETAIL - EUROPE/MIDDLE EAST/AFRICA');
//Requirment #2
define('TRAVEL_RETAIL_ASIA_PACIFIC', 'TRAVEL RETAIL ASIA PACIFIC');
//Requirment #3
define('TRAVEL_RETAIL_NORTH_AMERICA', 'TRAVEL RETAIL NORTH AMERICA');
//Requirment #4
define('TRAVEL_RETAIL_CENTRAL_SOUTH_AMERICA', 'TRAVEL RETAIL CENTRAL AND SOUTH AMERICA');
//Requirment #5
define('TRAVEL_RETAIL_MEXICO_CARIBBEAN', 'TRAVEL RETAIL MEXICO AND CARIBBEAN');

//Requirment #1
//Travel Retail Europe/Middle East/Africa – 
//Please include all countries that are included under Europe/Middle East/Africa Region,
//as well as those listed under UK Region 
$regions = array(
	'europe_middle_east_africa' => 'Europe/Middle East/Africa',
	'united_kingdom' => 'United Kingdom',
); 
$country_sql = 'SELECT DISTINCT(UPPER(cr.country)) AS country'
		. ' FROM {cascade_region} cr'
		. ' WHERE cr.region = :region1 OR cr.region= :region2 ORDER BY cr.country ASC';
$countries = array_values($DB->get_records_sql($country_sql, array(
	'region1'=>$regions['europe_middle_east_africa'],
	'region2' =>$regions['united_kingdom'],
)));

foreach($countries as $country) {
	if(empty($country->country))
		continue;
	$cascade_data = new stdClass;
	$cascade_data->region = TRAVEL_RETAIL_EUROPE_MIDDLE_EAST_AFRICA;
	$cascade_data->country = $country->country;
	$cascade_data->retailer = null;
	$cascade_data->store = null;
	
	$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);		
}

//Requirement #2
//Travel Retail Asia Pacific – Please include all countries that are included in the Asia Pacific Region
$region = 'Asia Pacific';
$country_sql = 'SELECT DISTINCT(UPPER(cr.country)) AS country'
. ' FROM {cascade_region} cr'
. ' WHERE cr.region = ? ORDER BY cr.country ASC';
$countries = array_values($DB->get_records_sql($country_sql, array(
	'region' => $region,
)));

foreach($countries as $country) {
	if(empty($country->country))
		continue;
	$cascade_data = new stdClass;
	$cascade_data->region = TRAVEL_RETAIL_ASIA_PACIFIC;
	$cascade_data->country = $country->country;
	$cascade_data->retailer = null;
	$cascade_data->store = null;
	
	$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);		
}

//Requirement #3
//Travel Retail North America – Please include all countries that are included in the North America Region
$region = 'North America';
$country_sql = 'SELECT DISTINCT(UPPER(cr.country)) AS country'
. ' FROM {cascade_region} cr'
. ' WHERE cr.region = ? ORDER BY cr.country ASC';
$countries = array_values($DB->get_records_sql($country_sql, array(
	'region' => $region,
)));

foreach($countries as $country) {
	if(empty($country->country))
		continue;
	$cascade_data = new stdClass;
	$cascade_data->region = TRAVEL_RETAIL_NORTH_AMERICA;
	$cascade_data->country = $country->country;
	$cascade_data->retailer = null;
	$cascade_data->store = null;
	
	$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);		
}

//Requirement #4
//Travel Retail North America – Please include all countries that are included in the North America Region
$countries = array(
	'Guatemala',
	'El Salvador',
	'Costa Rica',
	'Nicaragua',
	'Panama',
	'Colombia',
	'Ecuador',
	'Peru',
	'Chile',
	'Paraguay',
	'Argentina',
	'Uruguay',
	'Brazil ',
	'Venezuela',
);
foreach($countries as $country) {
	$cascade_data = new stdClass;
	$cascade_data->region = TRAVEL_RETAIL_CENTRAL_SOUTH_AMERICA;
	$cascade_data->country = $country;
	$cascade_data->retailer = null;
	$cascade_data->store = null;
	
	$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);		
}

//Requirement #5
//Travel Retail North America – Please include all countries that are included in the North America Region
$countries = array(
	'Mexico',
	'Aruba',
	'Curacao',
	'Dominican Republic',
	'Puerto Rico',
	'Bahamas',
	'USVI',
	'St. Maarten',
	'Grand Cayman',
	'Antigua',
	'Barbados',
	'Guadalupe',
	'Martinique',
	'St. Lucia',
	'Trinidad',
);
foreach($countries as $country) {
	$cascade_data = new stdClass;
	$cascade_data->region = TRAVEL_RETAIL_MEXICO_CARIBBEAN;
	$cascade_data->country = $country;
	$cascade_data->retailer = null;
	$cascade_data->store = null;
	
	$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);		
}
