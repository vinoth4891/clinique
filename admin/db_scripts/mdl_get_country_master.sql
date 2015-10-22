DELIMITER $$

DROP PROCEDURE IF EXISTS `mdl_get_country_master`$$
create procedure `mdl_get_country_master`(
	IN v_region VARCHAR(6000)
)
BEGIN
	SET @str = CONCAT('select distinct upper(cr.country) as countery, c.country_code as code
	from mdl_cascade_region cr 
	inner join mdl_country c on c.country_name = cr.country where ', case when v_region = "%" then ' ' else concat(' cr.region in ("',replace(v_region,'~','","'),'") and ') end,' length(cr.country)>0 order by cr.country asc');
	
	PREPARE stmt FROM @str;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
	
END$$

DELIMITER ;