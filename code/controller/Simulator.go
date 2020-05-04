package controller

import (
	"VirtualNesGUI/code/config"
	"VirtualNesGUI/code/db"
	"VirtualNesGUI/code/modules"
	"VirtualNesGUI/code/utils"
	"encoding/json"
	"github.com/sciter-sdk/go-sciter"
)

/**
 * 定义view用function
 **/

func SimulatorController() {

	//添加模拟器
	config.Cfg.Window.DefineFunction("AddSimulator", func(args ...*sciter.Value) *sciter.Value {
		data := args[0].String()
		d := make(map[string]interface{})
		json.Unmarshal([]byte(data), &d)
		sim, err := modules.AddSimulator(d)
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}

		jsonData, _ := json.Marshal(&sim)
		return sciter.NewValue(string(jsonData))
	})

	//更新模拟器
	config.Cfg.Window.DefineFunction("UpdateSimulator", func(args ...*sciter.Value) *sciter.Value {
		data := args[0].String()
		d := make(map[string]interface{})
		json.Unmarshal([]byte(data), &d)

		sim, err := modules.UpdateSimulator(d)
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}

		jsonData, _ := json.Marshal(&sim)
		return sciter.NewValue(string(jsonData))
	})

	//删除一个模拟器
	config.Cfg.Window.DefineFunction("DelSimulator", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		sim := &db.Simulator{
			Id: id,
		}

		//删除模拟器
		err := sim.DeleteById()
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}
		return sciter.NewValue(args[0].String())
	})

	//读取模拟器详情
	config.Cfg.Window.DefineFunction("GetSimulatorById", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		//游戏游戏详细数据
		info, err := (&db.Simulator{}).GetById(id)
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//读取一个平台下的所有模拟器
	config.Cfg.Window.DefineFunction("GetSimulatorByPlatform", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		//游戏游戏详细数据
		info, err := (&db.Simulator{}).GetByPlatform(id)
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//设置rom的模拟器
	config.Cfg.Window.DefineFunction("SetRomSimulator", func(args ...*sciter.Value) *sciter.Value {
		romId := uint64(utils.ToInt(args[0].String()))
		simId := uint32(utils.ToInt(args[1].String()))
		//更新rom表
		rom := &db.Rom{
			Id:    romId,
			SimId: simId,
		}

		//更新数据
		if err := rom.UpdateSimulator(); err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}
		return sciter.NewValue("1")
	})
}
