define(["framework/WidgetWithTemplate","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.progress.js");
    Clazz.com.components.widget.progress.js.Progress = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/progress/template/progress.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "progress",
        localConfig: null,
        globalConfig: null,
        offlineStorage: null,
        isPopupHidden: null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(){
        	var self= this;
        	self.UserDetails={};
            Clazz.navigationController.push(this);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
              if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<section class="tpbreadcrumbs"><ul>  \r\n' +
                  '<li class="prgrshdnk prog-hme-page" id="home_page"><a href="#" data-msg="Home"></a></li>  \r\n' +
                  '<li data-msg="Progress"></li></ul><div class="clear"></div></section>';
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
        loadData :function(){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service;
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var progressData = {
                action: 'progress',
                uid: userDetails.id,
                wstoken:userDetails.token
            };			
            if( !isDevice() ){
	            jQuery.ajax({
	                url: serviceUrl,               
	                data:progressData,
					crossDomain: true,
	                type : 'POST',
	                cache : false,
	                dataType : 'json',
	                async: false, 
	                success:function(res){
	                    self.progressSuccess(res);
	                    /* Updating in Offline Storage */
	                    self.offlineStorage.insertComp('PROGRESS', JSON.stringify(res));
	                },
	                error: function (){
	                    self.offlineStorage.getComp('PROGRESS');
	                    setTimeout(function (){
	                        var progressOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                            progressOfflineData = JSON.parse(localStorage["transferData"]);
	                        } else {
	                            progressOfflineData = JSON.parse($.jStorage.get["transferData"]);
	                        }
	                        self.progressSuccess( progressOfflineData );
	                    },1000);
	                }
	            });
            }else if( isDevice() ){
            	cordova.exec(
            			function(result) {
            				self.UserDetails = JSON.parse(result);
                       	 	self.progressSuccess(self.UserDetails);
            			},
						function(result) {
							alert("Progress Get Fail="+JSON.stringify(result));
						},'OfflineServicePlugin', 'progress', [progressData]);
            }
        },
        progressSuccess: function (res){
            var courseList = '', courseIdArr = [], courseNameArr = [], courseScoreArr = [];
            var courseDetailObj = res.response;
            var totScore = parseInt(courseDetailObj.totalscore);
            if(totScore >= 0){
                courseIdArr = courseDetailObj.course_id;
                courseNameArr = courseDetailObj.course_name;
                courseScoreArr = courseDetailObj.course_score;
			    for(var indexId=0;indexId<courseIdArr.length;indexId++){
                    var courseId = courseIdArr[indexId];
                    var quizNamesArr = [];
                    var quizScoresArr = [];
                    var quizScoreSort = [];
                    var quizNameSort = [];
                    var sortableArr = [];
                    var quizNames = '';
                    var quizScores = '';
                    if(courseScoreArr[indexId] == null) {
                        courseScoreArr[indexId] = 0;
					}
                    /* Progress Smiley Section - Starts Here */
                    var imgtag;
                    imgtag = '<img src="../images/smiley-2-neutral.png">';
                    if(parseInt(courseScoreArr[indexId]) < 71){
                        imgtag = '<img src="../images/smiley-2-sad.png">';
                    }else if(parseInt(courseScoreArr[indexId]) > 79){
                        imgtag = '<img src="../images/smiley-1-happy.png">';
                    }
                    /* Progress Smiley Section - Ends Here */
                    /* Quiz Tag Section - Starts Here */
                    var quizDetail = courseDetailObj.course[courseId].quiz;
                    quizNamesArr = quizDetail.name;
                    quizScoresArr = quizDetail.score;
                    $.map(quizScoresArr,function (arrVal, arrIndex){
                      quizScoresArr[arrIndex] = ( quizScoresArr[arrIndex] == null)?0:arrVal;
                      sortableArr[arrIndex] = quizScoresArr[arrIndex] +'||'+ quizNamesArr[arrIndex];
                    });
                    sortableArr.sort();
                    $.map(sortableArr,function (arrVal, arrIndex){
                      var eachItems = [];
                      eachItems = sortableArr[arrIndex].split('||');
                        quizScoreSort.push(eachItems['0']);
                        quizNameSort.push(eachItems['1']);
                    });
                    if(quizDetail.name.length){
                        quizNames = quizNameSort.join('|||');
                        quizScores = quizScoreSort.join('|||');
                    }
                    /* Quiz Tag Section - Ends Here */
                    courseList += '<li><span class="prg_usrdtils"><p>' + courseNameArr[indexId] + '</p></span><span id="progrss_hldr_violet" class="progrssbr"><span class="prg-left"></span><span class="prg-right"></span><div class="prg_violet"><div class="prg-3d2"></div></div></span><span class="scrvio"><p>' + parseInt(courseScoreArr[indexId]) + '</p></span><span id="badge_hldr_prog"><div class="badges">' + imgtag + '</div></span><span class="scrbtn"><a href="javascript:void(0)" data-msg="scores"></a></span><quiz names="' + quizNames + '" scores="' + quizScores + '"></quiz></li>';
                }
                jQuery("section.progress_stble > ul").html(courseList);
                jQuery("section.progress_stble:last li").each(function (i){
                    if(courseScoreArr[i] > 100) {
                        courseScoreArr[i] = 100;
					}
                    jQuery('span.progrssbr > div.prg_violet', this).animate({
                        width: courseScoreArr[i] + '%'
                    }, 1000*parseInt(i + 1), function() {

                    });
                });
            }else{
                totScore = '';
                jQuery("section.progress_stble > ul").html('<div class="no-course" data-msg="no_course_assign"></div>');
            }
            jQuery("div.prog_tp_cntnr > h1").text(totScore);
            loadAllLanguages();
			jQuery("#customscroll").niceScroll();
        },
        bindUI : function(){
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');
            $("ul#header-menu > li").removeClass("selected");
            var language, iTouch = 'click';
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
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            self.loadData();
            /* Breadcrumb Home Link Click */
            jQuery('li.prog-hme-page').on('click',function(){
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
            /* Quiz Popup */
            if(isiOS()){
                iTouch = 'touchstart';
            }
            jQuery("li span.scrbtn").live(iTouch, function (){
                var scores_pop_up = "#scr_pop_up";
                var quizElem = '', quizDom = '', margClass = '', quizNames = [], quizScores = [], quizNameList;
                quizElem = jQuery(this).siblings('quiz');
                quizNames = quizElem.attr('names').split('|||');
                quizScores = quizElem.attr('scores').split('|||');
                quizDom = '';
				for(var quizNameInd=0;quizNameInd<quizNames.length; quizNameInd++){
					var activityName = jQuery(quizNames[quizNameInd].split(':'))[0];
                    if((activityName != 'bb') && (activityName != 'aa')){
                        if((quizScores[quizNameInd] == null) || (quizScores[quizNameInd] == '')) {
							quizScores[quizNameInd] = 0;
						}
                        if(quizNameInd > 0) {
							margClass = 'prg_mrgtp';
						}
                        var imgtag;
                        imgtag = '<img src="../images/smiley-2-neutral.png">';
                        if(parseInt(quizScores[quizNameInd]) < 31){
                            imgtag = '<img src="../images/smiley-2-sad.png">';
                        }
                        else if(parseInt(quizScores[quizNameInd]) > 39){
                            imgtag = '<img src="../images/smiley-1-happy.png">';
                        }
                        quizNameList = (jQuery.trim(quizNames[quizNameInd].substr(0,3)) != 'CC:' ? quizNames[quizNameInd]:quizNames[quizNameInd].substr(3));
                        quizDom += '<div class="prgrs_pupinfo_bx ' + margClass + '"><div class="prgrs_pupinfo"><p>' + quizNameList + '</p><p class="percnt">' + parseInt(quizScores[quizNameInd]) + '</p></div><div class="prgrs_pupicon">'+imgtag+'</div></div>';
                    }
                }
                jQuery("section.prgrs_popupbx").html(quizDom);
                jQuery(scores_pop_up).show();
                jQuery("div.quizmask").show();
                //request data for centering
                var windowWidth = document.documentElement.clientWidth;
                var windowHeight = document.documentElement.clientHeight;
                var popupHeight = jQuery("section.prgrs_popupbx", scores_pop_up).height();
                var popupWidth = jQuery("section.prgrs_popupbx", scores_pop_up).width();
                 //centering
                jQuery(scores_pop_up).css({
                    "position": "fixed",
                    "top": (windowHeight / 2 - popupHeight / 2) - 65,
                    "left": (windowWidth / 2 - popupWidth / 2)-25
                });
                if(isiOS()){
                    jQuery(scores_pop_up).css({
                        "left": (windowWidth / 2 - popupWidth / 2)-10
                    });
                }
                jQuery(".row.menu").addClass('setBehind');
                jQuery("body").addClass('unScrolled');
            });
            /* Quiz Popup Close */
            jQuery("div.cls_prog_btn").die().live(iTouch, function (){
                jQuery("div.quizmask").hide();
                jQuery("div.prog_popup").hide();
                jQuery(".row.menu").removeClass('setBehind');
                jQuery("body").removeClass('unScrolled');
            });
            jQuery(window).resize(function (){
                var scores_pop_up = "#scr_pop_up";
                var windowWidth = document.documentElement.clientWidth;
                var windowHeight = document.documentElement.clientHeight;
                var popupHeight = jQuery(scores_pop_up).height();
                var popupWidth = jQuery(scores_pop_up).width();
                //centering
                jQuery(scores_pop_up).css({
                    "position": "fixed",
                    "top": windowHeight / 2 - popupHeight / 2,
                    "left": (windowWidth / 2 - popupWidth / 2)-25
                });
                if(isiOS()){
                    jQuery(scores_pop_up).css({
                        "left": (windowWidth / 2 - popupWidth / 2)-10
                    });
                }
            });
        }
    });
    return Clazz.com.components.widget.progress.js.Progress;
});
