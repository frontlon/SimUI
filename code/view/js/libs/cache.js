﻿//生成缓存
function createCache(type="platform"){

    if($(body).state.disabled == true){
        return;
    } 

    $(body).state.disabled = true;
    $(#create).attributes.addClass("disabled");
    startLoading();
    var platform = 0;
    if(type == "platform"){
        platform = ACTIVE_PLATFORM;
    }
    view.CreateRomCache(platform);
}



//更新缓存回调
function CB_createCache(){

    $(body).state.disabled = false;

    //更新配置
    initConfig("1");

    //重置滚动翻页数据
    resetScroll();

    //滚动条回到顶部
    $(#center_content).scrollTo(0,0, false);

    //重置筛选项
    resetFilterOptions();

    //初始化rom
    var num = $(#num_search).select("li:current").html;
    if (num == "ALL") {
        num = "";
    }
    var req = {
        "platform" : ACTIVE_PLATFORM.toInteger(),
        "catname" : ACTIVE_MENU,
        "num": num,
    };
    var request = JSON.stringify(req);

    ROMJSON = view.GetGameList(request);

    createRomList(1); //生成rom列表

    //生成rom数量
    var romCount = view.GetGameCount(request);
    $(#rom_count_num).html = romCount; //初始化在线人数
    endLoading(); //关闭loading框

    $(#create).attributes.removeClass("disabled");
}