package db

import (
	"VirtualNesGUI/code/utils"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
)

type Platform struct {
	Id             uint32
	Name           string
	Icon           string
	RomExts        string
	RomPath        string
	ThumbPath      string
	SnapPath       string
	PosterPath     string
	PackingPath    string
	DocPath        string
	StrategyPath   string
	BackgroundPath string
	Romlist        string
	Pinyin         string
	Sort           uint32
	SimList        map[uint32]*Simulator `gorm:"-"`
	UseSim         *Simulator            `gorm:"-"` //当前使用的模拟器
}

func (*Platform) TableName() string {
	return "platform"
}

//添加平台
func (m *Platform) Add() (uint32, error) {
	result := getDb().Create(&m)
	if result.Error != nil {
		fmt.Println(result.Error)
	}
	return uint32(m.Id), result.Error
}

//批量插入数据
func (m *Platform) BatchAdd(platforms []*Platform) {

	if len(platforms) == 0 {
		return
	}

	tx := getDb().Begin()
	for _, v := range platforms {
		tx.Create(&v)
	}
	tx.Commit()
}

//根据条件，查询多条数据
func (*Platform) GetAll() ([]*Platform, error) {
	volist := []*Platform{}
	result := getDb().Order("sort ASC,pinyin ASC").Find(&volist)
	if result.Error != nil {
		fmt.Println(result.Error)
	}

	return volist, nil
}

//根据ID查询一个平台参数
func (*Platform) GetById(id uint32) (*Platform, error) {

	vo := &Platform{}
	field := "id,`name`, icon, rom_exts, rom_path, thumb_path, snap_path,  poster_path, packing_path, doc_path, strategy_path, romlist"

	result := getDb().Select(field).Where("id=?", id).Order("sort ASC,pinyin ASC").First(&vo)
	if result.Error != nil {
		fmt.Println(result.Error)
	}

	return vo, result.Error
}

//更新平台信息
func (m *Platform) UpdateById() error {
	result := getDb().Table(m.TableName()).Where("id=?", m.Id).Updates(m)
	if result.Error != nil {
		fmt.Println(result.Error.Error())
	}
	return result.Error
}

//更新平台的一个字段
func (m *Platform) UpdateFieldById(field string, value interface{}) error {

	switch field {
	case "id", "sort":
		value = utils.ToInt(value)
	default:
		value = utils.ToString(value)
	}

	result := getDb().Table(m.TableName()).Where("id=?", m.Id).Update(field, value)
	if result.Error != nil {
		fmt.Println(result.Error.Error())
	}
	return result.Error
}

//删除一个平台
func (m *Platform) DeleteById() error {
	result := getDb().Where("platform=?", m.Id).Delete(&m)
	if result.Error != nil {
		fmt.Println(result.Error.Error())
	}
	return result.Error
}

//更新排序
func (m *Platform) UpdateSortById() error {
	result := getDb().Table(m.TableName()).Where("id=?", m.Id).Update("sort", m.Sort)
	if result.Error != nil {
		fmt.Println(result.Error.Error())
	}
	return result.Error
}

func (m *Platform) Truncate() (error) {
	result := getDb().Delete(&m)
	if result.Error != nil {
		fmt.Println(result.Error)
	}
	return result.Error
}
