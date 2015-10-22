delimiter $$
drop procedure if exists `mdl_get_store_master`$$
create procedure `mdl_get_store_master`(
	in v_region varchar(100),
	in v_country varchar(200),
	in v_retailer varchar(500)
)
begin
	set @str = concat('select distinct upper(store) as store
	from mdl_cascade_region 
	where ', case when v_region = "%" then ' ' else concat(' region in ("',replace(v_region,'~','","'),'") and ') end,'
		', case when v_country = "%" then ' ' else concat(' country in ("',replace(v_country,'~','","'),'") and ') end,'
		', case when v_retailer = "%" then ' ' else concat(' retailer in ("',replace(v_retailer,'~','","'),'") and ') end,'
		 length(store)>0 
	order by store asc');
	
	prepare stmt from @str;
	execute stmt;
	deallocate prepare stmt;
end$$

delimiter ;