define("./dist/template/user/events", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">        <!-- 历史活动列表 -->        <div class="events ">          <template v-for="item in items">            <router-link :to="{ name: \'eventAward\', params: { id: item.id ,type:\'awards\'}}" class="events-one bw">               <div class="events-join">参与人数<br><span><font>{{item.topic_count}}</font>人</span></div>               <div class="events-join-text"></div>                 <img :src="item.picUrl">               <div class="events-info"><span>#{{item.title}}#</span> {{item.showInfo}}</div>            </router-link>          </template>                  </div>               <!-- 活动列表 -->    </div>  </div>';
});
