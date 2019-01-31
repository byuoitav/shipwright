package jobs

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
)

// TODO add a way to kill each job that is currently running

var (
	// MaxWorkers is the max number of go routines that should be running jobs.
	MaxWorkers = os.Getenv("MAX_WORKERS")

	// MaxQueue is the maximum number of events/heartbeats that can be queued
	MaxQueue = os.Getenv("MAX_QUEUE")

	runners []*runner

	eventChan chan events.Event
)

type runner struct {
	Job          Job
	Config       config.JobConfig
	Trigger      config.Trigger
	TriggerIndex int
}

func init() {
	// set defaults for max workers/queue
	if len(MaxWorkers) == 0 {
		MaxWorkers = "15"
	}
	if len(MaxQueue) == 0 {
		MaxQueue = "2000"
	}

	// validate max workers/queue are valid numbers
	_, err := strconv.Atoi(MaxWorkers)
	if err != nil {
		log.L.Fatalf("$MAX_WORKERS must be a number")
	}
	_, err = strconv.Atoi(MaxQueue)
	if err != nil {
		log.L.Fatalf("$MAX_QUEUE must be a number")
	}

	// get path for scripts
	scriptPath := os.Getenv("JOB_SCRIPTS_PATH")
	if len(scriptPath) < 1 {
		scriptPath = "./scripts/" // default script path
	}

	c := config.GetConfig()

	// validate all jobs exist, create the script jobs
	for _, config := range c.Jobs {
		if !config.Enabled {
			continue
		}

		// check if job exists
		isValid := false
		for key := range Jobs {
			if strings.EqualFold(config.Type, key) {
				isValid = true
				break
			}
		}

		// if it isn't valid, and it's not autogenerating an action, then check if it's a valid script
		if !isValid {
			if _, err := os.Stat(scriptPath + config.Name); err != nil {
				log.L.Fatalf("job '%s' doesn't exist, and doesn't have a script that matches its name.", config.Name)
			}

			// add the job for this script to the jobs map
			Jobs[config.Name] = &ScriptJob{Path: scriptPath + config.Name}
		}

		// build a runner for each trigger
		for i, trigger := range config.Triggers {
			runner := &runner{
				Job:          Jobs[config.Type],
				Config:       config,
				Trigger:      trigger,
				TriggerIndex: i,
			}

			// build the regex if it's a match type
			if strings.EqualFold(runner.Trigger.Type, MatchType) {
				runner.Trigger.Match = runner.buildNewMatchRegex()
			}

			log.L.Infof("Adding runner for job '%v', trigger #%v. Execution type: %v", runner.Config.Name, runner.TriggerIndex, runner.Trigger.Type)
			runners = append(runners, runner)
		}
	}
}

//QueueStatus .
type QueueStatus struct {
	Cap  int
	Util int
}

//GetQueueSize .
func GetQueueSize() map[string]QueueStatus {
	toReturn := map[string]QueueStatus{}
	toReturn["eventChan"] = QueueStatus{
		Cap:  cap(eventChan),
		Util: len(eventChan),
	}

	return toReturn
}

// ProcessEvent adds the event into a queue to be processed
func ProcessEvent(event events.Event) {
	eventChan <- event
}

// StartJobScheduler starts workers to run jobs, defined in the config.json file.
func StartJobScheduler() {
	maxWorkers, _ := strconv.Atoi(MaxWorkers)
	maxQueue, _ := strconv.Atoi(MaxQueue)

	log.L.Infof("Starting job scheduler. Running %v jobs with %v workers with a max of %v events queued at once.", len(runners), maxWorkers, maxQueue)
	wg := sync.WaitGroup{}

	eventChan = make(chan events.Event, maxQueue)

	// start action managers
	go actions.StartActionManagers()

	// start runners
	var matchRunners []*runner
	for _, runner := range runners {
		switch runner.Trigger.Type {
		case "daily": // TODO change to "cron"
			go runner.runDaily()
		case "interval":
			go runner.runInterval()
		case MatchType:
			matchRunners = append(matchRunners, runner)
		default:
			log.L.Warnf("unknown trigger type '%v' for job %v|%v", runner.Trigger.Type, runner.Config.Name, runner.TriggerIndex)
		}
	}

	// start event workers
	for i := 0; i < maxWorkers; i++ {
		log.L.Debugf("Starting event worker %v", i)
		wg.Add(1)

		go func(workerNum int) {
			name := strconv.Itoa(workerNum)
			for {
				select {
				case event := <-eventChan:
					// see if we need to execute any jobs from this event
					for i := range matchRunners {
						if matchRunners[i].Trigger.Match.DoesEventMatch(&event) {
							matchRunners[i].run(&event, name)
						}
					}
				}
			}
		}(i)
	}

	wg.Wait()
}

func (r *runner) run(context interface{}, id string) {
	log.L.Debugf("[%s|%v|%v] Running job... Context: %v\n", r.Config.Name, r.TriggerIndex, id, context)

	actionChan := make(chan action.Payload, 50)

	go func() {
		for action := range actionChan {
			actions.Execute(action)
		}
	}()

	//we build our input config
	InputConfig := config.JobInputContext{
		Context:     context,
		InputConfig: r.Config.JobInputConfig,
		Action:      r.Config.Action,
	}

	r.Job.Run(InputConfig, actionChan)
	close(actionChan)

	log.L.Debugf("[%s|%v] Finished.\n", r.Config.Name, r.TriggerIndex)
}

func (r *runner) runDaily() {
	tmpDate := fmt.Sprintf("2006-01-02T%s", r.Trigger.At)
	runTime, err := time.Parse(time.RFC3339, tmpDate)
	runTime = runTime.UTC()
	if err != nil {
		log.L.Warnf("unable to parse time '%s' to execute job %s daily. error: %s", r.Trigger.At, r.Config.Name, err)
		return
	}

	log.L.Infof("[%s|%v] Running daily at %s", r.Config.Name, r.TriggerIndex, runTime.Format("15:04:05 MST"))

	// figure out how long until next run
	now := time.Now()
	until := time.Until(time.Date(now.Year(), now.Month(), now.Day(), runTime.Hour(), runTime.Minute(), runTime.Second(), 0, runTime.Location()))
	if until < 0 {
		until = 24*time.Hour + until
	}

	log.L.Debugf("[%s|%v] Time to next run: %v", r.Config.Name, r.TriggerIndex, until)
	timer := time.NewTimer(until)

	for {
		<-timer.C
		r.run(nil, "timer")

		timer.Reset(24 * time.Hour)
	}
}

func (r *runner) runInterval() {
	interval, err := time.ParseDuration(r.Trigger.Every)
	if err != nil {
		log.L.Warnf("unable to parse duration '%s' to execute job %s on an interval. error: %s", r.Trigger.Every, r.Config.Name, err)
		return
	}

	log.L.Infof("[%s|%v] Running every %v", r.Config.Name, r.TriggerIndex, interval)

	ticker := time.NewTicker(interval)
	for range ticker.C {
		r.run(nil, "ticker")
	}
}
