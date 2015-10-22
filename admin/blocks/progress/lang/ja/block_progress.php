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
 * Progress Bar block Japanese language translation
 *
 * @package    contrib
 * @subpackage block_progress
 * @copyright  2010 Toshimi Hatanaka
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Module names
$string['assign'] = 'Assignment';
$string['assignment'] = 'Assignment';
$string['book'] = 'Book';
$string['certificate'] = 'Certificate';
$string['chat'] = 'Chat';
$string['choice'] = 'Choice';
$string['data'] = 'Database';
$string['feedback'] = 'Feedback';
$string['flashcardtrainer'] = 'Flashcard trainer';
$string['folder'] = 'Folder';
$string['forum'] = 'Forum';
$string['glossary'] = 'Glossary';
$string['hotpot'] = 'Hot Potatoes';
$string['imscp'] = 'IMS Content Package';
$string['journal'] = 'Journal';
$string['lesson'] = 'Lesson';
$string['page'] = 'Page';
$string['quiz'] = 'Quiz';
$string['resource'] = 'File';
$string['scorm'] = 'SCORM';
$string['url'] = 'URL';
$string['wiki'] = 'Wiki';

// Actions
$string['activity_completion'] = 'アクティビティの完了';
$string['answered'] = 'answered';
$string['attempted'] = 'attempted';
$string['awarded'] = 'awarded';
$string['completed'] = 'completed';
$string['finished'] = 'finished';
$string['graded'] = 'graded';
$string['marked'] = 'marked';
$string['passed'] = 'passed';
$string['posted_to'] = 'posted to';
$string['responded_to'] = 'responded to';
$string['submitted'] = 'submitted';
$string['viewed'] = 'viewed';

// Stings for the Config page
$string['config_default_title'] = '進捗状況';
$string['config_header_action'] = 'アクション';
$string['config_header_expected'] = '目標期限:';
$string['config_header_icon'] = 'アイコン';
$string['config_header_locked'] = 'Locked to deadline';
$string['config_header_monitored'] = 'モニタリング項目';
$string['config_icons'] = 'Use icons in bar';
$string['config_monitored'] = 'Monitored Activities/Resources';
$string['config_now'] = 'Use';
$string['config_title'] = '代替タイトル';

// Help strings
$string['why_set_the_title'] = 'Why you might want to set the block instance title?';
$string['why_set_the_title_help'] = '
<p>There can be multiple instances of the Progress Bar block. You may use different Progress Bar blocks to monitor different sets of activities or resources. For instnace you could track progress in assignments in one block and quizzes in another. For this reason you can override the default title and set a more appropriate block title for each instance.</p>
';
$string['why_use_icons'] = 'Why you might want to use icons?';
$string['why_use_icons_help'] = '
<p>You may wish to add tick and cross icons in the Progress Bar to make this block more visually accessible for students with colour-blindness.</p>
<p>It may also make the meaning of the block clearer if you believe colours are not intuitive, either for cultural or personal reasons.</p>
';
$string['why_display_now'] = 'Why you might want to hide/show the NOW indicator?';
$string['why_display_now_help'] = '
<p>Not all course are focussed on completion of tasks by specific times. Some courses may have an open-enrollment, allowing students to enrol and complete when they can.</p>
<p>To use the Progess Bar as a tool in such courses, create "Expected by" dates in the far-future and set the "Use NOW" setting to No.</p>
';
$string['what_does_monitored_mean'] = 'What monitored means?';
$string['what_does_monitored_mean_help'] = '
<p>The purpose of this block is to encourage students to manage their time effectively. Each student can monitor their progress in completing the activies and resources you have created.</p>
<p>On the configuration page you will see a list of all the modules that you have created which can be monitored by the Progress Bar block. Modules will only be monitored and appear as a small square in the progress bar if you select Yes to monitor the module.</p>
';
$string['what_locked_means'] = 'What locked to deadline means?';
$string['what_locked_means_help'] = '
<p>Where an activity can, in its own settings, have a deadline, and a deadline is set, it is optional to use the deadline of the activity, or to set another separate time used for the activity in the Progress Bar.</p>
<p>To lock the Progress Bar to an activity\'s deadline it must have a deadline enabled and set. If the deadline is locked, changing the deadline in the activity\'s settings will automatically change the time associated with the activity in the Progress Bar.</p>
<p>When an activity is not locked to a deadline of the activity, changing the date and time in the Progress Bar settings will not affect the deadline of the activity.</p>
';
$string['what_expected_by_means'] = 'What expected by means?';
$string['what_expected_by_means_help'] = '
<p>The <em>Expected by</em> date-time is when the related activity/resource is expected to be completed (viewed, sumbitted, posted-to, etc...).</p>
<p>If there is already a deadline associated with an activity, like an assignment deadline, this deadline can be used as the expected time for the event as long as the "Locked to Deadline" checkbox is checked. By unselecting locking an independant expected time can be created, and altering this will not affect the actual deadline of the activity.</p>
<p>When you first visit the configuration page for the Progress Bar, or if you create a new activity/resource and return to the configuration page, a guess will be made about the expected date-time for the activity/resource.
<ul>
    <li>For an activity with an existing deadline, this deadline will used.</li>
    <li>When there is no activity deadline, but the course format used is a weekly format, the end of the week (just before midnight Sunday) is assumed.</li>
    <li>For an activity/resource not used in a weekly course format, the end of the current week (just before midnight next Sunday) is used.</li>
</ul>
</p>
<p>Once an expected date-time is set, it is independant of any deadline or other information for that activity/resource.</p>
';
$string['what_actions_can_be_monitored'] = 'What actions can be monitored?';
$string['what_actions_can_be_monitored_help'] = '
<p>Different activities and resources can be monitored.</p>
<p>Because different activities and resources are used differently, what is monitored for each module varies. For example, for assignments, submission can be monitored; quizzes can be monitored on attempt; forums can be monitored for student postings; choice activities can monitored for answering and viewing resources is monitored.</p>
<p>Some activities can have more than one activity associated with them. In such cases, you can select the appropriate activity for each instance of that activity.</p>
';

// Other terms
$string['date_format'] = '%a %d %b, %I:%M %p';
$string['mouse_over_prompt'] = '進捗バーをマウスオーバー';
$string['no_events_message'] = '進捗を追跡するイベントがありません。設定画面を使ってイベントを追加してください。';
$string['no_visible_events_message'] = '選択したイベントはすべて非表示になっています。';
$string['no_events_config_message'] = '進捗をモニタリングする活動やリソースがありません。活動またはリソースを追加したあと、このブロックを設定してください。';
$string['now_indicator'] = 'NOW';
$string['pluginname'] = '進捗状況';
$string['time_expected'] = '目標期限';

// Default colours that may have different cultural meanings
$string['attempted_colour'] = '#33CC00';
$string['notAttempted_colour'] = '#FF3300';
$string['futureNotAttempted_colour'] = '#3366FF';

// Overview page strings
$string['lastonline'] = 'Last online';
$string['overview'] = 'Overview of students';
$string['progress'] = 'Progress';
$string['progressbar'] = 'Progress Bar';

// For cabailities
$string['progress:overview'] = 'View course overview of Progress bars for all students';