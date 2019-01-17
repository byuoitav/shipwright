package socket

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/events"
	"github.com/gorilla/websocket"
	"github.com/labstack/echo"
)

type (
	// EventHandler is an interface for handling websocket events
	EventHandler interface {
		// OnClientConnect is called once each time a new client connects to the manager.
		OnClientConnect(sendToClient chan events.Event)

		// OnEventReceived will be called each time any client sends an event.
		OnEventReceived(event events.Event, sendToAll chan events.Event)
	}

	// A Manager maintains and manages the list of websocket connections
	Manager struct {
		clients    map[*Client]bool
		register   chan *Client
		unregister chan *Client

		broadcast    chan events.Event
		eventHandler EventHandler

		mess *messenger.Messenger
	}
)

var (
	socketManager     *Manager
	socketManagerInit sync.Once
)

// GetManager returns the manager, and creates a new one if it has not made one before
func GetManager() *Manager {
	socketManagerInit.Do(func() {
		socketManager = newManager()
		eventHandler := &eventHandlerStruct{}

		socketManager.SetEventHandler(eventHandler)
	})

	return socketManager
}

func newManager() *Manager {
	m := &Manager{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),

		broadcast: make(chan events.Event),
	}

	go m.run()
	return m
}

// SetMessenger sets the event Messenger for the websocket manager
func (m *Manager) SetMessenger(mess *messenger.Messenger) {
	m.mess = mess
}

// SetEventHandler sets the eventHandler for the websocket manager
func (m *Manager) SetEventHandler(handler EventHandler) {
	m.eventHandler = handler
}

func (m *Manager) run() {
	for {
		select {
		case client := <-m.register:
			log.L.Infof("Registering %s to websocket manager", client.conn.RemoteAddr())
			m.clients[client] = true

			if m.eventHandler != nil {
				m.eventHandler.OnClientConnect(client.sendChan)
			}
		case client := <-m.unregister:
			if _, ok := m.clients[client]; ok {
				log.L.Infof("Removing %s from websocket manager", client.conn.RemoteAddr())
				close(client.sendChan)
				delete(m.clients, client)
			}
		case message := <-m.broadcast:
			log.L.Debugf("broadcasting message to %v clients: %s", len(m.clients), message)
			for client := range m.clients {
				select {
				case client.sendChan <- message:
				default:
					m.unregister <- client
				}
			}
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// UpgradeToWebsocket upgrades a connection to a websocket and creates a client for the connection
func UpgradeToWebsocket(manager *Manager) func(context echo.Context) error {
	return func(context echo.Context) error {
		log.L.Infof("Attempting to upgrade the HTTP connection from %s to websocket", context.Request().RemoteAddr)
		conn, err := upgrader.Upgrade(context.Response(), context.Request(), nil)
		if err != nil {
			return context.String(
				http.StatusInternalServerError,
				fmt.Sprintf("unable to upgrade connection to a websocket: %s", err))
		}

		client := &Client{
			manager:  manager,
			conn:     conn,
			sendChan: make(chan events.Event, 256),
		}

		client.manager.register <- client

		go client.writePump()
		go client.readPump()

		return nil
	}
}

// WriteToSockets writes events out to the clients on the socket connections
func (m *Manager) WriteToSockets(event events.Event) {
	m.broadcast <- event
}

type eventHandlerStruct struct{}

// OnClientConnect is called once each time a new client connects to the manager.
func (eh *eventHandlerStruct) OnClientConnect(sendToClient chan events.Event) {

}

// OnEventReceived will be called each time any client sends an event.
func (eh *eventHandlerStruct) OnEventReceived(event events.Event, sendToAll chan events.Event) {
	sendToAll <- event
}
