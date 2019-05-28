import React, { Component } from 'react';
import {Glyphicon, FormControl, Button} from 'react-bootstrap'
import {LinePlaceholder} from '../components/LinePlaceholder';
import logo from '../media/CYEC-horizontal.jpg';
import '../styles/Home.css';

export class Home extends Component {
  displayName = Home.name

  dummy(){

  }

  render() {
    return (
      <div>
        <div className="header">
          <img
            alt="CYEC-Logo"
            src={logo}
            className="logo"
          />

            <FormControl className="search"
              placeholder="Search..."
              aria-label="Search"
              aria-describedby="search"
            />
            <Button className="search-btn"><Glyphicon glyph='search'/></Button>
        </div>

        <div className="content">
          <div className="column">
          </div>
          <div className="column">
              <LinePlaceholder />
              <br />
              <LinePlaceholder />
              <br />
              <LinePlaceholder />
          </div>
          <div className="column">
          </div>
        </div>
      </div> 
    );
  }
}
