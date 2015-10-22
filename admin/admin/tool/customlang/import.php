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
 * Performs checkout of the strings into the translation table
 *
 * @package    tool
 * @subpackage customlang
 * @copyright  2010 David Mudrak <david@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_OUTPUT_BUFFERING', true); // progress bar is used here

require(dirname(dirname(dirname(dirname(__FILE__)))) . '/config.php');
require_once($CFG->dirroot.'/'.$CFG->admin.'/tool/customlang/locallib.php');
require_once($CFG->libdir.'/adminlib.php');

require_login(SITEID, false);
require_capability('tool/customlang:view', get_system_context());

$action  = optional_param('action', '', PARAM_ALPHA);
$confirm = optional_param('confirm', false, PARAM_BOOL);
$lng     = optional_param('lng', '', PARAM_LANG);

admin_externalpage_setup('toolcustomlang');
$langs = get_string_manager()->get_list_of_translations();

// pre-output actions

$output = $PAGE->get_renderer('tool_customlang');

// output starts here
echo $output->header();
echo $output->heading('Import Language Translations');?>

<?php if(isset($_POST['submit'])) {
	$PAGE->set_cacheable(false);    // progress bar is used here
    $progressbar = new progress_bar();
    $progressbar->create();         // prints the HTML code of the progress bar
	/**
	 * step 1: checkout language strings from moodle data language files into database
	 * step 2: update the customizations into db
	 * step 3: checkin the changes to moodle data language files
	 */
    // we may need a bit of extra execution time and memory here
    @set_time_limit(HOURSECS);
    raise_memory_limit(MEMORY_EXTRA);
	$handle = fopen($_FILES['uploadcsv']['tmp_name'], "r");
	if (($handle = fopen($_FILES['uploadcsv']['tmp_name'], "r")) !== FALSE) {
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
			$row++;

			if($row === 2) {
				$lng = $data[0];
				break;
			}
		}
		fclose($handle);
	}

    tool_customlang_utils::checkout($lng, $progressbar);

	if (($handle = fopen($_FILES['uploadcsv']['tmp_name'], "r")) !== FALSE) {
		while (($string = fgetcsv($handle, 1000, ",")) !== FALSE) {
			$row++;

			if($row === 1) continue;

			$component = $DB->get_record('tool_customlang_components', array(
				'name' =>  $string[1],
			));
			$current = $DB->get_record('tool_customlang', array(
				'lang' =>  $string[0],
				'componentid' => $component->id,
				'stringid' => $string[2],
			));
			
			if(empty($current)) {
				continue; // skip unfound stringids
			}

			if (empty($current->local)) {
				$current->local = $string[3];
				$current->modified = 1;
				$current->outdated = 0;
				$current->timecustomized = time();
				$DB->update_record('tool_customlang', $current);
			}
		}
		fclose($handle);
	}

	tool_customlang_utils::checkin($lng);
	$PAGE->set_url(new moodle_url('import.php'));
	redirect($PAGE->url);

}?>



<form method="post" enctype="multipart/form-data">
	<div style="margin:5px;">
<input name="uploadcsv" type="file" />
	</div>
	<div style="margin:5px;">
		<input type="hidden" name="submit" value="1" />
		<input type="submit" value="Import" />
		<div  style="margin:5px;">Note: You are requested to use separate CSV files  for each language. The first column should contain the language code. <p>Mixing different language codes in the same CSV may lead to corrupt translations.</div>
	</div>
</form>

<?php echo $output->footer();
