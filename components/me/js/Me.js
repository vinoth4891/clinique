define(["framework/WidgetWithTemplate","home/Home","changePwd/ChangePwd"] , function(template) {
    Clazz.createPackage("com.components.widget.me.js");
    Clazz.com.components.widget.me.js.Me = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/me/template/me.tmp",
        name : "me",
        mainContainer : "basepage\\:widget",
        localConfig: null,
        globalConfig: null,
        chngpsdWidget:null,
        changePwdWidget : null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.changePwdWidget = new Clazz.com.components.widget.changePwd.js.ChangePwd();
        },
        onResume: function() {
            jQuery(".prof_edit").hide();
            this.loadPage();
        },
        setContent : function() {
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var languageval = userDetails.lang;
            this.data.firstname = userDetails.firstname;
            this.data.lastname = userDetails.lastname;
            this.data.Region=userDetails.profile.region; /*Custom Field 1*/
            this.data.country=userDetails.country;
            this.data.username=userDetails.username;
            this.data.Retailer=userDetails.profile.retailer; /*Custom Field 2*/
            this.data.Store=userDetails.profile.store; /*Custom Field 3*/
            this.data.email=userDetails.email;
            this.data.lang=languages[languageval];
            this.data.jobtitle=userDetails.profile.jobtitle; /*Custom Field 4*/
        },
        preRender: function(whereToRender, renderFunction) {
            this.setContent();
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
              if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<section class="tpbreadcrumbs"><ul>  \r\n' +
                  '<li class="home_view prolnk"><a href="#" data-msg="Home"></a></li>  \r\n' +
                  '<li data-msg="Me"></li></ul><div class="clear"></div></section>';
                  return new Handlebars.SafeString(BreadcrumElement);
              }
            });
            Handlebars.registerHelper('footerContent', function () {
              var footerElement = '<li class="selected footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
              footerElement += '<li class="footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
              footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
              footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
              return new Handlebars.SafeString(footerElement);
            });
			
			// previous selection is display to center when return to click home link or home navigation in header.
            /* setTimeout(function (){
                jQuery("div.in.out.flip").remove();
            }, 700); */
            
            /* default implementation just call renderFunction */
            renderFunction(this.data, whereToRender);
        },
        loadPage :function(data){
            var self=this;
            self.UserDetails={};
            self.UserDetails=data;
            Clazz.navigationController.push(self);
        },
        viewprofile:function(){
            var hash = window.location.hash;
            jQuery("#footer-menu li").removeClass('selected');
            jQuery(this).addClass('selected');
            if(hash !== '#me'){
                if(!jQuery("#profile_edit").length){
                    self.meWidget = new Clazz.com.components.widget.me.js.Me();
                    self.meWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#me');
                }
            }
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var self = this,iTouch = '';
            if(isiOS()){
                iTouch = 'touchstart';
            }else{
                iTouch = 'click';
            };
            var language;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }  
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
            jQuery('#edit_profile,#chngpaswd').removeClass('disable');
            setTimeout(function(){
               if( isDevice() && isPhoneGap() && !checkAppOnline() ) {
                jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                updateLanguage();
                jQuery('.errorCode-pop').show();
                jQuery('#edit_profile,#chngpaswd').addClass('disable');
               }else{
                  jQuery('#edit_profile,#chngpaswd').removeClass('disable');
               }
            },500);
                                                        
                                                        
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            jQuery("#fname, #lname").on('keypress',function(e){
                if(jQuery(this).val().length > 19 && e.which != 8 && e.which != 0){
                    e.preventDefault();
                }
            });
            jQuery("ul#footer-menu > li").removeClass('selected');
            jQuery("ul#footer-menu > li.footer_me").addClass('selected');
            jQuery("ul#header-menu > li").removeClass('selected');
            jQuery("ul#header-menu > li.header_me").addClass('selected');
            jQuery("form#profile_inputholder input").keyup(function(e) {
                if(e.which == 13) {
                    jQuery("div.profile_save:last").click();
                }
            });
            /***** Updating the Job Title ****/
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }            
            jQuery("div.job_title").text('');
            if(isNaN(userDetails.profile.jobtitle)) {
                jQuery("div.job_title").text(userDetails.profile.jobtitle);
            } else {
                jQuery("div.job_title").text($("#me_job option[value = '"+userDetails.profile.jobtitle+"']").text());
            }
            /***** Updating the Job Title ****/
            jQuery('#profile_view .home_view, #profile_edit .home_view').die().live(iTouch,function(){
                jQuery("ul#footer-menu > li, ul#header-menu > li").removeClass('selected');
                jQuery("ul#footer-menu > li.footer_home, ul#header-menu > li.header_home").addClass('selected');
                jQuery(".hme_hdrbx,div.row.menu").show();
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length) {
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage('me');
                    } else {
                        Clazz.navigationController.getView('#home');
						homeCarousel();
                    }
                }
            });
            
            //jQuery('#chngpaswd a').on(iTouch,function(){
            jQuery('#chngpaswd a').die().live(iTouch,function(){
                if( isDevice() && isPhoneGap() && !checkAppOnline() ) { return false; }
                                              
                jQuery("ul#footer-menu > li, ul#header-menu > li").removeClass('selected');
                jQuery("ul#footer-menu > li.footer_me, ul#header-menu > li.header_me").addClass('selected');
                var hash = window.location.hash;
                if(hash !== '#changePwd'){
                    Clazz.navigationController.pop();
                    if(!jQuery("#changepsd_page").length){
                        self.chngpsdWidget = new Clazz.com.components.widget.changePwd.js.ChangePwd();
                        self.chngpsdWidget.loadPage(false);
                    }else{
                        Clazz.navigationController.getView('#changePwd');
                    }
                }
                jQuery(".corelogin header").hide();
				jQuery("form#loginform input").val('');
				jQuery("div#chgpwd_error_msg, span#chgpwd_success_msg").empty();
            });
            //jQuery('#edit_profile a').on(iTouch,function(){
            jQuery('#edit_profile a').die().live(iTouch,function(){
                if( isDevice() && isPhoneGap() && !checkAppOnline() ) { return false; }
                                                 
                    jQuery(".prof_view").hide();
                    jQuery(".scndhdr").hide();
                    jQuery(".prof_edit").show();
                    jQuery("ul#footer-menu > li, ul#header-menu > li").removeClass('selected');
                    jQuery("ul#footer-menu > li.footer_me, ul#header-menu > li.header_me").addClass('selected');
                    var userDetails;
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        userDetails = JSON.parse(window.localStorage.getItem("USER"));
                    } else {
                        userDetails = JSON.parse($.jStorage.get("USER"));
                    }
                    self.getRegionData('service');
                    if(isNaN(userDetails.profile.jobtitle)){
                        jQuery('#me_job option').filter(function (){
                            return jQuery.trim(jQuery(this).text()) == userDetails.profile.jobtitle;
                        }).attr('selected',true);
                    }
                    else{
                        jQuery('#me_job option').filter(function (){
                            return jQuery.trim(jQuery(this).val()) == userDetails.profile.jobtitle;
                        }).attr('selected',true);
                    }
                    jQuery("#fname").focus();
            });
            jQuery('.bred_me:not(.changePwd)').on(iTouch,function(){
                jQuery("div.in.out.flip").remove(); // previous selection is display to center when return to click home link or home navigation in header.
                Clazz.navigationController.pop(this);
                self.loadPage();
            });
            jQuery(".profile_save").die().live(iTouch,function(){
                var uName, fName, lName, email, lang, country, jTitle, region, retailselect, retailerSelectOne,emailFlag,retail, storeselect, storeSelectOne, store, userDetails, updateProfileToken, serviceUrl, data, reg;
				reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,3})$/;
                uName = jQuery.trim(jQuery("#uname").val().toLowerCase());
                fName = jQuery.trim(jQuery("#fname").val());
                lName = jQuery.trim(jQuery("#lname").val());
                email = jQuery.trim(jQuery("#mail").val());
                lang = jQuery.trim(jQuery("#lang").val());
                country = jQuery("#country-edit").val();
                jTitle = jQuery("#me_job").val();
                region = jQuery.trim(jQuery("#regionval").val());
                retailselect = jQuery.trim(jQuery("#me_retailer option:selected").text());
                retailerSelectOne = jQuery("#me_retailer").val();
                retail = jQuery.trim(jQuery("#me_retailer option:selected").text());
				if(email.length === 0){
                    jQuery('#mail:last:not(.error_red)').addClass('error_red');
                    return false;
				}
				 if(reg.test(email)){ 
                    jQuery('#mail:last').removeClass('error_red');
                 }else{
                    jQuery('#mail:last:not(.error_red)').addClass('error_red');
                    return false;
                }
                if(retail == "Other") {
                    retail = jQuery.trim(jQuery("#reg_entretailer_other").val());
                }
                storeselect = jQuery.trim(jQuery("#reg_str option:selected").text());
                storeSelectOne = jQuery("#reg_str").val();
                store = jQuery.trim(jQuery("#reg_str option:selected").text());
                if(store == "Other") {
                    store = jQuery.trim(jQuery("#reg_entstore_other").val());
                }
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }
                updateProfileToken = userDetails.updateProfile;
                updateProfileToken = updateProfileToken.substring(3,35);
                if(fName === '' || lName === '' || retailselect == 'Other' || storeselect == 'Other' ||
                    region == "sel_one" || country == "sel_one" || retailerSelectOne == "sel_one" || storeSelectOne == "sel_one") {
                    if((fName === '' || lName === '')
                        && ((retailselect == 'Other' && jQuery("#reg_entretailer_other").val() === '')
                            || storeselect == 'Other' && jQuery("#reg_entstore_other").val() === '')
                        || (region == "sel_one" || country == "sel_one" || retailerSelectOne == "sel_one" || storeSelectOne == "sel_one")) {
                        self.formValidator();
                        self.formValidatorOther();
                        self.formSelectValidator();
                    } else if(retailselect == 'Other' && jQuery("#reg_entretailer_other").val() === '') {
                        jQuery("#fname").removeClass('error_red');
                        jQuery("#lname").removeClass('error_red');
                        self.formValidatorOther();
                    } else if(storeselect == 'Other' && jQuery("#reg_entstore_other").val() === '') {
                        jQuery("#fname").removeClass('error_red');
                        jQuery("#lname").removeClass('error_red');
                        self.formValidatorOther();
                    } else if(fName === '' || lName === '') {
                        jQuery("#reg_entretailer_other").removeClass('error_red');
                        jQuery("#reg_entstore_other").removeClass('error_red');
                        self.formValidator();
                    } else {
                        serviceUrl = self.globalConfig.apiAddress.restservice;
                        data = {
                            wsfunction : 'core_user_update_users',
                            moodlewsrestformat:'json',
                            'users[0][id]': userDetails.id,
                            'users[0][username]': uName,
                            'users[0][firstname]': fName,
                            'users[0][lastname]': lName,
                            'users[0][email]': email,
                            'users[0][country]':country,
                            'users[0][customfields][0][type]':'retailer',
                            'users[0][customfields][0][value]':retail,
                            'users[0][customfields][1][type]':'region',
                            'users[0][customfields][1][value]':region,
                            'users[0][customfields][2][type]':'store',
                            'users[0][customfields][2][value]':store,
                            'users[0][customfields][3][type]':'jobtitle',
                            'users[0][customfields][3][value]':jTitle,
                            wstoken:updateProfileToken
                        };
                       if(isDevice() && !isOnline()) {
                           jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                           updateLanguage();
                           jQuery('.errorCode-pop,.overlaylightbox').show();
                        }
						if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
							jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
							updateLanguage();
							jQuery('.errorCode-pop').show();
						}
                        self.updateProfile(serviceUrl,data);
                    }
                } else {
                    serviceUrl = self.globalConfig.apiAddress.restservice;
                    data = {
                        wsfunction : 'core_user_update_users',
                        moodlewsrestformat:'json',
                        'users[0][id]': userDetails.id,
                        'users[0][username]': uName,
                        'users[0][firstname]': fName,
                        'users[0][lastname]': lName,
                        'users[0][email]': email,
                        'users[0][country]':country,
                        'users[0][customfields][0][type]':'retailer',
                        'users[0][customfields][0][value]':retail,
                        'users[0][customfields][1][type]':'region',
                        'users[0][customfields][1][value]':region,
                        'users[0][customfields][2][type]':'store',
                        'users[0][customfields][2][value]':store,
                        'users[0][customfields][3][type]':'jobtitle',
                        'users[0][customfields][3][value]':jTitle,
                        wstoken:updateProfileToken
                    };
                    /* if(isDevice() && !isOnline()) {
                        jQuery('.nonetconnection').slideDown(2000, function(){
                            jQuery(this).fadeOut(6000);
                        });
                    } */
					if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
						jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
						updateLanguage();
						jQuery('.errorCode-pop').show();
					}
                    self.updateProfile(serviceUrl,data);
                }
                jQuery(':input[value=""]:visible:first').focus();
                jQuery(".hme_hdrbx,div.row.menu").show();
            });
            /*jQuery("#regionval").on('change',function(){On region change*/
            jQuery("#regionval").die().live('change',function(){
                jQuery("#country-edit").removeAttr('disabled');
                jQuery("#me_retailer, #reg_str").html('<option value="sel_one">Select One</option>').attr('disabled','disabled');
                self.getCountryData();
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field, #reg_entstore_field").hide();
                if(jQuery("#regionval").val() == "sel_one"){
                    jQuery("#country-edit, #me_retailer, #reg_str").attr('disabled','disabled').html('<option value="sel_one">Select One</option>');
                }
            });
            /*jQuery("#country-edit").on('change',function(){On country change*/
            jQuery("#country-edit").die().live('change',function(){
                jQuery("#me_retailer").removeAttr('disabled');
                jQuery("#reg_str").html('<option value="sel_one">Select One</option>').attr('disabled','disabled');
                self.getRetailerData('change');
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field, #reg_entstore_field").hide();
                if(jQuery("#country-edit").val() == "sel_one"){
                    jQuery("#me_retailer, #reg_str").html('<option value="sel_one">Select One</option>').attr('disabled','disabled');
                }
            });
            /*jQuery("#me_retailer").on('change',function(){On retailer change*/
            jQuery("#me_retailer").die().live('change',function(){
                jQuery("#reg_str").removeAttr('disabled');
                self.getStoreData('change');
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field").hide();
                jQuery("#reg_entstore_field").hide();
                var retailerval = jQuery.trim(jQuery("#me_retailer > option:selected").text());
                if(retailerval == "Other"){
                    jQuery("#reg_entretailer_field, #reg_entstore_field").show();
                    jQuery("#reg_entretailer_field input").attr('required', true);
                    jQuery("#reg_entstore_field input").attr('required', true);
                }
                if(jQuery("#me_retailer").val() == "sel_one"){
                    jQuery("#reg_str").html('<option value="sel_one">Select One</option>').attr('disabled','disabled');
                }
                if(jQuery("#me_retailer").val() == "Other"){
                    jQuery("#reg_str").append('<option>Other</option>');
                }
            });
            /*jQuery("#reg_str").on('change',function(){On store change*/
            jQuery("#reg_str").die().live('change',function(){
                var storeval = jQuery.trim(jQuery("#reg_str > option:selected").text());
                if(storeval == "Other"){
                    jQuery("#reg_entstore_field").show();
                    jQuery("#reg_entstore_field input").attr('required', true);
                }
                else{
                    jQuery("#reg_entstore_field").hide();
                    jQuery("#reg_entstore_field input").removeAttr('required');
                }
            });
            jQuery('input,select').on('focus',function(){
               if( !isAndroid() & isiOS()){	
                jQuery(".hme_hdrbx,div.row.menu").hide();
               }
            });
            jQuery('input,select').on('blur',function(){
            	if( !isAndroid() & isiOS()){
                 jQuery(".hme_hdrbx,div.row.menu").show();
            	}
            });
        },
        getRegionData: function(value){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'region'
            };
            self.ajaxReq(serviceUrl,data,function(resp){                
                var res = resp, userDetails;                
                 if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }                
                jQuery("#regionval").empty();
                jQuery("#regionval").append('<option value="sel_one">Select One</option>');
                if(res.response.length > 0 && res.error === false){
                    jQuery.each(res.response, function(i,val){
                        if(val.region != '' && val.region != ' ' && val.region != null){
                            jQuery("#regionval").append('<option data-region="'+val.region+'" value="'+i+'">'+val.region+'</option>');
                        }
                    });
                    if(value == 'service'){
                        jQuery('#regionval option').filter(function() {
                            return $.trim( $(this).text().toLowerCase() ) == $.trim(userDetails.profile.region.toLowerCase());
                        }).attr('selected','selected');
                        self.getCountryData('service');
                    }
                }
            });
        },
        getCountryData: function(value){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'country',
                region:jQuery("#regionval option:selected").attr('data-region')
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = resp, userDetails;                
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }                                
                jQuery("#country-edit").empty();
                jQuery("#country-edit").append('<option value="sel_one">Select One</option>');
                if(res.response.length > 0 && res.error === false){
                    jQuery.each(res.response, function(i,val){
                        if(val.country != '' && val.country != ' ' && val.country != null){
                            jQuery("#country-edit").append('<option data-country="'+val.country+'" value="'+val.code+'">'+val.country+'</option>');
                        }
                    });
                    if(value == 'service'){
                        jQuery('#country-edit option').filter(function() {
                            return $.trim( $(this).text().toLowerCase() ) == $.trim(userDetails.country.toLowerCase());
                        }).attr('selected','selected');
                        self.getRetailerData('service');
                    }
                }
            });
        },
        getRetailerData: function(value){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'retailer',
                region:jQuery("#regionval option:selected").attr('data-region'),
                country:jQuery("#country-edit option:selected").attr('data-country')
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = resp, userDetails;                
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }                
                jQuery("#me_retailer").empty();
                jQuery("#me_retailer").append('<option value="sel_one">Select One</option>');
                if(res.response.length > 0 && res.error === false){
                    jQuery.each(res.response, function(i,val){
                        if(val.retailer != '' && val.retailer != ' ' && val.retailer != null){
                            jQuery("#me_retailer").append('<option value="'+val.retailer+'">'+val.retailer+'</option>');
                        }
                    });
                    jQuery("#me_retailer").append('<option value="">Other</option>');
                    if(value == 'service'){
                        jQuery('#me_retailer option').filter(function() {
                            return $.trim( $(this).text().toLowerCase() ) == $.trim(userDetails.profile.retailer.toLowerCase());
                        }).attr('selected','selected');
                        self.setRetailerValue();
                    }
                    self.getStoreData('service');
                }
				if(res.error == true && res.response == "empty"){
                	 jQuery("#me_retailer").append('<option value="">Other</option>');
                }
            });
        },
        getStoreData: function(value){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'store',
                region:jQuery("#regionval option:selected").attr('data-region'),
                country:jQuery("#country-edit option:selected").attr('data-country'),
                retailer:jQuery("#me_retailer").val()
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = resp, userDetails;
                
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }
                jQuery("#reg_str").empty();
                jQuery("#reg_str").append('<option value="sel_one">Select One</option>');
                var retailerval = jQuery.trim(jQuery("#me_retailer > option:selected").text());
                if(retailerval == "Other"){
                    jQuery("#reg_str").empty();
                    jQuery("#reg_str").append('<option>Other</option>');
                }
                if(retailerval == "sel_one") {
                    jQuery("#reg_str").append('<option value="sel_one">Select One</option>');
                }
                if(res.response.length > 0 && res.error === false){
                    jQuery.each(res.response, function(i,val){
                        if(val.store != '' && val.store != ' ' && val.store != null){
                            jQuery("#reg_str").append('<option value="'+val.store+'">'+val.store+'</option>');
                        }
                    });
                    jQuery("#reg_str").append('<option value="">Other</option>');
                    if(value == 'service'){
                        jQuery('#reg_str option').filter(function() {
                            return $.trim( $(this).text().toLowerCase() ) == $.trim(userDetails.profile.store.toLowerCase());
                        }).attr('selected','selected');
                        self.setStoreValue();
                    }
                }
            });
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                type: 'POST',
                dataType:'json',
                cache:false,
                crossDomain: true,
                async: this.IEAsyncType(),
                success: function(resp) {
                    succ(resp);
                },
                error : function(x,y,z){
                    if(fail){
					  fail(x,y,z);
					}
                }
            });
        },
        formValidator:function(){
            var elt =  jQuery('input[required]',jQuery(".prof_edit #profile_inputholder")),flag=true;
            jQuery.each(elt,function(index,value){
                if(jQuery.trim(jQuery(this).val()) == '') {
                    jQuery(this).addClass('error_red');
                    flag = false;
                } else {
                    jQuery(this).removeClass('error_red');
                }
            }) ;
            return flag;
        },
        formSelectValidator:function(){
            var elt1 =  jQuery('select[required]',jQuery(".prof_edit #profile_inputholder")),flag=true;
            jQuery.each(elt1,function(index,value){
                if(jQuery(this).val() == "sel_one"){
                    jQuery(this).addClass('error_red');
                    flag = false;
                }else{
                    jQuery(this).removeClass('error_red');
                }
            }) ;
            return flag;
        },
        formValidatorOther:function(){
            var elt =  jQuery('#reg_entretailer_other, #reg_entstore_other',jQuery(".prof_edit #profile_inputholder")),flag=true;
            elt.each(function(index,value){
                if(jQuery(this).val() == '') {
                    jQuery(this).addClass('error_red');
                    flag = false;
                } else {
                    jQuery(this).removeClass('error_red');
                }
            }) ;
            return flag;
        },
        setRetailerValue: function(){
            var userDetails;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var retailFlag=false;
            jQuery('#me_retailer option').filter(function (){
                if(jQuery.trim(jQuery(this).text()) == jQuery.trim(userDetails.profile.retailer)){
                    retailFlag=true;
                    return true;
                }
                if(retailFlag==false){
                    retailFlag=false;
                    return false;
                }
			}).attr('selected',true);
            if(!retailFlag) {
                jQuery('#me_retailer option').filter(function (){
                    return jQuery.trim(jQuery(this).text()) == 'Other';
                }).attr('selected',true);
                jQuery("#reg_entretailer_field").show();
                jQuery("#reg_entretailer_other").val(userDetails.profile.retailer);
                jQuery("#reg_entstore_field").show();
                jQuery("#reg_entstore_other").val(userDetails.profile.store);
            }
        },
        setStoreValue: function(){
            var storeFlag=false; var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }
            jQuery('#reg_str option').filter(function (){
                if(jQuery.trim(jQuery(this).text()) == jQuery.trim(userDetails.profile.store)){
                    storeFlag=true;
                    return true;
                }
                if(storeFlag==false){
                    storeFlag=false;
                    return false;
                }
            }).attr('selected',true);
            if(!storeFlag) {
                jQuery('#reg_str option').filter(function (){
                    return jQuery.trim(jQuery(this).text()) == 'Other';
                }).attr('selected',true);
                jQuery("#reg_entstore_field").show();
                jQuery("#reg_entstore_other").val(userDetails.profile.store);
            }
        }, 
        updateProfile:function(serviceUrl,data){
            var self = this;
            jQuery.ajax({
                url: serviceUrl,
                data:data,
                crossDomain: true,
                type:'POST',
                cache : false,
                dataType:'json',
				async: this.IEAsyncType(),
                success:function(res){
                    if(res == null){
                        /* if(isDevice() && !isOnline()) {
                            jQuery('.nonetconnection').slideDown(2000, function(){
                                jQuery(this).fadeOut(6000);
                            });
                        } */
						if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
							jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
							updateLanguage();
							jQuery('.errorCode-pop').show();
						}
                        self.loginService();
                        jQuery("#profile_edit").hide();
                    }
                },
                error: function() {
                    //alert('UPdate Profile Error 645');
                }
            });
        },
        loginService:function(){
            var self = this;
            var loginserviceUrl = self.globalConfig.apiAddress.service;
            var language, userDetails, pwdFrmLocal;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
				pwdFrmLocal = window.atob(window.localStorage.getItem("psw"));				
            } else {				
                language = $.jStorage.get("language");
                userDetails = JSON.parse($.jStorage.get("USER"));
                pwdFrmLocal = window.atob($.jStorage.get("psw"));
            }            
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            var data = {
                username:userDetails.username,
                password:pwdFrmLocal,
                service: "moodle_mobile_app",
                action:'login'
            };
            jQuery.ajax({
                url: loginserviceUrl,
                type:'POST',
                data:data,
                dataType:'json',
                crossDomain: true,
                async: false,
                success:function(res){
                    if(typeof(res.USER) !== 'undefined'){                        
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.removeItem("USER");
                            window.localStorage.setItem("USER",JSON.stringify(res.USER));
                        } else {
                            $.jStorage.deleteKey("USER");
                            $.jStorage.set("USER",JSON.stringify(res.USER));
                        }
                        Clazz.navigationController.pop(this);
                        jQuery("div.in.out.flip").remove(); // previous selection is display to center when return to click home link or home navigation in header.
                        jQuery("#load_wrapper").show();
                        setTimeout(function (){
                            self.loadPage();
                        }, 300);
                    }
                },
                error : function() {
                   // alert('loginService ajax Error 696');
                }
            });
        }
    });
    return Clazz.com.components.widget.me.js.Me;
});
