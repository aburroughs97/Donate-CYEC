import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPassword from './ForgotPassword';
import { Modal } from 'react-bootstrap';
import '../../styles/Login.css';

export class Login extends Component {
    displayName = Login.name
    constructor(props) {
      super(props);
      this.state = {
        isLogin: true,
        forgotPassword: false
      };

      this.showLoginForm = this.showLoginForm.bind(this);
      this.showRegisterForm = this.showRegisterForm.bind(this);
      this.handleForgotPassword = this.handleForgotPassword.bind(this);
      this.handleBackToLogin = this.handleBackToLogin.bind(this);
    }

    showLoginForm() {
      this.setState({ isLogin: true });
    }
  
    showRegisterForm() {
      this.setState({ isLogin: false });
    }

    handleForgotPassword() {
      this.setState({ forgotPassword: true });
    }

    handleBackToLogin() {
      this.setState({ forgotPassword: false });
    }

    render() {
      let header;
      let body;
      if(this.state.forgotPassword) {
        header = "Password Reset"
        body = <ForgotPassword backToLogin={this.handleBackToLogin}></ForgotPassword>
      }
      else if(this.state.isLogin) {
        header = "Log In";
        body = <LoginForm handleLogin={this.props.handleLogin} showRegister={this.showRegisterForm} handleHideLogin={this.props.handleHideLogin} handleForgotPassword={this.handleForgotPassword}/>;
      }
      else {
        header = "Create Account";
        body = <RegisterForm handleRegister={this.props.handleRegister} showLogin={this.showLoginForm} handleHideLogin={this.props.handleHideLogin}/>;
      }

      return (
        <Modal
          size="sm"
          backdrop="static"
          show={this.props.showLogin}
          onHide={this.props.handleHideLogin}
          dialogClassName="login-modal"
        >
          <Modal.Header closeButton className="modal-header">
            <Modal.Title>
              {header}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {body}
          </Modal.Body>
        </Modal>
      );
    }
  }

  Login.propTypes = {
    showLogin: PropTypes.bool,
    handleHideLogin: PropTypes.func,
    handleLogin: PropTypes.func,
    handleRegister: PropTypes.func,
  }
