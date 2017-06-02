define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function(params) {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    user_info: {

                    },
                    publish_text: '确认保存',
                    is_publish: 0
                };
            },
            el: '#pageUserAddress',
            created: function() {
                this.fetchData();
            },
            methods: {
                fetchData: function() {
                    var _this = this;
                    var user_info = app.getUserInfo();
                    this.user_info = user_info ? user_info : {};


                },
                saveAddress: function() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    app.showLoad();
                    _this.publish_text = "保存中....";
                    _this.is_publish = 1;
                    var data = $('#pageUserAddress').find("form").serializeArray();
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
                            app.alert('恭喜你，地址保存成功', function() {
                                _this.$router.go(-1);
                                //_this.$router.push({name: 'user/index'});
                            });

                        }
                        app.hideLoad();
                        _this.is_publish = 0;
                        _this.publish_text = "确认保存";

                    });
                }

            }
        }).$mount('#app');
    };
    module.exports = controller;
});
