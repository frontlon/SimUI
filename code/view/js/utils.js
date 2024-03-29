﻿//生成语言
function createLang() {
    var content = $(body).html;
    for (var key in CONF.Lang) {
        content = content.replace("{{" + key + "}}", CONF.Lang[key]);
    }
    $(body).html = content;
    self.update();

}

//自动补全扩展名
function completeExt(str) {
    var arr = str.split(",");
    var newarr = [];
    for (var a in arr) {
        var head = a.substr(0, 1);
        if (head == ".") {
            newarr.push(a);
        } else {
            newarr.push("." + a);
        }
    }
    var newstr = newarr.join(",");
    return newstr;
}

//弹出错误窗口
function errorBox(str) {
    view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        parameters: {
            type: "error",
            caption: "",
            text: str,
        };
    });

    $(#loading).style['display'] = 'none';
    $(body).state.disabled = false;
    $(#create).attributes.removeClass("disabled");
}

//alert框
function alert(str) {
    view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        parameters: {
            type: "info",
            caption: "",
            text: str,
        };
    });
}

//warning框
function warning(str) {
    view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        parameters: {
            type: "warning",
            caption: "",
            text: str,
        };
    });
}

//confirm框
function confirm(str, caption = "", buttons = []) {
    if (buttons.length == 0) {
        buttons = [
            { id: "yes", class: "ok", text: CONF.Lang.OK },
            { id: "cancel", text: CONF.Lang.Cancel, role: "default-button" }
        ];
    }

    return view.dialog({
        url: self.url(ROOTPATH + "js/plugins/dialog/alert.html"),
        parameters: {
            type: "warning",
            text: str,
            caption: "",
            buttons: buttons
        };
    });
}


//debug
function info(str) {
    debug info({ str });
}

//开启loading框
function startLoading(str = "", platform = "") {
    $(#loading).style['display'] = 'block';
    if (str != "") {
        $(#loading_text).html = str;
    } else {
        $(#loading_text).html = CONF.Lang.Loading;
    }
    if (platform != "") {
        $(#loading_platform).html = "[" + platform + "]";
    }
}

//关闭loading框
function endLoading() {
    $(#loading).style['display'] = 'none';
}

//测试用console框
function consoleLog(str) {
    $(#console).style['display'] = 'block';
    $(#console).prepend(str + '<br>');
}

//设置页面主题
function initUiTheme() {
    //默认主题
    self.attributes["theme"] = CONF.Default.Theme;

    //生成主题列表
    var cssfile = "";
    var menu = "";

    for (var themeId in CONF.Theme) {
        cssfile += "<style src='" + URL.fromPath(CONF.Theme[themeId].Path) + "' />"; //引入文件
    }
    $(#themefile).html = cssfile;


}


//时间戳转日期
function unixToDate(timestamp) {
    timestamp = timestamp.toString() + "000";
    var time = new Date(timestamp.toFloat());
    var y = time.year;
    var m = time.month;
    var d = time.day;
    var h = time.hour;
    var mm = time.minute;
    return y + '-' + m + '-' + d + ' ' + h + ':' + mm;
}

//读取rom名称
function getRomName(p) {
    //读取缩略图地址
    var romPath = URL.parse(p);
    //如果文件名中存在#号
    if (romPath.anchor != "") {
        var pathArr = p.split("/");
        pathArr = pathArr[pathArr.length - 1].split("\\");
        pathArr = pathArr[pathArr.length - 1].split(".");
        pathArr.remove(pathArr.length - 1);
        romPath.name = pathArr.join(".");
    }
    return romPath.name;
}

//读取文件扩展名
function getFileExt(p) {
    var pathInfo = URL.parse(p);
    return pathInfo.ext.toLowerCase();
}
//读取文件名
function getFileName(p) {
    var pic = p.replace("\\", "/");
    var parr = pic.split("/");
    var filename = parr[parr.length - 1].split(".");
    filename.remove(filename.length - 1);
    filename = filename.join(".");
    return filename.toHtmlString();
}

//关闭侧边栏视频
function closeRightVideo() {
    var vdom = mainView.root.$(#right_video);
    if (vdom != undefined) {
        try {
            vdom.videoStop();
            vdom.videoUnload();
        } catch (e) { }
    }
}

//时间戳转时间
function timestampToYmd(t) {
    if (t == 0) {
        return "";
    }

    t = t.toFloat() * 1000;
    var date = new Date(t);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var y = date.year + "-";
    var m = date.month + "-";
    var d = date.day + " ";
    return y + m + d;
}

function Float.toFixed(frac = 0) {
    return String.printf("%.*f", frac, this);
}