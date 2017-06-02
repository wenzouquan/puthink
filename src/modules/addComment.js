define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    item: {},
                    publish_text: '确认提交',
                    pid: 0,
                    type: 'events',
                    content: '',
                    placeholder: '',
                    is_publish: 0,
                    comment_id: 0,
                };
            },
            el: '#pageAddComment',
            created: function() {
                this.fetchData();
            },
            methods: {
                fetchData: function() {
                    var _this = this;
                    this.placeholder = _this.$route.params.placeholder;
                    this.pid = _this.$route.params.pid;
                    this.comment_id = _this.$route.params.comment_id;
                },
                publish: function() {
                    var _this = this;
                    if (_this.is_publish == 1) {
                        return;
                    }
                    _this.publish_text = "发布中....";
                    _this.is_publish = 1;
                    var data = $('#pageAddComment').find("form").serializeArray();
                    app.post("/BoxSns/Home/Index/do_comment", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            var topicId = _this.pid;
                            var indexVm = app.getVm("index");
                            var items = indexVm ? indexVm.items : '';
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
                            app.alert('恭喜你，回复成功', function() {
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

        }).$mount('#app');
    };
    module.exports = controller;
});
