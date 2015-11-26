define(["framework/WidgetWithTemplate","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.favorites.js");
    Clazz.com.components.widget.favorites.js.Favorites = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/favorites/template/favorites.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "favorites",
        localConfig: null,
        globalConfig: null,
        offlineStorage: null,
		takePdfUrl:null,
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
        	var self=this;
            self.UserDetails={};
            Clazz.navigationController.push(this);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
                if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                    BreadcrumElement = '<section class="tpbreadcrumbs"><ul id="favbred" class="bredcumlist">  \r\n' +
                    '<li class="favhdnk homepagenav"><a href="#" data-msg="Home"></a></li>  \r\n' +
                    '<li data-msg="Favorites"></li><li class="NOPINK"></li><li class="NOPINK"></li></ul><div class="clear"></div></section>';
                    return new Handlebars.SafeString(BreadcrumElement);
                }
            });
             Handlebars.registerHelper('checkForSpecificDiv', function () {
                BreadcrumElement ='<div class="tableNote">  \r\n' +
         		    '<table width="100%" cellspacing="0" cellpadding="0" border="0" id="tableNoteID"><thead>  \r\n' +
         		    '<tr class="fav-hdg">  \r\n' +
         		   '<th class="fav_chkbx"><input type="checkbox" class="selectAllcourse"><label for="selectAll"></label></th>  \r\n' +
          		    '<th class="fav_course"><span data-msg="courses">Courses</span></th> \r\n' +
          		    '<th class="fav_course"><span data-msg="File_name">File Name</span></th>  \r\n' +
          		    '<th class="fav_comments"><span data-msg="comment">Comments</span></th>  \r\n' +
          			'</tr></thead><tbody></tbody></table></div> \r\n' +
          			'<div class="span12 rept_bx favrrept_bx">  \r\n'+
                    '<div class="favpaginationbx"><!--<ul><li class="arwsymbl"><a href="#">&nbsp;</a></li><li class="activepg"><a href="#">1</a></li>  \r\n' +
                    '<li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li class="arwsymbl"><a href="#">&nbsp;</a></li>  \r\n' +
                    '</ul>--></div>  \r\n' +
                    '<div class="exportbutton" id="exportdiv"><a href="javascript:void(0)" data-msg="export"></a></div>  \r\n' +
                    '</div>  \r\n' +
                    '<div class="row lifter2"></div>  \r\n' +
                    '</div>';
                 return new Handlebars.SafeString(BreadcrumElement);
            });
            renderFunction(this.data, whereToRender);
        },
		addDecimal: function(val) {
			val = val.toString();
			if (!val.includes(",")) {
				val = parseFloat(val).toFixed(2);
			}
			return val;
		},
        getQuizWidget:function(response, courseID, modID){
          var quizWidgetDetails='',mod_val='';
          var attempts=[];
          var questions=[];
          var response = response.response;
          jQuery.each(response,function(index,val){
              if( index >0 ){
                  if( val.id == modID ){
                      mod_val = val.module;
                      if( mod_val.courseid == courseID ){
                          quizWidgetDetails = $.extend( {},mod_val.quiz );
                          attempts = quizWidgetDetails.quizlist[0].attempts;
                          questions = quizWidgetDetails.quizlist[1].questions;
                          quizWidgetDetails.quizlist=[];
                          quizWidgetDetails.quizlist.push({
                                                          "attempts":attempts,
                                                          "questions":questions
                                                          })

                      }
                  }
              }
            });

          return quizWidgetDetails;
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var self = this, iTouch = 'click';
            self.mod_Ids=[];
            if(isiOS()){
                iTouch = 'touchstart';
            }
             jQuery('.tableNote, #exportdiv').hide();
             jQuery('.commentNotes').hide();
             jQuery('.rept_bx').hide();
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
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');
            jQuery('#favbred li:nth-child(3)').hide();
            jQuery('#favbred li:nth-child(4)').hide();
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data= {
                action  :'favorite',
                token   : userDetails.token
            }
            self.loadData(data,userDetails);
            if($("#landingPageFav li").hasClass("dsbl")){
                $('.dsbl span:nth-child(2)').css({'cursor':'default'});
            }
            jQuery('.exportbutton:last > a').on('tap', function () {
                var serviceUrl = self.globalConfig.apiAddress.service, store, retailer, region, country, sortby;
				var selectedIds = [];
                var userDetails;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }
                jQuery("tbody input[type='checkbox']:checked + label").each(function (i) {
                    selectedIds.push(jQuery(this).siblings().val());
                });
                //var userDetails;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }

				 /*if(isiOS() || isDevice()){
					$(this).attr('target','_blank');
				 }*/
				  if((isiOS() || isDevice()) && !isPhoneGap()){
					$(this).attr('target','_blank');
				 }

             	var href = serviceUrl + '?action=get_course_resource_comments_export&uid='+userDetails.id+'&recordrow='+selectedIds+'&token='+userDetails.token;
				 jQuery('#displayContentFav, .ifram_cls_btn').hide();
				//jQuery(this).attr('href', href);
                if(!isDevice()  && !isPhoneGap()){
                 jQuery(this).attr('href', href);
                }
                var downloadFileURL = href;
                var fileName = 'notes_'+userDetails.id+'.csv';
                var courseItemData = {
                    fileURL: href,
                    fileName: 'notes_'+userDetails.id
                };
                self.loadFileinWebFav(self, courseItemData);
                //self.checkIfFileExistsFav(self, courseItemData);
            });

               jQuery('.bootpag a').die().live('click', function (event) {
                jQuery('.chkcase').attr('checked', false);
                jQuery('.selectAllcourse:last').attr('checked', false);
                jQuery("#load_wrapper").css({
                    'position':'relative',
                    'top':jQuery(document).height()/2
                });
                var page = jQuery(this).parent().attr('data-page');
                var pagelength = jQuery('.bootpag li').length - 2;
                if (page >= pagelength) {
                    jQuery('.bootpag a:last').hide();
                } else {
                    jQuery('.bootpag a:last').show();
                }
                var c, prev;
                c = jQuery('.activepg').attr('data-page');
                if (c === 1) {
                    prev = "1";
                } else {
                    if (jQuery(this).parent().attr('data-move')) {
                        if (jQuery(this).parent().attr('data-move') === 'prev') {
                            prev = parseInt(jQuery(this).parent().attr('data-page')) - parseInt(1);
                        } else {
                            prev = parseInt(jQuery(this).parent().attr('data-page'));
                        }
                    } else {
                           prev = parseInt(jQuery(this).parent().attr('data-page'));
                    }
                    page = prev;
                }
                if (c === pagelength) {
                    var lastval = pagelength;
                } else {
                    if (jQuery(this).parent().attr('data-move')) {
                        if (jQuery(this).parent().attr('data-move') === 'next') {
                            lastval = parseInt(jQuery(this).parent().attr('data-page')) + parseInt(1);
                        } else {
                            lastval = parseInt(jQuery(this).parent().attr('data-page'));
                        }
                    } else {
                          lastval = parseInt(jQuery(this).parent().attr('data-page')) + parseInt(1);
                    }
                }
                jQuery('.bootpag li:last').attr('data-page', lastval);
                jQuery('.bootpag li:first').attr('data-page', prev);
                var userDetails;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                }
				var start = (page - 1) * 20;
				var end = 20;
					var data = {
						action: 'get_course_resource_comments',
						uid : userDetails.id,
						start: start,
						end: end,
						token: userDetails.token
					};
                self.paginationNotes(data, page, lastval, prev);
             });
            jQuery(".readingmaterial").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.resourceicon").show();
                    jQuery("ul.resourceicon").addClass('presentShow');
                    jQuery('#favbred li:nth-child(3)').show();
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='reference'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".videoicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.videoicon").show();
                    jQuery("ul.videoicon").addClass('presentShow');
                    jQuery('#favbred li:nth-child(3)').show();
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='video'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".audioicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.audioicon").addClass('presentShow');
                    jQuery("ul.audioicon").show();
                    jQuery('#favbred li:nth-child(3)').show();
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='CC'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
			jQuery(".audioicon1").click(function(){
			    if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery(".commentNotes").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.audioicon1").addClass('presentShow');
                    jQuery("ul.audioicon1").show();
                    jQuery('#favbred li:nth-child(3)').show();
                    if( jQuery('#favbred li:nth-child(3)').hasClass('NOPINK') || jQuery('#favbred li:nth-child(3)').hasClass('noSlashBread')){
                     jQuery('#favbred li:nth-child(3)').removeClass('NOPINK');
                     jQuery('#favbred li:nth-child(3)').addClass('favhdnk');
                    }
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='CC1'>CC1</span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
			jQuery(".audioicon2").click(function(){
			    if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery(".commentNotes").hide();
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.audioicon2").addClass('presentShow');
                    jQuery("ul.audioicon2").show();
                    jQuery('#favbred li:nth-child(3)').show();
                    if( jQuery('#favbred li:nth-child(3)').hasClass('NOPINK') || jQuery('#favbred li:nth-child(3)').hasClass('noSlashBread')){
                     jQuery('#favbred li:nth-child(3)').removeClass('NOPINK');
                     jQuery('#favbred li:nth-child(3)').addClass('favhdnk');
                    }
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='CC2'>CC2</span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".quizicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.quizicon").show();
                    jQuery("ul.quizicon").addClass('presentShow');
                    jQuery('#favbred li:nth-child(3)').show();
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='quiz'></span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                }
            });
            jQuery(".notesicon").click(function(){
                if(!jQuery(this).hasClass('dsbl')){
                    jQuery("ul.listitems").hide();
                    jQuery("ul.listitems").removeClass('presentShow');
                    jQuery("#landingPageFav").hide();
                    jQuery("#showlistFav").show();
                    jQuery("ul.notesicon").addClass('presentShow');
                    jQuery("ul.notesicon").show();
                    jQuery('#favbred li:nth-child(3)').show();
                    if( jQuery('#favbred li:nth-child(3)').hasClass('NOPINK') || jQuery('#favbred li:nth-child(3)').hasClass('noSlashBread')){
                     jQuery('#favbred li:nth-child(3)').removeClass('NOPINK');
                     jQuery('#favbred li:nth-child(3)').addClass('favhdnk');
                    }
                    jQuery('#favbred li:nth-child(2)').addClass('favhdnk resource').removeAttr('data-msg').html("<a href='#' data-msg='Favorites'></a>");
                    jQuery('#favbred li:nth-child(3)').html("<span data-msg='Notes'>Notes</span>");
                    loadAllLanguages();
                    self.removeSlashBreadcrumb();
                    jQuery('#favbred li:nth-child(2)').removeClass('noSlashBread');
                    jQuery('.tableNote,#exportdiv').show();
                    jQuery('.rept_bx').show();
                    self.getNotesData();
                }
            });
            jQuery(".resource").die().live('click',function(){
                jQuery('.tableNote,#exportdiv').hide();
                jQuery('.rept_bx').hide();
                jQuery("#displayContentFav,.commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery("readingmaterialFav").hide();
                jQuery("#showlistFav").hide();
                jQuery(".listitems").removeClass('presentShow');
                jQuery('#favbred li:nth-child(2)').removeClass('favhdnk resource').addClass('noSlashBread').removeAttr('data-msg').html("<span data-msg='Favorites'></span>");
                loadAllLanguages();
                jQuery('#favbred li:nth-child(3)').hide();
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery("#landingPageFav").show();
                self.footerIcons(false);
            });
            jQuery('.selectAllcourse:last + label').die().live('click', function () {
                if (jQuery('.selectAllcourse:last:checked').length) {
                    jQuery('.chkcase').attr('checked', false);
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).removeClass('inputChecked');
                        jQuery('#tableNoteID tbody').find('label').removeClass('inputChecked');
                    }
                    jQuery('.selectAllcourse:last').attr('checked', false);
                    self.mod_Ids=[];
                } else {
                    jQuery('.chkcase').attr('checked', true);
                    jQuery(this).addClass('inputChecked');
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).addClass('inputChecked');
                        jQuery('#tableNoteID tbody').find('label').addClass('inputChecked');
                    }
                    jQuery('.selectAllcourse:last').attr('checked', true);
                }
                 if( isDevice() ){

                   jQuery('.chkcase').each(function(){
                      var index = parseInt(jQuery(this).attr('data-arr_index'));
                      var _modId = jQuery(this).attr('data-modId');
                      self.mod_Ids[index] = _modId;
                   });
                 }
            });
            jQuery("tbody input[type='checkbox'] + label").die().live('click', function () {
                var chkBox = jQuery(this).siblings();
                var index =  parseInt(jQuery(this).siblings().attr('data-arr_index'));
                var _modId = jQuery(this).siblings().attr('data-modId');

                if (chkBox.is(':checked')) {
                    chkBox.removeAttr('checked');
                    self.mod_Ids.pop(index);
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).removeClass('inputChecked');
                    }
                } else {
                    chkBox.attr('checked', true);
                    self.mod_Ids[index] = _modId;
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).addClass('inputChecked');
                    }
                }
				// To check select All course check box is whether checked or not.
				if (jQuery('.chkcase:checked').length === jQuery('.chkcase').length) {
					jQuery('.selectAllcourse:last').attr('checked', true);
				} else {
					jQuery('.selectAllcourse:last').attr('checked', false);
				}
            });
            jQuery('.ifram_cls_btn').die().live('click',function(){

                $('body').removeClass("scormPage");
                $('body').removeClass('quiz-main-container fav-quiz-main-container');
                $('body').removeClass("crosswordwrap");
                jQuery("#displayContentFav").removeClass("content-ipadView");
                jQuery("#displayContentFav,.commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery(this).remove();
                jQuery("#showlistFav").show();
                jQuery(".presentShow").show();
                jQuery('#favbred li:nth-child(4)').hide();
                var attrName = jQuery('#favbred li:nth-child(3) a').attr('data-msg');

                if( attrName == undefined ){
                    var attrName1 = jQuery('#favbred li:nth-child(3) span').attr('data-msg');
                }
                if( attrName == undefined ){
                    jQuery('#favbred li:nth-child(3)').removeClass().addClass('noSlashBread').html("<span data-msg="+attrName1+">"+attrName1+"</span>");
                }else{
                    jQuery('#favbred li:nth-child(3)').removeClass().addClass('noSlashBread').html("<span data-msg="+attrName+"></span>");
                }
                self.footerIcons(false);
                loadAllLanguages();
                scormUpdate(self.userID, self.quizCourseId, self.modID);
                videoTapped(0,self.video_tapped);
            });
            jQuery(".favoriteslist").die().live(iTouch, function(){
                var dataFileType, srcURL, type, noOfpages, fileHeading, favItemsData, fileType, fileURL, filepageCount, fileName, quizTitle;
                dataFileType = jQuery(this).data('filetype');
                (!isDevice()) ? jQuery("#showlistFav").hide():jQuery("#showlistFav").show();
                if(isDevice() && isiOS()){
                    jQuery("#showlistFav").hide();
                }
                self.courseID = jQuery(this).attr('data-courseID');
                self.video_tapped=false;
                switch(dataFileType){
                    case 'material':
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "Document";
                        srcURL = jQuery(this).attr("url");
                        jQuery("#landingPage").hide();
                        break;
                    case 'video':
                        jQuery("#landingPage").hide();
                        jQuery("#videolist").hide();
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "video";
                        srcURL = jQuery(this).attr("url");
                        self.video_tapped=true;
                        break;
                    case 'audio':
                        type = jQuery(this).attr("type");
                        noOfpages = jQuery(this).attr("pageno");
                        fileHeading = "audio";
                        srcURL = jQuery(this).attr("url");
                        jQuery("#landingPage").hide();
                       break;
                    case 'quiz':
                        fileHeading = "quiz";
                        srcURL = jQuery(this).attr("url");
                        type = jQuery(this).attr("type");
                        quizTitle = type.split('.')[0];
                        jQuery("#landingPage").hide();
                        jQuery("#showlistFav ul").hide();
                        if( isDevice() && isPhoneGap() ){
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
                        self.loadquizinWeb(srcURL, quizTitle, dataFileType);
                    return false;
                    case 'scorm':
                       fileHeading = "scorm";
                       srcURL = jQuery(this).attr("url");
                       type = jQuery(this).attr("type");
                       quizTitle = type.split('.')[0];
                       if( !isDevice() && !isPhoneGap() ){
                           jQuery("#landingPage").hide();
                           jQuery("#showlistFav ul").hide();
                       }
                       var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                       var course_ID = jQuery(this).attr('data-quiz_CourseId');
                       self.quizCourseId= course_ID;
                       self.userID = userDetails.id;
                       self.courseID = course_ID;
                       self.modID = jQuery(this).attr('data-modid');
                       if( isDevice() && isPhoneGap() ){
                           jQuery("#showlistFav").show();
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
                          self.loadquizinWeb(srcURL, quizTitle, dataFileType);
                        }
                    return false;
                    case "puzzle":
                        fileHeading = "quiz";
                        srcURL = jQuery(this).attr("url");
                        type = jQuery(this).attr("type");
                        quizTitle = type.split('.')[0];
                        if( isDevice() && isPhoneGap() ){
                            if( !isOnline() ){

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
                                             self.sessionAjaxReq(serviceUrl,data,function(resp){
                                                  if(typeof(resp.USER) !== 'undefined') {
                                                      jQuery("#landingPage").hide();
                                                      jQuery("#showlistFav ul").hide();
                                                      self.loadquizinWeb(srcURL, quizTitle, dataFileType);
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
                favItemsData = {
                    fileType: type.substring(type.lastIndexOf(".") + 1).toLowerCase(),
                    fileURL: srcURL,
                    fileHeader:fileHeading,
                    filepageCount: noOfpages,
                    fileName: type.split('.')[0],
                    fileNameUpload: (isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename'))
                };
                self.modID = jQuery(this).attr('data-modid');
                self.plugINURl = srcURL;
                self.loadResourceComment();
                if (isDevice() && isPhoneGap()) {
                    self.loadFileinWeb(favItemsData);
                }else{
                  self.checkIfFileExists(self, favItemsData); /*check selected file already have in local or not*/
                }

            });
            jQuery(".Document a").live('click',function() {
                jQuery("#displayContentFav").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery('#showlistFav').show();
                jQuery('#readingmaterialFav').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='reference'></span>");
                loadAllLanguages();
            });
            jQuery(".video a").live('click',function() {
                jQuery("#displayContentFav").hide();
                jQuery(".commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery('#showlistFav').show();
                jQuery('#videolistFav').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='video'></span>");
                loadAllLanguages();
            });
            jQuery(".quiz a").live('click',function(){
                jQuery("#displayContentFav").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery('#showlistFav').show();
                jQuery('#quizlistFav').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='quiz'></span>");
                loadAllLanguages();
            });
            jQuery(".CC a").live('click',function(){
                jQuery("#displayContentFav").hide();
                 jQuery(".commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery('.favCommentNotes').hide();
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery('#showlistFav').show();
                jQuery('#audiolistFav').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='CC'></span>");
                loadAllLanguages();
            });
			 jQuery(".CC1 a").live('click',function(){
                jQuery("#displayContentFav").hide();
                 jQuery(".commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery('.favCommentNotes').hide();
                jQuery('#favbred li:nth-child(4)').hide();
                jQuery('#showlistFav').show();
                jQuery('#audiolistFav1').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='CC1'>CC1</span>");
                loadAllLanguages();
            });
			 jQuery(".CC2 a").live('click',function(){
                jQuery("#displayContentFav").hide();
                 jQuery(".commentNotes").hide();
                if(jQuery(".iframewrap_crs_fav .ifram_cls_btn").length){
                    jQuery(".iframewrap_crs_fav .ifram_cls_btn").remove();
                }
                if(jQuery("#displayContentFav video").length){
                    jQuery("#displayContentFav video").remove();
                }
                jQuery('#favbred li:nth-child(4)').hide();
                 jQuery('.favCommentNotes').hide();
                jQuery('#showlistFav').show();
                jQuery('#audiolistFav2').show();
                jQuery('#favbred li:nth-child(3)').addClass('noSlashBread').html("<span data-msg='CC2'>CC2</span>");
                loadAllLanguages();
            });
            jQuery('.home_view').on('tap',function(){
                jQuery("#footer-menu li").removeClass('selected');
                jQuery('#footer-menu li.footer_home').addClass('selected');
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length) {
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage();
                    } else {
                        Clazz.navigationController.getView('#home');
                        homeCarousel();
                    }
                }
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
			
            jQuery(".AndroidVideo").die().live('click', function() {
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'FileOpener', 'openVideoFile', [self.AndroidVideoURl]);
            });
             if(navigator.platform === "iPad Simulator" || navigator.platform === "iPad"){
                  jQuery('#note').on("focus", function(){
                    jQuery("div.row.menu").hide();
                  });
                  jQuery('#note').on("blur",function(){
                    jQuery("div.row.menu").show();
                  });
             }

             if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" ){
                jQuery('textarea').on('focus',function(){
                  jQuery(".hme_hdrbx,div.row.menu").hide();
                  jQuery('html,body').stop();
                  return false;
                });
                jQuery('textarea').on('blur',function(){
                   jQuery(".hme_hdrbx,div.row.menu").show();
                   jQuery('html,body').animate({scrollTop:-200 }, 10);
                   return false;
                });
             }
            self.removeSlashBreadcrumb();
            if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                removeOfScroll();
            }

					// Attempt Quiz
			jQuery(".attemptQuiz").die().live(iTouch,function(){
                jQuery("#load_wrapper,.overlaylightbox").show();
                 localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                    var actualData = result;
                    self.index = 1;
                    self.layoutindex = 0;
                    self.quizdata.quizlist[self.currentQuiz].attempts[0].state = "inprogress";
                    self.quizdata.quizlist[self.currentQuiz].attempts[0].startedOn = new Date();
                    self.quizdata.quizlist[self.currentQuiz].attempts[0].timeTaken = "2 min 55 sec";
                    actualData.quizlist[self.currentQuiz] = self.quizdata.quizlist[self.currentQuiz];                  
                    localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false,function(){
                      self.loadQuizData(self.quizdata);
                    });
                                  
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
											localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                                                var actualData = result;
                                                actualData.quizlist[self.currentQuiz] = self.quizdata.quizlist[self.currentQuiz];
                                                localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false);
											});
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
				localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                      var actualData = result;
                      actualData.quizlist[self.currentQuiz] = self.quizdata.quizlist[self.currentQuiz];
                      localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false, function(){
                                 if(self.quizdata.quizlist[self.currentQuiz].questions.length == self.index){
                                 self.index = 0;
                                 self.summary = true;
                                 }else{
                                 self.index = parseInt(self.index)+1;
                                 self.layoutindex = parseInt(self.layoutindex)+1;
                                 }
                                 self.loadQuizData(self.quizdata);
                     });
				});
                
               }else{
                   self.index = parseInt(self.index)+1;
                   self.layoutindex = parseInt(self.layoutindex)+1;
                   self.loadQuizData(self.quizdata);
               }

			});

			// Re attempt the Quiz
			jQuery('.return-attempt').die().live(iTouch,function(){
                 jQuery("#load_wrapper,.overlaylightbox").show();
				self.index = 1;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;
				self.loadQuizData(self.quizdata);
				
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
				self.loadQuizData(self.quizdata);
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
				self.loadQuizData(self.quizdata);
				
			});

			//Finish Review
			jQuery('.finish-review').die().live(iTouch,function(){
                 jQuery("#load_wrapper,.overlaylightbox").show();
				self.index = 0;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;
                //self.currentQuiz = self.currentQuiz+1;
                self.loadQuizData(self.quizdata);
				

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
				 localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                        var actualData = result;
                        actualData.quizlist[self.currentQuiz] = self.quizdata.quizlist[self.currentQuiz];
                        localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID, true, function(){
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
				
			});
        },
		FirstPage:function(data,status,tableIndex,isHeader,lastQuiz){
        	var self = this, FirstPageElements = '',totalGrade = self.totalGrade(data.questions),feedback='';
        	if(status != ''){
        		if(isHeader){
					
					if(self.noOfAttempts == 0){
						FirstPageElements +="<div class='paracont' style='text-align:center;'><span data-msg='attemptsallowed'></span>: <span data-msg='allinone'></span></div><div class='paracont' data-msg='summaryofattempts'></div>";
					}else{
						FirstPageElements +="<div class='paracont' style='text-align:center;'><span data-msg='attemptsallowed'></span>: "+self.noOfAttempts+"</div><div class='paracont' data-msg='summaryofattempts'></div>";
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
					 userGrade = self.addDecimal(userGrade);
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
                    // todisplayGrade = Math.round(todisplayGrade);
					todisplayGrade = self.addDecimal(todisplayGrade);
					
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
						if(self.attemptedcount >= 1 ){
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
        	var self = this, answerMark = 0,l=0,mark = 0,userAnswerCount = 0,fraction = 0;
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
	        	QuizData.userMark = self.addDecimal(mark);
				mark = self.addDecimal(mark);
				return mark;
	        }else{
	        	var ratio = (fraction*mark)
	        	QuizData.userMark = self.addDecimal(ratio);
				ratio = self.addDecimal(ratio);
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

           jQuery("#displayContentFav").empty().show();
            jQuery("#displayContentFav").css({ position : 'relative' });
			jQuery(".iframewrap_crs_fav").find('.ifram_cls_btn').remove();
			jQuery(".iframewrap_crs_fav").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
			jQuery("<div id='resourceContentFav-iframe' style='height:auto;'></div>").appendTo(jQuery("#displayContentFav"));
            
			jQuery("#displayContentFav").addClass('quiz-container');
            jQuery("#displayContentFav").show();
            $('body').addClass("quiz-main-container fav-quiz-main-container");
            $('.quiz-main-container #displayContentFav').css('height',$(window).height()-45);
			$('.fav-quiz-main-container #displayContentFav').parent().parent().css('height',$(window).height()-45);
            jQuery("#load_wrapper").hide();
            /* Question and anwser displays */
			if(self.index != 0 && self.review == false){
			
				var layout = data.quizinfo[0].layouts.split(',');

				jQuery.each(layout,function(index,value){

                    if(layout[self.layoutindex] != 0 && layout[self.layoutindex] != undefined){

                        if(index !=0)
                            self.index++;

                        self.layoutindex ++;
						data.quizlist[self.currentQuiz].questions[self.index-1].mark = self.addDecimal(data.quizlist[self.currentQuiz].questions[self.index-1].mark);
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
                                            quizquestions += "<div class='chooseanr selectbox'><span class='labelname'>"+val.subquestion+"</span><div class='dropmenusct'><select class='select' id='select"+questionId+i+"' data-index ="+i+"  data-question="+questionId+" name='select"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'>"+option+"</select></div></div>";
                                         else
                                            val.invalid = true;
                                     }

                                });

                                 jQuery(quizquestions).appendTo(jQuery("#resourceContentFav-iframe"));
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
                                      jQuery(".radiooption").each(function(){
                                           $(this).parent().removeClass('active');
                                      });
                                     $(this).parent().addClass('active');
                                
                                    });	
                    }else{
                        return false;
                    }
                   }

				});
				quizquestions = "<div class='btnwrap'><div type='button' class='nextquiz btncommon' data-msg='next'></div></div>";
				jQuery(quizquestions).appendTo(jQuery("#resourceContentFav-iframe"));

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
					jQuery(quizsummary).appendTo(jQuery("#resourceContentFav-iframe"));
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
						
						var mark = self.addDecimal(data.quizlist[self.currentQuiz].questions[self.index-1].mark);
						var choices = data.quizlist[self.currentQuiz].questions[self.index-1].choices;
						var userMark = data.quizlist[self.currentQuiz].questions[self.index-1].userMark;
						var type = data.quizlist[self.currentQuiz].questions[self.index-1].type;

					    var totalMark = 0,userGrade;
		                jQuery.each(data.quizlist[self.currentQuiz].questions,function(i,val){
							if(val.userMark != null && val.userMark != undefined)
								totalMark = parseInt(totalMark) + parseInt(val.userMark);
		                });
						
						totalMark = self.addDecimal(totalMark);
						if (userMark != undefined) {
							userMark = self.addDecimal(userMark);
						}
						
						 var QuizGrade = data.quizinfo[0].grade;
						 QuizGrade = self.addDecimal(QuizGrade);
						 
                         var Quizsumgrades = data.quizinfo[0].sumgrades;
						 Quizsumgrades = self.addDecimal(Quizsumgrades);
						 
						 var marksValue = (totalMark/Quizsumgrades*100);
						 marksValue = self.addDecimal(marksValue);
						 
						 var finalGradeDisplay = (marksValue*QuizGrade/100);
                         finalGradeDisplay = self.addDecimal(finalGradeDisplay);
						 
		                userGrade = ((totalMark/totalGrade)*100);
						userGrade = self.addDecimal(userGrade);
						
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
							quizquestions += "<tr><td><span data-msg='marks'></span></td><td>&nbsp;"+totalMark+" / "+Quizsumgrades+"</td></tr>";
                        }
                        if(QuizGrade == 100){
							quizquestions += "<tr><td><span data-msg='grade'></span></td><td>&nbsp;"+marksValue+"&nbsp;<span data-msg='outofpercent'></span>&nbsp;"+QuizGrade+" </td></tr>";
                        }
                        if(Quizsumgrades == QuizGrade && QuizGrade != 100){
							quizquestions += "<tr><td><span data-msg='grade'></span></td><td>&nbsp;"+finalGradeDisplay+"&nbsp;<span data-msg='outofpercent'></span>&nbsp;"+QuizGrade+" ("+marksValue+"%) </td></tr>";
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
						// localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID,false);
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
						 quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> "+userMark+" <span data-msg='outof'></span> "+mark+"</span></div>";
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

							 if(type == "multichoice" ){
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
									quizquestions += "<div class='chooseanr selectbox'><span  class='labelname'>"+val.subquestion+"</span><div class='dropmenusct'><select class='select' data-index ="+i+" id='select"+(self.layoutindex+i+val.id)+"' data-question="+val.id+" name='select"+val.id+"' data-id='"+val.id+"' value='"+val.id+"'>"+option+"</select></div></div>";	
								
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
					jQuery(quizquestions).appendTo(jQuery("#resourceContentFav-iframe"));

						
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
				jQuery(quizquestions).appendTo(jQuery("#resourceContentFav-iframe"));
			}
			else{
		     /* First Page */
				var FirstPageElements = "<div class='headlabel'> <h2>"+self.quizdata.quizinfo[0].name+"</h2> </div>",attemptNew = '';statusTable ='',isHeader = true,next = true,inprogress = true,overallGrade = 0;
				//jQuery(FirstPageElements).appendTo(jQuery("#resourceContentFav-iframe"));
				var firstPageFlag = true,  finalGradeArray = [];
				 self.displayIndex = 1;
				 var alreadyattemptedData ='';
				  if(self.quizdata.alreadyattempted.length ){
                                                                        
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
											// todisplayGrade = Math.round(todisplayGrade);
											todisplayGrade = self.addDecimal(todisplayGrade);
											
											valueofcopyObj.sumgrades= Math.round(valueofcopyObj.sumgrades);
											finalGradeArray.push(valueofcopyObj.sumgrades);
											if(self.quizdata.quizinfo[0].feedback.length != 1){
											jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
														if(feedbackValue.feedbacktext){
														if((valueofcopyObj.sumgrades >= feedbackValue.mingrade) && (valueofcopyObj.sumgrades <  feedbackValue.maxgrade))
														alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+(feedbackValue.feedbacktext)+"</td></tr>";
														}else{
														alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";       
														}
														
														});
											}else{
											if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
											if((valueofcopyObj.sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (valueofcopyObj.sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
											alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+self.quizdata.quizinfo[0].feedback[0].feedbacktext+"</td></tr>";
											else
											alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td></td></tr>";
											}else{
											alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";
											}
											}
											}
											});
                                                                        }
			    jQuery.each(self.quizdata.quizlist, function(index,val){
			    	if(firstPageFlag){
						// finalGradeArray.push(val.userMark);
					  switch (self.quizdata.quizlist[index].attempts[0].state) {
                            case "completed":
								FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'f',index,isHeader);
								overallGrade = overallGrade + self.overallGrade(self.quizdata.quizlist[index].questions);
								self.quizdata.quizlist[index].attempts[0].sumgrades = Math.round(self.quizdata.quizlist[index].attempts[0].sumgrades);
								finalGradeArray.push(self.quizdata.quizlist[index].attempts[0].sumgrades);
								// localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID, false);
								isHeader = false;
                            break;
							    case "finished":
							    	FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'f',index,isHeader);
							    	overallGrade = overallGrade + self.overallGrade(self.quizdata.quizlist[index].questions);
									self.quizdata.quizlist[index].attempts[0].sumgrades = Math.round(self.quizdata.quizlist[index].attempts[0].sumgrades);
							    	 finalGradeArray.push(self.quizdata.quizlist[index].attempts[0].sumgrades);
									//  localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',self.quizdata,self.userID,false);
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
				
			    jQuery(FirstPageElements).appendTo(jQuery("#resourceContentFav-iframe"));
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
                                // todisplayGrade = Math.round(todisplayGrade);
								todisplayGrade = self.addDecimal(todisplayGrade);
								
							valueofcopyObj.sumgrades= Math.round(valueofcopyObj.sumgrades);
							finalGradeArray.push(valueofcopyObj.sumgrades);
								if(self.quizdata.quizinfo[0].feedback.length != 1){
								jQuery.each(self.quizdata.quizinfo[0].feedback,function(feedbackIndex, feedbackValue){
									if(feedbackValue.feedbacktext){
										if((valueofcopyObj.sumgrades >= feedbackValue.mingrade) && (valueofcopyObj.sumgrades <  feedbackValue.maxgrade))
											alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+(feedbackValue.feedbacktext)+"</td></tr>";
									}else{
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";       
									}
									
								});
							}else{
								if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
									if((valueofcopyObj.sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (valueofcopyObj.sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+self.quizdata.quizinfo[0].feedback[0].feedbacktext+"</td></tr>";
									else
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td></td></tr>";
								}else{
									alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";
								}
							}
						}
						
	    			});
				}
				
			    if(next && inprogress){
			    	  FirstPageElements = "<div class='paracont'><span data-msg='yourfinalgradeis'></span> "+Math.max.apply(Math,finalGradeArray)+"</div><div class='paracont'> <span data-msg='nomoreattempts'></span></div>";
			    	 jQuery(FirstPageElements).appendTo(jQuery("#resourceContentFav-iframe"));
			    }
			
			    if(inprogress){
			    	jQuery(attemptNew).appendTo(jQuery("#resourceContentFav-iframe"));
			    }
			    else{
			    	FirstPageElements = "<div class='reattempt-quiz btncommon' data-index ='"+(self.currentQuiz)+"' data-msg='reattemptquiz'></div></div>";
			    	jQuery(FirstPageElements).appendTo(jQuery("#resourceContentFav-iframe"));
			    }
			    
			                                             
	        	alreadyattemptedData += '</tbody>';
	        	jQuery(alreadyattemptedData).appendTo('.already');                                         
	        	jQuery(data).appendTo('.already');
	        	console.log("data",data);
	        	

			}
			 var user = JSON.parse(window.localStorage.getItem("USER"));
			    var language = user.lang;
	            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
	            initLanguages();
	            loadLanguages(activeLang);
             //jQuery("#displayContentFav").niceScroll();
			 $(window).trigger('resize');
			if( isiOS() || isAndroid() ){
				jQuery(window).on("orientationchange",function(){
					if ( $('body').hasClass('fav-quiz-main-container') ) {
						$(window).trigger('resize');
					}
				});
			}
		},
        removeSlashBreadcrumb: function(){
            jQuery("#favbred li" ).each(function () {
                jQuery("#favbred li:hidden:first").prev().addClass('noSlashBread');
            });
        },
        checkIfFileExists: function(self, favItemsData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false, fileName;
                fileName = favItemsData.fileNameUpload;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        var i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) {  /*check if already exist.*/
                                    favItemsData.fileURL = entries[i].fullPath;
                                    self.loadFileinWeb(favItemsData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
//                                self.downloadFile(self, favItemsData);
                                self.loadFileinWeb(courseItemData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, favItemsData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, favItemsData);
                });
            } else {
                self.loadFileinWeb(favItemsData);
            }
        },
        downloadFile: function(self, favItemsData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
                var fileName = favItemsData.fileNameUpload, downloadFileURL = favItemsData.fileURL;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*create folder into local drive*/
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        var filePath = fileEntry.fullPath + "/" + fileName;
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        // Please wait.Your file will load in a few seconds.
                        fileTransfer.onprogress = function(progressEvent) {
						   jQuery("#load_wrapper, .overlaycontainer").show();
						};
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            favItemsData.fileURL = fileDir.fullPath;
                            self.loadFileinWeb(favItemsData); /*load downloaded file into iframe/ video*/
                        }, function(error) {
                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                //console.log("**********download error source " + error.source);
                                //console.log("********download error target " + error.target);
                                //console.log("*********upload error code: " + error.code);
                            }
                        });
                    }, self.fileError);
                }, self.fileError);
            } else {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
				
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('.errorCode-pop').show();
				
            }
        },
        fileError: function(evt) {
           // console.log("Error occured in download : ******** " + JSON.stringify(evt));
        },
        loadFileinWeb: function(favItemsData) {
            var self = this, file_Type = favItemsData.fileType, pageno = parseInt(favItemsData.filepageCount), filePath = favItemsData.fileURL, iFrameHight,  androidData={}, language;

            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            if(isDevice() && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").hide();
                var PDFTokenVar;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 PDFTokenVar = JSON.parse(window.localStorage.getItem("USER")).token;
                 userID = JSON.parse(window.localStorage.getItem("USER")).id;
                } else {
                    PDFTokenVar = JSON.parse($.jStorage.get("USER")).token;
                }
                if( /Android/i.test(navigator.userAgent) ) {
                	  androidData.userID = userID;
                      androidData.modID = self.modID;
                      androidData.pdfURL = self.plugINURl;
                      androidData.timemodified = null;
                      androidData.pdfToken = PDFTokenVar;
                      androidData.language = ((language == null)?'en_us':language);
                      androidData.serviceURl = self.globalConfig.apiAddress.service;
                      androidData.isFavour = true;
                                                                      
                      cordova.exec(
                                   function (args) {},
                                   function (args) {},
                                   'FileOpener', '' +((file_Type === 'pdf')?'openFile':'openVideoFile')+ '', [((file_Type === 'pdf')?androidData:self.plugINURl)]);
                      if( file_Type === 'pdf' ){
                       jQuery("#showlistFav").show();
                      }
                                                                      
                      if( favItemsData.fileType != 'mp4'){
                       return false;
                      }
                }
            }
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && (file_Type === 'pdf') && isPhoneGap() ){
                var cardovaSetToken;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    cardovaSetToken = JSON.parse(window.localStorage.getItem("USER")).token;
                } else {
                    cardovaSetToken = JSON.parse($.jStorage.get("USER")).token;
                }
              cordova.exec(
                           function (args) {},
                           function (args) {},
                           'PDFViewerPlugin', 'openPdf', [self.modID, self.timemodified, self.plugINURl, cardovaSetToken, ((language == null)?'en_us':language), self.globalConfig.apiAddress.service, true]);
              if( file_Type === 'pdf' ){
               jQuery("#showlistFav").show();
              }
              return false;
            }
            jQuery(".showcontent").removeClass("QUIZshowcontent");
            var breadNameFour = '';
            breadNameFour = favItemsData.fileName;
            CCbreadCrumb = jQuery.trim(breadNameFour.substr(0,3));

          //  breadNameFour = (CCbreadCrumb != 'CC:' ? breadNameFour:breadNameFour.substr(3));
			if((CCbreadCrumb == "CC:"))
			breadNameFour = breadNameFour.substr(3);
			else if((CCbreadCrumb == "CC1") || (CCbreadCrumb == "CC2"))
			breadNameFour = breadNameFour.substr(4);
			else
			breadNameFour = breadNameFour;

            jQuery('#favbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread');
            jQuery('#favbred li:nth-child(4)').show();
			if (CCbreadCrumb == "CC:")
			{
			//console.info("CC+++++++++");
            if(favItemsData.fileHeader == 'Document') {
                jQuery('#favbred li:nth-child(3)').addClass('favhdnk '+(CCbreadCrumb == "CC:" ? "CC" : favItemsData.fileHeader)).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "reference")+'></a>');
			}
            if(favItemsData.fileHeader == 'video') {
                jQuery('#favbred li:nth-child(3)').addClass('favhdnk '+(CCbreadCrumb == "CC:" ? "CC" : favItemsData.fileHeader)).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "video")+'></a>');
			}
            if(favItemsData.fileHeader == 'audio') {
                jQuery('#favbred li:nth-child(3)').addClass('favhdnk '+(CCbreadCrumb == "CC:" ? "CC" : "video")).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "video")+'></a>');
			}
			}
            loadAllLanguages();
            jQuery('#favbred li:nth-child(4)').html(breadNameFour);
            iFrameHight ='100%';
            jQuery("#displayContentFav").empty().show();
            jQuery("#displayContentFav").css({
                position : 'relative'
            });
            jQuery(".iframewrap_crs_fav").prepend('<div class="ifram_cls_btn close favClose"><span><img src="../images/closebtn.png"></span></div>');
            if (file_Type === 'mp4' || file_Type === 'mp3' || file_Type === 'mov') {
				if(isDevice() && isPhoneGap()){
                    if( /Android/i.test(navigator.userAgent) && file_Type === 'mp4') {
                    
                      jQuery("#showlistFav").hide();
                      jQuery('<div class="AndroidVideo favAndroidVideo"> <img src="../images/android_landscape.png" ></div>').appendTo(jQuery("#displayContentFav"));
                      jQuery('<div class="shelfholder_mb_lt" style="visibility:hidden;"></div>').appendTo(jQuery("#displayContentFav"));
                      self.AndroidVideoURl = favItemsData.fileURL;
                      self.footerIcons(true);
                      return false;
                    }
				}
                var videoType = (file_Type === 'mp4' || file_Type === 'mov') ? "video/mp4" : "audio/mp3";
				if($('html').hasClass('ie8')){
								var videoElHtml = '<object width="60%" height="100%" type="video/x-ms-asf" url='+ filePath +' data="clipcanvas_14348_offline.mp4"';
                                videoElHtml+= 'classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6"><param name="url" value='+ filePath +'>';
                                videoElHtml+= '<param name="filename" value='+ filePath +'><param name="autostart" value="1"><param name="uiMode" value="full">';
                                videoElHtml+= '<param name="autosize" value="1"><param name="playcount" value="1"> <embed type="application/x-mplayer2" src='+ favItemsData.fileURL  +' width="100%" height="100%" autostart="true" showcontrols="true"  pluginspage="http://www.microsoft.com/Windows/MediaPlayer/"></embed>';
							   jQuery(videoElHtml).appendTo(jQuery("#displayContentFav"));
				}else{
					//jQuery('<video width="100%" height="100%" controls autoplay></video>').append('<source src="' + favItemsData.fileURL + '" type="' + videoType + '" />').appendTo(jQuery("#displayContentFav"));
					jQuery("#displayContentFav").append('<video id="activityVideoFav" width="100%" height="100%" controls><source src="' + favItemsData.fileURL + '" type="' + videoType + '" /></video>');// change for ie9 browsers
                                                                      
                      if( isDevice() && isPhoneGap() ){
                          if( parseInt(device.version) > 7 ){
                              jQuery("#displayContentFav").addClass("content-ipadView");
                              
                              jQuery(".content-ipadView").on('swipeleft', function(){  })
                              .on('swiperight', function(){ })
                              .on('swipeup', function(){ jQuery("body").scrollTop(0); })
                              .on('swipedown', function(){ jQuery("body").scrollTop(500); });
                          }
                      }
					
					// To control play or pause button in video tag.
					videoContrl = document.getElementById('activityVideoFav');
					if ( videoContrl.paused ) {
						videoContrl.play();
					} else {
						videoContrl.pause();
					}
					videoContrl.play();
					
					// To hide ios keyboard while clicking play, pause and fullscreen icon.
					function onVideoBeginsFullScreen () {
						document.querySelector('textarea#note').blur();
						$('textarea#note').blur();
					}
					videoContrl.ontouchstart = function () {
						onVideoBeginsFullScreen();
					};
					$('#activityVideoFav, #activityVideoFav div, #activityVideoFav button').click(function (event) {
						onVideoBeginsFullScreen();
					});

					if((navigator.userAgent.indexOf("Safari") > -1)) {
						jQuery('#activityVideoFav')[0].play();
						videoContrlSafari = jQuery('#activityVideoFav')[0];
						videoContrlSafari.ontouchstart = function () {
							onVideoBeginsFullScreen();
						};
					}
				}
                jQuery(".commentNotes").show();
                jQuery('#load_wrapper').hide();
                self.footerIcons(true);
				jQuery("#displayContentFav").css("height",self.checkDevice());
                videoTapped(1,self.video_tapped);
            }
            else if(file_Type === 'doc'){
                if (isDevice() && pageno !== 0) {
                    iFrameHight = pageno * 819 + 'px';
                }
                jQuery('<iframe/>', {
                    name: 'resrcContent-iframe',
                    id: 'resourceContentFav-iframe',
                    src: favItemsData.fileURL
                }).appendTo(jQuery("#displayContentFav"));
                jQuery("#resourceContentFav-iframe").load(function() {
                    jQuery('#load_wrapper').hide();
                    jQuery(this).show();
					/* Ipad pdf download open in new tab issue fix */
					if( !isDevice() && !isPhoneGap() ){
                             var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                             if( browserName[1] == "Safari"){
                               jQuery("#resourceContentFav-iframe").contents().find("#download").attr('data-safari','true');
                             }
                    }
					
					 jQuery("#load_wrapper, .overlaycontainer").hide();
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
							   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").on("click",function(){
										  jQuery(".ifram_cls_btn").trigger("click");
								});
							   }else{
								   jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").on("click",function(){
											  jQuery(".ifram_cls_btn").trigger("click");
									});
							   }
								
							}
							
						if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										var scormObject = jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
									}else{
										var scormObject = jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
									}
							if(scormObject != 0){
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
								jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
								else{
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
								}
							}
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#resourceContentFav-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContentFav-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
						   }else{
							jQuery("#resourceContentFav-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContentFav-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
							
						   }	
							
									
                });
                jQuery(".showcontent").addClass("QUIZshowcontent");
            }
            else if( file_Type !== "gif" ){

                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.pdfurl = favItemsData.fileURL;
                } else {
                     $.jStorage.set("pdfurl", favItemsData.fileURL);
                }
                if( !isiOS() && !isAndroid() ){
                 jQuery(".commentmodal-backdrop").show();
                }
				if(!this.returnIeVersion()){
					if($('html').hasClass('ie9')){
							jQuery(".commentmodal,.commentmodal-backdrop,.loading_icon").hide();
						}
					jQuery('<iframe/>', {
						name: 'resrcContent-iframe',
						id: 'resourceContentFav-iframe',
						src: 'pdfview.html'
					}).appendTo(jQuery("#displayContentFav"));
                    self.footerIcons(true);
				}else{//ie8 contents
					jQuery(".commentmodal,.commentmodal-backdrop").hide();
					 PluginDetect.getVersion(".");   // find Adobe reader exist or not.
				     var version = PluginDetect.getVersion("AdobeReader");
					if(version != null){
						jQuery("#displayContentFav").append('<iframe id="courseContent-iframe" name="courseContent-iframe" width="800px" height="600px" src='+self.takePdfUrl+'> </iframe>');
					}else{
						jQuery("#displayContentFav").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+self.takePdfUrl+">download PDF</a>");
					}
				}
				if ( ie11 && win7 ) {
					if(file_Type === 'pdf' ){
						jQuery(".commentmodal,.commentmodal-backdrop").hide();
						jQuery("#displayContentFav").find('iframe').remove();
						PluginDetect.getVersion(".");   // find Adobe reader exist or not.
						var version = PluginDetect.getVersion("AdobeReader");
						
						if(version != null){
							jQuery("#displayContentFav").append('<iframe id="courseContent-iframe" name="courseContent-iframe" width="800px" height="600px" src='+self.takePdfUrl+'> </iframe>');
						} else {
							jQuery("#displayContentFav").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+self.takePdfUrl+">download PDF</a>");
						}
					}
				}
                jQuery(".commentNotes").show();
                jQuery(".showcontent").addClass("QUIZshowcontent");
                jQuery("#resourceContentFav-iframe").load(function() {
                    jQuery('#load_wrapper').show();
                    jQuery(this).show();
					
					  jQuery("#load_wrapper, .overlaycontainer").hide();
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
							   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").on("click",function(){
										  jQuery(".ifram_cls_btn").trigger("click");
								});
							   }else{
								   jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").on("click",function(){
											  jQuery(".ifram_cls_btn").trigger("click");
									});
							   }
								
							}
						
                     /* Ipad pdf download open in new tab issue fix */
					if( !isDevice() && !isPhoneGap() ){
                             var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                             if( browserName[1] == "Safari"){
                               jQuery("#resourceContentFav-iframe").contents().find("#download").attr('data-safari','true');
                             }
                    }
					
                    var serviceUrl = self.globalConfig.apiAddress.service, data='',
					 	 token;
                         if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                token = JSON.parse(window.localStorage.getItem("USER")).token;
                            } else {
                                token = JSON.parse($.jStorage.get("USER")).token;
                            }
					 	 data = {
								 //cid: self.courseID,
								 coursemoduleid: self.modID,
								 action:'get_course_pdf_bookmarks',
								 //uid: self.userID,
								 token: token
								}
					 	 self.ajaxServerReq(serviceUrl,data,function(resp){
							if( resp != undefined ){
							  if( resp.response != undefined ){
							    self.BookMarkedPages = resp.response.bookmarks;
                                var currentPageNo = jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('value');
                                  jQuery.each(self.BookMarkedPages, function(i, val){
                                       if( currentPageNo == val.pageno ){
                                         jQuery("#resourceContentFav-iframe").contents().find("#viewBookmarkLocale").removeClass('bookmark').addClass('bookmarked').attr('data-bookmarked','true');
                                         jQuery('#load_wrapper').hide();
                                       }
                                  });
                                }else{
                                 self.BookMarkedPages=[];
                                }
                             }else{
                              self.BookMarkedPages=[];
                             }
						 });
						 jQuery("#resourceContentFav-iframe").contents().find("#presentationMode").off().on('click',function(){
						   window.open("pdfview.html");
						 });
						 var previousPageID='', currentPageID='';
						 /* Added for Bookmarks thambnail filters*/
						 jQuery("#resourceContentFav-iframe").contents().find("#viewAttachments").prop("disabled", false);
						 jQuery("#resourceContentFav-iframe").contents().find("#sidebarToggle").off().on('click',function(){
							jQuery("#resourceContentFav-iframe").contents().find("#viewAttachments,#viewOutline").prop("disabled", false);
                            var pageCount=1;
                            jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
							jQuery("#resourceContentFav-iframe").contents().find(".thumbnailSelectionRing").each(function(){
							  jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
							});
                            if( self.BookMarkedPages != undefined ){
                              jQuery.each(self.BookMarkedPages, function(i, val){
                                 if( val.bookMarked== undefined ){
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                 }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                 }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                 }
                              });
                            }
						});
						jQuery("#resourceContentFav-iframe").contents().find("#viewAttachments").off().on('click',function(){
							jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").removeClass("hidden");
							jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
										  if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
                                              jQuery(this).hide();
                                              jQuery(this).find("#ribbon").hide();
										  }
								});

						});
						jQuery("#resourceContentFav-iframe").contents().find("#viewOutline").off().on('click', function(){
                            jQuery("#resourceContentFav-iframe").contents().find(".outlineItem").remove();
                            jQuery("#resourceContentFav-iframe").contents().find(".thumbnail").each(function(index){
                                jQuery("#resourceContentFav-iframe").contents().find("#outlineView").append('<div class="outlineItem"><a href="#page=' +(index+1)+ '">Slide Number ' +(index+1)+ '</a></div>');
                            });
                        });
						jQuery("#resourceContentFav-iframe").contents().find("#viewThumbnail").off().on('click',function(){
							jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
										  if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
														   jQuery(this).show();jQuery(this).find("#ribbon").hide();
										  }
								});
						});
						/* End of Bookmarks thambnail filters*/

						jQuery("#resourceContentFav-iframe").contents().find("#viewBookmarkLocale").off().on('click',function(){
						  var serviceUrl = self.globalConfig.apiAddress.service,
						      data = '',
						      currentPageID = jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('value'),
						      serviceAction = '', token;
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
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("notbookmarked").addClass("bookmarked").show();
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailContainer"+currentPageID+"").show();
                                  self.BookMarkedPages.push({
                                                            "pageno":""+currentPageID+"",
                                                            "bookMarked":"true"
                                                           });
                              }else if( jQuery(this).attr('data-bookmarked') == "true" ) {
                                  pageID = currentPageID;
                                  serviceAction = 'delete_course_pdf_bookmark';
                                  jQuery(this).addClass('bookmark').removeClass('bookmarked');
                                  jQuery(this).attr('data-bookmarked','false');
                                  jQuery("#resourceContentFav-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("bookmarked").addClass("notbookmarked").hide();
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
                                     jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                     }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                     jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                     }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                     jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                     }
                                });
                             }
                             self.ajaxServerReq(serviceUrl,data,function(resp){ });
				        });

                        var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                         if( browserName[1] == "Safari"){
                           jQuery("#resourceContentFav-iframe").contents().find("#download").attr('data-safari','true');
                         }
                        jQuery('#load_wrapper').show();
                        var startPageCount=setInterval(function (){
                                                    if( jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('max') != undefined ){
                                                        if( jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('max')  == jQuery("#resourceContentFav-iframe").contents().find("#viewer .page").length ){
                                                          jQuery(".commentmodal-backdrop").hide();
                                                          jQuery('#load_wrapper').hide();
                                                          clearInterval(startPageCount);
                                                        }
                                                    }
                                                    },5000);

                          var thumbnailView=setInterval(function (){
                                if( jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('max') == jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView .thumbnailSelectionRing").length){
                                    var currentPageNo = jQuery("#resourceContentFav-iframe").contents().find("#pageNumber").attr('value');
                                    var pageCount=1;
                                    jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
                                    jQuery("#resourceContentFav-iframe").contents().find(".thumbnailSelectionRing").each(function(){
                                        jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
                                    });
                                    if( self.BookMarkedPages != undefined ){
                                      jQuery.each(self.BookMarkedPages, function(i, val){
                                        if( val.bookMarked== undefined ){
                                        jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                        }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                        jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                        }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                        jQuery("#resourceContentFav-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                        }
                                        });
                                    }
                                    clearInterval(thumbnailView);
                                }
                            },1000);
							
							if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										var scormObject = jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
									}else{
										var scormObject = jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
									}
							if(scormObject != 0){
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
								jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
								else{
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
								}
							}
							if(file_Type != "pdf"){
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									jQuery("#resourceContentFav-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
									jQuery("#resourceContentFav-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
									$(window).trigger('resize');
									jQuery("#resourceContentFav-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
								   }else{
									jQuery("#resourceContentFav-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
									$(window).trigger('resize');
									jQuery("#resourceContentFav-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
								   }	
							}
							if( file_Type == "scorm" ){		
								setTimeout(function(){ 
								  jQuery("#resourceContentFav-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
									$(window).trigger('resize');
								},1000); 
							}	
							if(file_Type == "pdf"){
								 jQuery("#resourceContentFav-iframe").css('width','96%').css('margin-right','0px').css('margin-left','0px');
							}		
                });


				 if(file_Type == "pdf"){
					/** PDF full page display */
					jQuery("#resourceContentFav-iframe").css('width','96%').css('margin-right','0px').css('margin-left','0px');
					jQuery("#displayContentFav").css("height","1363px");
					jQuery("#load_wrapper").css("display","block");
					var intval=setInterval(function(){
									if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
										var pageHeight = jQuery("#resourceContentFav-iframe").find(".textLayer").height();
									}else{
										var pageHeight = jQuery("#resourceContentFav-iframe").contents().find(".textLayer").height();
									}
									var orgHeight = (pageHeight)+52;
									if(pageHeight){
											jQuery("#displayContentFav").css("height",orgHeight+"px");
											if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
												jQuery("#resourceContentFav-iframe").find("#viewerContainer").scrollTop(0);
											}else{
												jQuery("#resourceContentFav-iframe").contents().find("#viewerContainer").scrollTop(0);
											}
											jQuery("#resourceContentFav-iframe").css('width','96%').css('margin-right','0px').css('margin-left','0px');
											clearInterval(intval);
									}	
									
					},2000);
				
				}
            }
        },
		checkDevice: function(){
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" ){
              return "200px";
            }else{
              return "500px";
            }
        },
        ajaxServerReq:function(serviceUrl,data,succ,fail){
			jQuery.ajax({
				url: serviceUrl,
				data: data,
				crossDomain: true,
                type : 'POST',
                cache : false,
                dataType : 'json',
                async: false,
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
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var userDetails;
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
            if( !isDevice() ){
                jQuery.ajax({
                    url: serviceUrl,
                    data: data,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'json',
                    async: false,
                    cache: false,
                    success: function(res) {
                       if(!$('html').hasClass('ie8')){
                           if( res.response[0] != undefined ){
                             self.serverComments = res.response[0].comment;
                             jQuery('#note').val(''+res.response[0].comment+'');
                             jQuery(".commentform-control").val('' +res.response[0].comment+ '');
                           }else{
							   self.serverComments = "";
                               jQuery('#note').val('');
                               jQuery(".commentform-control").val('');
                           }
                        }else {
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
                    }
                });
               }else if( isDevice() ){
            	data.uid=userDetails.id;
                data.cid=self.courseID;
            	cordova.exec(
            			function (result) {
            				var res = JSON.parse(result);
            				if( res && res.response.length > 0){
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
            if( !isDevice() ){
                jQuery.ajax({
                    url: serviceUrl,
                    data: data,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'json',
                    async: false,
                    cache: false,
                    success: function(res) {
                        /* Storing in Offline Storage */
                       // self.offlineStorage.insertCourseItems(courseId, JSON.stringify(res));
					   jQuery(".notesicon#notesFav").removeClass('dsbl');
                    },
                    error: function ( jqXHR, textStatus, errorThrown ){
                    //    self.offlineStorage.getCourseItems(courseId);
                    }
                });
            }else if( isDevice() ){
              data.uid=userDetails.id;
              data.cid=self.courseID;
              cordova.exec(
                           function (result) {
							jQuery(".notesicon#notesFav").removeClass('dsbl');
                           },
                           function (result) {
                           },'OfflineServicePlugin', 'insert_replace_course_resource_comment', [data]);
            }
		},
        footerIcons: function(notes){
          if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid())){
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
        loadquizinWeb: function(srcURL, quizTitle, Filetype) {
			var breadFourTitle;
		    var CCbreadCrumb = jQuery.trim(quizTitle.substr(0,3));
			if((CCbreadCrumb == "CC:"))
			{
			breadFourTitle = quizTitle.substr(3);
			}
			else if((CCbreadCrumb == "CC1") ||(CCbreadCrumb == "CC2"))
			{
			breadFourTitle = quizTitle.substr(4);
			}
			else
			{
			breadFourTitle = quizTitle;
			}
		/*
			if(CCbreadCrumb =="CC:"){
			CCbreadCrumb = "CC";}
			else if((CCbreadCrumb =="CC1")){
			CCbreadCrumb = "CC1";}
			else if((CCbreadCrumb =="CC2")){
			CCbreadCrumb = "CC2";}
			else{
			CCbreadCrumb = "quiz"; }
		    console.info("CCbreadCrumb  :: "+CCbreadCrumb);
			*/
      //     var breadFourTitle = (CCbreadCrumb != 'CC:' ? quizTitle:quizTitle.substr(3));
			//console.log("breadFourTitle:::  "+breadFourTitle);
			if(CCbreadCrumb =="CC:"){
            jQuery('#favbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread').addClass('favhdnk '+(CCbreadCrumb == "CC:" ? "CC" : "quiz")).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC:" ? "CC" : "quiz")+'></a>');
			}
			else if((CCbreadCrumb =="CC1")){
			jQuery('#favbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread').addClass('favhdnk '+(CCbreadCrumb == "CC1" ? "CC1" : "quiz")).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC1" ? "CC1" : "quiz")+'></a>');
			}
			else if((CCbreadCrumb =="CC2")){
			jQuery('#favbred li:nth-child(3)').removeClass('Document video audio CC quiz noSlashBread').addClass('favhdnk '+(CCbreadCrumb == "CC2" ? "CC2" : "quiz")).html('<a href="javascript:void(0);" data-msg='+(CCbreadCrumb == "CC2" ? "CC2" : "quiz")+'></a>');
			}

            jQuery('#favbred li:nth-child(4)').show();
            jQuery('#favbred li:nth-child(4)').html(breadFourTitle);
            loadAllLanguages();
            var iFrameHight ='100%';
            jQuery("#displayContentFav").empty().show();
            jQuery("#displayContentFav").css({
                position : 'relative'
            });
            jQuery(".iframewrap_crs_fav").prepend('<div class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 window.localStorage.pdfurl = srcURL;
                } else {
                    $.jStorage.set("pdfurl", srcURL);
                }
				jQuery('<iframe/>', {
					name: 'resrcContent-iframe',
					id: 'resourceContentFav-iframe',
					src: srcURL
				}).appendTo(jQuery("#displayContentFav"));
                if( Filetype == "scorm" ){
                  $('body').addClass("scormPage");
                  $('.scormPage #container #displayContentFav').css('height',$(window).height());
                }
                if( Filetype == 'quiz'){
                  $('body').addClass("quiz-main-container fav-quiz-main-container");
                }
                                                                      
                  if( Filetype == 'puzzle' ){
                     $('body').addClass("quiz-main-container fav-quiz-main-container crosswordwrap");
                     var loaderDisplay=setInterval(function (){
                                                if( jQuery("#load_wrapper").css('display') == "block" ){
                                                  jQuery("#load_wrapper, .overlaycontainer").hide();
                                                  clearInterval(loaderDisplay);
                                                }
                                        },1000);
                  }
            jQuery("#resourceContentFav-iframe").load(function() {
               jQuery("#load_wrapper, .overlaycontainer").show();
                jQuery(this).show();
				if(Filetype === 'quiz'){
						    // removed width condition 
							jQuery(this).attr('scrolling','no');
							
							var browserVersion = ($.browser.msie && parseInt($.browser.version, 10) === 7) || ($.browser.msie && parseInt($.browser.version, 10) === 8);
							if ( browserVersion ) {
								jQuery("#resourceContentFav-iframe").contents().find(".submitbtns span.ui-btn-corner-all, .quizattempt span.ui-btn-corner-all, .gameattempt span.ui-btn-corner-all, .continuebutton  span.ui-btn-corner-all").css('filter','progid:DXImageTransform.Microsoft.gradient( startColorstr="#ffffff", endColorstr="#c2c2c2",GradientType=0 ); /* IE6-8 */;');
							}
							
						    jQuery("#load_wrapper, .overlaycontainer").show();
						     // QUIZ full screen for Browser
						if( !$('html').hasClass('ie8') && !$('html').hasClass('ie9')) {
							 jQuery("#resourceContentFav-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
                                var length = jQuery("#resourceContentFav-iframe").contents().find(".ui-btn-hidden").length;
								if (length == 1) {
									jQuery("body").addClass("overlay-video-quiz");
								}
                                var height, closeOverlayIcon;

                                if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									height = jQuery("#resourceContentFav-iframe").find('body').height();
								}else{
									height = jQuery("#resourceContentFav-iframe").contents().find('body').height();
								}
								if(height){
									jQuery("#resourceContentFav-iframe").css('height',height);
								}

                                setTimeout(function(){
                                    if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
                                        closeOverlayIcon = jQuery("#resourceContentFav-iframe").find('body').hasClass("masked");
                                    } else {
                                        closeOverlayIcon = jQuery("#resourceContentFav-iframe").contents().find('body').hasClass("masked");
                                    }
                                    if (closeOverlayIcon) {
                                        jQuery("body").removeClass("overlay-video-quiz");
                                    }
                                },800);

								jQuery(window).scrollTop(0);
                            });
							$("#resourceContentFav-iframe").contents().find("#okbutton, #cancelbutton, #finishattemptbutton").on('click', function() {
								jQuery("body").removeClass("overlay-video-quiz");
							});
							 jQuery("#resourceContentFav-iframe").contents().find(".ui-link").off().on('click', function(){
								 $(window).trigger('resize');
								 jQuery("#load_wrapper, .overlaycontainer").show();
                                jQuery("body").addClass("overlay-video-quiz");
                                 var quizreviewlength=setInterval(function(){
								
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									
									var height1 = jQuery("#resourceContentFav-iframe").find('.quizreviewsummary').height();
									var height2 = jQuery("#resourceContentFav-iframe").find('.que').height();
									var height3  = jQuery("#resourceContentFav-iframe").find('.submitbtns').height();
									var height4 = jQuery("#resourceContentFav-iframe").find('.outcome').height();
									var height = parseInt(height1 + height2 + height3 + height4);
								}else{
									
									var height1 = jQuery("#resourceContentFav-iframe").contents().find('.quizreviewsummary').height();
									var height2 = jQuery("#resourceContentFav-iframe").contents().find('.que').height();
								     var height4 = jQuery("#resourceContentFav-iframe").contents().find('.outcome').height();
									var height3  = jQuery("#resourceContentFav-iframe").contents().find('.submitbtns').height();
									var height = parseInt(height1 + height2 + height3 + height4);
								}
								if(height){
								
									jQuery("#resourceContentFav-iframe").css('height',(height+200));
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
                                                $('#resourceContentFav-iframe')[0].contentWindow.location.reload(true);
                                                }
                                     }, 1000);
                                    
								}
								 },800); 
                            });
						}
						  	if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var height = jQuery("#resourceContentFav-iframe").find('.mymobilecontent').height();
								jQuery("#resourceContentFav-iframe").find('html').css('background','#fff');	
							}else{
								var height = jQuery("#resourceContentFav-iframe").contents().find('.mymobilecontent').height();
								jQuery("#resourceContentFav-iframe").contents().find('html').css('background','#fff');	
							}
							
							var quizlength=setInterval(function(){
								jQuery("#load_wrapper, .overlaycontainer").show();
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
										var height = jQuery("#resourceContentFav-iframe").find('.mymobilecontent').height();
										jQuery("#resourceContentFav-iframe").find('html').css('background','#fff');								
										jQuery("#resourceContentFav-iframe").find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');
									}else{
										var height = jQuery("#resourceContentFav-iframe").contents().find('.mymobilecontent').height();
										jQuery("#resourceContentFav-iframe").contents().find('html').css('background','#fff');
										jQuery("#resourceContentFav-iframe").contents().find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');									
										
									}
								if(height){
										jQuery("#resourceContentFav-iframe").css('height',(height+100));
										if($(window).height() < height)
											jQuery('.quiz-main-container #displayContentFav').css('height',height);
										else
											jQuery('.quiz-main-container #displayContentFav').css('height',$(window).height());
										
										clearInterval(quizlength);
										jQuery("#load_wrapper, .overlaycontainer").hide();
									} else {
										if( $('html').hasClass('ie8') || $('html').hasClass('ie9') ) {
											
											var height = jQuery("#resourceContentFav-iframe").contents().find('.mymobilecontent').height();
											jQuery("#resourceContentFav-iframe").css('height',height+100);
											
											if( $(window).height() < height ) {
												jQuery('.quiz-main-container #displayContentFav').css('height',height);
											} else {
												jQuery('.quiz-main-container #displayContentFav').css('height',$(window).height());
											}
											clearInterval(quizlength);
											jQuery("#load_wrapper, .overlaycontainer").hide();
										}
                                                       if (height == 0) {
                                                       clearInterval(quizlength);
                                                       jQuery("#load_wrapper, .overlaycontainer").hide();
                                                       }
									}
									
                            },800); 
							
							//jQuery(".quiz-main-container #displayContentFav").getNiceScroll().resize();
							$(window).trigger('resize');
							jQuery(window).scrollTop(0);
				}
				/* Ipad pdf download open in new tab issue fix */
					if( !isDevice() && !isPhoneGap() ){
                             var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                             if( browserName[1] == "Safari"){
                               jQuery("#resourceContentFav-iframe").contents().find("#download").attr('data-safari','true');
                             }
                    }
				 var crossInterval=setInterval(function(){
						   var Dom = jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").length;
						   if(Dom != "0"){
								jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").on("click",function(){
										  jQuery(".ifram_cls_btn").trigger("click");
										  clearInterval(crossInterval);
								});
							}
				},2000);
				
						if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										var scormObject = jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
									}else{
										var scormObject = jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
									}
							if(scormObject != 0){
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
									jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
								else{
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									jQuery("#resourceContentFav-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
								}
							}
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#resourceContentFav-iframe").find('.content-primary').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContentFav-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }else{
							jQuery("#resourceContentFav-iframe").contents().find('.content-primary').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#resourceContentFav-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							$(window).trigger('resize');
							jQuery("#resourceContentFav-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
						   }	
						   jQuery("#load_wrapper, .overlaycontainer").show();	
						setTimeout(function(){ 
							  jQuery("#resourceContentFav-iframe").css('width','94%').css('margin-right','0px').css('margin-left','0px');
                                   jQuery("body").removeClass("overlay-video-quiz");
								$(window).trigger('resize');
								jQuery("#load_wrapper, .overlaycontainer").hide();
							},1000); 
						if( Filetype == "scorm" ){	
								jQuery("#load_wrapper, .overlaycontainer").show();					
							setTimeout(function(){ 
							  jQuery("#resourceContentFav-iframe").css('width','100%').css('margin-right','0px').css('margin-left','0px');
								$(window).trigger('resize');
								jQuery("#load_wrapper, .overlaycontainer").hide();
							},4000); 
						}	
						 
						   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var Dom = jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").length;
						   }else{
							    var Dom = jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").length;
						   }
						   if(Dom != "0"){
							   if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								jQuery("#resourceContentFav-iframe").find("#finishattemptbutton").on("click",function(){
										  jQuery(".ifram_cls_btn").trigger("click");
								});
							   }else{
								   jQuery("#resourceContentFav-iframe").contents().find("#finishattemptbutton").on("click",function(){
											  jQuery(".ifram_cls_btn").trigger("click");
									});
							   }
								
							}
				// Hide header and footer are hide if answerbox is open in crossword.
				if ( Filetype === 'puzzle' ) {
					if( !$('html').hasClass('ie8') && !$('html').hasClass('ie9') ){
						jQuery("#resourceContentFav-iframe").contents().find(".boxnormal_unsel").off().on('click', function(){
							$("#resourceContentFav-iframe").contents().find("input#wordentry").trigger('focus');
						});
						$("#resourceContentFav-iframe").contents().find("input#wordentry").on('focus', function() {
							if( !isAndroid() && isiOS()){
								jQuery(".hme_hdrbx,div.row.menu").hide();
							}
						});
						$("#resourceContentFav-iframe").contents().find("#okbutton, #cancelbutton").on('click', function() {
							var disp = $("#resourceContentFav-iframe").contents().find("#answerbox, #answerbox2").css('display');
							if( !isAndroid() && isiOS() && disp == 'none'){
								jQuery(".hme_hdrbx,div.row.menu").show();
							}
						});
						$("#resourceContentFav-iframe").contents().find("#checkbutton, #finishattemptbutton").on('click', function() {
							if( !isAndroid() && isiOS()){
								jQuery(".hme_hdrbx,div.row.menu").show();
							}
						});
						jQuery("#courseContent-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
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
            jQuery(".showcontent").addClass("QUIZshowcontent");
        },
        loadScorminWeb:function(){
              var db = sqlitePlugin.openDatabase("CliniqueDB.db");
              var manifestXML = window.localStorage.getItem("scormURL");
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
        loadData:function(data,userDetails){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service;
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
	                async: false, 
	                success:function(favresp){
	                    self.favSuccess(favresp);
	                    /* Updating in Offline Storage */
	                    self.offlineStorage.insertComp('FAVORITES', JSON.stringify( favresp ));
	                },
	                error: function (){
	                    self.offlineStorage.getComp('FAVORITES');
	                    setTimeout(function (){
	                        var favOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                            favOfflineData = JSON.parse(localStorage["transferData"]);
	                        }                        
	                        self.favSuccess( favOfflineData );
	                    },1000);
	                }
	            });
			}else if( isDevice() ){
				data.uid=userDetails.id;
				cordova.exec(
						function(result) {
							self.UserDetails = JSON.parse(result);
							self.favSuccess(self.UserDetails);
						},
						function (args) {
							jQuery("#load_wrapper").hide();
							alert("FAIL="+JSON.stringify(args));
						},'OfflineServicePlugin', 'favorite', [data]);
			}
        },
        favSuccess: function (favresp){
            var self = this, content, fileName, fileType, fileUrl, typeName, kellyItems, kellyli, fnameUpload, modID, reslength=-1, courseid='';
             jQuery.each(favresp.response,function(index,value){ reslength++; });
            if( favresp.response.resource_comment_count == 0) {
                jQuery(".notesicon#notesFav").addClass('dsbl');
            }
            for(var p =0; p < reslength; p++){
                content = favresp.response;
                fileName = content[p].file_name;
                if(fileName == null) {
                    jQuery('#load_wrapper').hide();
                } else {
                    kellyItems = jQuery.trim(fileName.substr(0,3));
                }
                modID = content[p].id;
                fileType = content[p].file_type;
                fnameUpload = content[p].fname_upload;
                if ( isDevice() && isPhoneGap() ) {
                   if( isDefined(content[p].module) ){
                    courseid = content[p].module.courseid;
                   }
                }

                if( isDevice() && isPhoneGap() ){
                  fileUrl = content[p].url;
                }else{
                  fileUrl =  (fileType != 'quiz' ? content[p].url:content[p].url.toLowerCase());
                }
                
                typeName = fileName+'.'+fileType;
                if( favresp.response.resource_comment_count == 0) {
                jQuery(".notesicon#notesFav").addClass('dsbl');
                }
               if( kellyItems != "CC:" || kellyItems == "CC:" ){
				    if(kellyItems == "CC1")
					{
					switch(fileType){
                        case "pdf":
							self.takePdfUrl = fileUrl;
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_pdficon">'+fileName.substr(4)+'</span></a></li>';
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "doc":
                        case "epub":
                        case "jpg":
                        case "png":
                        case "gif":
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName.substr(4)+'</span></a></li>';
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "mp4":
                        case "mov":
                            kellyli = '<li data-filetype="video" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-courseID="'+courseid+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName.substr(4)+'</span></a></li>';
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "mp3":
                            kellyli = '<li data-filetype="audio" class="audiosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_audicon">'+fileName.substr(4)+'</span></a></li>';
                            
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "quiz":
                              if( isDevice() && isPhoneGap() ){
                              
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = 'quiz',_fileName=fileName.substr(3);
                                 
                                  
                                  kellyli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                              }else{
                                kellyli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName.substr(3)+'</span></a></li>';
                              }
                            jQuery('#videolistFav').append(kellyli);
                            
                            break;
                            case "scorm":
                              if( isDevice() && isPhoneGap() ){
                               fav_module = content[p].module;
                               typeName = fav_module.modname;
                               fileUrl = fav_module.url;
                               quiz_CourseId = fav_module.courseid;
                               var filetype = '',_fileName;
                               if( isAndroid() && fav_module.modname == "scorm" ){
                                filetype = 'scorm';
                                _fileName=fileName;
                                fileUrl = ""+fav_module.manifest_path+"imsmanifest.xml";
                               }else if( fav_module.modname == "scorm" ){
                                filetype = 'scorm';
                                _fileName=fileName;
                                fileUrl = ""+fav_module.manifest_path+"/imsmanifest.xml";
                                }
								var movli = '<li data-filetype="'+filetype+'" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                              } else {
								 var movli = '<li data-filetype="scorm" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
							  }
                              
                              jQuery('#videolistFav').append(movli);
                          
                          break;
                    }
					}
					else if(kellyItems =="CC2")
					{
					switch(fileType){
                        case "pdf":
							self.takePdfUrl = fileUrl;
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_pdficon">'+fileName.substr(4)+'</span></a></li>';
                            
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "doc":
                        case "epub":
                        case "jpg":
                        case "png":
                        case "gif":
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName.substr(4)+'</span></a></li>';
                           
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "mp4":
                        case "mov":
                            kellyli = '<li data-filetype="video" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-courseID="'+courseid+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName.substr(4)+'</span></a></li>';
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "mp3":
                            kellyli = '<li data-filetype="audio" class="audiosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_audicon">'+fileName.substr(4)+'</span></a></li>';
                            
                            jQuery('#videolistFav').append(kellyli);
                            break;
                        case "quiz":
                              if( isDevice() && isPhoneGap() ){
                                                                      
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = 'quiz',_fileName=fileName.substr(4);
                                  
                                  kellyli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                              }else{
                                kellyli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName.substr(4)+'</span></a></li>';
                              }
                             
                              jQuery('#videolistFav').append(kellyli);
                            break;
                            case "scorm":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = '',_fileName;
                                  if( isAndroid() && fav_module.modname == "scorm" ){
                                   filetype = 'scorm';
                                   _fileName=fileName;
                                   fileUrl = ""+fav_module.manifest_path+"imsmanifest.xml";
                                  }else if( fav_module.modname == "scorm" ){
                                   filetype = 'scorm';
                                   _fileName=fileName;
                                   fileUrl = ""+fav_module.manifest_path+"/imsmanifest.xml";
                                  }
								  var movli = '<li data-filetype="'+filetype+'" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                              } else {
								  var movli = '<li data-filetype="scorm" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
							  }
                              
                              jQuery('#videolistFav').append(movli);
                              
                              break;
                    }
					}
				    else {
                    switch(fileType){
                        case "pdf":
							self.takePdfUrl = fileUrl;
                            var pdfli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_pdficon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(pdfli);
                            break;
                        case "doc":
                            var docli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(docli);
                            break;
                        case "epub":
                            var epubli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(epubli);
                            break;
                        case "jpg":
                            var jpgli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(jpgli);
                            break;
                        case "png":
                            var pngli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(pngli);
                            break;
                        case "gif":
                            var gifli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName+'</span></a></li>';
                            jQuery('#readingmaterialFav').append(gifli);
                            break;
                        case "mp4":
                            var videoli = '<li data-filetype="video" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-courseID="'+courseid+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                            jQuery('#videolistFav').append(videoli);
                            break;
                        case "mov":
                            var movli = '<li data-filetype="video" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                            jQuery('#videolistFav').append(movli);
                            break;
                        case "mp3":
                            var audioli = '<li data-filetype="audio" class="audiosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_audicon">'+fileName+'</span></a></li>';
                            jQuery('#videolistFav').append(audioli);
                            break;
                        case "quiz":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  //var filetype = 'quiz',_fileName=fileName.substr(fileName.indexOf(":")+1);
                                  var filetype = 'quiz',_fileName=fileName;
                              
                                  var quizli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                              
                              }else{
                                var quizli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName+'</span></a></li>';
                             }
                             jQuery('#quizlistFav').append(quizli);
                          break;
                          case "scorm":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = '',_fileName;
                                  if( isAndroid() && fav_module.modname == "scorm" ){
                                   filetype = 'scorm';
                                   _fileName=fileName;
                                   fileUrl = ""+fav_module.manifest_path+"imsmanifest.xml";
                                  }else if( fav_module.modname == "scorm" ){
                                   filetype = 'scorm';
                                   _fileName=fileName;
                                   fileUrl = ""+fav_module.manifest_path+"/imsmanifest.xml";
                                  }
								  var movli = '<li data-filetype="'+filetype+'" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                              } else {
								  var movli = '<li data-filetype="scorm" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
							  }
                          
                          jQuery('#videolistFav').append(movli);
                          
                        break;
                        case "puzzle":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = 'puzzle',_fileName=fileName.substr(fileName.indexOf(":")+1);
                                  
                                  var quizli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                              
                              }else{
                              var quizli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName+'</span></a></li>';
                              }
                              jQuery('#quizlistFav').append(quizli);
                                                                      
                        break;
                    }
					}
                }
                else{
                    switch(fileType){
                        case "pdf":
							self.takePdfUrl = fileUrl;
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_pdficon">'+fileName.substr(3)+'</span></a></li>';
                            jQuery('#audiolistFav').append(kellyli);
                            break;
                        case "doc":
                        case "epub":
                        case "jpg":
                        case "png":
                        case "gif":
                            kellyli = '<li data-filetype="material" class="material favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_lessnicon">'+fileName.substr(3)+'</span></a></li>';
                            jQuery('#audiolistFav').append(kellyli);
                            break;
                        case "mp4":
                        case "mov":
                            kellyli = '<li data-filetype="video" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-courseID="'+courseid+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName.substr(3)+'</span></a></li>';
                            jQuery('#audiolistFav').append(kellyli);
                            break;
                        case "mp3":
                            kellyli = '<li data-filetype="audio" class="audiosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_audicon">'+fileName.substr(3)+'</span></a></li>';
                            jQuery('#audiolistFav').append(kellyli);
                            break;
                        case "quiz":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  //var filetype = 'quiz',_fileName=fileName.substr(fileName.indexOf(":")+1);
                                  var filetype = 'quiz',_fileName=fileName.substr(3);
                                                                      
                                  kellyli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                                                                      
                              }else{
                                kellyli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName.substr(3)+'</span></a></li>';
                             }
                             jQuery('#audiolistFav').append(kellyli);
                        break;
                        case "scorm":
                              if( isDevice() && isPhoneGap() ){
                                  fav_module = content[p].module;
                                  typeName = fav_module.modname;
                                  fileUrl = fav_module.url;
                                  quiz_CourseId = fav_module.courseid;
                                  var filetype = '',_fileName;
                                  if( isAndroid() && fav_module.modname == "scorm" ){
                                      filetype = 'scorm';
                                      _fileName=fileName;
                                      fileUrl = ""+fav_module.manifest_path+"imsmanifest.xml";
                                  }else if( fav_module.modname == "scorm" ){
                                      filetype = 'scorm';
                                      _fileName=fileName;
                                      fileUrl = ""+fav_module.manifest_path+"/imsmanifest.xml";
                                  }
								  var movli = '<li data-filetype="'+filetype+'" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
                              } else {
								  var movli = '<li data-filetype="scorm" class="videosli favoriteslist" type="'+typeName+'" data-filename = "'+fnameUpload+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_moisticon">'+fileName+'</span></a></li>';
							  }
                              
                              jQuery('#videolistFav').append(movli);
                                                                      
                        break;
                        case "puzzle":
                          if( isDevice() && isPhoneGap() ){
                              fav_module = content[p].module;
                              typeName = fav_module.modname;
                              fileUrl = fav_module.url;
                              quiz_CourseId = fav_module.courseid;
                              var filetype = 'puzzle',_fileName=fileName.substr(fileName.indexOf(":")+1);
                              
                              var quizli = '<li data-filetype="'+filetype+'" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'" data-quiz_CourseId="'+quiz_CourseId+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+_fileName+'</span></a></li>';
                          
                          }else{
                              var quizli = '<li data-filetype="quiz" class="quizli favoriteslist" type="'+typeName+'" url="'+fileUrl+'" data-modid="'+modID+'"><a href="javascript:void(0);"><span class="fav_quizicon">'+fileName+'</span></a></li>';
                          }
                          jQuery('#quizlistFav').append(quizli);
                      
                        break;
                    }
                }
            }
            if( !jQuery('#showlistFav #readingmaterialFav').children().length != 0) {
                jQuery(".readingmaterial#rdMtrlFav").addClass('dsbl');
            }
            if( !jQuery('#showlistFav #videolistFav').children().length != 0) {
                jQuery(".videoicon#vidFav").addClass('dsbl');
            }
            if( !jQuery('#showlistFav #quizlistFav').children().length != 0) {
                jQuery(".quizicon#quizFav").addClass('dsbl');
            }
            if( !jQuery('#showlistFav #audiolistFav').children().length != 0) {
                jQuery(".audioicon#audFav").addClass('dsbl');
            }
			 if( !jQuery('#showlistFav #audiolistFav1').children().length != 0) {
                jQuery(".audioicon1#audFav1").addClass('dsbl');
            }
			 if( !jQuery('#showlistFav #audiolistFav2').children().length != 0) {
                jQuery(".audioicon2#audFav2").addClass('dsbl');
            }

        },
        getNotesData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            var userDetails, totalCount;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var element='';
            data = {
                action:'get_course_resource_comments',
                uid:userDetails.id,
                token : userDetails.token
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = resp;//JSON.parse(resp);
                 if( isDevice() && !res.error ){
                    res.error = false;
                 }
                 if(res.error === false && res.response != undefined){
                    jQuery.each(res.response.data, function(i,val){
                        // remove code '&& !val.trim()'
                        if( val.comment != '' && val.comment != null ){
                                
                     		element += '<tr class="rep_wht_course"><td class="fav_chkbx"><input type="checkbox" id="fav_chkbx" class="chkcase" value="' + val.id+ '" data-modId="'+val.coursemoduleid+'" data-arr_Index="' + i+ '" ><label for="chkbx9"></label></td><td class="fav_course">'+val.course_name+'</td><td class="fav_course">'+val.resource_name+'</td><td class="fav_comments">'+val.comment+'</td></tr>';
                        }
          	      });
                }else{
                  element = "<tr class='rep_grey_course'><td colspan='4' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                }
                    jQuery("#tableNoteID tbody").html(element);
                    jQuery("tbody > tr:odd").addClass('fav_grey_course');
                    jQuery("tbody > tr:even").removeClass('fav_grey_course');
                    jQuery("tbody > tr:even").addClass('rep_wht_course');
                        var showCount = 20;
                        if (res.error === false && res.response != undefined) {
                        var   totalCount = Math.ceil(res.response.totalcount  / showCount);
                        var pagination = "<ul class='bootpag'>";
                        if (res.response.totalcount > 20) {
                            for (var i = 1; i <= totalCount; i++) {
                                if (i <= 20) {
                                    if (i == 1) {
                                        pagination += "<li class='activepg' data-page=" + i + "><a href='javascript:void(0);' >" + i + "</a></li>";
									} else {
                                        pagination += "<li data-page=" + i + "><a href='javascript:void(0);' >" + i + "</a></li>";
									}
                                }
                            }
                            pagination += '<li class="arwsymbl" data-page="2" data-move="next"><a href="javascript:void(0);">&raquo;</a></li></ul><div style="width:10%"></div>';
                        } else {
                            pagination = "";
                        }
                    } else {
                        pagination = "";
                        jQuery("#exportdiv").hide();
                    }
                    jQuery(".favpaginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
                    loadAllLanguages();
            });
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
        	 if( !isDevice() ){
				jQuery.ajax({
					url: serviceUrl,
					data: data,
					crossDomain: true,
					type : 'POST',
					cache : false,
					dataType : 'json',
					async: false,					
					success: function(resp) {
						succ(resp);
					},
					error : function(x,y,z){
					   if(fail){
						fail(x,y,z);
					   }
					}
				});
        	 }else{
             	cordova.exec(
             			function(result) {
             				succ(JSON.parse(result));
             			},
             			function(result) {
             				alert("get_course_resource_comments"+JSON.stringify(result));
             			},'OfflineServicePlugin', 'get_course_resource_comments', [data]);
             }
        },
        sessionAjaxReq:function(serviceUrl,data,succ,fail){
          jQuery.ajax({
                      url: serviceUrl,
                      data: data,
                      crossDomain: true,
                      type : 'POST',
                      cache : false,
                      dataType : 'json',
                      async: false,					
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
        checkIfFileExistsFav: function(self, courseItemData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false;
                var fileName = courseItemData.fileName;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        var i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) {  /*check if already exist.*/
                                    courseItemData.fileURL = entries[i].fullPath;
                                    self.loadFileinWeb(courseItemData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
                                self.downloadFileFav(self, courseItemData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFileFav(self, courseItemData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFileFav(self, courseItemData);
                });
            } else {
                self.loadFileinWebFav(courseItemData);
            }
        },
        loadFileinWebFav: function(self,courseItemData) {
            var filePath = courseItemData.fileURL, language, userID, androidData={},emptyCSV=false;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                userID = JSON.parse(window.localStorage.getItem("USER")).id;
            } else {
                language = $.jStorage.get("language");
                userID = JSON.parse($.jStorage.get("USER")).id;
            }
            if( isDevice() && isPhoneGap() ){
              if( self.mod_Ids.length == 0 ){
                    emptyCSV = true;
                    jQuery('.chkcase').each(function(){
                      var index = parseInt(jQuery(this).attr('data-arr_index'));
                      var _modId = jQuery(this).attr('data-modId');
                      self.mod_Ids[index] = _modId;
                    });
              }
            }
            if(isDevice()  && isPhoneGap()){
                if( /Android/i.test(navigator.userAgent) ) {
                  androidData.userID=userID;
                  androidData.filePath = filePath;
                  androidData.userId = userID;
                  androidData.language = ((language == null)?'en_us':language);
                  //console.log("Export Data=="+JSON.stringify(androidData));
                  cordova.exec(
                               function (args) {},
                               function (args) {},
                               'FileOpener', 'openCSVFile', [androidData,self.mod_Ids]);
                 if( emptyCSV ){
                    self.mod_Ids=[];
                 }
                    //window.plugins.fileOpener.open(filePath);
                    return false;
                }
            }
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && isPhoneGap() ){
              cordova.exec(
                           function (args) {},
                           function (args) {},
                           'PDFViewerPlugin', 'openExportFile', [filePath,((language == null)?'en_us':language),self.mod_Ids]);
                                                                      
              if( emptyCSV ){
               self.mod_Ids=[];
              }
              return false;
            }
            //jQuery(this).attr('href', href);
        },
           paginationNotes: function (data, page, lastval, prev) {
             var self = this, serviceUrl = self.globalConfig.apiAddress.service;
             var element;
              pagination = '';
            //console.log("data::: "+JSON.stringify(data));
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = resp;//JSON.parse(resp);
                 if(res.error === false && res.response != undefined){
                  //console.log("val::: "+JSON.stringify(res.response));
                   jQuery.each(res.response.data, function(i,val){
                     		element += '<tr class="rep_wht_course"><td class="fav_chkbx"><input type="checkbox" id="fav_chkbx" class="chkcase" value="' + val.id+ '" data-modId="'+val.coursemoduleid+'" data-arr_Index="' + i+ '"><label for="chkbx9"></label></td><td class="fav_course">'+val.course_name+'</td><td class="fav_course">'+val.resource_name+'</td><td class="fav_comments">'+val.comment+'</td></tr>';
          	  				//jQuery(element).appendTo(jQuery("#tableNoteID"));
                   });
                }else {
                        element = "<tr class='rep_grey_course'><td colspan='4' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                        //jQuery(element).appendTo(jQuery("#tableNoteID"));
                    }
                    jQuery("#tableNoteID tbody").html(element);
                    jQuery("tbody > tr:odd").addClass('fav_grey_course');
                    jQuery("tbody > tr:even").removeClass('fav_grey_course');
                    jQuery("tbody > tr:even").addClass('rep_wht_course');
                    var showCount = 20;
                    if (res.error === false && res.response != undefined) {
                        jQuery("#exportdiv").show();
                        totalCount = Math.ceil(res.response.totalcount / showCount);
                        page_start = page;
                        if (res.response.totalcount > 20) {
                            var i = 0;
                            var pagecount = parseInt(page) + parseInt(20);
                            page_num = parseInt(totalCount) - parseInt(page);
                            if (page_num <= 20 && totalCount >= 20) {
                                page_start = parseInt(totalCount) - parseInt(20);
							}
                            if (totalCount <= 20) {
                                page_start = 1;
							}
                            if (pagecount >= totalCount) {
                                pagecount = totalCount;
							}
                            if (i <= pagecount) {
                                if (page > 1) {
                                    pagination += '<ul class="bootpag"><li class="arwsymbl" data-page=' + prev + ' data-move="prev"><a href="javascript:void(0);">&laquo;</a></li>';
                                } else {
                                    pagination += "<ul class='bootpag'>";
                                }
                                for (var i = page_start; i <= pagecount; i++) {
                                    if (i == page) {
                                        pagination += "<li class='activepg' data-page=" + i + "><a href='javascript:void(0);'>" + i + "</a></li>";
                                    } else {
                                        pagination += "<li data-page=" + i + "><a href='javascript:void(0);' >" + i + "</a></li>";
                                    }
                                }
                            }
                            if (page == totalCount) {
                                pagination += "</ul>";
                            } else {
                                pagination += "<li class='arwsymbl' data-page=" + lastval + " data-move='next'><a href='javascript:void(0);'>&raquo;</a></li></ul>";
                            }
                        } else {
                            pagination = "";
                        }
                    } else {
                        pagination = "";
                        jQuery("#exportdiv").hide();
                    }
                    jQuery(".favpaginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
                    loadAllLanguages();
            });
        },
        downloadFileFav: function(self, courseItemData) {  /*downlad selected file into device*/
            if (isOnline("DontCheck")) {  /*check whether deveice in online*/
                var fileName = courseItemData.fileName+'.csv';
                var downloadFileURL = courseItemData.fileURL;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*create folder into local drive*/
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        var filePath = fileEntry.fullPath + "/" + fileName;
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        // Please wait.Your file will load in a few seconds.
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            if(isDevice()  && isPhoneGap()){
                                if( /Android/i.test(navigator.userAgent) ) {
                                    window.plugins.fileOpener.open(filePath);
                                    return false;
                                }
                            }
                        // self.loadFileinWeb(courseItemData); // load downloaded file into iframe/ video
                        }, function(error) {
                            //console.log("**********download error source " + error.source);
                            //console.log("********download error target " + error.target);
                            //console.log("*********upload error code: " + error.code);
                        });
                    }, self.fileError);
                }, self.fileError);
            } else {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
				
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('.errorCode-pop').show();
				
            }
        },
        fileError: function(evt) {
           //console.log("Error in download : ******** " + JSON.stringify(evt));
        }
    });
    return Clazz.com.components.widget.favorites.js.Favorites;
});
