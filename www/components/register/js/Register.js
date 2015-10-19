define(["framework/WidgetWithTemplate"] , function(template) {
    Clazz.createPackage("com.components.widget.register.js");
    Clazz.com.components.widget.register.js.Register = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/register/template/register.tmp",
        name : "register",
        localConfig: null,
        globalConfig: null,
        courseItemWidget:null,
        footerWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.footerWidget = new Clazz.com.components.widget.footer.js.Footer();
        },
        loadPage :function(){
            Clazz.navigationController.push(this);
        },
        preRender: function(whereToRender, renderFunction) {
            var self = this;
            
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
              if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<section class="tpbreadcrumbs" id="register"><ul>  \r\n' +
                  '<li class="Reg_cancel regishdlnk"><a href="#" data-msg="login"></a></li>  \r\n' +
                  '<li data-msg="reg-register"></li></ul><div class="clear"></div></section>';
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
            renderFunction(this.data, whereToRender);
           
        },
        bindUI : function(){
        	
            jQuery('body').removeClass("body");
            jQuery('#login_error_msg').hide();
            jQuery("#container").addClass('container');
            var self= this, reg, language, activeLang;
            self.getRegionData();
            reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,3})$/;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
                                                                    
            if(isPhoneGap() && isDevice()){
             jQuery(".privacyPolicy").attr("href","javascript:void(0)");
             jQuery(".termsConditions").attr("href","javascript:void(0)");
            }
            setTimeout(function(){
                if( isDevice() && isPhoneGap() && !checkAppOnline() ) {
                    jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                    updateLanguage();
                    jQuery('.errorCode-pop').show();
                }
            },500);
            var basePath = self.globalConfig.apiAddress.host.replace('admin','');
            var privacyPolicyWeb = Clazz.config.apiAddress.privacyPolicyWeb;
            var termsConditionWeb = Clazz.config.apiAddress.termsConditionWeb;
            var iTouch,privacyPolicy,termsCondition;
            if(isiOS()){
                iTouch = 'touchstart';
            }else{
                iTouch = 'click';
            }
            
            jQuery("footer.footerbx > a.privacyPolicy, footer.footerbx_web > a.privacyPolicy").die().live(iTouch, function(e) {
                var language;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                } else {
                    language = $.jStorage.get("language");
                }
                var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                if(isPhoneGap() && isDevice()){
                          cordova.exec(
                                       function(result){
                                           var res = JSON.parse(result);
                                           if( res.response.downloadFilePath != "file://" ){
                                               policyItemsData={
                                                   getFilePath: res.response.getFilePath,
                                                   downloadFilePath: res.response.downloadFilePath
                                               };
                                               self.loadFileinWeb(self, policyItemsData);
                                           
                                           }else if( res.response.downloadFilePath == "file://" ){
                                               privacyPolicy = 'Clinique_Education_Privacy_Policy_DEVICE';
                                               var getFilePath, downloadFilePath, policyItemsData;
                                               getFilePath = privacyPolicy+'_'+ activeLang +'.docx';
                                               downloadFilePath = basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx';
                                               policyItemsData = {
                                                   getFilePath: getFilePath,
                                                   downloadFilePath: downloadFilePath
                                               }
                                               self.checkIfFileExists(self, policyItemsData);
                                           }
                                       },
                                       function(){},"OfflineServicePlugin","getTermsAndConditions",["privacyPolicy",activeLang]);
                            
                }
                else{
                    privacyPolicy = privacyPolicyWeb;                    
                    jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx');
                }
            });
            jQuery("footer.footerbx > a.termsConditions, footer.footerbx_web > a.termsConditions").die().live(iTouch,function() {
                var language;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 language = window.localStorage.getItem("language");
                } else {
                    language = $.jStorage.get("language");
                }
                var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                if(isPhoneGap() && isDevice()){
                  cordova.exec(
                               function(result){
                                   var res = JSON.parse(result);
                                   if( res.response.downloadFilePath != "file://" ){
                                       policyItemsData={
                                           getFilePath: res.response.getFilePath,
                                           downloadFilePath: res.response.downloadFilePath
                                       };
                                       self.loadFileinWeb(self, policyItemsData);
                               
                                   }else if(res.response.downloadFilePath == "file://" ){
                               
                                       termsCondition = 'Clinique_Education_Terms_And_Conditions_DEVICE';
                                       var getFilePath, downloadFilePath, policyItemsData;
                                       getFilePath = termsCondition+'_'+ activeLang +'.docx';
                                       downloadFilePath = basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx';
                                       policyItemsData = {
                                           getFilePath: getFilePath,
                                           downloadFilePath: downloadFilePath
                                       }
                                       self.checkIfFileExists(self, policyItemsData);
                                   }
                               },
                               function(){},"OfflineServicePlugin","getTermsAndConditions",["privacyPolicy",activeLang]);
                                                                                                              
                }
                else {
                    termsCondition = termsConditionWeb;
                    jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx');
                }
            });
            activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            jQuery("#reg_uname, #reg_fname, #reg_lname").on('keypress',function(e){
                if(jQuery(this).val().length > 19 && e.which != 8 && e.which != 0){
                    e.preventDefault();
                }
            });
            if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                var inputWidth = jQuery("#register_holder select:first-child").outerWidth();
            }
            jQuery("#Reg_submit").on("tap",function(){
                if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    jQuery("#register_holder select").each(function () {
                        jQuery(this).css("width", inputWidth + "px");
                        jQuery(this).css("width", "auto");
                        jQuery(this).css("width", inputWidth + "px");
                    });
                }
                self.registerSubmit(false);
                window.scrollTo(0, 0);
            });
            jQuery('#register_holder').keypress(function(e) {
                if(e.which == 13) { /*Checks for the enter key*/
                    self.registerSubmit(false);
                }
            });
			jQuery("div#popupRegister").off("click").on("click", function () {
					jQuery("#regPop, .quizmask").hide();
					self.registerSubmit(true);
			});
            
            if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                jQuery("select").each(function () {
                    var el = jQuery(this);
                    el.data("origWidth", el.outerWidth()) // IE 8 can haz padding
                })
                        .mouseenter(function () {
                            jQuery(this).css("width", 'auto');
                        })
                        .bind("blur change", function () {
                            el = jQuery(this);
                            el.css("width", inputWidth +"px");
                        });
            }
            
            jQuery("#reg_region").on('change',function(){
                jQuery("#reg_cntry").removeAttr('disabled');
				jQuery("#reg_cntry").parent().removeClass('disabled');
                jQuery("#reg_retailer, #reg_str").html('<option value="sel_one" data-msg="select_one"></option>').attr('disabled','disabled');
                self.getCountryData();
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field, #reg_entstore_field").hide();
                if(jQuery("#reg_region").val() == "sel_one"){
                    jQuery("#reg_cntry, #reg_retailer, #reg_str").attr('disabled','disabled').html('<option value="sel_one" data-msg="select_one"></option>');
					jQuery("#reg_cntry, #reg_retailer, #reg_str").parent().addClass('disabled');
                 }
            });
            jQuery("#reg_cntry").on('change',function(){
                jQuery("#reg_retailer").removeAttr('disabled');
				jQuery("#reg_retailer").parent().removeClass('disabled');
                jQuery("#reg_str").html('<option value="sel_one" data-msg="select_one"></option>').attr('disabled','disabled');
                self.getRetailerData();
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field, #reg_entstore_field").hide();
                if(jQuery("#reg_cntry").val() == "sel_one"){
                    jQuery("#reg_retailer, #reg_str").attr('disabled','disabled').html('<option value="sel_one" data-msg="select_one"></option>');
					jQuery("#reg_retailer, #reg_str").parent().addClass('disabled');
                }
				if(activeLang == 'it') {
				  if(jQuery("#reg_cntry").val() == "IT"){
                    $("span[data-msg = 'retailer-label']").attr("data-msg", "city-label");
				  } else {
					$("span[data-msg = 'city-label']").attr("data-msg", "retailer-label");
				  }
				}
            });
            jQuery("#reg_retailer").on('change',function(){
                jQuery("#reg_str").removeAttr('disabled');
				jQuery("#reg_str").parent().removeClass('disabled');
                self.getStoreData();
                jQuery("#reg_entretailer_field input, #reg_entstore_field input").removeAttr('required');
                jQuery("#reg_entretailer_field").hide();
                jQuery("#reg_entstore_field").hide();
                var retailerval = jQuery.trim(jQuery("#reg_retailer > option:selected").text());
                if(retailerval == "Other"){
                    jQuery("#reg_entretailer_field").show();
                    jQuery("#reg_entstore_field").show();
                    jQuery("#reg_entretailer_field input").attr('required', true);
                    jQuery("#reg_entstore_field input").attr('required', true);
                }
                if(jQuery("#reg_retailer").val() == "sel_one"){
                    jQuery("#reg_str").attr('disabled','disabled');
					jQuery("#reg_str").parent().addClass('disabled');
                }
                if(jQuery("#reg_retailer").val() == "Other"){
                    jQuery("#reg_str").append('<option>Other</option>');
                }
            });
            jQuery("#reg_str").on('change',function(){
                var storeval = jQuery.trim(jQuery("#reg_str > option:selected").text());
                if(storeval == "Other"){
                    jQuery("#reg_entstore_field").show();
                    jQuery("#reg_entstore_field input").attr('required', true);
                }
                else {
                    jQuery("#reg_entstore_field").hide();
                    jQuery("#reg_entstore_field input").removeAttr('required');
                }
            });
            jQuery("#regmsg_modal_close,.Reg_cancel").off('tap').on('tap',function(){
                jQuery("body").removeClass('unScrolled');
                jQuery('#regmsg_modal').modal('hide');
                jQuery('#container.nopad:last').removeClass("container");
                Clazz.navigationController.pop(false);
                jQuery('body').addClass("body");
                Clazz.navigationController.getView('#login');
                jQuery('#container').removeClass("container");
                window.scrollTo(0, 0);
                //jQuery( "body" ).scrollTop(100);
            });
            initLanguages();
        },
        checkIfFileExists: function(self, policyItemsData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false, fileName;
                fileName = policyItemsData.getFilePath;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        var i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) {  /*check if already exist.*/
                                    policyItemsData.downloadFilePath = entries[i].fullPath;
                                    self.loadFileinWeb(self, policyItemsData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
                                self.downloadFile(self, policyItemsData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, policyItemsData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, policyItemsData);
                });
            } else {
                self.loadFileinWeb(self, policyItemsData);
            }
        },
        downloadFile: function(self, policyItemsData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
                var fileName = policyItemsData.getFilePath, downloadFileURL = policyItemsData.downloadFilePath;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*create folder into local drive*/
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        var filePath = fileEntry.fullPath + "/" + fileName;
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        // Please wait. Your file will load in a few seconds.
                        fileTransfer.onprogress = function(progressEvent) {
                            jQuery("#load_wrapper, .overlaycontainer").show();
                        };
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            policyItemsData.downloadFilePath = fileDir.fullPath;
                            self.loadFileinWeb(self, policyItemsData); /*load downloaded file into iframe/ video*/
                        }, function(error) {
                            //console.log("**********download error source " + error.source);
                            //console.log("********download error target " + error.target);
                            //console.log("*********upload error code: " + error.code);
                        });
                    }, self.fileError);
                }, self.fileError);
            } else {
                /* jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                }); */
				
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('.errorCode-pop').show();
				
            }
        },
        fileError: function(evt) {
            //console.log("Error occured in download : ******** " + JSON.stringify(evt));
        },
        loadFileinWeb: function(self, policyItemsData){
            var filePath = policyItemsData.downloadFilePath;
            if(isDevice() && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").hide();
                if( /Android/i.test(navigator.userAgent) ) {
                    //window.plugins.fileOpener.open(filePath);
                	//console.log("TERMS CONDITION="+filePath);
                    cordova.exec(
                            function (args) {},
                            function (args) {},
                            'FileOpener','openVideoFile',[filePath]);
                    return false;
                }
                else{
                    var docHeight = $(document).height(), docWidth = $(window).width();
					jQuery(window).off("orientationchange").on("orientationchange",function(){
					   docWidth = $(window).width();
					   jQuery('#legalContent-iframe').css('width',docWidth);
					});
					if(navigator.platform.indexOf("iPad") == -1){
                           docWidth = '640px';
                           jQuery(window).off("orientationchange").on("orientationchange",function(){
                               docWidth = '640px';
                               jQuery('#legalContent-iframe').css('width',docWidth);
                            });
                    }
                    jQuery(".legalDocs").prepend('<div style="margin: 0; position: fixed; top:10px; right:10px;" class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
                    jQuery('<iframe/>', {
                        name: 'legalContent-iframe',
                        id: 'legalContent-iframe',
                        height:docHeight,
                        width:docWidth,
                        src: filePath
                    }).appendTo(jQuery('.legalDocs'));
                    jQuery(".legalDocs, .quizmask").show();
                }
            }
        },
        getRegionData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'region'
            };
            self.ajaxReq(serviceUrl,data,function(resp){
				var res = resp;
                jQuery("#reg_region").empty();
                jQuery("#reg_region").append('<option value="sel_one" data-msg="select_one"></option>');
                if(res.response.length > 0 && res.error === false){
                    jQuery.each(res.response, function(i,val){
                        if(val.region != '' || val.region != ' ' || val.region != null){
                            jQuery("#reg_region").append('<option data-region="'+val.region+'" value="'+i+'">'+val.region+'</option>');
                        }
                    });
                }
				loadAllLanguages();
            });
        },
        getCountryData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'country',
                region:jQuery("#reg_region option:selected").attr('data-region')
            };
            self.ajaxReq(serviceUrl,data,function(resp){
            	var res = resp;
                jQuery("#reg_cntry").empty();
                jQuery("#reg_cntry").append('<option value="sel_one" data-msg="select_one"></option>');
                if(res.response.length > 0 && res.error == false){
                    jQuery.each(res.response, function(i,val){
                        if(val.country != '' || val.country != ' ' || val.country != null){
                            jQuery("#reg_cntry").append('<option data-country="'+val.country+'" value="'+val.code+'">'+val.country+'</option>');
                        }
                    });
                }
				loadAllLanguages();
            });
        },
        getRetailerData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'retailer',
                region:jQuery("#reg_region option:selected").attr('data-region'),
                country:jQuery("#reg_cntry option:selected").attr('data-country')
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                jQuery("#reg_retailer").empty();
                jQuery("#reg_retailer").append('<option value="sel_one" data-msg="select_one"></option>');
                if(resp.response.length > 0 && resp.error === false){
                    jQuery.each(resp.response, function(i,val){
                        if(val.retailer != '' || val.retailer != ' ' || val.retailer != null){
                            jQuery("#reg_retailer").append('<option value="'+val.retailer+'">'+val.retailer+'</option>');
                        }
                    });
                }
				jQuery("#reg_retailer").append('<option value="Other">Other</option>');
				loadAllLanguages();
            });
        },
        getStoreData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
                action:'cascade_dropdown',
                type:'store',
                region:jQuery("#reg_region option:selected").attr('data-region'),
                country:jQuery("#reg_cntry option:selected").attr('data-country'),
                retailer:jQuery("#reg_retailer").val()
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                jQuery("#reg_str").empty();
                jQuery("#reg_str").append('<option value="sel_one" data-msg="select_one"></option>');
                var retailerval = jQuery.trim(jQuery("#reg_retailer > option:selected").text());
                if(retailerval == "Other"){
                    jQuery("#reg_str").empty();
                    jQuery("#reg_str").append('<option>Other</option>');
                }
                if(retailerval == "sel_one") {
                    jQuery("#reg_str").append('<option value="sel_one" data-msg="select_one"></option>');
                }
                if(resp.response.length > 0 && resp.error === false){
                    jQuery.each(resp.response, function(i,val){
                        if(val.store != '' || val.store != ' ' || val.store != null){
                            jQuery("#reg_str").append('<option value="'+val.store+'">'+val.store+'</option>');
                        }
                    });
                    jQuery("#reg_str").append('<option value="Other">Other</option>');
                }
				if(resp.response === 'empty' &&  resp.error === true){
					jQuery("#reg_str").append('<option value="Other">Other</option>');
                }  
				loadAllLanguages();
            });
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
			if(this.returnIeVersion() || $('html').hasClass('ie9')){
						this.ieEightAndIeNine();
					}
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                crossDomain: true,
	            type : 'POST',
	            cache : false,
	            dataType : 'json',
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
        registerSubmit: function(iflag){
            var self= this, reg, language, activeLang, regUname, regFname, regLname, regPwd, regMail, regRegion, regRegionkey, regCountry,
            regRetailer, regStore, regLang, regJob, serviceUrl, data, farmValid, farmSelectValid, pwdValid,otherFlag=0;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            activeLang = (language!==undefined && language!==null)?language:defaultLang;
            loadLanguages(activeLang);
            reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,3})$/;
            regUname = jQuery("#reg_uname").val().toLowerCase();
            regFname = jQuery("#reg_fname").val();
            regLname = jQuery("#reg_lname").val();			
			regPwd = window.btoa(jQuery("#reg_pwd").val());				            
            regMail = jQuery("#reg_mail").val();
            //regRegion = jQuery.trim(jQuery("#reg_region").val());
            regRegion = jQuery.trim(jQuery("#reg_region option:selected").text());
            regRegionkey = jQuery("#reg_regionKey").val();
            regCountry = jQuery.trim(jQuery("#reg_cntry").val());
            regRetailer = jQuery.trim(jQuery("#reg_retailer").val());
            if(regRetailer == "Other") {
                regRetailer = jQuery.trim(jQuery("#reg_entretailer_other").val());
                otherFlag=1;
            }
            regStore = jQuery.trim(jQuery("#reg_str").val());
            if(regStore == "Other") {
                regStore = jQuery.trim(jQuery("#reg_entstore_other").val());
                 otherFlag=1;
            }
            regLang = jQuery("#reg_lang").val();
            regJob = jQuery("#reg_job").val();
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                sessionStorage.setItem("registerLang",regLang);
            } else {
                //sessionStorage.setItem("registerLang",regLang);
            }
			defaultLang = regLang;
			loadLanguages(regLang);
			if(regLang !== null) { 
				   activeLang = regLang;
			}
            serviceUrl = self.globalConfig.apiAddress.service;
            data = {
                action:'self_registration',
                username:regUname,
                password:regPwd,
                firstname:regFname,
                lastname:regLname,
                email:regMail,
                region:regRegion,
                retailer:regRetailer,
                store:regStore,
                country:regCountry,
                lang:regLang,
                regionkey:regRegionkey,
                jobtitle:regJob,
				insertflag:iflag,
				others:otherFlag
            }
            farmValid = self.formValidator();
            farmSelectValid = self.formSelectValidator();
            pwdValid = self.passwordValidation();
            if(reg.test(regMail)){
                jQuery('#reg_mail:last').removeClass('error_red');
            }else{
                jQuery('#reg_mail:last:not(.error_red)').addClass('error_red');
            }
            if(farmValid && pwdValid && farmSelectValid){
                if(!reg.test(regMail)) {
                    jQuery('#email_error_msg').show();
                    jQuery('#email_error_msg').addClass('invalidbtn');
                    translateErrormsg(jQuery('#email_error_msg'),activeLang,'fp_invalid_email');
                }else{
                    self.regService(serviceUrl,data,activeLang);
                }
            }
            if(isiPad()){
                $("html,body").scrollTop(0);
            }else{
                jQuery(':input[value=""]:visible:first').focus();
            }
        },
        formValidator:function() {
            var elt =  jQuery('input[required]', jQuery("#register_holder")),flag=true;
            $.each(elt,function(index,value){
                if(jQuery.trim(jQuery(this).val()) == ''){
                    jQuery(this).addClass('error_red');
                    flag = false;
                }else{
                    jQuery(this).removeClass('error_red');
                }
            }) ;
            return flag;
        },
        formSelectValidator:function(){
            var elt1 =  jQuery('select[required]',jQuery("#register_holder")),flag=true;
            $.each(elt1,function(index,value){
                if(jQuery(this).val() == "sel_one"){
                    jQuery(this).addClass('error_red');
                    flag = false;
                }else{
                    jQuery(this).removeClass('error_red');
                }
            }) ;
            return flag;
        },
        regService:function(serviceUrl,data,activeLang){
			 var self=this;
            jQuery.ajax({
                url: serviceUrl,
                type:'POST',
                data:data,
                dataType:'json',
                cache:false,
                crossDomain: true,
                async: this.IEAsyncType(),
                success:function(res){
                    if(res != undefined){
                        if(!res.error){
							if(res.response == 'show_popup'){
							  // translateErrormsg(jQuery('#registerCnt'), activeLang, 'popup_legal_cntReg');
							  jQuery("#regPop, .quizmask").show();
							            var basePath = self.globalConfig.apiAddress.host.replace('admin','');
										var privacyPolicyWeb = Clazz.config.apiAddress.privacyPolicyWeb;
										var termsConditionWeb = Clazz.config.apiAddress.termsConditionWeb;
										var iTouch,privacyPolicy,termsCondition;
										if(isiOS()){
											iTouch = 'touchstart';
										}else{
											iTouch = 'click';
										}
										jQuery("#popup_privacyPolicy").on(iTouch,function(e) {
                                            var language;
                                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                                language = window.localStorage.getItem("language");
                                            } else {
                                                language = $.jStorage.get("language");
                                            }
											var activeLang = (language!==undefined && language!==null)?language:defaultLang;
											if(isPhoneGap() && isDevice()){
												privacyPolicy = 'Clinique_Education_Privacy_Policy_DEVICE';
												var getFilePath, downloadFilePath, policyItemsData;
												getFilePath = privacyPolicy+'_'+ activeLang +'.docx';
												downloadFilePath = basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx';
												policyItemsData = {
													getFilePath: getFilePath,
													downloadFilePath: downloadFilePath
												}
												self.checkIfFileExists(self, policyItemsData);
											}
											else{
												privacyPolicy = privacyPolicyWeb;
												jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx');
											}
										});
							}else{
								jQuery("#regPop, .quizmask").hide();
								jQuery("body").addClass('unScrolled');
                                jQuery('#regmsg_modal').modal({
                                backdrop: 'static',
                                keyboard: false
                                });
							}
                        } else {
                            if(res.response == "username_exists") {
                                jQuery('#reg_uname').addClass('error_red').focus();
                            } else if(res.response == "regionkey_not_exists") {
                                jQuery('#reg_regionKey').addClass('error_red').focus();
                            } else if(res.response == "email_exists") {
                                jQuery('#reg_mail').addClass('error_red').focus();
                            }
                        }
                    }
                }
            });
        },
        passwordValidation:function(){
            var language;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
               language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            var regpwd = jQuery("#reg_pwd").val(),pwdFlag =true;
            var regCnfpwd = jQuery("#reg_cnfpwd").val();
            if(0 < regpwd.length && regpwd.length < 6 ) {
                jQuery('#reg_pwd, #reg_cnfpwd').addClass('error_red');
                pwdFlag = false;
            } else if(regpwd != regCnfpwd) {
                jQuery('#reg_pwd, #reg_cnfpwd').addClass('error_red');
                pwdFlag = false;
            } else {
                pwdFlag = true;
            }
            return pwdFlag;
        }
    });
    return Clazz.com.components.widget.register.js.Register;
});
