var languages = {
    "en"    : "English - United Kingdom",//English United Kingdom
    "en_us" : "English - United States",//English United States
	"cm_c"  : "English – Counter Manager",	// US - Counter Manager Cohort
	"en_as" : "English - Asian",//English - Asian
    "ar"    : "العربية - الشرق األوسط",//Arabic
    "zh_ct" : "廣東 - 香港", //Cantonese - Hong Kong // Language pack isn't available in moodle
    "cs"    : "Čeština",//Czech
    "da"    : "Dansk",//Danish
    "nl"    : "Nederlands",//Dutch
    "fi"    : "Suomen",//Finnish
    "fr_ca" : "français - Canada",//French-Canadian
    "fr"    : "français - France",//French
    "de"    : "Deutsch",//German
    "el"    : "Ελληνικά",// Greek
    "he"    : "עברית",//Hebrew //iw
    "hu"    : "Magyar",//Hungarian
    "id"    : "Bahasa Indonesia",//Indonesian
    "it"    : "Italiano",//Italian
    "ja"    : "日本語",//Japanese
    "ko"    : "한국어",//Korean
    "zh_cn" : "普通话 - 中国", //Mandarin-China
    "zh_tw" : "普通話 - 台灣", //Mandarin-Taiwan
    "no"    : "Norsk",//Norwegian
    "pl"    : "Polski",//Polish
    "pt_br" : "Português - Brasil",//Portuguese-Brazil
    "pt"    : "Português - Portugal",//Portuguese-Portugal
    "ru"    : "Россия",//Russian
    //"es_la" : "Español - América Latina",//Spanish_LAtam // Language pack isn't available in moodle
    "es_mx" : "Español - América Latina",//Spanish_LAtam - Spanish Mexico is used
    "es"    : "Español - España",//Spanish-Spain
    "sv"    : "Svensk",//Swedish
    "th"    : "ไทย",//Thai
    "tr"    : "Türkce",//Turkish
    "vi"    : "Tiếng Việt"//Vietnamese
};


var defaultLang = "en_us";
var langStrings = [];
var footerTimer='';
var progressStartFLAG=false;
var manualSyncStart=false;
var showNewsSlide = false;
var forgetPass_Word=false;
var videoContrl;
var config='', ie11, win7;

function init() {
    var src, src1, nav;
	nav = navigator.userAgent.toLowerCase();
	ie11 = !!nav.match(/trident.*rv\:11\./);
	win7 = ( nav.indexOf('windows nt 6.1') != -1 );
	
    if ( isAndroid() && isPhoneGap() ) {
//        src = "../lib/android/cordova-2.2.0.js";
        src = "../lib/AndroidSQLitePlugin.js";
        var oHead = document.getElementsByTagName('HEAD').item(0);
        var oScript = document.createElement("script");
        oScript.type = "text/javascript";
        oScript.src = src;
        oHead.appendChild(oScript);

        document.addEventListener("deviceready", onDeviceReady, false);
    }else if( isiOS() && isPhoneGap() ){
        
        src = "../lib/SQLitePlugin.js";
        var oHead = document.getElementsByTagName('HEAD').item(0);
        var oScript = document.createElement("script");
        oScript.type = "text/javascript";
        oScript.src = src;
        oHead.appendChild(oScript);
        
        document.addEventListener("deviceready", onDeviceReady, false);
    }
    if ( ie11 && win7 ) {
		src = "../lib/adobeReaderPlugin.js";
		src1 = "../lib/adopeDeductionPlugins.js";
		var oHead = document.getElementsByTagName('HEAD').item(0);
		var oScript = document.createElement("script");
		var oScript1 = document.createElement("script");
		oScript.type = "text/javascript";
		oScript.src = src;
		oScript1.type = "text/javascript";
		oScript1.src = src1;
		oHead.appendChild(oScript);
		oHead.appendChild(oScript1);
	}
    jQuery.ajax({
                type: "GET",
                url: "../json/config.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    config = data;
                }
    });
    
}

function initiateEventListener(){
	if( isPhoneGap() && isAndroid() ){
    	window.addEventListener('offline',  updateOfflineStatus, false);
    	window.addEventListener('online', updateOnlineStatus, false);
    }
}

function updateOfflineStatus(){
	if( isPhoneGap() && isAndroid() ){
		console.log("Network Status false");
        jQuery(".onlineStatus img").attr('src','../images/strike.png');
        jQuery('#edit_profile,#chngpaswd').addClass('disable');
        jQuery('#edit_profile,#chngpaswd').attr('disabled','disabled');
    }else if( isiOS() && isPhoneGap() ){
        if( checkAppOnline() ){
            jQuery(".onlineStatus img").attr('src','../images/refresh.png');
            jQuery('#edit_profile,#chngpaswd').removeClass('disable');
        }else{
           jQuery(".onlineStatus img").attr('src','../images/strike.png');
           jQuery('#edit_profile,#chngpaswd').addClass('disable');
        }
    }
}

function updateOnlineStatus(){
	if( isPhoneGap() && isAndroid() ){
		console.log("Network Status true");
        jQuery(".onlineStatus img").attr('src','../images/refresh.png');
        jQuery('#edit_profile,#chngpaswd').removeClass('disable');
        jQuery('#edit_profile,#chngpaswd').attr('disabled','');
    }else if( isiOS() && isPhoneGap() ){
        if( checkAppOnline() ){
            jQuery(".onlineStatus img").attr('src','../images/refresh.png');
            jQuery('#edit_profile,#chngpaswd').removeClass('disable');
        }else{
           jQuery(".onlineStatus img").attr('src','../images/strike.png');
           jQuery('#edit_profile,#chngpaswd').addClass('disable');
        }
    }
}


function updateInternetStatus(){
    if( isPhoneGap() && isAndroid() ){
        cordova.exec(
                        function (result) {
                            if(result){
                                updateOnlineStatus();
                            }else{
                                updateOfflineStatus();
                            }
                        },
                        function (result) {},'CheckOnline', 'status', []);
    }
}

function manualSyncProgress(){
    manualSyncStart=true;
    jQuery("#load_wrapper").hide();
    jQuery(".progress-div,.overlaylightbox").show();
    $(".prog-percent").text(""+(1)+"%");
    $("progress").attr('value',''+parseInt(1)+'');
}

function progressInitiate(){
	progress_Failiure = false;
    jQuery("#load_wrapper").hide();
	jQuery(".progress-div,.overlaylightbox").show();
	$(".prog-percent").text(""+(1)+"%");
	$("progress").attr('value',''+parseInt(1)+'');
	jQuery('body').css("background-image","none");
    jQuery('body').addClass("scrollHidden");
}

function noContent_HideProgres(){
    $(".prog-percent").text("100%");
    $("progress").attr('value','100');
    var FIRST_TIME_USER = window.localStorage.getItem("FIRST_TIME_USER");


    if( FIRST_TIME_USER == "Y" ){
        setTimeout(
                   function(){
                        jQuery(".progress-div,.overlaylightbox").hide();
                        jQuery("#container").addClass('container');
                        jQuery('body').css("background-image","block");
                        jQuery("#login").off();
                        Clazz.navigationController.pop();
                        progressStartFLAG.gettingCategory();
                        progressStartFLAG.homeWidget.loadPage();
                   },100);
    }else{
        setTimeout(
                   function(){
                     jQuery(".progress-div,.overlaylightbox").hide();
                   },100);
    }
}

function sendProgress(json){
		jQuery("#load_wrapper").hide();
		var val = json.CURRENT_FILE_NO;

		var calculated = (val / json.TOTAL_FILES) * 100;

		setTimeout(
					function(){
						var progressBarWidth =calculated*$(".progresscontainer").width()/ 100;
						$(".prog-percent").text(""+(Math.ceil(calculated))+"%");
						$("progress").attr('value',''+Math.ceil(calculated)+'');

						if( (json.TOTAL_FILES == json.CURRENT_FILE_NO) && !manualSyncStart ){

							jQuery(".progress-div").hide();
							jQuery("#container").addClass('container');
							jQuery('body').css("background-image","block");
							jQuery("#login").off();
							Clazz.navigationController.pop();
                            if( !forgetPass_Word ){
							  progressStartFLAG.gettingCategory();
                            }
							progressStartFLAG.homeWidget.loadPage();
                            jQuery('.errorCode-pop .prog-summarys').attr('data-msg','downloadcomplete');
                            updateLanguage();
                            jQuery('.errorCode-pop,.overlaylightbox').show();
                        }else if( (json.TOTAL_FILES == json.CURRENT_FILE_NO) && manualSyncStart){
                           jQuery(".progress-div,.overlaylightbox").hide();
                           jQuery('.errorCode-pop .prog-summarys').attr('data-msg','downloadcomplete');
                           updateLanguage();
                           jQuery('.errorCode-pop,.overlaylightbox').show();
                        }

					},50);
}

function iosNetworkStatus(result){
    if(result){
        jQuery(".onlineStatus img").attr('src','../images/refresh.png');
        jQuery('#edit_profile,#chngpaswd').removeClass('disable');
    }else{
        jQuery(".onlineStatus img").attr('src','../images/strike.png');
        jQuery('#edit_profile,#chngpaswd').addClass('disable');
    }
}

function progressStart(self,forgetPass_Word_Flag){
	progressStartFLAG = self;
    forgetPass_Word = forgetPass_Word_Flag;
}

function progressFailiure(error){
	 console.log(error.errorCode);
	 progress_Failiure = true;
	 //window.removeEventListener('offline',  updateOnlineStatus, false);
 	 //window.removeListener('online', updateOnlineStatus, false);

	 if( error.errorCode == "ERR10009" ){
		 var language = window.localStorage.getItem("language");
		 var activeLang = (language!==undefined && language!==null)?language:defaultLang;
		 translateErrorFormatting(jQuery('#enoughspace-pop-error'),activeLang,"ERR10009",[error.message]);
		 jQuery(".progress-div,.overlaylightbox").hide();
	     jQuery('.enoughspace-pop,.overlaylightbox').show();
	     jQuery(".onlineStatus img").attr('src','../images/refresh.png');
	     return false;
	 }

	 jQuery("#login").show();
	 jQuery('body').css("background-image","block");
	 jQuery(".progress-div,.overlaylightbox").hide();
     jQuery('.errorCode-pop .prog-summarys').attr('data-msg',error.errorCode);
     updateLanguage();
     jQuery('.errorCode-pop').show();
     jQuery(".onlineStatus img").attr('src','../images/refresh.png');
}

function localDBStorageSet(courseId, modId, key, value, userId, isSubmit, callback){
	try{
   		 var db = sqlitePlugin.openDatabase("CliniqueDB.db");
             selectQuery = "SELECT value FROM clinique_quizLocalStorage WHERE courseId = ? and modId = ? and userId = ?",
             insertQuery = "INSERT INTO clinique_quizLocalStorage (courseId, modId, key, value, userId) VALUES (?,?,?,?,?)",
             updateQuery = "UPDATE clinique_quizLocalStorage SET value = ?, key = ? WHERE clinique_quizLocalStorage.courseId = ? and clinique_quizLocalStorage.modId = ? and clinique_quizLocalStorage.userId = ?",
             courseId = courseId,
             modId = modId,
             userId = userId;

   		 db.transaction(function(tx){
   		 	tx.executeSql(selectQuery,[courseId,modId,userId], function(tx,results) {
				if( results.rows.length ) {
					tx.executeSql(updateQuery,[JSON.stringify(value), key, courseId, modId, userId],
								  function(tx,results){
                                      console.log("localDB UPDATE SUCCESS"+"\t"+key, courseId, modId, userId, JSON.stringify(value));
                                      if( typeof(callback) === "function"){
                                         setTimeout(function(){
                                            callback();
                                         },1000);
                                        if( isAndroid() && isSubmit ){
                                            setTimeout(function(){
                                               var userDetails = JSON.parse(window.localStorage.getItem("USER"));
                                               var data={uid:userDetails.id};
                                               cordova.exec(
                                                            function(){},
                                                            function(){},"OfflineSyncPlugin","QuizSync",[data]);
                                             },1000);
                                        }
                                      }
                                  },
								  function(tx,e){ console.log("localDB UPDATE ERROR**"+e.message); });
				}else{
					tx.executeSql(insertQuery,[courseId, modId, key, JSON.stringify(value), userId],
									function(tx,results){
                                      console.log("localDB INSERT SUCCESS"+"\t"+key, courseId, modId, userId, JSON.stringify(value));
                                      if( typeof(callback) === "function" ){
                                       callback();
                                      }

                                    },
									function(tx,e){ console.log("localDB INSERT ERROR**"+e.message); });
				}
			 },
			 function(tx,e){
				console.log("elearn_LocalStorage selectQuery Error**"+e.message);
			 });
   		 });

   		}catch(exception){
   			console.log("localDBStorageSet ERROR"+exception);
   		}

}

function localDBStorageGet(courseId, modId, userId, isSubmit, callback){
    
    try{
        var db = sqlitePlugin.openDatabase("CliniqueDB.db");
        selectQuery = "SELECT value FROM clinique_quizLocalStorage WHERE courseId = ? and modId = ? and userId = ?"
        db.transaction(function(tx){
           tx.executeSql(selectQuery,[courseId,modId,userId], function(tx,results) {
              if( results.rows.length ) {
                if( typeof(callback) === "function"){
                       var data = JSON.parse(results.rows.item(0).value);
                       callback(data);
                }
              }
           },
           function(tx,e){
             console.log("loacalDBStorageGet selectQuery Error**"+e.message);
           });
        });
        
    }catch(err){
        console.log("loacalDBStorageGet ERROR="+err);
    }
}

function scormDetailsInsert(db,userId,courseId,modId,scormUpdate,callback){
	var userId=userId,
		courseId=courseId,
		modId=modId,
		scormUpdate=scormUpdate;
		db.transaction(function(tx){
	        tx.executeSql("SELECT scorm_Progress_Update.scormUpdateFlag FROM scorm_Progress_Update WHERE scorm_Progress_Update.userId=? AND scorm_Progress_Update.modId=? AND scorm_Progress_Update.courseId = ?",[userId,modId,courseId],
	                      function(tx, results){
	                          if( results.rows.length ){
	                              tx.executeSql("UPDATE scorm_Progress_Update SET JSONBody = ?, InteractionJSON = ?, scormUpdateFlag = ?, score_raw = ?, completion_status = ?, objectives_location = ?, objectives_scaled = ?, objectives_min = ?, objectives_max = ?, pollId = ?, pollJSON = ?, success_status = ? WHERE scorm_Progress_Update.userId = ? AND scorm_Progress_Update.modId = ? AND scorm_Progress_Update.courseId=?", [null,null,scormUpdate,null,null,null,null,null,null,null,null,null,userId,modId,courseId], 
	                             		 function(tx, results){ 
	                            	  		console.log("SCORM UPDATE SUCCESS"); 
	                            	  		if( typeof(callback) === "function" ){ callback(); }
	                             		 },
	                             		 function(tx,e){ console.log("SCORM UPDATE ERROR=" + e.message); });
	                          }else{
	                             tx.executeSql("INSERT INTO scorm_Progress_Update (JSONBody, InteractionJSON, scormUpdateFlag, score_raw, completion_status, objectives_location, objectives_scaled, objectives_min, objectives_max, pollId, pollJSON, success_status,modId,courseId,userId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[null,null,scormUpdate,null,null,null,null,null,null,null,null,null,modId,courseId,userId],
	                                    function(tx,results){
	                                    	console.log("SCORM INSERT SUCESS");
	                                    	if( typeof(callback) === "function" ){ callback(); }
	                                    },
	                                    function(tx,e){
	                                    	console.log("SCORM INSERT ERROR=" + e.message);
	                                    });
	                          }
	                      },
	                      function(tx,e){
	                          tx.executeSql("CREATE TABLE IF NOT EXISTS scorm_Progress_Update(JSONBody TEXT, InteractionJSON TEXT, scormUpdateFlag TEXT, score_raw TEXT, completion_status TEXT, objectives_location TEXT, objectives_scaled TEXT, objectives_min TEXT, objectives_max TEXT, pollId TEXT, pollJSON TEXT, success_status TEXT,modId TEXT,courseId TEXT,userId TEXT)");
	                          console.log("SCORM SELECT ERROR=" + e.message);
	                      });
	                    
	        
	     });
}

function isSupportedBrowser(){
    if (/AppleWebKit|Firefox/i.test(navigator.userAgent)) {
        return true;
    }
}

function isAndroid() {
    if (/Android/i.test(navigator.userAgent)) {
        return true;
    }
}

function isiOS() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return true;
    }
}

function isiPad(){
    return (navigator.platform.indexOf("iPad") != -1);
}

function onDeviceReady() {
    jQuery(".enterbtn,.OKbtn").addClass("mobilebtn");
    jQuery("#forget_popup").addClass("mobilebtn");
    jQuery(".footNavigation").show();
    
    logInfo("device is ready");
     if(navigator.platform == "iPad" || navigator.platform == "iPad Simulator"){
         var isFromBlue_OceanInterval = setInterval(function(){
            cordova.exec(
                         function (result) {
                            localStorage.setItem("BOstatus",result);
                             console.log("isFromBlueOcean="+jQuery(".BObackbtn").find('img').attr('src'),result);
                         
                             if( result ){
                               jQuery(".BObackbtn").hide();
                             }else{
                               jQuery(".BObackbtn").show();
                             }
                         },
                         function (args) {},
                         'ElearningPlugin','isFromBlueocean',[]);
             if( jQuery(".BObackbtn").find('img').attr('src') != undefined ){
                clearInterval(isFromBlue_OceanInterval);
             }
        },2000);
    }
}

function initLanguages() {
    var language; var activeLang;
    if(!($.browser.msie  && parseInt($.browser.version, 10) === 7)) {
        language = window.localStorage.getItem("language");
    }
    else {
        language = $.jStorage.get("language");
    }
    activeLang = (language !== undefined && language !== null) ? language : defaultLang;    
    jQuery("#language-dropdown").empty();
    for (var el in languages) {
        jQuery("#language-dropdown").append('<option value="' + el + '">' + languages[el] + '</option>');
    }
    jQuery("#language-dropdown option[value='" + activeLang + "']").attr('selected', true);	
    if(jQuery("#reg_lang").length){
        jQuery("#reg_lang").empty();
        for (var el in languages) {
            jQuery("#reg_lang:last").append('<option value="' + el + '">' + languages[el] + '</option>');
        }
        jQuery("#reg_lang option[value='" + activeLang + "']").attr('selected', true);
    }
}

function loadLanguages(lang) {

    if (typeof(langStrings[lang]) != 'undefined') {
        translatePage(lang);
        return;
    }
    jQuery.ajax({
        type: "GET",
        url: "../lang/" + lang + ".json",
        dataType: 'json',
        cache: false,
        success: function(data) {
            langStrings[lang] = data;
            translatePage(lang);
        }
    });
}

function translatePage(lang) {
    jQuery('[data-msg]').map(function() {
        jQuery(this).text(getString(lang, jQuery(this).attr('data-msg')));
    });

    jQuery('[data-placeholder]').map(function() {
        jQuery(this).attr('placeholder', getString(lang, jQuery(this).attr('data-placeholder')));
		if($('html').hasClass('ie8') || $('html').hasClass('ie9'))
		{
			// artf1213897
//			if(!jQuery(this).hasClass('report_search')){
//				if ( $(this).hasClass('placeholder') ) {
//					jQuery(this).val(getString(lang, jQuery(this).attr('data-placeholder')));
//					if($(this).attr('type')=="password"){
//						jQuery(this).val('');
//						jQuery(this).trigger('focusout');
//						$('#passwordSpan').html(getString(lang, jQuery(this).attr('data-placeholder')))
//					}
//				}
//			}
			
		}
    });

    translateErrormsg(jQuery('#login_error_msg'), lang, jQuery('#login_error_msg').attr('data-error'));
      if(isDevice()) {
        var textLength = $("#forgotpwd_a").text().length;
        if(textLength > 28) {
            $("#forgotpwd_a").addClass("setWidthforForgotPwd");
        } else {
            $("#forgotpwd_a").removeClass("setWidthforForgotPwd");
        }
    }         
}

function translateErrormsg(errobj, lang, key) {
    errobj.html(getString(lang, key)).attr('data-error', key);
}

function translateErrorFormatting(enoughObj, lang, key,values) {
	enoughObj.html(replaceParams(getString(lang, key),values));
}

function trnslateError_htmlFormating(enoughObj, lang, key){
    enoughObj.html(getString(lang, key));
}

function getString(lang, key) {
    if (langStrings[lang] !== undefined) {
        return langStrings[lang][key];
    }
    else
        return false;
}

function replaceParams(string, replacements) {
    return string.replace(/\{(\d+)\}/g, function() {
                          return replacements[arguments[1]];
                          });
    
    // Or, if prototype code above...
    String.format.apply(string, replacements);
}

function logInfo(info) {
    //console.log(info);
}

function isOnline() {
	
    if (navigator.network !== undefined ) {
        switch (navigator.network.connection.type) {
            case Connection.UNKNOWN:
                return false;
                break;
            case Connection.ETHERNET:
                return true;
                break;
            case Connection.WIFI:
                return true;
                break;
            case Connection.CELL_2G:
                return true;
                break;
            case Connection.CELL_3G:
                return true;
                break;
            case Connection.CELL_4G:
                return true;
                break;
            case Connection.NONE:
                return false;
                break;
            default :
                return navigator.onLine;
                break;
        }
    }else{
        return navigator.onLine ? true : false;
    }


}

function quizSyncBack(){
    if( isDevice() ){
        var userDetails = JSON.parse(window.localStorage.getItem("USER"));
        var data={uid:userDetails.id};
        cordova.exec(
                     function(){},
                     function(){},"OfflineSyncPlugin","QuizSync",[data]);
    }
}

function scormSyncBack(){
    if( isDevice() ){
        var userDetails = JSON.parse(window.localStorage.getItem("USER"));
        var data={uid:userDetails.id};
        cordova.exec(
                     function(){},
                     function(){},"OfflineSyncPlugin","ScormSync",[data]);
    }
}

function checkAppOnline(){
	if( isiOS() && isDevice() ){
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';

        if( states[networkState] == 'No network connection' || states[networkState] == 'Unknown connection' ){
              return false;
        }else{
             return true;
        }
	}else if( isAndroid() && isDevice() ){
		return isOnline();
	}
}

function isDefined(content) {
    if (content !== null && content !== "" && content !== undefined && content.length !== 0) {
        return true;
    }
    return false;
}

function isDevice() {
    var device = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent));
    if( isPhoneGap() && device ){
        device = true;
    }else{
        device = false;
    }
    return device;
}

function isMobileDevice(){
	 var device = (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent));
	 return device;
}


function getBrowserName() {
    var userAgent = navigator.userAgent.toLowerCase();
    var userBrowserName = navigator.appName.toLowerCase();
    // Figure out what browser is being used
    jQuery.browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
        safari: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        chrome: /chrome/.test(userAgent),
        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent),
        name: userBrowserName
    };
    return jQuery.browser;
}

function emptyMedia() {
    jQuery("#content-webview, .course_ifram_cls_btn, .next_activity").empty();
}

function detectDevice() {
    var deviceType;
    if (jQuery.browser.mobile) {
        deviceType = 'mobile';
    } else {
        deviceType = 'tablet';
    }
    return deviceType;
}
function loadAllLanguages(){
    var language;
    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
        language = window.localStorage.getItem("language");
    } else {
        language = $.jStorage.get("language");
    }
    var activeLang = (language!==undefined && language!==null)?language:defaultLang;
    loadLanguages(activeLang);

}

function hideFooter(selectClass){
    if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid())){

        clearInterval(footerTimer);
        if( jQuery(".footNavigation").hasClass("footerNavswipeUP") ){
            jQuery(".footNavigation").removeClass("footerNavswipeUP");
            jQuery(".footNavigation").find("img").attr("src","../images/arrow_up.png");
            jQuery(".globalmenu.navbar-fixed-bottom").removeClass("globalmenuswipeUP").addClass("globalmenuswipeDOWN");
        }
        jQuery("#footer-menu").find('li').remove();
        var footerElement = '<li class="'+(selectClass==undefined?'selected':'')+' footer_home"><a href="#"><span class="hmemenuicon"></span><span class="hmemenutxt" data-msg="Home"></span></a></li>';
        footerElement += '<li class="'+(selectClass!=undefined?'selected':'')+' footer_course"><a href="#"><span class="courseicon"></span><span class="hmemenutxt" data-msg="Courses"></span></a></li>';
        footerElement += '<li class="footer_me"><a href="#"><span class="meicon"></span><span class="hmemenutxt" data-msg="Me" ></span></a></li>';
        footerElement += '<li class="footer_players"><a href="#"><span class="playersicon"></span><span class="hmemenutxt" data-msg="Players"></span></a></li>';
        jQuery(footerElement).appendTo(jQuery("#footer-menu"));
    }
}
/* Footer block retained in bottom on scroll for Iphone - Starts Here */
var initscrollTop = scrollTop = 0;
if (navigator.platform.match(/iP(od|hone|ad)/i)) {
    adjustHt = 0;
    var winHt = $(window).height();
    if (winHt < 350) // Condition to check the Console panel presence
        adjustHt = 50;

    $(window).scroll(function() {
        var scrollTop = parseInt($(window).height() + $(document).scrollTop() + adjustHt);
        $('.menu').animate({
            top: scrollTop + 'px'
        }, 400, function() {
            });
    });
}
/* Footer block retained in bottom on scroll for Iphone - Ends Here */
function disableF5(e) {

    if (e.which == 116){
        // alert("in");
        e.preventDefault();
    }
}
// To disable f5
function ci(r){
    //console.info(r);
}

function removeOfScroll(){
    jQuery('#content-webview, #displayContent, #displayContentFav').css('overflow','hidden');
}
function isPhoneGap() {
    if(typeof cordova == "undefined"){
        return false;
    }
    return (cordova || PhoneGap || phonegap) 
    && /^file:\/{3}[^\/]/i.test(window.location.href) 
    && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

function headFootCtrl(){
    if(!isDevice()){
       if((jQuery(this).width() >= 1000) && !(navigator.platform.match(/iPad/i))){
            jQuery("div.row.menu2, div.row.menu2 > div.globalmenu2").addClass('showIt').removeClass('hideIt'); // Header Show
            jQuery("div.row.menu, div.row.menu > div.globalmenu").addClass('hideIt').removeClass('showIt');  // Footer Hide
            jQuery("div.web_nav_adj").show();
			if ( $.browser.msie && parseInt($.browser.version, 10) === 7 && $('body').hasClass('quiz-main-container') ) {
				jQuery("div.row.menu2, div.row.menu2 > div.globalmenu2").removeClass('showIt');
			}
        }else{
            jQuery("div.row.menu2, div.row.menu2 > div.globalmenu2").addClass('hideIt').removeClass('showIt'); // Header Hide
            if( ( isAndroid() || isiOS() ) && ( navigator.platform != 'iPad' && navigator.platform != 'iPad Simulator' ) ){
              jQuery("div.globalmenu").addClass('globalmenuswipeDOWN ').removeClass('hideIt'); // Footer Show   
            }else{
             jQuery("div.row.menu, div.row.menu > div.globalmenu").addClass('showIt').removeClass('hideIt'); // Footer Show
             jQuery("div.web_nav_adj").hide();
            }
        }
    }
}

function homeCarousel(){

  // If condition is false to both desktop and tablet for previous selection is display to center when return to click home link or home navigation in header.
  if( jQuery("#carousel").length || jQuery(".homeSwiper-container").length ){ 
        var userDetails;
        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
            userDetails = JSON.parse(window.localStorage.getItem("USER"));
        } else {
            userDetails = JSON.parse($.jStorage.get("USER"));
        }
   var swiperNavigation=['crs-ctrl','me-ctrl','fav-ctrl','pro-ctrl','rsc-ctrl','rpt-ctrl','help-ctrl','ply-ctrl'];
   if( userDetails.role == '' ){
       swiperNavigation.splice(5, 1);
   }
   
    for ( var i = 0; i < swiperNavigation.length; i++ ) {
        //if ( swiperNavigation[i] == 'rpt-ctrl' ) {
            //swiperNavigation.splice(i, 1);
        //}
         self.roleCount++;
    }
   
   
   var element= '<div class="span10 offset1 marleft6">  \r\n' +
                '<div class="swiper-container homeSwiper-container">  \r\n' +
                '<ul class="swiper-wrapper homeSwiper-wrapper">  \r\n' +
                '<li class="swiper-slide" id="courses">  \r\n' +
                '<img src="../images/icons-set/courses.png" alt=""  />  \r\n' +
                '<div style="color:#ADDA89 !important;" data-msg="Courses" >Courses</div></li>  \r\n' +
                '<li class="swiper-slide" id="me">  \r\n' +
                '<img src="../images/icons-set/me.png" alt=""  />  \r\n' +
                '<div style="color:#FCBB9D !important;" data-msg="Me" >Me</div></li>  \r\n' +
                '<li class="swiper-slide" id="favorites_page">  \r\n' +
                '<img src="../images/icons-set/favourites.png" alt=""  />  \r\n' +
                '<div style="color:#FEABBB !important;" data-msg="Favorites">Favorites</div></li>  \r\n' +
                '<li class="swiper-slide" id="progress_page">  \r\n' +
                '<img src="../images/icons-set/progress.png" alt=""  />  \r\n' +
                '<div style="color:#676094 !important;" data-msg="Progress" >Progress</div></li>  \r\n' +
                '<li class="swiper-slide" id="resrc_page">  \r\n' +
                '<img src="../images/icons-set/resource-library.png" alt=""  />  \r\n' +
                '<div style="color:#E1ADFF !important;" data-msg="Resources" >Resources</div></li>  \r\n' +
                ''+(userDetails.role!=''?'<li class="swiper-slide" id="report_page"><img src="../images/icons-set/reports.png" alt=""  /><div style="color:#B6D87A !important;" data-msg="Reports" >Reports</div></li>':'')+'  \r\n' +
                ''+( showNewsSlide ? '<li class="swiper-slide" id="newsslide"><img src="../images/icons-set/news.png" alt=""  /><div style="color:#ECE096 !important;" data-msg="News" >News</div></li>':'')+'  \r\n' +
                '<li class="swiper-slide" id="helpslide">  \r\n' +
                '<img src="../images/icons-set/help.png" alt=""  />  \r\n' +
                '<div class="desc" data-msg="Help" style="color:#CFCFCF !important;" >Help</div></li>  \r\n' +
                '<li class="swiper-slide" id="playerslide">  \r\n' +
                '<img src="../images/icons-set/players.png" alt=""  />  \r\n' +
                '<div style="color:#6ADEE2 !important;" data-msg="Players">Players</div></li></ul>  \r\n' +
                '<div class="pagination"></div></div></div>';
    
    jQuery(".iPadCarouselbx").find(".span10").remove();
    jQuery(".iPadCarouselbx").append(jQuery(element));
    jQuery(".homeSwiper-container").swiper({
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
        var language;
        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
         language = window.localStorage.getItem("language");
        } else {
            language = $.jStorage.get("language");
        }        
      var activeLang = (language!==undefined && language!==null)?language:defaultLang;
      loadLanguages(activeLang);
 }
}

function updateLanguage(){
    var language;
        language = window.localStorage.getItem("language");
    var activeLang = (language!==undefined && language!==null)?language:defaultLang;
    loadLanguages(activeLang);
}

function unauthorisedFooter1 (){
    var isAuthorised;
    if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
        isAuthorised = window.localStorage.getItem("pwd");
    } else {
        isAuthorised = $.jStorage.get("pwd");
    }
	if(!isAuthorised) {
		jQuery("footer\\:widget ul#footer-menu").hide();
	}else{
		jQuery("footer\\:widget ul#footer-menu").show();
	}
}

function formSearch(){
    jQuery('#reports_search').trigger('click');
    jQuery(".random_report_search").blur();
}

function progress(){
	
	var progressBar=$(".progress-div");
    var val = progressBar.progressbar( "value" ) || 0;
	progressBar.progressbar( "value", val + 1 );
//    var progressBarWidth =val*$(".progresscontainer").width()/ 100;
//    $(".progressLabel").text(""+(val + 1)+"%");
//    $(".progressbar").width(progressBarWidth);
   
	$(".prog-percent").text(""+(parseInt(val))+"%");
	
    if ( val < 99 ) {
      setTimeout( progress, 100 );
      
    }else if( val < 100 ){
    	jQuery(".commentmodal-backdrop,.progress-div").hide();
    	jQuery("#loginPop, .quizmask, .forgotbx_holder, #popupSignIn").show();
    }
}

function initiateProgress(){
	jQuery(".commentmodal-backdrop,.progress-div").show();
	setTimeout( progress, 3000 );
}

function changeManifestFile(userID,courseID,modID,callBack){
    var manifestxmlPath = window.localStorage.getItem("manifestURL");
    if( isiOS() && isPhoneGap() && config.application.offLine){
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
         fileSystem.root.getFile("" + manifestxmlPath + "", null, function(fileEntry) {
             fileEntry.file(function(file) {
                 readAsText(file, userID,courseID,modID,callBack);
                },fail);
             },fail);
         }, fail);
    }else if( isAndroid() && isPhoneGap() && config.application.offLine){
    	
//    	var URL = "Android/data/com.photon.phresco.hybrid/files/Clinique/SCORM/"+modID+"";
//    	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
//            fileSystem.root.getDirectory(URL, { /*get the created folder*/
//                create: false,
//                exclusive: false
//            }, function gotFileEntry(filies) {
//            	console.log(filies);
//                var i = 0, reader = filies.createReader();
//                reader.readEntries(function(entries) {
//                    for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
//                        var filePath_string = entries[i].fullPath;
//                        if( filePath_string.search("imsmanifest.xml") != -1 ){
//                        	readAsText(filePath_string, userID,courseID,modID,callBack);
//                        	return false;
//                        }
//                            
//                    }
//                }, fail);
//            }, fail);
//        }, fail);
       if( typeof(callBack) === "function"){ callBack() }
    }else{
        if( typeof(callBack) === "function"){ callBack() }
    }
}

function readAsText(file, userID, courseID, modID, callBack){
    var xml = null;
    var reader = new FileReader();
    reader.onloadend = function(evt) {
        xml = jQuery.parseXML(evt.target.result);
        jQuery(xml).find('item').each(function() {
          jQuery(this).attr("identifier", "" + userID + "" + courseID + "" + modID + "");
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
                    writer.write("" + XMLtostr(xml) + "");
                    writer.onwriteend = function() {
                        if( typeof(callBack) === "function"){ callBack() }
                    };
                };
            };
            writer.write("" + self.XMLtostr(xml) + "");
            }, fail);
         }, fail);
        }, fail);
    };
    reader.onerror = function() {
    };
    reader.readAsText(file);
}

function XMLtostr(xmlData){
    var xmlString = (new XMLSerializer()).serializeToString(xmlData);
    return xmlString;
}

function fail(evt){
     console.log("Manifest File Error : "+evt.code);
}

function scormUpdate(userID,quizCourseId,modID){
    if( isDevice() ){
        try{
            var _userID = userID, _quizCourseId= quizCourseId, _modID=modID;
            var db = sqlitePlugin.openDatabase("CliniqueDB.db"),
            scormIDentifier="" + _userID + "" + _quizCourseId + "" + _modID + "",
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
                               tx.executeSql("SELECT scormUpdateFlag FROM scorm_Progress_Update WHERE scorm_Progress_Update.userId = ? AND scorm_Progress_Update.modId = ? AND scorm_Progress_Update.courseId = ?", [_userID,_modID,_quizCourseId],
                                             function(tx,results){
                                             
                                             if (results.rows.item(0)['scormUpdateFlag'] === "true") {
                                             console.log("scormUpdateFlag="+results.rows.item(0)['scormUpdateFlag']);
                                             if (scormpool !== undefined && scormpool !== null && scormpool !== "" && scormpool.length !== 0) {
                                             
                                             jQuery.each(scormpool.organizations.Turnaround_Revitalizing_Resource_ORG.cmi, function(key, value) {
                                                         
                                                         if (scormIDentifier === key) {
                                                         console.log("scormIDentifier="+scormIDentifier+" key="+key);
                                                         var dte = new Date();
                                                         starttime.value= dte.getTime();
                                                         starttime.setbysco="true";
                                                         attempts.value="2";
                                                         attempts.setbysco=false;
                                                         value.starttime=starttime;
                                                         value.attempts=attempts;
                                                         
                                                         tx.executeSql("UPDATE scorm_Progress_Update SET JSONBody = ?, InteractionJSON = ?, scormUpdateFlag = ?, score_raw = ?, completion_status = ?, objectives_location = ?, objectives_scaled = ?, objectives_min = ?, objectives_max = ?, pollId = ?, pollJSON = ?, success_status = ? WHERE scorm_Progress_Update.userId = ? AND scorm_Progress_Update.modId = ? AND scorm_Progress_Update.courseId=?", [JSON.stringify(scormpool), null, "false", null, completion_status, objectLocation, scaled, min, max, pollId, null, success_status,s_userID,_modID,_quizCourseId],
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
}

function jsonEscape(str)  {
    return str.replace(/\n/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
}

// To control play and pause button in video player.
function videoContrlFun() {
	if ( videoContrl != undefined ) {
		videoContrl.pause();
	}
}

/* Restricting Footer Mobile Menu in web */
jQuery(window).resize(function (){
    $('.scormPage #container .pro_container #content-webview').css('height',$(window).height());
	$('.quiz-main-container #content-webview').css('height',$(window).height()-45);
    if( (navigator.platform == "iPhone" || navigator.platform == "iPhone Simulator") && ( isDevice() ) ){
      jQuery("#mob_book_shelf").css('padding-bottom','0');
    }
     
    headFootCtrl();
}).load(function (){
    document.ontouchmove = function(event){
        if($('body.unScrolled').length){
            event.preventDefault();
        }
    }
	 
});

function BObuttonactive(status){
    console.log("Hybrid BObuttonactive "+ status);
    localStorage.setItem("BOstatus",status);
    if(navigator.platform == "iPad" || navigator.platform == "iPad Simulator"){
        if(status == "0"){
            jQuery(".blueoceanbtn,.BObackbtn").show();
        }else {
            jQuery(".blueoceanbtn,.BObackbtn").hide();
        }
    }else{
        jQuery(".BObackbtn").hide();
    }
}

function videoTapped( tapped, video_tapped ){
    if((navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && isDevice() && video_tapped ){
        var data={};
        data.VideoTapped=tapped;
        cordova.exec(
                     function (args) {},
                     function (args) {},
                     'ElearningPlugin','videoTapped',[data]);
    }
}
