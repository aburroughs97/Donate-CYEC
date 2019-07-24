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

export default class CartItemView extends Component {
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
    this.onUpdateClicked = this.onUpdateClicked.bind(this);
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
      numItems: this.props.cartItem.numItems,
    });
    this.props.hide();
  }

  calcInputIncrement() {    
    let len = (this.props.item.goalAmount + "").length;
    if (len === 1) return 1;
    else return 10**(len - 2);
  }

  onUpdateClicked() {
    this.props.onSave(this.props.item.itemID, this.state.numItems * this.props.item.price, this.state.numItems);
    this.onHide();
  }

  componentWillReceiveProps(props) {
    if(props.item !== null) {
      this.setState({
        numItems: props.cartItem.numItems
      });
    }
  }


  render() {
    let { item, language, cartItem } = this.props;
    let { numItems } = this.state;

    if(item === null || item.itemType !== "direct") {
      return null;
    }

    let need = this.getCurrentValue(numItems) / item.goalAmount;
    if(need > 1) {
      need = 1;
    }
    
    let needLabel;
    let needColor;
    if(need <= .3) {
      needLabel = need <= .15 ? translations["critical"][language] : translations["high"][language];
      needColor= "danger";
    }
    else if (need <= .6) {
      needLabel = translations["medium"][language];
      needColor = "warning";
    }
    else if (need < 1){
      needLabel = need <= .9 ? translations["low"][language] : translations["verylow"][language];
      needColor = "success";
    }  
    else {
      needLabel = translations["none"][language];
      needColor = "success";
    }
    need -= item.need;
    needLabel = translations["need"][language] + ": " + needLabel;
    // needDescription = "This is a description of the above need and how it works.";
    let formattedPrice = this.formatPrice(item.price);

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
          <ProgressBar className="need-bar">
            <ProgressBar bsStyle={needColor} now={item.need * 100}/>
            <ProgressBar active bsStyle={needColor} now={need*100}/>
          </ProgressBar>
        </div>
        {/* <p className="need-description">{needDescription}</p> */}
        <div>
          <hr />
          <p className="equation-top">Number of Items: <NumericInput min={0} value={numItems} step={this.calcInputIncrement()} onChange={this.numItemsUpdated}/></p>
          <p className="equation-bottom">x {formattedPrice}</p>
          <Button className="donate-now btn" onClick={() => this.onHide()}><b>{translations["cancel"][language]}</b></Button>      
          <Button className="add-to btn" disabled={numItems === cartItem.numItems} onClick={() => this.onUpdateClicked()}>
            {numItems > 0 && <b>{translations["update"][this.props.language]}: {this.formatPrice(numItems * item.price)}</b>}
            {numItems === 0 && <b>{translations["remove"][this.props.language]}</b>}
          </Button>    
        </div>
      </Modal.Body>
    </Modal>
    );}
}

CartItemView.propTypes = {
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