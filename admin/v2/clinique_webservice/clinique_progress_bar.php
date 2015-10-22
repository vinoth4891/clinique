<?php

require_once('response.php');

class ProgressPercent
{
    
    public function __analyseProgressPercentage($uid, $return = false)
    {
        
        global $CFG, $DB;
        
        $systemcontext = context_system::instance();
        
        $response = new CliniqueServiceResponce();
        
        if (!empty($uid)) {
            
            //$params = array('userid' => $uid);
            
            
            $CourseDetails = array();
            
            /*$UserTotalPoints = array_values($DB->get_records_sql('SELECT SUM(qa.sumgrades) AS totalscore
            FROM {quiz} q
            INNER JOIN {quiz_attempts} qa ON qa.quiz=q.id
            WHERE qa.userid=? AND qa.state="finished" GROUP BY qa.userid', $params));
            
            
            $CourseDetails[totalscore] = $UserTotalPoints[0]->totalscore;*/
            //echo "<pre>";
            //$courseDetails = array_values($DB->get_records_sql('SELECT c.id, c.fullname FROM mdl_user_enrolments ue, mdl_course c WHERE ue.enrolid = c.id AND ue.userid=? AND c.visible=1', $params));
			
			
            $getCrseCat = $DB->get_record('course_categories', array('name' => 'Courses'));			
			
			$params       = array(
				'userid' => $uid,
				'category' => $getCrseCat->id
			);
			//$courseDetails = array_values($DB->get_records_sql('SELECT c.id, c.fullname FROM {course} c, {enrol} e, {user_enrolments} ue WHERE c.id = e.courseid AND e.id = ue.enrolid AND ue.userid=? AND c.category=? ORDER BY c.sortorder', $params));
			
			$courseDetails = array_values($DB->get_records_sql("SELECT c.id, ue.userid, c.fullname, q.name FROM {course} c JOIN {enrol} e ON c.id = e.courseid JOIN {user_enrolments} ue ON e.id = ue.enrolid JOIN {quiz} q ON c.id=q.course AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%' WHERE ue.userid=? AND c.category=? ORDER BY c.sortorder", $params));
			
			
			$Coursecnt = count($courseDetails);
			
			for ($i = 0; $i < $Coursecnt; $i++) {
				$params_usercourse = array(
					'course' => $courseDetails[$i]->id,
					'userid' => $uid
				);
				$params_course     = array(
					'course' => $courseDetails[$i]->id
				);

				$currentUserScore  = array_values($DB->get_records_sql("SELECT scores.qid AS qid, scores.id AS id, scores.userid AS userid, SUM(scores.sumgrades) AS score FROM
				(
				SELECT q.id AS qid, qa.quiz, qa.id AS id,qa.userid AS userid, MAX(qa.sumgrades) AS sumgrades
				FROM {quiz} q
				INNER JOIN {quiz_attempts} qa ON qa.quiz=q.id  AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
				WHERE q.course=? AND qa.userid=? AND qa.state='finished' 
				GROUP BY qa.userid, qa.quiz
				) scores
				GROUP BY scores.userid", $params_usercourse));
				
				$CourseDetails['course_id'][]    = $courseDetails[$i]->id;
				$CourseDetails['course_name'][]  = $courseDetails[$i]->fullname;
				$CourseDetails['course_score'][] = $currentUserScore[0]->score;
				$totalscore                      = $totalscore + $currentUserScore[0]->score;
				
				$quizedetails = array_values($DB->get_records_sql('SELECT q.id,q.name FROM {quiz} q WHERE q.course=? ', $params_course));
				
				$quizecnt = count($quizedetails);
				for ($j = 0; $j < $quizecnt; $j++) {
					$params_quiz                                                        = array(
						'quiz' => $quizedetails[$j]->id,
						'userid' => $uid
					);
					$quizescoredetails                                                  = array_values($DB->get_records_sql('SELECT MAX(qa.sumgrades) as sumgrades FROM {quiz_attempts} qa WHERE qa.quiz=? AND qa.userid=?', $params_quiz));
					$CourseDetails['course'][$courseDetails[$i]->id]['quiz']['name'][]  = $quizedetails[$j]->name;
					$CourseDetails['course'][$courseDetails[$i]->id]['quiz']['score'][] = $quizescoredetails[0]->sumgrades;
				}
			}
			
			$list_of_subcategories = $DB->get_records('course_categories', array('parent' => $getCrseCat->id));
			
			if($list_of_subcategories) {
				foreach($list_of_subcategories as $kSubCat => $vSubCat) {
			
					$params       = array(
						'userid' => $uid,
						'category' => $vSubCat->id
					);
					//$courseDetails = array_values($DB->get_records_sql('SELECT c.id, c.fullname FROM {course} c, {enrol} e, {user_enrolments} ue WHERE c.id = e.courseid AND e.id = ue.enrolid AND ue.userid=? AND c.category=? ORDER BY c.sortorder', $params));
					
					$courseDetails = array_values($DB->get_records_sql("SELECT c.id, ue.userid, c.fullname, q.name FROM {course} c JOIN {enrol} e ON c.id = e.courseid JOIN {user_enrolments} ue ON e.id = ue.enrolid JOIN {quiz} q ON c.id=q.course AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%' WHERE ue.userid=? AND c.category=? ORDER BY c.sortorder", $params));
					
					
					$Coursecnt = count($courseDetails);
					
					for ($i = 0; $i < $Coursecnt; $i++) {
						$params_usercourse = array(
							'course' => $courseDetails[$i]->id,
							'userid' => $uid
						);
						$params_course     = array(
							'course' => $courseDetails[$i]->id
						);

						$currentUserScore  = array_values($DB->get_records_sql("SELECT scores.qid AS qid, scores.id AS id, scores.userid AS userid, SUM(scores.sumgrades) AS score FROM
						(
						SELECT q.id AS qid, qa.quiz, qa.id AS id,qa.userid AS userid, MAX(qa.sumgrades) AS sumgrades
						FROM {quiz} q
						INNER JOIN {quiz_attempts} qa ON qa.quiz=q.id  AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
						WHERE q.course=? AND qa.userid=? AND qa.state='finished' 
						GROUP BY qa.userid, qa.quiz
						) scores
						GROUP BY scores.userid", $params_usercourse));
						
						$CourseDetails['course_id'][]    = $courseDetails[$i]->id;
						$CourseDetails['course_name'][]  = $courseDetails[$i]->fullname;
						$CourseDetails['course_score'][] = $currentUserScore[0]->score;
						$totalscore                      = $totalscore + $currentUserScore[0]->score;
						
						$quizedetails = array_values($DB->get_records_sql('SELECT q.id,q.name FROM {quiz} q WHERE q.course=? ', $params_course));
						
						$quizecnt = count($quizedetails);
						for ($j = 0; $j < $quizecnt; $j++) {
							$params_quiz                                                        = array(
								'quiz' => $quizedetails[$j]->id,
								'userid' => $uid
							);
							$quizescoredetails                                                  = array_values($DB->get_records_sql('SELECT MAX(qa.sumgrades) as sumgrades FROM {quiz_attempts} qa WHERE qa.quiz=? AND qa.userid=?', $params_quiz));
							$CourseDetails['course'][$courseDetails[$i]->id]['quiz']['name'][]  = $quizedetails[$j]->name;
							$CourseDetails['course'][$courseDetails[$i]->id]['quiz']['score'][] = $quizescoredetails[0]->sumgrades;
						}
					}
				}
			}
            $CourseDetails['totalscore'] = $totalscore;

			//Add custom scores for 1331 US users
			$custompoint = self::getCustomPoints($uid);

			if( ! empty($custompoint->id)) { // Does addition score exists for user? add them too.
				$CourseDetails['totalscore'] += $custompoint->points;
			}
            
			if(empty($return)) {
				if (!empty($CourseDetails)) {
					$response->response(false, 'done', $CourseDetails);
				} else {
					$response->response(true, 'no_records');
					}
			}
			
			return $CourseDetails;
        }
    }


	/**
	 * Client wants us to add addition scores for 1331 users. So add them to their actual score
	 * @param type $userid - userid of the user whose custom score is requested
	 */
	private function getCustomPoints($userid) {
		global $DB;
		return $DB->get_record('user_custom_points', array('userid' => $userid));
	}
    
}
