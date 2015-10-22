DELIMITER $$

DROP PROCEDURE IF EXISTS `master_data`$$

CREATE PROCEDURE `master_data`(
    v_field        VARCHAR(50),
	v_region       VARCHAR(6000),
	v_country      VARCHAR(6000),
	v_retailer     VARCHAR(6000),	
        v_store        VARCHAR(6000)
)
BEGIN
        SET @str1='SELECT region, country, retailer, store FROM mdl_cascade_region where 1=1 ';
	
	SET @str2='SELECT  region.data AS region, c.country_name AS country,
			       retailer.data AS retailer,
			       store.data AS store
			FROM mdl_user u
			LEFT JOIN mdl_user_info_data store ON u.id = store.userid
			AND store.fieldid = 6
			LEFT JOIN mdl_user_info_data retailer ON u.id = retailer.userid
			AND retailer.fieldid = 7
			LEFT JOIN mdl_user_info_data region ON u.id = region.userid
			AND region.fieldid = 2
			LEFT JOIN mdl_country c ON BINARY u.country = c.country_code
			WHERE u.id <> 2
			AND u.id <> 1
			AND u.deleted <> 1
			AND region.data IS NOT NULL ';
	
	IF v_region <> ''
	THEN
	   SET @str1 = CONCAT(@str1," AND region IN ('",REPLACE(v_region,"~","','"),"')");
	   /*SET @str2 = CONCAT(@str2," AND region.data ='",v_region,"'");*/
	    SET @str2 = CONCAT(@str2," AND region.data IN('",REPLACE(v_region,"~","','"),"')");
	END IF;
	
	
	IF v_country <> ''
	THEN
	   SET @str1 = CONCAT(@str1," AND country IN ('",REPLACE(v_country,"~","','"),"')");
	   SET @str2 = CONCAT(@str2," AND c.country_name IN ('",REPLACE(v_country,"~","','"),"')");
	END IF;
	
	IF v_retailer <> ''
	THEN
	   SET @str1 = CONCAT(@str1," AND retailer IN ('",REPLACE(v_retailer,"~","','"),"')");
	   SET @str2 = CONCAT(@str2," AND retailer.data IN ('",REPLACE(v_retailer,"~","','"),"')");
	END IF;
	
	IF v_store <> ''
	THEN
	   SET @str1 = CONCAT(@str1," AND store IN ('",REPLACE(v_store,"~","','"),"')");
	   SET @str2 = CONCAT(@str2," AND store.data IN ('",REPLACE(v_store,"~","','"),"')");
	END IF;
        
	     SET @str=CONCAT(@str1," UNION ",@str2,"");
	     SET @str3=CONCAT("SELECT DISTINCT ",v_field," FROM(");
	     SET @str=CONCAT(@str3,@str,")tmp WHERE ",v_field,"<>'' ORDER BY ",v_field);
/*SELECT	@str;*/
	PREPARE stmt FROM @str;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
    END$$

DELIMITER ;