package main

import (
	"VirtualNesGUI/code/db"
	"VirtualNesGUI/code/utils"
	"encoding/json"
	"github.com/sciter-sdk/go-sciter"
	"github.com/sciter-sdk/go-sciter/window"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"time"
)

/**
 * 定义view用function
 **/
func defineViewFunction(w *window.Window) {

	w.DefineFunction("InitData", func(args ...*sciter.Value) *sciter.Value {

		ctype := args[0].String()
		isfresh := args[1].String()

		data := ""
		switch (ctype) {
		case "config": //读取配置
			//初始化配置
			if (isfresh == "1") {
				//如果是刷新，则重新生成配置项
				InitConf()
			}
			getjson, _ := json.Marshal(Config)
			data = string(getjson)
		}
		return sciter.NewValue(data)
	})

	//运行游戏
	w.DefineFunction("RunGame", func(args ...*sciter.Value) *sciter.Value {

		id := args[0].String()
		simId := uint32(utils.ToInt(args[1].String()))

		//数据库中读取rom详情
		rom, err := (&db.Rom{}).GetById(id)
		if err != nil {
			return errorMsg(w, err.Error())
		}

		sim := &db.Simulator{}
		if simId == 0 {
			sim = Config.Platform[rom.Platform].UseSim
			if sim == nil {
				return errorMsg(w, Config.Lang["SimulatorNotFound"])
			}
		} else {
			if Config.Platform[rom.Platform].SimList == nil {
				return errorMsg(w, Config.Lang["SimulatorNotFound"])
			}
			sim = Config.Platform[rom.Platform].SimList[simId];
		}

		//检测执行文件是否存在
		_, err = os.Stat(sim.Path)
		if err != nil {
			return errorMsg(w, err.Error())
		}

		//检测rom文件是否存在
		if Exists(rom.RomPath) == false {
			return errorMsg(w, Config.Lang["RomNotFound"]+rom.RomPath)
		}

		cmd := ""
		if sim.Cmd == "" {
			cmd = rom.RomPath
		} else {
			filename := filepath.Base(rom.RomPath) //exe运行文件路径
			cmd = strings.ReplaceAll(sim.Cmd, `{RomName}`, GetFileName(filename))
			cmd = strings.ReplaceAll(cmd, `{RomExt}`, path.Ext(filename))
			cmd = strings.ReplaceAll(cmd, `{RomFullPath}`, rom.RomPath)
		}

		err = runGame(sim.Path, cmd)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NullValue()
	})

	//运行电子书
	w.DefineFunction("RunBook", func(args ...*sciter.Value) *sciter.Value {

		//检测执行文件是否存在
		_, err := os.Stat(Config.Default.Book)
		if err != nil {
			return errorMsg(w, Config.Lang["BookNotFound"])
		}

		err = runGame(Config.Default.Book, "")
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NullValue()
	})

	//打开rom目录
	w.DefineFunction("OpenFolder", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String()))
		gtype := args[1].String() //目录类型
		p := ""
		switch gtype {
		case "rom":
			p = Config.Platform[platform].RomPath
		case "thumb":
			p = Config.Platform[platform].ThumbPath
		case "snap":
			p = Config.Platform[platform].SnapPath
		case "doc":
			p = Config.Platform[platform].DocPath
		case "strategy":
			p = Config.Platform[platform].StrategyPath
		case "sim":
			simid := uint32(utils.ToInt(args[2].String())) //模拟器ID
			exe := Config.Platform[platform].SimList[simid].Path
			p = filepath.Dir(exe)
		}
		if err := exec.Command(`explorer`, p).Start(); err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NullValue()
	})

	//更新配置文件
	w.DefineFunction("UpdateConfig", func(args ...*sciter.Value) *sciter.Value {
		field := args[0].String()
		value := args[1].String()

		err := (&db.Config{}).UpdateField(field, value)

		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NullValue()
	})

	//生成所有缓存
	w.DefineFunction("CreateRomCache", func(args ...*sciter.Value) *sciter.Value {
		//先检查平台，将不存在的平台数据先干掉
		pfs := []string{}
		for k, _ := range Config.Platform {
			pfs = append(pfs, utils.ToString(k))
		}

		if err := (&db.Rom{}).DeleteByPlatformNotExists(pfs); err != nil {
			return errorMsg(w, err.Error())
		}

		//先清空menu表
		if err := (&db.Menu{}).ClearMenu(0); err != nil {
			return errorMsg(w, err.Error())
		}

		for k, _ := range Config.Platform {
			err := CreateRomCache(k)
			if err != nil {
				return errorMsg(w, err.Error())
			}
		}
		return sciter.NullValue()
	})

	//读取目录列表
	w.DefineFunction("GetMenuList", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String()))

		//读取数据库
		menu, err := (&db.Menu{}).GetByPlatform(platform) //从数据库中读取当前平台的分类目录

		//读取根目录下是否有rom
		count, err := (&db.Rom{}).Count(platform, constMenuRootKey, "")
		newMenu := []*db.Menu{}

		//读取根目录下有rom，则显示未分类文件夹
		if count > 0 {
			root := &db.Menu{
				Name:     constMenuRootKey,
				Platform: platform,
			}
			newMenu = append(newMenu, root)
			for _, v := range menu {
				newMenu = append(newMenu, v)
			}
		} else {
			newMenu = menu
		}

		if err != nil {
			return errorMsg(w, err.Error())
		}
		getjson, _ := json.Marshal(newMenu)
		return sciter.NewValue(string(getjson))
	})

	//读取游戏列表
	w.DefineFunction("GetGameList", func(args ...*sciter.Value) *sciter.Value {
		platform := strings.Trim(args[0].String(), " ")          //平台
		catname := strings.Trim(args[1].String(), " ")           //分类
		keyword := strings.Trim(args[2].String(), " ")           //关键字
		num := strings.Trim(args[3].String(), " ")               //字母索引
		page := utils.ToInt(strings.Trim(args[4].String(), " ")) //分页数

		newlist := []*db.Rom{}
		if num == "" {
			newlist, _ = (&db.Rom{}).Get(page, platform, catname, keyword)
		} else {
			//按拼音查询
			newlist, _ = (&db.Rom{}).GetByPinyin(page, platform, catname, num)
		}

		jsonRom, _ := json.Marshal(newlist)
		return sciter.NewValue(string(jsonRom))
	})

	//读取游戏数量
	w.DefineFunction("GetGameCount", func(args ...*sciter.Value) *sciter.Value {
		platform := uint32(utils.ToInt(args[0].String()))
		catname := strings.Trim(args[1].String(), " ")
		keyword := strings.Trim(args[2].String(), " ")
		count, _ := (&db.Rom{}).Count(platform, catname, keyword)
		return sciter.NewValue(utils.ToString(count))
	})

	//读取rom详情
	w.DefineFunction("GetGameDetail", func(args ...*sciter.Value) *sciter.Value {
		id := strings.Trim(args[0].String(), " ") //游戏id
		res := &RomDetail{}
		//游戏游戏详细数据
		info, err := (&db.Rom{}).GetById(id)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		//子游戏列表
		sub, _ := (&db.Rom{}).GetSubRom(info.Platform, info.Name)

		res.Info = info
		res.Sublist = sub
		res.DocContent = getDocContent(info.DocPath)
		res.StrategyContent = getDocContent(info.StrategyPath)
		jsonMenu, _ := json.Marshal(&res)
		return sciter.NewValue(string(jsonMenu))
	})

	//添加一个平台
	w.DefineFunction("AddPlatform", func(args ...*sciter.Value) *sciter.Value {
		name := args[0].String()
		platform := &db.Platform{
			Name:   name,
			Pinyin: TextToPinyin(name),
		}
		id, err := platform.Add()
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue(utils.ToString(id))
	})

	//删除一个平台
	w.DefineFunction("DelPlatform", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))
		platform := &db.Platform{
			Id: id,
		}
		sim := &db.Simulator{
			Platform: id,
		}
		rom := &db.Rom{
			Platform: id,
		}

		//删除rom数据
		err := rom.DeleteByPlatform()
		//删除模拟器
		err = sim.DeleteByPlatform()
		//删除平台
		err = platform.DeleteById()

		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue("1")
	})

	//更新平台信息
	w.DefineFunction("UpdatePlatform", func(args ...*sciter.Value) *sciter.Value {
		data := args[0].String()
		d := make(map[string]string)
		json.Unmarshal([]byte(data), &d)

		id := uint32(utils.ToInt(d["id"]))

		exts := strings.Split(d["exts"], ",")

		platform := &db.Platform{
			Id:           id,
			Name:         d["name"],
			RomExts:      exts,
			RomPath:      d["rom"],
			ThumbPath:    d["thumb"],
			SnapPath:     d["snap"],
			StrategyPath: d["strategy"],
			DocPath:      d["doc"],
			Romlist:      d["romlist"],
			Pinyin:       TextToPinyin(d["name"]),
		}

		err := platform.UpdateById()
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue("1")
	})

	//添加模拟器
	w.DefineFunction("AddSimulator", func(args ...*sciter.Value) *sciter.Value {
		data := args[0].String()
		d := make(map[string]string)
		json.Unmarshal([]byte(data), &d)
		pfId := uint32(utils.ToInt(d["platform"]))

		sim := &db.Simulator{
			Name:     d["name"],
			Platform: pfId,
			Path:     d["path"],
			Cmd:      d["cmd"],
			Pinyin:   TextToPinyin(d["name"]),
		}
		id, err := sim.Add()

		//更新默认模拟器

		if utils.ToInt(d["platform"]) == 1 {
			err = sim.UpdateDefault(pfId, id)
			if err != nil {
				return errorMsg(w, err.Error())
			}
		}
		sim.Id = id
		jsonData, _ := json.Marshal(&sim)
		return sciter.NewValue(string(jsonData))
	})

	//更新模拟器
	w.DefineFunction("UpdateSimulator", func(args ...*sciter.Value) *sciter.Value {
		data := args[0].String()
		d := make(map[string]string)
		json.Unmarshal([]byte(data), &d)
		id := uint32(utils.ToInt(d["id"]))
		pfId := uint32(utils.ToInt(d["platform"]))
		def := uint8(utils.ToInt(d["default"]))
		sim := &db.Simulator{
			Id:       id,
			Name:     d["name"],
			Platform: pfId,
			Path:     d["path"],
			Cmd:      d["cmd"],
			Pinyin:   TextToPinyin(d["name"]),
		}

		//更新模拟器
		if err := sim.UpdateById(); err != nil {
			return errorMsg(w, err.Error())
		}

		//如果设置了默认模拟器，则更新默认模拟器
		if def == 1 {
			if err := sim.UpdateDefault(pfId, id); err != nil {
				return errorMsg(w, err.Error())
			}
		}

		jsonData, _ := json.Marshal(&sim)
		return sciter.NewValue(string(jsonData))
	})

	//删除一个模拟器
	w.DefineFunction("DelSimulator", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		sim := &db.Simulator{
			Id: id,
		}

		//删除平台
		err := sim.DeleteById()
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue(args[0].String())
	})

	//读取平台详情
	w.DefineFunction("GetPlatformById", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		//游戏游戏详细数据
		info, err := (&db.Platform{}).GetById(id)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//读取一个平台下的所有模拟器
	w.DefineFunction("GetPlatform", func(args ...*sciter.Value) *sciter.Value {
		//游戏游戏详细数据
		info, err := (&db.Platform{}).GetAll()
		if err != nil {
			return errorMsg(w, err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//读取模拟器详情
	w.DefineFunction("GetSimulatorById", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))

		//游戏游戏详细数据
		info, err := (&db.Simulator{}).GetById(id)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//读取一个平台下的所有模拟器
	w.DefineFunction("GetSimulatorByPlatform", func(args ...*sciter.Value) *sciter.Value {
		id := uint32(utils.ToInt(args[0].String()))
		//游戏游戏详细数据
		info, err := (&db.Simulator{}).GetByPlatform(id)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		jsonInfo, _ := json.Marshal(&info)
		return sciter.NewValue(string(jsonInfo))
	})

	//设为我的最爱
	w.DefineFunction("SetFavorite", func(args ...*sciter.Value) *sciter.Value {
		id := uint64(utils.ToInt(args[0].String()))
		star := uint8(utils.ToInt(args[1].String()))

		//更新rom表
		rom := &db.Rom{
			Id:   id,
			Star: star,
		}

		err := rom.UpdateStar()
		//更新数据
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue("1")
	})

	//设置rom的模拟器
	w.DefineFunction("SetRomSimulator", func(args ...*sciter.Value) *sciter.Value {
		romId := uint64(utils.ToInt(args[0].String()))
		simId := uint32(utils.ToInt(args[1].String()))
		//更新rom表
		rom := &db.Rom{
			Id:    romId,
			SimId: simId,
		}
		err := rom.UpdateSimulator()
		//更新数据
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue("1")
	})

	//更新rom图片
	w.DefineFunction("UpdateRomThumbs", func(args ...*sciter.Value) *sciter.Value {
		typeid := utils.ToInt(args[0].String())
		id := uint64(utils.ToInt(args[1].String()))
		newpath := args[2].String()

		rom := &db.Rom{
			Id: id,
		}

		//设定新的文件名
		vo, _ := rom.GetById(args[1].String())

		//下载文件
		res, err := http.Get(newpath)
		if err != nil {
			return errorMsg(w, err.Error())
		}

		//下载成功后，备份原文件
		oldFilePath := ""
		platformPath := ""
		//原图存在，则备份
		isset := false
		if typeid == 1 {
			isset = Exists(vo.ThumbPath)
			oldFilePath = vo.ThumbPath
			platformPath = Config.Platform[vo.Platform].ThumbPath
		} else {
			isset = Exists(vo.SnapPath)
			oldFilePath = vo.SnapPath
			platformPath = Config.Platform[vo.Platform].SnapPath
		}

		if platformPath == "" {
			return errorMsg(w, Config.Lang["NoSetThumbDir"])
		}

		if isset == true {

			bakFolder := Config.RootPath + "bak " + separator
			//检测bak文件夹是否存在，不存在这创建bak目录
			folder := ExistsFolder(bakFolder)
			if folder == false {
				_ = os.Mkdir(bakFolder, os.ModePerm);
			}

			oldFileName := filepath.Base(oldFilePath)
			bakFileName := GetFileName(oldFileName) + "_" + utils.ToString(time.Now().Unix()) + path.Ext(oldFileName)
			err := os.Rename(oldFilePath, bakFolder+bakFileName)

			if err != nil {
				return errorMsg(w, err.Error())
			}
		}

		//生成新文件
		platformPathAbs, err := filepath.Abs(platformPath) //读取平台图片路径


		newFileName := platformPathAbs + separator + GetFileName(filepath.Base(vo.RomPath)) + path.Ext(newpath) //生成新文件的完整绝路路径地址
		f, err := os.Create(newFileName)
		if err != nil {
			return errorMsg(w, err.Error())
		}
		io.Copy(f, res.Body)

		if typeid == 1 {
			rom.ThumbPath = newFileName
		} else {
			rom.SnapPath = newFileName
		}

		//游戏游戏详细数据
		err = rom.UpdatePic()
		if err != nil {
			return errorMsg(w, err.Error())
		}
		return sciter.NewValue(newFileName)
	})

}
