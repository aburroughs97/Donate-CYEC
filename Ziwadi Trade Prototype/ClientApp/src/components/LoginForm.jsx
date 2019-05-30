import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, FormControl, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap';
import * as yup from 'yup';
import { toast } from 'react-smart-toaster';

const schema = yup.object().shape({
  email: yup
      .string()
      .required(),
  password: yup
      .string()
      .required()
});

const validForm = {
  email: "johndoe@example.com",
  password: "123456789"
}

export class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        credentials: {email: "", password: "" },
        hasChanged: {email: false, password: false},
        valid: {email: false, password: false},
    };

    this.getValidationState = this.getValidationState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
}

getValidationState(sender) {
  if(!this.state.hasChanged[sender]) return null;
  else return this.state.valid[sender] ? null : 'error';
}

handleChange(text, sender) {
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
  this.props.handleLogin(this.state.form)
  .then((result) => {
    if(result.isSuccess) {
      this.props.handleHideLogin();
      toast.success("Logged in successfully.")
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
                controlId="email"
                validationState={this.getValidationState("email")}
            >
                <ControlLabel>Email</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="you@example.com"
                    name="email"
                    onChange={e => this.handleChange( e.target.value, "email")}
                    required
                />
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
            </FormGroup>
            <FormGroup controlId="formBasicChecbox">
              <Checkbox >Remember me</Checkbox>
            </FormGroup>

            <Button className="modal-btn" 
              onClick={this.submitForm} 
              disabled={!this.state.valid.email || !this.state.valid.password}
              >
                Log In
              </Button>
          </div>
          <hr />
          <p>Don't have an account? <span className="modal-link" onClick={this.props.showRegister}>Create an Account</span></p>
      </Form>
      );
    }
}

LoginForm.propTypes = {
  handleLogin: PropTypes.func,
  showRegister: PropTypes.func,
  handleHideLogin: PropTypes.func
}
