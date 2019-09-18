import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../styles/Spinner.css';

export default class Spinner extends Component {
  render() {
    let style = { color: this.props.isGreen ? "#01573E" : "#BF2E1B" };
    return(
      <div className="default-spinner-container">
        <div className="hex mid">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex top">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex top-left">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex top-right">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex left-top">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex left-bottom">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex left">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex right-top">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex right-bottom">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex right">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex bottom">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex bottom-left">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex bottom-right">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex bottom-move">
          <span style={style}>&#x2B22;</span>
        </div>
        <div className="hex top-move">
          <span style={style}>&#x2B22;</span>
        </div>
      </div>
    )
  }
}

Spinner.propTypes = {
  isGreen: PropTypes.bool
}
