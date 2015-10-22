<?php
require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/questionlib.php');
require_once('response.php');

class Widgets {

	public static function getTextBetweenTags($string, $tagname) {
		$pattern = "%<$tagname>(.*)<\/$tagname>%si";
		preg_match($pattern, $string, $matches);
		return $matches[1];
	}
    public function __Widgetdisplay($courseid, $widgettype, $modid = null, $return = false) {

        global $CFG, $DB;
        $questionArray =array();
		if($widgettype == 'Match') {
			 $questions = array_values($DB->get_records_sql("SELECT questions, intro, q.timemodified FROM {quiz} q
			JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
			WHERE name LIKE 'bb:%' AND cm.id = $modid AND q.course=$courseid"));
			 $val = substr($questions[0]->questions,0,-2);
			 $questionArray['questionname'][] = strip_tags($questions[0]->intro);
			 $module_context = context_module::instance($modid);
			 $intro = file_rewrite_pluginfile_urls($questions[0]->intro, 'pluginfile.php', $module_context->id, 'mod_quiz', 'intro');
			 $questionArray['tile_content'][] = self::getTextBetweenTags(html_entity_decode($intro), 'tile');
			 $questionArray['heading'][] =self::getTextBetweenTags(html_entity_decode($intro), 'heading');

			 $question_answer = array();
			if( ! empty($val)) {
				 $question_answer = array_values($DB->get_records_sql("SELECT qm.id as questionmatchid,qu.id as questionid,qm.questiontext,qm.answertext,qu.questiontext as questiontitle,contextid FROM {question_match_sub} qm LEFT JOIN {question} qu ON qm.question=qu.id LEFT JOIN {question_categories} qc ON qc.id=qu.category WHERE question=".$val));
			}
			 
			 foreach($question_answer as $question_answers){

				  $sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid,questionid,slot FROM {question_attempts} WHERE questionid=".$question_answers->questionid));

				 $split_imagevalue = explode("@@/",$question_answers->questiontext);
				 $split_value = explode('"',$split_imagevalue['1']);

				 $questionArray['questiontext'][] = $CFG->wwwroot."/pluginfile.php/".$question_answers->contextid."/qtype_match/subquestion/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$question_answers->questionmatchid."/".$split_value['0'];
				  $questionArray['answertext'][] =  $question_answers->answertext;

				  $questionArray['question_answertext'][] = $CFG->wwwroot."/pluginfile.php/".$question_answers->contextid."/qtype_match/subquestion/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$question_answers->questionmatchid."/".$split_value['0']."|". $question_answers->answertext;

			 }
			 $questionArray['timemodified'] = $questions[0]->timemodified;
			 
		}
		
        if($widgettype == 'Uncover'){

				 //$course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course=$courseid and name='Widget2'"));
			     $quiz = $DB->get_record_sql("SELECT section, q.timemodified FROM {course_modules} cm, {quiz} q WHERE cm.course = q.course AND cm.course = $courseid AND cm.instance = q.id AND q.name LIKE 'aa:%' AND cm.showavailability=1 AND cm.id=$modid");
				 $course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course = $courseid AND id = $quiz->section"));
				
				 if( ! empty($course_section)) {
					 $course = get_fast_modinfo($courseid)->get_section_info($course_section[0]->section);
					 $context = context_course::instance($courseid);
					 $summaryimage = file_rewrite_pluginfile_urls($course->summary, 'pluginfile.php', $context->id, 'course', 'section', $course->id);
					 $activity_type = 'aa';
					 $tmodify = $quiz->timemodified;

				 } else {
					 //Handle aae activity
					$quiz = $DB->get_record_sql("SELECT intro, q.timemodified FROM {quiz} q
						JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
						WHERE name LIKE 'aae:%' AND cm.id = $modid AND q.course=$courseid");
					 $module_context = context_module::instance($modid);
					 $summaryimage = file_rewrite_pluginfile_urls($quiz->intro, 'pluginfile.php', $module_context->id, 'mod_quiz', 'intro');
					 $activity_type = 'aae';
					 $tmodify = $quiz->timemodified;
				 }
				 $summaryimage_decoded = html_entity_decode($summaryimage);
				 $tile_content = self::getTextBetweenTags($summaryimage_decoded, 'tile');
				 $tile_heading = self::getTextBetweenTags($summaryimage_decoded, 'heading');

                 preg_match('/<img(.*)src(.*)=(.*)"(.*)"/U', $summaryimage, $imagesrc);

				 $questions_sql = array_values($DB->get_records_sql("SELECT questions, intro, q.timemodified FROM {quiz} q
			JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
			WHERE name LIKE '$activity_type:%' AND cm.id = $modid AND q.course=$courseid"));

				 $val = substr($questions_sql[0]->questions,0,-2);

				 $questionAnswer = array();

				 if( ! empty($val)) {
					 $questionAnswer = array_values($DB->get_records_sql("SELECT qu.id,qu.questiontext FROM {question} qu WHERE qu.id IN ($val)"));
				 }

				$questionArrayval =array();
				
				 for($i=0;$i<count($questionAnswer);$i++){
                   $answer =  array_values($DB->get_records_sql("SELECT * FROM {question_answers} qa WHERE qa.question =".$questionAnswer[$i]->id));
                   $questionArrayval['questiontext'] = '';
				   $questionArrayval['questiontext'][] = strip_tags($questionAnswer[$i]->questiontext);
				   for($j=0;$j<count($answer);$j++){
					  $questionArrayval['questiontext']['answertext'][]= strip_tags($answer[$j]->answer);
					  $questionArrayval['questiontext']['correctanswer'][] = round($answer[$j]->fraction);
				   }
				   $questionArray[] = $questionArrayval;
				 }
				$questionArray['questionname'] = $questions_sql[0]->intro;
                  $questionArray['questiontext']['hiddenimage']=$imagesrc[4];
                  $questionArray['tile']['content']=$tile_content;
                  $questionArray['tile']['heading']=$tile_heading;
				  $questionArray['timemodified'] = $tmodify;
			 }
			 if($widgettype == 'Sequence'){
			     $quiz = $DB->get_record_sql("SELECT section, q.timemodified FROM {course_modules} cm, {quiz} q WHERE cm.course = q.course AND cm.course = $courseid AND cm.instance = q.id AND q.NAME LIKE 'dd:%' AND cm.showavailability=1 AND cm.id=$modid");
				 $course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course = $courseid AND id = $quiz->section"));
				 
				 $course = get_fast_modinfo($courseid)->get_section_info($course_section[0]->section);

			     $context = context_course::instance($courseid);

				 $summaryimage = file_rewrite_pluginfile_urls($course->summary, 'pluginfile.php', $context->id, 'course', 'section', $course->id);

                 preg_match('/<img(.*)src(.*)=(.*)"(.*)"/U', $summaryimage, $imagesrc);


				 $questions_sql = array_values($DB->get_records_sql("SELECT questions, q.timemodified FROM {quiz} q
			JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
			WHERE name LIKE 'dd:%' AND cm.id = $modid AND q.course=$courseid"));

				 $val = substr($questions_sql[0]->questions,0,-2);

				 if( ! empty($val)) {
				 	$questionAnswer = array_values($DB->get_records_sql("SELECT qu.id,qu.questiontext, qu.name FROM {question} qu WHERE qu.id IN ($val)"));
					$question_answer = array_values($DB->get_records_sql("SELECT qu.id AS questionid,qu.questiontext AS questiontitle,contextid FROM mdl_question qu LEFT JOIN mdl_question_categories qc ON qc.id=qu.category WHERE qu.id=".$val));
				 }
                 
				 

				$questionArrayval =array();

				 for($i=0;$i<count($questionAnswer);$i++){

                   $answer =  array_values($DB->get_records_sql("SELECT * FROM {question_answers} qa WHERE qa.question =".$questionAnswer[$i]->id));

                   $questionArrayval['questiontext'] = '';

					$quiz = $DB->get_record_sql("SELECT intro, q.timemodified FROM {quiz} q
						JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
						WHERE name LIKE 'dd:%' AND cm.id = $modid AND q.course=$courseid");
					 $module_context = context_module::instance($modid);
					 $intro = file_rewrite_pluginfile_urls($quiz->intro, 'pluginfile.php', $module_context->id, 'mod_quiz', 'intro');				   
                   $questionArray['questionname'][] = strip_tags($questionAnswer[$i]->questiontext);
					 $questionArray['tile_content'][] = self::getTextBetweenTags(html_entity_decode($intro), 'tile');
					 $questionArray['heading'][] =self::getTextBetweenTags(html_entity_decode($intro), 'heading');

				   for($j=0;$j<count($answer);$j++){
                      
					  $isimage = strstr($answer[$j]->answer, '<img src=');
					  
					  if($isimage) { 
					      $sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid,questionid,slot FROM {question_attempts} WHERE questionid=".$question_answer[0]->questionid));
						  

						  $split_imagevalue = explode("@@PLUGINFILE@@/",$answer[$j]->answer);

                          $split_value = explode('"',$split_imagevalue['1']);
					  
						  $questionArray['answertext'][]= $CFG->wwwroot."/pluginfile.php/".$question_answer[0]->contextid."/question/answer/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$answer[$j]->id."/".$split_value['0'];
						  
					  } else { 
					    $questionArray['answertext'][]= strip_tags($answer[$j]->answer); 
					  }	
                      
					  $ans = round($answer[$j]->fraction);
					  if($ans != 0) {					    
					     $questionArray['correctanswer'][] = $j;
					  } else {
					     $questionArray['correctanswer'][] = -1;
					  }

			   }
			 }
                  $questionArray['timemodified'] = $questions_sql[0]->timemodified;
		}
        
            if($widgettype == 'Memorygame') {
				 $questions = array_values($DB->get_records_sql("SELECT questions, q.timemodified FROM {quiz} q
			JOIN {course_modules} cm ON q.course = cm.course AND cm.instance = q.id
			WHERE name LIKE 'gg:%' AND cm.id = $modid AND q.course=$courseid"));
                $img_id_array = explode(',',$questions[0]->questions);
                $remove_zeros = array_values(array_filter($img_id_array));
                $img_id =  implode(',',$remove_zeros);
                $questionArray['questionname'][] = strip_tags($questions[0]->intro);
			 $module_context = context_module::instance($modid);
			 $intro = file_rewrite_pluginfile_urls($questions[0]->intro, 'pluginfile.php', $module_context->id, 'mod_quiz', 'intro');				   
			 $questionArray['tile_content'][] = self::getTextBetweenTags(html_entity_decode($intro), 'tile');
			 $questionArray['heading'][] =self::getTextBetweenTags(html_entity_decode($intro), 'heading');
                $question_answer = array_values($DB->get_records_sql("SELECT id, questiontext FROM mdl_question WHERE id IN (".$img_id.")"));

                foreach($question_answer as $question_answers){
                    $split_imagevalue = explode("@@/",$question_answers->questiontext);
                    $split_value = explode('"',$split_imagevalue['1']);
                    $questionArray['questiontext'][] = $response->get_img_path("{$question_answers->id}")."{$split_value['0']}";
                    $questionArray['id'][] =  $question_answers->id;
                }
               $questionArray['timemodified'] = $questions[0]->timemodified;
            }

			if( empty($return)) {
        		$response = new CliniqueServiceResponce();
				if(!empty($questionArray)){
					$response->response(false, 'done', $questionArray);
				} else{
				$response->response(true, 'msg', "No records");
				}
			} else {
				return $questionArray;
			}
	}

	public function __WidgetMultidisplay($courseid, $widgettype, $modid, $return = false) {

        global $CFG, $DB;

        $response = new CliniqueServiceResponce();

		if($widgettype == 'Multi') {
			$questionArray = array();
			$module = $DB->get_record_sql("SELECT cm.id, cm.course, cm.instance, q.id, q.questions, q.name, q.intro, q.timemodified FROM {course_modules} cm JOIN {quiz} q ON cm.instance = q.id WHERE cm.course = ".$courseid." AND cm.id = ".$modid);
			
			if($module) {
				$questions_id = $module->questions;
				$questionname = $module->intro;
				$questionArray['questionname'][] = $questionname;
				$questionArray['timemodified'] = $module->timemodified;
				 $module_context = context_module::instance($modid);
				 $intro = file_rewrite_pluginfile_urls($module->intro, 'pluginfile.php', $module_context->id, 'mod_quiz', 'intro');
				 $questionArray['tile_content'][] = self::getTextBetweenTags(html_entity_decode($intro), 'tile');
				 $questionArray['heading'][] =self::getTextBetweenTags(html_entity_decode($intro), 'heading');
				$split_ids_by_page = explode(",0", $questions_id);
				
				$split_ids_by_page = array_values(array_filter($split_ids_by_page));
				$all_ids = array();
				foreach($split_ids_by_page as $split_ids) {
					$split_ids = explode(",", $split_ids);
					$split_ids = array_values(array_filter($split_ids));
					$all_ids = array_merge($all_ids, $split_ids);
				}
				
				foreach($all_ids as $allid) {
					$get_question = $DB->get_record('question', array('id' => $allid));
					$get_answers = $DB->get_record('question_multichoice', array('question' => $allid));
					$get_answer_text = $DB->get_records_sql('SELECT * FROM {question_answers} WHERE id IN ('.$get_answers->answers.')');
					
					$get_context_id = $DB->get_records_sql("SELECT qc.id, qc.contextid FROM {question} q JOIN {question_categories} qc ON q.category = qc.id WHERE q.id = ".$allid);
					foreach($get_context_id as $context) {
						$context_id = $context->contextid;
					}
					
					$sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid, questionid, slot FROM {question_attempts} WHERE questionid=".$allid));
					
					$split_imagevalue = explode("@@/",$get_question->questiontext);
					$split_value = explode('"',$split_imagevalue['1']);
					$questionArray['questiontext'][$get_question->id] = $CFG->wwwroot."/pluginfile.php/".$context_id."/question/questiontext/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$allid."/".$split_value['0'];
					
					$answer = array();
					$right = 0;
					$wrong = 0;
					foreach($get_answer_text as $answer_txt) {
						if($answer_txt->fraction > 0) {
							$questionArray['answertext'][$answer_txt->question]['right_answers'][] = strip_tags($answer_txt->answer);
							$right++;
							$questionArray['answertext'][$answer_txt->question]['right_answers_count'] = $right;
						} else {
							$questionArray['answertext'][$answer_txt->question]['wrong_answers'][] = strip_tags($answer_txt->answer);
							$wrong++;
							$questionArray['answertext'][$answer_txt->question]['wrong_answers_count'] = $wrong;
						}
					}
				}
			}
			
			if( empty($return)) {
        			$response = new CliniqueServiceResponce();
				if(!empty($questionArray)){					
					$response->response(false, 'done', $questionArray);
				} else{
					$response->response(true, 'msg', "No records");
				}
			} else {		       
				return $questionArray;
			}
		}		
	}	
}

