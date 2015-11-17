define(["framework/WidgetWithTemplate","home/Home","changePwd/ChangePwd","abstract/offlineStorage","register/Register"] , function(template) {
    Clazz.createPackage("com.components.widget.login.js");
    Clazz.com.components.widget.login.js.Login = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/login/template/login.tmp",
        configUrl: "../../componens/login/config/config.json",
        name : "login",
        localConfig: null,
        globalConfig: null,
        homeWidget:null,
        changePwdWidget:null,
		offlineStorage: null,
        registerWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
            this.homeWidget = new Clazz.com.components.widget.home.js.Home();
            this.changePwdWidget = new Clazz.com.components.widget.changePwd.js.ChangePwd();
            this.registerWidget = new Clazz.com.components.widget.register.js.Register();
        },
        loginTest : function(templateUrl, localConfig){
            this.templateUrl = templateUrl;
            this.localConfig = localConfig;
        },
        loadPage :function(config){
		   if(!($.browser.msie  && parseInt($.browser.version, 10) === 7)) {
				window.localStorage.removeItem("avoidSplash");
			}
            else {
                try {
                    window.localStorage.removeItem("avoidSplash");
                }catch(e) {
                }
            }
            this.globalConfig = config;
			Clazz.navigationController.push(this);
        },
        postRender : function(){
            var basePath = this.globalConfig.apiAddress.host.replace('admin',''), self = this;
            var privacyPolicyWeb = Clazz.config.apiAddress.privacyPolicyWeb;
            var termsConditionWeb = Clazz.config.apiAddress.termsConditionWeb;
            var iTouch,privacyPolicy,termsCondition;
            if(isiOS()){
                iTouch = 'touchstart';
            }else{
                iTouch = 'click';
            }
            
            if(isPhoneGap() && isDevice()){
              jQuery(".privacyPolicy").attr("href","javascript:void(0)");
              jQuery(".termsConditions").attr("href","javascript:void(0)");
			  jQuery("#popup_privacyPolicy").attr("href", "javascript:void(0)");
            }
            jQuery("div.footerbx > a.privacyPolicy").on(iTouch,function(e) {
                var language;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                }
                else {
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
                                                              
            jQuery("#popup_privacyPolicy").die().live('click', function(){
              var language;
              if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
              language = window.localStorage.getItem("language");
              }
              else {
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
            jQuery("div.footerbx > a.termsConditions").on(iTouch,function() {
                var language; 
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                }
                else {
                    language = $.jStorage.get("language");;
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
                                   function(){},"OfflineServicePlugin","getTermsAndConditions",["termsCondition",activeLang]);
                }
                else{
                    termsCondition = termsConditionWeb;
                    jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx');
                }
            });
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
                   // console.log("TERMS CONDITION="+filePath);
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
        onResume: function (){
            jQuery("footer.footerbx").remove();
			// var regLang = sessionStorage.getItem('registerLang');
			var regLang;
			
			if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
				regLang = window.localStorage.getItem("language");
			} else {
				regLang = $.jStorage.get("language");
			}
			regLang = (regLang)?regLang:defaultLang;
			jQuery("#language-dropdown option[value='" + regLang + "']").attr('selected', true);
            if (regLang === 'ar' || regLang === 'he') {
                if (!(jQuery('#loginform').hasClass('text-dir-rt'))) {
                    jQuery('#loginform, #forgot_pass').addClass('text-dir-rt');
                }
            }
            else {
                if (jQuery('#loginform').hasClass('text-dir-rt')) {
                    jQuery('#loginform, #forgot_pass').removeClass('text-dir-rt');
                }
            }            
			defaultLang = regLang;
			loadLanguages(regLang);
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var self = this, iTouch = 'click';
            self.UserDetails={};
            var language;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            }
            else {
                language = $.jStorage.get("language");
            }
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
			if(activeLang == 'ar' || activeLang == 'he') {
			   jQuery('head').append('<link rel="stylesheet" href="../css/ahdirection.css" type="text/css" />');
                jQuery('#loginform, #forgot_pass').addClass('text-dir-rt');
			}
            if(isiOS()){
                iTouch = 'touchstart';
            }
            jQuery('.legalDocs .ifram_cls_btn').die().live(iTouch, function(){
                if(jQuery(".legalDocs .ifram_cls_btn").length){
                    jQuery(".legalDocs").empty();
                    jQuery(".legalDocs, .quizmask").hide();
                }
            });
            $('#container').removeClass('nopad container');
            $('#container').removeClass('container');
            $("div.footerbx").css("bottom","0");
            jQuery(".fancy").die().live('click',function(){
                jQuery("div.fancydropitem").slideUp();
                var expandContainer = jQuery(this).siblings("div.fancydropitem");
                var expandContainerEvent = expandContainer.css('display');
                if(expandContainerEvent === 'none'){
                    jQuery(this).siblings("div.fancydropitem").slideDown();
                    return;
                }
                else{
                    jQuery(this).siblings("div.fancydropitem").slideUp();
                }
            });
            jQuery("#forgotpwd_a").click(function(){
                 if( isDevice() && !isOnline() && isPhoneGap() ){
                     jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                     updateLanguage();
                     jQuery('.errorCode-pop').show();
                     return false;
                 }
                    jQuery('html').css("overflow", "hidden");
                    jQuery('#login_error_msg').hide();
                    var loginBox = jQuery(this).attr('href');
                    jQuery.fn.removeClassExcept = function (val) {
                        return this.each(function () {
                            $(this).removeClass().addClass(val);
                        });
                    };
                    jQuery('.login-popup').parent().parent().removeClassExcept("widget-maincontent-div");
                    //Fade in the Popup
                    jQuery(loginBox).fadeIn(300);
                    //Set the center alignment padding + border see css style
                    var popMargTop = (jQuery(loginBox).height() + 24) / 2;
                    var popMargLeft = (jQuery(loginBox).width() + 24) / 2;
                    jQuery(loginBox).css({
                        'margin-top' : -popMargTop,
                        'margin-left' : -popMargLeft
                    });
                    // Add the mask to body
                    if(!jQuery('#mask').length) {
                    jQuery('body').append('<div id="mask"></div>');
                    }
                    jQuery('#mask').addClass('unScrolled');
                    jQuery('#mask').fadeIn(300);
                    jQuery('#email_error_msg').html("");
                    jQuery('#email').val('');
                    //jQuery('#email').focus();
                    jQuery('#forget_popup, .forgotbx_holder, .enterbtn').show();
                    jQuery('.OKbtn, .success_msg, #email_error_msg').hide();
                    if($('html').hasClass('ie8')){
                        $("#forgot_pass .test").addPlaceholder();				
                        jQuery('#email').focusout();
                    }
                    return false;
            });
            jQuery('div.close').live('click', function() {
                jQuery("body").removeClass('unScrolled');
                jQuery('#email_error_msg').empty();
                jQuery('#mask , .login-popup').fadeOut(300 , function() {
                    jQuery('#mask').remove();
                });
                return false;
            });
            jQuery("#language-dropdown").change(function(){
                var selLang = jQuery(this).val(), language;
                 if (selLang === 'ar' || selLang === 'he') {
                     if(!(jQuery('#loginform').hasClass('text-dir-rt'))) {
                        jQuery('#loginform, #forgot_pass').addClass('text-dir-rt');
                     }
                }
                else {
                    if(jQuery('#loginform').hasClass('text-dir-rt')) {
                        jQuery('#loginform, #forgot_pass').removeClass('text-dir-rt');
                    }
                }
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                   window.localStorage.setItem("language",selLang);
                   language = window.localStorage.getItem("language");
                }
                else {
                    $.jStorage.set("language",selLang);
                    language = $.jStorage.get("language");
                }
                activeLang = (language!==undefined && language!==null)?language:defaultLang;
                loadLanguages(activeLang);
				if(activeLang == 'ar' || activeLang == 'he') {
				   $('head').append('<link rel="stylesheet" href="../css/ahdirection.css" type="text/css" />');
				} else {
				   $("LINK[href*='../css/ahdirection.css']").remove();
				}
            });
            jQuery("#frg_psw_sub").die().live('click',function(){
                self.emailvalidate(activeLang);
            });
            jQuery('#forgot_pass').keypress(function(e) {
                if(e.which == 13) { /*Checks for the enter key*/
                    self.emailvalidate(activeLang);
                }
            });
            jQuery("form#forgot_pass").submit(function(e) {
                return false;
            });
            jQuery('#signin').bind('click',function(){
                var serviceUrl = self.globalConfig.apiAddress.service;
				var userValue = jQuery('#name').val() === jQuery('#name').attr('placeholder') ? '' : jQuery('#name').val();
				var data = {
                    username: userValue,
                    password:jQuery('#pwd').val(),
                    service: "moodle_mobile_app",
                    action:'login'
                };
               
                jQuery('#login_error_msg').show();
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                }
                else {
                    language = $.jStorage.get("language");
                }
                activeLang = (language!==undefined && language!==null)?language:defaultLang;
                var regLang;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    regLang = sessionStorage.getItem('registerLang');
                }
                else {
                    regLang = null;
                }
                if(regLang === null) { 
				   regLang = activeLang;
				}
                self.loginAuth(serviceUrl,data,regLang);
            });
            jQuery('#loginform').keypress(function(e) {
                if(e.which == 13) { /*Checks for the enter key*/
                  
                    var serviceUrl = self.globalConfig.apiAddress.service;
                    var data = {
                        username:jQuery('#name').val(),
                        password:jQuery('#pwd').val(),
                        service: "moodle_mobile_app",
                        action:'login'
                    };
                    self.loginAuth(serviceUrl,data,activeLang);
					 jQuery('#name').blur();
                    jQuery('#pwd').blur();
                    e.preventDefault(); /*Stops IE from triggering the button to be clicked*/
                }
            });
            jQuery("#register_a").bind('click',function(){
                                       
                self.registerWidget.loadPage();
                                       
            });
            jQuery(window).resize(function (){
                setTimeout(function (){
                    jQuery('#mask').css({
                        'height':$(document).height(), /* $(document).height() */
                        'width':'100%'
                    });
                }, 1000);
            });
            jQuery(".errorCodOK").off("click").on("click", function () {
            	jQuery('.errorCode-pop').removeClass("programmsgdsp");
            	jQuery(".errorCode-pop,.overlaylightbox,.commentmodal-backdrop").hide();
            	jQuery('.errorCode-pop .prog-summarys').attr('data-msg','');
                jQuery('body').removeClass("scrollHidden report-details-show");
            });
            
            jQuery(".enoughspace-pop .ok").off("click").on("click", function () {
            	jQuery("#login").show();
           	 	jQuery('body').css("background-image","block");
            	jQuery('.enoughspace-pop').removeClass('shown');
       	     	jQuery('.enoughspace-pop,.overlaylightbox').hide();
            });
            
            jQuery(".enoughspace-pop .retry").off("click").on("click", function () {
            	
            	jQuery('.enoughspace-pop').removeClass('shown');
       	     	jQuery('.enoughspace-pop,.overlaylightbox').hide();
            	jQuery("#login").hide();
				$("progress").attr('value','0');
				$(".prog-percent").text("");
				progressInitiate();
				
            	cordova.exec(
            			function (result) {
            				
            			},
            			function (result) {
            				
            				jQuery("#load_wrapper").hide();
            				jQuery("#login").show();
            				jQuery('body').css("background-image","block");
            				var error = JSON.parse(result);
                			   console.log(error.errorCode);
                               jQuery('.errorCode-pop .prog-summarys').attr('data-msg',error.errorCode);
                               updateLanguage();
                			   jQuery('.commentmodal-backdrop,.errorCode-pop').show();
                			   
            			},'OfflineSyncPlugin', 'FirstLaunchSync', [self.UserDetails.user.id,self.UserDetails.user.token]);
            });
            
            
			jQuery("div#popupSignIn").die().live("click", function () {
				self.doLoginSuccess();
			});
			//jQuery("div#signInPopupCls").off("click").on("click", function () {
			jQuery("div#signInPopupCls").die().live("click", function () {
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.removeItem("loginSuccessData");
                } else {
                    $.jStorage.deleteKey("loginSuccessData");
                }
				jQuery(".popup, .quizmask").hide();
			});
                                                              
             jQuery("#backbtn").die().live("click", function () {
                    cordova.exec(function(winParam) {},
                    function(error) {},"ElearningPlugin","backToBlueOcean",[]);
             });
            //if(localStorage.getItem("logout"=="true")){
             if( (navigator.platform == "iPad" || navigator.platform == "iPad Simulator") && (isDevice()) ){
               setTimeout(function() {
              // alert(1+" and "+localStorage.getItem("BOstatus"))
               if(localStorage.getItem("BOstatus") == "0"){
               // alert(localStorage.getItem("BOstatus"));
                jQuery("#backbtn").show();
               }
               else {
                 jQuery("#backbtn").hide();
               }
                          },100);
                                                              
                }else{
                jQuery("#backbtn").hide();
                }
                                                                // }
                                                              
			if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
				jQuery('.test').addPlaceholder();
				/* var returnFlag=false;
				jQuery('#name').keypress(function(){
					returnFlag=true;
				})
				jQuery('#name').focusout(function(){	
						if(returnFlag==false){
							if(!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
								loadLanguages(window.localStorage.getItem("language"));
							} else {
								loadLanguages($.jStorage.get("language"));
							}							
						}
						returnFlag=false;
				}) */
			}
           // jQuery("input:text:visible:first").focus();
            try {
                jQuery('.cls_btn').die().live('click', function () {
                    jQuery('html').css("overflow", "");
                });
                
            }catch(e) {
              // Nothing to do  
            }
        },
        emailvalidate: function (activeLang){
            var self = this, email = jQuery.trim($("#email").val());
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,3})$/;
            var serviceUrl = self.globalConfig.apiAddress.service;
			var data = {
                email:email,
                action:'forgot_password'
            };
            if(email.length === 0){
                jQuery('#email_error_msg').show();
                jQuery('#email_error_msg').addClass('invalidbtn');
                translateErrormsg(jQuery('#email_error_msg'),activeLang,'fp_invalid_email');
                return false;
            }
            if(!reg.test(email)) {
                jQuery('#email_error_msg').show();
                jQuery('#email_error_msg').addClass('invalidbtn');
                translateErrormsg(jQuery('#email_error_msg'),activeLang,'fp_invalid_email');
                jQuery('#email_error_msg').show();
                translateErrormsg(jQuery('#email_error_msg'),activeLang,'fp_invalid_email');
                
            }else{
                if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
                   /* jQuery('.nonetconnection').slideDown(2000, function(){
                       jQuery(this).fadeOut(6000);
                   }); */
				   jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('.errorCode-pop').show();
					
                    jQuery('#email_error_msg').hide();
                    return false;
                }
                self.forgotPasswordApi(serviceUrl,activeLang,data);
            }
        },
        forgotPasswordApi: function(serviceUrl,activeLang,data){
              if(this.returnIeVersion() || $('html').hasClass('ie9')){
                this.ieEightAndIeNine();
            }
            jQuery.ajax({
                url: serviceUrl,               
                data:data,
                crossDomain: true,
                        type : 'POST',
                        cache : false,
                        dataType : 'json',
                        async: this.IEAsyncType(),
                beforeSend:function(){
                    jQuery(".loaderbx").show();
                    jQuery('#email_error_msg').hide();
                },
                success:function(res){
                    jQuery(".loaderbx").hide();
                    if(!res.error){
                        jQuery('#email_error_msg').show();
                        jQuery('#email_error_msg').addClass('invalidbtn');
                        translateErrormsg(jQuery('#email_error_msg'),activeLang,res.msg);
                    }else{
                        jQuery('#email_error_msg').hide();
                        translateErrormsg(jQuery('.success_msg'),activeLang,res.msg);
                        switch(activeLang){
                            case 'ja':
                                jQuery('.success_msg').append("パスワードが <span class='success_email'>"+data.email+"</span> 宛に送信されました");
                                break;
                            case 'ko':
                                jQuery('.success_msg').append(" 비밀번호가 <span class='success_email'>"+data.email+"</span> 로 전송되었습니다");
                                break;
                            case 'de':
                                jQuery('.success_msg').append("Das Passwort wurde an <span class='success_email'>"+data.email+"</span> gesendet");
                                break;
                            case 'tr':
                                jQuery('.success_msg').append("Şifreniz <span class='success_email'>"+data.email+"</span> ’ne gönderildi.");
                                break;
                            default:
                                jQuery('.success_msg').append('<span class="success_email">'+data.email+'</span>');
                                break;
                        }
                        jQuery('.OKbtn,.success_msg').show();
                        jQuery('.forgotbx_holder, .enterbtn').hide();
                        jQuery('.OKbtn').click(function(){
                            jQuery('#forget_popup, #mask').hide();
                        });
                    }
                },
                error:function(){
                }
            });
            jQuery('#email_error_msg').removeClass('invalidbtn');
        },
        loginAuth : function(serviceUrl,data,activeLang){
            var self=this, error=true, offlineStorage = null, userName = "", passWord = "";
            userName = data.username;
            passWord = data.password;
            offlineStorage = self.offlineStorage;
            jQuery("#load_wrapper").show();
            if (userName === "") {
                translateErrormsg(jQuery('#login_error_msg'), activeLang, 'username_error');
                jQuery("#load_wrapper").hide();
            } else if (passWord === "") {
                translateErrormsg(jQuery('#login_error_msg'), activeLang, 'password_error');
                jQuery("#load_wrapper").hide();
            } else {
                jQuery('#login_error_msg').empty();
                error = false;
            }
            
            if(!error){
            	if( isDevice() ){
                	cordova.exec(
                			function (result) {
	                		    var userObj={};
	                            jQuery("#container").addClass('container');
	                            self.UserDetails = JSON.parse(result);
	                            console.log("UserDetails=="+JSON.stringify(self.UserDetails));
	                            jQuery("#load_wrapper").hide();
                                
                                var language = window.localStorage.getItem("language");
                                var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                                trnslateError_htmlFormating(jQuery('.legalpopupcnt'),activeLang,"popup_legal_cnt");
                                 
                                jQuery(".legalpopupcnt").find("#popup_privacyPolicy").attr("href", "javascript:void(0)");
	                            jQuery("#loginPop, .quizmask, .forgotbx_holder, #popupSignIn").show();
	                            userObj.USER=self.UserDetails.user;
	                            window.localStorage.setItem("loginSuccessData", JSON.stringify(userObj));
	                            window.localStorage.setItem("USER", JSON.stringify(self.UserDetails.user));
                                window.localStorage.setItem("FIRST_TIME_USER",self.UserDetails.FIRST_TIME_USER);
                		   },
                           function (args) {
                			   jQuery("#load_wrapper").hide();
                			   var error = JSON.parse(args);
                			   console.log(error.errorCode);
                			   
                               var language = window.localStorage.getItem("language");
                               var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                               jQuery('.errorCode-pop .prog-summarys').attr('data-msg',error.errorCode);
                               trnslateError_htmlFormating(jQuery('.errorCode-pop .prog-summarys'),activeLang,error.errorCode);
                               if( error.errorCode == "ERR10006" || error.errorCode == "ERR10004"){
                                 jQuery('.errorCode-pop').addClass('programmsgdsp');
                               }else{
                                 jQuery('.errorCode-pop').removeClass('programmsgdsp');
                               }
                               jQuery('.errorCode-pop').addClass('programmsgdsp');
                			   jQuery('.errorCode-pop,.overlaylightbox').show();
                			   

                		   },'LoginPlugin', 'login', [data]);

                }else if (offlineStorage.isDevice() && !offlineStorage.isOnline()) {
                    passWord = window.btoa(passWord);
                    offlineStorage.getRecords("SELECT ref_data FROM user_account WHERE username = ? AND password = ?", [userName, passWord], function(res, records) {
                        if (records.rows.length > 0) {
                            var resData = records.rows.item(0);

                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                    window.localStorage.setItem("USER", resData.ref_data);
                                }
                                else {
                                    $.jStorage.set("USER", resData.ref_data);
                                }
                            self.homeWidget.loadPage();
                        } else {
                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                    window.localStorage.removeItem("USER");
                                }
                                else {
                                    $.jStorage.deleteKey("USER");
                                }
                            translateErrormsg(jQuery('#login_error_msg'), activeLang, 'loginauth_error');
                        }
                    });
                } else {
					  if(this.returnIeVersion() || $('html').hasClass('ie9')){
						this.ieEightAndIeNine();
					}
                   jQuery.ajax({
                        url: serviceUrl,
                        data:data,
						crossDomain: true,
                        type : 'POST',
                        cache : false,
                        dataType : 'json',
                        async: false,
                        success:function(res) {
                            if(typeof(res.USER) !== 'undefined') {
                                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                    window.localStorage.setItem("loginSuccessData", JSON.stringify(res));
                                }
                                else {
                                    $.jStorage.set("loginSuccessData", JSON.stringify(res));
                                }

								// translateErrormsg(jQuery('.forgotbx_holder p'), activeLang, 'popup_legal_cnt');
								
								jQuery("#load_wrapper").hide();
                                jQuery(".legalpopupcnt").find("#popup_privacyPolicy").attr("href", "javascript:void(0)");
								jQuery("#loginPop, .quizmask, .forgotbx_holder, #popupSignIn").show();
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
										/* privacyPolicy = 'Clinique_Education_Privacy_Policy_DEVICE';
										var getFilePath, downloadFilePath, policyItemsData;
										getFilePath = privacyPolicy+'_'+ activeLang +'.docx';
										downloadFilePath = basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx';
										policyItemsData = {
											getFilePath: getFilePath,
											downloadFilePath: downloadFilePath
										}
										self.checkIfFileExists(self, policyItemsData); */
										
										jQuery(".legalpopupcnt").find("#popup_privacyPolicy").attr("href", "javascript:void(0)");
										cordova.exec(
											function(result){
												var res = JSON.parse(result);
												if( res.response.downloadFilePath != "file://" ){  
													policyItemsData={
														getFilePath: res.response.getFilePath,
														downloadFilePath: res.response.downloadFilePath
													};
													self.loadFileinWeb(self, policyItemsData);
												} else if( res.response.downloadFilePath == "file://" ) {
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
											function(){}, "OfflineServicePlugin", "getTermsAndConditions", ["privacyPolicy",activeLang]
										);
									}
									else{
										privacyPolicy = privacyPolicyWeb;
										jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx');
									}
								});
                            } else {
                                jQuery('#login_error_msg').html(res.error);
                                translateErrormsg(jQuery('#login_error_msg'),activeLang,'loginauth_error');
                                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                    window.localStorage.removeItem("USER");
                                } else {
                                    $.jStorage.deleteKey("USER");
                                }
                            }
                        },
						error:function(){

						}
                    });
                }
            }
        },
		doLoginSuccess: function () {
			jQuery(".popup, .quizmask").hide();
			var userName = jQuery("#name").val(), self = this;
            var res;

            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                res= JSON.parse(window.localStorage.getItem("loginSuccessData"));
                window.localStorage.removeItem("loginSuccessData");
            }
            else {
                res= JSON.parse($.jStorage.get("loginSuccessData"));
                $.jStorage.deleteKey("loginSuccessData", JSON.stringify(res));
            }
			var strUserData = JSON.stringify(res.USER);
            var hashPwd = window.btoa(jQuery('#pwd').val());

            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                window.localStorage.setItem("psw", hashPwd);
                window.localStorage.setItem("USER", strUserData);
            }
            else {
                $.jStorage.set("psw", hashPwd);
                $.jStorage.set("USER", strUserData);
            }
			
			if(!res.USER.forcePasswordChange){
				if( isDevice() ){
					if( self.UserDetails.FIRST_TIME_USER == "Y"){
						jQuery("#load_wrapper").show();
						 if( isPhoneGap() ){
							jQuery("#login").hide();
							$("progress").attr('value','0');
							$(".prog-percent").text("");
							progressInitiate();
							progressStart(self,false);
						 }
		            	cordova.exec(
		            			function (result) {},
		            			function (result) {
		            				jQuery("#load_wrapper").hide();
		            				jQuery("#login").show();
		            				jQuery('body').css("background-image","block");
                                     jQuery(".progress-div,.overlaylightbox").hide();
		            				var error = JSON.parse(result);
		                			   console.log(error.errorCode);
		                			   
                                       jQuery('.errorCode-pop .prog-summarys').attr('data-msg',error.errorCode);
                                       updateLanguage();
		                			   jQuery('.commentmodal-backdrop,.errorCode-pop').show();
                                     
		                			   
		            			},'OfflineSyncPlugin', 'FirstLaunchSync', [self.UserDetails.user.id,self.UserDetails.user.token]);
		            }else{
		            	
		            	jQuery("#login").off();
		    			Clazz.navigationController.pop();
		            	jQuery("#container").addClass('container');
		            	self.gettingCategory();
						self.homeWidget.loadPage();
		            }
					return;
				}else{
					self.gettingCategory();
					jQuery("#login").off();
					Clazz.navigationController.pop(); 
					self.offlineStorage.insertRecords(userName, hashPwd, strUserData);
					jQuery("#container").addClass('container');
					self.homeWidget.loadPage();					
				}
				
			}else{
				jQuery("#container").addClass('container');
				if(jQuery("#ChgPsdcancelBtn").length) {
					Clazz.navigationController.getView('#changePwd');
				} else {
					Clazz.navigationController.pop();
					self.changePwdWidget.loadPage(true);
				}
			}
		},
		storeCategory: function(resp){
			for(var j = 0;j<resp.length; j++){
                if (resp[j].name == "Courses") {
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.setItem("catcrsId", resp[j].id);
                        window.localStorage.setItem("catcrsName", resp[j].name);
                    }
                    else {
                        $.jStorage.set("catcrsId", resp[j].id);
                        $.jStorage.set("catcrsName", resp[j].name);
                    }
                }
                if (resp[j].name == "Resources") {
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.setItem("catrsrcId", resp[j].id);
                        window.localStorage.setItem("catrsrcName", resp[j].name);
                    }
                    else {
                        $.jStorage.set("catrsrcId", resp[j].id);
                        $.jStorage.set("catrsrcName", resp[j].name);
                    }
                }
                if (resp[j].name == "News") {
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.setItem("catnewsId", resp[j].id);
                        window.localStorage.setItem("catnewsName", resp[j].name);
                    }
                    else {
                        $.jStorage.set("catnewsId", resp[j].id);
                        $.jStorage.set("catnewsName", resp[j].name);
                    }

                }
            }
		},
        gettingCategory:function(){
            var self = this;
            var serviceUrl = self.globalConfig.apiAddress.restservice;
            var userDetails;
             if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            }
            else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }

            var data = {
                wsfunction: "core_course_get_categories",
                wstoken: userDetails.token,
                moodlewsrestformat : "json"
            };
           if(this.returnIeVersion() || $('html').hasClass('ie9')){
				this.ieEightAndIeNine();
           }
           if( !isDevice() ){
	            jQuery.ajax({
	                url: serviceUrl,
	                data:data,
					crossDomain: true,
	                type : 'POST',
	                cache : false,
	                dataType : 'json',
	                async: false,
	                success:function(resp){
	                    self.storeCategory(resp);
	                },
	                error:function(){
	                }
	            });
           }else if( isDevice() ){
        	   var data={
        		   userid:userDetails.id
        	   };
        	   cordova.exec(
        			   function(result) {
        				   self.storeCategory(JSON.parse(result));
        			   },
        			   function(result) {
        				  // alert("Error in getCategory="+JSON.stringify(result));
        			   },'LoginPlugin', 'core_course_get_categories', [data]);
        	   
           }
        }
    });
    return Clazz.com.components.widget.login.js.Login;
});
