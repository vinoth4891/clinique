<?php

require_once('response.php');
global $CFG;
require_once($CFG->dirroot . '/enrol/externallib.php');
require_once($CFG->dirroot . '/course/externallib.php');
require_once('widgets.php');
require_once('quizoffline.php');
require_once('clinique_login_authenticate.php');
require_once('clinique_progress_bar.php');
require_once('clinique_players_bar.php');
require_once('favorites.php');
require_once('favorite.php');
require_once('clinique_badges_bag.php');

class CompleteUserData {

	const COURSE_CATEGORY_ID = 2;
	const NEWS_CATEGORY_ID = 4;
	const RESOURCE_CATEGORY_ID = 3;
	const NEWS_CATEGORY_NAME = 'news';
	const RESOURCE_CATEGORY_NAME = '';

    public static function __fetchCompleteUserData($userid, $from) {
		global $DB;
		$serverTime = time();
		$courses = core_enrol_external::get_users_courses_subcat_offline($userid, self::COURSE_CATEGORY_ID);
             
		$course_enrols = "SELECT courseid, timemodified FROM (
			SELECT ue.id, userid, courseid, ue.timemodified FROM mdl_enrol e 
			JOIN mdl_user_enrolments ue ON e.id = ue.enrolid
			WHERE ue.userid = ? ORDER BY timemodified DESC) tmp
			GROUP BY userid, courseid";
		$user_cohort_course = ($DB->get_records_sql($course_enrols, array($userid)));
                $userData = array();
		$topics = array();
		$modules = array();
                $quizDelta = array();
		$players = array();
		$course_module_dependencies = array();
        $activeCourses = array();
		foreach ($courses as $i => $course) {
            $moduleIds = array();
			//@TODO performance - courses could have skipped when fetching from db itself rather than skipping it when iterating.
			$timemodified = $course['timemodified'] > $user_cohort_course[$course['id']]->timemodified 
					?  $course['timemodified'] : $user_cohort_course[$course['id']]->timemodified;
			$isnewenrol = ! empty($from) && $user_cohort_course[$course['id']]->timemodified > $from;
			if(( ! empty($from) && $timemodified < $from)) {
				unset($courses[$i]);
			}
              	$fromtimestamp = ( ! empty($isnewenrol)) ? null : $from;

			try {
				$topicsWithModules = core_course_external::get_course_contents($course['id'], array(), $fromtimestamp);
				$topics = array_merge($topics, self::extractTopics($course['id'], $topicsWithModules, $fromtimestamp));
				foreach ($topicsWithModules as $topicWithModule) {
					if (isset($topicWithModule['modules']) && is_array($topicWithModule['modules'])) {
						$modules = array_merge($modules, self::extractModules($course['id'], $topicWithModule['id'], $topicWithModule['modules'], $userid, $fromtimestamp));
                        $moduleIds = array_merge($moduleIds, self::extractModuleIds($course['id'], $topicWithModule['id'], $topicWithModule['modules'], $userid, $fromtimestamp));
                        $quizDelta = array_merge($quizDelta, self::extractQuizDeltaSync($course['id'], $topicWithModule['id'], $topicWithModule['modules'], $userid));                        
					}
				}
                $cID = $course['id'];
                $activecourse_mod = $moduleIds;
                $activeCourses[] = array("id" => $cID, "modules" => $activecourse_mod);
               
				$player = PlayersPercent::__analysePercentage($course['id'], $userid, true);
				$player = array_merge(array('courseid' => $course['id']), $player);
				$players[] = $player;
				$module_hierarchy = self::getModuleIdsByDependency($course['id']);

				if( ! empty($module_hierarchy)) {
					$course_module_dependencies = array_merge($course_module_dependencies, $module_hierarchy);
				}
			} catch (Exception $ex) {
				
			}
		}
		$courses = array_values($courses);
		$userData = new stdClass();
		$userData->user = self::getProfileDetails($userid);
		$userData->user_cohorts = self::getUserCohorts($userid);
        $userData->activeCourses = array_merge($activeCourses, self::getActiveCids($userid, $from));
		$userData->course_categories = core_course_external::get_categories();
		$userData->courses = $courses;
		$userData->topics = $topics;
		$userData->modules = $modules;
		$userData->module_dependencies = $course_module_dependencies;
		$userData->completed_modules = self::getCompletedModuleIds($userid);
		$userData->bookmarks = self::getBookmarks($userid);
		$userData->notes = self::getNotes($userid, $from);
		$userData->progress = ProgressPercent::__analyseProgressPercentage($userid, true);
		$userData->players = $players;
		$userData->favorites = Favorite::fetchAll($userid, true);
		$userData->badges = BadgeDisplay::__DisplayBadges($userid, 'getBadges', null, true);
		$userData->news = self::_NewsData($userid, $from);
		$userData->resources = self::_ResourcesData($userid, $from);
        $userData->quizsync = $quizDelta;
		$userData->server_time = $serverTime;
        $userData->contentsize = self::getContentSize($from, $courses, $modules);
		$response = new CliniqueServiceResponce();
		$response->response(false, null, $userData);
	}

	private static function fetchCourses($userId, $categoryId, $categoryType, $from) {
                global $DB;
		$courses = core_enrol_external::get_users_courses_subcat_offline($userId, $categoryId, $categoryType);       
                
                
                $course_enrols = "SELECT courseid, timemodified FROM (
			SELECT ue.id, userid, courseid, ue.timemodified FROM mdl_enrol e 
			JOIN mdl_user_enrolments ue ON e.id = ue.enrolid
			WHERE ue.userid = ? ORDER BY timemodified DESC) tmp
			GROUP BY userid, courseid";
		$user_cohort_course = ($DB->get_records_sql($course_enrols, array($userId)));
                
                
                
		$userData = array();
		$topics = array();
		$modules = array();
		$players = array();
		foreach ($courses as $i => $course) {
			//@TODO performance - courses could have skipped when fetching from db itself rather than skipping it when iterating.
//			if (!empty($from) && $course['timemodified'] < $from) {
//				unset($courses[$i]);
//			}
                        
                        $timemodified = $course['timemodified'] > $user_cohort_course[$course['id']]->timemodified 
					?  $course['timemodified'] : $user_cohort_course[$course['id']]->timemodified;
			$isnewenrol = ! empty($from) && $user_cohort_course[$course['id']]->timemodified > $from;
			if(( ! empty($from) && $timemodified < $from)) {
				unset($courses[$i]);
			}

			$fromtimestamp = ( ! empty($isnewenrol)) ? null : $from;

			try {
				$topicsWithModules = core_course_external::get_course_contents($course['id'], array(), $fromtimestamp);
				$topics = array_merge($topics, self::extractTopics($course['id'], $topicsWithModules, $fromtimestamp));

				foreach ($topicsWithModules as $topicWithModule) {
					if (isset($topicWithModule['modules']) && is_array($topicWithModule['modules'])) {
						$modules = array_merge($modules, self::extractModules($course['id'], $topicWithModule['id'], $topicWithModule['modules'], $userId, $fromtimestamp));                       
					}
				}               
               
			} catch (Exception $ex) {
				
			}
		}

		return array(
			'courses' => array_values($courses),
			'topics' => $topics,
			'modules' => $modules,
		);
	}
    
    private static function fetchActiveCourseIds($userId, $categoryId, $categoryType, $from) {
		$courses = core_enrol_external::get_users_courses_subcat_offline($userId, $categoryId, $categoryType);
        $acids = array();
		foreach ($courses as $i => $course) {
             $moduleIds = array();
			//@TODO performance - courses could have skipped when fetching from db itself rather than skipping it when iterating.
			if (!empty($from) && $course['timemodified'] < $from) {
				unset($courses[$i]);
			}

			try {
				$topicsWithModules = core_course_external::get_course_contents($course['id'], array(), $from);
				$topics = array_merge($topics, self::extractTopics($course['id'], $topicsWithModules, $from));

				foreach ($topicsWithModules as $topicWithModule) {
					if (isset($topicWithModule['modules']) && is_array($topicWithModule['modules'])) {						
                        $moduleIds = array_merge($moduleIds, self::extractModuleIds($course['id'], $topicWithModule['id'], $topicWithModule['modules'], $userid, $fromtimestamp));
					}
				}
                $cID = $course['id'];
                $activecourse_mod = $moduleIds;
              $acids[] = array("id" => $cID, "modules" => $activecourse_mod);
               
			} catch (Exception $ex) {
				
			}
		}

		return $acids;
	}

	private static function isModuleModifiedAfterTime($module, $from) {
        global $DB;

		$modified = true;

		if (empty($from))
			return true;

		if (!empty($module['contents']['timemodified'])) {
			$timemodified = $module['contents']['timemodified'];
		}

		if (!empty($module['contents'][0]['timemodified'])) {
			$timemodified = $module['contents'][0]['timemodified'];
		}

		if (!empty($module['widget']['timemodified'])) {
			$timemodified = $module['widget']['timemodified'];
		}
        if (!empty($module['scorm']['timemodified'])) {
			$timemodified = $module['scorm']['timemodified'];
		}

		if(empty($timemodified))  {
			$modified = true;
		} else {
 			$modified = $timemodified > $from;
		}

		return $modified;
	}

	private static function getUserCohorts($userid) {
		global $DB;

		$user_cohort_sql = 'SELECT c.idnumber  FROM {cohort_members} cm 
			JOIN {cohort} c ON cm.cohortid = c.id WHERE userid = ' . $userid;
		$user_chorts = $DB->get_records_sql($user_cohort_sql);


		$user_cohort_course_sql = "SELECT e.id, c.idnumber, e.courseid FROM {enrol} e 
			JOIN {cohort} c ON e.customint1 = c.id
			JOIN {cohort_members} cm ON cm.cohortid = c.id
			WHERE e.enrol = 'cohort' AND cm.userid = $userid";
		$user_cohort_course = $DB->get_records_sql($user_cohort_course_sql);

		$res = array();
		$i = 0;
		foreach ($user_chorts as $cohortid => $cohort) {
			$res[$i] = array(
				'id' => $cohort->idnumber,
			);

			$courses = array();
			foreach ($user_cohort_course as $cohort_course) {
				if ($cohort->idnumber === $cohort_course->idnumber) {
					$courses[] = $cohort_course->courseid;
				}
			}
			$res[$i]['courses'] = $courses;
			$res[$i]['timecreated'] = time();
			$res[$i]['timemodified'] = time();
			$i++;
		}


		return $res;
	}

	private static function getFavouties($userid) {
		global $DB;
		$user = $DB->get_record('user', array('id' => $userid));
		Favorites::__fav_user_login($user);
		$favourites_user = get_user_preferences('user_bookmarks');
		$favourites_user = explode(',', get_user_preferences('user_bookmarks'));
		$favBookmark = array();
		$incr = 0;
		foreach ($favourites_user as $favourite_bookmark) {
			$data = explode(';', $favourite_bookmark);
			$id = ($data[0]) ? $data[0] : null;
			$fileDetails = explode("@", $data[1]);

			if ($fileDetails[0]) {
				$getModInfo = $DB->get_record('course_modules', array('id' => $fileDetails[0]));
			} else {
				$getModInfo = '';
			}
			if ($getModInfo) {
				$res[$incr]['url'] = $data[0];
				$res[$incr]['id'] = ($fileDetails[0]) ? $fileDetails[0] : null;
				$res[$incr]['course_type'] = ($fileDetails[1]) ? $fileDetails[1] : null;
				$res[$incr]['file_name'] = ($fileDetails[2]) ? $fileDetails[2] : null;
				$res[$incr]['file_type'] = ($fileDetails[3]) ? $fileDetails[3] : null;
				$res[$incr]['fname_upload'] = ($fileDetails[4]) ? $fileDetails[4] : null;
				$incr++;
			}
		}
		if ($incr == 0) {
			$res[$incr]['url'] = "";
			$res[$incr]['id'] = null;
			$res[$incr]['course_type'] = null;
			$res[$incr]['file_name'] = null;
			$res[$incr]['file_type'] = null;
			$res[$incr]['fname_upload'] = null;
		}

		return $res;
	}

	public static function getBookmarks($userid) {
		global $DB;
		$modules_query = 'SELECT DISTINCT  coursemoduleid, timecreated FROM {user_pdf_bookmarks} WHERE userid = ' . $userid;
		$modules = $DB->get_records_sql($modules_query);

		$bookmarks = $DB->get_records('user_pdf_bookmarks', array(
			'userid' => $userid,
		));

		$modules_pages = array();
		foreach ($modules as $module) {
			$pages = array();
			foreach ($bookmarks as $bookmark) {
				if ($module->coursemoduleid === $bookmark->coursemoduleid) {
					array_push($pages, (int) $bookmark->page_number);
				}
			}

			$modules_pages[] = array(
				'coursemoduleid' => $module->coursemoduleid,
				'pages' => $pages,
				'timemodified' => strtotime($module->timecreated),
			);
		}

		return $modules_pages;
	}

	public static function getNotes($userid, $from) {
		global $DB;

		$fav_comment_sql = 'SELECT urc.id AS commentid, urc.coursemoduleid, c.fullname AS course_name,
			r.name AS resource_name, urc.type, urc.comment, urc.timecreated, urc.timemodified
			FROM mdl_user_resource_comments urc
			 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
			 JOIN mdl_course c ON cm.course = c.id
			 JOIN mdl_resource r ON cm.instance = r.id
			WHERE urc.userid = ' . $userid . " AND TRIM(COALESCE(urc.comment, '')) != '' ORDER BY urc.id";
		$comments = $DB->get_records_sql($fav_comment_sql);
		$comments_data = array();

		if (!empty($comments)) {
			foreach ($comments as $comment) {
				$timemodified = strtotime($comment->timecreated);

				if (!empty($comment->timemodified)) {
					$timemodified = strtotime($comment->timemodified);
				}

				if (!empty($from) && $from >= $timemodified) {
					continue;
				}

				$resource_name = preg_replace('/^(.*?:\s*)/sm', '', $comment->resource_name);
				$comments_data[] = array(
					'id' => $comment->commentid,
					'coursemoduleid' => $comment->coursemoduleid,
					'type' => $comment->type,
					'course_name' => $comment->course_name,
					'resource_name' => $resource_name,
					'comment' => $comment->comment,
					'timecreated' => strtotime($comment->timecreated),
					'timemodified' => strtotime($timemodified),
				);
			}
		}

		return $comments_data;
	}

	public static function getProfileDetails($userid) {
		$user = get_complete_user_data('id', $userid, $CFG->mnet_localhost_id);

		$user->role = '';
		if (Login::__is_report_user($userid)) {
			$user->role = 'reportuser';
		}

		unset($user->password);

		$user->country_value = $user->country;
		$user->country = get_string($user->country, 'countries');

		return $user;
	}

	private static function extractTopics($couseid, $topicsWithModules, $from) {
		foreach ($topicsWithModules as $i => &$topicWithModules) {
			unset($topicWithModules['modules']);
            
            if( ! empty($from) && $topicWithModules['timemodified'] < $from) {
                unset($topicsWithModules[$i]);
                continue;                
            }
			//Insert courid in the topicid for readibility
			$topic = array_slice($topicWithModules, 0, 1, true) +
					array('courseid' => $couseid) +
					array_slice($topicWithModules, 1, null, true);
			$topicWithModules = $topic;
		}
        
		unset($topicWithModules);
		return array_values($topicsWithModules);
	}
    
    private static function extractQuizDeltaSync($couseid, $topicid, array $modules, $userid) {
        $delta = array();
		foreach ($modules as $i => $module) {        
			$widgetType = self::getWidgetType($module['name']);
			if (empty($widgetType) && $module['modname'] === 'quiz') {
                   $quizsyncvals = QuizInfo::__QuizDeltaSync($couseid, $userid, $module['id']);
                   if(!empty($quizsyncvals)){
                       $delta[$i]['id'] = $module['id'];
                       $delta[$i]['courseid'] = $couseid;
                       $delta[$i]['topicid'] = $topicid;
                       $delta[$i]['quiz'] = $quizsyncvals;      
                   }
                } else {
                    unset($modules[$i]);
                }      
        }
        return $delta;
    }
    
	private static function extractModuleIds($couseid, $topicid, array $modules, $userid, $from) {
        $moduleIds = array();
		foreach ($modules as $i => $module) { 
            $moduleIds[] = $module['id'];
        }  
        
        return $moduleIds;
    }

	private static function extractModules($couseid, $topicid, array $modules, $userid, $from) {
        global $DB;
		foreach ($modules as $i => &$module) {                                          
			$content = !empty($module['contents'][0]) ? $module['contents'][0] : null;            
			unset($module['contents']);
			$module['contents'] = $content;         
             if( $module['modname'] == "resource" ){
                $mid = $module['id'];
                $sql="SELECT r.timemodified FROM mdl_course_modules cm 
                JOIN mdl_resource r ON cm.instance = r.id WHERE cm.id = $mid";
                $res_latest = $DB->get_record_sql($sql);
                $module['contents']['timemodified'] = $res_latest->timemodified;               
            }
            if( $module['modname'] == "game" ){
                $mid = $module['id'];
                $sql="SELECT g.timemodified FROM mdl_course_modules cm 
                JOIN mdl_game g ON cm.instance = g.id WHERE cm.id = $mid";
                $res_latest = $DB->get_record_sql($sql);
                $module['contents']['timemodified'] = $res_latest->timemodified;               
            }
            if( $module['modname'] == "scorm" && !empty($from)){
                $mid = $module['id'];
                $sql="SELECT g.timemodified FROM mdl_course_modules cm 
                JOIN mdl_scorm g ON cm.instance = g.id WHERE cm.id = $mid";
                $res_latest = $DB->get_record_sql($sql);
                if(!empty($res_latest)){
                    if(!empty($res_latest->timemodified)){
                       $module['scorm']['timemodified'] = $res_latest->timemodified;               
                    }
                    else
                    {  
                        unset($modules[$i]);
                        continue;             
                    }
                }
                
            }
            
            
			$widgetType = self::getWidgetType($module['name']);

			if (!empty($widgetType)) {

				if ($widgetType === 'Multi') {
					$module['widget'] = Widgets::__WidgetMultidisplay($couseid, $widgetType, $module['id'], true);
				} else {
					$module['widget'] = Widgets::__Widgetdisplay($couseid, $widgetType, $module['id'], true);
				}
			} else { // Could be quiz
				if ($module['modname'] === 'quiz') {
					$module['quiz'] = QuizInfo::__QuizInfo($couseid, $userid, $module['id'], $from);
                    if(empty($module['quiz'])){
                        unset($modules[$i]);
                        continue;
                    }
				}
			}
			if (!self::isModuleModifiedAfterTime($module, $from) || ( ! empty($from) && $module['modname'] === 'forum')) {
				unset($modules[$i]);
				continue;
			}
			//Insert courseid in the topic id for readibility
			$module = array_slice($module, 0, 2, true) +
					array('courseid' => $couseid, 'topicid' => $topicid) +
					array_slice($module, 2, null, true);
		}
		unset($module);
        

		return array_values($modules);
	}

	/**
	 * If module name starts with aa:, bb: bbe: cc:, dd: 
	 * @param type $module
	 */
	private static function getWidgetType($moduleName) {
		$widgetTypesPrefixes = array(
			'aa:' => 'Uncover',
			'aae:' => 'Uncover',
			'bb:' => 'Match',
			'bbe:' => 'Multi',
			'dd:' => 'Sequence',
			'gg:' => 'Memorygame',
		);

		foreach ($widgetTypesPrefixes as $prefix => $widgetType) {
			if (self::startsWith($moduleName, $prefix)) {
				return $widgetTypesPrefixes[$prefix];
			}
		}

		return null;
	}

	private static function startsWith($haystack, $needle) {
		// search backwards starting from haystack length characters from the end
		return $needle === "" || strrpos($haystack, $needle, -strlen($haystack)) !== false;
	}

	public static function _NewsData($userId, $from) {
		return array();
		//return self::fetchCourses($userId, self::NEWS_CATEGORY_ID, self::NEWS_CATEGORY_NAME, $from);
	}

	public static function _ResourcesData($userId, $from) {
		return self::fetchCourses($userId, self::RESOURCE_CATEGORY_ID, self::RESOURCE_CATEGORY_NAME, $from);
	}
    public static function getActiveCids($userId, $from){
         return self::fetchActiveCourseIds($userId, self::RESOURCE_CATEGORY_ID, self::RESOURCE_CATEGORY_NAME, $from);
    }

    public static function getBadgesDetails($userid) {
		global $DB;

		$badge_detail_sql = 'SELECT b.id, b.badge_name, b.badge_value, bu.id AS buid, bu.user_badge_id, bu.user_id
			FROM mdl_badge b
			 JOIN mdl_badge_user bu ON b.id = bu.user_badge_id			 
			WHERE bu.user_id = ' . $userid . " ORDER BY bu.id";
		$badges = $DB->get_records_sql($badge_detail_sql);
		$badges_data = array();

		if (!empty($badges)) {
			foreach ($badges as $badge) {
				$badges_data['userbadges'][] = array(
					'id' => $badge->buid,
					'user_badge_id' => $badge->user_badge_id,
					'badge_value' => $badge->badge_value,
					'badge_name' => $badge->badge_name,
				);
			}
		}

		return $badges_data;
	}
        public static function getContentSize($from, $courses, $modules) {
              global $CFG, $DB;  
      if( empty($from) && !empty($courses )){
          $cid = array();
              foreach($courses as $cc){
                  $cid[] = $cc['id'];
                  $courseids = implode(",", $cid);
              }
                          $sql = "SELECT DISTINCT course.filename, course.id AS CourseID, course.fullname AS CourseFullName, course.shortname AS CourseShortName, course.filesize AS CourseSizeBytes
FROM (

SELECT c.id, c.fullname, c.shortname, cx.contextlevel,f.component, f.filearea, f.filename, f.filesize
FROM mdl_context cx
JOIN mdl_course c ON cx.instanceid=c.id
JOIN mdl_files f ON cx.id=f.contextid
WHERE f.filename <> '.'
AND f.component NOT IN ('private', 'automated', 'backup','draft') AND c.id IN ($courseids)

UNION

SELECT cm.course, c.fullname, c.shortname, cx.contextlevel,f.component, f.filearea, f.filename, f.filesize
FROM mdl_files f
JOIN mdl_context cx ON f.contextid = cx.id
JOIN mdl_course_modules cm ON cx.instanceid=cm.id
JOIN mdl_course c ON cm.course=c.id
WHERE filename <> '.' AND c.id IN ($courseids)

UNION

SELECT c.id, c.shortname, c.fullname, cx.contextlevel, f.component, f.filearea, f.filename, f.filesize
from mdl_block_instances bi
join mdl_context cx on (cx.contextlevel=80 and bi.id = cx.instanceid)
join mdl_files f on (cx.id = f.contextid)
join mdl_context pcx on (bi.parentcontextid = pcx.id)
join mdl_course c on (pcx.instanceid = c.id)
where filename <> '.' AND c.id IN ($courseids)

) AS course";
            $details = $DB->get_records_sql($sql);
            $total_bytes = "";
            foreach( $details as $list ) {
               $total_bytes += $list->coursesizebytes;   
            }
            $final_size = self::formatBytes($total_bytes);    
            //$final_size = $total_bytes;
        } elseif( !empty($from) && !empty($modules) ){
             $total_bytes = "";
                foreach ($modules as $i => &$module) {
                    if( $module['modname'] == "resource" ){
                        $total_bytes += $module['contents']['filesize'];
                        $final_size = self::formatBytes($total_bytes);
                    } else {
                        $final_size = 0;
                    }                   
                }                     
        } elseif( !empty($from) && !empty($courses ) ){
            $cid = array();
              foreach($courses as $cc){
                  $cid[] = $cc['id'];
                  $courseids = implode(",", $cid);
              }
                          $sql = "SELECT DISTINCT course.filename, course.id AS CourseID, course.fullname AS CourseFullName, course.shortname AS CourseShortName, course.filesize AS CourseSizeBytes
FROM (

SELECT c.id, c.fullname, c.shortname, cx.contextlevel,f.component, f.filearea, f.filename, f.filesize
FROM mdl_context cx
JOIN mdl_course c ON cx.instanceid=c.id
JOIN mdl_files f ON cx.id=f.contextid
WHERE f.filename <> '.'
AND f.component NOT IN ('private', 'automated', 'backup','draft') AND c.id IN ($courseids)

UNION

SELECT cm.course, c.fullname, c.shortname, cx.contextlevel,f.component, f.filearea, f.filename, f.filesize
FROM mdl_files f
JOIN mdl_context cx ON f.contextid = cx.id
JOIN mdl_course_modules cm ON cx.instanceid=cm.id
JOIN mdl_course c ON cm.course=c.id
WHERE filename <> '.' AND c.id IN ($courseids)

UNION

SELECT c.id, c.shortname, c.fullname, cx.contextlevel, f.component, f.filearea, f.filename, f.filesize
from mdl_block_instances bi
join mdl_context cx on (cx.contextlevel=80 and bi.id = cx.instanceid)
join mdl_files f on (cx.id = f.contextid)
join mdl_context pcx on (bi.parentcontextid = pcx.id)
join mdl_course c on (pcx.instanceid = c.id)
where filename <> '.' AND c.id IN ($courseids)

) AS course";
            $details = $DB->get_records_sql($sql);
            foreach( $details as $list ) {
               $total_bytes += $list->coursesizebytes;   
            }
             $final_size = self::formatBytes($total_bytes);     
          } else {
              $final_size = 0;
          }      
            return $final_size;
        }
//1061572403
 public static function formatBytes($size=null, $precision = 2) {
    $base = log($size, 1024);
    $suffixes = array('', 'k', 'MB', 'GB', 'TB');  
    return round(pow(1024, $base - floor($base)), $precision) . $suffixes[floor($base)];
   }   
   public static function getUserCohortsCourses($userid){
       global $DB;
//        $uc = CompleteUserData::getUserCohorts($userid);      
//        $user_courses = array();
//        foreach($uc as $ucc){
//           $user_courses[] = $ucc['courses'];
//        }    
//        $all_courses = call_user_func_array('array_merge', $user_courses);
//        $user_cohort_courses = array_unique($all_courses);
//        $activecourses = array_values($user_cohort_courses);
       //echo "<pre>"; print_r($activecourses); 
        $activecourses = core_enrol_external::get_users_courses_subcat_offline($userid, self::COURSE_CATEGORY_ID);
        $activeresources = core_enrol_external::get_users_courses_subcat_offline($userid, self::RESOURCE_CATEGORY_ID);
        
        $ActiveCourses = array();
        foreach($activecourses as $i => $ac){ 
            $courseid = $ac['id'];
            $mod_detail_sql = 'SELECT id FROM mdl_course_modules WHERE course = ' . $courseid . " AND visible = 1 ";
		    $course_modules = $DB->get_records_sql($mod_detail_sql);
            $c_m_details = array();
             if( !empty($course_modules )){
                foreach($course_modules as $cm){
                    $c_m_details[] = $cm->id;
                }
             }             
                $activecourse_mod = array_values($c_m_details);                
                $ActiveCourses[] = array("id" => $courseid, "modules" => $activecourse_mod);
        }        
         foreach($activeresources as $i => $ar){ 
            $courseid = $ar['id'];
            $mod_detail_sql = 'SELECT id FROM mdl_course_modules WHERE course = ' . $courseid . " AND visible = 1 ";
		    $course_modules = $DB->get_records_sql($mod_detail_sql);
            $c_m_details = array();
             if( !empty($course_modules )){
                foreach($course_modules as $cm){
                    $c_m_details[] = $cm->id;
                }
             }             
                $activeresource_mod = array_values($c_m_details);                
                $ActiveCourses[] = array("id" => $courseid, "modules" => $activeresource_mod);
        }        
        return array_values($ActiveCourses);
   }
   
	public static function getModuleIdsByDependency($courseId) {
		global $DB;
		$course_modules_query = 'SELECT id FROM mdl_course_modules WHERE course = ?';
		$course_modules = array_values($DB->get_records_sql($course_modules_query, array($courseId)));

		$modules_query = 'SELECT cma.id, cma.sourcecmid, cma.coursemoduleid AS dependentcmid  FROM {course_modules_availability} cma
			JOIN {course_modules} cm ON cma.sourcecmid = cm.id
			WHERE cm.course = ?';
		$dependent_modules_result = $DB->get_records_sql($modules_query, array($courseId));

		$modules_dependencies = array();
		$i = 0;
		foreach($course_modules as $module) {
			$dependents = array();
			foreach($dependent_modules_result as $dependent_module) {
				if($module->id === $dependent_module->dependentcmid) {
					$dependents[] = $dependent_module->sourcecmid;
				}
			}

			if( ! empty($dependents)) {
				$modules_dependencies[$i]['id'] = $module->id; 	
				$modules_dependencies[$i]['depends_on'] = $dependents;
			}
			$i++;
		}

		return array_values($modules_dependencies);
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