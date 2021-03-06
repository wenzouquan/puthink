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
