package slack

//Attachment .
type Attachment struct {
	Fallback  string       `json:"fallback,omitempty"`
	Pretext   string       `json:"pretext,omitempty"`
	Title     string       `json:"title,omitempty"`
	TitleLink string       `json:"title_link,omitempty"`
	Text      string       `json:"text,omitempty"`
	Color     string       `json:"color,omitempty"`
	Fields    []AlertField `json:"fields,omitempty"`
}

//AlertField .
type AlertField struct {
	Title string `json:"title,omitemtpy"`
	Value string `json:"value,omitemtpy"`
	Short bool   `json:"short,omitemtpy"`
}

type alert struct {
	Attachments []Attachment `json:"attachments,omitempty"`
	Markdown    bool         `json:"mrkdwn"`
	Text        string       `json:"text,omitempty"`
}
