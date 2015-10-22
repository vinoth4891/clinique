<?php
header('Access-Control-Allow-Origin: *');
require_once('response.php');
class CompletionUpdate {
        public static function __CompletionUpdate($uid, $request) {
        global $DB;

        $response = new CliniqueServiceResponce();
        foreach ($request->data[0]->completion_tracking as $data) {
            //$data->id              = 0;
            $data->coursemoduleid  = $data->id;
            $data->userid          = $uid;
            $data->completionstate = 1;
            $data->viewed          = 1;
            $data->timemodified    = time();    
            // Check there isn't really a row
            $dbs = $DB->get_field('course_modules_completion', 'id',array('coursemoduleid'=>$data->coursemoduleid, 'userid'=>$data->userid));
            if (!$dbs) {
                // Didn't exist before, needs creating
                $DB->insert_record('course_modules_completion', $data);
            } else {
				$data->id = $dbs;
				$DB->update_record('course_modules_completion', $data);
			}
        }
		$data = array(
			'completed_modules' => self::getCompletedModuleIds($uid),
		);
        $response->response(false, '', $data);
        die;
    }  

	public static function getCompletedModuleIds($userid) {
		global $DB;
		$completion_query = 'SELECT coursemoduleid FROM mdl_course_modules_completion WHERE userid = ? AND completionstate = 1 AND viewed = 1';
		$completed_modules = $DB->get_records_sql($completion_query, array($userid));	
		$modules = array();

		foreach($completed_modules as $completed_module) {
			$modules[] = $completed_module->coursemoduleid;
		}

		return $modules;
	}	
}
?>

