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
