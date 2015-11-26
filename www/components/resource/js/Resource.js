define(["framework/WidgetWithTemplate","abstract/offlineStorage"], function(template) {
    Clazz.createPackage("com.components.widget.resource.js");
    Clazz.com.components.widget.resource.js.Resource = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/resource/template/resource.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "resource",
        localConfig: null,
        globalConfig: null,
        offlineStorage: null,
		override:true,
        index:0,
		quizdata:null,
		summary:false,
		review:false,
		userDetails:false,
        layoutindex:0,
		attemptedcount:0,
		copyQuizObject:'',
		attemptTable:false,
		attemptCompleted:false,
		sample:1,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(){
            Clazz.navigationController.push(this);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
              if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<section class="tpbreadcrumbs"><ul id="resrcbred" class="bredcumlist">  \r\n' +
                  '<li class="reshdnk homepagenav"><a href="#" data-msg="Home"></a></li>  \r\n' +
                  '<li data-msg="Resources"></li><li></li><li></li></ul><div class="clear"></div></section>';
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
        getQuizWidget:function(response, courseID, modID){
            var quizWidgetDetails='';
            var attempts=[];
            var questions=[];
            jQuery.each(response,function(index,val){
                //if( index >0 ){
                   jQuery.each(val,function(index,val){
                            if( val.courseid == courseID ){
                                jQuery.each(val.modules,function(index,val){
                                    if( val. id == modID ){
                                        quizWidgetDetails = $.extend( {},val.quiz );
                                        attempts = quizWidgetDetails.quizlist[0].attempts;
                                        questions = quizWidgetDetails.quizlist[1].questions;
                                        quizWidgetDetails.quizlist=[];
                                        quizWidgetDetails.quizlist.push({
                                                                        "attempts":attempts,
                                                                        "questions":questions
                                                                        });
                                    
                                    }   
                                });
                            }
                    });
                //}
            });
            
            return quizWidgetDetails;
        },
        loadScorminWeb:function(){
//            $('body').addClass("scormPage");
//            $('.scormPage #container .pro_container #displayContentFav').css('height',$(window).height());
//            jQuery('#load_wrapper').show();
//            jQuery("#displayContent").empty().show();
//            jQuery("#displayContent").css({position : 'relative'});
//            jQuery(".iframewrap_crs_res").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
            var db = sqlitePlugin.openDatabase("CliniqueDB.db");
			if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
				var manifestXML = window.localStorage.getItem("scormURL");
			} else {
				var manifestXML = $.jStorage.get("scormURL");
			}
            if( db ){
                scormDetailsInsert(db,self.userID,self.quizCourseId,self.modID,"true",function(){
                    if( isiOS() ){
                       cordova.exec(
                                    function (args) {},
                                    function (args) {},
                                    'PDFViewerPlugin','scorm',[manifestXML]);
                    }
                    if( isAndroid() ){
                       cordova.exec(
                                    function (args) {},
                                    function (args) {},
                                    'FileOpener','scorm',[manifestXML]);
                    }
                });
                jQuery('#load_wrapper').hide();
                return false;
           }
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var self = this, language, iTouch = 'click';
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
            if(isiOS()){
             iTouch = 'touchstart';
            }
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            loadLanguages(activeLang);
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');
            jQuery('#resrcbred li:nth-child(3)').hide();
            jQuery('#resrcbred li:nth-child(4)').hide();
            var userDetails, resrccategoryid;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                resrccategoryid = window.localStorage.getItem("catrsrcId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                resrccategoryid = $.jStorage.get("catrsrcId");
            }
            var data = {
                wsfunction: "core_enrol_get_users_courses_subcat",
                moodlewsrestformat : "json",
                userid: userDetails.id,
                categoryid:resrccategoryid,
                cattype:'',
                wstoken:userDetails.token
            };
            self.loadData(data);
			jQuery('#save-notes-btn').die().live(iTouch, function(event) {
				event.preventDefault();
				// To add the active class while touch event started for devices.
				if (iTouch == "touchstart") {
					jQuery(this).addClass('active');
				}
				self.saveNotes("#note");
			});
            jQuery('#cancel-notes-btn').die().live(iTouch, function(event){
                event.preventDefault();
				if (iTouch == "touchstart") {
					jQuery(this).addClass('active');
				}
                if( self.serverComments != undefined ){
                 jQuery('#note').val(''+self.serverComments+'');
                }else{
                    jQuery('#note').val('');
                }
            });
			// To remove the active class while touch event ended for devices.
			jQuery("#save-notes-btn, #cancel-notes-btn").on("touchend", function() {
				jQuery(this).removeClass('active');
			});
			
            jQuery(".readingmaterial").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPage").hide();
                    jQuery("#showlist").show();
                    jQuery("ul.resourceicon").show();
                    jQuery("ul.resourceicon").addClass('presentShow');
                    jQuery('#resrcbred li:nth-child(3)').show();
                    jQuery('#resrcbred li:nth-child(2)').addClass('reshdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Resources'></a>");
                    jQuery('#resrcbred li:nth-child(3)').html("<span data-msg='reference'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#resrcbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".videoicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPage").hide();
                    jQuery("#showlist").show();
                    jQuery("ul.videoicon").show();
                    jQuery("ul.videoicon").addClass('presentShow');
                    jQuery('#resrcbred li:nth-child(3)').show();
                    jQuery('#resrcbred li:nth-child(2)').addClass('reshdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Resources'></a>");
                    jQuery('#resrcbred li:nth-child(3)').html("<span data-msg='video'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#resrcbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".audioicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPage").hide();
                    jQuery("#showlist").show();
                    jQuery("ul.audioicon").addClass('presentShow');
                    jQuery("ul.audioicon").show();
                    jQuery('#resrcbred li:nth-child(3)').show();
                    jQuery('#resrcbred li:nth-child(2)').addClass('reshdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Resources'></a>");
                    jQuery('#resrcbred li:nth-child(3)').html("<span data-msg='CC'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#resrcbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".quizicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPage").hide();
                    jQuery("#showlist").show();
                    jQuery("ul.quizicon").show();
                    jQuery("ul.quizicon").addClass('presentShow');
                    jQuery('#resrcbred li:nth-child(3)').show();
                    jQuery('#resrcbred li:nth-child(2)').addClass('reshdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Resources'></a>");
                    jQuery('#resrcbred li:nth-child(3)').html("<span data-msg='quiz'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#resrcbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".resource").live('click',function(){
                jQuery("#displayContent, .ifram_cls_btn, .commentNotes").hide();
                if(jQuery(".iframewrap_crs_res .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_res .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContent video").length){
                    jQuery("#displayContent video").remove();
                }
                jQuery("#readingmaterial").hide();
                jQuery("#showlist").hide();
                jQuery(".listitems").removeClass('presentShow');
                jQuery('#resrcbred li:nth-child(2)').removeClass('reshdnk resource').addClass('noSlashBread').removeAttr('data-msg').html("<span data-msg='Resources'></span>");
                loadAllLanguages();
                jQuery('#resrcbred li:nth-child(3)').hide();
                jQuery('#resrcbred li:nth-child(4)').hide();
                jQuery("#landingPage").show();
                self.footerIcons(false);
            });
            jQuery('.ifram_cls_btn').die().live('click',function(){
                jQuery("#displayContent, .ifram_cls_btn, .commentNotes").hide();
                jQuery("#displayContent").removeClass("content-ipadView");
                $('body').removeClass("scormPage");
                $('body').removeClass("quiz-main-container res-quiz-main-container");
                $('body').removeClass("crosswordwrap");
                if(jQuery("#displayContent video").length){
                    jQuery("#displayContent video").remove();
                }
                jQuery(this).remove();
                jQuery("#showlist").show();
                jQuery(".presentShow").show();
                jQuery('#resrcbred li:nth-child(4)').hide();
                var attrName = jQuery('#resrcbred li:nth-child(3) a').attr('data-msg');
                jQuery('#resrcbred li:nth-child(3)').removeClass().addClass('noSlashBread').html("<span data-msg="+attrName+"></span>");
                loadAllLanguages();
                scormUpdate(self.userID, self.quizCourseId, self.modID);
                videoTapped(0,self.video_tapped);
                self.footerIcons(false);
            });
            jQuery(".resourcelist").die().live('click',function(){
                var dataType, srcURL, type, noOfpages, fileHeading, courseItemData, quizTitle, fileType, fileURL, filepageCount, fileName;
                dataType = jQuery(this).data('file');
                (!isDevice()) ? jQuery("#showlist").hide():jQuery("#showlist").show();
                 modID = jQuery(this).attr('id');
                 timemodified = jQuery(this).attr('timemodified');
				if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
					var userDetails = JSON.parse(window.localStorage.getItem("USER"));
				} else {
					var userDetails = JSON.parse($.jStorage.get("USER"));
				} 
                if(isDevice() && isiOS()){
                    jQuery("#showlist").hide();
                }
                if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                    removeOfScroll();
                }
                self.courseID = jQuery(this).attr('data-courseID');
                self.footerIcons(false);
                self.video_tapped=false;
                switch(dataType){
                    case 'material':
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "Document";
                        fileName = (isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename'));
                           if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                            srcURL = jQuery(this).attr("url");
                           }else{
                            srcURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                           }
                        
                        jQuery("#landingPage").hide();
                        break;
                    case 'video':
                        jQuery("#landingPage").hide();
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "video";
                        fileName = (isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename'));
                         if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                          srcURL = jQuery(this).attr("url");
                         }else{
                           srcURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                         }
                         self.video_tapped=true;
                        break;
                    case 'audio':
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "audio";
                        fileName = (isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename'));
                         if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                           srcURL = jQuery(this).attr("url");
                         }else{
                           srcURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                         }
                        jQuery("#landingPage").hide();
                        self.video_tapped=true;
                        break;
                    case 'quiz':
                        fileHeading = "quiz";
                        if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                          srcURL = jQuery(this).attr("url");
                        }else{
                         srcURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                        }
                        
                        jQuery("#landingPage").hide();
                        jQuery("#showlist ul").hide();
                        type = jQuery(this).attr("type");
                        quizTitle = type.split('.')[0];
                        if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                           var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                           var course_ID = jQuery(this).attr('data-quiz_CourseId');
                           self.quizCourseId= course_ID;
                           self.userID = userDetails.id;
                           self.courseID = course_ID;
                           self.modID = jQuery(this).attr('data-modid');
                           self.quizModId=	self.modID;
                           self.quizActivity={};
                           self.quizActivity.response={};
                           
                           self.quizActivity.response = self.getQuizWidget(self.UserDetails,self.courseID,self.modID);
                           self.loadOfflineQuiz(self, self.quizActivity);
                           return false;
                        }
                        self.loadquizinWeb(srcURL, quizTitle, dataType);
                        return false;
                    case 'scorm':
                       fileHeading = "scorm";
                       if( !isDevice() && !isPhoneGap()){
                        jQuery("#landingPage").hide();
                        jQuery("#showlistFav ul").hide();
                       }
                       var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                       var course_ID = jQuery(this).attr('data-quiz_CourseId');
                       var  srcURL = jQuery(this).attr("url");
                       self.quizCourseId= course_ID;
                       self.userID = userDetails.id;
                       self.courseID = course_ID;
                       self.modID = jQuery(this).attr('data-modid');
                       if( isDevice() && isPhoneGap()  && self.globalConfig.application.offLine ){
                           jQuery("#showlist").show() 
                           if( isAndroid() && isPhoneGap() ){
                           
                           window.localStorage.setItem("scormURL",srcURL);
                           window.localStorage.setItem("manifestURL",srcURL);
                           
                           }else if( isiOS() && isPhoneGap() ){
                           window.localStorage.setItem("scormURL","file://"+srcURL);
                           window.localStorage.setItem("manifestURL",srcURL);
                           }
                           changeManifestFile(self.userID,self.quizCourseId,self.modID,function(){
                                      self.loadScorminWeb(self);
                           });
                       }else{
                         self.loadquizinWeb(srcURL, quizTitle, dataType);
                       }
                    return false;
                    case "puzzle":
                       fileHeading = "quiz";
                       if( isDevice() && isPhoneGap() ){
                        srcURL = jQuery(this).attr("url");
                       }else{
                        srcURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                       }
                       type = jQuery(this).attr("type");
                       quizTitle = type.split('.')[0];
                       if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                           if( !checkAppOnline() ){
                               jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                               updateLanguage();
                               jQuery('.errorCode-pop').show();
                               return false;
                           }
                           if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                           }
                           var data = {}, serviceUrl = self.globalConfig.apiAddress.service;
                           data.userid = userDetails.id;
                           cordova.exec(
                                        function(response) {
                                            var response = JSON.parse(response);
                                            var data = {
                                                username: response.username,
                                                password:response.pass,
                                                service: "moodle_mobile_app",
                                                action:'login'
                                            };
                                            self.ajaxReq(serviceUrl,data,function(resp){
                                                if(typeof(resp.USER) !== 'undefined') {
                                                    jQuery("#landingPage").hide();
                                                    jQuery("#showlist ul").hide();
                                                    self.loadquizinWeb(srcURL, quizTitle, dataType);
                                                    jQuery("#load_wrapper, .overlaycontainer").hide();
                                                    return false;
                                                
                                                }else{
                                                    jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10001');
                                                    updateLanguage();
                                                    jQuery('.errorCode-pop').show();
                                                    return false;
                                                }
                                            });
                                        
                                        },
                                        function(result) {},'LoginPlugin', 'secure_details', [data]);
                       }
                    return false;
                    default:
                        break;
                }
                courseItemData = {
                    fileType: type.substring(type.lastIndexOf(".") + 1).toLowerCase(),
                    fileURL: srcURL,
                    fileHeader:fileHeading,
                    filepageCount: noOfpages,
                    fileName: type.split('.')[0],
                    fileNameUpload: fileName
                    /*fileName: (isNaN(type.split('.')[0]) ? type.split('.')[0].replace(/\s+/g, '_') : type.split('.')[0]) */
                };
                self.modID =modID;
                self.timemodified =timemodified;
                if( isDevice() && isPhoneGap()  && self.globalConfig.application.offLine ){
                 self.pdfURL = jQuery(this).attr("url");
                }else if( isDevice() && isPhoneGap()  && !self.globalConfig.application.offLine ){
                  self.pdfURL = jQuery(this).attr("url")+'&token='+userDetails.token;
                }
				self.fileType = courseItemData.fileType;
                self.loadResourceComment();
                if( !isDevice() ){
                	self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                }else if( isDevice() ){
                	self.loadFileinWeb(self, courseItemData);
                }
            });
            jQuery(".Document a").live('click',function() {
                jQuery("#displayContent, .commentNotes").hide();
                if(jQuery(".iframewrap_crs_res .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_res .ifram_cls_btn").remove();
                }
                jQuery('#resrcbred li:nth-child(4)').hide();
                jQuery('#showlist').show();
                jQuery('#readingmaterial').show();
                jQuery('#resrcbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='reference'></span>");
                loadAllLanguages();
            });
            jQuery(".video a").live('click',function() {
                jQuery("#displayContent, .commentNotes").hide();
                if(jQuery(".iframewrap_crs_res .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_res .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContent video").length){
                    jQuery("#displayContent video").remove();
                }
                jQuery('#resrcbred li:nth-child(4)').hide();
                jQuery('#showlist').show();
                jQuery('#videolist').show();
                jQuery('#resrcbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='video'></span>");
                loadAllLanguages();
            });
            jQuery(".CC a").live('click',function() {
                jQuery("#displayContent, .commentNotes").hide();
                if(jQuery(".iframewrap_crs_res .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_res .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContent video").length){
                    jQuery("#displayContent video").remove();
                }
                jQuery('#resrcbred li:nth-child(4)').hide();
                jQuery('#showlist').show();
                jQuery('#audiolist').show();
                jQuery('#resrcbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='CC'></span>");
                loadAllLanguages();
            });
            jQuery(".quiz a").live('click',function() {
                jQuery("#displayContent, .commentNotes").hide();
                if(jQuery(".iframewrap_crs_res .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_res .ifram_cls_btn").remove();
                }
                jQuery('#resrcbred li:nth-child(4)').hide();
                jQuery('#showlist').show();
                jQuery('#quizlist').show();
                jQuery('#resrcbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='quiz'></span>");
                loadAllLanguages();
            });
            jQuery('.homepagenav').on('click',function(){
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
                                                                    
            jQuery(".AndroidVideo").die().live('click', function() {
               cordova.exec(
                            function (args) {},
                            function (args) {},
                            ''+((self.globalConfig.application.offLine)?'FileOpener':'FileOpenerOnline')+'', 'openVideoFile', [self.AndroidVideoURl]);
            });
            jQuery(".footer_comment").die().live('click', function() {
             self.loadResourceComment();
             jQuery(".commentmodal,.commentmodal-backdrop").show();
			 jQuery(this).addClass('selected');
            });
            jQuery(".commentSavebtn").off().on('click', function(){
                self.saveNotes(".commentform-control");
                jQuery(".commentmodal,.commentmodal-backdrop").hide();
				jQuery(".footer_comment").removeClass('selected');
            });
            jQuery(".commentCancelbtn").off().on('click', function(){
              jQuery(".commentmodal,.commentmodal-backdrop").hide();
			  jQuery(".footer_comment").removeClass('selected');
            });
            self.removeSlashBreadcrumb();
            if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                removeOfScroll();
            }
			
			
			// Attempt Quiz
			jQuery(".attemptQuiz").die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
                self.index = 1;
                self.layoutindex = 0;
                self.quizdata.quizlist[self.currentQuiz].attempts[0].state = "inprogress";
                self.quizdata.quizlist[self.currentQuiz].attempts[0].startedOn = new Date();
                self.quizdata.quizlist[self.currentQuiz].attempts[0].timeTaken = "2 min 55 sec";
                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false, function(){
                  self.loadQuizData(self.quizdata);
                  jQuery(window).scrollTop(0);
                });
                
			});

			// Next Quiz
			jQuery(".nextquiz").die().live(iTouch,function(){
              jQuery("#load_wrapper,.overlaylightbox").show();
                                           if(!jQuery(this).hasClass('review')){


                                           jQuery('.questionId').each(function(){

                                          var questionId = jQuery(this).data('id')
                                          // question Loop
                                          jQuery.each(self.quizdata.quizlist[self.currentQuiz].questions,function(i,question){
                                                      // check the same question
                                                      if(question.id == questionId){
                                                      if(question.type == "multichoice"){
                                                    	  
                                                    	  if(question.istruefalse == 0){
                                                    	       var answer = [];
                                                    	       question.singleType = false; 
                                                               for (var i=0; i < $('input[name=option'+questionId+']').length; i++){
                                                               if ($('input[name=option'+questionId+']')[i].getAttribute('checked'))
                                                               answer.push($('input[name=option'+questionId+']')[i].value)

                                                               jQuery.each(question.choices,function(i,val){
                                                                           if ($('input[name=option'+questionId+']')[i].getAttribute('checked')){
                                                                           if($('input[name=option'+questionId+']')[i].value == val.id){
                                                                           question.choices[i].isSelected = true;
                                                                           question.choices[i].value = 1;
                                                                           jQuery.each(question.answers,function(rightanswerincrement,value){
                                                                                       if(question.choices[i].id == value)
                                                                                       question.choices[i].isright = true;

                                                                                       });
                                                                           }

                                                                           }else{
                                                                           question.choices[i].value = 0;
                                                                           question.choices[i].isSelected = false;
                                                                           question.choices[i].isright = false;
                                                                           }

                                                                           });
                                                               }
                                                           if(answer.length){
                       											question.userAnswer = answer;	
                       										}else{
                       											question.userAnswer = [];
                       											question.userMark = 0;
                       										}
                       										self.mutilchoicemark(question);
                                                    	  }else{
                                                    		  /* Multi choice with single type option */
                                                    		  question.singleType = true; 
                                                    		  jQuery.each(question.choices,function(i,val){  
                     											 if($('input[name=option'+questionId+']:checked').val()){
                     												 var selectQuestion = $('input[name=option'+questionId+']:checked').val();
                     												 question.userAnswer = selectQuestion;
                     												 if(val.id == selectQuestion){
                     													 	question.choices[i].isSelected = true;
                     													 	if(question.answers[0] == val.id){
                     													 		question.choices[i].isright = true;
                     													 		question.userMark = question.mark;
                     													 	}else{
                     													 		question.choices[i].isright = false;
                     													 		question.userMark = 0;
                     													 	}
                     												 } 
                     												 else{
                     													 question.choices[i].isSelected = false;
                     												 }
                     											 }else{
                     												 question.userAnswer = [];
                     												 question.userMark = 0;
                     											 }
                     										 });
                                                    	  }
                                               

                                                      }else if(question.type == 'match'){
														var answer = []
														for (var i=0; i < $('select[name=select'+questionId+']').length; i++){
																	 jQuery.each(question.choices,function(index,element){
																			if($('select[name=select'+questionId+']')[i].getAttribute('data-id')== element.id){
																				element.value = parseInt($('select[name=select'+questionId+']')[i].value);
																				var seldctboxId = $('select[name=select'+questionId+']')[i].getAttribute('id')
																				//question.choices[i].valueText = jQuery("#"+seldctboxId+" option:selected").data('value');
																				if($('select[name=select'+questionId+']')[i].value != 0){
																					element.valueText = jQuery("#"+seldctboxId+" option:selected").data('value');
																					answer.push(element.label);			
																					 question.userAnswer = answer;
																				}
																				 
																			}
																		
																	 });		
															}
														   self.matchmarkcalculation(question);
														   localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
													}else{
                                                    	  jQuery.each(question.choices,function(i,val){  
                  											if($('input[name=option'+questionId+']:checked').val()){
                  												question.userAnswer = '';
                  												var selectQuestion = $('input[name=option'+questionId+']:checked').val();
                  												question.userAnswer = selectQuestion;
                  												if(selectQuestion == question.answers[0]){
                  													if(val.id == question.answers[0]){
                  														question.choices[i].value = 1; 
                  														question.userMark = question.mark;
                  													}
                  													else
                  														question.choices[i].value = 2;
                  												}else{
                  													if(val.id == selectQuestion){
                  														question.choices[i].value = 0; 
                  														question.userMark = 0;
                  													}	
                  													else
                  														question.choices[i].value = 2;
                  												}
                  											}else{
                  												question.userAnswer = [];
                  												question.userMark = 0;
                  											}
                  										});
                                                      }

                                                      }
                                      });

                                });
                           localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false, function(){
                                 if(self.quizdata.quizlist[self.currentQuiz].questions.length == self.index){
                                     self.index = 0;
                                     self.summary = true;
                                 }else{
                                     self.index = parseInt(self.index)+1;
                                     self.layoutindex = parseInt(self.layoutindex)+1;
                                 }
                                 
                                 self.loadQuizData(self.quizdata);
                            });
                           }else{
                           self.index = parseInt(self.index)+1;
                           self.layoutindex = parseInt(self.layoutindex)+1;
                           self.loadQuizData(self.quizdata);
                           }
                           jQuery(window).scrollTop(0);

			});

			// Re attempt the Quiz
			jQuery('.return-attempt').die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
				self.index = 1;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;

                 localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false ,function(){
                  self.loadQuizData(self.quizdata);
                 });
				
			});

			// Re attempt the Quiz
			jQuery('.reattempt-quiz').die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
				var index = $(this).data('index');
				self.index = 1;
				self.currentQuiz = index;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;

                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false ,function(){
                  self.loadQuizData(self.quizdata);
                });
				
			});

			// Start Review

			jQuery('.start-review').die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
				var index = $(this).data('index');
				self.index = 1;
				self.currentQuiz = index;
				self.review = true;
				self.summary = false;
                self.layoutindex = 0;

                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false,function(){
                 self.loadQuizData(self.quizdata);
                });
				
			});

			//Finish Review
			jQuery('.finish-review').die().live(iTouch,function(){

				self.index = 0;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;
                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false,function(){
                   self.loadQuizData(self.quizdata);
                });
				

			});

			// Submit the Quiz
			jQuery('.submit-attempt').die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
				self.quizdata.quizlist[self.currentQuiz].attempts[0].state = "finished";
				self.quizdata.quizlist[self.currentQuiz].attempts[0].completedOn = new Date();
				self.index = 1;
				self.review = true;
				self.summary = false;
                self.layoutindex = 0;
                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, true, function(){
                  if( !isAndroid() ){
                   quizSyncBack();
                  }
                   self.loadQuizData(self.quizdata);
                  if( !checkAppOnline() ){
                      jQuery('.errorCode-pop .prog-summarys').attr('data-msg','quizOffline');
                      updateLanguage();
                      jQuery('.errorCode-pop,.overlaylightbox').show();
                  }
                });
				
			});
        },
        removeSlashBreadcrumb: function(){
            jQuery("#resrcbred li" ).each(function () {
                jQuery("#resrcbred li:hidden:first").prev().addClass('noSlashBread');
            });
        },
        loadData:function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.restservice,newsli='';
            self.UserDetails=[];
            if( isDevice() && self.globalConfig.application.offLine ){
                cordova.exec(
                             function(result) {
                                 var rsrcresp = JSON.parse(result);
                                 for(var i =0; i <rsrcresp.length; i++ ){
                                     var crsId = rsrcresp[i].id;
                                     self.resourceContents(crsId);
                                 }
                                 self.disableTiles();
                             },
                             function(result) {
                             
                             },'LoginPlugin', 'core_enrol_get_users_courses_subcat', [data]);
            }else{
                jQuery.ajax({
                    url: serviceUrl,
                    data:data,
                     cache:false,
                    async:false,
                    type:'POST',
                    dataType:'json',
                        crossDomain: true,
                    success:function(rsrcresp){
                        /* Deleting Existing Offline Storage Data */
                        self.offlineStorage.deleteResource('RESOURCE');
                        for(var i =0; i <rsrcresp.length; i++ ){
                            var crsId = rsrcresp[i].id;
                            self.resourceContents(crsId);
                        }
                        self.disableTiles();
                    },
                    error: function ( jqXHR, textStatus, errorThrown ){
                        self.offlineStorage.getResourceCourse('RESOURCE');
                        setTimeout(function (){
                            jQuery(".res_hid_data > input[type='hidden']").each(function (){
                                self.resourceSuccess(JSON.parse($(this).val()));
                            });
                            jQuery(".res_hid_data").empty();
                        }, 1000);
                    }
                });
            }


        },
		FirstPage:function(data,status,tableIndex,isHeader,lastQuiz){
        	var self = this, FirstPageElements = '',totalGrade = self.totalGrade(data.questions),feedback='';
        	if(status != ''){
        		if(isHeader){
					
					if(self.noOfAttempts == 0){
						FirstPageElements +="<div class='paracont'><span data-msg='attemptsallowed'></span>: <span data-msg='allinone'></span></div><div class='paracont' data-msg='summaryofattempts'></div>";
					}else{
						FirstPageElements +="<div class='paracont'><span data-msg='attemptsallowed'></span>: "+self.noOfAttempts+"</div><div class='paracont' data-msg='summaryofattempts'></div>";
                    }
					// feedback implementation 
        			if(self.quizdata.quizinfo[0].feedback.length >= 1){
						if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
							var feedback = "<th>Feedback</th>";
                         }
					}else{
						var feedback = '';
					}
        			FirstPageElements += "<table class='quizdtlgrid'><tr><th><span data-msg='attempts'></span></th><th><span data-msg='state'></span></th><th><span data-msg='grade'></span></th><th><span data-msg='review'></span></th>"+feedback+"</tr><tbody class='already'>";
        			isHeader = false;
					if(self.quizdata.alreadyattempted.length)
							 self.displayIndex = self.quizdata.alreadyattempted.length+1;
						else
							 self.displayIndex = 1;
        		}
        		self.attemptTable = true;
				var notNumber = isNaN(self.displayIndex);
					if(notNumber){
						 if(self.quizdata.alreadyattempted.length)
							 self.displayIndex = self.quizdata.alreadyattempted.length+1;
						 else
							 self.displayIndex = 1;
					}
					
        		if(status == 'f'){
        			 var totalMark = 0,userGrade;
                     jQuery.each(data.questions,function(i,val){
						 if(val.userMark != null && val.userMark != undefined)
							totalMark = parseInt(totalMark) + parseInt(val.userMark);
                     });
                     userGrade = ((totalMark/totalGrade)*100);
					 userGrade = Math.round(userGrade);
					 data.attempts[0].sumgrades = userGrade;
					 // feedback implementation 
					 var QuizGrade = self.quizdata.quizinfo[0].grade;
                    var Quizsumgrades = self.quizdata.quizinfo[0].sumgrades;
                    var userMark = data.attempts[0].sumgrades;
                    
                    var marksValue = (totalMark/Quizsumgrades*100);
                    
                    var finalGradeDisplay = (marksValue*QuizGrade/100);
                    finalGradeDisplay = Math.round(finalGradeDisplay);
                    
                    // grade and sum grade not equal
                    if(Quizsumgrades != QuizGrade){
						var todisplayGrade = finalGradeDisplay
                    }
                    // grade and sum grade equal
                    if(Quizsumgrades == QuizGrade){
						var todisplayGrade = totalMark;
                    }
                    if(Math.round(QuizGrade) == 100){
						var todisplayGrade = finalGradeDisplay;
                    }
                    todisplayGrade = Math.round(todisplayGrade);
					
					if(self.quizdata.quizinfo[0].feedback.length != 1){
						jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
							if(feedbackValue.feedbacktext){
								if((data.attempts[0].sumgrades >= feedbackValue.mingrade) && (data.attempts[0].sumgrades <  feedbackValue.maxgrade))
									FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade +"</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td><td>"+(feedbackValue.feedbacktext)+"</td></tr>";
							}else{
								FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade +"</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td></tr>";
							}
							
						});
					}else{
						if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
							if((data.attempts[0].sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (data.attempts[0].sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
								FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade +"</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td><td>"+self.quizdata.quizinfo[0].feedback[0].feedbacktext+"</td></tr>";
							else
								FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade +"</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td><td></td></tr>";
						}else{
							FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade +"</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td></tr>";
						}
					}
        			//FirstPageElements += "<tr><td>"+(data.attempts[0].attempt)+"</td><td>Finished</td><td>"+userGrade+" %</td><td><div class='start-review' data-index="+tableIndex+">Review</div></td></tr>";
        			//self.data.overallGrade = userGrade*totalGrade/100;
        		}
        		else{
        			FirstPageElements += "<tr><td>"+(self.displayIndex++)+"</td><td colspan='4'><span data-msg='stateinprogress'></span></td></tr>";
        		}
        		return FirstPageElements;
        	}else{
        		if(isHeader){
        			if(!self.attemptTable){
						if(self.attemptedcount > 1 ){
							 // feedback implementation
							if(self.quizdata.quizinfo[0].feedback.length >= 1){
								if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
									var feedback = "<th>Feedback</th>";
                                }
							}else{
								var feedback = '';
							}
							
							var attemptNew = "<table class='quizdtlgrid'><tr><th><span data-msg='attempts'></span></th><th><span data-msg='state'></span></th><th><span data-msg='grade'></span></th><th><span data-msg='review'></span></th>"+feedback+"</tr><tbody class='already'>";
							attemptNew += "</tbody></table><div class='attemptQuiz btncommon' data-msg='attemptquiznow'></div></div>";
						}else{
							attemptNew = "<div class='attemptQuiz btncommon' data-msg='attemptquiznow'></div></div>";
						}				
            			isHeader = false;
        			}else{
        				attemptNew = "<div class='attemptQuiz btncommon' data-msg='attemptquiznow'></div></div>";
            			isHeader = false;
        			}
        		}
        		return attemptNew;
        	}
        },
        overallGrade:function(QuizData){
        	var totalGrade = 0,userGrade = 0;
        	jQuery.each(QuizData,function(i, val){
        		totalGrade = parseInt(totalGrade) + parseInt(val.mark);
				if(QuizData[i].answer == QuizData[i].userAnswer)
					userGrade = parseInt(userGrade) + parseInt(val.mark);
			});

        	return (userGrade*totalGrade/100);

        },
        totalGrade:function(QuizData){
        	var gradeMark = 0;
        	jQuery.each(QuizData,function(i, val){
				gradeMark = parseInt(gradeMark) + parseInt(val.mark);
			});
        	return gradeMark;
        },
        userGrade:function(QuizData){
        	var answerMark = 0,i = 0;
        	jQuery.each(QuizData,function(i, val){
				if(QuizData[i].answers == QuizData[i].userAnswer)
					answerMark = parseInt(answerMark) + parseInt(val.mark);
				if(val.multiselectmark)
					answerMark = parseInt(answerMark) + parseInt(val.multiselectmark);
			});
        	return answerMark;
        },
		 matchmarkcalculation:function(QuizData){
        	var correctanswer = 0,invalid = 0,actualLength;
        	var actualLength =  QuizData.choices.length;
        	 for( j=0; j < QuizData.choices.length; j++ ){
        		 if(QuizData.choices[j].invalid){
        			 invalid = (invalid +1);
        		 }
        		 	if(QuizData.choices[j].valueText && QuizData.choices[j].valueText != 0 ){
        		 		if(QuizData.choices[j].valueText == QuizData.choices[j].id){
        		 			correctanswer = correctanswer + 1;
        		 			QuizData.choices[j].isright = true;
        		 		}else{
        		 			QuizData.choices[j].isright = false;
        		 		}
        		 	}
				 }
        	 actualLength = (actualLength- invalid);
        	 var actualMark = (QuizData.mark / actualLength)
			 if(correctanswer != 0){
				 QuizData.userMark = (actualMark * correctanswer);
				  QuizData.userMark = Math.round(QuizData.userMark);
				 return QuizData;
			 }else{
				 QuizData.userMark = 0;
				 return QuizData;
			 }
        },
        mutilchoicemark:function(QuizData){
        	var answerMark = 0,l=0,mark = 0,userAnswerCount = 0,fraction = 0;
    		if(QuizData.type){
    			mark = QuizData.mark;
    			userAnswerCount = QuizData.answers.length;
					 for( j=0; j < QuizData.choices.length; j++ ){
						 if(QuizData.choices[j].isright){
									l = l+1;
									if(QuizData.choices[j].fraction != 0)
										fraction = fraction + QuizData.choices[j].fraction;
						 }
					 }
			} 
    	
	        if(l == userAnswerCount){
	        	QuizData.userMark = mark;
				mark = Math.round(mark);
	        	return mark;
	        }else{
	        	var ratio = (fraction*mark);
	        	QuizData.userMark = (fraction*mark);
				ratio = Math.round(ratio);
	        	return ratio;
	        	
	        }
        },
		loadOfflineQuiz:function(self, response){
			var self = this;
			
		    self.coursemodId = JSON.parse(window.localStorage.getItem("coursemodid"));
            var db = sqlitePlugin.openDatabase("CliniqueDB.db");
            if( db ){
                db.transaction(function(tx) {
                    tx.executeSql("SELECT value FROM clinique_quizLocalStorage WHERE clinique_quizLocalStorage.courseId=? and clinique_quizLocalStorage.modId=? and clinique_quizLocalStorage.userId=?",[self.quizCourseId,self.quizModId,self.userID],
                                  function(tx,results){
                                     console.log("Results=="+results.rows.length);
                                     if( results.rows.length ){

                                        self.quizdata = JSON.parse(results.rows.item(0)['value']);
                                        self.index = 0;
                            		    self.summary = false;
                            		    self.review = false;
										// To achieve attempts changes sync back 
										self.noOfAttempts = self.quizdata.quizinfo[0].attempts;
										if(self.quizdata.quizinfo[0].newattempts){
											if(self.quizdata.quizinfo[0].newattempts != ''){
													self.newattempts = self.quizdata.quizinfo[0].newattempts;
													// To achieve attempts changes sync back 
													
													jQuery.each(self.quizdata.quizlist[0].questions,function(index,val){ 
														  slot += index+1+',';      
													  });
														var questionsObj = jQuery.extend(true, [], self.quizdata.questions);
														var attemptObj =  {
															"attempt": "",
															"preview": "",
															"state": "",
															"sumgrades": "",
															"slot":slot.substring(0,slot.length-1)
														  };
														var attempts = [];
														attempts.push(attemptObj);
														var actualQuiz = { "attempts":attempts, "questions":questionsObj};
														
													if(parseInt(self.newattempts) > parseInt(self.noOfAttempts)){
														var newattempts = (parseInt(self.newattempts) - parseInt(self.noOfAttempts));
														 for(var j=1; j<=newattempts;j++){
															 var index = self.quizdata.quizlist.length;
															 var copyQuiz = jQuery.extend(true, {}, actualQuiz);
															 copyQuiz.attempts[0].state= '';
															 copyQuiz.attempts[0].attempt = '';
															 copyQuiz.attempts[0].attempt= index;
															 self.quizdata.quizlist[index] = copyQuiz;	 
														 }
													}
													if(parseInt(self.newattempts) == 0){
															 for(var j=1; j<=30;j++){
																 var index = self.quizdata.quizlist.length;
																 var copyQuiz = jQuery.extend(true, {}, actualQuiz);
																 copyQuiz.attempts[0].state= '';
																 copyQuiz.attempts[0].attempt = '';
																 copyQuiz.attempts[0].attempt= index;
																 self.quizdata.quizlist[index] = copyQuiz;	 
															 }
													}
													self.quizdata.quizinfo[0].attempts = self.newattempts;
											}
										
										}
										self.overAllAttempts = self.quizdata.quizinfo[0].attempts;
										self.attemptedcount = self.quizdata.quizinfo[0].attemptedcount;
										self.sample = 1;
										// To achieve on-line attempts changes sync back 
										jQuery.each(self.quizdata.alreadyattempted,function(indexofcopyObj,valueofcopyObj){
											jQuery.each(self.quizdata.quizlist,function(quidataIndex, quizdatavalue){
													if(quizdatavalue.attempts[0].rowid == valueofcopyObj.rowid)
															valueofcopyObj.isDisplay = true;			
											});
										});

                                      }else{
                                          self.quizdata = response.response;
                                          self.index = 0;
                              		    	self.summary = false;
                              		    	self.review = false;
                              		    	self.noOfAttempts = self.quizdata.quizinfo[0].attempts;
                              		      self.noOfAttempts = response.response.quizinfo[0].attempts;
                						  self.overAllAttempts = response.response.quizinfo[0].attempts;
                						  self.attemptedcount = self.quizdata.quizinfo[0].attemptedcount;
										  self.copyQuizObject = jQuery.extend(true, {}, self.quizdata);
                                          self.quizdata.questions = self.copyQuizObject.quizlist[0].questions;
                                         self.quizdata.alreadyattempted = [];
                                          self.quizdata.quizinfo[0].modid =  self.quizModId;
                                          var slot = '';
                                          jQuery.each(self.quizdata.quizlist[0].questions,function(index,val){
                                                      slot += index+1+',';
                                          });
                                          self.quizdata.quizlist[0].attempts[0].slots = slot.substring(0,slot.length-1);
										  
										   var attemptObj =  {
											"attempt": "",
											"preview": "",
											"state": "",
											"sumgrades": "",
											"slots":slot.substring(0,slot.length-1)
										  };
										  if(self.quizdata.quizlist[0].attempts.length >= 1){
											  if(self.quizdata.quizlist[0].attempts[0].state == 'finished'){
												  self.attemptedcount = self.quizdata.quizinfo[0].attemptedcount;
												  self.copyQuizObject = jQuery.extend(true, {}, self.quizdata);
												  self.quizdata.quizlist[0].attempts = [];
												  self.quizdata.quizlist[0].attempts.push(attemptObj);
												  self.quizdata.alreadyattempted = self.copyQuizObject.quizlist[0].attempts;
												  localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
												    if(self.noOfAttempts != '0' || self.noOfAttempts != 0){
													  self.noOfAttempts = (self.noOfAttempts -  self.attemptedcount);
													  if(self.noOfAttempts == 0){
														  self.attemptCompleted = true;
														  //self.quizdata.quizlist = [];
													  }else{
														  self.attemptCompleted = false;
													  }
												  }
											  }
											 
										  
										  }
						  
                                          //localStorage.setItem(self.quizCourseId+self.quizModId+'quiz',JSON.stringify(self.quizdata));
										   if(self.noOfAttempts >= 1){
										    	self.quizdata.quizlist[0].attempts[0].attempt = self.attemptedcount+1;
										    	self.attemptedcount = self.attemptedcount+1;
						                        for(var j=1; j<=self.noOfAttempts-1;j++){
						                        		 var copyObject = jQuery.extend(true, {}, self.quizdata.quizlist[0]);
						                        		 copyObject.attempts[0].state= '';
						                        		 copyObject.attempts[0].attempt = '';
						                        		 copyObject.attempts[0].attempt= self.attemptedcount+j;
						                                 self.quizdata.quizlist[j] =copyObject ;
						                        }
										    }else{
										    	if(!self.attemptCompleted){
										    		self.quizdata.quizlist[0].attempts[0].attempt = self.attemptedcount+1;
											    	self.attemptedcount = self.attemptedcount+1;
											    	 for(var j=1; j<=30;j++){
						                        		 var copyObject = jQuery.extend(true, {}, self.quizdata.quizlist[0]);
						                        		 copyObject.attempts[0].state= '';
						                        		 copyObject.attempts[0].attempt = '';
						                        		 copyObject.attempts[0].attempt= self.attemptedcount+j;
						                                 self.quizdata.quizlist[j] =copyObject ;
											    	 }
										    	}
										    }
                                       }
                                       localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
                                          var flag = true;
                                         self.attemptTable = false;
                                         console.log('self.attemptTable',self.attemptTable);
                                          jQuery.each(self.quizdata.quizlist, function(index,val){
                                             if(flag){
													 switch (val.attempts[0].state) {
														case "finished":
															self.currentQuiz = index;
															self.loadQuizData(self.quizdata);
															break;
														case "completed":
															self.currentQuiz = index;
															self.loadQuizData(self.quizdata);
															break;
														case "inprogress":
															self.currentQuiz = index;
															self.loadQuizData(self.quizdata);
															flag = false;
															break;
														case "":
															self.currentQuiz = index;
															//val.attempts[0].attempt = index+1;
															self.loadQuizData(self.quizdata,index);
															flag = false;
															break;								   
												 } 
											 }
                                          });

                                  },
                                  function(tx,e){
                                    console.log("clinique_quizLocalStorage selectQuery Error**"+e.message);
                                  });
                });
            }
		},
		// QUIZ
		loadQuizData:function(data){
            var self=this,firstQuestion=null,flag = true;
            jQuery("#load_wrapper,.overlaylightbox").hide();
            jQuery(".quiz-container").empty();
            jQuery("#load_wrapper").show();
            
            jQuery("#displayContent").empty().show();
            jQuery("#displayContent").css({ position : 'relative' });
            jQuery(".iframewrap_crs_res").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
            jQuery("#displayContent").addClass('quiz-container');
            jQuery("#displayContent").show();
            $('body').addClass("quiz-main-container res-quiz-main-container");
            $('.quiz-main-container #displayContent').css('height',$(window).height()-45);
            jQuery("#load_wrapper").hide();
            /* Question and anwser displays */
			if(self.index != 0 && self.review == false){

				//data.quizlist[self.currentQuiz].attempts[0].attempt = self.currentQuiz+1;
			
				var layout = data.quizinfo[0].layouts.split(',');

				jQuery.each(layout,function(index,value){

				if(layout[self.layoutindex] != 0 && layout[self.layoutindex] != undefined){

	                if(index !=0)
	                	self.index++;

	                self.layoutindex ++;
					data.quizlist[self.currentQuiz].questions[self.index-1].mark = Math.round(data.quizlist[self.currentQuiz].questions[self.index-1].mark);
	                var singleType = data.quizlist[self.currentQuiz].questions[self.index-1].istruefalse;
					var multichoice = data.quizlist[self.currentQuiz].questions[self.index-1].type;
					if(data.quizlist[self.currentQuiz].questions.length){
						var question = data.quizlist[self.currentQuiz].questions[self.index-1].question
						var quizquestions = "<div class='qustn-head'><span class='f_left'><span data-msg='question'></span> "+(self.index)+"</span> <span class='f_right'>"+data.quizlist[self.currentQuiz].questions[self.index-1].mark+" <span data-msg='points'></span></span></div>";
						// Video type question
						//if(data.quizlist[self.currentQuiz].questions[self.index-1].isText || data.quizlist[self.currentQuiz].questions[self.index-1].isImage){
						var questionType = question.substring(question.length-4).toLowerCase();
						if(questionType == '.png' || questionType == '.jpg' || questionType == 'jpeg' || questionType == '.PNG' || questionType == '.JPG' || questionType == 'JPEG'){
							quizquestions += "<div class='qustn-label'><img src ="+data.quizlist[self.currentQuiz].questions[self.index-1].question+" /></div>";
						}else if(questionType == '.mp4'){	
							if(isAndroid()){
								quizquestions += '<div class="AndroidQuizVideo" data-url="'+data.quizlist[self.currentQuiz].questions[self.index-1].question+'"><img src="../images/android_landscape.png"></div>';
							}else{
								quizquestions += '<div style="clear:both;"><video width="400" controls><source src="'+data.quizlist[self.currentQuiz].questions[self.index-1].question+'" type="video/mp4">Your browser does not support HTML5 video.</video></div>';
							}
						}
						else if((questionType == '.wmv') || (questionType == '.avi')){
							quizquestions += "Your browser does not support HTML5 video";
						}else{
							quizquestions += "<div class='qustn-label'>"+data.quizlist[self.currentQuiz].questions[self.index-1].question+"</div>";
						}
						
					
							var questionId = data.quizlist[self.currentQuiz].questions[self.index-1].id;
							if(multichoice == 'multichoice' && singleType == 0){
								quizquestions += "<div style='clear:both;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectmulti'></span>:</div>"
							}else if(multichoice == 'multichoice' && singleType == 1){
								quizquestions += "<div style='clear:both;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectone'></span>:</div>"
							}else if(multichoice == 'truefalse' ){
								quizquestions += "<div style='clear:both;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectone'></span>:</div>"
							}else if(multichoice == 'match' ){
								quizquestions += "<div style='clear:both;'><span class='selectlbl questionId' data-id ="+questionId+" ></span></div>"
							}
						
							
							
							if(multichoice == "match"){
								 var option = "<option value='0' data-value='0' selected='selected'>Choose..</option>";
								jQuery.each(data.quizlist[self.currentQuiz].questions[self.index-1].choices, function(indexoflabel,value){
									option += "<option value="+(indexoflabel+1)+" data-value="+value.id+" >"+value.label+"</option>";
								});
							}

							 jQuery.each(data.quizlist[self.currentQuiz].questions[self.index-1].choices, function(i,val){
								 var choiceType = val.label,choiceText = '';
								 if(choiceType == '.png' || choiceType == '.jpg' || choiceType == 'jpeg' || choiceType == '.PNG' || choiceType == '.JPG' || choiceType == 'JPEG')
									choiceText = "<img src='"+val.option+"' />";
								 else if(choiceType == '.mp4')
									choiceText = "<img src ='../images/android_portrait.png' data-url='"+val.option+"' />";
								 else
									choiceText = val.label;

								 if(multichoice == "multichoice"){
									 if(val.isSelected){
										 jQuery.each(data.quizlist[self.currentQuiz].questions[self.index-1].answers,function(index,value){
											 if(val.id == value){
												 if(singleType == 1)
													 quizquestions += "<div class='chooseanr radio'><input id='check"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"' checked='true'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
												 else
													 quizquestions += "<div class='chooseanr checkbox'><input id='check"+self.layoutindex+i+"' class='selectoption' type='checkbox' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"' checked='true'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";	 
													 
												 return false;
											 }else{
												 if(singleType == 1)
													quizquestions += "<div class='chooseanr radio'><input id='check"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"' checked='true'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
												 else
													 quizquestions += "<div class='chooseanr checkbox'><input id='check"+self.layoutindex+i+"' class='selectoption' type='checkbox' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"' checked='true'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>"; 
													 
												 return false;
											 }
										 });
									 }else{
										 if(singleType == 1)
											 quizquestions += "<div class='chooseanr radio'><input id='check"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
										 else
											 quizquestions += "<div class='chooseanr checkbox'><input id='check"+self.layoutindex+i+"' class='selectoption' type='checkbox' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
									 }

								 }else if (multichoice == 'truefalse'){
									 if(data.quizlist[self.currentQuiz].questions[self.index-1].userAnswer == val.id)
										 quizquestions += "<div class='chooseanr radio'> <input id='check"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"' checked='true'><label for='check"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
									 else
										 if(!data.quizlist[self.currentQuiz].questions[self.index-1].isImage){
											 quizquestions += "<div class='chooseanr radio'> <input id='radio"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'><label for='radio"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
										 }else{
											 quizquestions += "<div class='chooseanr radio'> <input id='radio"+self.layoutindex+i+"' class='radiooption' type='radio' name='option"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'><label for='radio"+self.layoutindex+i+"'>"+choiceText+"</label></div>";
										 }
								 }else if(multichoice == "match"){
									 if(val.subquestion)
										quizquestions += "<div class='chooseanr selectbox'><span class='labelname'>"+val.subquestion+"</span><div class='dropmenusct'><select class='select' id='select"+questionId+i+"'  data-index ="+i+"  data-question="+questionId+" name='select"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'>"+option+"</select></div></div>";
									 else
									 		val.invalid = true;
								 }

							});

							 jQuery(quizquestions).appendTo(jQuery("#displayContent"));
	                      if(multichoice == "match"){
								 jQuery('.select').not('.done').each(function(index,value){
						                var selectBoxId = $(this).attr('id');
										var actualIndex = $(this).data('index');
						                	if(data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex]){
							                	if(data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].value){
							                		jQuery("#"+selectBoxId+" option")[data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].value].setAttribute('selected',true);
							                		jQuery("#"+selectBoxId).addClass('done');
							                	}else{
							                		jQuery("#"+selectBoxId).addClass('done');
							                	}
													 
							                }

									});
								}

								/* To enable iphone checkbox and radio button color changes */
								jQuery( ".selectoption" ).toggle(function() {
								 	$(this).parent().addClass('active');
								 	$(this).attr('checked',true);
								}, function() {
									 $(this).parent().removeClass('active');
									 $(this).attr('checked',false);
								});
							  
								jQuery( ".radiooption" ).click(function() {
									  var name = $(this).attr('name');
									  jQuery("input[name="+name+"]").each(function(){
										   $(this).parent().removeClass('active');
									  });
									  $(this).parent().addClass('active');
								});								
					}
				}else{
					return false;
				}

				});
				quizquestions = "<div class='btnwrap'><div type='button' class='nextquiz btncommon' data-msg='next'></div></div>";
				jQuery(quizquestions).appendTo(jQuery("#displayContent"));

			}
			else if(self.summary){
				if(data.quizlist[self.currentQuiz].questions.length){
					var quizsummary = "<table class='quizdtlgrid'><tr><th>Question</th><th>Status</th></tr>"
					 jQuery.each(data.quizlist[self.currentQuiz].questions, function(i,val){
                         
						 if(!val.userAnswer || !val.userAnswer.length){
							 quizsummary += "<tr><td>"+(i+1)+"</td><td> <span data-msg='notyetanswered'></span> </td></tr>";
						 }else{
							 quizsummary += "<tr><td>"+(i+1)+"</td><td> <span data-msg='answersaved'></span> </td></tr>";

						 }

					 });
					quizsummary += "</table><div> <div data-msg='returnattempt' class='return-attempt btncommon'></div> </div>" +
					 		"<div><div data-msg='submitallandfinish' class='submit-attempt btncommon'></div> </div>";
					jQuery(quizsummary).appendTo(jQuery("#displayContent"));
				}

			}
			else if(self.review){


				var layout = data.quizinfo[0].layouts.split(',');

				jQuery.each(layout,function(index,value){

					if(layout[self.layoutindex] != 0 && layout[self.layoutindex] != undefined){

		                if(index !=0){
		                	self.index++;
		                }

		                self.layoutindex ++;

				//if(data.quizlist[self.currentQuiz].questions.length){
		                	
		                var quizquestions = '',totalGrade = self.totalGrade(data.quizlist[self.currentQuiz].questions), userGrade = self.userGrade(data.quizlist[self.currentQuiz].questions);
						var userAnswer = data.quizlist[self.currentQuiz].questions[self.index-1].userAnswer;
						var answer = data.quizlist[self.currentQuiz].questions[self.index-1].answers;
						var mark = Math.round(data.quizlist[self.currentQuiz].questions[self.index-1].mark);
						var choices = data.quizlist[self.currentQuiz].questions[self.index-1].choices;
						var userMark = data.quizlist[self.currentQuiz].questions[self.index-1].userMark;
						var type = data.quizlist[self.currentQuiz].questions[self.index-1].type;

					    var totalMark = 0,userGrade;
		                jQuery.each(data.quizlist[self.currentQuiz].questions,function(i,val){
							if(val.userMark != null && val.userMark != undefined)
								totalMark = parseInt(totalMark) + parseInt(val.userMark);
		                });
						
						 var QuizGrade = data.quizinfo[0].grade;
						 QuizGrade = Math.round(QuizGrade);
                         var Quizsumgrades = data.quizinfo[0].sumgrades;
						 Quizsumgrades = Math.round(Quizsumgrades);
						 
						 var marksValue = (totalMark/Quizsumgrades*100);
						
						 var finalGradeDisplay = (marksValue*QuizGrade/100);
                         finalGradeDisplay = Math.round(finalGradeDisplay);
						 
		                userGrade = ((totalMark/totalGrade)*100);
	                    userGrade = Math.round(userGrade);
	                if(self.index == 1){
						if(data.quizlist[self.currentQuiz].attempts[0].startedOn)
							var startedOn = data.quizlist[self.currentQuiz].attempts[0].startedOn;
						else
							var startedOn = '-';	
						
						if(data.quizlist[self.currentQuiz].attempts[0].completedOn)
							var completedOn = data.quizlist[self.currentQuiz].attempts[0].completedOn;
						else
							var completedOn = '-';	
						
						// Feedback implementation 
						var nofeedback = false,feedback = '';
						if(self.quizdata.quizinfo[0].feedback.length != 1){
                            jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
                                        if(feedbackValue.feedbacktext){
                                        if((data.quizlist[self.currentQuiz].attempts[0].sumgrades >= feedbackValue.mingrade) && (data.quizlist[self.currentQuiz].attempts[0].sumgrades <  feedbackValue.maxgrade))
                                            feedback = feedbackValue.feedbacktext;
                                        }else{
                                            feedback = '';
                                        }
                                        
                                        });
						}else{
							if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
								if((data.quizlist[self.currentQuiz].attempts[0].sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (data.quizlist[self.currentQuiz].attempts[0].sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
									feedback = self.quizdata.quizinfo[0].feedback[0].feedbacktext;
								else
									feedback = '';
								}
							else{
							  var nofeedback = true;
							  feedback = '';
							}
						}
						quizquestions = "<table class='quizdtlgrid'><tr><td><span data-msg='startedon'></span></td><td>"+startedOn+"</td></tr>" +
                        "<tr><td>State</td><td><span data-msg='statefinished'></span></td></tr>" +
                        "<tr><td><span data-msg='completedon'></span></td><td>"+completedOn+"</td></tr>" +
                        "<tr><td><span data-msg='attemptduration'></span></td><td></td></tr>";
                        if(Quizsumgrades != QuizGrade){
							quizquestions += "<tr><td><span data-msg='marks'></span></td><td>&nbsp;"+Math.round(totalMark)+" / "+Quizsumgrades+"</td></tr>";
                        }
                        if(QuizGrade == 100){
							quizquestions += "<tr><td><span data-msg='grade'></span></td><td>&nbsp;"+Math.round(marksValue)+"&nbsp;<span data-msg='outofpercent'>&nbsp;"+QuizGrade+" </td></tr>";
                        }
                        if(Quizsumgrades == QuizGrade){
							quizquestions += "<tr><td><span data-msg='grade'></span></td><td>&nbsp;"+finalGradeDisplay+"&nbsp;<span data-msg='outofpercent'>&nbsp;"+QuizGrade+" ("+Math.round(marksValue)+"%) </td></tr>";
                        }
						 if(nofeedback)
								quizquestions += "</table>";
                         else
								quizquestions += "<tr><td>feedback</td><td>"+feedback+"</td></tr></table>";
					}   
		             
					 if(type == "match"){
							 var option = "<option value='0' data-value='0' selected='selected'>Choose..</option>";
							jQuery.each(data.quizlist[self.currentQuiz].questions[self.index-1].choices, function(indexoflabel,value){
								option += "<option value="+(indexoflabel+1)+" data-value="+value.id+" >"+value.label+"</option>";
							});
					}
					
					if(type == "multichoice"){
						 quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> "+self.mutilchoicemark(data.quizlist[self.currentQuiz].questions[self.index-1])+" <span data-msg='xoutofmax'></span> "+mark+"</span></div>";
						 localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
					}else if(type == "truefalse"){
						if(answer[0] == userAnswer){
							quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> "+mark+" <span data-msg='xoutofmax'></span> "+mark+"</span></div>";
					   }
					   else if(answer[0] != userAnswer){
						   if(userAnswer)
							   quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> 0 <span data-msg='xoutofmax'></span> "+mark+"</span></div>";
						   else
							   quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'>"+mark+"</span></div>";
						   }
					   else if(answer[0])
							quizquestions += "<div class='qustn-head'><span><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'>"+mark+"</span></div>";

					}else if(type == "match"){
						if(mark == 0){
							quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> 0 <span data-msg='outof'></span> "+mark+"</span></div>";
						}
						 quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> "+Math.round(userMark)+" <span data-msg='outof'></span> "+mark+"</span></div>";
					}

					// Video type question
					//if(isText){
					var singleType = data.quizlist[self.currentQuiz].questions[self.index-1].istruefalse;
					var question  = data.quizlist[self.currentQuiz].questions[self.index-1].question;
					var questionType = question.substring(question.length-4).toLowerCase();
					
					if(questionType == '.png' || questionType == '.jpg' || questionType == 'jpeg' || questionType == '.PNG' || questionType == '.JPG' || questionType == 'JPEG'){
							quizquestions += "<div class='qustn-label'><img src ="+data.quizlist[self.currentQuiz].questions[self.index-1].question+" /></div>";
						}else if(questionType == '.mp4'){	
							if(isAndroid()){
								quizquestions += '<div class="AndroidQuizVideo" data-url="'+data.quizlist[self.currentQuiz].questions[self.index-1].question+'"><img src="../images/android_landscape.png"></div>';
							}else{
								quizquestions += '<div style="clear:both;"><video width="400" controls><source src="'+data.quizlist[self.currentQuiz].questions[self.index-1].question+'" type="video/mp4">Your browser does not support HTML5 video.</video></div>';
							}
						}
						else if((questionType == '.wmv') || (questionType == '.avi')){
							quizquestions += "Your browser does not support HTML5 video";
						}else{
							quizquestions += "<div class='qustn-label'>"+data.quizlist[self.currentQuiz].questions[self.index-1].question+"</div>";
						}
						
						if(type == "multichoice" && singleType == 0){
							quizquestions += "<div style='clear:both;'><span class='selectlbl' data-msg='selectmulti'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
						}else if(type == "multichoice" && singleType == 1){
							quizquestions += "<div style='clear:both;'><span class='selectlbl' data-msg='selectone'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
						}else{
							quizquestions += "<div style='clear:both;'><span class='selectlbl' data-msg='selectone'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
						}
						
						var secParent=true,answerText='';
						 jQuery.each(choices, function(i,val){

							 var choiceType = val.label,choiceText = '';
							 if(choiceType == '.png' || choiceType == '.jpg' || choiceType == 'jpeg' || choiceType == '.PNG' || choiceType == '.JPG' || choiceType == 'JPEG')
								choiceText = "<img src='"+val.option+"' />";
							 else if(choiceType == '.mp4')
								choiceText = "<img src ='../images/android_portrait.png' data-url='"+val.option+"' />";
							 else
								choiceText = val.label;

							 if(data.quizlist[self.currentQuiz].questions[self.index-1].type == "multichoice" ){
								 if(val.isSelected){
									 
										if(val.isright){
											 if(singleType == 1)
													 quizquestions += "<div class='chooseanr radio correct' style='background:green'><input id='check"+self.layoutindex+i+"'  data-id='"+val.id+"' value='"+val.id+"' type='radio' name='option'  checked='true'><label for='check"+self.index+i+"'>"+choiceText+"</label></div>";
												 else
													 quizquestions += "<div class='chooseanr checkbox correct' style='background:green'><input id='check"+self.layoutindex+i+"'  data-id='"+val.id+"' value='"+val.id+"' type='checkbox' name='option'  checked='true'><label for='check"+self.index+i+"'>"+choiceText+"</label></div>";
										}else{
											 if(singleType == 1)
												 quizquestions += "<div class='chooseanr radio wrong' style='background:red;'><input id='check"+self.layoutindex+i+"'  data-id='"+val.id+"' value='"+val.id+"' type='radio' name='option' checked='true'><label for='check"+self.index+i+"'>"+choiceText+"</label></div>";
											 else
												 quizquestions += "<div class='chooseanr checkbox wrong' style='background:red;'><input id='check"+self.layoutindex+i+"'  data-id='"+val.id+"' value='"+val.id+"' type='checkbox' name='option' checked='true'><label for='check"+self.index+i+"'>"+choiceText+"</label></div>";
										 }	
											 
												 			 
										 }else{
											 if(singleType)
												 quizquestions += "<div class='chooseanr radio'><input id='check"+self.layoutindex+i+"' type='radio' name='option' data-id='"+val.id+"' value='"+val.id+"' ><label for='check"+i+"' >"+choiceText+"</label></div>";
											 else
												 quizquestions += "<div class='chooseanr checkbox'><input id='check"+self.layoutindex+i+"' type='checkbox' name='option' data-id='"+val.id+"' value='"+val.id+"' ><label for='check"+i+"' >"+choiceText+"</label></div>"; 
										 }
								 
								jQuery.each(answer, function(answerIndex,answerValue){
									 if(answerValue == val.id){
										 answerText += choiceText+',';
									 } 
								 });
						 }else if(type == "truefalse"){
								 if(answer == val.id){
									 answerText = choiceText;
								 }
								 if(userAnswer == val.id){
									 if(answer[0] == userAnswer)
										 quizquestions += "<div class='chooseanr radio correct' style='background:green'><input type='radio' name='option'  data-id='"+val.id+"' value='"+val.id+"' checked='true'><label>"+choiceText+"</label></div>";
									 else
										 quizquestions += "<div class='chooseanr radio wrong' style='background:red;'><input type='radio' name='option'  data-id='"+val.id+"' value='"+val.id+"' checked='true'><label>"+choiceText+"</label></div>";
								 }
								 else
									 quizquestions += "<div class='chooseanr radio'><input type='radio' name='option' data-id='"+val.id+"' value='"+val.id+"'><label>"+choiceText+"</label></div>";
							 }else if(type == "match"){
								 if(val.subquestion)
									quizquestions += "<div class='chooseanr selectbox'><span  class='labelname'>"+val.subquestion+"</span><div class='dropmenusct'><select class='select' data-index ="+i+"  id='select"+(self.layoutindex+i+val.id)+"' data-question="+val.id+" name='select"+val.id+"' data-id='"+val.id+"' value='"+val.id+"'>"+option+"</select></div></div>";	
								
								 if(val.valueText){
										 answerText += val.label+',';
									 }
							 }

						 });
						 if(data.quizlist[self.currentQuiz].questions[self.index-1].type == "multichoice")
							answerText = answerText.substring(0,answerText.length-1);
						
						if(answer)
						 quizquestions += "</div><div class='paracont'><span data-msg='correctansweris'></span>: "+answerText+"</div>";



                       // jQuery(".quiz-table").append('<tr data-region="'+val.region+'" title="'+val.region+'" value="'+val.region+'">'+self.toTitleCase(val.region.toLowerCase())+'</option>');
					jQuery(quizquestions).appendTo(jQuery("#displayContent"));
					
						if(type == "match"){
						 jQuery('.select').not('.done').each(function(index,value){
				                var selectBoxId = $(this).attr('id');
								var actualIndex = $(this).data('index');
				                if(data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].value){
				                	 jQuery("#"+selectBoxId+" option")[data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].value].setAttribute('selected',true);
				                	 jQuery("#"+selectBoxId).addClass('done');
				                }else{
				                	jQuery("#"+selectBoxId).addClass('done');
				                }
									
				                
				                if(data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].isright == true){
				                	jQuery("#"+selectBoxId).parent().addClass('correct').css('background','green');
				                }else  if(data.quizlist[self.currentQuiz].questions[self.index-1].choices[actualIndex].isright == false){
				                	jQuery("#"+selectBoxId).parent().addClass('wrong').css('background','red');
				                }
				                
				                
							});
						}
						
						
					var optionoverlay = jQuery(".overlayheight"+(self.index-1)+"").parent().height()
					jQuery(".overlayheight"+(self.index-1)+"").height(optionoverlay);
				// vimal
					}
					else{
						return false;
					}
				});
				if((data.quizlist[self.currentQuiz].questions.length) == self.index)
					quizquestions = "<div><div class='finish-review btncommon' data-msg='finishreview' ></div></div>";
				else
					quizquestions = "<div><div class='nextquiz btncommon review' data-msg='next'></div></div>";
				jQuery(quizquestions).appendTo(jQuery("#displayContent"));
			}
			else{
		     /* First Page */
				var FirstPageElements = "<div class='headlabel'> <h2>"+self.quizdata.quizinfo[0].name+"</h2></div>",attemptNew = '';statusTable ='',isHeader = true,next = true,inprogress = true,overallGrade = 0;
				//jQuery(FirstPageElements).appendTo(jQuery("#displayContent"));
				var firstPageFlag = true, finalGradeArray = [];
			    jQuery.each(self.quizdata.quizlist, function(index,val){
			    	if(firstPageFlag){
						//finalGradeArray.push(val.userMark);
					  switch (self.quizdata.quizlist[index].attempts[0].state) {
                            case "completed":
                            FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'f',index,isHeader);
                            overallGrade = overallGrade + self.overallGrade(self.quizdata.quizlist[index].questions);
							self.quizdata.quizlist[index].attempts[0].sumgrades = Math.round(self.quizdata.quizlist[index].attempts[0].sumgrades);
                             finalGradeArray.push(self.quizdata.quizlist[index].attempts[0].sumgrades);
							  localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
                            isHeader = false;
                            break;
							    case "finished":
							    	FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'f',index,isHeader);
							    	overallGrade = overallGrade + self.overallGrade(self.quizdata.quizlist[index].questions);
									self.quizdata.quizlist[index].attempts[0].sumgrades = Math.round(self.quizdata.quizlist[index].attempts[0].sumgrades);
							    	 finalGradeArray.push(self.quizdata.quizlist[index].attempts[0].sumgrades);
									  localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
							    	isHeader = false;
							        break;
							    case "inprogress":
							    	self.currentQuiz = index;
							    	FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'i',index,isHeader);
							    	isHeader = false;
							    	inprogress = false;
							    	firstPageFlag = false;
							        break;
							    case "":    	
							    	if(next){
							    		self.currentQuiz = index;
							    		attemptNew = self.FirstPage(self.quizdata.quizlist[index],'',index,next);
							    		next = false;
							    		firstPageFlag = false;
							    	}
							    	break;
							 }
			    	}
				 });
					// To display overall grade feedback 
				var overallfeedbackText = '';
	        	if(self.quizdata.quizinfo[0].feedback.length != 1){
	        		if(finalGradeArray.length){
	        			var highestGrade = Math.max.apply(Math,finalGradeArray);
	        			jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
	        				if(feedbackValue.feedbacktext){
	        					if((highestGrade >= feedbackValue.mingrade) && (highestGrade <  feedbackValue.maxgrade))
	        						overallfeedbackText = feedbackValue.feedbacktext;
	        				}else{
	        					overallfeedbackText = '';
	        				}
	        			});
	        		}
	        		
			    }else{
			    	if(finalGradeArray.length){
			    		var highestGrade = Math.max.apply(Math,finalGradeArray);
			    		if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
			    			if((highestGrade >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (highestGrade <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
			    					overallfeedbackText = self.quizdata.quizinfo[0].feedback[0].feedbacktext;
			    		}else{
			    			overallfeedbackText = '';
			    		}
			    	}
			    }
				
				// To display overall grade feedback 
				/*if(overallfeedbackText){
			    	FirstPageElements = "<div class='paracont'>Overall feedback</div>"+overallfeedbackText;
			    	jQuery(FirstPageElements).appendTo(jQuery(".quiz-container"));
			    }*/
				
			    jQuery(FirstPageElements).appendTo(jQuery("#displayContent"));
			    var data = jQuery(".already").html();
			    jQuery(".already").html(" ");
				// feedback implementation 
				var alreadyattemptedData ='';
	        	if(self.quizdata.alreadyattempted.length ){
					self.displayIndex = 1;
					jQuery.each(self.quizdata.alreadyattempted,function(indexofcopyObj,valueofcopyObj){
							if(!valueofcopyObj.isDisplay){
							
								var QuizGrade = self.quizdata.quizinfo[0].grade;
                                var Quizsumgrades = self.quizdata.quizinfo[0].sumgrades;
                                var userMark = valueofcopyObj.sumgrades;
                                
                                var marksValue = (userMark/Quizsumgrades*100);
                                
                                var finalGradeDisplay = (marksValue*QuizGrade/100);
                                finalGradeDisplay = Math.round(finalGradeDisplay);
                                
                                // grade and sum grade not equal
                                if(Quizsumgrades != QuizGrade){
                                var todisplayGrade = finalGradeDisplay
                                }
                                // grade and sum grade equal
                                if(Quizsumgrades == QuizGrade){
                                var todisplayGrade = userMark;
                                }
                                if(Math.round(QuizGrade) == 100){
                                var todisplayGrade = finalGradeDisplay;
                                }
                                todisplayGrade = Math.round(todisplayGrade);
								
							valueofcopyObj.sumgrades= Math.round(valueofcopyObj.sumgrades);
							finalGradeArray.push(valueofcopyObj.sumgrades);
								if(self.quizdata.quizinfo[0].feedback.length != 1){
								jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
									if(feedbackValue.feedbacktext){
										if((valueofcopyObj.sumgrades >= feedbackValue.mingrade) && (valueofcopyObj.sumgrades <  feedbackValue.maxgrade))
											alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+(feedbackValue.feedbacktext)+"</td></tr>";
									}else{
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";       
									}
									
								});
							}else{
								if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
									if((valueofcopyObj.sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (valueofcopyObj.sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+self.quizdata.quizinfo[0].feedback[0].feedbacktext+"</td></tr>";
									else
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td></td></tr>";
								}else{
									alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";
								}
							}
						}
	    			});
				}
				
			    if(next && inprogress){
			    	  FirstPageElements = "<div class='paracont'><span data-msg='yourfinalgradeis'></span> "+Math.max.apply(Math,finalGradeArray)+"</div><div class='paracont'> <span data-msg='nomoreattempts'></span></div>";
			    	 jQuery(FirstPageElements).appendTo(jQuery("#displayContent"));
			    }
				
			    if(inprogress){
			    	jQuery(attemptNew).appendTo(jQuery("#displayContent"));
			    }
			    else{
			    	FirstPageElements = "<div class='reattempt-quiz btncommon' data-index ='"+(self.currentQuiz)+"' data-msg='reattemptquiz'></div></div>";
			    	jQuery(FirstPageElements).appendTo(jQuery("#displayContent"));
			    }
			                                            
	        	alreadyattemptedData += '</tbody>';
	        	jQuery(alreadyattemptedData).appendTo('.already');                                         
	        	jQuery(data).appendTo('.already');
	        	console.log("data",data);
	        	

			}
			if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
				var user = JSON.parse(window.localStorage.getItem("USER"));
			} else {
				var user = JSON.parse($.jStorage.get("USER"));
			}
				
			    var language = user.lang;
	            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
	            initLanguages();
	            loadLanguages(activeLang);
				
             //jQuery("#displayContent").niceScroll();
		},
        checkIfFileExists: function(self, courseItemData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false, fileName;
                fileName = courseItemData.fileNameUpload;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        var i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) { /*check if already exist.*/
                                    courseItemData.fileURL = entries[i].toURL();
                                    self.loadFileinWeb(self, courseItemData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
                                self.downloadFile(self, courseItemData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, courseItemData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, courseItemData);
                });
            } else {
                self.loadFileinWeb(self, courseItemData);
            }
        },
        downloadFile: function(self, courseItemData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
                var fileName = courseItemData.fileNameUpload, downloadFileURL = '';
                downloadFileURL = courseItemData.fileURL;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*create folder into local drive*/
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        var filePath = fileEntry.toURL() + "/" + fileName;
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        // Please wait.Your file will load in a few seconds.
                        fileTransfer.onprogress = function(progressEvent) {
						   jQuery("#load_wrapper, .overlaycontainer").show();
						};
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            courseItemData.fileURL = fileDir.toURL();
                            self.loadFileinWeb(self, courseItemData); /*load downloaded file into iframe/ video*/
                        }, function(error) {
                            //console.log("**********download error source " + error.source);
                            //console.log("********download error target " + error.target);
                            //console.log("*********upload error code: " + error.code);
                        });
                    }, self.fileError);
                }, self.fileError);
            } else {
                jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                });
            }
        },
        fileError: function(evt) {
            //console.log("Error occured in download : ******** " + JSON.stringify(evt));
        },
        disableTiles: function(){
            if(!jQuery('#showlist #readingmaterial').children().length != 0) {
                jQuery(".readingmaterial#rdMtrlRsrc").addClass('dsbl');
            } else {
                jQuery(".readingmaterial#rdMtrlRsrc").removeClass('dsbl');
            }
            if(!jQuery('#showlist #videolist').children().length != 0) {
                jQuery(".videoicon#vidRsrc").addClass('dsbl');
            } else {
                jQuery(".videoicon#vidRsrc").removeClass('dsbl');
            }
            if(!jQuery('#showlist #quizlist').children().length != 0) {
                jQuery(".quizicon#quizRsrc").addClass('dsbl');
            } else {
                jQuery(".quizicon#quizRsrc").removeClass('dsbl');
            }
            if(!jQuery('#showlist #audiolist').children().length != 0) {
                jQuery(".audioicon#audRsrc").addClass('dsbl');
            } else {
                jQuery(".audioicon#audRsrc").removeClass('dsbl');
            }
        },
        resourceContents:function(crsId){
            var self = this, serviceUrl = self.globalConfig.apiAddress.restservice,resrccategoryid;
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                resrccategoryid = window.localStorage.getItem("catrsrcId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
				resrccategoryid = $.jStorage.get("catrsrcId");
            }
            var data = {
                wsfunction: "core_course_get_contents",
                moodlewsrestformat: "json",
                courseid: crsId,
                wstoken: userDetails.token
            };
            if( isDevice() && self.globalConfig.application.offLine ){
                data.userid=userDetails.id;
                data.categoryid = resrccategoryid;
                
                cordova.exec(
                             function(result) {
                                 self.UserDetails.push(JSON.parse(result));
                                 self.resourceSuccess(JSON.parse(result));
                             },
                             function(result) {},'LoginPlugin', 'core_course_get_contents', [data]);
            }else{
                $.ajaxq("reqqueue",{
                    url: serviceUrl,
                    data: data,
                    cache:false,
                    async:false,
                    type:'POST',
                    dataType:'json',
                    crossDomain: true,
                    success: function(res) {
                        /* Updating Offline Storage Data */
                        self.offlineStorage.insertResource(crsId, JSON.stringify(res), 'RESOURCE');
                        self.resourceSuccess(res);
                    }
                });
           }
        },
        resourceSuccess: function (res){
            var self = this, kellyItems, modules, kellyli, resFileName, resFileType,deviceContents;
            for(var j =1; j < res.length;j++){
                if(res[j].modules.length > 0){
                    modules = res[j].modules;
                    for(var k = 0; k < modules.length; k++){
                        kellyItems = jQuery.trim(modules[k].name.substr(0,3));
                        resFileName = modules[k].name;
                        if( modules[k].modname != "quiz" && modules[k].modname != "scorm" ){ /*Removed modules[k].modplural due to error in safari.*/
                            if(modules[k].contents){
                                if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                                  deviceContents = modules[k].contents;
                                  modules[k].contents=[];
                                  modules[k].contents.push(deviceContents);
                                }
                                
                                if(modules[k].contents.length){
                                        if(modules[k].contents.length > 0){
                                            var content = modules[k].contents;
                                            
                                            for(var p =0; p < content.length; p++){
                                                var fileName = content[p].filename;
                                                var fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                                                resFileType = resFileName+'.'+fileType;
                                                if(kellyItems != "CC:" || kellyItems == "CC:"){
                                                    switch(fileType){
                                                        case "pdf":
                                                            var pdfli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_pdficon">'+resFileName+'</span></a></li>';
                                                            jQuery('#readingmaterial').append(pdfli);
                                                            break;
                                                        case "doc":
                                                            var docli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_lessnicon">'+resFileName+'</span></a></li>';
                                                            jQuery('#readingmaterial').append(docli);
                                                            break;
                                                        case "jpg":
                                                            var jpgli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_lessnicon">'+resFileName+'</span></a></li>';
                                                            jQuery('#readingmaterial').append(jpgli);
                                                            break;
                                                        case "png":
                                                            var pngli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_lessnicon">'+resFileName+'</span></a></li>';
                                                            jQuery('#readingmaterial').append(pngli);
                                                            break;
                                                        case "gif":
                                                            var gifli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_lessnicon">'+resFileName+'</span></a></li>';
                                                            jQuery('#readingmaterial').append(gifli);
                                                            break;
                                                        case "mp4":
                                                            var videoli = '<li data-file="video" class="videosli resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" data-courseID='+modules[k].courseid+' timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_moisticon">'+resFileName+'</span></a></li>';
                                                            jQuery('#videolist').append(videoli);
                                                            break;
                                                        case "mp3":
                                                            var audioli = '<li data-file="audio" class="audiosli resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_audicon">'+resFileName+'</span></a></li>';
                                                            jQuery('#videolist').append(audioli);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }
                                                else{
                                                    switch(fileType){
                                                        case "pdf":
                                                            kellyli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_pdficon">'+resFileName.substr(3)+'</span></a></li>';
                                                            jQuery('#videolist').append(kellyli);
                                                            break;
                                                        case "doc":
                                                            kellyli = '<li data-file="material" class="material resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_lessnicon">'+resFileName.substr(3)+'</span></a></li>';
                                                            jQuery('#videolist').append(kellyli);
                                                            break;
                                                        case "mp4":
                                                            kellyli = '<li data-file="video" class="videosli resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" data-courseID='+modules[k].courseid+' timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_moisticon">'+resFileName.substr(3)+'</span></a></li>';
                                                            jQuery('#videolist').append(kellyli);
                                                            break;
                                                        case "mp3":
                                                            kellyli = '<li data-file="audio" class="audiosli resourcelist" pageno="'+content[p].pageno+'" type="'+resFileType+'" data-filename="'+fileName+'" url="'+content[p].fileurl+'" id="'+modules[k].id+'" timemodified='+content[p].timemodified+'><a href="javascript:void(0);"><span class="res_audicon">'+resFileName.substr(3)+'</span></a></li>';
                                                            jQuery('#videolist').append(kellyli);
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                }
                            }
                        }else{
                            kellyItems = jQuery.trim(modules[k].name.substr(0,3));
                            // console.log("mod Name="+modules[k].modname);
                            if( modules[k].modname == "scorm" ){
                                if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                                    var _fileName = modules[k].modname,
                                    _fileUrl=modules[k].url,
                                    quiz_CourseId = modules[k].courseid;
                                    
									if( isAndroid() && _fileName == "scorm" ){
									  _fileUrl = ""+modules[k].manifest_path+"imsmanifest.xml";
									}else if( _fileName == "scorm" ){
									  _fileUrl = ""+modules[k].manifest_path+"/imsmanifest.xml";
									}
									var videoli = '<li data-file="'+_fileName+'" class="videosli resourcelist" type="'+modules[k].name+'" url="'+_fileUrl+'" data-modid="'+modules[k].id+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="res_quiz_icon">'+_fileName+'</span></a></li>';
                                } else {
									var videoli = '<li data-file="video" class="videosli resourcelist" type="'+modules[k].name+'" url="'+_fileUrl+'" data-modid="'+modules[k].id+'"><a href="javascript:void(0);"><span class="res_quiz_icon">'+modules[k].name+'</span></a></li>';
								}
                                
                                jQuery('#videolist').append(videoli);
                                                                    
                            }else if(kellyItems != "CC:"){
                                                                    
                               if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine ){
                                var _fileName = modules[k].modname,
                                    _fileUrl=modules[k].url,
                                    quiz_CourseId = modules[k].courseid;
                                                 
                                var quizli = '<li data-file="'+_fileName+'" class="resourcelist quizli" type="'+modules[k].name+'" url="'+_fileUrl+'" id="'+modules[k].id+'" data-modid="'+modules[k].id+'" data-quiz_CourseId="'+quiz_CourseId+'" timemodified=><a href="javascript:void(0);"><span class="res_quiz_icon">'+modules[k].name+'</span></a></li>';
                                jQuery('#quizlist').append(quizli);
                                                                    
                               }else{
                                var quizli = '<li data-file="quiz" class="resourcelist quizli" type="'+modules[k].name+'" url="'+modules[k].url+'" id="'+modules[k].id+'" timemodified=><a href="javascript:void(0);"><span class="res_quiz_icon">'+modules[k].name+'</span></a></li>';
                                jQuery('#quizlist').append(quizli);
                               }
                            }else{
                                                                    
                               if( isDevice() && isPhoneGap() && self.globalConfig.application.offLine){
                                    var _fileName = modules[k].modname,
                                    _fileUrl=modules[k].url,
                                    quiz_CourseId = modules[k].courseid;
                                                                    
                                kellyli = '<li data-file="'+_fileName+'" class="resourcelist quizli" type="'+modules[k].name+'" url="'+_fileUrl+'" id="'+modules[k].id+'" timemodified= data-modid="'+modules[k].id+'" data-quiz_CourseId="'+quiz_CourseId+'" ><a href="javascript:void(0);"><span class="res_quiz_icon">'+modules[k].name.substr(3)+'</span></a></li>';
                                jQuery('#videolist').append(kellyli);
                                                                    
                               }else{
                                kellyli = '<li data-file="quiz" class="resourcelist quizli" type="'+modules[k].name+'" url="'+modules[k].url+'" id="'+modules[k].id+'" timemodified=><a href="javascript:void(0);"><span class="res_quiz_icon">'+modules[k].name.substr(3)+'</span></a></li>';
                                jQuery('#videolist').append(kellyli);
                               }
                            }
                        }
                    }
                }
            }
            this.disableTiles();
        },
        loadFileinWeb: function(self, courseItemData) {
        	var self=this;
            var fileType = courseItemData.fileType;
            var filePath = courseItemData.fileURL;
            var userID, androidData={};

            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                userID = JSON.parse(window.localStorage.getItem("USER")).id;
                androidData.pdfToken = JSON.parse(window.localStorage.getItem("USER")).token;
            } else {
                language = $.jStorage.get("language");
				userID = JSON.parse($.jStorage.get("USER")).id;
                androidData.pdfToken = JSON.parse($.jStorage.get("USER")).token;
            }
            androidData.modID = self.modID;
            androidData.userID = userID;
            androidData.timemodified = self.timemodified;
            androidData.pdfURL = self.pdfURL;
            androidData.language = ((language == null)?'en_us':language);
            androidData.serviceURl = self.globalConfig.apiAddress.service;
            androidData.isFavour = false;
            if(isDevice()  && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").hide();
                if( /Android/i.test(navigator.userAgent) ) {
                    jQuery("#showlist").show();
                    cordova.exec(
                                 function (args) {},
                                 function (args) {},
                                 ''+((self.globalConfig.application.offLine)?'FileOpener':'FileOpenerOnline')+'', '' +((courseItemData.fileType === 'pdf')?'openFile':'openVideoFile')+ '', [((courseItemData.fileType === 'pdf')?androidData:filePath)]);
                    return false;
                }
            }

            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && (courseItemData.fileType === 'pdf')  && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").show();
                jQuery("#showlist").show();
                var cordovaUserVar;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    cordovaUserVar = JSON.parse(window.localStorage.getItem("USER")).token;
                } else {
                    cordovaUserVar = JSON.parse($.jStorage.get("USER")).token;
                }
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'PDFViewerPlugin', 'openPdf', [self.modID, self.timemodified, self.pdfURL, cordovaUserVar, ((language == null)?'en_us':language), self.globalConfig.apiAddress.service, false]);
                jQuery("#load_wrapper, .overlaycontainer").hide();
                return false;
            }
            jQuery('#resrcbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread');
            var breadNameFour = courseItemData.fileName;
            CCbreadCrumb = jQuery.trim(breadNameFour.substr(0,3));
            jQuery('#resrcbred li:nth-child(4)').show();
            if(courseItemData.fileHeader == 'Document') {
                jQuery('#resrcbred li:nth-child(3)').addClass('reshdnk '+(CCbreadCrumb == "CC:" ? "CC" : courseItemData.fileHeader)).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "reference")+'></a>');
			}
            if(courseItemData.fileHeader == 'video') {
                jQuery('#resrcbred li:nth-child(3)').addClass('reshdnk '+(CCbreadCrumb == "CC:" ? "CC" : courseItemData.fileHeader)).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "video")+'></a>');
			}
            if(courseItemData.fileHeader == 'audio') {
                jQuery('#resrcbred li:nth-child(3)').addClass('reshdnk '+(CCbreadCrumb == "CC:" ? "CC" : "video")).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "video")+'></a>');
			}
            loadAllLanguages();
            breadNameFour = (jQuery.trim(breadNameFour.substr(0,3)) != 'CC:' ? breadNameFour:breadNameFour.substr(3));
            jQuery('#resrcbred li:nth-child(4)').html(breadNameFour);
            var iFrameHight ='100%';
            var pageno = parseInt(courseItemData.filepageCount);
            jQuery("#displayContent").empty().show();
            jQuery("#displayContent").css({
                position : 'relative'
            });
            jQuery(".iframewrap_crs_res").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
            if (fileType === 'mp4' || fileType === 'mp3') {
                if( isDevice() && isPhoneGap() ){
                    if( /Android/i.test(navigator.userAgent) && file_Type === 'mp4') {
                        jQuery('<div class="AndroidVideo reourceAndroidVideo"> <img src="../images/android_landscape.png" ></div>').appendTo(jQuery("#displayContent"));
                        jQuery('<div class="shelfholder_mb_lt" style="visibility:hidden;"></div>').appendTo(jQuery("#displayContent"));
                        self.AndroidVideoURl = favItemsData.fileURL;
                        self.footerIcons(true);
                        return false;
                    }
                }
                var videoType = (fileType === 'mp4') ? "video/mp4" : "audio/mpeg";
				if(!this.returnIeVersion()){
					//jQuery('<video width="100%" height="100%" controls autoplay></video>').append('<source src="' + courseItemData.fileURL + '" type="' + videoType + '" />').appendTo(jQuery("#displayContent"));
					jQuery("#displayContent").append('<video id="activityVideo" class="_activityVideo" width="100%" height="100%" controls><source src="' + courseItemData.fileURL + '" type="' + videoType + '" /></video>') //change ie9 + support
                    if( isDevice() && isPhoneGap() ){
                        if( parseInt(device.version) > 7 ){
                            jQuery("#displayContent").addClass("content-ipadView");
                            
                            jQuery(".content-ipadView").on('swipeleft', function(){  })
                            .on('swiperight', function(){ })
                            .on('swipeup', function(){ jQuery("body").scrollTop(0); })
                            .on('swipedown', function(){ jQuery("body").scrollTop(500); });
                        }
                    }
					// To control play or pause button in video tag.
					videoContrl = document.getElementById("activityVideo");
					if ( videoContrl.paused ) {
						videoContrl.play();
					} else {
						videoContrl.pause();
					}
                                                                    
					// To hide ios keyboard while clicking play, pause and fullscreen icon.
					function onVideoBeginsFullScreen () {
						document.querySelector('textarea#note').blur();
						$('textarea#note').blur();
					}
					videoContrl.ontouchstart = function () {
						onVideoBeginsFullScreen();
					};
					$('#activityVideo, #activityVideo div, #activityVideo button').click(function (event) {
						onVideoBeginsFullScreen(event);
					});

                    if((navigator.userAgent.indexOf("Safari") > -1)) {
                        jQuery('#activityVideo')[0].play();
						var videoContrlSafari = jQuery('#activityVideo')[0];
						videoContrlSafari.ontouchstart = function () {
							onVideoBeginsFullScreen();
						};
                    }
				}else{
					if (pluginlist.indexOf("Windows Media Player")!=-1){
							//jQuery('<embed src='+filePath+' id="activityVideo" width="500" height="500"/>').appendTo(jQuery("#content-webview"));
                            var videoElHtml = '<object width="60%" height="100%" type="video/x-ms-asf" url='+ courseItemData.fileURL +' data="clipcanvas_14348_offline.mp4"';
                                videoElHtml+= 'classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6"><param name="url" value='+ courseItemData.fileURL +'>';
                                videoElHtml+= '<param name="filename" value='+ courseItemData.fileURL +'><param name="autostart" value="1"><param name="uiMode" value="full">';
                                videoElHtml+= '<param name="autosize" value="1"><param name="playcount" value="1"> <embed type="application/x-mplayer2" src='+ courseItemData.fileURL +' width="100%" height="100%" autostart="true" showcontrols="true"  pluginspage="http://www.microsoft.com/Windows/MediaPlayer/"></embed>';
							   jQuery(videoElHtml).appendTo(jQuery("#displayContent"));
						}else{
							var messageString = "<p> Please update your windows media player or <a href="+courseItemData.fileURL+">Click here to Download</a>";
							jQuery(messageString).appendTo(jQuery("#displayContent"));
						}
				}
				// Add comment in Resource
				jQuery(".commentNotes").show();
				self.footerIcons(true);
                jQuery('#load_wrapper').hide();
                videoTapped(1,self.video_tapped);
            }else if(fileType === 'doc'){
                if (isDevice() && pageno !== 0) {
                    iFrameHight = pageno * 819 + 'px';
                }
                jQuery('<iframe/>', {
                    name: 'resrcContent-iframe',
                    id: 'resourceContent-iframe',
                    src: courseItemData.fileURL
                }).appendTo(jQuery("#displayContent"));

                self.footerIcons(true);
                jQuery("#resourceContent-iframe").load(function() {
                    jQuery('#load_wrapper').hide();
                    jQuery(this).show();
					
					/* Ipad pdf download open in new tab issue fix */
					if( !isDevice() && !isPhoneGap() ){
                             var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                             if( browserName[1] == "Safari"){
                               jQuery("#resourceContent-iframe").contents().find("#download").attr('data-safari','true');
                             }
                    }
					jQuery("#load_wrapper, .overlaycontainer").hide();
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#resourceContent-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#resourceContent-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
							   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								jQuery("#resourceContent-iframe").find("#finishattemptbutton").on("click",function(){
										  jQuery(".course_ifram_cls_btn").trigger("click");
								});
							   }else{
								   jQuery("#resourceContent-iframe").contents().find("#finishattemptbutton").on("click",function(){
											  jQuery(".course_ifram_cls_btn").trigger("click");
									});
							   }
								
							}
							
							 if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										var scormObject = jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
									}else{
										var scormObject = jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
									}
							if(scormObject != 0){
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
								jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
									jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
								else{
									jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
								}
							}
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#resourceContent-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }else{
							jQuery("#resourceContent-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }
						   if( Filetype == "scorm" ){						   
							setTimeout(function(){ 
							  jQuery("#resourceContent-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
								$(window).trigger('resize');
							},1000);
						}
                });
            }
            else {
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 window.localStorage.pdfurl = courseItemData.fileURL;
                } else {
                    $.jStorage.set("pdfurl", courseItemData.fileURL);
                }
				if(!this.returnIeVersion()){
					jQuery('<iframe/>', {
						name: 'resrcContent-iframe',
						id: 'resourceContent-iframe',
						src: "pdfview.html"
					}).appendTo(jQuery("#displayContent"));
				}else{
							PluginDetect.getVersion(".");   // find Adobe reader exist or not.
							 var version = PluginDetect.getVersion("AdobeReader");
							if(version != null){
								jQuery("#displayContent").append('<iframe id="courseContent-iframe" name="courseContent-iframe" width="800px" height="600px" src='+courseItemData.fileURL+'> </iframe>');
							}else{
								jQuery("#displayContent").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+courseItemData.fileURL+">download PDF</a>");
							}
				}
				if ( ie11 && win7 ) {
					if(fileType === 'pdf' ){
						jQuery("#displayContent").find('iframe').remove();
						PluginDetect.getVersion(".");   // find Adobe reader exist or not.
						var version = PluginDetect.getVersion("AdobeReader");
						
						if(version != null){
							jQuery("#displayContent").append('<iframe id="courseContent-iframe" name="courseContent-iframe" width="800px" height="600px" src='+courseItemData.fileURL+'> </iframe>');
						}else{
							jQuery("#displayContent").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+courseItemData.fileURL+">download PDF</a>");
						}
					}
				}
				// Add comment in Resource
				jQuery('#note').val('');
				jQuery(".commentform-control").val('');
				jQuery(".commentNotes").show();
				
				jQuery("#resourceContent-iframe").load(function() {
                    jQuery('#load_wrapper').hide();
					
					 var crossInterval=setInterval(function(){
							jQuery("#load_wrapper, .overlaycontainer").hide();
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#courseContent-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
								jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").on("click",function(){
										  jQuery(".course_ifram_cls_btn").trigger("click");
										  clearInterval(crossInterval);
								});
							}
						},2000);
						
                    jQuery(this).show();
					
					if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
						token = JSON.parse(window.localStorage.getItem("USER")).token;
					} else {
						token = JSON.parse($.jStorage.get("USER")).token;
					}
					
					var serviceUrl = self.globalConfig.apiAddress.service, data='', token;
					data = {
						//cid: self.courseID,
						coursemoduleid: self.modID,
						action:'get_course_pdf_bookmarks',
						//uid: self.userID,
						token: token
					}
					self.ajaxReq(serviceUrl,data,function(resp){
						if( resp != undefined ){
						  if( resp.response != undefined ){
							self.BookMarkedPages = resp.response.bookmarks;
							var currentPageNo = jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('value');
							  jQuery.each(self.BookMarkedPages, function(i, val){
								   if( currentPageNo == val.pageno ){
									 jQuery("#resourceContent-iframe").contents().find("#viewBookmarkLocale").removeClass('bookmark').addClass('bookmarked').attr('data-bookmarked','true');
								   }
							  });
						  }else{
						   self.BookMarkedPages=[];
						  }
						}else{
						   self.BookMarkedPages=[];
						}
					});
					jQuery("#resourceContent-iframe").contents().find("#presentationMode").off().on('click',function(){
						window.open("pdfview.html");
					});
					var previousPageID='', currentPageID='';
					/* Added for Bookmarks thambnail filters*/
					jQuery("#resourceContent-iframe").contents().find("#viewAttachments").prop("disabled", false);
					jQuery("#resourceContent-iframe").contents().find("#sidebarToggle").off().on('click',function(){
						jQuery("#resourceContent-iframe").contents().find("#viewAttachments,#viewOutline").prop("disabled", false);
						var pageCount=1;
						jQuery("#resourceContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
						jQuery("#resourceContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
						  jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
						});
						if( self.BookMarkedPages != undefined ){
						  jQuery.each(self.BookMarkedPages, function(i, val){
							  if( val.bookMarked== undefined ){
							   jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

							  }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
								jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

							  }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
								jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
							  }
						  });
						}
					});
					jQuery("#resourceContent-iframe").contents().find("#viewAttachments").off().on('click',function(){
						jQuery("#resourceContent-iframe").contents().find("#thumbnailView").removeClass("hidden");
						jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
							if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
								jQuery(this).hide();
								jQuery(this).find("#ribbon").hide();
							}
						});

					});
					jQuery("#resourceContent-iframe").contents().find("#viewOutline").off().on('click', function(){
						jQuery("#resourceContent-iframe").contents().find(".outlineItem").remove();
						jQuery("#resourceContent-iframe").contents().find(".thumbnail").each(function(index){
							jQuery("#resourceContent-iframe").contents().find("#outlineView").append('<div class="outlineItem"><a href="#page=' +(index+1)+ '">Slide Number ' +(index+1)+ '</a></div>');
						});
					});
					jQuery("#resourceContent-iframe").contents().find("#viewThumbnail").off().on('click',function(){
						jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
							if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
								jQuery(this).show();jQuery(this).find("#ribbon").hide();
							}
						});
					});
					/* End of Bookmarks thambnail filters*/
					
					jQuery("#resourceContent-iframe").contents().find("#viewBookmarkLocale").off().on('click',function(){
						
						var serviceUrl = self.globalConfig.apiAddress.service, data = '', currentPageID = jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('value'), serviceAction = '', token;
						if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
							token = JSON.parse(window.localStorage.getItem("USER")).token;
						} else {
							token = JSON.parse($.jStorage.get("USER")).token;
						}
						if( currentPageID != previousPageID ){
							serviceAction = 'insert_course_pdf_bookmark';
							pageID = currentPageID;
							previousPageID = currentPageID;
						}else if( currentPageID == previousPageID){
							serviceAction = 'delete_course_pdf_bookmark';
							pageID = previousPageID;
						}
						if( jQuery(this).attr('data-bookmarked') == "false" || jQuery(this).attr('data-bookmarked') == undefined){
							pageID = currentPageID;
							serviceAction = 'insert_course_pdf_bookmark';
							jQuery(this).removeClass('bookmark').addClass('bookmarked');
							jQuery(this).attr('data-bookmarked','true');
							jQuery("#resourceContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("notbookmarked").addClass("bookmarked").show();
							jQuery("#resourceContent-iframe").contents().find("#thumbnailContainer"+currentPageID+"").show();

							self.BookMarkedPages.push({
								"pageno":""+currentPageID+"",
								"bookMarked":"true"
							});
						} else if( jQuery(this).attr('data-bookmarked') == "true" ) {
							pageID = currentPageID;
							serviceAction = 'delete_course_pdf_bookmark';
							jQuery(this).addClass('bookmark').removeClass('bookmarked');
							jQuery(this).attr('data-bookmarked','false');
							jQuery("#resourceContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("bookmarked").addClass("notbookmarked").hide();
							if( self.BookMarkedPages != undefined ){
								jQuery.each(self.BookMarkedPages, function(i, val){
									if( val.pageno == currentPageID){
										val.bookMarked="false";
									}
								});
							}
						}
						data = {
							//cid: self.courseID,
							coursemoduleid: self.modID,
							action: serviceAction,
							//uid: self.userID,
							pageid: pageID,
							token: token
						};

						/* After bookmark and un bookmark reset the BookMarkedPages object */
						if( self.BookMarkedPages != undefined ){
							jQuery.each(self.BookMarkedPages, function(i, val){
								if( val.bookMarked== undefined ){
									jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
								
								} else if( val.bookMarked != undefined && val.bookMarked != "true" ){
									jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

								}else if( val.bookMarked != undefined && val.bookMarked == "true" ){
									jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
								}
							});
						}
						self.ajaxReq(serviceUrl,data,function(resp){ });
					});
					
					jQuery('#load_wrapper').show();
					var startPageCount=setInterval(function (){
						if( jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('max') != undefined ){
							if( jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('max')  == jQuery("#resourceContent-iframe").contents().find("#viewer .page").length ){
							  jQuery(".commentmodal-backdrop").hide();
							  jQuery('#load_wrapper').hide();
							  clearInterval(startPageCount);
							}
						}
					},5000);

					var thumbnailView=setInterval(function (){
						if( jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('max') == jQuery("#resourceContent-iframe").contents().find("#thumbnailView .thumbnailSelectionRing").length){
							var currentPageNo = jQuery("#resourceContent-iframe").contents().find("#pageNumber").attr('value');
							var pageCount=1;
							jQuery("#resourceContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
							jQuery("#resourceContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
							  jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
							});
							if( self.BookMarkedPages != undefined ){
							  jQuery.each(self.BookMarkedPages, function(i, val){
								  if( val.bookMarked== undefined ){
								   jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

								  }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
									jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

								  }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
									jQuery("#resourceContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
								  }
							  });
							}
						  clearInterval(thumbnailView);
						}
					},1000);
					
					/* Ipad pdf download open in new tab issue fix */
					if( !isDevice() && !isPhoneGap() ){
						var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
						if( browserName[1] == "Safari"){
							jQuery("#resourceContent-iframe").contents().find("#download").attr('data-safari','true');
						}
					}
					
						if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
												var scormObject = jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
											}else{
												var scormObject = jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
											}
								if(scormObject != 0){
										if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
										jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
										}
									else{
										jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
										jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
									}
								}
								
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#resourceContent-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }else{
							jQuery("#resourceContent-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }
						   	setTimeout(function(){ 
							  jQuery("#resourceContent-iframe").css('width','94%').css('margin-right','0px').css('margin-left','0px');
								$(window).trigger('resize');
								jQuery("#load_wrapper, .overlaycontainer").hide();
							},1000);
					    if( fileType == "scorm" ){	
											jQuery("#load_wrapper, .overlaycontainer").show();		
							setTimeout(function(){ 
								  jQuery("#resourceContent-iframe").css('width','98%').css('margin-right','0px').css('margin-left','0px');
									$(window).trigger('resize');
									jQuery("#load_wrapper, .overlaycontainer").hide();		
									
							},4000);
						}
							
                });
				
				  if(fileType === 'pdf'){
								/* artf1036050  changes start's here */
								jQuery("#displayContent").css("height","1363px");
								jQuery("#load_wrapper").css("display","block");
								var intval=setInterval(function(){
												if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
													var pageHeight = jQuery("#resourceContent-iframe").find(".textLayer").height();
												}else{
													var pageHeight = jQuery("#resourceContent-iframe").contents().find(".textLayer").height();
												}
												var orgHeight = (pageHeight)+52;
												if(pageHeight){
														jQuery("#displayContent").css("height",orgHeight+"px");
														jQuery("#resourceContent-iframe").contents().find("#viewerContainer").scrollTop(0);
														jQuery("#resourceContent-iframe").css('width','96%');
														clearInterval(intval);
														
												}


								},3000);
								/* artf1036050  changes end here */
				}
            }
        },
        loadquizinWeb: function(srcURL, quizTitle, Filetype) {
            var quizCCBreadcrumb = jQuery.trim(quizTitle.substr(0,3)), self = this;
            jQuery('#resrcbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread').addClass('reshdnk '+(quizCCBreadcrumb == "CC:" ? "CC" : "quiz")).html('<a href="javascript:void(0);" data-msg='+(quizCCBreadcrumb == "CC:" ? "CC" : "quiz")+'></a>');
            jQuery('#resrcbred li:nth-child(4)').show();
            var breadFourTitle = (quizCCBreadcrumb != 'CC:' ? quizTitle:quizTitle.substr(3));
            jQuery('#resrcbred li:nth-child(4)').html(breadFourTitle);
            loadAllLanguages();
            jQuery("#displayContent").empty().show();
            jQuery("#displayContent").css({
                position : 'relative'
            });
            jQuery(".iframewrap_crs_res").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                window.localStorage.pdfurl = srcURL;
            } else {
                $.jStorage.set("pdfurl", srcURL);
            }
            jQuery('<iframe/>', {
                name: 'resrcContent-iframe',
                id: 'resourceContent-iframe',
                src: srcURL
            }).appendTo(jQuery("#displayContent"));
            if( Filetype == "scorm" ){
             $('body').addClass("scormPage");
             $('.scormPage #container #displayContent').css('height',$(window).height());
            }
            if( Filetype == 'quiz'){
             $('body').addClass("quiz-main-container res-quiz-main-container");
            }
            if( Filetype == 'puzzle' ){
             $('body').addClass("quiz-main-container res-quiz-main-container crosswordwrap");
             var loaderDisplay=setInterval(function (){
                                          if( jQuery("#load_wrapper").css('display') == "block" ){
                                              jQuery("#load_wrapper, .overlaycontainer").hide();
                                              clearInterval(loaderDisplay);
                                          }
                                },1000);
            }
            if(isDevice() && !self.globalConfig.application.offLine){
             jQuery('html').addClass("onlineApp");
            }
            jQuery("#resourceContent-iframe").load(function() {
                jQuery("#load_wrapper, .overlaycontainer").show();
                jQuery(this).show();
					if(Filetype === 'quiz'){
						    // removed width condition 
							jQuery(this).attr('scrolling','no');
						   
						    jQuery("#load_wrapper, .overlaycontainer").show();
							if (isAndroid()) {
								jQuery("#resourceContent-iframe").contents().find("#page-mod-quiz-viewPAGE").css("margin-top", "40px");
							}
						     // QUIZ full screen for Browser
							 jQuery("#resourceContent-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
                                
								 if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									var height = jQuery("#resourceContent-iframe").find('body').height();
								}else{
									var height = jQuery("#resourceContent-iframe").contents().find('body').height();
								}
								if(height){
									jQuery("#resourceContent-iframe").css('height',(height+100));
								if($(window).height() < height)
									jQuery('.quiz-main-container #displayContent').css('height',height);
								else
									jQuery('.quiz-main-container #displayContent').css('height',$(window).height());
								}
								jQuery(window).scrollTop(0);
                            });
							$("#resourceContent-iframe").contents().find("#okbutton, #cancelbutton, #finishattemptbutton").on('click', function() {
								jQuery("body").removeClass("overlay-video-quiz");
							});
							 jQuery("#resourceContent-iframe").contents().find(".ui-link").off().on('click', function(){
								 $(window).trigger('resize');
								  jQuery("#load_wrapper, .overlaycontainer").show();
                             var quizreviewlength=setInterval(function(){
								
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									$(window).trigger('resize');
									var height1 = jQuery("#resourceContent-iframe").find('.quizreviewsummary').height();
									var height2 = jQuery("#resourceContent-iframe").find('.que').height();
									var height3  = jQuery("#resourceContent-iframe").find('.submitbtns').height();
									var height4 = jQuery("#resourceContent-iframe").find('.outcome').height();
									var height = parseInt(height1 + height2 + height3 + height4);
								}else{
									$(window).trigger('resize');
									var height1 = jQuery("#resourceContent-iframe").contents().find('.quizreviewsummary').height();
									var height2 = jQuery("#resourceContent-iframe").contents().find('.que').height();
								     var height4 = jQuery("#resourceContent-iframe").contents().find('.outcome').height();
									var height3  = jQuery("#resourceContent-iframe").contents().find('.submitbtns').height();
									var height = parseInt(height1 + height2 + height3 + height4);
								}
								if(height){
								
									jQuery("#resourceContent-iframe").css('height',(height+100));
									if($(window).height() < height){
										jQuery('.quiz-main-container #displayContent').css('height',height);
									}
									else{
										jQuery('.quiz-main-container #displayContent').css('height',$(window).height());
									}
									clearInterval(quizreviewlength);
									 jQuery("#load_wrapper, .overlaycontainer").hide();
									jQuery(window).scrollTop(0);
                                                              setTimeout(function(){
                                                                         if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
                                                                         $('#resourceContent-iframe')[0].contentWindow.location.reload(true);
                                                                         }
                                                                         }, 1000);
								}
								 },800); 
								
                            });
						  	if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var height = jQuery("#resourceContent-iframe").find('.mymobilecontent').height();
								jQuery("#resourceContent-iframe").find('html').css('background','#fff');	
							}else{
								var height = jQuery("#resourceContent-iframe").contents().find('.mymobilecontent').height();
								jQuery("#resourceContent-iframe").contents().find('html').css('background','#fff');	
							}
							
							var quizlength=setInterval(function(){
								 jQuery("#load_wrapper, .overlaycontainer").show();
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									var height = jQuery("#resourceContent-iframe").find('.mymobilecontent').height();
									jQuery("#resourceContent-iframe").find('html').css('background','#fff');								
									jQuery("#resourceContent-iframe").find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');
								}else{
									var height = jQuery("#resourceContent-iframe").contents().find('.mymobilecontent').height();
									jQuery("#resourceContent-iframe").contents().find('html').css('background','#fff');
									jQuery("#resourceContent-iframe").contents().find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');									
								}
								if(height){
									jQuery("#resourceContent-iframe").css('height',(height+100));
									if($(window).height() < height)
										jQuery('.quiz-main-container #displayContent').css('height',height);
									else
										jQuery('.quiz-main-container #displayContent').css('height',$(window).height());
									
									clearInterval(quizlength);
									 jQuery("#load_wrapper, .overlaycontainer").hide();
								}else {
										if( $('html').hasClass('ie8') || $('html').hasClass('ie9') ) {
											jQuery("#resourceContent-iframe").css('height',jQuery("#resourceContent-iframe").height()+100);
											jQuery('.quiz-main-container #displayContent').css('height',$(window).height());
											clearInterval(quizlength);
											jQuery("#load_wrapper, .overlaycontainer").hide();
										}
                                                       if (height == 0) {
                                                       clearInterval(quizlength);
                                                       jQuery("#load_wrapper, .overlaycontainer").hide();
                                                       }
									}
								
                            },800); 
							
							$(window).trigger('resize');
							jQuery(window).scrollTop(0);
				}
				/* Ipad pdf download open in new tab issue fix */
				if( !isDevice() && !isPhoneGap() ){
					var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
					if( browserName[1] == "Safari"){
						jQuery("#resourceContent-iframe").contents().find("#download").attr('data-safari','true');
					}
				}
			
				
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#resourceContent-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#resourceContent-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
							   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								jQuery("#resourceContent-iframe").find("#finishattemptbutton").on("click",function(){
										  jQuery(".course_ifram_cls_btn").trigger("click");
								});
							   }else{
								   jQuery("#resourceContent-iframe").contents().find("#finishattemptbutton").on("click",function(){
											  jQuery(".course_ifram_cls_btn").trigger("click");
									});
							   }
								
							}
							 if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										var scormObject = jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
									}else{
										var scormObject = jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
									}
							if(scormObject != 0){
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
								jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
									jQuery("#resourceContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
								else{
									jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									jQuery("#resourceContent-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
								}
							}
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#resourceContent-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }else{
							jQuery("#resourceContent-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContent-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }
						if( Filetype == "scorm" ){						   
							setTimeout(function(){ 
							  jQuery("#resourceContent-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
								$(window).trigger('resize');
								jQuery("#load_wrapper, .overlaycontainer").hide();
							},1000);
						}
				// Hide header and footer are hide if answerbox is open in crossword.
				if ( Filetype === 'puzzle' ) {
					if( !$('html').hasClass('ie8') && !$('html').hasClass('ie9') ){
						jQuery("#resourceContent-iframe").contents().find(".boxnormal_unsel").off().on('click', function(){
							$("#resourceContent-iframe").contents().find("input#wordentry").trigger('focus');
						});
						$("#resourceContent-iframe").contents().find("input#wordentry").on('focus', function() {
							if( !isAndroid() && isiOS()){
								jQuery(".hme_hdrbx,div.row.menu").hide();
							}
						});
						$("#resourceContent-iframe").contents().find("#okbutton, #cancelbutton").on('click', function() {
							var disp = $("#resourceContent-iframe").contents().find("#answerbox, #answerbox2").css('display');
							if( !isAndroid() && isiOS() && disp == 'none'){
								jQuery(".hme_hdrbx,div.row.menu").show();
							}
						});
						$("#resourceContent-iframe").contents().find("#checkbutton, #finishattemptbutton").on('click', function() {
							if( !isAndroid() && isiOS()){
								jQuery(".hme_hdrbx,div.row.menu").show();
							}
						});
						jQuery("#resourceContent-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
							var loaderDisplay=setInterval(function (){
								if( jQuery("#load_wrapper").css('display') == "block" ){
									jQuery("#load_wrapper, .overlaycontainer").hide();
									jQuery("body").removeClass("overlay-video-quiz");
									clearInterval(loaderDisplay);
								}
							},1000);
						});
					}
				}
            });
        },
		ajaxReq:function(serviceUrl,data,succ,fail){
			jQuery.ajax({
				url: serviceUrl,
				data: data,
				cache:false,
				async:false,
				type:'POST',
				dataType:'json',
				crossDomain: true,		
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
		loadResourceComment : function() {
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data = {
                action: "get_course_resource_comment",
                coursemoduleid: self.modID,
                type : 'pdf',
                token : userDetails.token
            };
            jQuery('#note').val('');
            jQuery(".commentform-control").val('');
			 if(this.returnIeVersion()){
			  this.ieEightAndIeNine();
             }
            if( isDevice() && self.globalConfig.application.offLine ){
                data.uid=userDetails.id;
                data.cid=self.courseID;
                cordova.exec(
                             function (result) {
                                 var res = JSON.parse(result);
                                 if( res && res.response.length > 0 ){
                                     self.serverComments = res.response[0].comment;
                                     jQuery('#note').val(''+res.response[0].comment+'');
                                     jQuery(".commentform-control").val('' +res.response[0].comment+ '');
                                 }else{
                                     self.serverComments = "";
                                     jQuery('#note').val('');
                                     jQuery(".commentform-control").val('');
                                 }
                             },
                             function (result) {
                             },'OfflineServicePlugin', 'get_course_resource_comment', [data]);
            }else{
                jQuery.ajax({
                    url: serviceUrl,
                    data: data,
                    type:'POST',
                    dataType:'json',
                    crossDomain: true,
                    success: function(res) {
                        if ( res != null ) {
                            if( res.response[0] != undefined ){
                             self.serverComments = res.response[0].comment;
                             jQuery('#note').val(''+res.response[0].comment+'');
                             jQuery(".commentform-control").val('' +res.response[0].comment+ '');
                           }else{
                               self.serverComments = "";
							   jQuery('#note').val('');
                               jQuery(".commentform-control").val('');
                           }
                        }
                    },
                    error:function(){
                    }
                });
            }
		},
        footerIcons: function(notes){
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && isPhoneGap() ){
                jQuery("#footer-menu").find('li').remove();
                var footerElement = '<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
                if( notes){
                 footerElement +='<li class="footer_comment"><a href="#"><span class="commenticon"></span><span class="commentxt" data-msg="Comment"></span></a></li>';
                }else{
                 footerElement += '<li class="footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
                }
                footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
                footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
                jQuery(footerElement).appendTo(jQuery("#footer-menu"));
            }
        },
		saveNotes : function(textBoxID) {
			var self = this, serviceUrl = self.globalConfig.apiAddress.service, userDetails;

            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            self.serverComments = jQuery('' +textBoxID+ '').val();
            var data = {
                action: "insert_replace_course_resource_comment",
                coursemoduleid: self.modID,
                type : 'pdf',
                token : userDetails.token,
				comment : jQuery('' +textBoxID+ '').val()
            };
            if( isDevice() && self.globalConfig.application.offLine ){
                data.uid=userDetails.id;
                data.cid=self.courseID;
                cordova.exec(
                             function (result) {
                             },
                             function (result) {
                             },'OfflineServicePlugin', 'insert_replace_course_resource_comment', [data]);
            }else{

                jQuery.ajax({
                    url: serviceUrl,
                    data: data,
                    crossDomain: true,
                    type : 'POST',
                    cache : false,
                    dataType : 'json',
                    async: false,				
                    success: function(res) {
                        /* Storing in Offline Storage */
                       // self.offlineStorage.insertCourseItems(courseId, JSON.stringify(res));
                    },
                    error: function ( jqXHR, textStatus, errorThrown ){
                    //    self.offlineStorage.getCourseItems(courseId);
                    }
                });
            }
		}
    });
    return Clazz.com.components.widget.resource.js.Resource;
});
