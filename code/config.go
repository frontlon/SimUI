package main

import (
	"VirtualNesGUI/code/db"
	"bufio"
	"fmt"
	"github.com/go-ini/ini"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
)

//配置文件
var Config *ConfStruct
//读取配置文件

//配置文件
type ConfStruct struct {
	RootPath  string                  //exe文件的当前路径
	Separator string                  //exe文件的当前路径
	Default   *db.Config              //默认配置
	LangList  map[string]string       //语言列表
	Theme     map[string]*ThemeStruct //主题列表
	Lang      map[string]string       //语言项
	Platform  map[int64]*db.Platform  //平台及对应的模拟器列表
}

type ThemeStruct struct {
	Name  string
	Path  string
	Params map[string]string
}

/*
 初始化读取配置
 @author frontLon
 @return strucctfilepath.Abs
*/
func InitConf() {
	var rootpath, _ = filepath.Abs(filepath.Dir(os.Args[0])) //exe运行文件路径
	Config = &ConfStruct{}
	//配置全局参数
	Config.Platform = getPlatform()
	Config.Default = getDefault()
	Config.Lang = getLang(Config.Default.Lang)
	Config.LangList = getLangList()
	Config.Theme = getTheme()
	Config.RootPath = rootpath + separator //exe文件的绝对路径
	Config.Separator = separator           //系统的目录分隔符
}

//读取平台列表
func getPlatform() map[int64]*db.Platform {
	DBSim := &db.Simulator{}
	platform, _ := (&db.Platform{}).GetAll()
	for _, v := range platform {
		platform[v.Id].SimList, _ = DBSim.GetByPlatform(v.Id) //填充模拟器
		platform[v.Id].DocPath, _ = filepath.Abs(platform[v.Id].DocPath)
		platform[v.Id].Romlist, _ = filepath.Abs(platform[v.Id].Romlist)
		platform[v.Id].VideoPath, _ = filepath.Abs(platform[v.Id].VideoPath)
		platform[v.Id].RomPath, _ = filepath.Abs(platform[v.Id].RomPath)
		platform[v.Id].ThumbPath, _ = filepath.Abs(platform[v.Id].ThumbPath)
		platform[v.Id].SnapPath, _ = filepath.Abs(platform[v.Id].SnapPath)

		for sk, sim := range platform[v.Id].SimList {
			//当前正在使用的模拟器
			if sim.Default == 1 {
				platform[v.Id].UseSim = sim
			}
			//模拟器路径转换为绝对路径
			platform[v.Id].SimList[sk].Path, _ = filepath.Abs(platform[v.Id].SimList[sk].Path)
		}
	}
	return platform
}

//读取缓存配置
func getDefault() *db.Config {
	vo, _ := (&db.Config{}).Get()
	//查看当前选定平台值是否是正常的
	isset := false
	for _, v := range (Config.Platform) {
		if vo.Platform == v.Id {
			isset = true
			break
		}
	}
	//如果没有匹配上platform，则读取config中的第一项
	if isset == false {
		for _, v := range (Config.Platform) {
			vo.Platform = v.Id
			//修复配置文件
			if err := (&db.Config{}).UpdateField("platform", string(vo.Platform)); err != nil {
			}
			break
		}
	}

	return vo
}

//读取主题列表
func getTheme() map[string]*ThemeStruct {
	dirPth, _ := filepath.Abs("theme")
	lists, _ := ioutil.ReadDir(dirPth)
	themelist := map[string]*ThemeStruct{}
	for _, fi := range lists {
		ext := strings.ToLower(path.Ext(fi.Name())) //获取文件后缀
		if !fi.IsDir() && ext == ".css" { // 忽略目录

			filename := dirPth + separator + fi.Name()
			file, err := os.Open(filename) //打开文件

			if err != nil {
				fmt.Println(err.Error())
			}
			scanner := bufio.NewScanner(file) //扫描文件
			lineText := ""
			//只读取第一行
			id := ""
			params := make(map[string]string)
			for scanner.Scan() {
				lineText = scanner.Text()
				strarr := strings.Split(lineText, ":")
				if (len(strarr) == 2) {
					//标题
					if id == "" {
						first := strings.Index(strarr[1], "(");
						last := strings.Index(strarr[1], ")");
						id = strarr[1][first+1 : last]
						continue
					}
					//内容
					first := strings.Index(strarr[0], "(");
					last := strings.Index(strarr[0], ")");
					key := strings.Trim(strarr[0][first+1:last], " ")
					value := strings.Trim(strings.Replace(strarr[1], ";", "", 1), " ")
					if key != "" && value != "" {


						if(key == "background-image"){
							value = dirPth + separator + value
						}

						params[key] = value
					}
				}
			}

			themelist[id] = &ThemeStruct{
				Name:  GetFileName(fi.Name()),
				Path:  filename,
				Params: params,
			}
			file.Close()
		}
	}
	return themelist
}

//读取ROM别名配置参数
func getRomAlias(id int64) map[string]string {
	section := make(map[string]string)
	file, err := ini.LoadSources(ini.LoadOptions{IgnoreInlineComment: true}, Config.Platform[id].Romlist)
	if err == nil {
		section = file.Section("Alias").KeysHash()
	}
	return section
}

//读取语言参数配置
func getLang(lang string) map[string]string {
	dirPth := Config.RootPath + "lang" + separator + lang + ".ini"
	section := make(map[string]string)
	file, err := ini.LoadSources(ini.LoadOptions{IgnoreInlineComment: true}, dirPth)
	if err == nil {
		section = file.Section("").KeysHash()
	}
	return section
}

//读取语言文件列表
func getLangList() map[string]string {
	lang := make(map[string]string)
	dirPth, _ := filepath.Abs("lang")
	lists, _ := ioutil.ReadDir(dirPth)
	for _, fi := range lists {
		if !fi.IsDir() { // 忽略目录
			lang[GetFileName(fi.Name())] = fi.Name()
		}
	}
	return lang
}
