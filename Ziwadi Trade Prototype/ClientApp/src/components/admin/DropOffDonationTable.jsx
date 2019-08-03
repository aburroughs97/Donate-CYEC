import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import ReactTable from 'react-table';
import { toast } from 'react-smart-toaster';
import * as _adminCalls from '../../API/AdminCalls';

export default class DropOffDonationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donations : []
    };

    this.loadDropOffDonationColumns = this.loadDropOffDonationColumns.bind(this);
    this.formatPrice = this.formatPrice.bind(this);
    this.markAsDelivered = this.markAsDelivered.bind(this);
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

  loadDropOffDonationColumns() { 
    return [{
      Header: "ID",
      accessor: "donationID",
      minWidth: 40,
      maxWidth: 40,
      className:"table-cell",
    },
    {
      Header: "Full Name",
      accessor: "fullName",
      className:"table-cell",
    },
    {
      Header: "Total Value",
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
    {
      Header: "Delivery Date",
      className:"table-cell important",
      headerClassName: "table-header important",
      Cell: (props) => {
        let donation = props.original;
        let date = new Date(donation.deliveryDate);
        let currentDate = new Date(Date.now());
        let className = (date > currentDate || donation.delivered) ? "success" : (date.toDateString() === currentDate.toDateString() ? "warning" : "error");
        return <span className={className}>{date.toLocaleDateString()}</span>
      }

    },
    {
      Header: "Delivered",
      accessor: "delivered",
      className: "table-cell",
      headerClassName: "table-header important",
      minWidth: 120,
      maxWidth: 200,
      Cell: (props) => { return props.value ? <Glyphicon glyph='check' className="table-check"/> : <Button className="table-btn" onClick={() => this.markAsDelivered(props.original)}>Mark as Delivered</Button> } 
    }
  ];
}

markAsDelivered(row) {
  _adminCalls.MarkAsDelivered(row.donationID)
  .then((response) => {
    if(response.isSuccess) {
      let donations = this.state.donations;
      let donation = donations.find(x => x.donationID === row.donationID);
      donation.delivered = true;
      this.setState({
        donations
      });
      toast.success("Donation marked as delivered!");     
    }
    else {
      toast.error("Error updating donation: " + response.message);
    }
  });
}

componentDidMount() {
  _adminCalls.GetDropOffDonations()
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
            columns={this.loadDropOffDonationColumns()}
            showPaginationTop
            showPaginationBottom={false}
            showPageSizeOptions={false}
          />
      </div>
    )
  }
}

DropOffDonationTable.propTypes = {
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
}