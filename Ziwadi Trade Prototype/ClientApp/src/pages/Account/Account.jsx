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
    "English": "Your Donations",
    "Swahili": "Usaidizi Wako"
  }
}

export class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recentDonations: []
    }

    this.loadRecentDonations = this.loadRecentDonations.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.getNonMobileColumns = this.getNonMobileColumns.bind(this);
    this.getMobileColumns = this.getMobileColumns.bind(this);
  }

  getNonMobileColumns(){
    return [
      {
        Header: translations["id"][this.props.language],
        accessor: "donationID",
        minWidth: 40,
        maxWidth: 100
      },
      {
        Header: translations["name"][this.props.language],
        accessor: "name"
      },
      {
        Header: translations["total"][this.props.language],
        accessor: "totalAmount",
        minWidth: 40,
        maxWidth: 100,
        Cell: props => <span>${props.value.toFixed(2)}</span>
      },
      {
        Header: translations["date"][this.props.language],
        accessor: "date",
        Cell: props => <span>{new Date(props.value).toLocaleString()}</span>
      },
      {
        Header: translations["status"][this.props.language],
        accessor: "status"
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
        minWidth: 40,
        maxWidth: 100
      },
      {
        Header: translations["name"][this.props.language],
        accessor: "name"
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

  getColumns() {
    return [
      {
        Header: <h2>{translations["recentdonations"][this.props.language]}</h2>,
        columns: isMobile? this.getMobileColumns() : this.getNonMobileColumns()
      }];
  }

  componentDidMount() {
    this.loadRecentDonations();
  }

  loadRecentDonations() {
    _accountCalls.GetRecentDonations(this.props.userID, this.props.language, "USD")
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          recentDonations: response.payload
        });
      }
      else {
        toast.error("Error loading recent donations: " + response.message);
      }
    })
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
}