package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"simUI/code/config"
	"simUI/code/controller"
	"simUI/code/db"
	"simUI/code/modules"
	"simUI/code/utils"
	"simUI/code/utils/go-sciter"
	"simUI/code/utils/go-sciter/window"
	"strings"
)

func main() {

	isDebug := false
	ROOTPATH := "this://app/main.html" //go用路径
	if isDebug == true {
		ROOTPATH = "D:\\work\\go\\src\\simUI\\code\\view\\main.html" //go 用路径
	}

	db.UpgradeDB() //检测新版

	runtime.LockOSThread()

	config.Cfg = &config.ConfStruct{}
	rootpath, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	separator := string(os.PathSeparator)                             //系统路径分隔符
	config.Cfg.RootPath = rootpath + separator                        //当前软件的绝对路径
	config.Cfg.Separator = separator                                  //系统的目录分隔符
	config.Cfg.CachePath = rootpath + separator + "cache" + separator //缓存路径
	config.Cfg.UnzipPath = config.Cfg.CachePath + "unzip" + separator //rom解压路径

	defer func() {
		if r := recover(); r != nil {
			utils.WriteLog("recover:" + fmt.Sprintf("%s", r))
			fmt.Println("recover:", fmt.Sprintf("%s", r))
		}
	}()

	//连接数据库
	db.Conn()

	//初始化配置
	errConf := config.InitConf()

	//读取宽高
	width := config.Cfg.Default.WindowWidth
	height := config.Cfg.Default.WindowHeight

	//创建window窗口
	//err := errors.New("")
	w, err := window.New(
		sciter.SW_MAIN|
			//sciter.SW_RESIZEABLE|
			//sciter.SW_CONTROLS|
			sciter.SW_ENABLE_DEBUG,
		&sciter.Rect{Left: 0, Top: 0, Right: int32(utils.ToInt(width)), Bottom: int32(utils.ToInt(height))})
	if err != nil {
		utils.WriteLog(err.Error())
	}

	utils.Window = w

	//设置view权限
	w.SetOption(sciter.SCITER_SET_SCRIPT_RUNTIME_FEATURES, sciter.ALLOW_SYSINFO|sciter.ALLOW_FILE_IO|sciter.ALLOW_SOCKET_IO)

	//设置回调
	w.SetCallback(newHandler(w.Sciter))

	//解析资源
	w.OpenArchive(res)

	//加载文件
	err = w.LoadFile(ROOTPATH)
	if err != nil {
		utils.ErrorMsg(err.Error())
		return
	}

	//配置出先错误
	if errConf != nil {
		utils.ErrorMsg(errConf.Error())
		os.Exit(1)
		return
	}

	if len(config.Cfg.Lang) == 0 {
		utils.WriteLog("没有找到语言文件或语言文件为空\nNo language files or language files found empty")
		utils.ErrorMsg("没有找到语言文件或语言文件为空\nNo language files or language files found empty")
		os.Exit(1)
		return
	}

	//设置标题
	w.SetTitle(config.Cfg.Lang["SoftName"])

	//定义view函数
	defineViewFunction()

	//显示窗口
	w.Show()

	//游戏手柄
	modules.CheckJoystick()

	//软件启动时检测升级
	modules.BootCheckUpgrade()

	//运行窗口，进入消息循环
	w.Run()
}

//定义控制器方法
func defineViewFunction() {
	controller.CacheController()
	controller.ConfigController()
	controller.MenuController()
	controller.PlatformController()
	controller.RomCmdController()
	controller.RomController()
	controller.ShortcutController()
	controller.SimulatorController()
	controller.JoystickController()
}

//资源加载
func OnLoadData(s *sciter.Sciter) func(ld *sciter.ScnLoadData) int {
	return func(ld *sciter.ScnLoadData) int {
		uri := ld.Uri()
		if strings.HasPrefix(uri, "this://app/") {
			path := uri[11:]
			data := s.GetArchiveItem(path)
			if data == nil {
				return sciter.LOAD_OK
			}
			s.DataReady(uri, data)
		}
		return sciter.LOAD_OK
	}
}

func newHandler(s *sciter.Sciter) *sciter.CallbackHandler {
	return &sciter.CallbackHandler{
		OnLoadData: OnLoadData(s),
	}
}
