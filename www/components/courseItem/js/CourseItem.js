define(["framework/WidgetWithTemplate", "match/Match", "uncover/Uncover","abstract/offlineStorage","sequence/Sequence"], function(template) {
    Clazz.createPackage("com.components.widget.courseItem.js");
    Clazz.com.components.widget.courseItem.js.CourseItem = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/courseItem/template/courseItem.tmp",
        configUrl: "../../components/home/config/config.json",
        name: "courseItem",
        localConfig: null,
        globalConfig: null,
        headerWidget: null,
        footerWidget: null,
        offlineStorage: null,
		takeCurrentPdfUrl:null,
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
		initialize: function(globalConfig) {
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
		preRender: function(whereToRender, renderFunction) {
            var BreadcrumElement='', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
            Handlebars.registerHelper('checkForBreadcrum', function () {
                    BreadcrumElement = '<section class="tpbreadcrumbs course-topics"><ul>  \r\n' +
                    '<li class="courshdnk homepagenav"><a href="#" data-msg="Home"></a></li>  \r\n' +
                    '<li class="courshdnk coursepagenav"><a href="#" data-msg="Courses"></a></li>  \r\n' +
                    '<li data-msg="Topics" class="courshdnk topicspagenav"></li></ul><div class="clear"></div></section>';
                    return new Handlebars.SafeString(BreadcrumElement);
            });

			Handlebars.registerHelper('checkForSpecificDiv', function () {
				 if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()){

                    var domElement = '<div class="accordion acc_holder course-accordion'+(coursePrefix=="TL"?' mobileCourse-accordion':'')+'" id="accordion2"><div class="verticalDemo"><div class="verticalSwipe" id="verticalDemo"></div></div></div>';

				 } else {
					var domElement = '<div class="accordion acc_holder course-accordion" id="accordion2"></div>';
				 }
				return new Handlebars.SafeString(domElement);
			});
            jQuery("#footer-menu li").removeClass('selected');
            jQuery(".footer_course").addClass('selected');

            renderFunction(this.data, whereToRender);
        },

        loadPage: function(data) {
            var self=this;
            self.UserDetails={};
            if( data != undefined ){
                self.UserDetails = data;
            }
            Clazz.navigationController.push(self);
        },
		addDecimal: function(val) {
			val = val.toString();
			if (!val.includes(",")) {
				val = parseFloat(val).toFixed(2);
			}
			return val;
		},
        getWidget:function(response, courseID, modID, widgetName){
        	var widgetDetails='';
        	var selCourseId='';
        	jQuery.each(response,function(index,val){
	  			  if( index >0 ){
	  				if( widgetName == "Uncover"){
	  					selCourseId = val.courseid;
	  				}else{
	  					selCourseId = val.id; 
	  				}
	  			    if( selCourseId == courseID ){
	  			      jQuery.each(val.modules,function(index,val){
	  			         if( val. id == modID ){
	  			        	widgetDetails = $.extend( {},val.widget );
	  			         }   
	  			      });
	  			    }
	  		      }
        	});
        	
        	return widgetDetails;
        },
        getQuizWidget:function(response, courseID, modID){
        	var quizWidgetDetails='';
        	var attempts=[];
        	var questions=[];
        	jQuery.each(response,function(index,val){
	  			  if( index >0 ){
	  			    if( val.id == courseID ){
	  			      jQuery.each(val.modules,function(index,val){
	  			         if( val. id == modID ){
	  			        	quizWidgetDetails = $.extend( {},val.quiz );
	  			        	attempts = quizWidgetDetails.quizlist[0].attempts;
	  			        	questions = quizWidgetDetails.quizlist[1].questions;
	  			        	quizWidgetDetails.quizlist=[];
	  			        	quizWidgetDetails.quizlist.push({
	  			        		"attempts":attempts,
	  			        		"questions":questions
	  			        	})
	  			        	
	  			         }   
	  			      });
	  			    }
	  		      }
        	});
        	
        	return quizWidgetDetails;
        },
        bindUI: function() {
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            currentCtrl = this;
            var language;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            if ($('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
            var activeLang = (language !== undefined && language !== null) ? language : defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            if(navigator.platform == "iPad Simulator" || navigator.platform == "iPad" || navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" )
            {
            jQuery("#save-notes-btn").attr('href','javascript:void(0)');
			jQuery("#cancel-notes-btn").attr('href','javascript:void(0)');
			}
            jQuery("#footer-menu li").removeClass('selected');
            jQuery(".footer_course").addClass('selected');
            var userDetails, courseId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                courseId = window.localStorage.getItem("selCourseId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                courseId = $.jStorage.get("selCourseId");
            }
            var data = {
                wsfunction: "core_course_get_contents",
                moodlewsrestformat: "json",
                courseid: courseId,
                wstoken: userDetails.token
            };
            var iTouch = '';
                                                                        
            if(isiOS()){
             iTouch = 'touchstart';
            }else{
             iTouch = 'click';
            }

            var self = this;
            jQuery('.commentNotes').hide();

            self.loadData(data,userDetails,self.enrollUsers);

			if(isiOS()){
				function accordionHeight() {
					var headingLength = $('div.accordion-heading').length;
					var headingHeight = $('div.accordion-heading:first').outerHeight();
					var minHeight = headingLength*headingHeight;
					var collapseId = $('div.accordion-heading:first a').attr("href");
					if($(collapseId + '.in').length){
						setTimeout(function(){
						   var inHeight = $(collapseId + '.in').outerHeight();
						   minHeight += inHeight;
						   jQuery(".widget-maincontent-div > .courseicon + .pro_container").css("min-height",minHeight);
						},300);
					} else {
						jQuery(".widget-maincontent-div > .courseicon + .pro_container").css("min-height",minHeight);
					}
				}
				setTimeout(function(){
					accordionHeight();
				}, 1000);
			}
            jQuery('.homepagenav').on('click', function() {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
				jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_home").addClass('selected');
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
            jQuery('.coursepagenav').on('click', function() {
                var hash = window.location.hash;
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_course").addClass('selected');
                jQuery('.course_ifram_cls_btn').remove();
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

            jQuery(".footer_comment").die().live('click', function() {
                currentCtrl.loadResourceComment();
                jQuery(".commentmodal,.commentmodal-backdrop").show();
            });
            jQuery(".commentSavebtn").off().on('click', function(){
                currentCtrl.saveNotes(".commentform-control");
                jQuery(".commentmodal,.commentmodal-backdrop").hide();
                jQuery(".commentform-control").blur();
            });
            jQuery(".commentCancelbtn").off().on('click', function(){
                jQuery(".commentmodal,.commentmodal-backdrop").hide();
                jQuery(".commentform-control").blur();
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
            jQuery(".AndroidVideo").die().live('click', function() {
               cordova.exec(
                            function (args) {},
                            function (args) {},
                            'FileOpener', 'openVideoFile', [self.AndroidVideoURl]);
            });
            /* Quiz video opening in player */
            jQuery(".AndroidQuizVideo").die().live('click', function() {
            	var url = jQuery(this).data('url')
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'FileOpener', 'openVideoFile', [url]);
             });

            jQuery(".topicspagenav").die().live('click', function() {
				if ($('html').hasClass('ie8')) {
					$('#content-webview, object, embed').empty();
				}
                $('body').removeClass("quiz-main-container course-quiz-main-container");
                $('body').removeClass("crosswordwrap");
                jQuery("#content-webview").removeClass("content-ipadView");
                if( isDevice() && isPhoneGap() ){
				  scormUpdate(currentCtrl.userID, currentCtrl.quizCourseId, currentCtrl.modID);
                  //currentCtrl.updateCompletedModules( currentCtrl, currentCtrl.userID, currentCtrl.quizCourseId, currentCtrl.modID );
                }
                videoTapped(0,currentCtrl.video_tapped);
                currentCtrl.footerIcons();
                currentCtrl.reloadCourseItems();
            });
			 jQuery(".next_activity,.footer_Nextactivity").die().live('click', function() {

			    var sequenceItem, coursePrefix, parentID='', sequenceID='';
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    sequenceItem = JSON.parse(window.localStorage.getItem("sequenceItem"));
                    coursePrefix = window.localStorage.getItem("coursePrefix");
                } else {
                    sequenceItem = JSON.parse($.jStorage.get("sequenceItem"));
                    coursePrefix = $.jStorage.get("coursePrefix");
                }
				currentCtrl.next_activity=true;
                currentCtrl.previous_activity=false;
                hideFooter("course");
                if( coursePrefix == "TL"  && !self.nextSequenceEND){
                    jQuery(".parent"+sequenceItem.parentID+"").find(".sequence"+sequenceItem.rowID+"").trigger('click');
			    }else{
                	jQuery('.topicspagenav').click();
                }
                jQuery(this).remove();
             });
			  jQuery(".previous_activity,.footer_Prevactivity").die().live('click', function() {
			    var previousSequenceItem, coursePrefix, parentID='', sequenceID='';
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    previousSequenceItem = JSON.parse(window.localStorage.getItem("previousSequenceItem"));
                    coursePrefix = window.localStorage.getItem("coursePrefix");
                } else {
                    previousSequenceItem = JSON.parse($.jStorage.get("previousSequenceItem"));
                    coursePrefix = $.jStorage.get("coursePrefix");
                }
				currentCtrl.previous_activity=true;
                currentCtrl.next_activity=false;
                hideFooter("course");
                if( coursePrefix == "TL" && !self.previousEND){
                    jQuery(".parent"+previousSequenceItem.parentID+"").find(".sequence"+previousSequenceItem.rowID+"").trigger('click');
			    }else{
                	jQuery('.topicspagenav').click();
                }
                jQuery(this).remove();
             });
	         jQuery(".course_ifram_cls_btn").die().live('click', function() {
				  if ($('html').hasClass('ie8')) {
					$('#content-webview, object, embed').empty();
				  }
				  jQuery('body').removeClass('scormPage');
				  $('body').removeClass("quiz-main-container course-quiz-main-container");
				   jQuery("#load_wrapper, .overlaycontainer").hide();
                 currentCtrl.next_activity=false;
                 currentCtrl.previous_activity=false;
				 jQuery('.topicspagenav').click();
                 jQuery(this).remove();
             });
             jQuery("#content-webview").on('swipeleft', function(){  })
             .on('swiperight', function(){  })
             .on('swipeup', function(){ })
             .on('swipedown', function(){ });

			jQuery('#save-notes-btn').die().live(iTouch, function(event) {
				event.preventDefault();
				// To add the active class while touch event started for devices.
				if (iTouch == "touchstart") {
					jQuery(this).addClass('active');
				}
				currentCtrl.saveNotes("#note");
			});
            jQuery('#cancel-notes-btn').off().on(iTouch, function(event){
                event.preventDefault();
				if (iTouch == "touchstart") {
					jQuery(this).addClass('active');
				}
                if( currentCtrl.serverComments != undefined ){
                 jQuery('#note').val(''+currentCtrl.serverComments+'');
                }else{
                    jQuery('#note').val('');
                }
            });
			// To remove the active class while touch event ended for devices.
			jQuery("#save-notes-btn, #cancel-notes-btn").on("touchend", function() {
				jQuery(this).removeClass('active');
			});

            jQuery("#note").on("focus", function(){
                jQuery("div.row.menu").hide();
            });
            jQuery("#note").on("blur",function(){
                jQuery("div.row.menu").show();
            });
            jQuery(".commentform-control").on("focus", function(){
                jQuery(".hme_hdrbx,div.row.menu").hide();
                jQuery('html,body').stop();
                return false;
            });
            jQuery(".commentform-control").on("blur", function(){
               jQuery(".hme_hdrbx,div.row.menu").show();
               jQuery('html,body').animate({scrollTop:-200 }, 10);
               return false;
            });
            if(screen.width == 1024 && screen.height == 768 && !(/iPad/i.test(navigator.userAgent))){
                removeOfScroll();
            }
            
            jQuery("#regmsg_modal_close,.Reg_cancel").off('tap').on('tap',function(){
                localStorage.clear();
                Clazz.navigationController.pop(false);
                Clazz.navigationController.getView('#quiz');
                jQuery('#container').removeClass("container");
            });
			 jQuery(".backtologin").off('tap').on('tap',function(){
	                Clazz.navigationController.pop(false);
	                Clazz.navigationController.getView('#login');
	                jQuery('#container').removeClass("container");
	            });
			 
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
               
				self.index = 1;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;
                jQuery("#load_wrapper,.overlaylightbox").show();
                self.loadQuizData(self.quizdata);
				
			});

			// Re attempt the Quiz
			jQuery('.reattempt-quiz').die().live(iTouch,function(){
                                                 
                //localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                  //  var actualData = result;
                    var index = $(this).data('index');
                    self.index = 1;
                    self.currentQuiz = index;
                    self.review = false;
                    self.summary = false;
                    self.layoutindex = 0;
                    jQuery("#load_wrapper,.overlaylightbox").show();
                    self.loadQuizData(self.quizdata);
               // });
				
			});

			// Start Review

			jQuery('.start-review').die().live(iTouch,function(){
				var index = $(this).data('index');
				self.index = 1;
				self.currentQuiz = index;
				self.review = true;
				self.summary = false;
                self.layoutindex = 0;
                jQuery("#load_wrapper,.overlaylightbox").show();
               self.loadQuizData(self.quizdata);
				
			});

			//Finish Review
			jQuery('.finish-review').die().live(iTouch,function(){

				self.index = 0;
				self.review = false;
				self.summary = false;
                self.layoutindex = 0;
                //self.currentQuiz = self.currentQuiz+1;
                jQuery("#load_wrapper,.overlaylightbox").show();
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
			
			/*jQuery(window).resize(function (){
							var crossheigdsshtiInterval=setInterval(function(){
								 if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									var height = jQuery("#courseContent-iframe").find('.mymobilecontent').height();
										jQuery("#courseContent-iframe").find('html').css('background','#fff');
								}else{
									var height = jQuery("#courseContent-iframe").contents().find('.mymobilecontent').height();
										jQuery("#courseContent-iframe").contents().find('html').css('background','#fff');
								}
								if(height){
										jQuery("#courseContent-iframe").css('height',height);
										$('.quiz-main-container #content-webview').css('height',$(window).height());
										jQuery(".quiz-main-container #content-webview").niceScroll();
										
										setTimeout(function(){
										jQuery(".quiz-main-container #content-webview").niceScroll();
										jQuery("#courseContent-iframe").css('height',height);
										$('.quiz-main-container #content-webview').css('height',$(window).height());
										},2000); 
										
										jQuery(".quiz-main-container #content-webview").getNiceScroll().resize();
										clearInterval(crossheigdsshtiInterval);
								}
									
							},1000);
			});*/

        },
        scormUpdate: function(){
          if( isDevice() ){
            try{
             var self = this;
             self.coursemodId = JSON.parse(window.localStorage.getItem("coursemodid"));
             var db = sqlitePlugin.openDatabase("CliniqueDB.db"),
                 scormIDentifier="" + self.userID + "" + self.quizCourseId + "" + self.modID + "",
                 scormpool = eval('(' + window.localStorage.getItem("scormpool") + ')'),
                 score_raw = null,
                 completion_status = null,
                 success_status = null,
                 scormObject = [],
                 score_Object = {},
                 slideLength = null,
                 cmiSlide = null,
                 cmiStatus = null,
                 objectLocation = null,
                 scaled = null,
                 min = null,
                 max = null,
                 progress_measure = null,
                 total_time = null,
                 interactionSlide = null,
                 scormInteractions = [],
                 interactionsID = null,
                 interactionsType = null,
                 interactionsDescription = null,
                 interactionsWeight = null,
                 interactionsResponse = null,
                 pollsJSON = [],
                 learner_response = [],
                 scormCompleted = false,
                 starttime={},
                 attempts={},
                 pollId=1;
                                                                            
                if( db ){
                    db.transaction(function(tx) {
                        tx.executeSql("SELECT scormUpdateFlag FROM scorm_Progress_Update WHERE scorm_Progress_Update.userId = ? AND scorm_Progress_Update.modId = ? AND scorm_Progress_Update.courseId = ?", [self.userID,self.modID,self.quizCourseId],
                                      function(tx,results){
                                      
                                        if (results.rows.item(0)['scormUpdateFlag'] === "true") {
                                            console.log("scormUpdateFlag="+results.rows.item(0)['scormUpdateFlag']);
                                            if (scormpool !== undefined && scormpool !== null && scormpool !== "" && scormpool.length !== 0) {
                                      
                                                jQuery.each(scormpool.organizations.Turnaround_Revitalizing_Resource_ORG.cmi, function(key, value) {
                                                    
                                                   if (scormIDentifier === key) {
                                                    console.log("scormIDentifier="+scormIDentifier+"key="+key);
                                                    var dte = new Date();
                                                    starttime.value= dte.getTime();
                                                    starttime.setbysco="true";
                                                    attempts.value="2";
                                                    attempts.setbysco=false;
                                                    value.starttime=starttime;
                                                    value.attempts=attempts;
                                                    
                                                    console.log("scormpool="+JSON.stringify(scormpool));
                                                            
                                                    tx.executeSql("UPDATE scorm_Progress_Update SET JSONBody = ?, InteractionJSON = ?, scormUpdateFlag = ?, score_raw = ?, completion_status = ?, objectives_location = ?, objectives_scaled = ?, objectives_min = ?, objectives_max = ?, pollId = ?, pollJSON = ?, success_status = ? WHERE scorm_Progress_Update.userId = ? AND scorm_Progress_Update.modId = ? AND scorm_Progress_Update.courseId=?", [JSON.stringify(scormpool), null, "false", null, completion_status, objectLocation, scaled, min, max, pollId, null, success_status,self.userID,self.modID,self.quizCourseId],
                                                        function(tx, results){
                                                                setTimeout(function(){
                                                                  scormSyncBack();
                                                                },100);
                                                                  console.log("SCORM UPDATE SUCCESS");
                                                        },
                                                        function(e){ console.log("SCORM UPDATE ERROR=" + e.message); });
                                                   }
                                                });
                                            }

                                        }
                                      },
                                      function(tx,e){
                                         console.log("scorm_Progress_Update selectQuery Error**"+e.message);
                                      });
                    });
                }
              }catch(err){
                console.log("Catch="+err);
              }
          }
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
                cid: self.courseID,
				uid : userDetails.id,
                type : 'pdf',
                token : userDetails.token
            };
            jQuery('#note').val('');
            jQuery(".commentform-control").val('');
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
	                success: function(res) {
	                   if( res.response[0] != undefined ){
	                     currentCtrl.serverComments = res.response[0].comment;
						 jQuery('#note').val(''+res.response[0].comment+'');
	                     jQuery(".commentform-control").val('' +res.response[0].comment+ '');
	                   }else{
						   currentCtrl.serverComments = "";
	                       jQuery('#note').val('');
	                       jQuery(".commentform-control").val('');
	                   }
	                }
	            });
            }else if( isDevice() ){
            	cordova.exec(
            			function (result) {
            				var res = JSON.parse(result);
            				if( res && res.response.length > 0 ){
       	                     currentCtrl.serverComments = res.response[0].comment;
       						 jQuery('#note').val(''+res.response[0].comment+'');
       	                     jQuery(".commentform-control").val('' +res.response[0].comment+ '');
       	                   }else{
							   currentCtrl.serverComments = "";	
       	                       jQuery('#note').val('');
       	                       jQuery(".commentform-control").val('');
       	                   }
            			},
            			function (result) {
            			},'OfflineServicePlugin', 'get_course_resource_comment', [data]);
            }
		},

		saveNotes : function(textBoxID) {
			var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            self.serverComments = jQuery('' +textBoxID+ '').val();
            var data = {
                action: "insert_replace_course_resource_comment",
                coursemoduleid: self.modID,
                cid: self.courseID,
				uid : userDetails.id,
                type : 'pdf',
                token : userDetails.token,
				comment : jQuery('' +textBoxID+ '').val()
            };
			 if(this.returnIeVersion()){
				this.ieEightAndIeNine();
			}
             if( !isDevice() ){
                    jQuery.ajax({
                        url: serviceUrl,
                        data: data,
                        type: 'POST',
                        crossDomain: true,
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
                }else if( isDevice() ){
                    cordova.exec(
                        function (result) {
                        },
                        function (result) {
                        },'OfflineServicePlugin', 'insert_replace_course_resource_comment', [data]);
                }	
		},

        reloadCourseItems: function(){
                if( !this.courseItemFLAG && this.courseItemFLAG != undefined){
                 jQuery('#accordion2').hide();
                }else if( this.courseItemFLAG || this.courseItemFLAG == undefined){
                 jQuery('#accordion2').show();
                }

                jQuery('.course-topics li:nth-child(3)').html("<span data-msg='Topics'></span>");
                loadAllLanguages();
                jQuery('.newTopic, .course_ifram_cls_btn').remove();
                if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    try {
                        jQuery('.tpbreadcrumbs ul li:last-child').addClass('breadcrumbLastChld');
                    } catch (e) {

                    }
                }
                emptyMedia();
                var userDetails, courseId;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    userDetails = JSON.parse(window.localStorage.getItem("USER"));
                    courseId = window.localStorage.getItem("selCourseId");
                } else {
                    userDetails = JSON.parse($.jStorage.get("USER"));
                    courseId = $.jStorage.get("selCourseId");
                }
                var data = {
                    wsfunction: "core_course_get_contents",
                    moodlewsrestformat: "json",
                    courseid: courseId,
                    wstoken: userDetails.token
                };
                /* Storing the Active Topic Item to show back */
                var activeTopic = jQuery("div#accordion2 div.accordion-body").index(jQuery("div#accordion2 div.accordion-body").filter(function(){
                    return parseInt(jQuery(this).css('height')) > 0;
                }));
                jQuery("div.iframewrap_crs").hide();
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem("activeTopic", activeTopic);
                } else {
                    $.jStorage.set("activeTopic", activeTopic);
                }
                                                                        
            //  this.loadData(data, this.enrollUsers);  /* artf1036615 */
        },
		fileWidget:function(fileType,courseItemData) {
            self.override = true;
            switch (fileType) {  /* check file format for load into iFrame / video*/
                case "mp4":
                    self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                    break;
                case "mp3":
                    self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                    break;
                case "pdf":
                    self.checkIfFileExists(self, courseItemData);
                    break;
                default :
                    self.override = false;
                    self.loadFileinWeb(courseItemData);  /*load scorm content into iFrame*/
                    break;
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
		loadQuizData:function(data){
            var self=this,firstQuestion=null,flag = true;
            jQuery("#load_wrapper,.overlaylightbox").hide();
            jQuery(".quiz-container").empty();
            jQuery("#load_wrapper").show();

            jQuery('#accordion2').hide();
            jQuery("#content-webview").addClass('quiz-container');
            jQuery("#content-webview").show();
			jQuery("#content-webview").css({ position : 'relative' });
            $(".iframewrap_crs").find('.next_activity,.course_ifram_cls_btn,.previous_activity').remove();
            $(".iframewrap_crs").prepend('<div class="course_ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>').show();
            jQuery("<div id='courseContent-iframe' style='height:auto;'></div>").appendTo(jQuery("#content-webview"));                                                       
            jQuery("div.iframewrap_crs").show();
            jQuery("#load_wrapper").hide();
            jQuery('.commentNotes').hide();
			$('body').addClass("quiz-main-container course-quiz-main-container");
			 $('.quiz-main-container #content-webview').css('height',$(window).height()-45);
            //$('.quiz-main-container #courseContent-iframe').css('height',$(window).height());
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
								quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectmulti'></span>:</div>"
							}else if(multichoice == 'multichoice' && singleType == 1){
								quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectone'></span>:</div>"
							}else if(multichoice == 'truefalse' ){
								quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl questionId' data-id ="+questionId+" data-msg='selectone'></span>:</div>"
							}else if(multichoice == 'match' ){
								quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl questionId' data-id ="+questionId+" ></span></div>"
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
										quizquestions += "<div class='chooseanr selectbox'><span class='labelname'>"+val.subquestion+"</span><div class='dropmenusct'><select class='select' id='select"+questionId+i+"' data-index ="+i+" data-question="+questionId+" name='select"+questionId+"' data-id='"+val.id+"' value='"+val.id+"'>"+option+"</select></div></div>";
									 else
									 	val.invalid = true;
								 }

							});

							 jQuery(quizquestions).appendTo(jQuery("#courseContent-iframe"));
	                       
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
				jQuery(quizquestions).appendTo(jQuery("#courseContent-iframe"));
				 // jQuery(".quiz-main-container #content-webview").niceScroll().resize();
					
				jQuery(window).resize(function (){
						$('.scormPage #container .pro_container #content-webview').css('height',$(window).height());
						// $('.quiz-main-container #content-webview').css('height',$(window).height());
						//$('.quiz-main-container #courseContent-iframe').css('height',$(window).height());
						headFootCtrl();
					}).load(function (){
						document.ontouchmove = function(event){
							if($('body.unScrolled').length){
								event.preventDefault();
							}
						}
						 
					});

			}
			else if(self.summary){
				if(data.quizlist[self.currentQuiz].questions.length){
					var quizsummary = "<table class='quizdtlgrid'><tr><th><span data-msg='question'></span></th><th><span data-msg='status'></span></th></tr>"
					 jQuery.each(data.quizlist[self.currentQuiz].questions, function(i,val){
                         
						 if(!val.userAnswer || !val.userAnswer.length){
							 quizsummary += "<tr><td>"+(i+1)+"</td><td> <span data-msg='notyetanswered'></span> </td></tr>";
						 }else{
							 quizsummary += "<tr><td>"+(i+1)+"</td><td> <span data-msg='answersaved'></span> </td></tr>";

						 }

					 });
					 quizsummary += "</table><div> <div data-msg='returnattempt' class='return-attempt btncommon'></div> </div>" +
					 		"<div><div data-msg='submitallandfinish' class='submit-attempt btncommon'></div> </div>";
					jQuery(quizsummary).appendTo(jQuery("#courseContent-iframe"));
				}

			}
			else if(self.review){


				var layout = data.quizinfo[0].layouts.split(',');

				jQuery.each(layout, function(index,value){

					if (layout[self.layoutindex] != 0 && layout[self.layoutindex] != undefined) {

		                if(index !=0){
		                	self.index++;
		                }

		                self.layoutindex ++;

				//if(data.quizlist[self.currentQuiz].questions.length){
		                	
		                var quizquestions = '',totalGrade = self.totalGrade(data.quizlist[self.currentQuiz].questions), userGrade = self.userGrade(data.quizlist[self.currentQuiz].questions);
						var userAnswer = data.quizlist[self.currentQuiz].questions[self.index-1].userAnswer;
						var answer = data.quizlist[self.currentQuiz].questions[self.index-1].answers;
						
						var mark = self.addDecimal(data.quizlist[self.currentQuiz].questions[self.index-1].mark);
						var userMark = data.quizlist[self.currentQuiz].questions[self.index-1].userMark;
						var choices = data.quizlist[self.currentQuiz].questions[self.index-1].choices;
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
						else if(data.quizlist[self.currentQuiz].attempts[0].startedon)
							var startedOn = data.quizlist[self.currentQuiz].attempts[0].startedon;
						else
							var startedOn = '-';	
						
						if(data.quizlist[self.currentQuiz].attempts[0].completedOn)
							var completedOn = data.quizlist[self.currentQuiz].attempts[0].completedOn;
						else if(data.quizlist[self.currentQuiz].attempts[0].completedon)
							var completedOn = data.quizlist[self.currentQuiz].attempts[0].completedon;
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
						 quizquestions += "<div class='qustn-head'><span  class='f_left'><span data-msg='question'></span> "+(self.index)+"</span><span class='f_right'><span data-msg='mark'></span> "+self.mutilchoicemark(data.quizlist[self.currentQuiz].questions[self.index-1])+" <span data-msg='xoutofmax'></span> "+mark+" </span></div>";
                           /* localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                                              var actualData = result;
                                              actualData.quizlist[self.currentQuiz] = self.quizdata.quizlist[self.currentQuiz];
                                              localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false);
                             });*/
                            
						 
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
							quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl' data-msg='selectmulti'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
						}else if(type == "multichoice" && singleType == 1){
							quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl' data-msg='selectone'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
						}else{
							quizquestions += "<div style='clear:both; text-align:left;'><span class='selectlbl' data-msg='selectone'></span> :</div><div class='options options"+(self.index-1)+"'><div class='overlayed overlayheight"+(self.index-1)+"'></div>"
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
					jQuery(quizquestions).appendTo(jQuery("#courseContent-iframe"));

					
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
				
					}
					else{
						return false;
					}
				});
				if((data.quizlist[self.currentQuiz].questions.length) == self.index)
					quizquestions = "<div><div class='finish-review btncommon' data-msg='finishreview' ></div></div>";
				else
					quizquestions = "<div><div class='nextquiz btncommon review' data-msg='next'></div></div>";
				jQuery(quizquestions).appendTo(jQuery("#courseContent-iframe"));
			}
			else {
		     /* First Page */
				var FirstPageElements = "<div class='headlabel'> <h2>"+self.quizdata.quizinfo[0].name+"</h2> </div>",attemptNew = '';statusTable ='',isHeader = true,next = true,inprogress = true,overallGrade = 0;
				//jQuery(FirstPageElements).appendTo(jQuery("#courseContent-iframe"));
				var firstPageFlag = true, finalGradeArray = [];
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
							} else {
								if(self.quizdata.quizinfo[0].feedback[0].feedbacktext){
									if((valueofcopyObj.sumgrades >= self.quizdata.quizinfo[0].feedback[0].mingrade) && (valueofcopyObj.sumgrades <  self.quizdata.quizinfo[0].feedback[0].maxgrade))
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td>"+self.quizdata.quizinfo[0].feedback[0].feedbacktext+"</td></tr>";
									else
										alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td><td></td></tr>";
								} else {
									alreadyattemptedData += "<tr><td>"+(self.displayIndex++)+"</td><td><span data-msg='statefinished'></span></td><td>"+todisplayGrade+"</td><td><div  class='start-review' data-index="+valueofcopyObj.attempt+"><span data-msg='review'></span></div></td></tr>";
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
                            /*localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                                              var actualData = result;
                                              actualData.quizlist[index] = self.quizdata.quizlist[index];
                                              localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false);
                            });*/
                            isHeader = false;
                            break;
							    case "finished":
							    	FirstPageElements += self.FirstPage(self.quizdata.quizlist[index],'f',index,isHeader);
							    	overallGrade = overallGrade + self.overallGrade(self.quizdata.quizlist[index].questions);
									self.quizdata.quizlist[index].attempts[0].sumgrades = Math.round(self.quizdata.quizlist[index].attempts[0].sumgrades);
							    	finalGradeArray.push(self.quizdata.quizlist[index].attempts[0].sumgrades);
                                    /*localDBStorageGet(self.quizCourseId,self.quizModId,self.userID,false,function(result){
                                              var actualData = result;
                                              actualData.quizlist[index] = self.quizdata.quizlist[index];
                                              localDBStorageSet(self.quizCourseId,self.quizModId,'quiz',actualData,self.userID,false);
                                    });*/
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
				
			    jQuery(FirstPageElements).appendTo(jQuery("#courseContent-iframe"));
			    var data = jQuery(".already").html();
			    jQuery(".already").html(" ");
				
	        	
				
				
			    if(next && inprogress){
			    	  FirstPageElements = "<div class='paracont'><span data-msg='yourfinalgradeis'></span> "+Math.max.apply(Math,finalGradeArray)+"</div><div class='paracont'> <span data-msg='nomoreattempts'></span></div>";
			    	 jQuery(FirstPageElements).appendTo(jQuery("#courseContent-iframe"));
			    }
				
				
			    if(inprogress){
			    	jQuery(attemptNew).appendTo(jQuery("#courseContent-iframe"));
			    }
			    else{
			    	FirstPageElements = "<div class='reattempt-quiz btncommon' data-index ='"+(self.currentQuiz)+"' data-msg='reattemptquiz'></div></div>";
			    	jQuery(FirstPageElements).appendTo(jQuery("#courseContent-iframe"));
			    }
			    
                                          
	        	alreadyattemptedData += '</tbody>';
	        	jQuery(alreadyattemptedData).appendTo('.already');                                         
	        	jQuery(data).appendTo('.already');
	        	// console.log("data",data);
	        	

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
                jQuery("#content-webview").niceScroll();
		
										
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
        			//FirstPageElements += "<tr><td>"+(data.attempts[0].attempt)+"</td><td><span data-msg='statefinished'></span></td><td>"+userGrade+" %</td><td><div class='start-review' data-index="+tableIndex+"><span data-msg='review'></span></div></td></tr>";
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
        loadData: function(data,userDetails) {
            var self = this, serviceUrl = self.globalConfig.apiAddress.restservice, courseId,catcrsId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                courseId = window.localStorage.getItem("selCourseId");
                catcrsId = window.localStorage.getItem("catcrsId");
            } else {
                courseId = $.jStorage.get("selCourseId");
				catcrsId = $.jStorage.get("catcrsId");
            }
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()){
               jQuery(".course-topics").hide();
            }
			if(this.returnIeVersion()){
				this.ieEightAndIeNine();
			}
            $('body').removeClass("quiz-main-container course-quiz-main-container");
			if( !isDevice() ){
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
	                    self.offlineStorage.insertCourseItems(courseId, JSON.stringify(res));
	                    var coursePrefix;
	                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                        coursePrefix = window.localStorage.getItem("coursePrefix");
	                    } else {
	                        coursePrefix = $.jStorage.get("coursePrefix");
	                    }
						//coursePrefix ="TL";
						if( coursePrefix == "TL"){
							if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() ){
								self.phonetileItemSuccess(res);
						}else{
								self.tileItemSuccess(res);
						}

						}else{
							self.courseItemSuccess(res);
						}
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getCourseItems(courseId);
	                    setTimeout(function () {
	                        var courseItemsOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            		courseItemsOfflineData = JSON.parse(localStorage["transferData"]);
                        	} else {
                            		courseItemsOfflineData = JSON.parse($.jStorage.get("transferData"));
                        	}
	                        if(courseItemsOfflineData != 0){
	                            self.courseItemSuccess( courseItemsOfflineData );
	                        }
	                    },1000);
	                }
	            });
			}else if( isDevice() ){
				data.userid=userDetails.id;
				data.categoryid = catcrsId;
				cordova.exec(
						function(result) {
                           
						   //self.UserDetails = JSON.parse(result);
                           self.UserDetails = eval('('+ jsonEscape(result) +')');
                           console.log("core_course_get_contents=="+JSON.stringify(self.UserDetails));
                             
						   self.courseItemSuccess(self.UserDetails);
						},
						function(result) {
							//alert("CourseTopic Get Fail="+JSON.stringify(result));
						},'LoginPlugin', 'core_course_get_contents', [data]);
	        }
            jQuery('a.course-favour').die();
            jQuery('a.course-favour').live('click', function() {
                if(jQuery(this).siblings('a.courseItem').hasClass('dsbl')){
                    return false;
                }
                else{
                    //if ( isOnline("DontCheck") ) {
                        var course_Data = jQuery(this).next('a.courseItem'), isFavour = jQuery(this).children('div.favour');
                        var modId = course_Data.data('modid');
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem('coursemodid', modId);
                        } else {
                            $.jStorage.set('coursemodid', modId);
                        }
                        var fileType = course_Data.data('type');
                        var fileTitle = course_Data.data('name');
                        var fileurl = course_Data.data('url');
                        var fileNameUrl = course_Data.data('filename');
                        var courseID = course_Data.data('courseid');
                        var userID =  course_Data.data('userid');
                        if (isFavour.hasClass('acc_ntfav')) {
                            isFavour.removeClass('acc_ntfav').addClass('acc_fav');
                            self.Addfavourite(fileurl,modId, fileType, fileTitle, fileNameUrl, this);
                        }else {
                            isFavour.removeClass('acc_fav').addClass('acc_ntfav');
                            self.Removefavourite(fileurl,modId, fileType, fileTitle, fileNameUrl, this);
                        }
                    //}
                }
            });
            jQuery('a.courseItem').die().live('click', function() {
				if(isiOS()){
					jQuery(".widget-maincontent-div > .courseicon + .pro_container").removeAttr("style");
				}
                var dataName = $(this).data('name');
                var dName = $(this).data('name');
		  		var dataModId = $(this).data('modid');
                var prefix = dName.substring(0, 3);

                  jQuery("#content-webview").removeClass('quiz-container');
				  self.courseID = jQuery(this).attr('data-courseid');
                  self.modID = jQuery(this).attr('data-modid');
                  self.userID = jQuery(this).attr('data-userid');
                  self.timecreated =  jQuery(this).attr('data-timecreated');
                  self.timemodified =  jQuery(this).attr('data-timemodified');
                  self.pdfURL =  jQuery(this).attr('data-url');
				  self.takeCurrentPdfUrl = self.pdfURL;
                  self.sequenceActivity = '';
                  self.matchActivity = ''; 
                  self.uncoverActivity = ''; 	
                  self.quizCourseId= self.courseID;
              	  self.quizModId='';
                  self.video_tapped = false;
                  	  
                  self.Download = false;
                  if( isAndroid() && isPhoneGap() ){
                	  self.Download = true;  
                  }
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem('coursemodid', dataModId);
                } else {
                    $.jStorage.set('coursemodid', dataModId);
                }
                var prefix = dName.substring(0, 3);
                if($.trim(prefix) == "bbe")
                { dName = "Multi"; }
                else
               {  dName = "Match";}
                var activityName = jQuery(dataName.split(':'))[0];
                var activityQuizName = jQuery(dataName.split(':'))[1];
                var topicName = $(this).parents('.accordion-body').prev().children().text();
                if(jQuery(this).hasClass('dsbl')){
                    return false;
                }else if((activityName == 'dd')){ /*Match: Activity3*/
                	if( isDevice() ){
                		
	                	self.sequenceActivity = self.getWidget(self.UserDetails,self.courseID,self.modID,"");
	                	
	                	window.localStorage.setItem("sequenceActivity",JSON.stringify(self.sequenceActivity));
	                    self.sequenceWidget = new Clazz.com.components.widget.sequence.js.Sequence();
	                    self.sequenceWidget.loadPage(activityQuizName, self.modID,topicName, self.sequenceActivity);
                    
                	}else{
                		self.sequenceWidget = new Clazz.com.components.widget.sequence.js.Sequence();
                        self.sequenceWidget.loadPage(activityQuizName, self.modID,topicName);
                	}
                }else if((activityName == 'bb' || activityName == 'bbe')){ /*Match: Activity2*/
                	if( isDevice()){
                		
                		self.matchActivity = self.getWidget(self.UserDetails,self.courseID,self.modID,"");
                		
                		self.matchWidget = new Clazz.com.components.widget.match.js.Match();
                        self.matchWidget.loadPage(activityQuizName, topicName,dataModId,dName,self.matchActivity);
                	}else{
                		self.matchWidget = new Clazz.com.components.widget.match.js.Match();
                		self.matchWidget.loadPage(activityQuizName, topicName,dataModId,dName,self.modID);
                	}
                }else if((activityName == 'aa') || (activityName == 'aae')){ /*Uncover: Activity1*/
                    /* Check for the data */
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
                        modId : self.modID
                      };
                    var unCoverServiceUrl = self.globalConfig.apiAddress.service;
                    if( !isDevice() ){
	                    jQuery.ajax({
	                        url: unCoverServiceUrl,
	                        data: uncoverdata,
	                        cache:false,
							async:false,
							type:'POST',
							dataType:'json',
							crossDomain: true,
	                        success:function(res){
	                            if(res.msg == "done"){
	                                self.uncoverWidget = new Clazz.com.components.widget.uncover.js.Uncover();
	                                self.uncoverWidget.loadPage(false, activityQuizName, topicName,self.modID);
	                            }
	                        },
	                        error: function ( jqXHR, textStatus, errorThrown ){
	                            self.uncoverWidget = new Clazz.com.components.widget.uncover.js.Uncover();
	                            self.uncoverWidget.loadPage(true, activityQuizName, topicName,self.modID);
	                        }
	                    });
                    }else if( isDevice() ){

                    	self.uncoverActivity = self.getWidget(self.UserDetails,courseId,self.modID,"Uncover");
                    	self.uncoverWidget = new Clazz.com.components.widget.uncover.js.Uncover();
                        self.uncoverWidget.loadPage(false, activityQuizName, topicName,self.modID, self.uncoverActivity);
                    }
                }
                else{
                    var fileType = jQuery(this).data('type');
                    var cusModName = jQuery(this).data('modurl');
                    if(fileType === 'pdf' || fileType === 'mp4' || fileType === 'mp3'){
                        self.pdfViewServiceHit(cusModName);
                        cusModName = jQuery(this).data('url');
                    }

                    if( fileType == "quiz" && isDevice() ){
                    	var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                        var course_ID = jQuery(this).attr('data-quiz_CourseId');
                    	self.quizCourseId= course_ID;
                    	self.userID = userDetails.id;
                    	self.quizModId=	self.modID;
                    	self.quizActivity={};
                    	self.quizActivity.response={};

                    	self.quizActivity.response = self.getQuizWidget(self.UserDetails,self.courseID,self.modID);

                    	fileType = "mobileQuiz";
                    }

                    if( fileType == "scorm" ){
						if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
							var userDetails = JSON.parse(window.localStorage.getItem("USER"));
						} else {
							var userDetails = JSON.parse($.jStorage.get("USER"));
						}
                        
                        var course_ID = jQuery(this).attr('data-quiz_CourseId');
                        self.quizCourseId= course_ID;
                        self.userID = userDetails.id;
                        var fileUrl = jQuery(this).attr('data-url');
                        if( isAndroid() && isPhoneGap() ){
                                              
                        	window.localStorage.setItem("scormURL",fileUrl);
                        	window.localStorage.setItem("manifestURL",fileUrl);
                                              
                        }else if( isiOS() && isPhoneGap() ){
                        	window.localStorage.setItem("scormURL","file://"+fileUrl);
                        	window.localStorage.setItem("manifestURL",fileUrl);
                        }
                        
                    }
                    var courseItemData = {
                        fileType: fileType,
                        fileURL: jQuery(this).data('url'),
                        modelURL: cusModName,
                        seqCrseURL: jQuery(this).data('modurl'),
                        filepageCount: jQuery(this).data('pagecount'),
                        fileName: jQuery(this).data('name'),
                        fileNameUpload: (jQuery(this).data('filename'))?(isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename')):''
                    };
                    self.override = true;
                    switch (fileType) {  /* check file format for load into iFrame / video*/
                        case "mp4":
                            self.video_tapped=true;
                            self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                            break;
                        case "mp3":
                            self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                            break;
                        case "pdf":
                            self.checkIfFileExists(self, courseItemData);
                            break;
                        case "mobileQuiz":
                        	self.loadOfflineQuiz(self, self.quizActivity);
                        	break;
                        case "scorm":
//                            self.changeManifestFile(self.userID,self.quizCourseId,self.modID,courseItemData);
                              changeManifestFile(self.userID,self.quizCourseId,self.modID,function(){
                                  self.loadFileinWeb(courseItemData);
                              });
                            break;
                        case "puzzle":
                            if( isDevice() && isPhoneGap() && !checkAppOnline() && isiOS() ){
                                              
                              jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                              updateLanguage();
                              jQuery('.errorCode-pop').show();
                              return false;
                                              
                            }
                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
								var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                            } else {
								var userDetails = JSON.parse($.jStorage.get("USER"));
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
                                                         self.override = false;
                                                         courseItemData.fileType = "puzzle";
                                                         self.loadFileinWeb(courseItemData);  /*load scorm content into iFrame*/
                                                     }else{
                                                         jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10001');
                                                         updateLanguage();
                                                         jQuery('.errorCode-pop').show();
                                                         return false;
                                                     }
                                                });
                                           
                                           },
                                           function(result) {
                                        	   var error = JSON.parse(result);
                                			   console.log(error.errorCode);
                                               jQuery('.errorCode-pop .prog-summarys').attr('data-msg',error.errorCode);
                                               updateLanguage();
                                			   jQuery('.commentmodal-backdrop,.errorCode-pop').show();
                                           },'LoginPlugin', 'secure_details', [data]);
                          break;
                        default :
                            self.override = false;
                            self.loadFileinWeb(courseItemData);  /*load scorm content into iFrame*/
                            break;
                    }
                    currentCtrl.loadResourceComment();
                }
                currentCtrl.setCompletedModules(currentCtrl, self.userID, self.quizCourseId, self.modID);
            });

			/* Tiling click Start here */
			jQuery(".ui-grid-d .topicAlign").die().live('click', function() {
				jQuery(this).parent().toggleClass('swiperTilt');
			});
            jQuery(".ui-grid-d .tilt, .ui-grid-c .tilt, .swiper-wrapper .activity").die().live('click', function() {
				 if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() ){
				    jQuery(this).toggleClass('swiperTilt');
				 }
				 else
				 {
					jQuery(this).toggleClass('horizFlip');
				 }

						var dataName = $(this).data('name');
						var dName = $(this).data('name');
						var dataModId = $(this).data('modid');
                        self.courseID = jQuery(this).attr('data-courseid');
                        self.modID = jQuery(this).attr('data-modid');
                        self.userID = jQuery(this).attr('data-userid');
                        self.timecreated =  jQuery(this).attr('data-timecreated');
                        self.timemodified =  jQuery(this).attr('data-timemodified');
                        self.pdfURL =  jQuery(this).attr('data-url');
                        self.Download = false;
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.setItem('coursemodid', dataModId);
                        } else {
                            $.jStorage.set('coursemodid', dataModId);
                        }
						var prefix = dName.substring(0, 3),lastROW,sequenceItem='';
                        var activityName = jQuery(dName.split(':'))[0];
						var activityQuizName = jQuery(dName.split(':'))[1];
						if($.trim(activityName) == "bbe"){
                                dName = "Multi";
                            }
						if($.trim(activityName) == "bb")
							{
                                dName = "Match";
                            }
						var topicName = $(this).parents('.accordion-body').prev().children().text();
						if(jQuery(this).hasClass('dsbl')){
							return false;
						}else if((activityName == 'dd')){ /*Match: Activity3*/
							 self.sequenceWidget = new Clazz.com.components.widget.sequence.js.Sequence();
							 setTimeout(function (){
                                    self.sequenceWidget.loadPage(activityQuizName,dataModId,topicName);
							 },1000);
						}else if((activityName == 'bb' || activityName == 'bbe')){ /*Match: Activity2*/
							setTimeout(function (){
                                self.matchWidget = new Clazz.com.components.widget.match.js.Match();
                                self.matchWidget.loadPage(activityQuizName, topicName,dataModId,dName);
							 },1000);
						}else if((activityName == 'aa') || (activityName == 'aae')){ /*Uncover: Activity1*/
							/* Check for the data */
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
								modId : self.modID
							  };
							var unCoverServiceUrl = self.globalConfig.apiAddress.service;
							jQuery.ajax({
								url: unCoverServiceUrl,
								data: uncoverdata,
								cache:false,
								async:false,
								type:'POST',
								dataType:'json',
								crossDomain: true,								
								success:function(res){
									if(res.msg == "done"){
                                        setTimeout(function (){
                                            self.uncoverWidget = new Clazz.com.components.widget.uncover.js.Uncover();
                                            self.uncoverWidget.loadPage(false, activityQuizName, topicName,self.modID);
										 },1000);
									}
								},
								error: function ( jqXHR, textStatus, errorThrown ){
								  setTimeout(function (){
									self.uncoverWidget = new Clazz.com.components.widget.uncover.js.Uncover();
									self.uncoverWidget.loadPage(true, activityQuizName, topicName,self.modID);
                                  },1000);
								}
							});
						}
						else{
							var fileType = jQuery(this).data('type');
							var cusModName = jQuery(this).data('modurl');
							if(fileType === 'pdf' || fileType === 'mp4' || fileType === 'mp3'){
							   setTimeout(function (){
                                    self.pdfViewServiceHit(cusModName);
                                    cusModName = jQuery(this).data('url');
                               },1000);
							}
							var courseItemData = {
								fileType: fileType,
								fileURL: jQuery(this).data('url'),
								modelURL: cusModName,
								seqCrseURL: jQuery(this).data('modurl'),
								filepageCount: jQuery(this).data('pagecount'),
								fileName: jQuery(this).data('name'),
								fileNameUpload: (jQuery(this).data('filename'))?(isNaN(jQuery(this).data('filename')) ? jQuery(this).data('filename').replace(/\s+/g, '_'):jQuery(this).data('filename')):''
							};
							setTimeout(function (){
                                self.override = true;
                                switch (fileType) {  /* check file format for load into iFrame / video*/
                                    case "mp4":
                                        self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                                        break;
                                    case "mp3":
                                        self.checkIfFileExists(self, courseItemData);  /*check selected file already have in local or not*/
                                        break;
                                    case "pdf":
                                        self.checkIfFileExists(self, courseItemData);
                                        break;
                                    default :
                                        self.override = false;
                                        self.loadFileinWeb(courseItemData);  /*load scorm content into iFrame*/
                                        break;
                                }
							 },1500);

							 if( (currentCtrl.next_activity && window.location.hash == "#match") || (currentCtrl.previous_activity && window.location.hash == "#match") || (currentCtrl.next_activity && window.location.hash == "#uncover") || (currentCtrl.previous_activity && window.location.hash == "#uncover") || (currentCtrl.next_activity && window.location.hash == "#sequence") || (currentCtrl.previous_activity && window.location.hash == "#sequence")){
                                 self.courseItemFLAG = false;
							     jQuery('.topicspagenav,.topicpagenav').click();
							 }
                            if(fileType === 'pdf' || fileType === 'mp4' || fileType === 'mp3'){
							 currentCtrl.loadResourceComment();
                            }
						}

                    sequenceItem={}, previousSequenceData={};
                    sequenceItem.parentID = parseInt(jQuery(this).attr('data-parentid'));
					sequenceItem.rowID = parseInt(jQuery(this).attr('data-rowid'));
					sequenceItem.count = parseInt(jQuery(this).attr('data-count'));

                    previousSequenceData.parentID = parseInt(jQuery(this).attr('data-parentid'));
                    previousSequenceData.rowID = parseInt(jQuery(this).attr('data-rowid'));
					previousSequenceData.count = parseInt(jQuery(this).attr('data-count'));

                    jQuery(this).attr('data-viewed','true');


                    if( sequenceItem.parentID == jQuery(".ui-content .parentNode, .verticalSwipe .parentNode").length && sequenceItem.rowID == jQuery('.parent' +sequenceItem.parentID+ ' .activity').length-1){
                        self.nextSequenceEND = true;

                    }else if( sequenceItem.parentID == jQuery(".ui-content .parentNode, .verticalSwipe .parentNode").length && sequenceItem.rowID < jQuery('.parent' +sequenceItem.parentID+ ' .activity').length-1 ){
                        self.nextSequenceEND = false;
                        sequenceItem.parentID = sequenceItem.parentID;
                        sequenceItem.rowID = sequenceItem.rowID+1;

                    }else if( sequenceItem.parentID < jQuery(".ui-content .parentNode, .verticalSwipe .parentNode").length && sequenceItem.rowID < jQuery('.parent' +sequenceItem.parentID+ ' .activity').length-1 ){
                        self.nextSequenceEND = false;
                        sequenceItem.parentID = sequenceItem.parentID;
                        sequenceItem.rowID = sequenceItem.rowID+1;

                    }else if( sequenceItem.parentID < jQuery(".ui-content .parentNode, .verticalSwipe .parentNode").length && sequenceItem.rowID == jQuery('.parent' +sequenceItem.parentID+ ' .activity').length-1 ){
                        self.nextSequenceEND = false;
                        sequenceItem.parentID = sequenceItem.parentID+1;
                        sequenceItem.rowID = 0;
                    }

                    previousSequenceItem={};
                    if( previousSequenceData.parentID == 1 && previousSequenceData.rowID == 0 ){
                       self.previousEND=true;

                    }else if( previousSequenceData.rowID == 0 && previousSequenceData.parentID > 1){

                        previousSequenceItem.parentID = (previousSequenceData.parentID-1);
                        previousSequenceItem.rowID = (jQuery('.parent'+previousSequenceItem.parentID+' .activity').length-1);
                        jQuery('.parent'+(previousSequenceData.parentID-1)+' .sequence'+(previousSequenceData.rowID-1)+'');
                        self.previousEND=false;

                    }else if( previousSequenceData.rowID > 0 && previousSequenceData.parentID >= 1){

                        previousSequenceItem.parentID = previousSequenceData.parentID;
                        previousSequenceItem.rowID = (previousSequenceData.rowID-1);
                        self.previousEND=false;
                    }
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.setItem("sequenceItem", JSON.stringify(sequenceItem));
                        window.localStorage.setItem("previousSequenceItem", JSON.stringify(previousSequenceItem));
                    } else {
                        $.jStorage.set("sequenceItem", JSON.stringify(sequenceItem));
                        $.jStorage.set("previousSequenceItem", JSON.stringify(previousSequenceItem));
                    }

		   });	/* Tiling click Ends here */
        },
        phonetileItemSuccess: function(res){
            var self = this,activityPrefix,activityQuizName,modname;
            var mod_type,doctype ,dataModName,kellyItems, _activityName="", topicBlocks=[], topicObject={}, logoFLAG,noofAct = '',activityImage;
            var gridName=['b','c','d','e','f','f','f'],modURL="",fileUrl ="",contentList="",pageCount="",fileType="",fileName="",mediaType="",x,y,n=0,ny=0,rotINT,rotYINT, token, tokenTile;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                token = ('&token=' + JSON.parse(window.localStorage.getItem("USER")).token);
                tokenTile = ('?token=' + JSON.parse(window.localStorage.getItem("USER")).token);
            } else {
                token = ('&token=' + JSON.parse($.jStorage.get("USER")).token);
                tokenTile = ('?token=' + JSON.parse($.jStorage.get("USER")).token);
            }
            var verticalPagination='', verticalDistance = [],userid = '',timecreated='',timemodified='',courseIcon='';
            jQuery('.course-accordion').find('.borderLine, .swiper-container, .verticalPagination').remove();
            jQuery.each(res, function(i, courseContent){
                if(0 < i && parseInt(courseContent.visible) !== 0 && i <= courseContent.numsections )
                {
                    courseID = courseContent.id;
                    noOfActivity = courseContent.modules;
                    if(i < 6)
             {
                        var src = '';
                        if( res[i].heading != null){
                        src = res[i].heading;
                        }else if( res[i].tile_content != null ){
                        src = jQuery(res[i].tile_content).attr('src') + tokenTile;
                        }else{
                        src = undefined;
                        }
             //   var src = ( jQuery(res[i].tile_content).find('img').attr('src') != undefined )? (jQuery(res[i].tile_content).find('img').attr('src') + tokenTile) : undefined;
                    topicBlocks.push({
                                     "section_position":""+res[i].section_position+"",
                                     "TopicName":""+res[i].name+"",
                                     "TopicImage":""+((src != undefined ) ? "<img class='phoneImage' src="+src+">" : src)+"",
                                     "BlockID":"BLOCK"+i+"",
                                     "Modules":""+res[i].modules.length+"",
                                     "LOGOFLAG":""+res[i].logo+""
                                     });


                        if(res[i].section_position > 0)
                        {

                          if(res[i].section_position > res[i].modules.length)
						  res[i].section_position= res[i].modules.length;
						}
                    var tileElement='',logoFLAG=false;
                    if(noOfActivity.length >=6){
                        noofAct = 6;
                    }else{
                        noofAct=noOfActivity.length;
                    }
                    var countActivity = res[i].modules.length;
                    for(var act=0; act<noOfActivity.length; act++)
                    {
                       if(noOfActivity[act].visible == 1)
                        {
                          var fav = (noOfActivity[act].favorite == 'Yes') ? "<div class= 'favour acc_fav'></div>" :"<div class= 'favour acc_fav'></div>" ;
                       	  if (isDefined(noOfActivity[act].contents))
                       	  {
                            contentList = noOfActivity[act].contents[0];
                            modURL = noOfActivity[act].url+token;
                            var modName= noOfActivity[act].name;
                            dataModName = modName;
                            kellyItems = jQuery.trim(modName.substr(0,3));
                            modName = (kellyItems != "CC:" ? modName:modName.substr(3));
                            fileUrl =  contentList.fileurl + token;
                            fileName = contentList.filename;
                            timecreated = contentList.timecreated;
				            timemodified = contentList.timemodified;
                            userid = contentList.userid ;

                            doctype = contentList.type;
                            if (isDefined(fileName)) {
                                fileUrl = contentList.fileurl + token;
                                fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                                pageCount = contentList.pageno;
                                if (fileType === 'mp4' || fileType === 'webm') {
                                    if (isDevice() && fileType === 'mp4') {
                                        mediaType = true;
                                    } else if ((getBrowserName().mozilla && fileType === 'mp4') || (getBrowserName().chrome && fileType === 'mp4') || (getBrowserName().safari && fileType === 'mp4')) {
                                        mediaType = true;
                                    } else {
                                        mediaType = false;
                                    }
                                }
                                else { /* PDF and DOC files*/
                                    mediaType = true;
                                }
                            }
                            pageCount = contentList.pageno;
                        }

                        var opactityVal='',count='',showavailability = (noOfActivity[act].showavailability == 2)? 'dsbl' : '';
                        if( act < noofAct){
                                if( act == 0 ){
                                    jQuery('<div class="swiper-container parentNode parent' +i+ ' dragend-page" data-parentviewed="false" data-direction=""><div class="swiper-wrapper"></div></div>').appendTo(jQuery(".course-accordion").find(".verticalSwipe"));
                                }
                                if(res[i].logo == 1)
                                    opactityVal = 4;
                                else
                                    opactityVal = 6;
                                if(res[i].modules.length > 6)
                                 	count = 6;
                                else
                                  count = res[i].modules.length;

                                  mod_type = noOfActivity[act].modname;
                                _activityName= noOfActivity[act].name;
                                var actPrefix = jQuery(_activityName.split(':'))[0];

                                if(actPrefix =="aa" || actPrefix =="bb" || actPrefix =="bbe" || actPrefix =="dd" || actPrefix == 'aae')
                                {
                                    fileType = "quiz";
                                    modURL =noOfActivity[act].url+token;
                                    if(  act == ( res[i].section_position-1) ){
                                        tileElement += '<div  class="swiper-slide BLOCK'+i+' activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename=' +fileName+ ' data-pagecount="' +0+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
                                    }else{
                                       // tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename=' +fileName+ ' data-pagecount="' +0+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
                                     if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
								     {
								        var modUrl =noOfActivity[act].url+token;
								        var fileName ='',userid=null,timecreated='',timemodified='',courseID='';
								       	tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type="quiz" data-modurl='+modUrl+ ' data-url='+modUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								     }else {
									       tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename=' +fileName+ ' data-pagecount="' +0+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

									  }

                                    }
                                }else {
                                    if(  act == ( res[i].section_position-1) ){
                                      if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
							           {
							            modURL = noOfActivity[act].url+token;
							        	tileElement += '<div  class="swiper-slide BLOCK'+i+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

								       }else
                                        tileElement += '<div  class="swiper-slide BLOCK'+i+' activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+fileUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
                                    }else{
                                        //tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+fileUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
                                       if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
								     {
								        var modUrl =noOfActivity[act].url+token;
								        var fileName ='',userid=null,timecreated='',timemodified='',courseID='';
								       	tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type="quiz" data-modurl='+modUrl+ ' data-url='+modUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								     }else {
									    tileElement += '<div  class="swiper-slide activity sequence'+act+' outline_border" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+fileUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

									  }
                                    }
                                }

                                //activityImage = jQuery(noOfActivity[act].description).find('img').attr('src');
                            //    activityImage = jQuery(noOfActivity[act].tile_content).attr('src');
                                activityPrefix = jQuery(noOfActivity[act].name.split(':'))[0];
                                activityQuizName = jQuery(noOfActivity[act].name.split(':'))[1];
                                if (mediaType) {
                                    if(kellyItems != "CC:"){
                                        switch(fileType){
                                            case "pdf":
                                            case "doc":
                                            courseIcon = '<img class="phoneImage" src="../images/course_icon_book.png" />';
                                            break;
                                            case "mp4":
                                            courseIcon = '<img class="phoneImage" src="../images/course_icon_clapboard.png" />';
                                            break;
                                            case "mp3":
                                            courseIcon = '<img class="phoneImage" src="../images/course_icon_headphn.png" />';
                                            break;
                                            default:
                                            courseIcon = '<img class="phoneImage" src="../images/course_icon_quiz.png" />';
                                            break;
                                        }
                                    }
                                        if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
								         courseIcon= '<img class="phoneImage" src="../images/course_icon_quiz.png" />';
							    }
                                else if(doctype =="url")
                                {
                                    if(kellyItems != "CC:")
                                    {
                                        courseIcon= noOfActivity[act].modicon;
                                    }
                                    else
                                    {
                                       courseIcon = '<img class="phoneImage" src="../images/course_icon_clapboard1.png" />';
                                    }
                                }
                                else if (mod_type === "quiz")
                                {
                                    if(kellyItems != "CC:")
                                    {
                                        ccourseIcon= '<img src="../images/course_icon_puzzle.png"/>';
                                    }
                                    else
                                    {
                                        courseIcon= '<img class="phoneImage" src="../images/course_icon_quiz.png" />';
                                    }

                                }
                                if(activityPrefix =="CC")
                                {
                                    courseIcon = '<img class="phoneImage" src="../images/course_icon_clapboard1.png" />';
                                }
                                else if(activityPrefix =="CC1")
                                {
                                    courseIcon = '<img class="phoneImage" src="../images/course_icon_clapboard1.png" />';
                                }else if(activityPrefix =="CC2")
                                {
                                    courseIcon = '<img class="phoneImage" src="../images/course_icon_clapboard1.png" />';
                                }
                                else if(activityPrefix =="aa" || activityPrefix =="bb" || activityPrefix =="bbe"  ||activityPrefix =="dd" || activityPrefix =="aae")
                                {
                                    courseIcon = '<img class="phoneImage" src="../images/course_icon_puzzle.png" />';
                                }
                             /*   if(activityImage != undefined)
                                {
                                    tileElement += '<div class="imgBorder"><img class="phoneImage" src="'+activityImage+'"></div></div>';
                                }else
                                {
                                    tileElement += '<div class="imgBorder">'+courseIcon+'</div></div>';
                                }*/
								  if(noOfActivity[act].tile_content != undefined || noOfActivity[act].tile_content != null )
							   {
							       activityImage = noOfActivity[act].tile_content;
								   var image = jQuery(activityImage).attr('src');
								  if(image != undefined)
								   {
								        activityImage = jQuery(noOfActivity[act].tile_content).attr('src');
										tileElement += '<div class="imgBorder"><img class="phoneImage" src="'+activityImage+'"></div></div>';
								   }
								   else
								   {
								     activityText = noOfActivity[act].tile_content;
									 tileElement += '<div class="imgBorder"><img class="phoneImage" src="'+activityText+'"></div></div>';
								   }
							   }else
								{
								      tileElement += '<div class="imgBorder">'+courseIcon+'</div></div>';
								}
								if(res[i].logo == 1 && act >= 3 && !logoFLAG ){ // For Logo condition todisplay
								tileElement += '<div class="slider-logo swiper-slide outline_border swiper-slide-visible swiper-slide-active" data-viewed="false" data-logo="true" data-parentid="1" data-rowid="2"   style="width: 300px; height: 220px;"><div class="imgBorder"><img src="../images/mobile_cliniqueLogo.png" style="width:100%;height:100%"/></div></div>';
								logoFLAG = true;
							}

                        }
                     }
                    }
                    jQuery(tileElement).appendTo(jQuery(".parent" +i+ "").find(".swiper-wrapper"));
                    jQuery('<div class="pagination'+i+' courseItemPagination"></div>').appendTo(jQuery(".parent" +i+ ""));
                    jQuery(".parent" +i+ "").swiper({
                                                        pagination: '.pagination'+i+'',
                                                        paginationClickable: true
                                                    });

                }
	      }
            });
            /*  artf1031227 changes  */

			jQuery(".slider-logo").each(function(){
						if(jQuery(this).next().hasClass("swiper-slide")){
							jQuery(this).next().remove();
						}
					});
			 /* artf1031227 changes  */
            jQuery(".course-accordion").find(".parentNode").each(function(index){
                 if( index == 0){
                    verticalDistance[index] = '120';
                    jQuery(this).attr('data-direction','' +verticalDistance[index]+ '');

                    verticalPagination += '<span class="verticalswiper-pagination-switch swiper-visible-switch swiper-active-switch verti'+index+'" data-index="'+index+'" data-direction="' +verticalDistance[index]+ '"></span>';
                 }else{
                   verticalDistance[index] = '' +( parseInt(verticalDistance[verticalDistance.length - 1]) + 220 )+ '';
                   jQuery(this).attr('data-direction','' +verticalDistance[index]+ '');

                   verticalPagination += '<span class="verticalswiper-pagination-switch verti'+index+'" data-index="'+index+'" data-direction="' +verticalDistance[index]+ '"></span>';
                 }

            });
            jQuery('<div class="verticalPagination">'+verticalPagination+'</div>').insertAfter(".course-accordion .verticalDemo");

            topicObject.topic = topicBlocks;
            var topicElement='';
            jQuery.each(topicObject, function(i, topicData){
                jQuery.each(topicData, function(j, data){
                    topicElement='';
                    topicElement+= '<div  class="swiper-slide outline_border tilt imgBrder" data-name="" data-modid="" data-type="" data-modurl="" data-url="" data-filename="">';
                    topicElement+= '<div class="imgBorder">'+((data.TopicImage != "undefined") ? data.TopicImage : '<span>'+data.TopicName+'</span>' )+'</div></div>';
					if(data.section_position == 0)
                        jQuery('.parent'+(j+1)+' .swiper-wrapper').prepend(topicElement);
					if( data.section_position > 0 ){
					 jQuery('.parent'+(j+1)+' .swiper-wrapper').find('.'+data.BlockID+'').after(topicElement);
					}
				});
            });
            var previousVertical = '.verti0', newVertical='';
            jQuery('.verticalswiper-pagination-switch').off().on("click",function(event){
              jQuery(this).toggleClass("swiper-active-switch");
              var node = document.getElementById('verticalDemo');
                 if( jQuery(this).index() == 0 ){
                     node.style.webkitTransform="translateY(-0px)";
                 }else if(  jQuery(".course-accordion").find('.parentNode').length == (jQuery(this).index() + 1) ){

                     node.style.webkitTransform="translateY(-" +jQuery(this).prev().attr('data-direction')+ "px)";

                 }else{
                    node.style.webkitTransform="translateY(-" +jQuery(this).prev().attr('data-direction')+ "px)";
                 }
                 jQuery(""+previousVertical+"").removeClass("swiper-active-switch");
                 newVertical = '.verti'+jQuery(this).index()+'';
                 jQuery(".verticalPagination "+newVertical+"").addClass("swiper-active-switch");
                 previousVertical = newVertical;
              return false;
            });

            jQuery(".parentNode").on('swipeleft', function(){ /*...*/ })
            .on('swiperight', function(){ /*...*/ })
            .on('swipeup', function(){
                if( jQuery(".swiper-container").css('width') == "200px" ){
                    jQuery(".course-accordion").find(".parentNode").each(function(index){
                         if( index == 0 ){
                           jQuery(this).attr('data-direction',''+(isAndroid()?'170':'200')+'');
                         }else{
                           jQuery(this).attr('data-direction','' +( parseInt(jQuery(".parent"+(index)+"").attr('data-direction')) + (isAndroid()?180:200) )+ '');
                         }
                    });
                }else if( jQuery(".swiper-container").css('width') == "300px" ){
                    jQuery(".course-accordion").find(".parentNode").each(function(index){
                     if( index == 0 ){
                      jQuery(this).attr('data-direction','120');
                     }else{
                      jQuery(this).attr('data-direction','' +( parseInt(jQuery(".parent"+(index)+"").attr('data-direction')) + 220 )+ '');
                     }
                    });
                }
                var node = document.getElementById('verticalDemo'), switchIndex=null, selectedIndex = jQuery(this).index();
                if( jQuery(this).index() == 0 ){
                 node.style.webkitTransform="translateY(-0px)";
                }else if( jQuery(this).prev().prev().attr('data-direction') == undefined ){
                 node.style.webkitTransform="translateY(-0px)";
                }else{
                 node.style.webkitTransform="translateY(-" +jQuery(this).prev().prev().attr('data-direction')+ "px)";
                }

                jQuery(".verticalPagination").find(".verticalswiper-pagination-switch").each(function(index){
                  if( jQuery(this).hasClass("swiper-active-switch") ){
                   jQuery(this).removeClass("swiper-active-switch");
                  }
                  if( index == selectedIndex ){
                   switchIndex = selectedIndex;
                  }
                });
                if( switchIndex == 0 ){
                 jQuery(".verticalPagination .verti"+(switchIndex)+"").addClass("swiper-active-switch");
                 previousVertical = ".verti"+(switchIndex)+"";
                }else {
                 jQuery(".verticalPagination .verti"+(switchIndex-1)+"").addClass("swiper-active-switch");
                 previousVertical = ".verti"+(switchIndex-1)+"";
                }

            })
            .on('swipedown', function(){
                if( jQuery(".swiper-container").css('width') == "200px" ){
                    jQuery(".course-accordion").find(".parentNode").each(function(index){
                       if( index == 0 ){
                        jQuery(this).attr('data-direction',''+(isAndroid()?'170':'200')+'');
                       }else{
                        jQuery(this).attr('data-direction','' +( parseInt(jQuery(".parent"+(index)+"").attr('data-direction')) + (isAndroid()?180:200) )+ '');
                       }
                    });
                }else if( jQuery(".swiper-container").css('width') == "300px" ){
                    jQuery(".course-accordion").find(".parentNode").each(function(index){
                     if( index == 0 ){
                      jQuery(this).attr('data-direction','120');
                     }else{
                      jQuery(this).attr('data-direction','' +( parseInt(jQuery(".parent"+(index)+"").attr('data-direction')) + 220 )+ '');
                     }
                    });
                }
                var node = document.getElementById('verticalDemo'), switchIndex=null, selectedIndex = jQuery(this).index();

                if( jQuery(".course-accordion").find('.parentNode').length == (jQuery(this).index() + 1)){
                 node.style.webkitTransform="translateY(-" +jQuery(this).prev().attr('data-direction')+ "px)";
                }else{
                 node.style.webkitTransform="translateY(-" +jQuery(this).attr('data-direction')+ "px)";
                }

                jQuery(".verticalPagination").find(".verticalswiper-pagination-switch").each(function(index){
                     if( jQuery(this).hasClass("swiper-active-switch") ){
                        jQuery(this).removeClass("swiper-active-switch");
                     }
                     if( index == selectedIndex ){
                        switchIndex = selectedIndex;
                     }
                });
                if( (switchIndex+1) == jQuery(".course-accordion").find('.parentNode').length ){
                    jQuery(".verticalPagination .verti"+(switchIndex)+"").addClass("swiper-active-switch");
                    previousVertical = ".verti"+(switchIndex)+"";
                }else {
                    jQuery(".verticalPagination .verti"+(switchIndex+1)+"").addClass("swiper-active-switch");
                    previousVertical = ".verti"+(switchIndex-1)+"";
                }
            });
        },
        courseItemSuccess: function (res){
            var self = this, modNamelen, token, user_Id;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                token = ('&token=' + JSON.parse(window.localStorage.getItem("USER")).token);
                user_Id = JSON.parse(window.localStorage.getItem("USER")).id;
            } else {
                token = ('&token=' + JSON.parse($.jStorage.get("USER")).token);
				user_Id = JSON.parse($.jStorage.get("USER")).id;
            }
            var i = 0, modName = "", modUrl = null, modID = null, listLi = "", mediaType = false, topicDiv = "", pageCount = 0, collapse = "", contentList = null, fileName = '', fileType = '', fileUrl = '', isCollapse = "", moduleList = "", clList = "", courseContent = null, courseModules = null, kellyItems = "", courseIcon = "", dataModName = "";
            var activeTopic, activeInd;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                activeTopic = window.localStorage.getItem("activeTopic");
                window.localStorage.setItem("courseContents", JSON.stringify(res));
            } else {
                activeTopic = $.jStorage.get("activeTopic");
                $.jStorage.set("courseContents", JSON.stringify(res));
            }
            var errorRec = '<li><a href="javascript:void(0);"><span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt" data-msg="current_no_records"></span></a></li>';
            jQuery.each(res, function(i, courseContent){
                if(0 < i && parseInt(courseContent.visible) !== 0 && i <= courseContent.numsections ) {
                    courseModules = courseContent.modules;
                    var courseID = courseContent.id;
                    collapse = "collapse" + i;
                    topicDiv = '<div class="accordion-group acc_tpcurv" data-id="' + courseContent.id + '"><div class="accordion-heading accor_selctd"><div class="top-lft-crv"></div><div class="top-rgt-crv"></div><div class="bot-lft-crv"></div><div class="bot-rgt-crv"></div>' +
                    '<a class="accordion-toggle acc_topic topic_sel" data-toggle="collapse" data-parent="#accordion2" href="#' + collapse + '">' + courseContent.name + '</a></div>';
                    clList = "";
                    if (isDefined(courseModules)) {
                        jQuery.each(courseModules, function(j, moduleList) {
                            modID = moduleList.id;
                            modName = moduleList.name;
							modNamelen = modName.length;
                            dataModName = modName;

                            kellyItems = jQuery.trim(modName.substr(0,3));
							if((kellyItems == 'CC1') || (kellyItems == 'CC2' ))
							{
							modName = modName.substr(4,modNamelen);
							}else if(kellyItems == 'CC:')
							{
							modName = modName.substr(3,modNamelen);
							}
							else
							{
							modName = modName;
							}
							modUrl = ( isDevice() ) ? moduleList.url : moduleList.url + token;
                            var fav = (moduleList.favorite == 'Yes') ? "<div class= 'favour acc_fav'></div>" :"<div class= 'favour acc_ntfav'></div>" ;
                            var showavailability = (moduleList.showavailability == 2)? 'dsbl' : '' ;
                            if (isDefined(moduleList.contents)) {
                                contentList = ( isDevice() ? moduleList.contents : moduleList.contents[0]);
                                fileName = contentList.filename;
                                userID = contentList.userid;
                                timeCreated = contentList.timecreated;
                                timeModified = contentList.timemodified;

                                var doctype = contentList.type;
                                if (isDefined(fileName)) {
                                    fileUrl = ( isDevice() ) ? contentList.fileurl :contentList.fileurl + token;
                                    fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                                    pageCount = contentList.pageno;
                                    if (fileType === 'mp4' || fileType === 'webm') {
                                        if (isDevice() && fileType === 'mp4') {
                                            mediaType = true;
                                        } else if ((getBrowserName().mozilla && fileType === 'mp4') || (getBrowserName().chrome && fileType === 'mp4') || (getBrowserName().safari && fileType === 'mp4') || (getBrowserName().msie && fileType === 'mp4')) {
                                            mediaType = true;
                                        } else {
                                            mediaType = false;
                                        }
                                    }
                                    else { /* PDF and DOC files*/
                                        mediaType = true;
                                    }
                                    if (mediaType) {
									   if(kellyItems == "CC1" ){
                                            courseIcon = '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/>';
                                        } else if(kellyItems == "CC2" || kellyItems == "CC:"){
										courseIcon = '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%;border-radius:5px;-webkit-border-radius: 5px"/>';
										}else {
                                            switch(fileType){
                                                case "pdf":
                                                case "doc":
                                                    courseIcon = '<img src="../images/course_icon_book.png"/>';
                                                    break;
                                                case "mp4":
                                                    courseIcon = '<img src="../images/course_icon_clapboard.png"/>';
                                                    break;
                                                case "mp3":
                                                    courseIcon = '<img src="../images/course_icon_headphn.png"/>';
                                                    break;
                                                default:
                                                    courseIcon = '<img src="../images/course_icon_book.png"/>'; /*Default Image*/
                                                    break;
                                            }
                                        }
                                        clList += '<li class="check"><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + pageCount + '" data-type="' + fileType + '" data-name="' + dataModName + '" data-filename="' +fileName+ '" data-modurl="' + modUrl + '" data-url="' + fileUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class= "courseItem myCourse '+showavailability+'">' +
                                        '<span class="courseItem-left"></span><span class="courseicon" style="' + (kellyItems == "CC2" || kellyItems == "CC:" ? "border: 1px #F8F8F8 solid;" : "") + '"><table><tr><td valign="middle" width="100%" height="100%">' + courseIcon + '</td></tr></table></span><span class="courseItem-right"></span>' +
                                        '<span class="coursetxt">' + modName + '</span></a></li>';
                                    }
                                    else {
                                        clList += errorRec;
                                    }
                                }
                                else if (doctype == 'url') {
								   fileUrl = contentList.fileurl;
									pageCount = contentList.pageno;
								   if(kellyItems == "CC1")
								   {
											clList += '<li class="check"><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + pageCount + '" data-type="html" data-name="' + dataModName + '" data-modurl="' +  fileUrl+ '" data-url="' +  modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
											'<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/></span><span class="courseItem-right"></span>' +
											'<span class="coursetxt">' + modName + '</td></tr></table></span></a></li>';
									} else if(kellyItems == "CC2" || kellyItems == "CC:") {
									         clList += '<li class="check"><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + pageCount + '" data-type="html" data-name="' + dataModName + '" data-modurl="' +  fileUrl+ '" data-url="' +  modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
											'<span class="courseItem-left"></span><span class="courseicon" style="border: 1px #F8F8F8 solid;"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%;"/></td></tr></table></span><span class="courseItem-right"></span>' +
											'<span class="coursetxt">' + modName + '</span></a></li>';
									}
									else
									{
									     clList += '<li class="check"><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + pageCount + '" data-type="html" data-name="' + dataModName + '" data-modurl="' +  fileUrl+ '" data-url="' +  modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
											'<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="' + (kellyItems != "CC2" ? moduleList.modicon : "../images/course_icon_clapboard1.png") + '"></td></tr></table></span><span class="courseItem-right"></span>' +
											'<span class="coursetxt">' + modName + '</span></a></li>';
									}
								  }
                                else {
                                      if (moduleList.modname === "quiz") {
									    if(kellyItems == "CC1")
								        {
									     clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour"> '+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + fileUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
                                        '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
										}else if((kellyItems == "CC2") || (kellyItems == "CC:")){
										 clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour"> '+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + fileUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
                                        '<span class="courseItem-left"></span><span class="courseicon" style="border: 1px #F8F8F8 solid;"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%;"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
										}else
										{
										 clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour"> '+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + fileUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-timemodified="'+timeModified+'" data-timecreated="'+timeCreated+'" class="courseItem myCourse '+showavailability+'">' +
                                        '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_puzzle.png"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
										}
								    }else if( moduleList.modname === "game" ){
                                        clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="puzzle" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-quiz_CourseId="'+moduleList.courseid+'"  class="courseItem myCourse '+showavailability+'">' +
                                        '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_quiz.png"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
                                    }
								 }
                            }else{
								var quizActivity,  quizActivityName, typename, quiz_CourseId,img_Src,_imgStyle;
								quizActivity = jQuery(modName.split(':'))[0];
								quizActivityName = jQuery(modName.split(':'))[1];
                                userID = null;
                                quiz_CourseId = moduleList.courseid;

								if (moduleList.modname === "quiz" && (quizActivity == 'bb' || quizActivity == 'aa' || quizActivity == 'dd' || quizActivity == 'bbe' || quizActivity == 'aae' )) {  /*Widget Items*/
								     if(kellyItems == "CC1")
								     {
								     clList += '<li><a href="javascript:void(0);" style="float:none;"</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + quizActivityName + '</span></a></li>';
									}else if((kellyItems == "CC2") || (kellyItems == "CC:"))
								     {
								     clList += '<li><a href="javascript:void(0);" style="float:none;"</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon" style="border: 1px #F8F8F8 solid;"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%;"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + quizActivityName + '</span></a></li>';
									}else
									{
									 clList += '<li><a href="javascript:void(0);" style="float:none;"</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_puzzle.png"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + quizActivityName + '</span></a></li>';
									}
                                }
                                else{
								   if(kellyItems == "CC1")
								     {
								    clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
									}else  if((kellyItems == "CC2") || (kellyItems == "CC:"))
								     {
								    clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="quiz" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon" style="border: 1px #F8F8F8 solid;"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%;"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
									}else if(moduleList.modname == 'scorm' && !isDevice()){
									 clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="scorm" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon" style="border: 1px #F8F8F8 solid;"><table><tr><td valign="middle" width="100%" height="100%"><img src="../images/scorm_icon.png" style="width:100%;height:100%;"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
									}else
									{
                                        typename = 'quiz';
                                        img_Src='../images/course_icon_quiz.png';
                                        _imgStyle='';
                                        if( moduleList.modname == 'scorm' && isDevice() ){
                                            typename = 'scorm';
                                            img_Src='../images/scorm_icon.png';
                                            _imgStyle='width:100%;height:100%';
                                            if( isAndroid() ){
                                                 modUrl = ""+moduleList.manifest_path+"imsmanifest.xml";
                                            }else{
                                                modUrl = ""+moduleList.manifest_path+"/imsmanifest.xml";
                                            }
                                        }
										if( moduleList.modname == 'game' && isDevice() ){
                                            typename = 'puzzle';
                                        }	
									clList += '<li><a href="javascript:void(0);" style="float:none;" class="course-favour">'+fav+'</a><a href="javascript:void(0);" data-modid="' + modID + '" data-pagecount="' + 0 + '" data-type="'+typename+'" data-name="' + dataModName + '" data-modurl="' + modUrl + '" data-url="' + modUrl + '" data-userID="' +userID+ '" data-courseID="' +courseID+ '" data-quiz_CourseId="'+quiz_CourseId+'"  class="courseItem myCourse '+showavailability+'">' +
                                    '<span class="courseItem-left"></span><span class="courseicon"><table><tr><td valign="middle" width="100%" height="100%"><img src="'+img_Src+'" style="'+_imgStyle+'"/></td></tr></table></span><span class="courseItem-right"></span><span class="coursetxt">' + modName + '</span></a></li>';
									}
                                }
                            }
                        });
                    } else {
                        clList += errorRec;
                    }
                    if(!!activeTopic){
                        activeInd = parseInt(activeTopic) + 1;
                        if(activeInd == 0) {
							activeInd = 1;
						}
                    }else{
                        activeInd = 1;
                    }
                    isCollapse = (i == activeInd) ? "in" : "";
                    listLi += topicDiv + '<div id="' + collapse + '" class="accordion-body collapse ' + isCollapse + '"><div class="accordion-inner acc_contntbg"><div class="acc_tilebx">' +
                    '<ul>' + clList + '</ul></div></div></div></div>';
                }
            });
            jQuery('.course-accordion').html(listLi);
            jQuery('div.course-accordion:last > div.accordion-group:last > div.accordion-heading:last').live('click', function (){
                if($(this).siblings('div.in').length){
                    $(this).addClass('no-border-radius');
                }else{
                    $(this).removeClass('no-border-radius');
                }
            });
			if(isiOS()){
				$('div.accordion-heading a').on("click", function (){
					jQuery(".widget-maincontent-div > .courseicon + .pro_container").removeAttr("style");
				});
			}
            loadAllLanguages();
			 $('.rounded').each(function() {
			    //console.log("Rounded");
				$(this).html("<a style='border:1px solid black'>Round</a>");
				PIE.attach(this);
			});
        },
        tileItemSuccess: function(res){
			     var self = this,activityPrefix,activityQuizName,modname;
                 var mod_type,doctype ,dataModName,kellyItems, _activityName="", topicBlocks=[], topicObject={}, logoFLAG,noofAct = '',activityImage;
                 var gridName=['b','c','d','e','f','f','f'],modURL="",fileUrl ="",contentList="",pageCount="",fileType="",fileName="",mediaType="",x,y,n=0,ny=0,rotINT,rotYINT;
				 var token, courseIcon='', tokenTile;
                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        token = ('&token=' + JSON.parse(window.localStorage.getItem("USER")).token);
                        tokenTile = ('?token=' + JSON.parse(window.localStorage.getItem("USER")).token);
                    } else {
                        token = ('&token=' + JSON.parse($.jStorage.get("USER")).token);
                        tokenTile = ('?token=' + JSON.parse($.jStorage.get("USER")).token);
                    }
                 var userid = '', timecreated='', timemodified='';
				 jQuery('.course-accordion').find('.ui-content').remove();

				 jQuery('.course-accordion').addClass('right-side');

				 jQuery('<div data-role="main" class="ui-content"> </div>').appendTo('.course-accordion');
                 jQuery.each(res, function(i, courseContent){
		  if(i < 6)
		   {
                    if(0 < i && parseInt(courseContent.visible) !== 0 && i <= courseContent.numsections )
					{
                        courseID = courseContent.id;
                        noOfActivity = courseContent.modules;
                        var src = '';
                        if( res[i].heading != null){
                           src = res[i].heading;
                        }else if( res[i].tile_content != null ){
                           src = jQuery(res[i].tile_content).attr('src') + tokenTile;
                        }else{
                           src = undefined;
                        }
                        //var src = ( jQuery(res[i].summary).find('img').attr('src') != undefined )? (jQuery(res[i].summary).find('img').attr('src') + tokenTile) : undefined;

                        topicBlocks.push({
                        					"section_position":""+res[i].section_position+"",
                        					"TopicName":""+res[i].name+"",
                                            "TopicImage":""+((src != undefined ) ? "<img src="+src+">" : src)+"",
                        					"BlockID":"BLOCK"+i+"",
											"Modules":""+res[i].modules.length+"",
											"LOGOFLAG":""+res[i].logo+""
                        				});

                        if(res[i].section_position > 0)
                        {

                          if(res[i].section_position > res[i].modules.length)
						  res[i].section_position= res[i].modules.length;
						}
					    var tileElement='',logoFLAG=false;
						var count=res[i].modules.length;
						var logoposition = 2;
						if(noOfActivity.length >=6){
                         		noofAct = 6;
                         }else{
                            noofAct=noOfActivity.length;
						 }
						 if(res[i].logo == 1){
							 if(noOfActivity.length > 4)
							 {
							 noOfActivity.length = 4;
							 noofAct = 4;
							 }
						}

						var countActivity = res[i].modules.length;
					    for(var act=0; act<noOfActivity.length; act++)
                        {
                        if(noOfActivity[act].visible == 1)
                        {
                         var fav = (noOfActivity[act].favorite == 'Yes') ? "<div class= 'favour acc_fav'></div>" :"<div class= 'favour acc_fav'></div>" ;
						   if (isDefined(noOfActivity[act].contents))
						   {
						    contentList = noOfActivity[act].contents[0];
						    modURL = noOfActivity[act].url+token;
							modName= noOfActivity[act].name;
				            dataModName = modName;
                            kellyItems = jQuery.trim(modName.substr(0,3));
                            modName = (kellyItems != "CC:" ? modName:modName.substr(3));
				            fileUrl =  contentList.fileurl + token;
							fileName = contentList.filename;
                            timecreated = contentList.timecreated;
				            timemodified = contentList.timemodified;
                            userid = contentList.userid ;

							   doctype = contentList.type;

                                if (isDefined(fileName)) {
                                    fileUrl = contentList.fileurl + token;
                                    fileType = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

                                    pageCount = contentList.pageno;
                                    if (fileType === 'mp4' || fileType === 'webm') {
                                        if (isDevice() && fileType === 'mp4') {
                                            mediaType = true;
                                        } else if ((getBrowserName().mozilla && fileType === 'mp4') || (getBrowserName().chrome && fileType === 'mp4') || (getBrowserName().safari && fileType === 'mp4')) {
                                            mediaType = true;
                                        } else {
                                            mediaType = false;
                                        }
                                    }
                                    else { /* PDF and DOC files*/
                                        mediaType = true;
                                    }
							 }
							 pageCount = contentList.pageno;
						}

							  var showavailability = (noOfActivity[act].showavailability == 2)? 'dsbl' : '' ;

						if( act < noofAct){
							    if( act == 0 ){
                                    jQuery('<div class="ui-grid-d ui-responsive tile-margin parentNode parent' +i+ '" data-parentviewed="false" ></div>').appendTo(jQuery(".ui-content"));
                                }
								if(i >2)
                                {
								if(noOfActivity.length< 3)
								{
							      if( ( i == 1 && act == 0 ) ||( i == 5 && act == 0) ) {
                                    jQuery('<div class="ui-block-a tilt" style="opacity:0;"></div>').appendTo(jQuery(".parent" +i+ ""));
								  }
								}
								}
							   _activityName= noOfActivity[act].name;
							 	var actPrefix = jQuery(_activityName.split(':'))[0];
							    mod_type = noOfActivity[act].modname;
							   if(actPrefix =="aa" || actPrefix =="bb" || actPrefix =="bbe" || actPrefix =="dd" || actPrefix =="aae")
							   {
								   fileType = "quiz";
								   modURL =noOfActivity[act].url+token;
									if(  act == ( res[i].section_position-1) ){
									tileElement += '<div  class="ui-block-'+gridName[act]+' BLOCK'+i+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename=' +fileName+ ' data-pagecount="' +0+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								   }else{
								        if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
								     {
								        var modUrl =noOfActivity[act].url+token;
								        var fileName ='',userid=null,timecreated='',timemodified='',courseID='';
								       	tileElement += '<div  class="ui-block-'+gridName[act]+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type="quiz" data-modurl='+modUrl+ ' data-url='+modUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

								     }else {
									   tileElement += '<div  class="ui-block-'+gridName[act]+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename=' +fileName+ ' data-pagecount="' +0+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								      }
								   }
							  }else {
							      if(  act == ( res[i].section_position-1) ){
							        if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
							        {
							            modURL = noOfActivity[act].url+token;
							        	tileElement += '<div  class="ui-block-'+gridName[act]+' BLOCK'+i+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+modURL+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

								    }else
									tileElement += '<div  class="ui-block-'+gridName[act]+' BLOCK'+i+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+fileUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								   }else{
								    if(mod_type == "game" || actPrefix =="VQ" || mod_type == "quiz")
								     {
								        fileType = "quiz";
								        var modUrl =noOfActivity[act].url+token;
								        var fileName ='',userid=null,timecreated='',timemodified='',courseID='';
								       	tileElement += '<div  class="ui-block-'+gridName[act]+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type="quiz" data-modurl='+modUrl+ ' data-url='+modUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';

								     }else {
									tileElement += '<div  class="ui-block-'+gridName[act]+' activity sequence'+act+' outline_border rotateSkew tilt" data-viewed="false" data-logo="false" data-parentID="'+i+'" data-rowID="'+act+'" data-count="'+countActivity+'" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type='+fileType+' data-modurl='+modURL+ ' data-url='+fileUrl+' data-filename="' +fileName+'" data-courseID="' +courseID+ '" data-userID="' +userid+ '" data-timecreated="' +timecreated+ '" data-timemodified="' +timemodified+ '">';
								    }
								   }
							    }

						//	   activityImage = jQuery(noOfActivity[act].tile_content).attr('src');
								activityPrefix = jQuery(noOfActivity[act].name.split(':'))[0];
		                         activityQuizName = jQuery(noOfActivity[act].name.split(':'))[1];
								  if (mediaType) {
								     if(kellyItems != "CC:"){
									        switch(fileType){
                                                case "pdf":
                                                case "doc":
                                                    courseIcon = '<img src="../images/course_icon_book.png" style="width:100%;height:100%"/>';
                                                    break;
                                                case "mp4":
                                                    courseIcon = '<img src="../images/course_icon_clapboard.png" style="width:100%;height:100%"/>';
                                                    break;
                                                case "mp3":
                                                    courseIcon = '<img src="../images/course_icon_headphn.png" style="width:100%;height:100%"/>';
                                                    break;
                                                default:
                                                    courseIcon = '<img src="../images/course_icon_quiz.png" style="width:100%;height:100%"/>'; /*Default Image*/
                                                    break;
                                            }
                                       }

                                           if (mod_type === "game" || actPrefix =="VQ" || mod_type == "quiz")
                                            courseIcon= '<img src="../images/course_icon_quiz.png" style="width:100%;height:100%; "/>';
                                     }
                                  else if(doctype =="url")
								  {
								    if(kellyItems != "CC:")
									{
									courseIcon= noOfActivity[act].modicon;
									}
									else
									{
									courseIcon= '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/>';

									}
								}
								else if (mod_type === "quiz")
								{
								    if(kellyItems != "CC:")
									{
									ccourseIcon= '<img src="../images/course_icon_puzzle.png"/>';
									}
									else
									{
									courseIcon= '<img src="../images/course_icon_quiz.png" style="width:100%;height:100%"/>';
									}

								}
								 if(activityPrefix =="CC")
								 {

								 courseIcon = '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/>';
								 }
								 else if(activityPrefix =="CC1")
								 {

								  courseIcon = '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/>';
								 }else if(activityPrefix =="CC2")
								 {

								 courseIcon = '<img src="../images/course_icon_clapboard1.png" style="width:100%;height:100%"/>';
								 }
								 else if(activityPrefix =="aa" || activityPrefix =="bb" || activityPrefix =="bbe"  ||activityPrefix =="dd" || actPrefix =="aae")
								 {
								 courseIcon = '<img src="../images/course_icon_puzzle.png" style="width:100%;height:100%"/>';
								 }
								 var activityText;

							   if(noOfActivity[act].tile_content != undefined || noOfActivity[act].tile_content != null )
							   {
							       activityImage = noOfActivity[act].tile_content;
								   var image = jQuery(activityImage).attr('src');
								  if(image != undefined)
								   {
								        activityImage = jQuery(noOfActivity[act].tile_content).attr('src');

										 tileElement += '<div class="ui-bar ui-bar-a topicAlign" style="height: 40px;padding-left: 0px;"><span><img class="imgSize" src="'+activityImage+'"></span></div></div>';
								   }
								   else
								   {
								     activityText = noOfActivity[act].tile_content;

									  tileElement += '<div class="ui-bar ui-bar-a topicAlign" style="height: 40px;padding-left: 0px;"><span>'+activityText+'</span></div></div>';
								   }
							   }else
								{
								tileElement += '<div class="ui-bar ui-bar-a" style="height: 40px;padding-left: 0px;"><span>'+courseIcon+'</span></div></div>';
								}



								if(res[i].logo == 1 && act > (noofAct-logoposition)  && !logoFLAG ){ // For Logo condition todisplay
                                if(navigator.platform == "iPad Simulator" || navigator.platform == "iPad")
                                 courseIcon = '<img src="../images/ipad_cliniqueLogo.png" style="width:100%;height:100%"/>';
                                else
								courseIcon = '<img src="../images/cliniqueLogo.png" style="width:100%;height:100%"/>';
                             	tileElement += '<div style="width:26.7%; padding: 0px !important; border: 2px solid #D8D8D8;" class="ui-block-'+gridName[act]+' outline_border rotateSkew" data-logo="true" data-name="' + _activityName + '" data-modid='+noOfActivity[act].id+' data-type="quiz" data-modurl='+modURL+' data-url='+modURL+'>'+'<span>'+courseIcon+'</span>'+'</div>';
								logoFLAG = true;
							}
                          }
                          }
                        }
						jQuery(tileElement).appendTo(jQuery(".parent" +i+ ""));
						jQuery(".ui-grid-d .child, .ui-grid-c .child").off('click').on('click', function(){

					       jQuery(this).toggleClass('HorizontalFlip');
					       return false;
						});
                     }
					 }
                 });

				topicObject.topic = topicBlocks;

				var topicElement='';
				jQuery.each(topicObject, function(i, topicData){
					jQuery.each(topicData, function(j, data){
						topicElement='';
						topicElement+= '<div  class="ui-block-f outline_border" data-name="" data-modid="" data-type="" data-modurl="" data-url="" data-filename="">';
						topicElement+= '<div class="ui-bar ui-bar-a topicAlign" style="padding-left: 0px;"><span>'+((data.TopicImage != "undefined") ? data.TopicImage : data.TopicName )+'</span></div></div>';

							if(data.section_position == 0)
                              	                           jQuery('.parent'+(j+1)+'').prepend(topicElement);
							if( data.section_position > 0 ){
							 jQuery('.parent'+(j+1)+' .'+data.BlockID+'').after(topicElement);
							}
						});
				});

				jQuery('<div class="ui-grid-ref ui-responsive tile-margin reflection parentreflection0"></div><div class="ui-grid-ref ui-responsive tile-margin reflection parentreflection1"></div>').appendTo(jQuery(".ui-content"));
                jQuery(""+jQuery(".ui-content .parentNode:nth-child("+jQuery(".ui-content").find('.parentNode').length+")").html()+"").appendTo(jQuery(".parentreflection0"));
                jQuery(""+jQuery(".ui-content .parentNode:nth-child("+jQuery(".ui-content").find('.parentNode').length+")").prev().html()+"").appendTo(jQuery(".parentreflection1"));

        },
        pdfViewServiceHit : function (servUrl){
            var self=this;
            jQuery.ajax({
                url: servUrl,
               cache:false,
				async:false,
				type:'POST',
				dataType:'json',
				crossDomain: true,
                success:function(res){
                },
                error:function(rs){
                }
            });
        },
        Addfavourite: function(fileurl, modId, fileType, fileTitle, fileNameUrl, _this){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data = {
                action:'create_favorite',
                token: userDetails.token,
                bookmarkurl: (fileurl != undefined ? fileurl : ''),
                title: modId+'@course@'+fileTitle+"@"+fileType+"@"+fileNameUrl
            };
            if( !isDevice() ){ 
              jQuery.ajax({
                url: serviceUrl,
                data: data,
                tcache:false,
				async:false,
				type:'POST',
				dataType:'json',
				crossDomain: true,
                success: function(res) {
                },
                error : function(x,y,z){

                }
              });
            }else if( isDevice() ){
            	data.uid=userDetails.id;
            	data.coursemoduleid = modId;
            	cordova.exec(
            			function(result) {
            				console.log("SUCCES="+JSON.parse(result));
            			},
            			function(result) {
            			},'OfflineServicePlugin', 'create_favorite', [data]);
            		
            }

        },
        Removefavourite: function(fileurl, modId, fileType, fileTitle,fileNameUrl, _this){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service;
            var userDetails;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data = {
                action:'remove_favorite',
                token: userDetails.token,
                bookmarkurl: (fileurl != undefined ? fileurl : ''),
                title: modId+'@course@'+fileTitle+"@"+fileType+"@"+fileNameUrl
            };
            if( !isDevice() ){
	            jQuery.ajax({
	                url: serviceUrl,
	                data: data,
	                cache:false,
				async:false,
				type:'POST',
				dataType:'json',
	                crossDomain: true,
	                success: function(res) {
	                },
	                error : function(x,y,z){
	
	                }
	            });
            }else if( isDevice() ){
            	data.uid=userDetails.id;
            	data.coursemoduleid = modId;
            	cordova.exec(
            			function(result) {
            				console.log("SUCCES="+JSON.parse(result));
            			},
            			function(result) {
            			},'OfflineServicePlugin', 'remove_favorite', [data]);
            }
        },
        downloadFile: function(self, courseItemData) {  /*downlad selected file into device*/
            if (isOnline("DontCheck")) {  /*check whether deveice in online*/
                var fileName = courseItemData.fileNameUpload;
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
                        /*Please wait.Your file will load in a few seconds.*/
                        fileTransfer.onprogress = function(progressEvent) {
						    jQuery("#load_wrapper, .overlaycontainer").show();
						};
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            courseItemData.fileURL = fileDir.fullPath;
                            self.loadFileinWeb(courseItemData); /*load downloaded file into iframe/ video*/
                        }, function(error) {

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

        },
        checkIfFileExists: function(self, courseItemData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap() && self.Download) {
                var isExists = false;
                var fileName = courseItemData.fileNameUpload;
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
                                //self.downloadFile(self, courseItemData);
                            	self.loadFileinWeb(courseItemData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, courseItemData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, courseItemData);
                });
            } else {
                self.loadFileinWeb(courseItemData);
            }
        },
        changeManifestFile: function(self,courseID,modID,courseItemData){
            var manifestxmlPath = window.localStorage.getItem("manifestURL");
            if( isiOS() && isPhoneGap() ){
	            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
	                 fileSystem.root.getFile("" + manifestxmlPath + "", null, function(fileEntry) {
	                         fileEntry.file(function(file) {
	                              self.readAsText(file, self,courseID,modID,courseItemData);
	                         }, self.fail);
	                 }, self.fail);
	            }, self.fail);
            }else{
            	self.loadFileinWeb(courseItemData);
            }
        },
        readAsText: function(file, self,courseID,modID,courseItemData){
            var xml = null;
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                xml = jQuery.parseXML(evt.target.result);
                jQuery(xml).find('item').each(function() {
                  jQuery(this).attr("identifier", "" + self.userID + "" + courseID + "" + modID + "");
                });
                var manifestxmlPath = window.localStorage.getItem("manifestURL");
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                 fileSystem.root.getFile("" + manifestxmlPath + "", {create: true, exclusive: false},
                 function(fileEntry) {
                            fileEntry.createWriter(function(writer) {
                                writer.onwriteend = function() {
                                    writer.truncate(11);
                                    writer.onwriteend = function() {
                                        writer.seek(0);
                                        writer.write("" + self.XMLtostr(xml) + "");
                                        writer.onwriteend = function() {
                                            self.loadFileinWeb(courseItemData);
                                        };
                                    };
                                };
                                writer.write("" + self.XMLtostr(xml) + "");
                             }, self.fail);
                 }, self.fail);
             }, self.fail);
            };
            reader.onerror = function() {
            };
            reader.readAsText(file);
        },
        fail: function(evt) {
          console.log("Manifest File Error : "+evt.code);
        },
        XMLtostr:function(xmlData){
            var xmlString = (new XMLSerializer()).serializeToString(xmlData);
            return xmlString;
        },
        videoTapped:function( tapped, self ){
            if((navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && isDevice() && self.video_tapped ){
                var data={};
                data.VideoTapped=tapped;
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'ElearningPlugin','videoTapped',[data]);
            }
        },
        loadFileinWeb: function(courseItemData) {
            var self = this;
            var fileType = courseItemData.fileType;
            var filePath = courseItemData.fileURL, androidData={};
            var language, androidDataVar, userID;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                androidDataVar = JSON.parse(window.localStorage.getItem("USER")).token;
                userID = JSON.parse(window.localStorage.getItem("USER")).id;
            } else {
                language = $.jStorage.get("language");
                androidDataVar = JSON.parse($.jStorage.get("USER")).token;
                userID = JSON.parse($.jStorage.get("USER")).id;
            }
            $('body').removeClass("scormPage");
			$('body').removeClass("quiz-main-container course-quiz-main-container");
            androidData.modID = self.modID;
            androidData.userID = userID;
            androidData.timemodified = self.timemodified;
            androidData.pdfURL = self.pdfURL;
            androidData.pdfToken = androidDataVar;
            androidData.language = ((language == null)?'en_us':language);
            androidData.serviceURl = self.globalConfig.apiAddress.service;
            self.AndroidVideoURl = filePath;
            androidData.isFavour = false;

            if(isDevice() && isPhoneGap() && this.override  ){
                jQuery("#load_wrapper, .overlaycontainer").show();
                self.courseItemFLAG = true;
                if( /Android/i.test(navigator.userAgent)  && (courseItemData.fileType === 'pdf' || courseItemData.fileType === 'mp4') ) {

                	cordova.exec(
                        function (args) {},
                        function (args) {},
                        'FileOpener', '' +((courseItemData.fileType === 'pdf')?'openFile':'openVideoFile')+ '', [((courseItemData.fileType === 'pdf')?androidData:filePath)]);

                    jQuery("#load_wrapper, .overlaycontainer").hide();
                     if( courseItemData.fileType != 'mp4'){
                        this.reloadCourseItems();
                        return false;
                     }
                }
                
                if( /Android/i.test(navigator.userAgent)  && (courseItemData.fileType === 'scorm') ){
                	var db = sqlitePlugin.openDatabase("CliniqueDB.db");
                	var manifestXML = window.localStorage.getItem("scormURL");
                    if( db ){
                    	scormDetailsInsert(db,self.userID,self.quizCourseId,self.modID,"true",function(){
                    		cordova.exec(
                                    function (args) {},
                                    function (args) {},
                                    'FileOpener','scorm',[manifestXML]);
                    	});
                   }
                    jQuery("#load_wrapper, .overlaycontainer").hide();
                	this.reloadCourseItems();
                    return false;
                }
            }
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && (courseItemData.fileType === 'pdf') && isPhoneGap() ){
                jQuery("#load_wrapper, .overlaycontainer").show();
                self.courseItemFLAG = true;
                var cordovalocalStrVal;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    cordovalocalStrVal = JSON.parse(window.localStorage.getItem("USER")).token
                } else {
                    cordovalocalStrVal = JSON.parse($.jStorage.get("USER")).token
                }
                cordova.exec(
                         function (args) {},
                         function (args) {},
                         'PDFViewerPlugin', 'openPdf', [self.modID, self.timemodified, self.pdfURL, cordovalocalStrVal, ((language == null)?'en_us':language), self.globalConfig.apiAddress.service, false]);
                this.reloadCourseItems();
                jQuery("#load_wrapper, .overlaycontainer").hide();
                return false;
            }
                                                                        
            if( courseItemData.fileType === 'scorm' && isPhoneGap() && isiOS() && isDevice() ){
                                                                        
                var db = sqlitePlugin.openDatabase("CliniqueDB.db");
                var manifestXML = window.localStorage.getItem("scormURL");
                if( db ){
                   scormDetailsInsert(db,self.userID,self.quizCourseId,self.modID,"true",function(){
                       cordova.exec(
                                    function (args) {},
                                    function (args) {},
                                    'PDFViewerPlugin','scorm',[manifestXML]);
                    });
                }
                jQuery("#load_wrapper, .overlaycontainer").hide();
                this.reloadCourseItems();
                return false;
            }
                                                                        
            jQuery("html, body").animate({ scrollTop: 0 }, "slow");
            // jQuery("#load_wrapper").show(); /** no need to show loader while tabbing cc video **/
            var breadcrumb_four = '';
			var prefix = jQuery.trim(courseItemData.fileName.substr(0,3));
			if(prefix =='CC:')
			breadcrumb_four= courseItemData.fileName.substr(3);
			else if((prefix =='CC1') ||(prefix =='CC2'))
			breadcrumb_four= courseItemData.fileName.substr(4);
			else
			breadcrumb_four=courseItemData.fileName;


            //breadcrumb_four = (jQuery.trim(courseItemData.fileName.substr(0,3)) != 'CC:' ? courseItemData.fileName:courseItemData.fileName.substr(3));
            var pageCount = parseInt(courseItemData.filepageCount);
            jQuery('.course-topics li:nth-child(3)').addClass('courshdnk topicspagenav').removeAttr('data-msg').html("<a href='#' data-msg='Topics'></a>");
            loadAllLanguages();
            jQuery('.newTopic').remove();
            jQuery(".course-topics ul").append("<li class='newTopic'>" + breadcrumb_four + "</li>");
            if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    try {
                        if (jQuery('.tpbreadcrumbs ul li').hasClass('newTopic')) {
                            $( ".tpbreadcrumbs ul .newTopic" ).prev().removeClass( "breadcrumbLastChld" );
                            $( ".tpbreadcrumbs ul .newTopic" ).addClass( "breadcrumbLastChld" );
                        }
                    }catch(e) {

                    }
            }
            jQuery('#accordion2').hide();
            jQuery("#content-webview").show();
            var coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
            $(".iframewrap_crs").find('.next_activity,.course_ifram_cls_btn,.previous_activity').remove();
			$(".iframewrap_crs").prepend('<div class="course_ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>').show();
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && (coursePrefix == "TL")){
              jQuery("#footer-menu").find('li').remove();
              if(fileType == 'pdf' || fileType === 'mp4' || fileType === 'mpeg' || fileType === 'mp3'){
						var element ='<li class="footer_Prevactivity"><a href="#"><span class="prevactivityicon"></span><span class="activitymenutxt" data-msg="Prev" ></span></a></li>';
						element +='<li class="footer_comment"><a href="#"><span class="commenticon"></span><span class="commentxt" data-msg="Comment"></span></a></li>';
						element +='<li class="footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
						element +='<li class="footer_Nextactivity"><a href="#"><span class="nextactivityicon"></span><span class="activitymenutxt" data-msg="Next"></span></a></li>';
             }else{
						var element ='<li class="footer_Prevactivity"><a href="#"><span class="prevactivityicon"></span><span class="activitymenutxt" data-msg="Prev" ></span></a></li>';
                        element +='<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
						element +='<li class="selected footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
						element +='<li class="footer_Nextactivity"><a href="#"><span class="nextactivityicon"></span><span class="activitymenutxt" data-msg="Next"></span></a></li>';
			 }
               jQuery(element).appendTo(jQuery("#footer-menu"));
            }else if(coursePrefix == "TL")
			{
			 $(".iframewrap_crs").prepend('<div class="next_activity iframebtn_align"><span><img src="../images/right_arrow.png"></span></div>').show();
			  $(".iframewrap_crs").prepend('<div class="previous_activity"><span><img src="../images/left_arrow.png"></span></div>').show();
			}
            self.courseItemFLAG = true;
			if (fileType === 'mp4' || fileType === 'mpeg' || fileType === 'mp3') {
                /* artf1048922  Fixed  added if condition*/
			     if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && (coursePrefix != "TL")){
                   jQuery("#footer-menu").find('li').remove();
                   var footerElement = '<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
                   footerElement +='<li class="footer_comment"><a href="#"><span class="commenticon"></span><span class="commentxt" data-msg="Comment"></span></a></li>';
                   footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
                   footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
                  jQuery(footerElement).appendTo(jQuery("#footer-menu"));
                }
                var videoType = (fileType === 'mp4') ? "video/mp4" : "audio/mp3";
				if(isDevice() && isPhoneGap()){
                    if( /Android/i.test(navigator.userAgent) && fileType === 'mp4') {
                       jQuery("#content-webview").find("video,iframe,.AndroidVideo,.shelfholder_mb_lt").remove();
                       jQuery('<div class="AndroidVideo"> <img src="../images/android_landscape.png" ></div>').appendTo(jQuery("#content-webview"));
                       jQuery('<div class="shelfholder_mb_lt" style="visibility:hidden;"></div>').appendTo(jQuery("#content-webview"));
                       return false;
                    }
				}
                if((navigator.platform == "iPad Simulator" || navigator.platform == "iPad") || !isDevice()){
                 jQuery('.commentNotes').show();
                }
                jQuery("#content-webview").find('video,iframe').remove();
                jQuery(".previous_activity,.next_activity").removeClass('iPadButton');
				if(!this.returnIeVersion()){
					//jQuery('<video id="activityVideo" width="100%" height="100%" controls autoplay></video>').append('<source src="' + filePath + '" type="' + videoType + '" />').appendTo(jQuery("#content-webview"));
					jQuery("#content-webview").append('<video id="activityVideo" width="100%" height="100%" controls><source src="' + filePath + '" type="' + videoType + '" /></video>') //change ie9 + support
                    
                    if( isDevice() && isPhoneGap() ){
                       if( parseInt(device.version) > 7 ){
                            jQuery("#content-webview").addClass("content-ipadView");
                                                                        
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
						onVideoBeginsFullScreen();
					});

					if((navigator.userAgent.indexOf("Safari") > -1)) {
						jQuery('#activityVideo')[0].play();
						videoContrlSafari = jQuery('#activityVideo')[0];
						videoContrlSafari.ontouchstart = function () {
							onVideoBeginsFullScreen();
						};
					}
				}else{
					if (pluginlist.indexOf("Windows Media Player")!=-1){
							//jQuery('<embed src='+filePath+' id="activityVideo" width="500" height="500"/>').appendTo(jQuery("#content-webview"));
                            var videoElHtml = '<object width="60%" height="100%" type="video/x-ms-asf" url='+ filePath +' data="clipcanvas_14348_offline.mp4"';
                                videoElHtml+= 'classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6"><param name="url" value='+ filePath +'>';
                                videoElHtml+= '<param name="filename" value='+ filePath +'><param name="autostart" value="1"><param name="uiMode" value="full">';
                                videoElHtml+= '<param name="autosize" value="1"><param name="playcount" value="1"> <embed type="application/x-mplayer2" src='+ filePath +' width="100%" height="100%" autostart="true" showcontrols="true"  pluginspage="http://www.microsoft.com/Windows/MediaPlayer/"></embed>';
							   jQuery(videoElHtml).appendTo(jQuery("#content-webview"));
						}else{
							var messageString = "<p> Please update your windows media player or <a href="+filePath+">Click here to Download</a>";
							jQuery(messageString).appendTo(jQuery("#content-webview"));
						}
				}
                 jQuery('#load_wrapper').hide();
//				 var video = document.getElementById("activityVideo");
//				 video.currentTime = 0;
//                
//				if(!this.returnIeVersion()){
//					document.getElementById('activityVideo').addEventListener('ended',function() {
//						jQuery(".next_activity").trigger('click');
//					});
//				}
                jQuery("#content-webview").css("height",""+self.checkDevice()+"");
                if( navigator.platform == "iPad Simulator" || navigator.platform == "iPad" ){
                  jQuery(".previous_activity,.next_activity").addClass('iPadButton');
                }
                jQuery("#load_wrapper, .overlaycontainer").hide();
                videoTapped(1,self.video_tapped);
            }else {
					if(courseItemData.fileType === 'pdf'){
						filePath = courseItemData.fileURL;
                    }
					else
						filePath = courseItemData.modelURL;

                    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        window.localStorage.pdfurl = filePath;
                    } else {
                        $.jStorage.set("pdfurl", filePath);
                    }
                    var srcurl = (fileType === 'pdf') ? 'pdfview.html' : filePath;
                    
                    jQuery("#content-webview").find('video,iframe,.AndroidVideo').remove();
                    if( fileType === 'pdf' && (!isiOS() && !isAndroid()) ){
                     jQuery(".commentmodal-backdrop").show();
                    }
                    
                    if( fileType === 'scorm'){
                    	$('body').addClass("scormPage");
                        $('.scormPage #container .pro_container #content-webview').css('height',$(window).height());
                    }
                    
                    if( fileType === 'scorm' && isDevice() ){
                        
                        var db = sqlitePlugin.openDatabase("CliniqueDB.db");
                         if( db ){
                         	scormDetailsInsert(db,self.userID,self.quizCourseId,self.modID,"true",function(){
                         		jQuery('<iframe/>', {
     							   name: 'courseContent-iframe',
     							   id: 'courseContent-iframe',
     							   src: "player.html"
     							   }).appendTo(jQuery("#content-webview"));
                         		return false;
                         	});
                        }
                    }
                    jQuery("#load_wrapper, .overlaycontainer").hide();
					if(!this.returnIeVersion() && fileType !== 'scorm'){
						if($('html').hasClass('ie9')){
							jQuery(".commentmodal,.commentmodal-backdrop,.loading_icon").hide();
						}
						jQuery('<iframe/>', {
							   name: 'courseContent-iframe',
							   id: 'courseContent-iframe',
							   src: srcurl
							   }).appendTo(jQuery("#content-webview"));
                                                                        
                        if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && (coursePrefix != "TL") && (fileType == 'pdf') ){
                            jQuery("#footer-menu").find('li').remove();
                            var footerElement = '<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
                            footerElement +='<li class="footer_comment"><a href="#"><span class="commenticon"></span><span class="commentxt" data-msg="Comment"></span></a></li>';
                            footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
                            footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
                            jQuery(footerElement).appendTo(jQuery("#footer-menu"));
                        }
                       
					}else if( !isDevice() ){
						jQuery(".commentmodal,.commentmodal-backdrop").hide();
                        if(fileType === 'pdf'){
							 PluginDetect.getVersion(".");   // find Adobe reader exist or not.
							 var version = PluginDetect.getVersion("AdobeReader");
							if(version != null){
								jQuery("#content-webview").append('<iframe id="courseContent-iframe" name="courseContent-iframe" width="800px" height="600px" src='+self.takeCurrentPdfUrl+'> </iframe>');
							}else{
								jQuery("#content-webview").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+self.takeCurrentPdfUrl+">download PDF</a>");
							}
						}else{
							jQuery("#content-webview").append('<iframe id="courseContent-iframe" name="courseContent-iframe"  src='+srcurl+'> </iframe>');
						}
					}
					if ( ie11 && win7 ) {
						if(fileType === 'pdf' ){
							jQuery(".commentmodal,.commentmodal-backdrop,.loading_icon").hide();
							jQuery("#content-webview").find('iframe').remove();
							PluginDetect.getVersion(".");   // find Adobe reader exist or not.
							var version = PluginDetect.getVersion("AdobeReader");
							
							if(version != null){
								jQuery("#content-webview").append('<iframe id="courseContent-iframe-pdf" name="courseContent-iframe-pdf" width="800px" height="600px" src='+self.takeCurrentPdfUrl+'> </iframe>');
							} else {
								jQuery("#content-webview").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+self.takeCurrentPdfUrl+">download PDF</a>");
							}
						}
					}
					 if( fileType == 'quiz'){
                          $('body').addClass("quiz-main-container course-quiz-main-container");
                     }
                                                                        
                     if( fileType == 'puzzle' ){
                        $('body').addClass("quiz-main-container course-quiz-main-container crosswordwrap");
                     }
					jQuery("#courseContent-iframe").load(function() {
						
						jQuery("#load_wrapper, .overlaycontainer").show();
						if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
							jQuery("#courseContent-iframe").find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#courseContent-iframe").find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#courseContent-iframe").find('#scorm_layout').css('width','100%').css('margin-right','0');
							jQuery("#courseContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
							$(window).trigger('resize');
						} else {
							jQuery("#courseContent-iframe").contents().find('.content-primary').css('width','100% ').css('margin-right','0');
							jQuery("#courseContent-iframe").contents().find('#scorm_object').css('width','100%').css('margin-right','0');
							jQuery("#courseContent-iframe").contents().find('#scorm_layout').css('width','100%').css('margin-right','0');
							jQuery("#courseContent-iframe").css('width','90%').css('margin-right','0px').css('margin-left','0px');
							$(window).trigger('resize');
						}
							
						setTimeout(function(){ 
						  jQuery("#courseContent-iframe").css('width','94%').css('margin-right','0px').css('margin-left','0px');
                          jQuery("body").removeClass("overlay-video-quiz");
                                   if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
                                   jQuery("#courseContent-iframe").contents().find('span.arrow').css('width','0').css('height','0').css('border-top','5px solid transparent').css('border-left','7px solid #333').css('border-bottom','5px solid transparent').css('top','3px').css('position','absolute').css('display','inline-block').css('text-indent','-9999px');
                                   }
                                   
                                   
							$(window).trigger('resize');
						},1000); 
						 
						if(fileType === 'scorm'){
							setTimeout(function(){ 
							  jQuery("#courseContent-iframe").css('width','96%').css('margin-right','0px').css('margin-left','0px').css('float', 'left');
							   $(window).trigger('resize');
							   jQuery("#load_wrapper, .overlaycontainer").hide();
							},4000);	
						}
											 
								
					   var crossInterval=setInterval(function(){
						
						   var Dom = jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").length;
						   if(Dom != "0"){
								jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").on("click",function(){
										  jQuery(".course_ifram_cls_btn").trigger("click");
										  clearInterval(crossInterval);
										  jQuery("#load_wrapper, .overlaycontainer").hide();
								});
							}
						},2000);
						
					if(fileType === 'quiz'){
						    // removed width condition 
							jQuery(this).attr('scrolling','no');
							var browserVersion = ($.browser.msie && parseInt($.browser.version, 10) === 7) || ($.browser.msie && parseInt($.browser.version, 10) === 8);
							if ( browserVersion ) {
								jQuery("#courseContent-iframe").contents().find(".submitbtns span.ui-btn-corner-all, .quizattempt span.ui-btn-corner-all, .gameattempt span.ui-btn-corner-all, .continuebutton span.ui-btn-corner-all").css('filter','progid:DXImageTransform.Microsoft.gradient( startColorstr="#ffffff", endColorstr="#c2c2c2",GradientType=0 ); /* IE6-8 */;');
							}
						   // jQuery("#courseContent-iframe").contents().find(".ui-btn-inner").css('z-index','9');
							
						    jQuery("#load_wrapper, .overlaycontainer").show();
						     // QUIZ full screen for Browser
							 jQuery("#courseContent-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
                                jQuery("body").addClass("overlay-video-quiz");
                                var height, closeOverlayIcon;
                                
								 if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									height = jQuery("#courseContent-iframe").find('body').height();
								}else{
									height = jQuery("#courseContent-iframe").contents().find('body').height();
								}
								if(height){
									jQuery("#courseContent-iframe").css('height',height);
								}
                                
                                setTimeout(function(){
                                    if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
                                        closeOverlayIcon = jQuery("#courseContent-iframe").find('body').hasClass("masked");
                                    } else {
                                        closeOverlayIcon = jQuery("#courseContent-iframe").contents().find('body').hasClass("masked");
                                    }
                                    if (closeOverlayIcon) {
                                        jQuery("body").removeClass("overlay-video-quiz");
                                    }
                                },800);

								jQuery(window).scrollTop(0);
                            });
							$("#courseContent-iframe").contents().find("#okbutton, #cancelbutton, #finishattemptbutton").on('click', function() {
								jQuery("body").removeClass("overlay-video-quiz");
							});
							 jQuery("#courseContent-iframe").contents().find(".ui-link").off().on('click', function(){
								 $(window).trigger('resize');
								 jQuery("#load_wrapper, .overlaycontainer").show();
                                                                                                  jQuery("body").addClass("overlay-video-quiz");
                                 var quizreviewlength=setInterval(function(){
								
								if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
									
									var height1 = jQuery("#courseContent-iframe").find('.quizreviewsummary').height();
									var height2 = jQuery("#courseContent-iframe").find('.que').height();
									var height3  = jQuery("#courseContent-iframe").find('.submitbtns').height();
									var height4 = jQuery("#courseContent-iframe").find('.outcome').height();
									jQuery("#courseContent-iframe").find('#page-mod-quiz-reviewPAGE').css('background','#fff').css('background-image','none');
									var height = parseInt(height1 + height2 + height3 + height4);
								}else{
									
									var height1 = jQuery("#courseContent-iframe").contents().find('.quizreviewsummary').height();
									var height2 = jQuery("#courseContent-iframe").contents().find('.que').height();
								     var height4 = jQuery("#courseContent-iframe").contents().find('.outcome').height();
									var height3  = jQuery("#courseContent-iframe").contents().find('.submitbtns').height();
									jQuery("#courseContent-iframe").contents().find('#page-mod-quiz-reviewPAGE').css('background','#fff').css('background-image','none');
									var height = parseInt(height1 + height2 + height3 + height4);
                                                                  
                                                                  jQuery("#courseContent-iframe").contents().find('span.arrow').css('width','0').css('height','0').css('border-top','5px solid transparent').css('border-left','7px solid #333').css('border-bottom','5px solid transparent').css('top','3px').css('position','absolute').css('display','inline-block').css('text-indent','-9999px');
                                                     
								}
								if(height){
								
									jQuery("#courseContent-iframe").css('height',(height+200));
									if($(window).height() < height){
										jQuery('.quiz-main-container #content-webview').css('height',height);
									}
									else{
										jQuery('.quiz-main-container #content-webview').css('height',$(window).height()); 	
									}
									jQuery(window).scrollTop(0);
									jQuery("#load_wrapper, .overlaycontainer").hide();
									clearInterval(quizreviewlength);
                                                                  setTimeout(function(){
                                                                    if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
                                                                             $('#courseContent-iframe')[0].contentWindow.location.reload(true);
                                                                    }
                                                                  }, 1000);
								}
								 },800); 
                            });
						  	if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
								var height = jQuery("#courseContent-iframe").find('.mymobilecontent').height();
								jQuery("#courseContent-iframe").find('html').css('background','#fff');								
								jQuery("#courseContent-iframe").find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');
							}else{
								var height = jQuery("#courseContent-iframe").contents().find('.mymobilecontent').height();
								jQuery("#courseContent-iframe").contents().find('html').css('background','#fff');
								jQuery("#courseContent-iframe").contents().find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');									
								
							}
							  jQuery("#load_wrapper, .overlaycontainer").show();
							var quizlength=setInterval(function(){
								jQuery("#load_wrapper, .overlaycontainer").show();
									if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
										var height = jQuery("#courseContent-iframe").find('.mymobilecontent').height();
										jQuery("#courseContent-iframe").find('html').css('background','#fff');								
										jQuery("#courseContent-iframe").find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');
									}else{
										var height = jQuery("#courseContent-iframe").contents().find('.mymobilecontent').height();
										jQuery("#courseContent-iframe").contents().find('html').css('background','#fff');
										jQuery("#courseContent-iframe").contents().find('#page-mod-quiz-viewPAGE').css('background','#fff').css('background-image','none');									
										
									}
									if(height){
										jQuery("#courseContent-iframe").css('height',(height+100));
										if($(window).height() < height)
											jQuery('.quiz-main-container #content-webview').css('height',height);
										else
											jQuery('.quiz-main-container #content-webview').css('height',$(window).height());
										
										clearInterval(quizlength);
										  jQuery("#load_wrapper, .overlaycontainer").hide();
									} else {
										if( $('html').hasClass('ie8') || $('html').hasClass('ie9') ) {
											
											var height = jQuery("#courseContent-iframe").contents().find('.mymobilecontent').height();
											jQuery("#courseContent-iframe").css('height',height+100);
											
											if( $(window).height() < height ) {
												jQuery('.quiz-main-container #content-webview').css('height',height);
											} else {
												jQuery('.quiz-main-container #content-webview').css('height',$(window).height());
											}
											clearInterval(quizlength);
											jQuery("#load_wrapper, .overlaycontainer").hide();
										}
                                                       if (height == 0) {
                                                       clearInterval(quizlength);
                                                       jQuery("#load_wrapper, .overlaycontainer").hide();
                                                       }
									}
								
                            },500);
							
							//jQuery(".quiz-main-container #displayContentFav").getNiceScroll().resize();
							$(window).trigger('resize');
							jQuery(window).scrollTop(0);
				}
						
						// Trigger resize function to play scorm video in IE11
						if ( fileType === 'scorm' ) {
							var isIE11 = !!navigator.userAgent.match(/Trident.*rv\:11\./);
							if ( isIE11 ) {
								$(window).trigger('resize');
							}
							
							if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
									var scormObject = jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
								}else{
									var scormObject = jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
								}
								if(scormObject != 0){
									/* Scorm implementation */
									//jQuery("#courseContent-iframe").css("height","700px");
									if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
										jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}else{
										jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
										jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
									}
									
								}
						}
						
						// Hide header and footer are hide if answerbox is open in crossword.
						if ( fileType === 'puzzle' ) {
							if( !$('html').hasClass('ie8') && !$('html').hasClass('ie9') ){
								jQuery("#courseContent-iframe").contents().find(".boxnormal_unsel").off().on('click', function(){
									$("#courseContent-iframe").contents().find("input#wordentry").trigger('focus');
								});
								$("#courseContent-iframe").contents().find("input#wordentry").on('focus', function() {
									if( !isAndroid() && isiOS()){
										jQuery(".hme_hdrbx,div.row.menu").hide();
									}
								});
								$("#courseContent-iframe").contents().find("#okbutton, #cancelbutton").on('click', function() {
									var disp = $("#courseContent-iframe").contents().find("#answerbox, #answerbox2").css('display');
									if( !isAndroid() && isiOS() && disp == 'none'){
										jQuery(".hme_hdrbx,div.row.menu").show();
									}
								});
								$("#courseContent-iframe").contents().find("#checkbutton, #finishattemptbutton").on('click', function() {
									if( !isAndroid() && isiOS()){
										jQuery(".hme_hdrbx,div.row.menu").show();
									}
								});
								jQuery("#courseContent-iframe").contents().find(".ui-btn-hidden").off().on('click', function(){
									//setTimeout(function(){ jQuery("#load_wrapper, .overlaycontainer").hide(); },3000);
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
                    if( fileType === 'pdf' ){
                        jQuery("#courseContent-iframe").load(function() {
                         jQuery(this).show();
                         
									
                           /* var iframUrl = jQuery("#courseContent-iframe").contents().find("video");
                                if(iframUrl != "undefined" || iframUrl != 'null' && iframUrl != ''){
                                    var intval=setInterval(function(){
                                          if(jQuery("#courseContent-iframe").contents().find("video").find("source")[0]){
                                                    var URL =  jQuery("#courseContent-iframe").contents().find("video").find("source")[0].src;
                                                    if(URL){
                                                      if( /Android/i.test(navigator.userAgent) ) {
                                                             cordova.exec(
                                                                    function (args) {},
                                                                    function (args) {},
                                                                    'FileOpener', 'openVideoFile', [URL]);
                                                        clearInterval(intval);
                                                        }

                                                    }
                                         }else{
                                                clearInterval(intval);
                                        }
                                    },3000);
                                }*/
                            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                token = JSON.parse(window.localStorage.getItem("USER")).token;
                            } else {
                                token = JSON.parse($.jStorage.get("USER")).token;
                            }
                            var i = 0;
                            if( /Android/i.test(navigator.userAgent) ) {
                                var intval=setInterval(function(){
                                        var iframUrl = jQuery("#courseContent-iframe").contents().find("video").find("source");
                                        if(iframUrl.length != "0"){
                                                    jQuery("#courseContent-iframe").contents().find(".que").find(".mediaplugin_qt").each(function(){
                                                            var parent = jQuery(this);
                                                                if(parent.find("video").find("source")[0].src != undefined){
                                                                    var URL =  parent.find("video").find("source")[0].src
                                                                            parent.empty();
                                                                            parent.append("<img class='video_quiz' src='http://172.16.17.42/cliniquedev/images/android_landscape.png' width='340px' height='200px' data-url="+URL+"></img>");
                                                                }

                                                                parent.find(".video_quiz").on("click",function(){

                                                                        var url = jQuery(this).data("url");
                                                                        var pieces = url.split("/admin/");
                                                                            cordova.exec(
                                                                                function (args) {},
                                                                                function (args) {},
                                                                                'FileOpener', 'openVideoFile', [pieces[0]+'/admin/webservice/'+pieces[1]+"?forcedownload=1&token="+token]);
                                                                            clearInterval(intval);
                                                                        });
                                                                });
                                         clearInterval(intval);
                                        }
                                    },1000);

                            }



                             var serviceUrl = self.globalConfig.apiAddress.service, data='', token;

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
                             self.ajaxReq(serviceUrl,data,function(resp){
                                if( resp != undefined ){
                                  if( resp.response != undefined ){
                                    self.BookMarkedPages = resp.response.bookmarks;
                                    var currentPageNo = jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('value');
                                      jQuery.each(self.BookMarkedPages, function(i, val){
                                           if( currentPageNo == val.pageno ){
                                             jQuery("#courseContent-iframe").contents().find("#viewBookmarkLocale").removeClass('bookmark').addClass('bookmarked').attr('data-bookmarked','true');
                                           }
                                      });
                                  }else{
                                   self.BookMarkedPages=[];
                                  }
                                }else{
                                   self.BookMarkedPages=[];
                                }
                             });

                             jQuery("#courseContent-iframe").contents().find("#presentationMode").off().on('click',function(){
                               window.open("pdfview.html");
                             });
                             var previousPageID='', currentPageID='';
                             /* Added for Bookmarks thambnail filters*/
                             jQuery("#courseContent-iframe").contents().find("#viewAttachments").prop("disabled", false);
                             jQuery("#courseContent-iframe").contents().find("#sidebarToggle").off().on('click',function(){
                                jQuery("#courseContent-iframe").contents().find("#viewAttachments,#viewOutline").prop("disabled", false);
                                var pageCount=1;
                                jQuery("#courseContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
                                jQuery("#courseContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
                                  jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
                                });
                                if( self.BookMarkedPages != undefined ){
                                  jQuery.each(self.BookMarkedPages, function(i, val){
                                      if( val.bookMarked== undefined ){
                                       jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                      }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                        jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                      }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                        jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                      }
                                  });
                                }
                            });
                            jQuery("#courseContent-iframe").contents().find("#viewAttachments").off().on('click',function(){
                                jQuery("#courseContent-iframe").contents().find("#thumbnailView").removeClass("hidden");
                                jQuery("#courseContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
                                              if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
                                                  jQuery(this).hide();
                                                  jQuery(this).find("#ribbon").hide();
                                              }
                                    });

                            });
                            jQuery("#courseContent-iframe").contents().find("#viewOutline").off().on('click', function(){
                                jQuery("#courseContent-iframe").contents().find(".outlineItem").remove();
                                jQuery("#courseContent-iframe").contents().find(".thumbnail").each(function(index){
                                    jQuery("#courseContent-iframe").contents().find("#outlineView").append('<div class="outlineItem"><a href="#page=' +(index+1)+ '">Slide Number ' +(index+1)+ '</a></div>');
                                });
                            });
							
							
							
                            jQuery("#courseContent-iframe").contents().find("#viewThumbnail").off().on('click',function(){
                                jQuery("#courseContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
                                              if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
                                                               jQuery(this).show();jQuery(this).find("#ribbon").hide();
                                              }
                                    });
                            });
                            /* End of Bookmarks thambnail filters*/

                            jQuery("#courseContent-iframe").contents().find("#viewBookmarkLocale").off().on('click',function(){
                              var serviceUrl = self.globalConfig.apiAddress.service,
                                  data = '',
                                  currentPageID = jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('value'),
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
                                      jQuery("#courseContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("notbookmarked").addClass("bookmarked").show();
                                      jQuery("#courseContent-iframe").contents().find("#thumbnailContainer"+currentPageID+"").show();

                                      self.BookMarkedPages.push({
                                                                 "pageno":""+currentPageID+"",
                                                                 "bookMarked":"true"
                                                                });
                                  }else if( jQuery(this).attr('data-bookmarked') == "true" ) {
                                      pageID = currentPageID;
                                      serviceAction = 'delete_course_pdf_bookmark';
                                      jQuery(this).addClass('bookmark').removeClass('bookmarked');
                                      jQuery(this).attr('data-bookmarked','false');
                                      jQuery("#courseContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("bookmarked").addClass("notbookmarked").hide();
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
                                               jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                              }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                                jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                              }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                                jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                              }
                                          });
                                   }
                                   self.ajaxReq(serviceUrl,data,function(resp){ });
                            });
                            if( !isDevice() && !isPhoneGap() ){
                                 var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                                 if( browserName[1] == "Safari"){
                                   jQuery("#courseContent-iframe").contents().find("#download").attr('data-safari','true');
                                 }
                            }
                            jQuery('#load_wrapper').show();
                            var startPageCount=setInterval(function (){
                                                                if( jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('max') != undefined ){
                                                                    if( jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('max')  == jQuery("#courseContent-iframe").contents().find("#viewer .page").length ){
                                                                      jQuery(".commentmodal-backdrop").hide();
                                                                      jQuery('#load_wrapper').hide();
                                                                      clearInterval(startPageCount);
                                                                    }
                                                                }
                                                          },5000);



                            var thumbnailView=setInterval(function (){
                                        if( jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('max') == jQuery("#courseContent-iframe").contents().find("#thumbnailView .thumbnailSelectionRing").length){
                                            var currentPageNo = jQuery("#courseContent-iframe").contents().find("#pageNumber").attr('value');
                                            var pageCount=1;
                                            jQuery("#courseContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
                                            jQuery("#courseContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
                                              jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
                                            });
                                            if( self.BookMarkedPages != undefined ){
                                              jQuery.each(self.BookMarkedPages, function(i, val){
                                                  if( val.bookMarked== undefined ){
                                                   jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                                  }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                                    jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                                  }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                                    jQuery("#courseContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                                  }
                                              });
                                            }
                                          clearInterval(thumbnailView);
                                        }
                                    },1000);

                             var answerBOX = setInterval(function(){
                                 if(isiOS() || isDevice()){

                                     if( jQuery("#courseContent-iframe").contents().find("#answerbox").length != 0){
                                         if( jQuery("#courseContent-iframe").contents().find("#answerbox").css("display") != "none"){
                                            jQuery(".hme_hdrbx,div.row.menu").hide();
                                         }else{
                                           jQuery(".hme_hdrbx,div.row.menu").show();
                                         }
                                     }
                                 }
                               },1000);
                            if(isiOS() || isDevice()){
                                  jQuery("#content-webview").css('height','auto');
                            }
							
							/* artf1036050  changes start's here */
							jQuery("#content-webview").css("height","1363px");
							jQuery("#load_wrapper").css("display","block");
							var intval=setInterval(function(){
										if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
										var pageHeight = jQuery("#courseContent-iframe").find(".textLayer").height();
										}else{
											var pageHeight = jQuery("#courseContent-iframe").contents().find(".textLayer").height();
										}
										var orgHeight = (pageHeight)+52;
										if(pageHeight){
												jQuery("#content-webview").css("height",orgHeight+"px");
												jQuery("#courseContent-iframe").contents().find("#viewerContainer").scrollTop(0);
												clearInterval(intval);
										}else{
												jQuery("#content-webview").css("height","550px");
												jQuery("#courseContent-iframe").contents().find("#viewerContainer").scrollTop(0);
												clearInterval(intval);
										}


							},3000);
						    /* artf1036050  changes end here */
							
                        });
                    }
					if( courseItemData.fileType == "pdf" ){	
								/* artf1036050  changes start's here */
									jQuery(".commentmodal,.commentmodal-backdrop,.loading_icon").hide();
									jQuery("#content-webview").css("height","1363px");
									jQuery("#load_wrapper").css("display","block");
									var intval=setInterval(function(){
												if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
													var pageHeight = jQuery("#courseContent-iframe").find(".textLayer").height();
												}else{
													var pageHeight = jQuery("#courseContent-iframe").contents().find(".textLayer").height();
												}
												var orgHeight = (pageHeight)+52;
												if(pageHeight){
														jQuery("#content-webview").css("height",orgHeight+"px");
														if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
															jQuery("#courseContent-iframe").find("#viewerContainer").scrollTop(0);
														}else{
															jQuery("#courseContent-iframe").contents().find("#viewerContainer").scrollTop(0);
														}
														clearInterval(intval);
												}


									},3000);
									/* artf1036050  changes end here */
				   }
					if (courseItemData.fileType === 'mp4' || courseItemData.fileType === 'mpeg' || courseItemData.fileType === 'mp3' || courseItemData.fileType === 'pdf') {
							jQuery('.commentNotes').show();
					}
					else{
						jQuery('.commentNotes').hide();
					}

					if(courseItemData.fileType == "quiz" ){
						jQuery("#load_wrapper, .overlaycontainer").hide();
						var crossInterval=setInterval(function(){
							jQuery("#load_wrapper, .overlaycontainer").hide();
						   
						   var Dom = jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").length;
						   if(Dom != "0"){
								jQuery("#courseContent-iframe").contents().find("#finishattemptbutton").on("click",function(){
										  jQuery(".course_ifram_cls_btn").trigger("click");
										  clearInterval(crossInterval);
								});
							}
						},2000);
							var crossheightiInterval=setInterval(function(){
									if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
										var height = jQuery("#courseContent-iframe").find('body').height();
									} else {
										var height = jQuery("#courseContent-iframe").contents().find('body').height();
									}
									// console.info('height');
									
									if(height){
										jQuery("#courseContent-iframe").css('height',height);
										 // jQuery(".quiz-main-container #content-webview").niceScroll().resize();
										clearInterval(crossheightiInterval);
									}
								},1000);
								
							var crossheightInterval=setInterval(function(){
								jQuery("#load_wrapper, .overlaycontainer").hide();
								if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
									var quizOrCrossword = jQuery("#courseContent-iframe").contents().find(".quizattemptsummary").length;
								}else{
									var quizOrCrossword = jQuery("#courseContent-iframe").find(".quizattemptsummary").length;
								}
									if(quizOrCrossword =="0"){
									        if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
												var crosswordHeight = jQuery("#courseContent-iframe").contents().find(".mymobilecontent").length;
											}else{
												var crosswordHeight = jQuery("#courseContent-iframe").find(".mymobilecontent").length;
											}
												if(crosswordHeight !="0"){
													if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
														var height = jQuery("#courseContent-iframe").contents().find(".mymobilecontent").height();
													} else {
														var height = jQuery('#courseContent-iframe').find('.mymobilecontent').height();
													}
													if(isAndroid()){
														//jQuery("#courseContent-iframe").css("height","570px");
														//jQuery("#content-webview").css("height","600px");
														clearInterval(crossheightInterval);
													}else{
													if(height)
														jQuery("#content-webview, #courseContent-iframe").css("height",(height+52)+"px");
													else
														jQuery("#content-webview, #courseContent-iframe").css("height","550px");
														
														clearInterval(crossheightInterval);
													}
													//clearInterval(crossheightInterval);
												}
									}
									else{
											if(isAndroid()){
													//jQuery("#courseContent-iframe").css("height","500px");
													//jQuery("#content-webview").css("height","530px");
													clearInterval(crossheightInterval);
											}else{
												clearInterval(crossheightInterval);
											}

									}
									
							},1000);

                            if(navigator.platform == "iPad" || navigator.platform == "iPad Simulator"){
                                  jQuery(window).on("orientationchange",function(){
                                      if(window.orientation == 0){
                                       jQuery("#courseContent-iframe").contents().find(".mymobilecontent").find(".region-content").find("#legend").addClass("portraitacross").removeAttr("id");
                                       jQuery("#courseContent-iframe").contents().find(".mymobilecontent").find(".region-content").find(".legend-web").addClass("portraitDown").removeClass("legend-web");
                                      }
                                      else{
                                       jQuery("#courseContent-iframe").contents().find(".mymobilecontent").find(".region-content").find(".portraitacross").attr('id', 'legend').removeClass("portraitacross");
                                       jQuery("#courseContent-iframe").contents().find(".mymobilecontent").find(".region-content").find(".portraitDown").addClass(".legend-web").removeClass("portraitDown");
                                      }
                                   });

                            }
							
							if(isiOS() || isDevice()){
                              jQuery("#content-webview").css('height','auto');
							}

					}
				if(courseItemData.fileType == "scorm" ){
						jQuery("#load_wrapper, .overlaycontainer").hide();
						var scormInterval=setInterval(function(){
							if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
												var scormObject = jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").length;
											}else{
												var scormObject = jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-doc").length;
											}
								if(scormObject != 0){
									if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9')){
										jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-clip").hide();
										jQuery("#courseContent-iframe").contents().find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
										clearInterval(crossheightInterval);
									}
									else{
										jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-clip").hide();
										jQuery("#courseContent-iframe").find('#scorm_layout').find(".yui-layout-doc").css('background-color','#fff');
										clearInterval(crossheightInterval);
									}
									
								}
						},1000);
					}
					
					
				}
                                                                        
                if( courseItemData.fileType == "puzzle" ){
                   //setTimeout(function(){ jQuery("#load_wrapper, .overlaycontainer").hide(); },3000);
                   var loaderDisplay=setInterval(function (){
                                                  if( jQuery("#load_wrapper").css('display') == "block" ){
                                                      jQuery("#load_wrapper, .overlaycontainer").hide();
                                                      clearInterval(loaderDisplay);
                                                  }
                                                },1000);
                }
            
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
        footerIcons: function(){
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid())){
                jQuery("#footer-menu").find('li').remove();
                var footerElement = '<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
                footerElement += '<li class="selected footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
                footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
                footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
                jQuery(footerElement).appendTo(jQuery("#footer-menu"));
            }
            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") ){
             jQuery(".hme_hdrbx,div.row.menu").show();
            }
        },
        checkDevice: function(){
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" ){
              return "200px";
            }else{
              return "500px";
            }
        },
        setCompletedModules: function( currentCtrl, userID, courseID, modID ){
            var self=currentCtrl;
            var response = self.UserDetails;
            var updateFLAG = false;
            var data={};
            jQuery.each(response,function(index,val){
                if( index >0 ){
                    if( val.id == courseID ){
                        jQuery.each(val.modules,function(index,val){
                            if( val. id == modID && val.dependentflag == 1 ){
                               updateFLAG = true;
                            }
                        });
                    }
                }
            });
                                                                        
            if( updateFLAG ){
                data.uid=userID;
                data.cid=courseID;
                data.modId=modID;
                
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'OfflineServicePlugin', 'updateCompletedModules', [data]);
            }
        },
        updateCompletedModules: function( currentCtrl, userID, courseID, modID ){
           var self=currentCtrl;
           var response = self.UserDetails;
           var data={};
           jQuery.each(response,function(index,val){
               if( index >0 ){
                   if( val.id == courseID ){
                     jQuery.each(val.modules,function(index,val){
                           if( val. id == modID && val.activityVisited ){
                             
                           }   
                      });
                   }
               }
           });
                                                                        
            data.uid=userID;
            data.cid=courseID;
            data.modId=modID;
            
            cordova.exec(
                         function (args) {},
                         function (args) {},
                         'OfflineServicePlugin', 'updateCompletedModules', [data]);
        }
    });
    return Clazz.com.components.widget.courseItem.js.CourseItem;
});
