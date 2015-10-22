<?php

if (!defined('MOODLE_INTERNAL')) {
    die('Direct access to this script is forbidden.');    ///  It must be included from a Moodle page
}

require_once($CFG->libdir.'/formslib.php');

class region_user_form extends moodleform {

    function definition() {
		global $DB;
        $mform =& $this->_form;
        //$mform->addElement('header', 'general', get_string('selectsubadmin'));
		
		$get_subadmin_id = $DB->get_records_menu('role', $conditions = array('shortname' => 'subadmin'), $sort='', 'shortname, id');
		
		$get_users_list = $DB->get_records_sql("SELECT u.id, u.email, u.firstname, u.lastname  FROM {role_assignments} ra JOIN {context} c ON ra.contextid = c.id JOIN {user} u ON ra.userid = u.id WHERE ra.roleid = ".$get_subadmin_id['subadmin']);
		$option_subadmin[""] = get_string("select");
		foreach($get_users_list as $key => $value) {
			$userid = $value->id;
			$opt_val = $value->firstname." ".$value->lastname." (".$value->email.")";
			$option_subadmin[$userid] = $opt_val;
		}
		$attributes = array('style' => 'width:300px');
		$attributes_multi = array('style' => 'width:220px');
		$select = $mform->addElement('select', 'subadmin', get_string('selectsubadmin'), $option_subadmin, $attributes);
        $mform->addRule('subadmin', get_string('selectsubadmin'), 'required', null);
		
		$result = $DB->get_records_menu('region', $conditions = array(), $sort='', '*');
		$option = array('' => get_string('selectaregion').'...');
		foreach($result as $res) {
			$option[$res] = $res;
		}
		
		$select = $mform->addElement('select', 'region', get_string('selectregion'), $option, $attributes);
        $mform->addRule('region', get_string('selectaregion'), 'required', null);
		//$select->setMultiple(true);
		
		//$choices = get_string_manager()->get_list_of_countries();
		//$choices= array(''=>get_string('selectacountry').'...') + $choices;
		//$choices= array(''=>get_string('addedcountry').'...');
		$select_country = $mform->addElement('select', 'country', get_string('selectacountry'), array(), $attributes_multi);
		$select_country->addOption( get_string('addedcountry').'...', '', array( 'disabled' => 'disabled' ) );
		$mform->addRule('country', get_string('selectacountry'), 'required', null, 'client');
		/*if (!empty($CFG->country)) {
			$mform->setDefault('country', $CFG->country);
		}*/
		$select_country->setMultiple(true);
		
		$select = $mform->addElement('select', 'lang', get_string('preferredlanguage'), get_string_manager()->get_list_of_translations(), $attributes_multi);
		//$mform->addRule('lang', get_string('preferredlanguage'), 'required', null);
		$mform->setDefault('lang', $CFG->lang);
		$select->setMultiple(true);
		
        $this->add_action_buttons();
    }
}
