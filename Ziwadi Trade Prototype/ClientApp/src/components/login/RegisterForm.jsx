import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Form, Button, FormControl, ControlLabel, FormGroup } from 'react-bootstrap';
import * as yup from 'yup';
import { toast } from 'react-smart-toaster';

const schema = yup.object().shape({
  firstName: yup
      .string()
      .required("This field is required."),
  lastName: yup
      .string()
      .required("This field is required."),
  email: yup
      .string()
      .email("This field must contain a valid email address.")
      .required(),
  password: yup
      .string()
      .required("A password is required")
      .min(8, 'Password should contain at least 8 characters.')
});

const validForm = {
  firstName: "John",
  lastName: "Doe",
  email: "johndoe@example.com",
  password: "123456789",
}

class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        form: { firstName: "", lastName: "", email: "", password: ""},
        hasChanged: {firstName: false, lastName: false, email: false, password: false, passwordConfirm: false},
        valid: {firstName: false, lastName: false, email: false, password: false},
        passwordConfirm: "",
    };

    this.getValidationState = this.getValidationState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
}

getValidationState(sender) {
  if(sender === "confirmPassword") {
    return this.state.valid.password && this.state.hasChanged.passwordConfirm && this.state.form.password !== this.state.passwordConfirm ? 'error' : null;
  }
  if(!this.state.hasChanged[sender]) return null;
  else return this.state.valid[sender] ? null : 'error';
}

handleChange(text, sender) {
  if(sender === "confirmPassword") {
    this.setState((state) => ({ 
      passwordConfirm: text,
      hasChanged: { ...state.hasChanged, passwordConfirm: true }
    }
    ));
    return;
  }
  this.setState((state) => ({
    form: {...state.form, [sender]: text},
    hasChanged: {...state.hasChanged, [sender]: true}
  }));
  let testForm = {...validForm, [sender]: text};
  if(schema.isValidSync(testForm)) {
    this.setState((state) => ({
      valid: {...state.valid, [sender]: true}
    }))
  }
  else {
    this.setState((state) => ({
      valid: {...state.valid, [sender]: false}
    }))
  }
}

submitForm() {
  this.props.handleRegister(this.state.form)
  .then((result) => {
    if(result.isSuccess) {
      //Reset values
      this.setState({
        form: { firstName: "", lastName: "", email: "", password: ""},
        hasChanged: {firstName: false, lastName: false, email: false, password: false, passwordConfirm: false},
        valid: {firstName: false, lastName: false, email: false, password: false},
        passwordConfirm: "",
      });

      this.props.handleHideLogin();
      toast.success("Account created successfully.")
    }
    else {
      toast.error(result.message);
    }
  });
}
  
    render() {
      return (
        <Form>
          <div className="modal-inputs">
            <FormGroup
                controlId="firstName"
                validationState={this.getValidationState("firstName")}
            >
                <ControlLabel>First Name</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    onChange={e => this.handleChange( e.target.value, "firstName")}
                    required
                />
              {this.state.hasChanged.firstName && !this.state.valid.firstName &&  <p className="invalid-input">This field is required</p>}
            </FormGroup>

            <FormGroup
                controlId="lastName"
                validationState={this.getValidationState("lastName")}
            >
                <ControlLabel>Last Name</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    onChange={e => this.handleChange( e.target.value, "lastName")}
                    required
                />
              {this.state.hasChanged.lastName && !this.state.valid.lastName &&  <p className="invalid-input">This field is required</p>}
            </FormGroup>
  
            <FormGroup
                controlId="email"
                validationState={this.getValidationState("email")}
            >
                <ControlLabel>Email</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="you@example.com"
                    name="username"
                    onChange={e => this.handleChange( e.target.value, "email")}
                    required
                />
              {this.state.hasChanged.email && !this.state.valid.email &&  <p className="invalid-input">Enter a valid email address</p>}
            </FormGroup>

            <FormGroup
                controlId="password"
                validationState={this.getValidationState("password")}
            >
                <ControlLabel>Password</ControlLabel>
                <FormControl
                    type="password"
                    placeholder="Password"
                    name="password"
                    onChange={e => this.handleChange( e.target.value, "password")}
                    required
                />
              {this.state.hasChanged.password && !this.state.valid.password &&  <p className="invalid-input">Password must contain at least 8 characters.</p>}
            </FormGroup>

            <FormGroup
                controlId="confirmPassword"
                validationState={this.getValidationState("confirmPassword")}
            >
                <ControlLabel>Confirm Password</ControlLabel>
                <FormControl
                    type="password"
                    placeholder="Confirm Password"
                    onChange={e => this.handleChange( e.target.value, "confirmPassword")}
                    required
                />
              {this.state.valid.password && this.state.hasChanged.passwordConfirm && this.state.form.password !== this.state.passwordConfirm && <p className="invalid-input">Passwords must match</p>}
            </FormGroup>

            <Button className="modal-btn" 
              onClick={this.submitForm} 
              disabled={!this.state.valid.firstName || !this.state.valid.lastName || !this.state.valid.email || !this.state.valid.password || this.state.form.password !== this.state.passwordConfirm}
              >
                Create Account
              </Button>
          </div>
          <hr />
          <p>Already have an account? <span className="modal-link" onClick={this.props.showLogin}>Log In</span></p>
      </Form>
      );
    }
}

RegisterForm.propTypes = {
  handleRegister: PropTypes.func,
  showLogin: PropTypes.func,
  handleHideLogin: PropTypes.func
}

export default withRouter(RegisterForm);
