import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ReactTable from 'react-table'
import { AccountSidebar } from '../../components/account/AccountSidebar';
import { isMobile } from 'react-device-detect';
import '../../styles/Account.css';
import 'react-table/react-table.css'

//TODO: Figure out how to translate columns

const nonMobileColumns = [
  {
    Header: "ID #",
    accessor: "id",
    minWidth: 40,
    maxWidth: 100
  },
  {
    Header: "Name",
    accessor: "name"
  },
  {
    Header: "Total",
    accessor: "total",
    minWidth: 40,
    maxWidth: 100,
    Cell: props => <span>${props.value}</span>
  },
  {
    Header: "Date",
    accessor: "date"
  },
  {
    Header: "Status",
    accessor: "status"
  },
  {
    Header: "",
    sortable: false,
    filterable: false,
    minWidth: 120,
    maxWidth: 200,
    Cell: <Button className="table-btn">View Donation</Button>
  }];

const mobileColumns = [
  {
    Header: "ID #",
    accessor: "id",
    minWidth: 40,
    maxWidth: 100
  },
  {
    Header: "Name",
    accessor: "name"
  },
  {
    Header: "",
    sortable: false,
    filterable: false,
    minWidth: 120,
    maxWidth: 200,
    Cell: <Button className="table-btn">View Donation</Button>
  }];
const columns = [
  {
    Header: <h2>Recent Donations</h2>,
    columns: isMobile? mobileColumns : nonMobileColumns
  }]

const data = [
  {
    id: 31,
    date: new Date().toDateString(),
    status: "In Progress",
    total: 60,
    name: "TEST ITEM #1"
  },
  {
    id: 32,
    date: new Date().toDateString(),
    status: "Finished",
    total: 45,
    name: "TEST ITEM #2"
  }];

// const translations = {

// }

export class Account extends Component {
  
  render() {
    return (
      <div className="account-content">
        <AccountSidebar userID={this.props.userID} updateFirstName={this.props.updateFirstName} logOut={this.props.logOut} language={this.props.language}/>
        <div className="donation-table">
          <ReactTable
            pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
            defaultPageSize={15}
            data={data}
            columns={columns}
          />
        </div>
      </div>
    );}
}

Account.propTypes = {
  userID: PropTypes.number,
  language: PropTypes.string,
  updateFirstName: PropTypes.func,
  logOut: PropTypes.func,
}