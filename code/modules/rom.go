package modules

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"simUI/code/config"
	"simUI/code/db"
	"simUI/code/utils"
	"strings"
)

var ConstSeparator = "__"     //rom子分隔符
var ConstMenuRootKey = "_7b9" //根子目录游戏的Menu参数

type RomDetail struct {
	Info        *db.Rom         //rom信息
	DocContent  string          //简介内容
	Sublist     []*db.Rom       //子游戏
	Simlist     []*db.Simulator //模拟器
	RomFileSize string          //rom文件大小
}

//运行游戏
func RunGame(romId uint64, simId uint32) error {

	//数据库中读取rom详情
	rom, err := (&db.Rom{}).GetById(romId)
	if err != nil {
		return err
	}

	romCmd, _ := (&db.Rom{}).GetSimConf(romId, simId)

	sim := &db.Simulator{}
	if simId == 0 {
		sim = config.Cfg.Platform[rom.Platform].UseSim
		if sim == nil {
			return errors.New(config.Cfg.Lang["SimulatorNotFound"])
		}
	} else {
		if config.Cfg.Platform[rom.Platform].SimList == nil {
			return errors.New(config.Cfg.Lang["SimulatorNotFound"])
		}
		sim = config.Cfg.Platform[rom.Platform].SimList[simId]
	}

	//如果是相对路径，转换成绝对路径
	if !strings.Contains(rom.RomPath, ":") {
		rom.RomPath = config.Cfg.Platform[rom.Platform].RomPath + config.Cfg.Separator + rom.RomPath
	}

	//解压zip包
	if (sim.Unzip == 1 && romCmd.Unzip == 2) || romCmd.Unzip == 1 {
		RomExts := strings.Split(config.Cfg.Platform[rom.Platform].RomExts, ",")
		rom.RomPath, err = UnzipRom(rom.RomPath, RomExts)
		if err != nil {
			return err
		}
		if rom.RomPath == "" {
			return errors.New(config.Cfg.Lang["UnzipExeNotFound"])
		}

		//如果指定了执行文件
		if romCmd.File != "" {
			rom.RomPath = utils.GetFilePath(rom.RomPath) + "/" + romCmd.File
		}

	}

	//检测rom文件是否存在
	if utils.FileExists(rom.RomPath) == false {
		return errors.New(config.Cfg.Lang["RomNotFound"] + rom.RomPath)
	}

	//加载运行参数
	cmd := []string{}

	ext := utils.GetFileExt(rom.RomPath)

	//运行游戏前，先杀掉之前运行的程序
	if err = utils.KillGame(); err != nil {
		return err
	}

	simCmd := ""
	simLua := ""

	if romCmd.Cmd != "" {
		simCmd = romCmd.Cmd
	} else if sim.Cmd != "" {
		simCmd = sim.Cmd
	}

	if romCmd.Lua != "" {
		simLua = romCmd.Lua
	} else if sim.Lua != "" {
		simLua = sim.Lua
	}

	//如果是可执行程序，则不依赖模拟器直接运行
	if utils.InSliceString(ext, config.RUN_EXTS) {
		cmd = append(cmd, rom.RomPath)
	} else { //如果依赖模拟器
		//检测模拟器文件是否存在
		_, err = os.Stat(sim.Path)
		if err != nil {
			return errors.New(config.Cfg.Lang["SimulatorNotFound"])
		}

		if simCmd == "" {
			cmd = append(cmd, rom.RomPath)
		} else {
			//如果rom运行参数存在，则使用rom的参数
			cmd = strings.Split(simCmd, " ")
			filename := filepath.Base(rom.RomPath) //exe运行文件路径
			//替换变量
			for k, _ := range cmd {
				cmd[k] = strings.ReplaceAll(cmd[k], `{RomName}`, utils.GetFileName(filename))
				cmd[k] = strings.ReplaceAll(cmd[k], `{RomExt}`, utils.GetFileExt(filename))
				cmd[k] = strings.ReplaceAll(cmd[k], `{RomFullPath}`, rom.RomPath)
			}
		}
	}

	//运行lua脚本
	if simLua != "" {
		cmdStr := utils.SlicetoString(" ", cmd)
		callLua(sim.Lua, sim.Path, cmdStr)
	}

	fmt.Println(sim.Path, cmd)

	//运行游戏
	err = utils.RunGame(sim.Path, cmd)

	return nil
}

//右键打开文件夹
func OpenFolder(id uint64, opt string, simId uint32) error {

	info, err := (&db.Rom{}).GetById(id)
	platform := config.Cfg.Platform[info.Platform] //读取当前平台信息
	if err != nil {
		return err
	}
	romName := utils.GetFileName(filepath.Base(info.RomPath)) //读取文件名
	fileName := ""
	switch opt {
	case "rom":
		fileName = platform.RomPath + config.Cfg.Separator + info.RomPath
	case "thumb":
		if platform.ThumbPath != "" {
			fileName = GetRomRes("thumb", info.Platform, romName)
			if fileName == "" {
				fileName = platform.ThumbPath
			}
		}
	case "snap":
		if platform.SnapPath != "" {
			fileName = GetRomRes("snap", info.Platform, romName)
			if fileName == "" {
				fileName = platform.SnapPath + config.Cfg.Separator
			}
		}

	case "poster":
		if platform.PosterPath != "" {
			fileName = GetRomRes("poster", info.Platform, romName)
			if fileName == "" {
				fileName = platform.PosterPath + config.Cfg.Separator
			}
		}
	case "packing":
		if platform.PackingPath != "" {
			fileName = GetRomRes("packing", info.Platform, romName)
			if fileName == "" {
				fileName = platform.PackingPath + config.Cfg.Separator
			}
		}
	case "title":
		if platform.DocPath != "" {
			fileName = GetRomRes("title", info.Platform, romName)
			if fileName == "" {
				fileName = platform.TitlePath
			}
		}

	case "cassette":
		if platform.CassettePath != "" {
			fileName = GetRomRes("cassette", info.Platform, romName)
			if fileName == "" {
				fileName = platform.CassettePath
			}
		}
	case "icon":
		if platform.IconPath != "" {
			fileName = GetRomRes("icon", info.Platform, romName)
			if fileName == "" {
				fileName = platform.IconPath
			}
		}
	case "gif":
		if platform.GifPath != "" {
			fileName = GetRomRes("gif", info.Platform, romName)
			if fileName == "" {
				fileName = platform.GifPath
			}
		}
	case "background":
		if platform.BackgroundPath != "" {
			fileName = GetRomRes("background", info.Platform, romName)
			if fileName == "" {
				fileName = platform.BackgroundPath
			}
		}
	case "video":
		if platform.VideoPath != "" {
			fileName = GetRomRes("video", info.Platform, romName)
			if fileName == "" {
				fileName = platform.VideoPath
			}
		}
	case "doc":
		if platform.DocPath != "" {
			fileName = GetRomRes("doc", info.Platform, romName)
			if fileName == "" {
				fileName = platform.DocPath
			}
		}
	case "strategy":
		if platform.StrategyPath != "" {
			fileName = GetRomRes("strategy", info.Platform, romName)
			if fileName == "" {
				fileName = platform.StrategyPath
			}
		}
	case "sim":
		if _, ok := platform.SimList[simId]; ok {
			fileName = platform.SimList[simId].Path
		}
	}

	if err := utils.OpenFolderByWindow(fileName); err != nil {
		return err
	}
	return nil
}

//读取rom详情
func GetGameDetail(id uint64) (*RomDetail, error) {

	res := &RomDetail{}
	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)

	if err != nil {
		return res, err
	}
	//子游戏列表
	sub, _ := (&db.Rom{}).GetSubRom(info.Platform, info.Name)

	res.Info = info
	res.Sublist = sub
	res.Simlist, _ = (&db.Simulator{}).GetByPlatform(info.Platform)

	//获取rom文件大小
	if res.Info.RomPath != "" {
		fi := config.Cfg.Platform[info.Platform].RomPath + config.Cfg.Separator + res.Info.RomPath
		f, err := os.Stat(fi)
		if err == nil {
			res.RomFileSize = utils.GetFileSizeString(f.Size())
		}
	}

	for k, v := range res.Simlist {
		if res.Simlist[k].Path != "" {
			res.Simlist[k].Path, _ = filepath.Abs(v.Path)
		}
	}

	//读取文档内容
	romName := utils.GetFileName(filepath.Base(info.RomPath)) //生成新文件的完整绝路路径地址
	if config.Cfg.Platform[info.Platform].DocPath != "" {
		docFileName := ""
		for _, v := range config.DOC_EXTS {
			docFileName = config.Cfg.Platform[info.Platform].DocPath + config.Cfg.Separator + romName + v
			res.DocContent = GetDocContent(docFileName)
			if res.DocContent != "" {
				break
			}
		}
	}
	return res, nil
}

//读取游戏攻略内容
func GetGameDoc(t string, id uint64) (string, error) {

	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)

	if err != nil {
		return "", err
	}

	//如果没有执行运行的文件，则读取文档内容
	romName := utils.GetFileName(filepath.Base(info.RomPath)) //生成新文件的完整绝路路径地址
	strategy := ""
	for _, v := range config.DOC_EXTS {
		strategyFileName := ""
		if t == "strategy" {
			strategyFileName = config.Cfg.Platform[info.Platform].StrategyPath + config.Cfg.Separator + romName + v
		} else if t == "doc" {
			strategyFileName = config.Cfg.Platform[info.Platform].DocPath + config.Cfg.Separator + romName + v
		}
		strategy = GetDocContent(strategyFileName)
		if strategy != "" {
			break
		}
	}

	strategy = strings.ReplaceAll(strategy, `<img src="`, `<img src="`+config.Cfg.RootPath)

	return strategy, nil
}

//读取游戏攻略内容
func SetGameDoc(t string, id uint64, content string) (error) {

	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)

	if err != nil {
		return err
	}

	//如果没有执行运行的文件，则读取文档内容
	romName := utils.GetFileName(filepath.Base(info.RomPath)) //生成新文件的完整绝路路径地址
	newExt := "";
	Filename := ""
	for _, v := range config.DOC_EXTS {
		strategyFileName := ""
		if t == "strategy" {
			strategyFileName = config.Cfg.Platform[info.Platform].StrategyPath + config.Cfg.Separator + romName + v
			newExt = config.Cfg.Platform[info.Platform].StrategyPath + config.Cfg.Separator + romName + ".md";
		} else if t == "doc" {
			strategyFileName = config.Cfg.Platform[info.Platform].DocPath + config.Cfg.Separator + romName + v
			newExt = config.Cfg.Platform[info.Platform].DocPath + config.Cfg.Separator + romName + ".txt";
		}

		if (utils.FileExists(strategyFileName)) {
			Filename = strategyFileName;
			break;
		}
	}

	if Filename == "" {
		Filename = newExt
	}

	if !utils.FileExists(Filename) {
		if err := utils.CreateFile(Filename); err != nil {
			return err
		}
	}

	if !utils.IsUTF8(content) {
		content = utils.ToUTF8(content)
	}

	//替换图片路径为相对路径
	content = strings.ReplaceAll(content, config.Cfg.RootPath, "");
	if err := utils.OverlayWriteFile(Filename, content); err != nil {
		return err
	}

	return nil
}

//读取游戏攻略内容
func DelGameDoc(t string, id uint64) (error) {

	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)

	if err != nil {
		return err
	}

	//如果没有执行运行的文件，则读取文档内容
	romName := utils.GetFileName(filepath.Base(info.RomPath)) //生成新文件的完整绝路路径地址
	Filename := ""
	for _, v := range config.DOC_EXTS {
		strategyFileName := ""
		if t == "strategy" {
			strategyFileName = config.Cfg.Platform[info.Platform].StrategyPath + config.Cfg.Separator + romName + v
		} else if t == "doc" {
			strategyFileName = config.Cfg.Platform[info.Platform].DocPath + config.Cfg.Separator + romName + v
		}

		if (utils.FileExists(strategyFileName)) {
			Filename = strategyFileName;
			break;
		}
	}

	if Filename != "" && utils.FileExists(Filename) {
		if err := utils.FileDelete(Filename); err != nil {
			return err
		}
	}

	return nil
}

/**
 * 读取游戏介绍文本
 **/
func GetDocContent(f string) string {
	if f == "" {
		return ""
	}
	text, err := ioutil.ReadFile(f)
	content := ""
	if err != nil {
		return content
	}
	content = string(text)

	if !utils.IsUTF8(content) {
		content = utils.ToUTF8(content)
	}

	content = strings.ReplaceAll(content, "\n", "<br>")

	return content
}

//更新模拟器独立参数
func UpdateRomCmd(id uint64, simId uint32, data map[string]string) error {
	if data["cmd"] == "" && data["unzip"] == "2" {
		//如果当前配置和模拟器默认配置一样，则删除该记录
		if err := (&db.Rom{}).DelSimConf(id, simId); err != nil {
			return err
		}
	} else {
		//开始更新
		if err := (&db.Rom{}).UpdateSimConf(id, simId, data["cmd"], uint8(utils.ToInt(data["unzip"])), data["file"]); err != nil {
			return err
		}
	}
	return nil
}

//读取rom以及相关资源
func DeleteRomAndRes(id uint64) error {

	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)
	if err != nil {
		return err
	}

	fname := utils.GetFileName(info.RomPath)
	platform := config.Cfg.Platform[info.Platform]

	go func() {
		romFiles, _ := utils.ScanDirByKeyword(platform.RomPath, fname)
		for _, f := range romFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		thumbFiles, _ := utils.ScanDirByKeyword(platform.ThumbPath, fname)
		for _, f := range thumbFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		backgroundFiles, _ := utils.ScanDirByKeyword(platform.BackgroundPath, fname)
		for _, f := range backgroundFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		packingFiles, _ := utils.ScanDirByKeyword(platform.PackingPath, fname)
		for _, f := range packingFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		posterFiles, _ := utils.ScanDirByKeyword(platform.PosterPath, fname)
		for _, f := range posterFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		snapFiles, _ := utils.ScanDirByKeyword(platform.SnapPath, fname)
		for _, f := range snapFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		titleFiles, _ := utils.ScanDirByKeyword(platform.TitlePath, fname)
		for _, f := range titleFiles {
			utils.FileDelete(f)
		}
	}()

	go func() {
		cassetteFiles, _ := utils.ScanDirByKeyword(platform.CassettePath, fname)
		for _, f := range cassetteFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		iconFiles, _ := utils.ScanDirByKeyword(platform.IconPath, fname)
		for _, f := range iconFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		gifFiles, _ := utils.ScanDirByKeyword(platform.GifPath, fname)
		for _, f := range gifFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		videoFiles, _ := utils.ScanDirByKeyword(platform.VideoPath, fname)
		for _, f := range videoFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		docFiles, _ := utils.ScanDirByKeyword(platform.DocPath, fname)
		for _, f := range docFiles {
			utils.FileDelete(f)
		}
	}()
	go func() {
		strategyFiles, _ := utils.ScanDirByKeyword(platform.StrategyPath, fname)
		for _, f := range strategyFiles {
			utils.FileDelete(f)
		}
	}()
	return nil
}

func UploadStrategyImages(id uint64, p string) (string, error) {

	//游戏游戏详细数据
	info, err := (&db.Rom{}).GetById(id)
	if err != nil {
		return "", err
	}

	strategyPath := config.Cfg.Platform[info.Platform].StrategyPath + config.Cfg.Separator + "images/"
	if strategyPath == "" {
		return "", nil
	}

	//先检查目录是否存在，不存在创建目录
	if (!utils.FolderExists(strategyPath)) {
		if err := utils.CreateDir(strategyPath); err != nil {
			return "", err
		}
	}

	//复制文件
	newFilename := utils.GetFileNameAndExt(p)
	newFile := strategyPath + newFilename
	if err := utils.FileCopy(p, newFile); err != nil {
		return "", err
	}
	return newFile, nil

}

//读取rom资源
func GetRomRes(typ string, pf uint32, romName string) string {

	platform := config.Cfg.Platform[pf] //读取当前平台信息
	fileName := ""
	resName := ""
	switch typ {
	case "thumb":
		if platform.ThumbPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.ThumbPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "snap":
		if platform.SnapPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.SnapPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "poster":
		if platform.PosterPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.PosterPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "packing":
		if platform.PackingPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.PackingPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "title":
		if platform.DocPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.TitlePath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "cassette":
		if platform.CassettePath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.CassettePath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "icon":
		if platform.IconPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.IconPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "gif":
		if platform.GifPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.GifPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "background":
		if platform.BackgroundPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.BackgroundPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "video":
		if platform.VideoPath != "" {
			for _, v := range config.PIC_EXTS {
				fileName = platform.VideoPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "doc":
		if platform.DocPath != "" {
			for _, v := range config.DOC_EXTS {
				fileName = platform.DocPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	case "strategy":
		if platform.StrategyPath != "" {
			for _, v := range config.DOC_EXTS {
				fileName = platform.StrategyPath + config.Cfg.Separator + romName + v
				if utils.FileExists(fileName) {
					resName = fileName;
					break
				}
			}
		}
	}

	return resName
}

//移动rom及资源文件
func MoveRom(id uint64, newPlatform uint32, newFolder string) error {

	//读取rom详情
	rom, err := (&db.Rom{}).GetById(id)
	if err != nil {
		utils.WriteLog(err.Error())
	}

	//生成目录地址
	romName := utils.GetFileNameAndExt(rom.RomPath);
	oldFile := config.Cfg.Platform[rom.Platform].RomPath + config.Cfg.Separator + rom.RomPath
	newFile := ""

	if newFolder == "/" {
		newFile = config.Cfg.Platform[newPlatform].RomPath + config.Cfg.Separator + romName
	} else {
		newFile = config.Cfg.Platform[newPlatform].RomPath + config.Cfg.Separator + newFolder + config.Cfg.Separator + romName
	}

	//如果位置一样则不用移动
	if (oldFile == newFile) {
		return nil
	}

	//移动文件
	if err := utils.FileMove(oldFile, newFile); err != nil {
		return err
	}

	//同平台下不用移动资源文件
	if rom.Platform == newPlatform {
		return nil
	}

	//开始移动资源文件
	newPlatformDom := config.Cfg.Platform[newPlatform]
	romName = utils.GetFileName(filepath.Base(rom.RomPath))

	thumb := GetRomRes("thumb", rom.Platform, romName)
	if thumb != "" {
		_ = utils.FileMove(thumb, newPlatformDom.ThumbPath+config.Cfg.Separator+utils.GetFileNameAndExt(thumb));
	}

	snap := GetRomRes("snap", rom.Platform, romName)
	if snap != "" {
		_ = utils.FileMove(snap, newPlatformDom.SnapPath+config.Cfg.Separator+utils.GetFileNameAndExt(snap));
	}

	poster := GetRomRes("poster", rom.Platform, romName)
	if poster != "" {
		_ = utils.FileMove(poster, newPlatformDom.PosterPath+config.Cfg.Separator+utils.GetFileNameAndExt(poster));
	}

	packing := GetRomRes("packing", rom.Platform, romName)
	if packing != "" {
		_ = utils.FileMove(packing, newPlatformDom.PackingPath+config.Cfg.Separator+utils.GetFileNameAndExt(packing));
	}

	title := GetRomRes("title", rom.Platform, romName)
	if title != "" {
		_ = utils.FileMove(title, newPlatformDom.TitlePath+config.Cfg.Separator+utils.GetFileNameAndExt(title));
	}

	cassette := GetRomRes("cassette", rom.Platform, romName)
	if cassette != "" {
		_ = utils.FileMove(cassette, newPlatformDom.CassettePath+config.Cfg.Separator+utils.GetFileNameAndExt(cassette));
	}

	icon := GetRomRes("icon", rom.Platform, romName)
	if icon != "" {
		_ = utils.FileMove(icon, newPlatformDom.IconPath+config.Cfg.Separator+utils.GetFileNameAndExt(icon));
	}

	gif := GetRomRes("gif", rom.Platform, romName)
	if gif != "" {
		_ = utils.FileMove(gif, newPlatformDom.GifPath+config.Cfg.Separator+utils.GetFileNameAndExt(gif));
	}
	
	background := GetRomRes("background", rom.Platform, romName)
	if background != "" {
		_ = utils.FileMove(background, newPlatformDom.BackgroundPath+config.Cfg.Separator+utils.GetFileNameAndExt(background));
	}

	video := GetRomRes("video", rom.Platform, romName)
	if video != "" {
		_ = utils.FileMove(video, newPlatformDom.VideoPath+config.Cfg.Separator+utils.GetFileNameAndExt(video));
	}

	doc := GetRomRes("doc", rom.Platform, romName)
	if doc != "" {
		_ = utils.FileMove(doc, newPlatformDom.DocPath+config.Cfg.Separator+utils.GetFileNameAndExt(doc));
	}

	strategy := GetRomRes("strategy", rom.Platform, romName)
	if strategy != "" {
		_ = utils.FileMove(strategy, newPlatformDom.StrategyPath+config.Cfg.Separator+utils.GetFileNameAndExt(strategy));
	}
	return nil
}
