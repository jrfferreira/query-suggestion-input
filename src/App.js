import React from "react";
import "./App.css";

import SuggestionInput from "./SuggestionInput";

const SYNTAX = `
<SYNTAX>           ::= <query>
<query>            ::= <element> <SEPARATOR> <query> | <element>
<SEPARATOR>        ::= ',' ' ' | ','
<element>          ::=  <repetition> "|" <element> | <repetition>
<repetition>       ::= <simple> <repeat_operator> | <simple>
<repeat_operator>  ::= "+" | "*" | "?"
<simple>           ::= <event> | <group>
<group>            ::= "(" <element> ")"
<event>            ::= <event_name> ":" <screen_name> <prop_list_scope> | <event_name> ":" <screen_name> | <event_name> ":" | <event_name> <prop_list_scope> | <event_name>
<event_name>       ::= <DIGITS> | <any> | ""
<screen_name>      ::= <DIGITS> | ""
<prop_list_scope>  ::= "{" <prop_list> "}" | "{" <prop_list> | "{" "}" | "{"
<prop_list>        ::= <prop_tuple_scope> "," <prop_list> | <prop_tuple_scope>
<prop_tuple_scope> ::= <prop_name> "=" <prop_val> | <prop_name> "=" | <prop_name>
<prop_name>        ::= <DIGITS> | ""
<prop_val>         ::= <DIGITS> | ""
<DIGIT>            ::= "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0"
<DIGITS>           ::= <DIGIT> <DIGITS> | <DIGIT>
<any>              ::= "."
`;

const EQUATION_SENTENCE = "19,.+,18|16:10{1=2}";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sentence: EQUATION_SENTENCE
    };
  }

  onChange = field => val => {
    this.setState({
      [field]: val
    });
  };

  fetchSuggestions = node => {
    this.setState({
      currentNode: node,
      currentEvent: node.findParentByType("event").findChildByType("event_name")
        .text
    });

    const { text, type } = node;
    return new Promise((resolve, reject) => {
      let response;
      if (
        ["event_name", "screen_name", "prop_val", "prop_name"].includes(type)
      ) {
        response = [...Array(5)]
          .map(_ => parseInt(Math.random() * 1000))
          .concat(text);
      }

      setTimeout(() => resolve(response), 1000);
    });
  };

  render() {
    return (
      <div className="App">
        <label htmlFor="syntax">Syntax:</label>
        <br />
        <textarea name="syntax" value={SYNTAX} readOnly={true} />
        <hr />
        <label htmlFor="sentence">Sentence:</label>
        <br />
        <SuggestionInput
          name="sentence"
          syntax={SYNTAX}
          value={this.state.sentence}
          onChange={this.onChange("sentence")}
          fetchSuggestions={this.fetchSuggestions}
        />
        <hr />
        <br />
        Current node: {this.state.currentNode &&
          this.state.currentNode.type}:{" "}
        {this.state.currentNode && this.state.currentNode.text}
        <br />
        Current event: {this.state.currentEvent}
      </div>
    );
  }
}

export default App;
