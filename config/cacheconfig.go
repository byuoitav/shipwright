package config

//Cache .
type Cache struct {
	Name        string     `json:"name"`
	StorageType string     `json:"storage-type"`
	CacheType   string     `json:"cache-type"`
	CouchInfo   CouchCache `json:"couch-cache"`
	ELKinfo     ElkCache   `json:"elk-cache"`
}

//CouchCache .
type CouchCache struct {
	DatabaseName string `json:"database-name"`
	URL          string `json:"url"`
}

//ElkCache .
type ElkCache struct {
	DeviceIndex string `json:"device-index"`
	URL         string `json:"url"`
}
