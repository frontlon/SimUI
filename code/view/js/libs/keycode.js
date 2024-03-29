﻿
/**
 * rom模块
**/

function keyRomLeft(){
    //如果没有rom，则直接返回
    if($$(#romlist li).length == 0){
        return;
    }
    if ($(#romlist li:current) == undefined){
        var nextDom = $(#romlist).select("li:nth-child(2)");
        openSidebar(nextDom);
        return;
    }

    //如果当前没有选定，则选定第一个
    var current = $(#romlist li:current);
    if (current == undefined){
        current = $(#romlist li);
        openSidebar(current);
    }else{
        //读取上一个节点
        var pri = $(#romlist li:current).priorNode;
        //如果没有上一个节点，直接返回
        if(pri == undefined || pri.style["display"] == "none" || pri.attributes.hasClass("romth")){
            return;
        }else{
            openSidebar(pri);
        }
    }
}

function keyRomRight(){
   
    //如果没有rom，则直接返回
    if($$(#romlist li).length == 0){
        return;
    }

    if ($(#romlist li:current) == undefined){
        var nextDom = $(#romlist).select("li:nth-child(2)");
        openSidebar(nextDom);
        return;
    }
    //如果当前没有选定，则选定第一个
    var current = $(#romlist li:current);
    if (current == undefined){
        current = $(#romlist li);
        openSidebar(current);
    }else{
        //读取上一个节点
        var next = $(#romlist li:current).nextNode;
        //如果没有上一个节点，直接返回
        if(next == undefined){
            return;
        }else{
            openSidebar(next);
        }
    } 
}

function keyRomUp(){
    //如果没有rom，则直接返回
    if($$(#romlist li).length < 2 ){
        return;
    }
    var nextDom;
    if ($(#romlist li:current) == undefined){
        nextDom = $(#romlist).select("li:nth-child(2)");
    }else{
        var current = $(#romlist li:current).index; //当前选中li的index值
        //如果当前是第一个，则不跳转了
        if(current == 0){
            return;
        }
        var idx = getRomlistRowNum(); //计算出每行li的数量
        var next = current - idx  + 1; //要跳转到的位置

        if(next<=1){
            next = 2;
        }

        var rootDom = $(#romlist);
        nextDom = rootDom.select("li:nth-child("+ next +")");


        if(nextDom != undefined && nextDom.index <= 0){
            nextDom = rootDom.select("li:nth-child(2)"); //定位到第一个
        }
    }
 
    if (nextDom != undefined){
        openSidebar(nextDom);
    }
}

function keyRomDown(){

    //如果没有rom，则直接返回
    if($$(#romlist li).length < 2 ){
        return;
    }
    var nextDom;
    if ($(#romlist li:current) == undefined){
        nextDom = $(#romlist).select("li:nth-child(2)");
    }else{
        var rootDom = $(#romlist);
        var current = $(#romlist li:current).index; //当前选中li的index值
        var lastDom = rootDom.select("li:last-child").index;
        //如果当前是最后一个，则不跳转了
        if(current == lastDom){
            return;
        }
        var idx = getRomlistRowNum(); //计算出每行li的数量
        var next = current + idx + 1;
        nextDom = rootDom.select("li:nth-child("+ next +")"); //要跳转到的位置
    }
    
    if(nextDom != undefined){
        openSidebar(nextDom);
    }

    //加载下一页
    var index = $(#romlist li:current).index;
    var count = $$(#romlist li).length
    if(count - index <= 20){
        //如果加锁中，则不执行后续逻辑，防止重复触发
        if (SCROLL_LOCK == true){
            return;
        }
        SCROLL_LOCK = true; //加锁
        loadPageRom(); //加载一页rom
    }

}

//计算出每行li的数量
function getRomlistRowNum(){
    var dom  = $(#romlist);

    var domLi = $(#romlist).select("li:nth-child(2)");
    var out = px(dom.box(#width));
    var outwidth = (out).toFloat(#dip);
    var w = px(domLi.box(#width));

    var ml = domLi.style["margin-left"].toString();
    var mr = domLi.style["margin-right"].toString();
    w = (w).toFloat(#dip);
    ml = ml.replace("dip","").toInteger();
    mr = mr.replace("dip","").toInteger();
    var domWidth = w + ml + mr ;
    return Math.ceil(outwidth / domWidth).toInteger(); //每行的li数量
}

//向上滚动
function scrollUp(listType){

    if ($(#romlist li:current) == undefined){
        return;
    }

    var centerScroll = $(#center_content).scroll(#top); //滚动条高度
    var(x,liY,w,liH) = $(#romlist li:current).box(#rectw,#margin,#parent);
    var titlebarHeight = $(#titlebar).box(#height); //标题栏高度
    var scro = 0;
    if (centerScroll > liY){
        if(listType == "1"){
                scro = liY - liH + titlebarHeight;
        }else{
                scro = liY + liH;
        }
        $(#center_content).scrollTo(0,scro, false); // increment scroll position by 100px, no animation
    }
}

//向下滚动
function scrollDown(listType){
    if ($(#romlist li:current) == undefined){
        return;
    }
    var centerScroll = $(#center_content).scroll(#top); //滚动条高度
    var centerHeight = $(#center_content).box(#height) + centerScroll; //滚动层高度 + 滚动条高度
    var(x,liY,w,liH) = $(#romlist li:current).box(#rectw,#margin,#parent);
    var titlebarHeight = $(#titlebar).box(#height); //标题栏高度
    var scrHeight = 0;

    if(listType == "1"){
        scrHeight = liY + titlebarHeight + liH + liH;
    }else{
        scrHeight = liY + titlebarHeight + liH + liH + liH;
    }

    if (scrHeight > centerHeight){
        var scro = centerScroll + liH;
        $(#center_content).scrollTo(0,scro, false);
    }

}


//启动shift搜索框
function searchBox(){
    var search_box = $(#search_box);
    if(search_box.style["display"] == "block"){
        search_box.style["display"] = "none";
        $(#search_box_input).value = "";
    }else{
        search_box.style["display"] = "block";
        $(#search_box_input).value = "";
        $(#search_box_input).state.focus = true;
    }
}


//快捷键设置喜爱
function keycodeSetFavorite(){
    var getjson = view.GetGameById(ACTIVE_ROM_ID);
    var info = JSON.parse(getjson);
    var star = info.Star == 1 ? 0 : 1;
    var result = view.SetFavorite( info.Id,star);
    var rdom = $(#romlist).select("li[rid="+ info.Id+"]");

    if( star == 1){
        if($(#switch_romlist).attributes["value"] == 1){
            rdom.select(".rom_star").style["display"] = "block";
        }else{
            rdom.select("div").attributes.addClass("star");
        }
    }else{
        if($(#switch_romlist).attributes["value"] == 1){
            rdom.select(".rom_star").style["display"] = "none";
        }else{
            rdom.select("div").attributes.removeClass("star");
        }
    }
}

//右键菜单设为隐藏
function keycodeSetHide(){
    
    var getjson = view.GetGameById(ACTIVE_ROM_ID);
    var info = JSON.parse(getjson);
    var id = info.Id;
    var hide = info.Hide == 1 ? 0 : 1;
    var result = view.SetHide(id,hide);

    //从rom列表中删除dom
    var rdom = $(#romlist).select("li[rid="+id+"]");
    if(rdom != undefined){
        rdom.remove();
    }
}