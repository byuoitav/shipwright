package cache

import (
	"encoding/json"
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"time"
	"unicode"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
)

var alertRegex *regexp.Regexp
var stringtype = reflect.TypeOf("")
var timetype = reflect.TypeOf(time.Now())
var booltype = reflect.TypeOf((*bool)(nil))
var inttype = reflect.TypeOf((*int)(nil))
var float64type = reflect.TypeOf((*float64)(nil))

func init() {
	alertRegex = regexp.MustCompile(`alerts\..+`)
}

func CheckCacheForEvent() {

}

/*
	SetDeviceField returns the new device, as well as a boolean denoting if the field was already set to the provided value.

	If passing in an alert, we assume that the value is a statdefinition.Alert.	Alerts are denoted by alert.<alertName>. Alerts always return true.

	NOTE: If in the code you can formulate a separate StaticDevice and compare it, defer to that approach, as the performance gain is quite significant.
*/
func SetDeviceField(key string, value interface{}, updateTime time.Time, t sd.StaticDevice) (bool, sd.StaticDevice, *nerr.E) {
	val := reflect.TypeOf(t)
	log.L.Debugf("Kind: %v", val.Kind())

	//check the update times case to see if we even need to proceed.
	v, ok := t.UpdateTimes[key]
	if ok {
		if v.After(updateTime) { //the current update is more recent
			log.L.Infof("Discarding update %v:%v for device %v as we have a more recent update", key, value, t.DeviceID)
			return false, t, nil
		}
	}

	/*
		Alert special case:

			We need to check key to see if it's an alert, if it is, we just check the type of alert, and assume that we're completely overhauling the whole subvalue.
			Assume that alert updates always result in an 'update'
	*/
	if alertRegex.MatchString(key) {
		v, ok := value.(sd.Alert)
		if !ok {
			return false, t, nerr.Create(fmt.Sprintf("Can't assign a non alert %v to alert value %v.", value, key), "format-error")
		}

		if t.Alerts == nil {
			t.Alerts = make(map[string]sd.Alert)
		}

		//take just the name following the '.' value
		s := strings.Split(key, ".")

		t.Alerts[s[1]] = v
		return true, t, nil
	}

	var strvalue string

	//we translate to a string as this is the default use (events coming from individual room's event systems), and it makes the rest of the code cleaner.
	switch value.(type) {
	case int:
		strvalue = fmt.Sprintf("%v", value)
	case *int:
		strvalue = fmt.Sprintf("%v", *(value.(*int)))
	case bool:
		strvalue = fmt.Sprintf("%v", value)
	case *bool:
		strvalue = fmt.Sprintf("%v", *(value.(*bool)))
	case float64:
		strvalue = fmt.Sprintf("%v", value)
	case *float64:
		strvalue = fmt.Sprintf("%v", *(value.(*float64)))
	case time.Time:
		strvalue = fmt.Sprintf("\"%v\"", value.(time.Time).Format(time.RFC3339Nano))
	case string:
		strvalue = value.(string)
	case sd.Alert:
		return false, t, nerr.Create(fmt.Sprintf("Unsupported type %v. Alerts may only be used in an alert field (alert.X", reflect.TypeOf(value)), "format-error")
	default:
		return false, t, nerr.Create(fmt.Sprintf("Unsupported type %v.", reflect.TypeOf(value)), "format-error")

	}

	for i := 0; i < val.NumField(); i++ {
		cur := val.Field(i)
		//log.L.Debugf("curType: %+v", cur)
		jsonTag := cur.Tag.Get("json")

		jsonTag = strings.Split(jsonTag, ",")[0] //remove the 'omitempty' if any
		if jsonTag == key {
			log.L.Debugf("Found: %+v", strvalue)
		} else {
			continue
		}

		curval := reflect.ValueOf(&t).Elem().Field(i)
		log.L.Debugf("Type: %v", curval.Type())

		if curval.CanSet() {
			//check for nil UpdateTimes map
			if t.UpdateTimes == nil {
				t.UpdateTimes = make(map[string]time.Time)
			}

			thistype := curval.Type()
			switch thistype {
			case stringtype:
				log.L.Debugf("string")
				var a string
				err := json.Unmarshal([]byte("\""+strvalue+"\""), &a)
				if err != nil {
					log.L.Debugf("ERROR: %v", err.Error())
					return false, t, nerr.Translate(err).Addf("Couldn't unmarshal strvalue %v into the field %v.", strvalue, key)
				}

				//update the time that it was 'last' set
				t.UpdateTimes[key] = updateTime

				prevValue := curval.Interface().(string)

				log.L.Debugf("PrevValue: %v, curValue: %v", prevValue, a)

				if a == prevValue {
					//no change
					return false, t, nil
				}

				//set it
				curval.SetString(a)
				return true, t, nil

			case timetype:
				log.L.Debugf("time")
				var a time.Time
				err := json.Unmarshal([]byte(strvalue), &a)
				if err != nil {
					return false, t, nerr.Translate(err).Addf("Couldn't unmarshal strvalue %v into the field %v.", strvalue, key)
				}

				//update the time that it was 'last' set
				t.UpdateTimes[key] = updateTime

				prevValue := curval.Interface().(time.Time)
				if prevValue.Equal(a) {
					//no change
					return false, t, nil
				}

				//set it
				curval.Set(reflect.ValueOf(a))
				return true, t, nil

			case booltype:
				log.L.Debugf("bool")
				var a bool
				err := json.Unmarshal([]byte(strvalue), &a)
				if err != nil {
					return false, t, nerr.Translate(err).Addf("Couldn't unmarshal strvalue %v into the field %v.", strvalue, key)
				}

				//update the time that it was 'last' set
				t.UpdateTimes[key] = updateTime

				prevValue := curval.Interface().(*bool)
				if prevValue != nil && *prevValue == a {
					//no change
					return false, t, nil
				}

				//set it
				curval.Set(reflect.ValueOf(&a))
				return true, t, nil

			case inttype:
				log.L.Debugf("int")
				var a int
				err := json.Unmarshal([]byte(strvalue), &a)
				if err != nil {
					log.L.Warnf("%+v", err)
					return false, t, nerr.Translate(err).Addf("Couldn't unmarshal strvalue %v into the field %v.", strvalue, key)
				}

				//update the time that it was 'last' set
				t.UpdateTimes[key] = updateTime

				prevValue := curval.Interface().(*int)
				if prevValue != nil && *prevValue == a {
					//no change
					return false, t, nil
				}

				//set it
				curval.Set(reflect.ValueOf(&a))

				return true, t, nil
			case float64type:
				log.L.Debugf("float64")
				var a float64
				err := json.Unmarshal([]byte(strvalue), &a)
				if err != nil {
					log.L.Warnf("%+v", err)
					return false, t, nerr.Translate(err).Addf("Couldn't unmarshal strvalue %v into the field %v.", strvalue, key)
				}

				//update the time that it was 'last' set
				t.UpdateTimes[key] = updateTime

				prevValue := curval.Interface().(*float64)
				if prevValue != nil && *prevValue == a {
					//no change
					return false, t, nil
				}

				//set it
				curval.Set(reflect.ValueOf(&a))

				return true, t, nil
			default:
				return false, t, nerr.Create(fmt.Sprintf("Field %v is an unsupported type %v", key, thistype), "unknown-type")
			}

		} else {
			return false, t, nerr.Create(fmt.Sprintf("There was a problem setting field %v, field is not settable", key), "field-error")
		}
	}

	//if we made it here, it means that the field isn't found
	return false, t, nerr.Create(fmt.Sprintf("Field %v isn't a valid field for a device.", key), "field-error")
}

func HasTag(toCheck string, tags []string) bool {
	for i := range tags {
		if toCheck == tags[i] {
			return true
		}
	}
	return false
}

var translationMap = map[string]string{
	"D":  "display",
	"CP": "control-processor",

	"DSP":   "digital-signal-processor",
	"PC":    "computer",
	"SW":    "video-switcher",
	"MICJK": "microphone-jack",
	"SP":    "scheduling-panel",
	"MIC":   "microphone",
	"DS":    "divider-sensor",
	"GW":    "gateway",
	"VIA":   "via",
	"HDMI":  "hdmi",
	"RX":    "receiver",
	"TX":    "transmitter",
	"RCV":   "microphone-reciever",
	"EN":    "encoder",
}

func GetDeviceTypeByID(id string) string {

	split := strings.Split(id, "-")
	if len(split) != 3 {
		log.L.Warnf("[dispatcher] Invalid hostname for device: %v", id)
		return ""
	}

	for pos, char := range split[2] {
		if unicode.IsDigit(char) {
			val, ok := translationMap[split[2][:pos]]
			if !ok {
				log.L.Warnf("Invalid device type: %v", split[2][:pos])
				return ""
			}
			return val
		}
	}

	log.L.Warnf("no valid translation for :%v", split[2])
	return ""
}
