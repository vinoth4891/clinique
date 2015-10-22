<?php

require_once('../config.php');

class Logout {

    function __logout() {
        $authsequence = get_enabled_auth_plugins(); // auths, in sequence
        foreach ($authsequence as $authname) {
            $authplugin = get_auth_plugin($authname);
            $authplugin->logoutpage_hook();
        }

        require_logout();
    }

}
