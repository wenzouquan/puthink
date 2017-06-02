define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};

    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    items: [],
                    items2: [],
                    event: '',
                    mounted: 0,
                    page: 1,
                    page2: 1,
                    showType: 'list',
                    type: this.$route.params.type,
                    swiperH: 0,
                    swiperT: 0,
                    load2: 0,
                    showMore: 0,
                    showMoreText: 0,
                    imgHeight: 'height:' + $(window).width() / 3 + 'px',
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
            el: '#pageEventAward',
            created: function() {
                this.fetchData();
                this.setTitle();
            },

            mounted: function() {
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
                        //$("#pageEventAward").find(".swiperTap").addClass("nav-tab-fix");
                    } else {
                        $("#pageEventAward").find("#s_top").hide();
                        //$("#pageEventAward").find(".swiperTap").removeClass("nav-tab-fix");
                    }
                });
                $("#pageEventAward").click(function(event) {
                    _this.showOrder = 0;
                });

            },
            methods: {
                setTitle: function() {
                    if (this.event && this.event.topic) {
                        app.setTitle(this.event.topic);
                    }

                },
                fetchData: function() {
                    var _this = this;
                    var page = this.type == "awards" ? _this.page : _this.page2;
                    if (page === "") {
                        return;
                    }
                    app.get("/BoxApi/Events/topic", { type: this.type, pid: this.$route.params.id, p: page, orderBy: this.orderBy }, function(data) {
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
                            window.setIntervalObj = setInterval(_this.GetRTime, 1000);
                        }
                        var list = data.list ? data.list : [];
                        var page = data.pager ? data.pager.nextPage : "";
                        if (_this.type == "all") { //所有
                            _this.items2load = 1;
                            if (_this.page2 == 1) {
                                _this.items2 = list;
                            } else {
                                _this.items2 = _this.items2.concat(list);
                            }
                            _this.page2 = page;
                            _this.load2 = 1;

                        } else { //获奖用户
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
                changeShowOrder: function(e) {
                    this.showOrder = !this.showOrder;
                    //alert(this.showOrder);
                    e.stopPropagation();
                },
                changeOrder: function(orderId) {
                    this.type == "awards" ? this.page = 1 : this.page2 = 1;
                    this.orderBy = orderId;
                    $("#pageEventAward").find(".orderList-li").removeClass("active");
                    $("#pageEventAward").find(".order-ico-" + orderId).addClass("active");
                   // $("#pageEventAward .topic-list img").attr("lazyloadpic","true");
                    this.fetchData();
                },
                showMoreFuc: function() {
                    this.showMore = !this.showMore;
                },
                s_top: function(e) {
                    var speed = 200; //滑动的速度
                    //alert($("#pageIndex").find('.page-content').scrollTop())
                    $("#pageEventAward").find('.page-content').scrollTop(0);
                },

                /**参数说明：
                 * 根据长度截取先使用字符串，超长部分追加…
                 * str 对象字符串
                 * len 目标字节长度
                 * 返回值： 处理结果字符串
                 */
                cutString: function(str, len) {

                    //length属性读出来的汉字长度为1
                    if (str.length <= len) {
                        return str;
                    }
                    var s = str.substring(0, len) + "...";
                    return s;
                },

                changeShowType: function(_this) {
                    this.showType = this.showType == 'list' ? 'table' : 'list';
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
                        $('#pageEventAward').find(".bottom-fixed").removeClass("disable");
                    } else {
                        clearInterval(window.setIntervalObj);
                        $('#pageEventAward').find(".bottom-fixed").addClass("disable");
                        this.event.id = "";
                    }

                }

            }
        }).$mount('#app');
    };
    controller.pageShow = function() {
        var _this = controller.vm;
        app.swiperPage("#swiper-page-EventAward", function(swiper) {
            var index = swiper.activeIndex;
            _this.type = $("#swiper-page-EventAward-container").find(".swiperTap li").eq(index).attr("type");
            if (_this.load2 == '0' && _this.type == "all") {
                _this.fetchData();
            }
        });
        _this.setTitle();
    };
    module.exports = controller;
});
