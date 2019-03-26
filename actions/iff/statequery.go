package iff

import (
	"context"
	"sync"

	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/actions/iff/statequery"
)

type StateQuery struct {
	Query     string `json:"query"`
	CacheName string `json:"cache-name"` //cache-name
	DataType  string `json:"data-type"`  //reserved for future use

	initOnce sync.Once
	runner   statequery.QueryRunner
}

//CheckStore doesn't expect anything in the context, but it will place the
func (s *StateQuery) CheckStore(ctx context.Context) (bool, context.Context) {
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

	if len(devs) > 0 {
		ctx = actionctx.PutStaticDevices(ctx, devs)

		return true, ctx
	}

	return false, ctx
}
