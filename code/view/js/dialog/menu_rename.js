﻿view.root.on("ready", function(){
    Init(); //初始化
});

//初始化
function Init(){
   //创建语言
    createLang();

    var romname = view.parameters.name.toString();
    view.windowCaption = CONF.Lang.Rename;
    $(#menuname).value = romname;

}
//确定
function confirmDialog(evt){
    var newName = $(#menuname).value;
    if(newName == ""){
        alert(CONF.Lang.MenuNameCanNotBeEmpty);
        return true;
    }
    var platform = view.parameters.platform.toString();
    var oldName = view.parameters.name.toString();
    mainView.MenuRename(platform,oldName,newName);
    view.close(newName); //如果更新成功，则关闭窗口，并把修改后的数据返回
}

