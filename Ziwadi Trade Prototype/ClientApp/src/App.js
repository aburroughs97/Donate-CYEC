import React, { Component } from 'react';
import { Route, withRouter } from 'react-router';
import { Layout } from './pages/Layout/Layout';
import { Home, Donate, Account, Reports, Admin} from './pages/Pages';
import * as _loginCalls from './API/LoginCalls';
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
    this.passwordChanged = this.passwordChanged.bind(this);
    this.updateFirstName = this.updateFirstName.bind(this);
  }

  componentDidMount() {
    let loggedInUser = JSON.parse(sessionStorage.getItem(sessionUserKey));
    if(loggedInUser) {
      this.setState({
        isLoggedIn: true,
        account: {
          userID: loggedInUser.userID,
          firstName: loggedInUser.firstName,
          isAdmin: loggedInUser.isAdmin
        },
        loadingUser: false
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
  
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
              isAdmin: user.isAdmin
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: user.isAdmin }));
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
    _loginCalls.RemoveAccessToken(cookies.get(cookieUserKey));
    sessionStorage.removeItem(sessionUserKey);     
    cookies.remove(cookieUserKey);
    toast.success("Logged out successfully.");
    this.props.history.push("/");
  }

  passwordChanged() {
    this.setState({
      isLoggedIn: false, 
      account: {
        userID: 0, 
        firstName: "",
        isAdmin: false
      }
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
          let user = response.payload;
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
              isAdmin: user.isAdmin
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: user.isAdmin }));
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
          this.setState({
            isLoggedIn: true,
            account: {
              userID: user.userID,
              firstName: user.firstName,
              isAdmin: user.isAdmin
            }
          });
          sessionStorage.setItem(sessionUserKey, JSON.stringify({ userID: user.userID, firstName: user.firstName, isAdmin: user.isAdmin }));
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


  render() {
    return (
      <Layout isLoggedIn={this.state.isLoggedIn} loadingUser={this.state.loadingUser} account={this.state.account} handleLogin={this.handleLogin} handleRegister={this.handleRegister} logOut={this.logOut}>
        <Route exact path='/' component={Home} />
        <Route path='/donate' component={Donate} />
        <Route path='/reports' component={Reports} />
        <Route path='/account' render={(props) => <Account {...props} userID={this.state.account.userID} updateFirstName={this.updateFirstName} logOut={this.passwordChanged}/>} />
        <Route path='/admin' component={Admin} />
      </Layout>
    );
  }
}

export default withRouter(App);
