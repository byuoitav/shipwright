package main

import (
	"context"
	"net/http"

	"github.com/byuoitav/common"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/auth"
	"github.com/byuoitav/shipwright/actions"

	// imported to initialize the list of then's
	_ "github.com/byuoitav/shipwright/actions/then/circular"
	"github.com/byuoitav/shipwright/alertstore"
	"github.com/byuoitav/shipwright/handlers"
	"github.com/byuoitav/shipwright/socket"
	figure "github.com/common-nighthawk/go-figure"
)

func main() {
	figure.NewFigure("SMEE", "univers", true).Print()
	log.SetLevel("info")

	port := ":9999"
	router := common.NewRouter()

	go actions.DefaultActionManager().Start(context.TODO())
	alertstore.InitializeAlertStore(actions.DefaultActionManager())

	router.POST("/event", actions.DefaultActionManager().InjectEvent)

	write := router.Group("", auth.AuthorizeRequest("write-state", "room", auth.LookupResourceFromAddress))
	read := router.Group("", auth.AuthorizeRequest("read-state", "room", auth.LookupResourceFromAddress))

	// Building Endpoints
	write.POST("/buildings/:building", handlers.AddBuilding)
	write.POST("/buildings", handlers.AddMultipleBuildings)
	read.GET("/buildings/:building", handlers.GetBuilding)
	read.GET("/buildings", handlers.GetAllBuildings)
	write.PUT("/buildings/:building/update", handlers.UpdateBuilding)
	write.PUT("/buildings/update", handlers.UpdateMultipleBuildings)
	write.GET("/buildings/:building/delete", handlers.DeleteBuilding)

	// Room Endpoints
	write.POST("/rooms/:room", handlers.AddRoom)
	write.POST("/rooms", handlers.AddMultipleRooms)
	read.GET("/rooms/:room", handlers.GetRoom)
	read.GET("/rooms", handlers.GetAllRooms)
	read.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	write.PUT("/rooms/:room/update", handlers.UpdateRoom)
	write.PUT("/rooms/update", handlers.UpdateMultipleRooms)
	write.GET("/rooms/:room/delete", handlers.DeleteRoom)
	read.GET("/rooms/configurations", handlers.GetRoomConfigurations)
	read.GET("/rooms/designations", handlers.GetRoomDesignations)

	// Device Endpoints
	write.POST("/devices/:device", handlers.AddDevice)
	write.POST("/devices", handlers.AddMultipleDevices)
	read.GET("/devices/:device", handlers.GetDevice)
	read.GET("/devices", handlers.GetAllDevices)
	read.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	read.GET("/rooms/:room/devices/roles/:role", handlers.GetDevicesByRoomAndRole)
	read.GET("/devices/types/:type/roles/:role", handlers.GetDevicesByTypeAndRole)
	write.PUT("/devices/:device/update", handlers.UpdateDevice)
	write.PUT("/devices/update", handlers.UpdateMultipleDevices)
	write.GET("/devices/:device/delete", handlers.DeleteDevice)
	read.GET("/devices/types", handlers.GetDeviceTypes)
	read.GET("/devices/roles", handlers.GetDeviceRoles)
	read.GET("/devices/:hostname/address", handlers.GetDeviceRawIPAddress)

	// UIConfig Endpoints
	write.POST("/uiconfigs/:config", handlers.AddUIConfig)
	write.POST("/uiconfigs", handlers.AddMultipleUIConfigs)
	read.GET("/uiconfigs/:config", handlers.GetUIConfig)
	read.GET("/uiconfigs", handlers.GetAllUIConfigs)
	write.PUT("/uiconfigs/:config/update", handlers.UpdateUIConfig)
	write.PUT("/uiconfigs/update", handlers.UpdateMultipleUIConfigs)
	write.GET("/uiconfigs/:config/delete", handlers.DeleteUIConfig)

	// Options Endpoints
	read.GET("/options/icons", handlers.GetIcons)
	read.GET("/options/templates", handlers.GetTemplates)

	// Auth Endpoints
	read.GET("/users/current/username", handlers.GetUsername)
	read.GET("/users/current/permissions", handlers.GetUserPermissions)

	// TODO: add alert endpoints...when I know what they are haha

	// Websocket Endpoints
	router.GET("/ws", socket.UpgradeToWebsocket(socket.GetManager()))

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}
