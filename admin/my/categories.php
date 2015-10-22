<?php
require_once('../config.php');

require_login();
$header = "$SITE->shortname: ".get_string('folderlist');

$systemcontext = context_system::instance();
$url = new moodle_url('/my/categories.php');
$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');
$category_id = 2;
$PAGE->navbar->ignore_active();
$PAGE->navbar->add(get_string('courses'), $url);
$list_of_subcategories = $DB->get_records('course_categories', array('parent' => $category_id));

$root_courses = enrol_get_users_courses($USER->id, $category_id,'', true, 'id, shortname, fullname, idnumber, visible, viewtype');
if($list_of_subcategories) {
	foreach($list_of_subcategories as $kSubCat => $vSubCat) {
		$subcategory = $vSubCat->id;
		$courses = enrol_get_users_courses($USER->id, $subcategory,'', true, 'id, shortname, fullname, idnumber, visible, viewtype');
		if($courses) {
			$vSubCat->course_count = count($courses);
			$subcat_details[] = $vSubCat;
		}
	}
}
$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();
//echo $OUTPUT->heading(get_string('folderlist'));

echo $OUTPUT->box_start();
if($subcat_details) {
	foreach($subcat_details as $subcat) {
		$urls = new moodle_url( $CFG->wwwroot.'/my/courses.php', array('id' => $subcat->id));
		//echo '<h2><a href="'.$urls.'">'.$subcat->name.' ('.$subcat->course_count.')</a></h2>';	
		echo '<h2><a href="'.$urls.'">'.$subcat->name.'</a></h2>';
	}
} else {
	echo get_string('nofoldersfound');
}
echo $OUTPUT->box_end();

if($root_courses) {
	echo $OUTPUT->heading(get_string('courselist'));
	echo $OUTPUT->box_start();
	foreach($root_courses as $rootcourse) {	
		$courseurls = new moodle_url( $CFG->wwwroot.'/course/view.php', array('id' => $rootcourse->id));
		echo '<h3><a href="'.$courseurls.'">'.$rootcourse->fullname.' </a></h3>';	
	}
	echo $OUTPUT->box_end();
} 
echo $OUTPUT->footer();
