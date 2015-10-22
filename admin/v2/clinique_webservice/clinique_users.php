<?php

require_once('response.php');

class CliniqueUser {

    public function __CreateUser($username,$password,$firstname,$lastname,$email,$city,$country,$store,$retailer,$lang,$regionkey,$jobtitle,$insertflag, $other) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        require_once($CFG->dirroot.'/cohort/locallib.php'); // cohort members added courses.

        $response = new CliniqueServiceResponce();

		 $flag=true;
		 
		 $popupflag = true;

         $user_exits = array_values($DB->get_records_sql("SELECT count(*) as totaluser FROM {user} WHERE username='$username'"));

		 $user_email_exists = array_values($DB->get_records_sql("SELECT count(*) as totalemail FROM {user} WHERE email='$email'"));

		 $regionkey_check = array_values($DB->get_records_sql("SELECT count(*) as Regkeyexists FROM {regionkey} WHERE regionkey='$regionkey' AND region='$city'"));

		 $userDetails = new stdClass();

		// $password = "UGhvdG9uQDEyMw==";

		 if($user_exits[0]->totaluser > 0){

                 $response->response(true, 'msg', "username_exists");
				 $flag=false;
				 $popupflag = false;
				 exit;

			}
			/*if($user_email_exists[0]->totalemail > 0){

                 $response->response(true, 'msg', "email_exists");
				 $flag=false;
				 $popupflag = false;
				 exit;

			}*/if($regionkey_check['0']->regkeyexists == 0){

				 $response->response(true, 'msg', "regionkey_not_exists");
				 $flag=false;
				 $popupflag = false;
				 exit;
			}
			
			if($popupflag && $insertflag == 'false'){			
			 $response->response(false, 'msg', "show_popup");
			 $flag=false;
			 exit;
			}
			
            if($flag && $insertflag == 'true'){

			$userDetails->auth = 'email';

			$userDetails->confirmed = '1';

			$userDetails->mnethostid ='1';

            $userDetails->descriptionformat='1';

			$userDetails->descriptionformat='1';

			$userDetails->username=$username;

			$password = base64_decode($password);

			$md5pass_val= array("id"=>"md5");

            if(!empty($CFG->passwordsaltmain)) {

				 $newpass = $password.$CFG->passwordsaltmain;

				 $user_pass = array_values($DB->get_records_all_sql("SELECT md5('$newpass') as password",$md5pass_val));

				 $userDetails->password=$user_pass[0]->password;

			}else{

				$userDetails->password=md5($password);

			}

			$userDetails->firstname=$firstname;

			$userDetails->lastname=$lastname;

			$userDetails->email=$email;

			$userDetails->city=$city;

			$userDetails->country=$country;
			
                        if($lang == 'zh_ct'){
                          $userDetails->lang = 'zh_cn';  
                        }
                        else{
                           $userDetails->lang = $lang; 
                        }

			$userDetails->timecreated = time();

			$userDetails->timemodified = time();

			//$userDetails->store=$store;

			//$userDetails->retailer=$retailer;

			$userDetails->descriptionformat='1';

            $lastinsertid = $DB->insert_record('user', $userDetails);

			$cohortid = array_values($DB->get_records_sql("SELECT id FROM {cohort} WHERE idnumber='$lang'"));

			$cohortDetails = new stdClass();

			$cohortDetails->cohortid = $cohortid[0]->id;

			$cohortDetails->userid   = $lastinsertid;

			$cohortDetails->timeadded = time();


			 cohort_add_member( $cohortid[0]->id, $lastinsertid);
            //$DB->insert_record('cohort_members',$cohortDetails);
			
			if($other) {
				$cascade_data = new stdClass;
				$get_country = $DB->get_record('country', array('country_code' => $country));
				$cascade_data->region = $city;
				$cascade_data->country = $get_country->country_name;
				$cascade_data->retailer = $retailer;
				$cascade_data->store = $store;
				
				$cascade_insert_id = $DB->insert_record('cascade_region', $cascade_data);
			}


				if($store!='' && !empty($store)){

					$storeId = array_values($DB->get_records_sql("SELECT id FROM {user_info_field} WHERE shortname='Store'"));//Store,

					$user_info_data->fieldid = $storeId['0']->id;

					$user_info_data->userid =$lastinsertid;

					$user_info_data->data =$store;

					$DB->insert_record('user_info_data', $user_info_data);

				}
				if($retailer!='' && !empty($retailer)){ //Retailer

					$retailerId = array_values($DB->get_records_sql("SELECT id FROM {user_info_field} WHERE shortname='Retailer'")); //Retailer

					$user_info_data->fieldid =$retailerId['0']->id;

					$user_info_data->userid =$lastinsertid;

					$user_info_data->data =$retailer;

					$DB->insert_record('user_info_data', $user_info_data);

			   } if($city!='' && !empty($city)){ // Region insert query

					$regionId = array_values($DB->get_records_sql("SELECT id FROM {user_info_field} WHERE shortname='Region'")); //Region

					$user_info_data->fieldid =$regionId['0']->id;

					$user_info_data->userid =$lastinsertid;

					$user_info_data->data =$city;

					$DB->insert_record('user_info_data', $user_info_data);

			   }if($jobtitle!='' && !empty($jobtitle)){ // Region insert query

					$jobtitleId = array_values($DB->get_records_sql("SELECT id FROM {user_info_field} WHERE shortname='JobTitle'")); //JobTitle

					$user_info_data->fieldid =$jobtitleId['0']->id;

					$user_info_data->userid =$lastinsertid;

					$user_info_data->data =$jobtitle;

					$DB->insert_record('user_info_data', $user_info_data);

			   } else {
			        $jobtitleId = array_values($DB->get_records_sql("SELECT id FROM {user_info_field} WHERE shortname='JobTitle'")); //JobTitle

					$user_info_data->fieldid =$jobtitleId['0']->id;

					$user_info_data->userid =$lastinsertid;

					$user_info_data->data =0;

					$DB->insert_record('user_info_data', $user_info_data);
			   }

			   if($lastinsertid){

                   $response->response(false, 'msg', "Added user successfully");

			   } else{

                      $response->response(true, 'msg', "Error in creating user");

			   }


			}




			/* if(!empty($responseArray)){
				 $response->response(false, 'done', $responseArray);
			 } else{
				$response->response(true, 'msg', "No records");
			 }*/

		}
}

