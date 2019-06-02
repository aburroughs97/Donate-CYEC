import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Login } from './Login';
import { NavMenu } from './NavMenu.jsx';
import { Alert } from 'react-bootstrap';
import {SmartToaster, toast } from 'react-smart-toaster';
import CookieConsent from 'react-cookie-consent';

export class Layout extends Component {
  displayName = Layout.name

  constructor(props, context) {
    super(props, context);

    this.state = { 
      showLogin: false,
      showAlert: true
     };

    this.handleHideLogin = this.handleHideLogin.bind(this);
    this.handleShowLogin = this.handleShowLogin.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
  }

  handleShowLogin() {
    this.setState({ showLogin: true });
  }

  handleHideLogin() {
    this.setState({ showLogin: false });
  }

  hideAlert() {
    this.setState({ showAlert: false })
  }

  render() {
    return (
      <div>
        {this.state.showAlert && <Alert bsStyle="warning" onDismiss={this.hideAlert}>
          This website is currently under development. Please report any issues/suggestions to Alex Burroughs.
        </Alert>}
        <NavMenu isLoggedIn={this.props.isLoggedIn} isLoading={this.props.loadingUser} account={this.props.account} showLogin={this.handleShowLogin} logOut={this.props.logOut}/>
        <Login showLogin={this.state.showLogin} handleHideLogin={this.handleHideLogin} handleLogin={this.props.handleLogin} handleRegister={this.props.handleRegister} />
        <SmartToaster 
          store={toast} 
          lightBackground={true} 
          position={"top_center"}
          fadeOutTimer={2500}
        />
        <CookieConsent 
          style={{ background: "#BF2E1B", paddingLeft: "30%", paddingRight: "30%"}}
          buttonStyle={{ background: "white", color: "#BF2E1B", borderRadius: "4px", marginTop: "5px", marginBottom: "5px"}}
        >
          This website uses cookies to enhance the user experience
        </CookieConsent>
        {this.props.children}
      </div>
    );
  }
}

Layout.propTypes = {
  isLoggedIn: PropTypes.bool,
  loadingUser: PropTypes.bool,
  account: PropTypes.shape({
    username: PropTypes.string,
    notifications: PropTypes.array,
    shoppingCart: PropTypes.array
  }),
  handleLogin: PropTypes.func,
  handleRegister: PropTypes.func,
  logOut: PropTypes.func
}
