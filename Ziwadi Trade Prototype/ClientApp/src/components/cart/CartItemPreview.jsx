import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import Img from '../Img';

// const translations = {

// }

const imageAPI = "/api/Donate/GetImage?itemID="

export default class CartItemPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.startOpen
    };

    this.removeCartItem = this.removeCartItem.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
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

  removeCartItem(event) {
    event.stopPropagation();
    this.props.removeCartItem(this.props.item.itemID, this.props.item.name);
  }

  toggleExpand() {
    let { expanded } = this.state;
    this.setState({
      expanded: !expanded
    });
  }

  render() {
    let total;
    let { item, languageChanged, currencyChanged } = this.props;
    let { expanded } = this.state;
    if(item.numItems === null) {
      total = this.formatPrice(item.totalAmount);
    }
    else {
      total = this.formatPrice(item.price * item.numItems);
    }
    let isDirect = item.numItems !== null;
    return (
      <div className={expanded ? "cart-item-preview" : "cart-item-preview min"}>
        <div className="preview-header"  onClick={this.toggleExpand}>
          <Glyphicon className="expand-btn" glyph={expanded ? "minus" : "plus"}/>
          <h4 className={!languageChanged ? "name" : "name text-hidden"}>{item.name}</h4>
          <p className={!currencyChanged ? "total" : "total text-hidden"}>{total}</p>
        </div>
        <div id="fade-in" className={"preview-body " + (expanded ? "show" : "")}>
            <div className="img-container">
            <Img src={imageAPI + item.itemID} height={100} width={100} alt={item.name}/>
          </div>
            <div className="info-container">
              <div className={isDirect ? "price-container" : "goal-container"}>
                <p className="price">
                  <b>{isDirect ? "Price: " : "Goal: "}</b>
                  <span className={currencyChanged ? "text-hidden" : ""}>{this.formatPrice(item.price)}</span>
                  </p>
                {isDirect && <p className="numItems"><b>Items: </b>{item.numItems}</p>}
              </div>
              <div className="btn-container">
                <Button className="btn" onClick={() => this.props.itemClicked(item)}>{isMobile ? <Glyphicon glyph="edit"/> : "Edit"}</Button>
                <Button className="btn" onClick={this.removeCartItem}>{isMobile ? <Glyphicon glyph="remove-sign" /> : "Edit"}</Button>
              </div>
            </div>
        </div>
      </div>
    );}
}

CartItemPreview.propTypes = {
  item: PropTypes.shape({
    itemID: PropTypes.number,
    name: PropTypes.string,
    price: PropTypes.number,
    totalAmount: PropTypes.number,
    numItems: PropTypes.number,
    need: PropTypes.number
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
  currencyChanged: PropTypes.bool,
  startOpen: PropTypes.bool
}