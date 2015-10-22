delimiter $$
drop procedure if exists `mdl_get_retailer_master`$$
create procedure `mdl_get_retailer_master`(
	in v_region varchar(6000),
	in v_country varchar(6000)
)
begin
	set @str = concat('select distinct upper(retailer) as retailer
	from mdl_cascade_region 
	where ', case when v_region = "%" then ' ' else concat(' region in ("',replace(v_region,'~','","'),'") and ') end,'
		', case when v_country = "%" then ' ' else concat(' country in ("',replace(v_country,'~','","'),'") and ') end,'
		length(retailer)>0 
	order by retailer asc');
	
	prepare stmt from @str;
	execute stmt;
	deallocate prepare stmt;
end$$

delimiter ;