define(function(require, exports, module) {
   var controller , _winScrollTop = 0, _winHeight = $(window).height();
   var settings={
            threshold: 400, // 提前高度加载
            placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'
        };
   controller={
        watch:function($imgs,fn){
            $imgs.each(function(i,v){
                var $self = $(this); 
                var bool = fn($self)<settings.threshold?true:false; 
                // 如果是img 
                if($self.is('img')){
                     if(!$self.attr('src')){
                         $self.attr('src',settings.placeholder);
                     }
                    if($self.attr('data-original')){
                        if(bool){
                            $self.attr('src',$self.attr('data-original'));
                            $self.removeAttr('data-original');
                            $self.attr("lazyLoadPic",'false');
                        }
                    }
                // 如果是背景图
                }else{
                    if($self.attr('data-original')){
                        // 默认占位图片
                        if($self.css('background-image') == 'none'){
                            $self.css('background-image','url('+settings.placeholder+')');
                        }
                        var _offsetTop = fn($self);
                        if(bool){
                            $self.css('background-image','url('+$self.attr('data-original')+')');
                            $self.removeAttr('data-original');
                        }
                    }
                }
            });
        }
   };
   module.exports = controller;
})
