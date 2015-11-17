<?php

require_once('response.php');
require_once('mdetect.php');
global $CFG;

class ProgressPercent
{
    public function __analyseExport($type, $retailer, $store, $region, $country, $course, $team, $sortBy, $fieldsval, $keyword, $isshowreport, $recordrow)
    {
        
        global $CFG, $DB, $SESSION;
        
        require_once($CFG->libdir . '/csvlib.class.php');
		$useragent = new uagent_info();
		if($useragent->DetectIpad() || $useragent->DetectIphoneOrIpod() || $useragent->DetectAndroid() || $useragent->DetectIosNative()){
			$csvexport = new csv_export_writer();
			$download_method = 'download_file';
		} else {
			$csvexport = new csv_export_writer('tab');
			$download_method = 'download_file_for_excel';
		}
        
		if ($recordrow != '') {
			$fields = array(
				'Region' => 'Region',
				'Country' => 'Country',
				'Retailer' => 'Retailer',
				'Store' => 'Store',		
				'Course' => 'Course',
				'First Name' => 'First Name',
				'Last Name' => 'Last Name',				
				'Job Title' => 'Job Title',
				'Course Points' => 'Course Points',
				'Total Points' => 'Total Points'
			);

			$filename  = time();
			$csvexport->set_filename($filename);
			$csvexport->add_data($fields);
			
			if (empty($sortBy)) {
				$sortBy = 'firstname';
				$sortMode = 'ASC';
			} else {
				list($sortBy, $sortMode) = explode(' ', $sortBy);
			}

			$recordrow = explode(',', $recordrow);
			$reportsDetails = $SESSION->reports_current_page;

			foreach($reportsDetails as $id => &$reportsDetail) {
				if( ! in_array($id, $recordrow)) {
					unset($reportsDetails[$id]);
				}
			}
			unset($reportsDetail);
			
					
			foreach($reportsDetails as $kReportsDetails => $vReportDetails) {
				$userprofiledata['Region']        = $vReportDetails->region;
				$userprofiledata['Country']       = $vReportDetails->country;
				$userprofiledata['Retailer'] = $vReportDetails->retailer;
				$userprofiledata['Store']    = $vReportDetails->store;					
				$userprofiledata['Course']        = $vReportDetails->fullname;
				$userprofiledata['First Name']    = $vReportDetails->firstname;
				$userprofiledata['Last Name']     = $vReportDetails->lastname;					
				$userprofiledata['Job Title']     = $vReportDetails->jobtitle;
				$userprofiledata['Course Points'] = $vReportDetails->points;
				$userprofiledata['Total Points']  = $vReportDetails->totalpoints;
				$csvexport->add_data($userprofiledata);
				$i++;
			}
			
			$csvexport->$download_method();				
			exit;
		}

		if($isshowreport == 'true') {		
			
			if ($type == 'user' || $type == 'course') {
				
				$fields = array(
					'Region' => 'Region',
					'Country' => 'Country',
					'Retailer' => 'Retailer',
					'Store' => 'Store',	
					'Course' => 'Course',
					'First Name' => 'First Name',
					'Last Name' => 'Last Name',				
					'Job Title' => 'Job Title',
					'Course Points' => 'Course Points',
					'Total Points' => 'Total Points'
				);
				
				//$filename = clean_filename(get_string('users'));
				$filename  = time();
				$csvexport->set_filename($filename);
				$csvexport->add_data($fields);
				
				$region = explode(",", $region);
				$country = explode(",", $country);				
				$retailer = explode(",", $retailer);
				$store = explode(",", $store);
				$course = explode(",", $course);				
				if ($type == 'user' || $type == 'course') {
					if (in_array("sel_all", $region) || in_array("null", $region)) {
						$regionstr = '';
					} else {
						$regionstr = implode('~', $region);
					}

					if (in_array("sel_all", $country) || in_array("null", $country)) {
						$countrystr = '';
					} else {
						$countrystr = implode('~', $country);
					}

					if (in_array("sel_all", $retailer) ||  in_array("null", $retailer)) {
						$retailerstr = '';
					} else {
						$retailerstr = implode('~', $retailer);
					}

					if (in_array("sel_all", $store) ||  in_array("null", $store)) {
						$storestr = '';
					} else {
						$storestr = implode('~', $store);
					}

					if (in_array("sel_all", $course) ||  in_array("null", $course)) {
						$coursestr = '';
					} else {
						$coursestr = implode('~', $course);
					}

					if (empty($sortBy)) {
						$sortBy = 'firstname';
						$sortMode = 'ASC';
					} else {
						list($sortBy, $sortMode) = explode(' ', $sortBy);
					}
					/*
						CALL get_mdl_reports_dtl
						(
						@v_region := '',
						@v_country := '',
						@v_retailer	:= '',
						@v_store := '',
						@v_course := '',
						@v_username := 'mieko~whyunwha',
						@v_email    := 'terasima.ibuki@rainbow.plala.or.jp~whyunwhaya@nate.com',
						@v_sortby := 'lastname',
						@v_sortmode     := 'desc',
						@v_offset := '0',
						@v_limit := '25'
						)
					*/
					$reportsSPCall = "CALL get_mdl_reports_dtl ('$regionstr','$countrystr','$retailerstr','$storestr','$coursestr', "
							. "'$sortBy', '$sortMode', '', '')";
					$reportsDetails = $DB->get_records_sql($reportsSPCall);
				}
				foreach($reportsDetails as $kReportsDetails => $vReportDetails) {
					$userprofiledata['Region']        = $vReportDetails->region;
					$userprofiledata['Country']       = $vReportDetails->country;
					$userprofiledata['Retailer'] = $vReportDetails->retailer;
					$userprofiledata['Store']    = $vReportDetails->store;					
					$userprofiledata['Course']        = $vReportDetails->fullname;
					$userprofiledata['First Name']    = $vReportDetails->firstname;
					$userprofiledata['Last Name']     = $vReportDetails->lastname;					
					$userprofiledata['Job Title']     = $vReportDetails->jobtitle;
					$userprofiledata['Course Points'] = $vReportDetails->points;
					$userprofiledata['Total Points']  = $vReportDetails->totalpoints;
					$csvexport->add_data($userprofiledata);
					$i++;
				}
				$csvexport->$download_method();
				exit;
			}
		} else {
			$filename  = time();
			$csvexport->set_filename($filename);
			
			$fields = array(
				'Region' => 'Region',
				'Country' => 'Country',
				'Retailer' => 'Retailer',
				'Store' => 'Store',				
				'Course' => 'Course',
				'First Name' => 'First Name',
				'Last Name' => 'Last Name',				
				'Job Title' => 'Job Title',
				'Course Points' => 'Course Points',
				'Total Points' => 'Total Points'
			);

			$csvexport->add_data($fields);
			
			if (empty($sortBy)) {
				$sortBy = 'firstname';
				$sortMode = 'ASC';
			} else {
				list($sortBy, $sortMode) = explode(' ', $sortBy);
			}

			$fieldsArr = explode(',', $fieldsval);
			$coursekey = array_search('fullname', $fieldsArr);
			if( ! is_bool($coursekey))
				$fieldsArr[$coursekey] = 'course';

			$fieldstilde = implode('~', $fieldsArr);
			/*
				CALL get_mdl_reports_dtl
				(
				@v_region := '',
				@v_country := '',
				@v_retailer	:= '',
				@v_store := '',
				@v_course := '',
				@v_username := 'mieko~whyunwha',
				@v_email    := 'terasima.ibuki@rainbow.plala.or.jp~whyunwhaya@nate.com',
				@v_sortby := 'lastname',
				@v_sortmode     := 'desc',
				@v_offset := '0',
				@v_limit := '25'
				)
			*/
			$reportsSPCall = "CALL get_mdl_reports_search ('$keyword','$fieldstilde',"
					. "'$sortBy', '$sortMode', '', '')";
			$reportsDetails = $DB->get_records_sql($reportsSPCall);
			
			$i = 0;
			foreach($reportsDetails as $kReportsDetails => $vReportDetails) {
				$userprofiledata['Region']        = $vReportDetails->region;
				$userprofiledata['Country']       = $vReportDetails->country;
				$userprofiledata['Retailer']	  = $vReportDetails->retailer;
				$userprofiledata['Store']    	  = $vReportDetails->store;				
				$userprofiledata['Course']        = $vReportDetails->fullname;
				$userprofiledata['First Name']    = $vReportDetails->firstname;
				$userprofiledata['Last Name']     = $vReportDetails->lastname;				
				$userprofiledata['Job Title']     = $vReportDetails->jobtitle;
				$userprofiledata['Course Points'] = $vReportDetails->points;
				$userprofiledata['Total Points']  = $vReportDetails->totalpoints;
				$csvexport->add_data($userprofiledata);
				$i++;
			}
			$csvexport->$download_method();
			exit;
			
		}
        
    }
    
    public function getCountryByCode($code)
    {
        global $CFG, $DB;
        $getCountry = $DB->get_record('country', array(
            'country_code' => $code
        ));
		if($getCountry) {
			return $getCountry->country_name;
		}
        else {
			return '';
		}
    }
    
}