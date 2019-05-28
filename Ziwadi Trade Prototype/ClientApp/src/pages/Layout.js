import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Login } from './Login';
import { NavMenu } from './NavMenu.jsx';
import {SmartToaster, toast } from 'react-smart-toaster';

export class Layout extends Component {
  displayName = Layout.name

  constructor(props, context) {
    super(props, context);

    this.state = { 
      showLogin: false,
      showAlert: false,
      alertVariant: "success",
      alertMessage: ""
     };

    this.handleHideLogin = this.handleHideLogin.bind(this);
    this.handleShowLogin = this.handleShowLogin.bind(this);
  }

  handleShowLogin() {
    this.setState({showLogin: true});
  }

  handleHideLogin() {
    this.setState({showLogin: false});
  }

  render() {
    return (
      <div>
        <NavMenu isLoggedIn={this.props.isLoggedIn} account={this.props.account} showLogin={this.handleShowLogin} logOut={this.props.logOut}/>
        <Login showLogin={this.state.showLogin} handleHideLogin={this.handleHideLogin} handleLogin={this.props.handleLogin} handleRegister={this.props.handleRegister} />
        <SmartToaster 
          store={toast} 
          lightBackground={true} 
          position={"top_center"}
          fadeOutTimer={2500}
        />
        {this.props.children}
      </div>
    );
  }
}

Layout.propTypes = {
  isLoggedIn: PropTypes.bool,
  account: PropTypes.shape({
    username: PropTypes.string,
    notifications: PropTypes.array,
    shoppingCart: PropTypes.array
  }),
  handleLogin: PropTypes.func,
  handleRegister: PropTypes.func,
  logOut: PropTypes.func
}
