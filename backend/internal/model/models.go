package model

import (
	"time"
)

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"unique;not null" json:"username"`
	Password string `gorm:"not null" json:"-"` 
	Role     string `gorm:"type:enum('admin', 'kasir');default:'kasir'" json:"role"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type Product struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	Price     float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	SKU       string    `gorm:"type:varchar(50);uniqueIndex" json:"sku"`
	CreatedAt time.Time `json:"created_at"`
}

type StockAllocation struct {
	ProductID    uint `gorm:"primaryKey" json:"product_id"`
	StockOffline int  `gorm:"default:0" json:"stock_offline"`
	StockOnline  int  `gorm:"default:0" json:"stock_online"`
}

type Transaction struct {
	ID           string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CustomerName string    `gorm:"type:varchar(100)" json:"customer_name"`
	TotalAmount  float64   `gorm:"type:decimal(10,2)" json:"total_amount"`
	Source       string    `gorm:"type:enum('OFFLINE', 'GOJEK', 'GRAB', 'SHOPEE')" json:"source"`
	CreatedAt    time.Time `json:"created_at"`
}