define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    user_info: {

                    },
                    publish_text: '确认提交',
                    is_publish: 0,
                    mounted: 0
                };
            },
            el: '#pageUserFeedback',
            created: function() {
                this.fetchData();
            },
            mounted: function() {
                if (this.mounted == 1) {
                    return;
                }
                $('#pageUserFeedback').find('[data-type="upload"]').each(function(i, _this) {
                    app.MultipleUpload(_this);
                });
                this.mounted = 1;

            },
            methods: {
                fetchData: function() {
                    var _this = this;
                },
                save: function() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    // var liLength=$("#pageAdd").find(".photoList-content li").length;
                    // var imglength=$("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    // var limit= liLength-imglength-1;
                    _this.publish_text = "提交中....";
                    _this.is_publish = 1;
                    var data = $('#pageUserFeedback').find("form").serializeArray();
                    app.post("/BoxApi/Events/feedback", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            app.alert('谢谢你反馈，我们会尽快处理', function() {
                                _this.$router.go(-1);
                            });

                        }
                        _this.is_publish = 0;
                        _this.publish_text = "确认提交";

                    });
                }

            }
        }).$mount('#app');
    };
    module.exports = controller;
});
