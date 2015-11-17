define(["framework/WidgetWithTemplate", "badges/Badges","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.players.js");
    Clazz.com.components.widget.players.js.Players = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/players/template/players.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "players",
        localConfig: null,
        globalConfig: null,
        offlineStorage: null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(data){
            var self = this;
            self.UserDetails={};
            if( data != undefined ){
                self.UserDetails = data;
            }
            Clazz.navigationController.push(this);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
          var BreadcrumElement='';
          Handlebars.registerHelper('checkForBreadcrum', function () {
                if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                    BreadcrumElement = '<section class="tpbreadcrumbs"><ul>  \r\n' +
                    '<li class="plyrshdnk home_page"><a href="#" data-msg="Home"></a></li>  \r\n' +
                    '<li data-msg="Players"></li></ul><div class="clear"></div></section>';
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
        onResume: function (){
            var selPlayerCourse;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                selPlayerCourse = window.localStorage.getItem("player-course");
            } else {
                selPlayerCourse = $.jStorage.get("player-course");
            } 
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
            if(selPlayerCourse == null){
                jQuery("select#player-course-drpdwn > option:first").attr('selected','selected');
            }
        },
        loadData :function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.restservice, courseOptions = '', courseArr = [];
			if(this.returnIeVersion()){
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
	                async: this.IEAsyncType(),
	                success:function(res){
	                    /* Storing in Offline Storage */
	                    self.offlineStorage.insertComp('PLAYERS', JSON.stringify(res));
	                    self.playersCourseSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getComp('PLAYERS');
	                    setTimeout(function (){
	                        var playersOfflineData = JSON.parse(localStorage["transferData"]);
	                        self.playersCourseSuccess( playersOfflineData );
	                    },1000);
	                }
	            });
			}else if( isDevice() ){
				cordova.exec(
            			function(result) {
            				self.UserDetails = JSON.parse(result);
                       	 	self.playersCourseSuccess(self.UserDetails);
            			},
						function(result) {
							alert("Players Get Fail="+JSON.stringify(result));
						},'LoginPlugin', 'core_enrol_get_users_courses_subcat', [data]);
	        }
        },
        playersCourseSuccess: function (res){
            var courseOptions = '<option value="0" class="seloption">No Courses</option>';
            if(res.length > 0){
                courseOptions = '';
                for(var resDet in res){
                    if(!(res[resDet].fullname == undefined)) {
                        courseOptions += '<option value="'+ res[resDet].id +'" class="seloption">'+ res[resDet].fullname +'</option>';
                    }
                }
            }
            jQuery("div.plyr_selectbx > select").html(courseOptions);
            var selPlayerCourse;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                selPlayerCourse = window.localStorage.getItem("player-course");
            } else {
                selPlayerCourse = $.jStorage.get("player-course");
            }
            if(selPlayerCourse != null){
                jQuery("div.plyr_selectbx > select").val(selPlayerCourse);
            }
            setTimeout(function (){
                $("div.plyr_selectbx > select").change();
            }, 700)
        },
        playersUserSuccess: function (res){
            if(res != 0){
            	if( isDevice() && !res.error ){
                    res.error = false;
                }
                var scoreArr = [], totPtArr = [], userIdArr = [], scoreDet = '', userList = '', isOtherUser = '';
                if(res != null && res != undefined && res.msg != "no_records" && res.error == false){
                    scoreDet = res.response;
                    scoreArr = scoreDet.score;
                    totPtArr = scoreDet.totalscore;
                    var badgeArr = scoreDet.badge;
                    userIdArr = scoreDet.userid;
                    userFnameArr = scoreDet.firstname;
                    userLnameArr = scoreDet.lastname;
                    userFnameArr[0] = '<span data-msg="Me"></span>';
                    userLnameArr[0] = '';
                    for(chin = 0; chin < userIdArr.length; chin++){
                        var badgeName = (badgeArr[chin] == null)?'badge0':badgeArr[chin];
                        var finTotPt = (totPtArr[chin] == null)?0:parseInt(totPtArr[chin]);
                        if(chin > 0) {
							isOtherUser = ' otherusr';
						}
                        userList += '<li><span class="usrdetails' + isOtherUser + '"><p>'+ userFnameArr[chin] + userLnameArr[chin] +'</p></span><span class="prg-left"></span><span class="progrssbr"id="progrss_hldr"><div class="prg_grn"><div class="prg-3d2"></div><div class="prg-3d"></div></div></span><span class="prg-right"></span><div class="pointsWrap"><span class="scores threeCol firstCol"><div class="scorehdg" data-msg="score"></div><p>'+parseInt(scoreArr[chin])+'</p></span><span class="totlpts threeCol secondcol"><div class="scorehdg" data-msg="total_points"></div><p>'+ finTotPt +'</p></span><span id="badge_hldr1" class="scores threeCol thirdCol"><div class="scorehdg" data-msg="badges"></div><div class="badges"><img src="../images/badges/'+badgeName +'.png"></div></span></div></li>';
                    }
                    if($(window).width() > 768) {
                        $("div.plyr_dta_hdg").show();
					}

                    if($("div#no-record").length){
                        $('div#no-record').remove();
                    }
                    $("section.plyrstble:last > ul").html(userList);
                    $("section.plyrstble:last li").each(function (i){
                        if(scoreArr[i] > 100) {
                            scoreArr[i] = 100;
						}
                        $('span.progrssbr > div.prg_grn', this).animate({
                            width: scoreArr[i] + '%'
                        }, 1000*parseInt(i + 1), function() {
                            });
                    });
                }else{
                    $("section.plyrstble > ul").html('');
                    $("div.plyr_dta_hdg").hide();
                    if(!$("div#no-record").length){
                        $('div.row-fluid').append('<div id="no-record" data-msg="no_records_found"></div>').show();
                    }
                }
            }else{
                $("div.plyr_dta_hdg").hide();
            }
            loadAllLanguages();
        },
        getCourseDetails : function (selCourseId){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service;
            var userDetails;
            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var playersData = {
                action: 'players',
                cid : selCourseId,
                uid: userDetails.id,
                wstoken:userDetails.token
            };
			
            if(this.returnIeVersion()){
			  this.ieEightAndIeNine();
			}
            if( !isDevice() ){
	            jQuery.ajax({
	                url: serviceUrl,
	                data:playersData,
					crossDomain: true,
	                type : 'POST',
	                cache : false,
	                dataType : 'json',
	                async: this.IEAsyncType(),
	                success:function(res){
	                    /* Updating Offline Storage Data */
	                    self.offlineStorage.insertPlayers(selCourseId, JSON.stringify(res));
	                    self.playersUserSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getPlayerCourse(selCourseId);
	                    setTimeout(function (){
	                        var playersOfflineData = JSON.parse(localStorage["transferData1"]);
	                        self.playersUserSuccess( playersOfflineData );
	                    },1000);
	                }
	            });
            }else{
            	cordova.exec(
            			function(result) {
            				self.UserDetails = JSON.parse(result);
                       	 	self.playersUserSuccess(self.UserDetails);
            			},
						function(result) {
							alert("Players Get Fail="+JSON.stringify(result));
						},'OfflineServicePlugin', 'players', [playersData]);
            }
        },
        badgesPage:function(){
            var hash = window.location.hash;
            if(!jQuery("#badge-page").length){
                self.badgesWidget = new Clazz.com.components.widget.badges.js.Badges();
                self.badgesWidget.loadPage();
            }else{
                Clazz.navigationController.getView('#badges');
            }
        },
        ci : function (r){
            //console.info(r);
        },
        bindUI : function(){
            jQuery("#footer-menu > li").removeClass('selected');
            jQuery(".footer_players").addClass('selected');
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
            initLanguages();
            loadLanguages(activeLang);
            var self = this;
            var userDetails, categoryid;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                categoryid = window.localStorage.getItem("catcrsId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                categoryid = $.jStorage.get("catcrsId");
            }
            
            var data = {
                wsfunction: "core_enrol_get_users_courses_subcat",
                moodlewsrestformat : "json",
                userid: userDetails.id,
                categoryid:categoryid,
                cattype:'Courses',
                wstoken:userDetails.token
            };
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            self.loadData(data);

            $("div.plyr_selectbx > select").on('change', function (){
                var courseId = $(this).val();
                if(isDevice() && !isOnline()) {
//                    jQuery('.nonetconnection').slideDown(2000, function(){
//                        jQuery(this).fadeOut(6000);
//                    });
                }
                self.getCourseDetails(courseId);
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem("player-course", courseId);
                } else {
                    $.jStorage.set("player-course", courseId);
                }
            });
            /* Badges Page Navigation - Starts Here */
            jQuery('section.plyrstble:last div.badges:first > img').die('click').live('click',function(){
                var parentLi = $(this).parents('li');
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem("badge-user-point",$("span.totlpts > p", parentLi).text());
                } else {
                    $.jStorage.set("badge-user-point",$("span.totlpts > p", parentLi).text());
                }

                self.badgesPage();
            });
            /* Badges Page Navigation - Ends Here */
            jQuery('.home_page').on('click',function(){
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_home").addClass('selected');
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length){
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage();
                    }else{
                        Clazz.navigationController.getView('#home');
                        homeCarousel();
                    }
                }
            });
            jQuery('ul#header-menu li:not(.selected), ul#footer-menu li:not(.selected), div.hmelogo, div.hmelogo2, li.home_page').on('click',function(){
                
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.removeItem("player-course");
                } else {
                    $.jStorage.deleteKey("player-course");
                }
            });
        }
    });
    return Clazz.com.components.widget.players.js.Players;
});
