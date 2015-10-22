<?php

header('Access-Control-Allow-Origin: *');
require_once($CFG->dirroot.'/mod/scorm/locallib.php');
require_once('response.php');
class ScormUpdate {
    
    public static function __ScormUpdate($uid, $request) {
        
        $courseid = $request->courseid;
        $cmid = $request->modid;
        if (!$cm = get_coursemodule_from_id('scorm', $cmid,$courseid)) {
            print_error('invalidcoursemodule');
        }
        $data = self::scorm_data_array($cmid,$courseid);
        $reqdata = $uid.$courseid.$cmid; // $uid.$courseid.$cmid userid + courseid + modid
        $data_submitted = $request->data[0]->organizations->Turnaround_Revitalizing_Resource_ORG->cmi->$reqdata;
        $result = true;
        $attempts = $data_submitted->attempts->value;
        $starttime = $data_submitted->starttime->value;
        self::scorm_start_time($uid, $data['scormid'], $data['scoid'], $attempts,$starttime);
        foreach ($data_submitted as $element => $value) {
            $element = str_replace('__', '.', $element);
            if (substr($element, 0, 3) == 'cmi') {
                $netelement = preg_replace('/\.N(\d+)\./', "\.\$1\.", $element);
                if($value->setbysco === true){
                $result = scorm_insert_track($uid, $data['scormid'], $data['scoid'], $attempts, $element, $value->value, true) && $result;
                //$scormid, $scoid
                }
            }
        }
        $response = new CliniqueServiceResponce();
        if (!empty($result)) {
            $response->response(false, 'Recorded inserted successfully');
        }
        else{
            $response->response(true, 'Invalid ID');
        }
        die;
    }
     // Query to fetch scorm file data
    private static function scorm_data_array($cmid, $courseid) {
        global $DB;
        $res = array();
        $data = array_values($DB->get_records_sql("SELECT cm.instance as id "
                . "FROM mdl_scorm s JOIN mdl_course_modules cm "
                . "ON s.course = cm.course AND cm.instance = s.id "
                . "WHERE cm.id = " . $cmid . " AND s.course=" . $courseid));
        $res['scormid'] = $data[0]->id;
        $data2 = array_values($DB->get_records_sql("SELECT id FROM mdl_scorm_scoes WHERE scorm = ".$data[0]->id." AND launch != '' ORDER BY id DESC"));
        $res['scoid'] = $data2[0]->id;
        return $res;
    }
    // Query to check attemps already inserted for start time
    private static function scorm_start_time($userid, $scormid, $scoid, $attempts,$starttime) {
        global $DB;
        if($attempts == ''){
            $attempts = 1;
        }
        $data = array_values($DB->get_records_sql("SELECT id FROM mdl_scorm_scoes_track WHERE userid = ".$userid." AND scormid = ".$scormid." AND scoid = ".$scoid." AND attempt = ".$attempts." AND element LIKE 'x.start.time' ORDER BY id DESC"));
        //$res['scormid'] = $data[0]->id;
        if(!empty($data)){
        }
        else {
           $id = scorm_insert_track($userid, $scormid, $scoid, $attempts, 'x.start.time', $starttime);
        }
    }
    
    
    
}
?>

