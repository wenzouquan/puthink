define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function(params) {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    events: {},
                    items: [],
                    page: 1,
                    mounted: 0,
                    swiper_id: 'swiper-index',
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
                    timeShowNavFix: '',
                    showOrder: 0,
                    orderBy: 2,
                    itemsload: 0,
                    enableOrderBy: 1,
                };
            },
            el: '#pageIndex',
            created: function() {
                this.fetchData();

            },
            mounted: function() {

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
                    // _this.setIntervalScrollTop();

                });
                $("#pageIndex").click(function(event) {
                    _this.showOrder = 0;
                });
            },
        
            methods: {
                setIntervalScrollTop: function() {
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
                        }, 2000);

                    }
                },
                showNavFix: function(scrollTop) {
                    var bannerH = $("#pageIndex").find(".banner").height() + 8;
                    // var swiperTap=$("#pageIndex").find(".swiperTap").clone(true)
                    if (scrollTop > bannerH) {
                        $("#pageIndex").find("#s_top").show();
                        $("#pageIndex").find(".nav-tab-fix").show();
                        //$("#pageIndex").find(".swiperTap").addClass("nav-tab-fix");
                    } else {
                        $("#pageIndex").find("#s_top").hide();
                        $("#pageIndex").find(".nav-tab-fix").hide();
                        // $("#pageIndex").find(".swiperTap")
                        //$("#pageIndex").find(".swiperTap").removeClass("nav-tab-fix");
                    }
                },
                fetchData: function() {
                    var _this = this;
                    app.get("/BoxApi/Events/index", { p: this.page, orderBy: this.orderBy }, function(data) {
                        if (_this.page == 1) {
                            _this.events = data.event;
                            _this.expire_date_limit = data.event.expire_date_limit;
                            _this.GetRTime();
                            _this.setIntervalObj = setInterval(_this.GetRTime, 1000);
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
                eventDetail: function() {
                    var events = this.events;
                    var userEventsId = app.cache(app.params.userVersions).get("userEventsId");
                    // console.log(userEventsId);
                    if (!(events && events.id)) {
                        return;
                    }
                    if (this.expire_date_limit < 0) {
                        return;
                    }

                    if (!userEventsId || (Number(userEventsId) > 0 && events.id != userEventsId)) {
                        app.cache(app.params.userVersions).set("userEventsId", events.id);
                        $("#pageIndex").find(".popupBg").show();
                        $("#pageIndex").find(".eventsDialog").show();
                    }
                },
                hideEventsDialog: function() {
                    $("#pageIndex").find(".popupBg").hide();
                    $("#pageIndex").find(".eventsDialog").hide();
                },
                changeShowOrder: function(e) {
                    this.showOrder = !this.showOrder;
                    e.stopPropagation();
                },
                changeOrder: function(orderId) {
                    this.s_top();
                    this.page = 1;
                    this.orderBy = orderId;
                    $("#pageIndex").find(".orderList-li").removeClass("active");
                    $("#pageIndex").find(".order-ico-" + orderId).addClass("active");
                   // $("#pageIndex .topic-list img").attr("lazyloadpic","true");
                    this.fetchData();
                },
                s_top: function(e) {
                    var speed = 200; //滑动的速度
                    //alert($("#pageIndex").find('.page-content').scrollTop())
                    $("#pageIndex").find('.page-content').scrollTop(0);
                },
                GetRTime: function() {
                    var _this = this;
                    var t = _this.expire_date_limit;

                    if (t >= 0) {
                        _this.expire_date.d = Math.floor(t / 60 / 60 / 24);
                        _this.expire_date.h = Math.floor(t / 60 / 60 % 24);
                        _this.expire_date.m = Math.floor(t / 60 % 60);
                        _this.expire_date.s = Math.floor(t % 60);
                        _this.expire_date_limit--;
                        $('#pageIndex').find(".bottom-fixed").removeClass("disable");
                    } else {
                        clearInterval(_this.setIntervalObj);
                        $('#pageIndex').find(".bottom-fixed").addClass("disable");
                        this.events.id = "";
                    }
                }
            }
        }).$mount('#app');
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

            //console.log(e.activeIndex);
        });
    };
    module.exports = controller;
});
