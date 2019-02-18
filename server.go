package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/byuoitav/central-event-system/hub/base"
	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/v2/auth"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/couch"
	"github.com/byuoitav/shipwright/state/roomsync"
	"github.com/labstack/echo"

	// imported to initialize the list of then's
	_ "github.com/byuoitav/shipwright/actions/then/circular"
	"github.com/byuoitav/shipwright/alertstore"
	"github.com/byuoitav/shipwright/handlers"
	"github.com/byuoitav/shipwright/socket"
	figure "github.com/common-nighthawk/go-figure"
)

func main() {
	log.SetLevel("info")
	figure.NewFigure("SMEE", "univers", true).Print()

	err := resetConfig(context.Background())
	if err != nil {
		log.L.Fatalf(err.Error())
	}
	port := ":9999"
	router := common.NewRouter()

	go actions.DefaultActionManager().Start(context.TODO())
	alertstore.InitializeAlertStore(actions.DefaultActionManager())

	go roomsync.StartRoomSync(24*time.Hour, context.Background())

	// connect to the hub
	messenger, err := messenger.BuildMessenger(os.Getenv("HUB_ADDRESS"), base.Messenger, 5000)
	if err != nil {
		log.L.Fatalf("failed to build messenger: %s", err)
	}

	// get events from the hub
	go func() {
		messenger.SubscribeToRooms("*")

		for {
			processEvent(messenger.ReceiveEvent())
		}
	}()

	// get events from external sources
	router.POST("/event", func(ctx echo.Context) error {
		e := events.Event{}
		err := ctx.Bind(&e)
		if err != nil {
			return ctx.String(http.StatusBadRequest, err.Error())
		}

		processEvent(e)
		return ctx.String(http.StatusOK, "processing event")
	})

	write := router.Group("", auth.AuthorizeRequest("write-state", "room", auth.LookupResourceFromAddress))
	read := router.Group("", auth.AuthorizeRequest("read-state", "room", auth.LookupResourceFromAddress))

	router.POST("/test", handlers.Test)
	router.GET("/actions", actions.DefaultActionManager().Info)
	router.GET("/actions/trigger/:trigger", actions.DefaultActionManager().Config.ActionsByTrigger)

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

	// Static Record Endpoints
	read.GET("/static/devices", handlers.GetAllStaticDeviceRecords)
	read.GET("/static/rooms", handlers.GetAllStaticRoomRecords)

	// Alert Endpoints
	read.GET("/alerts", handlers.GetAllAlerts)
	read.PUT("/alerts/:alertID/resolve", handlers.ResolveAlert)
	write.PUT("/alerts/add", handlers.AddAlert)

	// Websocket Endpoints
	router.GET("/ws", socket.UpgradeToWebsocket(socket.GetManager()))

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}

func processEvent(event events.Event) {
	log.L.Debugf("Got event: %+v", event)

	actions.DefaultActionManager().EventStream <- event
}

func resetConfig(actionManagerCtx context.Context) *nerr.E {
	log.L.Infof("Reseting config for shipwright")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := couch.UpdateConfigFiles(ctx, "shipwright")
	if err != nil {
		return err.Addf("unable to reset config")
	}

	// then reset the action manager
	return nil
}
