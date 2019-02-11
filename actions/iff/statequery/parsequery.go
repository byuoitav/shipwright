package statequery

import (
	"fmt"
	"sync"
	"unicode"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
)

const (
	OR         = "OR"         // "||"
	AND        = "AND"        // "&&"
	OPENPAREN  = "OPENPAREN"  //(
	CLOSEPAREN = "CLOSEPAREN" //)
	NOT        = "NOT"        //!
	OPERATOR   = "OPERATOR"   // > = < !=
	QUOTE      = "QUOTE"      //" or '
	KEY        = "KEY"        //Key
	VALUE      = "VALUE"      //Value
	LIT        = "LITERAL"    //Any key or value
	EQ         = "EQUALS"     //==
)

//QueryRunner .
type QueryRunner struct {
	rootNode *QueryNode
	initOnce sync.Once

	Query     string
	CacheName string
	DataType  string
}

//QueryNode .
type QueryNode struct {
	LeftChild  *QueryNode
	RightChild *QueryNode
	ParentNode *QueryNode

	Operator string
	Value    string

	//for leaf nodes
	Left  string
	Right string

	ID int
}

type parenStoreItem struct {
	node  *QueryNode
	token token
}

//ParseQuery .
func ParseQuery(q string) (*QueryNode, *nerr.E) {
	var currentNode *QueryNode
	var curRoot *QueryNode

	tokens, err := getTokens(q)
	if err != nil {
		return curRoot, err.Addf("Couldn't parse query")
	}

	literalStore := []token{}
	ParenStore := []parenStoreItem{}

	//Debug
	nodeCount := 0

	for i, cur := range tokens {

		log.L.Debugf("\n")
		log.L.Debugf("Current token: %+v", cur.ttype)
		log.L.Debugf("Current root: %+v", curRoot)
		log.L.Debugf("Current Node: %+v", currentNode)
		log.L.Debugf("Current ParenStore: %+v", ParenStore)
		log.L.Debugf("Current literalStore: %+v", literalStore)
		log.L.Debugf("Current NodeCount: %+v", nodeCount)
		log.L.Debugf("\n")

		//we're gonna build our query? - this is in the form of a tree.
		switch cur.ttype {
		case LIT:
			if currentNode == nil || currentNode.Operator != OPERATOR || (len(literalStore) == 0 && currentNode.Right != "") {
				log.L.Debugf("Parsing literal %v, left value, storing.", cur.value)
				literalStore = append(literalStore, cur)
				continue
			}
			if currentNode.Right == "" {
				log.L.Debugf("Parsing literal %v, right value, adding to node %v", cur.value, currentNode.ID)
				currentNode.Right = cur.value

				if curRoot != nil {
					log.L.Debugf("Finishing node %v. Adding to parent %v. Setting parent as current", currentNode.ID, curRoot.ID)
					//we're done with the node - attach it to parenti
					currentNode.ParentNode = curRoot
					curRoot.RightChild = currentNode

					//Move to the newly completed node
					currentNode = currentNode.ParentNode
				}
			}

		case NOT:
		case OPERATOR:
			if len(literalStore) == 0 {
				//it's a problem
				return curRoot, nerr.Create(fmt.Sprintf("Invalid query at token %v.", i), "invalid")
			}

			//otherwise we create a node
			currentNode = &QueryNode{
				Operator: cur.ttype,
				Value:    cur.value,
				Left:     literalStore[0].value,
				ID:       nodeCount,
			}

			log.L.Debugf("Adding a %v node, node ID %v. Left value %v. Right Value %v", cur.ttype, currentNode.ID, currentNode.Left, currentNode.Right)
			nodeCount++
			//clear the literal storea
			literalStore = []token{}

		case OR, AND:
			//add a parent node to our current node
			tmpNode := &QueryNode{
				Operator:  cur.ttype,
				Value:     cur.value,
				LeftChild: currentNode,
				ID:        nodeCount,
			}
			nodeCount++
			log.L.Debugf("Adding a %v node, node ID: %v. Left Child: %+v", tmpNode.Operator, tmpNode.ID, tmpNode.LeftChild)

			//Make the assignments
			currentNode.ParentNode = tmpNode

			//set the current parent
			curRoot = tmpNode

		case OPENPAREN:
			ParenStore = append(ParenStore, parenStoreItem{
				node:  curRoot,
				token: cur,
			})
			if curRoot != nil {
				log.L.Debugf("Adding open paren, linking to node %+v, paren %v on the stack", curRoot.ID, len(ParenStore))
			} else {
				log.L.Debugf("Adding open paren. No curent root to link to. Paren %v on the stack", len(ParenStore))
			}

			//clear current node and root
			currentNode = nil
			curRoot = nil
		case CLOSEPAREN:
			//get the last element out of the ParenStack
			poppedParen := ParenStore[len(ParenStore)-1]

			ParenStore = ParenStore[:len(ParenStore)-1]

			if poppedParen.node != nil {
				log.L.Debugf("Closing paren, popping node %v, new paren stack len", poppedParen.node.ID, len(ParenStore))

				//set the root
				curRoot = poppedParen.node

				//associate the current deal with the current root, on teh right hand side
				curRoot.RightChild = currentNode
				currentNode.ParentNode = curRoot

				currentNode = curRoot
			}
		}

		log.L.Infof("%v", cur)
	}

	if curRoot != nil {
		return curRoot, nil
	}

	return currentNode, nil
}

type token struct {
	ttype string
	value string
}

var tokenMap = map[rune]string{
	'|':  OR,
	'&':  AND,
	'(':  OPENPAREN,
	')':  CLOSEPAREN,
	'!':  NOT,
	'>':  OPERATOR,
	'=':  EQ,
	'<':  OPERATOR,
	'"':  QUOTE,
	'\'': QUOTE,
}

func getTokens(query string) ([]token, *nerr.E) {
	//we're gonna go through and tokenize our query
	toReturn := []token{}

	runequery := []rune(query)

	for i := 0; i < len(runequery); i++ {
		log.L.Debugf("evaluating %c", runequery[i])

		if unicode.IsSpace(runequery[i]) {
			continue
		}

		poss := tokenMap[runequery[i]]
		log.L.Debugf("token %v", poss)
		switch poss {
		case AND:
			if runequery[i+1] != '&' {
				return toReturn, nerr.Create(fmt.Sprintf("invlid query, bad character at position %v", i+1), "invalid")
			}
			i++
			toReturn = append(toReturn, token{AND, "&&"})
		case EQ:
			if runequery[i+1] != '=' {
				return toReturn, nerr.Create(fmt.Sprintf("invlid query, bad character at position %v", i+1), "invalid")
			}
			i++
			toReturn = append(toReturn, token{OPERATOR, "=="})
		case OR:
			if runequery[i+1] != '|' {
				return toReturn, nerr.Create(fmt.Sprintf("invlid query, bad character at position %v", i+1), "invalid")
			}
			i++
			toReturn = append(toReturn, token{OR, "||"})
		case NOT:
			if runequery[i+1] == '=' {
				log.L.Debugf("not equals token", poss)
				i++
				toReturn = append(toReturn, token{OPERATOR, "!="})
			} else {
				log.L.Debugf("not token", poss)
				toReturn = append(toReturn, token{NOT, "!"})
			}
		case QUOTE:
			log.L.Debugf("Starting a literal.", poss)
			literal := []rune{}
			for {
				i++
				if runequery[i] == '"' || runequery[i] == '\'' {
					log.L.Debugf("Found end of literal.", poss)
					break
				}
				literal = append(literal, runequery[i])
			}
			log.L.Debugf("Literal: %v", string(literal))
			toReturn = append(toReturn, token{LIT, string(literal)})
		default:
			toReturn = append(toReturn, token{poss, string(runequery[i])})
		}
	}

	return toReturn, nil
}
