import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import '../styles/Placeholder.css';

export default class ItemPreviewPlaceholder extends Component {
    render() {
        return (
          <div className="item-preview">
            <div className="col-15">
            <div className="content-placeholder-box">
              <span className="content-placeholder-background" />
            </div>
            <div className="content-placeholder-need">
              <span className="content-placeholder-background"></span>
            </div>
            </div>
            <div className = "col-85">
              <div className="content-placeholder-h2">
                <span className="content-placeholder-background"></span>
              </div>              
              <hr />
              <div className="content-placeholder-h2">
                <span className="content-placeholder-background"></span>
              </div>              
              <hr />
              <div className="content-placeholder-text">
                <span className="content-placeholder-background"></span>
              </div>        
            </div>
          </div>   
        );
    }
}