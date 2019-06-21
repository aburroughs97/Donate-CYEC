import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Button } from 'react-bootstrap';
import Img from 'react-image';

export default class ItemView extends Component {

  render() {
    return (
      <div className="item-view">
        <h2>Item #{this.props.item.itemID} was clicked!</h2>
        <Button onClick={this.props.backClicked}>Back</Button>
      </div>
    );}
}

ItemView.propTypes = {
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
  backClicked: PropTypes.func
}