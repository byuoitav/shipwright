package alertcache

import (
	"bytes"
	"encoding/gob"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	aconfig "github.com/byuoitav/shipwright/alertstore/config"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/state/cache/rediscache"
	"github.com/go-redis/redis"
)

type RedisAlertCache struct {
	c *redis.Client

	config aconfig.CacheConfig
}

func getRedisAlertCache(c aconfig.CacheConfig) AlertCache {

	pass := config.ReplaceEnv(c.Redis.Password)
	addr := config.ReplaceEnv(c.Redis.URL)
	if addr == "" {
		addr = "localhost:6379"
	}

	log.L.Debugf("Database number: %v", c.Redis)
	toReturn := &RedisAlertCache{
		config: c,
		c: redis.NewClient(&redis.Options{
			Addr:     addr,
			Password: pass,
			DB:       c.Redis.Database,
		}),
	}
	_, err := toReturn.c.Ping().Result()
	if err != nil {
		log.L.Fatalf("Can't communicate with redis cache: %v", err.Error())
	}

	return toReturn
}

func init() {
	gob.Register(structs.RoomIssue{})
}

func (r *RedisAlertCache) GetIssue(id string) (structs.RoomIssue, *nerr.E) {
	log.L.Debugf("getting alert %v from redis cache", id)
	var tmp structs.RoomIssue

	by, err := r.c.Get(id).Bytes()
	if err == redis.Nil {
		return tmp, nerr.Create("alert not found", NotFound)
	} else if err != nil {
		log.L.Errorf("Error accessing redis cache: %v", err.Error())
		return tmp, nerr.Translate(err).Addf("Couldn't access redis cache")
	} else {
		buf := bytes.NewBuffer(by)
		dec := gob.NewDecoder(buf)

		err = dec.Decode(&tmp)
		if err != nil {
			log.L.Errorf("Error decoding device from cache record: %v", err.Error())
			return tmp, nerr.Translate(err).Addf("Bad data in redis cluster: %s: %s", err.Error(), by)
		}
	}
	log.L.Debugf("retrieved alert %v from redis cache", id)

	return tmp, nil

}

func (r *RedisAlertCache) PutIssue(a structs.RoomIssue) *nerr.E {
	log.L.Debugf("Putting issue %v to redis cache", a.RoomIssueID)

	var al bytes.Buffer
	enc := gob.NewEncoder(&al)
	err := enc.Encode(a)
	if err != nil {
		log.L.Errorf("%v", err.Error())
		return nerr.Translate(err).Addf("Couldn't put issue in redis cache: Couldn't encode alert: %v", err.Error())
	}

	err = r.c.Set(a.RoomIssueID, al.Bytes(), 0).Err()
	if err != nil {
		return nerr.Translate(err).Addf("Couldn't put issue in reids cache: Couldn't access redis cache")
	}

	log.L.Debugf("added issue %v to redis cache", a.RoomIssueID)

	return nil
}

func (r *RedisAlertCache) DeleteIssue(id string) *nerr.E {
	log.L.Debugf("Deleting issue %v from cache", id)

	err := r.c.Del(id).Err()
	if err != nil {
		return nerr.Translate(err).Addf("Couldn't delete Issue from redis cache")
	}
	return nil
}

func (r *RedisAlertCache) GetAllIssues() ([]structs.RoomIssue, *nerr.E) {
	var toReturn []structs.RoomIssue

	keys, err := rediscache.GetAllKeys(r.c)
	if err != nil {
		return toReturn, err.Addf("couldn't get all room issues")
	}

	if len(keys) < 1 {
		return toReturn, nil
	}

	result, er := r.c.MGet(keys...).Result()
	if er != nil {
		return toReturn, nerr.Translate(er).Addf("Couldn't get all room issues")
	}

	for i := range result {
		var tmp structs.RoomIssue
		buf := bytes.NewBuffer([]byte(result[i].(string)))
		dec := gob.NewDecoder(buf)
		er = dec.Decode(&tmp)

		if er != nil {
			log.L.Debugf("Discarding event: %v. It was probably an index", result[i].(string))
			continue
		}

		toReturn = append(toReturn, tmp)
	}

	log.L.Infof("Got %v issues from %v records", len(toReturn), len(result))

	return toReturn, nil
}
