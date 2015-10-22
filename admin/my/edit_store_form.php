<?php

if (!defined('MOODLE_INTERNAL')) {
    die('Direct access to this script is forbidden.');    ///  It must be included from a Moodle page
}

require_once($CFG->libdir.'/formslib.php');

class edit_store_form extends moodleform {

    function definition() {
		global $DB;
        $mform =& $this->_form;
        //$mform->addElement('header', 'general', get_string('selectsubadmin'));
		
		$attributes = array('style' => 'width:300px', 'maxlength' => 256);
		
		$result = $DB->get_records_sql('SELECT DISTINCT(region) FROM {cascade_region} WHERE region NOT IN ("TRAVEL RETAIL AMERICA") ORDER BY region ASC');
		$option = array('' => get_string('selectregion').'...');
		foreach($result as $key => $val) {
			if($val->region)
				$option[$val->region] = ucwords(strtolower($val->region));
		}
		
		$mform->addElement('hidden', 'hid_id');
		$mform->addElement('hidden', 'hid_region');
		$mform->addElement('hidden', 'hid_country');
		$mform->addElement('hidden', 'hid_retailer');
		$mform->addElement('hidden', 'hid_store');
		
		$option_country = array('' => get_string('selectcountry').'...');
		$option_retailer = array('' => get_string('selectretailer').'...');
		
		$select = $mform->addElement('select', 'region', get_string('selectregion'), $option, $attributes);
        $mform->addRule('region', get_string('selectaregion'), 'required', null);
		
		$select = $mform->addElement('select', 'country', get_string('selectcountry'), $option_country, $attributes);
        $mform->addRule('country', get_string('selectcountry'), 'required', null);
		
		$select = $mform->addElement('select', 'retailer', get_string('selectretailer'), $option_retailer, $attributes);
        $mform->addRule('retailer', get_string('selectretailer'), 'required', null);
        $mform->addRule('retailer', get_string('retailercharlimit'), 'maxlength', 256);
		
		$select = $mform->addElement('text', 'store', get_string('store'), $attributes);
        $mform->addRule('store', get_string('store'), 'required', null);
        $mform->addRule('store', get_string('storecharlimit'), 'maxlength', 256);

        $this->add_action_buttons();
    }
}
