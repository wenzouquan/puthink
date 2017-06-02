define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    items: {},
                    user_info: {

                    },
                    user_id: 0,
                    userStatistics: {

                    },
                    mounted: 0
                };
            },
            el: '#pageUserIndex',
            created: function() {
                this.fetchData();
                var _this = this;
            },
            mounted: function() {
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
                contactUs: function(e) {
                    var params = [{
                        text: '<a href="tel://18521082085">拨打电话</a>'
                    }];
                    app.handle(params);

                },
                fetchData: function() {
                    var _this = this;
                    _this.user_info = app.getUserInfo();
                    app.get("/BoxApi/Events/userStatistics", function(data) {
                        _this.userStatistics = data;
                    });

                }

            }
        }).$mount('#app');
    };
    module.exports = controller;
});
