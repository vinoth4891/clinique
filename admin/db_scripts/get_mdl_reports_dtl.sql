DELIMITER $$

DROP PROCEDURE IF EXISTS `get_mdl_reports_dtl`$$

CREATE PROCEDURE `get_mdl_reports_dtl`(
	v_region 	VARCHAR(6000),
	v_country 	VARCHAR(6000),
	v_retailer 	VARCHAR(6000),
	v_store 	VARCHAR(6000),
	v_course 	VARCHAR(6000),
	v_sortby 	VARCHAR(100),
	v_sortmode     VARCHAR(100),
	v_offset 	VARCHAR(100),
	v_limit 	VARCHAR(100)
	
)
BEGIN
	SET @s = 'CREATE TEMPORARY TABLE user_detail
		  (
		  INDEX my_index_name1(userid)
		  )
		 SELECT	u.id AS userid,
		        u.username,
			u.firstname,
			u.lastname,
			email,
			c.country_code as country_code,
			c.country_name as country,
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
		   LEFT JOIN mdl_country c ON binary c.country_code = u.country
		   WHERE u.id NOT IN (1,2)
		   AND u.deleted = 0 ';
		   
	IF v_region <> ''
	THEN
		SET @s = CONCAT(@s,"AND INSTR (CONCAT('~','",v_region,"','~'),CONCAT('~',region.data,'~')) >= 1 ");
	END IF;
	IF v_retailer <> ''
	THEN
		SET @s = CONCAT(@s,"AND INSTR (CONCAT('~','",v_retailer,"','~'),CONCAT('~',retailer.data,'~')) >= 1 ");
	END IF;
      
	IF v_store <> ''
	THEN
		SET @s = CONCAT(@s,"AND INSTR (CONCAT('~','",v_store,"','~'),CONCAT('~',store.data,'~')) >= 1 ");
	END IF;
	IF v_country <> ''
	THEN
		SET @s = CONCAT(@s,"AND INSTR (CONCAT('~','",v_country,"','~'),CONCAT('~',c.country_code,'~')) >= 1 ");
	END IF;
	
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
			 ud.country                 as country,
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
	            INNER JOIN mdl_course c ON c.id = ut.courseid ';
 
 
	IF v_course <> ''
	THEN
		SET @d = CONCAT(@d,"AND INSTR (CONCAT('~','",v_course,"','~'),CONCAT('~',c.fullname,'~')) >= 1 ");
	END IF;
	
	SET @row_number:=0;
	SET @recordcount:=0;
	
	SET @c = 'SET @recordcount := ( SELECT MAX(@row_number:=@row_number+1)
		  FROM 	 user_detail ud 
		  INNER JOIN user_total ut ON ud.userid = ut.userid 
		  INNER JOIN user_total_sum tmp ON tmp.userid = ud.userid
		  INNER JOIN mdl_course c ON c.id = ut.courseid ';
	
	IF v_course <> ''
	THEN
		SET @c = CONCAT(@c,"AND INSTR (CONCAT('~','",v_course,"','~'),CONCAT('~',c.fullname,'~')) >= 1 ");
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