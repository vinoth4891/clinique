<?php 

defined('MOODLE_INTERNAL') || die();

$handlers = array (
    'user_created' => array (
        'handlerfile'      => '/local/newuser/lib.php',
        'handlerfunction'  => 'local_newuser_user_created',
        'schedule'         => 'instant',
    ),
);