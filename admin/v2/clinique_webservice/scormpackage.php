<?php
require_once('response.php');
class ScormPackage {
    public function __ScormPackage($cmid,$courseid) {
        //$courseid ='130';
        //$cmid ='1644';
        if (!$cm = get_coursemodule_from_id('scorm', $cmid,$courseid)) {
            print_error('invalidcoursemodule');
        }
        $data = self::scorm_data_array($cmid,$courseid);
        self::scorm_file_download($data);
    }
    // Query to fetch scorm file data
    private static function scorm_data_array($cmid, $courseid) {
        global $DB;
        $data = $DB->get_records_sql("SELECT cm.instance as id,name,reference,sha1hash "
                . "FROM mdl_scorm s JOIN mdl_course_modules cm "
                . "ON s.course = cm.course AND cm.instance = s.id "
                . "WHERE cm.id = " . $cmid . " AND s.course=" . $courseid);
        return array_values($data);
    }
    // function to convert hash to filename and download
    private static function scorm_file_download($data) {
        global $CFG;
        //$id = $data[0]->id;
        //$name = $data[0]->name;
        $filename = $data[0]->reference;
        $hash = $data[0]->sha1hash;
        $folders = substr($hash, 0, 4); // returns "de"
        $folder1 = substr($folders, 0, 2);
        $folder2 = substr($folders, -2, 2);
        $file = $CFG->dataroot.'/filedir/'.$folder1.'/'.$folder2.'/'.$hash;
        if (file_exists($file)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename='.basename($filename));
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($file));
            readfile($file);
            exit;
        }
    }
}
?>