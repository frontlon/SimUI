/*
package main
var res = []byte{
*/
package main

import (
	"github.com/sciter-sdk/go-sciter"
	"github.com/sciter-sdk/go-sciter/window"
	"log"
	"os"
	"strings"
)

var separator = string(os.PathSeparator) //系统路径分隔符
//路径分隔符
var constMenuRootKey = "_7b9"                                                //根子目录游戏的Menu参数
var constMainFile = "D:\\work\\go\\src\\VirtualNesGUI\\code\\view\\main.html" //主文件路径（测试用）
//var constMainFile = "this://app/main.html" //主文件路径（正式）

func main() {

	//初始化配置
	InitConf()

	left :=Config.Default.WindowLeft
	top := Config.Default.WindowTop
	width := Config.Default.WindowWidth
	height := Config.Default.WindowHeight

	//创建window窗口
	w, err := window.New(
		sciter.SW_MAIN|
			sciter.SW_ENABLE_DEBUG,
		&sciter.Rect{Left: int32(left), Top: int32(top), Right: int32(width), Bottom: int32(height)});
	if err != nil {
		log.Fatal(err);
	}

	//设置view权限
	w.SetOption(sciter.SCITER_SET_SCRIPT_RUNTIME_FEATURES, sciter.ALLOW_SYSINFO | sciter.ALLOW_SOCKET_IO);

	//设置回调
	w.SetCallback(newHandler(w.Sciter))

	//解析资源
	w.OpenArchive(res)


	//加载文件
	err = w.LoadFile(constMainFile);
	if err != nil {
		if _, err := w.Call("errorBox", sciter.NewValue(err.Error())); err != nil {
		}
		return
	}

	//设置标题
	w.SetTitle(Config.Lang["Title"]);
	//定义view函数
	defineViewFunction(w)
	//显示窗口
	w.Show();
	//运行窗口，进入消息循环
	w.Run();
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
