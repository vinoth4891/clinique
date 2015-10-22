<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');
require_once($CFG->libdir.'/enrollib.php');
require_once('add_region_user_form.php');
admin_externalpage_setup('assignregions');
$subadminid  = optional_param('id', '', PARAM_RAW);
//$region = optional_param('region', '', PARAM_RAW);

require_login();
if (!is_siteadmin()) {
    print_error('accessdenined', 'error');
}

$header = "$SITE->shortname: ".get_string('assignnewsubadmin');
$systemcontext = context_system::instance();
if($subadminid) {
	$url = new moodle_url('/admin/user/add_region_user.php', array('id' => $subadminid));
} else {
	$url = new moodle_url('/admin/user/add_region_user.php');
}
$redirecturl = new moodle_url('/admin/user/region_user_list.php');
$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');

$userform = new region_user_form();


if($subadminid) {
	$user_country = $DB->get_record('country_user', array('userid' => $subadminid));
	if($user_country) {
		$editdata = new stdClass();
		$editdata->subadmin = $subadminid;
		$editdata->region = $user_country->region;
		$arrcountry = explode(",", $user_country->country);
		$country_name = $DB->get_records_sql("SELECT * FROM {country} WHERE country_code IN('".implode("','", $arrcountry)."')");
		foreach($country_name as $ke => $va) {
			$assign_countries[$va->country_code] = $va->country_name;
		}
		$sUserAssignCoun = json_encode($assign_countries);

		$all_languages = get_string_manager()->get_list_of_translations();
		$langs = explode(",", $user_country->lang);
		if($langs) {
			foreach($langs as $la) {
				$aUserAssignLang[$la] = $all_languages[$la];
			}
		}
		$sUserAssignLang = json_encode($aUserAssignLang);

		//$editdata->country = explode(",", $user_country->country);
		//$editdata->lang = explode(",", $user_country->lang);
		$userform->set_data($editdata);
	}
}

if ($userform->is_cancelled()) {
	// Redirect to somewhere if the user clicks cancel
	redirect($redirecturl);
}

if ($data = $userform->get_data()) {
		$data = $_REQUEST;
		$DB->delete_records('country_user', array('userid' => $data['subadmin']));
		
		$subadminrole = $DB->get_record('role', array('shortname' => 'subadmin'));
		$studentrole = $DB->get_record('role', array('shortname' => 'student'));
		
		/*$enrols = enrol_get_plugins(true);
		$enrolinstances = enrol_get_instances($courseid, true);
		$unenrolled = false;
		foreach ($enrolinstances as $instance) {
			if (!$unenrolled and $enrols[$instance->enrol]->allow_unenrol($instance)) {
				$unenrolinstance = $instance;
				$unenrolled = true;
			}
		}*/
		
		$get_all_cat = $DB->get_records('course_categories');
		
		foreach($get_all_cat as $get_k => $get_v) {
			//unenrol the user in every course he's in
			$enrolledusercourses = enrol_get_users_courses($data['subadmin'], $get_v->id, '');
			foreach ($enrolledusercourses as $kk => $user_en_course_list) {			
				//unenrol the user
				$enrol = enrol_get_plugin('manual');
				//echo ($user_en_course_list->id);
				$en_instances = $DB->get_records('enrol', array('enrol'=>'manual', 'courseid'=> $user_en_course_list->id, 'status'=>ENROL_INSTANCE_ENABLED), 'sortorder,id ASC');
				$en_instance = reset($en_instances);
				if($en_instance) {
					$enrol->unenrol_user($en_instance, $data['subadmin'], $subadminrole->id);
					$enrol->unenrol_user($en_instance, $data['subadmin'], $studentrole->id);
				}
			}		
		}
		//exit;
		$languages = implode("','", $_REQUEST['lang_list']);
		$course_id = '';
		$get_course_list = $DB->get_records_sql("SELECT *, e.courseid FROM {cohort} c JOIN {enrol} e ON e.customint1 = c.id WHERE idnumber IN ('".$languages."') AND e.enrol = 'cohort'");
		if($get_course_list) {
			foreach($get_course_list as $k => $val) {
				$course_id = $val->courseid;
				//enrol_manual_plugin::enrol_user($instance, $data['subadmin'], $roleid = 12);		
				$enrol = enrol_get_plugin('manual');
				if($enrol) {		
					$instances = $DB->get_records('enrol', array('enrol'=>'manual', 'courseid'=> $course_id, 'status'=>ENROL_INSTANCE_ENABLED), 'sortorder,id ASC');
					if($instances) {
						$instance = reset($instances);
						$enrol->enrol_user($instance, $userid = $data['subadmin'], $roleid = 12);
					}
				}
			}
		}
		
	if($data['country']) {
		$dataobject = new stdClass();
		$dataobject->userid = $data['subadmin'];
		$dataobject->region = $data['region'];
		$dataobject->country = implode(",", $data['country']);
		$dataobject->lang = implode(",", $data['lang_list']);
		$last_id = $DB->insert_record('country_user', $dataobject, $returnid=true, $bulk=false);
	}
	if($last_id) {
		redirect($redirecturl);
	}
}

$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();
?>
<script type="text/javascript" src="<?php echo $CFG->wwwroot;?>/my/js/jquery-1.9.1.min.js"></script>
<script>
	$(document).ready(function() {
		
		$('#fitem_id_country .felement').append('<span>&nbsp;&nbsp;<a href="javascript:void(0);" id="add_country"><< add</a>&nbsp;&nbsp;</span><span><a href="javascript:void(0);" id="remove_country">remove >></a>&nbsp;&nbsp;</span><select name="country_list[]" multiple="multiple" id="id_country_list" style="width:220px;"><option value="" disabled="disabled">Select Country</option></select>');		
		$('<select name="lang_list[]" style="width:220px;" multiple="multiple" id="id_lang_list"><option value="" disabled="disabled">Added Languages</option></select><span>&nbsp;&nbsp;<a href="javascript:void(0);" id="add_lang"><< add</a>&nbsp;&nbsp;</span><span><a href="javascript:void(0);" id="remove_lang">remove >></a>&nbsp;&nbsp;</span>').insertBefore( "#id_lang");		
		
		$('#add_country').on('click', function() {
			return !$('#id_country_list option:selected').remove().appendTo('#id_country');
		});
		
		$('#remove_country').on('click', function() {
			if(!$('#id_country option:selected').remove().appendTo('#id_country_list')) {
				return true;
			}
		});
		 
		$('#add_lang').on('click', function() {
			return !$('#id_lang option:selected').remove().appendTo('#id_lang_list');
		});
		$('#remove_lang').on('click', function() {
			return !$('#id_lang_list option:selected').remove().appendTo('#id_lang');
		});
		
		
		$('#id_region').change(function() {
			$('#id_country').empty().append('<option value="">Added country...</option>').find('option:first').attr("disabled","disabled");
			$.ajax({
			  dataType: "json",
			  type: "POST",
			  url: "<?php echo $CFG->wwwroot;?>/admin/user/ajax_get_country.php",
			  data: { type: "country", region: $(this).val() }
			})
			.done(function( res ) {
				//var options = '<option value="">Select a country...</option>';
				var options = '';
				if(res) {
					$.each( res, function( key, value ) {
					  if(value.country) {
						options += '<option value="'+value.code+'">'+value.country+'</option>';				  
					  } else if(value.country == null) {
						options += '<option value="">Select a region first...</option>';	
					  }
					});
				} 
				$('#id_country_list').html(options);
				<?php if($subadminid) { ?>
					<?php if($sUserAssignCoun) { ?>
					var country_val = <?php echo $sUserAssignCoun;?>;
					<?php } else { ?>
					var country_val = '';
					<?php } if($sUserAssignLang) { ?>
					var lang_val = <?php echo $sUserAssignLang;?>;
					<?php } else { ?>
					var lang_val = '';
					<?php } ?>
					if(country_val) {
						$.each(country_val, function(i,e){
							 $("#id_country").append("<option value='" + i + "'>" + e.toUpperCase() + "</option>");
							 $("#id_country_list option[value='" + i + "']").remove();
							 $("#id_country option[value='" + i + "']").attr('selected', true);
						});
					}
					
					if(lang_val) {
						$.each(lang_val, function(i,e){
							 $("#id_lang_list").append("<option value='" + i + "'>" + e + "</option>");
							 $("#id_lang option[value='" + i + "']").remove();
							 $("#id_lang_list option[value='" + i + "']").attr('selected', true);
						});
					}
					
					/*$.each(country_val.split(","), function(i,e){
						 $("#id_country").append("<option value='" + e + "'>" + e + "</option>");
						 $("#id_country option[value='" + e + "']").attr('selected', true);
					});
					
					$.each(values.split(","), function(i,e){
						$("#id_country option[value='" + e + "']").attr('selected', true);
					});
					$("#id_country").scrollTop($("#id_country").find("option[value="+e+"]").offset().top);*/
				<?php } ?>
			});
		});
		
		$('#id_submitbutton').click(function() {
			var subadmin_id = $('#id_subadmin').val();
			var id_region = $('#id_region').val();
			var flag_subadmin = 0;
			var flag_region = 0;
			var flag_country = 0;
			var flag_lang = 0;
			if(subadmin_id == '') {
				$('#id_error_subadmin').remove();
				$('#fitem_id_subadmin .felement').prepend('<span id="id_error_subadmin" class="error"> Select a Subadmin<br></span>');
				flag_subadmin = 1;
			}
			if(id_region == '') {
				$('#id_error_region').remove();
				$('#fitem_id_region .felement').prepend('<span id="id_error_region" class="error"> Select a region<br></span>');
				flag_region = 1;
			}	
			if (!$('#id_country').val()) {
				$('#id_error_country').remove();
				$('#fitem_id_country .felement').prepend('<span id="id_error_country" class="error"> Select a Country<br></span>');
				flag_country = 1;
			}
			if (!$('#id_lang_list').val()) {
				$('#id_error_lang').remove();
				$('#fitem_id_lang .felement').prepend('<span id="id_error_lang" class="error"> Select a Language<br></span>');
				flag_lang = 1;
			}

			if(flag_region == 1 || flag_subadmin == 1 || flag_country == 1 || flag_lang == 1) {
				return false;
			} else if(flag_region == 0) {
				$('#id_error_region').remove();
			} else if(flag_subadmin == 0) {
				$('#id_error_subadmin').remove();
			}

			$('#id_lang_list option').each(function(i) {
				if(i) {
					$(this).attr("selected", true);
				}
			});
			$('#id_country option').each(function(i) {
				if(i) {
					$(this).attr("selected", true);
				}
			});		 
		});
		
		<?php if($subadminid || $_POST) { ?>
			$('#id_region').trigger("change");
		<?php } ?>
	});
</script>
<?php
echo $OUTPUT->heading(get_string('assignnewsubadmin'));
$userform->display();
echo $OUTPUT->footer();
