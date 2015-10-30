/*global require */
var defaultLang = 'en';
var login_data = {
    "apiAddress": {
        "loginHost": "http://clinique-dev.photoninfotech.com/admin/clinique_webservice/services.php"
    },
    "navigation": {
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

require(["jquery", "login/Login", "lib/common", "framework/NavigationController", "framework/WidgetWithTemplate"], function($, Login, common, navigation, apiAddress, WidgetWithTemplate) {
    /**
     * Test that the setMainContent method sets the text in the MyCart-widget
     */
    module("Login.js;Login");
    asyncTest("Login widget : Unit Testing the template data", function() {
        var login, output1, output2, widgetWithTemplate;

        Clazz.config = login_data;
        Clazz.navigationController = new Clazz.NavigationController({
            mainContainer: "basepage\\:widget",
            transitionType: Clazz.config.navigation.transitionType,
            isNative: Clazz.config.navigation.isNative
        });

        widgetWithTemplate = new Clazz.WidgetWithTemplate();

        login = new Login();
        login.loginTest("src/components/login/template/login.tmp", null);
        login.loadPage();
        jQuery.get("src/components/login/template/login.tmp", function(result) {
            output2 = result;
        });
        setTimeout(function() {
            start();
            output1 = login.element;
            equal(output1, output2, "Success case for Login Template Data");
        }, 2000);


    });
    asyncTest("Login widget : Unit Testing for Login success authentication", function() {

        var loginData1 = {
            username: "admin",
            password: "Photon@123",
            service: "moodle_mobile_app",
            action: 'login'
        };
        var output1 = true, output2 = false;
        jQuery.support.cors = true;
        jQuery.ajax({
            url: login_data.apiAddress.loginHost,
            cache: false,
            async: false,
            type: 'POST',
            data: loginData1,
            dataType: 'json',
            crossDomain: true,
            success: function(res) {
                if (typeof(res.USER) !== 'undefined') {
                    output2 = true;
                }
                //
            }
        });
        setTimeout(function() {
            start();
            equal(output1, output2, "Success case for Login authentication username : " + loginData1.username + " password :" + loginData1.password);
        }, 2000);

    });
    asyncTest("Login widget : Unit Testing for Login failure authentication", function() {
        var loginData2 = {
            username: "clinique",
            password: "Photon.123456",
            service: "moodle_mobile_app",
            action: 'login'
        };
        var output1 = false, output2 = true;
        jQuery.support.cors = true;
        jQuery.ajax({
            url: login_data.apiAddress.loginHost,
            cache: false,
            async: false,
            type: 'POST',
            data: loginData2,
            dataType: 'json',
            crossDomain: true,
            success: function(res) {
                if (typeof(res.token) === 'undefined') {
                    output2 = false;
                }
            }
        });
        setTimeout(function() {
            start();
            equal(output1, output2, "Success case for Login failure authentication username : " + loginData2.username + " password :" + loginData2.password);
        }, 2000);

    });

});
