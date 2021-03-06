import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap'
import { withRouter } from 'react-router';
import { Carousel, CarouselItem } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import logo from '../../media/CYEC-horizontal.png';
import '../../styles/Home.css';

const images = require.context('../../media/Carousel', true);


const translations = {
  "donate": {
    "English": "Donate Now",
    "Swahili": "Saidia Sasa"
  },
  "title": {
    "English": "Welcome to the CYEC's Donation Center!",
    "Swahili": "Karibu katika Kituo cha Mchango cha CYEC!"
  },
  "info": {
    "English": "Thank you for your interest in supporting the Children and Youth Empowerment Centre! " +
                "Here, you will find the current needs of the CYEC and have the opportunity to donate directly to those needs. " +
                "Our goal is to help you better understand the impact your " +
                "donation can have at the CYEC. For more information about our vision, current projects, and future goals " +
                "check out",
    "Swahili": "Asante kwa shauku yako katika kusaidia Kituo cha Uwezeshaji watoto na Vijana! " +
                "Hapa, utapata mahitaji ya sasa ya CYEC na upate nafasi ya kuchangia moja kwa moja kwa mahitaji hayo. " +
                "Kusudi letu ni kukusaidia kuelewa vyema athari ambayo mchango wako unaweza kuwa nayo kwa CYEC. " +
                "Kwa habari zaidi juu ya maono yetu, miradi ya sasa, na malengo ya siku zijazo angalia"
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
          <div className="carousel-container">
            <Carousel controls indicators slide interval={3500} className="pic-carousel">
              <CarouselItem animateIn animateOut>
                <img
                  alt="CYEC-Logo"
                  src={logo}
                  className="logo"
                />
                <img src={images('./1.JPG')} alt="" className="carousel-image"/>
              </CarouselItem>
              <CarouselItem animateIn animateOut>
                <img
                  alt="CYEC-Logo"
                  src={logo}
                  className="logo"
                />
                <img src={images('./3.JPG')} alt="" className="carousel-image"/>
              </CarouselItem>
              <CarouselItem animateIn animateOut>
                <img
                  alt="CYEC-Logo"
                  src={logo}
                  className="logo"
                />
                <img src={images('./4.JPG')} alt="" className="carousel-image"/>
              </CarouselItem>
              <CarouselItem animateIn animateOut>
                <img
                  alt="CYEC-Logo"
                  src={logo}
                  className="logo"
                />
                <img src={images('./5.JPG')} alt="" className="carousel-image"/>
              </CarouselItem>
              <CarouselItem animateIn animateOut>
                <img
                  alt="CYEC-Logo"
                  src={logo}
                  className="logo"
                />
                <img src={images('./6.JPG')} alt="" className="carousel-image"/>
              </CarouselItem>           
            </Carousel>
            {!isMobile && <Button className="donate-now-btn" onClick={this.donateNowClick}>{translations["donate"][this.props.language]}</Button>}
          </div>
          <div className="info-container">
            <div className="col-50">
              <h1 className="title">{translations["title"][this.props.language]}</h1>
            </div>
            <div className="col-50 last">
              <p className="info">
                {translations["info"][this.props.language]} <a href="http://www.cyec.net" rel="noopener noreferrer" target="_blank" className="modal-link">cyec.net</a>.
              </p>
            </div>
          </div>
          {isMobile && <Button className="donate-now-btn" onClick={this.donateNowClick}>{translations["donate"][this.props.language]}</Button>}
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
