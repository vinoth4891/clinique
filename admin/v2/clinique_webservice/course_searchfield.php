<?php

require_once('response.php');

class ProgressPercent
{
    
    public function __analyseCourseSearchfield($type, $region, $country, $retailer, $filter)
    {
        global $CFG, $DB;
        
        $systemcontext = context_system::instance();
        
        $response = new CliniqueServiceResponce();
        
        $CourseSearchfield = array();
        
        switch ($type) {
            case 'region':
				// Admin panel user creation uses user_info_field table to render region field 
				// Assumed source would be up to date and can be used across the app
				$regionrow = $DB->get_record_sql('SELECT param1 FROM {user_info_field}'
						. ' WHERE shortname = "region"');
				$regions = explode("\n",  $regionrow->param1);               
				$regions = array_map(function($region_name) {
					$region = new stdClass();
					if(strstr($region_name, '/')){
						$region_name = explode('/', strtolower($region_name));
						$region->region = implode('/', array_map('ucwords',$region_name));
                    }else{
                        #$region->region =  ucwords(strtolower($region_name));
						$region->region =  $region_name;
                    }
					return $region;
				}, $regions);
                
                		$CourseSearchfield['region'] = $regions;
                break; 
            case 'country':
				if (in_array("sel_all", $region)) {
					$regionstr = '%';
				} else {
					$regionstr = implode('~', $region);
				}
				$countrySP = "CALL mdl_get_country_master('$regionstr')";
				$countries = array_values($DB->get_records_sp($countrySP));

                if ($filter == 1) {
                    $CourseSearchfield['country_filter'] = 1;
                } else {
                    $CourseSearchfield['country_filter'] = 0;
                }
                $CourseSearchfield['country']  = $countries;
                break;
            
            case 'retailer':
				if (in_array("sel_all", $region)) {
					$regionstr = '%';
				} else {
					$regionstr = implode('~', $region);
				}

				if ( ! in_array("sel_all", $country)) {
					$countrystr = implode('","', $country);
					$countrywhere = ' WHERE country_code IN ("' . $countrystr . '")';
					$countrycodes = array_values($DB->get_records_sql('SELECT country_name FROM {country} ' . $countrywhere));
					$countries = array();
					foreach($countrycodes as $countrycode) {
						$countries[] = $countrycode->country_name;
					}
					$countrynamestr = implode('~', $countries);
				} else {
					$countrynamestr = '%';
				}

				$retailerSP = "CALL mdl_get_retailer_master('$regionstr', '$countrynamestr')";
				$retailers = array_values($DB->get_records_sp($retailerSP));
				$storeSP = "CALL mdl_get_store_master('$regionstr', '$countrynamestr','%')";
				$stores = array_values($DB->get_records_sp($storeSP));				
                if ($filter == 1) {
                    $CourseSearchfield['country_filter'] = 1;
                } else {
                    $CourseSearchfield['country_filter'] = 0;
                }
                $CourseSearchfield['retailer'] = $retailers;
                $CourseSearchfield['store']    = $stores;
                break;
            
            case 'store':
				if (in_array("sel_all", $region)) {
					$regionstr = '%';
				} else {
					$regionstr = implode('~', $region);
				}
				
				if ( ! in_array("sel_all", $country)) {
					$countrystr = implode('","', $country);
				}
				
				if (in_array("sel_all", $retailer)) {
					$retailerstr = '%';
				} else {
					$retailerstr = implode('~', $retailer);
				}

                if ($filter == 1) {
					$CourseSearchfield['store_filter'] = 1;
                } else {
 					$CourseSearchfield['store_filter'] = 0;
				}

				if ( ! in_array("sel_all", $country)) {
					$countrystr = implode('","', $country);
					$countrywhere = ' WHERE country_code IN ("' . $countrystr . '")';
					$countrycodes = array_values($DB->get_records_sql('SELECT country_name FROM {country} ' . $countrywhere));
					$countries = array();
					foreach($countrycodes as $countrycode) {
						$countries[] = $countrycode->country_name;
					}
					$countrynamestr = implode('~', $countries);
				} else {
					$countrynamestr = '%';
				}
                $retailerstr = addslashes($retailerstr);
				$storeSP = "call mdl_get_store_master('$regionstr','$countrynamestr','$retailerstr')";
				$stores = array_values($DB->get_records_sp($storeSP));		
				
				$coursename = array_values($DB->get_records_sql("SELECT  fullname FROM {course} ORDER BY fullname ASC"));
                $CourseSearchfield['store'] = $stores;
				$CourseSearchfield['course']    = $coursename;
                break;
			
			case 'course':
				if ($filter == 1) {
					$CourseSearchfield['course_filter'] = 1;
				} else {
					$CourseSearchfield['course_filter'] = 0;
				}

				$coursename = array_values($DB->get_records_sql("SELECT  fullname FROM {course} ORDER BY fullname ASC"));
				$CourseSearchfield['course'] = $coursename;
				break;
        }
        
        $cohortDetails             = $DB->get_records_sql("SELECT c.id, c.name FROM {cohort} c ORDER BY c.name ASC");
        $CourseSearchfield['team'] = $cohortDetails;
        
        if (!empty($CourseSearchfield)) {
            $response->response(false, 'done', $CourseSearchfield);
        } else {
            $response->response(true, 'no_records');
        }
    }
    
}
