import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import Img from 'react-image';
import graySquare from '../../media/GraySquare.png';

export default class ItemPreview extends Component {
  
  trimDescription(){
    let desc = this.props.item.description;
    if(desc.length > 800){
      return desc.substring(0, 800) + "...";
    }
    else return desc;
  }

  formatPrice() {
    let price = this.props.item.price;
    if(this.props.currency === "USD") {
      price = "$" + price; 
    }
    else {
      price = price + " " + this.props.currency;
    }
    return price;
  }

  render() {
    let needLabel;
    let needColor;
    if(this.props.item.need <= .3) {
      needLabel = this.props.item.need <= .15 ? "CRITICAL" : "HIGH";
      needColor= "danger";
    }
    else if (this.props.item.need <= .6) {
      needLabel = "MEDIUM";
      needColor = "warning";
    }
    else {
      needLabel = this.props.item.need <= .9 ? "LOW" : "VERY LOW";
      needColor = "success";
    }

    return (
      <div className="item-preview" onClick={() => this.props.itemClicked(this.props.item)}>
        <div className="col-15">
          <Img src={this.props.item.imageBase} className="img"/>
          <p className={"need-" + needColor}><b>Need: {needLabel}</b></p>
          <ProgressBar bsStyle={needColor} now={this.props.item.need * 100} />
        </div>
        <div className = "col-85">
          <h4 className="title"> {this.props.item.title} </h4>
          <hr />
          <h4 className="price">{this.formatPrice()}</h4>
          <hr />
          <p className="description"> {this.trimDescription()}</p>
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
    imageBase: PropTypes.string,
  }),
  currency: PropTypes.string,
  itemClicked: PropTypes.func
}