define(function(require, exports, module) {
    var router = require("router");
    //var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    item: {
                        'user': {},
                        'events': {},
                    },
                    good_text: '点赞',
                    publish_text: '确认提交',
                    placeholder: '',
                    commentList: [],
                    pager: {},
                    name: 'moduleTopic',
                    page: 1,
                    mounted: 0,
                    user_info: {},
                    event: {},


                };
            },
            el: '#pageTopic',
            created: function() {
                this.fetchData();
                this.user_info = app.getUserInfo();
                app.wxJs();
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
                        _this.loadComment();
                    }
                });
                this.mounted = 1;

                $("#pageTopic").find(".page-content").scroll(function(event) {
                    var scrollTop = $(this).scrollTop();
                    var bannerH = 35;
                    if (scrollTop > bannerH) {
                        $("#pageTopic").find(".topic-head").addClass("user-nav-tab-fix");
                    } else {
                        $("#pageTopic").find(".topic-head").removeClass("user-nav-tab-fix");
                    }
                });

            },

            methods: {
                fetchData: function() {
                    var _this = this;
                    this.placeholder = this.$route.params.placeholder;
                    app.get("/BoxApi/Events/topicDetail", {
                        id: _this.$route.params.id
                    }, function(data) {
                        if (data && data.id) {
                            _this.item = data;
                            _this.good_text = data.has_good ? '已赞' : '点赞';
                            _this.event = data.events;
                        }
                    });
                    this.loadComment();
                },
                loadComment: function() {
                    //评论列表
                    var _this = this;
                    app.get("/BoxApi/Events/comment", {
                        id: _this.$route.params.id,
                        p: this.page
                    }, function(data) {
                        if (data.list) {
                            var list = data.list ? data.list : [];
                            _this.commentList = _this.commentList.concat(list);
                            _this.page = data.pager ? data.pager.nextPage : "";
                            app.params.loadPage = 0;
                        }
                    });
                },
                showAddComment: function() {
                    var placeholder = "回复" + this.item.user.nickname + "(楼主)";
                    var comment_id = 0;
                    this.$router.push({
                        name: 'addComment',
                        params: {
                            pid: this.$route.params.id,
                            comment_id: comment_id,
                            placeholder: placeholder
                        }
                    });
                },
                delTopic: function() {
                    var pid = this.$route.params.id;
                    var _this = this;
                    app.confirm({
                        'text': '确认删除帖子吗？',
                        'yes': function() {
                            app.get("/BoxSns/Home/Index/del_topic", {
                                id: pid
                            }, function(data) {
                                if (data.error == '0') {
                                    $("[topic-item='" + pid + "']").hide();
                                    app.alert("恭喜你，删除成功");
                                    _this.$router.go(-1);
                                } else {
                                    app.alert(data.msg);
                                }
                            });
                        },
                    });
                },
                share: function(em) {
                    var obj = $(em.currentTarget);
                    var url = "http://" + window.location.host + "/#/topic/" + $(obj).attr("id");
                    app.showLoad();
                    var params = {
                        title: $(obj).attr("title"), // 分享标题
                        link: url, // 分享链接
                        imgUrl: $(obj).attr("imgUrl"), // 分享图标
                        desc: $(obj).attr("desc") ? $(obj).attr("desc") : $(obj).attr("title"),
                        success: function() {
                            // 用户确认分享后执行的回调函数
                            app.wxDefShare();
                        },
                        cancel: function() {
                            // 用户取消分享后执行的回调函数
                        }
                    };
                    app.wxShare(params, function() {
                        $(".pageShow").append('<div id="shareDiv"  onclick="$(this).remove()"></div>');
                        app.hideLoad();
                    });
                },
                previewImage: function(_this) {
                    var obj = $(_this.currentTarget);
                    var imgs = $(obj).parent(".img-list").find("img");
                    var urls = [];
                    $(imgs).each(function(index, el) {
                        urls.push($(el).attr("src"));
                    });
                    app.wx(function(wx) {
                        wx.previewImage({
                            current: $(obj).find("src"),
                            urls: urls
                        });
                    })

                },
                add_goods: function(id) {
                    var indexVm = app.getVm("index");
                    var items = indexVm ? indexVm.items : '';
                    var vm = this;
                    var item = vm.item;
                    var goodLists = item.goodList;
                    app.add_goods(id, function(data) {
                        if (data.error > 0) {
                            return;
                        }
                        var user = app.getUserInfo();
                        //当前页点赞数变化
                        if (data.msg == 'add') {
                            item.has_good = 1;
                            item.good_count++;
                            item.goods_count++;
                            //点赞头像减加一个
                            goodLists.push({
                                'user': user,
                                'user_id': user.user_id
                            });
                        } else {
                            item.has_good = 0;
                            item.good_count--;
                            item.goods_count--;
                            //点赞头像减少一个
                            vm.item.goodList = $.grep(goodLists, function(one, v) {
                                if (one.user_id == user.user_id) {
                                    console.log(one);
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                        }
                        //首页列表点赞数
                        if (items) {
                            items = $.map(items, function(one) {
                                if (item.id == id) {
                                    if (data.msg == 'add') {
                                        one.has_good = 1;
                                        one.good_count++;
                                        one.goods_count++;
                                    } else {
                                        one.has_good = 0;
                                        one.good_count--;
                                        one.goods_count--;
                                    }
                                }
                                return one;
                            });
                        }
                        //首页列表点赞数结束

                    });
                },
                handle: function(em) {
                    var _this = this;
                    var obj = $(em.currentTarget);
                    var id = $(obj).attr("data-id");
                    var user_id = $(obj).attr("data-user-id");
                    var topic_user_id = this.item.user_id;
                    var pid = this.item.id;
                    var placeholder = "@" + $(obj).attr("data-nickname");
                    var params = [{
                        text: '回应'
                    }];
                    var user_info = app.getUserInfo();
                    if (user_info.user_id == topic_user_id || user_id == user_info.user_id) {
                        var param = [{
                            text: '删除'
                        }];
                        params = params.concat(param);
                    }
                    app.handle(params);
                    //回应
                    $("#handle .handle-options-one").eq("0").click(function(event) {
                        _this.$router.push({
                            name: 'addComment',
                            params: {
                                'pid': pid,
                                'comment_id': id,
                                placeholder: placeholder
                            }
                        });
                    });
                    //删除
                    $("#handle .handle-options-one").eq("1").click(function(event) {
                        var comment_id = id;
                        app.hide_popup();
                        app.confirm({
                            'text': '确认删除这条评论吗？',
                            'yes': function() {
                                app.get("/BoxSns/Home/Index/del_comment", {
                                    comment_id: comment_id
                                }, function(data) {
                                    if (data.error == '0') {
                                        $(".comment-list").find("[data-id='" + comment_id + "']").hide();
                                        _this.item.comment_count--;
                                        var indexVm = app.getVm("index");
                                        var items = indexVm ? indexVm.items : '';
                                        //首页列评论数减少1
                                        if (items) {
                                            items = $.map(items, function(one) {
                                                if (one.id == _this.item.id) {
                                                    one.comment_count--;
                                                }
                                                return one;
                                            });
                                        }
                                        app.alert("恭喜你，删除成功");
                                    } else {
                                        app.alert(data.msg);
                                    }
                                });
                            },
                        });
                    });
                }
            }
        }).$mount('#app');
    };
    module.exports = controller;

});