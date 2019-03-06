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
	"github.com/labstack/echo/middleware"

	// imported to initialize the list of then's
	_ "github.com/byuoitav/shipwright/actions/then/circular"
	"github.com/byuoitav/shipwright/alertstore"
	"github.com/byuoitav/shipwright/handlers"
	"github.com/byuoitav/shipwright/socket"
	figure "github.com/common-nighthawk/go-figure"
)

func init() {
	if os.Getenv("NO_PULL") == "" {
		err := resetConfig(context.Background())
		if err != nil {
			log.L.Fatalf(err.Error())
		}
	}
}

func main() {
	log.SetLevel("info")
	figure.NewFigure("SMEE", "univers", true).Print()

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

	writeconfig := router.Group(
		"",
		auth.CheckHeaderBasedAuth,
		echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("write-config", "configuration", func(c echo.Context) string { return "all" }),
	)
	readconfig := router.Group(
		"",
		auth.CheckHeaderBasedAuth,
		echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("read-config", "configuration", func(c echo.Context) string { return "all" }),
	)
	/*
		writestate := router.Group(
			"",
			auth.CheckHeaderBasedAuth,
			echo.WrapMiddleware(auth.AuthenticateCASUser),
			auth.AuthorizeRequest("write-state", "configuration", func(c echo.Context) string { return "all" }),
		)
		readstate := router.Group(
			"",
			auth.CheckHeaderBasedAuth,
			echo.WrapMiddleware(auth.AuthenticateCASUser),
			auth.AuthorizeRequest("read-state", "configuration", func(c echo.Context) string { return "all" }),
		)
	*/

	router.POST("/test", handlers.Test)
	router.GET("/actions", actions.DefaultActionManager().Info)
	router.GET("/actions/trigger/:trigger", actions.DefaultActionManager().Config.ActionsByTrigger)

	// Building Endpoints
	writeconfig.POST("/buildings/:building", handlers.AddBuilding)
	writeconfig.POST("/buildings", handlers.AddMultipleBuildings)
	readconfig.GET("/buildings/:building", handlers.GetBuilding)
	readconfig.GET("/buildings", handlers.GetAllBuildings)
	writeconfig.PUT("/buildings/:building/update", handlers.UpdateBuilding)
	writeconfig.PUT("/buildings/update", handlers.UpdateMultipleBuildings)
	writeconfig.GET("/buildings/:building/delete", handlers.DeleteBuilding)

	// Room Endpoints
	writeconfig.POST("/rooms/:room", handlers.AddRoom)
	writeconfig.POST("/rooms", handlers.AddMultipleRooms)
	readconfig.GET("/rooms/:room", handlers.GetRoom)
	readconfig.GET("/rooms", handlers.GetAllRooms)
	readconfig.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	writeconfig.PUT("/rooms/:room/update", handlers.UpdateRoom)
	writeconfig.PUT("/rooms/update", handlers.UpdateMultipleRooms)
	writeconfig.GET("/rooms/:room/delete", handlers.DeleteRoom)
	readconfig.GET("/rooms/configurations", handlers.GetRoomConfigurations)
	readconfig.GET("/rooms/designations", handlers.GetRoomDesignations)

	// Device Endpoints
	writeconfig.POST("/devices/:device", handlers.AddDevice)
	writeconfig.POST("/devices", handlers.AddMultipleDevices)
	readconfig.GET("/devices/:device", handlers.GetDevice)
	readconfig.GET("/devices", handlers.GetAllDevices)
	readconfig.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	readconfig.GET("/rooms/:room/devices/roles/:role", handlers.GetDevicesByRoomAndRole)
	readconfig.GET("/devices/types/:type/roles/:role", handlers.GetDevicesByTypeAndRole)
	writeconfig.PUT("/devices/:device/update", handlers.UpdateDevice)
	writeconfig.PUT("/devices/update", handlers.UpdateMultipleDevices)
	writeconfig.GET("/devices/:device/delete", handlers.DeleteDevice)
	readconfig.GET("/devices/types", handlers.GetDeviceTypes)
	readconfig.GET("/devices/roles", handlers.GetDeviceRoles)
	readconfig.GET("/devices/:hostname/address", handlers.GetDeviceRawIPAddress)

	// UIConfig Endpoints
	writeconfig.POST("/uiconfigs/:config", handlers.AddUIConfig)
	writeconfig.POST("/uiconfigs", handlers.AddMultipleUIConfigs)
	readconfig.GET("/uiconfigs/:config", handlers.GetUIConfig)
	readconfig.GET("/uiconfigs", handlers.GetAllUIConfigs)
	writeconfig.PUT("/uiconfigs/:config/update", handlers.UpdateUIConfig)
	writeconfig.PUT("/uiconfigs/update", handlers.UpdateMultipleUIConfigs)
	writeconfig.GET("/uiconfigs/:config/delete", handlers.DeleteUIConfig)

	// Options Endpoints
	readconfig.GET("/options/icons", handlers.GetIcons)
	readconfig.GET("/options/templates", handlers.GetTemplates)

	// Auth Endpoints
	readconfig.GET("/users/current/username", handlers.GetUsername)
	readconfig.GET("/users/current/permissions", handlers.GetUserPermissions)

	// Static Record Endpoints
	readconfig.GET("/static/devices", handlers.GetAllStaticDeviceRecords)
	readconfig.GET("/static/rooms", handlers.GetAllStaticRoomRecords)
	readconfig.GET("/static/rooms/state", handlers.GetAllRoomCombinedStateRecords)
	readconfig.GET("/static/rooms/:roomID/state", handlers.GetRoomCombinedStateRecord)

	// Alert Endpoints
	readconfig.GET("/issues", handlers.GetAllRoomIssues)
	readconfig.PUT("/issues", handlers.UpdateRoomIssue)

	readconfig.PUT("/issues/:issueID/resolve", handlers.ResolveIssue)
	readconfig.GET("/issues/:issueID", handlers.GetRoomIssue)

	readconfig.GET("/issues/resolutions", handlers.GetClosureCodes)

	router.GET("/issues/queue", handlers.GetAlertStoreQueueStatus)

	writeconfig.PUT("/alerts/add", handlers.AddAlert)

	readconfig.GET("/alerts/responders", handlers.GetResponders)

	// Websocket Endpoints
	router.GET("/ws", socket.UpgradeToWebsocket(socket.GetManager()))

	router.Group("/", auth.CheckHeaderBasedAuth,
		auth.CheckHeaderBasedAuth,
		echo.WrapMiddleware(auth.AuthenticateCASUser),
		auth.AuthorizeRequest("read-config", "configuration", func(c echo.Context) string { return "all" }),
		middleware.StaticWithConfig(middleware.StaticConfig{
			Root:   "web-dist",
			Index:  "index.html",
			HTML5:  true,
			Browse: true,
		}))

	server := http.Server{
		Addr:           port,
		MaxHeaderBytes: 1024 * 10,
	}

	router.StartServer(&server)
}

func processEvent(event events.Event) {
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
