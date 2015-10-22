<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Page for creating or editing course category name/parent/description.
 * When called with an id parameter, edits the category with that id.
 * Otherwise it creates a new category with default parent from the parent
 * parameter, which may be 0.
 *
 * @package    core
 * @subpackage course
 * @copyright  2007 Nicolas Connault
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../config.php');

require_once($CFG->dirroot.'/lib/formslib.php');
require_once($CFG->libdir.'/completionlib.php');

require_login();

$title = "$SITE->shortname: ".get_string('regionkey');

$formname = get_string('regionkey');


if (isguestuser()) {  // Force them to see system default, no editing allowed
    // If guests are not allowed my moodle, send them to front page.
    if (empty($CFG->allowguestmymoodle)) {
        redirect(new moodle_url('/', array('redirect' => 0)));
    }

    $userid = NULL; 
    $USER->editing = $edit = 0;  // Just in case
    $context = context_system::instance();
    $PAGE->set_blocks_editing_capability('moodle/my:configsyspages');  // unlikely :)
    $header = "$SITE->shortname: $strmymoodle (GUEST)";

} else {        // We are trying to view or edit our own My Moodle page
    $userid = $USER->id;  // Owner of the page
    $context = context_user::instance($USER->id);
    $PAGE->set_blocks_editing_capability('moodle/my:manageblocks');
    $header = "$SITE->shortname: $strmymoodle";
}

    class regionkey_form extends moodleform {

        function definition () {
            global $USER, $CFG, $DB, $PAGE;
			
			$mform =& $this->_form;
            $displaylist = array();
            //$getRegion = array_values($DB->get_records_sql("SELECT param1 FROM {mdl_user_info_field} WHERE shortname LIKE '%region%'"));
			//$displaylistval = $DB->get_records('user_info_field', array('shortname'=>'Region'));
			$displaylistval = $DB->get_field('user_info_field', 'param1', array('shortname'=>'Region'));
			//$attributes = array();
			//$attributes('onchange' => 'document.getElementById("mform1").submit();');
			    $displaylist = explode("\n", trim($displaylistval));               
				$displayvalue = array_values($displaylist);
				$option = array_combine($displaylist, $displayvalue);
                $mform->addElement('select', 'region', get_string('selectaregion'), $option);
                $mform->addRule('region', get_string('selectaregion'), 'required', null);
			
			
			
            $mform->addElement('text', 'regionkey', get_string('key'), array('size'=>'30', 'maxlength'=> '20'));
			$mform->setType('regionkey', PARAM_NOTAGS);
            $mform->addRule('regionkey', get_string('key'), 'required', null, 'server');
            
			$mform->addElement('hidden', 'url', null, array('id' => 'url'));
            $mform->setType('url', PARAM_ALPHANUM);
            $mform->setConstant('url', $CFG->wwwroot);
		
            $this->add_action_buttons(false, 'submit');
        }

    }
	
$rk_form = new regionkey_form();

if ($rk_form->is_cancelled()) {

// Redirect to somewhere if the user clicks cancel

}

if ($data = $rk_form->get_data()) {
   //print_r($data); exit;
 // Do something with the data, then redirect to a new page
        $regionrecord = $DB->get_record('regionkey', array('region'=>$data->region));
        
		if (empty($regionrecord)) {
            $regionrecord = new stdClass();
            $regionrecord->region = $data->region;
            $regionrecord->regionkey = $data->regionkey;
            $DB->insert_record('regionkey', $regionrecord);
        } else {
            $regionrecord->regionkey = $data->regionkey;
            $DB->update_record('regionkey', $regionrecord);
        }
		redirect('regionkey.php?msg=success');
}

// You should really output the page header before this

$PAGE->set_title($title);
$PAGE->set_heading($fullname);
echo $OUTPUT->header();
?>
<script type="text/javascript" src="js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="js/regionkey.js"></script>
<?php
echo $OUTPUT->heading($formname);
$rk_form->display();
echo $OUTPUT->footer();

// Output page footer afterwards	