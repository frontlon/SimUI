package controller

import (
	"simUI/code/db"
	"simUI/code/modules"
	"simUI/code/utils"
	"encoding/json"
	"simUI/code/utils/go-sciter"
)


/**
 * 定义view用function
 **/

func MenuController() {


	//读取目录列表
	utils.Window.DefineFunction("GetMenuList", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String()))
		page := uint32(utils.ToInt(args[1].String()))
		//读取数据库

		menu,err := modules.GetMenuList(uint32(utils.ToInt(platform)),page)
		if err != nil {
			utils.WriteLog(err.Error())
			return utils.ErrorMsg(err.Error())
		}

		getjson, _ := json.Marshal(menu)
		return sciter.NewValue(string(getjson))
	})

	//更新菜单排序
	utils.Window.DefineFunction("UpdateMenuSort", func(args ...*sciter.Value) *sciter.Value {
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
