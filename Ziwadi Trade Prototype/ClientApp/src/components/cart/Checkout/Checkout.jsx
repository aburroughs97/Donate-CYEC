import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {  Modal, Button, Glyphicon, Carousel, CarouselItem } from 'react-bootstrap';
import { MetroSpinner } from "react-spinners-kit";
import { Map, CheckoutTable } from '../../Components';
import { toast } from 'react-smart-toaster';
import Calendar from 'react-calendar';
import Observer from "react-intersection-observer";
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/dist/style.css';
import mpesaLogo from '../../../media/Lipa Na MPESA.png';
import * as _donateCalls from '../../../API/DonateCalls';
import * as _paymentCalls from '../../../API/PaymentCalls';

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
  selectedDate: null,
  phoneNumber: "",
  mpesaPaymentID: 0,
  mpesaPaymentStatus: "Pending",
  mpesaPaymentClicked: false,
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
    this.loadMPESAItems = this.loadMPESAItems.bind(this);
    this.makeDropOffDonation = this.makeDropOffDonation.bind(this);
    this.dateClicked = this.dateClicked.bind(this);
    this.makeMPESADonation = this.makeMPESADonation.bind(this);
    this.checkPaymentStatus = this.checkPaymentStatus.bind(this);
    this.loadPaymentDetails = this.loadPaymentDetails.bind(this);
    this.retryMPESADonation = this.retryMPESADonation.bind(this);
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

  checkPaymentStatus(){
    let { mpesaPaymentID, mpesaPaymentStatus } = this.state;
    _paymentCalls.CheckPaymentStatus(mpesaPaymentID)
    .then((response) => {
      mpesaPaymentStatus = response.payload;
      if(mpesaPaymentStatus !== "Pending") {
        clearInterval(this.interval);
        if(mpesaPaymentStatus === "Verified") {
          this.props.onDonationSuccess();
        }
      }
      this.setState({
        mpesaPaymentStatus
      });
    });
  }

  loadPaymentDetails() {
    _paymentCalls.LoadPaymentDetails(this.state.mpesaPaymentID)
    .then((response) => {
      if(response.isSuccess) {
        let details = response.payload;
        return <div className="payment-details">
          <h4><b>Confirmation Number: </b>{details.confirmationNumber}</h4>
          <h4><b>Sender: </b>{details.sender}</h4>
          <h4><b>Payment Method: </b>{details.paymentMethod}</h4>
          <h4><b>Phone Number: </b>{this.state.phoneNumber}</h4>
          <h4><b>Paybill: </b>{details.paybill}</h4>
          <h4><b>Amount: </b>{details.amount}</h4>
          <h4><b>Payment Date: </b>{new Date(details.paymentDate).toLocaleString()}</h4>
        </div>
      }
      else {
        toast.error("Error loading payment details: " + response.message);
        return null;
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  paymentTypeClicked(type, length) {
    this.setState({
      donationMethod: type,
      donationMethodLength: length
    });
    this.nextPage();
  }

  makeDropOffDonation() {
    _donateCalls.MakeDropOffDonation(this.props.userID, this.state.selectedDate, this.props.currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.nextPage();
        this.props.onDonationSuccess();
      }
      else {
        toast.error("Error making donation: " + response.message);
      }
    });
  }

  makeMPESADonation() {
    this.setState({
      mpesaPaymentClicked: true
    });
    let { phoneNumber } = this.state;
    _paymentCalls.MakeMPESADonation(this.props.userID, this.props.total, phoneNumber, this.props.currency.code === "KES")
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          mpesaPaymentID: response.payload.mpesaPaymentID,
          mpesaPaymentStatus: response.payload.paymentStatus,
          mpesaPaymentClicked: false
        });
        this.nextPage();
        this.interval = setInterval(this.checkPaymentStatus, 5000);
      }
      else {
        toast.error("Error making donation: " + response.message);
        this.setState({
          mpesaPaymentClicked: false
        })
      }
    });
  }

  retryMPESADonation() {
    this.setState({
      mpesaPaymentClicked: true,
      mpesaPaymentStatus: "Pending"
    });
    let { phoneNumber, mpesaPaymentID } = this.state;
    _paymentCalls.ResendMPESADonation(this.props.userID, mpesaPaymentID, this.props.total, phoneNumber, this.props.currency.code === "KES")
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          mpesaPaymentID: response.payload.mpesaPaymentID,
          mpesaPaymentStatus: response.payload.paymentStatus,
          mpesaPaymentClicked: false
        });
        this.interval = setInterval(this.checkPaymentStatus, 5000);
      }
      else {
        toast.error("Error making donation: " + response.message);
        this.setState({
          mpesaPaymentClicked: false
        })
      }
    });
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
          makeDonation={this.makeDropOffDonation}
          type={this.state.donationMethod}
        />
      </div>,
      <div className="carousel-item">
        <h2>Thank you for your donation! We look forward to seeing you soon.</h2>
        <p>We've sent you an email with more details. If you don't see one, check your spam folder.</p>
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

  loadMPESAItems() {
    let { phoneNumber } = this.state;
    let items = [
      <div className="carousel-item">
        <img className="mpesa-logo" 
          src={mpesaLogo}
          alt="Lipa Na MPESA" 
        />
        <h2 className="title-centered">Enter your Safaricom Phone Number: </h2>
          <ReactPhoneInput 
            onlyCountries={["ke"]} 
            defaultCountry="ke"
            disableDropdown
            countryCodeEditable={false}
            value={phoneNumber}
            masks={{'ke': '+... ... ......'}}
            onChange={(value) => this.setState({phoneNumber: value})} 
          />
          <Button className="next-btn" disabled={!this.validatePhoneNumber()} onClick={this.nextPage}>Continue</Button>
      </div>,
      <div className="carousel-item">
        <h2>Confirm Donation: </h2>
        <CheckoutTable 
          items={this.props.cartItems} 
          currency={this.props.currency} 
          language={this.props.language} 
          total={this.props.total} 
          makeDonation={this.makeMPESADonation}
          type={this.state.donationMethod}
          disableButton={this.state.mpesaPaymentClicked}
        />
      </div>, 
      <div className="carousel-item payment">
        <h2>Thank you for your donation!</h2>
        {this.state.mpesaPaymentStatus !== "Verified" && <p>We'll send you an email once your payment has been confirmed.</p>}
        {this.state.mpesaPaymentStatus === "Verified" && <p>We've sent you an email with more details. If you don't see one, check your spam folder.</p>}
        {this.state.mpesaPaymentStatus === "Pending" && 
          <div className="payment-status">
            <h4>We're working to verify your payment...</h4>
            <div className="spinner-container payment">
              <MetroSpinner 
                size={150}
                color="#01573E"
                loading={true}
              />
            </div>
          </div>
        }
        {this.state.mpesaPaymentStatus === "Rejected" && 
          <div className="payment-status rejected">
            <h4>It looks like there were issues with your payment.</h4>
            <p className="verify-text">Would you like to verify your phone number and try again?</p>
            <ReactPhoneInput 
              onlyCountries={["ke"]} 
              defaultCountry="ke"
              disableDropdown
              countryCodeEditable={false}
              value={phoneNumber}
              masks={{'ke': '+... ... ......'}}
              onChange={(value) => this.setState({phoneNumber: value})} 
            />
            <Button className="next-btn" onClick={this.retryMPESADonation}>Retry Payment</Button>
          </div>
        } 
        {this.state.mpesaPaymentStatus === "Verified" && 
          <div className="payment-status">
            <h4>Your payment has been successfully verified!</h4>
            <hr />
            {this.loadPaymentDetails()}
          </div>
        }    
        <img className="mpesa-logo" 
          src={mpesaLogo}
          alt="Lipa Na MPESA" 
        />    
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

  validatePhoneNumber() {
    let { phoneNumber } = this.state;
    return phoneNumber.length === 15
  }

  render() {
    let items = [];
    switch(this.state.donationMethod) {
      case "dropoff":
        items = this.loadDropOffItems();
        break;
      case "mpesa":
        items = this.loadMPESAItems();
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
            <Button className="type-btn" onClick={() => this.paymentTypeClicked("mpesa", 4)}>
              <p><Glyphicon glyph="phone" className="btn-icon"/></p>
              <p>MPESA</p>
              <p className="subtext">Kenya</p>
            </Button>
            <Button className="type-btn" onClick={() => this.paymentTypeClicked("creditcard")} disabled title="Coming soon" >
              <p><Glyphicon glyph="credit-card" className="btn-icon"/></p>
              <p>Credit Card</p>
              {/* <p className="subtext">International</p> */}
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