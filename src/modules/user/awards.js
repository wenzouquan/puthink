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
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id,
                };
            },
            el: '#pageUserAwards',
            created: function() {
                this.fetchData();

            },
            mounted: function() {
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
                fetchData: function() {
                    var _this = this;
                    app.get("/BoxApi/Events/userAwards", { p: this.page, user_id: this.user_id }, function(data) {
                        var list = data.list ? data.list : [];
                        _this.items = _this.items.concat(list);
                        _this.page = data.pager ? data.pager.nextPage : "";
                        app.params.loadPage = 0;
                    });

                }

            }
        }).$mount('#app');
    };
    module.exports = controller;
});
