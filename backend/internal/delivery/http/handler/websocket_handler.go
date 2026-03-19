package handler

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type WSHandler struct {
	Clients   map[*websocket.Conn]bool
	Broadcast chan interface{}
	mu        sync.Mutex
}

func NewWSHandler() *WSHandler {
	h := &WSHandler{
		Clients:   make(map[*websocket.Conn]bool),
		Broadcast: make(chan interface{}),
	}
	go h.handleMessages()
	return h
}

// Method ini yang menyambungkan ke Interface di Usecase
func (h *WSHandler) BroadcastMessage(message interface{}) {
	h.Broadcast <- message
}

func (h *WSHandler) ServeWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	h.mu.Lock()
	h.Clients[conn] = true
	h.mu.Unlock()
	fmt.Println("New WS Client Connected")
}

func (h *WSHandler) handleMessages() {
	for {
		msg := <-h.Broadcast
		h.mu.Lock()
		for client := range h.Clients {
			err := client.WriteJSON(msg)
			if err != nil {
				client.Close()
				delete(h.Clients, client)
			}
		}
		h.mu.Unlock()
	}
}