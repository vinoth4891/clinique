<?php
class theme_formal_white_core_renderer extends core_renderer {
	public function navbar() {
		global $CFG;
        $items = $this->page->navbar->get_items();
		/* Added for subadmin */
		$context = get_context_instance (CONTEXT_SYSTEM);
		$roles = get_user_roles($context, $USER->id, false);
		$role = key($roles);
		$rolename = $roles[$role]->shortname;
		
        $htmlblocks = array();
        // Iterate the navarray and display each node
        $itemcount = count($items);
        $separator = get_separator();
        for ($i=0;$i < $itemcount;$i++) {
            $item = $items[$i];
            $item->hideicon = true;
            if ($i===0) {
				if($rolename == 'subadmin') {
					$item->action = new moodle_url($CFG->wwwroot.'/my/');
				}
                $content = html_writer::tag('li', $this->render($item));
            } else {
                $content = html_writer::tag('li', $separator.$this->render($item));
            }
            $htmlblocks[] = $content;
        }

        //accessibility: heading for navbar list  (MDL-20446)
        $navbarcontent = html_writer::tag('span', get_string('pagepath'), array('class'=>'accesshide'));
        $navbarcontent .= html_writer::tag('ul', join('', $htmlblocks), array('role'=>'navigation'));
        // XHTML
        return $navbarcontent;
    }
}
?>