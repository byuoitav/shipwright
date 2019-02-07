package iff

/*
type StateQuery struct {
	Query     string `json:"query"`
	CacheType string `json:"cache-type"` //one of the caches available from GetCache.

	initOnce sync.Once
	runner   QueryRunner
}

//StoreMatches doesn't expect anything in the context, but it will place the
func (s *StateQuery) StoreMatches(ctx context.Context) (bool, context.Contex) {
	initOnce.Do(func() {
		s.runner = statequery.QueryRunner{
			query:     Query,
			cacheType: CacheType,
			dataType:  dataType,
		}
	})

	devs, err := s.runner.Run()
	if err != nil {
		return false, ctx
	}
}
*/
