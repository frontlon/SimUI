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

func MenuController() {


	//读取目录列表
	config.Cfg.Window.DefineFunction("GetMenuList", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String()))
		//读取数据库

		menu,err := modules.GetMenuList(uint32(utils.ToInt(platform)))
		if err != nil {
			WriteLog(err.Error())
			return ErrorMsg(err.Error())
		}

		getjson, _ := json.Marshal(menu)
		return sciter.NewValue(string(getjson))
	})

	//更新菜单排序
	config.Cfg.Window.DefineFunction("UpdateMenuSort", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String())) //平台
		data := args[1].String()

		d := make(map[string]uint32)
		json.Unmarshal([]byte(data), &d)

		if len(d) == 0 {
			return sciter.NullValue()
		}

		for name, val := range d {
			if name == "" {
				continue
			}
			menu := &db.Menu{
				Name:     name,
				Platform: platform,
				Sort:     val,
			}
			if err := menu.UpdateSortByName(); err != nil {
			}
		}
		return sciter.NewValue("1")
	})

}
