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
    "Swahili": "S-Add to Cart"
  },
  "donateNow": {
    "English": "Donate Now",
    "Swahili": "Patia Sasa"
  },
  "cancel": {
    "English": "Cancel",
    "Swahili": "S-Cancel"
  },
  "update": {
    "English": "Update",
    "Swahili": "S-Update"
  },
  "remove": {
    "English": "Remove",
    "Swahili": "S-Remove"
  }
}

const imageAPI = "/api/Donate/GetImage?itemID=";

export default class CartFundItemView extends Component {
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
    this.onUpdateClicked = this.onUpdateClicked.bind(this);
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

  componentWillReceiveProps(props) {
    if(props.item !== null) {
      this.setState({
        amountToDonate: props.cartItem.totalAmount
      });
    }
  }

  onUpdateClicked() {
    this.props.onSave(this.props.item.itemID, this.state.amountToDonate, null);
    this.onHide();
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

  render() {
    let { item, cartItem, language } = this.props;
    let { amountToDonate } = this.state;
    if(item === null || item.itemType === "direct") {
      return null;
    }

    let need = (item.actualAmount + amountToDonate) / item.goalAmount;
    let itemNeed = item.actualAmount / item.goalAmount;
    let needColor = item.itemType === "fund" ? "info" : "default";
    let needLabel = this.formatPrice((amountToDonate + item.actualAmount)) + " / " + this.formatPrice(item.goalAmount);
    let needBarLabel = "";
    // let needDescription = "This is a description of the above fund and how it works."

    let formattedPrice = this.formatPrice(item.price);

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
          <hr />
          <p className="equation-top">Amount To Donate: <NumericInput min={0} max={this.calcMaxInputValue()} precision={2} value={amountToDonate} step={this.calcInputIncrement()} onChange={this.amountToDonateUpdated}/></p>
          <Button className="donate-now btn" onClick={() => this.onHide()}><b>{translations["cancel"][this.props.language]}</b></Button>      
          <Button className="add-to btn" disabled={amountToDonate === cartItem.totalAmount} onClick={() => this.onUpdateClicked()}>
            {amountToDonate > 0 && <b>{translations["update"][language]}: {this.formatPrice(amountToDonate)}</b>}
            {amountToDonate === 0 && <b>{translations["remove"][language]}</b>}
          </Button>    
      </Modal.Body>
    </Modal>
    );}
}

CartFundItemView.propTypes = {
  item: PropTypes.shape({
    itemID: PropTypes.number,
    itemType: PropTypes.oneOf(["direct", "fund", "sponsor"]),
    title: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    need: PropTypes.number,
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
  onSave: PropTypes.func,
  cartItem: PropTypes.shape({
    itemID: PropTypes.number,
    name: PropTypes.string,
    price: PropTypes.number,
    totalAmount: PropTypes.number,
    numItems: PropTypes.number,
    need: PropTypes.number
  })
}