<?php

require_once('response.php');

class ForgotPassword {

    public function __sendPassword($email) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();
        
        $response = new CliniqueServiceResponce();


        if (!empty($email) || !$email) {

            //$select = $DB->sql_like('email', ':email', false, true, false, '|') . " AND mnethostid = :mnethostid AND deleted=0 AND suspended=0";
            $params = array('email' => $DB->sql_like_escape($email, '|'), 'mnethostid' => $CFG->mnet_localhost_id);
            $users = $DB->get_records_sql('SELECT * FROM {user} WHERE email = :email AND mnethostid = :mnethostid AND deleted=0 AND suspended=0', $params);
			if($users) {
				$i =0;
				$fail = 0;
				$succ = 0;
				foreach($users as $user) {
					
					if ($user and ($user->auth === 'nologin' or !is_enabled_auth($user->auth))) {
						// bad luck - user is not able to login, do not let them reset password
						$user = false;
						$response->response(true, 'fp_nologin');
						die;
					}

					if (!empty($user)) {

						if (is_mnet_remote_user($user)) {
							add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Forgot password - mnet user trying to access.', 0, $user->id);
							//$response->response(true, 'cp_mnet_user');
							//die;
						}

						if (isguestuser($user)) {
							add_to_log(-1, 'custom_webservice', 'guest_user', null, 'Forgot password - guest user credential supplied.', 0, $user->id);
							//$response->response(true, 'fp_guest');
							//die;
						}

						// make sure user is allowed to change password
						require_capability('moodle/user:changeownpassword', $systemcontext, $user->id);

						if (!ForgotPassword::__app_reset_password_and_mail($user)) {
							add_to_log(-1, 'custom_webservice', 'trigger_mail', null, 'Forgot password - email triggering failure.', 0, $user->id);
							
							$fail = $fail + 1;
						} else {
							set_user_preference('auth_forcepasswordchange', true, $user->id);							
							$succ = $succ + 1;
						}
		
					} 
					$i++;
				}
				
				if($i == $fail) {
					$response->response(true, 'fp_email_failure');
				} else if($i == $succ) {
					$response->response(true, 'fp_email_success');
				} else if($i > $succ) {
					$response->response(true, 'fp_email_success');
				}
			}
			else {          
				$response->response(false, 'fp_no_record');
			}
        } else {
            add_to_log(-1, 'custom_webservice', 'input_parameters', null, 'Forgot password - input parameters missing.', 0, $user->id);
        }
    }

    private function __app_reset_password_and_mail($user) {
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
        //$a->signoff = generate_email_signoff();

        $message = 'Hi ' . $a->firstname . ',

Your account password at \'' . $a->sitename . '\' has been reset
and you have been issued with a new temporary password.

Your current login information is now:
   username: ' . $a->username . '
   password: ' . $a->newpassword . '

Cheers from the \'' . $a->sitename . '\' administrator.';

        //$message = get_string('newpasswordtext', '', $a);

        $subject = format_string($site->fullname) . ': ' . get_string('changedpassword');

        unset_user_preference('create_password', $user); // prevent cron from generating the password
        //directly email rather than using the messaging system to ensure its not routed to a popup or jabber
        return email_to_user($user, $supportuser, $subject, $message);
    }

}

