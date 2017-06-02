define("./dist/template/component", [], function(require, exports, module) {
    return '<!-- 帖子列表 --><script type="text/x-template" id="component-topic-list">    <div>        <div class="topic-one bw" :topic-item="item.id"   v-for="item in items">            <div class="topic-head">                <div class="user-ico fl">                    <div class="user-award" v-if="item.is_best==1"></div>                    <router-link :to="{ name: \'user/home\', params: { user_id: item.user_id }}"> <img lazyLoadPic="true" onerror="this.src=\'/dist/images/errorImg.png\'" :src="item.user.headimg"></router-link>                </div>                <div class="user-info fl">                    <span class="fs-12">{{item.user.nickname}}</span>                    <br><span class="light-color fs-10">{{item.time_tran}} 发布</span>                </div>                <div class="topic-share fr" :title="item.title" :id="item.id" :imgUrl="item.coverImage" v-on:click="share($event)">             <i class="ico ico_share"></i>                <span class="light-color-2">分享</span></div>                <div class="clearfix"></div>            </div>                       <router-link :to="{ name: \'topic\', params: { id: item.id }}">                <div class="topic-content">                                       <div class="img-list" v-if="item.imgList.length">                        <template v-for="image in item.imgList">                            <img lazyLoadPic="true" onerror="this.src=\'/dist/images/errorImg.png\'" :src="image+\'?x-oss-process=image/resize,m_fill,h_300,w_300\'">                        </template>                    </div>                    <div v-html="item.title" class="img-text fs-14"> </div>                </div>            </router-link>            <div class="topic-act">                <div :data-good="item.goods_count"  :topic-goods="item.id" :class="item.has_good?\'active\':\'\'" :data-id="item.id" v-on:click="add_goods($event)">                    <i class="ico-goods"></i>                    <span class="light-color-2"><font>{{item.goods_count!=0?item.goods_count:""}}</font> 赞</span>                </div>                <router-link :to="{ name: \'topic\', params: { id: item.id }}"><i class="ico ico_comment mgl12"></i> <span class="light-color-2"><font  :data-count="item.comment_count" :topic-comment="item.id">{{item.comment_count}}</font> 评论</span></router-link>                 <router-link :to="{ name: \'topic\', params: { id: item.id }}">                  <i class="ico ico_hit mgl12"></i> <span class="light-color-2"><font>{{item.hit_count}}</font> 阅读</span></router-link>            </div>        </div>    </div></script><!-- 轮播图片 --><script type="text/x-template" id="component-swiper">    <div class="swiper-container" data-type="swiper" id="swiper-index">        <div class="swiper-wrapper">            <div class="item swiper-slide" v-for="item in items">                <a :href="item.url" target="_blank">                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"  style="width:100%; max-height:150px" :data-original="item.picUrl+\'?x-oss-process=image/resize,w_500\'">                </a>            </div>        </div>        <!-- 如果需要分页器 -->        <div class="swiper-pagination"></div>    </div></script><!-- loading --><script type="text/x-template" id="component-loader"> <div class="loader loader--style1" title="0">  <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"   width="40px" height="40px" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve">  <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946    s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634    c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>  <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0    C22.32,8.481,24.301,9.057,26.013,10.047z">    <animateTransform attributeType="xml"      attributeName="transform"      type="rotate"      from="0 20 20"      to="360 20 20"      dur="0.5s"      repeatCount="indefinite"/>    </path>  </svg></div></script> ';
});
