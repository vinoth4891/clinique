<?php
require_once('../config.php');

$type = $_REQUEST['type'];
$region = $_REQUEST['region'];
switch ($type) {
    case 'country':
        $countryname = array_values($DB->get_records_sql('SELECT DISTINCT(LOWER(cr.country)) AS country FROM {cascade_region} cr WHERE cr.region = "'.$region.'" ORDER BY cr.country ASC'));
		array_walk($countryname, function($country) {
			$country->country = mb_convert_case(trim($country->country), MB_CASE_TITLE,"UTF-8");
		});
		echo json_encode($countryname);
        break;
	case "country_retailer":
		$country = $_REQUEST['country'];
		$countryname = array_values($DB->get_records_sql('SELECT DISTINCT(LOWER(cr.country)) AS country FROM {cascade_region} cr WHERE cr.region = "'.$region.'" ORDER BY cr.country ASC'));
		$retailername = array_values($DB->get_records_sql('SELECT DISTINCT(LOWER(cr.retailer)) AS retailer FROM {cascade_region} cr WHERE cr.country = "'.$country.'" AND cr.region = "'.$region.'" ORDER BY cr.retailer ASC'));
		array_walk($countryname, function($country) {
			$country->country = mb_convert_case(trim($country->country), MB_CASE_TITLE,"UTF-8");
		});
		array_walk($retailername, function($retailer) {
			$retailer->retailer = mb_convert_case(trim($retailer->retailer), MB_CASE_TITLE,"UTF-8");// (mb_strtolower(trim(utf8_encode($retailer->retailer))));
		});
		$resArr = array('country' => $countryname, 'retailer' => $retailername);
		echo json_encode($resArr);
        break;
    case "retailer":
		$country = $_REQUEST['country'];
		$retailername = array_values($DB->get_records_sql('SELECT DISTINCT(cr.retailer) AS retailer FROM {cascade_region} cr WHERE cr.country = "'.$country.'" AND cr.region = "'.$region.'" ORDER BY cr.retailer ASC'));
		array_walk($retailername, function($retailer) {
			$retailer->retailer = mb_convert_case(trim($retailer->retailer), MB_CASE_TITLE,"UTF-8");// (mb_strtolower(trim(utf8_encode($retailer->retailer))));
		});
        echo json_encode($retailername);
        break;
}
?>