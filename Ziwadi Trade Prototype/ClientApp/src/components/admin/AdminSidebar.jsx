import React, { Component } from 'react';
import PropTypes from 'prop-types';


export class AdminSidebar extends Component {
  render() {
    return (
      <div className="admin-sidebar">
        <h2>Options</h2>
        <hr />
        <h4 className={"admin-sidebar-link " + (this.props.selectedOptionsIndex === 0 ? "admin-sidebar-link-active" : "")}
          onClick={() => this.props.optionChanged(0)}
        >
          Add Products
        </h4>
        <h4 className={"admin-sidebar-link " + (this.props.selectedOptionsIndex === 1 ? "admin-sidebar-link-active" : "")}
          onClick={() => this.props.optionChanged(1)}
        >
          Manage Users
        </h4>
        <h4 className={"admin-sidebar-link " + (this.props.selectedOptionsIndex === 2 ? "admin-sidebar-link-active" : "")}
          onClick={() => this.props.optionChanged(2)}
        >
          Update Information
        </h4>
      </div>
    );
  }
}

AdminSidebar.propTypes = {
  optionChanged: PropTypes.func
}