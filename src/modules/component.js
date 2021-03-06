define(function(require, exports, module) {
	 Vue.component('component-topic-list', {
        template: '#component-topic-list',
        props: ['items'],
        data: function() {
            return {
                items: {}
            };
        },
        created: function() {
            app.wxJs();
        },
        updated: function(){ 
            var pageContent = $(".pageShow").find(".page-content");
            var picLazyLoadScroll=function(){
                var imgs=$(".topic-one").find('[lazyLoadPic="true"]');
                var imgDisplay=function(img){
                     var offsetTop = $(img).parents(".topic-one").position().top;
                     var ScrollTop = pageContent.scrollTop();
                     return offsetTop-ScrollTop;
                };
                app.picLazyLoad(imgs,imgDisplay);
            };
            //picLazyLoadScroll();
           // pageContent.unbind("scroll",picLazyLoadScroll).bind("scroll",picLazyLoadScroll);
        },
        methods: {
            add_goods: function(em) {
                var vm = this;
                var obj = $(em.currentTarget);
                var id = $(obj).attr("data-id");
                var items = vm.items;
                app.add_goods(id,function(data){
                    if(data.error>0){
                        return ;
                    }
                    items=$.map(items,function(item){
                     if(item.id==id){
                        if(data.msg=='add'){
                            item.has_good=1;
                            item.good_count++;
                            item.goods_count++;
                        }else{
                            item.has_good=0;
                            item.good_count--;
                            item.goods_count--;
                        }
                     }
                     return item;
                    });
                });
            },
            share: function(em) {
                var obj = $(em.currentTarget);
                var url = "http://" + window.location.host + "/#/topic/" + $(obj).attr("id") + "?form=share";
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
                app.wxShare(params,function(){
                    $(".pageShow").append('<div id="shareDiv"  onclick="$(this).remove()"></div>');
                    app.hideLoad();
                });
                
            }
        }

    });

    //注册组件 , 轮播图片
    Vue.component('component-swiper', {
        template: '#component-swiper',
        props: ['id'],
        data: function() {
            return {
                items: {}
            };
        },
        mounted: function() {
            //this.fetchData()
            var vm = this;
            app.get("/BoxApi/Events/swiper", { id: this.id }, function(data) {
                vm.items = data ? data : {};
                setTimeout(function() {
                    if ($("#" + vm.id).find(".item").length > 1) {
                        app.swiper(vm.id);
                    }
                }, 10);

            });

        },
        updated: function(){
            var vm = this;
            var imgs=$("#" + vm.id).find(".swiper-slide img");
            $.each(imgs,function(index, el) {
                $(el).attr("src",$(el).attr('data-original'));
            }); 
        },
        methods: {
            imgLoad: function(e) {
                

            }
        }
    });

});