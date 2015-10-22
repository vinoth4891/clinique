<?php

require_once('response.php');

class ProgressPercent {

    public function __analyseUserSearchfield($type, $region, $country, $retailer, $filter) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

        switch ($type) {
            case 'region':

                $regionname = array_values($DB->get_records_sql('SELECT DISTINCT(cr.region) FROM {cascade_region} cr WHERE cr.region != "" ORDER BY cr.region ASC'));

                break;

            case 'country':

                $where = ($filter == 1) ? ' WHERE cr.region=? ORDER BY cr.country ASC' : ' ORDER BY cr.country ASC';

                $params = ($filter == 1) ? array('region' => $region) : array();

                $countryname = array_values($DB->get_records_sql('SELECT DISTINCT(cr.country),c.country_code AS code FROM {cascade_region} cr LEFT JOIN {country} c ON c.country_name=cr.country' . $where, $params));

                break;

            case 'retailer':

                $where = ($filter == 1) ? ' WHERE cr.region=? AND cr.country=? ORDER BY cr.retailer ASC' : ' ORDER BY cr.retailer ASC';

                $params = ($filter == 1) ? array('region' => $region, 'country' => $country) : array();

                $retailername = array_values($DB->get_records_sql('SELECT DISTINCT(cr.retailer) FROM {cascade_region} cr' . $where, $params));

                break;

            case 'store':

                $where = ($filter == 1) ? ' WHERE cr.region=? AND cr.country=? AND cr.retailer=? ORDER BY cr.store ASC' : ' ORDER BY cr.store ASC';

                $params = ($filter == 1) ? array('region' => $region, 'country' => $country, 'retailer' => $retailer) : array();

                $storename = array_values($DB->get_records_sql('SELECT DISTINCT(cr.store) FROM {cascade_region} cr'.$where, $params));

                break;
        }


        $Searchfield = array();

        //Retailer:

        $retailerDetails = array_values($DB->get_records_sql("SELECT uid.data FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'retailer' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));

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
        
        $retailerconcat = array_intersect($registeredretailerres,$allretailersres);

        $Searchfield['retailer'] = $retailerconcat;



        //Store:

        $storeDetails = array_values($DB->get_records_sql("SELECT uid.data AS store FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'store' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));

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

        $storeconcat = array_intersect($registeredstoreres, $allstoresres);

        $Searchfield['store'] = $storeconcat;


        //Region:

        $regionDetails = array_values($DB->get_records_sql("SELECT uid.data FROM {user_info_field} uif, {user_info_data} uid WHERE uif.id = uid.fieldid AND LOWER(uif.shortname) = 'region' AND uid.data != '' GROUP BY uid.data ORDER BY uid.data ASC"));
        
        $Searchfield['region'] = $regionname;


        //Country:

        $Searchfield['country'] = $countryname;
        
        $cohortDetails = $DB->get_records_sql("SELECT c.id, c.name FROM {cohort} c ORDER BY c.name ASC");
        $Searchfield['team'] = $cohortDetails;

        if (!empty($Searchfield)) {
            $response->response(false, 'done', $Searchfield);
        } else {
            $response->response(true, 'no_records');
        }
    }

}

