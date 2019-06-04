import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, ControlLabel, FormGroup } from 'react-bootstrap';
import * as yup from 'yup';
import { toast } from 'react-smart-toaster';
import * as _loginCalls from '../../API/LoginCalls';


const emailSchema = yup.string().email();
const tokenSchema = yup.string().matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
const passwordSchema = yup.string().min(8);

export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
        currentStep: "email",
        email: { email: "", changed: false, valid: false },
        token: { token: "", changed: false, valid: false },
        password: { password: "", changed: false, valid: false },
        confirm: { confirm: "", changed: false, valid: false }
    };
    
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleTokenChange = this.handleTokenChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmChange = this.handleConfirmChange.bind(this);
    this.validate = this.validate.bind(this);
    this.sendForgotPasswordEmail = this.sendForgotPasswordEmail.bind(this);
    this.validateCodeAndContinue = this.validateCodeAndContinue.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  handleEmailChange(event) {
    let email = event.target.value;
    if(emailSchema.isValidSync(email)) {
      this.setState({ email: {email, changed: true, valid: true }});
    }
    else {
      this.setState({ email: {email, changed: true, valid: false }});
    }
  }

  handleTokenChange(event) {
    let token = event.target.value;
    if(tokenSchema.isValidSync(token)) {
      this.setState({ token: {token, changed: true, valid: true }});
    }
    else {
      this.setState({ token: {token, changed: true, valid: false }});
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

  sendForgotPasswordEmail() {
    _loginCalls.SendForgotPasswordEmail(this.state.email.email)
    .then((response) => {
      if(response.isSuccess){
        toast.success("Email containing a reset code was sent to" + this.state.email.email + ".");
        this.setState({ currentStep: "code" });
      }
      else {
        toast.error(response.message);
      }
    });
  }

  validateCodeAndContinue() {
    _loginCalls.ValidateForgotPasswordToken(this.state.email.email, this.state.token.token)
    .then((response) => {
      if(response.isSuccess){
        this.setState({ currentStep: "change" });
      }
      else {
        toast.error(response.message);
      }
    })
  }

  changePassword() {
    _loginCalls.ChangePassword(this.state.email.email, this.state.password.password)
    .then((response) => {
        if(response.isSuccess){
          toast.success("Password changed successfully.");
          this.props.backToLogin();
        }
        else {
          toast.error(response.message);
        }
    });
  }

  render() {
    return (
      <div>
        {this.state.currentStep === "email" && <div className="modal-inputs">
          <FormGroup
            controlId="email"
            validationState={this.validate("email")}
          >
            <ControlLabel>Enter your email address:</ControlLabel>
            <FormControl
                type="text"
                placeholder="you@example.com"
                name="email"
                onChange={this.handleEmailChange}
                required
            />
            {this.state.email.changed && !this.state.email.valid && <p className="invalid-input">Enter a valid email address</p>}
          </FormGroup>
          <Button 
            className="modal-btn" 
            disabled={!this.state.email.valid}
            onClick={this.sendForgotPasswordEmail}
          >
            Send Email
          </Button>
        </div>}
        {this.state.currentStep === "code" && <div className="modal-inputs">
          <FormGroup
            controlId="token"
            validationState={this.validate("token")}
          >
            <ControlLabel>Paste the code below:</ControlLabel>
            <FormControl
                type="text"
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                name="token"
                onChange={this.handleTokenChange}
                required
                spellCheck="false"
            />
          </FormGroup>
          <Button 
            className="modal-btn" 
            disabled={!this.state.token.valid}
            onClick={this.validateCodeAndContinue}
          >
            Continue
          </Button>
        </div>}
        {this.state.currentStep === "change" && <div className="modal-inputs">
          <FormGroup
                controlId="password"
                validationState={this.validate("password")}
            >
              <ControlLabel>Enter New Password:</ControlLabel>
              <FormControl
                  type="password"
                  placeholder="Password"
                  name="password"
                  onChange={this.handlePasswordChange}
                  required
              />
            {this.state.password.changed && !this.state.password.valid &&  <p className="invalid-input">Password must contain at least 8 characters.</p>}
          </FormGroup>

          <FormGroup
              controlId="confirmPassword"
              validationState={this.validate("confirm")}
          >
              <ControlLabel>Confirm New Password:</ControlLabel>
              <FormControl
                  type="password"
                  placeholder="Confirm Password"
                  onChange={this.handleConfirmChange}
                  required
              />
            {this.state.password.valid && this.state.confirm.changed && this.state.password.password !== this.state.confirm.password && <p className="invalid-input">Passwords must match</p>}
          </FormGroup>
          <Button 
            className="modal-btn" 
            disabled={!this.state.password.valid || !this.state.confirm.valid}
            onClick={this.changePassword}
          >
            Continue
          </Button>
        </div>}
        <hr />
          <p><span className="modal-link" onClick={this.props.backToLogin}>Back to Log In</span></p>
      </div>
    )};
}

ForgotPassword.propTypes = {
  backToLogin: PropTypes.func
}