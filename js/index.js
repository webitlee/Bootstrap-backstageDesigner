/**
 * Created by liyanan on 2016/8/2.
 */
$(function(){

    //主程序
    (function(){
        //左侧菜单栏设置高度为窗口高度
        $('#editor').height($(window).height()-55);
        //右侧菜单栏设置高度为窗口高度
        $('#editor-right').height($(window).height()-55);

        //右侧主体宽高度
        $('#origin').width($(window).width()-$('#editor').width()-$('#editor-right').width()-35);
        $('#origin').height($(window).height()-105);

        //右侧属性列表的伸缩与展开
        $('#attribute-list').click(function(){
            if($('#editor-right').css('display') == 'none'){
                $('#editor-right').show();
                $(this).children('.fa-angle-double-right').removeClass('fa-angle-double-right').addClass('fa-angle-double-down');
                $('#origin').width($(window).width()-$('#editor').width()-$(this).parent().width()-50);
            }else{
                $('#editor-right').hide();
                $(this).children('.fa-angle-double-down').removeClass('fa-angle-double-down').addClass('fa-angle-double-right');
                $('#origin').width($(window).width()-$('#editor').width()-35);
            }
        });

        //树形路径宽度
        $('#tree').width($('#origin').width()+30);

        //左侧菜单栏收缩与隐藏
        $('.menu').click(function(){
            $brother=$(this).nextAll();
            if($brother.css('display')=='none'){
                $brother.show(200);
            }else{
                $brother.hide(200);
            }
        });

        //删除选中元素点击事件
        $('#cancel').click(function(){
           var $cancelEle = $('.bd-all-blue');
            $cancelEle.parent().addClass('bd-all-blue');
            $cancelEle.remove();
        });

        //复制选中元素点击事件
        $('#copy').click(function(){
            var str = $('.bd-all-blue').clone();
           $('.bd-all-blue').after(str);
        });

        //粘贴源代码按钮
        $('#download').click(function(){
            var strs=$('#origin').html();
            var resultStr=code(strs);
            //代码复制到模态框中
            $('#code').val(resultStr);
        });

        //源代码复制到系统剪贴板
        $('#paste').click(function(){
            $('#code').select();
            document.execCommand("Copy");
            alert("已复制好，可贴粘。");
        });

        //点击元素，显示路径
        var _this = null;
        $('#origin').on('click','*',function(evt){
            evt.stopPropagation();
            _this = this;

            //禁止小三角图标被点击
            if($(this).hasClass('caret')){
                $(this).parent().click();
                return;
            }
            $('.bd-all-blue').removeClass('bd-all-blue');
            $(this).addClass('bd-all-blue');
            var $choose = $(this).parentsUntil('#origin');
            var arr = [evt.target.tagName.toLowerCase()];
            for(var i = 0; i < $choose.length; i++){
                arr.unshift($choose[i].tagName.toLowerCase());
            }
            $('#domTree').children().first().nextAll().remove();
            for(var i = 0; i < arr.length; i++){
                $('#domTree').children().last().after('<li><a class="path" href="javascript:;">'+arr[i]+'</a></li>');
            }
            //解决分列式按钮下拉菜单不显示的问题
            if($(this).hasClass('dropdown-toggle')){
                if( $(this).parent().hasClass('open')){
                    $(this).parent().removeClass('open');
                }else{
                    $(this).parent().addClass('open');
                }
            }
            //
            //显示属性列表
            var elementClass = searchClass(ElementChildren, _this);
            list(elementClass, _this);
        });

        //点击路径显示对应元素
        $('#domTree').on('click', '.path', function(){
            var index = $(this).parent().index();
            var length = $('.path').length-1;
            var n = length - index;
            var targetEle =$(_this);
            for(var i = 0; i < n; i++){
                targetEle = targetEle.parent();
            }
            $('.bd-all-blue').removeClass('bd-all-blue');
            $(targetEle).addClass('bd-all-blue');
            //显示属性列表
            var elementClass = searchClass(ElementChildren, targetEle);
            list(elementClass, targetEle);
        });

        //添加元素位置单选框
        $('input[name=insertEle]').click(function(){
            $('input[name=insertEle]').attr('checked', false);
            $(this).attr('checked', true);
        });
        //设置添加元素位置
        $('#set').click(function(){
            $('input[name=insertEle]').each(function(){
                if($(this).attr('checked')){
                    var value = $(this).val();
                    var eleClass = addEleClass(ele);
                    var str = addElement(eleClass, ele);
                    var elementClass = searchClass(ElementChildren, $('.bd-all-blue')[0]);
                    if(value == 'inside'){
                        elementClass.insideInsertChild($('.bd-all-blue')[0], str);
                    }else if(value == 'prev'){
                        elementClass.beforeInsertChild($('.bd-all-blue')[0], str);
                    }else if(value == 'next'){
                        elementClass.afterInsertChild($('.bd-all-blue')[0], str);
                    }else if(value == 'wrap'){
                        elementClass.wrapInsertChild($('.bd-all-blue')[0], str);
                    }
                }
            });
            $('#table-set, #form-set').hide();
        });
        //取消添加元素
        $('#cancel-set').click(function(){
           $('#table-set, #form-set').hide();
        });

        //添加元素点击事件
        var ele = null;
        $('.sure').click(function(){
            ele = this;
            if($(this).attr('data-class') == 'ResponsiveTable'){
                $('#table-set').show();
            }
            if($(this).attr('data-class') == 'FormHorizontal'){
                $('#form-set').show();
            }
        });

        //水平表单控件设置
        (function(){
            var $checkboxBox = $('#input-set, #radio-set, #checkbox-set, #textarea-set, #select-set, #button-set');
            var $checkbox = $checkboxBox.find(':checkbox');
            var $checked = null;
            $checked = $checkboxBox.find(':checked');
            tableStr($checked);
            $checkbox.click(function(){
                $checked = $checkboxBox.find(':checked');
                tableStr($checked);
            });
            $('.number-set').blur(function(){
                tableStr($checked);
            });
            //改变表单控件顺序点击事件
            $(document).on('click', '.up', function(){
                var $tr = $(this).parents('tr');
                var index = $tr.index();
                if(index > 0){
                    var text1 = $($tr.children()[0]).text();
                    var text2 = $($tr.prev().children()[0]).text();
                    $($tr.children()[0]).text(text2);
                    $($tr.prev().children()[0]).text(text1);
                    $tr.prev().before($tr);
                }
            });
            $(document).on('click', '.down', function(){
                var $tr = $(this).parents('tr');
                var $trs = $(this).parents('table').find('tr');
                var index = $tr.index();
                if(index < $trs.length-2){
                    var text1 = $($tr.children()[0]).text();
                    var text2 = $($tr.next().children()[0]).text();
                    $($tr.children()[0]).text(text2);
                    $($tr.next().children()[0]).text(text1);
                    $tr.next().after($tr);
                }
            });
            //生成表格的字符串，参数，生成表单控件的jquery集合
            function tableStr($checked){
                var shtml = '';
                var num = 0;
                $checked.each(function(){
                    var sum = parseInt($(this).parent().next().val());
                    for(var i = 0 ; i < sum; i++){
                        shtml += '<tr>';
                        shtml += '	<td class=middle>' + (++num);
                        shtml += '	</td>';
                        var $targetEle = $(this).parent().parent();
                        if($targetEle.attr('id') == 'input-set'){
                            shtml += '	<td class="middle form-option" data-type="textinput">';
                            shtml += '		<input type="text" disabled/>';
                        }else if($targetEle.attr('id') == 'radio-set'){
                            shtml += '	<td class="middle form-option" data-type="radio">';
                            shtml += '      <input type="radio" disabled/>我是单选框';
                        }else if($targetEle.attr('id') == 'checkbox-set'){
                            shtml += '	<td class="middle form-option" data-type="checkbox">';
                            shtml += '      <input type="checkbox" disabled/>我是复选框';
                        }else if($targetEle.attr('id') == 'textarea-set'){
                            shtml += '	<td class="middle form-option" data-type="textarea">';
                            shtml += '      <textarea disabled>我是文本域</textarea>';
                        }else if($targetEle.attr('id') == 'select-set'){
                            shtml += '	<td class="middle form-option" data-type="select">';
                            shtml += '<select disabled>';
                            shtml += '	<option value="0">--请选择--';
                            shtml += '	</option>';
                            shtml += '	<option value="1">选项2';
                            shtml += '	</option>';
                            shtml += '</select>';
                        }else if($targetEle.attr('id') == 'button-set'){
                            shtml += '	<td class="middle form-option" data-type="button">';
                            shtml += '<a href="javascript:;" class="btn btn-default" disabled>我是按钮</a>';
                        }
                        shtml += '	</td>';
                        shtml += '	<td class="text-center middle">';
                        shtml += '		<a href="javascript:;">';
                        shtml += '			<i class="fa fa-chevron-up up">';
                        shtml += '			</i>';
                        shtml += '		</a>';
                        shtml += '	</td>';
                        shtml += '	<td class="text-center middle">';
                        shtml += '		<a href="javascript:;">';
                        shtml += '			<i class="fa fa-chevron-down down">';
                        shtml += '			</i>';
                        shtml += '		</a>';
                        shtml += '	</td>';
                        shtml += '</tr>';
                    }
                    $('#form-table').children().children('tbody').html(shtml);
                });
            }
        })();


        //图标点击变色
        $(document).on('click', '.icon', function(){
            $('.icon').removeClass('text-danger');
           $(this).addClass('text-danger');
        });


        //属性列表，编辑文本，修改对应元素文本内容
        $(document).on('blur', '.edit-text', function(){
            var value = $(this).val();
            var btnText = $('.bd-all-blue').html();
            var textIndex = btnText.lastIndexOf('</i>');
            if(textIndex != -1){
                $('.bd-all-blue').html(btnText.slice(0, textIndex+4) + value);
            }else{
                $('.bd-all-blue').html(value);
            }
        });
        //属性列表，编辑下拉框，修改对应元素class
        $(document).on('change', '.edit-select', function(){
            //用于存储代表为标签属性的数组
            var $choseElement = $(this).find('option:selected');
            var $siblings = $choseElement.siblings();
            for(var i = 0; i < $siblings.length; i++){
                if($($siblings[i]).attr('selected') == 'selected'){
                    $($siblings[i]).removeAttr('selected');
                    var removeClassName = $($siblings[i]).val();
                    $('.bd-all-blue').removeClass(removeClassName);
                }
            }
            $choseElement.attr('selected', true);
            $('.bd-all-blue').addClass($choseElement.val());
        });
        //属性列表，编辑按钮图标，为按钮添加图标
        $('#icon-choose').click(function(){
            var $icons =  $(this).parent().prev().children();
            for(var i = 0; i < $icons.length; i++){
                if($($icons[i]).hasClass('text-danger')){
                    $($icons[i]).removeClass('text-danger');
                    var text = $('.bd-all-blue').text();
                    var iconHtml = '<i class="' + $($icons[i]).attr('class') +'"></i>';
                    iconHtml = iconHtml.replace('text-primary', '');
                    $('.bd-all-blue').html(iconHtml + text);
                }
            }
        });
        //属性列表，编辑表单元素可用性，修改对应元素可用性
        $(document).on('change', '.edit-usability', function(){
            //用于存储代表为标签属性的数组
            var $choseElement = $(this).find('option:selected');
            var $siblings = $choseElement.siblings();
            for(var i = 0; i < $siblings.length; i++){
                if($($siblings[i]).attr('selected') == 'selected'){
                    $($siblings[i]).removeAttr('selected');
                }
            }
            $choseElement.attr('selected', true);
            var attribute = $choseElement.val();
            if(attribute == 'readonly'){
                $('.bd-all-blue').attr('readonly', 'readonly');
            }else{
                $('.bd-all-blue').removeAttr('readonly');
            }
        });
        //属性列表，编辑表单元素提示词,修改对应元素提示词
        $(document).on('blur', '.edit-hint', function(){
            var value = $(this).val();
            $('.bd-all-blue').attr('placeholder', value);
        });
        //todo TYPE_XXOO类时修改此处4
        //属性列表，编辑图片路径,修改对应图片
        $(document).on('blur', '.edit-img', function(){
            var value = $(this).val();
            $('.bd-all-blue').attr('src', value);
        });
        //属性列表，编辑超链接路径，修改对应超链接路径
        $(document).on('blur', '.edit-href', function(){
            var value = $(this).val();
            $('.bd-all-blue').attr('href', value);
        });
        //属性列表，编辑表单action属性，修改表单action属性的值
        $(document).on('blur', '.edit-action', function(){
            var value = $(this).val();
            $('.bd-all-blue').attr('action', value);
        });
        //属性列表,编辑元素name属性值
        $(document).on('blur', '.edit-name', function(){
            var value = $(this).val();
            $('.bd-all-blue').attr('name', value);
        });
        $(document).on('blur', '.edit-tagalonetext', function(){
            var value = $(this).val();
            var $targetEle = $('.bd-all-blue');
            var copyStr = $targetEle[0].outerHTML;
            $targetEle.parent().html(copyStr + value);
        })

    })();

    //确定选择的元素属于哪个类,参数，1、所有类的数组。2、当前选择的元素对象。
    function searchClass(allClass, element){
        for(var i = 0; i < allClass.length; i++){
            var targetClass = new allClass[i]();
            var test = targetClass.test(element);
            if(test){
                return targetClass;
            }
        }
    }
    //生成属性列表的html代码字符串
    function list(elementClass, element){
        var str =elementClass.toList(element);
        $('#editor-right').html(str);
    }

    //获取添加元素属于哪个类
    function addEleClass(_this){
        return $(_this).attr('data-class');
    }
    //获取添加元素的html字符串
    function addElement(eleClass, _this){
        var str = null;
        //todo 判断点击按钮属于哪个类
        if(eleClass == 'GridSystem'){
            var attrArr = $(_this).attr('data-attr').split(' ');
            str = new GridSystem().toHTML(attrArr);
        }else if(eleClass == 'ResponsiveTable'){
            var rowNum = parseInt($('#rows').val());
            var colNum = parseInt($('#cols').val());
            str = new ResponsiveTable().toHTML(rowNum, colNum);
        }else if(eleClass == 'Button'){
            str = new Button().toHTML();
        }else if(eleClass == 'TextInput'){
            str = new TextInput().toHTML();
        }else if(eleClass == 'Image'){
            str = new Image().toHTML();
        }else if(eleClass == 'HyperLink'){
            str = new HyperLink().toHTML();
        }else if(eleClass == 'SplitButton'){
            str = new SplitButton().toHTML();
            console.log(str);
        }else if(eleClass == 'Panel'){
            str = new Panel().toHTML();
        }else if(eleClass == 'PageHeader'){
            str = new PageHeader().toHTML();
        }else if(eleClass == 'Breadcrumb'){
            str = new Breadcrumb().toHTML(2);
        }else if(eleClass == 'FormInline'){
            str = new FormInline().toHTML(2);
        }else if(eleClass == 'FormHorizontal'){
            var $trs = $('#form-table').find('tbody>tr');
            var num = $trs.length;
            var widgetNameArr = [];
            $trs.each(function(){
                var type = $(this).children('.form-option').attr('data-type');
                if(type == 'textinput'){
                    widgetNameArr.push(TextInput);
                }else if(type == 'radio'){
                    widgetNameArr.push(FormHorizontalRadioBox);
                }else if(type == 'checkbox'){
                    widgetNameArr.push(FormHorizontalCheckboxBox);
                }else if(type == 'textarea'){
                    widgetNameArr.push(Textarea);
                }else if(type == 'select'){
                    widgetNameArr.push(Select);
                }else if(type == 'button'){
                    widgetNameArr.push(Button);
                }
            });
            str = new FormHorizontal().toHTML(num, widgetNameArr, 2);
        }else if(eleClass == 'Textarea'){
            str = new Textarea().toHTML();
        }else if(eleClass == 'Select'){
            str = new Select().toHTML(3);
        }else if(eleClass == 'Pagination'){
            str = new Pagination().toHTML(5);
        }
        return str;
    }

    //todo 增加TYPE_XXOO类时修改此处6
    var TYPE_USABILITY = 1;
    var TYPE_TEXT = 2;
    var TYPE_SELECT = 3;
    var TYPE_PIXEL = 4;
    var TYPE_ICON = 5;
    var TYPE_HINT = 6;
    var TYPE_IMG = 7;
    var TYPE_HREF = 8;
    var TYPE_DATATOGGLE = 9;
    var TYPE_ACTION = 10;
    var TYPE_TAGALONETEXT = 11;
    var TYPE_NAME = 12;

    var icons = ["fa-adjust","fa-anchor","fa-archive","fa-arrows","fa-arrows-h","fa-arrows-v","fa-asterisk","fa-ban","fa-bar-chart-o","fa-barcode","fa-bars","fa-beer","fa-bell","fa-bell-o","fa-bolt","fa-book","fa-bookmark","fa-bookmark-o","fa-briefcase","fa-bug","fa-building-o","fa-bullhorn","fa-bullseye","fa-calendar","fa-calendar-o","fa-camera","fa-camera-retro","fa-caret-square-o-down","fa-caret-square-o-left","fa-caret-square-o-right","fa-caret-square-o-up","fa-certificate","fa-check","fa-check-circle","fa-check-circle-o","fa-check-square","fa-check-square-o","fa-circle","fa-circle-o","fa-clock-o","fa-cloud","fa-cloud-download","fa-cloud-upload","fa-code","fa-code-fork","fa-coffee","fa-cog","fa-cogs","fa-comment","fa-comment-o","fa-comments","fa-comments-o","fa-compass","fa-credit-card","fa-crop","fa-crosshairs","fa-cutlery","fa-dashboard","fa-desktop","fa-dot-circle-o","fa-download","fa-edit","fa-ellipsis-h","fa-ellipsis-v","fa-envelope","fa-envelope-o","fa-eraser","fa-exchange","fa-exclamation","fa-exclamation-circle","fa-exclamation-triangle","fa-external-link","fa-external-link-square","fa-eye","fa-eye-slash","fa-female","fa-fighter-jet","fa-film","fa-filter","fa-fire","fa-fire-extinguisher","fa-flag","fa-flag-checkered","fa-flag-o","fa-flash","fa-flask","fa-folder","fa-folder-o","fa-folder-open","fa-folder-open-o","fa-frown-o","fa-gamepad","fa-gavel","fa-gear","fa-gears","fa-gift","fa-glass","fa-globe","fa-group","fa-hdd-o","fa-headphones","fa-heart","fa-heart-o","fa-home","fa-inbox","fa-info","fa-info-circle","fa-key","fa-keyboard-o","fa-laptop","fa-leaf","fa-legal","fa-lemon-o","fa-level-down","fa-level-up","fa-lightbulb-o","fa-location-arrow","fa-lock","fa-magic","fa-magnet","fa-mail-forward","fa-mail-reply","fa-mail-reply-all","fa-male","fa-map-marker","fa-meh-o","fa-microphone","fa-microphone-slash","fa-minus","fa-minus-circle","fa-minus-square","fa-minus-square-o","fa-mobile","fa-mobile-phone","fa-money","fa-moon-o","fa-music","fa-pencil","fa-pencil-square","fa-pencil-square-o","fa-phone","fa-phone-square","fa-picture-o","fa-plane","fa-plus","fa-plus-circle","fa-plus-square","fa-plus-square-o","fa-power-off","fa-print","fa-puzzle-piece","fa-qrcode","fa-question","fa-question-circle","fa-quote-left","fa-quote-right","fa-random","fa-refresh","fa-reply","fa-reply-all","fa-retweet","fa-road","fa-rocket","fa-rss","fa-rss-square","fa-search","fa-search-minus","fa-search-plus","fa-share","fa-share-square","fa-share-square-o","fa-shield","fa-shopping-cart","fa-sign-in","fa-sign-out","fa-signal","fa-sitemap","fa-smile-o","fa-sort","fa-sort-alpha-asc","fa-sort-alpha-desc","fa-sort-amount-asc","fa-sort-amount-desc","fa-sort-asc","fa-sort-desc","fa-sort-down","fa-sort-numeric-asc","fa-sort-numeric-desc","fa-sort-up","fa-spinner","fa-square","fa-square-o","fa-star","fa-star-half","fa-star-half-empty","fa-star-half-full","fa-star-half-o","fa-star-o","fa-subscript","fa-suitcase","fa-sun-o","fa-superscript","fa-tablet","fa-tachometer","fa-tag","fa-tags","fa-tasks","fa-terminal","fa-thumb-tack","fa-thumbs-down","fa-thumbs-o-down","fa-thumbs-o-up","fa-thumbs-up","fa-ticket","fa-times","fa-times-circle","fa-times-circle-o","fa-tint","fa-toggle-down","fa-toggle-left","fa-toggle-right","fa-toggle-up","fa-trash-o","fa-trophy","fa-truck","fa-umbrella","fa-unlock","fa-unlock-alt","fa-unsorted","fa-upload","fa-user","fa-users","fa-video-camera","fa-volume-down","fa-volume-off","fa-volume-up","fa-warning","fa-wheelchair","fa-wrench", "fa-check-square","fa-check-square-o","fa-circle","fa-circle-o","fa-dot-circle-o","fa-minus-square","fa-minus-square-o","fa-plus-square","fa-plus-square-o","fa-square","fa-square-o", "fa-bitcoin","fa-btc","fa-cny","fa-dollar","fa-eur","fa-euro","fa-gbp","fa-inr","fa-jpy","fa-krw","fa-money","fa-rmb","fa-rouble","fa-rub","fa-ruble","fa-rupee","fa-try","fa-turkish-lira","fa-usd","fa-won","fa-yen","fa-align-center","fa-align-justify","fa-align-left","fa-align-right","fa-bold","fa-chain","fa-chain-broken","fa-clipboard","fa-columns","fa-copy","fa-cut","fa-dedent","fa-eraser","fa-file","fa-file-o","fa-file-text","fa-file-text-o","fa-files-o","fa-floppy-o","fa-font","fa-indent","fa-italic","fa-link","fa-list","fa-list-alt","fa-list-ol","fa-list-ul","fa-outdent","fa-paperclip","fa-paste","fa-repeat","fa-rotate-left","fa-rotate-right","fa-save","fa-scissors","fa-strikethrough","fa-table","fa-text-height","fa-text-width","fa-th","fa-th-large","fa-th-list","fa-underline","fa-undo","fa-unlink","fa-angle-double-down","fa-angle-double-left","fa-angle-double-right","fa-angle-double-up","fa-angle-down","fa-angle-left","fa-angle-right","fa-angle-up","fa-arrow-circle-down","fa-arrow-circle-left","fa-arrow-circle-o-down","fa-arrow-circle-o-left","fa-arrow-circle-o-right","fa-arrow-circle-o-up","fa-arrow-circle-right","fa-arrow-circle-up","fa-arrow-down","fa-arrow-left","fa-arrow-right","fa-arrow-up","fa-arrows","fa-arrows-alt","fa-arrows-h","fa-arrows-v","fa-caret-down","fa-caret-left","fa-caret-right","fa-caret-square-o-down","fa-caret-square-o-left","fa-caret-square-o-right","fa-caret-square-o-up","fa-caret-up","fa-chevron-circle-down","fa-chevron-circle-left","fa-chevron-circle-right","fa-chevron-circle-up","fa-chevron-down","fa-chevron-left","fa-chevron-right","fa-chevron-up","fa-hand-o-down","fa-hand-o-left","fa-hand-o-right","fa-hand-o-up","fa-long-arrow-down","fa-long-arrow-left","fa-long-arrow-right","fa-long-arrow-up","fa-toggle-down","fa-toggle-left","fa-toggle-right","fa-toggle-up","fa-arrows-alt","fa-backward","fa-compress","fa-eject","fa-expand","fa-fast-backward","fa-fast-forward","fa-forward","fa-pause","fa-play","fa-play-circle","fa-play-circle-o","fa-step-backward","fa-step-forward","fa-stop","fa-youtube-play","fa-adn","fa-android","fa-apple","fa-bitbucket","fa-bitbucket-square","fa-bitcoin","fa-btc","fa-css3","fa-dribbble","fa-dropbox","fa-facebook","fa-facebook-square","fa-flickr","fa-foursquare","fa-github","fa-github-alt","fa-github-square","fa-gittip","fa-google-plus","fa-google-plus-square","fa-html5","fa-instagram","fa-linkedin","fa-linkedin-square","fa-linux","fa-maxcdn","fa-pagelines","fa-pinterest","fa-pinterest-square","fa-renren","fa-skype","fa-stack-exchange","fa-stack-overflow","fa-trello","fa-tumblr","fa-tumblr-square","fa-twitter","fa-twitter-square","fa-vimeo-square","fa-vk","fa-weibo","fa-windows","fa-xing","fa-xing-square","fa-youtube","fa-youtube-play","fa-youtube-square" , "fa-ambulance","fa-h-square","fa-hospital-o","fa-medkit","fa-plus-square","fa-stethoscope","fa-user-md","fa-wheelchair"];

    //属性列表编辑文本
    function editText(val){
        return '<input class="edit-text w90 tc-666" type="text" placeholder="输入文本值" value="' + val + '"/>';
    }
    //属性列表编辑属性长度
    function editPixel(){
        return '<input class="edit-pixel w90 tc-666" type="text" placeholder="输入数值"/>';
    }
    //属性列表图标展示
    (function(){
        for(var i = 0; i < icons.length; i++){
            $('#myModal3').find('.modal-body').append('<i class="fa ' + icons[i] + ' text-primary icon"></i>');
        }

    })();
    //属性列表编辑图标
    function editIcon(){
        return '<a href="javascript:;" class="btn btn-primary icon-show" data-toggle="modal" data-target="#myModal3">选择图标</a>';
    }
    //属性列表编辑提示文字
    function editHint(valueDescription){
        if(valueDescription){
            return '<input class="edit-hint w90 tc-666" type="text" value="' + valueDescription + '"/>';
        }
        return '<input class="edit-hint w90 tc-666" type="text" placeholder="输入提示文字"/>';
    }
    //属性列表编辑选项列表,参数列表：1、选项值描述数组，2、选项值数组，3、默认选项值索引
    function editSelect(valueDescriptionArr, fixValue, valueArr, defaultValueIndex){
        var shtml = '';
        shtml += '<select class="edit-select form-control">';
        for(var i = 0; i < valueDescriptionArr.length; i++){
            if(i == defaultValueIndex){
                shtml += '    <option value="' + fixValue + ' ' + valueArr[i] + '" selected="selected">';
            }else{
                shtml += '    <option value="' + fixValue + ' ' + valueArr[i] + '">';
            }
            shtml += valueDescriptionArr[i];
            shtml += '    </option>';
        }
        shtml += '</select>';
        return shtml;
    }
    //属性列表编辑表单元素可用性,参数列表：1、选项值描述数组，2、选项值数组，3、默认选项值索引
    function editUsability(valueDescriptionArr, valueArr, defaultValueIndex){
        var shtml = '';
        shtml += '<select class="edit-usability form-control">';
        for(var i = 0; i < valueDescriptionArr.length; i++){
            if(i == defaultValueIndex){
                shtml += '    <option value="' + valueArr[i] + '" selected="selected">';
            }else{
                shtml += '    <option value="' + valueArr[i] + '">';
            }
            shtml += valueDescriptionArr[i];
            shtml += '    </option>';
        }
        shtml += '</select>';
        return shtml;
    }
    //属性列表编辑文本
    function editImg(val){
        return '<input class="edit-img w90 tc-666" type="text" placeholder="输入图片路径" value="' + val + '"/>';
    }
    //todo 增加TYPE_XXOO类时修改此处5
    //属性列表编辑超链接地址
    function editHref(val){
        return '<input class="edit-href w90 tc-666" type="text" placeholder="输入超链接地址" value="' + val + '"/>';
    }
    //属性列表编辑自定义属性data-toggle
    function editDataToggle(val){
        return '<input class="edit-data-toggle w90 tc-666" type="text" value="' + val + '" disabled/>';
    }
    //属性列表编辑表单action
    function editAction(val){
        return '<input class="edit-action w90 tc-666" type="text" value="' + val + '"/>';
    }
    function editTagAloneText(val){
        return '<input class="edit-tagalonetext w90 tc-666" type="text" value="' + val + '"/>';
    }
    function editName(val){
        return '<input class="edit-name w90 tc-666" type="text" value="' + val + '"/>';
    }
    //元素类的所有子类
    //todo 每创建一个类，要在这里添加到数组中.注：Div类放最后
    var ElementChildren = [Facade, DropdownButton, Button, TextInput, Image, SplitButton, HyperLinkButton, DropdownCaret, Textarea, Select, Option, Radio, Checkbox,  Layout, GridSystem, Proportion, ResponsiveTable, Table, Row, Column, HyperLink, DropdownMenu, DropdownMenuList, Panel, PanelHeading, PanelBody, PageHeader, PageHeaderTitle, Breadcrumb, BreadcrumbList, FormInline, FormInlineGroup, FormInlineLabel, FormHorizontal, FormHorizontalGroup, FormHorizontalLabel, FormHorizontalProportion, FormHorizontalRadioBox, FormHorizontalCheckboxBox, Pagination, PaginationList, Div];
    //元素类
    function Element () {
        //标签名
    	this.tagName = null;
        //父类
        this.constructionParent = null;
        //子类
        this.constructionChildren = null;
        //样式属性
        this.styleAttrs = {
            //backgroundColor : new Attribute('背景色', TYPE_SELECT, '', ['', 'bg-primary', 'bg-success', 'bg-danger', 'bg-info', 'bg-warning'], ['默认', '深蓝色', '绿色', '红色', '浅蓝', '黄色'], 0),
            //textColor : new Attribute('文本颜色', TYPE_SELECT ,'', ['', 'text-primary', 'text-success', 'text-danger', 'text-info', 'text-warning'], ['默认','深蓝色', '绿色', '红色', '浅蓝', '黄色'], 0)
        };
        //布局属性
        this.layoutAttrs = {
            //width : new Attribute('宽度', TYPE_PIXEL, '', null, null, null),
            //height : new Attribute('高度', TYPE_PIXEL, '', null, null, null),
            //floating : new Attribute('浮动', TYPE_SELECT, '', ['', 'pull-left','pull-right'], ['无浮动', '左浮动','右浮动'], 0),
            //align : new Attribute('文本对齐',TYPE_SELECT, '', ['text-center', 'text-left', 'text-right'], ['居中对齐','居做对齐','居右对齐'], 0),
            //middle : new Attribute('垂直居中', TYPE_SELECT, '', ['', 'middle'], ['否', '是'], 0)
        };
        //检测点击的是哪个类
        this.test = function(node){
            return false;
        };
        //为样式属性添加内容
        this.setStyleAttrs = function(name, value){
            this.styleAttrs[name] = value;
        };
        //为布局属性添加内容
        this.setLayoutAttrs = function(name, value){
            this.layoutAttrs[name] = value;
        };
        //提供属性修改列表的代码结构
        this.toList=function(element){
            var shtml = '';
            shtml += '<div class="table-responsive">';
            shtml += '    <table class="table-bordered">';
            shtml += '        <tr>';
            shtml += '            <td width="90">属性</td>';
            shtml += '            <td width="90" class="text-center">值</td>';
            shtml += '        </tr>';
            shtml += '        <tr>';
            shtml += '            <td colspan="2">';
            shtml += '                样式属性';
            shtml += '            </td>';
            shtml += '        </tr>';
            for(var attr in this.styleAttrs){
                this.styleAttrs[attr].setAttrValue(element);
                var styleType = this.styleAttrs[attr].type;
                var styleName = this.styleAttrs[attr].name;
                var styleFixValue = this.styleAttrs[attr].fixValue;
                var styleValues = this.styleAttrs[attr].values;
                var styleValueDescriptions = this.styleAttrs[attr].valueDescriptions;
                var styleDefaultValue =  this.styleAttrs[attr].defaultValue;
                shtml += '        <tr>';
                shtml += '<td>';
                shtml += styleName;
                shtml += '</td>';
                shtml += '<td class="text-center">';
                //todo 增加TYPE_XXOO类时修改此处1
                if(styleType == TYPE_USABILITY){
                    shtml +=editUsability(styleValueDescriptions, styleValues ,styleDefaultValue);
                }else if(styleType == TYPE_TEXT){
                    shtml += editText(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_SELECT){
                    shtml += editSelect(styleValueDescriptions, styleFixValue, styleValues, styleDefaultValue);
                }else if(styleType == TYPE_PIXEL){
                    shtml += editPixel();
                }else if(styleType == TYPE_ICON){
                    shtml += editIcon();
                }else if(styleType == TYPE_HINT){
                    shtml += editHint(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_IMG){
                    shtml += editImg(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_HREF){
                    shtml += editHref(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_DATATOGGLE){
                    shtml += editDataToggle(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_ACTION){
                    shtml += editAction(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_TAGALONETEXT){
                    shtml += editTagAloneText(styleValueDescriptions[styleDefaultValue]);
                }else if(styleType == TYPE_NAME){
                    shtml += editName(styleValueDescriptions[styleDefaultValue]);
                }
                shtml += '</td>';
                shtml += '        </tr>';
            }
            shtml += '        <tr>';
            shtml += '            <td colspan="2">';
            shtml += '                布局属性';
            shtml += '            </td>';
            shtml += '        </tr>';
            for(var attr in this.layoutAttrs){
                this.layoutAttrs[attr].setAttrValue(element);
                var layoutType = this.layoutAttrs[attr].type;
                var layoutName = this.layoutAttrs[attr].name;
                var layoutFixValue = this.layoutAttrs[attr].fixValue;
                var layoutValues = this.layoutAttrs[attr].values;
                var layoutValueDescriptions = this.layoutAttrs[attr].valueDescriptions;
                var layoutDefaultValue = this.layoutAttrs[attr].defaultValue;
                shtml += '        <tr>';
                shtml += '<td>';
                shtml += layoutName;
                shtml += '</td>';
                shtml += '<td class="text-center">';
                //todo 增加TYPE_XXOO类时修改此处2
                if(layoutType == TYPE_USABILITY){
                    shtml += editUsability(layoutValueDescriptions, layoutValues ,layoutDefaultValue);
                }else if(layoutType == TYPE_TEXT){
                    shtml += editText(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_SELECT){
                    shtml += editSelect(layoutValueDescriptions, layoutFixValue, layoutValues, layoutDefaultValue);
                }else if(layoutType == TYPE_PIXEL){
                    shtml += editPixel();
                }else if(layoutType == TYPE_ICON){
                    shtml += editIcon();
                }else if(layoutType == TYPE_HINT){
                    shtml += editHint();
                }else if(layoutType == TYPE_IMG){
                    shtml += editImg(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_HREF){
                    shtml += editHref(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_DATATOGGLE){
                    shtml += editDataToggle(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_ACTION){
                    shtml += editAction(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_TAGALONETEXT){
                    shtml += editTagAloneText(layoutValueDescriptions[layoutDefaultValue]);
                }else if(layoutType == TYPE_NAME){
                    shtml += editName(layoutValueDescriptions[layoutDefaultValue]);
                }
                shtml += '</td>';
                shtml += '        </tr>';
            }
            shtml += '    </table>';
            shtml += '</div>';
            return shtml;
        };
        //构建
        this.builder=function(){
            return [];
            // return [ 'cols', 'rows' ];
        };
        //提供生成类的代码结构
        this.toHTML = function(node) {
            //    return '<' + this.tagName + '></' + this.tagName + '>';
        };
        //插入子元素若干方法
        this.insideInsertChild = function(element, childStr){
            alert('当前元素不支持此操作');
        };
        this.beforeInsertChild = function(element, childStr){
            $(element).before(childStr);
        };
        this.afterInsertChild = function(element, childStr){
            $(element).after(childStr);
        };
        this.wrapInsertChild = function(element, childStr){
            alert('当前元素不支持此操作');
        }
    }

    //属性类
    function Attribute(name, type, fixValue, values, valueDescriptions, defaultValue){
        this.name = name;
        this.type = type;
        this.fixValue = fixValue;
        this.values = values;
        this.valueDescriptions = valueDescriptions;
        this.defaultValue = defaultValue;
        //todo 完善Attribute类中设置、获取属性值的方法
        //todo 增加TYPE_XXOO类时修改此处3
        //点击节点，更改属性列表中的属性值
        this.setAttrValue = function(node){
            if(this.type == TYPE_SELECT){
                var attrValue  = this._getAttrValueFromNodeClass(node);
                for(var i = 0; i < this.values.length; i++){
                    if(this.values[i] == attrValue){
                        if(i != this.defaultValue){
                            this.defaultValue = i;
                        }
                    }
                }
            }else if(this.type == TYPE_TEXT){
                this.valueDescriptions[this.defaultValue] = this._getAttrValueFromNodeText(node);
            }else if(this.type == TYPE_USABILITY){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'readonly');
                if(attrValue != undefined){
                    this.defaultValue = 1;
                }
            }else if(this.type == TYPE_HINT){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'placeholder');
                if(attrValue != undefined){
                    this.valueDescriptions[this.defaultValue] = attrValue;
                }
            }else if(this.type == TYPE_IMG){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'src');
                this.values[this.defaultValue] = attrValue;
                this.valueDescriptions[this.defaultValue] = attrValue;
            }else if(this.type == TYPE_HREF){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'href');
                this.values[this.defaultValue] = attrValue;
                this.valueDescriptions[this.defaultValue] = attrValue;
            }else if(this.type == TYPE_DATATOGGLE){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'data-toggle');
                this.values[this.defaultValue] = attrValue;
            }else if(this.type == TYPE_ACTION){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'action');
                this.values[this.defaultValue] = attrValue;
                this.valueDescriptions[this.defaultValue] = attrValue;
            }else if(this.type == TYPE_NAME){
                var attrValue = this._getAttrValueFromNodeAttr(node, 'name');
                this.values[this.defaultValue] = attrValue;
                this.valueDescriptions[this.defaultValue] = attrValue;
            }else if(this.type == TYPE_TAGALONETEXT){
                var attrValue = this._getAttrValueFromParentNodeText(node);
                this.values[this.defaultValue] = attrValue;
                this.valueDescriptions[this.defaultValue] = attrValue;
            }

        };

        //内部专用，从节点的class值中获取需要的属性值。参数：1、当前节点
        this._getAttrValueFromNodeClass = function(node){
            var classNames = $(node).attr('class');
            classNames = classNames.replace('bd-all-blue', '');
            classNames = classNames.replace(/^\s+|\s+$/, '');
            var arr = classNames.split(' ');
            for(var i = 0;i < arr.length ;i++){
                for(var j = 0; j < this.values.length; j++){
                    if(arr[i] == this.values[j]){
                        return arr[i];
                    }
                }
            }
        };
        //内部专用，获取节点的文本值。参数：1、当前节点
        this._getAttrValueFromNodeText = function(node){
            return $(node).text();
        };
        //内部专用，获取节点父节点的文本值，参数：1、当前节点
        this._getAttrValueFromParentNodeText = function(node){
            return $(node).parent().text();
        };
        //内部专用，获取节点的某一属性(不包括class)。参数：1、当前节点对象，2、需要获取的属性
        this._getAttrValueFromNodeAttr = function(node, nodeAttr){
            return $(node).attr(nodeAttr);
        }
    }

    //todo 扩展Attribute
    function TextAttribute(){
        this.getValue = function(node)
        {
            return node.text();
        }

        this.toHTML = function()
        {
            return '';
        }
    }

    //展示类
    function Facade(){
        Element.apply(this,null);
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            return false;
        }
    }
    //按钮类
    function Button(){
        Facade.apply(this,null);
        this.tagName = 'button';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.classNames = $(node).attr('class').split(' ');
            obj.tagName = $(node)[0].tagName.toLowerCase();
            var classNameAccord1 = false;
            var classNameAccord2 = false;
            var tagNameAccord =false;
            for(var i = 0; i <obj.classNames.length; i++){
                if(obj.classNames[i] == 'btn'){
                    classNameAccord1 = true;
                }else if(/^btn-[a-z]+$/.test(obj.classNames[i])){
                    classNameAccord2 = true;
                }
            }
            if(obj.tagName == 'button' || obj.tagName == 'a'){
                tagNameAccord = true;
            }
            if(classNameAccord1 && classNameAccord2 && tagNameAccord){
                return true;
            }
            return false;

        };
        //样式属性
        this.setStyleAttrs('theme', new Attribute('按钮外观', TYPE_SELECT, 'btn', ['btn-default', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning', 'btn-danger'], ['默认', '深蓝色', '绿色', '浅蓝色', '黄色', '红色'], 0));
        this.setStyleAttrs('text', new Attribute('按钮文本', TYPE_TEXT, '', [''], ['button'], 0));
        this.setStyleAttrs('icon', new Attribute('按钮图标', TYPE_ICON, '', icons, icons, 0));
        //布局属性
        this.setLayoutAttrs('size', new Attribute('按钮大小', TYPE_SELECT, '', ['', 'btn-lg', 'btn-sm', 'btn-xs'], ['默认', '大按钮', '小按钮', '超小按钮'], 0));
        //构建类
        this.builder = function(){
            return [this.styleAttrs.theme, this.styleAttrs.text];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    var values = builder[i].values;
                    leftstr += fixValue + ' ' + values[defaultValue] + ' ';
                }else if(builder[i].type == TYPE_TEXT){
                    var valueDescriptions = builder[i].valueDescriptions;
                    rightstr = valueDescriptions[defaultValue] + rightstr;
                }
            }
            leftstr += '">';
            return leftstr + rightstr;
        };
    }
    //文本输入框类
    function TextInput(){
        Facade.apply(this,null);
        this.tagName = 'input';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.type = $(node).attr('type');
            if(obj.tagName == 'input' && obj.type == 'text'){
                return true;
            }
            return false;
        };
        //样式属性
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-control'], ['默认'], 0));
        this.setStyleAttrs('hint', new Attribute('提示文字', TYPE_HINT, '', [''], [''], 0));
        this.setStyleAttrs('usability', new Attribute('可用性', TYPE_USABILITY, '', ['','readonly'], ['可用', '禁用'], 0));
        //构建类
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' type="text" ';
            var rightstr = '/>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                if(builder[i].type == TYPE_SELECT){
                    leftstr += ' class="' + value[defaultValue];
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                if(builder[i].type == TYPE_HINT){
                    var valueDescriptions = builder[i].valueDescriptions;
                    leftstr += 'placeholder="' + valueDescriptions[defaultValue] + '"';
                }
            }
            return leftstr + rightstr;
        }
    }
    //图片类
    function Image(){
        Facade.apply(this, null);
        this.tagName = 'img';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.src = $(node)[0].src;
            if(obj.tagName == 'img' && obj.src){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('src', new Attribute('图片路径', TYPE_IMG, '', ['http://ui.yidaochn.com/paimai/image/header-4.jpg'], [''], 0));
        this.builder = function(){
            return [this.styleAttrs.src];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName;
            var rightstr = '/>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                if(builder[i].type == TYPE_IMG){
                    leftstr += ' src="' + builder[i].values[defaultValue] + '"';
                }
            }
            return leftstr + rightstr;
        }
    }
    //分列式按钮类
    function SplitButton(){
        Facade.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren = {
            'HyperLinkButton' : HyperLinkButton,
            'DropdownButton' : DropdownButton,
            'DropdownMenu' : DropdownMenu
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'split-button'){
                    flag = true;
                }
            }
            if(obj.tagName == 'div' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('appearance', new Attribute('外观', TYPE_SELECT, 'split-button', ['btn-group'], ['默认外观'], 0));
        this.builder = function(){
            return [this.styleAttrs.appearance];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenHyperLinkButtonStr = new this.constructionChildren.HyperLinkButton().toHTML();
            var childrenDropdownButtonStr = new this.constructionChildren.DropdownButton().toHTML();
            var childrenDropdownMenuStr = new this.constructionChildren.DropdownMenu().toHTML();
            return left + childrenHyperLinkButtonStr + childrenDropdownButtonStr + childrenDropdownMenuStr + right;
        };
    }
    //超链接式按钮
    function HyperLinkButton(){
        Facade.apply(this, null);
        this.tagName = 'a';
        this.constructionParent = SplitButton;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.href = node.href;
            obj.classNames = $(node).attr('class').split(' ');
            var flag1 = false;
            var flag2 = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'btn'){
                    flag1 = true;
                }else if(/^btn-[a-z]+$/.test(obj.classNames[i])){
                    flag2 =true;
                }
            }
            if(obj.tagName == 'a' && obj.href && flag1 && flag2){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('按钮外观', TYPE_SELECT, 'btn', ['btn-default', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning', 'btn-danger'], ['默认', '深蓝色', '绿色', '浅蓝色', '黄色', '红色'], 0));
        this.setStyleAttrs('href', new Attribute('链接地址', TYPE_HREF, '', ['javascript:;'], [''], 0));
        this.setStyleAttrs('text', new Attribute('链接文本', TYPE_TEXT, '', ['我是按钮'], ['我是按钮'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme, this.styleAttrs.href, this.styleAttrs.text];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_HREF){
                    left += ' href="' + fixValue + ' ' + values[defaultValue] + '"';
                }else if(builder[i].type == TYPE_TEXT){
                    right = values[defaultValue] + right;
                }
            }
            left += '>';
            return left + right;
        };
    }
    //下拉按钮
    function DropdownButton(){
        Facade.apply(this, null);
        this.tagName = 'button';
        this.constructionParent = SplitButton;
        this.constructionChildren = {
            'DropdownCaret' : DropdownCaret
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.dataToggle = $(node).attr('data-toggle');
            var flag1 = false;
            var flag2 = false;
            var flag3 = false;
            for(var i = 0 ; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'btn'){
                    flag1 = true;
                }else if(/^btn-[a-z]+$/.test(obj.classNames[i])){
                    flag2 = true;
                }else if(obj.classNames[i] == 'dropdown-toggle'){
                    flag3 = true;
                }
            }
            if(obj.tagName == 'button' && /^\s*dropdown\s*$/.test(obj.dataToggle) && flag1 && flag2 && flag3){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('按钮外观', TYPE_SELECT, 'btn', ['btn-default', 'btn-primary', 'btn-success', 'btn-info', 'btn-warning', 'btn-danger'], ['默认', '深蓝色', '绿色', '浅蓝色', '黄色', '红色'], 0));
        this.setStyleAttrs('dropdownToggle', new Attribute('切换方式', TYPE_SELECT, '', ['dropdown-toggle'], ['默认'], 0));
        this.setStyleAttrs('identification', new Attribute('插件标识', TYPE_DATATOGGLE, '', ['dropdown'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme, this.styleAttrs.dropdownToggle, this.styleAttrs.identification];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_DATATOGGLE){
                    left += ' data-toggle="' + fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenCaretStr = new this.constructionChildren.DropdownCaret().toHTML();
            return left + childrenCaretStr + right;
        }
    }
    //下拉图标
    function DropdownCaret(){
        Facade.apply(this, null);
        this.tagName = 'span';
        this.constructionParent = DropdownButton;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'caret'){
                    flag = true;
                }
            }
            if(obj.tagName = 'span' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('caret', new Attribute('下拉图标', TYPE_SELECT, '', ['caret'], ['三角图标'], 0));
        this.builder = function(){
            return [this.styleAttrs.caret];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            return left + right;
        }
    }
    //下拉菜单
    function DropdownMenu(){
        Layout.apply(this, null);
        this.tagName = 'ul';
        this.constructionParent = SplitButton;
        this.constructionChildren = {
            'DropdownMenuList' : DropdownMenuList
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = true;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'dropdown-menu'){
                    flag = true;
                }
            }
            if(obj.tagName == 'ul' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('列表外观', TYPE_SELECT, '', ['dropdown-menu'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenListStr = new this.constructionChildren.DropdownMenuList().toHTML();
            return left + childrenListStr + right;
        }
    }
    //下拉菜单列表
    function DropdownMenuList(){
        Layout.apply(this, null);
        this.tagName = 'li';
        this.constructionParent = DropdownMenu;
        this.constructionChildren ={
            'HyperLink' : HyperLink
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.parent = $(node).parent();
            if(obj.tagName == 'li' && obj.parent.hasClass('dropdown-menu')){
                return true;
            }
            return false;
        };
        this.builder = function(){
            return [];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenLinkStr = new this.constructionChildren.HyperLink().toHTML();
            return left + childrenLinkStr + right;
        }
    }
    //文本域
    function Textarea(){
        Facade.apply(this, null);
        this.tagName = 'textarea';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-control'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'textarea' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-control'], ['默认'], 0));
        this.setStyleAttrs('hint', new Attribute('提示文字', TYPE_HINT, '', [''], [''], 0));
        this.setStyleAttrs('usability', new Attribute('可用性', TYPE_USABILITY, '', ['','readonly'], ['可用', '禁用'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName +'>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    leftstr += ' ' + fixValue + value[defaultValue];
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                if(builder[i].type == TYPE_HINT){
                    var valueDescriptions = builder[i].valueDescriptions;
                    leftstr += 'placeholder="' + valueDescriptions[defaultValue] + '"';
                }
            }
            leftstr += '>';
            return leftstr + rightstr;
        }
    }
    //下拉列表
    function Select(){
        Facade.apply(this, null);
        this.tagName = 'select';
        this.constructionparent = null;
        this.constructionChildren = {
            'Option' : Option
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-control'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'select' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-control'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName +'>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    leftstr += ' ' + fixValue + value[defaultValue];
                }
            }
            leftstr += '"';
            leftstr += '>';
            var childrenOptionStr = new this.constructionChildren.Option().toHTML(num);
            return leftstr + childrenOptionStr + rightstr;
        }
    }
    //下拉列表项
    function Option(){
        Facade.apply(this, null);
        this.tagName = 'option';
        this.constructionParent = Select;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            if(obj.tagName == 'option'){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('text', new Attribute('选项文本', TYPE_TEXT, '', ['我是选项'], ['我是选项'], 0));
        this.builder = function(){
            return [this.styleAttrs.text];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var str = '';
            for(var j = 0; j < num; j++){
                var leftstr = '<' + this.tagName + ' class="';
                var rightstr = '</' + this.tagName +'>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var value = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        leftstr += ' ' + fixValue + value[defaultValue];
                    }
                }
                leftstr += '"';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var value = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_TEXT){
                        rightstr = value[defaultValue] + rightstr;
                    }
                }
                leftstr += '>';
                str += leftstr + rightstr;
            }
            return str;
        };
    }
    //单选框
    function Radio(){
        Facade.apply(this, null);
        this.tagName = 'input';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.type = $(node).attr('type');
            if(obj.tagName == 'input' && obj.type == 'radio'){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('text', new Attribute('选项文本', TYPE_TAGALONETEXT, '',['我是选项'], ['我是选项'], 0));
        this.setStyleAttrs('name', new Attribute('name值', TYPE_NAME, '', ['radio1'], ['radio1'], 0));
        this.builder = function(){
            return [this.styleAttrs.text, this.styleAttrs.name];
        };
        this.toHTML = function(){
            var builder = this.builder();
            var str = '';
            var leftstr = '<' + this.tagName + ' type="radio" class="';
            var rightstr = '/>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    leftstr += ' ' + fixValue + value[defaultValue];
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_TAGALONETEXT){
                    rightstr += value[defaultValue];
                }else if(builder[i].type == TYPE_NAME){
                    leftstr += ' name="' + value[defaultValue] + '"';
                }
            }
            str += leftstr + rightstr;
            return str;
        }
    }
    //复选框
    function Checkbox(){
        Facade.apply(this, null);
        this.tagName = 'input';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.type = $(node).attr('type');
            if(obj.tagName == 'input' && obj.type == 'checkbox'){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('text', new Attribute('选项文本', TYPE_TAGALONETEXT, '',['我是选项'], ['我是选项'], 0));
        this.setStyleAttrs('name', new Attribute('name值', TYPE_NAME, '', ['checkbox1'], ['checkbox1'], 0));
        this.builder = function(){
            return [this.styleAttrs.text, this.styleAttrs.name];
        };
        this.toHTML = function(){
            var builder = this.builder();
            var str = '';
            var leftstr = '<' + this.tagName + ' type="checkbox" class="';
            var rightstr = '/>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    leftstr += ' ' + fixValue + value[defaultValue];
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var value = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_TAGALONETEXT){
                    rightstr += value[defaultValue];
                }else if(builder[i].type == TYPE_NAME){
                    leftstr += ' name="' + value[defaultValue] + '"';
                }
            }
            str += leftstr + rightstr;
            return str;
        }
    }

    //布局类
    function Layout(){
        Element.apply(this,null);
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(){
            return false;
        };
        //插入子元素若干方法
        this.insideInsertChild = function(element, childStr){
            $(element).append(childStr);
        };
    }

    //栅格类
    function GridSystem(){
        Layout.apply(this,null);
        this.tagName ='div';
        this.constructionParent = null;
        this.constructionChildren = {
            'Proportion' : Proportion
        };
        this.test = function(node){
          var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'row'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true){
                return true;
            }
            return false;
        };
        this.setLayoutAttrs('row', new Attribute('行布局', TYPE_SELECT, '', ['row'], ['默认'], 0));
        this.builder = function(){
            return [this.layoutAttrs.row];
        };
        this.toHTML = function(classArr){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    var values = builder[i].values;
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenProportionStr = new this.constructionChildren.Proportion().toHTML(classArr);
            return left + childrenProportionStr + right;
        };
    }
    //占比类
    function Proportion(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = GridSystem;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.parent = $(node).parent();
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(/^col-md-\d+$/.test(obj.classNames[i])){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true && obj.parent.hasClass('row')){
                return true;
            }
            return false;
        };
        this.setLayoutAttrs('proportion', new Attribute('占比', TYPE_SELECT, '', ['col-md-1', 'col-md-2', 'col-md-3', 'col-md-4', 'col-md-5', 'col-md-6', 'col-md-7', 'col-md-8', 'col-md-9', 'col-md-10', 'col-md-11', 'col-md-12'], ['1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'], 0));
        this.builder = function(){
            return [this.layoutAttrs.proportion];
        };
        this.toHTML = function(classArr){
            var str = '';
            var builder = this.builder();
            for(var i = 0; i < classArr.length; i++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var j = 0; j < builder.length; j++){
                    var defaultValue = builder[j].defaultValue;
                    var fixValue = builder[j].fixValue;
                    var value = builder[j].values;
                    if(builder[j].type == TYPE_SELECT){
                        for(var k = 0; k < value.length; k++){
                            if(classArr[i] == value[k]){
                                defaultValue = k;
                                break;
                            }
                        }
                        left += fixValue + ' ' + value[defaultValue] + ' ';
                    }
                }
                left += '"';
                left += '>';
                str += left + right;
            }
            return str;
        };
    }

    //响应式表格容器类
    function ResponsiveTable(){
        Layout.apply(this,null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren = {
            'Table' : Table
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'table-responsive'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag ==true){
                return true;
            }
            return false;
        };
        this.setLayoutAttrs('responsiveTable',new Attribute('响应式表格', TYPE_SELECT, '', ['table-responsive'], ['是'], 0));
        this.builder = function(){
            return [this.layoutAttrs.responsiveTable];
        };
        this.toHTML = function(rowNum, colNum){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenTableStr = new this.constructionChildren.Table().toHTML(rowNum, colNum);
            return left + childrenTableStr + right;
        };
    }
    //表格类
    function Table(){
        Layout.apply(this,null);
        this.tagName = 'table';
        this.constructionParent = ResponsiveTable;
        this.constructionChildren = {
            'Row' : Row
        };
        this.test = function(node){
          var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'table'){
                    flag = true;
                }
            }
            if(obj.tagName =='table' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('border', new Attribute('表格边框', TYPE_SELECT, 'table', ['table-bordered', ''], ['是', '否'], 0 ));
        this.setStyleAttrs('hover', new Attribute('悬浮变色', TYPE_SELECT, 'table', ['table-hover', ''], ['是', '否'], 0));
        this.setStyleAttrs('striped', new Attribute('隔行变色', TYPE_SELECT, 'table', ['table-striped', ''], ['是', '否'], 0));
        this.builder = function(){
            return [this.styleAttrs.border, this.styleAttrs.hover, this.styleAttrs.striped];
        };
        this.toHTML = function(rowNum, colNum){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenRowStr = new this.constructionChildren.Row().toHTML(rowNum, colNum);
            return left + childrenRowStr + right;
        };
    }
    //表格行类
    function Row(){
        Layout.apply(this,arguments);
        this.tagName = 'tr';
        this.constructionParent = Table;
        this.constructionChildren = {
            'Column' : Column
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            if(obj.tagName == 'tr'){
                return true;
            }
            return false;
        };
        this.builder = function(){
            return [];
        };
        this.toHTML = function(rowNum, colNum){
            var str = '';
            var left = '<' + this.tagName + '>';
            var right = '</' + this.tagName + '>';
            var childrenColumnStr = new this.constructionChildren.Column().toHTML(colNum);
            for(var i = 0; i < rowNum; i++){
                str += left + childrenColumnStr + right;
            }
            return str;
        };
    }
    //表格列类
    function Column(){
        Layout.apply(this, null);
        this.tagName = 'td';
        this.constructionParent = Row;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            if(obj.tagName == 'td'){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('align', new Attribute('对齐方式', TYPE_SELECT, '', ['text-center', 'text-left', 'text-right'], ['居中对齐', '居左对齐', '居右对齐'], 0));
        this.setStyleAttrs('middle', new Attribute('垂直居中', TYPE_SELECT, '', ['', 'middle'], ['否', '是'], 0));
        this.setStyleAttrs('text', new Attribute('表格文本', TYPE_TEXT, '', [], ['表格内容'], 0));
        this.builder = function(){
            return [this.styleAttrs.align, this.styleAttrs.middle, this.styleAttrs.text];
        };
        this.toHTML = function(colsNum){
            var str = '';
            var builder = this.builder();
            for(var i = 0; i < colsNum; i++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var j = 0 ; j < builder.length ; j++){
                    var defaultValue = builder[j].defaultValue;
                    var valueDescription = builder[j].valueDescriptions;
                    var fixValue = builder[j].fixValue;
                    var values = builder[j].values;
                    if(builder[j].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }else if(builder[j].type == TYPE_TEXT){
                        right = valueDescription[defaultValue] + right;
                    }
                }
                left += '">';
                str += left + right;
            }
            return str;
        } ;
    }

    //普通div类
    function Div(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            if(obj.tagName == 'div'){
                return true;
            }
            return false;
        };
        this.builder = function(){
            return [];
        };
    }

    //超链接类
    function HyperLink() {
        Layout.apply(this, null);
        this.tagName = 'a';
        this.constructionParent = null;
        this.constructionChildren = null;
        this.test = function (node) {
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.href = node.href;
            if (obj.tagName == 'a' && obj.href) {
                return true;
            }
            return false;
        };
        this.setStyleAttrs('href', new Attribute('链接地址', TYPE_HREF, '', ['javascript:;'], [''], 0));
        this.setStyleAttrs('text', new Attribute('链接文本', TYPE_TEXT, '', [''], ['这是一个超链接'], 0));
        this.builder = function () {
            return [this.styleAttrs.href, this.styleAttrs.text];
        };
        this.toHTML = function () {
            var leftstr = '<' + this.tagName;
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for (var i = 0; i < builder.length; i++) {
                var defaultValue = builder[i].defaultValue;
                if (builder[i].type == TYPE_HREF) {
                    leftstr += ' href="' + builder[i].values[defaultValue] + '"';
                }else if(builder[i].type == TYPE_TEXT){
                    var valueDescriptions = builder[i].valueDescriptions;
                    rightstr = valueDescriptions[defaultValue] + rightstr;
                }
            }
            leftstr += '>';
            return leftstr + rightstr;
        };
    }

    //面板
    function Panel(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren = {
            'PanelHeading' : PanelHeading,
            'PanelBody' : PanelBody
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag1 = false;
            var flag2 = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'panel'){
                    flag1 = true;
                }else if(obj.classNames[i] == 'panel-default'){
                    flag2 = true;
                }
            }
            if(obj.tagName = 'div' && flag1 && flag2){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('面板外观', TYPE_SELECT, 'panel', ['panel-default'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenHeadingStr = new this.constructionChildren.PanelHeading().toHTML();
            var childrenBodyStr = new this.constructionChildren.PanelBody().toHTML();
            return left + childrenHeadingStr + childrenBodyStr + right;
        };
    }
    //面板标题
    function PanelHeading(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = Panel;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'panel-heading'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('标题外观', TYPE_SELECT, '', ['panel-heading'], ['默认'], 0));
        this.setStyleAttrs('text', new Attribute('标题文本', TYPE_TEXT, '', ['我是标题'], ['我是标题'], 0));
        this.setStyleAttrs('icon', new Attribute('图标', TYPE_ICON, icons, icons, 0));
        this.builder = function(){
            return [this.styleAttrs.theme, this.styleAttrs.text];
        };
        this.toHTML = function () {
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for (var i = 0; i < builder.length; i++) {
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                var values = builder[i].values;
                if (builder[i].type == TYPE_SELECT) {
                    leftstr += fixValue + ' ' +values[defaultValue];
                }
            }
            leftstr +='"';
            for (var i = 0; i < builder.length; i++) {
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                if(builder[i].type == TYPE_TEXT){
                    rightstr = values[defaultValue] + rightstr;
                }
            }
            leftstr += '>';
            return leftstr + rightstr;
        };
    }
    //面板主体
    function PanelBody(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = Panel;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0;i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'panel-body'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('主体外观', TYPE_SELECT, '', ['panel-body'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for (var i = 0; i < builder.length; i++) {
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                var values = builder[i].values;
                if (builder[i].type == TYPE_SELECT) {
                    leftstr += fixValue + ' ' +values[defaultValue];
                }
            }
            leftstr +='">';
            return leftstr + rightstr;
        }
    }

    //页头
    function PageHeader(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren = {
            'PageHeaderTitle' : PageHeaderTitle
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'page-header'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('页头外观', TYPE_SELECT, '', ['page-header'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML =function(){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenTitleStr = new this.constructionChildren.PageHeaderTitle().toHTML();
            return left + childrenTitleStr + right;
        }
    }
    //页头标题
    function PageHeaderTitle(){
        Layout.apply(this, null);
        this.tagName = 'h1';
        this.constructionParent = PageHeader;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.parent = $(node).parent();
            if(obj.parent.hasClass('page-header') && obj.tagName == 'h1'){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('text', new Attribute('标题文本', TYPE_TEXT, '', ['我是标题'], ['我是标题'], 0));
        this.setStyleAttrs('icon', new Attribute('标题图标', TYPE_ICON, '', icons, icons, 0));
        this.builder = function(){
            return [this.styleAttrs.text];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + '>';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for (var i = 0; i < builder.length; i++) {
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                var values = builder[i].values;
                if (builder[i].type == TYPE_TEXT) {
                    rightstr = fixValue + ' ' +values[defaultValue] + rightstr;
                }
            }
            return leftstr + rightstr;
        }
    }

    //路径导航
    function Breadcrumb(){
        Layout.apply(this, null);
        this.tagName = 'ol';
        this.constructionParent = null;
        this.constructionChildren = {
            'BreadcrumbList' : BreadcrumbList
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'breadcrumb'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName = 'ol' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['breadcrumb'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '">';
            var childrenListStr = new this.constructionChildren.BreadcrumbList().toHTML(num);
            return left + childrenListStr + right;
        }
    }
    //路径导航列表
    function BreadcrumbList(){
        Layout.apply(this, null);
        this.tagName = 'li';
        this.constructionParent = Breadcrumb;
        this.constructionChildren = {
            'HyperLink' : HyperLink
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.parent = $(node).parent();
            if(obj.tagName == 'li' && obj.parent.hasClass('breadcrumb')){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('current', new Attribute('当前路径', TYPE_SELECT, '', ['', 'active'], ['否', '是'], 0));
        this.setStyleAttrs('icon', new Attribute('图标', TYPE_ICON, '', icons, icons, 0));
        this.builder = function(){
            return [this.styleAttrs.current];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var str = '';
            var childrenLinkStr = new this.constructionChildren.HyperLink().toHTML();
            for(var j = 0 ;j < num; j++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '">';
                str += left + childrenLinkStr + right;
            }
            return str;
        }
    }

    //内联表单
    function FormInline(){
        Layout.apply(this, null);
        this.tagName = 'form';
        this.constructionParent = null;
        this.constructionChildren ={
            'FormInlineGroup' : FormInlineGroup,
            'Button' : Button
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-inline'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'form' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('action', new Attribute('提交地址', TYPE_ACTION, '', ['javascript:;'], ['javascript:;'], 0));
        this.setLayoutAttrs('construction', new Attribute('表单结构', TYPE_SELECT, '', ['form-inline'], ['内联表单'], 0));
        this.builder = function(){
            return [this.styleAttrs.action, this.layoutAttrs.construction];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_ACTION){
                    left += 'action="' + fixValue + ' ' + values[defaultValue] + ' "';
                }
            }
            left += '>';
            var childrenGroupStr = new this.constructionChildren.FormInlineGroup().toHTML(num);
            var childrenButtonStr = new this.constructionChildren.Button().toHTML();
            return left + childrenGroupStr + childrenButtonStr + right;
        }
    }
    //内联表单组
    function FormInlineGroup(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren ={
            'FormInlineLabel' : FormInlineLabel,
            'TextInput' : TextInput
        };
        this.test = function(node){
            var obj ={};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.parent = $(node).parent();
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-group'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && obj.parent.hasClass('form-inline') && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-group'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var str = '';
            var childrenLabelStr = new this.constructionChildren.FormInlineLabel().toHTML();
            var childrenInputStr = new this.constructionChildren.TextInput().toHTML();
            for(var j = 0; j < num; j++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '">';
                str += left + childrenLabelStr + childrenInputStr + right;
            }
            return str;
        }
    }
    //内联表单标签
    function FormInlineLabel(){
        Layout.apply(this, null);
        this.tagName = 'label';
        this.constructionParent = FormInlineGroup;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.parent = $(node).parent();
            obj.grandParent = $(node).parent().parent();
            if(obj.tagName == 'label' && obj.parent.hasClass('form-group') && obj.grandParent.hasClass('form-inline')){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('text', new Attribute('标签文本', TYPE_TEXT, '', ['我是标签'], ['我是标签'], 0));
        this.builder = function(){
            return [this.styleAttrs.text];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    var values = builder[i].values;
                    leftstr += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_TEXT){
                    var values = builder[i].values;
                    rightstr = values[defaultValue] + rightstr;
                }
            }
            leftstr += '>';
            return leftstr + rightstr;
        }
    }

    //水平表单
    function FormHorizontal(){
        Layout.apply(this, null);
        this.tagName = 'form';
        this.constructionParent = null;
        this.constructionChildren = {
            'FormHorizontalGroup' : FormHorizontalGroup
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-horizontal'){
                    flag = true;
                }
            }
            if(obj.tagName == 'form' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('action', new Attribute('提交地址', TYPE_ACTION, '', ['javascript:;'], ['javascript:;'], 0));
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-horizontal'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.action, this.styleAttrs.theme];
        };
        this.toHTML = function(groupNum, widgetNameArr, widgetNum){
            var builder = this.builder();
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_ACTION){
                    left += 'action="' + fixValue + ' ' + values[defaultValue] + ' "';
                }
            }
            left += '>';
            var childrenGroupStr = new this.constructionChildren.FormHorizontalGroup().toHTML(groupNum, widgetNameArr, widgetNum);
            return left + childrenGroupStr + right;
        }
    }
    //表单组
    function FormHorizontalGroup(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = null;
        this.constructionChildren ={
            'FormHorizontalLabel' : FormHorizontalLabel,
            'FormHorizontalProportion' : FormHorizontalProportion
        };
        this.test = function(node){
            var obj ={};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.parent = $(node).parent();
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'form-group'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true && obj.parent.hasClass('form-horizontal')){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['form-group'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(groupNum, widgetNameArr, widgetNum){
            var builder = this.builder();
            var str = '';
            var childrenLabelStr = new this.constructionChildren.FormHorizontalLabel().toHTML();
            var childrenProportionStr = null;
            for(var j = 0; j < groupNum; j++){
                childrenProportionStr = new this.constructionChildren.FormHorizontalProportion().toHTML(widgetNameArr[j], widgetNum);
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '">';
                str += left + childrenLabelStr + childrenProportionStr + right;
            }
            return str;
        }
    }
    //水平表单标签
    function FormHorizontalLabel(){
        Layout.apply(this, null);
        this.tagName = 'label';
        this.constructionParent = FormHorizontalGroup;
        this.constructionChildren = null;
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.grandParent = $(node).parent().parent();
            var flag1 = false;
            var flag2 = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'control-label'){
                    flag1 = true;
                }else if(/^col-md-\d+$/.test(obj.classNames[i])){
                    flag2 = true;
                }
            }
            if(obj.tagName == 'label' && flag1 && flag2 && obj.grandParent.hasClass('form-horizontal')){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['control-label'], ['默认'], 0));
        this.setLayoutAttrs('proportion', new Attribute('占比', TYPE_SELECT, '', ['col-md-1', 'col-md-2', 'col-md-3', 'col-md-4', 'col-md-5', 'col-md-6', 'col-md-7', 'col-md-8', 'col-md-9', 'col-md-10', 'col-md-11', 'col-md-12'], ['1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'], 1));
        this.setStyleAttrs('text', new Attribute('标签文本', TYPE_TEXT, '', ['我是标签'], ['我是标签'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme, this.layoutAttrs.proportion, this.styleAttrs.text];
        };
        this.toHTML = function(){
            var leftstr = '<' + this.tagName + ' class="';
            var rightstr = '</' + this.tagName + '>';
            var builder = this.builder();
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    var values = builder[i].values;
                    leftstr += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            leftstr += '"';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_TEXT){
                    var values = builder[i].values;
                    rightstr = values[defaultValue] + rightstr;
                }
            }
            leftstr += '>';
            return leftstr + rightstr;
        }
    }
    //水平表单控件占比
    function FormHorizontalProportion(){
        Layout.apply(this, null);
        this.tagName = 'div';
        this.constructionParent = FormHorizontalGroup;
        this.constructionChildren = {
            'TextInput' : TextInput,
            'Textarea' : Textarea,
            'Select' : Select,
            'Button' : Button,
            'FormHorizontalRadioBox' : FormHorizontalRadioBox,
            'FormHorizontalCheckboxBox' : FormHorizontalCheckboxBox
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            obj.parent = $(node).parent();
            obj.grandParent = $(node).parent().parent();
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(/^col-md-\d+$/.test(obj.classNames[i])){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'div' && flag == true && obj.parent.hasClass('form-group') && obj.grandParent.hasClass('form-horizontal')){
                return true;
            }
            return false;
        };
        this.setLayoutAttrs('proportion', new Attribute('占比', TYPE_SELECT, '', ['col-md-1', 'col-md-2', 'col-md-3', 'col-md-4', 'col-md-5', 'col-md-6', 'col-md-7', 'col-md-8', 'col-md-9', 'col-md-10', 'col-md-11', 'col-md-12'], ['1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'], 9));
        this.setLayoutAttrs('push', new Attribute('占比右移', TYPE_SELECT, '', ['', 'col-md-push-1', 'col-md-push-2', 'col-md-push-3', 'col-md-push-4', 'col-md-push-5', 'col-md-push-6', 'col-md-push-7', 'col-md-push-8', 'col-md-push-9', 'col-md-push-10', 'col-md-push-11', 'col-md-push-12'], ['不移动','1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'], 0));
        this.setLayoutAttrs('pull', new Attribute('占比左移', TYPE_SELECT, '', ['', 'col-md-pull-1', 'col-md-pull-2', 'col-md-pull-3', 'col-md-pull-4', 'col-md-pull-5', 'col-md-pull-6', 'col-md-pull-7', 'col-md-pull-8', 'col-md-pull-9', 'col-md-pull-10', 'col-md-pull-11', 'col-md-pull-12'], ['不移动','1/12', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '11/12', '12/12'], 0));
        this.builder = function(){
            return [this.layoutAttrs.proportion, this.layoutAttrs.push, this.layoutAttrs.pull];
        };
        this.toHTML = function(widgetName, widgetNum){
            var builder = this.builder();
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            left += '>';
            var childrenWidgetStr = new widgetName().toHTML(widgetNum);
            return left + childrenWidgetStr + right;
        }
    }
    //水平表单单选框容器
    function FormHorizontalRadioBox(){
        Layout.apply(this, null);
        this.tagName = 'label';
        this.constructionParent = FormHorizontalProportion;
        this.constructionChildren = {
            'Radio' : Radio
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'radio-inline'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'label' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['radio-inline'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var childrenRadioStr = new this.constructionChildren.Radio().toHTML();
            var str = '';
            for(var j = 0; j < num; j++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '"';
                left += '>';
                str += left + childrenRadioStr + right;
            }

            return str;
        }
    }
    //水平表单复选框容器
    function FormHorizontalCheckboxBox(){
        Layout.apply(this, null);
        this.tagName = 'label';
        this.constructionParent = FormHorizontalProportion;
        this.constructionChildren = {
            'Checkbox' : Checkbox
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'checkbox-inline'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'label' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['checkbox-inline'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var childrenCheckboxStr = new this.constructionChildren.Checkbox().toHTML();
            var str = '';
            for(var j = 0; j < num; j++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '"';
                left += '>';
                str += left + childrenCheckboxStr + right;
            }
            return str;
        }
    }

    //分页导航
    function Pagination(){
        Layout.apply(this, null);
        this.tagName = 'ul';
        this.constructionParent = null;
        this.constructionChildren ={
            'PaginationList' : PaginationList
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.classNames = $(node).attr('class').split(' ');
            var flag = false;
            for(var i = 0; i < obj.classNames.length; i++){
                if(obj.classNames[i] == 'pagination'){
                    flag = true;
                    break;
                }
            }
            if(obj.tagName == 'ul' && flag == true){
                return true;
            }
            return false;
        };
        this.setStyleAttrs('theme', new Attribute('外观', TYPE_SELECT, '', ['pagination'], ['默认'], 0));
        this.builder = function(){
            return [this.styleAttrs.theme];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var left = '<' + this.tagName + ' class="';
            var right = '</' + this.tagName + '>';
            for(var i = 0; i < builder.length; i++){
                var defaultValue = builder[i].defaultValue;
                var valueDescription = builder[i].valueDescriptions;
                var values = builder[i].values;
                var fixValue = builder[i].fixValue;
                if(builder[i].type == TYPE_SELECT){
                    left += fixValue + ' ' + values[defaultValue] + ' ';
                }
            }
            left += '"';
            left += '>';
            var childrenListStr = new this.constructionChildren.PaginationList().toHTML(num);
            return left + childrenListStr + right;
        }
    }
    //分页导航列表
    function PaginationList(){
        Layout.apply(this, null);
        this.tagName = 'li';
        this.constructionParent = Pagination;
        this.constructionChildren = {
            'HyperLink' : HyperLink
        };
        this.test = function(node){
            var obj = {};
            obj.tagName = $(node)[0].tagName.toLowerCase();
            obj.parent = $(node).parent();
            if(obj.tagName == 'li' && obj.parent.hasClass('pagination')){
                console.log('xx');
                return true;
            }
            return false;
        };
        this.setStyleAttrs('active', new Attribute('当前页', TYPE_SELECT, '', ['', 'active'], ['否', '是'], 0));
        this.builder = function(){
            return [this.styleAttrs.active];
        };
        this.toHTML = function(num){
            var builder = this.builder();
            var childrenLinkStr = new this.constructionChildren.HyperLink().toHTML();
            var str = '';
            for(var j = 0; j < num; j++){
                var left = '<' + this.tagName + ' class="';
                var right = '</' + this.tagName + '>';
                for(var i = 0; i < builder.length; i++){
                    var defaultValue = builder[i].defaultValue;
                    var valueDescription = builder[i].valueDescriptions;
                    var values = builder[i].values;
                    var fixValue = builder[i].fixValue;
                    if(builder[i].type == TYPE_SELECT){
                        left += fixValue + ' ' + values[defaultValue] + ' ';
                    }
                }
                left += '"';
                left += '>';
                str += left + childrenLinkStr + right;
            }
            return str;
        }
    }

    //html格式化
    function format(strs){
        var left=null;
        var right=null;
        var str='';
        var blank='\t';
        var fmt=[];
        for(var i=0;i<strs.length;i++){
            if(strs[i]=='<'){
                left=i;
            }else if(strs[i]=='>'){
                right=i;
            }
            if(typeof left=='number'&&typeof right=='number'){
                if(strs[left+1]=='/'){
                    fmt.pop();
                    str+=fmt.join('')+strs.slice(left,right+1);
                }else if(strs[right-1]=='/'){
                    str+=fmt.join('')+strs.slice(left,right+1);
                }else if(strs.slice(left,right).search(/\<input|\<img|\<hr|\<br|\<link|\<meta/)!=-1){
                    str+=fmt.join('')+strs.slice(left,right+1);
                }else{
                    str+=fmt.join('')+strs.slice(left,right+1);
                    fmt.push(blank);
                }
                for(var j=right;j<strs.length;j++){
                    if(strs[j]=='<'){
                        var s=strs.slice(right+1,j).replace(/\s*/g,'');
                        if(s){
                            str+=s;
                        }
                        break;
                    }
                }
                str+='\n';
                left=null;
                right=null;
            }

        }
        return str;
    }

    //过滤创建的源代码
    function code(s){
        var str=s;
        var useCss=['pointer','inline-block','none','bg-222', 'bg-white',
            'tc-white','tc-666','w90', 'w100','w200',
            'w100p', 'h30', 'lh-30','pl-0','pl-5',
            'pl-10', 'pr-10','pt-10', 'mt-5','mt-50', 'mt-55',
            'ml-10', 'ml-20','mb-0', 'pos-fix','pos-rel',
            'pos-abs', 'top-0','top-45','top-55','left-0',
            'left-200', 'left-215', 'right-0','bd-all-ccc','bd-all-blue',
            'y-auto', 'x-hidden', 'op-50','targetEle','cancel',
            'changeText', 'w55', 'lh-55', 'top-n55'
        ];
        for(var i=0;i<useCss.length;i++){
            var reg=new RegExp("\\b"+useCss[i]+"\\b\\s*","ig");
            str=str.replace(reg,'');
        }
        var delStr='<a href="javascript:;" class="btn btn-danger btn-sm "><i class="fa fa-times"></i> 删除</a>';
        reg=new RegExp(delStr,"ig");
        str=str.replace(reg,'');
        str=format(str);
        return str;
    }

});