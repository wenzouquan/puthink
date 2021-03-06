/*! puthink 2017-05-30 */
/*! puthink 2017-05-30 */
"use strict";

define("./dist/modules/add", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    mounted: 0,
                    publish_text: "确认发布",
                    is_publish: 0,
                    content: "",
                    type: "events",
                    disablePublish: "disable"
                };
            },
            el: "#pageAdd",
            created: function created() {
                this.pid = this.$route.params.pid;
                var user_info = app.getUserInfo();
                this.user_info = user_info ? user_info : {};
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                $("#pageAdd").find('[data-type="upload"]').each(function(i, _this) {
                    app.MultipleUpload(_this);
                });
                this.mounted = 1;
                //app.setTitle(this.);
                // app.get()
                var _this = this;
                //监听上传图片
                // $('#pageAdd').find('[data-type="upload"]').on("BoxUpload", function() {
                //         _this.checkPublish();
                //     });
                //监听text
                app.setTitle(this.$route.params.title);
            },
            methods: {
                checkPublish: function checkPublish(e) {
                    // var imglength = $("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    if (this.content) {
                        this.disablePublish = "";
                    } else {
                        this.disablePublish = "disable";
                    }
                },
                publish: function publish() {
                    var _this = this;
                    var liLength = $("#pageAdd").find(".photoList-content li").length;
                    var imglength = $("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    var limit = liLength - imglength - 1;
                    if (this.content === "" && imglength > 0) {
                        app.alert("请先添加你的感想...");
                        return false;
                    }
                    // if (this.content !== "" && imglength === 0) {
                    //     app.alert("请添加至少一张图片");
                    //     return false;
                    // }
                    if (_this.is_publish === 1) {
                        return;
                    }
                    if (limit > 0) {
                        app.confirm({
                            text: "还有" + limit + "张图片正在上传中，是否确认提交？",
                            yes: function yes() {
                                _this.publishYes();
                            }
                        });
                    } else {
                        _this.publishYes();
                    }
                },
                publishYes: function publishYes() {
                    var _this = this;
                    if (_this.is_publish === 1) {
                        return;
                    }
                    _this.publish_text = "发布中....";
                    _this.is_publish = 1;
                    var data = $("#pageAdd").find("form").serializeArray();
                    app.post("/BoxSns/Home/Index/addTopic", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            //console.log(res);
                            // console.log(typeof(pageIndex));
                            var pageIndexMv = app.getVm("index");
                            if (typeof pageIndexMv != "undefined") {
                                var list = [ res.msg ];
                                pageIndexMv.items = list.concat(pageIndexMv.items);
                            }
                            app.alert("恭喜你，发布成功", function() {
                                _this.$router.push({
                                    name: "index"
                                });
                            });
                        }
                        //_this.is_publish=0;
                        _this.publish_text = "发布成功";
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/addComment", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    item: {},
                    publish_text: "确认提交",
                    pid: 0,
                    type: "events",
                    content: "",
                    placeholder: "",
                    is_publish: 0,
                    comment_id: 0
                };
            },
            el: "#pageAddComment",
            created: function created() {
                this.fetchData();
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    this.placeholder = _this.$route.params.placeholder;
                    this.pid = _this.$route.params.pid;
                    this.comment_id = _this.$route.params.comment_id;
                },
                publish: function publish() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    _this.publish_text = "发布中....";
                    _this.is_publish = 1;
                    var data = $("#pageAddComment").find("form").serializeArray();
                    app.post("/BoxSns/Home/Index/do_comment", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            var topicId = _this.pid;
                            var indexVm = app.getVm("index");
                            var items = indexVm ? indexVm.items : "";
                            //首页列评论数加1
                            if (items) {
                                items = $.map(items, function(one) {
                                    if (one.id == topicId) {
                                        one.comment_count++;
                                    }
                                    return one;
                                });
                            }
                            //首页列表点赞数结束
                            app.alert("恭喜你，回复成功", function() {
                                // if (document.referrer === "") {
                                //     _this.$router.push({ name: 'topic', params: { id: _this.$route.params.pid } });
                                // } else {
                                //     _this.$router.go(-1);
                                // }
                                _this.$router.go(-1);
                            });
                        }
                        _this.publish_text = "确认发布";
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

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

"use strict";

define("./dist/modules/component", [], function(require, exports, module) {
    Vue.component("component-topic-list", {
        template: "#component-topic-list",
        props: [ "items" ],
        data: function data() {
            return {
                items: {}
            };
        },
        created: function created() {
            app.wxJs();
        },
        updated: function updated() {
            var pageContent = $(".pageShow").find(".page-content");
            var picLazyLoadScroll = function picLazyLoadScroll() {
                var imgs = $(".topic-one").find('[lazyLoadPic="true"]');
                var imgDisplay = function imgDisplay(img) {
                    var offsetTop = $(img).parents(".topic-one").position().top;
                    var ScrollTop = pageContent.scrollTop();
                    return offsetTop - ScrollTop;
                };
                app.picLazyLoad(imgs, imgDisplay);
            };
        },
        methods: {
            add_goods: function add_goods(em) {
                var vm = this;
                var obj = $(em.currentTarget);
                var id = $(obj).attr("data-id");
                var items = vm.items;
                app.add_goods(id, function(data) {
                    if (data.error > 0) {
                        return;
                    }
                    items = $.map(items, function(item) {
                        if (item.id == id) {
                            if (data.msg == "add") {
                                item.has_good = 1;
                                item.good_count++;
                                item.goods_count++;
                            } else {
                                item.has_good = 0;
                                item.good_count--;
                                item.goods_count--;
                            }
                        }
                        return item;
                    });
                });
            },
            share: function share(em) {
                var obj = $(em.currentTarget);
                var url = "http://" + window.location.host + "/#/topic/" + $(obj).attr("id") + "?form=share";
                app.showLoad();
                var params = {
                    title: $(obj).attr("title"),
                    // 分享标题
                    link: url,
                    // 分享链接
                    imgUrl: $(obj).attr("imgUrl"),
                    // 分享图标
                    desc: $(obj).attr("desc") ? $(obj).attr("desc") : $(obj).attr("title"),
                    success: function success() {
                        // 用户确认分享后执行的回调函数
                        app.wxDefShare();
                    },
                    cancel: function cancel() {}
                };
                app.wxShare(params, function() {
                    $(".pageShow").append('<div id="shareDiv"  onclick="$(this).remove()"></div>');
                    app.hideLoad();
                });
            }
        }
    });
    //注册组件 , 轮播图片
    Vue.component("component-swiper", {
        template: "#component-swiper",
        props: [ "id" ],
        data: function data() {
            return {
                items: {}
            };
        },
        mounted: function mounted() {
            //this.fetchData()
            var vm = this;
            app.get("/BoxApi/Events/swiper", {
                id: this.id
            }, function(data) {
                vm.items = data ? data : {};
                setTimeout(function() {
                    if ($("#" + vm.id).find(".item").length > 1) {
                        app.swiper(vm.id);
                    }
                }, 10);
            });
        },
        updated: function updated() {
            var vm = this;
            var imgs = $("#" + vm.id).find(".swiper-slide img");
            $.each(imgs, function(index, el) {
                $(el).attr("src", $(el).attr("data-original"));
            });
        },
        methods: {
            imgLoad: function imgLoad(e) {}
        }
    });
});

"use strict";

define("./dist/modules/eventAward", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    items2: [],
                    event: "",
                    mounted: 0,
                    page: 1,
                    page2: 1,
                    showType: "list",
                    type: this.$route.params.type,
                    swiperH: 0,
                    swiperT: 0,
                    load2: 0,
                    showMore: 0,
                    showMoreText: 0,
                    imgHeight: "height:" + $(window).width() / 3 + "px",
                    expire_date_limit: 0,
                    expire_date: {
                        d: 0,
                        h: 0,
                        m: 0,
                        s: 0
                    },
                    showOrder: 0,
                    orderBy: 2,
                    itemsload: 0,
                    items2load: 0
                };
            },
            el: "#pageEventAward",
            created: function created() {
                this.fetchData();
                this.setTitle();
            },
            mounted: function mounted() {
                var _this = this;
                if (_this.mounted == 1) {
                    return;
                }
                //  //分页
                app.pager(function() {
                    if (_this.page > 1 || _this.page2 > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                _this.mounted = 1;
                //滚动
                $("#pageEventAward").find("#s_top").hide();
                $("#pageEventAward").find(".page-content").scroll(function(event) {
                    var scrollTop = $(this).scrollTop();
                    // if(scrollTop>100){
                    //    $("#pageIndex").find("#s_top").show();
                    // }else{
                    //    $("#pageIndex").find("#s_top").hide();
                    // }
                    var bannerH = $("#pageEventAward").find(".banner").height();
                    if (scrollTop > bannerH) {
                        $("#pageEventAward").find("#s_top").show();
                    } else {
                        $("#pageEventAward").find("#s_top").hide();
                    }
                });
                $("#pageEventAward").click(function(event) {
                    _this.showOrder = 0;
                });
            },
            methods: {
                setTitle: function setTitle() {
                    if (this.event && this.event.topic) {
                        app.setTitle(this.event.topic);
                    }
                },
                fetchData: function fetchData() {
                    var _this = this;
                    var page = this.type == "awards" ? _this.page : _this.page2;
                    if (page === "") {
                        return;
                    }
                    app.get("/BoxApi/Events/topic", {
                        type: this.type,
                        pid: this.$route.params.id,
                        p: page,
                        orderBy: this.orderBy
                    }, function(data) {
                        if (_this.event === "") {
                            _this.event = data.event;
                            _this.event.show_info = _this.cutString(_this.event.info, 34);
                            if (_this.event.info.length <= 34) {
                                _this.showMoreText = 1;
                            }
                            _this.setTitle();
                            _this.expire_date_limit = data.event.expire_date_limit;
                            _this.GetRTime();
                            if (window.setIntervalObj) {
                                clearInterval(window.setIntervalObj);
                            }
                            window.setIntervalObj = setInterval(_this.GetRTime, 1e3);
                        }
                        var list = data.list ? data.list : [];
                        var page = data.pager ? data.pager.nextPage : "";
                        if (_this.type == "all") {
                            //所有
                            _this.items2load = 1;
                            if (_this.page2 == 1) {
                                _this.items2 = list;
                            } else {
                                _this.items2 = _this.items2.concat(list);
                            }
                            _this.page2 = page;
                            _this.load2 = 1;
                        } else {
                            //获奖用户
                            _this.itemsload = 1;
                            if (_this.page == 1) {
                                _this.items = list;
                            } else {
                                _this.items = _this.items.concat(list);
                            }
                            _this.page = page;
                        }
                        app.params.loadPage = 0;
                    });
                },
                changeShowOrder: function changeShowOrder(e) {
                    this.showOrder = !this.showOrder;
                    //alert(this.showOrder);
                    e.stopPropagation();
                },
                changeOrder: function changeOrder(orderId) {
                    this.type == "awards" ? this.page = 1 : this.page2 = 1;
                    this.orderBy = orderId;
                    $("#pageEventAward").find(".orderList-li").removeClass("active");
                    $("#pageEventAward").find(".order-ico-" + orderId).addClass("active");
                    // $("#pageEventAward .topic-list img").attr("lazyloadpic","true");
                    this.fetchData();
                },
                showMoreFuc: function showMoreFuc() {
                    this.showMore = !this.showMore;
                },
                s_top: function s_top(e) {
                    var speed = 200;
                    //滑动的速度
                    //alert($("#pageIndex").find('.page-content').scrollTop())
                    $("#pageEventAward").find(".page-content").scrollTop(0);
                },
                /**参数说明：
                 * 根据长度截取先使用字符串，超长部分追加…
                 * str 对象字符串
                 * len 目标字节长度
                 * 返回值： 处理结果字符串
                 */
                cutString: function cutString(str, len) {
                    //length属性读出来的汉字长度为1
                    if (str.length <= len) {
                        return str;
                    }
                    var s = str.substring(0, len) + "...";
                    return s;
                },
                changeShowType: function changeShowType(_this) {
                    this.showType = this.showType == "list" ? "table" : "list";
                },
                GetRTime: function GetRTime() {
                    var _this = this;
                    var t = _this.expire_date_limit;
                    if (t >= 0) {
                        _this.expire_date.d = Math.floor(t / 60 / 60 / 24);
                        _this.expire_date.h = Math.floor(t / 60 / 60 % 24);
                        _this.expire_date.m = Math.floor(t / 60 % 60);
                        _this.expire_date.s = Math.floor(t % 60);
                        _this.expire_date_limit--;
                        $("#pageEventAward").find(".bottom-fixed").removeClass("disable");
                    } else {
                        clearInterval(window.setIntervalObj);
                        $("#pageEventAward").find(".bottom-fixed").addClass("disable");
                        this.event.id = "";
                    }
                }
            }
        }).$mount("#app");
    };
    controller.pageShow = function() {
        var _this = controller.vm;
        app.swiperPage("#swiper-page-EventAward", function(swiper) {
            var index = swiper.activeIndex;
            _this.type = $("#swiper-page-EventAward-container").find(".swiperTap li").eq(index).attr("type");
            if (_this.load2 == "0" && _this.type == "all") {
                _this.fetchData();
            }
        });
        _this.setTitle();
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/events", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    swiper_id: "swiper-index",
                    mounted: 0
                };
            },
            el: "#pageEvents",
            created: function created() {
                this.fetchData();
            },
            updated: function updated() {
                var epicLazyLoadScroll = function epicLazyLoadScroll() {
                    var imgs = $("#pageEvents .events").find("[lazyloadpic='true']");
                    var imgDisplay = function imgDisplay(img) {
                        var offsetTop = $(img).parents(".events-one").position().top;
                        var ScrollTop = $("#pageIndex").find(".page-content").scrollTop();
                        return offsetTop - ScrollTop;
                    };
                    app.picLazyLoad(imgs, imgDisplay);
                };
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    var activeName = $("#swiper-page-index-container .swiperTap .active").attr("name");
                    if (_this.page > 1 && activeName === "events") {
                        app.params.loadPage = 1;
                        _this.loadEventList();
                    }
                });
                this.mounted = 1;
            },
            methods: {
                fetchData: function fetchData() {
                    this.loadEventList();
                },
                loadEventList: function loadEventList() {
                    var _this = this;
                    app.get("/BoxApi/Events/eventList", {
                        p: this.page
                    }, function(data) {
                        data = data ? data : {};
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/index", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function(params) {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    events: {},
                    items: [],
                    page: 1,
                    mounted: 0,
                    swiper_id: "swiper-index",
                    expire_date_limit: 0,
                    expire_date: {
                        d: 0,
                        h: 0,
                        m: 0,
                        s: 0
                    },
                    swiperT: 0,
                    swiperH: 0,
                    bannerH: 44,
                    setShowNavFix: 0,
                    timeShowNavFix: "",
                    showOrder: 0,
                    orderBy: 2,
                    itemsload: 0,
                    enableOrderBy: 1
                };
            },
            el: "#pageIndex",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                var _this = this;
                //分页
                app.pager(function() {
                    var activeName = $("#swiper-page-index-container .swiperTap .active").attr("name");
                    if (_this.page > 1 && activeName === "index") {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                this.mounted = 1;
                $("#pageIndex").on("pageShow", function(e, params) {
                    app.swiperPage("#swiper-page-index", function(e) {
                        _this.enableOrderBy = e.activeIndex == 1 ? 0 : 1;
                    });
                });
                //top 监听 page-content  scroll
                $("#pageIndex").find("#s_top").hide();
                $("#pageIndex").find(".nav-tab-fix").hide();
                $("#pageIndex").find(".page-content").scroll(function(event) {
                    var scrollTop = $(this).scrollTop();
                    _this.showNavFix(scrollTop);
                });
                $("#pageIndex").click(function(event) {
                    _this.showOrder = 0;
                });
            },
            methods: {
                setIntervalScrollTop: function setIntervalScrollTop() {
                    var _this = this;
                    var time = 0;
                    if (_this.setShowNavFix === 0) {
                        _this.timeShowNavFix = setInterval(function() {
                            var scrollTop = $("#pageIndex").find(".page-content").scrollTop();
                            _this.showNavFix(scrollTop);
                            console.log(scrollTop);
                            time++;
                            $("#app-title").html(Number(scrollTop) + time);
                        }, 1);
                        _this.setShowNavFix = 1;
                        setTimeout(function() {
                            clearInterval(_this.timeShowNavFix);
                            _this.setShowNavFix = 0;
                        }, 2e3);
                    }
                },
                showNavFix: function showNavFix(scrollTop) {
                    var bannerH = $("#pageIndex").find(".banner").height() + 8;
                    // var swiperTap=$("#pageIndex").find(".swiperTap").clone(true)
                    if (scrollTop > bannerH) {
                        $("#pageIndex").find("#s_top").show();
                        $("#pageIndex").find(".nav-tab-fix").show();
                    } else {
                        $("#pageIndex").find("#s_top").hide();
                        $("#pageIndex").find(".nav-tab-fix").hide();
                    }
                },
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/index", {
                        p: this.page,
                        orderBy: this.orderBy
                    }, function(data) {
                        if (_this.page == 1) {
                            _this.events = data.event;
                            _this.expire_date_limit = data.event.expire_date_limit;
                            _this.GetRTime();
                            _this.setIntervalObj = setInterval(_this.GetRTime, 1e3);
                            _this.eventDetail();
                        }
                        var list = data.list ? data.list : [];
                        if (_this.page == 1) {
                            _this.items = list;
                        } else {
                            _this.items = _this.items.concat(list);
                        }
                        _this.itemsload = 1;
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                },
                //第一次进来显示活动介绍
                eventDetail: function eventDetail() {
                    var events = this.events;
                    var userEventsId = app.cache(app.params.userVersions).get("userEventsId");
                    // console.log(userEventsId);
                    if (!(events && events.id)) {
                        return;
                    }
                    if (this.expire_date_limit < 0) {
                        return;
                    }
                    if (!userEventsId || Number(userEventsId) > 0 && events.id != userEventsId) {
                        app.cache(app.params.userVersions).set("userEventsId", events.id);
                        $("#pageIndex").find(".popupBg").show();
                        $("#pageIndex").find(".eventsDialog").show();
                    }
                },
                hideEventsDialog: function hideEventsDialog() {
                    $("#pageIndex").find(".popupBg").hide();
                    $("#pageIndex").find(".eventsDialog").hide();
                },
                changeShowOrder: function changeShowOrder(e) {
                    this.showOrder = !this.showOrder;
                    e.stopPropagation();
                },
                changeOrder: function changeOrder(orderId) {
                    this.s_top();
                    this.page = 1;
                    this.orderBy = orderId;
                    $("#pageIndex").find(".orderList-li").removeClass("active");
                    $("#pageIndex").find(".order-ico-" + orderId).addClass("active");
                    // $("#pageIndex .topic-list img").attr("lazyloadpic","true");
                    this.fetchData();
                },
                s_top: function s_top(e) {
                    var speed = 200;
                    //滑动的速度
                    //alert($("#pageIndex").find('.page-content').scrollTop())
                    $("#pageIndex").find(".page-content").scrollTop(0);
                },
                GetRTime: function GetRTime() {
                    var _this = this;
                    var t = _this.expire_date_limit;
                    if (t >= 0) {
                        _this.expire_date.d = Math.floor(t / 60 / 60 / 24);
                        _this.expire_date.h = Math.floor(t / 60 / 60 % 24);
                        _this.expire_date.m = Math.floor(t / 60 % 60);
                        _this.expire_date.s = Math.floor(t % 60);
                        _this.expire_date_limit--;
                        $("#pageIndex").find(".bottom-fixed").removeClass("disable");
                    } else {
                        clearInterval(_this.setIntervalObj);
                        $("#pageIndex").find(".bottom-fixed").addClass("disable");
                        this.events.id = "";
                    }
                }
            }
        }).$mount("#app");
    };
    controller.pageShow = function() {
        app.swiperPage("#swiper-page-index", function(e) {
            controller.vm.enableOrderBy = e.activeIndex == 1 ? 0 : 1;
            $("#pageIndex .swiperTap li").removeClass("active");
            if (e.activeIndex === 1) {
                $("[name='events']").addClass("active");
            } else {
                $("[name='index']").addClass("active");
            }
        });
    };
    module.exports = controller;
});

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

"use strict";

define("./dist/modules/router", [], function(require, exports, module) {
    var Router = new VueRouter({
        routes: [ {
            path: "/",
            name: "index",
            page: "cache",
            title: "普象•一起玩"
        }, {
            path: "/topic/:id",
            name: "topic",
            title: "详情"
        }, {
            path: "/add/:pid/:title",
            name: "add"
        }, {
            path: "/addComment/:pid/:comment_id/:placeholder",
            name: "addComment",
            title: "添加评论"
        }, {
            path: "/events",
            name: "events"
        }, {
            path: "/eventAward/:id/:type",
            name: "eventAward"
        }, {
            path: "/user/index",
            name: "user/index",
            title: "一起玩•我的"
        }, {
            path: "/user/topic/:type/:user_id",
            name: "user/topic"
        }, {
            path: "/user/awards/:user_id",
            name: "user/awards",
            title: "我的奖品"
        }, {
            path: "/user/address",
            name: "user/address",
            title: "修改地址"
        }, {
            path: "/user/feedback",
            name: "user/feedback",
            title: "问题反馈"
        }, {
            path: "/user/events/:user_id",
            name: "user/events",
            title: "参与的活动"
        }, {
            path: "/user/goods/:user_id",
            name: "user/goods",
            title: "收到的赞"
        }, {
            path: "/user/home/:user_id",
            name: "user/home",
            title: "Ta的主页"
        }, {
            path: "/user/comment/:user_id",
            name: "user/comment",
            title: "收到的评论"
        } ]
    });
    module.exports = Router;
});

"use strict";

define("./dist/modules/topic", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    item: {
                        user: {},
                        events: {}
                    },
                    good_text: "点赞",
                    publish_text: "确认提交",
                    placeholder: "",
                    commentList: [],
                    pager: {},
                    name: "moduleTopic",
                    page: 1,
                    mounted: 0,
                    user_info: {}
                };
            },
            el: "#pageTopic",
            created: function created() {
                this.fetchData();
                this.user_info = app.getUserInfo();
                app.wxJs();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.loadComment();
                    }
                });
                this.mounted = 1;
                $("#pageTopic").find(".page-content").scroll(function(event) {
                    var scrollTop = $(this).scrollTop();
                    var bannerH = 35;
                    if (scrollTop > bannerH) {
                        $("#pageTopic").find(".topic-head").addClass("user-nav-tab-fix");
                    } else {
                        $("#pageTopic").find(".topic-head").removeClass("user-nav-tab-fix");
                    }
                });
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    this.placeholder = this.$route.params.placeholder;
                    app.get("/BoxApi/Events/topicDetail", {
                        id: _this.$route.params.id
                    }, function(data) {
                        if (data && data.id) {
                            _this.item = data;
                            _this.good_text = data.has_good ? "已赞" : "点赞";
                        }
                    });
                    this.loadComment();
                },
                loadComment: function loadComment() {
                    //评论列表
                    var _this = this;
                    app.get("/BoxApi/Events/comment", {
                        id: _this.$route.params.id,
                        p: this.page
                    }, function(data) {
                        if (data.list) {
                            var list = data.list ? data.list : [];
                            _this.commentList = _this.commentList.concat(list);
                            _this.page = data.pager ? data.pager.nextPage : "";
                            app.params.loadPage = 0;
                        }
                    });
                },
                showAddComment: function showAddComment() {
                    var placeholder = "回复" + this.item.user.nickname + "(楼主)";
                    var comment_id = 0;
                    this.$router.push({
                        name: "addComment",
                        params: {
                            pid: this.$route.params.id,
                            comment_id: comment_id,
                            placeholder: placeholder
                        }
                    });
                },
                delTopic: function delTopic() {
                    var pid = this.$route.params.id;
                    var _this = this;
                    app.confirm({
                        text: "确认删除帖子吗？",
                        yes: function yes() {
                            app.get("/BoxSns/Home/Index/del_topic", {
                                id: pid
                            }, function(data) {
                                if (data.error == "0") {
                                    $("[topic-item='" + pid + "']").hide();
                                    app.alert("恭喜你，删除成功");
                                    _this.$router.go(-1);
                                } else {
                                    app.alert(data.msg);
                                }
                            });
                        }
                    });
                },
                share: function share(em, shareDiv) {
                    var obj = $(em.currentTarget);
                    var url = "http://" + window.location.host + "/#/topic/" + $(obj).attr("id");
                    app.showLoad();
                    var params = {
                        title: $(obj).attr("title"),
                        // 分享标题
                        link: url,
                        // 分享链接
                        imgUrl: $(obj).attr("imgUrl"),
                        // 分享图标
                        desc: $(obj).attr("desc") ? $(obj).attr("desc") : $(obj).attr("title"),
                        success: function success() {
                            // 用户确认分享后执行的回调函数
                            app.wxDefShare();
                        },
                        cancel: function cancel() {}
                    };
                    // console.log(params);
                    app.wxShare(params, function() {
                        if (shareDiv !== 0) {
                            $(".pageShow").append('<div id="shareDiv"  onclick="$(this).remove()"></div>');
                            app.hideLoad();
                        }
                    });
                },
                previewImage: function previewImage(_this) {
                    var obj = $(_this.currentTarget);
                    var imgs = $(obj).parent(".img-list").find("img");
                    var urls = [];
                    $(imgs).each(function(index, el) {
                        urls.push($(el).attr("src"));
                    });
                    app.wx(function(wx) {
                        wx.previewImage({
                            current: $(obj).find("src"),
                            urls: urls
                        });
                    });
                },
                add_goods: function add_goods(id) {
                    var indexVm = app.getVm("index");
                    var items = indexVm ? indexVm.items : "";
                    var vm = this;
                    var item = vm.item;
                    var goodLists = item.goodList;
                    app.add_goods(id, function(data) {
                        if (data.error > 0) {
                            return;
                        }
                        var user = app.getUserInfo();
                        //当前页点赞数变化
                        if (data.msg == "add") {
                            item.has_good = 1;
                            item.good_count++;
                            item.goods_count++;
                            //点赞头像减加一个
                            goodLists.push({
                                user: user,
                                user_id: user.user_id
                            });
                        } else {
                            item.has_good = 0;
                            item.good_count--;
                            item.goods_count--;
                            //点赞头像减少一个
                            vm.item.goodList = $.grep(goodLists, function(one, v) {
                                if (one.user_id == user.user_id) {
                                    console.log(one);
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        }
                        //首页列表点赞数
                        if (items) {
                            items = $.map(items, function(one) {
                                if (item.id == id) {
                                    if (data.msg == "add") {
                                        one.has_good = 1;
                                        one.good_count++;
                                        one.goods_count++;
                                    } else {
                                        one.has_good = 0;
                                        one.good_count--;
                                        one.goods_count--;
                                    }
                                }
                                return one;
                            });
                        }
                    });
                },
                handle: function handle(em) {
                    var _this = this;
                    var obj = $(em.currentTarget);
                    var id = $(obj).attr("data-id");
                    var user_id = $(obj).attr("data-user-id");
                    var topic_user_id = this.item.user_id;
                    var pid = this.item.id;
                    var placeholder = "@" + $(obj).attr("data-nickname");
                    var params = [ {
                        text: "回应"
                    } ];
                    var user_info = app.getUserInfo();
                    if (user_info.user_id == topic_user_id || user_id == user_info.user_id) {
                        var param = [ {
                            text: "删除"
                        } ];
                        params = params.concat(param);
                    }
                    app.handle(params);
                    //回应
                    $("#handle .handle-options-one").eq("0").click(function(event) {
                        _this.$router.push({
                            name: "addComment",
                            params: {
                                pid: pid,
                                comment_id: id,
                                placeholder: placeholder
                            }
                        });
                    });
                    //删除
                    $("#handle .handle-options-one").eq("1").click(function(event) {
                        var comment_id = id;
                        app.hide_popup();
                        app.confirm({
                            text: "确认删除这条评论吗？",
                            yes: function yes() {
                                app.get("/BoxSns/Home/Index/del_comment", {
                                    comment_id: comment_id
                                }, function(data) {
                                    if (data.error == "0") {
                                        $(".comment-list").find("[data-id='" + comment_id + "']").hide();
                                        _this.item.comment_count--;
                                        var indexVm = app.getVm("index");
                                        var items = indexVm ? indexVm.items : "";
                                        //首页列评论数减少1
                                        if (items) {
                                            items = $.map(items, function(one) {
                                                if (one.id == _this.item.id) {
                                                    one.comment_count--;
                                                }
                                                return one;
                                            });
                                        }
                                        app.alert("恭喜你，删除成功");
                                    } else {
                                        app.alert(data.msg);
                                    }
                                });
                            }
                        });
                    });
                }
            }
        }).$mount("#app");
    };
    // controller.pageShow=function(){
    //      var em ={};
    //      em.currentTarget = $("#pageTopic").find(".topic-share");
    //      controller.vm.share(em,0);
    // }
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/address", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function(params) {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    user_info: {},
                    publish_text: "确认保存",
                    is_publish: 0
                };
            },
            el: "#pageUserAddress",
            created: function created() {
                this.fetchData();
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    var user_info = app.getUserInfo();
                    this.user_info = user_info ? user_info : {};
                },
                saveAddress: function saveAddress() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    app.showLoad();
                    _this.publish_text = "保存中....";
                    _this.is_publish = 1;
                    var data = $("#pageUserAddress").find("form").serializeArray();
                    app.post("/BoxApi/Events/address", data, function(res, textStatus, xhr) {
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            //app.getUserInfo("",1);//重新加载个人信息
                            if (res.userInfo) {
                                _this.user_info.name = res.userInfo.name;
                                _this.user_info.phone = res.userInfo.phone;
                                _this.user_info.address = res.userInfo.address;
                                app.setUserInfo(_this.user_info);
                            }
                            // console.log(_this.user_info);
                            app.alert("恭喜你，地址保存成功", function() {
                                _this.$router.go(-1);
                            });
                        }
                        app.hideLoad();
                        _this.is_publish = 0;
                        _this.publish_text = "确认保存";
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/awards", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserAwards",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                this.mounted = 1;
                var s = "我";
                if (this.$route.params.user_id > 0) {
                    s = "Ta";
                }
                app.setTitle(s + "的奖品");
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/userAwards", {
                        p: this.page,
                        user_id: this.user_id
                    }, function(data) {
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/comment", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserComment",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                if (this.$route.params.user_id > 0) {
                    app.setTitle("Ta收到的评论");
                }
                //分页
                var _this = this;
                app.pager(function() {
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                this.mounted = 1;
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/myComment", {
                        p: this.page,
                        user_id: this.user_id
                    }, function(data) {
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/events", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserEvents",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                this.mounted = 1;
                if (this.$route.params.user_id > 0) {
                    app.setTitle("Ta参与的活动");
                }
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/userEvents", {
                        p: this.page,
                        user_id: this.user_id
                    }, function(data) {
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/feedback", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    user_info: {},
                    publish_text: "确认提交",
                    is_publish: 0,
                    mounted: 0
                };
            },
            el: "#pageUserFeedback",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                $("#pageUserFeedback").find('[data-type="upload"]').each(function(i, _this) {
                    app.MultipleUpload(_this);
                });
                this.mounted = 1;
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                },
                save: function save() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    // var liLength=$("#pageAdd").find(".photoList-content li").length;
                    // var imglength=$("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    // var limit= liLength-imglength-1;
                    _this.publish_text = "提交中....";
                    _this.is_publish = 1;
                    var data = $("#pageUserFeedback").find("form").serializeArray();
                    app.post("/BoxApi/Events/feedback", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            app.alert("谢谢你反馈，我们会尽快处理", function() {
                                _this.$router.go(-1);
                            });
                        }
                        _this.is_publish = 0;
                        _this.publish_text = "确认提交";
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/goods", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_info: {},
                    toTitle: "赞了您",
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserGoods",
            created: function created() {
                this.fetchData();
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                if (this.$route.params.user_id > 0) {
                    this.toTitle = "赞了Ta";
                }
                //分页
                var _this = this;
                app.pager(function() {
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                this.mounted = 1;
                if (this.$route.params.user_id > 0) {
                    app.setTitle("Ta收到的赞");
                }
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/userGoods", {
                        p: _this.page,
                        user_id: this.user_id
                    }, function(data) {
                        if (!data) {
                            data = {};
                        }
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/home", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: {},
                    user_info: {},
                    userStatistics: {},
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserHome",
            created: function created() {
                this.fetchData();
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/getUserInfo", {
                        user_id: this.user_id
                    }, function(data) {
                        _this.user_info = data;
                    });
                    app.get("/BoxApi/Events/userStatistics", {
                        user_id: this.user_id
                    }, function(data) {
                        _this.userStatistics = data;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/index", [ "router" ], function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: {},
                    user_info: {},
                    user_id: 0,
                    userStatistics: {},
                    mounted: 0
                };
            },
            el: "#pageUserIndex",
            created: function created() {
                this.fetchData();
                var _this = this;
            },
            mounted: function mounted() {
                var _this = this;
                if (_this.mounted == 1) {
                    return;
                }
                $("#pageUserIndex").on("pageShow", function(e, params) {
                    _this.user_info = app.getUserInfo();
                });
                this.mounted = 1;
            },
            methods: {
                contactUs: function contactUs(e) {
                    var params = [ {
                        text: '<a href="tel://18521082085">拨打电话</a>'
                    } ];
                    app.handle(params);
                },
                fetchData: function fetchData() {
                    var _this = this;
                    _this.user_info = app.getUserInfo();
                    app.get("/BoxApi/Events/userStatistics", function(data) {
                        _this.userStatistics = data;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

"use strict";

define("./dist/modules/user/topic", [ "router" ], function(require, exports, module) {
    var router = require("router");
    // var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function data() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id
                };
            },
            el: "#pageUserTopic",
            created: function created() {
                this.fetchData();
                var _this = this;
            },
            mounted: function mounted() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    console.log(_this.page);
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                var s = "我";
                if (this.$route.params.user_id > 0) {
                    s = "Ta";
                }
                if (_this.$route.params.type == "publish") {
                    app.setTitle(s + "发布过的");
                } else if (_this.$route.params.type == "myGoods") {
                    app.setTitle(s + "赞过的");
                } else if (_this.$route.params.type == "myComments") {
                    app.setTitle(s + "评论过的");
                }
                this.mounted = 1;
            },
            methods: {
                fetchData: function fetchData() {
                    var _this = this;
                    app.get("/BoxApi/Events/topic", {
                        type: this.$route.params.type,
                        p: this.page,
                        user_id: this.user_id
                    }, function(data) {
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });
                }
            }
        }).$mount("#app");
    };
    module.exports = controller;
});

/*! puthink 2017-05-30 */
define("./dist/template/add", [], function(require, exports, module) {
    return '<div class="page-content">    <form method="post">        <div class="wrap">            <div class="wrap-add bw">                <input type="hidden" name="pid" v-model=pid value="{{pid}}">                <input type="hidden" name="type" v-model=type value="{{type}}">                <textarea name="content" v-on:keyup="checkPublish($event)" v-model="content" maxlength="500" placeholder="添加你的感想..."></textarea>                <div data-type="upload" upload="3"></div>            </div>            <div class="wrap-add-tip" v-if="user_info.address==null || user_info.address==\'\'" >                您的地址很有可能没有正确填写，请在我的页面中进行修改，以确保在您获奖时普象客服可以联系到您。            </div>        </div>        <div style="height:50px"></div>    </form></div><div class="bottom-fixed">    <div :class="disablePublish">        <a v-on:click="publish($event)" class="btn publish-btn">{{publish_text}}</a>    </div></div>';
});

define("./dist/template/addComment", [], function(require, exports, module) {
    return '<!-- 留言 或者 回复 --><div class="page-content"><form  method="post">    <div class="wrap">     <div class="wrap-add bw" >          <input type="hidden" name="pid" v-model=pid value="{{pid}}">          <input type="hidden" name="type" v-model=type value="{{type}}">          <input type="hidden" name="to_comment_id" v-model=comment_id value="{{comment_id}}">         <textarea name="content" maxlength="500" v-model="content" :placeholder="placeholder"></textarea>     </div>           </div>    <div style="height:50px"></div></form></div> <div class="bottom-fixed">        <div >             <a v-on:click="publish($event)"  class="btn publish-btn">{{publish_text}}</a>        </div>    </div> <!-- 留言 或者 回复 --> ';
});

define("./dist/template/component", [], function(require, exports, module) {
    return '<!-- 帖子列表 --><script type="text/x-template" id="component-topic-list">    <div>        <div class="topic-one bw" :topic-item="item.id"   v-for="item in items">            <div class="topic-head">                <div class="user-ico fl">                    <div class="user-award" v-if="item.is_best==1"></div>                    <router-link :to="{ name: \'user/home\', params: { user_id: item.user_id }}"> <img lazyLoadPic="true" onerror="this.src=\'/dist/images/errorImg.png\'" :src="item.user.headimg"></router-link>                </div>                <div class="user-info fl">                    <span class="fs-12">{{item.user.nickname}}</span>                    <br><span class="light-color fs-10">{{item.time_tran}} 发布</span>                </div>                <div class="topic-share fr" :title="item.title" :id="item.id" :imgUrl="item.coverImage" v-on:click="share($event)">             <i class="ico ico_share"></i>                <span class="light-color-2">分享</span></div>                <div class="clearfix"></div>            </div>                       <router-link :to="{ name: \'topic\', params: { id: item.id }}">                <div class="topic-content">                                       <div class="img-list" v-if="item.imgList.length">                        <template v-for="image in item.imgList">                            <img lazyLoadPic="true" onerror="this.src=\'/dist/images/errorImg.png\'" :src="image+\'?x-oss-process=image/resize,m_fill,h_300,w_300\'">                        </template>                    </div>                    <div v-html="item.title" class="img-text fs-14"> </div>                </div>            </router-link>            <div class="topic-act">                <div :data-good="item.goods_count"  :topic-goods="item.id" :class="item.has_good?\'active\':\'\'" :data-id="item.id" v-on:click="add_goods($event)">                    <i class="ico-goods"></i>                    <span class="light-color-2"><font>{{item.goods_count!=0?item.goods_count:""}}</font> 赞</span>                </div>                <router-link :to="{ name: \'topic\', params: { id: item.id }}"><i class="ico ico_comment mgl12"></i> <span class="light-color-2"><font  :data-count="item.comment_count" :topic-comment="item.id">{{item.comment_count}}</font> 评论</span></router-link>                 <router-link :to="{ name: \'topic\', params: { id: item.id }}">                  <i class="ico ico_hit mgl12"></i> <span class="light-color-2"><font>{{item.hit_count}}</font> 阅读</span></router-link>            </div>        </div>    </div></script><!-- 轮播图片 --><script type="text/x-template" id="component-swiper">    <div class="swiper-container" data-type="swiper" id="swiper-index">        <div class="swiper-wrapper">            <div class="item swiper-slide" v-for="item in items">                <a :href="item.url" target="_blank">                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"  style="width:100%; max-height:150px" :data-original="item.picUrl+\'?x-oss-process=image/resize,w_500\'">                </a>            </div>        </div>        <!-- 如果需要分页器 -->        <div class="swiper-pagination"></div>    </div></script><!-- loading --><script type="text/x-template" id="component-loader"> <div class="loader loader--style1" title="0">  <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"   width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">  <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946    s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634    c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>  <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0    C22.32,8.481,24.301,9.057,26.013,10.047z">    <animateTransform attributeType="xml"      attributeName="transform"      type="rotate"      from="0 20 20"      to="360 20 20"      dur="0.5s"      repeatCount="indefinite"/>    </path>  </svg></div></script> ';
});

define("./dist/template/eventAward", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">        <div class="banner eventsBanner">            <img :src="event.picUrl">            <div class="events-join">参与人数                <br><span><font>{{event.topic_count}}</font>人</span></div>                <div class="banner-info" v-if="showMore==0">                    <div class="banner-info-title"> #{{event.title}}#</div>                    <div class="banner-info-i">{{event.show_info}} <a v-if="showMoreText==0" v-on:click="showMoreFuc()">更多</a></div>                </div>                 <div class="banner-info banner-info-more" v-if="showMore==1">                    <div class="banner-info-title"> #{{event.title}}#</div>                    <div class="banner-info-i"> {{event.info}} <a v-on:click="showMoreFuc()">收起</a></div>                </div>        </div>                   <div id="swiper-page-EventAward-container">            <ul class="nav-tab nav-tab-3 bw swiperTap rel">                <li :class="type==\'awards\'?\'active\':\'\'" type="awards">                    <a>获奖用户<div class="swiperTapLine"></div></a>                </li>                <li :class="type==\'all\'?\'active\':\'\'" type="all">                    <a>查看所有<div class="swiperTapLine"></div></a>                </li>                <li class="fr" v-on:click="changeShowType($event)">                                       <template v-if="showType==\'table\'"><i class="ico ico_table_on"></i></template>                    <template v-else><i class="ico ico_table"></i></template>                </li>                <li class="fr" v-on:click="changeShowOrder($event)">                    <span></span>                  <template v-if="showOrder==\'1\'"><i class="ico ico_sort"></i></template>                    <template v-else><i class="ico ico_sort_on"></i></template>                                    </li>                <div class="orderList" :style="showOrder==\'1\'?\'\':\'display:none\'">                          <div class="orderListTitle">排序</div>                          <div v-on:click="changeOrder(1)" data-id="1" class="orderList-li order-ico-1">点赞最多</div>                          <div v-on:click="changeOrder(2)" class="orderList-li order-ico-2 active">时间正序</div>                          <div v-on:click="changeOrder(3)" class="orderList-li order-ico-3">时间倒序</div>                          <div v-on:click="changeOrder(4)" class="orderList-li order-ico-4">评论最多</div>                </div>    <div class="clearfix"></div>                <div class="clearfix"></div>            </ul>            <div class="swiper-container" id="swiper-page-EventAward" :swiperT="swiperT" :swiperH="swiperH">                <div class="swiper-wrapper">                    <div class="item swiper-slide" load=1  style="min-height: 300px">                                        <div class="errormsgDiv" v-if="itemsload && items.length==0">                            <p class="errormsg">（￣︶￣）/</p>                            <p class="errormsg2">获奖用户还在激动评选中</p>                            <p class="errormsg2">快去点个赞吧</p>                            <div style="height:44px"></div>                    </div>                        <!-- 参与活动列表 -->                        <div :class="showType==\'list\'?\'topic-list\':\'topic-list none\'">                            <component-topic-list :items="items"></component-topic-list>                            <div class="clearfix"></div>                             <div style="height:44px"></div>                        </div>                        <!-- 参与活动列表 -->                        <!-- 参与活动列表2 -->                        <div :class="showType==\'table\'?\'topic-list2\':\'topic-list2 none\'">                            <template v-for="item in items">                                <router-link :to="{ name: \'topic\', params: { id: item.id }}">                                    <img onerror="this.src=\'/dist/images/errorImg.png\'" :src="item.coverImage+\'?x-oss-process=image/resize,m_fill,h_300,w_300\'">                                </router-link>                            </template>                            <div class="clearfix"></div>                             <div style="height:44px"></div>                        </div>                                                <!-- 参与活动列表2 -->                    </div>                    <div class="item swiper-slide" style="min-height: 300px">                                        <div class="errormsgDiv" v-if="items2load && items2 && items2.length==0">                            <p class="errormsg">（￣︶￣）/</p>                            <p class="errormsg2">当前还没有人发布帖子</p>                            <p class="errormsg2">你来发布一条吧</p>                    </div>                        <!-- 参与活动列表 -->                        <div :class="showType==\'list\'?\'topic-list\':\'topic-list none\'">                            <component-topic-list :items="items2"></component-topic-list>                             <div class="clearfix"></div>                             <div style="height:44px"></div>                        </div>                        <!-- 参与活动列表 -->                        <!-- 参与活动列表2 -->                        <div :class="showType==\'table\'?\'topic-list2\':\'topic-list2 none\'">                            <template v-for="item in items2">                                <router-link :style="imgHeight"  :to="{ name: \'topic\', params: { id: item.id }}">                                    <img   onerror="this.src=\'/dist/images/errorImg.png\'" :src="item.coverImage+\'?x-oss-process=image/resize,m_fill,h_300,w_300\'">                                </router-link>                            </template>                            <div class="clearfix"></div>                             <div style="height:44px"></div>                        </div>                        <!-- 参与活动列表2 -->                                             </div>                </div>            </div>        </div>    </div></div><div id="s_top" v-on:click="s_top($event)" ><i class="ico ico_top"></i><div class="s_top_text">回到顶部</div></div><!-- 我要参与 disable--><div class="bottom-fixed disable">    <div class="" >        <div class="fl rest-text fs-10 " style="margin-top:9px">            当前活动            <br>结束还有        </div>        <div class="fl rest-time" style="margin-top:9px"><span class="rest-day">{{expire_date.d}}</span><span class="rest-text fs-8"> 天 </span><span class="rest-but">{{expire_date.h}}</span><span class="rest-text fs-8"> 小时 </sapn><span class="rest-but">{{expire_date.m}}</span><span class="rest-text fs-8"> 分 </span></div>        <div class="fr">            <router-link :to="{ name: \'add\', params: { pid: event.id ,title:event.topic}}" class="join-btn"></router-link>        </div>    </div></div>';
});

define("./dist/template/events", [], function(require, exports, module) {
    return '<div class="page-content">     <div class="wrap">        <div class="banner">            <component-swiper :id="swiper_id"></component-swiper>        </div>        <ul class="nav-tab bw">            <li > <router-link :to="{ name: \'index\'}" >当前活动</a></li>            <li class="active"><router-link :to="{ name: \'events\'}" >历史活动</a></li>            <div class="clearfix"></div>        </ul>        <!-- 历史活动列表 -->       <div class="ajaxPageContent">          <div class="events ">            <template v-for="item in items">              <router-link :to="{ name: \'eventAward\', params: { id: item.id ,type:\'awards\'}}" class="events-one bw">                 <div class="events-join">参与人数<br><span><font>{{item.topic_count}}</font>人</span></div>                 <div class="events-join-text"></div>                   <img lazyLoadPic="true" :src="item.picUrl+\'?x-oss-process=image/resize,w_500\'">                 <div class="events-info"><span>#{{item.title}}#</span> {{item.showInfo}}</div>              </router-link>            </template>          </div>           <div style="height:60px"></div>       </div>        <!-- 活动列表 -->    </div> </div> ';
});

define("./dist/template/index", [], function(require, exports, module) {
    return '<!-- 首页 --><ul class="nav-tab bw swiperTap nav-tab-3 nav-tab-fix">    <li class="active" name="index">        <a>当前活动            <div class="swiperTapLine"></div>        </a>    </li>    <li name="events">        <a>全部活动             <div class="swiperTapLine"></div>        </a>    </li>      <li v-if="enableOrderBy==1" class="fr" v-on:click="changeShowOrder($event)">                    <span></span>                    <template v-if="showOrder==\'1\'"><i class="ico ico_sort"></i></template>                    <template v-else><i class="ico ico_sort_on"></i></template>                                    </li>                <div class="orderList" :style="showOrder==\'1\'?\'\':\'display:none\'">                          <div class="orderListTitle">排序</div>                          <div v-on:click="changeOrder(1)" class="orderList-li order-ico-1">点赞最多</div>                          <div v-on:click="changeOrder(2)" class="orderList-li order-ico-2 active">时间正序</div>                          <div v-on:click="changeOrder(3)" class="orderList-li order-ico-3">时间倒序</div>                          <div v-on:click="changeOrder(4)" class="orderList-li order-ico-4">评论最多</div>                    </div>    <div class="clearfix"></div></ul><div class="page-content">    <div class="wrap">        <!-- 轮播图片 -->        <div class="banner">            <component-swiper :id="swiper_id"></component-swiper>        </div>        <div id="swiper-page-index-container">            <ul class="nav-tab nav-tab-3 bw swiperTap rel">                <li class="active" name="index">                    <a>当前活动                        <div class="swiperTapLine"></div>                    </a>                </li>                <li name="events">                    <a>全部活动                         <div class="swiperTapLine"></div>                    </a>                </li>                <li v-if="enableOrderBy==1" class="fr" v-on:click="changeShowOrder($event)">                    <span></span>                 <template v-if="showOrder==\'1\'"><i class="ico ico_sort"></i></template>                    <template v-else><i class="ico ico_sort_on"></i></template>                                    </li>                <div v-if="enableOrderBy==1" class="orderList" :style="showOrder==\'1\'?\'\':\'display:none\'">                          <div class="orderListTitle">排序</div>                          <div v-on:click="changeOrder(1)" data-id="1" class="orderList-li order-ico-1">点赞最多</div>                          <div v-on:click="changeOrder(2)" class="orderList-li order-ico-2 active">时间正序</div>                          <div v-on:click="changeOrder(3)" class="orderList-li order-ico-3">时间倒序</div>                          <div v-on:click="changeOrder(4)" class="orderList-li order-ico-4">评论最多</div>                    </div>                <div class="clearfix"></div>            </ul>            <div class="swiper-container" id="swiper-page-index" :swiperT="swiperT" :swiperH="swiperH">                <div class="swiper-wrapper">                    <div class="item swiper-slide" load=1 name="index" style="min-height: 300px">                     <div class="errormsgDiv" v-if="itemsload && items && items.length==0">                            <p class="errormsg">（￣︶￣）/</p>                            <p class="errormsg2">当前还没有人发布帖子</p>                            <p class="errormsg2">你来发布一条吧</p>                    </div>                        <!-- 参与活动列表 -->                        <div class="topic-list">                            <component-topic-list :items="items"></component-topic-list>                        </div>                        <!-- 参与活动列表 -->                         <div style="height:44px"></div>                    </div>                    <div class="item swiper-slide" name="events" style="min-height: 300px">                    </div>                </div>            </div>        </div>    </div>   </div><div id="s_top" v-on:click="s_top($event)" ><i class="ico ico_top"></i><div class="s_top_text">回到顶部</div></div><!-- 我要参与 disable--><div class="bottom-fixed disable">    <div class="" >        <div class="fl rest-text fs-10 " style="margin-top:9px">            当前活动            <br>结束还有        </div>        <div class="fl rest-time" style="margin-top:9px"><span class="rest-day">{{expire_date.d}}</span><span class="rest-text fs-8"> 天 </span><span class="rest-but">{{expire_date.h}}</span><span class="rest-text fs-8"> 小时 </sapn><span class="rest-but">{{expire_date.m}}</span><span class="rest-text fs-8"> 分 </span></div>        <div class="fr">            <router-link :to="{ name: \'add\', params: { pid: events.id ,title:events.topic}}" class="join-btn"></router-link>        </div>    </div></div><div class="popupBg" style="display: none;"></div><div class="eventsDialog">    <div class="eventsDialogImg"><img :src="events.picUrl?events.picUrl+\'?x-oss-process=image/resize,w_500\':\'\'" style="width: 100%; max-height:150px"></div>    <div class="eventsDialogtitle">        <p class="eventsDialogtitle1">活动正在进行中</p>        <p class="eventsDialogtitle2">{{events.title}}</p>    </div>    <div class="eventsDialogDetail">        {{events.info}}    </div>    <div class="eventsDialogbottom" v-on:click="hideEventsDialog($event)" >知道了</div></div>';
});

define("./dist/template/topic", [], function(require, exports, module) {
    return '<div class="wrap bw" style="padding-top:8px">    <div class="topic-head userTopicFix">        <div class="user-ico fl">            <router-link :to="{ name: \'user/home\', params: { user_id: item.user_id }}"> <img :src="item.user.headimg"></router-link>        </div>        <div class="user-info fl">            <span class="fs-12">{{item.user.nickname}}</span>            <br><span class="light-color fs-10">{{item.time_tran}} 发布</span>        </div>        <div class="topic-share fr" :title="item.title" :id="item.id" :imgUrl="item.coverImage" v-on:click="share($event)"><i class="ico ico_share"></i><span class="light-color-2">分享</span></div>        <div class="clearfix"></div>    </div>    <div class="clearfix"></div></div><div class="page-content">    <div class="wrap" style="margin-top:29px">        <!-- 参与活动列表 -->        <div class="topic-detail">            <div class="topic-one bw" style="padding-top:0px">                <div class="topic-content ">                    <div class="img-list">                        <template v-for="image in item.imgList">                            <img v-on:click="previewImage($event)" :src="image+\'?x-oss-process=image/resize,w_1000\'">                        </template>                    </div>                    <div v-html=\'item.content\' class="img-text fs-14"> </div>                </div>                <!-- 点赞人数 -->                <div  :class="item.goods_count >0?\'topic-act\':\'topic-act none\' " id="goodListDiv" >                                                          <template v-for="image in item.goodList">                        <img v-if="image && image.user" :src="image.user.headimg" :data-id="image.user.user_id">                    </template>                                       <span class="light-color-2">等                    <font class="red" v-if="item.goods_count<99">{{item.goods_count}}</font>                    <font class="red" v-if="item.goods_count>99">99+</font>                    人点赞</span>                </div>                <!-- 点赞人数 -->            </div>        </div>        <!-- 参与活动列表 -->        <!-- 评论列表 -->        <div class="comment-list bw" v-if="commentList.length">            <div class="comment-title">评论（{{item.comment_count}}）</div>            <div class="comment-one" :data-id="vo.id" :data-user-id="vo.user_id" :data-nickname="vo.user.nickname" v-on:click="handle($event)" v-for="vo in commentList">                <div class="comment-head">                    <div class="user-ico fl" style="margin-top:4px">                        <img :src="vo.user.headimg">                    </div>                    <div class="user-info fl" style="margin-top:7px">                        <span class="fs-12">{{vo.user.nickname}} <template v-if="vo.user_id == item.user_id">（楼主）</template></span>                    </div>                    <div class="topic-share fr"><span class="light-color fs-10">{{vo.time_tran}}</span></div>                    <div class="clearfix"></div>                </div>                <div class="comment-content">                    <template v-if="vo.comment"><a>@{{vo.comment.user.nickname}}</a></template><span v-html="vo.content"></span></div>            </div>        </div>    </div>    <div style="height:50px"></div></div>  <router-link v-if="item.events.expire_date_limit >0" :to="{ name: \'index\'}" id="s_top2" >    <i class="ico ico_to_evenst"></i>    <div class="s_top_text">前往活动</div></router-link> <template v-else>      <router-link :to="{ name: \'eventAward\', params: { id: item.pid ,type:\'awards\'}}" id="s_top2" >   <i class="ico ico_to_evenst"></i>    <div class="s_top_text">前往活动</div></router-link> </template><!-- 我要参与 --><div class="bottom-fixed">    <div class="">        <ul class="fl topic-bnts" style="margin-top:8px;">            <li :data-id="item.id" v-on:click="add_goods(item.id)">                <div :class="item.has_good?\'active\':\'\'"><i class="ico-goods"></i>                  <span class="good_text">{{good_text}}</span>                </div>                             </li>            <li v-on:click="showAddComment($event)">             <i class="ico ico_comment" style=" margin-top: 0px;    width: 18px;height: 18px; margin-left: 3px; margin-bottom: 3px"></i>                <br><span>留言</span></li>            <li class="delete" v-if="user_info.user_id == item.user_id && item.is_best !=1" v-on:click="delTopic($event)">              <i class="ico ico_delete" style=" margin-top: 0px;    width: 18px;height: 18px; margin-left: 3px; margin-bottom: 3px"></i>                <br><span>删除</span></li>        </ul>        <div class="fr" v-if="item.events.expire_date_limit>0">            <router-link :to="{ name: \'add\',params:{pid:item.pid,title:item.events.topic}}" class="join-btn"></router-link>        </div>    </div></div>';
});

define("./dist/template/user/address", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">     <form class="wrap-address bw">        <div class="address-input">            <label class="input-name fl ">收货人</label>            <textarea style="padding-top:16px;" maxlength="11" class="address-input" :value="user_info.name"  name="name"></textarea>            <div class="clearfix"></div>        </div>         <div class="address-input">            <label class="input-name fl ">手机号码</label>            <textarea style="padding-top:16px;" maxlength="11" class="address-input" :value="user_info.phone"  name="phone"></textarea>             <div class="clearfix"></div>        </div>         <div class="address-input">            <label class="input-name fl ">收货地址</label><textarea style="padding-top:16px;" maxlength="100" class="address-input" :value="user_info.address"  name="address"></textarea>             <div class="clearfix"></div>        </div>            </form>           </div>    <div style="height:50px"></div>    <!-- 我要参与 -->    <div class="bottom-fixed">    	<div >    		<a v-on:click="saveAddress($event)"  class="btn publish-btn">{{publish_text}}</a>    	</div>    </div> </div>';
});

define("./dist/template/user/awards", [], function(require, exports, module) {
    return '<div class="page-content">     <div class="wrap goods">        <div class="media bw" v-for="item in items">                    <div class="media-body" style="margin-left:0px">                    <div class="fl mgt5">                        <p >{{item.events.awards}}</p>                        <span class="light-color">{{item.events.title}}</span>                    </div>                    <div class="arrow-right fr mgt10"></div>                    <div class="fr pic">                        <img :attrs="item.events.picUrl" :src="item.events.picUrl+\'?x-oss-process=image/resize,m_fill,h_100,w_100\'">                    </div>                     <div class="clearfix"></div>                    <div class="line" ></div>                </div>                <div class="clearfix"></div>                </div>     </div></div>';
});

define("./dist/template/user/comment", [], function(require, exports, module) {
    return '<div class="page-content" style="background:#fff">    <div class="wrap comment" >        <template v-for="item in items">        <router-link  onclick="app.notificationRead(this)" data-type="comment" :from-user-id="user_id" :data-id="item.pid"  class="media bw" :to="{ name: \'topic\', params: { id: item.pid }}" >                <div class="media-ico user-ico fl mgt5">                    <img :src="item.user.headimg">                   </div>                <div class="media-body">                    <div class="mgt5">                        <div style="padding-right: 40px;">                        <span class="fl">{{item.user.nickname}}</span><span class="fr light-color">                        <div v-if="item.remind == 1 && user_id==0" class="tag-new">new</div>                        {{item.time_tran}}</span>                         <div class="clearfix"></div>                        </div>                        <p class="overHidden" style="padding-right:30px">{{item.content}}</p>                    </div>                    <div class="arrow-right fr mgt10"></div>                     <div class="clearfix"></div>                   <div class="line"></div>                </div>                <div class="clearfix"></div>                        </router-link >          <div class="clearfix"></div></template>    </div></div>';
});

define("./dist/template/user/events", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">        <!-- 历史活动列表 -->        <div class="events ">          <template v-for="item in items">            <router-link :to="{ name: \'eventAward\', params: { id: item.id ,type:\'awards\'}}" class="events-one bw">               <div class="events-join">参与人数<br><span><font>{{item.topic_count}}</font>人</span></div>               <div class="events-join-text"></div>                 <img :src="item.picUrl">               <div class="events-info"><span>#{{item.title}}#</span> {{item.showInfo}}</div>            </router-link>          </template>                  </div>               <!-- 活动列表 -->    </div>  </div>';
});

define("./dist/template/user/feedback", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">     <form class="wrap-add bw">         <textarea name="msg" placeholder="感谢您对普象活动的支持，请问您有什么问题或建议吗？欢迎提给我们，谢谢！另外，请留下您的任一联系方式，方便我们联系到您。"></textarea>         <!-- <ul class="add-img">             <li><img src="/dist/images/Artboard@2x.png"></li>         </ul> -->            <div data-type="upload" upload="3"></div>     </form>           </div>    <div style="height:50px"></div>    <!-- 我要参与 -->   </div> <div class="bottom-fixed">        <div >            <a v-on:click="save($event)"  class="btn publish-btn">{{publish_text}}</a>        </div>    </div>';
});

define("./dist/template/user/goods", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap goods"><template v-for="item in items">        <router-link onclick="app.notificationRead(this)" data-type="goods" :from-user-id="user_id" :data-id="item.topic.id" class="media bw" :to="{ name: \'topic\', params: { id: item.topic.id }}" >                <div class="media-ico user-ico fl mgt5">                    <img :src="item.user.headimg">                   </div>                <div class="media-body">                    <div class="fl mgt5">                        <p >{{item.user.nickname}}</p>                        <span class="light-color">{{toTitle}} | {{item.time_tran}}</span>                    </div>                                        <div class="arrow-right fr mgt10"></div>                    <div class="fr pic">                        <img :src="item.topic.coverImage+\'?x-oss-process=image/resize,m_fill,h_300,w_300\'">                    </div>                     <span  v-if="item.remind == 1 && user_id==0" class="tag-new fr mgt10">new</span>                     <div class="clearfix"></div>                    <div class="line" ></div>                </div>                <div class="clearfix"></div>                        </router-link ></template>       </div></div>';
});

define("./dist/template/user/home", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">     <a class="user-header bw">            <div class="user-header-in">                <div class="user-ico fl">                    <img :src="user_info.headimg">                </div>                <div class="user-info" style="margin-top:10px">                    <p class="fs-16">{{user_info.nickname}}</p>                </div>                <div class="clearfix"></div>            </div>        </a>         <div class="user-statistics bw">        <router-link :to="{ name: \'user/events\',params: { user_id: user_id }}">                <span>{{userStatistics.events}}</span>                <p>参与的活动</p>        </router-link>            <router-link :to="{ name: \'user/goods\',params: { user_id: user_id }}">                <span>{{userStatistics.receiveGoods}}</span>                <p>收到的赞</p>            </router-link>            <router-link :to="{ name: \'user/comment\',params: { user_id: user_id }}">                <span>{{userStatistics.receiveGomments}}</span>                <p>收到的评论</p>             </router-link>            <div class="clearfix"></div>        </div>        <div class="user-memu bw">            <router-link :to="{ name: \'user/topic\', params: { type: \'publish\',user_id: user_id  }}">                <div class="ico fl"><img src="/dist/images/inc13.png"></div>                <div class="user-memu-content" style="border-bottom:1px solid #EEE">                    <div class="user-memu-text fl">Ta发布过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.topic}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </router-link>            <div class="clearfix"></div>          <router-link :to="{ name: \'user/topic\', params: { type: \'myGoods\',user_id: user_id  }}">                <div class="ico fl"><img src="/dist/images/ico14.png"></div>                <div class="user-memu-content">                    <div class="user-memu-text fl">Ta赞过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.goods}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>             </router-link>             <div class="clearfix"></div>           <router-link :to="{ name: \'user/topic\', params: { type: \'myComments\' ,user_id: user_id  }}">                <div class="ico fl"><img src="/dist/images/ico13.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl">Ta评论过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.comments}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>           </router-link>        </div>        <div class="user-memu bw">           <router-link :to="{ name: \'user/awards\' , params: { user_id: user_id }}">                <div class="ico fl"><img src="/dist/images/ico11.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl">Ta的奖品</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.awards}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </router-link>        </div>     </div>    </div>';
});

define("./dist/template/user/index", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">     <router-link :to="{ name: \'user/address\'}" class="user-header bw">            <div class="user-header-in">                <div class="user-ico fl">                    <img :src="user_info.headimg">                </div>                <div class="user-info">                    <p class="fs-16">{{user_info.nickname}}</p>                    <p v-if="user_info.address==null || user_info.address==\'\'" class="overHidden red">请填写您的联系方式</p>                    <p  v-if="user_info.address" class="overHidden">{{user_info.address}}</p>                </div>                <div class="arrow-right fr"></div>                <div class="clearfix"></div>            </div>        </router-link>         <div class="user-statistics bw">        <router-link :to="{ name: \'user/events\' ,params:{ user_id: user_id }}">                <span>{{userStatistics.events}}</span>                <p>参与的活动</p>        </router-link>            <router-link :to="{ name: \'user/goods\' ,params:{ user_id: user_id }}">                <span>{{userStatistics.receiveGoods}}<i class="notification-userStatistics notification-goods"></i></span>                <p>收到的赞</p>            </router-link>            <router-link :to="{ name: \'user/comment\' ,params:{ user_id: user_id }}">                <span>{{userStatistics.receiveGomments}}<i class="notification-userStatistics notification-comment"></i></span>                <p>收到的评论</p>             </router-link>            <div class="clearfix"></div>        </div>        <div class="user-memu bw">            <router-link :to="{ name: \'user/topic\', params: { type: \'publish\' , user_id: user_id}}">                <div class="ico fl"><img src="/dist/images/inc13.png"></div>                <div class="user-memu-content" style="border-bottom:1px solid #EEE">                    <div class="user-memu-text fl">我发布过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.topic}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </router-link>            <div class="clearfix"></div>          <router-link :to="{ name: \'user/topic\', params: { type: \'myGoods\' , user_id: user_id}}">                <div class="ico fl"><img src="/dist/images/ico14.png"></div>                <div class="user-memu-content">                    <div class="user-memu-text fl">我赞过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.goods}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>             </router-link>             <div class="clearfix"></div>           <router-link :to="{ name: \'user/topic\', params: { type: \'myComments\' , user_id: user_id}}">                <div class="ico fl"><img src="/dist/images/ico13.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl">我评论过的</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.comments}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>           </router-link>        </div>        <div class="user-memu bw">           <router-link :to="{ name: \'user/awards\' ,params:{ user_id: user_id }}">                <div class="ico fl"><img src="/dist/images/ico11.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl">我的奖品</div>                    <div class="arrow-right fr"></div>                    <div class="user-memu-count fr">{{userStatistics.awards}}</div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </router-link>        </div>         <div class="user-memu bw">            <router-link :to="{ name: \'user/feedback\'}">                <div class="ico fl"><img src="/dist/images/ico10.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl text-on">问题反馈</div>                    <div class="arrow-right fr"></div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </router-link>        </div>        <div class="user-memu bw">            <a v-on:click="contactUs($event)">                <div class="ico fl"><img src="/dist/images/ico12.png"></div>                <div class="user-memu-content border-none">                    <div class="user-memu-text fl text-on">联系客服</div>                    <div class="arrow-right fr"></div>                    <div class="clearfix"></div>                </div>                <div class="clearfix"></div>            </a>        </div>    </div>    </div>';
});

define("./dist/template/user/topic", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">        <!-- 参与活动列表 -->        <div class="topic-list">             <component-topic-list :items="items"></component-topic-list>        </div>        <!-- 参与活动列表 -->     </div></div>';
});

define("./dist/plug/picLazyLoad", [], function(require, exports, module) {
    var controller, _winScrollTop = 0, _winHeight = $(window).height();
    var settings = {
        threshold: 400,
        // 提前高度加载
        placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
    };
    controller = {
        watch: function($imgs, fn) {
            $imgs.each(function(i, v) {
                var $self = $(this);
                var bool = fn($self) < settings.threshold ? true : false;
                // 如果是img 
                if ($self.is("img")) {
                    if (!$self.attr("src")) {
                        $self.attr("src", settings.placeholder);
                    }
                    if ($self.attr("data-original")) {
                        if (bool) {
                            $self.attr("src", $self.attr("data-original"));
                            $self.removeAttr("data-original");
                            $self.attr("lazyLoadPic", "false");
                        }
                    }
                } else {
                    if ($self.attr("data-original")) {
                        // 默认占位图片
                        if ($self.css("background-image") == "none") {
                            $self.css("background-image", "url(" + settings.placeholder + ")");
                        }
                        var _offsetTop = fn($self);
                        if (bool) {
                            $self.css("background-image", "url(" + $self.attr("data-original") + ")");
                            $self.removeAttr("data-original");
                        }
                    }
                }
            });
        }
    };
    module.exports = controller;
});
