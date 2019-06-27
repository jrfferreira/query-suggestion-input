import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Node from "./Node";
import LoadingSpinner from "./LoadingSpinner";

export default class SuggestionList extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    suggestions: PropTypes.array,
    active: PropTypes.number,
    selected: PropTypes.string,
    onSelect: PropTypes.func.isRequired
  };

  static defaultProps = {
    suggestions: []
  };

  onClickSuggestion = suggestion => e => {
    this.props.onSelect(suggestion);
  };

  render() {
    return (
      <ul className="query-suggestion-list">
        {this.props.loading ? (
          <LoadingSpinner />
        ) : (
          this.props.suggestions.map((suggestion, index) => {
            const active = index === this.props.active;
            const selected = suggestion === this.props.selected;
            return (
              <li
                key={suggestion}
                className={`query-suggestion-item ${active ? "active" : ""} ${
                  selected ? "selected" : ""
                }`}
                onClick={this.onClickSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            );
          })
        )}
      </ul>
    );
  }
}
