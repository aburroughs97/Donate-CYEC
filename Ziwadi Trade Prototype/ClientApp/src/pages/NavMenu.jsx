import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/NavMenu.css';

export class NavMenu extends Component {
  displayName = NavMenu.name

  constructor(props) {
    super(props);
    this.state = {currencyTitle: "USD"};
  }

  handleSelect(eventKey)
  {
    this.setState({currencyTitle: eventKey});
  }

  render() {
    return (
      <Navbar collapseOnSelect expand="lg" fixedTop fluid>
          <Nav className = 'currency-dropdown' onSelect={k => this.handleSelect(k)}>
            <NavDropdown title={this.state.currencyTitle} id='currency'>
              <MenuItem eventKey="USD">USD</MenuItem>
              <MenuItem eventKey="KSH">KSH</MenuItem>
            </NavDropdown>
          </Nav>

          <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
            <Navbar.Collapse className="navbar-collapse">
            <Nav className = 'nav-links'>
              <LinkContainer to={'/'} exact>
                <NavItem  title='Home' className = 'hover'>
                  <Glyphicon glyph='home'/>
                </NavItem>
              </LinkContainer>
              <LinkContainer to={'/account'} exact>
                <NavItem  title='Manage Account' className = 'hover'>
                  <Glyphicon glyph='user'/> 
                </NavItem>
              </LinkContainer>
              <LinkContainer to={'/reports'}>
                <NavItem title='Reports' className = 'hover'>
                  <Glyphicon glyph='list-alt' />
                </NavItem>
              </LinkContainer>
              <LinkContainer to={'/cart'}>
                <NavItem  title='Shopping Cart' className = 'hover'>
                  <Glyphicon glyph='shopping-cart'/>
                </NavItem>
              </LinkContainer>
            </Nav>
            </Navbar.Collapse>

          {!this.props.isLoggedIn &&            
             <Navbar.Text className="log-in">
                <span className="modal-link-inv" onClick={this.props.showLogin}>Log In/Create Account</span>
            </Navbar.Text>
          }

          {this.props.isLoggedIn &&            
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
  account: PropTypes.shape({
    firstName: PropTypes.string,
    notifications: PropTypes.array,
    shoppingCart: PropTypes.array
  }),
  showLogin: PropTypes.func,
  logOut: PropTypes.func
}
