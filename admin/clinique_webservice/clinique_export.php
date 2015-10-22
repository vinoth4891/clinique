<?php

require_once('response.php'); 

global $CFG;


class ProgressPercent {



    public function __analyseExport($type, $retailer, $store, $region, $country, $team, $sortBy, $recordrow) {

        global $CFG, $DB;
		
        require_once($CFG->libdir . '/csvlib.class.php');

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();
     if($recordrow != '') {
	       /*if($type == 'user') {
		       $fields = array('Last Name'        => 'Last Name',
						'First Name'  => 'First Name',
						'Job Title'     => 'Job Title',
						'Course' => 'Course',
						'Course Points'  => 'Course Points',
						'Total Points'  => 'Total Points');
		   } else {*/
		       $fields = array('Course' => 'Course',
			            'Last Name'        => 'Last Name',
						'First Name'  => 'First Name',
						'Job Title'     => 'Job Title',
						'Course Points'  => 'Course Points',
						'Total Points'  => 'Total Points');
		  // }
		   
	
			//$filename = clean_filename(get_string('users'));
			$filename = time();
			$csvexport = new csv_export_writer();
			$csvexport->set_filename($filename);
			$csvexport->add_data($fields);
			
			$reportsDetails = array_values($DB->get_records_sql("SELECT fullname, lastname, firstname, jobtitle, points, totalpoints FROM {reports} WHERE id IN ($recordrow)"));
			
			$reportcnt = count($reportsDetails);
			
			for($i=0;$i<$reportcnt;$i++) {
			   /* if($type == 'user') {
					$userprofiledata['Last Name'] = $reportsDetails[$i]->lastname;
					$userprofiledata['First Name'] = $reportsDetails[$i]->firstname;
					$userprofiledata['Job Title'] = $reportsDetails[$i]->jobtitle;
					$userprofiledata['Course'] = $reportsDetails[$i]->fullname;
								if(empty($reportsDetails[$i]->points)){
									   $reportsDetails[$i]->points = 0;
								}
					$userprofiledata['Course Points'] = $reportsDetails[$i]->points;
					$userprofiledata['Total Points'] = $reportsDetails[$i]->totalpoints;
				} else {*/
				    $userprofiledata['Course'] = $reportsDetails[$i]->fullname;
				    $userprofiledata['Last Name'] = $reportsDetails[$i]->lastname;
					$userprofiledata['First Name'] = $reportsDetails[$i]->firstname;
					$userprofiledata['Job Title'] = $reportsDetails[$i]->jobtitle;
					$userprofiledata['Course Points'] = $reportsDetails[$i]->points;
					$userprofiledata['Total Points'] = $reportsDetails[$i]->totalpoints;
				//}	
				$csvexport->add_data($userprofiledata);
			}
			
			$csvexport->download_file();
		
			exit;
	 }   
	 if($type == 'user' || $type=='course') {
	
		$fields = array('Last Name'        => 'Last Name',
						'First Name'  => 'First Name',
						'Job Title'     => 'Job Title',
						'Course' => 'Course',
						'Course Points'  => 'Course Points',
						'Total Points'  => 'Total Points');
	
		//$filename = clean_filename(get_string('users'));
		$filename = time();
		$csvexport = new csv_export_writer();
		$csvexport->set_filename($filename);
		$csvexport->add_data($fields);
		
		
		
		$where = "WHERE id!=''";
				if($region != '') {
				  $where .=" AND region='".$region."'";
				}
				if($country != '') {
				  $where .=" AND country='".$country."'";
				}
				if($retailer != '' && $retailer != 'null') {
					  /*if($retailer == '') {
					     $where .=" AND retailer =''";
					  } else {*/
					      if(is_array($retailer)) {
							  foreach($retailer as $key => $value) {
								$retailerstr .='"'.$value.'",';
							  }
						  } else {
						     $retailerexp = explode(",", $retailer);
							 foreach($retailerexp as $key => $value) {
								$retailerstr .='"'.$value.'",';
							  }
						  } 
						  $retailersrtval = substr($retailerstr,0,-1);
						  $where .=" AND retailer IN(".$retailersrtval.")";
					  //}
				}
				if($store != '' && $store != 'null') {
					/*if($store == '') {
					   $where .=" AND store =''";
					} else { */ 
					  if(is_array($store)) {
						  foreach($store as $key => $value) {
							$storestr .='"'.$value.'",';
						  }
					  } else {
					      $storeexp = explode(",", $store);
						  foreach($storeexp as $key => $value) {
							$storestr .='"'.$value.'",';
						  }
					  }
					  $storesrtval = substr($storestr,0,-1);
				      $where .=" AND store IN(".$storesrtval.")";
					//}
				}
				
				if($limit_start != '') {
				   $start = $limit_start;
				} else {
				   $start = 0;
				}
				if($limit_end != '') {
				   $end = $limit_end;
				} else {
				   $end = 9;
				}
				
				if($sortBy!=""){ // sortby asc desc
				 if($sortBy=='firstname DESC')
					$sort = "firstname DESC";
				 if($sortBy=='firstname ASC')
					$sort = "firstname ASC";
				 if($sortBy=='lastname DESC')
					 $sort = "lastname DESC";
				 if($sortBy=='lastname ASC')
					 $sort = "lastname ASC";
				 if($sortBy=='fullname DESC')
					 $sort = "fullname DESC";
				 if($sortBy=='fullname ASC')
					 $sort = "fullname ASC";
				 if($sortBy=='points ASC')
					 $sort = "points ASC";
				 if($sortBy=='points DESC')
					 $sort = "points DESC";
				 if($sortBy=='totalpoints ASC')
					 $sort = "totalpoints ASC";
				 if($sortBy=='totalpoints DESC')
					 $sort = "totalpoints DESC";
				 if($sortBy=='ASC')
					 $sort = "firstname ASC";	 
			   }else{
				 $sort = "firstname ASC";
			   }
		$reportsDetails = array_values($DB->get_records_sql("SELECT lastname, firstname, jobtitle, fullname, points, totalpoints FROM {reports} $where ORDER BY $sort"));
 $reportcnt = count($reportsDetails);		   
		
		for($i=0;$i<$reportcnt;$i++) {
			$userprofiledata['Last Name'] = $reportsDetails[$i]->lastname;
			$userprofiledata['First Name'] = $reportsDetails[$i]->firstname;
			$userprofiledata['Job Title'] = $reportsDetails[$i]->jobtitle;
			$userprofiledata['Course'] = $reportsDetails[$i]->fullname;
			$userprofiledata['Course Points'] = $reportsDetails[$i]->points;
			$userprofiledata['Total Points'] = $reportsDetails[$i]->totalpoints;
			$csvexport->add_data($userprofiledata);
		}
		$csvexport->download_file();
	
		exit;
	 }	
		
    }

} 
