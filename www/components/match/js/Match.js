define(["framework/WidgetWithTemplate","courseItem/CourseItem","course/Course","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.match.js");
    Clazz.com.components.widget.match.js.Match = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/match/template/match.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "match",
        localConfig: null,
        globalConfig: null,
        courseWidget:null,
        courseItemWidget: null,
        offlineStorage: null,
        isPopupHidden: null,
        activityName: null,
        topicName: null,
		tileWidget:null,
		   initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.courseWidget = new Clazz.com.components.widget.course.js.Course();
			this.courseItemWidget = new Clazz.com.components.widget.courseItem.js.CourseItem();
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(dataName, topicName, dataModId, dName, matchActivity){
        	var self = this;
        	self.UserDetails={};
        	self.activityName = dataName;
        	self.topicName = topicName;
        	self.dataModId= dataModId;
        	self.dName= dName;
        	if( isDevice() && self.globalConfig.application.offLine ){
        		self.UserDetails.response = {};
            	self.UserDetails.response = matchActivity;	
        	}
            Clazz.navigationController.push(self);
        },
        postRender : function(element) {
            var self = this; 
            //jQuery("section.match-link.tpbreadcrumbs li:eq(2)").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            jQuery("section.match-link.tpbreadcrumbs .matchLI").html('<a href="javascript:void(0);" data-msg="Topics"></a>');
            loadAllLanguages();
            jQuery("section.match-link.tpbreadcrumbs .activityName").html(self.activityName);
            $("body > div.correct_tina").remove();
			$("body > div.congrats_tina").remove();
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
                    '<li class="courshdnk topicspagenav matchLI"></li><li class="courshdnk topicspagenav matchLI activityName"></li></ul><div class="clear"></div></section>';
                    return new Handlebars.SafeString(BreadcrumElement);
                }
          });
                                                                                
          if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()) && (navigator.platform != "iPad Simulator" || navigator.platform != "iPad") && (coursePrefix == "TL" && coursePrefix != "Accordion")){
             jQuery("#footer-menu").find('li').remove();
             
              var footerElement ='<li class="footer_Prevactivity"><a href="#"><span class="prevactivityicon"></span><span class="activitymenutxt" data-msg="Prev" ></span></a></li>';
                  footerElement +='<li class="footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
				  footerElement +='<li class="selected footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
                  footerElement +='<li class="footer_Nextactivity"><a href="#"><span class="nextactivityicon"></span><span class="activitymenutxt" data-msg="Next"></span></a></li>';
              jQuery(footerElement).appendTo(jQuery("#footer-menu"));
          }
        },
        onResume : function() {
			jQuery("li, .ui-droppable").removeClass("dropped-options");
			$("body > div.correct_tina").remove();
			$("body > div.congrats_tina").remove();
			self.callType = null;
        },
        loadData :function(matchData){
	        var self=this,serviceUrl = self.globalConfig.apiAddress.service;
            if( isDevice() && self.globalConfig.application.offLine ){
                                                              
              self.matchSuccess(self.UserDetails);
                                                              
            }else{
                                                              
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
	                    self.offlineStorage.insertComp('MATCHES', JSON.stringify(res));
	                    self.matchSuccess(res);
	                },
	                error: function ( jqXHR, textStatus, errorThrown ){
	                    self.offlineStorage.getComp('MATCHES');
	                    setTimeout(function (){
	                        var matchOfflineData;
	                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
	                            matchOfflineData = JSON.parse(localStorage["transferData"]);
	                        } else {
	                            //matchOfflineData = JSON.parse($.jStorage.get["transferData"]);
	                        }
	                        self.matchSuccess( matchOfflineData );
	                    },1000);
	                }
	            });
	        }
        },
        matchSuccess : function (res){
            var self = this, iTouch = 'click', coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                coursePrefix = window.localStorage.getItem("coursePrefix");
            } else {
                coursePrefix = $.jStorage.get("coursePrefix");
            }
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid() && coursePrefix == "TL" ){
               jQuery(".next_activity,.previous_activity").remove();
            }
            if(res.error){
                $(".no-record").fadeIn('slow');
            }else{
			if (self.dName =="Match") {
                var questionName ;
                //console.log(" MATCH"+JSON.stringify(res));
                var quesName = [];
                if( coursePrefix != "TL"){
                quesName = res.response.questionname;
				 questionName = quesName[0];
				jQuery('#quesname_activity2').html(questionName);
                jQuery('#quesname_activity2').find('img').parent().remove();
                }else
                {
                quesName = res.response.heading;
                 questionName = quesName[0];
				jQuery('#quesname_activity2').html(questionName);
                }
                
			   var stringlen = questionName;
			   
               var countval_quesname = questionName.length;
			   //console.info("stringlen:::  "+countval_quesname);
			   
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
			
			    $(".no-record").hide();
                var ansArr = [], quesArr = [], unshuffAnsArr = [], unshuffQuesArr = [];
                var combinationObj = {};
                
                ansArr = $.extend( {},res.response.answertext );
                quesArr = $.extend( {},res.response.questiontext );
                
//                ansArr = res.response.answertext;
//                quesArr = res.response.questiontext;
                $.map( ansArr, function(n, i){
                    combinationObj[n] = quesArr[i];
			    });
                /* Shuffling Arrays */
                self.shuffleArray(ansArr);
                self.shuffleArray(quesArr);
                /* Setting Questions  */
                $("section.crswidg_img li > img").each(function (i){
                    $(this).attr('src',quesArr[i]);
                });
                /* Setting Answers */
                $("section.crswidg_drgbtn a").each(function (i){
                    $(this).text(ansArr[i]);
                });
                $("section.crswidg_drgbtn li").draggable({
                    revert: "invalid",
                    appendTo:  "div.pro_container:last",
                    helper: "clone",
                    cursor: "move",
                    containment: "parent",
                    cursorAt: { bottom: 0, left: 0 },
                    stop: function( event, ui ) {
                        if(jQuery("div.pro_container > li").length){
                            jQuery("div.pro_container > li").remove();
                        }
                    }
                });
                $("section.crswidg_img li").droppable({
                    accept: "section.crswidg_drgbtn li:not(.drgbtnsel)",
                    over: function( event, ui ) {
                        $(this).addClass('make-bounce');
                    },
                    drop: function( event, ui ) {
						$(this).addClass("dropped-options");
                        var pickedQuestion = $("a", ui.draggable).text();
                        var droppedAnswer = $('img', this).attr('src');
						//console.info("pickedQuestion:: "+pickedQuestion);
						//console.info("droppedAnswer:: "+droppedAnswer);
						//console.info("droppedAnswer:: "+combinationObj[pickedQuestion]);
						if(droppedAnswer == combinationObj[pickedQuestion]){
                            self.showPopup('success', $("a", ui.draggable), this);
                        }else{
                            self.showPopup('wrong', $("a", ui.draggable), this);
                        }
                    },
                    out: function( event, ui ) {
                        //console.log(ui);
                    }
                });
                $("div.congrats_tina .cls_btn").live('click', function (){
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
						if (isAndroid()) {
							jQuery('.topicspagenav').trigger("touchstart");
						} else {
							jQuery('.topicspagenav').click();
						}
					}
                });
                $("div.correct_tina .cls_btn").die('click').live('click', function (){
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
					if($("section.crswidg_drgbtn .drgbtnsel").length == 4){
                        if(!$("body > div.congrats_tina").length){
                            $('body').append($("div.congrats_tina_holder").html());
                        }
                        $("div.quizmask").show();
                        $("body > div.congrats_tina").show();
                        $(window).scrollTop(0);
                        jQuery("div.row.menu").addClass('setBehind');
                        self.isPopupHidden = setTimeout(function (){
                            $("div.congrats_tina .cls_btn").click();
                        }, 15000);
                    }
                });
                if(isiOS() || isAndroid()){
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
						if (isAndroid()) {
							jQuery('.topicspagenav').trigger("touchstart");
						} else {
							jQuery('.topicspagenav').click();
						}
					}
                });
            } else
			{    
			    var quesName = [],
                    quesArr1= [],
                    eachAnswer = [],
                    allQuestions =[], 
                    _ansWers='', 
                    _answerArr=[],
                    duplicateArray=[],
                    uniqueAnswer='',
                    RGHTanswerCount='', 
                    WRNGanswerCount='',
                    matchCount='';
                
             var questionName ;
                //console.log(" Multi"+JSON.stringify(res));
                var quesName = [];
                if( coursePrefix != "TL"){
                quesName = res.response.questionname;
				 questionName = quesName[0];
				jQuery('#quesname_activity2').html(questionName);
                jQuery('#quesname_activity2').find('img').parent().remove();
                }else
                {
                quesName = res.response.heading;
                 questionName = quesName[0];
				jQuery('#quesname_activity2').html(questionName);
                }
           
				var stringlen = questionName;
				var countval_quesname = questionName.length;
				//console.log("countval_quesname:: "+countval_quesname);
				
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
				
				 $(".no-record").hide();
                 var ansArr = [], 
                     quesArrDummy = '',
                     quesArray = [], 
                     unshuffAnsArr = [], 
                     unshuffQuesArr = [],
                     _wronganswerArr = [],
                     quesCount=0,
                     combinationObj = {},
                     combinationArr = [],
                     countArr = [], 
                     ques_Array = [], 
                     answer_Text;
                
				 quesArrDummy = res.response.questiontext;
				 answer_Text = res.response.answertext;
				 self.shuffleArray(res.response.answertext);
                 matchCount = 0;
				jQuery.each(res.response.answertext, function(i,val){
					_answerArr = ( isDevice() ? $.extend([],val.right_answers) : val.right_answers ); 
					answerCount = val.right_answers_count;
					RGHTanswerCount = val.right_answers_count;
					
					if( val.wrong_answers != undefined ){
					 _wronganswerArr = val.wrong_answers;
					 WRNGanswerCount = val.wrong_answers_count;
				    }		
					self.shuffleArray(_answerArr);
					_answerArr[_answerArr.length] = i;
					quesArray.push(quesArrDummy[""+i+""]);
                    ques_Array.push({
                                    "question":"" +quesArrDummy[""+i+""]+ "",
                                    "questionID":"" +i+ ""
                                  });
                    
					jQuery.each(_answerArr,function(j, val){ 
				//	self.shuffleArray(_answerArr);
                        
					  if( j<(_answerArr.length-1)){
					    matchCount++;
                        combinationObj["item"+matchCount+""] = ["" +val+ "___"+quesArrDummy[""+_answerArr[_answerArr.length-1]+""]+"___answeredFLAG___false"];
					   //combinationObj["" +val+ ""] = quesArrDummy[""+_answerArr[_answerArr.length-1]+""];
                      
                       
						//console.log("combinationObj Array1:"+JSON.stringify(combinationObj));			
					    self.shuffleArray(val);
                        duplicateArray.push(val);                
						//_ansWers += '<li class="match-item"><a href="#" count=' +RGHTanswerCount+ ' matchCount=' +matchCount+ '>' +val+ '</a></li>';
					   }
					});
					if( val.wrong_answers != undefined ){
					  jQuery.each(_wronganswerArr, function(k, val){
					      self.shuffleArray(val);
					//     _ansWers += '<li class="match-item"><a href="#" count=' +WRNGanswerCount+ '>' +val+ '</a></li>';
					  });
					}
					
				});
			    uniqueAnswer = self.uniqueAnswer(duplicateArray);
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.setItem("right_answer_count", uniqueAnswer.length);
                } else {
                    $.jStorage.set("right_answer_count", uniqueAnswer.length);
                }
                jQuery.each(uniqueAnswer, function(i, val){
                   _ansWers += '<li class="match-item"><a href="#">' +val+ '</a></li>'; 
                });
                
				jQuery("section.crswidg_drgbtn").find("ul li").remove();
				jQuery(_ansWers).appendTo(jQuery("section.crswidg_drgbtn").find("ul"));
				self.shuffleArray(ques_Array);
				self.shuffleArray(_answerArr);
                
                /* Setting Questions  */
                $("section.crswidg_img li > img").each(function (i,val){
					//$(this).attr('src',quesArray[i]);
                    if( ques_Array[i] != undefined ){
                        $(this).attr('src', ques_Array[i].question);
                        for( var cnt = 0; cnt<answer_Text[""+ques_Array[i].questionID+""].right_answers_count; cnt++){
                            //$( ".crswidg_Count ul li:nth-child(" +(i+1)+ ")" ).append('<span class="crs_Count"></span>');
                            if( answer_Text[""+ques_Array[i].questionID+""].right_answers_count >3){
                             $(".crswidg_img ul li div.course_Count").css({"left":"-3%"});   
                            }
                            $("section.crswidg_img li:nth-child(" +(i+1)+ ")").find(".course_Count").append('<span class="crs_Count" answered="false"><img src="../images/carousel_platinum_dot_sel.png"/></span>');
                        }
                    }
					//$(this).parent().attr('data-count',answerCount);
				});
			       $("section.crswidg_drgbtn li").draggable({
                    revert: "invalid",
                    appendTo:  "div.pro_container:last",
                    helper: "clone",
                    cursor: "move",
                    containment: "parent",
                    cursorAt: { bottom: 0, left: 0 },
                    stop: function( event, ui ) {
                        if(jQuery("div.pro_container > li").length){
                            jQuery("div.pro_container > li").remove();
                        }
                    }
                });
                $("section.crswidg_img li").droppable({
                    accept: "section.crswidg_drgbtn li:not(.drgbtnsel)",
                    over: function( event, ui ) {
                        $(this).addClass('make-bounce');
                    },
                    drop: function( event, ui ) {
						$(this).addClass("dropped-options");
						$(this).addClass("draggable");
					    var pickedQuestion = $("a", ui.draggable).text();
                        var droppedAnswer = $('img', this).attr('src');
						var answerCount = $("a", ui.draggable).attr('count');
						var matchCount =  $("a", ui.draggable).attr('matchcount');
                        var tempCount = matchCount;
                        var spanElementCount = $(this).children(".course_Count").children("span").size();  
                        var spanElement = $(this).children(".course_Count").children("span");
                        var showTick = false; 
						
                        jQuery.each(combinationObj, function(i, val1){  
                            jQuery.each(val1, function(k,val2){ 
                                var answ_Arry=val2.split("___");  
                                    if( answ_Arry[0] == pickedQuestion && answ_Arry[1] == droppedAnswer ){
                                         showTick = true;
                                         answ_Arry[3] = "true";
                                         val1[0] = answ_Arry[0]+"___"+answ_Arry[1]+"___"+answ_Arry[2]+"___"+answ_Arry[3];    
                                    }
                            }); 
                        });
                        
                        if( showTick ){
                            //console.log("combinationObj=="+JSON.stringify(combinationObj));
                            self.showNewPopup('success', $("a", ui.draggable), this, combinationObj, pickedQuestion);
                            
                        }else{
                            self.showNewPopup('wrong', $("a", ui.draggable), this);
                        }
                    },
                    out: function( event, ui ) {
                        // console.log(ui);
					}
				});
                $("div.congrats_tina .cls_btn").live('click', function (){
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
                    var viewtype;
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            viewtype = window.localStorage.getItem("viewtype");
                        } else {
                            viewtype = window.localStorage.getItem("viewtype");
                        }
					if(viewtype == 1)  {
						jQuery(".course_ifram_cls_btn").trigger('click');
					} else {
						if (isAndroid()) {
							jQuery('.topicspagenav').trigger("touchstart");
						} else {
							jQuery('.topicspagenav').click();
						}
					}
                });
				
				 $("div.correct_tina .cls_btn").die('click').live('click', function (){
					// console.info("inside:");
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
					if($("section.crswidg_drgbtn .drgbtnsel").length == 4){
                        if(!$("body > div.congrats_tina").length){
                            $('body').append($("div.congrats_tina_holder").html());
                        }
                        $("div.quizmask").show();
                        $("body > div.congrats_tina").show();
                        $(window).scrollTop(0);
                        jQuery("div.row.menu").addClass('setBehind');
                        self.isPopupHidden = setTimeout(function (){
                            $("div.congrats_tina .cls_btn").click();
                        }, 15000);
                    }
                });
			/*	
                $("div.correct_tina .cls_btn").die('click').live('click', function (){
				    var self=this,showCongrats=true;
                    clearTimeout(self.isPopupHidden);
                    $(this).parents("div.crswidg_popup").hide();
                    $("div.quizmask").hide();
                    jQuery("div.row.menu").removeClass('setBehind');
                    jQuery.each(combinationObj, function(i, val1){  
                        jQuery.each(val1, function(k,val2){ 
                            var answ_Arry=val2.split("___");  
                                if( answ_Arry[3] == "false" ){
                                    showCongrats = false;
                                }
                        }); 
                    });
					if( showCongrats ){
                        if(!$("body > div.congrats_tina").length){
                            $('body').append($("div.congrats_tina_holder").html());
                        }
                        $("div.quizmask").show();
                        $("body > div.congrats_tina").show();
                        $(window).scrollTop(0);
                        jQuery("div.row.menu").addClass('setBehind');
                        self.isPopupHidden = setTimeout(function (){
                            $("div.congrats_tina .cls_btn").click();
                        }, 15000);
                    }
                }); */
                if(isiOS() || isAndroid()){
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
						if (isAndroid()) {
							jQuery('.topicspagenav').trigger("touchstart");
						} else {
							jQuery('.topicspagenav').click();
						}
					}
                });
			}
			
			}
        },
        shuffleArray: function (o){
            for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        },
        showPopup: function (type, pickedItem, dropItem){
            var self = this;
            $("div.quizmask").show();
            $(window).scrollTop(0);
            jQuery("div.row.menu").addClass('setBehind');
            if(!$("body > div.correct_tina").length){
                $('body').append($("div.correct_tina_holder").html());
            }
            var popupElem = $("body > div.correct_tina");
            if(type == "success"){
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).show();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).hide();
                self.hidePopup();
                $("span.crswidg_lblbx", dropItem).hide();
                pickedItem.parent().addClass('drgbtnsel');
                $("span.its-correct", dropItem).show();
                $(dropItem).droppable( "destroy" );
            }else{
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).hide();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).show();
                self.hidePopup();
            }
            var draggedItems = $("section.crswidg_drgbtn .drgbtnsel").length;
            popupElem.show();
        },
		 showNewPopup: function (type, pickedItem, dropItem, combinationObj, pickedQuestion){
            var self = this, drgbtnsel = true;
            $("div.quizmask").show();
            $(window).scrollTop(0);
            jQuery("div.row.menu").addClass('setBehind');
            if(!$("body > div.correct_tina").length){
                $('body').append($("div.correct_tina_holder").html());
            }
            var popupElem = $("body > div.correct_tina");
            if(type == "success"){
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).show();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).hide();
                self.hidePopup();
				/*
                   if( combinationObj != undefined ){
                       jQuery.each(combinationObj, function(i, val1){  
                            jQuery.each(val1, function(k,val2){ 
                                var answ_Arry=val2.split("___");  
                                
                                if( answ_Arry[3] == "false" && answ_Arry[0] == pickedQuestion){
                                    console.log(answ_Arry[3]+"==="+"false"+"&&"+ answ_Arry[0]+"==="+pickedQuestion);
                                    drgbtnsel = false;
                                }
                            }); 
                        });
                   }
                    console.log("drgbtnsel=="+drgbtnsel);
                    if( drgbtnsel ){
                        pickedItem.parent().addClass('drgbtnsel');
                         
                    }
                */
                
                $("span.crswidg_lblbx", dropItem).hide();
				pickedItem.parent().addClass('drgbtnsel');
                $("span.its-correct", dropItem).show();
                $(dropItem).droppable( "destroy" );
                
            }else{
                $("div.crswidg_overlyhldr > div.crswidg_msg:first", popupElem).hide();
                $("div.crswidg_overlyhldr > div.crswidg_msg:last", popupElem).show();
                self.hidePopup();
            }
            var draggedItems = $("section.crswidg_drgbtn .drgbtnsel").length;
            popupElem.show();
        },
        uniqueAnswer: function(oldArray){
            var _ansWers = '',
                newArr = [],duplicateCount = 0,
                oldLength = oldArray.length,
                found, Old, New;
                for( Old = 0; Old<oldLength; Old++){
                    found = false;
                    for( New = 0; New<newArr.length; New++ ){
                        if( oldArray[Old] === newArr[New] ){
                            found = true;
                            break;
                        }
                    }
                    if( !found ) {
                        newArr.push(oldArray[Old]);
                    }
                }
                return newArr;
        },
        hidePopup : function (){
            this.isPopupHidden = setTimeout(function (){
                $("div.correct_tina .cls_btn").click();
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
            var self = this, widgettype;
            var courseId, coursePrefix;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    courseId = window.localStorage.getItem("selCourseId");
                    coursePrefix = window.localStorage.getItem("coursePrefix");
                } else {
                   courseId = $.jStorage.get("selCourseId");
                   coursePrefix = $.jStorage.get("coursePrefix");
                }
			if(coursePrefix =="TL"){
			jQuery(".next_activity, .previous_activity").css("display", "block");
			}
			else{
			jQuery(".next_activity, .previous_activity").css("display", "none");
			}
            //console.log("match::  "+self.dName);
            var matchData = {
                action : 'widget',
                widgettype :self.dName,
                courseid : courseId,
                modId: self.dataModId
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
            jQuery('div.prorowadj > div.close').on(iTouch, function() {
                if (isAndroid()) {
					jQuery('.topicspagenav').trigger("touchstart");
				} else {
					jQuery('.topicspagenav').click();
				}
            });
			
			/* Start's Text Alignment based on number of lines */
			
			$( window ).resize(function() {
				if(!$('html').hasClass('ie8') && !$('html').hasClass('ie9') && $("#quesname_activity2").length > 0){
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
    return Clazz.com.components.widget.match.js.Match;
});
