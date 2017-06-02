"use strict";

define("./dist/modules/main", [ "app" ], function(require) {
    var PuthinkApp = require("app");
    //vue 组件
    require("modules/component");
    // console.log();
    //zach
    //配置文件
    var params = {
        // apiDomain: 'http://p.pushthink.com', //接口域名 不带"/"
        apiDomain: "http://p.pushthink.com",
        //接口域名 不带"/"
        domain: "",
        //网站域名  不带"/",
        plugUrl: "/dist/",
        //loginUrl: 'http://p.pushthink.com/', //登录域名 
        loginUrl: "http://login.pushthink.com/",
        //登录域名 
        debug: seajs.data.debug ? seajs.data.debug : false,
        versions: seajs.data.versions ? seajs.data.versions : "6.8",
        userVersions: seajs.data.userVersions ? seajs.data.userVersions : "6.8"
    };
    if (params.debug) {
        params.loginUrl = "http://p.pushthink.com/";
        params.apiDomain = "http://superadmin2.pushthink.com";
    }
    //app 实例之后 ， 只执行一次
    PuthinkApp.afterInit = function() {
        var _hmt = _hmt || [];
        (function() {
            if ($("#hm-baidu").length > 0) {
                return false;
            }
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?702ae87feb905577a0b18e9b8cb05b6f";
            hm.id = "hm-baidu";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
        })();
    };
    //页面显示时引用，每次都会执行
    PuthinkApp.pageShow = function(params) {
        var name = params.name;
        $("#header").find(".home").show();
        $("#header").find(".logo").hide();
        $("#header").find(".user").show();
        if (name == "index" || name == "events") {
            $("#header").find(".logo").show();
            $("#header").find(".home").hide();
        }
        if (name == "add" || name == "addComment") {
            $("#header").find(".logo").hide();
            $("#header").find(".home").hide();
            $("#header").find(".user").hide();
        }
    };
    //实例化app
    window.app = new PuthinkApp(params);
    if (app.params.debug) {
        app.login(function() {
            require.async("template/component", function(html) {
                $("body").append(html);
                app.init();
                app.notification();
            });
        });
    } else {
        app.loginByYouZan(function() {
            require.async("template/component", function(html) {
                $("body").append(html);
                app.init();
                app.notification();
                setInterval(app.notification, 2e3);
            });
        });
    }
});
