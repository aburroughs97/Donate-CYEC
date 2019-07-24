import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Modal, Button} from 'react-bootstrap';
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

export default class FundItemView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amountToDonate: 0,
      needDescriptions: {
        "CRITICAL": "This is a description of a critical need",
        "HIGH": "This is a description of a high need",
        "MODERATE": "This is a description of a moderate need",
        "LOW": "This is a description of a low need",
        "VERY LOW": "This is a description of a very low need"
      }
    }

    this.formatPrice = this.formatPrice.bind(this);
    this.amountToDonateUpdated = this.amountToDonateUpdated.bind(this);
    this.onHide = this.onHide.bind(this);
    this.getCurrentValue = this.getCurrentValue.bind(this);
    this.onDonateClicked = this.onDonateClicked.bind(this);
  }

  formatPrice(price) {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    price = price.toFixed(roundDigits);
    if(this.props.currency.symbolBefore) {
      return this.props.currency.currencySymbol + "" + price;
    }
    else {
      return price + "" + this.props.currency.currencySymbol
    }
  }

  amountToDonateUpdated(amountToDonate) {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;

    if(amountToDonate < 0) return;
    else if(this.getCurrentValue(amountToDonate) > this.props.item.price) {
      this.setState({
        amountToDonate: Number.parseFloat((this.props.item.price - this.getCurrentValue(0)).toFixed(roundDigits))
      });
    }
    else {
      this.setState({
        amountToDonate,
      });
    }
  }

  calcMaxInputValue() {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    return Number.parseFloat((this.props.item.price - this.getCurrentValue(0)).toFixed(roundDigits));
  }

  calcInputIncrement() {
    let priceStr = this.props.item.price + "";
    let len = priceStr.length;
    if(this.props.currency.roundDigits > 0 && priceStr.includes(".")) {
      len -= (this.props.currency.roundDigits + 1);
    }
    if (len === 1) return 1;
    else return 10**(len - 2);
  }

  onHide() {
    this.setState({
      amountToDonate: 0,
    });
    this.props.hide();
  }

  getCurrentValue(amount) {
    let ratio = (this.props.item.need - .5) * 2;
    return (ratio * this.props.item.price) + amount;
  }

  getFundLabel() {
    return  this.formatPrice(this.getCurrentValue(this.state.amountToDonate)) + " / " + this.formatPrice(this.props.item.price);
  }

  onDonateClicked(donateNow) {
    this.props.onDonate(this.props.item.itemID, this.state.amountToDonate, donateNow);
    this.onHide();
  }

  render() {
    if(this.props.item === null) {
      return null;
    }

    let need = this.getCurrentValue(this.state.amountToDonate) / this.props.item.price;
    if(need > 1) {
      need = 1;
    }
    let itemNeed = this.getCurrentValue(0) / this.props.item.price;
    let needColor = this.props.item.itemType === "fund" ? "info" : "default";
    let needLabel = this.getFundLabel();
    let needBarLabel = (need * 100).toFixed(0) + "%";
    // let needDescription = "This is a description of the above fund and how it works."

    let formattedPrice = this.formatPrice(this.props.item.price);

    need -= itemNeed;

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
          {needColor !== "default" && 
            <ProgressBar className="need-bar" label={needBarLabel}>
              <ProgressBar bsStyle={needColor} now={itemNeed * 100} />
              <ProgressBar active bsStyle={needColor} now={need * 100}/>
            </ProgressBar>}
          {needColor === "default" && 
            <ProgressBar className="need-bar" label={needBarLabel}>
              <ProgressBar now={itemNeed * 100} />
              <ProgressBar active now={need * 100}/>
            </ProgressBar>
          }
         </div>
         {/* <p className="need-description">{needDescription}</p> */}
          <hr />
          <p className="equation-top">Amount To Donate: <NumericInput min={0} max={this.calcMaxInputValue()} precision={2} value={this.state.amountToDonate} step={this.calcInputIncrement()} onChange={this.amountToDonateUpdated}/></p>
          <Button className="donate-now btn" disabled={this.state.amountToDonate === 0} onClick={() => this.onDonateClicked(true)}><b>{translations["donateNow"][this.props.language]}</b></Button>      
          <Button className="add-to btn" disabled={this.state.amountToDonate === 0} onClick={() => this.onDonateClicked(false)}><b>{translations["addTo"][this.props.language]}</b></Button>
      </Modal.Body>
    </Modal>
    );}
}

FundItemView.propTypes = {
  item: PropTypes.shape({
    itemID: PropTypes.number,
    itemType: PropTypes.oneOf(["direct", "fund", "sponsor"]),
    title: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    need: PropTypes.number,
    imagePath: PropTypes.string,
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
  showDonateButtons: PropTypes.bool
}