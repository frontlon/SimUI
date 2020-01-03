package main

import (
	"VirtualNesGUI/code/db"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
)

var LAST_PROCESS = ""; //最后运行的模拟器进程
var constSeparator = "__"                                                    //rom子分隔符
var DOC_EXTS = []string{".txt", ".md"}                                       //doc文档支持的扩展名
var PIC_EXTS = []string{".png", ".jpg", ".gif", ".ico", ".jpeg", ".bmp"}     //支持的图片类型
var RUN_EXTS = []string{
	".html", ".htm", ".mht", ".mhtml", ".url",
	".pdf", ".chm", ".doc", ".docx", ".ppt", ".pptx", "xls", "xlsx", ".rtf",
	".exe", ".com", ".cmd", ".bat", ".lnk",
	".ico", ".png", ".jpg", ".gif", ".jpeg", ".bmp", ".mp4", ".avi", ".wmv"} //可直接运行的doc文档支持的扩展名

type RomDetail struct {
	Info            *db.Rom   //基础信息
	DocContent      string    //简介内容
	StrategyContent string    //攻略内容
	StrategyFile    string    //攻略文件
	Sublist         []*db.Rom //子游戏
}

/**
 * 读取游戏介绍文本
 **/
func getDocContent(f string) string {
	if f == "" {
		return ""
	}
	text, err := ioutil.ReadFile(f)
	content := ""
	if err != nil {
		return content
	}
	//enc := mahonia.NewDecoder("gbk")
	//content = enc.ConvertString(string(text))
	content = string(text)
	return content
}

/**
 * 运行游戏
 **/
func runGame(exeFile string, cmd []string) error {

	//更改程序运行目录
	if err := os.Chdir(filepath.Dir(exeFile)); err != nil {
		return err
	}

	result := exec.Command(exeFile, cmd...)

	if err := result.Start(); err != nil {
		return err
	}

	return nil
}
