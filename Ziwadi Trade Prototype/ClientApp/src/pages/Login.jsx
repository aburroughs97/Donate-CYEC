import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { Modal } from 'react-bootstrap';
import '../styles/Login.css';

export class Login extends Component {
    displayName = Login.name
    constructor(props) {
      super(props);
      this.state = {
        isLogin: true
      };

      this.showLoginForm = this.showLoginForm.bind(this);
      this.showRegisterForm = this.showRegisterForm.bind(this);
    }

    showLoginForm() {
      this.setState({isLogin: true});
    }
  
    showRegisterForm() {
      this.setState({isLogin: false});
    }

    render() {
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
            {this.state.isLogin ? "Log In": "Create Account"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.isLogin ? <LoginForm handleLogin={this.props.handleLogin} showRegister={this.showRegisterForm} handleHideLogin={this.props.handleHideLogin}/> 
                                : <RegisterForm handleRegister={this.props.handleRegister} showLogin={this.showLoginForm} handleHideLogin={this.props.handleHideLogin}/>}
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
