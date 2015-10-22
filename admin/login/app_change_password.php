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
 * Change password page.
 *
 * @package    core
 * @subpackage auth
 * @copyright  1999 onwards Martin Dougiamas  http://dougiamas.com
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define('AJAX_SCRIPT', true);
define('REQUIRE_CORRECT_ACCESS', true);
define('NO_MOODLE_COOKIES', true);

require('../config.php');

header('Access-Control-Allow-Origin: *');

$error = new stdClass;

$email = required_param('email', PARAM_EMAIL);

$old_password = required_param('old_pwd', PARAM_RAW_TRIMMED);

$new_password = required_param('new_pwd', PARAM_RAW_TRIMMED);

//HTTPS is required in this page when $CFG->loginhttps enabled
$PAGE->https_required();

$systemcontext = context_system::instance();

if (!empty($email) || !$email && !empty($old_password) || !$old_password && !empty($new_password) || !$new_password) {

    $select = $DB->sql_like('email', ':email', false, true, false, '|') . " AND mnethostid = :mnethostid AND deleted=0 AND suspended=0";
    $params = array('email' => $DB->sql_like_escape($email, '|'), 'mnethostid' => $CFG->mnet_localhost_id);
    $user = $DB->get_record_select('user', $select, $params, '*', IGNORE_MULTIPLE);

    if (!empty($user)) {

        if (is_mnet_remote_user($user)) {
            add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Change password - mnet user trying to access.', 0, $user->id);
            $error->error = true;
            $error->msg = 'cp_mnet_user';
            echo json_encode($error);
            die;
        }
        
        if (isguestuser($user)) {
            add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Change password - guest user credential supplied.', 0, $user->id);
            $error->error = true;
            $error->msg = 'cp_guest';
            echo json_encode($error);
            die;
        }

        // make sure user is allowed to change password
        require_capability('moodle/user:changeownpassword', $systemcontext, $user->id);

        if (!app_validate_internal_user_password($user, $old_password)) {
            $error->error = true;
            $error->msg = 'cp_wrong_oldpwd';
            echo json_encode($error);
        } else {
            $userauth = get_auth_plugin($user->auth);
            if ($userauth->user_update_password($user, $new_password)) {
                unset_user_preference('auth_forcepasswordchange', $user);
                unset_user_preference('create_password', $user);
                $error->error = false;
                $error->msg = 'cp_success';
                echo json_encode($error);
            } else {
                add_to_log(-1, 'custom_webservice', 'trigger_mail', null, 'Change password - password change updation failure.', 0, $user->id);
                $error->error = true;
                $error->msg = 'cp_failure';
                echo json_encode($error);
            }
        }
    } else {
        $error->error = true;
        $error->msg = 'cp_no_mail_record';
        echo json_encode($error);
    }
}else{
    add_to_log(-1, 'custom_webservice', 'input_parameters', null, 'Change password - input parameters missing.', 0, $user->id);
}

function app_validate_internal_user_password($user, $password) {
    global $CFG;

    if (!isset($CFG->passwordsaltmain)) {
        $CFG->passwordsaltmain = '';
    }

    $validated = false;

    if ($user->password === 'not cached') {
        // internal password is not used at all, it can not validate
    } else if ($user->password === md5($password . $CFG->passwordsaltmain)
    or $user->password === md5($password)
    or $user->password === md5(addslashes($password) . $CFG->passwordsaltmain)
    or $user->password === md5(addslashes($password))) {
        // note: we are intentionally using the addslashes() here because we
        //       need to accept old password hashes of passwords with magic quotes
        $validated = true;
    }

    return $validated;
}
