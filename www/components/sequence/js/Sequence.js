define(["framework/WidgetWithTemplate","courseItem/CourseItem","course/Course","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.sequence.js");
    Clazz.com.components.widget.sequence.js.Sequence = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/sequence/template/sequence.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "sequence",
        localConfig: null,
        globalConfig: null,
        courseWidget:null,
        courseItemWidget: null,
        offlineStorage: null,
        isPopupHidden: null,
        activityName: null,
        topicName: null,
		callType : null,
		tileWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.courseWidget = new Clazz.com.components.widget.course.js.Course();
            this.courseItemWidget = new Clazz.com.components.widget.courseItem.js.CourseItem();
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(dataName, dataModId,topicName, sequenceActivity){
        	var self = this;
        	self.UserDetails={};
			if(dataName){
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem("seq-data-name", dataName);
                } else {
                    $.jStorage.set("seq-data-name", dataName);
                }
                if ($('html').hasClass('ie8')) {
                    this.breadcrumbLast();
                }
				
			}else {
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    dataName = 	window.localStorage.getItem("seq-data-name");
                } else {
                    dataName = 	$.jStorage.get("seq-data-name");
                }
			}
            var seqLocalStrCusId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                seqLocalStrCusId = window.localStorage.getItem('coursemodid');
            } else {
                seqLocalStrCusId = $.jStorage.get('coursemodid');
            }
            self.activityName = dataName;
            self.topicName = topicName;
            self.dataModId = (dataModId!=undefined)?dataModId:seqLocalStrCusId;
            
            if( isDevice() ){
            	
        		self.UserDetails.response = {};
            	self.UserDetails.response = JSON.parse(window.localStorage.getItem("sequenceActivity"));	
        	}
            Clazz.navigationController.push(self);
        },
        postRender : function(element) {
            var self = this;
            //jQuery("section.match-link.tpbreadcrumbs li:eq(2)").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            jQuery("section.match-link.tpbreadcrumbs .sequenceLI").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            loadAllLanguages();
            jQuery("section.match-link.tpbreadcrumbs .activityName").html(self.activityName);
        },
        preRender: function(whereToRender, renderFunction) {
            renderFunction(this.data, whereToRender);
            var BreadcrumElement='', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }                                    
            Handlebars.registerHelper('checkForBreadcrum', function () {
                if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                      BreadcrumElement = '<section class="tpbreadcrumbs match-link"><ul>  \r\n' +
                      '<li class="courshdnk homepagenav"><a href="#" data-msg="Home"></a></li>  \r\n' +
                      '<li class="courshdnk coursepagenav"><a href="#" data-msg="Courses"></a></li>  \r\n' +
                      '<li class="courshdnk topicspagenav sequenceLI"></li><li class="courshdnk topicspagenav sequenceLI activityName"></li></ul><div class="clear"></div></section>';
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
        },
		onResume : function() {
			self.callType = null;
        },
        loadData :function(matchData){
            var self=this,serviceUrl = self.globalConfig.apiAddress.service;		
            if( !isDevice() ){
	            jQuery.ajax({
	                url: serviceUrl,
	                data:matchData,
	                crossDomain: true,
	                type : 'POST',
	                cache : false,
	                dataType : 'json',
	                async: false,
	                success:function(res){
	                    /* Updating in Offline Storage */
	                    self.offlineStorage.insertComp('SEQUENCE', JSON.stringify(res));
	                    self.sequenceSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getComp('SEQUENCE');
	                    setTimeout(function () {
	                        var matchOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                            matchOfflineData = JSON.parse(localStorage["transferData"]);
	                        } else {
	                            //matchOfflineData = JSON.parse($.jStorage.get("transferData"));
	                        } 
	                        self.matchSuccess( matchOfflineData );
	                    },1000);
	                }
	            });
            }else if( isDevice() ){
            	self.sequenceSuccess(self.UserDetails);
            }
        },
        sequenceSuccess : function (res){
            var self = this, iTouch = 'click', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() && coursePrefix == "TL"){
             jQuery(".next_activity,.previous_activity").remove();
            }
            if(res.error){
                $(".no-record").fadeIn('slow');
            }else{
                var quesName, ansArr, crtArr, crtArrOrder = 0, needle, seqdata;
				var combinationObj = {};
                var coursePrefix;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    coursePrefix = window.localStorage.getItem("coursePrefix");
                } else {
                    coursePrefix = $.jStorage.get("coursePrefix");
                }
			/*	if( coursePrefix == "TL"){
				quesName = res.response.heading;
				}else {
               */ 
			   quesName = res.response.questionname;
				var questionName = quesName[0];
				jQuery('#quesname_activity3').html(questionName);
                jQuery('#quesname_activity3').find('img').parent().remove();
              //  }
			 	var stringlen = questionName;
               var countval_quesname = questionName.length;
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
				   jQuery("#quesname_activity3").removeClass("righttalign");
				   jQuery("#quesname_activity3").addClass("leftalign");
				}
				   else
				{
					jQuery("#quesname_activity3").removeClass("leftalign");
				   jQuery("#quesname_activity3").addClass("righttalign");
				}
				
				 /* Start's Text Alignment based on number of lines */
				
				var divheight = $("#quesname_activity3").height(); 
				var lineheight = $("#quesname_activity3").css('line-height').replace("px","");
				var count = Math.round(divheight/parseInt(lineheight));
				if(count >= 3){
					$("#quesname_activity3").removeClass("righttalign");
				}else{
					$("#quesname_activity3").addClass("righttalign");     
				}
				
				/* End of Text Alignment based on number of lines */				
                ansArr = res.response.answertext;
				crtArr = res.response.correctanswer;
				
//				ansArr = $.extend( {},res.response.answertext );
//				crtArr = $.extend( {},res.response.correctanswer );
                $.map( ansArr, function(n, i){
                    combinationObj[n] = crtArr[i];
                });
                /* Shuffling Arrays */
                self.shuffleArray(ansArr);
				/* Setting Questions  */
                /* Setting Answers */
				needle ='pluginfile.php';
                $("section.crswidg_img_small ul li div.cover_disabled").each(function (i){
					if(ansArr[i].indexOf(needle) > -1 || isDevice() ) {
						seqdata = combinationObj[ansArr[i]];
					   $(this).html('<img src="'+ ansArr[i] +'" data-sequence="'+ seqdata +'" data-order="'+ i +'" />');
					} else {						
						seqdata = combinationObj[ansArr[i]];
					   $(this).html('<a data-sequence="'+ seqdata +'" data-order="'+ i +'">'+ ansArr[i] +'</a>');
					}
                });

                $("section.crswidg_img_small li").draggable({
                    revert: "invalid",
                    appendTo:  "body",
                    helper: "clone",
                    cursor: "move",
                    cursorAt: { bottom: 0, left: 0 },
                    start: function( event, ui ) {
						/* Stopping the Closed Draggable Items */
						if(jQuery("div.coverimg:visible", this).length){
							return false;
						}
                    },
                    stop: function( event, ui ) {
                        if(jQuery("div.pro_container > li").length){
                            jQuery("div.pro_container > li").remove();
                        }
                    }
                });
                $("div.crswidg_drgbxtble_container_inner div.crswidg_drgbxtble_small").droppable({
                    accept: "section.crswidg_img_small li:not(.disabled-item)",
                    over: function( event, ui ) {
                    },
                    drop: function( event, ui ) {
						var draggedItem = $(ui.draggable);
						var currDropBox = $(this);
						currDropBox.addClass("dropped-options");
						if(currDropBox.children().length){
							var oldItemInd = currDropBox.children().data("order");
							var oldItemElem = $("section.crswidg_img_small li:eq("+oldItemInd+")");
							if(oldItemElem.length) {
								oldItemElem.removeClass("disabled-item");
							}
						}
						$(this).html($("div.cover_disabled", draggedItem).html());
						draggedItem.addClass("disabled-item");
						currDropBox.css({'padding-left': '0px','padding-right': '0px'});
						if($("div.crswidg_drgbxtble_container_inner div.crswidg_drgbxtble_small").find('img').length == 4) {
						    if(self.validateAnswers(crtArr) === 1) {
								self.showPopup('success');
							} else {
								self.showPopup('wrong');
							}
						}
                    }
                });
                $("div.sequence_congrats_tina .cls_btn").live('click', function (){
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
                    var viewtype;
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        viewtype = window.localStorage.getItem("viewtype");
                    } else {
                        viewtype = $.jStorage.get("viewtype");
                    }
					if(viewtype == 1)  {
						jQuery(".course_ifram_cls_btn").trigger('click');
					} else {
						jQuery('.topicspagenav').click();
					}
                });
                $("body > div.sequence_correct_tina .cls_btn").die('click').live('click', function (){
                    clearTimeout(self.isPopupHidden);
                    jQuery("div.row.menu").removeClass('setBehind');
					
					// Congratulation popup message is display even after click the close icon
					if( self.callType === "success" || self.validateAnswers(crtArr) === 1 ){
	                    $(this).parents("div.crswidg_popup").hide();
	                    $("div.quizmask").hide();
						if(!$("body > div.sequence_congrats_tina").length){
							$('body').append($("div.congrats_tina_holder").html());
						}
						jQuery("div.quizmask:hidden, body > div.sequence_congrats_tina").show();
					}else{
	                    $(this).parents("div.crswidg_popup").hide();
	                    $("div.quizmask").hide();
						self.reloadCurrPage();
					}
                });
                if(isiOS() || isAndroid() ){
                    iTouch = 'touchstart';
                }
                $("div.quizmask").on(iTouch, function (){
                    return false;
                });
                $("div.crswidg_popup span.sucessbtn a").live('click', function (){
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
                    var viewtype;
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        viewtype = window.localStorage.getItem("viewtype");
                    } else {
                        viewtype = $.jStorage.get("viewtype");
                    }                    
					if(viewtype == 1)  {
						jQuery(".course_ifram_cls_btn").trigger('click');
					} else {
						jQuery('.topicspagenav').click();
					}
                });
            }
        },
		reloadCurrPage: function () {
		    //console.log("reloadCurrPage>>>>>>>>>>>>>>>");
			Clazz.navigationController.pop(this);
			this.loadPage();
		},
		validateAnswers : function (crtAnsArr) {
			var selAnsArr = [], seqNum, arrPos, chkFlag = 0, crtAnsArrRound = [];
			$("div.crswidg_drgbxtble_container_inner div.crswidg_drgbxtble_small").children().each(function (i) {
				selAnsArr[i] = seqNum = $(this).data("sequence");
			});
			var myElement = -1;
			var crtAnsArr = crtAnsArr;
			/* Important code */
			for (var i = crtAnsArr.length - 1; i >= 0; i--) {
				if (crtAnsArr[i] == myElement) {
				   crtAnsArr.splice(i, 1);
				}
			}
			selAnsStr = selAnsArr.join("");
			crtAnsStr = crtAnsArr.join("");
			if(selAnsStr === crtAnsStr) {
				return 1;
			} else {
			    return 0;
			}
		},
        shuffleArray: function (o){
            for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        },
        showPopup: function (type){
            var self = this;
            $("div.quizmask:hidden").show();
            $(window).scrollTop(0);
            jQuery("div.row.menu").addClass('setBehind');
            if(!$("body > div.sequence_correct_tina").length){
                $('body').append($("div.correct_tina_holder").html());
            }
            var popupElem = $("body > div.sequence_correct_tina");
            if(type == "success"){
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).show();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).hide();
            }else{
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).hide();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).show();
            }
            self.hidePopup(type);
            popupElem.show();
        },
        hidePopup : function (callType){
			var self = this;
            this.isPopupHidden = setTimeout(function (){
					self.callType = callType;
    	    		$("div.sequence_correct_tina .cls_btn").click();
	        }, 3000);
        },
        bindUI : function(){
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
			$("body > div.correct_tina").remove();
			$("body > div.congrats_tina").remove();
			jQuery("#footer-menu li").removeClass('selected');
            jQuery(".footer_course").addClass('selected');
            jQuery("#header-menu li").removeClass('selected');
            jQuery(".header_course").addClass('selected');
			var coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
			if(coursePrefix =="TL")
			jQuery(".next_activity,.previous_activity").css("display", "block");
			else
			jQuery(".next_activity, .previous_activity").css("display", "none");
			var language, iTouch = 'click';
			if(isAndroid()){
				iTouch = 'touchstart';
			}
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            var self = this;
            var courseId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                courseId = window.localStorage.getItem("selCourseId");
            } else {
                courseId = $.jStorage.get("selCourseId");
            }
            var matchData = {
                action : 'widget',
                widgettype : 'Sequence',
                courseid : courseId,
                modId : self.dataModId
            };
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            self.loadData(matchData);
            /* Breadcrumb Links */
            jQuery('.topicspagenav').on(iTouch, function() {
                var hash = window.location.hash;
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
                var hash = window.location.hash;
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
                if(!jQuery("#course-page").length > 0){
//                    self.courseWidget = new Clazz.com.components.widget.course.js.Course();
//                    self.courseWidget.loadPage();
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
                    } else{
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
            jQuery('div.prorowadj > div.close').on(iTouch, function() {
                if (isAndroid()) {
					jQuery('.topicspagenav').trigger("touchstart");
				} else {
					jQuery('.topicspagenav').click();
				}
            });
			jQuery('section.crswidg_img_small ul li .coverimg').on(iTouch, function() {
				var _this = jQuery(this);
				_this.addClass('spin');
				setTimeout(function(){
					_this.fadeOut(500);
				},900);
            });
			
			$( window ).resize(function() {  
			    if(!$('html').hasClass('ie8') && $("#quesname_activity3").length > 0){
				var divheight = $("#quesname_activity3").height(); 
				var lineheight = $("#quesname_activity3").css('line-height').replace("px","");
				var count = Math.round(divheight/parseInt(lineheight));
				if(count >= 3){
					$("#quesname_activity3").removeClass("righttalign");
				}else{
					$("#quesname_activity3").addClass("righttalign");     
				}
				
				}
			});
        }
    });
    return Clazz.com.components.widget.sequence.js.Sequence;
});
