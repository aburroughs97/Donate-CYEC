import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import Img from "../../Img";
import ReactTable from "react-table";
import { isMobile } from 'react-device-detect';

// const translations = {

// }

const columnClassNames = {
  headerClassName: "checkout-table-header",
  className: "checkout-table-cell",
  footerClassName: "checkout-table-footer"
};

const imageAPI = "/api/Donate/GetImage?itemID=";

export default class CheckoutTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseEntered: false
    };
  }

  loadColumns() {
    return [
      {
        Header: "",
        accessor: "itemID",
        sortable: false,
        filterable: false,
        minWidth: 120,
        maxWidth: 120,
        ...columnClassNames,
        Cell: props => (
          <Img src={imageAPI + props.value} height={80} width={80} alt="X" />
        )
      },
      {
        Header: "Name",
        accessor: "name",
        ...columnClassNames
      },
      {
        Header: "Price",
        accessor: "price",
        ...columnClassNames,
        Cell: props => <span>{this.formatPrice(props.value)}</span>
      },
      {
        Header: "Number of Items",
        accessor: "numItems",
        ...columnClassNames,
        Cell: props => <span>{props.value !== null ? props.value : ""}</span>
      },
      {
        Header: this.props.type !== "dropoff" ? "Total Value" : "Value",
        accessor: "totalAmount",
        headerClassName: "checkout-table-header total",
        className: "checkout-table-cell",
        footerClassName: "checkout-table-footer",
        Footer: (
          <Button
            disabled={this.props.disableButton}
            className="checkout-btn"
            onClick={this.props.makeDonation}
          >
            Make Donation: {this.formatPrice(this.props.total)}
          </Button>
        ),
        Cell: props => (
          <span className="total">{this.formatPrice(props.value)}</span>
        )
      }
    ];
  }

  loadMobileColumns() {
    return [
      {
        Header: "",
        accessor: "itemID",
        sortable: false,
        filterable: false,
        minWidth: 100,
        maxWidth: 100,
        ...columnClassNames,
        Cell: props => (
          <Img src={imageAPI + props.value} height={60} width={60} alt="X" />
        )
      },
      {
        Header: "Item Info",
        ...columnClassNames,
        Cell: props => {
          let item = props.original;
          let price = item.numItems === null ? this.formatPrice(item.price) : item.numItems + " x " + this.formatPrice(item.price); 
          return (
            <div>
              <p>{item.name}</p>
              <p>{price}</p>
            </div>
          )
        },
        Footer: (
          <Button
            disabled={this.props.disableButton}
            className="checkout-btn"
            onClick={this.props.makeDonation}
          >
            Make Donation
          </Button>
        ),
      },
      {
        Header: this.props.type !== "dropoff" ? "Total Value" : "Value",
        accessor: "totalAmount",
        headerClassName: "checkout-table-header total",
        className: "checkout-table-cell",
        footerClassName: "checkout-table-footer",
        minWidth: 100,
        maxWidth: 100,
        Cell: props => (
          <span className="total">{this.formatPrice(props.value)}</span>
        ),
        Footer: (
          <div className="value-footer">{this.formatPrice(this.props.total)}</div>
        )
      }
    ];
  }

  formatPrice(price) {
    let roundDigits =
      this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    price = price.toFixed(roundDigits);
    if (this.props.currency.symbolBefore) {
      return this.props.currency.currencySymbol + "" + price;
    } else {
      return price + "" + this.props.currency.currencySymbol;
    }
  }

  render() {
    return (
      <ReactTable
        showPageSizeOptions={false}
        showPagination={false}
        className="checkout-table"
        defaultPageSize={this.props.items.length}
        data={this.props.items}
        columns={isMobile ? this.loadMobileColumns() : this.loadColumns()}
      />
    );
  }
}

CheckoutTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      itemID: PropTypes.number,
      name: PropTypes.string,
      price: PropTypes.number,
      totalAmount: PropTypes.number,
      numItems: PropTypes.number,
      need: PropTypes.number
    })
  ),
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
  language: PropTypes.string,
  total: PropTypes.number,
  makeDonation: PropTypes.func,
  type: PropTypes.string,
  disableButton: PropTypes.bool
};
