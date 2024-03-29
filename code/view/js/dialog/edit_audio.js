﻿
view.root.on("ready", function(){
    //初始化主题
    initUiTheme();
    
    //渲染语言
    createLang();
    view.windowCaption = CONF.Lang.EditAudio;

    /*
    填充攻略文件
    */
    //生成攻略文件列表
    var files = "";
    var audio_list = JSON.parse(mainView.GetAudio(view.parameters.id));
    var i = 0;
    for(var s in audio_list) {
        files += "<li id='audio_li_"+ i +"' value=\""+ i +"\">";
        files += "<input type='text' id='audio_name_"+ i + "' value=\""+ s.name +"\" />";
        files += "<input type='text' id='audio_path_"+ i + "' value=\""+ s.path +"\" />";
        files += "<button class='openfile' for='audio_path_" + i + "' caption='"+ CONF.Lang.SelectFile +"' filter='Files (*.mp3,*.wma,*.wav)|*.mp3;*.wma;*.wav|All Files (*.*)|*.*'>...</button>";
        files += "<button class='audio_delete' value=\""+ i +"\">"+CONF.Lang.Delete+"</button>";
        files += "</li>";
        i++;
    }
    $(#audio_list).html = files;

});

/**
 * 攻略音频
 **/
    
//添加攻略文件
function addAudio(){
    const defaultExt = "";
    const initialPath = "";
    const filter = "All Files (*.*)|*.*";
    const caption = CONF.Lang.SelectFile;
    var selectFile = view.selectFile(#open-multiple, filter, defaultExt, initialPath, caption );
    var urls= [];

    if(selectFile == undefined){
        return;
    }

    if(typeof(selectFile) == "string"){
        urls[0] = selectFile;
    }else{
        urls = selectFile;
    }

    var insertId = $$(#audio_list li).length;
    var audio = "";
    for(var url in urls){
        //转换url
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");
    
        //生成页面DOM
        audio += "<li id='audio_li_"+ insertId +"' value=\""+ insertId +"\">";
        audio += "<input type='text' value=\""+ getRomName(url) +"\" id='audio_name_"+ insertId + "' />";
        audio += "<input type='text' value=\""+ url +"\" id='audio_path_"+ insertId + "' />";
        audio += "<button class='openfile' for='audio_path_" + insertId + "' caption='"+ CONF.Lang.SelectFile +"' filter='Files (*.mp3,*.wma,*.wav)|*.mp3;*.wma;*.wav|All Files (*.*)|*.*'>...</button>";
        audio += "<button class='audio_delete' value='"+ insertId +"'>"+CONF.Lang.Delete+"</button>";
        audio += "</li>";
        insertId++;
    }
    $(#audio_list).append(audio);
}

//删除攻略文件
function deleteAudio(evt){
    var id = evt.attributes["value"];
    self.select("#audio_li_" + id).remove();
}

//更新配置
function submitAudio(){
    var lists = $$(#audio_list li);
    var data = [];
    var i = 0;
    for(var dom in lists) {

        var id = dom.attributes["value"].toInteger();
    
        var name = self.select("#audio_name_"+ id).value;
        var path = self.select("#audio_path_"+ id).value;
        if(name == ""){
            alert(CONF.Lang.FilesNameIsNotEmpty);
            return;
        }
        if(path == ""){
            alert(CONF.Lang.FilesPathIsNotEmpty);
            return;
        }

        //上传文件
        var newPath = mainView.UploadAudioFile(view.parameters.id,name,path);
        $(#audio_list).select("#audio_path_" + id).value = newPath;

        var obj = {
            name:name,
            path:newPath,
        };
        data[i] = obj;
        i++;
    }

    var datastr = JSON.stringify(data);
    mainView.UpdateAudio(view.parameters.id,datastr);
    alert(CONF.Lang.UpdateSuccess);

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
    }
}

event click $(.cancel){
    view.close();
}