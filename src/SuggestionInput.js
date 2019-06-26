import React from "react";
import { Grammars } from "ebnf";

import { Node } from "./Node";

export default class SuggestionInput extends React.Component {
  state = {
    output: null
  };

  parser;

  constructor(props) {
    super(props);
    this.parser = new Grammars.BNF.Parser(props.syntax);

    this.state = {
      output: this.getOutput(props.value),
      cursorPosition: props.value.length
    };
  }

  // Helpers

  getOutput = sentence => {
    return new Node(this.parser.getAST(sentence));
  };

  getLastNode = node => {
    if (node.children && node.children.length) {
      return this.getLastNode([...node.children].pop());
    }
    return node;
  };

  getCursorPositionNode = (node, cursorPosition) => {
    if (node.children && node.children.length) {
      const focusedChild = node.children.find(c => {
        return cursorPosition >= c.start && cursorPosition <= c.end;
      });

      if (focusedChild) {
        return this.getCursorPositionNode(focusedChild, cursorPosition);
      }
    }
    return node;
  };

  updateReferences = (sentence, cursorPosition = sentence.length) => {
    const changedCursor = cursorPosition !== this.state.cursorPosition;
    const changedSentence = sentence !== this.props.value;
    if (changedCursor || changedSentence) {
      const output = changedSentence
        ? this.getOutput(sentence)
        : this.state.output;

      const currentNode = output.findChildByPosition(cursorPosition);

      this.setState({
        cursorPosition,
        output,
        currentNode
      });

      if (this.props.onChangeNode) this.props.onChangeNode(currentNode);
    }
  };

  // Handlers

  onChange = e => {
    this.updateReferences(e.target.value, e.target.selectionStart);
    if (this.props.onChange) this.props.onChange(e);
  };

  onKeyUp = e => {
    this.updateReferences(e.target.value, e.target.selectionStart);
    if (this.props.onKeyUp) this.props.onKeyUp(e);
  };

  onMouseUp = e => {
    this.updateReferences(e.target.value, e.target.selectionStart);
    if (this.props.onMouseUp) this.props.onMouseUp(e);
  };

  // Renders

  render() {
    const {
      onMouseUp,
      onKeyUp,
      onChange,
      syntax,
      onChangeNode,
      ...props
    } = this.props;
    return (
      <input
        {...props}
        onMouseUp={this.onMouseUp}
        onKeyUp={this.onKeyUp}
        onChange={this.onChange}
      />
    );
  }
}
