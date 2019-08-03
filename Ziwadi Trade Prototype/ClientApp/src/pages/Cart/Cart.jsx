import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
// import ReactPaginate from 'react-paginate';
import { Button } from 'react-bootstrap';
import { CartItemPreview, CartItemView, Header, Checkout, CartFundItemView } from '../../components/Components';
import { toast } from 'react-smart-toaster';
import { MetroSpinner } from 'react-spinners-kit';
import * as _donateCalls from '../../API/DonateCalls'
import '../../styles/Cart.css';

// const translations= {
//   "price": {
//     "English": "Price",
//     "Swahili": "Bei"
//   },
//   "name": {
//     "English": "Name",
//     "Swahili": "Jina"
//   }
// }

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      total: 0,
      selectedItem: null,
      selectedCartItem: null,
      loadingItems: true,
      languageChanged: false,
      currencyChanged: false,
      showCheckout: false,
    };

    this.onSearch = this.onSearch.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.itemClicked = this.itemClicked.bind(this);
    this.backClicked = this.backClicked.bind(this);
    this.onItemUpdated = this.onItemUpdated.bind(this);
    this.onDonationSuccess = this.onDonationSuccess.bind(this);
    this.navigateToDonate = this.navigateToDonate.bind(this);
    this.removeCartItem = this.removeCartItem.bind(this);
    this.toggleCheckout = this.toggleCheckout.bind(this);
  }

  updateItems(language, currency) {
    _donateCalls.LoadCart(this.props.userID, language, currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          items: response.payload,
          total: response.payload.reduce((x, y) => x + ((y.numItems === null) ? (y.totalAmount) : (y.numItems * y.price)), 0),
          loadingItems: false,
          languageChanged: false,
          currencyChanged: false
        });
      }
    }); 
  }

  componentDidMount() {
    this.updateItems(this.props.language, this.props.currency);
  }

  onSearch(searchValue) {
    let { filters } = this.state;
    filters.search = searchValue;
    this.setState({
      filters
    });
  }

  componentWillReceiveProps(newProps) {
    let currencyChanged = newProps.currency.code !== this.props.currency.code;
    let languageChanged = newProps.language !== this.props.language;
    if(currencyChanged || languageChanged) {
      this.updateItems(newProps.language, newProps.currency);
      this.setState({
        languageChanged,
        currencyChanged
      });
    }
  }

  itemClicked(item) {
    _donateCalls.GetItem(item.itemID, this.props.language, this.props.currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          selectedItem: response.payload,
          selectedCartItem: item,
        });
      }
      else {
        toast.error("Error fetching item data: " + response.message);
      }
    });
  }

  backClicked() {
    this.setState({
      selectedItem: null,
      selectedCartItem: null,
    })
  }

  onItemUpdated(itemID, totalAmount, numItems) {
    if(totalAmount === 0) {
      this.setState({
        selectedItem: null,
        selectedCartItem: null
      });
      this.removeCartItem(itemID);
      return;
    }

    let items = this.state.items;
    let item = items.find(x => x.itemID === itemID);
    item.totalAmount = totalAmount;
    item.numItems = numItems;
    this.setState({
      items,
      total: items.reduce((x, y) => x + y.totalAmount, 0)
    });
    _donateCalls.UpdateCartItem(item)
    .then((response) => {
      if(!response.isSuccess) {
        toast.error("Error updating cart item");
        //TODO: Undo state change
      }
    });
  }

  formatPrice(price) {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    price = price.toFixed(roundDigits);
    if(this.props.currency.symbolBefore) {
      return this.props.currency.currencySymbol + "" + price;
    }
    else {
      return price + "" + this.props.currency.currencySymbol
    }
  }

  onDonationSuccess() {
    this.setState({
      items: []
    });
    this.props.clearCart();
  }

  navigateToDonate() {
    this.props.history.push("/donate");
  }

  removeCartItem(itemID) {
    _donateCalls.RemoveCartItem(this.props.userID, itemID)
    .then((response) => {
      if(response.isSuccess) {
        let items = this.state.items;
        items = items.filter(x => x.itemID !== itemID);
        this.setState({
          items
        });
        this.props.cartUpdated(1, false);
      }
      else {
        toast.error("Error removing cart item: " + response.message)
      }
    });
  }

  toggleCheckout(show) {
    this.setState({
      showCheckout: show
    });
  }

  render() {
    let { total, items, loadingItems, selectedItem, selectedCartItem, showCheckout, languageChanged, currencyChanged } = this.state;
    let { isLoggedIn, language, currency, userID } = this.props;

    if(!isLoggedIn) {
      toast.error("You must log in first.");
      this.props.history.push("/");
      return null;
    }

    return (
      <div className="cart-content">
        <Header onSearch={this.onSearch} searchSuggestions={items.map(x => x.name)} language={language}/>
        <div className="cart-items">
          {items.length > 0 && <div><h2 className="cart-title">Your Donation Cart:</h2>
          <hr />

          <div className="items-container">
            { items.map((item) => {
                return <CartItemPreview 
                  key={item.itemID} 
                  item={item}
                  currency={currency} 
                  language={language}
                  languageChanged={languageChanged}
                  currencyChanged={currencyChanged} 
                  itemClicked={this.itemClicked}
                  removeCartItem={this.removeCartItem}
                  startOpen={items.length < 5}
                />
              })
            }
            </div>
          </div>}

          {!loadingItems && items.length === 0 && 
            <div className="empty-cart"> 
              <h2>Your donation cart is currently empty.</h2>
              <p>Head over to the <span className="modal-link" onClick={this.navigateToDonate}>Donate</span> page to see what you can do to help!</p>
            </div>
          }

          {loadingItems &&                 
            <div className="spinner-container">
              <MetroSpinner 
                size={100}
                color="#BF2E1B"
                loading={true}
              />
            </div>
          }

          {items.length > 0 && <hr />}
          {items.length > 0 && <div className="donate-btn-container">
            <Button className="donate-btn" onClick={() => this.toggleCheckout(true)}>
              <span className={languageChanged ? "text-hidden" : ""}>Checkout: </span>
              <span className={currencyChanged ? "text-hidden" : ""}>{this.formatPrice(total)}</span>
            </Button>
          </div>}

          <CartItemView 
            item={selectedItem} 
            cartItem={selectedCartItem}
            currency={currency} 
            backClicked={this.backClicked} 
            show={selectedItem !== null && selectedItem.itemType === "direct"} 
            hide={this.backClicked} 
            language={language} 
            onSave={this.onItemUpdated} 
          />
          <CartFundItemView 
            item={selectedItem} 
            cartItem={selectedCartItem}
            currency={currency} 
            backClicked={this.backClicked} 
            show={selectedItem !== null && selectedItem.itemType !== "direct"} 
            hide={this.backClicked} 
            language={this.props.language} 
            onSave={this.onItemUpdated}
          />
        </div>
        
        <Checkout 
          show={showCheckout}
          onHide={() => this.toggleCheckout(false)}
          userID={userID}
          onDonationSuccess={this.onDonationSuccess}
          language={language}
          currency={currency}
          cartItems={items}
          total={total}
        />
      </div>
    );
  }
}

Cart.propTypes = {
  isLoggedIn: PropTypes.bool,
  userID: PropTypes.number,
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    symbolBefore: PropTypes.bool
  }),
  cartUpdated: PropTypes.func,
  clearCart: PropTypes.func
}

export default withRouter(Cart);