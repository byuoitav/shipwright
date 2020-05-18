package main

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/byuoitav/auth/wso2"
	"github.com/byuoitav/central-event-system/hub/base"
	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/alertstore"
	"github.com/byuoitav/shipwright/couch"
	"github.com/byuoitav/shipwright/opa"
	"github.com/byuoitav/shipwright/state/roomsync"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/spf13/pflag"

	// imported to initialize the list of then's
	_ "github.com/byuoitav/shipwright/actions/then/circular"
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
	var opaURL string
	var opaToken string
	var disableAuth bool

	pflag.StringVar(&opaURL, "opa-url", "", "the URL for the OPA server to be used for authz")
	pflag.StringVar(&opaToken, "opa-token", "", "the token to use for calls to OPA")
	pflag.BoolVar(&disableAuth, "disable-auth", false, "disables authz/n checks")
	pflag.Parse()

	figure.NewFigure("SMEE", "univers", true).Print()

	port := ":80"
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

	client := wso2.Client{
		CallbackURL:  os.Getenv("CALLBACK_URL"),
		ClientID:     os.Getenv("CLIENT_ID"),
		ClientSecret: os.Getenv("CLIENT_SECRET"),
		GatewayURL:   os.Getenv("GATEWAY_URL"),
	}

	authRouter := router.Group("")
	o := opa.Client{
		URL:   opaURL,
		Token: opaToken,
	}

	if !disableAuth {
		if o.URL == "" {
			log.L.Errorf("No OPA URL was set, but authz has not been disabled")
			os.Exit(1)
		}

		authRouter.Use(echo.WrapMiddleware(client.AuthCodeMiddleware))
		authRouter.Use(o.Authorize)
	}

	router.GET("/actions", actions.DefaultActionManager().Info)
	router.GET("/actions/trigger/:trigger", actions.DefaultActionManager().Config.ActionsByTrigger)

	// Building Endpoints
	authRouter.POST("/buildings/:building", handlers.AddBuilding)
	authRouter.POST("/buildings", handlers.AddMultipleBuildings)
	authRouter.GET("/buildings/:building", handlers.GetBuilding)
	authRouter.GET("/buildings", handlers.GetAllBuildings)
	authRouter.PUT("/buildings/:building/update", handlers.UpdateBuilding)
	authRouter.PUT("/buildings/update", handlers.UpdateMultipleBuildings)
	authRouter.GET("/buildings/:building/delete", handlers.DeleteBuilding)

	// Room Endpoints
	authRouter.POST("/rooms/:room", handlers.AddRoom)
	authRouter.POST("/rooms", handlers.AddMultipleRooms)
	authRouter.GET("/rooms/:room", handlers.GetRoom)
	authRouter.GET("/rooms", handlers.GetAllRooms)
	authRouter.GET("/buildings/:building/rooms", handlers.GetRoomsByBuilding)
	authRouter.PUT("/rooms/:room/update", handlers.UpdateRoom)
	authRouter.PUT("/rooms/update", handlers.UpdateMultipleRooms)
	authRouter.GET("/rooms/:room/delete", handlers.DeleteRoom)
	authRouter.GET("/rooms/configurations", handlers.GetRoomConfigurations)
	authRouter.GET("/rooms/designations", handlers.GetRoomDesignations)
	authRouter.GET("/rooms/:roomID/schedule", handlers.GetRoomClassSchedule)

	authRouter.DELETE("/rooms/:roomID/nuke", handlers.NukeRoom)

	// Device Endpoints
	authRouter.POST("/devices/:device", handlers.AddDevice)
	authRouter.POST("/devices", handlers.AddMultipleDevices)
	authRouter.GET("/devices/:device", handlers.GetDevice)
	authRouter.GET("/devices", handlers.GetAllDevices)
	authRouter.GET("/rooms/:room/devices", handlers.GetDevicesByRoom)
	authRouter.GET("/rooms/:room/devices/roles/:role", handlers.GetDevicesByRoomAndRole)
	authRouter.GET("/devices/types/:type/roles/:role", handlers.GetDevicesByTypeAndRole)
	authRouter.PUT("/devices/:device/update", handlers.UpdateDevice)
	authRouter.PUT("/devices/update", handlers.UpdateMultipleDevices)
	authRouter.GET("/devices/:device/delete", handlers.DeleteDevice)
	authRouter.GET("/devices/types", handlers.GetDeviceTypes)
	authRouter.GET("/devices/roles", handlers.GetDeviceRoles)
	authRouter.GET("/devices/:hostname/address", handlers.GetDeviceRawIPAddress)

	// UIConfig Endpoints
	authRouter.POST("/uiconfigs/:config", handlers.AddUIConfig)
	authRouter.POST("/uiconfigs", handlers.AddMultipleUIConfigs)
	authRouter.GET("/uiconfigs/:config", handlers.GetUIConfig)
	authRouter.GET("/uiconfigs", handlers.GetAllUIConfigs)
	authRouter.PUT("/uiconfigs/:config/update", handlers.UpdateUIConfig)
	authRouter.PUT("/uiconfigs/update", handlers.UpdateMultipleUIConfigs)
	authRouter.GET("/uiconfigs/:config/delete", handlers.DeleteUIConfig)

	// Options Endpoints
	authRouter.GET("/options/icons", handlers.GetIcons)
	authRouter.GET("/options/templates", handlers.GetTemplates)
	authRouter.GET("/options/menutree", handlers.GetMenuTree)

	// Attributes Endpoints
	authRouter.GET("/attributes", handlers.GetAllAttributeGroups)
	authRouter.GET("/attributes/:groupID", handlers.GetAttributeGroup)

	// Auth Endpoints
	authRouter.GET("/users/current/username", handlers.GetUsername)
	authRouter.GET("/users/current/permissions", handlers.GetUserPermissions)

	// Static Record Endpoints
	authRouter.GET("/static/devices", handlers.GetAllStaticDeviceRecords)
	authRouter.GET("/static/devices/:device", handlers.GetStaticDeviceRecord)
	authRouter.GET("/static/rooms", handlers.GetAllStaticRoomRecords)
	authRouter.GET("/static/rooms/state", handlers.GetAllRoomCombinedStateRecords)
	authRouter.GET("/static/rooms/:room/state", handlers.GetRoomCombinedStateRecord)
	authRouter.PUT("/static/rooms/:room/maintenance", handlers.UpdateStaticRoom)

	// Alert Endpoints
	authRouter.GET("/issues", handlers.GetAllRoomIssues)
	authRouter.PUT("/issues", handlers.UpdateRoomIssue)

	authRouter.PUT("/issues/:issueID/resolve", handlers.ResolveIssue)
	authRouter.GET("/issues/:issueID", handlers.GetRoomIssue)

	authRouter.GET("/issues/resolutions", handlers.GetClosureCodes)

	authRouter.GET("/issues/queue", handlers.GetAlertStoreQueueStatus)

	authRouter.PUT("/alerts/add", handlers.AddAlert)

	authRouter.GET("/alerts/responders", handlers.GetResponders)

	// Websocket Endpoints
	router.GET("/ws", socket.UpgradeToWebsocket(socket.GetManager()))

	router.Group("",
		echo.WrapMiddleware(client.AuthCodeMiddleware),
		o.Authorize,
		middleware.StaticWithConfig(middleware.StaticConfig{
			Root:   "web-dist",
			Index:  "index.html",
			HTML5:  true,
			Browse: true,
		}))

	router.GET("/healthz", func(c echo.Context) error {
		return c.String(http.StatusOK, "Everything's Ship-Shape!")
	})

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
