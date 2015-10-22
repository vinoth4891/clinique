<?php

require_once('response.php');

class ProgressPercent {

    public function __analyseCourseSearchfield($type, $region, $country, $retailer, $filter) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

        $region_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Region%'"));
		$retaile_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Retailer%'"));
		$store_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Store%'"));
		$CourseSearchfield = array();
				
        switch ($type) {
            case 'region':

				// Junk retailers and travel retail north america are ignored in the response
                $regionname = array_values($DB->get_records_sql('SELECT DISTINCT(r.region) FROM {reports} r'
						. ' WHERE r.region NOT IN ("", "Choose...", "Выбрать...") ORDER BY r.region ASC'));
                $CourseSearchfield['region'] = $regionname;
                break;

            case 'country':

                $where = ($filter == 1) ? ' WHERE r.region=? AND r.country !="" ORDER BY r.country ASC' : ' WHERE r.country !="" ORDER BY r.country ASC';

                $params = ($filter == 1) ? array('region' => $region) : array();
                
                $countryname = array_values($DB->get_records_sql('SELECT DISTINCT(r.country) AS CODE,c.country_name AS countery FROM {reports} r LEFT JOIN {country} c ON c.country_code=r.country' . $where, $params));
				$CourseSearchfield['country_filter'] = 0;
				if($filter == 1) {
				    $retailername = array_values($DB->get_records_sql("SELECT DISTINCT(r.retailer) FROM {reports} r WHERE r.region='".$region."' AND r.retailer IS NOT NULL ORDER BY r.retailer ASC"));
				    $storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE r.region='".$region."' AND r.store IS NOT NULL ORDER BY r.store ASC"));
					$CourseSearchfield['country_filter'] = 1;
				} else {
				    $retailername = array_values($DB->get_records_sql("SELECT DISTINCT(r.retailer) FROM {reports} r WHERE r.retailer IS NOT NULL ORDER BY r.retailer ASC"));
				    $storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE r.store IS NOT NULL ORDER BY r.store ASC"));
					$CourseSearchfield['country_filter'] = 0;
				}
                $CourseSearchfield['country'] = $countryname;
				$CourseSearchfield['retailer'] = $retailername;
				$CourseSearchfield['store'] = $storename;
                //print_r($countryname); exit; //echo sprintf('SELECT DISTINCT(cr.country),c.country_code AS code FROM {cascade_region} cr LEFT JOIN {country} c ON c.country_name=cr.country'.$where, $params); exit;
                break;

            case 'retailer':
 
                $where = ($filter == 1) ? ' WHERE r.region=? AND r.country=? ORDER BY r.retailer ASC' : ' ORDER BY r.retailer ASC';

                $params = ($filter == 1) ? array('region' => $region, 'country' => $country) : array();
                
				if($filter == 1) { 
                   $where = "r.id!=''";
					if($region !='') {
					  $where .= " AND r.region='".$region."'";
					}
					if($country !='') {
					  $where .= " AND r.country='".$country."'";
					}
				   $retailername = array_values($DB->get_records_sql("SELECT DISTINCT(r.retailer) FROM {reports} r WHERE $where AND r.retailer IS NOT NULL ORDER BY r.retailer ASC"));
				   $storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE $where AND r.store IS NOT NULL ORDER BY r.store ASC"));
				   $CourseSearchfield['retailer_filter'] = 1;
				} else {
				  $retailername = array_values($DB->get_records_sql("SELECT DISTINCT(r.retailer) FROM {reports} r WHERE r.retailer IS NOT NULL ORDER BY r.retailer ASC"));
				  $storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE r.store IS NOT NULL ORDER BY r.store ASC"));
				  $CourseSearchfield['retailer_filter'] = 0;
				}
				
				
				
				/*$userretailerlist = array_values($DB->get_records_sql("SELECT DISTINCT uid.data FROM mdl_user_info_data uid WHERE uid.data != '' AND uid.fieldid=".$retaile_id[0]->id." AND uid.userid IN (SELECT userid FROM mdl_user_info_data WHERE fieldid = ".$region_id[0]->id." AND DATA != '' AND DATA = '".$region."') AND uid.userid IN (SELECT u.id FROM mdl_user u, mdl_country c WHERE u.country = c.country_code AND  LOWER(c.country_name) = LOWER('".$country."'))"));*/

                //echo sprintf('SELECT DISTINCT(cr.retailer) FROM {cascade_region} cr'.$where, $params); exit;
                $CourseSearchfield['retailer'] = $retailername;
				$CourseSearchfield['store'] = $storename;
                break;

            case 'store':

                $where = ($filter == 1) ? ' WHERE r.region=? AND r.country=? AND r.retailer=? ORDER BY r.store ASC' : ' ORDER BY r.store ASC';
                
                $params = ($filter == 1) ? array('region' => $region, 'country' => $country, 'retailer' => $retailer) : array();
                
				foreach($retailer as $key => $value) {
				  $retailerstr .='"'.$value.'",';
				}
				$retailersrtval = substr($retailerstr,0,-1);
				
				if($filter == 1) {
					$where = "r.id!=''";
					if($region !='') {
					  $where .= " AND r.region='".$region."'";
					}
					if($country !='') {
					  $where .= " AND r.country='".$country."'";
					}
					if($retailersrtval !='' && $retailersrtval !='"sel_all"') {
					  $where .= " AND retailer IN(".$retailersrtval.")";
					}
					$storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE $where AND r.store IS NOT NULL ORDER BY r.store ASC"));
					$CourseSearchfield['store_filter'] = 1;
				} else {
				   $storename = array_values($DB->get_records_sql("SELECT DISTINCT(r.store) FROM {reports} r WHERE r.store IS NOT NULL ORDER BY r.store ASC"));
				   $CourseSearchfield['store_filter'] = 0;
				}
				
				/*$userretailerlist = array_values($DB->get_records_sql("SELECT DISTINCT uid.data FROM mdl_user_info_data uid WHERE uid.data != '' AND uid.fieldid=".$store_id[0]->id." AND uid.userid IN (SELECT userid FROM mdl_user_info_data WHERE fieldid = ".$region_id[0]->id." AND DATA != '' AND DATA = '".$region."') AND uid.userid IN (SELECT userid FROM mdl_user_info_data WHERE fieldid = ".$retaile_id[0]->id." AND DATA != '' AND DATA = '".$retailer."') AND uid.userid IN (SELECT u.id FROM mdl_user u, mdl_country c WHERE u.country = c.country_code AND  LOWER(c.country_name) = LOWER('".$country."'))"));*/
				$CourseSearchfield['store'] = $storename;
                break;
        }


      

        /* $coursenameDetails = $DB->get_records_sql("SELECT c.id, c.fullname FROM {course} c WHERE c.visible = 1 ORDER BY c.fullname ASC");
          $CourseSearchfield['course'] = $coursenameDetails; */

        //Retailer:

        /*$retailerDetails = array_values($DB->get_records_sql("SELECT uid.data FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'retailer' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));

        $registeredretailer = json_decode(json_encode($retailerDetails), true);
        $allretailers = json_decode(json_encode($retailername), true);

        $registeredretailerres = array(); // initialize result

        array_walk_recursive($registeredretailer, function($item) use (&$registeredretailerres) {
            // flatten the array
            $registeredretailerres[] = trim($item);
        });

        $allretailersres = array(); // initialize result

        array_walk_recursive($allretailers, function($item) use (&$allretailersres) {
            // flatten the array
            $allretailersres[] = trim($item);
        });

        
        $retailerconcat = array_intersect($registeredretailerres, $allretailersres);*/

        

        //Store:

        /*$storeDetails = array_values($DB->get_records_sql("SELECT uid.data AS store FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'store' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));

        $registeredstore = json_decode(json_encode($storeDetails), true);
        $allstores = json_decode(json_encode($storename), true);

        
        $registeredstoreres = array(); // initialize result

        array_walk_recursive($registeredstore, function($item) use (&$registeredstoreres) {
            // flatten the array
            $registeredstoreres[] = trim($item);
        });

        $allstoresres = array(); // initialize result

        array_walk_recursive($allstores, function($item) use (&$allstoresres) {
            // flatten the array
            $allstoresres[] = trim($item);
        });

        $storeconcat = array_intersect($registeredstoreres, $allstoresres);*/

        

        
        /*$regionDetails = array_values($DB->get_records_sql("SELECT uid.data FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'region' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));*/

        
        


        //Country:

        $cohortDetails = $DB->get_records_sql("SELECT c.id, c.name FROM {cohort} c ORDER BY c.name ASC");
        $CourseSearchfield['team'] = $cohortDetails;


        if (!empty($CourseSearchfield)) {
            $response->response(false, 'done', $CourseSearchfield);
        } else {
            $response->response(true, 'no_records');
        }
    }

}

