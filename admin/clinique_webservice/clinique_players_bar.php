<?php

require_once('response.php');

class PlayersPercent {

    public function __analysePercentage($cid, $uid) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();
        $getCrseCatID = array_values($DB->get_records_sql("SELECT cat.name FROM {course_categories} cat WHERE cat.name = 'Courses'"));
        if ((!empty($uid) || !empty($cid)) && ($getCrseCatID[0]->name == 'Courses')) {

            $params = array('course' => $cid, 'userid' => $uid);
            $param_total = array('userid' => $uid);
            $UserScoreDetails = array();
            $otherUserScoreDetails = array();
            $currentUserScore = array_values($DB->get_records_sql("SELECT scores.id AS id, scores.userid AS userid, scores.firstname AS firstname, scores.lastname AS lastname, SUM(scores.sumgrades) AS score FROM
            (
            SELECT qa.id AS id,qa.userid AS userid,u.firstname AS firstname,u.lastname AS lastname,MAX(qa.sumgrades) AS sumgrades
            FROM {quiz} q
            LEFT JOIN {quiz_attempts} qa ON qa.quiz=q.id AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
            LEFT JOIN {user} u ON u.id=qa.userid
            WHERE q.course=? AND qa.userid=? AND qa.state='finished' GROUP BY qa.userid, qa.quiz
            ) scores
            GROUP BY scores.userid", $params));


            $currentUsercnt = count($currentUserScore);
            if ($currentUsercnt == 1) {//echo "if";
                $param_currentuser = array('userid' => $currentUserScore[0]->userid);
                $param_badgecurrentuser = array('user_id' => $currentUserScore[0]->userid, 'userid' => $currentUserScore[0]->userid);
                $currentUserTotalPoints = array_values($DB->get_records_sql("SELECT scores.id AS id, scores.userid AS userid, scores.firstname AS firstname, scores.lastname AS lastname, SUM(scores.sumgrades) AS totalscore FROM
            (
            SELECT qa.id AS id,qa.userid AS userid,u.firstname AS firstname,u.lastname AS lastname,MAX(qa.sumgrades) AS sumgrades
            FROM {quiz} q INNER JOIN mdl_course c ON c.id = q.course AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
INNER JOIN mdl_course_categories cc ON c.category = cc.id 
            LEFT JOIN {quiz_attempts} qa ON qa.quiz=q.id
            LEFT JOIN {user} u ON u.id=qa.userid
            WHERE qa.userid=? AND qa.state='finished' GROUP BY qa.userid, qa.quiz
            ) scores
            GROUP BY scores.userid", $param_currentuser));
                //print_r($currentUserTotalPoints);
                $userbadge = array_values($DB->get_records_sql('SELECT b.badge_name FROM {badge} b WHERE b.id IN (SELECT ub.user_badge_id FROM {badge_user} ub WHERE ub.user_id=? AND b.badge_value=(SELECT MAX(b.badge_value) FROM {badge} b INNER JOIN {badge_user} ub ON ub.user_badge_id=b.id WHERE ub.user_id=?))LIMIT 0,1', $param_badgecurrentuser));
                $firstname = substr($currentUserScore[0]->firstname, 0, 1);
                $lastname = substr($currentUserScore[0]->lastname, 0, 1);
                $UserScoreDetails['userid'][] = $currentUserScore[0]->userid;
                $UserScoreDetails['firstname'][] = $firstname;
                $UserScoreDetails['lastname'][] = $lastname;
                $UserScoreDetails['score'][] = $currentUserScore[0]->score;
                $UserScoreDetails['totalscore'][] = $currentUserTotalPoints[0]->totalscore;
                $UserScoreDetails['badge'][] = $userbadge[0]->badge_name;
                //print_r($UserScoreDetails);
            } else {//echo "else";
                $param_currentuser = array('userid' => $uid);
                $param_badgecurrentuser = array('user_id' => $uid, 'userid' => $uid);
                //$currentUserTotalPoints = array_values($DB->get_records_sql('SELECT u.firstname,u.lastname FROM {user} u WHERE u.id=?', $param_currentuser)); 
                $currentUserTotalPoints = array_values($DB->get_records_sql("SELECT scores.id AS id, scores.userid AS userid, scores.firstname AS firstname, scores.lastname AS lastname, SUM(scores.sumgrades) AS totalscore FROM
            (
            SELECT qa.id AS id,qa.userid AS userid,u.firstname AS firstname,u.lastname AS lastname,MAX(qa.sumgrades) AS sumgrades
            FROM {quiz} q INNER JOIN mdl_course c ON c.id = q.course AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
INNER JOIN mdl_course_categories cc ON c.category = cc.id 
            LEFT JOIN {quiz_attempts} qa ON qa.quiz=q.id
            LEFT JOIN {user} u ON u.id=qa.userid
            WHERE qa.userid=? AND qa.state='finished' GROUP BY qa.userid, qa.quiz
            ) scores
            GROUP BY scores.userid", $param_currentuser));
                $userbadge = array_values($DB->get_records_sql('SELECT b.badge_name FROM {badge} b WHERE b.id IN (SELECT ub.user_badge_id FROM {badge_user} ub WHERE ub.user_id=? AND b.badge_value=(SELECT MAX(b.badge_value) FROM {badge} b INNER JOIN {badge_user} ub ON ub.user_badge_id=b.id WHERE ub.user_id=?))LIMIT 0,1', $param_badgecurrentuser));
                $firstname = substr($currentUserTotalPoints[0]->firstname, 0, 1);
                $lastname = substr($currentUserTotalPoints[0]->lastname, 0, 1);
                $UserScoreDetails['userid'][] = $uid;
                $UserScoreDetails['firstname'][] = $firstname;
                $UserScoreDetails['lastname'][] = $lastname;
                $UserScoreDetails['score'][] = 0;
                $UserScoreDetails['totalscore'][] = $currentUserTotalPoints[0]->totalscore;
                $UserScoreDetails['badge'][] = $userbadge[0]->badge_name;
            }

			//Add custom scores for 1331 US users
			$custompoint = self::getCustomPoints($uid);

			if( ! empty($custompoint->id)) { // Does addition score exists for user? add them too.
				$UserScoreDetails['totalscore'][0] += $custompoint->points;
			}


            $otherUsersScore = array_values($DB->get_records_sql("SELECT scores.id AS id, scores.userid AS userid, scores.firstname AS firstname, scores.lastname AS lastname, SUM(scores.sumgrades) AS score FROM
            (
            SELECT qa.id AS id,qa.userid AS userid,u.firstname AS firstname,u.lastname AS lastname,MAX(qa.sumgrades) AS sumgrades
            FROM {quiz} q
            LEFT JOIN {quiz_attempts} qa ON qa.quiz=q.id AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
            LEFT JOIN {user} u ON u.id=qa.userid
            WHERE q.course=? AND qa.userid!=? AND u.deleted=0 AND qa.state='finished' GROUP BY qa.userid,qa.quiz ORDER BY SUM(qa.sumgrades) DESC) scores
            GROUP BY scores.userid ORDER BY score DESC", $params, 0, 10));

            $otherUsercnt = count($otherUsersScore);
            
            //print_r($otherUsersScore);

            for ($i = 0; $i < $otherUsercnt; $i++) {
                $otherUsersScore[$i]->userid;
                $param_otheruser = array('userid' => $otherUsersScore[$i]->userid);
                $param_badgeotheruser = array('user_id' => $otherUsersScore[$i]->userid, 'userid' => $otherUsersScore[$i]->userid);
                $otherUserTotalPoints = array_values($DB->get_records_sql("SELECT scores.id AS id, scores.userid AS userid,scores.quizid AS quizid,scores.firstname AS firstname, SUM(scores.sumgrades) AS totalscore FROM
            (
            SELECT qa.id AS id,qa.quiz AS quizid, qa.userid AS userid,u.firstname AS firstname,MAX(qa.sumgrades) AS sumgrades
            FROM {quiz} q
            LEFT JOIN {quiz_attempts} qa ON qa.quiz=q.id AND q.name NOT LIKE 'aa:%' AND q.name NOT LIKE 'bb:%'
            LEFT JOIN {user} u ON u.id=qa.userid
            WHERE qa.userid=? AND qa.state='finished' GROUP BY qa.userid, qa.quiz ORDER BY SUM(qa.sumgrades) DESC) scores
            GROUP BY scores.userid ORDER BY totalscore DESC", $param_otheruser, 0, 10));
                //print_r($otherUserTotalPoints);
                $userbadge = array_values($DB->get_records_sql('SELECT b.badge_name FROM {badge} b WHERE b.id IN (SELECT ub.user_badge_id FROM {badge_user} ub WHERE ub.user_id=? AND b.badge_value=(SELECT MAX(b.badge_value) FROM {badge} b INNER JOIN {badge_user} ub ON ub.user_badge_id=b.id WHERE ub.user_id=?))LIMIT 0,1', $param_badgeotheruser));
                //print_r($userbadge);
                $firstname = substr($otherUsersScore[$i]->firstname, 0, 1);
                $lastname = substr($otherUsersScore[$i]->lastname, 0, 1);
                $UserScoreDetails['userid'][] = $otherUsersScore[$i]->userid;
                $UserScoreDetails['firstname'][] = $firstname;
                $UserScoreDetails['lastname'][] = $lastname;
                $UserScoreDetails['score'][] = $otherUsersScore[$i]->score;
                $UserScoreDetails['totalscore'][] = $otherUserTotalPoints[0]->totalscore;
                $UserScoreDetails['badge'][] = $userbadge[0]->badge_name;
            }

            if (!empty($UserScoreDetails)) {
                $response->response(false, 'done', $UserScoreDetails);
            } else {
                $response->response(true, 'no_records', $UserScoreDetails);
            }
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

