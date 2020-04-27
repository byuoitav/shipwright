package alertcache

import (
	"sync"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

type MemoryAlertCache struct {
	m *sync.Map
}

func (c *MemoryAlertCache) GetIssue(id string) (structs.RoomIssue, *nerr.E) {
	issue, ok := c.m.Load(id)
	if !ok {
		return structs.RoomIssue{}, nerr.Create("alert not found", NotFound)
	}

	return issue.(structs.RoomIssue), nil
}

func (c *MemoryAlertCache) GetAllIssues() ([]structs.RoomIssue, *nerr.E) {
	var issues []structs.RoomIssue

	c.m.Range(func(k, v interface{}) bool {
		issues = append(issues, v.(structs.RoomIssue))
		return true
	})

	return issues, nil
}

func (c *MemoryAlertCache) PutIssue(issue structs.RoomIssue) *nerr.E {
	c.m.Store(issue.RoomIssueID, issue)
	return nil
}

func (c *MemoryAlertCache) DeleteIssue(id string) *nerr.E {
	c.m.Delete(id)
	return nil
}
