import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home.jsx';
import { Account } from './pages/Account.jsx';
import { Reports } from './pages/Reports.jsx';
import { Donate } from './pages/Donate';
import { apiPost } from './Api';
import { toast } from 'react-smart-toaster';
import Cookies from 'universal-cookie';

const cookieUserKey = "UserAccessToken";
const sessionUserKey = "LoggedInUser";
const cookies = new Cookies();

class App extends Component {
  displayName = App.name

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false, 
      account: {userID: 0, firstName: "", isAdmin: false},
      loadingUser: true
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  componentDidMount() {
    let loggedInUser = JSON.parse(sessionStorage.getItem(sessionUserKey));
    if(loggedInUser) {
      this.setState({
        isLoggedIn: true,
        account: {
          userID: loggedInUser.userID,
          firstName: loggedInUser.firstName,
          isAdmin: false
        },
        loadingUser: false
      });
      return;
    }

    let session = cookies.get(cookieUserKey);
    if(session) {
      apiPost('api/Account/ValidateAccessToken', { userID: session.userID, accessToken: session.accessToken })
      .then((response) => {
        if(response.isSuccess) {
          let user = response.payload.user;
          let userSession = response.payload.userSession;
  
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: false }));
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

  logOut(){
    this.setState({
      isLoggedIn: false, 
      account: {
        userID: 0, 
        firstName: "",
        isAdmin: false
      }
    });
    
    //Invalidate user session server-side
    apiPost('api/Account/RemoveAccessToken', cookies.get(cookieUserKey))
    sessionStorage.removeItem(sessionUserKey);     
    cookies.remove(cookieUserKey);
    toast.success("Logged out successfully.")
  }

  async handleLogin(data, rememberMe) {
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
          if(rememberMe){
            apiPost('api/Account/CreateAccessToken', user.userID)
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
      <Layout isLoggedIn={this.state.isLoggedIn} loadingUser={this.state.loadingUser} account={this.state.account} handleLogin={this.handleLogin} handleRegister={this.handleRegister} logOut={this.logOut}>
        <Route exact path='/' component={Home} />
        <Route path='/donate' component={Donate} />
        <Route path='/reports' component={Reports} />
        <Route path='/account' component={Account} />
      </Layout>
    );
  }
}

export default App;
