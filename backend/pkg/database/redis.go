package database

import (
	"context"
	"os"

	"github.com/go-redis/redis/v8"
)

func InitRedis() *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       0,
	})

	// Test koneksi
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		panic("Gagal koneksi ke Redis: " + err.Error())
	}

	return rdb
}