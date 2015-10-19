define(["framework/WidgetWithTemplate","home/Home","course/Course","me/Me"] , function(template) {
    Clazz.createPackage("com.components.widget.footer.js");
    Clazz.com.components.widget.footer.js.Footer = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/footer/template/footer.tmp",
        configUrl: "../../componens/footer/config/config.json",
        name : "footer",
        footerContainer:"footer\\:widget",
        homeWidget:null,
        courseWidget:null,
        meWidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
        },
        loadPage :function(data){
            var self = this;
            self.UserDetails={};
            self.UserDetails=data;

            if (($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    var footerElmhtml = '<footer class="footerbx_web ie7-footer-specific hideSection" > <a class="privacyPolicy" target="_blank" href="'+(isDevice()?'javascript:void(0)' : '#')+'" data-msg="privacy_policy">PRIVACY POLICY</a> | ';
                       footerElmhtml += '<a class="termsConditions" target="_blank" href="'+(isDevice()?'javascript:void(0)' : '#')+'" data-msg="terms_conditions">TERMS & CONDITIONS</a> </footer>';
                       footerElmhtml += '<div class="row menu hideSection"> <div class="footNavigation" id="footerNavigation"><img src="../images/arrow_up.png" alt=""/></div>';
                       footerElmhtml += '<div class="globalmenu navbar-fixed-bottom" id="globalmenuNavigation"> <footer class="footerbx">';
                       footerElmhtml += ' <a class="privacyPolicy" target="_blank" href="'+(isDevice()?'javascript:void(0)' : '#')+'" data-msg="privacy_policy">PRIVACY POLICY</a> | ';
                       footerElmhtml += ' <a class="termsConditions" target="_blank" href="'+(isDevice()?'javascript:void(0)' : '#')+'" data-msg="terms_conditions">TERMS & CONDITIONS</a> </footer>';
                       footerElmhtml += ' <ul id="footer-menu"> {{footerContent}} </ul> </div> </div>';
                   
                   if(! ($('.ie7-footer-specific').hasClass('footerbx_web'))) {
                       $(footerElmhtml).insertAfter('.widget-maincontent-div');
                   }
                    this.bindUI();
                    this.render(this.footerContainer);
            }
            else {
             this.render(this.footerContainer);   
            }
        //this.render(this.footerContainer); 
        },
		onResume: function () {
			//console.info("footer resume");
		},
        postRender : function(){
            var basePath = this.globalConfig.apiAddress.host.replace('admin',''), self = this;
            var privacyPolicyWeb = Clazz.config.apiAddress.privacyPolicyWeb;
            var termsConditionWeb = Clazz.config.apiAddress.termsConditionWeb;
            var iTouch,privacyPolicy,termsCondition;
            if(isiOS()){
                iTouch = 'touchstart';
            }else{
                iTouch = 'click';
            }
                                                                
            if(isPhoneGap() && isDevice()){
             jQuery(".privacyPolicy").attr("href","javascript:void(0)");
             jQuery(".termsConditions").attr("href","javascript:void(0)");
            }
            jQuery("footer.footerbx > a.privacyPolicy, footer.footerbx_web > a.privacyPolicy").die().live(iTouch, function(e) {
                var language;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                } else {
                    language = $.jStorage.get("language");
                }
                var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                if(isPhoneGap() && isDevice() && self.globalConfig.application.offLine ){
                          cordova.exec(
                                       function(result){
                                           var res = JSON.parse(result);
                                           if( res.response.downloadFilePath != "file://" ){
                                               policyItemsData={
                                                   getFilePath: res.response.getFilePath,
                                                   downloadFilePath: res.response.downloadFilePath
                                               };
                                               self.loadFileinWeb(self, policyItemsData);
                                           
                                           }else if( res.response.downloadFilePath == "file://" ){
                                               privacyPolicy = 'Clinique_Education_Privacy_Policy_DEVICE';
                                               var getFilePath, downloadFilePath, policyItemsData;
                                               getFilePath = privacyPolicy+'_'+ activeLang +'.docx';
                                               downloadFilePath = basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx';
                                               policyItemsData = {
                                                   getFilePath: getFilePath,
                                                   downloadFilePath: downloadFilePath
                                               }
                                               self.checkIfFileExists(self, policyItemsData);
                                           }
                                       },
                                       function(){},"OfflineServicePlugin","getTermsAndConditions",["privacyPolicy",activeLang]);
                            
                }else if(  isDevice() && isPhoneGap() && self.globalConfig.application.offLine){
                  privacyPolicy = 'Clinique_Education_Privacy_Policy_DEVICE';
                  var getFilePath, downloadFilePath, policyItemsData;
                  getFilePath = privacyPolicy+'_'+ activeLang +'.docx';
                  downloadFilePath = basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx';
                  policyItemsData = {
                      getFilePath: getFilePath,
                      downloadFilePath: downloadFilePath
                  }
                  self.checkIfFileExists(self, policyItemsData);
                }else{
                    privacyPolicy = privacyPolicyWeb;                    
                    jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ privacyPolicy+'_'+ activeLang +'.docx');
                }
            });
            jQuery("footer.footerbx > a.termsConditions, footer.footerbx_web > a.termsConditions").die().live(iTouch,function() {
                var language;
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                 language = window.localStorage.getItem("language");
                } else {
                    language = $.jStorage.get("language");
                }
                var activeLang = (language!==undefined && language!==null)?language:defaultLang;
                if(isPhoneGap() && isDevice() && self.globalConfig.application.offLine){
                  cordova.exec(
                               function(result){
                                   var res = JSON.parse(result);
                                   if( res.response.downloadFilePath != "file://" ){
                                       policyItemsData={
                                           getFilePath: res.response.getFilePath,
                                           downloadFilePath: res.response.downloadFilePath
                                       };
                                       self.loadFileinWeb(self, policyItemsData);
                               
                                   }else if(res.response.downloadFilePath == "file://" ){
                               
                                       termsCondition = 'Clinique_Education_Terms_And_Conditions_DEVICE';
                                       var getFilePath, downloadFilePath, policyItemsData;
                                       getFilePath = termsCondition+'_'+ activeLang +'.docx';
                                       downloadFilePath = basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx';
                                       policyItemsData = {
                                           getFilePath: getFilePath,
                                           downloadFilePath: downloadFilePath
                                       }
                                       self.checkIfFileExists(self, policyItemsData);
                                   }
                               },
                               function(){},"OfflineServicePlugin","getTermsAndConditions",["termsCondition",activeLang]);
                                                                                                              
                }else if( isDevice() && isPhoneGap() && !self.globalConfig.application.offLine ){
                  termsCondition = 'Clinique_Education_Terms_And_Conditions_DEVICE';
                  var getFilePath, downloadFilePath, policyItemsData;
                  getFilePath = termsCondition+'_'+ activeLang +'.docx';
                  downloadFilePath = basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx';
                  policyItemsData = {
                      getFilePath: getFilePath,
                      downloadFilePath: downloadFilePath
                  }
                  self.checkIfFileExists(self, policyItemsData);
                }else {
                    termsCondition = termsConditionWeb;
                    jQuery(this).attr('href',basePath +'language/'+ activeLang +'/'+ termsCondition+'_'+ activeLang +'.docx');
                }
            });
        },
        checkIfFileExists: function(self, policyItemsData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false, fileName;
                fileName = policyItemsData.getFilePath;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        var i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) {  /*check if already exist.*/
                                    policyItemsData.downloadFilePath = entries[i].fullPath;
                                    self.loadFileinWeb(self, policyItemsData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
                                self.downloadFile(self, policyItemsData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, policyItemsData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, policyItemsData);
                });
            } else {
                self.loadFileinWeb(self, policyItemsData);
            }
        },
        downloadFile: function(self, policyItemsData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
                var fileName = policyItemsData.getFilePath, downloadFileURL = policyItemsData.downloadFilePath;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*create folder into local drive*/
                        create: true,
                        exclusive: false
                    }, function gotFileEntry(fileEntry) {
                        var filePath = fileEntry.fullPath + "/" + fileName;
                        var fileTransfer = new FileTransfer();
                        var options = new FileUploadOptions();
                        options.chunkedMode = false;
                        // Please wait. Your file will load in a few seconds.
                        fileTransfer.onprogress = function(progressEvent) {
                            jQuery("#load_wrapper, .overlaycontainer").show();
                        };
                        fileTransfer.download(downloadFileURL, filePath, function(fileDir) {
                            policyItemsData.downloadFilePath = fileDir.fullPath;
                            self.loadFileinWeb(self, policyItemsData); /*load downloaded file into iframe/ video*/
                        }, function(error) {
                            //console.log("**********download error source " + error.source);
                            //console.log("********download error target " + error.target);
                            //console.log("*********upload error code: " + error.code);
                        });
                    }, self.fileError);
                }, self.fileError);
            } else {
                /* jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                }); */
				
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('.errorCode-pop').show();
				
            }
        },
        fileError: function(evt) {
            //console.log("Error occured in download : ******** " + JSON.stringify(evt));
        },
        loadFileinWeb: function(self, policyItemsData){
            var filePath = policyItemsData.downloadFilePath;
            if(isDevice() && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").hide();
                if( /Android/i.test(navigator.userAgent) ) {
                    //window.plugins.fileOpener.open(filePath);
                	//console.log("TERMS CONDITION="+filePath);
                    cordova.exec(
                            function (args) {},
                            function (args) {},
                            'FileOpener','openVideoFile',[filePath]);
                    return false;
                }
                else{
                    var docHeight = $(document).height(), docWidth = $(window).width();
					jQuery(window).off("orientationchange").on("orientationchange",function(){
					   docWidth = $(window).width();
					   jQuery('#legalContent-iframe').css('width',docWidth);
					});
					if(navigator.platform.indexOf("iPad") == -1){
                           docWidth = '640px';
                           jQuery(window).off("orientationchange").on("orientationchange",function(){
                               docWidth = '640px';
                               jQuery('#legalContent-iframe').css('width',docWidth);
                            });
                    }
                    jQuery(".legalDocs").prepend('<div style="margin: 0; position: fixed; top:10px; right:10px;" class="ifram_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
                    jQuery('<iframe/>', {
                        name: 'legalContent-iframe',
                        id: 'legalContent-iframe',
                        height:docHeight,
                        width:docWidth,
                        src: filePath
                    }).appendTo(jQuery('.legalDocs'));
                    jQuery(".legalDocs, .quizmask").show();
                }
            }
        },
        bindUI : function(){
            headFootCtrl();
            var self = this, iTouch = 'click', language;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }                
            var activeLang = (language!==undefined && language!==null)?language:defaultLang;
            initLanguages();
            loadLanguages(activeLang);
                                                                
            if( isiOS() && !isDevice() ){
              jQuery(".row.menu").addClass('float_footer');
            }
            if(isiOS()){
                iTouch = 'touchstart';
            }
            jQuery('.legalDocs .ifram_cls_btn').die().live(iTouch, function(){
                if(jQuery(".legalDocs .ifram_cls_btn").length){
                    jQuery(".legalDocs").empty();
                    jQuery(".legalDocs, .quizmask").hide();
                }
            });
                                                                
            jQuery('.footer_home').die().live('click',function(){
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
                hideFooter();
                var hash = window.location.hash;
                if(hash !== '#home'){
                    if(!jQuery("#carousel").length && !jQuery(".homeSwiper-container").length ){
						videoContrlFun();
                        self.homeWidget = new Clazz.com.components.widget.home.js.Home();
                        self.homeWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#home');
                        homeCarousel();
                    }
                }
              return false;
            });

            jQuery('.footer_course').die().live('click',function(){
                var hash = window.location.hash;
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
                hideFooter("course");
                if(hash != '#course'){
                    if(!jQuery(".bkself").length){
						videoContrlFun();
                        self.courseWidget = new Clazz.com.components.widget.course.js.Course();
                        self.courseWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#course');
                    }
                }
               return false;
            });

            jQuery('.footer_me').die().live('click',function(){
                var hash = window.location.hash;
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(this).addClass('selected');
                hideFooter();
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('.errorCode-pop').show();
				}
                self.loginService();
                if(hash !== '#me'){
                    if(!jQuery("#profile_edit").length){
						videoContrlFun();
                        self.meWidget = new Clazz.com.components.widget.me.js.Me();
                        self.meWidget.loadPage(self.UserDetails);
                    }else{
                        Clazz.navigationController.getView('#me');
                    }
                }
              return false;
            });

            jQuery('.footer_players').die().live('click',function(){
                var hash = window.location.hash;
                var isBadgePage = $("div.flip.in:not(.out) input#badge-page").length;
                var isSelected = $(this).hasClass('selected');
                hideFooter();
                if(!isSelected || (isBadgePage > 0)){
                    jQuery("#footer-menu li").removeClass('selected');
                    jQuery(this).addClass('selected');
                    if(hash !== '#players'){
                        if(!jQuery("#player-page").length){
							videoContrlFun();
                            self.meWidget = new Clazz.com.components.widget.players.js.Players();
                            self.meWidget.loadPage(self.UserDetails);
                        }else{
                            Clazz.navigationController.getView('#players');
                        }
                    }
                }
                return false;
            });
            
            jQuery(".footNavigation").die().live('click',function(e){ 
               e.preventDefault();
               if( jQuery(".footNavigation").hasClass("footerNavswipeUP") ){
                 jQuery(".footNavigation").removeClass("footerNavswipeUP");
                 jQuery(".footNavigation").find("img").attr("src","../images/arrow_up.png");
                 jQuery(".globalmenu.navbar-fixed-bottom").removeClass("globalmenuswipeUP").addClass("globalmenuswipeDOWN");
                 clearInterval(footerTimer);
               }else{
                 jQuery(".footNavigation").addClass("footerNavswipeUP");
                 jQuery(".footNavigation").find("img").attr("src","../images/arrow_down.png");
                 jQuery(".globalmenu.navbar-fixed-bottom").show().removeClass("globalmenuswipeDOWN").addClass("globalmenuswipeUP");
                 footerTimer = setInterval(function (){
                                 jQuery(".footNavigation").removeClass("footerNavswipeUP");
                                 jQuery(".footNavigation").find("img").attr("src","../images/arrow_up.png");
                                 jQuery(".globalmenu.navbar-fixed-bottom").removeClass("globalmenuswipeUP").addClass("globalmenuswipeDOWN");
                                    if( jQuery(".globalmenu.navbar-fixed-bottom").hasClass("globalmenuswipeDOWN") ){
                                        clearInterval(footerTimer);  
                                    }
                               },5000);
               }
            });
            jQuery(".footNavigation").on('swipeleft', function(){ /*...*/ })
            .on('swiperight', function(){ /*...*/ })
            .on('swipeup', function(){
              jQuery(".footNavigation").removeClass("footerNavswipeUP");
              jQuery(".footNavigation").find("img").attr("src","../images/arrow_up.png");
              if( jQuery(".globalmenu.navbar-fixed-bottom").hasClass("globalmenuswipeUP") ){
                jQuery(".globalmenu.navbar-fixed-bottom").removeClass("globalmenuswipeUP");
              }
                jQuery(".globalmenu.navbar-fixed-bottom").addClass("globalmenuswipeDOWN");
				clearInterval(footerTimer);
            })
            .on('swipedown', function(){
                jQuery(".footNavigation").addClass("footerNavswipeUP");
                jQuery(".footNavigation").find("img").attr("src","../images/arrow_down.png");
                 jQuery(".globalmenu.navbar-fixed-bottom").show().removeClass("globalmenuswipeDOWN").addClass("globalmenuswipeUP");
                 footerTimer = setInterval(function (){
                                 jQuery(".footNavigation").removeClass("footerNavswipeUP");
                                 jQuery(".footNavigation").find("img").attr("src","../images/arrow_up.png");
                                 jQuery(".globalmenu.navbar-fixed-bottom").removeClass("globalmenuswipeUP").addClass("globalmenuswipeDOWN");
                                    if( jQuery(".globalmenu.navbar-fixed-bottom").hasClass("globalmenuswipeDOWN") ){
                                    clearInterval(footerTimer);
                                    }
                               },5000);
            });
        },
        loginService:function(){
            var self = this, userDetails, localpassword;
            var loginserviceUrl = self.globalConfig.apiAddress.service;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                localpassword = window.atob(window.localStorage.getItem("psw"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                localpassword = window.atob($.jStorage.get("psw"));
            }            
            var data = {
                username:userDetails.username,
                password: localpassword,
                service: "moodle_mobile_app",
                action:'login'
            };
            jQuery.ajax({
                url: loginserviceUrl,
                cache:false,
                async:false,
                type:'POST',
                data:data,
                dataType:'json',
                crossDomain: true,
                success:function(res){
                    if(typeof(res.USER) !== 'undefined'){
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            window.localStorage.removeItem("USER");
                            window.localStorage.setItem("USER",JSON.stringify(res.USER));
                        } else {
                            $.jStorage.deleteKey("USER");
                            $.jStorage.set("USER",JSON.stringify(res.USER));
                        }
                    }
                }
            });
        }
    });
    return Clazz.com.components.widget.footer.js.Footer;
});
