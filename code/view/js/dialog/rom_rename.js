﻿view.root.on("ready", function(){
    Init(); //初始化
});

//初始化
function Init(){
   //创建语言
    createLang();

    var romname = view.parameters.name.toString();
    view.windowCaption = CONF.Lang.Rename;
    $(#romname).value = romname;

}
//确定
function confirmDialog(evt){
    var data = {
        name : $(#romname).value,
    };
    if(data.name == ""){alert(CONF.Lang.RomNameCanNotBeEmpty);return true;}
    view.close(data); //如果更新成功，则关闭窗口，并把修改后的数据返回
}

