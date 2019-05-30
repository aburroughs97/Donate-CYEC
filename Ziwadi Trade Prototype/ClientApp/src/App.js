import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home.jsx';
import { Account } from './pages/Account.jsx';
import { Reports } from './pages/Reports.jsx';
import { Donate } from './pages/Donate';
import { apiPost } from './Api';
import { toast } from 'react-smart-toaster';


const sessionUserKey = "loggedinUser";

export default class App extends Component {
  displayName = App.name
  constructor(props) {
    super(props);
    this.state = {isLoggedIn: false, account: {userID: 0, firstName: "", isAdmin: false}};

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  componentDidMount() {
    let userStr = sessionStorage.getItem(sessionUserKey);
    if(userStr) {
      let user = JSON.parse(userStr);
      this.setState({
        isLoggedIn: true,
        account: {
          userID: user.userID,
          firstName: user.firstName,
          lastName: user.lastName
        }
      })
    }
  }

  logOut(){
    this.setState({
      isLoggedIn: false, 
      account: {userID: 0, 
        firstName: "", 
        lastName: "", 
        notifications: [1,2,3], 
        shoppingCart: []}
      });
    sessionStorage.removeItem(sessionUserKey);
    toast.success("Logged out successfully.")
  }

  async handleLogin(data) {
    //Validate login credentials and get reports/shopping cart for a user
    return new Promise((resolve) => {
      apiPost('api/Account/LogIn', data)
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload;
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
              lastName: user.lastName
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: false }));
        }
        resolve(response);
      });
    });

  }

  async handleRegister(data) {
    return new Promise((resolve) => {
      apiPost('api/Account/CreateAccount', data)
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload;
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
              lastName: user.lastName
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: false }));
        }
        resolve(response);
      });
    });
  }


  render() {
    return (
      <Layout isLoggedIn={this.state.isLoggedIn} account={this.state.account} handleLogin={this.handleLogin} handleRegister={this.handleRegister} logOut={this.logOut}>
        <Route exact path='/' component={Home} />
        <Route path='/donate' component={Donate} />
        <Route path='/reports' component={Reports} />
        <Route path='/account' component={Account} />
      </Layout>
    );
  }
}
