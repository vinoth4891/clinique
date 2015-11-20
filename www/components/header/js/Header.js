define(["framework/WidgetWithTemplate","home/Home"] , function(template) {
    Clazz.createPackage("com.components.widget.header.js");
    Clazz.com.components.widget.header.js.Header = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/header/template/header.tmp",
        configUrl: "../../componens/header/config/config.json",
        name : "header",
        headerContainer:"header\\:widget",
        homeWidget:null,
        courseWidget:null,
        meWidget:null,
        playersWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
        },
        loadPage :function(data){
	    var self = this;
		this.homeWidget = new Clazz.com.components.widget.course.js.Course();
            self.UserDetails={};
            self.UserDetails=data;	
            if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {                
               var headerElmHtml = '<div class="row  hme_hdrbx ie7-header-specific hideSection"><div class="nonetconnection"><p data-msg="network_fail"></p></div><div class="span3">';
                   headerElmHtml +='<div class="hmelogo"><a href="#"><img src="../images/logo_home_ipad.png"></a></div>';
                   headerElmHtml +='<div class="hmelogo2"><a href="#"><img src="../images/logo_home_mb.png"></a></div></div><div class="span6 offset4 padtp">';
                   headerElmHtml +='<div class="logout" id="signOut" ><a href="#" data-msg="logout"></a></div></div></div>';
                   headerElmHtml +='<div class="row menu2 hideSection"> <div class="globalmenu2 webmenu"> <ul id="header-menu">';
                   headerElmHtml += '<li class="selected header_home first-child"><span class="navcrv"></span><a href="#"><span class="hmemenuicon"></span><span data-msg="Home" class="hmemenutxt"></span></a></li>';
                   headerElmHtml += '<li class="header_course"><a href="#"><span class="courseicon"></span><span data-msg="Courses" class="hmemenutxt"></span></a></li>';
                   headerElmHtml += '<li class="header_me"><a href="#"><span class="meicon"></span><span data-msg="Me" class="hmemenutxt"></span></a></li>';
                   headerElmHtml += '<li class="header_players last-child"><a href="#"><span class="playersicon"></span><span data-msg="Players" class="hmemenutxt"></span></a><span class="navcrv"></span></li>';
                   headerElmHtml +='</ul></div> </div> <div class="row hideSection"> <div class="web_nav_adj"></div></div>';
                   if(!($('.ie7-header-specific').hasClass('hme_hdrbx'))) {
                        $('#container').append(headerElmHtml);
                   }
                   this.bindUI();
            }
            else {
              this.render(this.headerContainer);
            }
        },
        bindUI : function(){
		var self = this;
		self.homeWidget = new Clazz.com.components.widget.home.js.Home();
		//self.homeWidget.carouselHomepage();
            var language, self=this, userDetails = null;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                language = $.jStorage.get("language");
            }
            if( isDevice()){
             jQuery(".onlineStatus").show();
            }
            updateInternetStatus();
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            loadLanguages(activeLang);
            if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                jQuery(".hme_hdrbx").css('border-bottom','none');
                jQuery('.globalmenu2').css('width','949px');
            }
                                                                
            jQuery("#homebackbtn").die().live("click", function () {
				videoContrlFun();
                cordova.exec(function(winParam) {},
                function(error) {},"ElearningPlugin","backToBlueOcean",[]);
             });

            jQuery(".hme_hdrbx").not(".hmelogo a, .hmelogo2 a, #signOut").unbind();
            jQuery(".hme_hdrbx").not(".hmelogo a, .hmelogo2 a, #signOut").bind('click', function(){
                hideFooter();
            });
            jQuery('.hmelogo a, .hmelogo2 a').on('click',function(){
                jQuery("#header-menu li").removeClass('selected');
                jQuery("#header-menu .header_home").addClass('selected');
                jQuery("#footer-menu li").removeClass('selected');
                jQuery("#footer-menu li.footer_home").addClass('selected');
				jQuery('body').removeClass('report-details-show');
               
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length ){
						videoContrlFun();
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#home');
                        homeCarousel();
                    }
                }
            });
            self.manualSync_Tapped=false;
            jQuery(".manualSync").off().on('click',function(){
				videoContrlFun();
                if( checkAppOnline() &&  !self.manualSync_Tapped ){
                     self.manualSync_Tapped=true;
                     var data={"uid":userDetails.id};
                     jQuery(".onlineStatus img").attr('src','../images/sync.gif');
                     cordova.exec(
                                   function (result) {
                                  
                                      var result = JSON.parse(result);
                                      if( result.response ){
                                          if( result.response.NEW_CONTENT == "Y" ){
                                            jQuery(".newcontent-pop,.overlaylightbox").show();
                                            self.manualSync_Tapped=false;
                                          }else if( result.response.NEW_CONTENT == "N" ){
                                              self.manualSync_Tapped=false;
                                              data.downloadlater = 0;
                                               setTimeout(function(){
                                                  if( checkAppOnline() ){
                                                      jQuery(".onlineStatus img").attr('src','../images/refresh.png');
                                                      jQuery('.errorCode-pop .prog-summarys').attr('data-msg','downloadcomplete');
                                                      updateLanguage();
                                                      jQuery('.errorCode-pop,.overlaylightbox').show();
                                                      jQuery('body').addClass("scrollHidden");
                                                  }
                                               },500);
                                              cordova.exec(
                                                      function (result) {},
                                                      function (result) {},'OfflineSyncPlugin', 'SyncBack', [data]);
                                          }
                                      }
                                    },
                                    function (result) {
                                     self.manualSync_Tapped=false;
                                    },'OfflineSyncPlugin', 'DeltaSync', [data]);
                 }
            });
                                                                
            jQuery(".downloadnow").off().on('touchstart',function(){
               jQuery(".newcontent-pop,.overlaylightbox").hide();
               window.localStorage.setItem("FIRST_TIME_USER","N");
               setTimeout(function(){
                     if( checkAppOnline() ){
                       jQuery(".onlineStatus img").attr('src','../images/refresh.png');
                       manualSyncProgress();
                       var data={"uid":userDetails.id};
                       cordova.exec(
                                    function (result) {
                                                                                                                     
                                                       },
                                                       function (result) {
                                                                                                                     
                                                       },'OfflineSyncPlugin', 'ManualSync', [data]);
                     }
               },200);
            });
                                                                
            jQuery(".downloadlater").off().on('touchstart',function(){
              jQuery(".newcontent-pop,.overlaylightbox").hide();
              jQuery(".onlineStatus img").attr('src','../images/refresh.png');
              setTimeout(function(){
                  var data={"uid":userDetails.id,"downloadlater":1};
                  cordova.exec(
                               function (result) {},
                               function (result) {},'OfflineSyncPlugin', 'SyncBack', [data]);
              },200);
            });

           jQuery('#signOut').on('click',function(){
               try {               
                 if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.removeItem("USER");
                    window.localStorage.removeItem("player-course");
                    window.localStorage.removeItem("psw");
                    window.localStorage.removeItem("activeTopic");
                    window.localStorage.removeItem("badge-user-point");
                    sessionStorage.clear();
                } else {
                    $.jStorage.deleteKey("USER");
                    $.jStorage.deleteKey("player-course");
                    $.jStorage.deleteKey("psw");
                    $.jStorage.deleteKey("activeTopic");
                    $.jStorage.deleteKey("badge-user-point");
                    try {
                       sessionStorage.clear(); 
                    }catch(e) {}
                }
				
                var serviceUrl = self.globalConfig.apiAddress.service;
                var data = {
                    action:'logout'
                };
                self.logoutApi(serviceUrl,data);
            }catch(err){
                
            }
            });
            jQuery('.header_home').on('click',function(){
				if($('html').hasClass('ie8')){
					// jQuery(".widget-maincontent-div").empty(); // Widget does not empty, because it has maintain in stack array.
				}
                jQuery("#header-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
				jQuery('body').removeClass('report-details-show');
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length ){
                        videoContrlFun();
						self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#home');                        
                         homeCarousel();                        
                    }
                }
            });
            jQuery('.header_course').on('click',function(){
				if($('html').hasClass('ie8')){
					// jQuery(".widget-maincontent-div").empty(); // Widget does not empty, because it has maintain in stack array.
				}
				jQuery('body').removeClass('report-details-show');
                var hash = window.location.hash;
                jQuery("#header-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
                
                if(hash != '#course'){
                    if(!jQuery(".bkself").length){
						videoContrlFun();
						self.courseWidget = new Clazz.com.components.widget.course.js.Course();
                        self.courseWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#course');
                    }
                }
            });
            jQuery('.header_me').on('click',function(){
				if($('html').hasClass('ie8')){
					// jQuery(".widget-maincontent-div").empty(); // Widget does not empty, because it has maintain in stack array.
				}
				jQuery('body').removeClass('report-details-show');
                var hash = window.location.hash;
                jQuery("#header-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
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
                if(hash !== '#me'){
                    if(!jQuery("#profile_edit").length){
						videoContrlFun();
                        self.meWidget = new Clazz.com.components.widget.me.js.Me();
                        self.meWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#me');
                    }
                }
            });
            jQuery('.header_players, .footer_players').on('click',function(){
				if($('html').hasClass('ie8')){
					// jQuery(".widget-maincontent-div").empty(); // Widget does not empty, because it has maintain in stack array.
				}
				jQuery('body').removeClass('report-details-show');
                var hash = window.location.hash;
                jQuery("#header-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
                if(hash !== '#players'){
                    if(!jQuery("#playersdiv").length){
						videoContrlFun();
                        self.playersWidget = new Clazz.com.components.widget.players.js.Players();
                        self.playersWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#players');
                    }
                }
            });
            updateOnlineStatus();
            if( ( navigator.platform == "iPad" || navigator.platform == "iPad Simulator" ) && ( isDevice() ) ){
                cordova.exec(
                             function (result) {
                               localStorage.setItem("BOstatus",result);
                                 if( result ){
                                  jQuery(".blueoceanbtn").hide();
                                 }else{
                                  jQuery(".blueoceanbtn").show();
                                 }
                             },
                             function (args) {},
                             'ElearningPlugin','isFromBlueocean',[]);
            }
        },
        logoutApi:function(serviceUrl,data){
            jQuery.ajax({
                url: serviceUrl,
                cache:false,
                async:true,
                type:'POST',
                data:data,
                dataType:'json',
                crossDomain: true,
                success:function(){
					videoContrlFun();
                    if(navigator.app === undefined) {
                         if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem("avoidSplash", 1);
                        } else {
                            $.jStorage.set("avoidSplash", 1);
                        }
                        window.location.reload();
                        
                    } else {
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem("avoidSplash", 1);
                        } else {
                            $.jStorage.set("avoidSplash", 1);
                        }
                        window.location.reload();
                    }
                },
                error:function(){
					videoContrlFun();
                   if(navigator.app === undefined){
                        window.location.reload();
                    } else {
                         if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem("avoidSplash", 1);
                        } else {
                            $.jStorage.set("avoidSplash", 1);
                        }
                        window.location.reload();
                    }
                }
            });
        },
        loginService:function(){
            var self = this,passwords, userDetails;
            var loginserviceUrl = self.globalConfig.apiAddress.service;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            
			 if(!this.returnIeVersion()){
                 if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    passwords = window.atob(window.localStorage.getItem("psw"))
                } else {
                    passwords = window.atob($.jStorage.get("psw"));
                }
			}else{
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    passwords = window.localStorage.getItem("psw");
                } else {
                    passwords = $.jStorage.get("psw");
                }
			}
            
            var data = {
                username:userDetails.username,
                password:passwords,
                service: "moodle_mobile_app",
                action:'login'
            };
            jQuery.ajax({
                url: loginserviceUrl,
                cache:false,
                async:true,
                type:'POST',
                data:data,
                dataType:'json',
                crossDomain: true,
                success:function(res){
                    if(typeof(res.USER) !== 'undefined'){
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.removeItem("USER");
                            window.localStorage.setItem("USER", JSON.stringify(res.USER));
                        } else {
                            $.jStorage.deleteKey("USER");
                            $.jStorage.set("USER",JSON.stringify(res.USER));
                        }
                    }
                }
            });
        }
    });
    return Clazz.com.components.widget.header.js.Header;
});
