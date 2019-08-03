import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Button } from 'react-bootstrap';
import ReactTable from 'react-table'
import { AccountSidebar } from '../../components/Components';
import { isMobile } from 'react-device-detect';
import * as _accountCalls from '../../API/AccountCalls';
import { toast } from 'react-smart-toaster';
import '../../styles/Account.css';
import 'react-table/react-table.css'

const translations = {
  "id": {
    "English": "ID",
    "Swahili": "ID",
  },
  "name": {
    "English": "Name",
    "Swahili": "Jina"
  },
  "total": {
    "English": "Total",
    "Swahili": "Jumuisho",
  },
  "date": {
    "English": "Date",
    "Swahili": "Tarehe"
  },
  "status": {
    "English": "Status",
    "Swahili": ""
  },
  "viewdonation": {
    "English": "View Donation",
    "Swahili": "Ona !!Usaidizi"
  },
  "recentdonations": {
    "English": "Your Recent Donations",
    "Swahili": "Usaidizi Wako"
  }
}

export class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recentDonations: [],
      loadingDonations: true,
      languageChanged: false,
      currencyChanged: false,
    }

    this.loadRecentDonations = this.loadRecentDonations.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.getNonMobileColumns = this.getNonMobileColumns.bind(this);
    this.getMobileColumns = this.getMobileColumns.bind(this);
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

  getNonMobileColumns(){
    return [
      {
        Header: translations["id"][this.props.language],
        accessor: "donationID",
        className: "table-cell",
        minWidth: 40,
        maxWidth: 100
      },
      {
        Header: translations["name"][this.props.language],
        accessor: "name",
        className: "table-cell",
      },
      {
        Header: translations["total"][this.props.language],
        accessor: "totalAmount",
        className: "table-cell",
        minWidth: 40,
        maxWidth: 100,
        Cell: props => <span>{!this.state.currencyChanged ? this.formatPrice(props.value) : ""}</span>
      },
      {
        Header: translations["date"][this.props.language],
        accessor: "date",
        className: "table-cell",
        Cell: props => <span>{new Date(props.value).toLocaleString()}</span>
      },
      {
        Header: translations["status"][this.props.language],
        accessor: "status",
        className: "table-cell",
        Cell: (props) => {
          let status = props.value;
          let className = (status === "Failed" || status === "Missing") ? "error" : (status === "Pending" ? "warning" : "success");
          return <span className={className}>{status}</span>  
        }
      },
      // {
      //   Header: "",
      //   sortable: false,
      //   filterable: false,
      //   minWidth: 120,
      //   maxWidth: 200,
      //   Cell: <Button className="table-btn">{translations["viewdonation"][this.props.language]}</Button>
      // }
    ];
  } 
  
  getMobileColumns(){
    return [
      {
        Header: translations["id"][this.props.language],
        accessor: "donationID",
        className: "table-cell",
        minWidth: 40,
        maxWidth: 100
      },
      {
        Header: translations["name"][this.props.language],
        accessor: "name",
        className: "table-cell",
      },
      // {
      //   Header: "",
      //   sortable: false,
      //   filterable: false,
      //   minWidth: 120,
      //   maxWidth: 200,
      //   Cell: <Button className="table-btn">{translations["viewdonation"][this.props.language]}</Button>
      // }
    ];
  } 

  componentWillReceiveProps(newProps) {
    let currencyChanged = newProps.currency.code !== this.props.currency.code;
    let languageChanged = newProps.language !== this.props.language;
    if(currencyChanged || languageChanged) {
      this.setState({
        languageChanged,
        currencyChanged
      })
      this.loadRecentDonations(newProps.language, newProps.currency.code);
    }
  }
  getColumns() {
    return [
      {
        Header: <h2>{translations["recentdonations"][this.props.language]}</h2>,
        columns: isMobile? this.getMobileColumns() : this.getNonMobileColumns()
      }];
  }

  componentDidMount() {
    this.loadRecentDonations(this.props.language, this.props.currency.code);
  }

  loadRecentDonations(language, code) {
    _accountCalls.GetRecentDonations(this.props.userID, language, code)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          recentDonations: response.payload,
          loadingDonations: false,
          languageChanged: false,
          currencyChanged: false
        });
      }
      else {
        this.setState({
          loadingDonations: false,
          languageChanged: false,
          currencyChanged: false
        });
        toast.error("Error loading recent donations: " + response.message);
      }
    });
  }
  
  render() {
    if(!this.props.isLoggedIn) {
      toast.error("You must log in first.");
      this.props.history.push("/");
      return null;
    }
    return (
      <div className="account-content">
        <AccountSidebar userID={this.props.userID} updateFirstName={this.props.updateFirstName} logOut={this.props.logOut} language={this.props.language}/>
        <div className="donation-table">
          <ReactTable
            defaultPageSize={10}
            showPageSizeOptions={false}
            data={this.state.recentDonations}
            columns={this.getColumns()}
            loading={this.state.loadingDonations}
          />
        </div>
      </div>
    );}
}

Account.propTypes = {
  isLoggedIn: PropTypes.bool,
  userID: PropTypes.number,
  language: PropTypes.string,
  updateFirstName: PropTypes.func,
  logOut: PropTypes.func,
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    symbolBefore: PropTypes.bool
  }),
}