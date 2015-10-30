/*global require */
var defaultLang = 'en';
var data = {
    "apiAddress": {
        "chgPwd": "http://clinique-dev.photoninfotech.com/admin/clinique_webservice/services.php"
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

require(["jquery", "changePwd/ChangePwd", "lib/common", "framework/NavigationController", "framework/WidgetWithTemplate"], function($, ChangePwd, common, navigation, apiAddress, WidgetWithTemplate) {
    /**
     * Test that the setMainContent method sets the text in the MyCart-widget
     */
    module("ChangePwd.js;ChangePwd");
    asyncTest("ChangePwd widget : Unit Testing the template data", function() {
        var changePwd, output1, output2, widgetWithTemplate;
        Clazz.config = data;
        Clazz.navigationController = new Clazz.NavigationController({
            mainContainer: "basepage\\:widget",
            transitionType: Clazz.config.navigation.transitionType,
            isNative: Clazz.config.navigation.isNative
        });

        widgetWithTemplate = new Clazz.WidgetWithTemplate();

        changePwd = new ChangePwd();
        changePwd.ChangePwdTest("src/components/changePwd/template/changePwd.tmp", null);
        changePwd.loadPage();
        jQuery.get("src/components/changePwd/template/changePwd.tmp", function(result) {
            output2 = result;
        });
        setTimeout(function() {
            start();
            output1 = changePwd.element;
            equal(output1, output2, "Success case for Change Password Template Data");
        }, 2000);


    });
    asyncTest("ChangePwd : Unit Testing for Change Password success authentication", function() {

        var changePwdObj = null, output1 = true, output2 = false;
        var email1 = "anilkumar.v@photon.in";
        var oldpwd1 = "Photon@123";
        var newpwd1 = "Photon@123";
        var confPwd1 = newpwd1;

        var pwdData1 = {
            email: email1,
            old_pwd: oldpwd1,
            new_pwd: newpwd1,
            action: 'change_password'
        };

        changePwdObj = new ChangePwd();

        if (changePwdObj.Pwdstrgth(newpwd1, confPwd1, true)) {
            jQuery.support.cors = true;
            jQuery.ajax({
                url: data.apiAddress.chgPwd,
                cache: false,
                async: false,
                type: 'POST',
                data: pwdData1,
                dataType: 'json',
                crossDomain: true,
                success: function(resp) {
                    if (!resp.error) {
                        output2 = true;
                    }
                }
            });

        }
        setTimeout(function() {
            start();
            equal(output1, output2, "Success case for Change Password. Old Password: " + pwdData1.old_pwd + " & New Password :" + pwdData1.new_pwd);
        }, 5000);

    });
    asyncTest("ChangePwd : Unit Testing for Change Password failure authentication", function() {
        var changePwd = null, output1 = false, output2 = true;
        var email2 = "anilkumar.v@photon.in";
        var oldpwd2 = "Photon.123456";
        var newpwd2 = "Photon@123";
        var confPwd2 = newpwd2;

        var pwdData2 = {
            email: email2,
            old_pwd: oldpwd2,
            new_pwd: newpwd2,
            action: 'change_password'
        };
        changePwd = new ChangePwd();

        if (changePwd.Pwdstrgth(newpwd2, confPwd2, true)) {
            jQuery.support.cors = true;
            jQuery.ajax({
                url: data.apiAddress.chgPwd,
                cache: false,
                async: false,
                type: 'POST',
                data: pwdData2,
                dataType: 'json',
                crossDomain: true,
                success: function(resp) {
                    if (resp.error) {
                        output2 = false;
                    }
                }
            });
        }
        setTimeout(function() {
            start();
            equal(output1, output2, "Success case for Change Password failure. Old Password: " + pwdData2.old_pwd + " & New Password :" + pwdData2.new_pwd);
        }, 5000);
    });
});
