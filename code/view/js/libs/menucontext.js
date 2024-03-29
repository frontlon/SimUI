﻿//rom模块右键菜单
function menuContextMenu(obj){

    var menucontext = $(#menucontext);
    menucontext.clear();

    if(obj.attributes.hasClass("fixed")){
        return true;
    }

    var btndata = "";
    var opt = obj.attributes["opt"];
    btndata += "<li class='rename' opt=\""+ opt +"\">"+ CONF.Lang.Rename +"</li>";
    btndata += "<hr />";
    btndata += "<li class='delete' opt=\""+ opt +"\">"+ CONF.Lang.Delete +"</li>";
    menucontext.append(btndata);
}

//重命名
function renameMenu(evt){
    var newName = view.dialog({
        url:self.url(ROOTPATH + "menu_rename.html"),
        width:self.toPixels(400dip),
        height:self.toPixels(200dip),
        parameters: {
            name:evt.attributes["opt"],
            platform:$(#platform_ul).select("li:current").attributes["platform"].toString();
        };
    });
    if(newName == undefined){
        return;
    }
    view.CreateRomCache($(#platform_ul).select("li:current").attributes["platform"]);
}


//删除rom及相关资源文件
function deleteMenu(obj){

    //确认窗口
    var result = confirm(CONF.Lang.DeleteMenuConfirm,CONF.Lang.DeleteMenu);
    if (result != "yes"){
        return true;
    }

    view.DeleteMenu($(#platform_ul).select("li:current").attributes["platform"],obj.attributes["opt"]); //删除实体文件
    view.CreateRomCache($(#platform_ul).select("li:current").attributes["platform"]);

}
