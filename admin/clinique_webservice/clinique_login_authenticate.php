<?php

require_once('response.php');

require_once(dirname(dirname(__FILE__)) . '/config.php');

class Login {

    public function __authenticate($username, $password, $serviceshortname) {

        global $CFG, $DB;

        //echo $OUTPUT->header();

        if (!$CFG->enablewebservices) {
            throw new moodle_exception('enablewsdescription', 'webservice');
        }
        $username = trim(textlib::strtolower($username));
        if (is_restored_user($username)) {
            throw new moodle_exception('restoredaccountresetpassword', 'webservice');
        }
        $user = authenticate_user_login($username, $password);

        if (!empty($user)) {

//Non admin can not authenticate if maintenance mode
            $hassiteconfig = has_capability('moodle/site:config', context_system::instance(), $user);
            if (!empty($CFG->maintenance_enabled) and !$hassiteconfig) {
                throw new moodle_exception('sitemaintenance', 'admin');
            }

            if (isguestuser($user)) {
                throw new moodle_exception('noguest');
            }
            if (empty($user->confirmed)) {
                throw new moodle_exception('usernotconfirmed', 'moodle', '', $user->username);
            }
// check credential expiry
            $userauth = get_auth_plugin($user->auth);
            if (!empty($userauth->config->expiration) and $userauth->config->expiration == 1) {
                $days2expire = $userauth->password_expire($user->username);
                if (intval($days2expire) < 0) {
                    throw new moodle_exception('passwordisexpired', 'webservice');
                }
            }

// let enrol plugins deal with new enrolments if necessary
            enrol_check_plugins($user);

// setup user session to check capability
            session_set_user($user);

//check if the service exists and is enabled
            $service = $DB->get_record('external_services', array('shortname' => $serviceshortname, 'enabled' => 1));
            if (empty($service)) {
// will throw exception if no token found
                throw new moodle_exception('servicenotavailable', 'webservice');
            }

//check if there is any required system capability
            if ($service->requiredcapability and !has_capability($service->requiredcapability, context_system::instance(), $user)) {
                throw new moodle_exception('missingrequiredcapability', 'webservice', '', $service->requiredcapability);
            }

//specific checks related to user restricted service
            if ($service->restrictedusers) {
                $authoriseduser = $DB->get_record('external_services_users', array('externalserviceid' => $service->id, 'userid' => $user->id));

                if (empty($authoriseduser)) {
                    throw new moodle_exception('usernotallowed', 'webservice', '', $serviceshortname);
                }

                if (!empty($authoriseduser->validuntil) and $authoriseduser->validuntil < time()) {
                    throw new moodle_exception('invalidtimedtoken', 'webservice');
                }

                if (!empty($authoriseduser->iprestriction) and !address_in_subnet(getremoteaddr(), $authoriseduser->iprestriction)) {
                    throw new moodle_exception('invalidiptoken', 'webservice');
                }
            }

//Check if a token has already been created for this user and this service
//Note: this could be an admin created or an user created token.
//      It does not really matter we take the first one that is valid.
            $tokenssql = "SELECT t.id, t.sid, t.token, t.validuntil, t.iprestriction
              FROM {external_tokens} t
             WHERE t.userid = ? AND t.externalserviceid = ? AND t.tokentype = ?
          ORDER BY t.timecreated ASC";
            $tokens = $DB->get_records_sql($tokenssql, array($user->id, $service->id, EXTERNAL_TOKEN_PERMANENT));

//A bit of sanity checks
            foreach ($tokens as $key => $token) {

/// Checks related to a specific token. (script execution continue)
                $unsettoken = false;
//if sid is set then there must be a valid associated session no matter the token type
                if (!empty($token->sid)) {
                    $session = session_get_instance();
                    if (!$session->session_exists($token->sid)) {
//this token will never be valid anymore, delete it
                        $DB->delete_records('external_tokens', array('sid' => $token->sid));
                        $unsettoken = true;
                    }
                }

//remove token if no valid anymore
//Also delete this wrong token (similar logic to the web service servers
//    /webservice/lib.php/webservice_server::authenticate_by_token())
                if (!empty($token->validuntil) and $token->validuntil < time()) {
                    $DB->delete_records('external_tokens', array('token' => $token->token, 'tokentype' => EXTERNAL_TOKEN_PERMANENT));
                    $unsettoken = true;
                }

// remove token if its ip not in whitelist
                if (isset($token->iprestriction) and !address_in_subnet(getremoteaddr(), $token->iprestriction)) {
                    $unsettoken = true;
                }

                if ($unsettoken) {
                    unset($tokens[$key]);
                }
            }

// if some valid tokens exist then use the most recent
            if (count($tokens) > 0) {
                $token = array_pop($tokens);
            } else {
                if (($serviceshortname == MOODLE_OFFICIAL_MOBILE_SERVICE and has_capability('moodle/webservice:createmobiletoken', get_system_context()))
//Note: automatically token generation is not available to admin (they must create a token manually)
                or (!is_siteadmin($user) && has_capability('moodle/webservice:createtoken', get_system_context()))) {
// if service doesn't exist, dml will throw exception
                    $service_record = $DB->get_record('external_services', array('shortname' => $serviceshortname, 'enabled' => 1), '*', MUST_EXIST);
// create a new token
                    $token = new stdClass;
                    $token->token = md5(uniqid(rand(), 1));
                    $token->userid = $user->id;
                    $token->tokentype = EXTERNAL_TOKEN_PERMANENT;
                    $token->contextid = context_system::instance()->id;
                    $token->creatorid = $user->id;
                    $token->timecreated = time();
                    $token->externalserviceid = $service_record->id;
                    $tokenid = $DB->insert_record('external_tokens', $token);
                    add_to_log(SITEID, 'webservice', 'automatically create user token', '', 'User ID: ' . $user->id);
                    $token->id = $tokenid;
                } else {
                    throw new moodle_exception('cannotcreatetoken', 'webservice', '', $serviceshortname);
                }
            }

// log token access
            $DB->set_field('external_tokens', 'lastaccess', time(), array('id' => $token->id));

            add_to_log(SITEID, 'webservice', 'sending requested user token', '', 'User ID: ' . $user->id);

            $usertoken = new stdClass;
            $usertoken->token = $token->token;
            //complete login process by activating session.
            // To restrict the admin user to login into application
            if(is_siteadmin($user)){
                $heIsAdmin = new stdClass;
                $heIsAdmin->error = 'admin_user';
                echo json_encode($heIsAdmin);
                die;
            }
            Login::__app_complete_user_login($user);

            $forcePasswordChangesql = "SELECT up.userid
              FROM {user_preferences} up
             WHERE up.userid = ? AND up.name = ? AND up.value = ?";
            $forcePasswordChange = $DB->get_records_sql($forcePasswordChangesql, array($user->id, 'auth_forcepasswordchange', 1));
            //User Update Profile starts here
            $admins = get_admins();
            $currentAdmin = end($admins);
            $admintokensql = "SELECT et.token
              FROM {external_tokens} et
             WHERE et.userid = ?";
            $currrentAdminToken = $DB->get_records_sql($admintokensql,array($currentAdmin->id),0,1);
            $unique_key = substr(md5(mt_rand(0, 1000000)), 0, 7);
            $keys = array_keys($currrentAdminToken);
            $appuser = new stdClass;
            $user->token = $token->token;
            $user->forcePasswordChange = (!empty($forcePasswordChange)) ? true : false;
            $user->updateProfile = substr($unique_key,0,3).$keys[0].substr($unique_key,3,7);
            //Get User role
			$rolesql = "SELECT id
              FROM {role} 
             WHERE shortname = ?";
			$roleid = array_values($DB->get_records_sql($rolesql, array('reportuser')));
			$reportuser= array_values($DB->get_records_sql("SELECT id FROM {role_assignments} WHERE roleid=".$roleid[0]->id." AND userid=".$user->id.""));
			if($reportuser[0]->id != '') {
			  $user->role = 'reportuser';
			} else {
			  $user->role = '';
			}
			//User Update Profile ends here
            unset($user->password);
            $appuser->USER = $user;

			$user->country_value = $user->country;
            $user->country = get_string($user->country, 'countries');
            echo json_encode($appuser);
        } else {
            throw new moodle_exception('usernamenotfound', 'moodle');
        }
    }

    private function __app_complete_user_login($user) {
        global $CFG, $USER;

// regenerate session id and delete old session,
// this helps prevent session fixation attacks from the same domain
        session_regenerate_id(true);

// let enrol plugins deal with new enrolments if necessary
        enrol_check_plugins($user);

// check enrolments, load caps and setup $USER object
        session_set_user($user);

// reload preferences from DB
        unset($USER->preference);
        check_user_preferences_loaded($USER);

// update login times
        update_user_login_times();

// extra session prefs init
        set_login_session_preferences();

        if (isguestuser()) {
// no need to continue when user is THE guest
            return $USER;
        }

        return $USER;
    }

}

