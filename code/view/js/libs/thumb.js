﻿
//右键添加展示图
function openThumbFile(evt) {
    const defaultExt = "";
    const initialPath = "";
    const filter = evt.attributes["filter"];
    const caption = evt.attributes["caption"];
    var url = view.selectFile(#open, filter, defaultExt, initialPath, caption);

    if (url == undefined) {
        return;
    }
    var getjson = view.GetGameById(ACTIVE_ROM_ID);
    var info = JSON.parse(getjson);
    var type = evt.attributes["for"];
    var sid = evt.attributes["sid"];

    //创建一个模块
    createFileDropZone(info.Platform, type, sid, url);
}

//启动图片下载
function thumbDown(type,sid,romId) {

    var getjson = view.GetGameById(romId);
    var info = JSON.parse(getjson);
    var id = info.Id;
    var name = info.Name;
    var keyword = info.Name;
    var platform = info.Platform;
    view.dialog({
        url: self.url(ROOTPATH + "down_thumbs.html"),
        caption: CONF.Lang.ThumbsDown,
        width: self.toPixels(820dip),
        height: self.toPixels(600dip),
        parameters: {
            id: id,
            sid: sid,
            name: name,
            keyword: keyword,
            type: type,
            platform: platform,
        };
    });

}

function DeleteThumb(evt) {

    //确认窗口
    var result = confirm(CONF.Lang.DeleteThumbConfirm, CONF.Lang.DeleteThumb);
    if (result != "yes") {
        return true;
    }

    var type = evt.attributes["value"];
    var sid = evt.attributes["sid"];

    var currentbDom = self.select("#filedropzone_" + type + " div[sid='" + sid + "'] img");

    if (currentbDom == undefined) {
        return;
    }

    //先把视频结束掉
    if (type == "video") {
        var vdom = $(#right_video);
        if (vdom != undefined) {
            try {
                vdom.videoStop();
                vdom.videoUnload();
            } catch (e) {

            }
        }
    }

    mainView.DeleteThumbs(type, ACTIVE_ROM_ID, sid);
    self.select("#filedropzone_" + type + " div[sid='" + sid + "']").remove();
    var thumb = "";

    //如果删的是主图，需要把一张子转换为主图
    if (sid == "") {
        thumb = URL.fromPath(CONF.RootPath + "theme/" + CONF.Theme[CONF.Default.Theme].Params["default-thumb-image"]);
        var thumbList = $$(#filedropzone_{ type } div.file - drop - zone);
        if (thumbList.length > 1) {
            view.SetMasterThumbs(type, ACTIVE_ROM_ID, thumbList[0].attributes['sid']);
            thumbList[0].attributes['sid'] = "";
            var img = thumbList[0].select("img");
            if (img != undefined) {
                thumb = img.attributes['src'];
            }
        }

    }

    //更新游戏列表中的图片
    var platformType = CONF.Platform[ACTIVE_PLATFORM.toString()].Thumb != "" ? CONF.Platform[ACTIVE_PLATFORM.toString()].Thumb : CONF.Default.Thumb;

    if (type == platformType && sid == "" && thumb != "") {
        var dom = $(#romlist).select("li[rid=" + ACTIVE_ROM_ID + "] img");
        if (dom != undefined) {
            dom.attributes["src"] = thumb;
        }
    }


}

/*打开缩略图大图显示*/
function openBigSlider(evt) {
    $(#big_thumb_wrapper).style["display"] = "block";
    var big_thumb = $(#big_thumb);
    big_thumb.attributes["src"] = evt.attributes["src"];
    big_thumb.style["width"] = "auto";
    big_thumb.style["height"] = "auto";
    big_thumb.update();
    var width = big_thumb.box(#width);
    var height = big_thumb.box(#height);
    if (height > 600) {
        big_thumb.style["height"] = "600dip";
    } else if (width > 800) {
        big_thumb.style["width"] = "800dip";
    }
}

//图集右键菜单
function secondThumbContext(obj) {
    var type = obj.attributes["opt"];
    var sid = obj.attributes["sid"];
    var html = "";
    if (type == "video") {
        html += "<li class='openfolder' opt='" + type + "' sid='" + sid + "'>" + CONF.Lang.OpenFolder + "</li>";
        html += "<hr>";
        html += "<li class='openfile' for='" + type + "' sid='" + sid + "' caption='" + CONF.Lang.SelectVideoFile + "' filter='video Files (" + VIDEO_FILTER + ")|" + VIDEO_FILTER + "|All Files (*.*)|*.*'>" + CONF.Lang.SelectVideo + "</li>";
        html += "<li class='thumb_delete' sid='" + sid + "' value='" + type + "'>" + CONF.Lang.DeleteVideo + "</li>";
    } else {

        var langReplacePicFile = sid == THUMB_EMPTY_SID ?  CONF.Lang.AddPicFile : CONF.Lang.ReplacePicFile;
        var langReplacePicNet = sid == THUMB_EMPTY_SID ?  CONF.Lang.AddPicNet : CONF.Lang.ReplacePicNet;

        html += "<li class='openfolder' sid='" + sid + "' opt='" + type + "'>" + CONF.Lang.OpenFolder + "</li>";
        html += "<hr>";

        html += "<li class='openfile' sid='" + sid + "' for='" + type + "' caption='" + CONF.Lang.SelectPicFile + "' filter='Images Files (" + PIC_FILTER + ")|" + PIC_FILTER + "|All Files (*.*)|*.*'>" + langReplacePicFile + "</li>";
        html += "<li class='thumb_down' sid='" + sid + "' value='" + type + "'>" + langReplacePicNet + "</li>";

        if (obj.select("img") != undefined) {
            html += "<li class='thumb_output' sid='" + sid + "' value='" + type + "'>" + CONF.Lang.OutputThumb + "</li>";
            html += "<hr>";
            if (sid != "") {
                html += "<li class='thumb_master' sid='" + sid + "' value='" + type + "'>" + CONF.Lang.SetMasterThumb + "</li>";
            }

            html += "<li class='thumb_delete' sid='" + sid + "' value='" + type + "'>" + CONF.Lang.DeletePic + "</li>";
        }
    }
    var context = $(#thumbcontext);
    context.clear();
    context.append(html);
}


//读取一个rom的展示图地址
function getRomPicPath(type, platform, name, multi = false) {

    if (CONF.Platform[platform.toString()] == undefined) {
        if (multi == false) {
            return "";
        } else {
            return [];
        }
    }

    var path = "";

    if (type == "") {
        type = CONF.Platform[platform.toString()].Thumb != "" ? CONF.Platform[platform.toString()].Thumb : CONF.Default.Thumb;
    }

    //检查图片类型，拼接图片地址和文件名
    switch (type) {
        case "thumb":
            path = CONF.Platform[platform.toString()].ThumbPath + "/";
            break;
        case "snap":
            path = CONF.Platform[platform.toString()].SnapPath + "/";
            break;
        case "poster":
            path = CONF.Platform[platform.toString()].PosterPath + "/";
            break;
        case "packing":
            path = CONF.Platform[platform.toString()].PackingPath + "/";
            break;
        case "title":
            path = CONF.Platform[platform.toString()].TitlePath + "/";
            break;
        case "cassette":
            path = CONF.Platform[platform.toString()].CassettePath + "/";
            break;
        case "icon":
            path = CONF.Platform[platform.toString()].IconPath + "/";
            break;
        case "gif":
            path = CONF.Platform[platform.toString()].GifPath + "/";
            break;
        case "background":
            path = CONF.Platform[platform.toString()].BackgroundPath + "/";
            break;
        case "wallpaper":
            path = CONF.Platform[platform.toString()].WallpaperPath + "/";
            break;
        case "video":
            path = CONF.Platform[platform.toString()].VideoPath + "/";
            break;
        case "optimized":
            path = CONF.Platform[platform.toString()].OptimizedPath + "/";
            break;
        default:
            return "";
    }

    var pics = [];
    //读取主文件
    var masterPath = path + name + ".*";
    System.scanFiles(masterPath, function (p, attr) {
        pics.push(URL.fromPath(path + p));
        return true;
    });

    //读取子文件
    if (multi == true) {
        var slavePath = path + name + "__*.*";
        System.scanFiles(slavePath, function (p, attr) {
            pics.push(URL.fromPath(path + p));
            return true;
        });
    }

    if (multi == false) {
        return pics.length > 0 ? pics[0] : "";
    } else {
        return pics.length > 0 ? pics : [];
    }

}

//图集中插入一张图片
function createFileDropZone(platform, opt, sid, url, ext = "") {
    //先把视频结束掉
    if (opt == "video") {
        closeRightVideo();
    }

    var uri = URL.fromPath(url);
    var html = "";
    var parentDom = $$(#filedropzone_{opt} .file-drop-zone);
    var newSid = parentDom.length < 2 ? "" : sid;
    var resp = mainView.EditRomThumbs(opt, ACTIVE_ROM_ID, newSid, URL.toPath(url), ext);
    if (resp == undefined) {
        return;
    }

    var resMap = JSON.parse(resp);

    //替换当前模块
    if (opt == "video") {
        html = "<div class='file-drop-zone-empty file-drop-zone-isset'>(" + CONF.Lang.VideoCanNotBePreviewed + ")<br>" + CONF.Lang.VideoUrl + "<br>" + uri + "</div>";
    } else {
        html = "<img src='" + uri + "'>";
    }
    //渲染
    var currentbDom = self.select("#filedropzone_" + opt + " div[sid='" + sid + "']");
    currentbDom.html = html;

    //新增空模块
    if (opt != "video" && sid == THUMB_EMPTY_SID) {
        var filenameArr = getFileName(resMap["filepath"]).split("__");
        sid = filenameArr[1] == undefined ? "" : filenameArr[1];
        currentbDom.attributes["sid"] = sid;
        var newHtml = createEmptyFileDropZone(opt);
        currentbDom.parent.append(newHtml);
    }

    //更新列表缩略图
    var type = CONF.Platform[platform.toString()].Thumb != "" ? CONF.Platform[platform.toString()].Thumb : CONF.Default.Thumb;

    if (opt == type && sid == "" && $(#romlist).select("li[rid=" + ACTIVE_ROM_ID + "] img.rom_thumb") != undefined) {
        $(#romlist).select("li[rid=" + ACTIVE_ROM_ID + "] img").attributes["src"] = uri;
    }
}

//新建空的图片拖拽模块
function createEmptyFileDropZone(type) {

    var filter = "";
    var desc = "";
    if (type == "video") {
        filter = VIDEO_FILTER;
        desc = CONF.Lang.DropVideoToHere + "<br>(" + VIDEO_FILTER + ")";
    } else {
        filter = PIC_FILTER;
        desc = CONF.Lang.DropPicToHere + "<br>(" + PIC_FILTER + ")";
    }
    var newHtml = "";
    newHtml += "<div.file-drop-zone sid='" + THUMB_EMPTY_SID + "' opt='" + type + "' accept-drop='" + filter + "'>";
    newHtml += "<div class='file-drop-zone-empty'>" + desc + "</div>";
    newHtml += "</div>";
    return newHtml;
}

//将展示图设置为主图
function SetMasterThumb(obj) {
    var type = obj.attributes["value"];
    var sid = obj.attributes["sid"];

    if (type == "" || sid == "") {
        return;
    }

    view.SetMasterThumbs(type, ACTIVE_ROM_ID, sid);

    var masterDom = self.select("#filedropzone_" + type + " div[sid='']");
    var slaveDom = self.select("#filedropzone_" + type + " div[sid='" + sid + "']");

    if (masterDom == undefined || slaveDom == undefined) {
        return;
    }

    //调换两个dom的信息
    var masterSrc = masterDom.select("img").attributes["src"];
    var slaveSrc = slaveDom.select("img").attributes["src"];
    masterDom.select("img").attributes["src"] = slaveSrc;
    slaveDom.select("img").attributes["src"] = masterSrc;
}


//导出当前图片
function thumbOutput(obj) {

    var opt = obj.attributes["value"];
    var sid = obj.attributes["sid"];
    var currentbDom = self.select("#filedropzone_" + opt + " div[sid='" + sid + "'] img");

    if (currentbDom == undefined) {
        alert(CONF.Lang.ImageNotFound);
        return;
    }

    var p = currentbDom.attributes['src'];
    var fileName = getRomName(p);
    var fileExt = getFileExt(p);

    var defaultExt = fileExt;
    var initialPath = fileName + "." + fileExt;
    var caption = "";
    var filter = "Image File (*." + fileExt + ")|*." + fileExt;
    var url = view.selectFile(#save, filter, defaultExt, initialPath, caption);
    if (url) {
        System.copyFile(p, url);
    }

}