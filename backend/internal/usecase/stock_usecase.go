package usecase

import (
	"context"
	"github.com/KIRRUU0/Website-Kasir/internal/repository"
)

// NotificationProvider memutus rantai import cycle
type NotificationProvider interface {
	BroadcastMessage(message interface{})
}

type StockUsecase interface {
	ReduceStock(ctx context.Context, productID uint, qty int, isOnline bool) error
}

type stockUsecase struct {
	repo     repository.StockRepository
	notifier NotificationProvider // Interface, bukan struct handler langsung
}

func NewStockUsecase(r repository.StockRepository, n NotificationProvider) StockUsecase {
	return &stockUsecase{
		repo:     r,
		notifier: n,
	}
}

func (u *stockUsecase) ReduceStock(ctx context.Context, productID uint, qty int, isOnline bool) error {
	channel := "OFFLINE"
	if isOnline {
		channel = "ONLINE"
	}

	// Logic potong stok di Redis/DB via Repository
	err := u.repo.UpdateStockRedis(ctx, productID, channel, qty)
	if err != nil {
		return err
	}

	// Jika online, kirim notifikasi via WebSocket
	if isOnline {
		u.notifier.BroadcastMessage(map[string]interface{}{
			"event":   "NEW_ORDER_OJOL",
			"message": "Ada pesanan Ojol baru masuk!",
		})
	}

	return nil
}