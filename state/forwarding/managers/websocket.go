package managers

import "github.com/byuoitav/shipwright/socket"

type WebsocketForwarder struct {
}

func GetDefaultWebsocketForwarder() *WebsocketForwarder {
	return &WebsocketForwarder{}
}

func (e *WebsocketForwarder) Send(toSend interface{}) error {
	socket.GetManager().WriteToSockets(toSend)
	return nil
}
