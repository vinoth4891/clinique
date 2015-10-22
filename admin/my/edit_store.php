<?php
require_once('../config.php');
require_once($CFG->libdir.'/adminlib.php');
require_once('edit_store_form.php');
$id  = optional_param('id', '', PARAM_RAW);
$page        = optional_param('page', 0, PARAM_INT);
$perpage     = optional_param('perpage', 25, PARAM_INT);
$searchquery = optional_param('search', '', PARAM_RAW);
if($_POST) {
	$id  = $_POST['hid_id'];
}

require_login();
admin_externalpage_setup('addstore');

//$header = "$SITE->shortname: ".get_string('store');
$systemcontext = context_system::instance();
if($id) {
	$header = "$SITE->shortname: ".get_string('editstore');
	$heading_title = get_string('editstore');
	$url = new moodle_url($CFG->wwwroot.'/my/edit_store.php', array('id' => $id));
} else {
	$header = "$SITE->shortname: ".get_string('addstore');
	$heading_title = get_string('addstore');
	$url = new moodle_url($CFG->wwwroot.'/my/edit_store.php');
}
/*
$redirect_param = array();
if($searchquery) {
	$redirect_param['search'] = $searchquery;
} 
if($page) {
	$redirect_param['page'] = $page;
}
if($perpage) {
	$redirect_param['perpage'] = $perpage;
}*/

$redirecturl = new moodle_url($CFG->wwwroot.'/my/stores.php');

$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');

$userform = new edit_store_form();


if($id) {
	$storedata = $DB->get_record('cascade_region', array('id' => $id));
	if($storedata) {
		$editdata = new stdClass();
		$editdata->hid_id = $storedata->id;
		$editdata->hid_region = $storedata->region;
		$editdata->hid_country = $storedata->country;
		$editdata->hid_retailer = $storedata->retailer;
		$editdata->hid_store = $storedata->store;
		$editdata->region = $storedata->region;
		$editdata->country = $storedata->country;
		$editdata->retailer = $storedata->retailer;
		$editdata->store = $storedata->store;
		$userform->set_data($editdata);
		
		$get_user_id_list = $DB->get_records_sql("SELECT DISTINCT ( userid) FROM 
							(SELECT userid FROM {user_info_data} WHERE ( fieldid = 7 && data = '".mysql_real_escape_string($storedata->retailer)."' ) AND userid IN 
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 6 && data = '".mysql_real_escape_string($storedata->store)."' )) 
							AND userid IN 
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 2 && data = '".mysql_real_escape_string($storedata->region)."' ))) AS tmp 
							JOIN {user} u ON tmp.userid = u.id 
							JOIN {country} c ON BINARY u.`country` = BINARY c.`country_code` 
							WHERE  c.`country_name` LIKE '".mysql_real_escape_string($storedata->country)."'");
		
		if($get_user_id_list) {
			foreach($get_user_id_list as $key => $value) {
				$userIdLists[] = $value->userid;
			}
		} else {
			$userIdLists = array();
		}
	}
}

if ($userform->is_cancelled()) {
	// Redirect to somewhere if the user clicks cancel
	redirect($redirecturl);
}

if ($data = $userform->get_data()) {
	$data = $_REQUEST;
	if($data['hid_id']) {
		$dataobject = new stdClass();
		$dataobject->id = $data['hid_id'];
		$dataobject->region = $data['region'];
		$dataobject->country = $data['country'];
		if($data['retailer'] == 'other' || $data['retailer'] == 'editretailer' ) {
			$dataobject->retailer = $data['other_retailer'];
		} else {
			$dataobject->retailer = $data['retailer'];
		}
		$dataobject->store = $data['store'];

		$get_user_id = $DB->get_records_sql("SELECT DISTINCT ( userid) FROM 
							(SELECT userid FROM {user_info_data} WHERE ( fieldid = 7 && data = '".mysql_real_escape_string($data['hid_retailer'])."' ) AND userid IN 
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 6 && data = '".mysql_real_escape_string($data['hid_store'])."' )) 
							AND userid IN 
							(SELECT DISTINCT ( userid ) FROM   {user_info_data} WHERE  ( fieldid = 2 && data = '".mysql_real_escape_string($data['hid_region'])."' ))) AS tmp 
							JOIN {user} u ON tmp.userid = u.id 
							JOIN {country} c ON BINARY u.`country` = BINARY c.`country_code` 
							WHERE  c.`country_name` LIKE '".mysql_real_escape_string($data['hid_country'])."'");
		
		if($get_user_id) {
			foreach($get_user_id as $key => $value) {
				$userIdList[] = $value->userid;
			}
		} else {
			$userIdList = array();
		}

		try {
			$transaction = $DB->start_delegated_transaction();
			$update_cascade = $DB->update_record('cascade_region', $dataobject, $bulk=false);

			$master_retailer_edit_sql = 'UPDATE {cascade_region} SET retailer = "'.$dataobject->retailer.'" WHERE retailer = "' . $data['hid_retailer'] . '"';
			$DB->execute($master_retailer_edit_sql);

			if($userIdList) {
				$regionupdate = 1;
				$countryupdate = 1;
				$retailerupdate = 1;
				$storeupdate = 1;
				
				/*if($data['hid_region'] == $data['region']) {
					$regionupdate = 0;
				}
				if($data['hid_country'] == $data['country']) {
					$countryupdate = 0;
				}*/
				if($data['hid_retailer'] == $dataobject->retailer) {
					$retailerupdate = 0;
				}
				if($data['hid_store'] == $data['store']) {
					$storeupdate = 0;
				}
				
				$userIds = implode('","', $userIdList);
				if($retailerupdate) {
					$user_retailer_sql_query = 'UPDATE {user_info_data} SET data = "'.$dataobject->retailer.'" WHERE userid IN ("' . $userIds . '") AND fieldid = 7';
					$DB->execute($user_retailer_sql_query);

					//Also, update the retailers belonging to all users to work-around data inconsistency
					$master_users_retailer_edit_sql = 'UPDATE {user_info_data} SET data = "'.$dataobject->retailer.'" WHERE data = "' . $data['hid_retailer'] . '" AND fieldid = 7';
					$DB->execute($master_users_retailer_edit_sql);					
				}
				
				if($storeupdate) {
					$user_store_sql_query = 'UPDATE {user_info_data} SET data = "'.$data['store'].'" WHERE userid IN ("' . $userIds . '") AND fieldid = 6';
					$DB->execute($user_store_sql_query);
				}
			}
			$transaction->allow_commit();
			$error_sql = 0;
			} catch(Exception $e) {
				$transaction->rollback($e);
				$error_sql = 1;
			}
		
		//$last_id = $DB->insert_record('cascade_region', $dataobject, $returnid=true, $bulk=false);
		
	} else {
		$dataobject = new stdClass();
		$dataobject->region = $data['region'];
		$dataobject->country = $data['country'];
		if($data['retailer'] == 'other') {
			$dataobject->retailer = $data['other_retailer'];
		} else {
			$dataobject->retailer = $data['retailer'];
		}
		$dataobject->store = $data['store'];
		$last_id = $DB->insert_record('cascade_region', $dataobject, $returnid=true, $bulk=false);
		redirect($redirecturl);
	}
	if($error_sql == 0) {
		redirect($redirecturl, get_string('store_update_success', 'admin', count($userIdList)));
	} else {
		redirect($redirecturl, get_string("errorwhileupdatingstore"));
	}
}

$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();
?>
<script type="text/javascript" src="<?php echo $CFG->wwwroot;?>/my/js/jquery-1.9.1.min.js"></script>
<script>   
	$(document).ready(function() {
		$('#id_region').change(function() {
			$.ajax({
			  dataType: "json",
			  type: "POST",
			  url: "<?php echo $CFG->wwwroot;?>/my/ajax_get_details.php",
			  data: { type: "country", region: $(this).val() }
			})
			.done(function( res ) {
				if(res) {
					var options = '<option value=""><?php echo get_string('select_country', 'admin');?>...</option>';
					$.each( res, function( key, value ) {
					  if(value.country) {
						options += '<option value="'+value.country+'">'+value.country+'</option>';				  
					  }
					});
					$('#id_country').html(options);
				}
			});
		});
		
		$('#id_country').change(function() {
			var region_val = $('#id_region').val();
			$.ajax({
			  dataType: "json",
			  type: "POST",
			  url: "<?php echo $CFG->wwwroot;?>/my/ajax_get_details.php",
			  data: { type: "retailer", region: region_val, country: $(this).val() }
			})
			.done(function( res ) {
				if(res) {
					var options = '<option value=""><?php echo get_string('select_retailer', 'admin');?>...</option>';
					<?php if($id) { ?>
					options += '<option value="editretailer"><?php echo get_string('edit_retailer', 'admin');?></option>';
					<?php } else { ?>
					options += '<option value="other"><?php echo get_string('other', 'admin');?></option>';
					<?php } ?>
					$.each( res, function( key, value ) {
					  if(value.retailer) {
						options += '<option value="'+value.retailer+'">'+value.retailer+'</option>';				  
					  }
					});
					$('#id_retailer').html(options);
				}
			});
		});
		
		$('#id_retailer').change(function() {
			var retailer_val = $(this).val();
			if(retailer_val == "other" || retailer_val == "editretailer") {
				<?php if($id) { ?>
				var hid_retailer = $('input[name=hid_retailer]').val();
				$('#fitem_id_retailer .felement').append('<div class="other_retailer"><input style="width:300px" name="other_retailer" type="text" id="id_other_retailer" value="'+hid_retailer+'"></div>');
				<?php } else { ?>
				$('#fitem_id_retailer .felement').append('<div class="other_retailer"><input style="width:300px" name="other_retailer" type="text" id="id_other_retailer"></div>');
				<?php } ?>
			} else {
				$('.other_retailer').remove();
			}
		});
		
		$('#id_submitbutton').click(function() {
        var err_flag = 0;
        	if($('#id_region').val() == '') {
                err_flag = 1;
                $('#fitem_id_region .felement').append('<span id="id_error_region" class="error">&nbsp;&nbsp;<?php echo get_string('selectaregion');?></span>');
					return false;
            }
            if($('#id_country').val() == '') {
                err_flag = 1;
                $('#id_error_region').remove();
                $('#fitem_id_country .felement').append('<span id="id_error_country" class="error">&nbsp;&nbsp;<?php echo get_string('selectcountry');?></span>');
					return false;
            }
            if($('#id_retailer').val() == '') {
                err_flag = 1;
                $('#id_error_country').remove();
                $('#fitem_id_retailer .felement').append('<span id="id_error_retailer" class="error">&nbsp;&nbsp;<?php echo get_string('selectretailer');?></span>');
					return false;
            }
            if($('#id_store').val() == '') {
                err_flag = 1;
                $('#id_error_retailer').remove();
                $('#fitem_id_store .felement').append('<span id="id_error_store" class="error">&nbsp;&nbsp;<?php echo get_string('store');?></span>');
					return false;
            }
            if(err_flag == 0){
                $('#mform1').submit();
            }else{
              return false;
            }
            
			if($('#id_other_retailer').length > 0) {
				if($('#id_other_retailer').val() == '') {
					$('#id_error_retailer').remove();
					$('#fitem_id_retailer .felement').prepend('<span id="id_error_retailer" class="error"><?php echo get_string('enter_retailer', 'admin');?></span>');
					return false;
				} 
				else if($('#id_other_retailer').val().length > 256) {
					$('#id_error_retailer').remove();
					$('#fitem_id_retailer .felement').prepend('<span id="id_error_retailer" class="error"><?php echo get_string('retailercharlimit');?><br></span>');
					return false;
				}				
				else {
					$('#id_error_retailer').remove();
				}
			} 
			$('#id_region').removeAttr('disabled');
			$('#id_country').removeAttr('disabled');
			$('#id_retailer').removeAttr('disabled');
            
            /*
            var err_flag = 0;
            if($('#id_region').val() == '') {
               err_flag = 1;
                alert("Please select region");
                return false;
            }
            if($('#id_country').val() == ''){
               err_flag = 1;
                alert("Please select country");
                return false;
            }
            if($('#id_retailer').val() == ''){
               err_flag = 1;
                alert("Please select retailer");
                return false;
            }
            if($('#id_store').val() == ''){
                err_flag = 1;
                alert("Please enter store");
                return false;
            }
            
            if(err_flag == 0){
                $('#mform1').submit();
            }else{
              return false;
            }
            */
		});
		
		<?php if($id) { ?>
			var region = '<?php echo mb_convert_case(mb_convert_case(trim($storedata->region), MB_CASE_LOWER,"UTF-8"),MB_CASE_TITLE, "UTF-8"); ?>';
			var country = '<?php echo mb_convert_case(mb_convert_case(trim($storedata->country), MB_CASE_LOWER,"UTF-8"),MB_CASE_TITLE, "UTF-8"); ?>';
			var retailer = '<?php echo mb_convert_case(mb_convert_case(trim($storedata->retailer), MB_CASE_LOWER,"UTF-8"),MB_CASE_TITLE, "UTF-8"); ?>';
			$.ajax({
			  dataType: "json",
			  type: "POST",
			  url: "<?php echo $CFG->wwwroot;?>/my/ajax_get_details.php",
			  data: { type: "country_retailer", region:region, country:country }
			})
			.done(function( res ) {
				var options = '<option value=""><?php echo get_string('select_country', 'admin');?>...</option>';
				var options_retailer = '<option value=""><?php echo get_string('select_retailer', 'admin');?>...</option>';
				<?php if($id) { ?>
				options_retailer += '<option value="editretailer"><?php echo get_string('edit_retailer', 'admin');?></option>';
				<?php } else { ?>
				options_retailer += '<option value="other"><?php echo get_string('store_info_data_affected', 'admin');?></option>';
				<?php } ?>
				if(res) {
					$.each( res.country, function( key, value ) {
					  if(value.country) {
						options += '<option value="'+value.country+'">'+value.country+'</option>';				  
					  }
					});
					$.each( res.retailer, function( key, value ) {
					  if(value.retailer) {
						options_retailer += '<option value="'+value.retailer+'">'+value.retailer+'</option>';				  
					  }
					});
					$('#id_country').html(options);
					$("#id_country option[value='" + country + "']").attr('selected', true);
					$('#id_retailer').html(options_retailer);
					$("#id_retailer option[value='" + retailer + "']").attr('selected', true);
					$('#id_region').attr('disabled', 'disabled');
					$('#id_country').attr('disabled', 'disabled');
					//$('#id_retailer').attr('disabled', 'disabled');
				} 
			});
		<?php } ?>
	});
</script>
<?php
echo $OUTPUT->heading($heading_title);
echo $OUTPUT->box_start();
if($id) {
	if($userIdLists) {
		echo '<h5 style="text-align:center;">' . get_string('store_info_data_affected', 'admin', count($userIdLists)) . '</h5>';
	}
}
$userform->display();
echo $OUTPUT->box_end();
echo $OUTPUT->footer();
