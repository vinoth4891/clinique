delimiter $$
drop procedure if exists `clinique_data_fix_scripts`$$
create procedure `clinique_data_fix_scripts`()
begin
	set @v_str = 'create temporary table tmp_user_data character set utf8 collate utf8_general_ci
	as
	select distinct region.data as region, c.country_name as country, retailer.data as retailer, store.data as store
	from mdl_user u
	left join mdl_user_info_data store on u.id = store.userid
	and store.fieldid = 6
	left join mdl_user_info_data retailer on u.id = retailer.userid
	and retailer.fieldid = 7
	left join mdl_user_info_data region on u.id = region.userid
	and region.fieldid = 2
	left join mdl_country c on binary u.country = c.country_code';
	
	
	prepare stmt from @v_str;
	drop table if exists tmp_user_data;
	execute stmt;
	deallocate prepare stmt;
	
	set @v_str_master = 'create temporary table tmp_master_data character set utf8 collate utf8_general_ci
	as
	select region,country,retailer,store, max(id) as id
	from mdl_cascade_region
	group by region,country,retailer,store';
	
	
	prepare stmt1 from @v_str_master;
	drop table if exists tmp_master_data;
	execute stmt1;
	deallocate prepare stmt1;
	
	/*insert statement to insert user data into mdl_cascade_region table*/
	set @v_final = 'insert into mdl_cascade_region (region, country, retailer, store)
	select cast(region as BINARY), cast(country as BINARY), cast(retailer as BINARY), cast(store as BINARY)
	from tmp_user_data a
	where not exists(select 1 from mdl_cascade_region b where binary a.region = binary b.region and binary a.country = binary b.country and binary a.retailer = binary b.retailer and binary a.store = binary b.store)';
	
	
	prepare stmt2 from @v_final;
	execute stmt2;
	deallocate prepare stmt2;
	

	update mdl_cascade_region set region = 'TRAVEL RETAIL CENTRAL AND SOUTH AMERICA' where region = 'TRAVEL RETAIL CENTRAL AND SOUTH AMERICA\r';
	delete from mdl_cascade_region where (region = 'Choose...') or (region is null or region = '' or length(region) = 0) or (country is null or country = '' or length(country) = 0);
	
		
	set @v_str_master = 'create temporary table tmp_master_data character set utf8 collate utf8_general_ci
	as
	select region,country,retailer,store, max(id) as id
	from mdl_cascade_region
	group by region,country,retailer,store';
	
	
	prepare stmt1 from @v_str_master;
	drop table if exists tmp_master_data;
	execute stmt1;
	deallocate prepare stmt1;
	
	/*delete statement to delete all duplicate records in mdl_cascade_region table*/
	delete from mdl_cascade_region
	where id not in (select id from tmp_master_data);
	
end$$

delimiter ;

call clinique_data_fix_scripts;