<?php
require_once('../config.php');
$id = optional_param('id', 0, PARAM_INT);

require_login();

$category_id = $id;
$subcategories = $DB->get_record('course_categories', array('id' => $category_id));
$back_url = new moodle_url( $CFG->wwwroot.'/my/categories.php');
$header = "$SITE->shortname: ".$subcategories->name;
$systemcontext = context_system::instance();
$url = new moodle_url('/my/courses.php', array('id' => $category_id));
$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');


$root_courses = enrol_get_users_courses($USER->id, $category_id,'', true, 'id, shortname, fullname, idnumber, visible, viewtype');
$PAGE->navbar->ignore_active();
$PAGE->navbar->add(get_string('courses'), $back_url);
$PAGE->navbar->add($subcategories->name, $url);
$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();
echo $OUTPUT->heading($subcategories->name);
echo $OUTPUT->box_start();
if($root_courses) {
	
	foreach($root_courses as $rootcourse) {	
		$urls = new moodle_url( $CFG->wwwroot.'/course/view.php', array('id' => $rootcourse->id));
		echo '<h3><a href="'.$urls.'">'.$rootcourse->fullname.' </a></h3>';	
	}
	
} else {
	echo get_string('nocoursefound');
}
echo $OUTPUT->box_end();
//echo '<a href="'.$back_url.'">'.get_string('goback').'</a>';
echo $OUTPUT->footer();
