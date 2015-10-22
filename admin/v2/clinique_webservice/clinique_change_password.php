<?php

require_once('response.php');

class ChangePassword {

    public function __getPassword($username, $email, $old_password, $new_password) {

        global $CFG, $DB;

        $systemcontext = context_system::instance();

        $response = new CliniqueServiceResponce();

        if ( ! empty($username) && ! empty($old_password) && ! empty($new_password))  {
			$user = $DB->get_record('user', array(
				'username' => $username,
				'mnethostid' => $CFG->mnet_localhost_id,
				'deleted' => 0,
				'suspended' => 0,
			));
            if (!empty($user)) {

                if (is_mnet_remote_user($user)) {
                    add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Change password - mnet user trying to access.', 0, $user->id);
                    $response->response(true, 'cp_mnet_user');
                    die;
                }

                if (isguestuser($user)) {
                    add_to_log(-1, 'custom_webservice', 'mnet_user', null, 'Change password - guest user credential supplied.', 0, $user->id);
                    $response->response(true, 'cp_guest');
                    die;
                }
   
// make sure user is allowed to change password

                require_capability('moodle/user:changeownpassword', $systemcontext, $user->id);

// $generatePasswordResult = generatePassword::app_validate_internal_user_password($user, $old_password);

                if (!ChangePassword::__app_validate_internal_user_password($user, $old_password)) {
                    $response->response(true, 'cp_wrong_oldpwd');
                } else {
                    $userauth = get_auth_plugin($user->auth);
                    if ($userauth->user_update_password($user, $new_password)) {
                        unset_user_preference('auth_forcepasswordchange', $user);
                        unset_user_preference('create_password', $user);
                        $response->response(false, 'cp_success');
                    } else {
                        add_to_log(-1, 'custom_webservice', 'trigger_mail', null, 'Change password - password change updation failure.', 0, $user->id);
                        $response->response(true, 'cp_failure');
                    }
                }
            } else {
               
                $response->response(false, 'cp_no_mail_record');
            }
        } else {
            add_to_log(-1, 'custom_webservice', 'input_parameters', null, 'Change password - input parameters missing.', 0, $user->id);
        }
    }

    private function __app_validate_internal_user_password($user, $password) {
        
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

}

