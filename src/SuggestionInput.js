import React from "react";
import PropTypes from "prop-types";
import { Grammars } from "ebnf";

import SuggestionList from "./SuggestionList";
import Node from "./Node";

import { COMMANDS, DELAY, STEPS } from "./constants";

export default class SuggestionInput extends React.Component {
  static propTypes = {
    syntax: PropTypes.string.isRequired,
    value: PropTypes.string,
    delay: PropTypes.number,
    onChange: PropTypes.func,
    fetchSuggestions: PropTypes.func.isRequired
  };

  static defaultProps = {
    delay: DELAY,
    value: ""
  };

  state = {
    active: 0,
    output: null
  };

  fetcher;
  parser;
  input;

  constructor(props) {
    super(props);
    this.input = null;
    this.fetcher = null;
    this.parser = new Grammars.BNF.Parser(props.syntax);

    this.state = {
      suggestions: [],
      fetchingSuggestions: false,
      output: this.getOutput(props.value),
      cursorPosition: props.value.length
    };
  }

  // Helpers

  getOutput = sentence => {
    return new Node(this.parser.getAST(sentence));
  };

  updateReferences = (silent = false) => {
    const sentence = this.input.value;
    const cursorPosition = this.input.selectionStart || sentence.length;
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
        currentNode,
        suggestions: [],
        active: 0
      });

      if (!silent) this.checkForSuggestions(currentNode);
    }
  };

  checkForSuggestions = (currentNode = this.state.currentNode) => {
    this.setState({
      fetchingSuggestions: true
    });

    clearTimeout(this.fetcher);
    this.fetcher = setTimeout(
      () =>
        this.props
          .fetchSuggestions(currentNode)
          .then((suggestions = []) => {
            this.setState({
              suggestions,
              fetchingSuggestions: false
            });
          })
          .catch(_ => {
            this.setState({
              suggestions: [],
              fetchingSuggestions: false
            });
          }),
      this.props.delay
    );
  };

  navigateDown = () => {
    const { active } = this.state;
    const lastPosition = this.state.suggestions.length - 1;
    return active === lastPosition ? active : active + STEPS;
  };

  navigateUp = () => {
    const { active } = this.state;
    return active === 0 ? active : active - STEPS;
  };

  // Handlers

  onClose = () => {};

  onPressEnter = () => {
    this.onSelect(this.state.suggestions[this.state.active]);
  };

  onNavigate = e => {
    const active =
      e.key === COMMANDS.DOWN ? this.navigateDown() : this.navigateUp();

    this.setState({ active });
    e.stopPropagation();
    e.preventDefault();
  };

  onChange = e => {
    this.updateReferences();
    if (this.props.onChange) this.props.onChange(this.input.value);
  };

  onKeyDown = e => {
    switch (e.key) {
      case COMMANDS.LEFT:
      case COMMANDS.RIGHT:
        this.updateReferences();
        break;
      case COMMANDS.UP:
      case COMMANDS.DOWN:
        this.onNavigate(e);
        break;
      case COMMANDS.ENTER:
        this.onPressEnter();
        break;
      case COMMANDS.ESC:
        this.escapeHandler();
        break;
    }
  };

  onMouseUp = e => {
    this.updateReferences();
  };

  onSelect = newValue => {
    const sentence = this.props.value;
    const node = this.state.currentNode;
    const newSentence =
      "" +
      sentence.substring(0, node.start) +
      newValue +
      sentence.substring(node.end, sentence.length);

    const newSelectionStart = node.start + new String(newValue).length;

    this.input.value = newSentence;
    if (this.props.onChange) this.props.onChange(newSentence);

    this.input.focus();
    this.input.setSelectionRange(newSelectionStart, newSelectionStart);
    this.updateReferences(true);
  };

  // Renders

  renderSuggestions = () => {
    const { suggestions, fetchingSuggestions } = this.state;
    const showSuggestions =
      !fetchingSuggestions && suggestions && suggestions.length;

    if (!showSuggestions) return;

    return (
      <SuggestionList
        suggestions={suggestions}
        active={this.state.active}
        selected={this.state.currentNode.text}
        onSelect={this.onSelect}
      />
    );
  };

  render() {
    const {
      onMouseUp,
      onKeyUp,
      onChange,
      syntax,
      onChangeNode,
      fetchSuggestions,
      ...props
    } = this.props;

    return (
      <React.Fragment>
        <input
          {...props}
          ref={node => {
            this.input = node;
          }}
          onMouseUp={this.onMouseUp}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
        />
        <br />
        {this.state.fetchingSuggestions ? "Loading..." : ""}
        {this.renderSuggestions()}
      </React.Fragment>
    );
  }
}
