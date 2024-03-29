﻿view.root.on("ready", function () {
    //平台拖拽排序
    DragDrop{
        what: "#platform_ul>li:not(.fixed)",
            where     : "#platform_ul",
                container : "#platform_ul",
                    notBefore : "#platform_ul>li.fixed",
                        dropped : function() {
                            var lis = $$(#platform_ul > li);
                            var id = "";
                            var newObj = {};
                            for (var li in lis) {
                                id = li.attributes["platform"];
                                newObj[id] = li.index;
                            }
                            //更新到数据库
                            var datastr = JSON.stringify(newObj);
                            var result = view.UpdatePlatformSort(datastr);
                        }
    }
});


//切换平台
function changePlatform(obj) {

    //设置全局变量
    ACTIVE_PLATFORM = obj.attributes["platform"];
    ACTIVE_ROM_ID = 0;

    //创建菜单
    var menujson = view.GetMenuList(ACTIVE_PLATFORM, 0); //读取分配列表
    createMenuList(menujson);


    //读取基本信息过滤器
    initBaseFilter(ACTIVE_PLATFORM);

    //生成游戏列表
    var req = {
        "platform": ACTIVE_PLATFORM.toInteger(),
    };
    var request = JSON.stringify(req);

    ROMJSON = view.GetGameList(request);
    createRomList(1);
    var romCount = view.GetGameCount(request); //必须在获取rom的方法下面
    $(#rom_count_num).html = romCount; //初始化在线人数

    //激活按钮改变样式
    obj.state.current = true;
    $(#menulist).select("dd[opt='']").state.current = true;

    //激活第一个字母索引
    $(#num_search li).state.current = true;

    //添加rom按钮隐藏状态
    if (ACTIVE_PLATFORM == 0) {
        $(#add_rom).style["display"] = "none";
    } else {
        $(#add_rom).style["display"] = "block";
    }

    //更新侧边栏平台介绍
    sidebarPlatformDesc(ACTIVE_PLATFORM);


    //更新配置文件
    view.UpdateConfig("platform", ACTIVE_PLATFORM)
    view.UpdateConfig("menu", "");
}

//生成平台列表
function initPlatform() {

    //设置默认激活
    ACTIVE_PLATFORM = CONF.Default.Platform;

    //生成标签选项卡
    var tags = {};
    if (CONF.Platform.length > 0) {
        for (var pf in CONF.PlatformList) {
            tags[pf.Tag] = 1;
        }
    }

    //如果只有一个标签，那么不显示
    if (tags.length > 1) {
        var tagOptions = "<option value='_allTags'>" + CONF.Lang.AllTags + "</option>";
        for (var t in tags) {
            if (t == "") {
                tagOptions += "<option value=''>" + CONF.Lang.NoTag + "</option>";
            } else {
                tagOptions += "<option value='" + t + "'>" + t + "</option>";
            }
        }
        $(#platform_tags).options.html = tagOptions;
        $(#platform_tags).value = "_allTags";
    } else {
        $(#platform_tags).style["display"] = "none";
    }

    //生成平台列表
    var simclass = "";
    var dd = "";
    var pf = {};
    var img = "";

    //如果有多个平台，才显示“全部平台”按钮
    if (CONF.Platform.length > 1) {
        dd += "<li platform='0'><div class='leftdiv'><p>" + CONF.Lang.AllPlatform + "</p></div></li>";
    }

    //遍历数据，生成dom
    for (var pf in CONF.PlatformList) {
        img = "";
        if (pf.Icon != "") {
            img = "<img src=\"" + URL.fromPath(pf.Icon) + "\" />";
        }

        var btn = "";
        dd += "<li tag='" + pf.Tag + "' platform='" + pf.Id + "'><div class='leftdiv'>" + img + "<p>" + pf.Name + "</p></div>" + btn + "</li>";

    }
    self.$(#platform_ul).html = dd; //生成dom

    var pfDom = $(#platform_ul).select("li[platform=" + CONF.Default.Platform + "]");
    if (pfDom != undefined) {
        pfDom.state.current = true;
    }

}


//平台向下索引
function nextPlatform() {

    //如果界面被隐藏，则禁用此功能
    if ($(#left_platform).style["display"] == "none") {
        return;
    }

    var next = $(#platform_ul).select("li:current").index + 2;
    var count = $$(#platform_ul li).length;
    var nextDom;

    if (next - 1 >= count) {
        nextDom = $(#platform_ul).select("li:nth-child(0)");
    } else {
        nextDom = $(#platform_ul).select("li:nth-child(" + next + ")");
    }
    if (nextDom != undefined) {
        changePlatform(nextDom);
    }
}

//切换平台标签
function changePlatformTags(tag) {
    if (tag == "_allTags") {
        var allLists = $$(#platform_ul li);
        for (var l in allLists) {
            l.style["display"] = "block";
            l.attributes.removeClass("fixed");
        }
        return;
    }

    //先隐藏所有项
    var allLists = $$(#platform_ul li);
    for (var l in allLists) {
        l.style["display"] = "none";
        l.attributes.addClass("fixed"); //禁止拖拽排序
    }

    //仅显示名称项
    var lists;
    if (tag != "") {

        lists = $$(#platform_ul li[tag = '{tag}']);
    } else {
        lists = $$(#platform_ul li[tag = '']);
    }
    for (var l in lists) {
        l.style["display"] = "block";
    }

}