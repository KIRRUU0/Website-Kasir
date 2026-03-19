package repository

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/KIRRUU0/Website-Kasir/internal/model"
	"gorm.io/gorm"
)

type StockRepository interface {
	GetStock(ctx context.Context, productID uint) (*model.StockAllocation, error)
	UpdateStockRedis(ctx context.Context, productID uint, channel string, qty int) error
	SyncToMySQL(ctx context.Context, productID uint, offline int, online int) error
}

type stockRepo struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewStockRepository(db *gorm.DB, rdb *redis.Client) StockRepository {
	return &stockRepo{db, rdb}
}

func (r *stockRepo) GetStock(ctx context.Context, productID uint) (*model.StockAllocation, error) {
	var stock model.StockAllocation
	err := r.db.Where("product_id = ?", productID).First(&stock).Error
	return &stock, err
}

func (r *stockRepo) UpdateStockRedis(ctx context.Context, productID uint, channel string, qty int) error {
	// Key format: stock:1:OFFLINE atau stock:1:ONLINE
	key := fmt.Sprintf("stock:%d:%s", productID, channel)
	
	// Gunakan DecrBy untuk mengurangi stok secara atomic di Redis
	newVal, err := r.redis.DecrBy(ctx, key, int64(qty)).Result()
	if err != nil {
		return err
	}

	// Jika stok di bawah 0, kembalikan (rollback) dan beri error
	if newVal < 0 {
		r.redis.IncrBy(ctx, key, int64(qty))
		return fmt.Errorf("stok %s habis", channel)
	}
	return nil
}

func (r *stockRepo) SyncToMySQL(ctx context.Context, productID uint, offline int, online int) error {
	return r.db.Model(&model.StockAllocation{}).
		Where("product_id = ?", productID).
		Updates(map[string]interface{}{
			"stock_offline": offline,
			"stock_online":  online,
		}).Error
}