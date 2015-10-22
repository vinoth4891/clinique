<?php
require_once('../../config.php');
require_once($CFG->libdir.'/adminlib.php');
$page = optional_param('page', 0, PARAM_INT);
$perpage = optional_param('perpage', 20, PARAM_INT);
admin_externalpage_setup('regionlist');
require_login();
if (!is_siteadmin()) {
    print_error('accessdenined', 'error');
}

$header = "$SITE->shortname: ".get_string('subadminregionlist');
$systemcontext = context_system::instance();
$url = new moodle_url('/admin/user/region_user_list.php', array('perpage' => $perpage, 'page' => $page));
$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');


$count = $DB->count_records_sql('SELECT COUNT(DISTINCT(userid)) AS cnt FROM {country_user}');
$start = $page * $perpage;
if ($start > $count) {
    $page = 0;
    $start = 0;
}
$results = $DB->get_records_sql('SELECT cu.userid, cu.region, cu.lang, cu.country, u.username, u.id, u.firstname, u.lastname, u.email FROM {country_user} cu JOIN {user} u ON cu.userid = u.id AND u.id <> 1 AND u.deleted <> 1', array(), $start, $perpage); // Start at result '$start' and return '$perpage' results.

//var_dump($results);

$table = new html_table();
$table->tablealign = 'center';
$table->width = '80%';
$table->head = array('Username', 'First name', 'Last name', 'Email', 'Region', 'Country', 'Languages', 'Action');

$i = 0;
foreach($results as $k => $v) {
	$tbl_data[$i][] = $v->username;
	$tbl_data[$i][] = $v->firstname;
	$tbl_data[$i][] = $v->lastname;
	$tbl_data[$i][] = $v->email;
	$tbl_data[$i][] = $v->region;
	$user_url = new moodle_url('/admin/user/add_region_user.php', array('id' => $v->userid));
	$arrcountry = explode(",",$v->country);
	$country_name_list = array();
	$country_name = $DB->get_records_sql("SELECT * FROM {country} WHERE country_code IN('".implode("','", $arrcountry)."')");
	foreach($country_name as $ke => $va) {
		$country_name_list[] = $va->country_name;
	}
	$tbl_data[$i][] = implode(",", $country_name_list);
	$tbl_data[$i][] = $v->lang;
	$tbl_data[$i][] = '<a href="'.$user_url.'">'.get_string('edit').'</a>';
	$i++;
}

$table->data = $tbl_data;

$add_url = new moodle_url('/admin/user/add_region_user.php');

$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();?>
<script type="text/javascript" src="<?php echo $CFG->wwwroot;?>/my/js/jquery-1.9.1.min.js"></script>
<script type="text/javascript">
$(document).ready(function() {
	setFixedScrollBar();
});

$( window ).resize(function() {
	setFixedScrollBar();
});
function setFixedScrollBar(){
	$('#subadmin-user-list').css({
		'height' : ($(window).height() - 200) + 'px',
		'overflow-x' : 'scroll'
	});	
}
</script>
<?php echo $OUTPUT->heading(get_string('subadminregionlist'));
echo $OUTPUT->heading('<a href="'.$add_url.'">'.get_string('assignnewsubadmin').'</a>');
echo '<div id="subadmin-user-list">';
echo html_writer::table($table);
echo '</div>';
echo $OUTPUT->paging_bar($count, $page, $perpage, $url);
echo $OUTPUT->footer();
