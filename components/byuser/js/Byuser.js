define(["framework/WidgetWithTemplate"], function(template) {

    Clazz.createPackage("com.components.widget.byuser.js");

    Clazz.com.components.widget.byuser.js.Byuser = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/byuser/template/byuser.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "byuser",
        localConfig: null,
        globalConfig: null,
        
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
        },
		
        loadPage :function(){
            Clazz.navigationController.push(this);   
        },
        preRender: function(whereToRender, renderFunction) {
            var self = this;
            self.getRegionData();
            self.getCountryData(0);
            self.getRetailerData(0);
            self.getStoreData(0);
            self.getTeamData();
            renderFunction(this.data, whereToRender);
        },

        postRender : function(element) {
                  
        },
        
        bindUI : function(){
            var language = window.localStorage.getItem("language");
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            loadLanguages(activeLang);
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');
            var userDetails = JSON.parse(window.localStorage.getItem("USER"));
            var resrccategoryid = window.localStorage.getItem("catrsrcId");
            var data1 = {
                action: 'by_user_searchfield',
                wstoken:userDetails.token
            };
            var data2 = {
                action: 'reports',
                type:'user',
                store:'',
                retailer:'',
                region:'',
                country:'',
                course:'',
                team:'',
                sortby:'',
                start:0,
                end:'',
                wstoken:userDetails.token
            };
            var data3 = {
                action: 'by_user_searchfield',
                wstoken: userDetails.token
            };
            var self = this;
            self.portraitLock();
            if(isDevice() && !isOnline()) {
                jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                });
            }
            self.loadData(data1, data2, data3);

            jQuery('.repbtn:last > a').on('tap', function (){
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                var serviceUrl = self.globalConfig.apiAddress.service;
                //var href = serviceUrl+'?action=export&type=user&store=&retailer=&region=&course=&team=&sortby=&recordrow=';
                
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                var team     = jQuery("#team-sel").val();
                var selectedIds= new Array();
                jQuery("tbody input[type='checkbox']:checked + label").each(function(i) {				
                    selectedIds.push(jQuery(this).siblings().val());
                })
                var href = serviceUrl+'?action=export&type=user&store='+store.replace(/#/g,'*')+'&retailer='+retailer.replace(/#/g,'*')+'&region='+region+'&country='+country+'&team='+team+'&sortby=&recordrow=' + selectedIds.join(',');
                //jQuery(this).attr('href', href);
				
                var downloadFileURL = href;
                var fileName = 'byuser_'+userDetails.id+'.csv';
                jQuery(this).attr('href', href);
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", {// create folder into local drive
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        
                        var filePath = fileEntry.fullPath + "/" + fileName; //downloadFileURL.substring(downloadFileURL.lastIndexOf("/")+1);                    
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false; // 
                        // Please wait.Your file will load in a few seconds.

                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                             
                            if(isDevice()  && isPhoneGap()){
                                if( /Android/i.test(navigator.userAgent) ) {
                                    window.plugins.fileOpener.open(filePath);
                                    return false;
                                }
                            }
                            
                        }, function(error) {
                            console.log("**********download error source " + error.source);
                            console.log("********download error target " + error.target);
                            console.log("*********upload error code: " + error.code);
                        });
                    }, self.fileError);
                }, self.fileError);
            });
            jQuery('.repbtn:first > a').on('click', function (){
                jQuery('.selectAll:last').attr('checked', false);
                var serviceUrl = self.globalConfig.apiAddress.service;
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                var data = {
                    action: 'reports',
                    type:'user',
                    store: store.replace(/#/g,'*'),
                    retailer: retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:jQuery("#team-sel").val(),
                    sortby:'',
                    start:0,
                    end:'',
                    wstoken:userDetails.token
                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);										 
            });
            jQuery('.selectAll:last + label').die().live('click',function () {		
                if(jQuery('.selectAll:last:checked').length){
                    jQuery('.chkcase').attr('checked', false);
                    jQuery('.selectAll:last').attr('checked', false);
                }else{
                    jQuery('.chkcase').attr('checked', true);
                    jQuery('.selectAll:last').attr('checked', true);
                }
 
            });
            jQuery("tbody input[type='checkbox'] + label").die().live('click',function(){
                var chkBox = jQuery(this).siblings();
                if(chkBox.is(':checked')){
                    chkBox.removeAttr('checked');
                }else{
                    chkBox.attr('checked', true);
                }
            });
            jQuery('#reportbyuser .rep_lastnme img').die().live('click',function(){
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if(sortby == "ASC"){
                    jQuery(this).attr('sortby','DESC');
                    jQuery(this).attr('src','../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                }else {
                    jQuery(this).attr('src','../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby','ASC');
                    sortbyval = 'ASC';
                }
               
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team     = jQuery("#team-sel").val();
                var sortval = "lastname "+sortbyval;
                jQuery("#sortoption").val(sortval);
                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortval,
                    start:0,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);
                return false;
            });
            jQuery('#reportbyuser .rep_firstnme img').die().live('click',function(){
                var sortbyval = '';													  
                var sortby = jQuery(this).attr('sortby'); 
                if(sortby == "ASC"){
                    jQuery(this).attr('sortby','DESC');
                    jQuery(this).attr('src','../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                }else {
                    jQuery(this).attr('src','../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby','ASC');
                    sortbyval = 'ASC';
                }
                
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team = jQuery("#team-sel").val();
                var sortval = "firstname "+sortbyval;
                jQuery("#sortoption").val(sortval);
                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortval,
                    start:0,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);
                return false;
            });
            jQuery('#reportbyuser .rep_course img').die().live('click',function(){
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if(sortby == "ASC"){
                    jQuery(this).attr('sortby','DESC');
                    jQuery(this).attr('src','../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                }else {
                    jQuery(this).attr('src','../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby','ASC');
                    sortbyval = 'ASC';
                }
               
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team = jQuery("#team-sel").val();
                var sortval = "fullname "+sortbyval;
                jQuery("#sortoption").val(sortval);
                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortval,
                    start:0,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);
                return false;
            });
            jQuery('#reportbyuser .rep_course2 img').die().live('click',function(){
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if(sortby == "ASC"){
                    jQuery(this).attr('sortby','DESC');
                    jQuery(this).attr('src','../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                }else {
                    jQuery(this).attr('src','../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby','ASC');
                    sortbyval = 'ASC';
                }
                
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team     = jQuery("#team-sel").val();
                var sortval = "points "+sortbyval;
                jQuery("#sortoption").val(sortval);
                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortval,
                    start:0,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);
                return false;
            });
            jQuery('#reportbyuser .rep_pnts img').die().live('click',function(){
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if(sortby == "ASC"){
                    jQuery(this).attr('sortby','DESC');
                    jQuery(this).attr('src','../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                }else {
                    jQuery(this).attr('src','../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby','ASC');
                    sortbyval = 'ASC';
                }
                
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team     = jQuery("#team-sel").val();
                var sortval = "totalpoints "+sortbyval;
                jQuery("#sortoption").val(sortval);
                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortval,
                    start:0,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.searchUser(data);
                return false;
            });
           
            jQuery('.bootpag a').die().live('click',function(event){ 
                //jQuery('.selectAll:last + label').click();
                jQuery('.chkcase').attr('checked', false);
                jQuery('.selectAll:last').attr('checked', false);
                jQuery("#load_wrapper").css({
                    'position':'relative',
                    'top':jQuery(document).height()/2
                });
                var page = jQuery(this).parent().attr('data-page');
                //page = parseInt(jQuery('.activepg').attr('data-page'))+parseInt(1);
                var start = (page-1)*9;
                var pagelength = jQuery('.bootpag li').length-2;
                
                var store, retailer, region, country;
                (jQuery("#store-sel option:selected").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel option:selected").val();
                (jQuery("#retailer-sel option:selected").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel option:selected").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                
                var team     = jQuery("#team-sel").val();
                var sortby = jQuery("#sortoption").val();	    
			
                if(page >= pagelength){
				
                    //jQuery('.bootpag a:last').off('click');
                    jQuery('.bootpag a:last').hide();
				 
                //jQuery('.bootpag li').removeClass('activepg');
                //jQuery(this).parent().addClass('activepg');
                // return true;
                }else{
                    jQuery('.bootpag a:last').show();
                }
                var c = jQuery('.activepg').attr('data-page');
				
                if(c==1){
                    var prev = "1";
                }else{
                    if(jQuery(this).parent().attr('data-move')){
                        if(jQuery(this).parent().attr('data-move')=='prev')
                            //var prev = parseInt(jQuery('.activepg').attr('data-page'))-parseInt(1);
                            var prev = parseInt(jQuery(this).parent().attr('data-page'))-parseInt(1);
                        else
                            var prev = parseInt(jQuery(this).parent().attr('data-page'));//jQuery('.activepg').attr('data-page')-parseInt(1); //
                    }else {
                        var prev = parseInt(jQuery(this).parent().attr('data-page'));
                    }
                    page = prev;
                }

				
                if(c==pagelength){
                    var lastval = pagelength;
                //var page = pagelength;
                }else {
					
                    if(jQuery(this).parent().attr('data-move')){
                        if(jQuery(this).parent().attr('data-move')=='next')
                            //var lastval = parseInt(jQuery('.activepg').attr('data-page'))+parseInt(1);
                            var lastval = parseInt(jQuery(this).parent().attr('data-page'))+parseInt(1);
                        else
                            var lastval = parseInt(jQuery(this).parent().attr('data-page'));//jQuery('.activepg').attr('data-page')-parseInt(1); //
                    }else{
                        var lastval = parseInt(jQuery(this).parent().attr('data-page'))+parseInt(1);
                    }
                //var page = lastval;
                }
				
                jQuery('.bootpag li:last').attr('data-page',lastval);
                jQuery('.bootpag li:first').attr('data-page',prev);

                var data = {
                    action: 'reports',
                    type:'user',
                    store:store.replace(/#/g,'*'),
                    retailer:retailer.replace(/#/g,'*'),
                    region:region,
                    country:country,
                    course:'',
                    team:team,
                    sortby:sortby,
                    start:start,
                    end:'',
                    wstoken:userDetails.token

                };
                if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                }
                self.paginationReports(data,page,lastval,prev);
            });
			
            jQuery('#home_page').live('click',function(){
               
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_home").addClass('selected');
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length){
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage();
                    }else{
                        Clazz.navigationController.getView('#home');
                    }
                }
            });
			
            jQuery('#report_pageview').live('click',function(){
                var hash = window.location.hash;
                if(hash !== '#reports'){
                    if(!jQuery("#reportsul").length){
                        self.reportsWidget = new Clazz.com.components.widget.reports.js.Reports();
                        self.reportsWidget.loadPage();
                    }else{
                        Clazz.navigationController.getView('#reports');
                    }
                }
            });

            jQuery(window).bind('orientationchange', function (e){
                self.portraitLock();
            });
            jQuery("#region-sel").on('change',function(){

                self.getCountryData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);

            });
            
            jQuery("#country-sel").on('change',function(){
                
                self.getRetailerData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);

            });
            
            jQuery("#retailer-sel").on('change',function(){
               
                self.getStoreData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);
            
            });
        },
        portraitLock: function (){
            var allowFn = false;
            if(isDevice()){
                allowFn = true;
            }
            if(navigator.userAgent.toLowerCase().indexOf("ipad") != -1)
                allowFn = false;

            if(allowFn){
                switch(window.orientation){
                    case 90:
                        jQuery("div#byuser-image").hide();
                        jQuery("div.byuser-temp,footer.footerbx").show();
                        break;
                    case -90:
                        jQuery("div#byuser-image").hide();
                        jQuery("div.byuser-temp, footer.footerbx").show();
                        break;
                    default:
                        jQuery("div#byuser-image").show();
                        jQuery("div.byuser-temp, footer.footerbx").hide();
                }
            }
        },
        
        getTeamData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data3 = '', userDetails = JSON.parse(window.localStorage.getItem("USER"));
            data3 = {
                action: 'by_user_searchfield',
                wstoken: userDetails.token,
                type:'team'
            };
            jQuery.ajax({
                url: serviceUrl,
                data: data3,
                type: 'POST',
                crossDomain: true,
                dataType: 'json',

                success: function (reportResp) {
                    var teamArr = reportResp.response.team;
                    var teamOpt = '<option value="" class="seloption" data-msg="all_default"></option>';
                    for (teams in teamArr) {
                        teamOpt += '<option class="seloption" value="' + teamArr[teams].name + '">' + teamArr[teams].name + '</option>';
                    }
                    jQuery("#team-sel").html(teamOpt);
                    loadAllLanguages();
                }
            });
        },
        getRegionData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            data = {
                action:'by_user_searchfield',
                type:'region'
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
                jQuery("#region-sel").empty();
                jQuery("#region-sel").append('<option value="sel_all">All</option>');
                if(resp.length > 0 && res.error === false){
                    jQuery.each(res.response.region, function(i,val){
                        if(val.region != '' || val.region != ' ' || val.region != null){
                            jQuery("#region-sel").append('<option data-region="'+val.region+'" value="'+i+'">'+val.region+'</option>');
                        }
                    });
                }
            },
            function(err,msg,res){
                });
        },
        
        getCountryData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            (filter == 1) ? data = {
                action:'by_user_searchfield',
                type:'country',
                region:jQuery("#region-sel option:selected").attr('data-region'),
                filter:filter
            } : data = {
                action:'by_user_searchfield',
                type:'country',
                filter:filter
            };

            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
                jQuery("#country-sel").empty();
                jQuery("#country-sel").append('<option data-msg="all_default" class="seloption" value="sel_all">All</option>');
                if(resp.length > 0 && res.error === false){
                    jQuery.each(res.response.country, function(i,val){
                        if(val.country != '' || val.country != ' ' || val.country != null){
                            jQuery("#country-sel").append('<option class="seloption" data-country="'+val.country+'" value="'+val.code+'">'+val.country+'</option>');
                        }
                    });
                }
            },
            function(err,msg,res){
                });
        },
        
        getRetailerData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            (filter == 1) ? data = {
                action:'by_user_searchfield',
                type:'retailer',
                region:jQuery("#region-sel option:selected").attr('data-region'),
                country:jQuery("#country-sel option:selected").attr('data-country'),
                filter:filter
            } : data = {
                action:'by_user_searchfield',
                type:'retailer',
                filter:filter
            };
                
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
                jQuery("#retailer-sel").empty();
                jQuery("#retailer-sel").append('<option value="sel_all">All</option>');
                if(resp.length > 0 && res.error === false){
                    jQuery.each(res.response.retailer, function(i,val){
                        if(val != '' || val != ' ' || val != null || val != undefined){
                            jQuery("#retailer-sel").append('<option value="'+val+'">'+val+'</option>');
                        }
                    });
                }
            },
            function(err,msg,res){
                });
        },
        getStoreData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            (filter == 1) ? data = {
                action:'by_user_searchfield',
                type:'store',
                region:jQuery("#region-sel option:selected").attr('data-region'),
                country:jQuery("#country-sel option:selected").attr('data-country'),
                retailer:jQuery("#retailer-sel option:selected").val(),
                filter:filter
            } : data = {
                action:'by_user_searchfield',
                type:'store',
                filter:filter
            };
            
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
                jQuery("#store-sel").empty();
                jQuery("#store-sel").append('<option value="sel_all">All</option>');
                if(resp.length > 0 && res.error === false){
                    jQuery.each(res.response.store, function(i,val){
                        if(val != '' || val != ' ' || val != null || val != undefined){
                            jQuery("#store-sel").append('<option value="'+val+'">'+val+'</option>');
                        }
                    });
                }
            },
            function(err,msg,res){
                });
        },
        
        ajaxReq:function(serviceUrl,data,succ,fail){
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                type: 'POST',
                crossDomain: true,
                success: function(resp) {
                    succ(resp);
                },
                error : function(x,y,z){
                    fail(x,y,z);
                }
            });  
        },
        searchUser:function(data){
            jQuery("#load_wrapper").css({
                'position':'relative',
                'top':jQuery(document).height()/2
            });
            var self=this,serviceUrl = self.globalConfig.apiAddress.service;
            jQuery.ajax({
                url: serviceUrl,
                data:data,
                type:'POST',
                crossDomain:true,
                dataType:'json',
                success:function(reportResp){
                    var reportrowOpt = '', pageflag = '';
                    jQuery("#reportbyuser tbody").html('');
                    jQuery("#byuserpagenation").html('');
                    if(reportResp.msg == 'done'){
                        jQuery("#exportdiv").show();
                        var reportArr = [], reportrowOpt = ''; 
                        reportArr = reportResp.response.data;
                        for(reports in reportArr){
                            var jobtitle = reportArr[reports].jobtitle;
                            if(jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportArr[reports].jobtitle;
                            }
                            reportrowOpt = '<tr><td class="chkbx"><input type="checkbox" class="chkcase" id="chkbx" value="'+ reportArr[reports].id +'"><label for="chkbx9"></label></td><td class="rep_lastnme">'+ reportArr[reports].lastname +'</td><td class="rep_firstnme">'+ reportArr[reports].firstname +'</td><td class="rep_job">'+ jobtitle +'</td><td class="rep_course">'+ reportArr[reports].fullname +'</td><td class="rep_course2">'+ reportArr[reports].points +'</td><td class="rep_pnts">'+ reportArr[reports].totalpoints +'</td></tr>';

                            jQuery("#reportbyuser tbody").append(reportrowOpt);
                        }
                    }else {
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) { 
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportrowOpt = "<tr class=''><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                        jQuery("#reportbyuser tbody").append(reportrowOpt);
                    }
                    jQuery("tbody > tr:odd").addClass('rep_grey');
                    jQuery("tbody > tr:even").addClass('rep_wht');	
                    var showCount = 9;
                    if(reportResp.msg == 'done'){
                        totalCount = Math.ceil(reportResp.response.totalcount/showCount);
                        var pagination ="<ul class='bootpag'>";//<li class='arwsymbl' data-move='prev'><a href='#'>&laquo;</a></li>";
                        if(reportResp.response.totalcount > 9){
                            for(var i=1;i<= totalCount;i++){
                                if(i<=10){
                                    if(i==1)
                                        pagination += "<li class='activepg' data-page="+i+"><a href='#' >"+i+"</a></li>";
                                    else
                                        pagination += "<li data-page="+i+"><a href='#' >"+i+"</a></li>";
                                }
                            }
                            pagination += "<li class='arwsymbl' data-page='2' data-move='next'><a href='#'>&raquo;</a></li></ul>";
                        }
                    }else {
                        pagination="";
                    }
                    jQuery(".paginationbx").html(pagination);
                   
                    if(reportResp.msg == 'done'){

                    } else {
                        jQuery("#exportdiv").hide();
                    }
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'   
                    }); 
                    loadAllLanguages();
                }
            });
        },
        paginationReports:function(data,page,lastval,prev){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service,reportSearchArr = [],reportSearchOpt='',pagination='';

            jQuery.ajax({
                url: serviceUrl,
                data:data,
                type:'POST',
                crossDomain:true,
                dataType:'json',               	
                success:function(reportResp){
                    if(reportResp.msg == 'done') {	
                        reportSearchArr = reportResp.response.data;
                        for(reportsearch in reportSearchArr){
                            var jobtitle = reportSearchArr[reportsearch].jobtitle;
                            if(jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportSearchArr[reportsearch].jobtitle;
                            }
                            reportSearchOpt += '<tr class="rep_grey"><td class="chkbx"><input type="checkbox" class="chkcase" id="chkbx" value="'+ reportSearchArr[reportsearch].id +'"><label for="chkbx9"></label></td><td class="rep_lastnme">'+ reportSearchArr[reportsearch].lastname +'</td><td class="rep_firstnme">'+ reportSearchArr[reportsearch].firstname +'</td><td class="rep_job">'+ jobtitle +'</td><td class="rep_course">'+ reportSearchArr[reportsearch].fullname +'</td><td class="rep_course2">'+ reportSearchArr[reportsearch].points +'</td><td class="rep_pnts">'+ reportSearchArr[reportsearch].totalpoints +'</td></tr>';
					    
                        }
                    }else {
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) { 
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportSearchOpt = "<tr class=''><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                    }
                    jQuery("#reportbyuser tbody").html(reportSearchOpt);
                    jQuery("tbody > tr:odd").addClass('rep_grey');
                    jQuery("tbody > tr:even").removeClass('rep_grey');
                    jQuery("tbody > tr:even").addClass('rep_wht');
                    var showCount = 9;
                    if(reportResp.msg == 'done') {
                        totalCount = Math.ceil(reportResp.response.totalcount/showCount);
                        page_start = page;
                        if(reportResp.response.totalcount > 9) {
                            var i=0;
                            var pagecount = parseInt(page)+parseInt(9);

                            page_num = parseInt(totalCount) - parseInt(page);

                            if(page_num <=9 && totalCount >= 9)
                                page_start = parseInt(totalCount) - parseInt(9);

                            if(totalCount <=9)
                                page_start=1;
							
                            if(pagecount >= totalCount)
                                pagecount = totalCount;

						
                            if(i<= pagecount) {
                                if(page > 1)
                                    pagination += "<ul class='bootpag'><li class='arwsymbl' data-page="+prev+" data-move='prev'><a href='#'>&laquo;</a></li>";
                                else
                                    pagination +="<ul class='bootpag'>";
							 
                                for(var i=page_start;i<= pagecount;i++){
                                    if(i==page)
                                        pagination += "<li class='activepg' data-page="+i+"><a href='#'>"+i+"</a></li>";
                                    else
                                        pagination += "<li data-page="+i+"><a href='#' >"+i+"</a></li>";					

                                }
                            }
                            if(page == totalCount){
                                pagination +="</ul>";
                            }else{
                                pagination +="<li class='arwsymbl' data-page="+lastval+" data-move='next'><a href='#'>&raquo;</a></li></ul>";
                            }					   
						   
                        }else{
                            pagination ="";
                        }
                    }else {
                        pagination ="";
                        jQuery("#exportdiv").hide();
                    }
                                      
                    jQuery(".paginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
                    loadAllLanguages();
                }
            });
        },
        loadData:function(data1, data2, data3){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service,newsli='', 
            
            regionArr = [], regionOpt = '',
            countryArr = [],
            countryOpt = '',storeArr = [], storeOpt = '',retailerArr = [], retailerOpt = '', reportArr = [], reportrowOpt = '', byuserpage = '', byuserpageOpt ='';
            jQuery.ajax({
                url: serviceUrl,
                data:data3,
                type:'POST',
                crossDomain:true,
                dataType:'json',
               	
                success:function(reportResp){
                    //                    regionArr = reportResp.response.region;
                    //                    regionOpt = '<option value="" class="seloption" data-msg="all_default"></option>';   
                    //                    /*for(regions in regionArr){
                    //                        console.info(regionArr[regions]);
                    //                        regionOpt += '<option class="seloption" value="'+ regionArr[regions].data +'">'+ regionArr[regions].data +'</option>';   
                    //                    }*/
                    //                    regionOpt += '<option value="ASIA PACIFIC" label="ASIA PACIFIC" class="seloption">ASIA PACIFIC</option><option value="EUROPE/MIDDLE EAST/AFRICA" label="EUROPE/MIDDLE EAST/AFRICA" class="seloption">EUROPE/MIDDLE EAST/AFRICA</option><option value="LATIN AMERICA" label="LATIN AMERICA" class="seloption">LATIN AMERICA</option><option value="NORTH AMERICA" label="NORTH AMERICA" class="seloption">NORTH AMERICA</option><option value="UNITED KINGDOM" label="UNITED KINGDOM" class="seloption">UNITED KINGDOM</option>';
                    //                    jQuery("#region-sel").html(regionOpt);
                    //				   
                    //                    storeArr = reportResp.response.store;
                    //                    storeOpt = '<option value="" class="seloption" data-msg="all_default"></option>';   
                    //                    for(stores in storeArr){
                    //                        storeOpt += '<option class="seloption" value="'+ storeArr[stores].data +'">'+ storeArr[stores].data +'</option>';   
                    //                    }
                    //                    jQuery("#store-sel").html(storeOpt);
                    //				   
                    //                    retailerArr = reportResp.response.retailer;
                    //                    retailerOpt = '<option value="" class="seloption" data-msg="all_default"></option>';   
                    //                    for(retailers in retailerArr){
                    //                        retailerOpt += '<option class="seloption" value="'+ retailerArr[retailers].data +'">'+ retailerArr[retailers].data +'</option>';   
                    //                    }
                    //                    jQuery("#retailer-sel").html(retailerOpt);
                    //                    loadAllLanguages();

                    //                    regionArr = reportResp.response.region;
                    //                    regionOpt = '<option value="" class="seloption" data-msg="all_default"></option>';
                    //                    for (region in regionArr) {
                    //                        console.info(regionArr[region]);
                    //                        regionOpt += '<option class="seloption" value="' + regionArr[region].data + '">' + regionArr[region].data + '</option>';
                    //                    }
                    /* regionOpt += '<option value="ASIA PACIFIC" label="ASIA PACIFIC" class="seloption">ASIA PACIFIC</option><option value="EUROPE/MIDDLE EAST/AFRICA" label="EUROPE/MIDDLE EAST/AFRICA" class="seloption">EUROPE/MIDDLE EAST/AFRICA</option><option value="LATIN AMERICA" label="LATIN AMERICA" class="seloption">LATIN AMERICA</option><option value="NORTH AMERICA" label="NORTH AMERICA" class="seloption">NORTH AMERICA</option><option value="UNITED KINGDOM" label="UNITED KINGDOM" class="seloption">UNITED KINGDOM</option>'; */
                    //jQuery("#region-sel").html(regionOpt);
                    
                    
                    //Country:
                    
                   /* countryArr = reportResp.response.country;
                    countryOpt = '<option value="" class="seloption" data-msg="all_default"></option>';
                    for (country in countryArr) {
                        countryOpt += '<option class="seloption" value="' + countryArr[country].data + '">' + countryArr[country].data + '</option>';
                    }
                    jQuery("#country-sel").html(countryOpt);
                    
                    //Retailer:
                    
                    retailerArr = reportResp.response.retailer;
                    retailerOpt = '<option value="" class="seloption" data-msg="all_default"></option>';
                    for (retailer in retailerArr) {
                        retailerOpt += '<option class="seloption" value="' + retailerArr[retailer].data + '">' + retailerArr[retailer].data + '</option>';
                    }
                    jQuery("#retailer-sel").html(retailerOpt);
                    
                    //Store:

                    storeArr = reportResp.response.store;
                    storeOpt = '<option value="" class="seloption" data-msg="all_default"></option>';
                    for (store in storeArr) {
                        storeOpt += '<option class="seloption" value="' + storeArr[store].data + '">' + storeArr[store].data + '</option>';
                    }
                    jQuery("#store-sel").html(storeOpt); */

                    
                    loadAllLanguages();
                }
            });
			 
            jQuery.ajax({
                url: serviceUrl,
                data:data2,
                type:'POST',
                crossDomain:true,
                dataType:'json',
               	
                success:function(reportResp){
                    if(reportResp.msg == 'done') {
                        reportArr = reportResp.response.data;                
                        for(reports in reportArr){	
                            var jobtitle = reportArr[reports].jobtitle;
                            if(jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportArr[reports].jobtitle;
                            }
                            reportrowOpt = '<tr><td class="chkbx"><input type="checkbox" id="chkbx" class="chkcase" value="'+ reportArr[reports].id +'"><label for="chkbx9"></label></td><td class="rep_lastnme">'+ reportArr[reports].lastname +'</td><td class="rep_firstnme">'+ reportArr[reports].firstname +'</td><td class="rep_job">'+ jobtitle +'</td><td class="rep_course">'+ reportArr[reports].fullname +'</td><td class="rep_course2">'+ reportArr[reports].points +'</td><td class="rep_pnts">'+ reportArr[reports].totalpoints +'</td></tr>';
                            jQuery("#reportbyuser tbody").append(reportrowOpt);
                        }
                    }else{
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) { 
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportrowOpt = "<tr class=''><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                        jQuery("#reportbyuser tbody").append(reportrowOpt);
                    }
                    jQuery("tbody > tr:odd").addClass('rep_grey');
                    jQuery("tbody > tr:even").addClass('rep_wht');	
                    var showCount = 9;
                    if(reportResp.msg == 'done') {
                        totalCount = Math.ceil(reportResp.response.totalcount/showCount);
                        if(reportResp.response.totalcount > 9) {
                            byuserpageOpt = '<ul class="bootpag">';//<li class="arwsymbl" data-page="0"><a href="#">«</a></li>';
                            for(var i=1;i<=totalCount;i++) {
                                if(i<=10){
                                    if(i==1)
                                        byuserpageOpt += '<li class="activepg" data-page='+i+'><a href="#">'+ i +'</a></li>';
                                    else
                                        byuserpageOpt += '<li data-page='+i+'><a href="#">'+ i +'</a></li>';	
                                }
                            }
                            byuserpageOpt += '<li class="arwsymbl" data-page="2" data-move="next"><a href="#">&raquo;</a></li></ul>';
                        }else {
                            byuserpageOpt= "";
                        }
                    }else {
                        byuserpageOpt= "";
                        jQuery("#exportdiv").hide();
                    }                                      
                    jQuery("#byuserpagenation").html(byuserpageOpt);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
                    loadAllLanguages();
                }
            });
			

        }
	
    });

    return Clazz.com.components.widget.byuser.js.Byuser;
});