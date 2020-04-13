package controller

import (
	"VirtualNesGUI/code/db"
	"VirtualNesGUI/code/utils"
	"fmt"
	"github.com/sciter-sdk/go-sciter"
	"github.com/sciter-sdk/go-sciter/window"
)

/**
 * 定义view用function
 **/

func CacheController(w *window.Window) {

	//删除所有缓存
	w.DefineFunction("TruncateRomCache", func(args ...*sciter.Value) *sciter.Value {

		//清空rom表
		if err := (&db.Rom{}).Truncate(); err != nil {
			WriteLog(err.Error())
			return ErrorMsg(w, err.Error())
		}

		//清空menu表
		if err := (&db.Menu{}).Truncate(); err != nil {
			WriteLog(err.Error())
			return ErrorMsg(w, err.Error())
		}

		return sciter.NullValue()
	})

	//生成所有缓存
	w.DefineFunction("CreateRomCache", func(args ...*sciter.Value) *sciter.Value {

		getPlatform := uint32(utils.ToInt(args[0].String()))

		go func() *sciter.Value {

			//检查更新一个平台还是所有平台
			PlatformList := map[uint32]*db.Platform{}
			if getPlatform == 0 { //所有平台
				PlatformList = Config.Platform
			} else { //一个平台
				if _, ok := Config.Platform[getPlatform]; ok {
					PlatformList[getPlatform] = Config.Platform[getPlatform]
				}
			}

			//先检查平台，将不存在的平台数据先干掉
			if getPlatform == 0 {
				if err := ClearPlatform(); err != nil {
					WriteLog(err.Error())
					return ErrorMsg(w, err.Error())
				}
			}
			//开始重建缓存
			for platform, _ := range PlatformList {

				fmt.Println("更新平台：", platform)

				romlist, menu, err := CreateRomData(platform)

				if err != nil {
					WriteLog(err.Error())
					return ErrorMsg(w, err.Error())
				}

				//更新rom数据
				if err := UpdateRomDB(platform, romlist); err != nil {
					WriteLog(err.Error())
					return ErrorMsg(w, err.Error())
				}
				//更新menu数据
				if err := UpdateMenuDB(platform, menu); err != nil {
					WriteLog(err.Error())
					return ErrorMsg(w, err.Error())
				}

			}

			//数据更新完成后，页面回调，更新页面DOM
			if _, err := w.Call("CB_createCache"); err != nil {
			}
			return sciter.NullValue()
		}()

		return sciter.NullValue()
	})
}
