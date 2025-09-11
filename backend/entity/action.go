package entity

import "gorm.io/gorm"

type Action struct {
   gorm.Model
   Action string   `json:"action"`
}
// ใช้กับ stockmovement [เพิ่ม ลบ อัปเดต]