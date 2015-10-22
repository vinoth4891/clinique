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
 * Forgot password routine.
 *
 * Finds the user and calls the appropriate routine for their authentication type.
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

//HTTPS is required in this page when $CFG->loginhttps enabled
$PAGE->https_required();

$systemcontext = context_system::instance();


if (!empty($email) || !$email) {

    $select = $DB->sql_like('email', ':email', false, true, false, '|') . " AND mnethostid = :mnethostid AND deleted=0 AND suspended=0";
    $params = array('email' => $DB->sql_like_escape($email, '|'), 'mnethostid' => $CFG->mnet_localhost_id);
    $user = $DB->get_record_select('user', $select, $params, '*', IGNORE_MULTIPLE);

    if ($user and ($user->auth === 'nologin' or !is_enabled_auth($user->auth))) {
        // bad luck - user is not able to login, do not let them reset password
        $user = false;
        $error->error = true;
        $error->msg = 'fp_nologin';
        echo json_encode($error);
        die;
    }

    if (!empty($user)) {

        if (is_mnet_remote_user($user)) {
            add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Forgot password - mnet user trying to access.', 0, $user->id);
            $error->error = true;
            $error->msg = 'cp_mnet_user';
            echo json_encode($error);            
            die;
        }
        
        if (isguestuser($user)) {
            add_to_log(-1, 'custom_webservice', 'guest_user', null, 'Forgot password - guest user credential supplied.', 0, $user->id);
            $error->error = true;
            $error->msg = 'fp_guest';
            echo json_encode($error);
            die;
        }

        // make sure user is allowed to change password
        require_capability('moodle/user:changeownpassword', $systemcontext, $user->id);

        if (!app_reset_password_and_mail($user)) {           
            add_to_log(-1, 'custom_webservice', 'trigger_mail', null, 'Forgot password - email triggering failure.', 0, $user->id);
            $error->error = true;
            $error->msg = 'fp_email_failure';
            echo json_encode($error);
        } else {
            $error->error = false;
            $error->msg = 'fp_email_success';
            echo json_encode($error);
            set_user_preference('auth_forcepasswordchange', true, $user->id);
        }
    } else {
        $error->error = true;
        $error->msg = 'fp_no_record';
        echo json_encode($error);
    }
}else{
     add_to_log(-1, 'custom_webservice', 'input_parameters', null, 'Forgot password - input parameters missing.', 0, $user->id);
}

function app_reset_password_and_mail($user) {
    global $CFG;

    $site = get_site();
    $supportuser = generate_email_supportuser();



    $userauth = get_auth_plugin($user->auth);
    if (!$userauth->can_reset_password() or !is_enabled_auth($user->auth)) {
        trigger_error("Attempt to reset user password for user $user->username with Auth $user->auth.");
        return false;
    }

    $newpassword = generate_password();

    if (!$userauth->user_update_password($user, $newpassword)) {
        $error->error = true;
        $error->msg = 'fp_passwordgen_failure';
        echo json_encode($error);
        die;
    }

    $a = new stdClass();
    $a->firstname = $user->firstname;
    $a->lastname = $user->lastname;
    $a->sitename = format_string($site->fullname);
    $a->username = $user->username;
    $a->newpassword = $newpassword;
    $a->signoff = generate_email_signoff();

    $message = 'Hi ' . $a->firstname . ',

Your account password at \'' . $a->sitename . '\' has been reset
and you have been issued with a new temporary password.

Your current login information is now:
   username: ' . $a->username . '
   password: ' . $a->newpassword . '

Cheers from the \'' . $a->sitename . '\' administrator,
' . $a->signoff;

    //$message = get_string('newpasswordtext', '', $a);

    $subject = format_string($site->fullname) . ': ' . get_string('changedpassword');

    unset_user_preference('create_password', $user); // prevent cron from generating the password

    //directly email rather than using the messaging system to ensure its not routed to a popup or jabber
    return email_to_user($user, $supportuser, $subject, $message);
}

