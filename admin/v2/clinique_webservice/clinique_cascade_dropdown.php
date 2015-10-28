<?php
require_once('response.php');

class CascadeDropdown {

    public function __cascadedatas($type, $region, $country, $retailer) {
        
        global $CFG, $DB;
        $response = new CliniqueServiceResponce();
        switch ($type) {
            case 'region':
				// Admin panel user creation uses user_info_field table to render region field 
				// Assumed source would be up to date and can be used across the app
				$regionrow = $DB->get_record_sql('SELECT param1 FROM {user_info_field}'
						. ' WHERE shortname = "region"');
				$regions = explode("\n",  $regionrow->param1);				
                $regions = array_values($regions);                
				$regions = array_map(function($region_name) {
					$region = new stdClass();
					if(strstr($region_name, '/')){
						$region_name = explode('/', strtolower($region_name));
						$region->region = implode('/', array_map('ucwords',$region_name));
                    }else{
                        $region->region = $region_name; //ucwords(strtolower($region_name));
                    }
					return $region;
				}, $regions); 
                
                (count($regions) > 0) ? $response->response(false, 'region_success', $regions) : $response->response(true, 'region_failure');
                break;

            case 'country':
				$countrySP = "CALL mdl_get_country_master('$region')";
				$countries = $DB->get_records_sp($countrySP);
				$country_ret = array();

				foreach($countries as $country) {
					$country_ret[] = self::getCountryByName($country->countery);
				}
				
                (count($countries) > 0) ? $response->response(false, 'country_success', $country_ret) : $response->response(true, 'country_failure', 'empty');
                break;
            
            case 'retailer':
              	$retailerSP = "CALL mdl_get_retailer_master('$region', '$country')"; 
				$retailername = array_values($DB->get_records_sql($retailerSP));
                array_walk($retailername, function($retailer) {
			        $retailer->retailer = mb_convert_case(trim($retailer->retailer), MB_CASE_TITLE,"UTF-8");
		          });                
                (count($retailername) > 0) ? $response->response(false, 'retailer_success', $retailername) : $response->response(true, 'retailer_failure', 'empty');
                break;
            
            case 'store':
                $retailer = addslashes($retailer);
				$storeSP = "CALL mdl_get_store_master('$region', '$country','$retailer')";
				$storename = array_values($DB->get_records_sql($storeSP));
                array_walk($storename, function($store) {
			        $store->store = mb_convert_case(trim($store->store), MB_CASE_TITLE,"UTF-8");
		          });
                // echo "<pre>"; print_r($storename); die;
                (count($storename) > 0) ? $response->response(false, 'store_success', $storename) : $response->response(true, 'store_failure', 'empty');
                break;
        }
    }

    public function getCountryByName($name)
    {
        global $CFG, $DB;
        $country = $DB->get_record('country', array(
            'country_name' => $name,
        ));

		if( ! empty($country)) {
			$ret = array(
				'code' => $country->country_code,
				'country' => $country->country_name,
			);
		} else {
			$ret = array(
				'code' => null,
				'country' => null,
			);
		}

		return $ret;
    }
	

}


