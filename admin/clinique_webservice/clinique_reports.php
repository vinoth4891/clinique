<?php

require_once('response.php');

class ProgressPercent {

    public function __analyseReports($type, $retailer, $store, $region, $country, $course, $team, $limit_start, $limit_end,$sortBy) {

        global $CFG, $DB;
        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();
        
		if($type == 'user' || $type=='course') {
				
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
						  foreach($retailer as $key => $value) {
							$retailerstr .='"'.$value.'",';
						  }
						  $retailersrtval = substr($retailerstr,0,-1);
						  $where .=" AND retailer IN(".$retailersrtval.")";
					  //}
				}
				if($store != '' && $store != 'null') {
					/*if($store == '') {
					   $where .=" AND store =''";
					} else { */ 
					  foreach($store as $key => $value) {
						$storestr .='"'.$value.'",';
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
			   }else{
				 $sort = "firstname ASC";
			   }
				/*$where = array();

				if($retailer != '') {
				   $retailer = str_replace("*", "#", $retailer);
				   $where[] = "ud.data = '".mysql_escape_string($retailer)."'";
				   $retailercd = mysql_escape_string($retailer);
				}
				if($store != '') {
				   $store = str_replace("*", "#", $store);
				   $where[] = "ud.data = '".mysql_escape_string($store)."'";
				   $storecd = mysql_escape_string($store);
				}
				if($region != '') {
				   $where[] = "ud.data = '".mysql_escape_string($region)."'";
				   $regioncd = mysql_escape_string($region);
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
				}else{
					$sort = "firstname ASC";
				}*/
                /*if($type=="user"){
                     $teamjoin =" LEFT JOIN  {cohort_members} cm ON cm.userid=u.id LEFT JOIN {cohort} ch ON ch.id=cm.cohortid";

                 if($team != '') {

				  $team_where[] = "name='".mysql_escape_string($team)."'";
                  $where_str_filter = " ( ".implode(" OR ", $team_where) .")"; 

                   $team_user_id= array_values($DB->get_records_sql("SELECT cm.userid FROM {cohort} ch LEFT JOIN {cohort_members} cm ON cm.cohortid = ch.id WHERE $where_str_filter"));

				   if($team_user_id[0]->userid == '') {
				      $team_user_id[0]->userid = '0';
				   }
						foreach($team_user_id as $team_user_ids){

							  $teamUserIds .= $team_user_ids->userid .",";
						}
						$teamUser_ids = substr($teamUserIds,0,-1);
						$where_str = " AND uid IN( $teamUser_ids )";
						if(empty($teamUser_ids))
							$teamUser_ids = "No";
				 }else{
					$team_where_str ="";
				 }

				}else{
					$teamjoin = "";
				}*/

		/*if(!empty($where)){

			//$where_str_filter = " AND  ( ".implode(" OR ", $where) .")";
			$where_str_filter = " AND  ( ".implode(" AND ", $where) .")";
			//echo $where_str_filter;exit;
			/*$user_id= array_values($DB->get_records_sql("SELECT userid FROM {user_info_data} ud WHERE ud.userid!='' $where_str_filter"));
            foreach($user_id as $user_ids){

				  $userIds .= $user_ids->userid .",";
			}
			$user_ids = substr($userIds,0,-1);
			$retailerfield = '';
			$regionfield = '';
			$storefield = '';
			if($retailer != '') {
			  $retailerfield ="AND DATA = '".$retailercd."'";
			}
			if($region != '') {
			  $regionfield ="AND DATA = '".$regioncd."'";
			}
			if($store != '') {
			  $storefield ="AND DATA = '".$storecd."'";
			}

			$region_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Region%'"));
			$store_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Store%'"));
			$retaile_id= array_values($DB->get_records_sql("SELECT id FROM {user_info_field} uf WHERE uf.shortname LIKE '%Retailer%'"));

			$user_id= array_values($DB->get_records_sql("SELECT TBLStore.userid FROM
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$store_id[0]->id." ".$storefield.") TBLStore,
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$region_id[0]->id." ".$regionfield.") TBLRegion,
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$retaile_id[0]->id." ".$retailerfield.") TBLRtlr
WHERE TBLStore.userid = TBLRegion.userid
AND TBLRegion.userid = TBLRtlr.userid"));
/*echo "<br>11111=>"."SELECT TBLStore.userid FROM
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$store_id[0]->id." ".$storefield.") TBLStore,
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$region_id[0]->id." ".$regionfield.") TBLRegion,
(SELECT userid, fieldid, DATA FROM mdl_user_info_data
WHERE fieldid = ".$retaile_id[0]->id." ".$retailerfield.") TBLRtlr
WHERE TBLStore.userid = TBLRegion.userid
AND TBLRegion.userid = TBLRtlr.userid";
			print_r($user_id); exit;
            foreach($user_id as $user_ids){

				  $userIds .= $user_ids->userid .",";
			}
			$user_ids = substr($userIds,0,-1);

			if(!empty($teamUser_ids)){
				//$where_str = " AND u.id IN( $user_ids , $teamUser_ids)";
				//$where_total= " AND u.id IN( $user_ids , $teamUser_ids)";
				if($user_ids!='' && $teamUser_ids!='' && $teamUser_ids!='No') {
				//$where_reports = " AND uid IN ($user_ids, $teamUser_ids)";
				//$where_reports = " AND uid IN ($user_ids) AND uid IN ($teamUser_ids)";
				$teamexp = explode(',', $teamUser_ids);
				$userexp = explode(',', $user_ids);
				$interset_user_ids = array_intersect($teamexp, $userexp);
				if(!empty($interset_user_ids)) {
				  $struser_ids = implode(',',$interset_user_ids);
				} else {
				  $struser_ids = 0;
				}
				$where_reports = " AND uid IN ($struser_ids)";
				} elseif($user_ids!='') {
					$where_reports = " AND uid IN ($user_ids) AND uid IN (0)";
				}elseif($teamUser_ids!='' && $teamUser_ids!='No'){
					$where_reports = " AND uid IN ($teamUser_ids)";
				}

			}elseif(!empty($user_ids)){
				//$where_str    = " AND u.id IN( $user_ids )";
				//$where_total  = " AND u.id IN( $user_ids )";
				//$where_scores = " AND qa.userid IN ($user_ids)";
				$where_reports = " AND uid IN ($user_ids)";
			}else{
			    $where_reports = " AND uid=0";
			}

		}elseif(!empty($teamUser_ids) && empty($user_ids)){
			if($teamUser_ids == "No")
				$where_reports = " AND uid = 0";
			else
				$where_reports = " AND uid IN ($teamUser_ids)";
		}else{
			//$where_str = " AND u.id!=''";
			//$where_total= " AND qa.userid!=''";
			//$where_scores = " AND qa.userid !=''";
			$where_reports = " AND uid!=''";
		}
		
		if($country != '') {
		    $where_reports .= " AND country = '".$country."'";
		}*/
			/*$searchDetails = array_values($DB->get_records_sql("SELECT c.fullname,ui.data,u.id,u.firstname,u.lastname,c.id as cid FROM {user} u $teamjoin,{user_info_data} ui , {enrol} e,{user_enrolments} ue ,{course} c WHERE e.courseid=c.id AND ue.userid= ui.userid AND ue.enrolid=e.id AND u.id=ui.userid AND ui.fieldid=(SELECT id FROM {user_info_field} WHERE shortname='JobTitle')"));*/

			//$searchDetails = array_values($DB->get_records_all_sql("SELECT c.id as cid,c.fullname,u.id,u.firstname,u.lastname,u.country FROM {user} u $teamjoin, {enrol} e,{user_enrolments} ue ,{course} c WHERE e.courseid=c.id AND ue.userid= u.id AND ue.enrolid=e.id"));

                    //$reportsCount = array_values($DB->get_records_sql("SELECT * FROM {reports} WHERE id!='' $where_reports ORDER BY $sort"));
//$jobtitle = array_values($DB->get_records_sql("SELECT ud.data FROM {user_info_field} ui LEFT JOIN {user_info_data} ud ON ud.fieldid=ui.id WHERE ui.shortname='JobTitle' AND ud.userid=$userId"));
            //echo "<pre>"; //print_r($searchDetails); exit;
/*if(count($searchDetails) != count($reportsCount)){

       $DB->delete_records('reports'); // Delete records from mdl_reports table

		for ($i = 0; $i < count($searchDetails); $i++) {
			    $params_usercourse = array('course' => $searchDetails[$i]->cid, 'userid' => $searchDetails[$i]->id);
				$params_course = array('course' => $searchDetails[$i]->cid);
                $userId = $searchDetails[$i]->id;

				$jobtitle = array_values($DB->get_records_sql("SELECT ud.data FROM {user_info_field} ui LEFT JOIN {user_info_data} ud ON ud.fieldid=ui.id WHERE ui.shortname='JobTitle' AND ud.userid=$userId"));


               $currentUserScore = array_values($DB->get_records_sql('SELECT scores.qid AS qid, scores.id AS id, scores.userid AS userid, SUM(scores.sumgrades) AS score FROM
(
SELECT q.id AS qid, qa.quiz, qa.id AS id,qa.userid AS userid, MAX(qa.sumgrades) AS sumgrades
FROM {quiz} q
INNER JOIN {quiz_attempts} qa ON qa.quiz=q.id
WHERE q.course=? AND qa.userid=? AND qa.state="finished"
GROUP BY qa.userid, qa.quiz
) scores
GROUP BY scores.userid', $params_usercourse));

			   $CourseDetails->cid		 = $searchDetails[$i]->cid;
			   $CourseDetails->uid		 = $searchDetails[$i]->id;
			   $CourseDetails->firstname = $searchDetails[$i]->firstname;
			   $CourseDetails->lastname  = $searchDetails[$i]->lastname;
			   $CourseDetails->country  = $searchDetails[$i]->country;
			   $CourseDetails->jobtitle  = $jobtitle[0]->data;
			   $CourseDetails->fullname  = $searchDetails[$i]->fullname;
                           if(empty($currentUserScore[0]->score)){
                               $currentUserScore[0]->score = 0;
                           }
                           $CourseDetails->points    = $currentUserScore[0]->score;
			   	   
			   $DB->insert_record('reports',$CourseDetails); // DB insert query for course

			}


	$report_point = array_values($DB->get_records_sql("SELECT uid,sum(points) as total FROM {reports} WHERE id!='' AND points!='' GROUP BY uid"));

	foreach($report_point as $report_points){

		  $DB->execute("update mdl_reports SET totalpoints=$report_points->total WHERE uid=$report_points->uid");
	}

}*/
$reportsArray = array();
//echo "SELECT * FROM {reports} $where ORDER BY $sort LIMIT $start,$end"; 
$reportsDetails = array_values($DB->get_records_sql("SELECT * FROM {reports} $where ORDER BY $sort LIMIT $start,$end"));
//echo "SELECT * FROM {reports} $where ORDER BY $sort";
$reportsCount = array_values($DB->get_records_sql("SELECT count(1) AS cnt FROM {reports} $where ORDER BY $sort"));
//echo "here2";
$reportsArray['data'] = $reportsDetails;
$reportsArray['totalcount'] = $reportsCount[0]->cnt;


}
   if(!empty($reportsDetails)){

		  $response->response(false, 'done', $reportsArray);

		} else{

		  $response->response(true, 'No Records');

		}

    }

}

