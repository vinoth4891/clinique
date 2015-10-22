<?php

header('Access-Control-Allow-Origin: *');
define('AJAX_SCRIPT', true);

require_once($CFG->libdir . '/filelib.php');
require_once($CFG->libdir . '/questionlib.php');
require_once($CFG->dirroot . '/mod/quiz/locallib.php');
require_once('response.php');

class QuizUpdate {

    public function __QuizUpdate($uid, $request) {
        $quizlist = $request->data[0]->quizlist;
        $id = $request->data[0]->quizinfo[0]->modid;
        //$courseid = $request->data[0]->quizinfo[0]->course;
        $ques = self::get_finished_response($quizlist);
        $reqQuestion = $ques->list;
        $slots = $ques->slots;
        $response = new CliniqueServiceResponce();
        // Get submitted parameters.
        $step = 1;
        $forcenew = optional_param('forcenew', false, PARAM_BOOL); // Used to force a new preview
        $page = optional_param('page', -1, PARAM_INT); // Page to jump to in the attempt.
        if ($uid) {
            if (!empty($reqQuestion)) {
                foreach ($reqQuestion as $key => $reqQuestions) {
                    //Uncomment to get correct time spent on a quiz 
//                            $startedOn = $ques->times[$key]->startedOn;
//                            $completedOn = $ques->times[$key]->completedOn;
//                            if(!empty($startedOn) && !empty($completedOn)){
//                                    $startedOn = substr($ques->times[$key]->startedOn, 0, -3);
//                                    $completedOn = substr($ques->times[$key]->completedOn, 0, -3);
//                            }
//                            else{
//                                    $timenow = time();
//                                    $startedOn = $timenow;
//                                    $completedOn = $timenow;
//                            }
                    $timenow = time();
                    $startedOn = $timenow;
                    $completedOn = $timenow;
                    $output = self::quiz_attempt_process($id, $step, $forcenew, $page, $uid, $request, $key, $startedOn);
                    if ($output->id != '') {
                        self::quiz_attempt_update($completedOn, $output->id, $output->uniqueid, $reqQuestions, $uid, $slots, $request, $key);
                    }
                }
                $response->response(false, "", $request);
            } else {

                $response->response(true, 'No record for syncing');
            }
        } else {
            $response->response(true, 'Invalid user');
        }
    }

    // Update attempt by ID 
    private static function quiz_attempt_update($timenow, $attemptid, $usageid, $reqQuestions, $uid, $slots, $request, $key = NULL) {
        global $DB, $USER;
        $USER->id = $uid;
        $attemptobj = '';
        // Get submitted parameters.
        $transaction = $DB->start_delegated_transaction();
        $attemptobj = quiz_attempt::create($attemptid);
        $toolate = false;
        $becomingoverdue = false;
        if (!$toolate) {
            $postarr1 = self::get_post_data($reqQuestions, $usageid);
            $postarr2 = array(
                "Next" => "Next",
                "attempt" => "$attemptid",
                "thispage" => "0",
                "nextpage" => "-1",
                "timeup" => "0",
                "sesskey" => "$USER->sesskey",
                "scrollpos" => "",
                "slots" => "$slots"
            );
            $postarray = array_merge($postarr1, $postarr2);
            $attemptobj->process_submitted_actions($timenow, $becomingoverdue, $postarray);
        }
        $transaction->allow_commit();
        $finishit = true;
        if ($finishit === true) {
            self::quiz_attempt_finish($timenow, $attemptid, false, $uid, $request, $key);
        }
    }

    // Finish attempt by ID 
    private static function quiz_attempt_finish($timenow, $attemptid, $toolate, $uid, $request, $key) {
        global $USER;
        $attemptobj = '';
        $USER->id = $uid;
        $attemptobj = quiz_attempt::create($attemptid);
        $postarray = array(
            "attempt" => "$attemptid",
            "finishattempt" => "1",
            "timeup" => "0",
            "slots" => "",
            "sesskey" => "$USER->sesskey"
        );
        $attemptobj->process_finish($timenow, !$toolate, $postarray);
        $output = self::get_completed_response($request, $attemptid, $key);
    }

    private static function quiz_question_loop($attempt, $quizobj, $quba, $questionsinuse) {
        foreach ($quizobj->get_questions() as $i => $questiondata) {
            $questiondata->options->shuffleanswers = 0;
            if ($questiondata->qtype != 'random') {
                $question = question_bank::make_question($questiondata);
            }
            $idstoslots[$i] = $quba->add_question($question, $questiondata->maxmark);
            $questionsinuse[] = $question->id;
        }
        return $idstoslots;
    }

    // quiz_attempt_stepone
    private static function quiz_question_process($attempt, $quizobj, $quba, $questionsinuse, $attemptnumber, $timenow) {
        $idstoslots = self::quiz_question_loop($attempt, $quizobj, $quba, $questionsinuse);
        // Start all the questions.
        if ($attempt->preview) {
            $variantoffset = rand(1, 100);
        } else {
            $variantoffset = $attemptnumber;
        }
        $quba->start_all_questions(
                new question_variant_pseudorandom_no_repeats_strategy($variantoffset), $timenow);
        // Update attempt layout.
        $newlayout = array();
        foreach (explode(',', $attempt->layout) as $qid) {
            if ($qid != 0) {
                $newlayout[] = $idstoslots[$qid];
            } else {
                $newlayout[] = 0;
            }
        }
        $attempt->layout = implode(',', $newlayout);
    }

    // quiz_attempt_stepone
    private static function quiz_attempt_stepone($attempt, $lastattempt, $quizobj, $timenow, $quba, $attemptnumber) {
        //global $CFG, $DB;
        if (!($quizobj->get_quiz()->attemptonlast && $lastattempt)) {
            // Starting a normal, new, quiz attempt.
            // Fully load all the questions in this quiz.
            $quizobj->preload_questions();
            $quizobj->load_questions();
            // Add them all to the $quba.
            $questionsinuse = array_keys($quizobj->get_questions());
            self::quiz_question_process($attempt, $quizobj, $quba, $questionsinuse, $attemptnumber, $timenow);
        } else {
            // Starting a subsequent attempt in each attempt builds on last mode.
            $oldquba = question_engine::load_questions_usage_by_activity($lastattempt->uniqueid);
            $oldnumberstonew = array();
            foreach ($oldquba->get_attempt_iterator() as $oldslot => $oldqa) {
                $newslot = $quba->add_question($oldqa->get_question(), $oldqa->get_max_mark());

                $quba->start_question_based_on($newslot, $oldqa);

                $oldnumberstonew[$oldslot] = $newslot;
            }
        }
    }

    private static function new_preview_request($quizobj, $accessmanager, $forcenew, $uid) {
        global $DB;
        if ($quizobj->is_preview_user() && $forcenew) {
            $accessmanager->current_attempt_finished();
        }
        // Check to see if a new preview was requested.
        if ($quizobj->is_preview_user() && $forcenew) {
            // To force the creation of a new preview, we mark the current attempt (if any)
            // as finished. It will then automatically be deleted below.
            $DB->set_field('quiz_attempts', 'state', quiz_attempt::FINISHED, array('quiz' => $quizobj->get_quizid(), 'userid' => $uid));
        }
    }

    private static function accessmanager_process($quizobj, $accessmanager, $forcenew, $uid) {
        self::new_preview_request($quizobj, $accessmanager, $forcenew, $uid);
        // Look for an existing attempt.
        $attempts = quiz_get_user_attempts($quizobj->get_quizid(), $uid, 'all', true);
        $lastattempt = end($attempts);

        // Get number for the next or unfinished attempt.
        if ($lastattempt && !$lastattempt->preview && !$quizobj->is_preview_user()) {
            $attemptnumber = $lastattempt->attempt + 1;
        } else {
            $lastattempt = false;
            $attemptnumber = 1;
        }
        $currentattemptid = null;
        $accessmanager->notify_preflight_check_passed($currentattemptid);
        // Delete any previous preview attempts belonging to this user.
        quiz_delete_previews($quizobj->get_quiz(), $uid);
        $res = new stdClass();
        $res->lastattempt = $lastattempt;
        $res->attemptnumber = $attemptnumber;
        return $res;
    }

    private static function quiz_attempt_process($id, $step, $forcenew, $page, $uid, $request, $key, $startedOn) {
        global $DB, $USER;
        $USER->id = $uid;
        $response = new CliniqueServiceResponce();
        $quizobj = '';
        //$timenow = time(); // Update time now, in case the server is running really slowly.
        $timenow = $startedOn;
        if (!$cm = get_coursemodule_from_id('quiz', $id)) {
            print_error('invalidcoursemodule');
        }
        $quizobj = quiz::create($cm->instance, $uid);
        $attempts_allowed = self::attempts_allowed($attempt, $quizobj);
        // Create an object to manage all the other (non-roles) access rules.
        $accessmanager = $quizobj->get_access_manager($timenow);
        $attempt_nums = self::accessmanager_process($quizobj, $accessmanager, $forcenew, $uid);
        if($attempts_allowed != 0){
            if ($attempts_allowed < $attempt_nums->attemptnumber) {
                $block_res = self::get_blocked_response($request, '', $key);
                $response->response(false, "", $block_res);
                die;
                // $response->response(false, "", $request);
            }
        }
        $quba = question_engine::make_questions_usage_by_activity('mod_quiz', $quizobj->get_context());
        $quba->set_preferred_behaviour($quizobj->get_quiz()->preferredbehaviour);
        // Create the new attempt and initialize the question sessions
        $attempt = quiz_create_attempt($quizobj, $attempt_nums->attemptnumber, $attempt_nums->lastattempt, $timenow, $quizobj->is_preview_user());
        self::quiz_attempt_stepone($attempt, $attempt_nums->lastattempt, $quizobj, $timenow, $quba, $attempt_nums->attemptnumber);
        // Save the attempt in the database.
        $transaction = $DB->start_delegated_transaction();
        question_engine::save_questions_usage_by_activity($quba);
        $attempt->uniqueid = $quba->get_id();
        $attempt->id = $DB->insert_record('quiz_attempts', $attempt);
        // Trigger event.
        $res = self::trigger_event($attempt, $quizobj);
        $transaction->allow_commit();
        return $res;
    }

    private static function trigger_event($attempt, $quizobj) {
        $eventdata = new stdClass();
        $eventdata->component = 'mod_quiz';
        $eventdata->attemptid = $attempt->id;
        $eventdata->timestart = $attempt->timestart;
        $eventdata->timestamp = $attempt->timestart;
        $eventdata->userid = $attempt->userid;
        $eventdata->quizid = $quizobj->get_quizid();
        $eventdata->cmid = $quizobj->get_cmid();
        $eventdata->courseid = $quizobj->get_courseid();
        events_trigger('quiz_attempt_started', $eventdata);
        $res = new stdClass();
        $res->id = $attempt->id;
        $res->uniqueid = $attempt->uniqueid;
        return $res;
    }

    private static function attempts_allowed($attempt, $quizobj) {
        global $DB;
        $quizid = $quizobj->get_quizid();
        $attempts_allowed = array_values($DB->get_records_sql("SELECT attempts FROM {quiz} q WHERE id=" . $quizid));
        $num_allowed = $attempts_allowed[0]->attempts;
        return $num_allowed;
    }

    private static function get_user_id($token) {
        global $DB;
        $user = current(array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', array('token' => $token))));
        return empty($user->userid) ? null : $user->userid;
    }

    private static function get_post_data($reqQuestions, $usageid) {
        $postarray = array();
        foreach ($reqQuestions as $key => $ques) {
            $quesno = $key + 1;
            //$postvals .= "q$usageid:1_:sequencecheck" => "1";
            if ($ques->type == 'truefalse') {
                foreach ($ques->choices as $keys => $choices) {
                    if ($choices->value == 0) {
                        $val[] = $choices->value;
                    }
                    if ($choices->value == 1) {
                        $val[] = $choices->value;
                    }
                }
                $k0 = 'q' . $usageid . ':' . $quesno . '_:sequencecheck';
                $k10 = 'q' . $usageid . ':' . $quesno . '_answer';
                $postarray[$k0] = 1;
                $postarray[$k10] = $val[0];
            }
            if ($ques->singleType == 1) {
                foreach ($ques->choices as $keys => $choices) {
                    if ($choices->isSelected === true) {
                        $vals = $keys;
                    }
                }
                $k = 'q' . $usageid . ':' . $quesno . '_:sequencecheck';
                $k1 = 'q' . $usageid . ':' . $quesno . '_answer';
                $postarray[$k] = 1;
                $postarray[$k1] = $vals;
            }
            if ($ques->type == 'multichoice' AND $ques->singleType != 1) {
                $k2 = 'q' . $usageid . ':' . $quesno . '_:sequencecheck';
                $postarray[$k2] = 1;
                foreach ($ques->choices as $keys => $choices) {
                    //echo $keys;
                    $vals = $ques->choices[$keys]->value;
                    $k3 = 'q' . $usageid . ':' . $quesno . '_choice' . $keys . '';
                    $postarray[$k3] = $vals;
                }
            }
            if ($ques->type == 'match' AND $ques->singleType != 1) {
                $k2 = 'q' . $usageid . ':' . $quesno . '_:sequencecheck';
                $postarray[$k2] = 1;
                foreach ($ques->choices as $keys => $choices) {
                    //echo $keys;
                    $vals = $ques->choices[$keys]->value;
                    $k3 = 'q' . $usageid . ':' . $quesno . '_sub' . $keys . '';
                    $postarray[$k3] = $vals;
                }
            }
        }
        return $postarray;
    }

    private static function get_finished_response($quizlist) {
        foreach ($quizlist as $key => $quizlists) {
            $statefinish = $quizlists->attempts[0]->state;
            $res = new stdClass();
            if ($statefinish == 'finished') {
                $slots = $quizlists->attempts[0]->slots;
                $startedOn = substr($quizlists->attempts[0]->startedOn, 0, -3);
                $completedOn = substr($quizlists->attempts[0]->completedOn, 0, -3);
                $ques = '';
                foreach ($quizlists->questions as $keys => $questions) {
                    $ques[] = $questions;
                }
                foreach ($quizlists->attempts as $attempts) {
                    $atts[] = $attempts;
                }
                $results[$key] = $ques;
            }
        }
        $res->list = $results;
        $res->times = $atts;
        $res->slots = $slots;
        return $res;
    }

    private static function get_completed_response($request, $attemptid, $key) {
        $quizlist = $request->data[0]->quizlist;
        $statefinish = $quizlist[$key]->attempts[0]->state;
        if ($statefinish == 'finished') {
            $quizlist[$key]->attempts[0]->state = 'completed';
            $quizlist[$key]->attempts[0]->rowid = $attemptid;
            $finalscore = self::get_final_score($attemptid);
            $quizlist[$key]->attempts[0]->sumgrades = $finalscore[0]->sumgrades;
        }
        $request->data[0]->quizlist = $quizlist;
        return $request;
    }

    private static function get_blocked_response($request, $attemptid, $key) {
        $quizlist = $request->data[0]->quizlist;
        foreach ($quizlist as $i => &$quizlists) {
            //echo  $statefinish = $quizlists->attempts[0]->state;   
            if ($quizlists->attempts[0]->state == 'finished') {
                $quizlists->attempts[0]->state = 'blocked';
            }
        }
        unset($quizlists);
        $request->data[0]->quizlist = $quizlist;
        return $request;
    }

    // Query to fetch Final Score 
    private static function get_final_score($id) {
        global $DB;
        $data = $DB->get_records_sql("SELECT sumgrades FROM mdl_quiz_attempts WHERE id=$id AND state LIKE 'finished' ORDER BY id DESC");
        return array_values($data);
    }

}
?>

