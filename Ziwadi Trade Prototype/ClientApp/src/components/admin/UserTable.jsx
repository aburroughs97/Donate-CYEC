import React, { Component } from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import ReactTable from 'react-table';
import { toast } from 'react-smart-toaster';
import * as _adminCalls from '../../API/AdminCalls';

export default class UserTable extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.loadUserTableColumns = this.loadUserTableColumns.bind(this);
    this.handleMakeAdmin = this.handleMakeAdmin.bind(this);
  }

  loadUserTableColumns() { 
    return [{
      Header: "ID",
      accessor: "userID",
      className:"table-cell",
      minWidth: 40,
      maxWidth: 40
    },
    {
      Header: "Email",
      accessor: "email",
      className:"table-cell",
    },
    {
      Header: "First Name",
      accessor: "firstName",
      className:"table-cell",
    },
    {
      Header: "Last Name",
      accessor: "lastName",
      className:"table-cell",
    },
    {
      Header: "Admin",
      accessor: "isAdmin",
      minWidth: 120,
      maxWidth: 200,
      className:"table-cell",
      Cell: (props) => { return props.value ? <Glyphicon glyph='check'/> : <Button className="table-btn" onClick={() => this.handleMakeAdmin(props.original)}>Make Admin</Button> } 
    }
  ];
}


handleMakeAdmin(row){
  _adminCalls.MakeUserAdmin(row.userID)
    .then((response) => {
      if(response.isSuccess){
        let users = this.state.users;
        let user = users.find(x => x.userID === row.userID);
        user.isAdmin = true;
        this.setState({
          users
        });
        toast.success(row.firstName + " is now an admin!");         
      }
      else {
        toast.error("Error making user admin.");
      }
    })
}

componentDidMount() {
  _adminCalls.GetAllUsers()
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          users: response.payload
        });
      }
      else {
        toast.error("Error loading users.");
      }
    });
}

  render() {
    return (
      <div className="admin-body user">
          <ReactTable
            className="table"
            defaultPageSize={15}
            data={this.state.users}
            columns={this.loadUserTableColumns()}
            showPaginationTop
            showPaginationBottom={false}
            showPageSizeOptions={false}
          />
      </div>
    )
  }
}