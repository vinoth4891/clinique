var globalconfig;
$(document).ready(function(){
                jQuery(document).ajaxStart(function(){
                	jQuery("#load_wrapper,.overlaycontainer").show();
                });
                jQuery(document).ajaxStop(function(){
                	jQuery("#load_wrapper,.overlaycontainer").hide();
				});
    function globalConfigDataParse(data) {
        globalconfig = data;
        configJson = {
            /* comment out the below line for production, this one is so require doesn't cache the result */
            urlArgs: "time=" + (new Date()).getTime(),
            baseUrl: "../js/",
            paths: {
                abstract: "abstract",
                framework: "framework",
                listener: "common_components/listener",
                api: "api",
                lib: "../lib",
                common: "common_components/common",
                modules: "common_components/modules",
                Clazz: "framework/Class",
                components: "../components"
            }
        };

        $.each(globalconfig.environments[0].components, function (index, value) {
            configJson.paths[index] = value.path;
        });
        /* setup require.js */
        requirejs.config(configJson);
        require(globalconfig.environments[0].loadjs.bootstrap, function () {
            Clazz.config = data;
            Clazz.navigationController = new Clazz.NavigationController({
                mainContainer: "basepage\\:widget",
                transitionType: Clazz.config.navigation.transitionType,
                isNative: Clazz.config.navigation.isNative
            });		
            /* Splash Animation Starts */
            $(".animate img").show().addClass('animate-hover');
            $(".logotxt img").css({'opacity': '1'});		
			if(!($.browser.msie  && parseInt($.browser.version, 10) === 7)) {
				try {
					var login = new Clazz.com.components.widget.login.js.Login();
					if (window.localStorage.getItem("avoidSplash") == 1) {
						login.loadPage(globalconfig);
						$("body").addClass('body');
						$(".animate-wrap").hide();
						if (!isSupportedBrowser()) {
							jQuery('.unsupportedBrowser').toggle();
						}
					} else {
						setTimeout(function () {
							$("body").addClass('body');
							$(".animate-wrap").fadeOut('fast');
							login.loadPage(globalconfig);
							if (!isSupportedBrowser()) {
								jQuery('.unsupportedBrowser').toggle();
							}
						}, 4000);
					}
				} catch (e) {
					//console.log(e);
				}
			}else{
			            var login = new Clazz.com.components.widget.login.js.Login();
			            login.loadPage(globalconfig);
						$("body").addClass('body');
						$(".animate-wrap").hide();
			}
        });
        /* Splash Animation Ends */
    }
    if(($.browser.msie  && parseInt($.browser.version, 10) === 7)) {
        $.getJSON('../json/config.json', function(data) {
            globalConfigDataParse(data);
	});
    } else {
        $.getJSON($("basepage\\:widget").attr("config"), function(data) {
           globalConfigDataParse(data);
       });   
    }
    $(document).bind("keydown", disableF5);
// To re-enable f5
});