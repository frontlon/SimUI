﻿
view.root.on("ready", function () {
    //初始化主题
    initUiTheme();

    //渲染语言
    createLang();
    view.windowCaption = CONF.Lang.EditDocAndStrategy;

    /*
    填充简介
    */
    var docContent = mainView.GetGameDoc("doc", view.parameters.id, 0);
    docContent = docContent.replace("<br>", "\n");
    docContent = docContent.trim();
    $(#doc).value = docContent;

    /*
    填充攻略
    */
    var strategyContent = mainView.GetGameDoc("strategy", view.parameters.id, 0);
    if (strategyContent != "") {
        strategyContent = strategyContent.trim();
        $(#strategy).value = strategyContent;
    }
    /*
    填充攻略文件
    */
    //生成攻略文件列表
    var files = "";
    var files_list = JSON.parse(mainView.GetStrategyFile(view.parameters.id));
    var i = 0;
    for (var s in files_list) {
        files += "<li id='files_li_" + i + "' value='" + i + "'>";
        files += "<input type='text' id='files_name_" + i + "' value=\"" + s.name + "\" />";
        files += "<input type='text' id='files_path_" + i + "' value=\"" + s.path + "\" />";
        files += "<button class='openfile' for='files_path_" + i + "' caption='Files (*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht,*.mhtml,*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx)|*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht;*.mhtml;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx|All Files (*.*)|*.*'>...</button>";
        files += "<button class='files_delete' value='" + i + "'>" + CONF.Lang.Delete + "</button>";
        files += "</li>";
        i++;
    }
    $(#files_list).html = files;

});

/**
 * 简介
 **/
//更新文档
event click $(#update_doc){
    var docContent = $(#doc).value;
    if (docContent != "") {
        docContent = docContent.trim();
        mainView.SetGameDoc("doc", view.parameters.id, docContent);
        alert(CONF.Lang.UpdateSuccess);
    } else {
        alert(CONF.Lang.Contenjs / NotEmpty);
    }
}

//删除文档
event click $(#delete_doc){
    var result = confirm(CONF.Lang.DeleteDocConfirm, CONF.Lang.DeleteDoc);
    if (result != "yes") {
        return true;
    }
    mainView.DelGameDoc("doc", view.parameters.id);
    alert(CONF.Lang.DeleteSuccess);
}

/**
 * 攻略
 **/

//更新攻略
function updateStrategy() {
    var richtext = $(#strategy).value;
    if (richtext != "") {
        richtext = richtext.trim();
        mainView.SetGameDoc("strategy", view.parameters.id, richtext);
        alert(CONF.Lang.UpdateSuccess);
    } else {
        alert(CONF.Lang.Contenjs / NotEmpty);
    }
}

//删除攻略
function deleteStrategy() {
    var result = confirm(CONF.Lang.DeleteStrategyConfirm, CONF.Lang.DeleteStrategy);
    if (result != "yes") {
        return true;
    }
    mainView.DelGameDoc("strategy", view.parameters.id);
    alert(CONF.Lang.DeleteSuccess);
    view.close();
}

/**
 * 攻略文件
 **/

//添加攻略文件
function addFiles() {

    const defaultExt = "";
    const initialPath = "";
    const filter = "Files (*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht,*.mhtml,*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx)|*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht;*.mhtml;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx|All Files (*.*)|*.*";
    const caption = CONF.Lang.SelectFile;
    var selectFile = view.selectFile(#open-multiple, filter, defaultExt, initialPath, caption);

    if (selectFile == undefined) {
        return;
    }

    var urls = [];
    if (typeof (selectFile) == "string") {
        urls[0] = selectFile;
    } else {
        urls = selectFile;
    }


    var insertId = $$(#files_list li).length;
    var files = "";
    for (var url in urls) {
        //转换url
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");

        //生成页面DOM
        files += "<li id='files_li_" + insertId + "' value='" + insertId + "'>";
        files += "<input type='text' id='files_name_" + insertId + "' value=\"" + getRomName(url) + "\" />";
        files += "<input type='text' id='files_path_" + insertId + "' value=\"" + url + "\" />";
        files += "<button class='openfile' for='files_path_" + insertId + "' caption='" + CONF.Lang.SelectFile + "' filter='Files (*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht,*.mhtml,*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx)|*.pdf;*.chm;*.exe;*.url;*.html;*.htm;*.mht;*.mhtml;*.doc;*.docx;*.ppt;*.pptx;*.xls;*.xlsx|All Files (*.*)|*.*'>...</button>";
        files += "<button class='files_delete' value='" + insertId + "'>" + CONF.Lang.Delete + "</button>";
        files += "</li>";
        insertId++;
    }

    $(#files_list).append(files);
}

//删除攻略文件
function deleteFiles(obj) {
    var id = obj.attributes["value"];
    self.select("#files_li_" + id).remove();
}

//更新配置
function submitFiles() {
    var lists = $$(#files_list li);
    var data = [];
    var i = 0;
    for (var dom in lists) {

        var id = dom.attributes["value"].toInteger();

        var name = self.select("#files_name_" + id).value;
        var path = self.select("#files_path_" + id).value;
        if (name == "") {
            alert(CONF.Lang.FilesNameIsNotEmpty);
            return;
        }
        if (path == "") {
            alert(CONF.Lang.FilesPathIsNotEmpty);
            return;
        }

        //上传文件
        var newPath = mainView.UploadStrategyFile(view.parameters.id, name, path);
        $(#files_list).select("#files_path_" + id).value = newPath;

        var obj = {
            name: name,
            path: newPath,
        };
        data[i] = obj;
        i++;
    }

    var datastr = JSON.stringify(data);
    mainView.UpdateStrategyFiles(view.parameters.id, datastr);
    alert(CONF.Lang.UpdateSuccess);

}

//选择文件
function openFile(evt) {
    const defaultExt = "";
    const initialPath = "";
    const filter = evt.attributes["filter"];
    const caption = evt.attributes["caption"];
    var url = view.selectFile(#open, filter, defaultExt, initialPath, caption);
    var out = self.select("#" + evt.attributes["for"]);
    if (url) {
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");
        out.value = url;
    }
}

event click $(.cancel){
    view.close();
}