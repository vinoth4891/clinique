<?php

require_once('response.php');

class ProgressPercent {

	public function __analyseReports($type, $retailer, $store, $region, $country, $course, $team, $limit_start, $limit_end, $sortBy) {

		global $CFG, $DB, $SESSION;

		$response = new CliniqueServiceResponce();

		if ($type == 'user' || $type == 'course') {
			if (in_array("sel_all", $region)) {
				$regionstr = '';
			} else {
				$regionstr = implode('~', $region);
			}

			if (in_array("sel_all", $country)) {
				$countrystr = '';
			} else {
				$countrystr = implode('~', $country);
			}

			if (in_array("sel_all", $retailer)) {
				$retailerstr = '';
			} else {
				$retailerstr = implode('~', $retailer);
			}

			if (in_array("sel_all", $store)) {
				$storestr = '';
			} else {
				$storestr = implode('~', $store);
			}

			if (in_array("sel_all", $course)) {
				$coursestr = '';
			} else {
				$coursestr = implode('~', $course);
			}

			if (empty($limit_start)) {
				$limit_start = 0;
			}
			if (empty($limit_end)) {
				$limit_end = 20;
			}

			if (empty($sortBy)) {
				$sortBy = 'firstname';
				$sortMode = 'ASC';
			} else {
				list($sortBy, $sortMode) = explode(' ', $sortBy);
			}
			$reportsArray = array();
			/*
				CALL get_mdl_reports_dtl
				(
				@v_region := '',
				@v_country := '',
				@v_retailer	:= '',
				@v_store := '',
				@v_course := '',
				@v_username := 'mieko~whyunwha',
				@v_email    := 'terasima.ibuki@rainbow.plala.or.jp~whyunwhaya@nate.com',
				@v_sortby := 'lastname',
				@v_sortmode     := 'desc',
				@v_offset := '0',
				@v_limit := '25'
				)
			*/
			$reportsSPCall = "CALL get_mdl_reports_dtl ('$regionstr','$countrystr','$retailerstr','$storestr','$coursestr', "
					. "'$sortBy', '$sortMode', '$limit_start', '$limit_end')";
			$reportsDetails = $DB->get_records_sp($reportsSPCall);
			$SESSION->reports_current_page = $reportsDetails;
			$reportsArray['data'] = $reportsDetails;
			$firstrow = array_shift(array_values($reportsDetails));
			if (!empty($firstrow->recordcount)) {
				$reportsArray['totalcount'] = $firstrow->recordcount;
			} else {
				$reportsArray['totalcount'] = 0;
			}
		}
		if (!empty($reportsArray['data'])) {
			$response->response(false, 'done', $reportsArray);
		} else {
			$response->response(true, 'No Records');
		}
	}

	public function __searchReports($fields, $keyword, $limit_start, $limit_end, $sortBy) {
		global $CFG, $DB, $SESSION;

		if (empty($limit_start)) {
			$limit_start = 0;
		}
		if (empty($limit_end)) {
			$limit_end = 20;
		}

		if (empty($sortBy)) {
			$sortBy = 'firstname';
			$sortMode = 'ASC';
		} else {
			list($sortBy, $sortMode) = explode(' ', $sortBy);
		}

		$reportsArray = array();

		$coursekey = array_search('fullname', $fields);
		if( ! is_bool($coursekey))
			$fields[$coursekey] = 'course';

		$fieldstilde = implode('~', $fields);
		/*
			CALL get_mdl_reports_dtl
			(
			@v_region := '',
			@v_country := '',
			@v_retailer	:= '',
			@v_store := '',
			@v_course := '',
			@v_username := 'mieko~whyunwha',
			@v_email    := 'terasima.ibuki@rainbow.plala.or.jp~whyunwhaya@nate.com',
			@v_sortby := 'lastname',
			@v_sortmode     := 'desc',
			@v_offset := '0',
			@v_limit := '25'
			)
		*/
		$reportsSPCall = "CALL get_mdl_reports_search ('$keyword','$fieldstilde',"
				. "'$sortBy', '$sortMode', '$limit_start', '$limit_end')";
		$reportsDetails = $DB->get_records_sp($reportsSPCall);
		$SESSION->reports_current_page = $reportsDetails;
		$reportsArray['data'] = $reportsDetails;
		$firstrow = array_shift(array_values($reportsDetails));
		if (!empty($firstrow->recordcount)) {
			$reportsArray['totalcount'] = $firstrow->recordcount;
		} else {
			$reportsArray['totalcount'] = 0;
		}

        $response = new CliniqueServiceResponce();
		if(!empty($reportsDetails)){
			$response->response(false, 'done', $reportsArray);
		} else{
			$response->response(true, 'No Records');
		}
	}

}
