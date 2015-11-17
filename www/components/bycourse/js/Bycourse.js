define(["framework/WidgetWithTemplate"], function (template) {
    Clazz.createPackage("com.components.widget.bycourse.js");
    Clazz.com.components.widget.bycourse.js.Bycourse = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/bycourse/template/bycourse.tmp",
        configUrl: "../../componens/home/config/config.json",
        name: "bycourse",
        localConfig: null,
        globalConfig: null,
		showReport:false,
		isShowReport : true,
        initialize: function (globalConfig) {
            this.globalConfig = globalConfig;
        },
        loadPage: function () {
            Clazz.navigationController.push(this);
        },
        preRender: function(whereToRender, renderFunction) {
            var self = this;
            self.getRegionData();
            Handlebars.registerHelper('checkForSpecificDiv', function () {
              if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone"){
                //var domElement = self.mobileDeviceDOMElement();
				  var domElement = self.webandIpadDOMElement();
              } else {
                var domElement = self.webandIpadDOMElement();
              }
              return new Handlebars.SafeString(domElement);
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

        bindUI: function () {
            if(!(jQuery('.ie7-footer-specific').hasClass('reportsfooter'))) {
               jQuery('.ie7-footer-specific').addClass('reportsfooter');
            }
            if($('html').hasClass('ie8') || $('html').hasClass('ie9')){
                $(".test").addPlaceholder();            
            }
			//window.asd = $('.SlectBox').SumoSelect({ csvDispCount: 3 });
			window.asd = $('#SelectBoxBoost').multiselect({ includeSelectAllOption: true, enableFiltering: false, selectAllText: 'All', buttonWidth: '130px', numberDisplayed: 1});
            //window.test = $('.testsel').SumoSelect({okCancelInMulti:true });
			if(isAndroid()){
					jQuery("#country-sel").attr('disabled', 'disabled');
					jQuery("#retailer-sel").attr('disabled', 'disabled');
					jQuery("#store-sel").attr('disabled', 'disabled');
					jQuery("#course-sel").attr('disabled', 'disabled');
			}
            var self = this,defaultArray = ["sel_all"],ExportArray = ["null"];
            self.portraitLock();
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
            var userDetails, resrccategoryid;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                resrccategoryid = window.localStorage.getItem("catrsrcId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                resrccategoryid = $.jStorage.get("catrsrcId");
            }
            var data1 = {
                action: 'by_user_searchfield',
                wstoken: userDetails.token
            };
            var data2 = {
                action: 'reports',
                type: 'course',
                store: '',
                retailer: '',
                region: '',
                country: '',
                course: '',
                team: '',
                sortby: '',
                start: 0,
                end: 20,
                wstoken: userDetails.token
            };
            var data3 = {
                action: 'by_course_searchfield',
                wstoken: userDetails.token
            };
            /* if(isDevice() && !isOnline() ) {
                jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                });
            } */
			if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('body').removeClass('report-details-show');
				jQuery('.errorCode-pop').show();
			}
		
			
            self.loadData(data1, data2, data3);
            jQuery('.repbtn:last > a').on('tap', function () {
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                var serviceUrl = self.globalConfig.apiAddress.service, store, retailer, region, country, sortby;
				
					
               /* store = (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                retailer = (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                region = (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                country = (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();*/
                sortby = jQuery('.rep_firstnme img').attr('sortby');
                var selectedIds = [];
                jQuery("tbody input[type='checkbox']:checked + label").each(function (i) {
                    selectedIds.push(jQuery(this).siblings().val());
                });
				var selectedValue = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
				/* if(jQuery(".SlectBox").val() == 'all') {
					selectedValue = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
				} */
				if(isAndroid()){
				   var selectedValue = jQuery("#SelectBoxBoost").val();
				}
                
                if ((isiOS() || isDevice()) && !isPhoneGap()) {
                    $(this).attr('target', '_blank');
                }
                 
                if( !self.checkMobileDevice() || isAndroid()){
                    var href = serviceUrl + '?action=export&type=course&store=' + ((jQuery("#store-sel").val()) ? encodeURIComponent(jQuery("#store-sel").val()) : ExportArray) +
                    '&retailer=' + ((jQuery("#retailer-sel").val()) ? encodeURIComponent(jQuery("#retailer-sel").val()) : ExportArray) +
                    '&region=' + ((jQuery("#region-sel").val()) ? encodeURIComponent(jQuery("#region-sel").val()) : ExportArray) +
                    '&course=' + ((jQuery("#course-sel").val()) ? encodeURIComponent(jQuery("#course-sel").val()) : ExportArray) +
                    '&country=' + ((jQuery("#country-sel").val()) ? encodeURIComponent(jQuery("#country-sel").val()) : ExportArray) +
                    '&fields=' + ((selectedValue) ? encodeURIComponent(selectedValue) : ExportArray) +
                    '&keyword=' + ((jQuery(".random_report_search").val()) ? encodeURIComponent(jQuery(".random_report_search").val()) : ExportArray) +
                    '&isshowreport=' + self.isShowReport +
                    '&team=&sortby=' + sortby + '&recordrow=' + selectedIds.join(',');
                                          
                }else if( self.checkMobileDevice() ){
                  var href = serviceUrl + '?action=export&type=course&store=' + ((self.getMultiSelectedValue("#phonestore-sel").length) ? encodeURIComponent(self.getMultiSelectedValue("#phonestore-sel")) : ExportArray) +
                  '&retailer=' + ((self.getMultiSelectedValue("#phoneretailer-sel").length) ? encodeURIComponent(self.getMultiSelectedValue("#phoneretailer-sel")) : ExportArray) +
                  '&region=' + ((self.getMultiSelectedValue("#phoneregion-sel").length) ? encodeURIComponent(self.getMultiSelectedValue("#phoneregion-sel")) : ExportArray) +
                  '&course=' + ((self.getMultiSelectedValue("#phonecourse-sel").length) ? encodeURIComponent(self.getMultiSelectedValue("#phonecourse-sel")) : ExportArray) +
                  '&country=' + ((self.getMultiSelectedValue("#phonecountry-sel").length) ? encodeURIComponent(self.getMultiSelectedValue("#phonecountry-sel")) : ExportArray) +
                  '&fields=' + ((selectedValue) ? selectedValue : ExportArray) +
                  '&keyword=' + ((jQuery(".random_report_search").val()) ? encodeURIComponent(jQuery(".random_report_search").val()) : ExportArray) +
                  '&isshowreport=' + self.isShowReport +
                  '&team=&sortby=' + sortby + '&recordrow=' + selectedIds.join(',');
                }
                if(!isDevice()  && !isPhoneGap()){
                 jQuery(this).attr('href', href);
                }
                var downloadFileURL = href;
                var fileName = 'bycourse_'+userDetails.id+'.csv';
                var courseItemData = {
                    fileURL: href,
                    fileName: 'bycourse_'+userDetails.id
                };
                
                if( isDevice() && isPhoneGap() && isAndroid() ){
                	self.checkIfFileExists(self, courseItemData);
                }else{
                	self.loadFileinWeb(courseItemData);
                }
                
            });
			
			jQuery('.multiselect-container li a').on('click', function() {
				if(jQuery('#SelectBoxBoost').val() != null || self.getMultiSelectedValue("#searchDropdown") != null ) {
					jQuery('.random_report_search').attr('disabled', false);
				} else {
					jQuery('.random_report_search').attr('disabled', 'disabled');
				}
			});
			
			jQuery('#reports_search').css("opacity","0.2");
			jQuery('.random_report_search').keyup(function(){
				if (jQuery('.random_report_search').val() != "") {
					jQuery('#reports_search').attr('disabled', false).css('cursor', 'pointer').css("opacity","1");
				} else {
					jQuery('#reports_search').attr('disabled', 'disabled').css('cursor', 'not-allowed').css("opacity","0.2");
				}
			});
			
			// Mobile Search by Focus event
			jQuery(".random_report_search").on("focus",function(e){
			
					if(jQuery("#searchDropdown").hasClass("dropdownEnable1")){ 
							
						if(jQuery("#searchDropdown").hasClass("dropdownEnable1")){
								if(jQuery(".dropdown-menu1").find(".reportTick").length != "0"){
									var allchecked = jQuery(".dropdown-menu1 li").first().find('span').hasClass("reportTick");
									if(allchecked)
											jQuery(".reportCaptionCont").find("span").text(((jQuery(".dropdown-menu1").find(".reportTick").length)-1)+" Selected");
									else
											jQuery(".reportCaptionCont").find("span").text(jQuery(".dropdown-menu1").find(".reportTick").length+" Selected");
								}	
								else
									jQuery(".reportCaptionCont").find("span").text("Search by");
						}
					}
					jQuery("#searchDropdown").removeClass("dropdownEnable1");
                    if(isDevice()) {
                        jQuery(".hme_hdrbx,div.row.menu").hide();
                    }
			});
            jQuery(".random_report_search").on("blur",function(){
                if(isDevice()) {
                    jQuery(".hme_hdrbx,div.row.menu").show();   
                }
            });
			
			jQuery('#reports_search').on('click', function() {
			
				var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
				/* if(jQuery(".SlectBox").val() == 'all') {
					selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
				} */
				jQuery(".selectAllcourse").removeAttr("checked");
				if(isAndroid()){
				   var selectedValue = jQuery("#SelectBoxBoost").val();
				}
				self.isShowReport = false;
				var data = {
					action:'reports_search',
					fields: (selectedVal) ? selectedVal : defaultArray,
					keyword: jQuery('.random_report_search').val(),
					sortby: '',
                    start: 0,
                    end: 20,
                    wstoken: userDetails.token
                };
				
				/* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
			});
			
            jQuery('#show-reports').die().live('click', function () {
			    self.showReport = true;
				jQuery(".selectAllcourse").removeAttr("checked");
                if (jQuery('html').hasClass("ie7-css")) {
                    jQuery(".selectAllcourse + label").removeClass('inputCheckedReport');
                }
                jQuery('.selectAllcourse:last').attr('checked', false);
                var store, retailer, region, country;
				self.isShowReport = true;
                if( !self.checkMobileDevice() || isAndroid()){
                    var data = {
                        action: 'reports',
                        type: 'course',
                        store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                        retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                        region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                        country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                        course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                        team: '',
                        sortby: '',
                        start: 0,
                        end: 20,
                        wstoken: userDetails.token
                    };
                }else if( self.checkMobileDevice() ){
                    var data = {
                       action: 'reports',
                       type: 'course',
                       store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                       retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                       region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                       country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                       course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                       team: '',
                       sortby: '',
                       start: 0,
                       end: 20,
                       wstoken: userDetails.token
                    };
                }
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
            });
            jQuery('.selectAllcourse:last + label').die().live('click', function () {
                 if (jQuery('html').hasClass("ie7-css") || jQuery('html').hasClass("ie9-spec")) {
                    if (jQuery('.selectAllcourse').next('label').hasClass('checkDsblNone')) {
                        return false;
                    }
                }
                if (jQuery('.selectAllcourse:last:checked').length) {
                    jQuery('.chkcase').attr('checked', false);
                    
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).removeClass('inputCheckedReport');
                        jQuery('#reportbycourse tbody').find('label').removeClass('inputCheckedReport');
                    }
                    jQuery('.selectAllcourse:last').attr('checked', false);
                } else {
                    jQuery('.chkcase').attr('checked', true);
                    jQuery('.selectAllcourse:last').attr('checked', true);
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).addClass('inputCheckedReport');
                        jQuery('#reportbycourse tbody').find('label').addClass('inputCheckedReport');
                    }
                }
            });
            jQuery("tbody input[type='checkbox'] + label").die().live('click', function () {
                var chkBox = jQuery(this).siblings();
                if (chkBox.is(':checked')) {
                    chkBox.removeAttr('checked');
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).removeClass('inputCheckedReport');
                    }
                } else {
                    chkBox.attr('checked', true);
                    if(jQuery('html').hasClass( "ie7-css" )) {
                        jQuery(this).addClass('inputCheckedReport');
                    }
                }
            });
            jQuery('#reportbycourse .rep_lastnme img').die().live('click', function () {
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if (sortby === "ASC") {
                    jQuery(this).attr('sortby', 'DESC');
                    jQuery(this).attr('src', '../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                } else {
                    jQuery(this).attr('src', '../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby', 'ASC');
                    sortbyval = 'ASC';
                }

                var sortval = "lastname " + sortbyval;
                jQuery("#sortoption").val(sortval);
				if (self.isShowReport) {
                        if( !self.checkMobileDevice() || isAndroid()){
                            var data = {
                                action: 'reports',
                                type: 'course',
                                store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                                retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                                region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                                country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                                course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                                team: '',
                                sortby: sortval,
                                start: 0,
                                end: '',
                                wstoken: userDetails.token
                            };
                        }else if(self.checkMobileDevice()){
                            var data = {
                              action: 'reports',
                              type: 'course',
                              store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                              retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                              region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                              country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                              course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                              team: '',
                              sortby: sortval,
                              start: 0,
                              end: '',
                              wstoken: userDetails.token
                            };
                        }
				} else {
                    var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
						var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortval,
						start: 0,
						end: '',
						wstoken: userDetails.token
					};
				
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
                return false;
            });
            jQuery('#reportbycourse .rep_firstnme img').die().live('click', function () {
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if (sortby === "ASC") {
                    jQuery(this).attr('sortby', 'DESC');
                    jQuery(this).attr('src', '../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                } else {
                    jQuery(this).attr('src', '../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby', 'ASC');
                    sortbyval = 'ASC';
                }
                var store, retailer, region, country;
                if( !self.checkMobileDevice() || isAndroid()){
                                                                   
                    (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                    (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                    (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                    (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                                                                   
                }else if( self.checkMobileDevice()){
                                                                   
                   (self.getMultiSelectedValue("#phonestore-sel") == 'sel_all') ? store = '' : store = self.getMultiSelectedValue("#phonestore-sel");
                   (self.getMultiSelectedValue("#phoneretailer-sel") == 'sel_all') ? retailer = '' : retailer = self.getMultiSelectedValue("#phoneretailer-sel");
                   (self.getMultiSelectedValue("#phoneregion-sel") == 'sel_all') ? region = '' : region = self.getMultiSelectedValue("#phoneregion-sel");
                   (self.getMultiSelectedValue("#phonecountry-sel") == 'sel_all') ? country = '' : country = self.getMultiSelectedValue("#phonecountry-sel");
                }
                var sortval = "firstname " + sortbyval;
                jQuery("#sortoption").val(sortval);
				if (self.isShowReport) {
                     if( !self.checkMobileDevice() || isAndroid()){
                        var data = {
                            action: 'reports',
                            type: 'course',
                            store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                            retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                            region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                            country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                            course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                            team: '',
                            sortby: sortval,
                            start: 0,
                            end: '',
                            wstoken: userDetails.token
                        };
                     }else  if( self.checkMobileDevice()){
                           var data = {
                               action: 'reports',
                               type: 'course',
                               store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                               retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                               region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                               country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                               course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                               team: '',
                               sortby: sortval,
                               start: 0,
                               end: '',
                               wstoken: userDetails.token
                           };
                     }
				} else {
					var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
					      var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortval,
						start: 0,
						end: '',
						wstoken: userDetails.token
					};
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
                return false;
            });
            jQuery('#reportbycourse .rep_course img').die().live('click', function () {
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if (sortby === "ASC") {
                    jQuery(this).attr('sortby', 'DESC');
                    jQuery(this).attr('src', '../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                } else {
                    jQuery(this).attr('src', '../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby', 'ASC');
                    sortbyval = 'ASC';
                }
                var store, retailer, region, country;
                (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                var sortval = "fullname " + sortbyval;
                jQuery("#sortoption").val(sortval);
				if (self.isShowReport) {
                    if( !self.checkMobileDevice() || isAndroid()){
                        var data = {
                            action: 'reports',
                            type: 'course',
                            store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                            retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                            region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                            country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                            course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                            team: '',
                            sortby: sortval,
                            start: 0,
                            end: '',
                            wstoken: userDetails.token
                        };
                    }else if( self.checkMobileDevice()){
                         var data = {
                             action: 'reports',
                             type: 'course',
                             store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                             retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                             region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                             country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                             course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                             team: '',
                             sortby: sortval,
                             start: 0,
                             end: '',
                             wstoken: userDetails.token
                         };
                    }
				} else {
					var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
					  var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					self.isShowReport = false;
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortval,
						start: 0,
						end: '',
						wstoken: userDetails.token
					};
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
                return false;
            });
            jQuery('#reportbycourse .rep_course2 img').die().live('click', function () {
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if (sortby === "ASC") {
                    jQuery(this).attr('sortby', 'DESC');
                    jQuery(this).attr('src', '../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                } else {
                    jQuery(this).attr('src', '../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby', 'ASC');
                    sortbyval = 'ASC';
                }
                var store, retailer, region, country;
                (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                var sortval = "points " + sortbyval;
                jQuery("#sortoption").val(sortval);
				if (self.isShowReport) {
                    if( !self.checkMobileDevice() || isAndroid()){
                        var data = {
                            action: 'reports',
                            type: 'course',
                            store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                            retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                            region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                            country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                            course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                            team: '',
                            sortby: sortval,
                            start: 0,
                            end: '',
                            wstoken: userDetails.token
                        };
                      }else if( self.checkMobileDevice()){
                          var data = {
                              action: 'reports',
                              type: 'course',
                              store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                              retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                              region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                              country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                              course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                              team: '',
                              sortby: sortval,
                              start: 0,
                              end: '',
                              wstoken: userDetails.token
                          };
                      }
				} else {
					var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
					  var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					self.isShowReport = false;
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortval,
						start: 0,
						end: '',
						wstoken: userDetails.token
					};
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
                return false;
            });
            jQuery('#reportbycourse .rep_pnts img').die().live('click', function () {
                var sortbyval = '';
                var sortby = jQuery(this).attr('sortby');
                if (sortby === "ASC") {
                    jQuery(this).attr('sortby', 'DESC');
                    jQuery(this).attr('src', '../images/rep_up_arw.png');
                    sortbyval = 'DESC';
                } else {
                    jQuery(this).attr('src', '../images/rep_dwn_arw.png');
                    jQuery(this).attr('sortby', 'ASC');
                    sortbyval = 'ASC';
                }
                var store, retailer, region, country, sortval, data;
                (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                sortval = "totalpoints " + sortbyval;
                jQuery("#sortoption").val(sortval);
				if (self.isShowReport) {
                    if( !self.checkMobileDevice() || isAndroid()){
                        data = {
                            action: 'reports',
                            type: 'course',
                            store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                            retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                            region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                            country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                            course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
                            team: '',
                            sortby: sortval,
                            start: 0,
                            end: '',
                            wstoken: userDetails.token
                        };
                   }else if( self.checkMobileDevice()){
                       var data = {
                           action: 'reports',
                           type: 'course',
                           store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                           retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                           region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                           country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                           course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
                           team: '',
                           sortby: sortval,
                           start: 0,
                           end: '',
                           wstoken: userDetails.token
                       };
                   }
				} else {
					var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
						var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					self.isShowReport = false;
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortval,
						start: 0,
						end: '',
						wstoken: userDetails.token
					};
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.searchReports(data);
                return false;
            });
            jQuery('.bootpag a').die().live('click', function (event) {
                jQuery('.chkcase').attr('checked', false);
                jQuery('.selectAllcourse:last').attr('checked', false);
                jQuery("#load_wrapper").css({
                    'position':'relative',
                    'top':jQuery(document).height()/2
                });
				jQuery("#load_wrapper, .overlaycontainer").show();
                $('body').addClass('report-details-show');
				
                var page = jQuery(this).parent().attr('data-page');
                var pagelength = jQuery('.bootpag li').length - 2;
                var store, retailer, region, country, sortby;
                (jQuery("#store-sel").val() == 'sel_all') ? store = '' : store = jQuery("#store-sel").val();
                (jQuery("#retailer-sel").val() == 'sel_all') ? retailer = '' : retailer = jQuery("#retailer-sel").val();
                (jQuery("#region-sel option:selected").val() == 'sel_all') ? region = '' : region = jQuery("#region-sel option:selected").attr('data-region');
                (jQuery("#country-sel option:selected").val() == 'sel_all') ? country = '' : country = jQuery("#country-sel option:selected").val();
                sortby = (self.checkMobileDevice()?'':jQuery("#sortoption").val());
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
				var start = (page - 1) * 20;
				var end = 20;
				if (self.isShowReport) {
                    if( !self.checkMobileDevice() || isAndroid()){
                        if(self.showReport){
									var data = {
										action: 'reports',
										type: 'course',
										store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
										retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
										region: (jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
										country: (jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
										course: (jQuery("#course-sel").val()) ? jQuery("#course-sel").val() : defaultArray,
										team: '',
										sortby: sortby,
										start: start,
										end: end,
										wstoken: userDetails.token
									};
									
								}
								else{
									 var data = {
										action: 'reports',
										type: 'course',
										store: defaultArray,
										retailer: defaultArray,
										region:  defaultArray,
										country:  defaultArray,
										course:  defaultArray,
										team: '',
										sortby: sortby,
										start: start,
										end: end,
										wstoken: userDetails.token
									};
								}
                     }else if( self.checkMobileDevice()){
						if(self.showReport){
							var data = {
								action: 'reports',
								type: 'course',
								store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
								retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
								region: (self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
								country: (self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
								course: (self.getMultiSelectedValue("#phonecourse-sel").length) ? self.getMultiSelectedValue("#phonecourse-sel") : defaultArray,
								team: '',
								sortby: sortby,
								start: start,
								end: end,
								wstoken: userDetails.token
							};
						}else{
							var data = {
								action: 'reports',
								type: 'course',
								store: defaultArray,
								retailer: defaultArray,
								region:defaultArray,
								country: defaultArray,
								course: defaultArray,
								team: '',
								sortby: sortby,
								start: start,
								end: end,
								wstoken: userDetails.token
							};
						}
                        
                    }
				} else {
					var selectedVal = (!self.checkMobileDevice()) ? jQuery("#SelectBoxBoost").val() : self.getMultiSelectedValue("#searchDropdown");
					/* if(jQuery(".SlectBox").val() == 'all') {
						selectedVal = ["region", "country", "retailer", "store", "fullname", "firstname", "lastname", "username", "email"];
					} */
					if(isAndroid()){
						var selectedVal = jQuery("#SelectBoxBoost").val();
					}
					self.isShowReport = false;
					var data = {
						action:'reports_search',
						fields: (selectedVal) ? selectedVal : defaultArray,
						keyword: jQuery('.random_report_search').val(),
						sortby: sortby,
						start: start,
						end: end,
						wstoken: userDetails.token
					};
				}
                /* if(isDevice() && !isOnline()) {
                    jQuery('.nonetconnection').slideDown(2000, function(){
                        jQuery(this).fadeOut(6000);
                    });
                } */
				if(isDevice() && isPhoneGap() && !checkAppOnline() ) {
					jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
					updateLanguage();
					jQuery('body').removeClass('report-details-show');
					jQuery('.errorCode-pop').show();
				}
                self.paginationReports(data, page, lastval, prev);
            });
            jQuery('#home_page').live('click', function () {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_home").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_home").addClass('selected');
				jQuery('body').removeClass('report-details-show');
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
            });
            jQuery('#report_pageview').live('click', function () {
                var hash = window.location.hash;
                if (hash !== '#reports') {
                    if (!jQuery("#reportsul").length) {
                        self.reportsWidget = new Clazz.com.components.widget.reports.js.Reports();
                        self.reportsWidget.loadPage();
                    } else {
                        Clazz.navigationController.getView('#reports');
                    }
                }
            });
            jQuery(window).bind('orientationchange', function (e){
                self.portraitLock();
            });
            jQuery("#region-sel").on('change',function(){
                self.getCountryData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);
            });
            jQuery("#country-sel").on('change',function(){
				self.getRetailerData((jQuery("#region-sel").val() === 'sel_all' ) ? 0 : 1);
            });
            jQuery("#retailer-sel").on('change',function(){
                self.getStoreData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);
            });
			jQuery("#store-sel").on('change',function(){
                self.getCourseData((jQuery(this).val() === 'sel_all' ) ? 0 : 1);
            });
                                                                    
            /* Evens for iPhone and Android Devices */
            jQuery(".reportSumoSelect").off('click').on('click', function(){
			     if(jQuery("#searchDropdown").hasClass("dropdownEnable1")){
					if(jQuery(".dropdown-menu1").find(".reportTick").length != "0"){
						var allchecked = jQuery(".dropdown-menu1 li").first().find('span').hasClass("reportTick");
						if(allchecked)
						      	jQuery(".reportCaptionCont").find("span").text(((jQuery(".dropdown-menu1").find(".reportTick").length)-1)+" Selected");
						else
								jQuery(".reportCaptionCont").find("span").text(jQuery(".dropdown-menu1").find(".reportTick").length+" Selected");
					}
						
					else
						jQuery(".reportCaptionCont").find("span").text("Search by");
				}
                jQuery("#searchDropdown").toggleClass("dropdownEnable1");
                return false;
            });
            jQuery("#searchDropdown li").off('click').on('click', function(){
                 if( jQuery(this).text() == "All" ){
                  self.MultiSelect("#searchDropdown");
                 }
                 if( jQuery(this).text() != "All" ){
                  jQuery(this).children('span').toggleClass('reportTick');
				  
						var increment= 0;
						 var listELementLeng = jQuery("#searchDropdown li").length;
						 jQuery("#searchDropdown li").each(function(index){
								if( jQuery(this).children('span').hasClass('reportTick') ){ 
										 increment++;
								 }
								if((increment+1) == listELementLeng){
									jQuery("#searchDropdown li").first().children('span').toggleClass('reportTick');
									increment++;
								}
						 });
				  
                 }
                 if( self.getMultiSelectedValue("#searchDropdown") != null ) {
                  jQuery('.random_report_search').attr('disabled', false);
                 } else {
                  jQuery('.random_report_search').attr('disabled', 'disabled');
                 }
                 return false;
            });
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || isAndroid()){
                jQuery(".swiper-container").swiper({
                                                   slidesPerView:1,
                                                   //pagination: '.pagination1',
                                                   //paginationClickable: true,
                                                   freeMode: true,
                                                   freeModeFluid: true
                                                });
            }
                                                                    
            jQuery(".swiper-slide").on('swipeleft', function(){
               jQuery(".report-wrapper").removeClass('leftFirstSwipe');
               jQuery(".report-wrapper").removeClass('leftSecondSwipe');
               jQuery(".report-wrapper").removeClass('leftThirdSwipe');
               jQuery(".report-wrapper").removeClass('leftFourthSwipe');
               if( jQuery(this).index() == 0){
                 jQuery(".report-wrapper").addClass('firstSwipe');
               }
               if( jQuery(this).index() == 1){
                jQuery(".report-wrapper").removeClass('firstSwipe').addClass('secondSwipe');
               }
               if( jQuery(this).index() == 2){
                jQuery(".report-wrapper").removeClass('secondSwipe').addClass('thirdSwipe');
                jQuery(".reportPagination span:nth-child(1)").removeClass("swiper-active-switch");
                jQuery(".reportPagination span:nth-child(2)").addClass("swiper-active-switch");
               }
               if( jQuery(this).index() == 3){
                   jQuery(".report-wrapper").removeClass('thirdSwipe').addClass('fourthSwipe');
               }
               //console.log("swipeleft"+jQuery(this).index());
            })
            .on('swiperight', function(){
               jQuery(".report-wrapper").removeClass('firstSwipe');
               jQuery(".report-wrapper").removeClass('secondSwipe');
               jQuery(".report-wrapper").removeClass('thirdSwipe');
               jQuery(".report-wrapper").removeClass('fourthSwipe');
               if( jQuery(this).index() == 1){
                jQuery(".report-wrapper").removeClass('leftFirstSwipe').addClass('leftFirstSwipe');
               }
               if( jQuery(this).index() == 2){
                jQuery(".report-wrapper").removeClass('leftFirstSwipe').addClass('leftSecondSwipe');
                jQuery(".reportPagination span:nth-child(2)").removeClass("swiper-active-switch");
                jQuery(".reportPagination span:nth-child(1)").addClass("swiper-active-switch");
               }
               if( jQuery(this).index() == 3){
                jQuery(".report-wrapper").removeClass('leftSecondSwipe').addClass('leftThirdSwipe');
               }
               if( jQuery(this).index() == 4){
                jQuery(".report-wrapper").removeClass('leftThirdSwipe').addClass('leftFourthSwipe');
               }

              //console.log("swiperight"+jQuery(this).index());
            })
            .on('swipeup', function(){ 
                //console.log("swipeup")
            })
            .on('swipedown', function(){ 
                //console.log("swipedown")
            });
                                                                    
            jQuery(".reportPagination span").die().live('click', function(){
                jQuery(".report-wrapper").removeClass('firstSwipe');
                jQuery(".report-wrapper").removeClass('secondSwipe');
                jQuery(".report-wrapper").removeClass('thirdSwipe');
                jQuery(".report-wrapper").removeClass('fourthSwipe');
                                                        
                jQuery(".report-wrapper").removeClass('leftFirstSwipe');
                jQuery(".report-wrapper").removeClass('leftSecondSwipe');
                jQuery(".report-wrapper").removeClass('leftThirdSwipe');
                jQuery(".report-wrapper").removeClass('leftFourthSwipe');
                if( jQuery(this).index() == 1 ){
                  jQuery(".reportPagination span:nth-child(1)").removeClass("swiper-active-switch");
                  jQuery(".reportPagination span:nth-child(2)").addClass("swiper-active-switch");
                  jQuery(".report-wrapper").addClass('thirdSwipe');
                }else if( jQuery(this).index() == 0 ) {
                  jQuery(".reportPagination span:nth-child(2)").removeClass("swiper-active-switch");
                  jQuery(".reportPagination span:nth-child(1)").addClass("swiper-active-switch");
                  jQuery(".report-wrapper").addClass('leftFirstSwipe');
                }
            });
            if ($.browser.msie && parseInt($.browser.version, 10) === 7) {
                try {
                    jQuery('.random_report_search').keydown(function () {
                        if ($('#reports_search').prop('disabled')) {
                            $('#reports_search').addClass('ieBtnDsbl');
                        }
                        else {
                            $('#reports_search').removeClass('ieBtnDsbl');
                        }
                    });
                } catch (e) {

                }
            }            
        },
        portraitLock: function (){
            var allowFn = false;
			var divLength = ( $("html").find('div.bycourse-temp').length > 0 ) ? true : false;
            if(isDevice() ||  isMobileDevice()){
                allowFn = true;
            }
			if(navigator.userAgent.toLowerCase().indexOf("ipad") != -1) {
                allowFn = false;
			}
			if( allowFn && divLength ){
				switch(window.orientation){
                    case 90:
						jQuery("div#bycourse-image").hide();
						// jQuery("#load_wrapper").show();
                        jQuery("div.bycourse-temp, footer.footerbx").show();
                        break;
                    case -90:
						jQuery("div#bycourse-image").hide();
						// jQuery("#load_wrapper").show();
                        jQuery("div.bycourse-temp, footer.footerbx").show();
                        break;
                    default:
						jQuery("div#bycourse-image").show();
						jQuery("#load_wrapper, .overlaycontainer").hide();
                        $('body').removeClass('report-details-show');
                        jQuery("div.bycourse-temp, footer.footerbx").hide();
                }
            }
        },
		toTitleCase: function(str) {
				return str.replace(/(?:^|[\s|/|-])\w/g, function(match) {
					return match.toUpperCase();
				});
		},
        getRegionData: function(){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            data = {
                action:'by_course_searchfield',
                type:'region'
            };
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
                jQuery("#region-sel,#phoneregion-sel").empty();
                jQuery("#region-sel").append('<option value="sel_all">All</option>');
                jQuery("#phoneregion-sel").append('<li  data-value="sel_all"><a>All</a><span></span></li>');
                //if(resp.length > 0 && res.error === false){
                if(res.error === false && res.response.region != undefined){
                    //console.log("region***"+JSON.stringify(res.response.region)+"\n");
                    jQuery.each(res.response.region, function(i,val){
                        if(val.region != '' || val.region != ' ' || val.region != null){
                            jQuery("#region-sel").append('<option data-region="'+val.region+'" title="'+self.toTitleCase(val.region.toLowerCase())+'" value="'+val.region+'">'+self.toTitleCase(val.region.toLowerCase())+'</option>');
                            jQuery("#phoneregion-sel").append('<li  data-region="'+val.region+'" title="'+self.toTitleCase(val.region.toLowerCase())+'" data-value="'+val.region+'"><a>'+self.toTitleCase(val.region.toLowerCase())+'</a><span></span></li>');
                        }
                    });
                         jQuery("#phoneregion-sel li").off('click').on('click',function(){
                           if( jQuery(this).text() == "All" ){
                            self.MultiSelect("#phoneregion-sel");
                           }
                           if( jQuery(this).text() != "All" ){
                            jQuery(this).children('span').toggleClass('reportTick');
							
							var increment= 0;
							 var listELementLeng = jQuery("#phoneregion-sel li").length;
							 jQuery("#phoneregion-sel li").each(function(index){
									if( jQuery(this).children('span').hasClass('reportTick') ){ 
											 increment++;
									 }
									if((increment+1) == listELementLeng){
										jQuery("#phoneregion-sel li").first().children('span').toggleClass('reportTick'); 
										increment++;
									}
							 });
							 
                           }
                           self.getCountryData((jQuery(this).attr('data-value') === 'sel_all' ) ? 0 : 1);
                           return false;
                         });
                }
            });
        },
        getCountryData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '';
            if( isAndroid() || !self.checkMobileDevice() ){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'country',
                    region:jQuery("#region-sel").val(),
                    //region:jQuery("#region-sel option:selected").attr('data-region'),
                    filter:filter
                }: data = {
                    action:'by_course_searchfield',
                    type:'country',
                    filter:filter
                };
            }else if( self.checkMobileDevice()){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'country',
                    region:self.getMultiSelectedValue("#phoneregion-sel"),
                    filter:filter
                }: data = {
                    action:'by_course_searchfield',
                    type:'country',
                    filter:filter
                };
            }
            
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
				if(isAndroid()){
						jQuery("#country-sel").attr('disabled', false);	
				}
                jQuery("#country-sel,#phonecountry-sel").empty();
                jQuery("#country-sel").append('<option data-msg="all_default" class="seloption-no" value="sel_all">All</option>');
                jQuery("#phonecountry-sel").append('<li data-value="sel_all"><a>All</a><span></span></li>');
                
                if(resp.length > 0 && res.error === false && res.response.country!= undefined ){
                    //console.log("country***"+JSON.stringify(res.response.country)+"\n");
                    jQuery.each(res.response.country, function(i,val){
                        if(val.countery != '' || val.countery != ' ' || val.countery != null){
                            jQuery("#country-sel").append('<option class="seloption-no" title="'+self.toTitleCase(val.countery.toLowerCase())+'" data-country="'+val.code+'" value="'+val.code+'">'+self.toTitleCase(val.countery.toLowerCase())+'</option>');
                            jQuery("#phonecountry-sel").append('<li  title="'+self.toTitleCase(val.countery.toLowerCase())+'" data-country="'+val.code+'" data-value="'+val.code+'"><a>'+self.toTitleCase(val.countery.toLowerCase())+'</a><span></span></li>');
                        }
                    });
                     jQuery("#phonecountry-sel li").off('click').on('click',function(){
                       if( jQuery(this).text() == "All" ){
                        self.MultiSelect("#phonecountry-sel");
                       }
                       if( jQuery(this).text() != "All" ){
                        jQuery(this).children('span').toggleClass('reportTick');
						
							var increment= 0;
							 var listELementLeng = jQuery("#phonecountry-sel li").length;
							 jQuery("#phonecountry-sel li").each(function(index){
									if( jQuery(this).children('span').hasClass('reportTick') ){ 
											 increment++;
									 }
									if((increment+1) == listELementLeng){
										jQuery("#phonecountry-sel li").first().children('span').toggleClass('reportTick'); 
										increment++;
									}
							 });
						
                       }
                       self.getRetailerData((jQuery(this).attr('data-value') === 'sel_all' ) ? 0 : 1);
                       return false;
                     });
                }
            });
        },
        getRetailerData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '',defaultArray = ['sel_all'], RegionArray = ['sel_all'];
              if(isAndroid() || !self.checkMobileDevice()){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'retailer',
                    region:(jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                    country:(jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                    //region:jQuery("#region-sel option:selected").attr('data-region'),
                    //country:jQuery("#country-sel option:selected").attr('data-country'),
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'retailer',
                    filter:filter
                };
            }else if( self.checkMobileDevice() ){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'retailer',
                    region:(self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                    country:(self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'retailer',
                    filter:filter
                };
            }
            
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
				if(isAndroid()){
					jQuery("#retailer-sel").attr('disabled',false);
				}
                jQuery("#retailer-sel,#phoneretailer-sel").empty();
                jQuery("#retailer-sel").append('<option value="sel_all">All</option>');
                jQuery("#phoneretailer-sel").append('<li data-value="sel_all"><a>All</a><span></span></li>');
                if(resp.length > 0 && res.error === false && res.response.retailer != undefined){
                    //console.log("retailer***"+JSON.stringify(res.response.retailer)+"\n");
                    jQuery.each(res.response.retailer, function(i,val){
                        if(val.retailer != undefined){
                            jQuery("#retailer-sel").append('<option title="'+self.toTitleCase(val.retailer.toLowerCase())+'" value="'+val.retailer+'">'+self.toTitleCase(val.retailer.toLowerCase())+'</option>');
                            jQuery("#phoneretailer-sel").append('<li  title="'+self.toTitleCase(val.retailer.toLowerCase())+'" data-value="'+val.retailer+'"><a>'+self.toTitleCase(val.retailer.toLowerCase())+'</a><span></span></li>');
                        }
                    });
                     jQuery("#phoneretailer-sel li").off('click').on('click',function(){
                        if( jQuery(this).text() == "All" ){
                         self.MultiSelect("#phoneretailer-sel");
                        }
                        if( jQuery(this).text() != "All" ){
                         jQuery(this).children('span').toggleClass('reportTick');
						 
						 var increment= 0;
							 var listELementLeng = jQuery("#phoneretailer-sel li").length;
							 jQuery("#phoneretailer-sel li").each(function(index){
									if( jQuery(this).children('span').hasClass('reportTick') ){ 
											 increment++;
									 }
									if((increment+1) == listELementLeng){
										jQuery("#phoneretailer-sel li").first().children('span').toggleClass('reportTick'); 
										increment++;
									}
							 });
							 
							 
                        }
                        self.getStoreData((jQuery(this).attr('data-value') === 'sel_all' ) ? 0 : 1);
                        return false;
                     });
                }
            });
        },
        getStoreData: function(filter){
            var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '',defaultArray = ['sel_all'];
            if( isAndroid() || !self.checkMobileDevice() ){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'store',
                    //region:jQuery("#region-sel").val(),
                    //country:jQuery("#country-sel").val(),
                    region:(jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                    country:(jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                    retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                    //region:jQuery("#region-sel option:selected").attr('data-region'),
                    //country:jQuery("#country-sel option:selected").attr('data-country'),
                   
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'store',
                    filter:filter
                };
            }else if( self.checkMobileDevice() ){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'store',
                    region:(self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                    country:(self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                    retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'store',
                    filter:filter
                };
            }
           
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
				if(isAndroid()){
					jQuery("#store-sel").attr('disabled', false);
			    }
                jQuery("#store-sel,#phonestore-sel").empty();
                jQuery("#store-sel").append('<option value="sel_all">All</option>');
                jQuery("#phonestore-sel").append('<li data-value="sel_all"><a>All</a><span></span></li>');
                if(resp.length > 0 && res.error === false){
                 if( res.response.store != undefined ){
                    jQuery.each(res.response.store, function(i,val){
                        if(val != undefined){
                            jQuery("#store-sel").append('<option title="'+self.toTitleCase(val.store.toLowerCase())+'" value="'+val.store+'">'+self.toTitleCase(val.store.toLowerCase())+'</option>');
                            jQuery("#phonestore-sel").append('<li  title="'+self.toTitleCase(val.store.toLowerCase())+'" data-value="'+val.store+'"><a>'+self.toTitleCase(val.store.toLowerCase())+'</a><span></span></li>');
                        }else{
                          return false;
                        }
                    });
                     jQuery("#phonestore-sel li").off('click').on('click',function(){
                       if( jQuery(this).text() == "All" ){
                        self.MultiSelect("#phonestore-sel");
                       }
                       if( jQuery(this).text() != "All" ){
                        jQuery(this).children('span').toggleClass('reportTick');
						
							 var increment= 0;
							 var listELementLeng = jQuery("#phonestore-sel li").length;
							 jQuery("#phonestore-sel li").each(function(index){
									if( jQuery(this).children('span').hasClass('reportTick') ){ 
											 increment++;
									 }
									if((increment+1) == listELementLeng){
										jQuery("#phonestore-sel li").first().children('span').toggleClass('reportTick'); 
										increment++;
									}
							 });
							 
                       }
                       self.getCourseData((jQuery(this).attr('data-value') === 'sel_all' ) ? 0 : 1);
                       return false;
                     });
                  }
					jQuery("#course-sel,#phonecourse-sel").empty();
					jQuery("#course-sel").append('<option value="sel_all">All</option>');
                    jQuery("#phonecourse-sel").append('<li data-value="sel_all"><a>All</a><span></span></li>');
                    if( res.response.course != undefined ){
						jQuery.each(res.response.course, function(i,val){
							if(val != undefined){
								jQuery("#course-sel").append('<option title="'+val.fullname+'" value="'+val.fullname+'">'+val.fullname.toLowerCase()+'</option>');
                                jQuery("#phonecourse-sel").append('<li  title="'+val.fullname+'" data-value="'+val.fullname+'"><a>'+val.fullname.toLowerCase()+'</a><span></span></li>');
							}
						});
                    }
                }
            });
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
				jQuery.ajax({
					url: serviceUrl,
					data: data,
					type: 'POST',
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
		getCourseData: function(filter){
			var self = this, serviceUrl = self.globalConfig.apiAddress.service, data = '', defaultArray = ["sel_all"];
            if(isAndroid() || !self.checkMobileDevice()){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'course',
                    region:(jQuery("#region-sel").val()) ? jQuery("#region-sel").val() : defaultArray,
                    country:(jQuery("#country-sel").val()) ? jQuery("#country-sel").val() : defaultArray,
                    retailer: (jQuery("#retailer-sel").val()) ? jQuery("#retailer-sel").val() : defaultArray,
                    store: (jQuery("#store-sel").val()) ? jQuery("#store-sel").val() : defaultArray,
                    //region:jQuery("#region-sel option:selected").attr('data-region'),
                    //country:jQuery("#country-sel option:selected").attr('data-country'),
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'course',
                    filter:filter
                };
            }else if( self.checkMobileDevice() ){
                (filter == 1) ? data = {
                    action:'by_course_searchfield',
                    type:'course',
                    region:(self.getMultiSelectedValue("#phoneregion-sel").length) ? self.getMultiSelectedValue("#phoneregion-sel") : defaultArray,
                    country:(self.getMultiSelectedValue("#phonecountry-sel").length) ? self.getMultiSelectedValue("#phonecountry-sel") : defaultArray,
                    retailer: (self.getMultiSelectedValue("#phoneretailer-sel").length) ? self.getMultiSelectedValue("#phoneretailer-sel") : defaultArray,
                    store: (self.getMultiSelectedValue("#phonestore-sel").length) ? self.getMultiSelectedValue("#phonestore-sel") : defaultArray,
                    filter:filter
                } : data = {
                    action:'by_course_searchfield',
                    type:'course',
                    filter:filter
                };
            }
                                                                    
            self.ajaxReq(serviceUrl,data,function(resp){
                var res = JSON.parse(resp);
				if(isAndroid()){
					jQuery("#course-sel").attr('disabled',false);
			    }
                jQuery("#course-sel,#phonecourse-sel").empty();
                jQuery("#course-sel").append('<option value="sel_all">All</option>');
                jQuery("#phonecourse-sel").append('<li data-value="sel_all"><a>All</a><span></span></li>');
                //console.log("getCourseData**"+res.error+"\t"+res.response.course);
                //if(resp.length > 0 && res.error === false){
                if(res.error === false && res.response.course != undefined){
                    jQuery.each(res.response.course, function(i,val){
                        if(val != undefined){
                            jQuery("#course-sel").append('<option title="'+self.toTitleCase(val.fullname.toLowerCase())+'" value="'+val.fullname+'">'+self.toTitleCase(val.fullname.toLowerCase())+'</option>');
                            jQuery("#phonecourse-sel").append('<li  title="'+self.toTitleCase(val.fullname.toLowerCase())+'" data-value="'+val.fullname+'"><a>'+self.toTitleCase(val.fullname.toLowerCase())+'</a><span></span></li>');
                        }
                    });
                    jQuery("#phonecourse-sel li").off('click').on('click',function(){
                      if( jQuery(this).text() == "All" ){
                       self.MultiSelect("#phonecourse-sel");
                      }
                      if( jQuery(this).text() != "All" ){
                       jQuery(this).children('span').toggleClass('reportTick');
					   
					   var increment= 0;
							 var listELementLeng = jQuery("#phonecourse-sel li").length;
							 jQuery("#phonecourse-sel li").each(function(index){
									if( jQuery(this).children('span').hasClass('reportTick') ){ 
											 increment++;
									 }
									if((increment+1) == listELementLeng){
									     jQuery("#phonecourse-sel li").first().children('span').toggleClass('reportTick');
										increment++;										 
									}
							 });
							 
                      }
                      return false;
                    });
                }
            });
        },
        ajaxReq:function(serviceUrl,data,succ,fail){
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                type: 'POST',
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
        searchReports: function (data) {
            jQuery("#load_wrapper").css({
                'position':'relative',
                'top':jQuery(document).height()/2
            });
			jQuery("#load_wrapper, .overlaycontainer").show();
            $('body').addClass('report-details-show');
			
            var self = this,
            serviceUrl = self.globalConfig.apiAddress.service,
            reportSearchArr = [],
            reportSearchOpt = '',
            pagination = '';
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                type: 'POST',
                crossDomain: true,
                dataType: 'json',
                async: this.IEAsyncType(),
                cache:false,
                success: function (reportResp) {
                    if (reportResp.msg == 'done') {
                        jQuery("#exportdiv").show();
                        reportSearchArr = reportResp.response.data;
						
						/* total record count */
						if(reportResp.response.totalcount!=0){
								(reportResp.response.totalcount > 9 ) ? jQuery("#total_record").text(reportResp.response.totalcount+" Record(s) found") : jQuery("#total_record").text(reportResp.response.totalcount+" Record found");
							}else{  jQuery("#total_record").text("No Record found"); }
							
                        for (reportsearch in reportSearchArr) {
                            var jobtitle = reportSearchArr[reportsearch].jobtitle;
                            if (jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportSearchArr[reportsearch].jobtitle;
                            }
                            reportSearchOpt += '<tr class="rep_grey_course"><td class="chkbx"><input type="checkbox" id="chkbx" class="chkcase" value="' + reportSearchArr[reportsearch].id + '"><label for="chkbx9"></label></td><td class="rep_course">' + reportSearchArr[reportsearch].fullname + '</td><td class="rep_lastnme">' + reportSearchArr[reportsearch].lastname + '</td><td class="rep_firstnme">' + reportSearchArr[reportsearch].firstname + '</td><td class="rep_job">' + jobtitle + '</td><td class="rep_course2">' + reportSearchArr[reportsearch].points + '</td><td class="rep_pnts">' + reportSearchArr[reportsearch].totalpoints + '</td></tr>';
                            try {
                                jQuery('.selectAllcourse').next('label').removeClass('checkDsblNone');
                            }catch(e){}
                        }
                    } else {
						jQuery("#total_record").text("No Record found"); 
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) {
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportSearchOpt = "<tr class='rep_grey_course'><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>"; 
                        jQuery('.selectAllcourse').next('label').addClass('checkDsblNone');
                    }
                    jQuery("#reportbycourse tbody").html(reportSearchOpt);
                    jQuery("tbody > tr:odd").addClass('rep_grey_course');
                    jQuery("tbody > tr:even").removeClass('rep_grey_course');
                    jQuery("tbody > tr:even").addClass('rep_wht_course');
                    var showCount = 20;
                    if (reportResp.msg == 'done') {
                        totalCount = Math.ceil(reportResp.response.totalcount / showCount);
                        if (reportResp.response.totalcount > 20) {
                            pagination = "<ul class='bootpag'>";
                            for (var i = 1; i <= totalCount; i++) {
                                if (i <= 9) {
                                    if (i == 1) {
                                        pagination += "<li class='activepg' data-page=" + i + "><a href='javascript:void(0);' >" + i + "</a></li>";
                                    } else {
                                        pagination += "<li data-page=" + i + "><a href='javascript:void(0);' >" + i + "</a></li>";
                                    }
                                }
                            }
                            pagination += "<li class='arwsymbl' data-page='2' data-move='next'><a href='javascript:void(0);'>&raquo;</a></li></ul><div style='width:10%'></div>";
                        }
                    }else {
                        jQuery("#exportdiv").hide();
                        pagination ="";
                    }
                    jQuery(".paginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
					jQuery("#load_wrapper, .overlaycontainer").hide();
                    $('body').removeClass('report-details-show');
                    loadAllLanguages();
                }
            });
        },
        paginationReports: function (data, page, lastval, prev) {
            var self = this,
            serviceUrl = self.globalConfig.apiAddress.service,
            reportSearchArr = [],
            reportSearchOpt = '',
            pagination = '';
			$('body').addClass('report-details-show');
			
            jQuery.ajax({
                url: serviceUrl,
                data: data,
                type: 'POST',
                crossDomain: true,
                dataType: 'json',
                async: this.IEAsyncType(),
                cache:false,
                success: function (reportResp) {
                    if (reportResp.msg == 'done') {
                        reportSearchArr = reportResp.response.data;
                        for (reportsearch in reportSearchArr) {                            
                            if (reportSearchArr[reportsearch].fullname === undefined) {
                                continue;
                            }
                            var jobtitle = reportSearchArr[reportsearch].jobtitle;
                            if (jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportSearchArr[reportsearch].jobtitle;
                            }
                            reportSearchOpt += '<tr class="rep_grey_course"><td class="chkbx"><input type="checkbox" id="chkbx"  class="chkcase" value="' + reportSearchArr[reportsearch].id + '"><label for="chkbx9"></label></td><td class="rep_course">' + reportSearchArr[reportsearch].fullname + '</td><td class="rep_lastnme">' + reportSearchArr[reportsearch].lastname + '</td><td class="rep_firstnme">' + reportSearchArr[reportsearch].firstname + '</td><td class="rep_job">' + jobtitle + '</td><td class="rep_course2">' + reportSearchArr[reportsearch].points + '</td><td class="rep_pnts">' + reportSearchArr[reportsearch].totalpoints + '</td></tr>';
                            try {
                                jQuery('.selectAllcourse').next('label').removeClass('checkDsblNone');
                            }catch(e){}
                        }
                    } else {
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) {
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportSearchOpt = "<tr class='rep_grey_course'><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                       
                        jQuery('.selectAllcourse').next('label').addClass('checkDsblNone');
                    }
                    jQuery("#reportbycourse tbody").html(reportSearchOpt);
                    jQuery("tbody > tr:odd").addClass('rep_grey_course');
                    jQuery("tbody > tr:even").removeClass('rep_grey_course');
                    jQuery("tbody > tr:even").addClass('rep_wht_course');
                    var showCount = 20;
                    if (reportResp.msg == 'done') {
                        jQuery("#exportdiv").show();
                        totalCount = Math.ceil(reportResp.response.totalcount / showCount);
                        page_start = page;
                        if (reportResp.response.totalcount > 20) {
                            var i = 0;
                            var pagecount = parseInt(page) + parseInt(9);
                            page_num = parseInt(totalCount) - parseInt(page);
                            if (page_num <= 9 && totalCount >= 9) {
                                page_start = parseInt(totalCount) - parseInt(9);
							}
                            if (totalCount <= 10) {
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
                    jQuery(".paginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
					jQuery("#load_wrapper, .overlaycontainer").hide();
                    $('body').removeClass('report-details-show');
                    loadAllLanguages();
                }
            });
        },
        downloadFile: function(self, courseItemData) {  /*downlad selected file into device*/
            if (isOnline()) {  /*check whether deveice in online*/
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
                                    //window.plugins.fileOpener.open(filePath);
                                    cordova.exec(
                                            function (args) {},
                                            function (args) {},
                                            'FileOpener', 'openVideoFile', [filePath]);
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
                /* jQuery('.nonetconnection').slideDown(2000, function(){
                    jQuery(this).fadeOut(6000);
                }); */
				
				jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
				updateLanguage();
				jQuery('body').removeClass('report-details-show');
				jQuery('.errorCode-pop').show();
            }
        },
        fileError: function(evt) {
            //console.log("Error in download : ******** " + JSON.stringify(evt));
        },
        checkIfFileExists: function(self, courseItemData) {  /*fun for whether selected file already downloaded or not*/
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
                self.loadFileinWeb(courseItemData);
            }
        },
        loadFileinWeb: function(courseItemData) {
            var filePath = courseItemData.fileURL, language, androidData={};
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    language = window.localStorage.getItem("language");
                } else {
                    language = $.jStorage.get("language");
                }
            if(isDevice()  && isPhoneGap()){
                if( /Android/i.test(navigator.userAgent) ) {
                	androidData.filePath = filePath;
                	androidData.language = ((language == null)?'en_us':language);
                    cordova.exec(
                                 function (args) {},
                                 function (args) {},
                                 'FileOpener', 'openVideoFile', [androidData]);
                    //window.plugins.fileOpener.open(filePath);
                    return false;
                }
                if( (navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone" || navigator.platform == "iPad Simulator" || navigator.platform == "iPad") && isPhoneGap() ){
                    cordova.exec(
                                 function (args) {},
                                 function (args) {},
                                 'PDFViewerPlugin', 'openReportExportFile', [filePath,((language == null)?'en_us':language)]);
                    return false;
                }
            }
            //jQuery(this).attr('href', href);
        },
        loadData: function (data1, data2, data3) {
            var self = this,
            serviceUrl = self.globalConfig.apiAddress.service,
            newsli = '',
            regionArr = [],
            regionOpt = '',
            countryArr = [],
            countryOpt = '',
            storeArr = [],
            storeOpt = '',
            retailerArr = [],
            retailerOpt = '',
            reportArr = [],
            reportrowOpt = '',
            teamArr = [],
            teamOpt = '';
            jQuery.ajax({
                url: serviceUrl,
                data: data3,
                type: 'POST',
                crossDomain: true,
                dataType: 'json',
                async: this.IEAsyncType(),
                cache:false,

                success: function (reportResp) {
                    loadAllLanguages();
                }
            });
			$('body').addClass('report-details-show');
			
            jQuery.ajax({
                url: serviceUrl,
                data: data2,
                type: 'POST',
                crossDomain: true,
                dataType: 'json',
                async: this.IEAsyncType(),
                cache:false,
                success: function (reportResp) {
                     if (reportResp.msg == 'done') {
                        reportArr = reportResp.response.data;
						/* report count */
						if(reportResp.response.totalcount!=0){
								(reportResp.response.totalcount > 9 ) ? jQuery("#total_record").text(reportResp.response.totalcount+" Record(s) found") : jQuery("#total_record").text(reportResp.response.totalcount+" Record found");
							}else{  jQuery("#total_record").text("No Record found"); }
						
                        for (reports in reportArr) {
                            if (reportArr[reports].fullname === undefined) {
                                continue;
                            }
                            var jobtitle = reportArr[reports].jobtitle;
                            if (jobtitle == null) {
                                jobtitle = "&nbsp;";
                            } else {
                                jobtitle = reportArr[reports].jobtitle;
                            }
                            reportrowOpt = '<tr class="rep_grey_course"><td class="chkbx"><input type="checkbox" id="chkbx"  class="chkcase" value="' + reportArr[reports].id + '"><label for="chkbx9"></label></td><td class="rep_course">' + reportArr[reports].fullname + '</td><td class="rep_lastnme">' + reportArr[reports].lastname + '</td><td class="rep_firstnme">' + reportArr[reports].firstname + '</td><td class="rep_job">' + jobtitle + '</td><td class="rep_course2">' + reportArr[reports].points + '</td><td class="rep_pnts">' + reportArr[reports].totalpoints + '</td></tr>';
                            jQuery("#reportbycourse tbody").append(reportrowOpt);
                            try {
                                jQuery('.selectAllcourse').next('label').removeClass('checkDsblNone');
                            }catch(e){}
                        }
                    } else {
						jQuery("#total_record").text("No Record found"); 
                        if( isAndroid()  || (/iPhone|iPod/i.test(navigator.userAgent))) {
                            var cols="7";
                        }else {
                            var cols="7";
                        }
                        reportrowOpt = "<tr class='rep_grey_course'><td colspan='"+cols+"' style='text-align:center;'><span data-msg='no_records_found'></span></td></tr>";
                        jQuery("#reportbycourse tbody").append(reportrowOpt);
                            jQuery('.selectAllcourse').next('label').addClass('checkDsblNone');
                    }
                    jQuery("tbody > tr:odd").addClass('rep_grey_course');
                    jQuery("tbody > tr:even").removeClass('rep_grey_course');
                    jQuery("tbody > tr:even").addClass('rep_wht_course');
                    var showCount = 9;
                    if (reportResp.msg == 'done') {
                        totalCount = Math.ceil(reportResp.response.totalcount / showCount);
                        var pagination = "<ul class='bootpag'>";
                        if (reportResp.response.totalcount > 9) {
                            for (var i = 1; i <= totalCount; i++) {
                                if (i <= 10) {
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
                    jQuery(".paginationbx").html(pagination);
                    jQuery("#load_wrapper").css({
                        'position':'relative',
                        'top':'45%',
                        'display':'none'
                    });
					jQuery("#load_wrapper, .overlaycontainer").hide();
                    $('body').removeClass('report-details-show');
                    loadAllLanguages();
                }
            });
        },
        checkMobileDevice: function(){
            if( navigator.platform == "iPhone Simulator" || navigator.platform == "iPhone"){
			  // No need check iPhone devices
              return false;
            }else{
              return false;
            }
        },
        getMultiSelectedValue: function(elementID){
            var value = "", selectedData = [];
            jQuery(elementID).find('li').each(function(index){
               if( jQuery(this).attr('data-selall') == "true" && elementID != "#searchDropdown"){
                return false;
               }
               if( jQuery(this).children('span').hasClass('reportTick') && jQuery(this).attr('data-value') != "sel_all"){
                 selectedData.push(jQuery(this).attr('data-value'));
               }
            });
            return selectedData;
        },
        MultiSelect: function(elementID){
         var parentToggled=false;
         jQuery(elementID).find('li').each(function(index){
            if( jQuery(this).children('span').hasClass('reportTick') ){
              if( jQuery(this).attr('data-value') == "sel_all"){
               jQuery(this).attr('data-selall','false');
              }
              if( !parentToggled ){
               jQuery(this).children('span').removeClass('reportTick');
              }
            }else{
              if( jQuery(this).attr('data-value') == "sel_all"){
                jQuery(this).attr('data-selall','true');
                parentToggled = true;
              }
              jQuery(this).children('span').addClass('reportTick');
            }
         });
        },
        mobileDeviceDOMElement: function(){
             var element = '<div class="row pro_container bycourse-temp">  \r\n' +
                '<section class="tpbreadcrumbs">  \r\n' +
                '</section>  \r\n' +
                '<div class="swiper-container report-container">  \r\n' +
                '<div class="swiper-wrapper report-wrapper">  \r\n' +
                '<div class="swiper-slide report-slide" style="text-align:left;">  \r\n' +
                '<div>  \r\n' +
                '<span data-msg="sel_region" style="font-size: 13px;font-weight: 700;"></span>  \r\n' +
                '</div>  \r\n' +
                '<div>  \r\n' +
                '<ul id="phoneregion-sel" class="dropdown-menu"></ul>  \r\n' +
                '</div>  \r\n' +
                '</div>  \r\n' +
                '<div class="swiper-slide report-slide" style="text-align:left;">  \r\n' +
                '<div>  \r\n' +
                '<span data-msg="sel_country" style="font-size: 13px;font-weight: 700;"></span>  \r\n' +
                '</div>  \r\n' +
                '<div>  \r\n' +
                '<ul id="phonecountry-sel" class="dropdown-menu"></ul>  \r\n' +
                '</div>  \r\n' +
                '</div>  \r\n' +
                '<div class="swiper-slide report-slide" style="text-align:left;">  \r\n' +
                '<div>  \r\n' +
                '<span data-msg="sel_retailer" style="font-size: 13px;font-weight: 700;"></span>  \r\n' +
                '</div>  \r\n' +
                '<div>  \r\n' +
                '<ul id="phoneretailer-sel" class="dropdown-menu"></ul>  \r\n' +
                '</div>  \r\n' +
                '</div>  \r\n' +
                '<div class="swiper-slide report-slide" style="text-align:left;">  \r\n' +
                '<div>  \r\n' +
                '<span data-msg="sel_store" style="font-size: 13px;font-weight: 700;"></span>  \r\n' +
                '</div>  \r\n' +
                '<div>  \r\n' +
                '<ul id="phonestore-sel" class="dropdown-menu"></ul>  \r\n' +
                '</div>  \r\n' +
                '</div>  \r\n' +
                '<div class="swiper-slide report-slide" style="text-align:left;">  \r\n' +
                '<div>  \r\n' +
                '<span data-msg="sel_course" style="font-size: 13px;font-weight: 700;">Select Course</span>  \r\n' +
                '</div>  \r\n' +
                '<div>  \r\n' +
                '<ul id="phonecourse-sel" class="dropdown-menu"></ul>  \r\n' +
                '</div>  \r\n' +
                '</div>  \r\n' +
                '</div> <!-- swiper-wraper Ends here -->  \r\n' +
                '<div class="pagination1 reportPagination">  \r\n' +
                '<span class="swiper-pagination-switch swiper-visible-switch swiper-active-switch"></span>  \r\n' +
                '<span class="swiper-pagination-switch"></span></div>  \r\n' +
                '</div> <!-- swiper-container Ends here -->  \r\n' +
                '<div class="repbtn nopadadj2 shwpadadj">  \r\n' +
                '<a href="javascript:void(0)" id="show-reports" style="text-shadow: none;font-size:11px;padding: 4px;width: 98%;color: #fff;font-weight: bold;">Show Report</a>  \r\n' +
                '</div>  \r\n' +
                '<div class="report-content">  \r\n' +
                '<div class="ui-grid-d report-grid" style="margin-top: -5.5%;">  \r\n' +
                '<div class="ui-block-a">  \r\n' +
                '<div class="reportSumoSelect">  \r\n' +
                '<p class="reportCaptionCont SlectBox"><span class="placeholder" style="padding: 5px 23px 5px 29px;background: url(../images/search_icon.png)no-repeat;background-size: 20px 20px;background-position: 2%;">Search By</span><label><i></i></label></p>\r\n' +
                '</div>  \r\n' +
                '<div id="searchDropdown" class="dropdown-menu1 dropdownDisable1">  \r\n' +
				'<li data-value="sel_all"><a>All</a><span></span></li>  \r\n' +
				'<li data-value="country"><a>Country</a><span></span></li>  \r\n' +
				'<li data-value="fullname"><a>Course Name</a><span></span></li>  \r\n' +
				'<li data-value="email"><a>Email</a><span></span></li>  \r\n' +
				'<li data-value="firstname"><a>First Name</a><span></span></li>  \r\n' +
				'<li data-value="lastname"><a>Last Name</a><span></span></li>  \r\n' +
				'<li data-value="region"><a>Region</a><span></span></li>  \r\n' +
                '<li data-value="retailer"><a>Retailer</a><span></span></li>  \r\n' +
                '<li data-value="store"><a>Store</a><span></span></li>  \r\n' +
				'<li data-value="username"><a>User Name</a><span></span></li>  \r\n' +
				'</div>  \r\n' +
                '</div>  \r\n' +
                '<div class="ui-block-b">  \r\n' +
                '<form onSubmit="return false;"><input class="random_report_search" type="search" name="search" onsearch="formSearch();" placeholder="Search" style="margin-top: 14px;padding-left: 30px !important;margin-left: -10%;background: url(../images/search_icon.png)no-repeat;width:100%;background-size: 20px 20px;background-position: 2%;" disabled/></form>  \r\n' +
                '</div>  \r\n' +
                '</div> <!-- End of ui-grid-d -->  \r\n' +
                '</div> <!-- End of ui-content -->  \r\n' +
                '<div class="repbtn nopadadj2 shwpadadj">  \r\n' +
                '<input type="button" id="reports_search" style="text-shadow: none;font-size: 11px;padding: 4px;width: 100%;color: #fff;margin-top: -43px; border-radius: 5px; cursor: not-allowed; border: #719a34 solid 1px; border-radius: 5px;font-weight: bold;background: -webkit-linear-gradient(top, rgba(129,162,62,1) 0%,rgba(152,185,85,1) 84%,rgba(154,188,88,1) 100%)" value="Search" disabled/>  \r\n' +
                '</div>  \r\n' +
                '<div style="margin-top: 5px;font-size: 14px;" id="total_record"></div><div class="reptablr_bx">  \r\n' +
                '<table width="100%" cellspacing="0" cellpadding="0" border="0" id="reportbycourse">  \r\n' +
                '<thead>  \r\n' +
                '<tr class="rep_hdg">  \r\n' +
                '<th class="chkbx"><input type="checkbox" class="selectAllcourse"><label for="selectAll"></label></th>  \r\n' +
                '<th class="rep_course"><span data-msg="course"></span><a href="#"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
                '<th class="rep_lastnme"><span data-msg="last_name"></span><a href="#"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
                '<th class="rep_firstnme"><span data-msg="first_name"></span><a href="#"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
                '<th class="rep_job"><span data-msg="job-title-label"></span><!--<a href="#"><img src="../images/rep_dwn_arw.png" ></a>--></th>  \r\n' +
                '<th class="rep_course2"><span data-msg="course_points"></span><a href="#"><img src="../images/rep_dwn_arw.png" sortby="ASC"></a></th>  \r\n' +
                '<th class="rep_pnts"><span data-msg="total_points"></span><a href="#"><img src="../images/rep_dwn_arw.png" sortby="ASC"></a></th>  \r\n' +
                '</tr>  \r\n' +
                '</thead>  \r\n' +
                '<tbody>  \r\n' +
                '</tbody>  \r\n' +
                '</table>  \r\n' +
                '</div>  \r\n' +
                '<div class="span12 rept_bx">  \r\n' +
                '<div class="paginationbx"><!--<ul><li class="arwsymbl"><a href="#">&nbsp;</a></li><li class="activepg"><a href="#">1</a></li>  \r\n' +
                '<li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li class="arwsymbl"><a href="#">&nbsp;</a></li>  \r\n' +
                '</ul>--></div>  \r\n' +
                '<div class="repbtn" id="exportdiv"><a href="javascript:void(0)" data-msg="export" style="color:#fff;"></a></div>  \r\n' +
                '</div>  \r\n' +
                '<div class="row lifter2"></div>  \r\n' +
                '<br><br><br>'+
                 '<br><br><br>'+
                '</div>';
            return element;
        },
        webandIpadDOMElement: function(){
         var element = '<div class="row pro_container bycourse-temp" id="report_page">  \r\n' +
            ''+this.reportBreadCrumnp()+'  \r\n' +
            '<div class="clearfix">'+
			 '<div class="span12 report_second_option" ><div class="reprt_srch_txt"><select multiple="multiple" placeholder="Search By" id="SelectBoxBoost">'+
			'<option value="country">Country</option>'+
			'<option value="fullname">Course Name</option>  \r\n' +
			'<option value="email">Email</option>  \r\n' +
			'<option value="firstname">First Name</option>  \r\n' +
			'<option value="lastname">Last Name</option>  \r\n' +
			'<option value="region">Region</option>  \r\n' +
			'<option value="retailer">Retailer</option>'+
			'<option value="store">Store</option>'+
			'<option value="username">User Name</option>  \r\n' + 
            '</select> </div> \r\n' +
            '<div class="reprt_srch_txt" style="margin-bottom: 0;"><form onSubmit="return false;">'+
            '<input style="min-width: 160px; width: 90%; margin-bottom:5px;" class="random_report_search test report_search"  type="search" name="search" onsearch="formSearch();" placeholder="Search" disabled/></form></div> \r\n' +
            '<div class="repbtn nopadadj2 shwpadadj reprt_srch_txt" >  \r\n' +
            '<input type="button" id="reports_search" style="text-shadow: none;font-size: 11px;font-weight: bold;padding: 4px;width: 84px;color: #fff; border-radius: 5px; cursor: not-allowed; border: #719a34 solid 1px; border-radius: 5px; background: -webkit-linear-gradient(top, rgba(129,162,62,1) 0%,rgba(152,185,85,1) 84%,rgba(154,188,88,1) 100%)" data-msg value="Search" disabled/></div></div>'+'</div>'+
			'<div class="span12 report-bg">  \r\n' +
            '<div style="padding-left: 12px;padding-top: 12px;"><input type="hidden" id="sortoption">  \r\n' +
            '<div class="span12 rept_bx">  \r\n' +
            '<input type="hidden" id="sortoption">  \r\n' +
            '<div class="rept_dropbx dropaddmar">  \r\n' +
            '<span class="droptxt" data-msg="sel_region" style="font-size: 13px;font-weight: 700;"></span><span class="dropdwn"><select size="" name="" id="region-sel" multiple="multiple" class="muldropdwn"><option value="" class="seloption-no" data-msg="all_default"></option></select></span></div>  \r\n' +
            '<div class="rept_dropbx dropaddmar">  \r\n' +
            '<span class="droptxt" data-msg="sel_country" style="font-size: 13px;font-weight: 700;"></span><span class="dropdwn">  \r\n' +
            '<select size="" name="" id="country-sel" class="muldropdwn" multiple="multiple">  \r\n' +
            '<option value="" class="seloption-no" data-msg="all_default"></option>  \r\n' +
            '</select></span></div>  \r\n' +
            '<div class="rept_dropbx dropaddmar"><span class="droptxt" data-msg="sel_retailer" style="font-size: 13px;font-weight: 700;"></span><span class="dropdwn"><select size="" name="" id="retailer-sel" multiple="multiple" class="muldropdwn"><option value="" class="seloption-no" data-msg="all_default"></option></select></span></div><div class="rept_dropbx"><span class="droptxt" data-msg="sel_store" style="font-size: 13px;font-weight: 700;"></span><span class="dropdwn"><select size="" name="" id="store-sel" multiple="multiple" class="muldropdwn"><option value="" class="seloption-no" data-msg="all_default"></option></select></span></div><div class="rept_dropbx"><span class="droptxt" data-msg="sel_course" style="font-size: 13px;font-weight: 700;">Select Course</span><span class="dropdwn"><select size="" name="" id="course-sel" multiple="multiple" class="muldropdwn"><option value="" class="seloption-no" data-msg="all_default"></option></select></span></div> <div class="repbtn nopadadj2 shwpadadj" style="padding:0; margin-top: 10px; margin-right:10px; float:right; padding-top: 0px;padding-bottom: 7px;font-weight: bold; clear:none;"><a href="javascript:void(0)" id="show-reports" style="float:none; display:inline-block; text-shadow: none;font-size:11px;padding: 1px;width: 90px;color: #fff;">Show Report</a></div><div class="repbtn" id="exportdiv" style="padding:0; margin-top: 10px; margin-right:18px; float:right; padding-top: 0px;padding-bottom: 7px;font-weight: bold; clear:none;"><a href="'+((isDevice() && isPhoneGap())?'javascript:void(0)':'#')+'" data-msg="export"  style="float:left; text-shadow: none;font-size:11px;padding: 1px;width: 90px;color: #fff;"></a></div>   </div></div></div> <!-- Final div -->  \r\n' +
			'<div style="margin-top: 10px; margin-bottom:10px; font-size: 14px; float:left;" id="total_record"></div><div class="reptablr_bx" style="clear:both;">  \r\n' +
            '<table width="100%" cellspacing="0" cellpadding="0" border="0" id="reportbycourse" style="border: 1px solid #76914d;border-collapse: separate;border-radius: 5px;"><thead>  \r\n' +
            '<tr class="rep_hdg">  \r\n' +
            '<th class="chkbx"><input type="checkbox" class="selectAllcourse"><label for="selectAll"></label></th>  \r\n' +
            '<th class="rep_course"><span data-msg="course"></span><a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
            '<th class="rep_lastnme"><span data-msg="last_name"></span><a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
            '<th class="rep_firstnme"><span data-msg="first_name"></span><a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png"  sortby="ASC"></a></th>  \r\n' +
            '<th class="rep_job"><span data-msg="job-title-label"></span><!--<a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png" ></a>--></th>  \r\n' +
            '<th class="rep_course2"><span data-msg="course_points"></span><a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png" sortby="ASC"></a></th>  \r\n' +
            '<th class="rep_pnts"><span data-msg="total_points"></span><a href="javascript:void(0);"><img src="../images/rep_dwn_arw.png" sortby="ASC"></a></th>  \r\n' +
            '</tr></thead><tbody></tbody></table></div><div style="margin-bottom : 10px;" class="span12 rept_bx">  \r\n' +
            '<div class="paginationbx"><!--<ul><li class="arwsymbl"><a href="#">&nbsp;</a></li><li class="activepg"><a href="#">1</a></li>  \r\n' +
            '<li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li class="arwsymbl"><a href="#">&nbsp;</a></li></ul>--></div></div>  \r\n' +
            '<div class="row lifter2"></div></div>';
                                                                    
           return element;
        },
        reportBreadCrumnp: function(){
        	var element ='';
        	if(!isAndroid()){
        		element ='<section class="tpbreadcrumbs"><ul><li class="rephdnk" id="home_page"><a href="javascript:void(0)" data-msg="Home"></a></li>  \r\n' +
                '<li data-msg="Reports"></li></ul><div class="clear"></div></section>';
        	}
        	return element;
        }
    });
    return Clazz.com.components.widget.bycourse.js.Bycourse;
});
