import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Modal, Button } from 'react-bootstrap';
import Img from '../Img';
import NumericInput from 'react-numeric-input';

const translations = {
  "description": {
    "English": "Description",
    "Swahili": "Maelezo"
  },
  "need": {
    "English": "Need",
    "Swahili": "Haja"
  },
  "none": {
    "English": "NONE",
    "Swahili": "HAKUNA"
  },
  "verylow": {
    "English": "VERY LOW",
    "Swahili": "CHINI SANA"
  },
  "low": {
    "English": "LOW",
    "Swahili": "CHINI"
  },
  "medium": {
    "English": "MODERATE",
    "Swahili": "WASTANI"
  },
  "high": {
    "English": "HIGH",
    "Swahili": "JUU"
  },
  "critical": {
    "English": "CRITICAL",
    "Swahili": "MUHIMU"
  },
  "addTo": {
    "English": "Add to Cart",
    "Swahili": "Ongeza kwa Kikapu"
  },
  "donateNow": {
    "English": "Donate Now",
    "Swahili": "Saidia Sasa"
  }
}

const imageAPI = "/api/Donate/GetImage?itemID=";

export default class DirectItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numItems: 0,
      needDescriptions: {
        "CRITICAL": "This is a description of a critical need",
        "HIGH": "This is a description of a high need",
        "MODERATE": "This is a description of a moderate need",
        "LOW": "This is a description of a low need",
        "VERY LOW": "This is a description of a very low need"
      }
    }

    this.formatPrice = this.formatPrice.bind(this);
    this.numItemsUpdated = this.numItemsUpdated.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onDonateClicked = this.onDonateClicked.bind(this);
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

  numItemsUpdated(numItems) {
    this.setState({
      numItems,
    });
  }

  getCurrentValue(amount) {
    return (this.props.item.actualAmount + amount);
  }


  onHide() {
    this.setState({
      numItems: 0,
    });
    this.props.hide();
  }

  calcInputIncrement() {    
    let len = (this.props.item.goalAmount + "").length;
    if (len === 1) return 1;
    else return 10**(len - 2);
  }

  onDonateClicked(donateNow) {
    this.props.onDonate(this.props.item.itemID, this.props.item.title, this.props.item.price, this.state.numItems, donateNow);
    this.onHide();
  }


  render() {
    if(this.props.item === null) {
      return null;
    }

    let need = this.getCurrentValue(this.state.numItems) / this.props.item.goalAmount;
    if(need > 1) {
      need = 1;
    }

    // let needDescription;

    let needLabel;
    let needColor;
    if(need <= .3) {
      needLabel = need <= .15 ? translations["critical"][this.props.language] : translations["high"][this.props.language];
      needColor= "danger";
    }
    else if (need <= .6) {
      needLabel = translations["medium"][this.props.language];
      needColor = "warning";
    }
    else if (need < 1){
      needLabel = need <= .9 ? translations["low"][this.props.language] : translations["verylow"][this.props.language];
      needColor = "success";
    }  
    else {
      needLabel = translations["none"][this.props.language];
      needColor = "success";
    }
    need -= this.props.item.need;
    needLabel = translations["need"][this.props.language] + ": " + needLabel;
    // needDescription = "This is a description of the above need and how it works.";
    //let needBarLabel = (need * 100).toFixed(0) + "%";
    let formattedPrice = this.formatPrice(this.props.item.price);

    return (
      <Modal
        size="sm"
        show={this.props.show}
        onHide={this.onHide}
        dialogClassName="item-view"
      >
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>
          <b>{this.props.item.title + " (" + formattedPrice + ")"}</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="item-info">
          <Img src={imageAPI + this.props.item.itemID} height={200} width={200} alt={this.props.item.title}/>
           <p><b>{translations["description"][this.props.language]}:</b></p>
           <hr />
           <p className="description">{this.props.item.description}</p>
         </div>
         <div className="need-data">
           <h4 className={"need-" + needColor}><b>{needLabel}</b></h4>
           <ProgressBar className="need-bar">
            <ProgressBar bsStyle={needColor} now={this.props.item.need * 100}/>
            <ProgressBar active bsStyle={needColor} now={need * 100}/>
          </ProgressBar>       
        </div>
        <hr />
         {this.props.isLoggedIn && 
          <div className="donate-container">
            <div className="equation">
              <p className="equation-top"><NumericInput min={0} value={this.state.numItems} step={this.calcInputIncrement()} onChange={this.numItemsUpdated}/></p>
              <p className="equation-bottom">x {formattedPrice}</p>
              <p className="equation-result">{this.formatPrice(this.state.numItems * this.props.item.price)}</p>
            </div>
            <div className="btn-container">
              <Button className="add-to btn" disabled={this.state.numItems ===0} onClick={() => this.onDonateClicked(false)}><b>{translations["addTo"][this.props.language]}</b></Button>    
              <Button className="donate-now btn" disabled={this.state.numItems === 0} onClick={() => this.onDonateClicked(true)}><b>{translations["donateNow"][this.props.language]}</b></Button>      
            </div>
          </div>
         }
         {!this.props.isLoggedIn &&
          <div>
            <hr />
            <p>You must be logged in to donate. <span className="modal-link" onClick={this.props.forceLogin}>Log in now.</span></p>
          </div>
         }
        </Modal.Body>
    </Modal>
    );}
}

DirectItemView.propTypes = {
  item: PropTypes.shape({
    itemID: PropTypes.number,
    itemType: PropTypes.oneOf(["direct", "fund", "sponsor"]),
    title: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    need: PropTypes.number,
    imagePath: PropTypes.string,
    actualAmount: PropTypes.number,
    goalAmount: PropTypes.number
  }),
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
  show: PropTypes.bool,
  hide: PropTypes.func,
  language: PropTypes.string,
  onDonate: PropTypes.func,
  isLoggedIn: PropTypes.bool,
  forceLogin: PropTypes.func
}