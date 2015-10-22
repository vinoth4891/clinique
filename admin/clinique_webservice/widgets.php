<?php
require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/questionlib.php');
require_once('response.php');

class Widgets {

    public function __Widgetdisplay($courseid, $widgettype) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();


        $response = new CliniqueServiceResponce();

		if($widgettype == 'Match') {
             $questionArray =array();
			 $questions = array_values($DB->get_records_sql("SELECT questions, intro FROM {quiz} WHERE course=".$courseid." AND name LIKE 'bb:%'"));
			 $val = substr($questions[0]->questions,0,-2);
			 $questionArray['questionname'][] = strip_tags($questions[0]->intro);
			 //echo "<br>1111=>".$val;

			 $question_answer = array_values($DB->get_records_sql("SELECT qm.id as questionmatchid,qu.id as questionid,qm.questiontext,qm.answertext,qu.questiontext as questiontitle,contextid FROM {question_match_sub} qm LEFT JOIN {question} qu ON qm.question=qu.id LEFT JOIN {question_categories} qc ON qc.id=qu.category WHERE question=".$val));

			 
			 foreach($question_answer as $question_answers){

              $sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid,questionid,slot FROM {question_attempts} WHERE questionid=".$question_answers->questionid));



			 $split_imagevalue = explode("@@/",$question_answers->questiontext);

             $split_value = explode('"',$split_imagevalue['1']);




			 $questionArray['questiontext'][] = $CFG->wwwroot."/pluginfile.php/".$question_answers->contextid."/qtype_match/subquestion/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$question_answers->questionmatchid."/".$split_value['0'];
            //$r = question_rewrite_question_urls($question_answers->questiontext, 'qtype_match', $filearea, $itemid);

	          $questionArray['answertext'][] =  $question_answers->answertext;

              $questionArray['question_answertext'][] = $CFG->wwwroot."/pluginfile.php/".$question_answers->contextid."/qtype_match/subquestion/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$question_answers->questionmatchid."/".$split_value['0']."|". $question_answers->answertext;

			 }
			 
			 if(!empty($questionArray)){
				 $response->response(false, 'done', $questionArray);
			 } else{
				$response->response(true, 'msg', "No records");
			 }

			//echo "<pre>"; print_r($questionArray);exit;
		}
		
        if($widgettype == 'Uncover'){

				 //$course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course=$courseid and name='Widget2'"));
				 $course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course = $courseid AND id = (SELECT section FROM {course_modules} cm, {quiz} q WHERE cm.course = q.course AND cm.course = $courseid AND cm.instance = q.id AND q.NAME LIKE 'aa:%' AND cm.showavailability=1)"));

				 $course = get_fast_modinfo($courseid)->get_section_info($course_section[0]->section);

			     $context = context_course::instance($courseid);

				 $summaryimage = file_rewrite_pluginfile_urls($course->summary, 'pluginfile.php', $context->id, 'course', 'section', $course->id);

                 preg_match('/<img(.*)src(.*)=(.*)"(.*)"/U', $summaryimage, $imagesrc);


				 $questions_sql = array_values($DB->get_records_sql("SELECT questions FROM {quiz} WHERE course=".$courseid." AND name LIKE 'aa:%'"));

				 //print_r($questions_sql);

				 $val = substr($questions_sql[0]->questions,0,-2);

				 $questionAnswer = array_values($DB->get_records_sql("SELECT qu.id,qu.questiontext FROM {question} qu WHERE qu.id IN ($val)"));

				// echo "<pre>";
				//print_r($questionAnswer);

				$questionArrayval =array();

				 for($i=0;$i<count($questionAnswer);$i++){

                   $answer =  array_values($DB->get_records_sql("SELECT * FROM {question_answers} qa WHERE qa.question =".$questionAnswer[$i]->id));

                  //print_r($answer);
                   $questionArrayval['questiontext'] = '';

				   $questionArrayval['questiontext'][] = strip_tags($questionAnswer[$i]->questiontext);

				   for($j=0;$j<count($answer);$j++){

					  $questionArrayval['questiontext']['answertext'][]= strip_tags($answer[$j]->answer);

					  $questionArrayval['questiontext']['correctanswer'][] = round($answer[$j]->fraction);

				   }
				   $questionArray[] = $questionArrayval;

				 }
                  $questionArray['questiontext']['hiddenimage']=$imagesrc[4];
                 if(!empty($questionArray)){
					 $response->response(false, 'done', $questionArray);
				 } else{
					$response->response(true, 'msg', "No records");
				 }
			 }
			 if($widgettype == 'Sequence'){

				 //$course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course=$courseid and name='Widget2'"));
				 $course_section = array_values($DB->get_records_sql("SELECT section FROM {course_sections} WHERE course = $courseid AND id = (SELECT section FROM {course_modules} cm, {quiz} q WHERE cm.course = q.course AND cm.course = $courseid AND cm.instance = q.id AND q.NAME LIKE 'dd:%' AND cm.showavailability=1)"));
				 
				 $course = get_fast_modinfo($courseid)->get_section_info($course_section[0]->section);

			     $context = context_course::instance($courseid);

				 $summaryimage = file_rewrite_pluginfile_urls($course->summary, 'pluginfile.php', $context->id, 'course', 'section', $course->id);

                 preg_match('/<img(.*)src(.*)=(.*)"(.*)"/U', $summaryimage, $imagesrc);


				 $questions_sql = array_values($DB->get_records_sql("SELECT questions FROM {quiz} WHERE course=".$courseid." AND name LIKE 'dd:%'"));

				 //print_r($questions_sql);

				 $val = substr($questions_sql[0]->questions,0,-2);

				 $questionAnswer = array_values($DB->get_records_sql("SELECT qu.id,qu.questiontext FROM {question} qu WHERE qu.id IN ($val)"));
                 
				 //$question_answer = array_values($DB->get_records_sql("SELECT qm.id as questionmatchid,qu.id as questionid,qm.questiontext,qm.answertext,qu.questiontext as questiontitle,contextid FROM {question_match_sub} qm LEFT JOIN {question} qu ON qm.question=qu.id LEFT JOIN {question_categories} qc ON qc.id=qu.category WHERE question=".$val));
				 $question_answer = array_values($DB->get_records_sql("SELECT qu.id AS questionid,qu.questiontext AS questiontitle,contextid FROM mdl_question qu LEFT JOIN mdl_question_categories qc ON qc.id=qu.category WHERE qu.id=".$val));
				 

				$questionArrayval =array();

				 for($i=0;$i<count($questionAnswer);$i++){

                   $answer =  array_values($DB->get_records_sql("SELECT * FROM {question_answers} qa WHERE qa.question =".$questionAnswer[$i]->id));

                  //print_r($answer);
                   $questionArrayval['questiontext'] = '';

				   //$questionArrayval['questiontext'][] = strip_tags($questionAnswer[$i]->questiontext);
                   $questionArray['questionname'][] = strip_tags($questionAnswer[$i]->questiontext);

				   for($j=0;$j<count($answer);$j++){
                      
					  $isimage = strstr($answer[$j]->answer, '<img src=');
					  
					  if($isimage) { 
					      $sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid,questionid,slot FROM {question_attempts} WHERE questionid=".$question_answer[0]->questionid));
						  

						  $split_imagevalue = explode("@@PLUGINFILE@@/",$answer[$j]->answer);

                          $split_value = explode('"',$split_imagevalue['1']);
					  
						  $questionArray['answertext'][]= $CFG->wwwroot."/pluginfile.php/".$question_answer[0]->contextid."/question/answer/".$sql_usageid['0']->usageid."/".$sql_usageid['0']->slot."/".$answer[$j]->id."/".$split_value['0'];
						  
						  //http://clinique-dev.photoninfotech.com/admin/pluginfile.php/10182/question/answer/136/1/540/Widget2Answer2.JPG
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
				

                  //$questionArray['questiontext']['hiddenimage']=$imagesrc[4];
			 }


			


			 if(!empty($questionArray)){
				 $response->response(false, 'done', $questionArray);
			 } else{
				$response->response(true, 'msg', "No records");
			 }

		}
               
            if($widgettype == 'Memorygame') {
                $questions = array_values($DB->get_records_sql("SELECT questions, intro FROM mdl_quiz WHERE course=".$courseid." AND name LIKE 'gg:%'"));
                $img_id_array = explode(',',$questions[0]->questions);
                $remove_zeros = array_values(array_filter($img_id_array));
                $img_id =  implode(',',$remove_zeros);
                $questionArray['questionname'][] = strip_tags($questions[0]->intro);
                $question_answer = array_values($DB->get_records_sql("SELECT id, questiontext FROM mdl_question WHERE id IN (".$img_id.")"));

                foreach($question_answer as $question_answers){
                    $split_imagevalue = explode("@@/",$question_answers->questiontext);
                    $split_value = explode('"',$split_imagevalue['1']);
                    //$questionArray['questiontext'][] = $split_value['0'];
                    $questionArray['questiontext'][] = $response->get_img_path("{$question_answers->id}")."{$split_value['0']}";
                    $questionArray['id'][] =  $question_answers->id;
                }

                 //print_r($questionArray);

                if(!empty($questionArray)){
                    $response->response(false, 'done', $questionArray);
                } else{
                    $response->response(true, 'msg', "No records");
                }
            }
	}

	public function __WidgetMultidisplay($courseid, $widgettype, $modid) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();


        $response = new CliniqueServiceResponce();

		if($widgettype == 'Multi') {
			$questionArray = array();
			//$courseid = 45;
			$get_module = $DB->get_records_sql("SELECT cm.id, cm.course, cm.instance, q.id, q.questions, q.intro FROM {course_modules} cm JOIN {quiz} q ON cm.instance = q.id WHERE cm.course = ".$courseid." AND cm.id = ".$modid);
			//var_dump($get_module);
			
			if($get_module) {
				foreach($get_module as $module) {
					$questions_id = $module->questions;
					$questionname = $module->intro;
				}
				$questionArray['questionname'][] = $questionname;
				$split_ids_by_page = explode(",0", $questions_id);
				
				$split_ids_by_page = array_values(array_filter($split_ids_by_page));
				$all_ids = array();
				foreach($split_ids_by_page as $split_ids) {
					$split_ids = explode(",", $split_ids);
					$split_ids = array_values(array_filter($split_ids));
					$all_ids = array_merge($all_ids, $split_ids);
				}
				//var_dump($all_ids);
				
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
					
					/*$src = $get_question->questiontext;
					//$src = (string) reset(simplexml_import_dom(DOMDocument::loadHTML($get_question->questiontext))->xpath("//img/@src"));
					//$ques_text = file_rewrite_pluginfile_urls($src, 'pluginfile.php', $context_id, 'question', 'questiontext', $allid);
					$ques_text = question_rewrite_question_urls($src, 'pluginfile.php', $context_id, 'question', 'questiontext', $allid);
					$questionArray['questiontext'][$get_question->id] = $ques_text;
					//$questionArray['questiontext'][$get_question->id] = $get_question->questiontext;*/
					
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
			
			if(!empty($questionArray)){
				 $response->response(false, 'done', $questionArray);
			 } else{
				$response->response(true, 'msg', "No records");
			 }
		}
	}	
}

