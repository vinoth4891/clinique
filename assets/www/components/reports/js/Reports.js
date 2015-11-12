define(["framework/WidgetWithTemplate","bycourse/Bycourse"] , function(template) {
    Clazz.createPackage("com.components.widget.reports.js");
    Clazz.com.components.widget.reports.js.Reports = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/reports/template/reports.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "reports",
        localConfig: null,
        globalConfig: null,
        bycoursewidget:null,
        initialize : function(globalConfig){
            this.globalConfig = globalConfig;
        },
        loadPage :function(){
            Clazz.navigationController.push(this);
        },
        postRender : function(element) {
        },
        preRender: function(whereToRender, renderFunction) {
          var BreadcrumElement='';
          Handlebars.registerHelper('checkForBreadcrum', function () {
            if( navigator.platform != "iPhone Simulator" && navigator.platform != "iPhone" && !isAndroid()){
                BreadcrumElement = '<section class="tpbreadcrumbs"><ul>  \r\n' +
                '<li class="rephdnk" id="home_pageview"><a href="#" data-msg="Home"></a></li>  \r\n' +
                '<li data-msg="Reports"></li></ul><div class="clear"></div></section>';
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
            var userDetails, self=this;
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"))
            } else {
                userDetails = JSON.parse( $.jStorage.get("USER"))
            }
            jQuery("#bycourse").on('click',function(){
                self.bycoursewidget = new Clazz.com.components.widget.bycourse.js.Bycourse();
                self.bycoursewidget.loadPage();
            });
            jQuery('#home_pageview').on('click',function(){
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
        }
    });
    return Clazz.com.components.widget.reports.js.Reports;
});
