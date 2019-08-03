import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import ReactTable from 'react-table';
import { toast } from 'react-smart-toaster';
import * as _adminCalls from '../../API/AdminCalls';

export default class PaymentDonationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donations : []
    };

    this.loadPaymentDonationColumns = this.loadPaymentDonationColumns.bind(this);
    this.formatPrice = this.formatPrice.bind(this);
    this.markAsPaid = this.markAsPurchased.bind(this);
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

  loadPaymentDonationColumns() { 
    return [{
      Header: "ID",
      accessor: "donationID",
      className:"table-cell",
      minWidth: 40,
      maxWidth: 40
    },
    {
      Header: "Full Name",
      accessor: "fullName",
      className:"table-cell",
    },
    {
      Header: "Item Name",
      accessor: "itemName",
      className:"table-cell",
    },
    {
      Header: "Number",
      accessor: "numberOfItems",
      className:"table-cell",
      Cell: (props) => <span>{props.value !== null ? props.value : ""}</span>
    },
    {
      Header: "Total Amount",
      accessor: "totalAmount",
      className:"table-cell",
      Cell: (props) => <span>{this.formatPrice(props.value)}</span>
    },
    {
      Header: "Donation Date",
      accessor: "date",
      className:"table-cell",
      Cell: (props) => <span>{new Date(props.value).toLocaleDateString()}</span>
    },
    // {
    //   Header: "Status",
    //   accessor: "status",
    //   className:"table-cell",
    //   headerClassName: "table-header important",
    //   Cell: (props) => {
    //     let status = props.value;
    //     let className = status === "Completed" || status === "Paid" ? "success" : (status === "Verified" ? "warning" : "error");
    //     return <span className={className}>{status}</span>
    //   }
    // },
    {
      Header: "Status",
      minWidth: 120,
      maxWidth: 200,
      headerClassName: "table-header important",
      className:"table-cell",
      Cell: (props) => {
        let row = props.original;
        if(row.status === "Verified") {
          return <Button className="table-btn" onClick={() => this.markAsPurchased(row)}>Mark as Paid</Button> 
        }
        else {
          let status = row.status;
          let className = (status === "Completed" || status === "Purchased") ? "success" : (status === "Verified" ? "warning" : "error");
          return <span className={className}>{status}</span>        
        }
      } 
    }
  ];
}

markAsPurchased(row) {
  _adminCalls.MarkAsPurchased(row.donationID)
  .then((response) => {
    if(response.isSuccess) {
      let donations = this.state.donations;
      let donation = donations.find(x => x.donationID === row.donationID);
      donation.status = "Purchased";
      this.setState({
        donations
      });
      toast.success("Donation marked as paid!");     
    }
    else {
      toast.error("Error updating donation: " + response.message);
    }
  });
}

componentDidMount() {
  _adminCalls.GetPaymentDonations()
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          donations: response.payload
        });
      }
      else {
        toast.error("Error loading donations.");
      }
    });
}

  render() {
    return (
      <div className="admin-body user">
          <ReactTable
            className="table"
            defaultPageSize={15}
            data={this.state.donations}
            columns={this.loadPaymentDonationColumns()}
            showPaginationTop
            showPaginationBottom={false}
            showPageSizeOptions={false}
          />
      </div>
    )
  }
}

PaymentDonationTable.propTypes = {
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
}