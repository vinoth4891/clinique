/*global require */
var defaultLang = 'en';
var data = {
    apiAddress: {
    },
    navigation: {
        "transitionType": 1,
        "isNative": false
    }
};

var configJson = {
    paths: {
        abstract: "js/abstract",
        framework: "js/framework",
        listener: "widget/listener",
        api: "js/api",
        lib: "lib",
        Clazz: "framework/Class",
        components: "../components",
        login: "components/login/js",
        home: "components/home/js",
        changePwd: "components/changePwd/js",
        course: "components/course/js",
        courseItem: "components/courseItem/js",
        me: "components/me/js",
        news: "components/news/js",
        players: "components/players/js",
        resource: "components/resource/js",
        reports: "components/reports/js",
        favorites: "components/favorites/js",
        header: "components/header/js",
        footer: "components/footer/js"
    }
};
// setup require.js
requirejs.config(configJson);

require(["jquery", "lib/common", "lib/jquery.roundabout.min", "home/Home", "framework/WidgetWithTemplate", "framework/NavigationController"], function(jQuery, common, jquery_roundabout_min, Home, WidgetWithTemplate, navigation) {
    /**
     * Test that the setMainContent method sets the text in the MyCart-widget
     */
    module("Home.js;Home");
    asyncTest("Home widget : Unit Testing the template data", function() {
        var home, output1, output2, widgetWithTemplate;
        Clazz.config = data;
        Clazz.navigationController = new Clazz.NavigationController({
            mainContainer: "basepage\\:widget",
            transitionType: Clazz.config.navigation.transitionType,
            isNative: Clazz.config.navigation.isNative
        });

        widgetWithTemplate = new Clazz.WidgetWithTemplate();

        home = new Home();
        home.homeTest("src/components/home/template/home.tmp", null);
        home.loadPage();
        jQuery.get("src/components/home/template/home.tmp", function(result) {
            output2 = result;
        });
        setTimeout(function() {
            start();
            output1 = home.element;
            equal(output1, output2, "Success case for Change Password Template Data");
        }, 2000);
    });
    /*  asyncTest("Home : Unit Testing for Change Password success authentication", function() { 
     });
     asyncTest("Home : Unit Testing for Change Password failure authentication", function() {       
     });*/
});
