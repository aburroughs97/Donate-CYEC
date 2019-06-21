import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoSuggestInput } from '../components/AutoSuggest';
import logo from '../media/CYEC-horizontal.jpg';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: ""
    };
    this.searchClicked = this.searchClicked.bind(this);
  }

  searchClicked(searchValue) {
    this.props.onSearch(searchValue);
  }

  render() {
    return (
      <div className="header">
        <img
          alt="CYEC-Logo"
          src={logo}
          className="logo"
        />

         {/*  */}

        <div className="search">
          <AutoSuggestInput 
            suggestions={this.props.searchSuggestions}
            placeholder="Search..."
            search={this.searchClicked}
          /> 
        </div>
      </div>
    );}
}

Header.propTypes = {
  onSearch: PropTypes.func,
  searchSuggestions: PropTypes.array
}



