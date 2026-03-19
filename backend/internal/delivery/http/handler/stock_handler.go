package handler

import (
	"net/http"
	"strconv"

	"github.com/KIRRUU0/Website-Kasir/internal/usecase"
	"github.com/gin-gonic/gin"
)

type StockHandler struct {
	stockUC usecase.StockUsecase
}

func NewStockHandler(uc usecase.StockUsecase) *StockHandler {
	return &StockHandler{stockUC: uc}
}

func (h *StockHandler) Checkout(c *gin.Context) {
	pID, _ := strconv.Atoi(c.Query("product_id"))
	qty, _ := strconv.Atoi(c.Query("qty"))
	isOnline := c.Query("type") == "online"

	err := h.stockUC.ReduceStock(c.Request.Context(), uint(pID), qty, isOnline)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Success"})
}