package iff

import (
	"context"
	"sync"

	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/actions/iff/statequery"
)

type StateQuery struct {
	Query     string `json:"query"`
	CacheName string `json:"cache-name"` //one of the caches available from GetCache.
	DataType  string `json:"data-type"`  //one of the caches available from GetCache.

	initOnce sync.Once
	runner   statequery.QueryRunner
}

//StoreMatches doesn't expect anything in the context, but it will place the
func (s *StateQuery) StoreMatches(ctx context.Context) (bool, context.Context) {

	s.initOnce.Do(func() {
		s.runner = statequery.QueryRunner{
			Query:     s.Query,
			CacheName: s.CacheName,
			DataType:  s.DataType,
		}
	})

	devs, err := s.runner.Run()
	if err != nil {
		return false, ctx
	}

	ctx = actionctx.PutStaticDevices(ctx, devs...)

	return true, ctx
}
