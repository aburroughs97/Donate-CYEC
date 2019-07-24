import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  Modal, Button, Glyphicon, Carousel, CarouselItem } from 'react-bootstrap';
import { MetroSpinner } from "react-spinners-kit";
import { Map, CheckoutTable } from '../Components';
import { toast } from 'react-smart-toaster';
import Calendar from 'react-calendar';
import Observer from "react-intersection-observer";
import * as _donateCalls from '../../API/DonateCalls'

// const translations = {

// }

// const imageAPI = "/api/Donate/GetImage?itemID=";


const spinner =           
  <div className="spinner-container">
    <MetroSpinner 
      size={150}
      color="#BF2E1B"
      loading={true}
    />
  </div>;

const defaultState = {
  index: 0,
  maxIndex: 0,
  donationMethod: "",
  donationMethodLength: 4,
  selectedDate: null
}

export default class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState
    }

    this.onHide = this.onHide.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.paymentTypeClicked = this.paymentTypeClicked.bind(this);
    this.loadDropOffItems = this.loadDropOffItems.bind(this);
    this.makeDonation = this.makeDonation.bind(this);
    this.dateClicked = this.dateClicked.bind(this);
  }

  nextPage() {
    let length = this.state.donationMethodLength;
    
    let index = this.state.index < length ? this.state.index + 1 : length;
    let maxIndex = this.state.index === this.state.maxIndex ? this.state.index + 1 : this.state.maxIndex;
    this.setState({
      index,
      maxIndex
    });
  }

  previousPage() {
    let index = this.state.index > 0 ? this.state.index - 1 : 0;
    if(index === 0) {
      this.setState({
        ...defaultState
      });
    }
    else {
      this.setState({
        index
      });
    }
  
  }

  paymentTypeClicked(type, length) {
    this.setState({
      donationMethod: type,
      donationMethodLength: length
    });
    this.nextPage();
  }

  makeDonation() {
    _donateCalls.MakeDropOffDonation(this.props.userID, this.state.selectedDate)
    .then((response) => {
      if(response.isSuccess) {
        this.nextPage();
        this.props.onDonationSuccess();
      }
      else {
        toast.error("Error making donation: " + response.message);
      }
    })
  }

  markCurrentDate(date) {
    let currentDate = new Date(Date.now());
    if(currentDate.toDateString() === date.date.toDateString()) return <p className="today">Today</p>
    else return null;
  }

  formatPrice(price) {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    price = price.toFixed(roundDigits);
    if(this.props.currency.symbolBefore) {
      return this.props.currency.currencySymbol +"" + price;
    }
    else {
      return price + "" + this.props.currency.currencySymbol
    }
  }

  loadDropOffItems() {
    let now = new Date(Date.now());
    let expires = new Date(Date.now());
    expires.setFullYear(now.getFullYear() + 2);
    let items = [
      <div className="carousel-item">
        <h2>Select a drop-off date: </h2>
        <Calendar 
          onChange={this.dateClicked} 
          minDate={now} 
          maxDate={expires}
          value={this.state.selectedDate}
          className="calendar" 
          calendarType="US" 
          tileClassName="calendar-cell"
          tileContent={this.markCurrentDate}
          />
      </div>, 
      <div className="carousel-item">
        <h2>Confirm Donation: </h2>
        <CheckoutTable 
          items={this.props.cartItems} 
          currency={this.props.currency} 
          language={this.props.language} 
          total={this.props.total} 
          makeDonation={this.makeDonation}
          type={this.state.donationMethod}
        />
      </div>,
      <div className="carousel-item">
        <h2>Thank you for your donation! We look forward to seeing you soon.</h2>
        <p>We've sent you an email with more details.</p>
        <Observer>
        {({ inView, ref }) => (
          <div className="map-container" ref={ref}>
            {inView ? <Map /> : null}
          </div>
        )}
        </Observer>
      </div>
    ];
    return items;
  }

  onHide() {
    this.setState({
      ...defaultState
    });
    this.props.onHide();
  }

  dateClicked(value) {
    this.setState({
      selectedDate: value
    })
    this.nextPage(); 
  }

  render() {
    let items = [];
    switch(this.state.donationMethod) {
      case "dropoff":
        items = this.loadDropOffItems();
        break;
      case "mpesa":
        items = [];
        break;
      case "creditcard": 
        items = [];
        break;
      default: 
        items = [spinner, spinner, spinner]
        break; 
    }
    return (
      <Modal
        size="lg"
        backdrop="static"
        show={this.props.show}
        onHide={this.onHide}
        dialogClassName="checkout"
      >
      <Modal.Header closeButton>
        <Glyphicon glyph="arrow-left" className={"close back-btn " + (this.state.index === 0 || this.state.index === this.state.donationMethodLength-1 ? "hidden" : "")} onClick={this.previousPage}/>
        <Glyphicon glyph="arrow-right" className={"close back-btn " + (this.state.maxIndex === this.state.index || this.state.index === 0 ? "hidden" : "")} onClick={this.nextPage}/>
      </Modal.Header>
      <Modal.Body>
        <Carousel defaultActiveIndex={0} controls={false} indicators slide interval={null} activeIndex={this.state.index}>
          <CarouselItem animateIn animateOut>
            <h2>Select a Donation Method:</h2>
            <Button className="type-btn first-btn" onClick={() => this.paymentTypeClicked("dropoff", 4)}>
              <p><Glyphicon glyph="map-marker" className="btn-icon"/></p>
              <p>Drop-Off</p>
              <p className="subtext">Nyeri</p>
            </Button>
            <Button className="type-btn" onClick={() => this.paymentTypeClicked("mpesa")} disabled title="Coming soon">
              <p><Glyphicon glyph="phone" className="btn-icon"/></p>
              <p>MPESA</p>
              {/* <p className="subtext">East Africa</p> */}
              <p className="subtext">Coming Soon...</p>
            </Button>
            <Button className="type-btn" onClick={() => this.paymentTypeClicked("creditcard")} disabled title="Coming soon" >
              <p><Glyphicon glyph="credit-card" className="btn-icon"/></p>
              <p>Credit Card</p>
              {/* <p className="subtext">Anywhere</p> */}
              <p className="subtext">Coming Soon...</p>
            </Button>
          </CarouselItem>
          {items.map((option, i) => {
            return <CarouselItem key={i+1} animateIn animateOut>{option}</CarouselItem>
          })}
        </Carousel>
      </Modal.Body>
    </Modal>
    );}
}

Checkout.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  userID: PropTypes.number,
  onDonationSuccess: PropTypes.func,
  cartItems: PropTypes.array,
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    symbolBefore: PropTypes.bool
  }),
  total: PropTypes.number
}