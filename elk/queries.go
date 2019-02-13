package elk

type IDQuery struct {
	Query struct {
		IDS struct {
			Type   string   `json:"type"`
			Values []string `json:"values"`
		} `json:"ids"`
	} `json:"query"`
}
type AllQuery struct {
	Query struct {
		MatchAll map[string]interface{} `json:"match_all"`
	} `json:"query"`
}
