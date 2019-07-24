import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import Img from '../Img';

const translations = {
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
}

const imageAPI = "/api/Donate/GetImage?itemID="

export default class ItemPreview extends Component {
  
  trimDescription(){
    let desc = this.props.item.description;
    if(desc.length > 800){
      return desc.substring(0, 800) + "...";
    }
    else return desc;
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

  getFundLabel() {
    let ratio = (this.props.item.need - .5) * 2;
    return this.formatPrice(ratio * this.props.item.price) + " / " + this.formatPrice(this.props.item.price);
  }

  render() {
    let need = this.props.item.need;

    let needLabel;
    let needColor;
    if(this.props.item.itemType === "direct") {
      if(need <= .3) {
        needLabel = need <= .15 ? translations["critical"][this.props.language] : translations["high"][this.props.language];
        needColor= "danger";
      }
      else if (need <= .6) {
        needLabel = translations["medium"][this.props.language];
        needColor = "warning";
      }
      else {
        needLabel = need <= .9 ? translations["low"][this.props.language] : translations["verylow"][this.props.language];
        needColor = "success";
      }  
      needLabel = translations["need"][this.props.language] + ": " + needLabel;
    }
    else {
      need = (need - .5) * 2;
      needColor = this.props.item.itemType === "fund" ? "info" : "default";
      needLabel = this.getFundLabel();
    }

    return (
      <div className="item-preview" onClick={() => this.props.itemClicked(this.props.item)}>
        <div className="col-15">
          <Img src={imageAPI + this.props.item.itemID} height={145} width={145} alt={this.props.item.title}/>
          <p className={"need-" + needColor}><b>{needLabel}</b></p>
          {needColor !== "default" && <ProgressBar bsStyle={needColor} now={need * 100}/>}
          {needColor === "default" && <ProgressBar now={need * 100}/>}
        </div>
        <div className = "col-85">
          <h4 className={!this.props.languageChanged ? "title" : "title-hidden"}> {this.props.item.title} </h4>
          <hr />
          <h4 className={!this.props.currencyChanged ? "price" : "price-hidden"}>{this.formatPrice(this.props.item.price)}</h4>
          <hr />
          <p className={!this.props.languageChanged ? "description" : "description-hidden"}> {this.trimDescription()}</p>
        </div>
      </div>
    );}
}

ItemPreview.propTypes = {
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
  language: PropTypes.string,
  itemClicked: PropTypes.func,
  languageChanged: PropTypes.bool,
  currencyChanged: PropTypes.bool
}