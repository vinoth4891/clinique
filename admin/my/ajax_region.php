<?php
require_once('../config.php');
require_once($CFG->dirroot.'/lib/formslib.php');

$regionrecord = $DB->get_record('regionkey', array('region'=> trim($_REQUEST['region'])));

echo $regionkey = $regionrecord->regionkey;
?>