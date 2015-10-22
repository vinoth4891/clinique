DELIMITER $$

DROP PROCEDURE IF EXISTS `get_mdl_reports_search`$$

CREATE PROCEDURE `get_mdl_reports_search`(
	v_searchstring  VARCHAR(6000),
	v_searchcolumn  VARCHAR(6000),
	v_sortby 	VARCHAR(100),
	v_sortmode      VARCHAR(100),
	v_offset 	VARCHAR(100),
	v_limit 	VARCHAR(100)
	
)
BEGIN
	
	DECLARE v_region 	INT ;
	DECLARE	v_country 	INT ;
	DECLARE	v_retailer 	INT ;
	DECLARE	v_store 	INT ;
	DECLARE	v_course 	INT ;
	DECLARE	v_username      INT ;
	DECLARE	v_email         INT ;
	DECLARE	v_firstname     INT ;
	DECLARE	v_lastname      INT ;
		
	SET v_region := 0;
	SET v_country := 0;
	SET v_retailer := 0;
	SET v_store := 0;	
	SET v_course := 0;
	SET v_username := 0; 
	SET v_email := 0;    
	SET v_firstname := 0;
	SET v_lastname := 0; 
	IF v_searchcolumn <> ''
	THEN
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'region') >= 1
		THEN
			SET v_region = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'country') >= 1
		THEN
			SET v_country = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'retailer') >= 1
		THEN
			SET v_retailer = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'store') >= 1
		THEN
			SET v_store = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'course') >= 1
		THEN
			SET v_course = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'username') >= 1
		THEN
			SET v_username = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'email') >= 1
		THEN
			SET v_email = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'firstname') >= 1
		THEN
			SET v_firstname = 1;
		END IF;
		
		IF INSTR(CONCAT('~',v_searchcolumn,'~'),'lastname') >= 1
		THEN
			SET v_lastname = 1;
		END IF;
	END IF;
	
	SET @s = 'CREATE TEMPORARY TABLE user_detail
		  (
		  INDEX my_index_name1(userid)
		  )
		 SELECT	u.id AS userid,
		        u.username,
			u.firstname,
			u.lastname,
			email,
			country,
			jobtitle.data AS jobtitle,
			region.data AS region, 
			retailer.data AS retailer,
			store.data AS store		
		   FROM	mdl_user u 
		   LEFT JOIN `mdl_user_info_data` jobtitle ON u.`id` = jobtitle.`userid`
		   AND 	jobtitle.`fieldid` = 3
		   LEFT JOIN `mdl_user_info_data` store ON u.`id` = store.`userid`
		   AND 	store.`fieldid` = 6
		   LEFT JOIN `mdl_user_info_data` retailer ON u.`id` = retailer.`userid`
		   AND 	retailer.`fieldid` = 7
		   LEFT JOIN `mdl_user_info_data` region ON u.`id` = region.`userid`
		   AND 	region.`fieldid` = 2
		   WHERE u.id NOT IN (1,2)
		   AND u.deleted = 0 ';
		 
	
	
		
	SET @s = CONCAT(@s,';');
	
	   
	PREPARE stmt FROM @s;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
	
	CREATE TEMPORARY TABLE user_total
	(
	INDEX my_index_name1(userid)
	)
	SELECT	q.id AS qid,
		q.course AS courseid,
		qa.userid AS userid,
		qa.id  AS qtid, 
		MAX(qa.sumgrades) AS sumgrades
	FROM 	mdl_quiz q
	INNER JOIN mdl_quiz_attempts qa ON qa.quiz=q.id
	WHERE 	qa.state="finished"  
	GROUP BY qa.userid,
		 q.course,
		 qa.quiz;
	
	CREATE TEMPORARY TABLE user_total_sum  
	(
	INDEX my_index_name1(userid)
	)  
	SELECT 	userid,
		SUM(sumgrades) AS total 
	FROM 	user_total 
	GROUP BY userid; 
	
	SET @rowid := 0 ;               
                     
	SET @d = 'SELECT qtid 			    as id,
			 ud.userid                  as uid,
			 LTRIM(RTRIM(ud.firstname)) as firstname,
			 LTRIM(RTRIM(ud.lastname))  as lastname,
			 LTRIM(RTRIM(ud.jobtitle))  as jobtitle,
			 LTRIM(RTRIM(c.fullname))   as fullname,
			 mc.country_name            as country,
			 ud.username                as username,
			 ud.email		    as email,
			 ud.store                   as store,
			 ud.region                  as region,
			 ud.retailer                as retailer,
			 round(ut.sumgrades) 	    as points,
			 round(tmp.total)           as totalpoints,
			 @recordcount               as recordcount
		    FROM user_detail ud 
		    INNER JOIN user_total ut ON ud.userid = ut.userid 
		    INNER JOIN user_total_sum tmp ON tmp.userid = ud.userid
	            INNER JOIN mdl_course c ON c.id = ut.courseid 
	            INNER JOIN mdl_country mc ON binary mc.country_code = ud.country ';
	
	IF v_searchcolumn <> ''
	THEN
		SET @d = CONCAT(
				@d,"AND CONCAT(",
				"'~'",
				CASE WHEN v_region = 1 		THEN ",ud.region" 	ELSE "" END,",'~'",
				CASE WHEN v_country = 1 	THEN ",mc.country_name" ELSE "" END,",'~'",
				CASE WHEN v_retailer = 1 	THEN ",ud.retailer"     ELSE "" END,",'~'",
				CASE WHEN v_store = 1 		THEN ",ud.store"    	ELSE "" END,",'~'",
				CASE WHEN v_username = 1 	THEN ",ud.username"    	ELSE "" END,",'~'",
				CASE WHEN v_email = 1 		THEN ",ud.email"    	ELSE "" END,",'~'",
				CASE WHEN v_firstname = 1 	THEN ",ud.firstname"    ELSE "" END,",'~'",
				CASE WHEN v_lastname = 1 	THEN ",ud.lastname"    	ELSE "" END,",'~'",
				CASE WHEN v_course = 1 		THEN ",c.fullname"    	ELSE "" END,",'~'",
				") ",
				"Like '%",v_searchstring,"%'"
				
			       );
	END IF;	
			    
	SET @row_number:=0;
	SET @recordcount:=0;
	
	SET @c = 'SET @recordcount := ( SELECT MAX(@row_number:=@row_number+1)
		  FROM 	 user_detail ud 
		  INNER JOIN user_total ut ON ud.userid = ut.userid 
		  INNER JOIN user_total_sum tmp ON tmp.userid = ud.userid
		  INNER JOIN mdl_course c ON c.id = ut.courseid 
		  INNER JOIN mdl_country mc ON binary mc.country_code = ud.country ';
		  
	IF v_searchcolumn <> ''
	THEN
		SET @c = CONCAT(
				@c,"AND CONCAT(",
				"'~'",
				CASE WHEN v_region = 1 		THEN ",ud.region" 	ELSE "" END,",'~'",
				CASE WHEN v_country = 1 	THEN ",mc.country_name"    	ELSE "" END,",'~'",
				CASE WHEN v_retailer = 1 	THEN ",ud.retailer"     ELSE "" END,",'~'",
				CASE WHEN v_store = 1 		THEN ",ud.store"    	ELSE "" END,",'~'",
				CASE WHEN v_username = 1 	THEN ",ud.username"    	ELSE "" END,",'~'",
				CASE WHEN v_email = 1 		THEN ",ud.email"    	ELSE "" END,",'~'",
				CASE WHEN v_firstname = 1 	THEN ",ud.firstname"    ELSE "" END,",'~'",
				CASE WHEN v_lastname = 1 	THEN ",ud.lastname"    	ELSE "" END,",'~'",
				CASE WHEN v_course = 1 		THEN ",c.fullname"    	ELSE "" END,",'~'",
				") ",
				"Like '%",v_searchstring,"%'"
				
			       );
	END IF;	
		  
	SET @c = CONCAT(@c,");");
	
	
		
	PREPARE stmt2 FROM @c;
	EXECUTE stmt2;
	DEALLOCATE PREPARE stmt2;
	
	IF v_sortby = ''
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(ud.firstname)) ASC ");
	END IF;
	IF v_sortby = 'userid'
	THEN
		SET @d = CONCAT(@d,"order by ud.userid ",v_sortmode,'');
	END IF;
	
	IF v_sortby = 'firstname'
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(ud.firstname)) ",v_sortmode);
	END IF;
	
	IF v_sortby = 'lastname'
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(ud.lastname)) ",v_sortmode);
	END IF;
	
	IF v_sortby = 'country'
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(ud.country)) ",v_sortmode);
	END IF;
	
	IF v_sortby = 'jobtitle'
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(ud.jobtitle)) ",v_sortmode);
	END IF;
	
	IF v_sortby = 'fullname'
	THEN
		SET @d = CONCAT(@d,"order by LTRIM(RTRIM(c.fullname)) ",v_sortmode);
	END IF;
	
	IF v_sortby = 'points'
	THEN
		SET @d = CONCAT(@d,"order by ut.sumgrades ",v_sortmode);
	END IF;
	
	IF v_sortby = 'totalpoints'
	THEN
		SET @d = CONCAT(@d,"order by tmp.total ",v_sortmode);
	END IF;
	
	IF v_offset <> '' AND  v_limit <> ''
	THEN
		SET @d = CONCAT(@d," LIMIT ",v_offset,',',v_limit);
	END IF;
	
	SET @d = CONCAT(@d,';');
	PREPARE stmt1 FROM @d;
	EXECUTE stmt1;
	DEALLOCATE PREPARE stmt1;
    
	DROP TABLE user_detail;
	DROP TABLE user_total;
	DROP TABLE user_total_sum;
	
END$$

DELIMITER ;