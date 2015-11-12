define(["framework/WidgetWithTemplate","courseItem/CourseItem","course/Course","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.uncover.js");
    Clazz.com.components.widget.uncover.js.Uncover = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/uncover/template/uncover.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "uncover",
        localConfig: null,
        globalConfig: null,
        courseWidget:null,
        offlineStorage: null,
        isPageOffline: null,
        isPopupHidden: null,
        activityName: null,
        topicName: null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.courseWidget = new Clazz.com.components.widget.course.js.Course();
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(isPageOffline, dataName, topicName,dataModId, uncoverActivity){
        	var self = this;
        	self.UserDetails={};
        	self.offline = isPageOffline;
        	self.activityName = dataName;
        	self.topicName = topicName;
        	self.dataModId = dataModId;
            
            if( isDevice() && self.globalConfig.application.offLine ){
        		self.UserDetails.response = {};
            	self.UserDetails.response = uncoverActivity;	
        	}
            Clazz.navigationController.push(self);
        },
        postRender : function(element) {
            var self = this;
            //jQuery("section.uncover-link.tpbreadcrumbs li:eq(2)").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            jQuery("section.uncover-link.tpbreadcrumbs .uncoverLI").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            loadAllLanguages();
            jQuery("section.uncover-link.tpbreadcrumbs li:eq(3)").html(self.activityName);
        },
        preRender: function(whereToRender, renderFunction) {
          var BreadcrumElement='', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix")
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
          Handlebars.registerHelper('checkForBreadcrum', function () {
            if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                BreadcrumElement = '<section class="tpbreadcrumbs uncover-link"><ul>  \r\n' +
                '<li class="courshdnk homepagenav"><a href="#" data-msg="Home"></a></li>  \r\n' +
                '<li class="courshdnk coursepagenav"><a href="#" data-msg="Courses"></a></li>  \r\n' +
                '<li class="courshdnk topicpagenav uncoverLI"></li><li data-msg="activity1"></li></ul><div class="clear"></div></section>';
                return new Handlebars.SafeString(BreadcrumElement);
            }
          });
                
         if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && (navigator.platform != "iPad Simulator" || navigator.platform != "iPad") && (coursePrefix == "TL" && coursePrefix != "Accordion")){
            jQuery("#footer-menu").find('li').remove();
            jQuery(".next_activity").remove();
            var footerElement ='<li class="footer_Prevactivity"><a href="#"><span class="prevactivityicon"></span><span class="activitymenutxt" data-msg="Prev" ></span></a></li>';
            footerElement +='<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
			footerElement +='<li class="selected footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
            footerElement +='<li class="footer_Nextactivity"><a href="#"><span class="nextactivityicon"></span><span class="activitymenutxt" data-msg="Next"></span></a></li>';
             jQuery(footerElement).appendTo(jQuery("#footer-menu"));
         }
         renderFunction(this.data, whereToRender);
        },
        loadData :function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service, iTouch = 'click';
            correctAns = '';
            questionNumber = '';
            /* Draggable Droppable */
            $("div.crswidg_drgoptns li").draggable({
                revert: "invalid",
                appendTo:  "div.pro_container:last",
                helper: "clone",
                cursor: "crosshair",
                containment: "parent",
                cursorAt: { bottom: 0, left: 0 },
                stop: function( event, ui ) {
                }
            });
            $("div.crswidg_drgbxtble").droppable({
                accept: "div.crswidg_drgoptns li",
                over: function( event, ui ) {
                    $(this).addClass('active');
                },
                drop: function( event, ui ) {
                    var pickedAnswer = $("a", ui.draggable).text();
                    $(this).removeClass('active').css({
                        'cursor':'pointer'
                    });
                    if(pickedAnswer == correctAns){
                        self.showPopup('success');
                        $("section.crswidg_qustns:last li:eq("+questionNumber+")").addClass('nodisp');
                    }else{
                        self.showPopup('wrong');
                    }
                    jQuery("div.pro_container > li.ui-draggable").remove();
                },
                out: function( event, ui ) {
                    $(this).removeClass('active').css({
                        'cursor':'pointer'
                    });
                }
            });
            if( isDevice() && self.globalConfig.application.offLine ){
                                                                  
               self.unCoverSuccess(self.UserDetails);
                                                                  
            }else{
                                                                  
	            jQuery.ajax({
	                url: serviceUrl,
	                data:data,
	                type:'POST',
	                crossDomain:true,
	                dataType:'json',
			        cache:false,
				    async:false,
	                success:function(res){
	                    /* Updating in Offline Storage */
	                    self.offlineStorage.insertComp('UNCOVER', JSON.stringify(res));
	                    self.unCoverSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getComp('UNCOVER');
	                    setTimeout(function (){
	                        var uncoverOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                            uncoverOfflineData = JSON.parse(localStorage["transferData"]);
	                        } else {
	                            //uncoverOfflineData = JSON.parse(localStorage["transferData"]);
	                        }
	                        self.unCoverSuccess( uncoverOfflineData );
	                    },1000);
	                }
	            });
        	}
            if(isiOS()){
                iTouch = 'touchstart';
            }
            $("div.quizmask").on(iTouch, function (){
                return false;
            });
        },
        unCoverSuccess: function (res){
            var self = this, ansArr = [], corrAnsArr = [], iTouch = 'click', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() && coursePrefix == "TL" ){
              jQuery(".next_activity,.previous_activity").remove();
            }
		
            if(res.msg != "No records"){
                /* Applying Background Image Dynamically */
			    jQuery("section.crswidg_qustns").css({
                    'background':'url("'+ res.response.questiontext.hiddenimage +'")',
                    'background-repeat':'no-repeat',
                    'background-size':'100% 100%'
                });
                if(isiOS()){
                    iTouch = 'touchstart';
                }
				jQuery('.hidden-img').hide();
				if ( $.browser.msie && parseInt($.browser.version, 10) > 6 && parseInt($.browser.version, 10) < 10 ) {
				 var html = '<img src="'+res.response.questiontext.hiddenimage+'" border="0" style="width:100%;"/>';
				 jQuery('.hidden-img').append(html);
				   jQuery('.hidden-img').show();
				}
                if(coursePrefix != "TL")
                quesName = res.response.questionname;
                else
                quesName = res.response.tile.heading;
                questionName = quesName;
				jQuery('#quesname_activity2').html(questionName);
				jQuery('#quesname_activity2').find('img').parent().remove();
			    var stringlen = questionName;
			    var countval_quesname = jQuery(questionName).length;
			    var width= jQuery(window).width(); 
				var height= jQuery(window).height(); 
				var noOfCharacter =350;
				if(width < 700 &&  width > 300)
				{
				noOfCharacter = 200;
				}
				if(height < 700 &&  height > 450)
				{
				noOfCharacter = 220;
				}
				if(countval_quesname >=noOfCharacter)
     		   {
				   jQuery("#quesname_activity2").removeClass("righttalign");
				   jQuery("#quesname_activity2").addClass("leftalign");
				}
				   else
				{
					jQuery("#quesname_activity2").removeClass("leftalign");
				   jQuery("#quesname_activity2").addClass("righttalign");
				}
				
				/* Start's Text Alignment based on number of lines */
				
				var divheight = $("#quesname_activity2").height(); 
				var lineheight = $("#quesname_activity2").css('line-height').replace("px","");
				var count = Math.round(divheight/parseInt(lineheight));
				if(count >= 3){
					$("#quesname_activity2").removeClass("righttalign");
				}else{
					$("#quesname_activity2").addClass("righttalign");     
				}
				
				/* End of Text Alignment based on number of lines */
				
                $("section.crswidg_qustns:last li").on(iTouch, function (){
                    if(!$(this).hasClass('nodisp')){
                    	  questionNumber = $("section.crswidg_qustns:last li").index(this);
                          var currQuestionDet = res.response[questionNumber];
                          var questionShower = $("section.crswidg_drgans:last");
                          /* Fetching Correct Answer */
                          ansArr = currQuestionDet.questiontext.answertext;
                          ansArr = jQuery.map(ansArr, function (n, i){
                              return n.replace('\r\n', ' ');
                          });
//                          corrAnsArr = currQuestionDet.questiontext.correctanswer;
                          
                          corrAnsArr = $.extend( {},currQuestionDet.questiontext.correctanswer );
                          
                          $.map( corrAnsArr, function(n, i){
                              if(n == 1) {
                                  correctAns = ansArr[i];
  							}
                          });
  						//console.info("currQuestionDet.questiontext[0]:::  "+currQuestionDet.questiontext[0]);
                          $("h1", questionShower).html(currQuestionDet.questiontext[0]);
  						
  						var answerLen = ansArr.length, questionOptHolder = $("ul a", questionShower);
  						$("ul a", questionShower).each(function (i){
                              $(this).html(ansArr[i]);
                          });
                          $("section.crswidg_qustns:last").hide();
                          questionShower.show();
                    }
                    return false;
                });
            }else{
                $("section.crswidg_qustns").html("");
            }
        },
        shuffleArray: function (o){
            for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        },
        gotoMainQuestion : function (){
            var iTouch = 'click';
            $("section.crswidg_drgans:last").hide();
            $("section.crswidg_qustns:last").show();
            setTimeout(function (){
                if($("section.crswidg_qustns:last li.nodisp").length == 9){
                    if(!$("body > div.congrats_tina").length){
                        $('body').append($("div.congrats_tina_holder").html());
                    }
                    $("div.quizmask").show();
                    jQuery("div.row.menu").addClass('setBehind');
                    $("body > div.congrats_tina").show();

                    if(isiOS()){
                        iTouch = 'touchstart';
                    }
                    $("div.congrats_tina .sucessbtn, div.congrats_tina .cls_btn").off().on(iTouch, function (){
                        clearTimeout(self.isPopupHidden);
                        $("div.quizmask").hide();
                        jQuery("div.row.menu").removeClass('setBehind');
                        $("div.congrats_tina, div.correct_tina").hide();
                        jQuery('.topicpagenav').click();
                    });
                }
            }, 300);
        },
        showPopup: function (type, pickedItem, dropItem){
            var self = this, iTouch = 'click';
            jQuery("div.quizmask").show();
            jQuery("div.row.menu").addClass('setBehind');
            $(window).scrollTop(0);
            if(!$("body > div.correct_tina").length){
                $('body').append($("div.correct_tina_holder").html());
            }
            var popupElem = $("body > div.correct_tina");
            if(type == "success"){
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).show();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).hide();
                $("span.crswidg_lblbx", dropItem).hide();
            }else{
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).hide();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).show();
            }
            popupElem.fadeIn();
            self.isPopupHidden = setTimeout(function (){
				if($('html').hasClass('ie8')){
					$("body > div.correct_tina").hide();
				}
                clearTimeout(self.isPopupHidden);
                $("body > div.correct_tina .cls_btn").parents("div.crswidg_popup").fadeOut();
                $("div.quizmask").hide();
                jQuery("div.row.menu").removeClass('setBehind');
                self.gotoMainQuestion();
            },3000);
            /* Closing the Popups */
            if(isiOS()){
                iTouch = 'touchstart';
            }
            $("body > div.correct_tina .cls_btn").on(iTouch, function (){
			   if($('html').hasClass('ie8')){
					$("body > div.correct_tina").hide();
			   }
                clearTimeout(self.isPopupHidden);
                $(this).parents("div.crswidg_popup").fadeOut();
                $("div.quizmask").hide();
                jQuery("div.row.menu").removeClass('setBehind');
                self.gotoMainQuestion();
            });
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
			
            jQuery("#footer-menu li").removeClass('selected');
            jQuery(".footer_course").addClass('selected');
            jQuery("#header-menu li").removeClass('selected');
            jQuery(".header_course").addClass('selected');
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
			var coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
			if(coursePrefix =="TL")
			jQuery(".next_activity, .previous_activity").css("display", "block");
			else
			jQuery(".next_activity, .previous_activity").css("display", "none");
            var courseId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                courseId = window.localStorage.getItem("selCourseId");
            } else {
                courseId = $.jStorage.get("selCourseId");
            }
            var uncoverdata = {
                action : 'widget',
                widgettype : 'Uncover',
                courseid : courseId,
                modId : self.dataModId
            };
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            self.loadData(uncoverdata);
            /* Breadcrumb Links */
            jQuery('.topicpagenav').on(iTouch, function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
                if(!jQuery("#course-item-page").length > 0){
                      self.courseItemWidget = new Clazz.com.components.widget.courseItem.js.CourseItem();
                      self.courseItemWidget.loadPage();
        	    }else{
                    Clazz.navigationController.getView('#courseItem');
				}
            });
           jQuery('.coursepagenav').on(iTouch, function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
                if(!jQuery("#course-page").length > 0){
                      self.courseWidget = new Clazz.com.components.widget.course.js.Course();
                      self.courseWidget.loadPage();
                    }else{
                    Clazz.navigationController.getView('#course');
                }
            }); 
            jQuery('.homepagenav').on(iTouch, function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                var hash = window.location.hash;
                if (hash !== '#home') {
                    if (!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length) {
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage();
                    } else {
                        Clazz.navigationController.getView('#home');
                        homeCarousel();
                    }
                }
                emptyMedia();
            });
            jQuery(".footer_home").die().live('click', function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                var hash = window.location.hash;
                hideFooter();
                if (hash !== '#home') {
                    if (!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length) {
                     self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                     self.homeWidget.loadPage();
                    } else {
                     Clazz.navigationController.getView('#home');
                     homeCarousel();
                    }
                }
                emptyMedia();
            });
                                                                  
            jQuery(".footer_course").die().live('click', function() {
              var hash = window.location.hash;
              jQuery("#footer-menu li").removeClass('selected');
              jQuery(".footer_course").addClass('selected');
              jQuery('.course_ifram_cls_btn').remove();
              hideFooter("course");
              if (hash !== '#course') {
                  if (!jQuery(".bkself").length) {
                   self.courseWidget = new Clazz.com.components.widget.course.js.Course();
                   self.courseWidget.loadPage();
                  } else {
                   Clazz.navigationController.getView('#course');
                  }
              }
              emptyMedia();
            });
            jQuery('section.crswidg_drgans > div.close').on(iTouch, function() {
                jQuery('section.crswidg_drgans').hide();
                jQuery('section.crswidg_qustns').show();
            });
			jQuery('div.prorowadj > div.close').on(iTouch, function() {
			  jQuery('.topicpagenav').click();
            });
            jQuery('section.crswidg_qustns > div.close').on(iTouch, function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
                if(!jQuery("#course-item-page").length > 0){
                    self.courseItemWidget = new Clazz.com.components.widget.courseItem.js.CourseItem();
                    self.courseItemWidget.loadPage();
				 }else{
                    Clazz.navigationController.getView('#courseItem');
				}
            });
			
            if ($.browser.msie && parseInt($.browser.version, 10) === 7) {
                jQuery(".crswidg_drgoptns").find('.ui-draggable').each(function () {
                    jQuery(this).children().css('background', '#D2D2D4');
                    jQuery(this).children().css(
                        {
                            "background": "#D2D2D4",
                            "padding" : "10px 5px",
                            "display" : "block"
                        }
                    );
                });
            }
			
			/* Start's Text Alignment based on number of lines */
			
			$( window ).resize(function() {  
				if (!$('html').hasClass('ie8')) {
					var divheight = $("#quesname_activity2").height(); 
					var lineheight = $("#quesname_activity2").css('line-height').replace("px","");
					var count = Math.round(divheight/parseInt(lineheight));
					if(count >= 3){
						$("#quesname_activity2").removeClass("righttalign");
					}else{
						$("#quesname_activity2").addClass("righttalign");     
					}
				}
			});
			/* End of Text Alignment based on number of lines */
			
        }
    });
    return Clazz.com.components.widget.uncover.js.Uncover;
});
