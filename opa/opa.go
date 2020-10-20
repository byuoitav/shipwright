package opa

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/byuoitav/auth/middleware"
	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

type Client struct {
	URL   string
	Token string
}

type opaResponse struct {
	DecisionID string    `json:"decision_id"`
	Result     opaResult `json:"result"`
}

type opaResult struct {
	Allow bool `json:"allow"`
}

type opaRequest struct {
	Input requestData `json:"input"`
}

type requestData struct {
	APIKey string `json:"api_key"`
	User   string `json:"user"`
	Path   string `json:"path"`
	Method string `json:"method"`
}

func (client *Client) Authorize(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		// Initial data
		opaData := opaRequest{
			Input: requestData{
				Path:   c.Path(),
				Method: c.Request().Method,
			},
		}

		// use either the user netid for the authorization request or an
		// API key if one was used instead
		if user, ok := c.Request().Context().Value("user").(string); ok {
			opaData.Input.User = user
		} else if apiKey, ok := middleware.GetAVAPIKey(c.Request().Context()); ok {
			opaData.Input.APIKey = apiKey
		}

		// Prep the request
		oReq, err := json.Marshal(opaData)
		if err != nil {
			log.L.Errorf("Error trying to create request to OPA: %s\n", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Error while contacting authorization server")
		}

		req, err := http.NewRequest(
			"POST",
			fmt.Sprintf("%s/v1/data/shipwright", client.URL),
			bytes.NewReader(oReq),
		)
		req.Header.Set("authorization", fmt.Sprintf("Bearer %s", client.Token))

		// Make the request
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			log.L.Errorf("Error while making request to OPA: %s", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Error while contacting authorization server")
		}
		if res.StatusCode != http.StatusOK {
			log.L.Errorf("Got back non 200 status from OPA: %d", res.StatusCode)
			return echo.NewHTTPError(http.StatusInternalServerError, "Error while contacting authorization server")
		}

		// Read the body
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			log.L.Errorf("Unable to read body from OPA: %s", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Error while contacting authorization server")
		}

		// Unmarshal the body
		oRes := opaResponse{}
		err = json.Unmarshal(body, &oRes)
		if err != nil {
			log.L.Errorf("Unable to parse body from OPA: %s", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Error while contacting authorization server")
		}

		// If OPA approved then allow the request, else reject with a 403
		if oRes.Result.Allow {
			return next(c)
		} else {
			return echo.NewHTTPError(http.StatusForbidden, "Unauthorized")
		}
	}
}
