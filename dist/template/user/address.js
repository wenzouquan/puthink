define("./dist/template/user/address", [], function(require, exports, module) {
    return '<div class="page-content">    <div class="wrap">     <form class="wrap-address bw">        <div class="address-input">            <label class="input-name fl ">收货人</label>            <textarea style="padding-top:16px;" maxlength="11" class="address-input" :value="user_info.name"  name="name"></textarea>            <div class="clearfix"></div>        </div>         <div class="address-input">            <label class="input-name fl ">手机号码</label>            <textarea style="padding-top:16px;" maxlength="11" class="address-input" :value="user_info.phone"  name="phone"></textarea>             <div class="clearfix"></div>        </div>         <div class="address-input">            <label class="input-name fl ">收货地址</label><textarea style="padding-top:16px;" maxlength="100" class="address-input" :value="user_info.address"  name="address"></textarea>             <div class="clearfix"></div>        </div>            </form>           </div>    <div style="height:50px"></div>    <!-- 我要参与 -->    <div class="bottom-fixed">    	<div >    		<a v-on:click="saveAddress($event)"  class="btn publish-btn">{{publish_text}}</a>    	</div>    </div> </div>';
});
