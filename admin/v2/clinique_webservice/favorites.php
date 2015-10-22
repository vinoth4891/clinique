<?php
	/**
	* @ display favourites avialable for particular users
	*/
	require_once('response.php');

	/*require('../../config.php');
	$favourites_user = get_user_preferences('user_bookmarks');
	$favourites_user = explode(',', get_user_preferences('user_bookmarks'));
            /// Accessibility: markup as a list.
            $favBookmark = array();
            foreach($favourites_user as $favourite_bookmark) {
                $favBookmark = explode(';', $favourite_bookmark);
				echo json_encode($favBookmark); // return json format
			}
			die();*/

			class Favorites{

                  public function __favorites($tokenval){

					  global $CFG,$DB;

                    $response = new CliniqueServiceResponce();

					 //$username = "Admin";

					 //$password = "Photon@123";

					$token_val = array('token'=>$tokenval);

					//$token_val = array('token'=>"64217bb7eea6f343a19f3af17104c49b");


					$userId = array_values($DB->get_records_sql('SELECT userid FROM {external_tokens} et WHERE et.token=?', $token_val));

				if($userId){

					$user_id = array('id' => $userId[0]->userid);

                    //if(confirm_sesskey()){

					$user = array_values($DB->get_records_sql('SELECT * FROM {user} u WHERE u.id=?', $user_id));


					Favorites::__fav_user_login($user['0']);

					$favourites_user = get_user_preferences('user_bookmarks');

					$favourites_user = explode(',', get_user_preferences('user_bookmarks'));
							/// Accessibility: markup as a list.
							$favBookmark = array();
							$incr = 0;
							//print_r($favourites_user);
							foreach($favourites_user as $favourite_bookmark) {
								//$favBookmark = explode(';', $favourite_bookmark);
								//echo json_encode($favBookmark); // return json format
                                //$response->response(false, $favBookmark);


								$data = explode(';', $favourite_bookmark);

								$id = ($data[0])?$data[0]:null;

								$fileDetails = explode("@",$data[1]);
								
								if($fileDetails[0]) {
									$getModInfo = $DB->get_record('course_modules', array('id' => $fileDetails[0]));
								} else {
									$getModInfo = '';
								}
								if($getModInfo) {
									$res[$incr]['url'] = $data[0];
									$res[$incr]['id'] = ($fileDetails[0])?$fileDetails[0]:null;
									$res[$incr]['course_type'] = ($fileDetails[1])?$fileDetails[1]:null;
									$res[$incr]['file_name'] = ($fileDetails[2])?$fileDetails[2]:null;
									$res[$incr]['file_type'] = ($fileDetails[3])?$fileDetails[3]:null;
									$res[$incr]['fname_upload'] = ($fileDetails[4])?$fileDetails[4]:null;
									$incr++;
								}

							}
							if($incr == 0) {
								$res[$incr]['url'] = "";
								$res[$incr]['id'] = null;
								$res[$incr]['course_type'] = null;
								$res[$incr]['file_name'] = null;
								$res[$incr]['file_type'] = null;
								$res[$incr]['fname_upload'] = null;
							}

							$fav_comment_count_sql = 'SELECT COUNT(urc.id) AS comment_count
								FROM mdl_user_resource_comments urc
								 JOIN mdl_course_modules cm ON cm.id = urc.coursemoduleid
								 JOIN mdl_course c ON cm.course = c.id
								 JOIN mdl_resource r ON cm.instance = r.id
								WHERE urc.userid = ' . $user_id['id'];
							$comments_count = current($DB->get_records_sql($fav_comment_count_sql));							

							$res['resource_comment_count'] = $comments_count->comment_count;
                           $response->response(false, 'success',$res);


					} else{

						 $response->response(true, 'Invalid user');
					}

                  }

			public function __fav_user_login($user) {
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

?>