package elk

type IDQuery struct {
	Query struct {
		IDS struct {
			Type   string   `json:"type"`
			Values []string `json:"values"`
		} `json:"ids"`
	} `json:"query"`
}
