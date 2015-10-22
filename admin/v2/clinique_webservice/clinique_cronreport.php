<?php

require_once('response.php');

class ProgressPercent {

    public function __analyseCronReport() {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

		
        // Add The Report Cron
	
	$searchDetails = array_values($DB->get_records_all_sql("SELECT c.id as cid,c.fullname,u.id,u.firstname,u.lastname,u.country FROM {user} u $teamjoin, {enrol} e,{user_enrolments} ue ,{course} c WHERE e.courseid=c.id AND ue.userid= u.id AND ue.enrolid=e.id"));
	
	//$reportsCount = array_values($DB->get_records_sql("SELECT * FROM {reports} WHERE id!=''"));
	
		//if(count($searchDetails) != count($reportsCount)){
	
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
	
	    //}
    }

}

