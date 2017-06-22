define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    mounted: 0,
                    publish_text: '确认发布',
                    is_publish: 0,
                    content: '',
                    type: 'events',
                    disablePublish: 'disable',
                };
            },
            el: '#pageAdd',
            created: function() {
                this.pid = this.$route.params.pid;
                var user_info = app.getUserInfo();
                this.user_info = user_info ? user_info : {};
            },
            mounted: function() {
                if (this.mounted == 1) {
                    return;
                }
                $('#pageAdd').find('[data-type="upload"]').each(function(i, _this) {
                    app.MultipleUpload(_this);
                });
                this.mounted = 1;
                //app.setTitle(this.);
                // app.get()

                var _this = this;
                //监听上传图片
                $('#pageAdd').find('[data-type="upload"]').on("BoxUpload", function() {
                    _this.checkPublish();
                });
                //监听text
                app.setTitle(this.$route.params.title);

            },

            methods: {
                checkPublish: function(e) {
                    var imglength = $("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    if (this.content && imglength > 0) {
                        this.disablePublish = "";
                    } else {
                        this.disablePublish = "disable";
                    }
                },
                publish: function() {
                    var _this = this;
                    var liLength = $("#pageAdd").find(".photoList-content li").length;
                    var imglength = $("#pageAdd").find(".photoList-content li .imgList-file_url").length;
                    var limit = liLength - imglength - 1;
                    if (this.content === "" && imglength > 0) {
                        app.alert("请添加关于图片的描述");
                        return false;
                    }
                    if (this.content !== "" && imglength === 0) {
                        app.alert("请添加至少一张图片");
                        return false;
                    }
                    if (_this.is_publish === 1) {
                        return;
                    }
                    if (limit > 0) {
                        app.confirm({
                            'text': '还有' + limit + '张图片正在上传中，是否确认提交？',
                            'yes': function() {
                                _this.publishYes();
                            },
                        });
                    } else {
                        _this.publishYes();
                    }

                },
                publishYes: function() {
                    var _this = this;
                    if (_this.is_publish === 1) {
                        return;
                    }
                    _this.publish_text = "发布中....";
                    _this.is_publish = 1;
                    var data = $("#pageAdd").find("form").serializeArray();
                    app.post("/BoxSns/Home/Index/addTopic", data, function(res, textStatus, xhr) {
                        //var data= JSON.parse(res);
                        if (res.error > 0) {
                            app.alert(res.msg);
                        } else {
                            //console.log(res);
                            // console.log(typeof(pageIndex));
                            var pageIndexMv = app.getVm("index");
                            // if (typeof(pageIndexMv) != "undefined") {
                            if (pageIndexMv && pageIndexMv.items) {
                                var list = [res.msg];
                                pageIndexMv.items = list.concat(pageIndexMv.items);
                                // $("#pageIndex").find(".scrollActive").attr("scrolltop",0);
                                // $("#pageIndex").find('.page-content').scrollTop(0);
                            }
                            app.alert('恭喜你，发布成功', function() {
                                _this.$router.push({
                                    name: 'eventAward',
                                    params: {
                                        id: _this.pid,
                                        type: 'awards'
                                    }
                                });

                                //_this.$router.go(-1);
                            });

                        }
                        //_this.is_publish=0;
                        _this.publish_text = "发布成功";

                    });
                }
            }
        }).$mount('#app');
    };
    module.exports = controller;
});