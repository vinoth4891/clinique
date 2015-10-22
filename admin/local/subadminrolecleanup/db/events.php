<?php 

defined('MOODLE_INTERNAL') || die();

$handlers = array (
    'role_unassigned' => array (
        'handlerfile'      => '/local/subadminrolecleanup/lib.php',
        'handlerfunction'  => 'local_on_role_unassigned',
        'schedule'         => 'instant',
    ),
);