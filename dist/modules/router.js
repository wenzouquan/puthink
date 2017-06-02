"use strict";

define("./dist/modules/router", [], function(require, exports, module) {
    var Router = new VueRouter({
        routes: [ {
            path: "/",
            name: "index",
            page: "cache",
            title: "普象•一起玩"
        }, {
            path: "/topic/:id",
            name: "topic",
            title: "详情"
        }, {
            path: "/add/:pid/:title",
            name: "add"
        }, {
            path: "/addComment/:pid/:comment_id/:placeholder",
            name: "addComment",
            title: "添加评论"
        }, {
            path: "/events",
            name: "events"
        }, {
            path: "/eventAward/:id/:type",
            name: "eventAward"
        }, {
            path: "/user/index",
            name: "user/index",
            title: "一起玩•我的"
        }, {
            path: "/user/topic/:type/:user_id",
            name: "user/topic"
        }, {
            path: "/user/awards/:user_id",
            name: "user/awards",
            title: "我的奖品"
        }, {
            path: "/user/address",
            name: "user/address",
            title: "修改地址"
        }, {
            path: "/user/feedback",
            name: "user/feedback",
            title: "问题反馈"
        }, {
            path: "/user/events/:user_id",
            name: "user/events",
            title: "参与的活动"
        }, {
            path: "/user/goods/:user_id",
            name: "user/goods",
            title: "收到的赞"
        }, {
            path: "/user/home/:user_id",
            name: "user/home",
            title: "Ta的主页"
        }, {
            path: "/user/comment/:user_id",
            name: "user/comment",
            title: "收到的评论"
        } ]
    });
    module.exports = Router;
});
