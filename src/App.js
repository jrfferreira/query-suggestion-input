import React from "react";
import { Grammars } from "ebnf";
import JSONTree from "react-json-tree";

const SYNTAX = `
<SYNTAX>           ::= <query>
<query>            ::= <element> ',' <query> | <element>
<element>          ::=  <repetition> '|' <element> | <repetition>
<repetition>       ::= <simple> <repeat_operator> | <simple>
<repeat_operator>  ::= '+' | '*' | '?'
<simple>           ::= <event> | <group>
<group>            ::= '(' <element> ')'
<event>            ::= <event_name> ":" <screen_name> <prop_list_scope> | <event_name> ":" <screen_name> | <event_name> ":" | <event_name> <prop_list_scope> | <event_name>
<event_name>       ::= <DIGITS> | <any> | ""
<screen_name>      ::= <DIGITS> | ""
<prop_list_scope>  ::= '{' <prop_list> '}' | '{' <prop_list> | '{' | '{' '}'
<prop_list>        ::= <prop_tuple_scope> ',' <prop_list> | <prop_tuple_scope>
<prop_tuple_scope> ::= <prop_name> '=' <prop_val> | <prop_name> '=' | <prop_name>
<prop_name>        ::= <DIGITS> | ""
<prop_val>         ::= <DIGITS> | ""
<DIGIT>            ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
<DIGITS>           ::= <DIGIT> <DIGITS> | <DIGIT>
<any>              ::= '.'
`;

const EQUATION_SENTENCE = "19,.+,18|16:10{1=2}";

class App extends React.Component {
  parser = new Grammars.BNF.Parser(SYNTAX);

  constructor(props) {
    super(props);
    this.state = this.getOutput({
      sentence: EQUATION_SENTENCE
    });
  }

  onKeyUp = field => ({ target }) => {
    this.setState(
      this.getOutput({
        ...this.state,
        cursorPosition: target.selectionStart
      })
    );
  };

  onChange = field => ({ target }) => {
    this.setState(
      this.getOutput({
        ...this.state,
        cursorPosition: target.selectionStart,
        [field]: target.value
      })
    );
  };

  getOutput = (state = this.state) => {
    try {
      const cursorPosition = isFinite(state.cursorPosition)
        ? 0 + state.cursorPosition
        : state.sentence.length;
      const output = this.parser.getAST(
        state.sentence.slice(0, cursorPosition)
      );
      return {
        ...state,
        cursorPosition,
        output,
        currentNode: this.getCurrentNode(output)
      };
    } catch (e) {
      return {
        ...state,
        output: e
      };
    }
  };

  getCurrentNode = node => {
    if (node.children && node.children.length) {
      return this.getCurrentNode([...node.children].pop());
    }
    return node;
  };

  render() {
    return (
      <div className="App">
        <label for="syntax">Syntax:</label>
        <br />
        <textarea name="syntax" value={SYNTAX} />
        <hr />
        <label for="sentence">Sentence:</label>
        <br />
        <input
          name="sentence"
          value={this.state.sentence}
          onMouseUp={this.onKeyUp("sentence")}
          onKeyUp={this.onKeyUp("sentence")}
          onChange={this.onChange("sentence")}
        />
        <br />
        Until position: {this.state.cursorPosition}
        <br />
        Current node: {this.state.currentNode && this.state.currentNode.type}
        <br />
        Current text: {this.state.currentNode && this.state.currentNode.text}
      </div>
    );
  }
}

export default App;
