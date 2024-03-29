﻿//开启关闭平台栏
function togglePlatform() {
    var dom = $(#left_platform);
    var val = 0;
    if (dom.style["display"] == "block") {
        dom.style["display"] = "none";
        $(#platform_splitter).style["display"] = "none";
        val = 0;
    } else {
        dom.style["display"] = "block";
        $(#platform_splitter).style["display"] = "block";
        val = 1;
    }

    //更新数据库配置
    view.UpdateConfig("panel_platform", val);
}
//开启关闭菜单栏
function toggleMenu() {
    var dom = $(#left_menu);
    var val = 0;
    if (dom.style["display"] == "block") {
        dom.style["display"] = "none";
        $(#menu_splitter).style["display"] = "none";
        val = 0;
    } else {
        dom.style["display"] = "block";
        $(#menu_splitter).style["display"] = "block";
        val = 1;
    }

    //更新数据库配置
    view.UpdateConfig("panel_menu", val);
}
//开启关闭侧边栏
function toggleSidebar() {
    var dom = $(#right);
    var val = 0;
    if (dom.style["display"] == "block") {
        dom.style["display"] = "none";
        $(#right_splitter).style["display"] = "none";
        val = 0;
    } else {
        dom.style["display"] = "block";
        $(#right_splitter).style["display"] = "block";
        val = 1;
    }
    //更新数据库配置
    view.UpdateConfig("panel_sidebar", val);
}

//切换rom列表样式
function switchRomListStyle(obj) {
    if (obj.attributes["value"] == "1") {
        obj.attributes["value"] = "2";
        obj.html = "<i.list.minsize></i>";
        self.$(#romlist).attributes.removeClass("romblock");
        self.$(#romlist).attributes.addClass("romlist");
    } else {
        obj.attributes["value"] = "1";
        obj.html = "<i.block.minsize></i>";
        self.$(#romlist).attributes.removeClass("romlist");
        self.$(#romlist).attributes.addClass("romblock");
    }


    //清空背景图
    CONF.Default.RomlistStyle = obj.attributes["value"];
    showListBackground();

    var req = {
        "platform": ACTIVE_PLATFORM.toInteger(),
        "catname": ACTIVE_MENU,
    };
    var request = JSON.stringify(req);

    ROMJSON = view.GetGameList(request);
    createRomList(1);
    //更新配置文件
    view.UpdateConfig("romlist_style", obj.attributes["value"]);
}

//运行快捷工具
function runShortcut(obj) {
    var path = obj.attributes["path"];
    view.RunShortcut(path);
}

//切换主题
function changeTheme(obj) {
    var id = obj.attributes["id"]; //主题列表
    self.attributes["theme"] = id;

    //更新主题样式
    setTheme(id);

    //更新配置文件
    view.UpdateConfig("theme", id)
}

//设置主题样式
function setTheme(themeId) {

    if (CONF.Theme[themeId].Params["body-opacity"] != undefined) {
        $(#titlebar).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        $(#left_platform).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        $(#left_menu).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        //$(#left_splitter).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        $(#center).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        $(#right).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
        $(#right_splitter).style["opacity"] = CONF.Theme[themeId].Params["body-opacity"];
    }

    var themePath = CONF.RootPath + "theme/";

    if (CONF.Theme[themeId].Params["window-opacity"] != undefined) {
        $(body).style["opacity"] = CONF.Theme[themeId].Params["window-opacity"];
    }

    if (CONF.Theme[themeId].Params["window-background-image"] != undefined) {
        $(body).style["background-image"] = [url: URL.fromPath(themePath + CONF.Theme[themeId].Params["window-background-image"])];
    }

    if (CONF.Theme[themeId].Params["sidebar-image"] != undefined) {
        $(#mask).style["background-image"] = [url: URL.fromPath(themePath + CONF.Theme[themeId].Params["sidebar-image"])];
    }
}

//检查更新
function checkUpgrade(evt) {
    var data = view.CheckUpgrade();

    if (data != "") {
        upgrade(data)
    } else {
        alert(CONF.Lang.Latestversion);
    }
}

//弹出关于窗口
function openAbout() {
    view.dialog({
        url: self.url(ROOTPATH + "about.html"),
        width: self.toPixels(450dip),
        height: self.toPixels(500dip),
    })
}

//弹出平台配置窗口
function openPlatformConfig() {
    view.dialog({
        url: self.url(ROOTPATH + "platform_config.html"),
        width: self.toPixels(1100dip),
        height: self.toPixels(670dip)
    });
    startLoading();
    initConfig("1");
    endLoading();
}

//弹出设置窗口
function openConfig(evt) {
    view.dialog({
        url: self.url(ROOTPATH + "config.html"),
        width: 655,
        height: 630
    });
    startLoading();
    initConfig("1");
    endLoading();
}

//弹出导出窗口
function openOutput() {
    view.dialog({
        url: self.url(ROOTPATH + "output.html"),
        width: self.toPixels(500dip),
        height: self.toPixels(670dip)
    });
}

//弹出导入窗口
function openInput() {
    view.dialog({
        url: self.url(ROOTPATH + "input.html"),
        width: self.toPixels(500dip),
        height: self.toPixels(670dip)
    });
}

//弹出rom管理窗口
function openRomManager(evt) {
    view.dialog({
        width: self.toPixels(1200dip),
        height: self.toPixels(700dip),
        url: self.url(ROOTPATH + "rom_manager.html")
    });
    alert(CONF.Lang.RomManagerRefreshTip);
}

//启动帮助
function runHelp() {
    Sciter.launch("http://www.simui.net/");
}

//发现更新
function upgrade(data) {
    if (data == "") {
        return;
    } else if (data == "error") {
        warning(CONF.Lang.NetworkRequestFailed);
        return;
    }

    var dataObj = JSON.parse(data);

    var content = "";
    content += CONF.Lang.FoundNewversion + "\n\n";
    content += CONF.Lang.Version + " : " + dataObj.version + "\n";
    content += CONF.Lang.PublishTime + " : " + dataObj.date + "\n";

    var result = view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        width: self.toPixels(500dip),
        parameters: {
            type: "warning",
            caption: CONF.Lang.CheckUpgrade,
            text: content,
            buttons: [
                { id: "download", text: CONF.Lang.DownloadNewVersion },
                { id: "never", text: CONF.Lang.NotTip },
                { id: "cancel", text: CONF.Lang.Cancel, role: "default-button" }
            ]
        };
    });

    switch (result) {
        case "download":
            Sciter.launch("http://www.simui.net/");
            break;
        case "never":
            //更新平台信息
            view.UpdateConfig("upgrade_id", dataObj.id.toString());
            break;
    }
}




//清理掉资料过滤条件
function filterClear() {
    resetFilterOptions();
    $(#search_input).value = "";
    search();
}

//清理游戏统计信息
function clearGameStat() {
    var result = confirm(CONF.Lang.TipClearGameStatComfirm, CONF.Lang.Confirm);
    if (result != "yes") {
        return;
    }

    view.ClearGameStat();
    alert(CONF.Lang.ClearFinished);
}

//清理资料文件
function clearRombase() {
    var result = confirm(CONF.Lang.TipClearZombieComfirm, CONF.Lang.Confirm);
    if (result != "yes") {
        return;
    }

    $(body).state.disabled = true;
    $(#create).attributes.addClass("disabled");
    startLoading();
    view.ClearRombase();
}

//清理资料文件回调
function CB_clearRombase(count) {
    $(body).state.disabled = false;
    endLoading(); //关闭loading框
    alert(CONF.Lang.ClearFinished);
}

//清空缓存
function clearDB(obj) {

    var TipContent = CONF.Lang.TipClearDBPlatformComfirm;
    var platform = ACTIVE_PLATFORM;
    if (obj.attributes["opt"] == "all") {
        TipContent = CONF.Lang.TipClearDBAllComfirm;
        platform = 0;
    }

    var result = confirm(TipContent, CONF.Lang.Confirm);
    if (result != "yes") {
        return;
    }

    $(body).state.disabled = true;
    $(#create).attributes.addClass("disabled");
    startLoading();
    view.TruncateRomCache(platform);

}

//清空缓存回调
function CB_clearDB() {
    $(#romlist).clear();
    $(#menulist).clear();
    $(#create).attributes.removeClass("disabled");
    $(body).state.disabled = false;
    endLoading(); //关闭loading框
    alert("清理完成");
}


//回到顶部
function gotoTop() {
    $(#center_content).scrollTo(0, 0, false);
}

//上翻页
function gotoPageUp() {
    let centerHeight = $(#center_content).box(#height);
    let centerScroll = $(#center_content).scroll(#top); //滚动条高度
    let scroll = centerScroll - centerHeight;
    if (scroll < 0) {
        scroll = 0;
    }
    $(#center_content).scrollTo(0, scroll, false);
}

//下翻页
function gotoPageDown() {
    let centerHeight = $(#center_content).box(#height);
    let centerScroll = $(#center_content).scroll(#top); //滚动条高度
    let scroll = centerScroll + centerHeight;
    $(#center_content).scrollTo(0, scroll, false);
}

//重建优化图片缓存
function createOptimizedCache(obj) {

    if (ACTIVE_PLATFORM == 0) {
        alert(CONF.Lang.NotSelectPlatform);
        return;
    }

    if (CONF.Platform[ACTIVE_PLATFORM.toString()].OptimizedPath == "") {
        alert(CONF.Lang.OptimizedCacheNotSet);
        return;
    }

    $(body).state.disabled = true;
    startLoading();

    //开始重建缓存
    view.CreateOptimizedImage(ACTIVE_PLATFORM, obj.attributes["opt"]);

}

//重建优化图片缓存 - 回调
function CB_createOptimizedCache() {
    $(body).state.disabled = false;
    endLoading(); //关闭loading框
}


//打开rom存储目录
function openRomFolder() {
    if (ACTIVE_PLATFORM == 0) {
        alert(CONF.Lang.RomMenuCanNotBeExists);
        return;
    }
    view.OpenRomPathFolder(ACTIVE_PLATFORM);
}

//添加游戏分身
function addSlnk() {
    var result = view.dialog({
        url: self.url(ROOTPATH + "add_slnk.html"),
        width: self.toPixels(500dip),
        height: self.toPixels(300dip),
        parameters: {
            platform: ACTIVE_PLATFORM,
            menu: ACTIVE_MENU,
        }
    });

    if (result == "ok"){
        //更新缓存
        createCache();
    }
}



//添加pc游戏
function AddIndieGame(opt) {

    if (ACTIVE_PLATFORM == 0) {
        alert(CONF.Lang.RomMenuCanNotBeExists);
        return;
    }

    var selectFile = undefined;
    if (opt == "pc") {
        const defaultExt = "";
        const initialPath = "";
        var exts = "*.exe";
        const filter = "Files (" + exts + ")|" + exts + "|All Files (*.*)|*.*";
        const caption = CONF.Lang.SelectFile;
        selectFile = view.selectFile(#open, multiple, filter, defaultExt, initialPath, caption);
    } else {
        selectFile = view.selectFolder(CONF.Lang.SelectFolder);
    }

    if (selectFile == undefined) {
        return;
    }

    var urls = [];
    if (typeof (selectFile) == "string") {
        urls[0] = URL.toPath(selectFile);
    } else {
        for (var url in selectFile) {
            urls.push(URL.toPath(url));
        }
    }

    var urlstr = JSON.stringify(urls);

    view.AddIndieGame(ACTIVE_PLATFORM, ACTIVE_MENU, urlstr);

    //更新缓存
    createCache();
}

//导出rom配置
function romConfigBackup(platform) {
    const defaultExt = "";
    const initialPath = "";
    const filter = "Backup File (*.ini)|*.ini";
    const caption = '';
    var url = view.selectFile(#save, filter, defaultExt, initialPath, caption);
    if (url) {
        $(body).state.disabled = true;
        startLoading();
        url = URL.toPath(url);
        view.BackupRomConfig(url, platform);
    }
}

//导入rom配置
function romConfigRestore(platform) {
    const defaultExt = "";
    const initialPath = "";
    const filter = "Backup File (*.ini)|*.ini";
    const caption = '';
    var url = view.selectFile(#open, filter, defaultExt, initialPath, caption);
    if (url) {
        $(body).state.disabled = true;
        startLoading();
        url = URL.toPath(url);
        view.RestoreRomConfig(url, platform);
    }
}

//导入rom配置 - 回调
function CB_romConfigRestore() {
    view.CreateRomCache();
}

//导出rom配置 - 回调
function CB_romConfigBackup() {
    $(body).state.disabled = false;
    endLoading(); //关闭loading框
}

//弹出合并数据库窗口
function openMergeDb() {
    view.dialog({
        width: self.toPixels(700dip),
        height: self.toPixels(700dip),
        url: self.url(ROOTPATH + "merge_db.html")
    });
}

function CB_romMergeStart(){
    $(body).state.disabled = true;

}

function CB_romMergeEnd(){
    $(body).state.disabled = false;
    endLoading(); //关闭loading框
    createCache("all");
}