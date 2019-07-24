import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Button, Glyphicon } from 'react-bootstrap';
import ReactTable from 'react-table';
import { AdminSidebar } from '../../components/Components';
import * as _adminCalls from '../../API/AdminCalls';
import '../../styles/Admin.css';
import { toast } from 'react-smart-toaster';

//const options = ["products", "users", "information"];

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOptionsIndex: 0,
      users: []
    };
    this.optionChanged = this.optionChanged.bind(this);
  }

  userTableColumns = [
    {
      Header: "ID",
      accessor: "userID",
      minWidth: 40,
      maxWidth: 100
    },
    {
      Header: "Email",
      accessor: "email"
    },
    {
      Header: "First Name",
      accessor: "firstName"
    },
    {
      Header: "Last Name",
      accessor: "lastName"
    },
    {
      Header: "Admin",
      accessor: "isAdmin",
      minWidth: 120,
      maxWidth: 200,
      Cell: (props, row) => { return props.value ? <Glyphicon glyph='check'/> : <Button className="table-btn" onClick={() => this.handleMakeAdmin(props.original)}>Make Admin</Button> } 
    }
  ];

  handleMakeAdmin(row){
    _adminCalls.MakeUserAdmin(row.userID)
      .then((response) => {
        if(response.isSuccess){
          
          //Update state somehow
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

  optionChanged(newIndex){
    this.setState({
      selectedOptionsIndex: newIndex
    })
  }  

  renderProductsBody() {
    return (
      <div className="admin-body">
        Products
      </div>
    );
  }

  renderUsersBody() {
    return (
      <div className="admin-body">
          <ReactTable
            pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
            defaultPageSize={15}
            data={this.state.users}
            columns={this.userTableColumns}
          />
      </div>
    );
  }

  renderInformationBody() {
    return (
      <div className="admin-body">
        Information
      </div>
    );
  }

  render() {
    let { isLoggedIn, isAdmin } = this.props;
    if(!isLoggedIn) {
      toast.error("You must be logged in to access this page.");
      this.props.history.push("/");
      return null;
    }
    if(!isAdmin) {
      toast.error("You do not have permission to access this page.");
      this.props.history.push("/");
      return null;
    }

    let body;
    switch(this.state.selectedOptionsIndex){
      case 0:
        body = this.renderProductsBody();
        break;
      case 1:
        body = this.renderUsersBody();
        break;
      case 2:
        body = this.renderInformationBody();
        break;
      default:
        body = <h2>An error as occured</h2>
        break;
    }
    return (
      <div className="account-content">
        <AdminSidebar optionChanged={this.optionChanged} selectedOptionsIndex={this.state.selectedOptionsIndex}/>
        {body}
      </div>
    );
  }
};

Admin.propTypes = {
  isLoggedIn: PropTypes.bool,
  isAdmin: PropTypes.bool
};

export default withRouter(Admin)
