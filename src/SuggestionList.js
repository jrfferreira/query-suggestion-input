import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Node from "./Node";

const StyledSuggestion = styled.li`
  border: ${props => (props.active ? "1px" : "0")} solid;
  background: ${props => (props.selected ? "#eee" : "none")};
`;

export default class SuggestionList extends React.Component {
  static propTypes = {
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
      <ul>
        {this.props.suggestions.map((suggestion, index) => {
          return (
            <StyledSuggestion
              key={suggestion}
              active={index === this.props.active}
              selected={suggestion === this.props.selected}
              onClick={this.onClickSuggestion(suggestion)}
            >
              {suggestion}
            </StyledSuggestion>
          );
        })}
      </ul>
    );
  }
}
