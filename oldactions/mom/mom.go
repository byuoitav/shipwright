package mom

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"reflect"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions/action"
)

var momAlertURL string

func init() {
	momAlertURL = os.Getenv("MOM_ALERT_URL")
}

type Action struct {
}

func (m *Action) Execute(a action.Payload) action.Result {
	if len(momAlertURL) == 0 {
		log.L.Fatalf("MOM_ALERT_URL not set.")
	}

	log.L.Infof("Executing mom action for %v", a.Device)

	result := action.Result{
		Payload: a,
	}

	var reqBody []byte
	var err error

	switch v := a.Content.(type) {
	case []byte:
		reqBody = v
	case Alert:
		reqBody, err = json.Marshal(v)
		if err != nil {
			result.Error = nerr.Translate(err).Addf("failed to unmarshal mom alert")
			return result
		}
	default:
		result.Error = nerr.Create("action content was not a mom alert.", reflect.TypeOf("").String())
		return result
	}

	// build the request
	req, err := http.NewRequest(http.MethodPost, momAlertURL, bytes.NewReader(reqBody))
	if err != nil {
		result.Error = nerr.Translate(err).Addf("failed to build mom action request")
		return result
	}
	req.Header.Add("content-type", "application/json")

	// execute the request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		result.Error = nerr.Translate(err).Addf("failed to send mom action")
		return result
	}
	defer resp.Body.Close()

	// read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		result.Error = nerr.Translate(err).Addf("unable to read response body after sending mom alert: %s", err)
		return result
	}

	// check response status code
	if resp.StatusCode/100 != 2 {
		result.Error = nerr.Create(fmt.Sprintf("non-200 response recieved (code: %v). body: %s", resp.StatusCode, body), reflect.TypeOf(resp).String())
		return result
	}

	log.L.Infof("Successfully send mom alert for %s", a.Device)
	return result
}
