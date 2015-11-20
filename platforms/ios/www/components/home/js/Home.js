define(["framework/WidgetWithTemplate","header/Header","footer/Footer","course/Course","me/Me","news/News","resource/Resource","players/Players","reports/Reports","favorites/Favorites","progress/Progress","help/Help"], function(template) {
    Clazz.createPackage("com.components.widget.home.js");
    Clazz.com.components.widget.home.js.Home = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/home/template/home.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "home",
        localConfig: null,
        globalConfig: null,
        headerWidget:null,
        footerWidget:null,
        courseWidget:null,
        resrcWidget:null,
        helpWidget:null,
        playersWidget:null,
        reportsWidget:null,
        favoritesWidget:null,
        initialize : function(globalConfig) {
            this.globalConfig = globalConfig;
            this.headerWidget = new Clazz.com.components.widget.header.js.Header();
            this.footerWidget = new Clazz.com.components.widget.footer.js.Footer();
            this.courseWidget = new Clazz.com.components.widget.course.js.Course();
        },onResume: function (){
            headFootCtrl();
        },
		setContent : function() {
            var userDetails;
            var self=this;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                  userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
            }

            self.data.role = userDetails.role;
			self.data.isNews = showNewsSlide;

            if( navigator.platform == "iPad Simulator" || navigator.platform == "iPad" ){
              self.data.Web = false;
              self.data.iPad = true;
            }else{
              self.data.iPad = false;
              self.data.Web = true;
              self.data.Web = true;
            }
        },
		preRender: function(whereToRender, renderFunction) {
            this.setContent();
            
            Handlebars.registerHelper('footerContent', function () {
              var footerElement = '<li class="selected footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
              footerElement += '<li class="footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
              footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
              footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
              return new Handlebars.SafeString(footerElement);
            });
            // default implementation just call renderFunction
            renderFunction(this.data, whereToRender);
        },
        homeTest : function(templateUrl, localConfig){
            this.templateUrl = templateUrl;
            this.localConfig = localConfig;
        },
        loadPage :function(pageType, data){
            var self = this;
            self.pageType = pageType;
            self.UserDetails={};
            if( data != undefined ){
                self.UserDetails = data;
            }
			jQuery('#container').addClass('container');
            Clazz.navigationController.push(self);
        },
        postRender : function(element) {
            var self=this;
            self.headerWidget.loadPage(self.UserDetails);
            self.footerWidget.loadPage(self.UserDetails);
            headFootCtrl();
        },
        /***
		 * Bind the action listeners. The bindUI() is called automatically after the render is complete
		 */
        bindUI : function(){
            headFootCtrl();
            initiateEventListener();
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var currPage = this;
            var self=this, iTouch = '', userDetails = null, FIRST_TIME_USER='';
            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                FIRST_TIME_USER = window.localStorage.getItem("FIRST_TIME_USER");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }

            self.report=userDetails.role;
			self.news = showNewsSlide;
            if( FIRST_TIME_USER == "N" && self.globalConfig.application.offLine ){
               
                var data={"uid":userDetails.id};
                cordova.exec(
                              function (result) {
                                
                                var result = JSON.parse(result);
                                if( result.response ){
                                    if( result.response.NEW_CONTENT == "Y" ){
                                        jQuery(".newcontent-pop,.overlaylightbox").show();
                             
                                     }else if( result.response.NEW_CONTENT == "N" ){
                             
                                         cordova.exec(
                                                      function (result) {},
                                                      function (result) {},'OfflineSyncPlugin', 'SyncBack', [data]);
                                         }
                                }
                              },
                              function (result) {
                             
                              },'OfflineSyncPlugin', 'DeltaSync', [data]);
            }
                                                        
            jQuery(".downloadnow").off().on('touchstart',function(){
                    jQuery(".newcontent-pop,.overlaylightbox").hide();
                    window.localStorage.setItem("FIRST_TIME_USER","N");
                    manualSyncProgress();
                    var data={"uid":userDetails.id};
                    cordova.exec(
                                 function (result) {
                                 
                                 },
                                 function (result) {
                                 
                                 },'OfflineSyncPlugin', 'ManualSync', [data]);
            });
            jQuery(".downloadlater").off().on('touchstart',function(){
                 jQuery(".newcontent-pop,.overlaylightbox").hide();
            });

            var swiperNavigation=['crs-ctrl','me-ctrl','fav-ctrl','pro-ctrl','rsc-ctrl','rpt-ctrl','help-ctrl','ply-ctrl'];
			self.roleCount = 0;
            if( self.report == '' ){
              swiperNavigation.splice(5, 1);
            }
			
            for ( var i = 0; i < swiperNavigation.length; i++ ) {
                //if ( swiperNavigation[i] == 'rpt-ctrl' ) {
                    //swiperNavigation.splice(i, 1);
                    self.roleCount++;
                //}
            }
			
            if(isiOS()){
                iTouch = 'touchstart';
            }else{
                iTouch = 'click';
            }
            jQuery('body').removeClass("body");
           
         
			
            jQuery('#carousel .me').on(iTouch,function(){
             if(jQuery(this).hasClass('roundabout-in-focus')){
              self.viewprofile();
              jQuery("#footer-menu li").removeClass('selected');
              jQuery(".footer_me").addClass('selected');
              jQuery("#header-menu li").removeClass('selected');
              jQuery(".header_me").addClass('selected');
             }else{
              var slideNum = jQuery('#carousel > li').index(jQuery(this));
              self.animateTo(slideNum);
             }
            });
            jQuery('.mob_me').off().on('click',function(){
                hideFooter();
                self.viewprofile();
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_me").addClass('selected');
            });
            jQuery('#carousel .courses').on(iTouch,function(){
              if(jQuery(this).hasClass('roundabout-in-focus')){
              if(isDevice() && !isOnline() && !self.globalConfig.application.offLine ) {
                jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                updateLanguage();
                jQuery('.errorCode-pop').show();
              }
               self.courseWidget.loadPage();
               jQuery("#footer-menu li").removeClass('selected');
               jQuery(".footer_course").addClass('selected');
               jQuery("#header-menu li").removeClass('selected');
               jQuery(".header_course").addClass('selected');
              }else{
               var slideNum = jQuery('#carousel > li').index(jQuery(this));
               self.animateTo(slideNum);
              }
            });

            jQuery('.mob_news').off().on('click',function(){
                hideFooter();
                self.newspage();
            });

            jQuery('.mob_help').off().on('click',function(){
                 hideFooter();
                 jQuery("html, body").animate({ scrollTop: 0 }, "slow");
            });

            jQuery('.mob_resrc').off().on('click',function(){
                hideFooter();
                self.resrcpage();
            });

            jQuery('div.carouselbx_mob li.ashclr').off().on('click',function(){
                hideFooter();
                self.helppage();
            });

            jQuery('.mob_favor').off().on('click',function(){
                hideFooter();
                self.favoritespage();
            });


            jQuery('.mob_progress').off().on('click',function(){
                hideFooter();
                self.progressPage();
            });

            jQuery('.mob_players').off().on('click',function(){
                hideFooter();
                self.playerspage();
            });

            jQuery('.mob_courses').off().on('click',function(){
                if(isDevice() && !isOnline() && !self.globalConfig.application.offLine ) {
                    jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                    updateLanguage();
                    jQuery('.errorCode-pop').show();
                }
                hideFooter();
                self.courseWidget.loadPage();
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
            });
                                                            
            jQuery('#carousel #newsslide').on(iTouch,function(){
                if(jQuery(this).hasClass('roundabout-in-focus')){
                 self.newspage();
                }else{
                 var slideNum = jQuery('#carousel > li').index(jQuery(this));
                 self.animateTo(slideNum);
                }
            });
            jQuery('#carousel #playerslide').on(iTouch,function(){
              if(jQuery(this).hasClass('roundabout-in-focus')){
               self.playerspage();
               jQuery("#footer-menu li").removeClass('selected');
               jQuery(".footer_players").addClass('selected');
               jQuery("#header-menu li").removeClass('selected');
               jQuery(".header_players").addClass('selected');
              }else{
               var slideNum = jQuery('#carousel > li').index(jQuery(this));
               self.animateTo(slideNum);
              }
            });
            jQuery('#carousel #helpslide').on(iTouch,function(){
                if(jQuery(this).hasClass('roundabout-in-focus')){
                 self.helppage();
                }else{
                 var slideNum = jQuery('#carousel > li').index(jQuery(this));
                 self.animateTo(slideNum);
                }
            });
            jQuery('#carousel #resrc_page').on(iTouch,function(){
             if(jQuery(this).hasClass('roundabout-in-focus')){
              self.resrcpage();
             }else{
              var slideNum = jQuery('#carousel > li').index(jQuery(this));
              self.animateTo(slideNum);
             }
            });
            /* Progress Image click function */
            jQuery('#carousel #progress_page').on(iTouch,function(){
                if(jQuery(this).hasClass('roundabout-in-focus')){
                 self.progressPage();
                }else{
                 var slideNum = jQuery('#carousel > li').index(jQuery(this));
                 self.animateTo(slideNum);
                }
            });
            jQuery('#carousel #favorites_page').on(iTouch,function(){
             if(jQuery(this).hasClass('roundabout-in-focus')){
              self.favoritespage();
             }else{
              var slideNum = jQuery('#carousel > li').index(jQuery(this));
              self.animateTo(slideNum);
             }
            });
            jQuery('#carousel #report_page').on(iTouch,function(){
              if(jQuery(this).hasClass('roundabout-in-focus')){
               self.reportpage();
              }else{
               var slideNum = jQuery('#carousel > li').index(jQuery(this));
               self.animateTo(slideNum);
              }
            });

             /* iPad Carousel Plugin call method */
			
            var mySwiper =  jQuery(".homeSwiper-container").swiper({
                                               centeredSlides: true,
                                               slidesPerView:3,
                                               loop:true,
                                               initialSlide: 0,
                                               loopAdditionalSlides: 2,
                                               pagination: '.pagination',
                                               paginationClickable: true,
                                               paginationAsRange: true,
                                               speed: 50,
                                               onSlideChangeEnd: function(swiper){
                                                 jQuery(".swiper-active-switch").addClass(''+swiperNavigation[jQuery(".swiper-active-switch").index()]+'');
                                               },
                                               //Enable 3D Flow
                                               tdFlow: {
                                                   rotate : -2,
                                                   stretch :2,
                                                   depth: 280,
                                                   modifier : 1,
                                                   shadows:false
                                               }
                            });
            jQuery('.homeSwiper-container #playerslide').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                 self.playerspage();
               }else{
                 jQuery(".pagination .swiper-pagination-switch:nth-child("+(self.roleCount)+")").trigger('click');
               }
            });
            jQuery('.homeSwiper-container #helpslide').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                self.helppage();
               }else{
                jQuery(".pagination .swiper-pagination-switch:nth-child("+(self.roleCount - 1)+")").trigger('click');
               }
                                                                  
            });
            jQuery('.homeSwiper-container #newsslide').die().live('click', function(){
                if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                  self.newspage();
                }else{
                  jQuery(".pagination .swiper-pagination-switch:nth-child("+(self.report!=''?'7':'6')+")").trigger('click');
                }
            });
            jQuery('.homeSwiper-container #resrc_page').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                self.resrcpage();
               }else{
                jQuery(".pagination .swiper-pagination-switch:nth-child(5)").trigger('click');
               }
            });
            jQuery('.homeSwiper-container #progress_page').die().live('click', function(){
                if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                 self.progressPage();
                }else{
                 jQuery(".pagination .swiper-pagination-switch:nth-child(4)").trigger('click');
                }
            });
            jQuery('.homeSwiper-container #favorites_page').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                self.favoritespage();
               }else{
                jQuery(".pagination .swiper-pagination-switch:nth-child(3)").trigger('click');
               }
            });
            jQuery('.homeSwiper-container #me').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                self.viewprofile();
               }else{
                jQuery(".pagination .swiper-pagination-switch:nth-child(2)").trigger('click');
               }
            });
            jQuery('.homeSwiper-container #courses').die().live('click', function(){
                if(isDevice() && !isOnline() && !self.globalConfig.application.offLine ) {
                    jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                    updateLanguage();
                    jQuery('.errorCode-pop').show();
                }
                if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                 self.courseWidget.loadPage();
                 jQuery("#footer-menu li").removeClass('selected');
                 jQuery(".footer_course").addClass('selected');
                 jQuery("#header-menu li").removeClass('selected');
                 jQuery(".header_course").addClass('selected');
                }else{
                 jQuery(".pagination .swiper-pagination-switch:nth-child(1)").trigger('click');
                }
            });
            jQuery('.homeSwiper-container #report_page').die().live('click', function(){
               if( jQuery(this).hasClass('swiper-slide swiper-slide-visible swiper-slide-active')){
                self.reportpage();
               }else{
                jQuery(".pagination .swiper-pagination-switch:nth-child(6)").trigger('click');
               }
            });
            jQuery('.mob_rprts').on('tap',function(){
                self.reportpage();
            });
            setTimeout(function() {
              if((navigator.platform == "iPad Simulator" && (jQuery('body').width() == 768 || jQuery('body').width() == 1024) )|| (navigator.platform == "iPad"  && (jQuery('body').width() == 768 || jQuery('body').width() == 1024))){
                 jQuery('html,body').animate({scrollTop:-200 }, 10);
                 jQuery('html,body').stop();
              }
            }, 100);
        },
        animateTo : function (slideNum){
            jQuery('#carousel-controls > span').removeClass('current');
            jQuery('#carousel-controls > span:eq('+slideNum+')').addClass('current');
            jQuery('#carousel').roundabout('animateToChild', slideNum);
        },
        viewprofile:function(){
            var self = this;
            jQuery("#footer-menu li").removeClass('selected');
            jQuery(this).addClass('selected');
             if( isPhoneGap() && !isOnline() ) {
				if(!jQuery("#profile_edit").length){
					self.meWidget = new Clazz.com.components.widget.me.js.Me();
					self.meWidget.loadPage();
				}else{
					Clazz.navigationController.getView('#me');
				}
                return false;
            }
            self.loginService();
        },
		carouselHomepage:function(){
	 
 		var $descriptions = jQuery('#carousel-descriptions').children('li'),
            $controls = jQuery('#carousel-controls').find('span'),
            $carousel = jQuery('#carousel')
            .roundabout({
                childSelector:"img",
                minOpacity:1,
                minScale:0.1,
                maxScale:0.8,
				clickToFocus:true,
				dragFactor:10,
                enableDrag: false,
                responsive:true,
                dropDuration: 300
            })
            .on('focus', 'li', function() {
                var slideNum = $carousel.roundabout("getChildInFocus");
                $descriptions.add($controls).removeClass('current');
                jQuery($descriptions.get(slideNum)).addClass('current');
                jQuery($controls.get(slideNum)).addClass('current');
            });
            $controls.on('tap dblclick', function() {
                var slideNum = -1,
                i = 0, len = $controls.length;
                for (; i<len; i++) {
                    if (this === $controls.get(i)) {
                        slideNum = i;
                        break;
                    }
                }
                if (slideNum >= 0) {
                    $controls.removeClass('current');
                    jQuery(this).addClass('current');
                    $carousel.roundabout('animateToChild', slideNum);
                }
            });
		},
        newspage:function(){
            var hash = window.location.hash;
            //currPage.checkForOnline();
            if(hash !== '#news'){
                if(!jQuery("#news-page").length){
                    self.newsWidget = new Clazz.com.components.widget.news.js.News();
                    self.newsWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#news');
                }
            }
        },
        resrcpage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#resource'){
                if(!jQuery("div#resrc-page").length){
                    self.resrcWidget = new Clazz.com.components.widget.resource.js.Resource();
                    self.resrcWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#resource');
                }
            }
        },
        helppage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#help'){
                if(!jQuery("input#help-page").length){
                    self.helpWidget = new Clazz.com.components.widget.help.js.Help();
                    self.helpWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#help');
                }
            }
        },
        progressPage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#progress'){
                if(!jQuery("input#progress-page").length){
                    self.progrsWidget = new Clazz.com.components.widget.progress.js.Progress();
                    self.progrsWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#progress');
                }
            }
        },
        playerspage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#players'){
                if(!jQuery("input#player-page").length){
                    self.playersWidget = new Clazz.com.components.widget.players.js.Players();
                    self.playersWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#players');
                }
            }
        },
        reportpage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#bycourse'){
                if(!jQuery("#reportbycourse").length){
					self.bycoursewidget = new Clazz.com.components.widget.bycourse.js.Bycourse();
	                self.bycoursewidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#bycourse');
                }
            }
        },
        favoritespage:function(){
            var hash = window.location.hash;
            var self=this;
            self.checkForOnline();
            if(hash !== '#favorites'){
                if(!jQuery("input#favorite-page").length){
                    self.favoritesWidget = new Clazz.com.components.widget.favorites.js.Favorites();
                    self.favoritesWidget.loadPage();
                }else{
                    Clazz.navigationController.getView('#favorites');
                }
            }
        },
        loginService:function(){
            var self = this,passwords, userDetails;
            var loginserviceUrl = self.globalConfig.apiAddress.service;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                passwords = window.atob(window.localStorage.getItem("psw"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                passwords = window.atob($.jStorage.get("psw"));
            }
            var data = {
                username:userDetails.username,
                password:passwords,
                service: "moodle_mobile_app",
                action:'login'
            };
			
			 if(this.returnIeVersion()){
						this.ieEightAndIeNine();
					}
            jQuery.ajax({
                url: loginserviceUrl,               
                data:data,
				crossDomain: true,
                type : 'POST',
                cache : false,
                dataType : 'json',
                async: false, 
                success:function(res){
                    if(typeof(res.USER) !== 'undefined'){
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.removeItem("USER");
                            window.localStorage.setItem("USER", JSON.stringify(res.USER));
                        } else {
                            $.jStorage.deleteKey("USER");
                            $.jStorage.set("USER", JSON.stringify(res.USER));
                        }
                        var hash = window.location.hash;
                        if(hash !== '#me'){
                            if(!jQuery("#profile_edit").length){
                                self.meWidget = new Clazz.com.components.widget.me.js.Me();
                                self.meWidget.loadPage(self.UserDetails);
                            }else{
                                Clazz.navigationController.getView('#me');
                            }
                        }
                    }
                },
                error: function ( jqXHR, textStatus, errorThrown ){
                    var hash = window.location.hash;
                    if(hash !== '#me'){
                        if(!jQuery("#profile_edit").length){
                            self.meWidget = new Clazz.com.components.widget.me.js.Me();
                            self.meWidget.loadPage(self.UserDetails);
                        }else{
                            Clazz.navigationController.getView('#me');
                        }
                    }
                }
            });
        },
        checkForOnline:function(){
            /* if(isDevice() && !isOnline()) {
               jQuery('.nonetconnection').slideDown(2000, function(){
                   jQuery(this).fadeOut(6000);
               });
            } */
            var self=this;
			if(isDevice() && isPhoneGap() && !checkAppOnline() && !self.globalConfig.application.offLine ) {
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('.errorCode-pop').show();
			}
        }
    });
    return Clazz.com.components.widget.home.js.Home;
});
