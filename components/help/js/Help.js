define(["framework/WidgetWithTemplate"], function(template) {
    Clazz.createPackage("com.components.widget.help.js");
    Clazz.com.components.widget.help.js.Help = Clazz.extend(Clazz.WidgetWithTemplate, {
        // template URL, used to indicate where to get the template
        templateUrl: "../components/help/template/help.tmp",
        configUrl: "../../componens/home/config/config.json",
        name : "help",
        localConfig: null,
        globalConfig: null,
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
                  '<li class="hlphdnk home_page"><a href="#" data-msg="Home"></a></li>  \r\n' +
                  '<li data-msg="Help"></li></ul><div class="clear"></div></section>';
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
        bindUI : function() {
            if(jQuery('.ie7-footer-specific').hasClass('reportsfooter')) {
               jQuery('.ie7-footer-specific').removeClass('reportsfooter');
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
            jQuery('#header-menu li, #footer-menu li').removeClass('selected');            
            var userDetails, resrccategoryid;            
            if (!($.browser.msie && parseInt($.browser.version, 10) === 7)) {
                userDetails = JSON.parse(window.localStorage.getItem("USER"));
                resrccategoryid = window.localStorage.getItem("catrsrcId");
            } else {
                userDetails = JSON.parse($.jStorage.get("USER"));
                resrccategoryid = $.jStorage.get("catrsrcId");
            }
            var self = this;
            jQuery('.reshdnk').on('click',function() {
                jQuery("#footer-menu li, #header-menu li").removeClass('selected');
                jQuery(".footer_home, .header_home").addClass('selected');
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
            jQuery('.home_page').on('click',function(){
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
        },
        loadData:function(data){
            var self=this,serviceUrl = self.globalConfig.apiAddress.restservice,newsli='';
            jQuery.ajax({
                url: serviceUrl,
                data:data,
                type:'POST',
                crossDomain:true,
                dataType:'json',
                success:function(rsrcresp){
                    //console.info(rsrcresp);
                    for(var i =0; i <rsrcresp.length; i++ ){
                        newsli +='<li class="span12" id="'+i+'"><a href="#"><span class="res_pdficon">'+rsrcresp[i].shortname+'</span></a></li>';
                    }
                    jQuery("#resrc").html(newsli);
                }
            });
        }
    });
    return Clazz.com.components.widget.help.js.Help;
});
