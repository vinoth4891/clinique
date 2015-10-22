delimiter $$


drop procedure if exists `get_mdl_export`$$

create procedure `get_mdl_export`(
	v_searchstring  varchar(6000),
	v_sortby 	varchar(100),
	v_sortmode      varchar(100)
	
	
)
begin
	
	drop table if exists user_detail;
	drop table if exists  user_total;
	drop table  if exists user_total_sum;
	

	set v_searchstring = concat('~',v_searchstring,'~');
		
	set @s = 'CREATE TEMPORARY TABLE user_detail
		  (
		  INDEX my_index_name1(userid)
		  )
		 SELECT	u.id AS userid,
		        u.username,
			u.firstname,
			u.lastname,
			email,
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
	
	if v_searchstring <> ''
	then			
		set @s = concat(@s,"AND EXISTS (SELECT 'x' FROM mdl_quiz_attempts qt WHERE qt.userid = u.id AND INSTR('",v_searchstring,"',CONCAT('~',qt.id,'~') ) >=1) ");	
	end if;
		
	set @s = concat(@s,';');
	
	   
	prepare stmt from @s;
	execute stmt;
	deallocate prepare stmt;
	
	set @f = 'CREATE TEMPORARY TABLE user_total
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
		WHERE 	qa.state="finished" ';
	
	if v_searchstring <> ''
	then
				
		set @f = concat(@f,"AND INSTR('",v_searchstring,"',CONCAT('~',qa.id,'~') ) >=1 ");	
		
	end if;
	
	set @f  = concat(@f,'GROUP BY qa.userid,q.course,qa.quiz;');
	
	prepare stmt5 from @f;
	execute stmt5;
	deallocate prepare stmt5;
	
	create temporary table user_total_sum  
	(
	index my_index_name1(userid)
	)  
	select 	a.userid,
		sum(a.sumgrades) as total 
	from (select qa.userid, q.course, qa.quiz, max(qa.sumgrades) as sumgrades from mdl_quiz q
		inner join mdl_quiz_attempts qa on qa.quiz=q.id and qa.state="finished"
		where qa.userid in (select distinct userid from user_total) group by qa.userid,q.course,qa.quiz) a
	group by a.userid; 
	
	set @rowid := 0 ;               
             
        
	set @d = 'SELECT qtid 			    as id,
			 ud.userid                  as uid,
			 LTRIM(RTRIM(ud.firstname)) as firstname,
			 LTRIM(RTRIM(ud.lastname))  as lastname,
			 LTRIM(RTRIM(ud.jobtitle))  as jobtitle,
			 LTRIM(RTRIM(c.fullname))   as fullname,
			 ud.username                as username,
			 ud.email		    as email,
			 ud.country                 as country,
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
	
				    
	set @row_number:=0;
	set @recordcount:=0;
	
	set @c = 'SET @recordcount := ( SELECT MAX(@row_number:=@row_number+1)
		  FROM 	 user_detail ud 
		  INNER JOIN user_total ut ON ud.userid = ut.userid 
		  INNER JOIN user_total_sum tmp ON tmp.userid = ud.userid
		  INNER JOIN mdl_course c ON c.id = ut.courseid ';
		  
		  
	set @c = concat(@c,");");
	
		
	prepare stmt2 from @c;
	execute stmt2;
	deallocate prepare stmt2;
	
	if v_sortby = ''
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(ud.firstname)) ASC ");
	end if;
	if v_sortby = 'userid'
	then
		set @d = concat(@d,"order by ud.userid ",v_sortmode,'');
	end if;
	
	if v_sortby = 'firstname'
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(ud.firstname)) ",v_sortmode);
	end if;
	
	if v_sortby = 'lastname'
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(ud.lastname)) ",v_sortmode);
	end if;
	
	if v_sortby = 'country'
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(ud.country)) ",v_sortmode);
	end if;
	
	if v_sortby = 'jobtitle'
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(ud.jobtitle)) ",v_sortmode);
	end if;
	
	if v_sortby = 'fullname'
	then
		set @d = concat(@d,"order by LTRIM(RTRIM(c.fullname)) ",v_sortmode);
	end if;
	
	if v_sortby = 'points'
	then
		set @d = concat(@d,"order by ut.sumgrades ",v_sortmode);
	end if;
	
	if v_sortby = 'totalpoints'
	then
		set @d = concat(@d,"order by tmp.total ",v_sortmode);
	end if;
		
	set @d = concat(@d,';');
     
	prepare stmt1 from @d;
	execute stmt1;
	deallocate prepare stmt1;
    
	drop table user_detail;
	drop table user_total;
	drop table user_total_sum;
	
end$$

delimiter ;