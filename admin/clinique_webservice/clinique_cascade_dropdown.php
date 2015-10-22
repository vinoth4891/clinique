<?php

require_once('response.php');

class CascadeDropdown {

    public function __cascadedatas($type, $region, $country, $retailer) {
        
        global $CFG, $DB;
        $response = new CliniqueServiceResponce();
        switch ($type) {
            case 'region':

                $regionname = array_values($DB->get_records_sql('SELECT DISTINCT(cr.region) FROM {cascade_region} cr WHERE cr.region != "" ORDER BY cr.region ASC'));
                (count($regionname) > 0) ? $response->response(false, 'region_success', $regionname) : $response->response(true, 'region_failure');

                break;

            case 'country':

                $countryname = array_values($DB->get_records_sql('SELECT DISTINCT(UPPER(cr.country)) AS country,c.country_code AS code FROM {cascade_region} cr LEFT JOIN {country} c ON c.country_name=cr.country WHERE cr.region=? ORDER BY cr.country ASC', array('region'=>$region)));
               
                (count($countryname) > 0) ? $response->response(false, 'country_success', $countryname) : $response->response(true, 'country_failure', 'empty');
               
                break;
            
            case 'retailer':

                $retailername = array_values($DB->get_records_sql("SELECT DISTINCT(cr.retailer) FROM {cascade_region} cr WHERE cr.region='".$region."' AND cr.country='".$country."' AND cr.retailer!='' ORDER BY cr.retailer ASC"));
               
                (count($retailername) > 0) ? $response->response(false, 'retailer_success', $retailername) : $response->response(true, 'retailer_failure', 'empty');
               
                break;
            
            case 'store':

                $storename = array_values($DB->get_records_sql("SELECT DISTINCT(cr.store) FROM {cascade_region} cr WHERE cr.region='".$region."' AND cr.country='".$country."' AND cr.retailer='".$retailer."' AND cr.store != '' ORDER BY cr.store ASC"));
               
                (count($storename) > 0) ? $response->response(false, 'store_success', $storename) : $response->response(true, 'store_failure', 'empty');
               
                break;
        }
    }

}
