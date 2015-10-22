<?php
$ADMIN->add('store', new admin_externalpage('stores', new lang_string('stores', 'admin'), "$CFG->wwwroot/my/stores.php", array('moodle/role:assign', 'moodle/role:manage')));
$ADMIN->add('store', new admin_externalpage('addstore', new lang_string('addstore', 'admin'), "$CFG->wwwroot/my/edit_store.php", array('moodle/role:assign', 'moodle/role:manage')));