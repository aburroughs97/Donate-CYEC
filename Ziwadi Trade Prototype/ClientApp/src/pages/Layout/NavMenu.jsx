import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { isMobile } from 'react-device-detect';
import { PropagateLoader } from 'react-spinners';
import * as _accountCalls from '../../API/AccountCalls';
import '../../styles/NavMenu.css';


export class NavMenu extends Component {
  displayName = NavMenu.name;
  constructor(props) {
    super(props);
    this.state = {
      languages: [],
      currencies: []
    }
  }

  handleSelect(eventKey, name)
  {
    if(name === "language") {
     this.props.languageChanged(eventKey, null);
    }
    else {
      this.props.languageChanged(null, eventKey)
    }
  }

  componentDidMount() {
    _accountCalls.GetCurrencies()
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          currencies: response.payload
        });
      }
    });

    _accountCalls.GetLanguages()
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          languages: response.payload
        });
      }
    })
  }

  render() {
    return (
        <Navbar collapseOnSelect expand="lg" fixedTop fluid>
            <Nav className = 'language-dropdown' onSelect={k => this.handleSelect(k, "language")}>
              <NavDropdown title={this.props.account.language} id='currency'>
                {this.state.languages.map(language => {
                  return <MenuItem key={language} eventKey={language} disabled={this.props.account.language === language}>{language}</MenuItem>
                })}
              </NavDropdown>
            </Nav>
            <Nav className = 'currency-dropdown' onSelect={k => this.handleSelect(k, "currency")}>
              <NavDropdown title={this.props.account.currency} id='currency'>
              {this.state.currencies.map(currency => {
                  return <MenuItem key={currency} eventKey={currency} disabled={this.props.account.currency === currency}>{currency}</MenuItem>
                })}
              </NavDropdown>
            </Nav>

            <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
              <Navbar.Collapse className="navbar-collapse">
              <Nav className = 'nav-links'>
                <LinkContainer to={'/'} exact>
                  <NavItem  title='Home' className = 'hover'>
                    <Glyphicon glyph='home'/> {isMobile ? "Home" : ""}
                  </NavItem>
                </LinkContainer>
                <LinkContainer to={'/donate'} exact>
                  <NavItem  title='Donate Now' className = 'hover'>
                    <Glyphicon glyph='usd'/> {isMobile ? "Donate Now" : ""}
                  </NavItem>
                </LinkContainer>
                <LinkContainer to={'/reports'}>
                  <NavItem title='View Reports' className = 'hover'>
                    <Glyphicon glyph='list-alt' /> {isMobile ? "View Reports" : ""}
                  </NavItem>
                </LinkContainer>
                <LinkContainer to={'/account'} exact>
                  <NavItem  title='Manage Account' className = 'hover'>
                    <Glyphicon glyph='user'/> {isMobile ? "Manage Account" : ""}
                  </NavItem>
                </LinkContainer>
                {this.props.account.isAdmin && <LinkContainer to={'/admin'} exact>
                  <NavItem  title='Admin' className = 'hover'>
                    <Glyphicon glyph='cog'/> {isMobile ? "Admin" : ""}
                  </NavItem>
                </LinkContainer>}
              </Nav>
              </Navbar.Collapse>

            {this.props.isLoading && <div className="spinner">
              <PropagateLoader
                color={"lightgray"}
                size={10}
              />
            </div>
            }

            {!this.props.isLoading && !this.props.isLoggedIn &&            
              <Navbar.Text className="log-in">
                  <span className="modal-link-inv" onClick={this.props.showLogin}>Log In/Create Account</span>
              </Navbar.Text>
            }

            {!this.props.isLoading && this.props.isLoggedIn &&            
              <Navbar.Text className="log-in">
                  {`Hello, ${this.props.account.firstName} `}
                  (<span className="modal-link" onClick={this.props.logOut}>Log out</span>)
              </Navbar.Text>
            }
        </Navbar>
    );
  }
}

NavMenu.propTypes = {
  isLoggedIn: PropTypes.bool,
  isLoading: PropTypes.bool,
  account: PropTypes.shape({
    userID: PropTypes.number, 
    firstName: PropTypes.string, 
    isAdmin: PropTypes.bool
  }),
  showLogin: PropTypes.func,
  logOut: PropTypes.func,
  languageChanged: PropTypes.func,
}
