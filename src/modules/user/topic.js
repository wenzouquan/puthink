define(function(require, exports, module) {
    var router = require("router");
   // var app = require("app");
    var controller = {};
    controller.vue = function() {
        controller.vm = new Vue({
            router: router,
            data: function() {
                return {
                    items: [],
                    page: 1,
                    mounted: 0,
                    user_id: this.$route.params.user_id
                };
            },
            el: '#pageUserTopic',
            created: function() {
                this.fetchData();
                var _this = this;
            },
            mounted: function() {
                if (this.mounted == 1) {
                    return;
                }
                //分页
                var _this = this;
                app.pager(function() {
                    console.log(_this.page);
                    if (_this.page > 1) {
                        app.params.loadPage = 1;
                        _this.fetchData();
                    }
                });
                var s = "我";
                if (this.$route.params.user_id > 0) {
                    s = "Ta";
                }
                if (_this.$route.params.type == "publish") {
                    app.setTitle(s + "发布过的");
                } else if (_this.$route.params.type == "myGoods") {
                    app.setTitle(s + "赞过的");
                } else if (_this.$route.params.type == "myComments") {
                    app.setTitle(s + "评论过的");
                }
                this.mounted = 1;
            },
            methods: {
                fetchData: function() {
                     var _this=this; 
                     app.get("/BoxApi/Events/topic",{type:this.$route.params.type,p:this.page,user_id:this.user_id},function(data){
                        var list=data.list?data.list:[];
                        _this.items=_this.items.concat(list);
                        _this.page=data.pager?data.pager.nextPage:"";
                        app.params.loadPage=0;
                     });
                }

            }
        }).$mount('#app');
    };
    module.exports = controller;
});
