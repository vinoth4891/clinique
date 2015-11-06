<?php

require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/questionlib.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');
require_once('response.php');

class QuizInfo {

    public static function __QuizInfo($courseid, $uid, $cmid, $from = NULL) {
        global $CFG, $DB;
        //$systemcontext = context_system::instance();
        $response = new CliniqueServiceResponce();
        if ($uid) {
            //QUIZ QUESTIONS
            $questions_sql = self::quiz_questions_array($cmid, $courseid, $from);
            if (empty($questions_sql))
                return;
            $id = $questions_sql[0]->id;
            $val = substr($questions_sql[0]->questions, 0, -2);
            $question_lists = self::quiz_questions_list($val);
            $quiz_info = self::quiz_info_array($id);
            $attempts = self::quiz_user_attempts_array($id, $uid);
            $quiz_feedback = self::quiz_feedback_array($id);
            $finished_count = count($attempts);
            if ($finished_count > 0) {
                $quiz_info[0]->anyfinished = 1;
                $quiz_info[0]->attemptedcount = $finished_count;
            } else {
                $quiz_info[0]->anyfinished = 0;
                $quiz_info[0]->attemptedcount = $finished_count;
            }
            //$grades = self::quiz_user_grade_array($id, $uid);
            $questionArrayval = array();
            $quiz_info[0]->feedback = $quiz_feedback;
            $questionArrayval['quizinfo'] = $quiz_info;
            //$questionArrayval['quizlist']['grade'] = $grades;
            if (empty($attempts)) {
				$timenow = time();
                $attempts[] = array(
                    "attempt" => "",
                    "preview" => "",
                    "state" => "",
					"startedOn" => $timenow,
					"completedOn" => $timenow,
                    "sumgrades" => null
                );
                $questionArrayval['quizlist'][]['attempts'] = $attempts;
            } else {
                $questionArrayval['quizlist'][]['attempts'] = $attempts;
            }
            $questions = array();
            $qcount = 1;
            foreach ($question_lists as $question_list) {
                $choices = array();
                $matchlabels = array();
                $sql_usageid = array_values($DB->get_records_sql("SELECT max(questionusageid) as usageid,questionid,slot FROM {question_attempts} WHERE questionid=" . $question_list->questionid));
                if ($question_list->qtype === 'match') {
                    $subquestion = array_values($DB->get_records_sql("SELECT subquestions FROM {question_match} WHERE question =" . $question_list->questionid));
                    $subquestions = $subquestion[0]->subquestions;
                    $subquestion_lists = array_values($DB->get_records_sql("SELECT id,questiontext,answertext FROM {question_match_sub} WHERE id IN ($subquestions)"));
                    foreach ($subquestion_lists as $subquestion_list) {
                        $subquestion = self::get_file_path('qtype_match', $subquestion_list->questiontext, $question_list->contextid, $sql_usageid['0']->usageid, $qcount, $subquestion_list->id);
                        $choices[] = array(
                            "id" => $subquestion_list->id,
                            "subquestion" => $subquestion,
                            "label" => $subquestion_list->answertext
                        );
                    }
                } else {
                    $flag = 0;
                    if ($question_list->qtype === 'multichoice') {
                        $singletype = array_values($DB->get_records_sql("SELECT single FROM {question_multichoice} qm WHERE qm.question =" . $question_list->questionid));
                        $flag = intval($singletype[0]->single);
                    }
                    $answer_lists = array_values($DB->get_records_sql("SELECT * FROM {question_answers} qa WHERE qa.question =" . $question_list->questionid));
                    $singleanswers = array_values($DB->get_records_sql("SELECT id FROM {question_answers} qa WHERE fraction > 0.1 AND qa.question =" . $question_list->questionid));
                    foreach ($answer_lists as $answer_list) {
                        $label = self::get_file_path('answer', $answer_list->answer, $question_list->contextid, $sql_usageid['0']->usageid, $qcount, $answer_list->id);
                        $choices[] = array(
                            "id" => $answer_list->id,
                            "label" => $label,
                            "fraction" => round($answer_list->fraction, 2),
                            "feedback" => $answer_list->feedback
                        );
                    }
                    $answers = '';
                    foreach ($singleanswers as $singleanswer) {
                        $answers[] .= $singleanswer->id;
                    }
                }
                $label = self::get_file_path('question', $question_list->questiontitle, $question_list->contextid, $sql_usageid['0']->usageid, $qcount, $question_list->questionid);
                $questions[] = array(
                    "id" => $question_list->questionid,
                    "question" => $label,
                    "mark" => $question_list->grade,
                    "type" => $question_list->qtype,
                    "istruefalse" => $flag,
                    "choices" => $choices,
                    "answers" => $answers,
                );
                $qcount++;
            }
            $questionArrayval['quizlist'][]['questions'] = $questions;
            return $questionArrayval;
        } else {
            return null;
        }
    }

    public static function __QuizDeltaSync($courseid, $uid, $cmid, $from = NULL) {
        if ($uid) {
            //QUIZ QUESTIONS
            $questions_sql = self::quiz_questions_array($cmid, $courseid, $from);
            $id = $questions_sql[0]->id;
            $attempts = self::quiz_user_attempts_array($id, $uid);
            $noofattempts = self::quiz_info_array($id);
            $attemptcount = $noofattempts[0]->attempts;
            $finished_count = count($attempts);
            $questionArrayval = array();
            if (empty($attempts)) {
                return null;
            } else {
                $anyfinished = 1;
                $attemptedcount = $finished_count;
                $counts = array(
                    "anyfinished" => $anyfinished,
                    "attemptedcount" => $attemptedcount,
                    "newattempts" => $attemptcount
                );
                $questionArrayval = $counts;
                $questionArrayval['attempts'] = $attempts;
            }
            return $questionArrayval;
        } else {
            return null;
        }
    }

    // Query to fetch Questions array based on Course module ID and Course ID
    private static function quiz_questions_array($cmid, $courseid, $from = NULL) {
        global $CFG, $DB;
        $fromquery = '';
        if (!empty($from)) {
            $fromquery = "AND q.timemodified > " . $from . "";
        }
        $data = $DB->get_records_sql("SELECT cm.instance as id,name,questions "
                . "FROM mdl_quiz q JOIN mdl_course_modules cm "
                . "ON q.course = cm.course AND cm.instance = q.id "
                . "WHERE cm.id = " . $cmid . " $fromquery AND q.course=" . $courseid);
        return array_values($data);
    }

    // Query to fetch Questions details based on Question ID
    private static function quiz_questions_list($vals) {
        global $DB;
        $q_parts = explode(",", $vals);
        $q_parts = array_filter($q_parts);
        $q_parts = array_slice($q_parts, 0);
        $final_arr = array();
        foreach ($q_parts as $value) {
            $data = $DB->get_records_sql("SELECT qu.id AS questionid,qu.questiontext AS questiontitle,contextid,qu.qtype,qg.grade "
                    . "FROM mdl_question qu LEFT JOIN mdl_question_categories qc "
                    . "ON qc.id=qu.category LEFT JOIN mdl_quiz_question_instances qg "
                    . "ON qg.question=qu.id WHERE qu.id IN ($value)");
            $final_arr[] = $data;
        }
        $merged = call_user_func_array('array_merge', $final_arr);
        return array_values($merged);
    }

    // Query to fetch Quiz info from Quiz ID
    private static function quiz_info_array($id) {
        global $CFG, $DB;
        $data = $DB->get_records_sql("SELECT id,course,name,intro,attempts,sumgrades,grade,questions as layouts FROM {quiz} q WHERE id=" . $id);
        return array_values($data);
    }

    // Query to fetch Quiz attempts from Quiz ID and User ID
    private static function quiz_user_attempts_array($id, $uid) {
        global $CFG, $DB;
        $data = $DB->get_records_sql("SELECT id AS rowid,attempt,preview,state,sumgrades,timestart AS startedOn,timefinish AS completedOn FROM mdl_quiz_attempts q WHERE quiz=" . $id . " AND state= 'finished' AND q.userid=" . $uid);
        return array_values($data);
    }

    // Query to fetch Quiz Score / Mark / Grade from Quiz ID and User ID
    private static function quiz_user_grade_array($id, $uid) {
        global $CFG, $DB;
        $data = $DB->get_records_sql("SELECT grade FROM mdl_quiz_grades g WHERE quiz=" . $id . " AND g.userid=" . $uid);
        return array_values($data);
    }

    // Query to fetch Quiz feedbacks from Quiz ID
    private static function quiz_feedback_array($id) {
        global $CFG, $DB;
        $data = array_values($DB->get_records_sql("SELECT id,feedbacktext,mingrade,maxgrade FROM mdl_quiz_feedback WHERE quizid=" . $id));
        $res = array();
        foreach ($data as $key => $value) {
            $isimage = strstr($value->feedbacktext, '<img ');
            if ($isimage) {
                $label = self::feedback_data_array($value->id, $value->feedbacktext);
                $value->feedbacktext = $label;
            }
            $res[] = $value;
        }
        return $res;
    }

    // Function to get video path and image path
    private static function get_file_path($type, $label, $contextid, $usageid, $slot, $questionid) {
        global $CFG;
        $isvideo = strstr($label, '<a href=');
        $isimage = strstr($label, '<img ');
        if ($isvideo || $isimage) {
            $split_imagevalue = explode("@@PLUGINFILE@@/", $label);
            $split_value = explode('"', $split_imagevalue['1']);

            if ($type == 'question') {
                $source = '/question/questiontext/';
                $newstring = $CFG->wwwroot . "/pluginfile.php/" . $contextid . $source . $usageid . "/" . $slot . "/" . $questionid . "/" . $split_value['0'];
            }
            if ($type == 'answer') {
                $source = '/question/answer/';
                $output = $CFG->wwwroot . "/pluginfile.php/" . $contextid . $source . $usageid . "/" . $slot . "/" . $questionid . "/";
                $newstring = str_replace("@@PLUGINFILE@@/", $output, $label);
            }
            if ($type == 'qtype_match') {
                if (!$isvideo) {
                    $source = '/qtype_match/subquestion/';
                    $output = $CFG->wwwroot . "/pluginfile.php/" . $contextid . $source . $usageid . "/" . $slot . "/" . $questionid . "/";
                    $newstring = str_replace("@@PLUGINFILE@@/", $output, $label);
                } else {
                    $source = '/qtype_match/subquestion/';
                    $newstring = $CFG->wwwroot . "/pluginfile.php/" . $contextid . $source . $usageid . "/" . $slot . "/" . $questionid . "/" . $split_value['0'];
                }
            }
        } else {
            $newstring = $label;
        }
        return $newstring;
    }

    // Query to fetch feedback attachment data
    private static function feedback_data_array($itemid, $label) {
        global $DB, $CFG;
        $split_imagevalue = explode("@@PLUGINFILE@@/", $label);
        $split_value = explode('"', $split_imagevalue['1']);
        $data = array_values($DB->get_records_sql("SELECT id,contextid,component,filearea,filename,mimetype FROM mdl_files WHERE itemid=" . $itemid . " AND component = 'mod_quiz' AND filearea='feedback' AND filesize != '0'"));
        //$source = "/" . $data[0]->component . "/" . $data[0]->filearea . "/";
        $source = "/mod_quiz/feedback/";
        $output = $CFG->wwwroot . "/pluginfile.php/" . $data[0]->contextid . $source . $itemid . "/";
        $newstring = str_replace("@@PLUGINFILE@@/", $output, $label);
        return $newstring;
    }

}
?>

