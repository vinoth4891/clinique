define(["framework/WidgetWithTemplate","abstract/offlineStorage"], function (template) {
    Clazz.createPackage("com.components.widget.badges.js");
    Clazz.com.components.widget.badges.js.Badges = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/badges/template/badges.tmp",
        configUrl: "../../componens/home/config/config.json",
        name: "badges",
        localConfig: null,
        globalConfig: null,
        offlineStorage: null,
        initialize: function (globalConfig) {
            this.globalConfig = globalConfig;
            this.offlineStorage = new Clazz.com.js.offlineStorage();
        },
        loadPage: function () {
            Clazz.navigationController.push(this);
        },
        preRender: function(whereToRender, renderFunction) {
            renderFunction(this.data, whereToRender);
            var BreadcrumElement='';
            Handlebars.registerHelper('checkForBreadcrum', function () {
              if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                  BreadcrumElement = '<section class="tpbreadcrumbs"><ul>  \r\n' +
                  '<li class="plyrshdnk" id="home_page"><a href="#" data-msg="Home"></a></li>  \r\n' +
                  '<li class="plyrshdnk" id="players_page"><a href="javascript:void(0)" data-msg="Players"></a></li><li data-msg="badges"></li></ul><div class="clear"></div></section>';
                  return new Handlebars.SafeString(BreadcrumElement);
              }
            });
        },
        postRender: function (element) {
        },
        onResume: function () {
            /* Resetting the sliders to Initial Stage */
            jQuery("div.bdgebx_hldr ul, div.bag_drg_icons").css('left',0);
            jQuery("div.bdge_arw_lft > a, div.bag_drg_lftbx > a").removeClass('enblLft').addClass('dsbl');
            jQuery("div.bdge_arw_rgt > a, div.bag_drg_rgtbx > a").removeClass('dsblRht dsbl');
        },
        loadData: function (data) {
            /* Loading Badges */
            var self = this, ajaxCall,
            serviceUrl = self.globalConfig.apiAddress.service;
                                                                
         if( isDevice() && self.globalConfig.application.offLine ){
            cordova.exec(
                         function(result) {
                             self.UserDetails = JSON.parse(result);
                             self.badgeSuccess(self.UserDetails);
                         },
                         function(result) {},'OfflineServicePlugin', 'badges', [data]);
         }else{
            if((ajaxCall != undefined) && (ajaxCall != null)){
                ajaxCall.abort();
            }
           ajaxCall = jQuery.ajax({
                url: serviceUrl,
                data: data,
                crossDomain: true,
                cache: false,
                type : 'POST',
                dataType : 'json',
                async: this.IEAsyncType(),
                success: function (res) {
                    /* Storing in Offline Storage */
                    self.offlineStorage.insertComp('BADGES', JSON.stringify(res));
                    self.badgeSuccess(res);
                },
                error: function ( jqXHR, textStatus, errorThrown ){
                    self.offlineStorage.getComp('BADGES');
                    setTimeout(function (){
                        var badgessOfflineData;
                        if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                            badgessOfflineData = JSON.parse(localStorage["transferData"]);
                        } else {
                            badgessOfflineData = JSON.parse($.jStorage.get("transferData"));
                        }
                        self.badgeSuccess( badgessOfflineData );
                    },1000);
                }
            });
           }
        },
        updateUserPoint: function () {
            var totalGainedPoints = 0;
            var self = this;
            
            jQuery("div.bag_drg_icons:last span.bdge_txt").each(function () {
                totalGainedPoints += parseInt($(this).text());
            });
            $("div.bag_tble > h1 > span.gainPoint").text(parseInt(userGainedPoint) - parseInt(totalGainedPoints));
            
            $("div.bdgebx_hldr span.bdge_txt").each(function () {
                if (parseInt($(this).text()) > parseInt((userGainedPoint - totalGainedPoints))) {
                    var badgeItem = $(this).parents('li');
                    if (!$("span.lock", badgeItem).length) {
                        badgeItem.append('<span class="lock"></span>');
					}
                    if ($("img", badgeItem).attr('src').indexOf('_disabled') == -1) {
                        $("img", badgeItem).attr('src', $("img", badgeItem).attr('src').replace('.png', '_disabled.png'));
					}
                }
            });
        },
        updateBadges: function (badgeId, badgeVal, badgeName) {
            var self = this,
            serviceUrl = self.globalConfig.apiAddress.service,
            courseOptions = '',
            courseArr = [];
            var userDetails;
    
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var updtateBadgeData = {
                action: 'badges',
                uid: userDetails.id,
                bid: badgeId,
                bval: badgeVal,
                callFor: 'getBadges'
            };
            if( isDevice() && self.globalConfig.application.offLine ){
                updtateBadgeData.bname=badgeName;
                 cordova.exec(
            			function(result) {},
						function(result) {},'OfflineServicePlugin', 'update_user_badges', [updtateBadgeData]);
            }else{
                jQuery.ajax({
                        url: serviceUrl,
                        data: updtateBadgeData,
                        type: 'POST',
                        crossDomain: true,
                        dataType: 'json',
                        async: this.IEAsyncType(),
                        success: function (res) {
                         ci(res);
                        }
                });
            }
        },

        badgeSuccess: function (res){
            var self = this, badgeLists = '', userLists1 = '', userLists2 = '', userLists3 = '';
            jQuery("div.bdgebx_hldr > ul").html('');            
            if(!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userGainedPoint = window.localStorage.getItem("badge-user-point");
            } else {
                userGainedPoint = $.jStorage.get("badge-user-point");
            }         
            userGainedPoint = (parseFloat(userGainedPoint) > 0) ? parseFloat(userGainedPoint) : 0;
            if (res.msg === 'done') {
                var badgeList = res.response.badges;
                for (var badgeId in badgeList) {
                    if(isNaN(parseFloat(badgeList[badgeId].badge_value))) {
                        continue;
                    }
                    badgeLock = '';
                    badgeName = $.trim(badgeList[badgeId].badge_name);
                    badgeValue = parseFloat(badgeList[badgeId].badge_value);
                    if (userGainedPoint < badgeValue) {
                        badgeName = badgeList[badgeId].badge_name + '_disabled';
                        badgeLock = '<span class="lock"></span>';
                    }
                    badgeLists += '<li badgeId="' + badgeList[badgeId].id +'" badgeName="' + badgeList[badgeId].badge_name + '"><span class="bdge_icon"><img src="../images/badges/' +
                    badgeName +
                    '.png"></span>' +
                    badgeLock +
                    '<span class="shdw"></span><span class="bdge_txt">' + badgeList[badgeId].badge_value + '</span></li>';
                }
                jQuery("div.bdgebx_hldr > ul").html(badgeLists);
                /* Badges Drag and Drop - Starts here */
                $("div.bdgebx_hldr li").draggable({
                    revert: "invalid",
                    appendTo: "section.badgeholder",
                    helper: "clone",
					cursor: "crosshair",
					cursorAt: { bottom: 0 },
                    stop: function (event, ui) {
                        $("section.badgeholder > li").remove();
                    }
                });
                $("div.bag_drg_icons > ul").droppable({
                    accept: "div.bdgebx_hldr li:not(:has(span.lock))",
                    drop: function (event, ui) {
                        /* Checking the Maximum badges in a bag */
                        if(isOnline() || !isOnline() ){
                            /*  Condition to display the drag and drop label*/
                            jQuery("div.drgtxt_bx:visible").hide();

                            var badgeCount = $("li", this).length,
                            chin = 0;
                            var dragItem = ui.draggable[0];
                            var badgeId = $(dragItem).attr('badgeid');
                            var badgeValue = $(dragItem).find("span.bdge_txt").text();
                            var badgeName = $(dragItem).attr('badgeName');
                            if (badgeCount < 8) {
                                /* Appending the Badges into Bag */
                                $(this).append($(dragItem).clone());
                                $("section.badgeholder > li").remove();
                                /* Updates User Points */
                                self.updateUserPoint();
                                self.updateBadges(badgeId, badgeValue, badgeName);
                            } else {
                                if ($("div.bag_drg_rgtbx > a:visible").length) {
                                    $("div.bag_drg_rgtbx:last > a").click();
								}
                            }
                        }else{
                        }
                    }
                });
                /* Badges Drag and Drop - Ends here */
                /* Populating Previous User Badges */
                var userBadgeList = res.response.userbadges;
                for(var i =0; i <userBadgeList.length; i++ ) {
                    if(isNaN(parseFloat(userBadgeList[i].badge_value))) {
                        continue;
                    }
                    var badVal = userBadgeList[i].badge_value;
                    if(isNaN(badVal)){
                        badVal = 0;
                    }
                    if(isNaN(badVal)){
                        badVal = 0;
                    }
                    if (i < 8) {
                        userLists1 += '<li badgeid="' + userBadgeList[i].user_badge_id + '"><span class="bdge_icon"><img src="../images/badges/' + userBadgeList[i].badge_name + '.png"></span><span class="shdw"></span><span class="bdge_txt">' + badVal + '</span></li>';
			        }
                    else if (i < 16) {
                        userLists2 += '<li badgeid="' + userBadgeList[i].user_badge_id + '"><span class="bdge_icon"><img src="../images/badges/' + userBadgeList[i].badge_name + '.png"></span><span class="shdw"></span><span class="bdge_txt">' + badVal + '</span></li>';
					}
                    else {
                        userLists3 += '<li badgeid="' + userBadgeList[i].user_badge_id + '"><span class="bdge_icon"><img src="../images/badges/' + userBadgeList[i].badge_name + '.png"></span><span class="shdw"></span><span class="bdge_txt">' + badVal + '</span></li>';
					}
                    
                }
                
                jQuery("div.bag_drg_icons:last ul:first").html(userLists1);
                jQuery("div.bag_drg_icons:last ul:eq(1)").html(userLists2);
                jQuery("div.bag_drg_icons:last ul:last").html(userLists3);

//                jQuery("#badgeFirstBag").append(userLists1);
//                jQuery("#badgeSecondBag").append(userLists2);
//                jQuery("#badgeLastBag").append(userLists3);
                
                
                
                /*  Condition to display the drag and drop label*/
                if(jQuery("div.bag_drg_icons li").length){
                   // if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                        jQuery("div.drgtxt_bx").hide();
                   // }
                }else{
                    jQuery("div.drgtxt_bx").show();
                }
                /* Updating User Points */
                self.updateUserPoint();
            }
            badgeWidth = $("div.bdgebx_hldr:last li").outerWidth();
            totBadges = $("div.bdgebx_hldr:last li").length;
			$("div.bdgebx_hldr:last > ul").width(badgeWidth * totBadges);
            self.arrowClick = 0;
			
			// media query event handler
			if (matchMedia) {
				var mq = window.matchMedia("handheld, only screen and (max-width: 1024px)");
				mq.addListener(WidthChange);
				WidthChange(mq);
			}

			// media query change
			function WidthChange(mq) {

				if (mq.matches) {
					badgeWidth = $("div.bdgebx_hldr:last li").outerWidth();
					totBadges = $("div.bdgebx_hldr:last li").length;
					$("div.bdgebx_hldr:last > ul").width(badgeWidth * totBadges);
                    self.arrowClick = 0;
				}
				else {
					badgeWidth = $("div.bdgebx_hldr:last li").outerWidth();
					totBadges = $("div.bdgebx_hldr:last li").length;
					$("div.bdgebx_hldr:last > ul").width(badgeWidth * totBadges);
                    self.arrowClick = 0;
				}

			}
        },
        arrowClick: 0,
        bindUI: function () {
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
            }
            /* Alignment fix */
            if((screen.width == 1280) && (window.orientation !== undefined)){
                jQuery("div.bdge_bx > div.bdgebx_hldr").addClass('bdgebx_hldr-mob-landscape');
            }else{
                jQuery("div.bdge_bx > div.bdgebx_hldr").removeClass('bdgebx_hldr-mob-landscape');
            }
            var language, ajaxCall = '', iTouch = 'click';
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                language = window.localStorage.getItem("language");
            } else {
                language = $.jStorage.get("language");
            }
            var activeLang = (language !== undefined && language !== null) ? language : defaultLang;
            initLanguages();
            loadLanguages(activeLang);
            var self = this, userDetails;
            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
            }
            var data = {
                action: 'badges',
                uid: userDetails.id,
                callFor: 'getBadges',
                wstoken: userDetails.token
            };
            if(isDevice() && !checkAppOnline() && !self.globalConfig.application.offLine ) {
                jQuery('.errorCode-pop .prog-summarys').attr('data-msg','ERR10011');
                updateLanguage();
                jQuery('.errorCode-pop').show();
            }
            
             if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userGainedPoint = window.localStorage.getItem("badge-user-point");
            } else {
                userGainedPoint = $.jStorage.get("badge-user-point");
            }
            
            self.loadData(data);
            /* Setting User Point*/
           
//            $("div.bag_tble > h1 > span.gainPoint").text(userGainedPoint);
            /* Badge Slider */
            $("div.bag_drg_icons").css({
                'position': 'relative',
                'left': '0'
            });
            if(isiOS()){
                iTouch = 'touchstart';
            }
			
            $("div.bdge_arw_lft, div.bdge_arw_rgt").on(iTouch, function () {
                var clickedArrow1 = $(this);
                var allowAnimation = false;
                var bdgebxHldrWidth = $("div.bdgebx_hldr").outerWidth();
                var badgeUlWidth = $("div.bdgebx_hldr ul").outerWidth();
                var badgeLiWidth = $("div.bdgebx_hldr li:first").outerWidth();
                var badgeUlLeft = parseInt($("div.bdgebx_hldr ul").css('left').replace('px', ''));
                var preAdjustVal = badgeUlLeft - badgeLiWidth;
                var postAdjustVal = badgeUlWidth - bdgebxHldrWidth;
                var leftElem = $("div.bdge_arw_lft");
                var rightElem = $("div.bdge_arw_rgt");
                var leftSign = '-';
				var hideListCount = Math.round((badgeUlWidth - bdgebxHldrWidth) / badgeLiWidth);
				if ($(this).hasClass('bdge_arw_lft')) {
                    var leftSign = '+';
				}
                if (((badgeUlLeft < 0) || (preAdjustVal >= 0)) && (leftSign == '+')) {
                    allowAnimation = true;
					self.arrowClick--;
                }
                if (leftSign == '-') {
                    allowAnimation = false;
                    bdgebxHldrWidth = (bdgebxHldrWidth < 250)?bdgebxHldrWidth*1.5:bdgebxHldrWidth;                    
                    if((badgeUlLeft) > (bdgebxHldrWidth - badgeUlWidth) && (hideListCount != self.arrowClick)){
                        allowAnimation = true;
						self.arrowClick++;
                    }
                }
                if (allowAnimation) {
                    clickedArrow1.css('visibility','hidden');
                    var  timeoutValOne = 0;
                    if ($.browser.msie && (parseInt($.browser.version, 10) === 7 || parseInt($.browser.version, 10) === 8 || parseInt($.browser.version, 10) === 9 || parseInt($.browser.version, 10) === 10 || parseInt($.browser.version, 10) === 11)) {
                        jQuery("div.bdgebx_hldr > ul").animate({
                            left: leftSign + '=' + badgeLiWidth
                        }, 750);
                        timeoutValOne = 2100;
                    } else {
                        jQuery("div.bdgebx_hldr > ul").css({
                            left: leftSign + '=' + badgeLiWidth
                        }, 750);
                        timeoutValOne = 1300;
                    }
                    
                    setTimeout(function () {
                        // Animation complete.
                        clickedArrow1.css('visibility','visible');
                        var leftMove = $("div.bdgebx_hldr > ul").css('left').replace('px','');
                        var leftMovePosi = (leftMove < 0)?(leftMove*-1):leftMove;
                        if(leftMove >= 0){
                            $("div.bdgebx_hldr > ul").css('left','0');
                            leftElem.addClass('dsbl');
                            $("a", leftElem).removeClass('enblLft');
                            rightElem.removeClass('dsbl');
                            $("a", rightElem).removeClass('dsblRht');
                        }else{
                            leftElem.removeClass('dsbl');
                            $("a", leftElem).addClass('enblLft');
                            rightElem.removeClass('dsbl');
                            $("a", rightElem).removeClass('dsblRht');
                        }
                    }, timeoutValOne);
                }else{
                    if(leftSign == '-'){
                        leftElem.removeClass('dsbl');
                        $("a", leftElem).addClass('enblLft');
                        rightElem.removeClass('dsbl');
                         $("a", rightElem).addClass('dsblRht');
                    }
                }
                return false;
            });
            /* Badge Holder Slider */
            var badgeHolderWidth = $("div.bag_drg_icons > ul").outerWidth();
            var totBadgeHolders = $("div.bag_drg_icons > ul").length;
            $("div.bag_drg_icons").width(badgeHolderWidth * totBadgeHolders);
            var leftMove = parseInt($("div.bag_drg_icons").css('left').replace('px', ''));
            if (leftMove == 0) {
                $("div.bag_drg_lftbx").addClass('dsbl');
                $("div.bag_drg_lftbx a").removeClass('enblLft');
                $("div.bag_drg_rgtbx").removeClass('dsbl');
                $("div.bag_drg_rgtbx a").removeClass('dsblRht');
            }
            allowedLeftMove = (badgeHolderWidth * totBadgeHolders - badgeHolderWidth) * (-1);
            $("div.bag_drg_lftbx, div.bag_drg_rgtbx").on(iTouch, function () {
                var clickedElem = $(this);
                if(!clickedElem.hasClass('dsbl')){
                    clickedElem.hide();
                    var bagHolderleftsign = '-';
                    var leftElem = $("div.bag_drg_lftbx"), rightElem = $("div.bag_drg_rgtbx");
                    if (clickedElem.hasClass('bag_drg_lftbx')) {
                        var bagHolderleftsign = '+';
					}
                    var timeoutValTwo = 0;
                    if ($.browser.msie && (parseInt($.browser.version, 10) === 7 || parseInt($.browser.version, 10) === 8 || parseInt($.browser.version, 10) === 9 || parseInt($.browser.version, 10) === 10 || parseInt($.browser.version, 10) === 11)) {
                        jQuery("div.bag_drg_icons").animate({
                            left: bagHolderleftsign + '=' + badgeHolderWidth
                        }, 700);
                        timeoutValTwo = 2000;
                    } else {
                        jQuery("div.bag_drg_icons").css({
                            left: bagHolderleftsign + '=' + badgeHolderWidth
                        });
                        timeoutValTwo = 1200;
                    }
                    
                    setTimeout(function () {
                        // Animation complete.
                        clickedElem.show();
                        var leftMove = parseInt($("div.bag_drg_icons").css('left').replace('px', ''));

                        if (leftMove < 0){
                            leftElem.removeClass('dsbl');
                            $("a", leftElem).addClass('enblLft');
                        }
                        if (leftMove >= 0) {
                            leftElem.addClass('dsbl');
                            $("a", leftElem).removeClass('enblLft');
                            rightElem.removeClass('dsbl');
                            $("a", rightElem).removeClass('dsblRht');
                        } else if (leftMove <= allowedLeftMove) {
                            leftElem.removeClass('dsbl');
                            $("a", leftElem).addClass('enblLft');
                            rightElem.addClass('dsbl');
                            $("a", rightElem).addClass('dsblRht');
                        } else {
                            leftElem.removeClass('dsbl');
                             $("a", leftElem).addClass('enblLft');
                            rightElem.removeClass('dsbl');
                             $("a", rightElem).removeClass('dsblRht');
                        }
                        $(this).fadeIn('slow');
                    }, timeoutValTwo);
                }
                return false;
            });
            /* Badges page Bookmark Clicks - Starts Here */
            jQuery('#home_page > a').on('click', function () {
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
            });
            jQuery('#players_page > a').on('click', function () {
                jQuery("#footer-menu li").removeClass('selected');
                jQuery(".footer_players").addClass('selected');
                jQuery("#header-menu li").removeClass('selected');
                jQuery(".header_players").addClass('selected');
                self.playersWidget = new Clazz.com.components.widget.players.js.Players();
                self.playersWidget.loadPage();
            });
            /* Resetting the Slider to the Original Phase on Orientation Change */
            jQuery(window).bind('orientationchange', function () {
                /* Badge Holder Slider */
                var badgeHolderWidth = jQuery("div.bag_drg_icons > ul").outerWidth();
                var totBadgeHolders = jQuery("div.bag_drg_icons > ul").length;
                var badgeHoldWid = parseInt(badgeHolderWidth * totBadgeHolders);
                if(badgeHoldWid < 804) {
                    badgeHoldWid = 804;
				}
                jQuery("div.bag_drg_icons").width(badgeHoldWid);
                jQuery("div.bdgebx_hldr ul, div.bag_drg_icons").animate({
                    left: 0
                }, 500, function () {
                    // Animation complete.
                    jQuery("div.bdge_arw_lft > a, div.bag_drg_lftbx > a").removeClass('enblLft');
                    jQuery("div.bdge_arw_lft, div.bag_drg_lftbx").addClass('dsbl');
                    jQuery("div.bdge_arw_rgt > a, div.bag_drg_rgtbx > a").removeClass('dsblRht');
                    jQuery("div.bdge_arw_rgt, div.bag_drg_rgtbx").removeClass('dsbl');
					badgeWidth = $("div.bdgebx_hldr:last li").outerWidth();
					totBadges = $("div.bdgebx_hldr:last li").length;
					$("div.bdgebx_hldr:last > ul").width((badgeWidth * totBadges)+10);
					self.arrowClick = 0;
                });
                /* Alignment fix */
                if((screen.width == 1280) && (window.orientation !== undefined)){
                    jQuery("div.bdge_bx > div.bdgebx_hldr").addClass('bdgebx_hldr-mob-landscape');
                }else{
                    jQuery("div.bdge_bx > div.bdgebx_hldr").removeClass('bdgebx_hldr-mob-landscape');
                }
            });
        /* Badges page Bookmark Clicks - Ends Here */
            jQuery('ul#header-menu li:not(.selected), ul#footer-menu li:not(.selected), div.hmelogo, div.hmelogo2, li#home_page').on('click',function(){
                if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                    window.localStorage.removeItem("player-course");
                } else {
                    $.jStorage.deleteKey("player-course");
                }
            });
            if (jQuery('html').hasClass('ie8')) {
                this.breadcrumbLast();
            }
        }
    });
    return Clazz.com.components.widget.badges.js.Badges;
});
