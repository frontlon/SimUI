﻿
//视图窗口状态改变时
function windowStateChange(evt){
    if(view.state == 1 || view.state == 3){
        view.UpdateConfig("window_state",view.state);
    }
}
//调整窗口大小
function windowSize(){
    //更新默认配置
    view.UpdateConfig("window_width",$(body).box(#width));
    view.UpdateConfig("window_height",$(body).box(#height));
}

//心跳
function heartbeat(str){
    if (str == "1"){
        $(#ping).style["display"] = "block";
    }else{
        $(#ping).style["display"] = "none";
    }
}

//视频背景
function centerVideoBg(p){

    var v = $(#center_video video);
    if(v == undefined || v.attributes["src"] == p){
        return;
    }

    $(#center_video).style["display"] = "block";
    $(#center_video).html = "<video src=\"" + p + "\" />";
    $(#center_video video).audioVolume(0);
    $(#center_video video).onControlEvent = function(evt) {
        if(evt.type == Event.VIDEO_STOPPED){
            if ( this.videoDuration() - this.videoPosition()  < 1){
                this.videoPlay(0.0);
            }
        }
    }

}

//页面滚动翻页信息重置
function resetPageScroll(){
    SCROLL_PAGE = 0;
    SCROLL_POS = 0;
    SCROLL_LOCK = false;
    //滚动条移到最上面
    $(#center_content).scrollTo(0,0, false);
}

//重置筛选项
function resetFilterOptions(){
    $(#filter_type).value = "";
    $(#filter_publisher).value = "";
    $(#filter_year).value = "";
    $(#filter_country).value = "";
    $(#filter_producer).value = "";
    $(#filter_translate).value = "";
    $(#filter_version).value = "";
    $(#filter_score).value = "";
    $(#filter_complete).value = "";
}


//列表中的背景图显示
function showListBackground(background=""){

    //列表模式不渲染背景图
    if(CONF.Default.RomlistStyle == 2){
        $(#center).style["background-image"] = "none";
        $(#center_fuzzy).style["display"] = "none";
        $(#center_mask).style["background-image"] = "none";
        return;
    }

    var ext = "";
    if(background != ""){
        ext = getFileExt(background);
        if(ext == "mp4" || ext == "wmv" || ext == "flv" || ext == "avi"){
            //如果是视频背景
           centerVideoBg(background);
        }else{
            $(#center).style["background-image"] = [url:URL.fromPath(background)];
        }
    }else{
        if(CONF.Default.BackgroundImage != ""){
            var src = $(#center_video video) == undefined ? "" : $(#center_video video).attributes["src"];
            if (CONF.Default.BackgroundImage != src){
                 ext = getFileExt(CONF.Default.BackgroundImage);
                if(ext == "mp4" || ext == "wmv" || ext == "flv" || ext == "avi"){
                    //如果是视频背景
                    centerVideoBg(CONF.Default.BackgroundImage);
                }else{
                    $(#center).style["background-image"] = [url:URL.fromPath(CONF.Default.BackgroundImage)];
                }
            }
        }else{
            $(#center).style["background-image"] = "none";
        }
    }

    //是否显示模糊效果
    if($(#center).style["background-image"] != "" && $(#center).style["background-image"] != "url()" && CONF.Default.BackgroundFuzzy > 0){
        $(#center_fuzzy).style["display"] = "block";
        $(#center_fuzzy).attributes.addClass("fuzzy"+CONF.Default.BackgroundFuzzy);
    }else{
        $(#center_fuzzy).style["display"] = "none";
    }

    //是否显示模糊效果
    if($(#center).style["background-image"] != "" && $(#center).style["background-image"] != "url()" && CONF.Default.BackgroundMask != ""){
        $(#center_mask).style["background-image"] = [url:URL.fromPath(CONF.Default.BackgroundMask)];
    }else{
        $(#center_mask).style["background-image"] = "none";
    }
}