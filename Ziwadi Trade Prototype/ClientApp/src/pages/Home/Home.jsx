import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap'
import { withRouter } from 'react-router';
import { Carousel, CarouselItem } from 'react-bootstrap';
import logo from '../../media/CYEC-horizontal.png';
import '../../styles/Home.css';

const images = require.context('../../media/Carousel', true);


const translations = {
  "donate": {
    "English": "Donate Now",
    "Swahili": "Saidia Sasa"
  },
  "logindonate": {
    "English": "Log In and Donate",
    "Swahili": "Ingia na Saidia"
  }
}

export class Home extends Component {
  displayName = Home.name

  constructor(props) {
    super(props);

    this.state = {
      loginForced: false,
    }
    
    this.donateNowClick = this.donateNowClick.bind(this);
    this.loginDonateClick = this.loginDonateClick.bind(this);
}

  donateNowClick() {
    this.props.history.push("/donate");
  }

  loginDonateClick() {
    this.setState({ loginForced: true });
    this.props.showLogin();
  }

  componentWillReceiveProps(props) {
    let { loginForced } = this.state;
    if(props.isLoggedIn && loginForced){
      this.props.history.push("/donate");
      this.setState({ loginForced: false });
    }
  }

  render() {
    return (
        <div className="content">
          <img
            alt="CYEC-Logo"
            src={logo}
            className="logo"
          />
          <Carousel controls indicators slide interval={3000} className="pic-carousel">
            <CarouselItem animtateIn animateOut>
              <img src={images('./1.JPG')} className="carousel-image"/>
            </CarouselItem>
            <CarouselItem animtateIn animateOut>
              <img src={images('./3.JPG')} className="carousel-image"/>
            </CarouselItem>
            <CarouselItem animtateIn animateOut>
              <img src={images('./4.JPG')} className="carousel-image"/>
            </CarouselItem>
            <CarouselItem animtateIn animateOut>
              <img src={images('./5.JPG')} className="carousel-image"/>
            </CarouselItem>
            <CarouselItem animtateIn animateOut>
              <img src={images('./6.JPG')} className="carousel-image"/>
            </CarouselItem>
          </Carousel>
          <h1 className="title">Welcome to the CYEC Donation Center</h1>
          <hr />
          <p className="info">
            Thank you for your interest in supporting the Children and Youth Empowerment Centre!
             We created this website to help communicate the needs of the CYEC and allow you to donate 
             directly to meet those needs. Our goal is to help you better understand the impact your 
             donation can have at the CYEC. For more information about our vision, current projects, and future goals
             check out <a href="http://www.cyec.net" rel="noopener noreferrer" target="_blank" className="modal-link">cyec.net</a>.
          </p>
          {this.props.isLoggedIn && <Button className="donate-now-btn" onClick={this.donateNowClick}>{translations["donate"][this.props.language]}</Button>}
          {!this.props.isLoggedIn && <Button className="donate-now-btn" onClick={this.loginDonateClick}>{translations["logindonate"][this.props.language]}</Button>}
        </div>
    );
  }
}

export default withRouter(Home);

Home.propTypes = {
  language: PropTypes.string,
  isLoggedIn: PropTypes.bool,
  showLogin: PropTypes.func,
}
