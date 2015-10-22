<?php
require_once('../config.php');
require_once($CFG->libdir . '/adminlib.php');

//define('CSV_PATH','C:/xampp/htdocs/clinique_dev/admin/my/');
// path where your CSV file is located

$quizmoduleid = $_REQUEST['id'];

$coursemodule = $DB->get_record('course_modules', array(
    'id' => $quizmoduleid
));
$quiz_id      = $coursemodule->instance;

$quiz_details = $DB->get_record('quiz', array(
    'id' => $quiz_id
));

$lastattempt        = $DB->get_record('quiz_attempts', array(
    'quiz' => $quiz_id,
    'userid' => 2
));
$get_last_unique_id = $DB->get_record_sql('SELECT uniqueid FROM {quiz_attempts} ORDER BY uniqueid DESC LIMIT 0, 1');

$attempt      = 1;
$uniqueid     = $get_last_unique_id->uniqueid + 1;
$layout       = $lastattempt->layout;
$preview      = $lastattempt->preview;
$state        = 'finished';
$timestart    = $lastattempt->timestart;
$timefinish   = $lastattempt->timefinish;
$timemodified = $lastattempt->timemodified;

$csv_file = "user_points.csv"; // Name of your CSV file
$csvfile  = fopen($csv_file, 'r');
$theData  = fgets($csvfile);
$i        = 0;

while (!feof($csvfile)) {
    $csv_data[] = fgets($csvfile, 1024);
    $csv_array  = explode(",", $csv_data[$i]);
    echo $username   = $csv_array[0];
	echo "<br>";
    $points  = $csv_array[1];
    $user    = $DB->get_record('user', array(
        'username' => $username
    ));
    $user_id = $user->id;
    if ($user_id) {
        $dataval               = new stdClass;
        $dataval->quiz         = $quiz_id;
        $dataval->userid       = $user_id;
        $dataval->attempt      = $attempt;
        $dataval->uniqueid     = $uniqueid;
        $dataval->layout       = $layout;
        $dataval->preview      = $preview;
        $dataval->state        = $state;
        $dataval->sumgrades    = $points;
        $dataval->timestart    = $timestart;
        $dataval->timefinish   = $timefinish;
        $dataval->timemodified = $timemodified;
        $check_exists          = $DB->get_record('quiz_attempts', array(
            'userid' => $user_id,
            'quiz' => $quiz_id
        ));
        if ($check_exists) {
            $dataval->id = $check_exists->id;
            echo $lastinsertid = $DB->update_record('quiz_attempts', $dataval);
            echo " " . $username . " Inserted sucessfully<br>";
        } else {
            echo $lastinsertid = $DB->insert_record('quiz_attempts', $dataval);
            echo " " . $username . " updated sucessfully<br>";
        }
        $uniqueid++;
    }
    $i++;
}
fclose($csvfile);