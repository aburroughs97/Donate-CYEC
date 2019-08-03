import React, { Component } from 'react';
import PropTypes from 'prop-types';


const adminOptions = ["Manage Drop-Offs", "Manage Payments", "Add Item", "Manage Items", "Manage Users"];

export default class AdminSidebar extends Component {
  render() {
    return (
      <div className="admin-sidebar">
        <h2>Options</h2>
        <hr />
        {adminOptions.map((option, i) => {
          return <h4 key={i} className={"admin-sidebar-link " + (this.props.selectedOptionsIndex === i ? "active" : "")} onClick={() => this.props.optionChanged(i)}>
          {option}
        </h4>
        })}
      </div>
    );
  }
}

AdminSidebar.propTypes = {
  optionChanged: PropTypes.func
}