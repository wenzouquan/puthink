"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} : function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

define("./dist/modules/app", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //注册组件 , 帖子列表
    var app = function app(params) {
        app.wxLoad = null;
        //app.wx = require("jweixin");
        app.params = {
            versions: "6.7",
            userVersions: "2.4",
            debug: true,
            urlCache: {},
            loadPage: 0,
            apiDomain: "http://p.pushthink.com",
            //不带"/"
            //domain: 'http://www.codecamp.com', 
            loginUrl: "http://login.boxphp.me"
        };
        for (var i in params) {
            app.params[i] = params[i];
        }
        var fun = {
            //实例化VueApp
            init: function init() {
                //创建和挂载根实例
                var VueApp = new Vue({
                    router: router,
                    watch: {
                        // 如果路由有变化，会再次执行该方法
                        $route: "fetchData"
                    },
                    mounted: function mounted() {
                        this.fetchData();
                        this.setWxShareData();
                    },
                    methods: {
                        setWxShareData: function setWxShareData() {
                            console.log("setWxShareData");
                            app.get("/BoxApi/Events/swiper", {
                                id: "puthinkWxShareData"
                            }, function(data) {
                                if (data && data[0]) {
                                    var item = data[0];
                                    var wxShareData = {
                                        title: item.title,
                                        url: item["url"],
                                        imgUrl: item["picUrl"],
                                        desc: item["content"]
                                    };
                                    // console.log(wxShareData);
                                    app.wxDefShare(wxShareData);
                                }
                            });
                        },
                        fetchData: function fetchData() {
                            //  console.log(this.$route);
                            var name = this.$route.name;
                            var options = app.findOptionsByName(name);
                            var wrap = "#router-view-tmp";
                            //页面是要缓存的
                            if (options.page == "cache") {
                                wrap = "#router-view-cache";
                            } else {
                                wrap = "#router-view-tmp";
                                $(wrap).html("");
                            }
                            $(".page").addClass("cached").removeClass("pageShow");
                            var loadingPage = '<div class="loadingPage" style="text-align: center;margin-top: 100px;">正在为您努力加载页面。。。。</div>';
                            $("body").append(loadingPage);
                            //return ;
                            //console.log(options);
                            if (options.title) {
                                app.setTitle(options.title);
                            }
                            var id = "#page" + app.ucfirst(name);
                            if ($(id).length > 0) {
                                $(id).removeClass("cached").addClass("pageShow");
                                $(".loadingPage").remove();
                                if (typeof app.pageShow == "function") {
                                    app.pageShow({
                                        name: name
                                    });
                                }
                                var pageVm = app.getVm(name);
                                if (pageVm) {
                                    typeof pageVm.pageShow === "function" ? pageVm.pageShow() : "";
                                }
                            } else {
                                app.routePage(name, wrap);
                            }
                        }
                    }
                }).$mount("#app");
                if (typeof app.afterInit == "function") {
                    app.afterInit();
                }
            },
            wxShare: function wxShare(params, callblack) {
                var data = {
                    title: params["title"],
                    // 分享标题
                    link: params["url"] ? params["url"] : window.location.href,
                    // 分享链接
                    imgUrl: params["imgUrl"],
                    // 分享图标
                    desc: params["desc"],
                    success: function success() {
                        // 用户确认分享后执行的回调函数
                        app.wxDefShare();
                    },
                    cancel: function cancel() {}
                };
                app.wx(function(wx) {
                    wx.onMenuShareTimeline(data);
                    wx.onMenuShareAppMessage(data);
                    callblack ? callblack() : "";
                });
            },
            wx: function wx(callblack) {
                require.async("jweixin", function(wx) {
                    typeof callblack == "function" ? callblack(wx) : "";
                });
            },
            //传入一个name ， 会加载对应的html ,和js , 生成id : page-id
            routePage: function routePage(name, wrap, ajax) {
                if (!name) {
                    return false;
                }
                var id = "page" + app.ucfirst(name);
                require.async("template/" + name, function(content) {
                    if (typeof content == "string") {
                        content = content.replace(/<img/g, "<img onerror=\"this.src='dist/images/errorImg.png'\"");
                    }
                    if (ajax == 1) {
                        content = $("<div>" + content + "</div>").find(".ajaxPageContent").html();
                        content = "<div id='" + id + "'>" + content + "</div>";
                    } else {
                        content = "<div class='page pageShow' id='" + id + "'>" + content + "</div>";
                    }
                    var wrapContent = $(content);
                    $(wrapContent).hide();
                    $(wrapContent).appendTo(wrap);
                    var pageId = "#" + id;
                    var options = {
                        name: name
                    };
                    require.async("modules/" + name, function(controller) {
                        controller.vue(options);
                        $(pageId).show();
                        $(".loadingPage").remove();
                        if ($(pageId).find(".page-content").length > 0) {
                            app.scrollPreventDefault($(pageId).find(".page-content").eq(0));
                        }
                        if (typeof controller.pageShow == "function") {
                            controller.pageShow(options);
                        }
                        if (typeof app.pageShow == "function") {
                            app.pageShow(options);
                        }
                    });
                });
            },
            //禁用滚动
            scrollPreventDefault: function scrollPreventDefault(pageContent) {
                function pageContentTouchstart() {
                    var el = this;
                    var top = el.scrollTop, totalScroll = el.scrollHeight, currentScroll = top + el.offsetHeight;
                    if (top === 0) {
                        $(el).attr("_isScroller", 1);
                        el.scrollTop = 2;
                    } else if (currentScroll === totalScroll) {
                        $(el).attr("_isScroller", 1);
                        el.scrollTop = top - 2;
                    }
                }
                function pageContentTouchmove() {
                    var el = this;
                    var top = el.scrollTop, totalScroll = el.scrollHeight, currentScroll = top + el.offsetHeight;
                    if (top === 0) {
                        $(el).attr("_isScroller", 0);
                    } else if (currentScroll === totalScroll) {
                        $(el).attr("_isScroller", 0);
                    }
                }
                function preventDefault(evt) {
                    var _isScroller = $(".pageShow .page-content").attr("_isScroller");
                    //pageContent 滚动到底部或顶部时禁用滚动
                    if (_isScroller == "0") {
                        evt.preventDefault();
                    }
                }
                //判断pageContent 滚动的位置， 如果滚动到顶部或底部， 禁用滚动
                $(pageContent).unbind("touchstart", pageContentTouchstart).bind("touchstart", pageContentTouchstart);
                $(pageContent).unbind("touchmove", pageContentTouchmove).bind("touchstart", pageContentTouchmove);
                //当pageContent顶部或底部， body是不能能滚动
                $("body").unbind("touchmove", preventDefault).bind("touchmove", preventDefault);
                //头部不能能滚动
                $("#header").unbind("touchmove").bind("touchmove", function(evt) {
                    evt.preventDefault();
                });
                //底部不能能滚动
                $(".bottom-fixed").unbind("touchmove").bind("touchmove", function(evt) {
                    evt.preventDefault();
                });
            },
            //找到这路由的配置
            findOptionsByName: function findOptionsByName(name) {
                var options = router.options.routes;
                for (var item in options) {
                    if (name == options[item]["name"]) {
                        return options[item];
                    }
                }
                return {};
            },
            confirm: function confirm(params) {
                $(".confirm").remove();
                $(".popupBg").remove();
                var html = '<div class="confirm" id="appConfirm">';
                html += '<div class="confirm-text">' + params.text + "</div>";
                html += '<ul class="confirm-options">';
                html += '<li class="bl">取消</li> <li>确定</li>';
                html += "</ul>";
                html += "</div>";
                var yes = params.yes;
                $(".pageShow").append(html);
                if ($("body").find(".popupBg").length > 0) {
                    $("body").find(".popupBg").remove();
                }
                $('<div class="popupBg"></div>').insertBefore("#appConfirm");
                $(".popupBg").unbind("click").bind("click", function() {
                    app.confirmNo();
                });
                $("#appConfirm .confirm-options li").eq(0).click(function() {
                    app.confirmNo(params.no);
                });
                $("#appConfirm .confirm-options li").eq(1).click(function() {
                    app.confirmNo();
                    yes ? yes() : "";
                });
            },
            confirmNo: function confirmNo(callblack) {
                $(".confirm").remove();
                $("body").find(".popupBg").remove();
                callblack ? callblack() : "";
            },
            //操作选项
            handle: function handle(params, callblack) {
                var optionsHtml = "";
                for (var i in params) {
                    optionsHtml += '<div class="handle-options-one">' + params[i]["text"] + "</div>";
                }
                var html = '<div class="handle-options">';
                html += '<div class="handle-options-group">';
                html += optionsHtml;
                html += " </div>";
                html += '<div class="handle-options-last colse">取消</div>';
                html += " </div>";
                app.popup("handle", html);
                callblack ? callblack() : "";
            },
            //popup 弹出方式
            popup: function popup(id, content) {
                if ($("body").find("#" + id).length > 0) {
                    $("body").find("#" + id).remove();
                }
                var html = '<div class="popup" id="' + id + '">' + content + "</div>";
                $(".pageShow").append(html);
                app.show_popup("#" + id);
            },
            //
            show_popup: function show_popup(popupId) {
                if ($("body").find(".popupBg").length > 0) {
                    $("body").find(".popupBg").remove();
                }
                $('<div class="popupBg"></div>').insertBefore(popupId);
                $(popupId).addClass("popup-modal-in");
                $(".popupBg").bind("click", function() {
                    app.hide_popup();
                });
                $(popupId).find(".colse").bind("click", function() {
                    app.hide_popup();
                });
            },
            hide_popup: function hide_popup() {
                $(".popup").removeClass("popup-modal-in");
                $("body").find(".popupBg").remove();
            },
            //图片加载延迟
            picLazyLoad: function picLazyLoad(imgs, fn) {
                require.async("plug/picLazyLoad", function(picLazyLoad) {
                    picLazyLoad.watch(imgs, fn);
                });
            },
            //首字母大写
            ucfirst: function ucfirst(str) {
                if (typeof str !== "string") {
                    return "";
                }
                var strs = str.split("/");
                var res = "";
                for (var i in strs) {
                    str = strs[i];
                    //var str = str.toLowerCase();
                    str = str.replace(/\b\w+\b/g, function(word) {
                        return word.substring(0, 1).toUpperCase() + word.substring(1);
                    });
                    res += str;
                }
                return res;
            },
            setTitle: function setTitle(title) {
                $("#app-title").text(title);
            },
            showLoad: function showLoad() {
                //$("body").append("<div class='dialog loading'></div>");
                if ($("body").find(".loader--style1").length === 0) {
                    $("body").append($("#component-loader").html());
                }
                $(".loader--style1").show();
            },
            hideLoad: function hideLoad() {
                //$(".loading").remove();
                $(".loader--style1").hide();
            },
            login: function login(callblack) {
                var backUrl = window.location.href;
                var box_login_code = "";
                var Request = app.GetRequest(backUrl);
                var UserInfo = app.getUserInfo();
                // console.log(Request);
                if (UserInfo && UserInfo.uuid) {
                    typeof callblack == "function" ? callblack() : "";
                    return;
                } else if (Request && Request.box_login_code) {
                    var userInfoUrl = app.params.loginUrl + "/BoxApi/Index/auth_info/box_login_code/" + Request.box_login_code;
                    app.showLoad();
                    $.getJSON(userInfoUrl, function(data) {
                        if (data && data.uuid) {
                            app.setUserInfo(data);
                            app.hideLoad();
                            typeof callblack == "function" ? callblack() : "";
                        } else {
                            app.confirm({
                                text: "授权登录发现异常，是否重新登录？",
                                yes: function yes() {
                                    var backUrl = window.location.origin;
                                    var loginUrl = app.params.loginUrl + "/BoxLogin/Login/index/?store_id=1&scope=snsapi_userinfo&backUrl=" + window.escape(backUrl);
                                    window.location.href = loginUrl;
                                }
                            });
                        }
                    });
                } else {
                    var loginUrl = app.params.loginUrl + "/BoxLogin/Login/index/?store_id=1&scope=snsapi_userinfo&backUrl=" + window.escape(backUrl);
                    window.location.href = loginUrl;
                }
            },
            loginByYouZan: function loginByYouZan(callblack) {
                var backUrl = window.location.href;
                var box_login_code = "";
                var Request = app.GetRequest(backUrl);
                //var UserInfo = app.getUserInfo("login");
                var userVersions = app.params.userVersions;
                var UserInfo = app.cache(userVersions).get("UserInfo");
                //console.log(Request);
                //console.log(  window.location.origin);
                if (UserInfo && UserInfo.uuid) {
                    callblack ? callblack() : "";
                    app.hideLoad();
                    return;
                } else if (Request && Request["msg"]) {
                    //console.log(Request['msg']);
                    app.alert(Request["msg"]);
                    app.hideLoad();
                    return;
                } else if (Request && Request.open_id) {
                    app.showLoad();
                    // for(var i in Request){
                    //    Request[i]=decodeURI(Request[i]);
                    // }
                    //console.log(Request);
                    app.get("/BoxApi/Events/getUUID", Request, function(res) {
                        if (res["error"] == 0) {
                            var data = res["data"];
                            app.setUserInfo(data);
                            app.hideLoad();
                            window.location.href = "/";
                            callblack ? callblack() : "";
                        } else {
                            app.confirm({
                                text: "授权登录发现异常，是否重新登录？",
                                yes: function yes() {
                                    var backUrl = window.location.origin;
                                    //var loginUrl = app.params.loginUrl + "/BoxLogin/Login/index/?store_id=1&scope=snsapi_userinfo&backUrl=" + escape(backUrl);
                                    var loginUrl = app.params.loginUrl + "/redirect-php-sdk?backUrl=" + escape(backUrl);
                                    window.location.href = loginUrl;
                                }
                            });
                        }
                    });
                } else {
                    var loginUrl = app.params.loginUrl + "/redirect-php-sdk";
                    // alert(loginUrl);
                    window.location.href = loginUrl;
                }
            },
            wxJs: function wxJs(callblack) {
                if (app.wxLoad) {
                    typeof callblack == "function" ? callblack() : "";
                    return;
                }
                app.get("/BoxApi/Events/wxJs", function(signPackage) {
                    app.wx(function(wx) {
                        app.wxLoad = 1;
                        wx.config({
                            debug: false,
                            appId: signPackage.appId,
                            timestamp: signPackage.timestamp,
                            nonceStr: signPackage.nonceStr,
                            signature: signPackage.signature,
                            jsApiList: [ "onMenuShareTimeline", "onMenuShareAppMessage", //"onMenuShareQQ",
                            //"onMenuShareWeibo",
                            // "onMenuShareQZone",
                            "previewImage" ]
                        });
                        wx.ready(function() {
                            //alert(callblack);
                            typeof callblack == "function" ? callblack() : "";
                        });
                        wx.error(function(res) {
                            //alert(callblack);
                            app.wxLoad = 0;
                            app.alert(res);
                        });
                    });
                });
            },
            GetRequest: function GetRequest(url) {
                var theRequest = new Object();
                if (url.indexOf("?") != -1) {
                    var str = url.split("?");
                    str = str[1];
                    var strs = str.split("&");
                    for (var i = 0; i < strs.length; i++) {
                        var v = strs[i].split("=")[1];
                        theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                    }
                }
                return theRequest;
            },
            alert: function alert(msg, callblack) {
                //alert("<div class='dialog'>"+msg+"</div>");
                if (typeof msg != "string") {
                    msg = JSON.stringify(msg);
                }
                $("body").append("<div class='dialog'>" + msg + "</div>");
                var width = $(".dialog").width() / 2;
                var h = $(".dialog").height() / 2;
                $(".dialog").css({
                    "margin-left": "-" + width + "px",
                    "margin-top": "-" + h + "px"
                });
                setTimeout(function() {
                    $(".dialog").remove();
                    typeof callblack == "function" ? callblack() : "";
                }, 3e3);
            },
            //版本号
            getVersions: function getVersions() {
                return app.params.debug ? Math.random() : app.params.versions;
            },
            //用户信息
            getUserInfo: function getUserInfo(type) {
                var userVersions = app.params.userVersions;
                var UserInfo = app.cache(userVersions).get("UserInfo");
                if (UserInfo && UserInfo.uuid) {
                    //callblack ? callblack(UserInfo) : "";
                    return UserInfo;
                }
                return {};
            },
            setUserInfo: function setUserInfo(userInfo) {
                var userVersions = app.params.userVersions;
                if (userInfo && userInfo.user_id && userInfo.uuid) {
                    //app.cache(userVersions).rm('UserInfo');
                    //console.log(userInfo.address);
                    var UserInfo = app.cache(userVersions).set("UserInfo", userInfo);
                }
            },
            get: function get(url, params, callblack) {
                app.showLoad();
                // console.log(params);
                var args = (typeof params === "undefined" ? "undefined" : _typeof(params)) == "object" ? params : {};
                callblack = $.isFunction(params) ? params : callblack;
                var UserInfo = app.getUserInfo();
                if (UserInfo && UserInfo.uuid) {
                    args.uuid = UserInfo.uuid;
                }
                app.ajax({
                    type: "GET",
                    dataType: "json",
                    data: args,
                    success: function success(res) {
                        // console.log(res);
                        callblack(res);
                    },
                    url: app.params.apiDomain + url
                });
            },
            post: function post(url, params, callblack) {
                app.showLoad();
                // console.log(params);
                var args = (typeof params === "undefined" ? "undefined" : _typeof(params)) == "object" ? params : {};
                callblack = $.isFunction(params) ? params : callblack;
                var UserInfo = app.getUserInfo();
                if (UserInfo && UserInfo.uuid) {
                    if (args && args.length > 0 && args[0]["name"]) {
                        args[args.length] = {
                            name: "uuid",
                            value: UserInfo.uuid
                        };
                    } else {
                        args["uuid"] = UserInfo.uuid;
                    }
                }
                app.ajax({
                    type: "POST",
                    dataType: "json",
                    data: args,
                    success: function success(res) {
                        callblack(res);
                    },
                    url: app.params.apiDomain + url
                });
            },
            loadCss: function loadCss(url) {
                url = app.params.plugUrl + url;
                var css_id = app.base64_encode(url);
                if (!app.params.urlCache[css_id]) {
                    app.params.urlCache[css_id] = css_id;
                    $("head").append('<link href="' + url + '" id="css_id_' + css_id + '" rel="stylesheet" type="text/css" />');
                }
            },
            //无限加载
            pager: function pager(callblack) {
                //$(window).unbind('scroll');
                function pagerContent() {
                    var bot = 100;
                    //bot是底部距离的高度
                    var nDivHight = $(this).height();
                    var nScrollHight = $(this)[0].scrollHeight;
                    var nScrollTop = $(this)[0].scrollTop;
                    if (nScrollTop + nDivHight + bot >= nScrollHight && app.params.loadPage == "0") {
                        $.isFunction(callblack) ? callblack() : "";
                    }
                }
                $(".page-content").unbind("scroll", pagerContent);
                $(".page-content").scroll(pagerContent);
            },
            upload: function upload(obj) {
                app.loadCss("plug/photo/photo.css");
                require.async("plug/photo/photo.js", function(photo) {
                    photo.initUpload($(obj));
                });
            },
            MultipleUpload: function MultipleUpload(obj) {
                app.loadCss("plug/photo/photo.css");
                require.async("plug/photo/photo.js", function(photo) {
                    photo.initMultipleUpload($(obj));
                });
            },
            //加载js
            getScript: function getScript(url, callblack, versions) {
                url = app.params.plugUrl + url;
                var key = app.base64_encode(url);
                var content = app.params.urlCache[key] || app.cache().get(key);
                var data = {
                    randCode: app.getVersions()
                };
                // if (versions === false) {
                //     var data = {};
                // }
                if (app.params.urlCache[key] && versions === false) {
                    typeof callblack == "function" ? callblack() : "";
                    return false;
                }
                if (content) {
                    eval(content);
                    typeof callblack == "function" ? callblack() : "";
                } else {
                    app.ajax({
                        type: "GET",
                        dataType: "script",
                        data: data,
                        success: callblack,
                        url: url,
                        cache: true
                    });
                }
            },
            ajax: function ajax(params) {
                params = params ? params : {};
                var ajaxTimeoutTest = $.ajax({
                    url: params["url"],
                    type: params["type"],
                    dataType: params["dataType"],
                    data: params["data"],
                    cache: false,
                    timeout: 1e4,
                    beforeSend: function beforeSend() {
                        app.showLoad();
                    },
                    success: function success(result) {
                        var success = params["success"];
                        typeof success == "function" ? success(result) : "";
                    },
                    complete: function complete(msg, status) {
                        // console.log(msg.response);
                        app.hideLoad();
                        if (status == "timeout") {
                            //超时,status还有success,error等值的情况                       　　　　　
                            ajaxTimeoutTest.abort();
                            app.alert("由于网络原因，请求超时，请刷新网页试试");
                        }
                        if (params["cache"]) {
                            var key = app.base64_encode(params["url"]);
                            var result = msg.response;
                            app.params.urlCache[key] = result;
                            app.cache().set(key, result);
                        }
                    },
                    error: function error(XMLHttpRequest, textStatus, errorThrown) {
                        app.saveLog(errorThrown);
                        console.log(errorThrown);
                    }
                });
            },
            //保存错误日志
            saveLog: function saveLog(msg) {
                app.alert(msg);
            },
            //轮播图
            swiper: function swiper(id) {
                //app.loadCss("plug/Swiper-3.3.1/swiper.css");
                app.getScript("plug/Swiper-3.3.1/swiper-3.4.1.jquery.min.js", function() {
                    var swiper = new window.Swiper("#" + id, {
                        pagination: "#" + id + " .swiper-pagination",
                        //nextButton: '#swiper_<{$data.name}> .swiper-button-next',
                        //prevButton: '#swiper_<{$data.name}> .swiper-button-prev',
                        loop: true,
                        spaceBetween: 30,
                        centeredSlides: true,
                        autoplay: 5e3
                    });
                }, false);
            },
            //页面切换
            swiperPage: function swiperPage(id, callblack) {
                //  app.loadCss("plug/Swiper-3.3.1/swiper.css");
                app.getScript("plug/Swiper-3.3.1/swiper-3.4.1.jquery.min.js", function() {
                    //绑定滚动事件,记住滚动位置
                    // var swiperH=$(id).attr("swiperH");
                    // var swiperT=$(id).attr("swiperT");
                    var pageContent = $(id).parents(".page-content");
                    var swiperWrap = $(id + "-container");
                    $(swiperWrap).find(".swiperTap").find(".active").addClass("scrollActive");
                    $(pageContent).scroll(function(event) {
                        var swiperIndex = $(swiperWrap).find(".swiperTap").find(".scrollActive");
                        var scrollTop = $(this).scrollTop();
                        var scroll = $(swiperIndex).attr("scroll");
                        if (scroll != "0") {
                            $(swiperIndex).attr("scrollTop", scrollTop);
                        }
                    });
                    var swiper = new window.Swiper(id, {
                        pareanContainer: id + "-container",
                        //autoHeight:true,
                        onTransitionStart: function onTransitionStart(swiper) {
                            var pageContent = $(id).parents(".page-content");
                            $(pageContent).addClass("overflowhidden");
                            $(swiperWrap).find(".swiperTap li").attr("scroll", "0");
                        },
                        onTransitionEnd: function onTransitionEnd(swiper) {
                            var activeIndex = swiper.activeIndex;
                            var swiperWrap = $(id + "-container");
                            $(swiperWrap).find(".swiperTap li").removeClass("scrollActive");
                            $(swiperWrap).find(".swiperTap").find("li").eq(activeIndex).addClass("scrollActive");
                            $(swiperWrap).find(".swiperTap li").attr("scroll", "1");
                            $(pageContent).removeClass("overflowhidden");
                        },
                        onSlideChangeEnd: function onSlideChangeEnd(swiper) {
                            var activeIndex = swiper.activeIndex;
                            var swiperWrap = $(id + "-container");
                            var scrollTop = $(swiperWrap).find(".swiperTap li").eq(activeIndex).attr("scrollTop");
                            $(id).parents(".page-content").scrollTop(scrollTop);
                            $(pageContent).removeClass("overflowhidden");
                        },
                        onSlideChangeStart: function onSlideChangeStart(swiper) {
                            var activeIndex = swiper.activeIndex;
                            var slideActive = $(id).find(".swiper-slide").eq(activeIndex);
                            $(id).find(".swiper-slide").addClass("swiper-slide-hide");
                            slideActive.removeClass("swiper-slide-hide");
                            var load = slideActive.attr("load");
                            var name = slideActive.attr("name");
                            if (load != 1 && name) {
                                app.routePage(name, slideActive, 1);
                                slideActive.attr("load", 1);
                            }
                            var swiperWrap = $(id + "-container");
                            $(swiperWrap).find(".swiperTap li").removeClass("active");
                            $(swiperWrap).find(".swiperTap li").eq(activeIndex).addClass("active");
                            //alert(callblack);
                            //滚动到原来位置
                            // alert($(slideActive).height());
                            //$(id).height(($(slideActive).height()));
                            callblack ? callblack(swiper) : "";
                        },
                        onTouchMove: function onTouchMove(swiper, e) {
                            var activeIndex = swiper.activeIndex;
                            var container = $(id + "-container");
                            var transform = $(container).find(".swiper-wrapper").css("transform");
                            var w = swiper.width;
                            var li_w = $(container).find(".swiperTap li").eq(activeIndex).width();
                            if (typeof transform == "string" && transform && transform.indexOf("translate3d(") == "0") {
                                if (transform.indexOf("translate3d(") == "0") {
                                    var transforms = transform.substring(13).split(",");
                                    var transformsW = Number(transforms[0].replace(/px/g, ""));
                                    var transform_x = (transformsW - activeIndex * w) / w * li_w;
                                }
                            } else {
                                return false;
                            }
                            $(container).parents(".page").find(".nav-tab-fix li").eq(activeIndex).find(".swiperTapLine").css("left", transform_x + "px");
                            if ($(container).parents(".page").find(".nav-tab-fix li").length) {
                                $(container).find(".swiperTap li").eq(activeIndex).find(".swiperTapLine").css("left", transform_x + "px");
                            }
                        },
                        onTouchEnd: function onTouchEnd(swiper, e) {
                            var container = $(id + "-container");
                            var activeIndex = swiper.activeIndex;
                            $(container).find(".swiperTap li").find(".swiperTapLine").css("left", "0px");
                            if ($(container).parents(".page").find(".nav-tab-fix li").length) {
                                $(container).parents(".page").find(".nav-tab-fix li").find(".swiperTapLine").css("left", "0px");
                            }
                        }
                    });
                    //绑定点击事件
                    var length = $(id).find(".swiper-slide").length;
                    $(id + "-container").find(".swiperTap li").click(function(event) {
                        var index = $(this).index();
                        if (length > index) {
                            swiper.slideTo(index);
                        }
                    });
                    if ($(id + "-container").parents(".page").find(".nav-tab-fix li").length) {
                        $(id + "-container").parents(".page").find(".nav-tab-fix li").click(function(event) {
                            var index = $(this).index();
                            if (length > index) {
                                swiper.slideTo(index);
                            }
                        });
                    }
                }, false);
            },
            /*
             * Javascript base64_encode() base64加密函数
             用于生成字符串对应的base64加密字符串
             * 吴先成  www.51-n.com ohcc@163.com QQ:229256237
             * @param string str 原始字符串
             * @return string 加密后的base64字符串
             */
            base64_encode: function base64_encode(str) {
                var c1, c2, c3;
                var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var i = 0, len = str.length, string = "";
                while (i < len) {
                    c1 = str.charCodeAt(i++) & 255;
                    if (i == len) {
                        string += base64EncodeChars.charAt(c1 >> 2);
                        string += base64EncodeChars.charAt((c1 & 3) << 4);
                        string += "==";
                        break;
                    }
                    c2 = str.charCodeAt(i++);
                    if (i == len) {
                        string += base64EncodeChars.charAt(c1 >> 2);
                        string += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
                        string += base64EncodeChars.charAt((c2 & 15) << 2);
                        string += "=";
                        break;
                    }
                    c3 = str.charCodeAt(i++);
                    string += base64EncodeChars.charAt(c1 >> 2);
                    string += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
                    string += base64EncodeChars.charAt((c2 & 15) << 2 | (c3 & 192) >> 6);
                    string += base64EncodeChars.charAt(c3 & 63);
                }
                return string;
            },
            /*
             * Javascript base64_decode() base64解密函数
             用于解密base64加密的字符串
             * 吴先成  www.51-n.com ohcc@163.com QQ:229256237
             * @param string str base64加密字符串
             * @return string 解密后的字符串
             */
            base64_decode: function base64_decode(str) {
                var c1, c2, c3, c4;
                var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
                var i = 0, len = str.length, string = "";
                while (i < len) {
                    do {
                        c1 = base64DecodeChars[str.charCodeAt(i++) & 255];
                    } while (i < len && c1 == -1);
                    if (c1 == -1) break;
                    do {
                        c2 = base64DecodeChars[str.charCodeAt(i++) & 255];
                    } while (i < len && c2 == -1);
                    if (c2 == -1) break;
                    string += String.fromCharCode(c1 << 2 | (c2 & 48) >> 4);
                    do {
                        c3 = str.charCodeAt(i++) & 255;
                        if (c3 == 61) return string;
                        c3 = base64DecodeChars[c3];
                    } while (i < len && c3 == -1);
                    if (c3 == -1) break;
                    string += String.fromCharCode((c2 & 15) << 4 | (c3 & 60) >> 2);
                    do {
                        c4 = str.charCodeAt(i++) & 255;
                        if (c4 == 61) return string;
                        c4 = base64DecodeChars[c4];
                    } while (i < len && c4 == -1);
                    if (c4 == -1) break;
                    string += String.fromCharCode((c3 & 3) << 6 | c4);
                }
                return string;
            },
            //缓存
            cache: function cache(v) {
                var versions = v ? v : app.getVersions();
                var cacheFun = {
                    set: function set(key, data) {
                        var value;
                        key = key + "_" + versions;
                        if ((typeof data === "undefined" ? "undefined" : _typeof(data)) == "object") {
                            data = JSON.stringify(data);
                            value = "obj-" + data;
                        } else {
                            value = "str-" + data;
                        }
                        try {
                            localStorage.setItem(key, value);
                        } catch (err) {
                            if (err.name == "QuotaExceededError") {
                                localStorage.clear();
                                //如果缓存已满则清空
                                localStorage.setItem(key, value);
                            }
                        }
                    },
                    rm: function rm(key) {
                        key = key + "_" + versions;
                        localStorage.removeItem(key);
                    },
                    get: function get(key) {
                        key = key + "_" + versions;
                        var value = localStorage.getItem(key);
                        if (value == null) {
                            return null;
                        }
                        var type = value.substr(0, 4);
                        if (type == "str-") {
                            return value.substr(4);
                        }
                        if (type == "obj-") {
                            var data = value.substr(4);
                            return $.parseJSON(data);
                        }
                    },
                    clear: function clear() {
                        localStorage.clear();
                    }
                };
                return cacheFun;
            },
            //微信默认分享
            wxDefShare: function wxDefShare(params) {
                app.wxJs(function() {
                    if (typeof params == "undefined") {
                        var wxShareData = {
                            title: "跟着普象君有肉吃",
                            // 分享标题
                            imgUrl: "https://www.lgstatic.com/thumbnail_300x300/image1/M00/00/47/Cgo8PFTUXOOAbTbtAAA-0t30W6k220.jpg",
                            // 分享图标
                            desc: "等你好久了，终于来了"
                        };
                    } else {
                        wxShareData = params;
                    }
                    app.wxShare(wxShareData);
                });
            },
            // get vue vm
            getVm: function getVm(name) {
                if (typeof name == "string") {
                    name = "modules/" + name;
                    var seaMod = seajs.Module.get(require.resolve(name));
                    return seaMod && seaMod.exports && seaMod.exports.vm;
                } else {
                    return null;
                }
            },
            //提醒
            notification: function notification() {
                var UserInfo = app.getUserInfo();
                var args = {};
                if (UserInfo && UserInfo.uuid) {
                    args.uuid = UserInfo.uuid;
                }
                $.getJSON(app.params.apiDomain + "/BoxApi/Events/notification", args, function(data) {
                    if (data.all > 0) {
                        $(".notification-all").show();
                    } else {
                        $(".notification-all").hide();
                    }
                    if (data.comment > 0) {
                        $(".notification-comment").css("display", "inline-block");
                    } else {
                        $(".notification-comment").hide();
                    }
                    if (data.goods > 0) {
                        $(".notification-goods").css("display", "inline-block");
                    } else {
                        $(".notification-goods").hide();
                    }
                });
            },
            notificationRead: function notificationRead(obj) {
                var UserInfo = app.getUserInfo();
                var uuid = "";
                if (UserInfo && UserInfo.uuid) {
                    uuid = UserInfo.uuid;
                }
                var type = $(obj).attr("data-type");
                var id = $(obj).attr("data-id");
                var from_user_id = $(obj).attr("from-user-id");
                $.get(app.params.apiDomain + "/BoxApi/Events/notificationRead", {
                    id: id,
                    type: type,
                    from_user_id: from_user_id,
                    uuid: uuid
                });
            },
            //点赞
            add_goods: function add_goods(id, callblack) {
                app.showLoad();
                app.get("/BoxSns/Home/Index/add_goods", {
                    id: id
                }, function(data) {
                    app.hideLoad();
                    if (data.error == 1) {
                        app.alert(data.msg);
                    } else {
                        var msg = data.msg == "add" ? "得到赞一杯，开心" : "居然不爱我了，伤心";
                        app.alert(msg);
                    }
                    callblack ? callblack(data) : "";
                });
            }
        };
        $.extend(true, app, fun);
        return app;
    };
    module.exports = app;
});
