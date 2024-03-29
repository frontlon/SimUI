
/**
 * 游戏资料管理
 */

//切换平台 - 游戏资料管理
function managerChangeRombasePlatform(platformId){
    
    if (platformId == 0){
        return;
    }

    //创建菜单
    var dd = createMenuOption(platformId);
    var menulist = self.$(#menu_rombase);
    menulist.options.clear();
    if(dd != ""){
        menulist.options.html = dd; //生成dom
    }else{
        menulist.options.html = "<option value=''>"+CONF.Lang.AllGames+"</option>"; //生成dom
    }
    menulist.value = "";

    //生成默认游戏列表
    var req = {
        "platform" : platformId.toInteger(),
    };
    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);
    $(#romlist_rombase tbody).html = "";
    managerCreateRombase(romjson);

    //生成分页数据
    var romCount = mainView.GetGameCount(request); //必须在获取rom的方法下面
    var pages = managerCreatePages(romCount);
    $(#pages_rombase).html = pages;
    if(pages != ""){
        $(#pages_rombase).style["display"] = "block";
        $(#pages_rombase).select("li:nth-child(1)").state.current = true;
    }
    if($$(#pages_rombase li).length == 1){
        $(#pages_rombase).style["display"] = "none";
    }

    //显示批量操作按钮
    $(#rombase_submit).style["display"] = "inline-block";
}


//选择文件 - 游戏资料管理
function openFile(evt) {

    var filter = "";
    if(evt.attributes.hasClass("video")){
        filter = "Video Files (*.mp4,*.wmv,*.avi,*.flv)|*.mp4;*.wmv;*.avi;*.fiv|All Files (*.*)|*.*";
    }else if (evt.attributes.hasClass("doc") || evt.attributes.hasClass("strategy")){
        filter = "";
        filter = "Doc Files (*.txt,*.md,*.html)|*.txt;*.md;*.html|All Files (*.*)|*.*";
    }else{
        filter = "Image Files (*.png,*.jpg,*.jpeg,*.gif)|*.png;*.jpg;*.jpeg;*.gif|All Files (*.*)|*.*";
    }

    const defaultExt = "";
    const initialPath = "";
    const caption = CONF.Lang.SelectFile;
    var url = view.selectFile(#open, filter, defaultExt, initialPath, caption );
    if(url){
        url = URL.toPath(url);
        url = url.split("\/").join(SEPARATOR);
        url = url.split(CONF.RootPath.toString()).join("");
        evt.select("input[type=text]").value = url;
    }
}

//切换目录 - 游戏资料管理
function managerChangeRombaseMenu(menuName){

    var platformId = $(#platform_rombase).value;

    //生成默认游戏列表
    var req = {
        "platform" : platformId.toInteger(),
        "catname" : menuName,
    };
    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);
    $(#romlist_rombase tbody).html = "";
    managerCreateRombase(romjson);

    var romCount = mainView.GetGameCount(request); //必须在获取rom的方法下面
    var pages = managerCreatePages(romCount);
    $(#pages_rombase).html = pages;
    if(pages != ""){
        $(#pages_rombase).style["display"] = "block";
        $(#pages_rombase).select("li:nth-child(1)").state.current = true;
    }
    if($$(#pages_rombase li).length == 1){
        $(#pages_rombase).style["display"] = "none";
    }
}

//创建资料rom列表 - 游戏资料管理
function managerCreateRombase(romjson){
    var romobj = JSON.parse(romjson);
    var romData = "";
    for(var obj in romobj) {
        if(obj.Menu == "_7b9"){
            obj.Menu = "";
        }

        romData += "<tr rid='"+ obj.Id +"'>";
        var romName = obj.RomPath.replace("\\","/");
        var romPath = romName.split("/");
        var filename = romPath[romPath.length - 1].split(".");
        filename.remove(filename.length-1);
        filename = filename.join(".").toHtmlString();

        var alias = obj.Name.toHtmlString();
        if (filename == obj.Name){
            alias = "";
        }

        romData += "<td><button.small_btn.run>"+ CONF.Lang.Run +"</button></td>";
        romData += "<td><input|text.filename value=\""+ filename +"\"/></td>";
        romData += "<td><input|text.name value=\""+ alias +"\"/></td>";
        romData += "<td><input|text.year value=\""+ obj.BaseYear +"\"/></td>";
        romData += "<td><input|text.type value=\""+ obj.BaseType +"\"/></td>";
        romData += "<td><input|text.producer value=\""+ obj.BaseProducer +"\"/></td>";
        romData += "<td><input|text.publisher value=\""+ obj.BasePublisher +"\"/></td>";
        romData += "<td><input|text.country value=\""+ obj.BaseCountry +"\"/></td>";
        romData += "<td><input|text.translate value=\""+ obj.BaseTranslate +"\"/></td>";
        romData += "<td><input|text.version value=\""+ obj.BaseVersion +"\"/></td>";
        romData += "<td><input|text.name_en value=\""+ obj.BaseNameEn +"\"/></td>";
        romData += "<td><input|text.name_jp value=\""+ obj.BaseNameJp +"\"/></td>";
        romData += "<td><input|text.other_a value=\""+ obj.BaseOtherA +"\"/></td>";
        romData += "<td><input|text.other_b value=\""+ obj.BaseOtherB +"\"/></td>";
        romData += "<td><input|text.other_c value=\""+ obj.BaseOtherC +"\"/></td>";
        romData += "<td><input|text.other_d value=\""+ obj.BaseOtherD +"\"/></td>";

        romData += "</tr>"
    }
    $(#romlist_rombase tbody).html = romData;
}

//点击分页按钮 - 游戏资料管理
function managerCreateRombaseByPages(obj){
    if(obj.state.current == true){
        return;
    }
    var platformId = $(#platform_rombase).value;
    var id = obj.parent.id;
    var page = obj.html.toInteger() - 1;

    var req = {
        "platform" : platformId.toInteger(),
        "page" : page,
    };
    var request = JSON.stringify(req);
    var romjson = mainView.GetGameList(request);
    $(#romlist_rombase tbody).html = "";
    managerCreateRombase(romjson);
    obj.state.current = true;
    $(body).scrollTo(0,0, false);
}

//保存rom资料 - 游戏资料管理
function managerRombaseSave(obj){
    var tr = obj.parent.parent;
    var filename = tr.select(".filename").value;

    if(filename.trim() == ""){
        warning(CONF.Lang.FilenameNotEmpty);
        return;
    }

    //更改游戏名称
    mainView.RomRename(tr.attributes["rid"],filename);

    //更新资料
    var data = {
        id:tr.attributes["rid"];
        name:tr.select(".name").value,
        year:tr.select(".year").value,
        type:tr.select(".type").value,
        publisher:tr.select(".publisher").value,
        producer:tr.select(".producer").value,
        country:tr.select(".country").value,
        translate:tr.select(".translate").value,
        version:tr.select(".version").value,
        name_en:tr.select(".name_en").value,
        name_jp:tr.select(".name_jp").value,
        other_a:tr.select(".other_a").value,
        other_b:tr.select(".other_b").value,
        other_c:tr.select(".other_c").value,
        other_d:tr.select(".other_d").value,
    }
    mainView.SetRomBase(JSON.stringify(data));
    obj.attributes.removeClass("nosave");
}

//批量更新 - 游戏资料管理
function managerRombaseBatchSave(){

    var trs = $$(#romlist_rombase tbody tr);
    var rombaseList = [];
    var renameList = [];
    var i = 0;
    for(var tr in trs){
        var filename = tr.select(".filename").value;
        if(filename.trim() == ""){
            alert(CONF.Lang.FilenameNotEmpty);
            return;
        }

        //取掉input高亮
        var input = $$(#romlist_rombase input);
        for (var ipt in input){
            ipt.attributes.removeClass("nosave");
        }

        //批量改名
        var rename = {
            id:tr.attributes["rid"],
            filename:filename,
        }

        //批量更新资料
        var base = {
            id:tr.attributes["rid"];
            name:tr.select(".name").value,
            year:tr.select(".year").value,
            type:tr.select(".type").value,
            publisher:tr.select(".publisher").value,
            producer:tr.select(".producer").value,
            country:tr.select(".country").value,
            translate:tr.select(".translate").value,
            version:tr.select(".version").value,
            name_en:tr.select(".name_en").value,
            name_jp:tr.select(".name_jp").value,
            other_a:tr.select(".other_a").value,
            other_b:tr.select(".other_b").value,
            other_c:tr.select(".other_c").value,
            other_d:tr.select(".other_d").value,
        }

        rombaseList[i] = base;
        renameList[i] = rename;
        i++;
    }


    //更改游戏名称
    mainView.BatchRomRename(JSON.stringify(renameList));
    //更改游戏资料
    mainView.BatchSetRomBase(JSON.stringify(rombaseList));
    alert(CONF.Lang.UpdateSuccess);

}

//运行游戏 - 游戏资料管理
function managerRombaseRunGame(obj){
    var id = obj.parent.parent.attributes["rid"];
    var info = JSON.parse(mainView.GetGameById(id));
    mainView.RunGame(id,info.SimId);
}