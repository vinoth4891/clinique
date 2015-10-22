define(["framework/WidgetWithTemplate","abstract/offlineStorage","courseItem/CourseItem"] , function(template) {
    Clazz.createPackage("com.components.widget.course.js");
    Clazz.com.components.widget.course.js.Course = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/course/template/course.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "course",
        localConfig: null,
        globalConfig: null,
        courseItemWidget:null,
        offlineStorage: null,
        tileWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.courseItemWidget = new Clazz.com.components.widget.courseItem.js.CourseItem();
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(data){
            var self=this;
            self.UserDetails={};
            if( data != undefined ){
                self.UserDetails = data;
            }

            Clazz.navigationController.push(self);
        },
        onResume : function (){
            jQuery('#mob_book_shelf,#book_shelf').show();
            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                window.localStorage.removeItem("activeTopic");
            } else {
                $.jStorage.deleteKey("activeTopic");
            }
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
            //renderFunction(this.data, whereToRender);
            var domElement = '',BreadcrumElement='';
			Handlebars.registerHelper('footerContent', function () {
              var footerElement = '<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
				  footerElement += '<li class="selected footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
				  footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
				  footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
              return new Handlebars.SafeString(footerElement);
            });
            Handlebars.registerHelper('checkForBreadcrum', function () {
               if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<div class="tpbreadcrumbs"><ul>  \r\n' +
                                     '<li class="courshdnk course-hme-page" id="home_page"><a href="#" data-msg="Home"></a></li>  \r\n' +
                                     '<li data-msg="Courses"></li></ul><div class="clear"></div></div>';
                                      
                  return new Handlebars.SafeString(BreadcrumElement);
                }
            });
            Handlebars.registerHelper('checkForCourseDom', function () {
              domElement += '<div id = "preview" style="display:none; height: 100%;" >';
              domElement += '<img class="previewImage" src = "" ></div>';
              domElement += '<div  id="book_shelf" class="row bkself coruseThumbList">';
              domElement += '<div class="span2 offset1 single_book">';
              domElement += '<div  class="shelfholder">';
              domElement += '<div id="single_book" class="courses courses1"></div></div></div><div class="clearBoth"></div></div>';
              domElement += '<div id="mob_book_shelf" class="row bkself"></div>';
              
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.removeItem("previewURL");  
                } else {
                    $.jStorage.deleteKey("previewURL");
                }                 
              return new Handlebars.SafeString(domElement);
            });
            renderFunction(this.data, whereToRender);
        },
        loadData :function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.restservice;
			if(this.returnIeVersion()){
				this.ieEightAndIeNine();
			}
                                                                
            if( isDevice()  && self.globalConfig.application.offLine){
                cordova.exec(
                             function(result) {
                                 self.UserDetails = JSON.parse(result);
                                 self.courseSuccess(self.UserDetails);
                             },
                             function(result) {},'LoginPlugin', 'core_enrol_get_users_courses_subcat', [data]);
                                                                
            }else {
	            jQuery.ajax({
	                url: serviceUrl,
	                data:data,
	                crossDomain: true,
	                type : 'POST',
	                cache : false,
	                dataType : 'json',
	                async: false,
	                success:function(res){
	                    /* Storing in Offline Storage */
	                    self.offlineStorage.insertComp('COURSES', JSON.stringify(res));
	                    self.courseSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getComp('COURSES');
	                    setTimeout(function (){
	                        var courseOfflineData = JSON.parse(localStorage["transferData"]);
	                        self.courseSuccess( courseOfflineData );
	                    },1000);
	                }
	            });
			}
        },
        courseSuccess: function (res){
            var self = this;
            if(res.length > 0){
			    var i=0, spanTag = '', classDsbl = '', noOfrepeatedTrackset = '',noOfTrckcnt = '', noOftracks = '', checkEmptyArray = [], ulCnt = '', d ='', y=1, k=1, m=1, j=0, a=0;
                noOfrepeatedTrackset = (res.length > 10)? res.length / 9: 1 ;
                noOfTrckcnt = (res.length > 10)? 9 : res.length;
                noOftracks =  (res.length > 6)? Math.round((res.length-1) / 4) : 2;
                checkEmptyArray = [];
                for(d=14;d<=200;d+=4){ /*//14,18,22,26,30 //23,27,32,36*/
                    checkEmptyArray.push(d);
                }
                if(jQuery.inArray((res.length-1),checkEmptyArray) > -1 || res.length-1 == 23 || res.length-1 == 27 || res.length-1 == 32 || res.length-1 == 36){
                    noOftracks = noOftracks-1;
                }
                if(i==0){
                    spanTag = self.courseArrival(res,i);
                    classDsbl = (jQuery(spanTag).hasClass('ribbon') ? 'dsbl':'');
					 var src = jQuery(res[i].coursepreview).find('img').attr('src');
                    ulCnt  ='<ul class="course_topic"><li class="'+classDsbl+'" id="'+i+'"  data-id="'+res[i].id+'" data-shortname="'+res[i].shortname+'"  data-viewtype="'+res[i].viewtype+'"  data-coursepreview="'+src+'"><a href="#">'+spanTag+''+res[i].summary+'</a></li></ul>';
                    jQuery('#single_book').html(ulCnt);
                }
                if(res.length == 1 && !(/iPhone|iPod|Android/i.test(navigator.userAgent))){
                    self.creatingEmptytracks();
                }
                if(res.length > 1)
                {
                    i=1;
                    for(k = 1; k <= noOftracks; k++){
                        if( k % 2 != 0){
                            var fivetrackParent ='<div class="span10"><div class="shelfholder2"><div class="courses courses2"><ul class="course_topic ulfivetrack'+y+'"></ul></div></div></div>';
                            jQuery('#book_shelf').append(fivetrackParent);
                        } else{
                            var foutrackParent ='<div class="span8 offset4 offmaradj"><div class="shelfholder3"><div class="courses courses3"><ul class="course_topic ulfourtrack'+y+'"></ul></div></div></div>';
                            jQuery('#book_shelf').append(foutrackParent);
                            y++;
                        }
                    }
                    for(m = 1; m <= k; m++){
                        for(j=0;j < noOfTrckcnt; j++){
                            if(i < res.length ){
                                if(j<5){
                                    spanTag = self.courseArrival(res,i);
                                    classDsbl = (jQuery(spanTag).hasClass('ribbon') ? 'dsbl':'');
									 var src = jQuery(res[i].coursepreview).find('img').attr('src');
                                    var fiveTrckli = '<li class="'+classDsbl+'" id="'+i+'"  data-id="'+res[i].id+'"  data-shortname="'+res[i].shortname+'"  data-viewtype="'+res[i].viewtype+'"  data-coursepreview="'+src+'"><a href="JavaScript:void(0);">'+spanTag+''+res[i].summary+'</a></li>';
                                    jQuery(".ulfivetrack"+m).append(fiveTrckli);
                                    i++;
                                }
                                if(j >= 5 && j< noOfTrckcnt){
                                    spanTag = self.courseArrival(res,i);
                                    classDsbl = (jQuery(spanTag).hasClass('ribbon') ? 'dsbl':'');
									 var src = jQuery(res[i].coursepreview).find('img').attr('src');
                                  var fourTrckli = '<li class="'+classDsbl+'" id="'+i+'"  data-id="'+res[i].id+'" data-shortname="'+res[i].shortname+'"  data-viewtype="'+res[i].viewtype+'"  data-coursepreview="'+src+'"><a href="JavaScript:void(0);">'+spanTag+''+res[i].summary+'</a></li>';
                                    jQuery(".ulfourtrack"+m).append(fourTrckli);
                                    i++;
                                }
                            }
                        }
                    }
                }
                for (a=0; a <res.length;a++){
                    var mobleft = '', mobRight = '';
                    spanTag = self.courseArrival(res,a);
                    classDsbl = (jQuery(spanTag).hasClass('ribbon') ? 'dsbl':'');
					var src = jQuery(res[a].coursepreview).find('img').attr('src');
                    if(a%2 == 0){
					    
                        mobleft = '<div class="shelfholder_mb_lt"><div class="courses courses1"><ul class="course_topic"><li class="'+classDsbl+'" id="'+a+'"  data-id="'+res[a].id+'" data-shortname="'+res[a].shortname+'"  data-viewtype="'+res[a].viewtype+'"  data-coursepreview="'+src+'"><a href="#">'+spanTag+''+res[a].summary+'</a></li></ul></div></div>' ;
                        jQuery("#mob_book_shelf").append(mobleft);
                    }
                    else{
					    mobRight = '<div class="shelfholder_mb_rt"><div class="courses courses1"><ul class="course_topic"><li class="'+classDsbl+'" id="'+a+'"  data-id="'+res[a].id+'" data-shortname="'+res[a].shortname+'"  data-viewtype="'+res[a].viewtype+'"  data-coursepreview="'+src+'"><a href="#">'+spanTag+''+res[a].summary+'</a></li></ul></div></div>' ;
                        jQuery("#mob_book_shelf").append(mobRight);
                    }
                }
                jQuery(".course_topic li").die().live('click',function(){
                    if(jQuery(this).find('a span').hasClass('ribbon')){
                        return false;
                    }
                     hideFooter("course");
                     var selCourseId = jQuery(this).data('id');
					 var prefixMode = jQuery(this).data('shortname');
					 var viewtype = jQuery(this).data('viewtype');
					 var previewURL = jQuery(this).data('coursepreview');
                     if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem("viewtype",viewtype);
                        } else {
                            $.jStorage.set("viewtype",viewtype);
                        }
					  if( viewtype == 1 && previewURL == "undefined" ){
                          return false;
                      }
					  var coursePrefix;
					  if(viewtype == 1 ){
					   coursePrefix = "TL";
                      }else{
					   coursePrefix = "Accordion";
                      }
                    
                     jQuery(".previewImage").attr('src',''+previewURL+'');
                     if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.setItem("selCourseId", selCourseId);
                    } else {
                        $.jStorage.set("selCourseId", selCourseId);
                    }
                	 self.show(coursePrefix);
                     jQuery("#footer-menu li").removeClass('selected');
                     jQuery(".footer_course").addClass('selected');
				});
            }
            else{
                self.creatingEmptytracks();
            }
        },
		show :function(coursePrefix){
			var self=this;
            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                window.localStorage.setItem("coursePrefix",coursePrefix);
            } else {
                $.jStorage.set("coursePrefix",coursePrefix);
            }
            
			 if( coursePrefix == "TL"){
				jQuery('#preview').show();
                jQuery('#mob_book_shelf,#book_shelf').hide();
				setTimeout(function(){
                  self.courseItemWidget.loadPage(self.UserDetails);
                  jQuery('#preview').hide();
				}, 3000); 
			}else{
				self.courseItemWidget.loadPage(self.UserDetails);
			}
		},
        enrollUsers: function(data){
            getCourseID=[];
            jQuery.each(data,function(i){
                getCourseID.push(data[i].id);
            })
        },
        courseArrival:function(res,a){
            var spanTag;
            if(res[a].coursearrival == "New"){
                spanTag = '<span class="exclamation">!</span>';
            }
            else if(res[a].coursearrival == "Coming Soon"){
                spanTag = '<span class="ribbon"></span>';
            }
            else{
                spanTag = '<span class="'+res[a].coursearrival+'"></span>';
            }
            return spanTag;
        },
        creatingEmptytracks:function(){
            for(var k = 1; k < 3; k++){
                if( k % 2 != 0){
                    var fivetrackParent ='<div  class="span10"><div class="shelfholder2"><div class="courses courses2"><ul class="course_topic ulfivetrack"></ul></div></div></div>';
                    jQuery('#book_shelf').append(fivetrackParent);
                } else{
                    var foutrackParent ='<div class="span8 offset4 offmaradj"><div  class="shelfholder3"><div class="courses courses3"><ul class="course_topic ulfourtrack"></ul></div></div></div>';
                    jQuery('#book_shelf').append(foutrackParent);
                }
            }
            var mobleftSingle = '';
            mobleftSingle = '<div class="shelfholder_mb_lt"><div class="courses courses1"><ul class="course_topic"><li class="sinle_shelf" id="single_shelf" ><a href="#"></a></li></ul></div></div>' ;
            jQuery("#mob_book_shelf").append(mobleftSingle);
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            var language; 
             var self = this;           
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                window.localStorage.removeItem("activeTopic");
            } else {
                language = $.jStorage.get("language");
                $.jStorage.deleteKey("activeTopic");
            }
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            
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
                cattype:'',
                wstoken:userDetails.token
            };


            if( isDevice() && !isOnline() && !self.globalConfig.application.offLine ) {
                jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                updateLanguage();
                jQuery('.errorCode-pop').show();
            }
            self.loadData(data,self.enrollUsers);
            jQuery("#mob_book_shelf").not(".course_topic li").unbind();
            jQuery("#mob_book_shelf").not(".course_topic li").bind('click', function(){
               hideFooter("course");
            });
            jQuery('li.course-hme-page').on('click',function(){
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_home").addClass('selected');
                var hash = window.location.hash;
                if(hash !== '#home'){
                   Clazz.navigationController.getView('#home');
                   homeCarousel();
                }
            });
            if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                removeOfScroll();
            }
        }
    });
    return Clazz.com.components.widget.course.js.Course;
});
