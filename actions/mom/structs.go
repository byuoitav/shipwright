package mom

type Alert struct {
	Host        string `json:"host"`
	Address     string `json:"address"`
	Element     string `json:"elem"`
	Severity    int    `json:"severity"`
	AlertOutput string `json:"alert_output"`
	AlertTime   string `json:"alert_time"`
	Service     string `json:"service"`
	KB          string `json:"kb"`
	Ticket      string `json:"ticket"`
}
