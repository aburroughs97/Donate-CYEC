import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Login } from '../../components/Components';
import { NavMenu } from './NavMenu.jsx';
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

  componentWillReceiveProps(props) {
    if(props.forceLogin) {
      this.setState({ showLogin: true });
      this.props.loginShown();
    }
  }

  render() {
    return (
      <div className="body">
        <NavMenu isLoggedIn={this.props.isLoggedIn} isLoading={this.props.loadingUser} account={this.props.account} showLogin={this.handleShowLogin} logOut={this.props.logOut} languageChanged={this.props.languageChanged}/>
        <Login showLogin={this.state.showLogin} handleHideLogin={this.handleHideLogin} handleLogin={this.props.handleLogin} handleRegister={this.props.handleRegister} />
        <SmartToaster 
          store={toast} 
          lightBackground={true} 
          position={"top_center"}
          fadeOutTimer={4000}
        />
        <CookieConsent 
          style={{ background: "#BF2E1B", paddingLeft: "30%", paddingRight: "30%"}}
          buttonStyle={{ background: "white", color: "#BF2E1B", borderRadius: "4px", marginTop: "5px", marginBottom: "5px"}}
        >
          This website uses cookies to enhance the user experience
        </CookieConsent>
        <div className="layout-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  isLoggedIn: PropTypes.bool,
  forceLogin: PropTypes.bool,
  loginShown: PropTypes.func,
  loadingUser: PropTypes.bool,
  account: PropTypes.shape({
    userID: PropTypes.number, 
    firstName: PropTypes.string, 
    isAdmin: PropTypes.bool
  }),
  handleLogin: PropTypes.func,
  handleRegister: PropTypes.func,
  logOut: PropTypes.func,
  languageChanged: PropTypes.func
}
