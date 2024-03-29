
/**
 * 文件管理
 **/

 //切换平台 - 文件管理
function managerChangeRomFilePlatform(platformId){
    
    if (platformId == 0){
        return;
    }

    //创建菜单
    var dd = createMenuOption(platformId);
    var menulist = self.$(#menu_file);
    menulist.options.clear();
    if(dd != ""){
        menulist.options.html = dd; //生成dom
    }else{
        menulist.options.html = "<option value=''>"+ CONF.Lang.AllGames +"</option>"; //生成dom
    }
    menulist.value = "";

    //生成默认游戏列表
    var req = {
        "showHide" : 1,
        "platform" : platformId.toInteger(),
    };
    var request = JSON.stringify(req);

    var romjson = mainView.GetGameList(request);
    $(#romlist_file tbody).html = "";
    managerCreateRomFile(romjson);

    //生成分页数据
    var romCount = mainView.GetGameCount(request); //必须在获取rom的方法下面
    var pages = managerCreatePages(romCount);
    $(#pages_file).html = pages;
    if(pages != ""){
        $(#pages_file).style["display"] = "block";
        $(#pages_file).select("li:nth-child(1)").state.current = true;
    }
    if($$(#pages_file li).length == 1){
        $(#pages_file).style["display"] = "none";
    }
}

//创建资料rom列表 - 文件管理
function managerCreateRomFile(romjson){
    var romobj = JSON.parse(romjson);
    var romData = "";
    for(var obj in romobj) {
        if(obj.Menu == "_7b9"){
            obj.Menu = "";
        }

        var hide = obj.Hide == 1? CONF.Lang.Hide:CONF.Lang.Show;

        romData += "<tr rid='"+ obj.Id +"'>";
        var romName = obj.RomPath.replace("\\","/");
        var romPath = romName.split("/");
        var filename = romPath[romPath.length - 1].split(".");
        romData += "<td><input class='check_file' type='checkbox' value='"+ obj.Id +"' class='check_file' /></td>";
        romData += "<td>"+ filename[0] +"</td>";
        romData += "<td>"+ obj.Name.toHtmlString() +"</td>";
        romData += "<td>" + obj.Menu + "</td>";
        romData += "<td class='file_hide' opt='"+ obj.Hide +"'>"+ hide +"</td>";
        romData += "</tr>"
    }
    $(#romlist_file tbody).html = romData;
}

//切换目录 - 文件管理
function managerChangeRomFileMenu(menuName){

    var platformId = $(#platform_file).value;

    //生成默认游戏列表
        var req = {
        "showHide" : 1,
        "platform" : platformId.toInteger(),
        "catname" : menuName,
    };
    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);
    $(#romlist_file tbody).html = "";
    managerCreateRomFile(romjson);

    var romCount = mainView.GetGameCount(request); //必须在获取rom的方法下面
    var pages = managerCreatePages(romCount);
    $(#pages_file).html = pages;
    if(pages != ""){
        $(#pages_file).style["display"] = "block";
        $(#pages_file).select("li:nth-child(1)").state.current = true;
    }
    if($$(#pages_file li).length == 1){
        $(#pages_file).style["display"] = "none";
    }
}

//点击分页按钮 - 文件管理
function managerCreateRomFileByPages(obj){
    if(obj.state.current == true){
        return;
    }
    var platformId = $(#platform_file).value;
    var id = obj.parent.id;
    var num = obj.html.toInteger() - 1;
    var req = {
        "showHide" : 1,
        "platform" : platformId.toInteger(),
    };
    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);
    $(#romlist_file tbody).html = "";
    managerCreateRomFile(romjson);
    obj.state.current = true;
    $(body).scrollTo(0,0, false);
}

//解压后运行 - 文件管理
function managerChangeRomHide(hide){
    var checks = $$(#romlist_file .check_file:checked);
    if(hide.toString() == ""){
        return;
    }
    if(checks.length == 0){
    alert(CONF.Lang.NotSelectGames);
        return;
    }

    var arr = [];
    for(var c in checks){
        arr.push(c.value);
    }
    var ids = arr.join(",");
    var text = hide == 1 ? CONF.Lang.Hide:CONF.Lang.Show;

    mainView.SetHideBatch(ids,hide);
    for(var c in checks){
        c.parent.parent.select(".file_hide").text = text;
    }
    $(#select_hide).value = "";

}


//移动文件 - 文件管理
function managerFileMoveRom(){

    var checks = $$(#romlist_file .check_file:checked);
    if(checks.length == 0){
    alert(CONF.Lang.NotSelectGames);
        return;
    }

    var arr = [];
    for(var c in checks){
        arr.push(c.value);
    }
    var ids = arr.join(",");
    var platformId = $(#platform_file).value;

    var response = view.dialog({
        url:self.url(ROOTPATH + "rom_move.html"),
        width:self.toPixels(300dip),
        height:self.toPixels(565dip),
        parameters: {
            id:ids,
            platform:platformId,
        };
    });

    if(response != undefined){
        var info = JSON.parse(response);
        var platformId = $(#platform_file).value;
        var menu = $(#menu_file).value;
        var newPlatformId = info.platform;
        var newMenu = info.menu;

        //删除当前平台数据
        if(platformId != newPlatformId){        
            for(var c in checks){
                c.parent.parent.remove();
            }
        //修改目录
        }else{
            for(var c in checks){
                c.parent.nextNode.nextNode.nextNode.html = newMenu;
            }
        }

        
    }

}

//删除文件 - 文件管理
function managerFileDelete(){

    var checks = $$(#romlist_file .check_file:checked);
    if(checks.length == 0){
    alert(CONF.Lang.NotSelectGames);
        return;
    }

    var arr = [];
    for(var c in checks){
        arr.push(c.value);
    }

    //确认窗口
    var result = confirm(CONF.Lang.DeleteRomConfirm,CONF.Lang.DeleteRom);
    if (result != "yes"){
        return true;
    }

    for(var id in arr) {
        mainView.DeleteRom(id); //删除实体文件
        //删除页面上的dom
    }

    alert(CONF.Lang.DeleteSuccess); //删除成功

}