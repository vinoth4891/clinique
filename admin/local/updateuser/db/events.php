<?php 

defined('MOODLE_INTERNAL') || die();

$handlers = array (
    'user_updated' => array (
        'handlerfile'      => '/local/updateuser/lib.php',
        'handlerfunction'  => 'local_user_updated',
        'schedule'         => 'instant',
    ),
);