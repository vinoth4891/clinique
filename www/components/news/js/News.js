define(["framework/WidgetWithTemplate","abstract/offlineStorage"] , function(template) {
    Clazz.createPackage("com.components.widget.news.js");
    Clazz.com.components.widget.news.js.News = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/news/template/news.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "news",
        localConfig: null,
        globalConfig: null,
        courseItemWidget:null,
        offlineStorage: null,
		takePdfUrl:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage :function(data){
            var self = this;;
            self.UserDetails={};
            Clazz.navigationController.push(self);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
                  if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                      BreadcrumElement = '<section class="tpbreadcrumbs"><ul id="newsbred">  \r\n' +
                      '<li class="newslnk news_home"><a href="#" data-msg="Home"></a></li>  \r\n' +
                      '<li data-msg="News"></li></ul><div class="clear"></div></section>';
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
        bindUI : function(){
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');
            if(!(jQuery('.ie7-footer-specific').hasClass('reportsfooter'))) {
               jQuery('.ie7-footer-specific').addClass('reportsfooter');
            }
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
            var userDetails, newscategoryid;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                newscategoryid = window.localStorage.getItem("catnewsId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                newscategoryid = $.jStorage.get("catnewsId");
            }
            var data = {
                wsfunction: "core_enrol_get_users_courses_subcat",
                moodlewsrestformat : "json",
                userid: userDetails.id,
                categoryid:newscategoryid,
                cattype:'news',
                wstoken:userDetails.token
            };
            var self = this;
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            self.loadData(data);
            jQuery(".newsNav").live('click',function(){
                jQuery('.ifram_news_cls_btn').remove();
                jQuery("#newsIframe,.commentNotes").hide();
                jQuery("#newscontainer").show();
                jQuery('#newsbred li:nth-child(2)').removeClass('reshdnk newsNav').html("<span data-msg='News'></span>");
                jQuery('#newsbred li:nth-child(3)').remove();
                loadAllLanguages();
            });
            jQuery('.news_home').on('click',function(){
				if($('html').hasClass('ie8')){
					jQuery(".widget-maincontent-div").empty();
				}
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
            jQuery('.ifram_news_cls_btn').die().live('click',function(){
                jQuery(this).remove();
                jQuery("#newsIframe,.commentNotes").hide();
                jQuery("#newscontainer").show();
                jQuery('#newsbred li:nth-child(2)').removeClass('reshdnk newsNav').html("<span data-msg='News'></span>");
                jQuery('#newsbred li:nth-child(3)').remove();
                loadAllLanguages();
                self.footerIcons(false);
            });
            jQuery(".footer_comment").die().live('click', function() {
                self.loadResourceComment();
                jQuery(".commentmodal,.commentmodal-backdrop").show();
            });
            jQuery(".commentSavebtn").off().on('click', function(){
                self.saveNotes(".commentform-control");
                jQuery(".commentmodal,.commentmodal-backdrop").hide();
            });
            jQuery(".commentCancelbtn").off().on('click', function(){
                jQuery(".commentmodal,.commentmodal-backdrop").hide();
            });
            jQuery('#save-notes-btn').die().live('click',function(event) {
				event.preventDefault();
				self.saveNotes("#note");
			});
            jQuery('#cancel-notes-btn').die().live('click', function(event){
                event.preventDefault();
                if( self.serverComments != undefined ){
                 jQuery('#note').val(''+self.serverComments+'');
                }else{
                    jQuery('#note').val('');
                }
            });
            jQuery(".AndroidVideo").die().live('click', function() {
                cordova.exec(
                             function (args) {},
                             function (args) {},
                             'FileOpener', 'openVideoFile', [self.AndroidVideoURl]);
            });
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
        },
        loadData:function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.restservice,newsli='';
            jQuery('#nonewscontent').hide();
            if( !isDevice() ){
                    jQuery.ajax({
                        url: serviceUrl,
                        data:data,
                        crossDomain: true,
                        type : 'POST',
                        cache : false,
                        dataType : 'json',
                        async: false,
                        success:function(newsresp){
                            if(newsresp.length > 0){
                                /* Deleting Existing Offline Storage Data */
                                self.offlineStorage.deleteResource('NEWS');
                                var z=0, j=0, newsId = 0;
                                var add = (newsresp.length % 3 == 0) ? 0:1;
                                var noOfrows = parseInt(newsresp.length / 3) + add ;
                                while(j < newsresp.length){
                                    for(var k= 0; k < newsresp.length; k++){
                                        newsId = j;
                                        if(newsresp[j] != undefined){
                                            newsId = newsresp[j].id;
                                            j++;
                                        }
                                        self.newContent(newsId);
                                    }
                                }
                            }
                            else{
                                jQuery('#nonewscontent').show();
                            }
                        },
                        error: function ( jqXHR, textStatus, errorThrown ){
                            self.offlineStorage.getResourceCourse('NEWS');
                            setTimeout(function (){
                                jQuery(".res_hid_data > input[type='hidden']").each(function (){
                                    self.newsSuccess(JSON.parse(jQuery(this).val()));
                                });
                                jQuery(".res_hid_data").empty();
                            }, 1000);
                        }
                    });
            }else if( isDevice() ){
                cordova.exec(
						function(result) {
                            var newsresp = JSON.parse(result);
                            console.log("newsresp="+JSON.stringify(newsresp));
                            if(newsresp.length > 0){
                                 var z=0, j=0, newsId = 0;
                                 var add = (newsresp.length % 3 == 0) ? 0:1;
                                 var noOfrows = parseInt(newsresp.length / 3) + add ;
                                 while(j < newsresp.length){
                                     for(var k= 0; k < newsresp.length; k++){
                                         newsId = j;
                                         if(newsresp[j] != undefined){
                                          newsId = newsresp[j].id;
                                          j++;
                                         }
                                        self.newContent(newsId);
                                     }
                                 }
                            }
						},
						function(result) {
							alert("Course Get Fail="+JSON.stringify(result));
						},'LoginPlugin', 'core_enrol_get_users_courses_subcat', [data]);
            }
        },
        newContent:function(newsId){
            var self = this,li,serviceUrl = self.globalConfig.apiAddress.restservice, userDetails,catnewsId;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                catnewsId = window.localStorage.getItem("catnewsId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data = {
                wsfunction: "core_course_get_contents",
                moodlewsrestformat: "json",
                courseid: newsId,
                wstoken: userDetails.token
            };
            if(isDevice() && !isOnline()) {
//                jQuery('.nonetconnection').slideDown(2000, function(){
//                    jQuery(this).fadeOut(6000);
//                });
            }
            if( !isDevice() ){
                $.ajaxq("newsqueue",{
                    url: serviceUrl,
                    data: data,
                    crossDomain: true,
                    type : 'POST',
                    cache : false,
                    dataType : 'json',
                    async: false,
                    success: function(data) {
                        /* Updating Offline Storage Data */
                        self.offlineStorage.insertResource(newsId, JSON.stringify(data), 'NEWS');
                        self.newsSuccess(data);
                    }
                });
            }else if(isDevice() ){
                data.userid=userDetails.id;
                data.categoryid = catnewsId;
                cordova.exec(
						function(result) {
						   self.UserDetails = JSON.parse(result);
						   self.newsSuccess(self.UserDetails);
						},
						function(result) {
							alert("CourseTopic Get Fail="+JSON.stringify(result));
						},'LoginPlugin', 'core_course_get_contents', [data]);
            }
        },
        newsSuccess: function (data){
            var fileName,fileUrl,pageno, userDetails, self = this, newsFileName;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            for(var i =1; i < data.length;i++){
                if( data[i].modules.length > 0){
                    var module = data[i].modules;
                    for(var j =0;j< module.length;j++){
                        newsFileName = module[j].name;
                        if(module[j].contents != 'undefined'){
										
                            var contents = module[j].contents;
                            if( !isDevice() ){
	                            if(contents){
									if(contents.length){
										 for(var k=0;k< contents.length;k++){
												var src = jQuery(data[i].summary).find('img').attr('src');
												src = src+'?token='+userDetails.token;
												li = '<li class="newsItem" id="'+module[j].id+'" pageno="'+contents[k].pageno+'" newsFileName="'+newsFileName+'" filename="'+contents[k].filename+'" url="'+contents[k].fileurl+'" timemodified='+contents[k].timemodified+' ><a href="javascript:void(0);"><img src="'+src+'"></a></li>';
												jQuery("#newsblog").append(li);
											}
									}
								}
                            }else if( isDevice() && isPhoneGap() && contents != undefined ){
                            	 var src = jQuery(data[i].summary).find('img').attr('src');
	                                src = src+'?token='+userDetails.token;
	                                li = '<li class="newsItem" id="'+module[j].id+'" pageno="'+contents.pageno+'" newsFileName="'+newsFileName+'" filename="'+contents.filename+'" url="'+contents.fileurl+'" timemodified='+contents.timemodified+' ><a href="javascript:void(0);"><img src="'+src+'"></a></li>';
	                                jQuery("#newsblog").append(li);
                            }
                        }
                    }
                }
            }
            jQuery(".newsItem").die().live('click',function(){
                var newsItemData;
                (isDevice() && isAndroid()) ? jQuery("#newscontainer").show():jQuery("#newscontainer").hide();
                modID = jQuery(this).attr('id');
                timemodified = jQuery(this).attr('timemodified');
                pageno = jQuery(this).attr('pageno');
                fileName = jQuery(this).attr('filename');
                newsFileName = jQuery(this).attr('newsFileName');
                if( isDevice() && isPhoneGap() ){
                  fileUrl = jQuery(this).attr('url');
                }else{
                  fileUrl = jQuery(this).attr('url')+'&token='+userDetails.token;
		  self.takePdfUrl = fileUrl;
                }
                
                newsItemData = {
                    fileType: fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase(),
                    fileName: fileName.split('.')[0],
                    fileURL: fileUrl,
                    filepageCount: pageno,
                    fileNameNews: newsFileName
                };
                self.modID =modID;
                self.timemodified =timemodified;
                self.pdfURL = fileUrl;

                self.loadResourceComment();
                self.loadFileiniframe(self, newsItemData)
                //self.checkIfFileExists(self, newsItemData);
            });
        },
        checkIfFileExists: function(self, newsItemData) {  /*fun for whether selected file already downloaded or not*/
            if (isDevice() && isPhoneGap()) {
                var isExists = false, fileName, i;
                fileName = newsItemData.fileName+'.'+newsItemData.fileType;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function onFileSystemSuccess(fileSystem) {
                    fileSystem.root.getDirectory("clinique", { /*get the created folder*/
                        create: false,
                        exclusive: false
                    }, function gotFileEntry(filies) {
                        i = 0, reader = filies.createReader();
                        reader.readEntries(function(entries) {
                            for (i = 0; i < entries.length; i++) {  /*get existing file in the clinique folder*/
                                if (entries[i].name === fileName) {   /*check if already exist.*/
                                    newsItemData.fileURL = entries[i].toURL();
                                    self.loadFileiniframe(newsItemData); /*if yes load into device.*/
                                    isExists = true;
                                    break;
                                }
                            }
                            if (isExists === false) { /*If the created folder doesn't exist need to download*/
                                self.downloadFile(self, newsItemData);
                            }
                        }, self.fileError);
                    }, function(error) {  /*If the created folder doesn't exist need to download*/
                        self.downloadFile(self, newsItemData);
                    });
                }, function(error) {  /*If the created folder doesn't exist need to download*/
                    self.downloadFile(self, newsItemData);
                });
            } else {
                self.loadFileiniframe(newsItemData);
            }
        },
        downloadFile: function(self, newsItemData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
                var fileName = newsItemData.fileName+'.'+newsItemData.fileType, downloadFileURL = newsItemData.fileURL;
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
                            newsItemData.fileURL = fileDir.toURL();
                            self.loadFileiniframe(newsItemData); /*load downloaded file into iframe/ video*/
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
            }
        },
        fileError: function(evt) {
            //console.log("Error occured in download : ******** " + JSON.stringify(evt));
        },
        loadFileiniframe: function(self, newsItemData){
            var fileType = newsItemData.fileType, filePath = newsItemData.fileURL, pageno = parseInt(newsItemData.pageno), iFrameHight, androidData={}, language, userID;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
                userID = JSON.parse(window.localStorage.getItem("USER")).id;
            } else {
                language = $.jStorage.get("language");
            }
            androidData.modID = self.modID;
            androidData.userID = userID;
            androidData.timemodified = self.timemodified;
            androidData.pdfURL = self.pdfURL;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                androidData.pdfToken = JSON.parse(window.localStorage.getItem("USER")).token;
            } else {
                androidData.pdfToken = JSON.parse($.jStorage.get("USER")).token;
            }
            androidData.language = ((language == null)?'en_us':language);
            androidData.serviceURl = self.globalConfig.apiAddress.service;
            androidData.isFavour = false;
            if(isDevice()  && isPhoneGap()){
                jQuery("#load_wrapper, .overlaycontainer").hide();
                if( /Android/i.test(navigator.userAgent) ) {
                    jQuery("#newscontainer").show();
                    cordova.exec(
                                 function (args) {},
                                 function (args) {},
                                 'FileOpener', '' +((newsItemData.fileType === 'pdf')?'openFile':'openVideoFile')+ '', [((newsItemData.fileType === 'pdf')?androidData:filePath)]);
                    return false;
                }
            }

            if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && (newsItemData.fileType === 'pdf') && isPhoneGap() ){
                jQuery("#load_wrapper, .overlaycontainer").show();
                jQuery("#newscontainer").show();
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
            jQuery('#newsbred li:nth-child(2)').addClass('newslnk newsNav').removeAttr('data-msg').html("<a href='#' data-msg='News'></a>");
            loadAllLanguages();
            jQuery('#newsbred').append('<li>'+newsItemData.fileNameNews+'</li>');
            iFrameHight = '100%';
            jQuery("#newsIframe").empty().show();
            jQuery(".iframewrap_crs_news").prepend('<div class="ifram_news_cls_btn close"><span><img src="../images/closebtn.png"></span></div>');
            jQuery("#newsIframe").css({
                position : 'relative'
            });
            if (fileType === 'mp4' || fileType === 'mp3') {


                if( /Android/i.test(navigator.userAgent) && file_Type === 'mp4') {
                  jQuery('<div class="AndroidVideo favAndroidVideo"> <img src="../images/android_landscape.png" ></div>').appendTo(jQuery("#displayContentFav"));
                  jQuery('<div class="shelfholder_mb_lt" style="visibility:hidden;"></div>').appendTo(jQuery("#displayContentFav"));
                  self.AndroidVideoURl = filePath;
                  self.footerIcons(true);
                  return false;
                }

                var videoType = (fileType === 'mp4') ? "video/mp4" : "audio/mp3";
                jQuery('<video id="activityVideoNews" width="100%" height="100%" controls></video>')
                .append('<source src="' + filePath + '" type="' + videoType + '" />')
                .appendTo(jQuery("#newsIframe"));
				
				jQuery('#load_wrapper').hide();
                self.footerIcons(true);
				
				// To control play or pause button in video tag.
				videoContrl = document.getElementById('activityVideoNews');
				if ( videoContrl.paused ) {
					videoContrl.play();
				} else {
					videoContrl.pause();
				}
				videoContrl.play();
            } else {
                if (isDevice() && pageno !== 0) {
                    iFrameHight = pageno * 819 + 'px';
                }
                if( fileType === 'pdf'){
                  jQuery(".commentmodal-backdrop").show();
                }
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.pdfurl = filePath;
                } else {
                    $.jStorage.set("pdfurl", filePath);
                }
				if(!this.returnIeVersion()){
					if($('html').hasClass('ie9')){
							jQuery(".commentmodal,.commentmodal-backdrop,.loading_icon").hide();
						}
					jQuery('<iframe/>', {
						name: 'resrcContent-iframe',
						id: 'newsContent-iframe',
						src: "pdfview.html"
					}).appendTo(jQuery("#newsIframe"));
					jQuery(".commentNotes").show();
				}else{
					jQuery(".commentmodal,.commentmodal-backdrop").hide();
                       /* var srcurl;
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            srcurl = window.localStorage.pdfurl;
                        } else {
                            srcurl = $.jStorage.get('pdfurl');
                        }
						 var htmlSting = '';
						 htmlSting+="<html><head></head><body>";
						 htmlSting+=" <object data="+srcurl+" type='application/pdf' height='100%' width='100%'></object>";
						 htmlSting+="</body></html>";*/
						 jQuery("#load_wrapper").hide();
						  PluginDetect.getVersion(".");   // find Adobe reader exist or not.
						  var version = PluginDetect.getVersion("AdobeReader");
						  if(version != null){
							jQuery("#newsIframe").append('<iframe id="newsContent-iframe" name="resrcContent-iframe" width="800px" height="600px" src='+self.takePdfUrl+'> </iframe>');
						  }else{
							jQuery("#newsIframe").append("<p> PDF Reader doesn't exist in your system, Please install adobe Reader to view the PDF. </p> <a href="+self.takePdfUrl+">download PDF</a>");
						  }
						  jQuery(".commentNotes").show();
				}

                jQuery("#newsContent-iframe").load(function() {
                    jQuery(this).show();
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
                                var currentPageNo = jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('value');
                                  jQuery.each(self.BookMarkedPages, function(i, val){
                                       if( currentPageNo == val.pageno ){
                                         jQuery("#newsContent-iframe").contents().find("#viewBookmarkLocale").removeClass('bookmark').addClass('bookmarked').attr('data-bookmarked','true');
                                       }
                                  });
							  }else{
                               self.BookMarkedPages=[];
                              }
							}else{
                               self.BookMarkedPages=[];
                            }
						 });
						 jQuery("#newsContent-iframe").contents().find("#presentationMode").off().on('click',function(){
						   window.open("pdfview.html");
						 });
						 var previousPageID='', currentPageID='';
						 /* Added for Bookmarks thambnail filters*/
						 jQuery("#newsContent-iframe").contents().find("#viewAttachments").prop("disabled", false);
						 jQuery("#newsContent-iframe").contents().find("#sidebarToggle").off().on('click',function(){
							jQuery("#newsContent-iframe").contents().find("#viewAttachments,#viewOutline").prop("disabled", false);
                            var pageCount=1;
                            jQuery("#newsContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
							jQuery("#newsContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
							  jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
							});
                            if( self.BookMarkedPages != undefined ){
							  jQuery.each(self.BookMarkedPages, function(i, val){
                                  if( val.bookMarked== undefined ){
							       jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                  }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                    jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                  }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                    jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                  }
							  });
                            }
						});
						jQuery("#newsContent-iframe").contents().find("#viewAttachments").off().on('click',function(){
							jQuery("#newsContent-iframe").contents().find("#thumbnailView").removeClass("hidden");
							jQuery("#newsContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
										  if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
                                              jQuery(this).hide();
                                              jQuery(this).find("#ribbon").hide();
										  }
								});

						});
						jQuery("#newsContent-iframe").contents().find("#viewOutline").off().on('click', function(){
                            jQuery("#newsContent-iframe").contents().find(".outlineItem").remove();
                            jQuery("#newsContent-iframe").contents().find(".thumbnail").each(function(index){
                                jQuery("#newsContent-iframe").contents().find("#outlineView").append('<div class="outlineItem"><a href="#page=' +(index+1)+ '">Slide Number ' +(index+1)+ '</a></div>');
                            });
                        });
						jQuery("#newsContent-iframe").contents().find("#viewThumbnail").off().on('click',function(){
							jQuery("#newsContent-iframe").contents().find("#thumbnailView").find("a").find(".thumbnail").each(function(){
										  if(jQuery(this).find("#ribbon").hasClass("notbookmarked")){
														   jQuery(this).show();jQuery(this).find("#ribbon").hide();
										  }
								});
						});
						/* End of Bookmarks thambnail filters*/

						jQuery("#newsContent-iframe").contents().find("#viewBookmarkLocale").off().on('click',function(){
						  var serviceUrl = self.globalConfig.apiAddress.service,
						      data = '',
						      currentPageID = jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('value'),
						      serviceAction = '', token;
                              if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                                    token = JSON.parse(window.localStorage.getItem("USER")).token;
                                } else {
                                    token = JSON.parse($.jStorage.get("USER")).token;
                                }
						       //console.log("serviceUrl::: "+serviceUrl);
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
                                  jQuery("#newsContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("notbookmarked").addClass("bookmarked").show();
                                  jQuery("#newsContent-iframe").contents().find("#thumbnailContainer"+currentPageID+"").show();

                                  self.BookMarkedPages.push({
                                                             "pageno":""+currentPageID+"",
                                                             "bookMarked":"true"
                                                            });
                              }else if( jQuery(this).attr('data-bookmarked') == "true" ) {
                                  pageID = currentPageID;
                                  serviceAction = 'delete_course_pdf_bookmark';
                                  jQuery(this).addClass('bookmark').removeClass('bookmarked');
                                  jQuery(this).attr('data-bookmarked','false');
                                  jQuery("#newsContent-iframe").contents().find("#thumbnailContainer" +currentPageID+ " #ribbon").removeClass("bookmarked").addClass("notbookmarked").hide();
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
				              //console.log("BookMarkedPages="+JSON.stringify(self.BookMarkedPages));
							  //console.log("DATA="+JSON.stringify(data));
                               /* After bookmark and un bookmark reset the BookMarkedPages object */
                               if( self.BookMarkedPages != undefined ){
                                      jQuery.each(self.BookMarkedPages, function(i, val){
                                          if( val.bookMarked== undefined ){
                                           jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                          }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                            jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                          }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                            jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                          }
                                      });
                               }
							   self.ajaxReq(serviceUrl,data,function(resp){ });
				        });
                         var browserName = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*([\d\.]+)/i);
                         if( browserName[1] == "Safari"){
                           jQuery("#newsContent-iframe").contents().find("#download").attr('data-safari','true');
                         }
                        jQuery('#load_wrapper').show();
                        var startPageCount=setInterval(function (){
                                                            if( jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('max') != undefined ){
                                                                if( jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('max')  == jQuery("#newsContent-iframe").contents().find("#viewer .page").length ){
                                                                  jQuery(".commentmodal-backdrop").hide();
                                                                  jQuery('#load_wrapper').hide();
                                                                  clearInterval(startPageCount);
                                                                }
                                                            }
                                                      },5000);



                        var thumbnailView=setInterval(function (){
                                    if( jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('max') == jQuery("#newsContent-iframe").contents().find("#thumbnailView .thumbnailSelectionRing").length){
                                        var currentPageNo = jQuery("#newsContent-iframe").contents().find("#pageNumber").attr('value');
                                        var pageCount=1;
                                        jQuery("#newsContent-iframe").contents().find("#thumbnailView .thumbnail").find("#ribbon").remove();
                                        jQuery("#newsContent-iframe").contents().find(".thumbnailSelectionRing").each(function(){
                                          jQuery(this).before('<div id="ribbon" class="notbookmarked"><div>'+(pageCount++)+'</div></div>');
                                        });
                                        if( self.BookMarkedPages != undefined ){
                                          jQuery.each(self.BookMarkedPages, function(i, val){
                                              if( val.bookMarked== undefined ){
                                               jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");

                                              }else if( val.bookMarked != undefined && val.bookMarked != "true" ){
                                                jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').hide().removeClass("bookmarked").addClass("notbookmarked");

                                              }else if( val.bookMarked != undefined && val.bookMarked == "true" ){
                                                jQuery("#newsContent-iframe").contents().find("#thumbnailView").find('#thumbnailContainer' +val.pageno+ ' #ribbon').show().addClass("bookmarked").removeClass("notbookmarked");
                                              }
                                          });
                                        }
                                      clearInterval(thumbnailView);
                                    }
                        },1000);
                });

				/** PDF full page display */
				jQuery("#newsIframe").css("height","1363px");
				jQuery("#load_wrapper").css("display","block");
				var intval=setInterval(function(){
								if(!$('html').hasClass('ie8')){
									var pageHeight = jQuery("#newsContent-iframe").contents().find(".textLayer").height();
									var orgHeight = (pageHeight)+52;
									if(pageHeight){
											jQuery("#newsIframe").css("height",orgHeight+"px");
											jQuery("#newsContent-iframe").contents().find("#viewerContainer").scrollTop(0);
											clearInterval(intval);
									}
								}


				},2000);
            }
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
			jQuery.ajax({
				url: serviceUrl,
				data: data,
				type: 'POST',
				crossDomain: true,
				dataType:'json',
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
	    if( !isDevice() ){	
            jQuery.ajax({
                url: serviceUrl,
                data: data,
				type:'POST',
				dataType:'json',
				crossDomain: true,
                success: function(res) {
                   if( res.response[0] != undefined ){
                     self.serverComments = res.response[0].comment;
					 jQuery('#note').val(''+res.response[0].comment+'');
                     jQuery(".commentform-control").val('' +res.response[0].comment+ '');
                   }else{
                       self.serverComments = "";
					   jQuery('#note').val('');
                       jQuery(".commentform-control").val('');
                   }
                },
				error:function(){
				}
            });
	    }else if( isDevice() ){
            	data.uid=userDetails.id;
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
        }
    });
    return Clazz.com.components.widget.news.js.News;
});
