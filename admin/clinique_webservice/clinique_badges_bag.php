<?php

require_once('response.php');

class BadgeDisplay {

    public function __DisplayBadges($uid, $callFor, $bid) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

        $param_total = array('user_id' => $uid);
       
        $params = array('user_badge_id' => $bid, 'user_id' => $uid);
        
        if ($callFor == 'getBadges') {
            $badgedetails = array_values($DB->get_records_sql('SELECT id,badge_name,badge_value FROM {badge} ORDER BY badge_value'));

          //  $users_badges = array_values($DB->get_records_sql('SELECT ub.user_badge_id,ub.user_badge_value,b.badge_name FROM {badge_user} ub,{badge} b WHERE ub.user_id=? AND ub.user_badge_id=b.id', $param_total));
  $users_badges = array_values($DB->get_records_sql('SELECT ub.id,ub.user_badge_id,b.badge_value,b.badge_name FROM {badge_user} ub INNER JOIN {badge} b WHERE ub.user_id=? AND ub.user_badge_id=b.id;', $param_total));
            if (!empty($uid) && !empty($bid)) {
                               
                 //$userbadgecnt = count($badge_userdetails);
               // if ($userbadgecnt == 0) {
                   $DB->insert_record('badge_user', $params);
                //}
            }
         
             $badges = @array_merge(array("badges"=>$badgedetails,"userbadges"=> $users_badges));
            if (!empty($badges)) {
                    $response->response(false, 'done', $badges);
                } else {
                    $response->response(true, 'no_records', $badges);
                }
        }
    }

}