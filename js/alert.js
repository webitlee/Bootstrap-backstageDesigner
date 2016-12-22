/*

**依赖于jQuery

alert('这里是消息内容', function()
{
	// 这里是消失时执行的回调
});

**alert('sdad ssssssasd \n adada\n',fn);

*/

    $(document).ready(function()
    {
        // $('<link href="http://ui.yidaochn.com/theme/plain/alert/alert.css" rel="stylesheet" />').appendTo('head');
    	var css = document.createElement('link');
    	css.rel = 'stylesheet';
    	css.type = 'text/css';
    	css.href = 'http://ui.yidaochn.com/theme/plain/alert/alert.css';
    	document.getElementsByTagName('HEAD')[0].appendChild(css);
    });

    var $alert = window.alert;
    
    window.alert = function(content)
    {
        var timer = null;
        clearInterval(timer);
        var oTooltip = $('#x-tooltip');
        if( oTooltip.length ) return;
        oTooltip.css({ width : 0 });
        oTooltip.remove();
        if (oTooltip.attr('class') != 'x-tooltip')
        {
            oTooltip = $('<div id="x-tooltip" class="x-tooltip animated">'+
                        '<i></i>'+
                        '<div>'+
                        '<pre id="tooltip-content"></pre>'+
                        '</div>'+
                        '</div>');
            oTooltip.appendTo('body');
        }
        if($(window).width()<750){
            oTooltip.css({ "min-width" : $(window).width()-40, "max-width" : $(window).width()-40, "min-height" : 150 });
        }else{
            oTooltip.css({ "min-width" : 400, "max-width" : 600, "min-height" : 150 });
        }

        $('#tooltip-content').text(content);
        if(content.indexOf('\n') != -1 )
        {
            $('#tooltip-content').css({'text-align' : 'left'});
        }
        else
        {
            $('#tooltip-content').css({'text-align' : 'center'});
        }
        
        var left = $(window).width();
        var top = $(window).height();
        var scrollT = $(window).scrollTop();
        left = 0.5 * left - oTooltip.width() / 2;
        top = 0.4 * top - oTooltip.height();
        
        oTooltip.show();
        oTooltip.addClass('zoomIn');
        oTooltip.css({ left : left, top : top + scrollT });
        
        oTooltip.animate({ opacity : 1}, 1000, function()
        {
            oTooltip.removeClass('zoomIn');
            setTimeout(function()
            {
                oTooltip.addClass('zoomOut');
                setTimeout(function(){
                    oTooltip.remove();
                },100);
                if (self.thenHandler) self.thenHandler();
            },3000);
        });
        	

        this.thenHandler = null;
        var self = this;
        
        return {
            and : function(fn){
                fn()&&fn();
                return {
                	then : function(fn)
                	{
                        self.thenHandler = fn;
                	}
                }
            },
            then : function(fn){
                self.thenHandler = fn;
            }
        }
    }
    

