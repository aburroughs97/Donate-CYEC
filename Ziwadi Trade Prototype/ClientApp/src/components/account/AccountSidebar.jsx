import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormGroup, Form, Col, FormControl, ControlLabel } from 'react-bootstrap';
import { toast } from 'react-smart-toaster';
import * as yup from 'yup';
import * as _accountCalls from '../../API/AccountCalls';


const passwordSchema = yup.string().min(8);

export class AccountSidebar extends Component {
  constructor(props) {
    super(props);
      this.state = {
        user: {
          email: "",
          firstName: "",
          lastName: "",
        },
        retrievedUser: false,
        current: "",
        password: {
          password: "",
          changed: false,
          valid: false
        },
        confirm: {
          password: "",
          changed: false,
          valid: false
        }
      };

    this.retrieveUser = this.retrieveUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmChange = this.handleConfirmChange.bind(this);
    this.validate = this.validate.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  retrieveUser() {
    _accountCalls.GetUser(this.props.userID)
    .then((response) => {
      if(response.isSuccess) {
        let user = response.payload;
        this.setState({
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          retrievedUser: true
        });
      }
      else {
        toast.error("Couldn't fetch user data. Please try again.");
      }
    });
  }

  handleChange(value, sender) {
    if(sender === "current"){
      this.setState({
        current: value
      })
    }
    else {
      this.setState((state) => ({
        user: {...state.user, [sender]: value}
      }));
    }
  }

  handlePasswordChange(event) {
    let password = event.target.value;
    if(passwordSchema.isValidSync(password)) {
      this.setState({ password: {password, changed: true, valid: true }});
    }
    else {
      this.setState({ password: {password, changed: true, valid: false }});
    }
  }

  handleConfirmChange(event) {
    let password = event.target.value;
    if(password === this.state.password.password) {
      this.setState({ confirm: {password, changed: true, valid: true }});
    }
    else {
      this.setState({ confirm: {password, changed: true, valid: false }});
    }
  }

  validate(sender) {
    if(!this.state[sender].changed) return null;
    return this.state[sender].valid ? null : 'error';
  }

  updateUser() {
    if(this.props.userID < 1) return;
    _accountCalls.UpdateUser(this.props.userID, this.state.user.firstName, this.state.user.lastName)
    .then((response) => {
      if(response.isSuccess) {
        toast.success("Account information updated successfully.");
        this.props.updateFirstName(this.state.user.firstName);
      }
      else {
        toast.error("Failed to update account information. Details: " + response.message);
      }
    });
  }

  changePassword() {
    _accountCalls.ChangePassword(this.props.userID, this.state.current, this.state.password.password)
    .then((response) => {
      if(response.isSuccess) {
        toast.success("Password changed successfully.");
        this.props.logOut();
      }
      else {
        toast.error("Failed to change password. Details: " + response.message);
      }
    });
  }

  render() {
    if(!this.state.retrievedUser && this.props.userID > 0) {
      this.retrieveUser();
    }
    return (
      <div className="change-account">
      <h2 className="sidebar-header">Manage Account:</h2>
      <h3>Edit Information:</h3>
      <hr />
      <Form horizontal className="sidebar">
        <FormGroup className="sidebar-form-group">
          <Col componentClass={ControlLabel} sm={4}>
            Email:
          </Col>
          <Col>
            <FormControl 
              className="sidebar-input" 
              type="text"
              defaultValue={this.state.user.email} 
              disabled={true}
            />
          </Col>
        </FormGroup>
        <FormGroup className="sidebar-form-group">
          <Col componentClass={ControlLabel} sm={4}>
            First Name:
          </Col>
          <Col>
            <FormControl 
              className="sidebar-input" 
              type="text"
              defaultValue={this.state.user.firstName} 
              onChange={(event) => this.handleChange(event.target.value, "firstName")}
            />
          </Col>
        </FormGroup>
        <FormGroup className="sidebar-form-group">
          <Col componentClass={ControlLabel} sm={4}>
            Last Name:
          </Col>
          <Col>
            <FormControl 
              className="sidebar-input" 
              type="text" 
              defaultValue={this.state.user.lastName}
              onChange={(event) => this.handleChange(event.target.value, "lastName")}
            />
          </Col>
        </FormGroup>  
        <Button className="sidebar-btn" onClick={this.updateUser}>Save Changes</Button>        
      </Form>
      <br />
      <h3>Change Password:</h3>
      <hr />
      <Form horizontal className="sidebar">
        <FormGroup className="sidebar-form-group">
          <Col componentClass={ControlLabel} sm={4}>
            Current:
          </Col>
          <Col>
            <FormControl className="sidebar-input" type="password" onChange={(event) => this.handleChange(event.target.value, "current")}/>
          </Col>
        </FormGroup>
        <FormGroup className="sidebar-form-group" validationState={this.validate("password")}>
          <Col componentClass={ControlLabel} sm={4}>
            New:
          </Col>
          <Col>
            <FormControl className="sidebar-input" type="password" onChange={this.handlePasswordChange}/>
            {this.state.password.changed && !this.state.password.valid &&  <p className="invalid-input pull-right">Password must contain at least 8 characters.</p>}
          </Col>
        </FormGroup>
        <FormGroup className="sidebar-form-group" validationState={this.validate("confirm")}>
          <Col componentClass={ControlLabel} sm={4}>
            Confirm New:
          </Col>
          <Col>
            <FormControl className="sidebar-input" type="password" onChange={this.handleConfirmChange}/>
            {this.state.password.valid && this.state.confirm.changed && this.state.password.password !== this.state.confirm.password && <p className="invalid-input pull-right"><span className="invisible">hacky</span> Passwords must match</p>}
          </Col>
        </FormGroup>  
        <Button className="sidebar-btn" disabled={this.state.current === "" || !this.state.password.valid || !this.state.confirm.valid} onClick={this.changePassword}>Change Password</Button>        
      </Form>
    </div>
  );}
}

AccountSidebar.propTypes = {
  userID: PropTypes.number,
  updateFirstName: PropTypes.func,
  logOut: PropTypes.func
}