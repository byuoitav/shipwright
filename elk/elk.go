package elk

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
)

const (
	ALERTING_TRUE  = 1
	ALERTING_FALSE = 0
	POWER_STANDBY  = "standby"
	POWER_ON       = "on"
)

var (
	APIAddr  = os.Getenv("ELK_DIRECT_ADDRESS") // or should this be ELK_ADDR?
	username = os.Getenv("ELK_SA_USERNAME")
	password = os.Getenv("ELK_SA_PASSWORD")
)

//MakeGenericELLKRequest .
func MakeGenericELKRequest(addr, method string, body interface{}) ([]byte, *nerr.E) {
	log.L.Debugf("Making ELK request against: %s", addr)

	if len(username) == 0 || len(password) == 0 {
		log.L.Fatalf("ELK_SA_USERNAME, or ELK_SA_PASSWORD is not set.")
	}

	var reqBody []byte
	var err error

	// marshal request if not already an array of bytes
	switch v := body.(type) {
	case []byte:
		reqBody = v
	default:
		// marshal the request
		reqBody, err = json.Marshal(v)
		if err != nil {
			return []byte{}, nerr.Translate(err)
		}
	}

	// create the request
	req, err := http.NewRequest(method, addr, bytes.NewReader(reqBody))
	if err != nil {
		return []byte{}, nerr.Translate(err)
	}

	// add auth
	req.SetBasicAuth(username, password)

	// add headers
	if method == http.MethodPost || method == http.MethodPut {
		req.Header.Add("content-type", "application/json")
	}

	client := http.Client{
		Timeout: 3 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return []byte{}, nerr.Translate(err)
	}
	defer resp.Body.Close()

	// read the resp
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return []byte{}, nerr.Translate(err)
	}

	// check resp code
	if resp.StatusCode/100 != 2 {
		msg := fmt.Sprintf("non 200 reponse code received. code: %v, body: %s", resp.StatusCode, respBody)
		return respBody, nerr.Create(msg, http.StatusText(resp.StatusCode))
	}

	return respBody, nil

}

//MakeELKRequest .
func MakeELKRequest(method, endpoint string, body interface{}) ([]byte, *nerr.E) {
	if len(APIAddr) == 0 {
		log.L.Fatalf("ELK_DIRECT_ADDRESS is not set.")
	}

	// format whole address
	addr := fmt.Sprintf("%s%s", APIAddr, endpoint)
	return MakeGenericELKRequest(addr, method, body)
}
