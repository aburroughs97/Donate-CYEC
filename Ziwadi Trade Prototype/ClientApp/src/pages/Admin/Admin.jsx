import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { AdminSidebar, AddItem, UserTable, ItemTable, DropOffDonationTable, PaymentDonationTable } from '../../components/Components';
import '../../styles/Admin.css';
import { toast } from 'react-smart-toaster';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOptionsIndex: 0,
    };
    this.optionChanged = this.optionChanged.bind(this);
  }

  optionChanged(newIndex){
    this.setState({
      selectedOptionsIndex: newIndex
    })
  }

  render() {
    let { isLoggedIn, isAdmin, language, currency } = this.props;
    if(!isLoggedIn) {
      toast.error("You must be logged in to access this page.");
      this.props.history.push("/");
      return null;
    }
    if(!isAdmin) {
      toast.error("You do not have permission to access this page.");
      this.props.history.push("/");
      return null;
    }

    let body;
    switch(this.state.selectedOptionsIndex){
      case 0:
        body = <DropOffDonationTable language={language} currency={currency}/>
        break;
      case 1: 
        body = <PaymentDonationTable language={language} currency={currency} />
        break;
      case 2:
        body = <AddItem />;
        break;
      case 3:
        body = <ItemTable language={language} currency={currency} />
        break;
      case 4:
        body = <UserTable />;
        break;
      default:
        body = <h2>An error as occured</h2>
        break;
    }
    return (
      <div className="account-content">
        <AdminSidebar optionChanged={this.optionChanged} selectedOptionsIndex={this.state.selectedOptionsIndex}/>
        {body}
      </div>
    );
  }
};

Admin.propTypes = {
  isLoggedIn: PropTypes.bool,
  isAdmin: PropTypes.bool,
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
};

export default withRouter(Admin)
