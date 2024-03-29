/**
 * 子游戏管理
 **/


var RENAME_ID = 0; //rom改名用id
var RENAME_TYPE = 0; //rom改名类型，1别名2文件名
var MASTER_ROM_ID = 0; //主romid

//切换平台 - 子游戏管理 - 主
function managerChangeSubgamePlatform(platformId) {

    if (platformId == 0) {
        return;
    }

    //创建菜单
    var dd = createMenuOption(platformId);
    var menu_master = $(#menu_subgame_master);
    var menu_slave = $(#menu_subgame_slave);
    menu_master.options.clear();
    menu_slave.options.clear();

    if (dd != "") {
        menu_master.options.html = dd; //生成dom
        menu_slave.options.html = dd; //生成dom
    } else {
        menu_master.html = "<option value=''>" + CONF.Lang.AllGames + "</option>"; //生成dom
        menu_slave.html = "<option value=''>" + CONF.Lang.AllGames + "</option>"; //生成dom
    }
    menu_master.value = "";
    menu_slave.value = "";

    //生成主游戏列表
    managerCreateListMaster(0);

    //生成子游戏列表
    managerCreateListSlave(0);
}

//创建资料rom列表 - 子游戏管理 - 主rom列表
function managerCreateSubgameMaster(romjson) {
    var romobj = JSON.parse(romjson);
    var romData = "";
    for (var obj in romobj) {
        romData += "<tr rid='" + obj.Id + "'>";
        romData += "<td><span.name>" + obj.Name + "</span></td>";
        romData += "<td>" + obj.RomPath + "</td>";
        romData += "<td></td>";
        romData += "</tr>";

        //加载子游戏
        if (obj.SubGames != null && obj.SubGames.length > 0) {
            for (var sub in obj.SubGames) {
                romData += "<tr class='sub_tr' rid='" + sub.Id + "'>";
                romData += "<td>&#12288;┗&#12288;<span.name>" + sub.Name + "</span></td>";
                romData += "<td>" + sub.RomPath + "</td>";
                romData += "<td><button rid='" + sub.Id + "' class='small_btn'>" + CONF.Lang.UnBind + "</button></td>";
                romData += "</tr>";
            }
        }

    }
    return romData;
}

//创建资料rom列表 - 子游戏管理 - 子rom列表
function managerCreateSubgameSlave(romjson) {
    var romobj = JSON.parse(romjson);
    var romData = "";
    for (var obj in romobj) {
        romData += "<tr rid='" + obj.Id + "'>";
        romData += "<td>" + obj.Name + "</td>";
        romData += "<td>" + obj.RomPath + "</td>";
        romData += "<td><button rid='" + obj.Id + "' class='small_btn'>" + CONF.Lang.Bind + "</button></td>";
        romData += "</tr>";
    }
    return romData;
}

//渲染主列表 - 子游戏管理
function managerCreateListMaster(page = 0, pageObj = undefined) {

    var platformId = $(#platform_subgame).value;
    if (platformId == 0) {
        alert(CONF.Lang.NotSelectPlatform);
        return;
    }
    var menuName = $(#menu_subgame_master).value;
    var keyword = $(#search_subgame_master).value;
    //生成默认游戏列表
    var req = {
        "showSubGame": 1,
        "keyword": keyword,
        "platform": platformId.toInteger(),
        "catname": menuName,
        "page": page,
    };

    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);

    $(#romlist_subgame_master tbody).html = managerCreateSubgameMaster(romjson);

    if (pageObj == undefined) {
        var romCount = mainView.GetGameCount(request); //必须在获取rom的方法下面

        var pages = managerCreatePages(romCount);

        var pageDom;
        var pageDomMulti;
        pageDom = $(#pages_subgame_master);
        pageDomMulti = $$(#pages_subgame_master li);

        pageDom.html = pages;
        if (pages != "") {
            pageDom.select("li:nth-child(1)").state.current = true;
        }
        if (pageDomMulti.length == 1) {
            pageDom.style["display"] = "none";
        }
    } else {
        pageObj.state.current = true;
        $(#subgame_left).scrollTo(0, 0, false);
    }
}

//渲染子列表 - 子游戏管理
function managerCreateListSlave(page = 0, pageObj = undefined) {

    var platformId = $(#platform_subgame).value;
    if (platformId == 0) {
        alert(CONF.Lang.NotSelectPlatform);
        return;
    }
    var menuName = $(#menu_subgame_slave).value;
    var keyword = $(#search_subgame_slave).value;
    //生成默认游戏列表
    var req = {
        "keyword": keyword,
        "platform": platformId.toInteger(),
        "catname": menuName,
        "page": page,
    };

    var request = JSON.stringify(req);
    var romjson = mainView.GetGameListNotSubGame(request);
    $(#romlist_subgame_slave tbody).html = managerCreateSubgameSlave(romjson);

    if (pageObj == undefined) {
        var romCount = mainView.GetGameCountNotSubGame(request); //必须在获取rom的方法下面
        var pages = managerCreatePages(romCount);
        var pageDom = $(#pages_subgame_slave);
        pageDom.html = pages;
        var pageDomMulti = $$(#pages_subgame_slave li);
        if (pages != "") {
            pageDom.style["display"] = "block";
            pageDom.select("li:nth-child(1)").state.current = true;
        }
        if (pageDomMulti.length == 1) {
            pageDom.style["display"] = "none";
        }
    } else {
        pageObj.state.current = true;
        $(body).scrollTo(0, 0, false);
    }
}


//选定主rom
function managerSetMasterGame(obj) {
    if (obj.attributes.hasClass("sub_tr")) {
        return;
    }
    obj.state.current = true;
    MASTER_ROM_ID = obj.attributes["rid"];
}
//绑定rom
function managerBindGame(obj) {

    var pdom = $(#romlist_subgame_master).select("tr:current");
    if (pdom == undefined) {
        alert(CONF.Lang.NotSelectMasterGame);
        return;
    }

    var pid = pdom.attributes["rid"]
    var sid = obj.attributes["rid"];

    if (pid == sid) {
        alert(CONF.Lang.CannotBindItself);
        return;
    }

    var sinfo = JSON.parse(mainView.BindSubGame(pid, sid));

    var name = sinfo.Name;
    var romPath = sinfo.RomPath;
    var id = sinfo.Id;

    //删除主列表行
    var masterDom = $(#romlist_subgame_master tbody).select("tr[rid=" + sid + "]");
    if (masterDom != undefined) {
        masterDom.remove();
    }


    var el = Element.create(<tr class='sub_tr' rid={id}><td>&#12288;┗&#12288;<span.name>{name}</span></td><td>{romPath}</td><td><button rid={id} class='small_btn'>{CONF.Lang.UnBind}</button></td></tr>);

    //在父列表插入dom
    pdom.insertNodeAfter(el);

    //删除子列表行
    obj.parent.parent.remove();

}

//解绑rom
function managerUnBindGame(obj) {

    var id = obj.attributes["rid"];

    var sinfo = JSON.parse(mainView.UnBindSubGame(id));

    var romData = "";
    romData += "<tr>";
    romData += "<td>" + sinfo.Name + "</td>";
    romData += "<td>" + sinfo.RomPath + "</td>";
    romData += "<td><button rid='" + sinfo.Id + "' class='small_btn'>" + CONF.Lang.Bind + "</button></td>";
    romData += "</tr>";

    //在子列表插入dom
    $(#romlist_subgame_slave tbody).prepend(romData);

    //删除列表行
    obj.parent.parent.remove();

}

//rom模块右键菜单
function managerSubGameContextMenu(obj) {
    var romcontext = $(#subGameContext);
    romcontext.clear();
    var btndata = "";
    btndata += "<li class='basename' rid='" + obj.attributes["rid"] + "'>" + CONF.Lang.RenameBaseName + "</li>";
    btndata += "<li class='rename' rid='" + obj.attributes["rid"] + "'>" + CONF.Lang.RenameFileName + "</li>";
    btndata += "<li class='delete' rid='" + obj.attributes["rid"] + "'>" + CONF.Lang.Delete + "</li>";
    romcontext.append(btndata);
}

//rom右键删除rom
function managerDeleteRom(obj) {
    var id = obj.attributes["rid"];

    //确认窗口
    var result = view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        width: self.toPixels(500dip),
        parameters: {
            type: "warning",
            caption: CONF.Lang.DeleteRom,
            text: CONF.Lang.DeleteRomConfirm,
            buttons: [
                { id: "rom", text: CONF.Lang.DeleteRomFile },
                { id: "all", text: CONF.Lang.DeleteRomFileAndRes },
                { id: "cancel", text: CONF.Lang.Cancel, role: "default-button" }
            ]
        };
    });

    if (result == undefined || result == "cancel") {
        return true;
    }


    var deleteRes = 0;
    if (result == "all") {
        deleteRes = 1;
    }

    //结束掉侧边栏视频
    closeRightVideo();

    mainView.DeleteRom(id, deleteRes); //删除实体文件
    alert(CONF.Lang.DeleteSuccess); //删除成功


    //删除页面dom
    var masterDom = $(#romlist_subgame_master tbody).select("tr[rid=" + id + "]");
    var slaveDom = $(#romlist_subgame_slave tbody).select("tr[rid=" + id + "]");
    if (masterDom != undefined) {
        masterDom.remove();
    }
    if (slaveDom != undefined) {
        slaveDom.remove();
    }
}

//打开改别名窗口
function openbaseNameBox(obj) {

    var id = obj.attributes["rid"];;
    var renameDom = $(#romlist_subgame_master tbody).select("tr[rid=" + id + "] td:nth-child(1) span");
    if (renameDom != undefined) {
        RENAME_ID = obj.attributes["rid"];
        RENAME_TYPE = 1;
        $(#rename_input).value = renameDom.html.htmlUnescape();
        $(#rename_box h2).html = CONF.Lang.RenameBaseName + ":";
        $(#rename_box).style["display"] = "block";
        $(#rename_input).focus = true;
    }
}

//打开改文件名窗口
function openRenameBox(obj) {

    var id = obj.attributes["rid"];;
    var renameDom = $(#romlist_subgame_master tbody).select("tr[rid=" + id + "] td:nth-child(2)");
    if (renameDom != undefined) {
        RENAME_ID = obj.attributes["rid"];
        RENAME_TYPE = 2;
        $(#rename_input).value = getRomName(renameDom.html).htmlUnescape();
        $(#rename_box h2).html = CONF.Lang.RenameFileName + ":";
        $(#rename_box).style["display"] = "block";
        $(#rename_input).focus = true;
    }
}

//关闭改名窗口
function closeRenameBox() {
    $(#rename_box).style["display"] = "none";
    $(#rename_input).value = "";
    RENAME_ID = 0;
    RENAME_TYPE = 0;
}

//改别名
function managerSubGameEditName() {

    if ($(#rename_box).style["display"] == "none") {
        return;
    }

    if (RENAME_TYPE == 0) {
        return;
    }

    var name = $(#rename_input).value;


    if (RENAME_TYPE == 1) {
        //改别名
        mainView.SetRomBaseName(RENAME_ID, name);

        //同步列表内容
        var masterDom = $(#romlist_subgame_master tbody).select("tr[rid=" + RENAME_ID + "] td:nth-child(1) span");
        if (masterDom != undefined) {
            masterDom.html = name;
        }

        var slaveDom = $(#romlist_subgame_slave tbody).select("tr[rid=" + RENAME_ID + "] td:nth-child(1) span");
        if (slaveDom != undefined) {
            slaveDom.html = name;
        }
    } else if (RENAME_TYPE == 2) {
        //改文件名
        mainView.RomRename(RENAME_ID, name);

        //同步列表内容
        var detailObj = JSON.parse(mainView.GetGameById(RENAME_ID));

        var masterDom = $(#romlist_subgame_master tbody).select("tr[rid=" + RENAME_ID + "] td:nth-child(2)");
        if (masterDom != undefined) {
            masterDom.html = detailObj.RomPath;
        }

        var slaveDom = $(#romlist_subgame_slave tbody).select("tr[rid=" + RENAME_ID + "] td:nth-child(2)");
        if (slaveDom != undefined) {
            slaveDom.html = detailObj.RomPath;
        }

    }

    //隐藏改名框
    $(#rename_box).style["display"] = "none";
    $(#rename_input).value = "";
    RENAME_ID = 0;

}