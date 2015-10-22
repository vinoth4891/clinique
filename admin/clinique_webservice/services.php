<?php

header('Access-Control-Allow-Origin: *');

define('AJAX_SCRIPT', true);
//define('REQUIRE_CORRECT_ACCESS', true);
//define('NO_MOODLE_COOKIES', true);

require_once('../config.php');

//HTTPS is required in this page when $CFG->loginhttps enabled
//$PAGE->https_required();

class CliniqueServices {

    public function invokeService() {

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
        }
    }

    private function __change_password() {

        require_once('clinique_change_password.php');

        $email = required_param('email', PARAM_EMAIL);

        $old_password = required_param('old_pwd', PARAM_RAW);

        $new_password = required_param('new_pwd', PARAM_RAW);

        ChangePassword::__getPassword($email, $old_password, $new_password);
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

        require_once('create.php');

        $bookmarkurl = required_param('bookmarkurl', PARAM_RAW_TRIMMED);

        $title = required_param('title', PARAM_RAW_TRIMMED);

        $tokenval = required_param('token', PARAM_RAW_TRIMMED);

        CreateFavorites::__create($bookmarkurl, $title, $tokenval);
    }

    private function __favorites() {

        require_once('favorites.php');

        $tokenval = required_param('token', PARAM_RAW_TRIMMED);

        Favorites::__favorites($tokenval);
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
        $team = required_param('team', PARAM_RAW_TRIMMED);
        $sortBy = required_param('sortby', PARAM_RAW_TRIMMED);

        $recordrow = required_param('recordrow', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseExport($type, $retailer, $store, $region, $country, $team, $sortBy, $recordrow);
    }

    private function __csv() {

        require_once('clinique_csv.php');

        $retailer = required_param('csv', PARAM_RAW_TRIMMED);

        ProgressPercent::__analyseCSV($csv);
    }

    private function __remove() {

        require_once('delete.php');

        $bookmarkurl = required_param('bookmarkurl', PARAM_RAW_TRIMMED);

        $title = required_param('title', PARAM_RAW_TRIMMED);

        $tokenval = required_param('token', PARAM_RAW_TRIMMED);

        RemoveFavorites::__remove($bookmarkurl, $title, $tokenval);
    }

    private function __widget() {       
		global $CFG;
        require_once('widgets.php');

        $cousreId = required_param('courseid', PARAM_RAW_TRIMMED);

        $widgetType = required_param('widgettype', PARAM_RAW_TRIMMED);
		if($widgetType=="Multi") {
			$modId = required_param('modId', PARAM_RAW_TRIMMED);
			Widgets::__WidgetMultidisplay($cousreId, $widgetType, $modId);
		} else {
			Widgets::__Widgetdisplay($cousreId, $widgetType);
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

        CliniqueUser::__CreateUser($username, $password, $firstname, $lastname, $email, $city, $country, $store, $retailer, $lang, $regionkey, $jobtitle, $insertflag);
    }

    private function __cascadedropdown() {

        require_once('clinique_cascade_dropdown.php');
        
        $type = required_param('type', PARAM_RAW_TRIMMED);
        $region = optional_param('region','', PARAM_RAW_TRIMMED);
        $country = optional_param('country','', PARAM_RAW_TRIMMED);
        $retailer = optional_param('retailer','', PARAM_RAW_TRIMMED);

        CascadeDropdown::__cascadedatas($type, $region, $country, $retailer);
        
    }

}

CliniqueServices::invokeService();

//$s = new CliniqueServices();$s->invokeService();