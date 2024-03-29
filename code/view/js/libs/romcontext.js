﻿//右键菜单启动游戏
function contextRunGame(evt) {
    view.RunGame(evt.attributes["rid"], evt.attributes['sim']);
}

//右键菜单定位目录
function openFolder(evt) {
    if (evt.attributes["opt"] == "" || evt.attributes["opt"] == undefined) {
        return;
    }
    if (evt.attributes["opt"] == "sim") {
        view.OpenFolder(evt.attributes["rid"], evt.attributes["opt"], evt.attributes["sid"]);
    } else {
        view.OpenFolder(evt.attributes["rid"], evt.attributes["opt"], "");
    }
}

//移动rom
function romMove(evt) {

    //结束掉侧边栏视频
    closeRightVideo();

    var response = view.dialog({
        url: self.url(ROOTPATH + "rom_move.html"),
        width: self.toPixels(300dip),
        height: self.toPixels(565dip),
        parameters: {
            id: evt.attributes["rid"];
        };
    });

    if (response != undefined) {
        view.CreateRomCache(ACTIVE_PLATFORM);
    }
}

//右键菜单设置喜爱
function contextSetFavorite(evt) {
    var result = view.SetFavorite(evt.attributes["rid"], evt.attributes["value"]);
    var rdom = $(#romlist).select("li[rid=" + evt.attributes["rid"] + "]");

    if (evt.attributes["value"] == 1) {
        evt.attributes.removeClass('fav1');
        evt.attributes.addClass('fav0');
        evt.attributes["value"] = 0;
        evt.html = CONF.Lang.CancelFavorite;

        if ($(#switch_romlist).attributes["value"] == 1) {
            rdom.select(".rom_star").style["display"] = "block";
        } else {
            rdom.select("div").attributes.addClass("fav");
        }
    } else {
        evt.attributes.removeClass('fav0');
        evt.attributes.addClass('fav1');
        evt.attributes["value"] = 1;
        evt.html = CONF.Lang.SetFavorite;
        if ($(#switch_romlist).attributes["value"] == 1) {
            rdom.select(".rom_star").style["display"] = "none";
        } else {
            rdom.select("div").attributes.removeClass("fav");
        }
    }
}

//右键菜单设为隐藏
function contextSetHide(evt) {

    var id = evt.attributes["rid"];
    var result = view.SetHide(id, evt.attributes["value"]);

    if (evt.attributes["value"] == 1) {
        evt.attributes.removeClass('hide1');
        evt.attributes.addClass('hide0');
        evt.attributes["value"] = 0;
        evt.html = CONF.Lang.CancelHide;

    } else {
        evt.attributes.removeClass('hide0');
        evt.attributes.addClass('hide1');
        evt.attributes["value"] = 1;
        evt.html = CONF.Lang.SetHide;
    }

    //从rom列表中删除dom
    var rdom = $(#romlist).select("li[rid=" + id + "]");
    if (rdom != undefined) {
        rdom.remove();
    }
}
//重命名
function rename(evt) {
    var detailObj = JSON.parse(view.GetGameById(evt.attributes["rid"]));
    var name = getRomName(detailObj.RomPath);
    var data = view.dialog({
        url: self.url(ROOTPATH + "rom_rename.html"),
        width: self.toPixels(300dip),
        height: self.toPixels(225dip),
        parameters: {
            name: name
        };
    });

    if (data == undefined) {
        return;
    }

    //结束掉侧边栏视频
    closeRightVideo();

    view.RomRename(detailObj.Id, data.name);

    //列表回显
    var dom = self.select(".romitem[rid=" + detailObj.Id + "]");
    if (dom == undefined) {
        return;
    }
    detailObj = JSON.parse(view.GetGameById(evt.attributes["rid"]));
    if (dom.select(".name") != undefined) dom.select(".name").html = detailObj.Name;

}

//基础信息
function baseinfo(evt) {

    var data = view.dialog({
        url: self.url(ROOTPATH + "edit_rombase.html"),
        width: self.toPixels(530dip),
        height: self.toPixels(430dip),
        parameters: {
            id: evt.attributes["rid"],
        };
    });

    if (data != undefined) {
        var info = JSON.parse(data);
        var dom = self.select(".romitem[rid=" + evt.attributes['rid'] + "]");
        if (dom == undefined) {
            return;
        }
        if (dom.select(".name") != undefined) dom.select(".name").html = info.Name;
        if (dom.select(".type") != undefined) dom.select(".type").html = info.BaseType;
        if (dom.select(".year") != undefined) dom.select(".year").html = info.BaseYear;
        if (dom.select(".producer") != undefined) dom.select(".producer").html = info.BaseProducer;
        if (dom.select(".publisher") != undefined) dom.select(".publisher").html = info.BasePublisher;
        if (dom.select(".country") != undefined) dom.select(".country").html = info.BaseCountry;
        if (dom.select(".translate") != undefined) dom.select(".translate").html = info.BaseTranslate;
        if (dom.select(".version") != undefined) dom.select(".version").html = info.BaseVersion;
    }
}

//编辑子游戏
function editSubGame(id) {

    var data = view.dialog({
        url: self.url(ROOTPATH + "edit_rom_subgame.html"),
        width: self.toPixels(1200dip),
        height: self.toPixels(700dip),
        parameters: {
            id: id,
        };
    });
    CB_createCache();
}

//编辑游戏攻略
function editStrategy(evt) {
    var data = view.dialog({
        url: self.url(ROOTPATH + "edit_rom_strategy.html"),
        width: self.toPixels(550dip),
        height: self.toPixels(610dip),
        parameters: {
            id: evt.attributes["rid"],
        };
    });
}

//编辑游戏音频
function editAudio(evt) {
    var data = view.dialog({
        url: self.url(ROOTPATH + "edit_rom_audio.html"),
        width: self.toPixels(550dip),
        height: self.toPixels(610dip),
        parameters: {
            id: evt.attributes["rid"],
        };
    });
}

//rom模块右键菜单
function romContextMenu(obj) {
    var romcontext = $(#romcontext);
    romcontext.clear();
    var getjson = view.GetGameDetail(obj.attributes["rid"]);
    var detailObj = JSON.parse(getjson);
    var pfId = detailObj.Info.Platform.toString();
    var simId = 0;
    var simIco = "";
    if (detailObj.Info.SimId != 0) {
        simId = detailObj.Info.SimId;
    } else if (CONF.Platform[pfId].UseSim != undefined) {
        simId = CONF.Platform[pfId].UseSim["Id"];
    }
    //读取模拟器图标
    if (simId != 0) {
        simId = simId.toString();
        if (CONF.Platform[pfId].SimList[simId] != undefined) {
            simIco = CONF.Platform[pfId].SimList[simId].Path;
        } else {
            simIco = CONF.Platform[pfId].UseSim["Path"];
        }
    }

    //主游戏
    var btndata = "<li class='file menu_run_game' sim='' filename='" + simIco + "' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.Run + " " + detailObj.Info.Name.toHtmlString() + "</li>";

    //子游戏
    for (var sub in detailObj.Sublist) {
        btndata += "<li class='file menu_run_game' sim='' filename='" + simIco + "' rid='" + sub.Id + "'>" + CONF.Lang.Run + " " + sub.Name.toHtmlString() + "</li>";;
    }

    btndata += "<hr />";

    if (detailObj.Info.Star == 1) {
        btndata += "<li class='fav fav0' value='0' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.CancelFavorite + " [F]</li>";
    } else {
        btndata += "<li class='fav fav1' value='1' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.SetFavorite + " [F]</li>";
    }

    if (detailObj.Info.Hide == 1) {
        btndata += "<li class='hide hide0' value='0' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.CancelHide + " [H]</li>";
    } else {
        btndata += "<li class='hide hide1' value='1' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.SetHide + " [H]</li>";
    }
    btndata += "<hr />";

    btndata += "<li class='baseinfo' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.EditBaseInfo + " [E]</li>";
    btndata += "<li class='strategy' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.EditDocAndStrategy + " [G]</li>";
    btndata += "<li class='subgame' platform=" + detailObj.Info.Platform + " rid='" + detailObj.Info.Id + "'>" + CONF.Lang.EditSubGame + " [S]</li>";
    btndata += "<li class='audio' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.EditAudio + " [A]</li>";
    btndata += "<hr />";
    btndata += "<li class='rename' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.Rename + " [R]</li>";
    btndata += "<li class='move' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.RomMove + " [M]</li>";
    btndata += "<li class='delete' rid='" + detailObj.Info.Id + "'>" + CONF.Lang.Delete + " [DEL]</li>";
    btndata += "<hr />";
    //打开文件夹
    btndata += createOpenFolderMenu(detailObj.Info);

    romcontext.append(btndata);
}

//删除rom及相关资源文件
function deleteRom(id) {

    //确认窗口
    var result = view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        width: self.toPixels(500dip),
        height: self.toPixels(200dip),
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

    var dom = $(#romlist).select("li[rid=" + id + "]");
    if (dom != undefined) {
        dom.remove(); //删除页面dom
    }

    var deleteRes = 0;
    if (result == "all") {
        deleteRes = 1;
    }

    //结束掉侧边栏视频
    closeRightVideo();

    view.DeleteRom(id, deleteRes); //删除实体文件
    alert(CONF.Lang.DeleteSuccess); //删除成功

}
