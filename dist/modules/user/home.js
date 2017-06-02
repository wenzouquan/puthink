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
