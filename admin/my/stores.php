<?php
require_once('../config.php');
require_once($CFG->libdir.'/adminlib.php');
$page        = optional_param('page', 0, PARAM_INT);
$perpage     = optional_param('perpage', 25, PARAM_INT);
$searchquery = optional_param('search', '', PARAM_RAW);
$searchretailer = optional_param('searchretailer', '', PARAM_RAW);
require_login();
admin_externalpage_setup('stores');
if ($searchquery) {
    $where = 'WHERE store LIKE "%' . $searchquery . '%"';
	$arrUrl['search'] = $searchquery;
} else if($searchretailer) {
	$where = 'WHERE retailer LIKE "%' . $searchretailer . '%"';
	$arrUrl['searchretailer'] = $searchretailer;
}
else {
    $where = '';
}

$header = "$SITE->shortname: " . get_string('stores');

$systemcontext = context_system::instance();
$arrUrl['perpage'] = $perpage;
$arrUrl['page'] = $page;

$url  = new moodle_url($CFG->wwwroot.'/my/stores.php', $arrUrl);
$PAGE->set_url($url);
$PAGE->set_context($systemcontext);
$PAGE->set_pagelayout('admin');

$count = $DB->count_records_sql('SELECT COUNT(id) AS cnt FROM {cascade_region} ' . $where);
$start = $page * $perpage;
if ($start > $count) {
    $page  = 0;
    $start = 0;
}

$results = $DB->get_records_sql('SELECT * FROM {cascade_region} ' . $where, array(), $start, $perpage); // Start at result '$start' and return '$perpage' results.

$table             = new html_table();
$table->tablealign = 'center';
$table->width      = '100%';
$table->head       = array(
	get_string('region', 'block'),
	get_string('country'),
	get_string('store_retailer', 'admin'),
	get_string('store_name', 'admin'),
	get_string('action'),
);

$i = 0;
if($results) {
	foreach ($results as $k => $v) {
		$tbl_data[$i][] = $v->region;
		$tbl_data[$i][] = $v->country;
		$tbl_data[$i][] = $v->retailer;
		$tbl_data[$i][] = $v->store;
		$edit_url = new moodle_url($CFG->wwwroot.'/my/edit_store.php', array('id'=> $v->id));
		$del_retail_url = new moodle_url($CFG->wwwroot.'/my/delete_retailer.php', array('id'=> $v->id));
		$del_url = new moodle_url($CFG->wwwroot.'/my/delete_store.php', array('id'=> $v->id));
		$tbl_data[$i][] = '<a href="'.$edit_url.'">' . get_string('edit') . '</a>&nbsp; <a href="'.$del_retail_url.'" onclick="return confirm(\''. get_string('store_delete_retailer_confirm', 'admin').'\')" >' . get_string('deleteretailer') . '</a>&nbsp; <a href="'.$del_url.'" onclick="return confirm(\'' . get_string('store_delete_confirm', 'admin') . '\')" >' . get_string('deletestore') . '</a>';
		$i++;
	}
} else {
	$row = new html_table_row();
	$cell = new html_table_cell();
	$cell->text = "No records found.";
	$cell->colspan = '5';
	$cell->style = 'text-align:center';
	$row->cells[] = $cell;
	$tbl_data[$i] = $row;
}

$table->data = $tbl_data;

$PAGE->set_title($header);
$PAGE->set_heading($header);
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('stores'));

// Add Retailer form.
$search_retailer = html_writer::start_tag('form', array(
    'id' => 'search_retailer',
    'method' => 'get'
));
$search_retailer .= html_writer::start_tag('div', array('style'=> 'float:right; padding: 5px;'));
$search_retailer .= html_writer::label(get_string('searchretailer')); // No : in form labels!
$search_retailer .= html_writer::empty_tag('input', array(
    'id' => 'searchretailer',
    'type' => 'text',
    'name' => 'searchretailer',
    'value' => $searchretailer
));
$search_retailer .= html_writer::empty_tag('input', array(
    'type' => 'submit',
    'value' => get_string('search')
));
$search_retailer .= html_writer::end_tag('div');
$search_retailer .= html_writer::end_tag('form');
echo $search_retailer;


// Add search form.
$search = html_writer::start_tag('form', array(
    'id' => 'searchquery',
    'method' => 'get'
));
$search .= html_writer::start_tag('div', array('style'=> 'float:right; padding: 5px;'));
$search .= html_writer::label(get_string('searchstore')."&nbsp;&nbsp;&nbsp;"); // No : in form labels!
$search .= html_writer::empty_tag('input', array(
    'id' => 'search_q',
    'type' => 'text',
    'name' => 'search',
    'value' => $searchquery
));
$search .= html_writer::empty_tag('input', array(
    'type' => 'submit',
    'value' => get_string('search')
));
$search .= html_writer::end_tag('div');
$search .= html_writer::end_tag('form');
echo $search;
$cleardiv = html_writer::start_tag('div', array('style'=> 'clear:both'));
$cleardiv .= html_writer::end_tag('div');
echo $cleardiv;
echo $OUTPUT->heading('<a href="'.$CFG->wwwroot.'/my/edit_store.php">'.get_string('addstore').'</a>');
echo html_writer::table($table);
echo $OUTPUT->paging_bar($count, $page, $perpage, $url);
echo $OUTPUT->footer();
