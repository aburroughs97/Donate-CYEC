import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, ControlLabel, FormGroup } from 'react-bootstrap';
import * as yup from 'yup';
import * as _accountCalls from '../../API/AccountCalls';


const schema = yup.string().email();

export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
        email: "",
        emailHasChanged: false,
        emailIsValid: false,
        inputToken: ""
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.sendForgotPasswordEmail = this.sendForgotPasswordEmail.bind(this);
  }

  handleChange(event) {
    let email = event.target.value;
    if(schema.isValidSync(email)) {
      this.setState({ email: event.target.value, emailHasChanged: true, emailIsValid: true });
    }
    else {
      this.setState({ email: event.target.value, emailHasChanged: true, emailIsValid: false });
    }
  }

  validateEmail() {
    if(!this.state.emailHasChanged) return null;
    return this.state.emailIsValid ? null : 'error';
  }

  sendForgotPasswordEmail() {
    _accountCalls.SendForgotPasswordEmail(this.state.email)
    .then((response) => {

    });
  }

  render() {
    return (
      <div>
        <div className="modal-inputs">
          <FormGroup
            controlId="email"
            validationState={this.validateEmail()}
          >
            <ControlLabel>Enter your email address:</ControlLabel>
            <FormControl
                type="text"
                placeholder="you@example.com"
                name="email"
                onChange={this.handleChange}
                required
            />
            {this.state.emailHasChanged && !this.state.emailIsValid && <p className="invalid-input">Enter a valid email address</p>}
          </FormGroup>
          <Button 
            className="modal-btn" 
            disabled={!this.state.emailIsValid}
            onClick={this.sendForgotPasswordEmail}
          >
            Send Email
          </Button>
        </div>
        <hr />
          <p><span className="modal-link" onClick={this.props.backToLogin}>Back to Log In</span></p>
      </div>
    )};
}

ForgotPassword.propTypes = {
  backToLogin: PropTypes.func
}