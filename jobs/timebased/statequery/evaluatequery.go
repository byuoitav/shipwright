package statequery

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	reflections "gopkg.in/oleiade/reflections.v1"
)

var timeRe *regexp.Regexp

//Evaluate evaluates the static devices against this node and it's subnodes
func (q *QueryNode) Evaluate(i interface{}) (bool, *nerr.E) {

	//check to see if I'm a leaf node
	if q.Operator == OPERATOR {
		return q.compareFields(i)
	}

	var l, r bool
	var err *nerr.E
	//check to see if it has children
	if q.LeftChild != nil {
		l, err = q.LeftChild.Evaluate(i)
		if err != nil {
			return false, err.Addf("Couldn't Evaluate node %v", q.ID)
		}
	}
	if q.RightChild != nil {
		r, err = q.RightChild.Evaluate(i)
		if err != nil {
			return false, err.Addf("Couldn't Evaluate node %v", q.ID)
		}
	}

	switch q.Operator {
	case OR:
		return l || r, nil
	case AND:
		return l && r, nil
	case NOT:
		return !l, nil
	}

	return false, nerr.Create(fmt.Sprintf("Invalid node %v", q), "invalid-node")
}

func (q *QueryNode) compareFields(in interface{}) (bool, *nerr.E) {
	//assume it's a leaf node
	//Assume the right value corresponds to a field name in the struct
	splitName := strings.Split(q.Left, ".")
	var curstruct interface{}
	var err error

	curstruct = in
	for i := 0; i < len(splitName); i++ {
		//it's a subfield, get the subfield
		curstruct, err = reflections.GetField(curstruct, splitName[i])
		if err != nil {
			return false, nerr.Translate(err).Addf("Couldn't compare field %v with %v. %v", q.Left, q.Right, err.Error())
		}
	}

	//curstruct *should* be our field
	switch curstruct.(type) {
	case *int:
		structv, ok := curstruct.(*int)
		if !ok {
			log.L.Errorf("Can't cast. Weird problems are afoot.")

			return false, nerr.Create(fmt.Sprintf("Couldn't compare %v and %v. An error occurred extracting value from struct.", q.Right, q.Left), "invalid-comparison")
		}

		//cast right side value to an integer
		v, err := strconv.Atoi(q.Right)
		if err != nil {
			return false, nerr.Create(fmt.Sprintf("%v is not an integer, cannot compare to an integer field %v", q.Right, q.Left), "invalid-comparison")
		}
		switch q.Value {
		case "<":
			return *structv < v, nil
		case ">":
			return *structv > v, nil
		case "!=":
			return *structv != v, nil
		case "==":
			return *structv == v, nil

		}

	case string:
		structv, ok := curstruct.(string)
		if !ok {
			log.L.Errorf("Can't cast. Weird problems are afoot.")

			return false, nerr.Create(fmt.Sprintf("Couldn't compare %v and %v. An error occurred extracting value from struct.", q.Right, q.Left), "invalid-comparison")
		}

		switch q.Value {
		case "<":
			return structv < q.Right, nil
		case ">":
			return structv > q.Right, nil
		case "!=":
			return structv != q.Right, nil
		case "==":
			return structv == q.Right, nil

		}

	case time.Time:
		structv, ok := curstruct.(time.Time)
		if !ok {
			log.L.Errorf("Can't cast. Weird problems are afoot.")

			return false, nerr.Create(fmt.Sprintf("Couldn't compare %v and %v. An error occurred extracting value from struct.", q.Right, q.Left), "invalid-comparison")
		}

		t := time.Now()
		d, err := time.ParseDuration(q.Right)
		if err != nil {
			return false, nerr.Translate(err).Addf("Couldn't parse duration %v", q.Right)
		}
		t = t.Add(d)

		//figure out the difference.
		switch q.Value {
		case "<":
			return t.After(structv), nil
		case ">":
			return t.Before(structv), nil
		case "!=":
			return !t.Equal(structv), nil
		case "==":
			return t.Equal(structv), nil
		}

	case *bool:
		structv, ok := curstruct.(*bool)
		if !ok {
			log.L.Errorf("Can't cast. Weird problems are afoot.")

			return false, nerr.Create(fmt.Sprintf("Couldn't compare %v and %v. An error occurred extracting value from struct.", q.Right, q.Left), "invalid-comparison")
		}
		b, err := strconv.ParseBool(q.Right)
		if err != nil {
			return false, nerr.Create(fmt.Sprintf("Couldn't parse bool %v. %v", q.Right, err.Error()), "invalid-comparison")
		}

		switch q.Value {
		case "<":
			return false, nerr.Create(fmt.Sprintf("Invalid comparison %v for bool field.", q.Value), "invalid-comparison")
		case ">":
			return false, nerr.Create(fmt.Sprintf("Invalid comparison %v for bool field.", q.Value), "invalid-comparison")
		case "!=":
			return b != *structv, nil
		case "==":
			return b == *structv, nil
		}

	}

	return false, nil
}
