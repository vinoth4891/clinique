<?php

require_once('response.php');  

global $CFG;


class ProgressPercent {



    public function __analyseCSV($csv) {

        global $CFG, $DB;
		
         header('Content-Type: application/csv');
         header('Content-Disposition: attachment; filename="table.csv"');
         $csv = urldecode($_GET['csv']);
         echo $csv;        
    }

} 