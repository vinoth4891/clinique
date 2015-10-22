<?php

header('Access-Control-Allow-Origin: *');

define('AJAX_SCRIPT', true);
//define('REQUIRE_CORRECT_ACCESS', true);
//define('NO_MOODLE_COOKIES', true);

require_once('response.php');
require_once('../../config.php');
require_once($CFG->libdir . '/sessionlib.php');

//HTTPS is required in this page when $CFG->loginhttps enabled
//$PAGE->https_required();

class CliniqueServices {

    public static function invokeService() {

        $action = required_param('action', PARAM_RAW_TRIMMED);
       

        switch ($action) {

            case 'login':

                CliniqueServices::__login();

                break;

            case 'logout':

                require_once('clinique_logout.php');

                Logout::__logout();

                break;

            case 'change_password':
				self::__verify_token();
                CliniqueServices::__change_password();

                break;

            case 'forgot_password':

                CliniqueServices::__forgot_password();

                break;

            case 'players':

                CliniqueServices::__players_bar();

                break;

            case 'badges':

                CliniqueServices::__badges_bag();

                break;

            case 'progress':

                CliniqueServices::__progress_bar();

                break;

            case 'create_favorite':

                CliniqueServices::__createfavorites();

                break;

            case 'favorite':

                CliniqueServices::__favorites();

                break;

            case 'by_user_searchfield':

                CliniqueServices::__by_user_searchfield();

                break;

            case 'by_course_searchfield':

                CliniqueServices::__by_course_searchfield();

                break;
            case 'reports':

                CliniqueServices::__reports();

                break;
			case 'reports_search':

                CliniqueServices::__report_search();

                break;
            case 'cronreport':

                CliniqueServices::__cronreport();

                break;
            case 'export':

                CliniqueServices::__export();

                break;
            case 'csv':

                CliniqueServices::__csv();

                break;
            case 'remove_favorite':

                CliniqueServices::__remove();

                break;
            case 'widget':

                CliniqueServices::__widget();
                break;
            case 'self_registration':

                CliniqueServices::__selfregistarion();

                break;
            case 'cascade_dropdown':
                
                CliniqueServices::__cascadedropdown();

                break;
				
			case 'get_course_pdf_bookmarks':
				self::__verify_token();
				CliniqueServices::__get_course_pdf_bookmarks();
				break;

			case 'insert_course_pdf_bookmark':
				self::__verify_token();
				CliniqueServices::__insert_course_pdf_bookmark();
				break;

			case 'delete_course_pdf_bookmark':
				self::__verify_token();
				CliniqueServices::__delete_course_pdf_bookmark();
				break;

			case 'get_course_resource_comment':
				self::__verify_token();
				CliniqueServices::__get_course_resource_comment();
				break;

			case 'get_course_resource_comments':
				self::__verify_token();
				CliniqueServices::__get_course_resource_comments();
				break;	
			
			case 'get_course_resource_comments_export':
				self::__verify_token();
				CliniqueServices::__get_course_resource_comments_export();
				break;	

			case 'insert_replace_course_resource_comment':
				self::__verify_token();
				CliniqueServices::__insert_replace_course_resource_comment();
				break;		
			case 'complete_user_data':
				self::__verify_token();
				CliniqueServices::__get_complete_user_data();
				break;
			case 'scormpackage':
                CliniqueServices::__ScormPackage();
                break;
        }
    }

	private static function __verify_token() {
		$userId = self::get_user_id();
		if(empty($userId)) {
			$response = new CliniqueServiceResponce();
			$response->response(false, 'Invalid user');
			die;
		}
	}

	private static function get_user_id() {
		global $DB;
		$tokenval = required_param('token', PARAM_RAW_TRIMMED);
		$token_val = array('token'=>$tokenval);

		$user = current(array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', $token_val)));
		return empty($user->userid) ? null : $user->userid;
	}
    private function __get_course_pdf_bookmarks() {
        require_once('clinique_course_resource.php');
        $coursemoduleid = required_param('coursemoduleid', PARAM_RAW);
        $uid = self::get_user_id();
        CourseResource::__getCoursePDFBookmarks($uid,$coursemoduleid);
    }	

    private function __insert_course_pdf_bookmark() {
        require_once('clinique_course_resource.php');
        $coursemoduleid = required_param('coursemoduleid', PARAM_RAW);
        $uid = self::get_user_id();
		 $pageid = required_param('pageid', PARAM_RAW);
        CourseResource::__insertCoursePDFBookmark($uid, $coursemoduleid, $pageid);
    }

    private function __delete_course_pdf_bookmark() {
        require_once('clinique_course_resource.php');
        $coursemoduleid = required_param('coursemoduleid', PARAM_RAW);
        $pageid = required_param('pageid', PARAM_RAW);
        $uid = self::get_user_id();
        CourseResource::__deleteCoursePDFBookmark($uid, $coursemoduleid, $pageid);
    }	
	
    private function __get_course_resource_comment() {
        require_once('clinique_course_resource.php');
        $coursemoduleid = required_param('coursemoduleid', PARAM_RAW);
        $type = optional_param('type', null, PARAM_RAW);
        $uid = self::get_user_id();
        CourseResource::__getCourseResourceComment($uid, $coursemoduleid, $type);
    }	
	
    private function __get_course_resource_comments() {
        require_once('clinique_course_resource.php');
        $uid = self::get_user_id();
        $limit = optional_param('end', 20, PARAM_INT);
        $offset = optional_param('start', 0, PARAM_INT);
        CourseResource::__getCourseResourceComments($uid, $offset, $limit);
    }	

	private function __get_course_resource_comments_export() {
        require_once('clinique_course_resource.php');
        $uid = self::get_user_id();
		$recordrow = required_param('recordrow', PARAM_RAW_TRIMMED);
        CourseResource::__getCourseResourceCommentsExport($uid, $recordrow);
    }		

    private function __insert_replace_course_resource_comment() {
        require_once('clinique_course_resource.php');
        $coursemoduleid = required_param('coursemoduleid', PARAM_RAW);
        $type = required_param('type', PARAM_RAW);
        $uid = self::get_user_id();
        $comment = required_param('comment', PARAM_RAW_TRIMMED);
        CourseResource::__insertReplaceCourseResourceComment($uid, $coursemoduleid, $type, $comment);
    }	
	
    private function __change_password() {

        require_once('clinique_change_password.php');
        
		$username = required_param('username', PARAM_RAW);

        $email = required_param('email', PARAM_EMAIL);

        $old_password = required_param('old_pwd', PARAM_RAW);

        $new_password = required_param('new_pwd', PARAM_RAW);

        ChangePassword::__getPassword($username, $email, $old_password, $new_password);
    }

    private function __login() {

        require_once('clinique_login_authenticate.php');

        $username = required_param('username', PARAM_USERNAME);

        $password = required_param('password', PARAM_RAW);

        $serviceshortname = required_param('service', PARAM_ALPHANUMEXT);

        Login::__authenticate($username, $password, $serviceshortname);
    }

    private function __forgot_password() {

        require_once('clinique_forgot_password.php');

        $email = required_param('email', PARAM_EMAIL);

        ForgotPassword::__sendPassword($email);
    }

    private function __players_bar() {

        require_once('clinique_players_bar.php');

        $cid = required_param('cid', PARAM_RAW_TRIMMED);

        $uid = required_param('uid', PARAM_RAW_TRIMMED);

        PlayersPercent::__analysePercentage($cid, $uid);
    }

    private function __badges_bag() {

        require_once('clinique_badges_bag.php');

        $callFor = required_param('callFor', PARAM_RAW_TRIMMED);

        $uid = required_param('uid', PARAM_RAW_TRIMMED);

        $bid = optional_param('bid', false, PARAM_RAW);

        BadgeDisplay::__DisplayBadges($uid, $callFor, $bid);
    }

    private function __progress_bar() {

        require_once('clinique_progress_bar.php');

        $uid = required_param('uid', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseProgressPercentage($uid);
    }

    private function __createfavorites() {

        require_once('favorite.php');
        $bookmarkurl = required_param('bookmarkurl', PARAM_RAW_TRIMMED);
        $title = required_param('title', PARAM_RAW_TRIMMED);
		$userid = self::get_user_id();

        Favorite::add($userid, $bookmarkurl, $title);
    }

    private function __favorites() {

        require_once('favorite.php');
		$userid = self::get_user_id();
        Favorite::fetchAll($userid);
    }

    private function __by_user_searchfield() {

        require_once('user_searchfield.php');
        
        $type = required_param('type', PARAM_RAW_TRIMMED);
        $region = optional_param('region','', PARAM_RAW_TRIMMED);
        $country = optional_param('country','', PARAM_RAW_TRIMMED);
        $retailer = optional_param('retailer','', PARAM_RAW_TRIMMED);
        $filter = optional_param('filter',1, PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseUserSearchfield($type, $region, $country, $retailer, $filter);
    }

    private function __by_course_searchfield() {

        require_once('course_searchfield.php');
                
        $type = required_param('type', PARAM_RAW_TRIMMED);
        $region = optional_param('region','', PARAM_RAW_TRIMMED);
        $country = optional_param('country','', PARAM_RAW_TRIMMED);
        $retailer = optional_param('retailer','', PARAM_RAW_TRIMMED);
        $filter = optional_param('filter',1, PARAM_RAW_TRIMMED);
        
        ProgressPercent::__analyseCourseSearchfield($type, $region, $country, $retailer, $filter);
    }

    private function __reports() {

        require_once('clinique_reports.php');

        $type = required_param('type', PARAM_RAW_TRIMMED);
        $retailer = required_param('retailer', PARAM_RAW_TRIMMED);
        $store = required_param('store', PARAM_RAW_TRIMMED);
        $region = required_param('region', PARAM_RAW_TRIMMED);
        $country = required_param('country', PARAM_RAW_TRIMMED);
        $course = required_param('course', PARAM_RAW_TRIMMED);
        $team = required_param('team', PARAM_RAW_TRIMMED);
        $limit_start = required_param('start', PARAM_RAW_TRIMMED);
        $limit_end = required_param('end', PARAM_RAW_TRIMMED);
        $sortBy = required_param('sortby', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseReports($type, $retailer, $store, $region, $country, $course, $team, $limit_start, $limit_end, $sortBy);
    }
	
	private function __report_search() {

        require_once('clinique_reports.php');

		$fields = required_param('fields', PARAM_RAW_TRIMMED);
        $keyword = required_param('keyword', PARAM_RAW_TRIMMED);
        $limit_start = required_param('start', PARAM_RAW_TRIMMED);
        $limit_end = required_param('end', PARAM_RAW_TRIMMED);
        $sortBy = required_param('sortby', PARAM_RAW_TRIMMED);

        ProgressPercent::__searchReports($fields, $keyword, $limit_start, $limit_end, $sortBy);
    }

    private function __cronreport() {

        require_once('clinique_cronreport.php');

        ProgressPercent::__analyseCronReport();
    }

    private function __export() {

        require_once('clinique_export.php');

        $type = required_param('type', PARAM_RAW_TRIMMED);
        $retailer = required_param('retailer', PARAM_RAW_TRIMMED);
        $store = required_param('store', PARAM_RAW_TRIMMED);
        $region = required_param('region', PARAM_RAW_TRIMMED);
        $country = required_param('country', PARAM_RAW_TRIMMED);
		$course = required_param('course', PARAM_RAW_TRIMMED);
        $team = required_param('team', PARAM_RAW_TRIMMED);
        $sortBy = required_param('sortby', PARAM_RAW_TRIMMED);
        $fields = required_param('fields', PARAM_RAW_TRIMMED);
        $keyword = required_param('keyword', PARAM_RAW_TRIMMED);
		$isshowreport = required_param('isshowreport', PARAM_RAW_TRIMMED);
        $recordrow = required_param('recordrow', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseExport($type, $retailer, $store, $region, $country, $course, $team, $sortBy, $fields, $keyword, $isshowreport, $recordrow);
    }

    private function __csv() {

        require_once('clinique_csv.php');

        $retailer = required_param('csv', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseCSV($csv);
    }

    private function __remove() {
        require_once('favorite.php');
        $bookmarkurl = required_param('bookmarkurl', PARAM_RAW_TRIMMED);
        $title = required_param('title', PARAM_RAW_TRIMMED);
		$userid = self::get_user_id();

        Favorite::delete($userid, $bookmarkurl, $title);
    }

    private function __widget() {       
		global $CFG;
        require_once('widgets.php');

        $cousreId = required_param('courseid', PARAM_RAW_TRIMMED);
		$modId = optional_param('modId',null, PARAM_RAW_TRIMMED);
		//$modId = required_param('modId', PARAM_RAW_TRIMMED);

        $widgetType = required_param('widgettype', PARAM_RAW_TRIMMED);
		if($widgetType=="Multi") {
			Widgets::__WidgetMultidisplay($cousreId, $widgetType, $modId);
		} else {
			Widgets::__Widgetdisplay($cousreId, $widgetType, $modId);
		}
    }

    private function __selfregistarion() {

        require_once('clinique_users.php');


        $username = required_param('username', PARAM_RAW_TRIMMED);

        $password = required_param('password', PARAM_RAW_TRIMMED);

        $firstname = required_param('firstname', PARAM_RAW_TRIMMED);

        $lastname = required_param('lastname', PARAM_RAW_TRIMMED);

        $email = required_param('email', PARAM_RAW_TRIMMED);

        $city = required_param('region', PARAM_RAW_TRIMMED);

        $country = required_param('country', PARAM_RAW_TRIMMED);

        $store = required_param('store', PARAM_RAW_TRIMMED);

        $retailer = required_param('retailer', PARAM_RAW_TRIMMED);

        $lang = required_param('lang', PARAM_RAW_TRIMMED);

        $regionkey = required_param('regionkey', PARAM_RAW_TRIMMED);

        $jobtitle = required_param('jobtitle', PARAM_RAW_TRIMMED);
		
		$insertflag = optional_param('insertflag',false, PARAM_RAW_TRIMMED);
		
		$other = required_param('others', PARAM_RAW_TRIMMED);

        CliniqueUser::__CreateUser($username, $password, $firstname, $lastname, $email, $city, $country, $store, $retailer, $lang, $regionkey, $jobtitle, $insertflag, $other);
    }

    private function __cascadedropdown() {

        require_once('clinique_cascade_dropdown.php');
        
        $type = required_param('type', PARAM_RAW_TRIMMED);
        $region = optional_param('region','', PARAM_RAW_TRIMMED);
        $country = optional_param('country','', PARAM_RAW_TRIMMED);
        $retailer = optional_param('retailer','', PARAM_RAW_TRIMMED);

        CascadeDropdown::__cascadedatas($type, $region, $country, $retailer);
        
    }

   private static function __get_complete_user_data() {
       require_once('clinique_complete_user_data.php');
       $uid = self::get_user_id();
       $from = optional_param('from','', PARAM_RAW_TRIMMED);
       CompleteUserData::__fetchCompleteUserData($uid, $from);
   }
   
   private function __ScormPackage() {
        require_once('scormpackage.php');
        $cousreId = required_param('courseid', PARAM_RAW_TRIMMED);
        $cmid = required_param('cmid', PARAM_RAW_TRIMMED);
        ScormPackage::__ScormPackage($cmid,$cousreId);
    }	
}

CliniqueServices::invokeService();

//$s = new CliniqueServices();$s->invokeService();