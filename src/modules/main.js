define(function(require) {
    var PuthinkApp = require('app');
    //vue 组件
    require('modules/component');
   // console.log();
    //zach
    //配置文件
    var params = {
        // apiDomain: 'http://p.pushthink.com', //接口域名 不带"/"
        apiDomain: 'http://p.pushthink.com', //接口域名 不带"/"
        domain: '', //网站域名  不带"/",
        plugUrl: '/dist/',
        //loginUrl: 'http://p.pushthink.com/', //登录域名 
        loginUrl: 'http://login.pushthink.com/', //登录域名 
        debug: seajs.data.debug?seajs.data.debug:false,
        versions: seajs.data.versions?seajs.data.versions:'6.8',
        userVersions: seajs.data.userVersions?seajs.data.userVersions:'6.8'
    };
    if(params.debug){
      params.loginUrl="http://p.pushthink.com/";
      params.apiDomain="http://superadmin2.pushthink.com";
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
        if (name == "index" || name == 'events') {
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
                setInterval(app.notification, 2000);
            });
        });
    }

    // var data =  app.GetRequest("http://127.0.0.1:8080/index2.0.html?fans_id=96384889&open_id=o8-__joouL-gws-AnmZgBgahhO8Q&subscribe=0&nickname=%E6%B8%A9%E4%BD%9C%E6%9D%83&sex=1&country=%E4%B8%AD%E5%9B%BD&province=%E5%8C%97%E4%BA%AC&city=&avatar=http%3A%2F%2Fwx.qlogo.cn%2Fmmopen%2FQ3auHgzwzM6bppQ5NGm4kekeNDgee7DFEYiaBNxM3ElbGkmgoOB9Kkfux6ibPWtVQMYJcTsf51cq8stDgeZOWVibQ%2F0&app_id=0649312f8ed4a6d8f2&timestamp=2017-03-09+20%3A33%3A22&sign_keys=app_id%2Cavatar%2Ccity%2Ccountry%2Cfans_id%2Cnickname%2Copen_id%2Cprovince%2Csex%2Csign_keys%2Csubscribe%2Ctimestamp&sign=b4522e8dd2a35adade318257b68bd44d#/");
    // //console.log(data);
    // app.get("/BoxApi/Events/getUUID", data, function(res) {
    //     console.log(res);
    // })

    //页面实例，第一次会执行
    //  // app.login(function() {
    //       app.getTpl("component.html", function(content) {
    //           $("body").append(content);
    //           app.init();
    //          //提醒
    //          app.notification();
    //          //setInterval(app.notification,2000);
    //       });
    // //  });


});
