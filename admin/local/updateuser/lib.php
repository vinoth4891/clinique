<?php

defined('MOODLE_INTERNAL') || die();

function local_user_updated($user) {
    global $DB;

    // Custom fields.
    $sql = "SELECT f.id, f.shortname, d.data
            FROM {user_info_field} f
            LEFT JOIN {user_info_data} d ON d.fieldid = f.id AND d.userid = :userid";
    $customfields = $DB->get_records_sql($sql, array('userid' => $user->id));
	$cascade_data = new stdClass;
	$country = $DB->get_record('country', array('country_code' => $user->country));
	$cascade_data->country = $country->country_name;
    foreach ($customfields as $customfield) {
		switch($customfield->shortname){
			case 'region':
				$cascade_data->region = $customfield->data;
			break;
			case 'store':
				$cascade_data->store = $customfield->data;
			break;
			case 'retailer':
				$cascade_data->retailer = $customfield->data;
			break;
		}
    }

	$geo = $DB->get_record('cascade_region', array(
		'region'=> $cascade_data->region,
		'country'=> $cascade_data->country,
		'retailer'=> $cascade_data->retailer,
		'store'=> $cascade_data->store,
	));

	if(empty($geo)) {
		$DB->insert_record('cascade_region', $cascade_data);
	}
    return true;
}

