define(["framework/WidgetWithTemplate","home/Home","login/Login", "abstract/offlineStorage"] , function() {
    Clazz.createPackage("com.components.widget.changePwd.js");
    Clazz.com.components.widget.changePwd.js.ChangePwd = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/changePwd/template/changePwd.tmp",
        configUrl: "../../componens/changePwd/config/config.json",
        name : "changePwd",
        localConfig: null,
        globalConfig: null,
        homeWidget:null,
        loginWidget:null,
        offlineStorage : null,
        activeLang : null,
        showHeader : true,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
            this.homeWidget = new Clazz.com.components.widget.home.js.Home();
        },
        preRender: function(whereToRender, renderFunction) {
                                                                      
          var BreadcrumElement='';
          Handlebars.registerHelper('checkForBreadcrum', function () {
                                    
            if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                                    
                BreadcrumElement = ' <section class="tpbreadcrumbs tpbreadChngPwd">  \r\n' +
                                   '<ul><li class="home_view prolnk"><a href="#" data-msg="Home"></a></li>  \r\n' +
                                   '<li class="bred_me prolnk changePwd"><a href="#" data-msg="Me"></a></li>  \r\n' +
                                   '<li data-msg="change_password"></li></ul><div class="clear"></div></section>';
                                    
                return new Handlebars.SafeString(BreadcrumElement);
                                    
            }
          });
         renderFunction(this.data, whereToRender);
        },
        ChangePwdTest : function(templateUrl, localConfig){
            this.templateUrl = templateUrl;
            this.localConfig = localConfig;
        },
        loadPage :function(isShow){
            this.showHeader = isShow;
            Clazz.navigationController.push(this);

        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var self = this,iTouch = '';
			//jQuery("#oldPWD").focus();
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
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            loadLanguages(activeLang);
            jQuery("#ChgPsdsetBtn").die().live('click',function(){
                self.ChangePasswordValidation();
            });
            jQuery('#loginform').keypress(function(e) {
                if(e.which == 13) { /*Checks for the enter key*/
                    self.ChangePasswordValidation();
                    e.preventDefault();  /*Stops IE from triggering the button to be clicked*/
                }
            });
            if(!self.showHeader){
                jQuery(".corelogin header").hide();
                jQuery(".tpbreadcrumbs").show();
                jQuery('.bred_me.changePwd').on(iTouch,function(){
                    /* Loading Me Page */
                    if(!jQuery("#profile_edit").length){
                        self.meWidget = new Clazz.com.components.widget.me.js.Me();
                        self.meWidget.loadPage();
                    }else{
                        Clazz.navigationController.getView('#me');
                    }
                });
                jQuery('.home_view').on(iTouch,function(){
                    jQuery("#footer-menu li").removeClass('selected');
                    jQuery('#footer-menu li.footer_home').addClass('selected');
                    jQuery("#header-menu li").removeClass('selected');
                    jQuery(".header_home").addClass('selected');
                    var hash = window.location.hash;
                    if(hash !== '#home'){
                       Clazz.navigationController.getView('#home');
                       homeCarousel(); 
                    }
                });
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_me").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_me").addClass('selected');
            } else {
                jQuery(".tpbreadcrumbs").hide();
				jQuery('#container').removeClass('container');
            }
            jQuery("#ChgPsdsetBtn").addClass("disabled", "disabled");
            jQuery("#cnfpwd").keyup(function (data) {
                if (jQuery(this).val().length > 6) {
                    jQuery("#ChgPsdsetBtn").removeClass("disabled");
                }
                else {
                    jQuery("#ChgPsdsetBtn").addClass("disabled");
                }
            });
            jQuery('#ChgPsdcancelBtn').on('click', function() {
                var loguser;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    loguser = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    loguser = JSON.parse($.jStorage.get("USER"));
                }
                jQuery("form#loginform input").val('');
                jQuery("div#chgpwd_error_msg, span#chgpwd_success_msg").empty();
                if(loguser.forcePasswordChange) {
					Clazz.navigationController.pop();
                    self.loginWidget = new Clazz.com.components.widget.login.js.Login();
                    self.loginWidget.loadPage(Clazz.config);
                } else {
                    if(!jQuery("#profile_edit").length){
                        self.meWidget = new Clazz.com.components.widget.me.js.Me();
                        self.meWidget.loadPage();
                    }else{
                        Clazz.navigationController.getView('#me');
                    }
                }
            });			
			if($('html').hasClass('ie8') || $('html').hasClass('ie9')){				
				jQuery('.test').addPlaceholder();								
				jQuery('.test').css('width','180px');
			}
        },
        ChangePasswordValidation : function(){
            var language, self=this;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            var oldpwd = jQuery("#oldPWD").val();
            var newpwd = jQuery("#newpwd").val();
            var cnfpwd = jQuery("#cnfpwd").val();
            var oldpwdLen = oldpwd.length;
            var newpwdLen = newpwd.length;
            var cnfpwdLen = cnfpwd.length;
            jQuery('#chgpwd_error_msg').text('');
            if(oldpwdLen == "" && newpwdLen == "" && cnfpwdLen == "" ) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'fill_all_fields');
            } else if(oldpwdLen === 0) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'enter_old_pass');
            } else if(newpwdLen === 0) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'enter_new_pass');
            } else if(0 < newpwdLen && newpwdLen < 6 ) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'enter_min_char');
            } else if(cnfpwdLen === 0) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'enter_cnfrm_pass');
            } else if(0 < cnfpwdLen && cnfpwdLen < 6) {
                translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'enter_min_char');
            } else if(newpwdLen >= 6 && cnfpwdLen >= 6) {
                if(newpwd === cnfpwd){
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
                    self.setPwd(oldpwd, newpwd);
                } else {
                    translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'pass_mismatch');
                }
            }
            return true;
        },
        setPwd : function(oldpwd, newpwd){
            var language, user;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                user = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                language = $.jStorage.get("language");
                user = JSON.parse($.jStorage.get("USER"));
            }
            
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            var self =this;
            var serviceUrl = self.globalConfig.apiAddress.service;
            var data = {
			    username:user.username,
                email:user.email,
                old_pwd:oldpwd,
                new_pwd:newpwd,
				token: user.token,
                action:'change_password'
            };			
            jQuery.ajax({
                url: serviceUrl,
                type:'POST',
                data:data,
                dataType:'json',
                success:function(resp){
                    if(!resp.error){
                        jQuery('#chgpwd_error_msg').empty();
                        var offlineUserData;
                        
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            offlineUserData = window.localStorage.getItem("USER");
                        } else {
                            offlineUserData = $.jStorage.get("USER");
                        }                        
                        self.offlineStorage.insertRecords(data.email, data.new_pwd, offlineUserData);						
						var hashPwd = window.btoa(data.new_pwd);						                      
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem("psw", hashPwd);
                        } else {
                            $.jStorage.set("psw", hashPwd);
                        }
                        var hash = window.location.hash;
                        translateErrormsg(jQuery('#chgpwd_success_msg'),activeLang,'pass_set_success');
                        setTimeout(function(){
                            jQuery("form#loginform input").val('');
                            jQuery("div#chgpwd_error_msg, span#chgpwd_success_msg").empty();
                            if(user.forcePasswordChange) {
                                
                                if( isDevice() && isPhoneGap() ){
                                   var FIRST_TIME_USER = window.localStorage.getItem("FIRST_TIME_USER");
                                   cordova.exec(
                                                function (result) {},
                                                function (result) {},'LoginPlugin', 'forcePasswordChange', [data]);
                                   
                                   if( FIRST_TIME_USER == "Y" ){
                                       jQuery("#load_wrapper").show();
                                       jQuery(".corelogin").hide();
                                       jQuery("progress").attr('value','0');
                                       jQuery(".prog-percent").text("");
                                       progressInitiate();
                                       progressStart(self,true);
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
                                                    
                                                    
                                                    },'OfflineSyncPlugin', 'FirstLaunchSync', [user.id,user.token]);
                                   }else if( FIRST_TIME_USER == "N" ){
                                       Clazz.navigationController.pop();
                                       self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                                       self.homeWidget.loadPage();
                                   }
                                   
                                }else{
                                 Clazz.navigationController.pop();
								 self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                                 self.homeWidget.loadPage();
                                }
                            } else {
                                if(!jQuery("#profile_edit").length){
                                    self.meWidget = new Clazz.com.components.widget.me.js.Me();
                                    self.meWidget.loadPage();
                                }else{
                                    Clazz.navigationController.getView('#me');
                                }
                            }
                        },2000);
                    }else{
                        translateErrormsg(jQuery('#chgpwd_error_msg'),activeLang,'old_pass_incor');
                    }
                },
				error:function(){
				}
            });
        }
    });
    return Clazz.com.components.widget.changePwd.js.ChangePwd;
});
