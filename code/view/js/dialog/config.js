﻿var pfId;
view.root.on("ready", function(){

    //初始化方法
    try{
        Init();
    }catch(e){
        alert(e);
    }
    //快捷软件拖动排序
    DragDrop{
        what      : "#shortcut_list li",
        where     : "#shortcut_list",
        container : "#shortcut_list",        
        dropped : function(){
            var lis = $$(#shortcut_list > li);
            var id = "";
            var newObj = {};
            for(var li in lis) {
                id = li.attributes["value"];
                newObj[id] = li.index;
            }
            //更新到数据库
            mainView.UpdateShortcutSort(JSON.stringify(newObj));
        }  
    };

    //图集拖拽排序
      DragDrop{
          what      : "#thumb_orders>li",
          where     : "#thumb_orders",
          container : "#thumb_orders",        
          dropped : function(){
              var lis = $$(#thumb_orders > li);
              var name = "";
              var newObj = [];
              for(var li in lis) {
                  name = li.attributes["opt"];
                  newObj.push(name);
              }
              var datastr = JSON.stringify(newObj);
              mainView.UpdateConfig("thumb_orders",datastr);
          }
      }

});

//初始化方法
function Init(){
    //渲染语言
    createLang();

    //定义标题
    view.windowCaption = CONF.Lang.Config;

    //生成语言列表
    var langdata = "";
    var config_lang = $(#config_lang);
    for(var lang in CONF.LangList) {
        config_lang.options.$append(<option value={lang}>{lang}</option>);
    }

    $(#config_lang).value = CONF.Default.Lang;
    $(#config_soft_name).value = CONF.Default.SoftName;
    $(#config_enable_upgrade).value = CONF.Default.EnableUpgrade;

    //图片搜索引擎
    $(#config_search_engines).value = CONF.Default.SearchEngines;

    var cursor_url = CONF.Default.Cursor;
    cursor_url = cursor_url.split("\/").join(SEPARATOR);
    cursor_url = cursor_url.split(CONF.RootPath.toString()).join("");

    var backgroundImage = CONF.Default.BackgroundImage;
    backgroundImage = backgroundImage.split("\/").join(SEPARATOR);
    backgroundImage = backgroundImage.split(CONF.RootPath.toString()).join("");

    var backgroundMask = CONF.Default.BackgroundMask;
    backgroundMask = backgroundMask.split("\/").join(SEPARATOR);
    backgroundMask = backgroundMask.split(CONF.RootPath.toString()).join("");

    var musicPlayer = CONF.Default.MusicPlayer;
    musicPlayer = musicPlayer.split("\/").join(SEPARATOR);
    musicPlayer = musicPlayer.split(CONF.RootPath.toString()).join("");

    //生成界面选项
    $(#config_background).value = backgroundImage;
    $(#config_background_repeat).value = CONF.Default.BackgroundRepeat;
    $(#config_background_fuzzy).value = CONF.Default.BackgroundFuzzy;
    $(#config_background_mask).value = backgroundMask;
    $(#config_cursor).html = cursor_url;
    $(#config_music_player).html = musicPlayer;

    //壁纸
    var wallpaper_image = CONF.Default.WallpaperImage.split("\/").join(SEPARATOR);
    wallpaper_image = wallpaper_image.split(CONF.RootPath.toString()).join("");
    $(#config_wallpaper).value = wallpaper_image;


    //生成快捷工具列表
    var shortcut = "";
    var shortcut_list = JSON.parse(mainView.GetShortcut());

    for(var s in shortcut_list) {
        shortcut += "<li id='shortcut_li_"+ s.Id +"' value='"+ s.Id +"'>";
        shortcut += "<input type='text' id='shortcut_name_"+ s.Id + "' value='"+ s.Name +"' title='"+CONF.Lang.ShortcutNameDesc+"' />";
        shortcut += "<input type='text' id='shortcut_path_"+ s.Id + "' value='"+ s.Path +"' title='"+CONF.Lang.ShortcutPathDesc+"' />";
        shortcut += "<button class='openfile' for='shortcut_path_" + s.Id + "' caption='' filter='All Files (*.*)|*.*'>...</button>";
        shortcut += "<button class='shortcut_update' value='"+ s.Id +"'>"+CONF.Lang.Update+"</button>";
        shortcut += "<button class='shortcut_delete' value='"+ s.Id +"'>"+CONF.Lang.Delete+"</button>";
        shortcut += "<label title='"+CONF.Lang.ShortcutSortDesc+"'><i.sort></i></label>";
        shortcut += "</li>";
    }
    $(#shortcut_list).html = shortcut;

    //游戏资料枚举
    $(#rombase_type).value = mainView.GetRombaseEnumByType("type");
    $(#rombase_producer).value = mainView.GetRombaseEnumByType("producer");
    $(#rombase_publisher).value = mainView.GetRombaseEnumByType("publisher");
    $(#rombase_country).value = mainView.GetRombaseEnumByType("country");
    $(#rombase_version).value = mainView.GetRombaseEnumByType("version");

    //生成图集排序项
    var thumbList = ["title","thumb","snap","poster","packing","cassette","icon","gif","background","wallpaper","video"];
    var sort = JSON.parse(CONF.Default.ThumbOrders);
    var orderHtml = "";    
    var langTitle = "";
    for (var s in sort){
        langTitle = s.slice(0, 1).toUpperCase() + s.slice(1)
        orderHtml += "<li opt='"+ s +"'>" + CONF.Lang[langTitle] + "</li>";        
    }
    if(thumbList.length > sort.length){
        for (var p in thumbList){            
            if(sort.indexOf(p) == -1){
                langTitle = p.slice(0, 1).toUpperCase() + p.slice(1)
                orderHtml += "<li opt='"+ p +"'>"+ CONF.Lang[langTitle] +"</li>";
            }
        }
    }
    $(#thumb_orders).html = orderHtml;

}


//更新通用配置信息
function configSubmit(evt){

    var data = {
        lang : $(#config_lang).value.toString(),
        soft_name : $(#config_soft_name).value.toString(),
        search_engines : $(#config_search_engines).value.toString(),
        enable_upgrade :$(#config_enable_upgrade).value,
        music_player :$(#config_music_player).value,
    };

    //更新平台信息
    for(var k in data) {
        var result = mainView.UpdateConfig(k,data[k]);
    }

    alert(CONF.Lang.UpdateSuccess);
}

//选择文件夹
function openFolder(evt) {
    var url = view.selectFolder(evt.attributes["caption"]);
    var out = self.select("#"+evt.attributes["for"]);
    if(url){
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");
        out.value = url;
    }
}

//选择文件
function openFile(evt) {
    const defaultExt = "";
    const initialPath = "";
    const filter = evt.attributes["filter"];
    const caption = evt.attributes["caption"];
    var url = view.selectFile(#open, filter, defaultExt, initialPath, caption );
    var out = self.select("#"+evt.attributes["for"]);  
    if(url){
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");
        out.value = url;
        out.focus = true;
        out.focus = false;
    }
}


//添加快捷工具
function shortcutAdd(evt) {
    var insertId = mainView.AddShortcut();
    if(insertId != "0"){
        var shortcut = "";
        shortcut += "<li id='shortcut_li_"+ insertId +"' value='"+ insertId +"'>";
        shortcut += "<input type='text' novalue='"+ CONF.Lang.FileName +"' id='shortcut_name_"+ insertId + "' value='' title='"+CONF.Lang.ShortcutNameDesc+"' />";
        shortcut += "<input type='text' novalue='"+ CONF.Lang.FilePath +"'  id='shortcut_path_"+ insertId + "' value='' title='"+CONF.Lang.ShortcutPathDesc+"' />";
        shortcut += "<button class='openfile' for='shortcut_path_" + insertId + "' caption='' filter='All Files (*.*)|*.*'>...</button>";
        shortcut += "<button class='shortcut_update' value='"+ insertId +"'>"+CONF.Lang.Update+"</button>";
        shortcut += "<button class='shortcut_delete' value='"+ insertId +"'>"+CONF.Lang.Delete+"</button>";
        shortcut += "<label title='"+CONF.Lang.ShortcutSortDesc+"'><i.sort></i></label>";
        shortcut += "</li>";
        $(#shortcut_list).append(shortcut);
    }
}

//更新快捷工具
function shortcutUpdate(evt) {
    var id = evt.attributes["value"];
    var parentDom = $(#shortcut_list);
    var name = parentDom.select("#shortcut_name_" + id).value;
    var path = parentDom.select("#shortcut_path_" + id).value;
    if(name == "" || name == undefined ){
        alert(CONF.Lang.ShortcutNameNotFound);
        return;
    }

    if(path == "" || path == undefined){
        alert(CONF.Lang.ShortcutPathNotFound);
        return;
    }

    var obj = {
        id:id,
        name:name,
        path:path,
    };
    var datastr = JSON.stringify(obj);
    var result = mainView.UpdateShortcut(datastr);
    alert(CONF.Lang.UpdateSuccess);
}

//删除快捷工具
function shortcutDelete(evt) {
    //确认窗口
    var result = confirm(CONF.Lang.DeleteConfirm,CONF.Lang.DeletePlatform);
    if (result != "yes"){
        return true;
    }

    var id = evt.attributes["value"];
    //开始执行删除操作
    result = mainView.DelShortcut(id);
    if(result == "1"){
        self.select("#shortcut_li_" + id).remove();
    }
}

//更新鼠标指针
function setCursor(obj){
    var saveVal = URL.toPath(obj.value);
    saveVal = saveVal.split("\/").join(SEPARATOR);
    saveVal = saveVal.split(CONF.RootPath.toString()).join("");
    $(body).style["cursor"] = [url:URL.fromPath(obj.value)];
}

//更新背景图片
function setBackgroundImage(obj){
    mainView.root.$(body).style["background-image"] = [url:URL.fromPath(obj.value)];
    var saveVal = URL.toPath(obj.value);
    saveVal = saveVal.split("\/").join(SEPARATOR);
    saveVal = saveVal.split(CONF.RootPath.toString()).join("");
}

//更新背景循环方式
function setBackgroundRepeat(obj){
    if(obj.value == "cover"){
        mainView.root.$(#center).style["background-size"] = obj.value;
        mainView.root.$(#center).style["background-repeat"] = "no-repeat";
    }else if(obj.value == "repeat"){
        mainView.root.$(#center).style["background-repeat"] = obj.value;
        mainView.root.$(#center).style["background-size"] = "auto auto";
    }else{
        mainView.root.$(#center).style["background-repeat"] = obj.value;
        mainView.root.$(#center).style["background-size"] = "contain";
    }
}

//背景模糊度数
function setBackgroundFuzzy(obj){
    var center = mainView.root.$(#center);
    if(obj.value > 0 && center.style["background-image"] != "" && center.style["background-image"] != "url()"){
        mainView.root.$(#center_fuzzy).style["display"] = "block";
        mainView.root.$(#center_fuzzy).attributes.remove("class");
        mainView.root.$(#center_fuzzy).attributes.addClass("fuzzy"+obj.value);
    }else{
        mainView.root.$(#center_fuzzy).style["display"] = "none"; 
    }
}

//背景遮罩图片
function setBackgroundMask(obj){
    mainView.root.$(#center_mask).style["background-image"] = [url:URL.fromPath(obj.value)];
    var saveVal = URL.toPath(obj.value);
    saveVal = saveVal.split("\/").join(SEPARATOR);
    saveVal = saveVal.split(CONF.RootPath.toString()).join("");
}

//提交界面样式
function interfaceSubmit(obj){
    var cursor = $(#config_cursor).value;
    var background_image = $(#config_background).value;
    var background_repeat = $(#config_background_repeat).value;
    var background_fuzzy = $(#config_background_fuzzy).value;
    var background_mask = $(#config_background_mask).value;
    var wallpaper_image = $(#config_wallpaper).value;

    mainView.UpdateConfig("cursor",cursor);
    mainView.UpdateConfig("background_image",background_image);
    mainView.UpdateConfig("background_repeat",background_repeat);
    mainView.UpdateConfig("background_fuzzy",background_fuzzy);
    mainView.UpdateConfig("background_mask",background_mask);
    mainView.UpdateConfig("wallpaper_image",wallpaper_image);

    alert(CONF.Lang.UpdateSuccess);
}

//游戏资料枚举设置
function rombaseSubmit(){
    mainView.UpdateRomBaseEnumByType("type",$(#rombase_type).value);
    mainView.UpdateRomBaseEnumByType("publisher",$(#rombase_publisher).value);
    mainView.UpdateRomBaseEnumByType("producer",$(#rombase_producer).value);
    mainView.UpdateRomBaseEnumByType("country",$(#rombase_country).value);
    mainView.UpdateRomBaseEnumByType("version",$(#rombase_version).value);
    alert(CONF.Lang.UpdateSuccess);
}