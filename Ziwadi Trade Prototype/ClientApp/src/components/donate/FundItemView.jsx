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
    let { currency, item } = this.props;
    let roundDigits = currency.roundDigits > 0 ? currency.roundDigits : 0;

    if(amountToDonate < 0) return;
    else if((amountToDonate + item.actualAmount) > item.goalAmount) {
      this.setState({
        amountToDonate: Number.parseFloat((item.goalAmount - item.actualAmount).toFixed(roundDigits))
      });
    }
    else {
      this.setState({
        amountToDonate,
      });
    }
  }

  calcMaxInputValue() {
    let { currency, item } = this.props;
    let roundDigits = currency.roundDigits > 0 ? currency.roundDigits : 0;
    return Number.parseFloat((item.goalAmount - item.actualAmount).toFixed(roundDigits));
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

  onDonateClicked(donateNow) {
    this.props.onDonate(this.props.item.itemID, this.state.amountToDonate, donateNow);
    this.onHide();
  }

  render() {
    let { item, language } = this.props;
    let { amountToDonate } = this.state;
    if(item === null || item.itemType === "direct") {
      return null;
    }

    let need = (item.actualAmount + amountToDonate) / item.goalAmount;
    let itemNeed = item.actualAmount / item.goalAmount;
    let needColor = item.itemType === "fund" ? "info" : "default";
    let needLabel = this.formatPrice((amountToDonate + item.actualAmount)) + " / " + this.formatPrice(item.goalAmount);
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
          <b>{item.title + " (" + formattedPrice + ")"}</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="item-info">
          <Img src={imageAPI + item.itemID} height={200} width={200} alt={item.title}/>
           <p><b>{translations["description"][language]}:</b></p>
           <hr />
           <p className="description">{item.description}</p>
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
         {this.props.isLoggedIn && 
          <div className="donate-container">
            <div className="equation">
              <p className="equation-top">Amount To Donate: <NumericInput min={0} max={this.calcMaxInputValue()} precision={2} value={amountToDonate} step={this.calcInputIncrement()} onChange={this.amountToDonateUpdated}/></p>
            </div>
            <div className="btn-container">
            <Button className="add-to btn" disabled={amountToDonate === 0} onClick={() => this.onDonateClicked(false)}><b>{translations["addTo"][language]}</b></Button>
            <Button className="donate-now btn" disabled={amountToDonate === 0} onClick={() => this.onDonateClicked(true)}><b>{translations["donateNow"][language]}</b></Button>      
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

FundItemView.propTypes = {
  item: PropTypes.shape({
    itemID: PropTypes.number,
    itemType: PropTypes.oneOf(["direct", "fund", "sponsor"]),
    title: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    need: PropTypes.number,
    goalAmount: PropTypes.number,
    actualAmount: PropTypes.number,
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
  forceLogin: PropTypes.func,
}