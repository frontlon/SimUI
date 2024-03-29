﻿var id;
var action;
var pfId;
view.root.on("ready", function(){
    Init(); //初始化
});

//初始化
function Init(){
   //创建语言
    createLang();

    id = view.parameters.id.toString();
    pfId = view.parameters.platform.toString();

    if(id == 0){
        action = "add";
        $(#sim_submit).value = CONF.Lang.AddSimulator;
        $(#sim_delete).style['display'] = "none";
        $(#unzip).value = "0";
        view.windowCaption = CONF.Lang.AddSimulator;
    }else{
        
        var sim = JSON.parse(mainView.GetSimulatorById(id));

        action = "update";
        $(#sim_submit).value = CONF.Lang.SaveConfig;
        view.windowCaption = CONF.Lang.EditSimulator;
        $(#sim_name).value = sim.Name;
        $(#sim_default).value = sim.Default;
        $(#sim_path).value = sim.Path;
        $(#sim_cmd).value = sim.Cmd;
        $(#lua).value = sim.Lua;
        $(#unzip).value = sim.Unzip;
        if(sim.Default == 1){$(#sim_default).checked = true;}
    }
    
}

//更新模拟器信息
function simSubmit(evt){
    var def = $(#sim_default).value == undefined ? 0 : 1;
    var result = "";
    var data = {
        id : id.toString();
        name : $(#sim_name).value,
        default : def.toString(),
        platform : pfId.toString(),
        path:$(#sim_path).value,
        cmd:$(#sim_cmd).value,
        unzip:$(#unzip).value,
        lua:$(#lua).value,
    };

    if(data.name == ""){alert(CONF.Lang.SimulatorNameCanNotBeEmpty);return true;}
    if(data.sim_path == ""){alert(CONF.Lang.SimulatorPathCanNotBeEmpty);return true;}
    if(data.platform == ""){alert(CONF.Lang.SelectPlatform);return true;}
    if(id == 0){
        //添加模拟器
        result = mainView.AddSimulator(JSON.stringify(data));

        if(result != ""){
            alert(CONF.Lang.AddSuccess);
            view.close(result); //如果更新成功，则关闭窗口，并把修改后的数据返回
        }
    }else{
        //修改模拟器信息
        result = mainView.UpdateSimulator(JSON.stringify(data));

        if(result != ""){
            alert(CONF.Lang.UpdateSuccess);
            view.close(result); //如果更新成功，则关闭窗口，并把修改后的数据返回
        }
    }
}

//删除模拟器
function simDelete(evt){
    var result = confirm(CONF.Lang.DeleteSimulatorConfirm,CONF.Lang.DeleteSimulator);
    if (result != "yes"){
        return true;
    }

    //开始删除
    result = mainView.DelSimulator(id);

    if(result != "0"){
        var data = {
            Opt:"delete",
            Id:result,
        };
        var datastr = JSON.stringify(data);
        alert(CONF.Lang.DeleteSuccess);
        view.close(datastr); //如果更新成功，则关闭窗口，并把修改后的数据返回
    }
}

//设置命令代码
function setCmd(evt){
    $(#sim_cmd).value = evt.value;
}
