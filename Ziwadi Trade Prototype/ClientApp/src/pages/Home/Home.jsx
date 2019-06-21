import React, { Component } from 'react';
import {Button} from 'react-bootstrap'
import { withRouter } from 'react-router';
import {LinePlaceholder} from '../../components/LinePlaceholder';
import '../../styles/Home.css';

export class Home extends Component {
  displayName = Home.name

  constructor(props) {
    super(props);
    
    this.donateNowClick = this.donateNowClick.bind(this);
}

  donateNowClick(){
    this.props.history.push("/donate");
  }

  render() {
    return (
      <div>
        <div className="content">
          <div className="col-33">
            <h2>Column 1:</h2>
            <LinePlaceholder />
          </div>
          <div className="col-33">
            <h2>Column 2:</h2>
            <LinePlaceholder />
          </div>
          <div className="col-33 last-col">
            <h2>Column 3:</h2>
            <LinePlaceholder />
          </div>
          <Button className="donate-now-btn" onClick={this.donateNowClick}>Donate Now</Button>
        </div>
      </div> 
    );
  }
}

export default withRouter(Home);
