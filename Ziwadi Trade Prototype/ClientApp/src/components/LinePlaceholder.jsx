import React, { Component } from 'react';
import '../styles/Placeholder.css';

export default class LinePlaceholder extends Component {
    render() {
        return (
            <div className="container">
                <div className="content-placeholder-box">
                  <span className="content-placeholder-background"></span>
                </div>
                <div className="content-placeholder-text-med">
                  <span className="content-placeholder-background"></span>
                </div>
                <div className="content-placeholder-text">
                  <span className="content-placeholder-background"></span>
                </div>
                <div className="content-placeholder-text">
                  <span className="content-placeholder-background"></span>
                </div>
                <div className="content-placeholder-text">
                  <span className="content-placeholder-background"></span>
                </div>
                <div className="content-placeholder-text">
                  <span className="content-placeholder-background"></span>
                </div>
            </div>
        );
    }
}