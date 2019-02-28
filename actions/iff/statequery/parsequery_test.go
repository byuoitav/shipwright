package statequery

import (
	"fmt"
	"testing"
	"time"

	"github.com/awalterschulze/gographviz"
	"github.com/byuoitav/common/log"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/stretchr/testify/assert"
)

func TestTokenize(t *testing.T) {
	str := `"a" != "b" || ((("a"=="b" && "b"=="c")||("c"!="d" || "d"=="e")) && ("f"!="g"))`

	vals, err := getTokens(str)
	if err != nil {
		t.Error(err.Error())
		t.FailNow()
	}
	for _, i := range vals {
		log.L.Infof("%v", i)
	}
}

func TestNodeGeneration(t *testing.T) {
	log.SetLevel("debug")

	str := `"a" != "b" || ((("a"=="b" && "b"=="c")||("c"!="d" || "d"=="e")) && "f"!="g")`
	//str := `"a" != "b"`

	vals, err := ParseQuery(str)
	if err != nil {
		t.Error(err.Error())
		t.FailNow()
	}
	log.L.Debugf("%+v", vals)

	//build our .dot format for the file
	g := gographviz.NewGraph()
	if err := g.SetName("query"); err != nil {
		panic(err)
	}

	cur := vals
	for cur != nil {
		fmt.Printf("%v\n", cur.ID)
		cur = cur.RightChild
	}

	BuildGraph(vals, g)

	fmt.Println(g.String())

}

func BuildGraph(n *QueryNode, g *gographviz.Graph) {

	//check to see if this node, has any parents, if not, add it to the graph
	if n.ParentNode == nil {
		if n.Left == "" {
			name := fmt.Sprintf("%v-%v", n.ID, n.Value)
			if err := g.AddNode("query", fmt.Sprintf("%v", n.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
				panic(err)
			}
		} else {
			name := fmt.Sprintf("%v-%s%s%s", n.ID, n.Left, n.Value, n.Right)
			if err := g.AddNode("query", fmt.Sprintf("%v", n.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
				panic(err)
			}
		}
	}

	//check to see if it has any children, if not, return
	if n.LeftChild == nil {
		return
	}

	//there are children, add them and then add the edge to each of them, and then recurse into them
	if n.LeftChild.Left != "" {
		name := fmt.Sprintf("%v-%v%v%v", n.LeftChild.ID, n.LeftChild.Left, n.LeftChild.Value, n.LeftChild.Right)
		if err := g.AddNode("query", fmt.Sprintf("%v", n.LeftChild.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
			panic(err)
		}
	} else {
		name := string(n.LeftChild.ID) + n.LeftChild.Value
		if err := g.AddNode("query", fmt.Sprintf("%v", n.LeftChild.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
			panic(err)
		}
	}
	if err := g.AddEdge(fmt.Sprintf("%v", n.ID), fmt.Sprintf("%v", n.LeftChild.ID), false, nil); err != nil {
		panic(err)
	}
	BuildGraph(n.LeftChild, g)

	//there are children, add them and then add the edge to each of them, and then recurse into them
	if n.RightChild.Left != "" {
		name := fmt.Sprintf("%v-%v%v%v", n.RightChild.ID, n.RightChild.Left, n.RightChild.Value, n.RightChild.Right)
		if err := g.AddNode("query", fmt.Sprintf("%v", n.RightChild.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
			panic(err)
		}
	} else {
		name := string(n.RightChild.ID) + n.RightChild.Value
		if err := g.AddNode("query", fmt.Sprintf("%v", n.RightChild.ID), map[string]string{"label": fmt.Sprintf("\"%v\"", name)}); err != nil {
			panic(err)
		}
	}
	if err := g.AddEdge(fmt.Sprintf("%v", n.ID), fmt.Sprintf("%v", n.RightChild.ID), false, nil); err != nil {
		panic(err)
	}
	BuildGraph(n.RightChild, g)

	return
}

type TestStruct struct {
	A string
	B string
	C time.Time
	D *int
	E *bool
}

func TestCompareQueryStructs(t *testing.T) {
	tmpint := 1
	tmptrue := true
	/*
		tmptime, err := time.Parse(time.RFC3339, "2018-11-01T22:08:41+00:00")
		if err != nil {
			panic(err)
		}
	*/

	a := TestStruct{
		A: "a",
		B: "b",
		C: time.Now(),
		D: &tmpint,
		E: &tmptrue,
	}
	as := assert.New(t)

	//
	val, er := ParseQuery(`"A" == "b" || "B" == "b"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er := val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"A" == "a"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"A" == "b" || "B" == "a"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	as.False(v)
	fmt.Printf("Answer %v\n", v)

	val, er = ParseQuery(`"A" == "a" && "B" == "a"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"A" == "a" && "B" == "b"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"C" > "-15m"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"C" < "-15m"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"D" > "-29"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"D" < "29"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"D" == "29"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"D" != "29"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"D" > "29"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"D" < "-9"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"E" == "true"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"E" != "false"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	val, er = ParseQuery(`"E" == "false"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	val, er = ParseQuery(`"E" == "false" || ((( "A" == "b" && "B" == "b") || ("C" > "-15m" || "A" == "b")) && "E" != "true"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)
	val, er = ParseQuery(`"E" == "false" || ((( "A" == "b" && "B" == "b") || ("C" > "-15m" || "A" == "b")) && "E" != "false"`)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}

	v, er = val.Evaluate(a)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

}

func TestTimeQuery(t *testing.T) {

	as := assert.New(t)

	val, err := ParseQuery(`'DeviceID' == 'JOE-TEST-CP1' && 'Interference' == '' && 'UpdateTimes.interference' < '-3m'`)
	if err != nil {
		t.Error(err.Error())
		t.FailNow()
	}

	TestDevice := sd.StaticDevice{
		DeviceID:     "JOE-TEST-CP1",
		Interference: "",
		UpdateTimes: map[string]time.Time{
			"interference": time.Now().Add(-3*time.Minute - 30*time.Second),
		},
	}

	v, er := val.Evaluate(TestDevice)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.True(v)

	TestDevice1 := sd.StaticDevice{
		DeviceID:     "JOE-TEST-CP1",
		Interference: "",
		UpdateTimes: map[string]time.Time{
			"interference": time.Now().Add(-1 * time.Minute),
		},
	}

	v, er = val.Evaluate(TestDevice1)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)

	TestDevice2 := sd.StaticDevice{
		DeviceID: "JOE-TEST-CP1",
		UpdateTimes: map[string]time.Time{
			"interference": time.Now().Add(-5 * time.Minute),
		},
		Interference: "blah",
	}

	v, er = val.Evaluate(TestDevice2)
	if er != nil {
		t.Error(er.Error())
		t.FailNow()
	}
	fmt.Printf("Answer %v\n", v)
	as.False(v)
}
