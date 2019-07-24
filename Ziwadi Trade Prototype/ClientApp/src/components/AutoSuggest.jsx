import React, { Component } from 'react';
import { Button, FormControl, Glyphicon, InputGroup, FormGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import '../styles/AutoSuggest.css';
 
// Teach Autosuggest how to calculate suggestions for any given input value.

 
// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion;
 
// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div>
    {suggestion}
  </div>
);
 
export default class AutoSuggestInput extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: []
    };

    this.getSuggestions = this.getSuggestions.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.triggerSearch = this.triggerSearch.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.renderInputComponent = this.renderInputComponent.bind(this);
  }
 
  onChange(event, { newValue }) {
    this.setState({
      value: newValue
    });
  };
 
  getSuggestions (value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
   
    return inputLength === 0 ? [] : this.props.suggestions.filter(x =>
      x.toLowerCase().includes(inputValue)
    );
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };
 
  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };
  
  onKeyPress(event) {
    if((event.which === 13 || event.keyCode === 13) && this.state.value === ""){
      this.triggerSearch();
    }
  }

  triggerSearch(){
    this.props.search(this.state.value);
  }

  onSuggestionSelected(event, { suggestionValue }) {
    this.props.search(suggestionValue);
  }

  renderInputComponent(inputProps) { 
    return (<FormGroup className="search-group">
      <InputGroup>
          <FormControl {...inputProps} />
          <InputGroup.Button>
            <Button className="search-btn" onClick={this.triggerSearch}><Glyphicon glyph='search'/></Button> 
          </InputGroup.Button>
        </InputGroup>
      </FormGroup> 
  );}
 
  render() {
    const { value, suggestions } = this.state;
 
    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: this.props.placeholder,
      value,
      onChange: this.onChange,
      onKeyDown: this.onKeyPress
    };
 
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        onSuggestionSelected={this.onSuggestionSelected}
        highlightFirstSuggestion
        renderInputComponent={this.renderInputComponent}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

AutoSuggestInput.propTypes = {
  suggestions: PropTypes.array,
  placeholder: PropTypes.string,
  search: PropTypes.func
}