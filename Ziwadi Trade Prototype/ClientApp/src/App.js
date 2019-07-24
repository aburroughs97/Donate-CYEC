import React, { Component } from 'react';
import { Route, withRouter } from 'react-router';
import { Layout } from './pages/Layout/Layout';
import { Home, Donate, Account, Admin, Cart} from './pages/Pages';
import * as _loginCalls from './API/LoginCalls';
import * as _accountCalls from './API/AccountCalls';
import { toast } from 'react-smart-toaster';
import { MetroSpinner } from "react-spinners-kit";

import Cookies from 'universal-cookie';

const cookieUserKey = "UserAccessToken";
const sessionUserKey = "LoggedInUser";
const cookies = new Cookies();

const defaultState = {
  isLoggedIn: false, 
  account: {
    userID: 0, 
    firstName: "", 
    cartItems: 0,
    language: "English", 
    currency: {
      code: "USD",
      currencySymbol: "$",
      symbolBefore: true,
      roundDigits: 2,
    }, 
    isAdmin: false
  },
  loadingUser: false,
  forceLogin: false
};

class App extends Component {
  displayName = App.name

  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      loadingUser: true
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logOut = this.logOut.bind(this);
    this.passwordChanged = this.passwordChanged.bind(this);
    this.updateFirstName = this.updateFirstName.bind(this);
    this.languageChanged = this.languageChanged.bind(this);
    this.loadTranslations = this.loadTranslations.bind(this);
    this.cartUpdated = this.cartUpdated.bind(this);
    this.clearCart = this.clearCart.bind(this);
    this.forceLogin = this.forceLogin.bind(this);
    this.loginShown = this.loginShown.bind(this);
  }

  componentDidMount() {
    let loggedInUser = JSON.parse(sessionStorage.getItem(sessionUserKey));
    if(loggedInUser) {
      this.setState({
        isLoggedIn: true,
        account: {
          userID: loggedInUser.userID,
          firstName: loggedInUser.firstName,
          cartItems: loggedInUser.cartItems,
          language: loggedInUser.language,
          currency: loggedInUser.currency,
          isAdmin: loggedInUser.isAdmin
        },
        loadingUser: false,
      });
      return;
    }

    let session = cookies.get(cookieUserKey);
    if(session) {
      _loginCalls.ValidateAccessToken(session.userID, session.accessToken)
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload.user;
          let userSession = response.payload.userSession;
  
          let newAccount = {
            userID: user.userID,
            firstName: user.firstName,
            cartItems: response.payload.cartItems,
            language: response.payload.languageName,
            currency: response.payload.currencyCode,
            isAdmin: user.isAdmin
          };

          this.setState({
            isLoggedIn: true,
            account: newAccount
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify(newAccount));
          cookies.set(cookieUserKey, {userID: userSession.userID, accessToken: userSession.accessToken}, { expires: new Date(userSession.expiresOn) })
        }
        this.setState({
          loadingUser: false
        });
      });
    }
    else {
      this.setState({
        loadingUser: false
      });
    }
  }

  async loadTranslations() {

  }

  logOut(){
    this.setState({
      ...defaultState
    });
    
    //Invalidate user session server-side
    _loginCalls.RemoveAccessToken(cookies.get(cookieUserKey));
    sessionStorage.removeItem(sessionUserKey);     
    cookies.remove(cookieUserKey);
    toast.success("Logged out successfully.");
    this.props.history.push("/");
  }

  passwordChanged() {
    this.setState({
      ...defaultState
    });
    
    sessionStorage.removeItem(sessionUserKey);     
    cookies.remove(cookieUserKey);
    this.props.history.push("/");
  }

  async handleLogin(data, rememberMe) {
    return new Promise((resolve) => {
      _loginCalls.LogIn(data)
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload.user;

          let newAccount = {
            userID: user.userID,
            firstName: user.firstName,
            cartItems: response.payload.cartItems,
            language: response.payload.languageName,
            currency: response.payload.currencyCode,
            isAdmin: user.isAdmin
          };

          this.setState({
            isLoggedIn: true,
            account: newAccount
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify(newAccount));
          if(rememberMe){
            _loginCalls.CreateAccessToken(user.userID)
            .then((response) => {
              let userSession = response.payload;

              cookies.set(cookieUserKey, {userID: userSession.userID, accessToken: userSession.accessToken}, { expires: new Date(userSession.expiresOn) })
            });
          }
        }
        resolve(response);
      });
    });

  }

  async handleRegister(data) {
    return new Promise((resolve) => {
      _loginCalls.CreateAccount(data)
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload;
          let account = {
            userID: user.userID,
            firstName: user.firstName,
            cartItems: 0,
            language: defaultState.account.language,
            currency: defaultState.account.currency,
            isAdmin: user.isAdmin
          };
          this.setState({
            isLoggedIn: true,
            account 
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ account }));
        }
        resolve(response);
      });
    });
  }

  updateFirstName(firstName){
    if(this.state.account.firstName !== firstName) {
      this.setState((state) => ({
        account: {...state.account, firstName}
      }));
      sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: this.state.account.userID, firstName: firstName, isAdmin: this.state.account.isAdmin }));
    }
  }

  languageChanged(language, currency) {
    let account = this.state.account;
    let oldLang = account.language;
    let oldCur = account.currency;

    if(currency === null) {
      account.language = language;
    }
    else {
      account.currency = currency;
    }
    this.setState({
      account
    });
    sessionStorage.setItem(sessionUserKey, JSON.stringify(account));

    if(this.state.isLoggedIn) {
      _accountCalls.UpdateLanguageAndCurrency(account.userID, account.language, account.currency.code)
      .then((response) => {
        if(!response.isSuccess) {
          toast.error("Error updating language settings. Please try again.");
          account.language = oldLang;
          account.currency = oldCur;
          this.setState({
            account
          });
        }
      });
    }
  }

  cartUpdated(amount, added) {
    let account = this.state.account;
    if(added) {
      account.cartItems += amount;
    }
    else {
      account.cartItems -= amount;
    }
    this.setState({
      account
    });
    sessionStorage.setItem(sessionUserKey, JSON.stringify(account));
  }

  clearCart() {
    let account = this.state.account;
    account.cartItems = 0;
    this.setState({
      account
    });
    sessionStorage.setItem(sessionUserKey, JSON.stringify(account));
  }

  forceLogin(){
    this.setState({ forceLogin: true });
  }

  loginShown() {
    this.setState({ forceLogin: false });
  }

  render() {
    let body;
    if(!this.state.loadingUser) {
      body = 
        <Layout forceLogin={this.state.forceLogin} loginShown={this.loginShown} isLoggedIn={this.state.isLoggedIn} loadingUser={this.state.loadingUser} account={this.state.account} handleLogin={this.handleLogin} handleRegister={this.handleRegister} logOut={this.logOut} languageChanged={this.languageChanged}>
          <Route exact path='/' render={(props) => <Home {...props} showLogin={this.forceLogin} language={this.state.account.language} isLoggedIn={this.state.isLoggedIn}/>}/>
          <Route path='/donate' render={(props) => <Donate {...props} isLoggedIn={this.state.isLoggedIn} userID={this.state.account.userID} language={this.state.account.language} currency={this.state.account.currency} cartUpdated={this.cartUpdated}/>}/>
          <Route path='/cart' render={(props) => <Cart {...props} isLoggedIn={this.state.isLoggedIn} userID={this.state.account.userID} language={this.state.account.language} currency={this.state.account.currency} cartUpdated={this.cartUpdated} clearCart={this.clearCart}/>}/>
          <Route path='/account' render={(props) => <Account {...props} isLoggedIn={this.state.isLoggedIn} userID={this.state.account.userID} language={this.state.account.language} updateFirstName={this.updateFirstName} logOut={this.passwordChanged}/>} />
          <Route path='/admin' render={(props) => <Admin {...props} isLoggedIn={this.state.isLoggedIn} isAdmin={this.state.account.isAdmin} />}/>
        </Layout>
      ;
    }
    else {
      body = 
        <Layout isLoggedIn={this.state.isLoggedIn} loadingUser={this.state.loadingUser} account={this.state.account} handleLogin={this.handleLogin} handleRegister={this.handleRegister} logOut={this.logOut} languageChanged={this.languageChanged}>
          <div className="spinner-container">
            <MetroSpinner 
              size={150}
              color="#BF2E1B"
              loading={true}
            />
          </div>
        </Layout>
      ;
    }
    return (
      body
    );
  }
}

export default withRouter(App);
