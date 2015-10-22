<?php

require_once('response.php');

class BadgeDisplay {

    public static function __DisplayBadges($uid, $callFor, $bid, $return = false) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

        $param_total = array('user_id' => $uid);

        $params = array('user_badge_id' => $bid, 'user_id' => $uid);

        if ($callFor == 'getBadges') {

            $badgedetails = array_values($DB->get_records_sql('SELECT id,badge_name,badge_value FROM {badge} ORDER BY badge_value'));

            //  $users_badges = array_values($DB->get_records_sql('SELECT ub.user_badge_id,ub.user_badge_value,b.badge_name FROM {badge_user} ub,{badge} b WHERE ub.user_id=? AND ub.user_badge_id=b.id', $param_total));
            $users_badges = array_values($DB->get_records_sql('SELECT ub.id,ub.user_badge_id,b.badge_value,b.badge_name FROM {badge_user} ub INNER JOIN {badge} b WHERE ub.user_id=? AND ub.user_badge_id=b.id;', $param_total));
            $user_score = self::getUserScore($uid);
            if (!empty($bid)) {
                $bval = $DB->get_field('badge', 'badge_value', array('id' => $bid));
            }
            if (!empty($uid) && !empty($bid) && !empty($bval) && $user_score > $bval) {
                $DB->insert_record('badge_user', $params);
            }
            $badges = @array_merge(array("badges" => $badgedetails, "userbadges" => $users_badges));
            if (empty($return)) {
                if (!empty($badges)) {
                    $response->response(false, 'done', $badges);
                } else {
                    $response->response(true, 'no_records', $badges);
                }
            } else {
                return $badges;
            }
        }
    }

    public static function getUserScore($uid) {
        global $CFG, $DB;
        $param_currentuser = array('userid' => $uid);
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
        $bval = self::getUserTotalBadge($param_currentuser);
        $result = round($currentUserTotalPoints[0]->totalscore) - $bval;
        return $result;
    }

    public static function getUserTotalBadge($uid) {
        global $CFG, $DB;
        $badges_total = array_values($DB->get_records_sql('SELECT SUM(b.badge_value) as btotal FROM {badge_user} ub INNER JOIN {badge} b WHERE ub.user_id=? AND ub.user_badge_id=b.id;', $uid));
        return $badges_total[0]->btotal;
    }

}
