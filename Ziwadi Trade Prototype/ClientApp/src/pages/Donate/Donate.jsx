import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
// import ReactPaginate from 'react-paginate';
import { Header, ItemPreview, DirectItemView, FundItemView, DonateTutorial, Spinner } from '../../components/Components';
import { DropdownButton, MenuItem, Button, Glyphicon } from 'react-bootstrap';
import { toast } from 'react-smart-toaster';
import * as _donateCalls from '../../API/DonateCalls'
import '../../styles/Donate.css';

const translations= {
  "filter": {
    "English": "Filter",
    "Swahili": "Chagua"
  },
  "donationtype": {
    "English": "Donation Type",
    "Swahili": "Aina ya Mchango"
  },
  "price": {
    "English": "Price",
    "Swahili": "Bei"
  },
  "name": {
    "English": "Name",
    "Swahili": "Jina"
  },
  "need": {
    "English": "Need",
    "Swahili": "Haja"
  },
  "atoz": {
    "English": "A to Z",
    "Swahili": "A hadi Z"
  },
  "ztoa": {
    "English": "Z to A",
    "Swahili": "Z hadi A"
  },
  "ltoh": {
    "English": "Low to High",
    "Swahili": "Chini hadi Juu"
  },
  "htol": {
    "English": "High to Low",
    "Swahili": "Juu hadi Chini"
  },
  "direct": {
    "English": "Direct",
    "Swahili": "Moja kwa Moja"
  },
  "fund": {
    "English": "Fund",
    "Swahili": "Mchango"
  },
  "sponsor": {
    "English": "Sponsor",
    "Swahili": "Msaidizi"
  },
  "none": {
    "English": "Default",
    "Swahili": "Default"
  },
  "previous": {
    "English": "Prev",
    "Swahili": "Hapo Awali"
  },
  "next": {
    "English": "Next",
    "Swahili": "Ifuatayo"
  },
  "clear": {
    "English": "Clear",
    "Swahili": "Futa"
  }
}

const hideTutorialKey = "HideTutorial";

class Donate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      filters: {
        type: "none",
        price: "none",
        name: "none",
        need: "htol",
        search: ""
      },
      selectedItem: null,
      loadingItems: true,
      languageChanged: false,
      currencyChanged: false,
      showTutorial: false,
      showSidebar: false,
    };

    this.onSearch = this.onSearch.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.itemClicked = this.itemClicked.bind(this);
    this.backClicked = this.backClicked.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.onDirectDonation = this.onDirectDonation.bind(this);
    this.onFundDonation = this.onFundDonation.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.hideTutorial = this.hideTutorial.bind(this);
  }

  updateItems(language, currency) {
    _donateCalls.GetItems(language, currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          items: response.payload,
          loadingItems: false,
          languageChanged: false,
          currencyChanged: false
        });
      }
    }); 
  }

  componentDidMount() {
    this.updateItems(this.props.language, this.props.currency);
    let hide = this.props.cookies.get(hideTutorialKey);
    if(!hide) {
      this.setState({
        showTutorial: true
      });
    }
  }

  onSearch(searchValue) {
    let {filters} = this.state;
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
    };
  }

  itemClicked(item) {
    this.setState({
      selectedItem: item
    });
  }

  backClicked() {
    this.setState({
      selectedItem: null,
    });
  }

  onPageChange(pageNum) {
    alert(pageNum.selected);
  }

  onDirectDonation(itemID, name, price, numItems, donateNow) {      
    _donateCalls.AddToCart(this.props.userID, itemID, numItems * price, numItems, this.props.currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.props.cartUpdated(response.payload, true);
        if(donateNow) {
          this.props.history.push("/cart");
        }
      }
      else {
        toast.error("Error adding " + name + " to cart: " + response.message);
      }
    });
  }

  onFundDonation(itemID, amount, donateNow) {
      _donateCalls.AddToCart(this.props.userID, itemID, amount, null, this.props.currency.code)
      .then((response) => {
        if(response.isSuccess) {
          this.props.cartUpdated(response.payload, true);
          if(donateNow) {
            this.props.history.push("/cart");
          }
        }
        else {
          toast.error("Error adding donation of " + amount + " to cart: " + response.message);
        }
      });
  }

  toggleSidebar() {
    let { showSidebar } = this.state;
    this.setState({ showSidebar: !showSidebar });
  }

  updateFilter(key, filterType) {
    let filters = this.state.filters;
    filters[filterType] = key;
    this.setState({
      filters
    });
  }

  filterItems() {
    let {items, filters} = this.state;
    let filteredItems = [];

    //Filter by type
    if(filters["type"] === "none"){
      filteredItems = items.filter(() => true);
    }
    else {
      filteredItems = items.filter(x => x.itemType === filters["type"]);
    }
    //Filter by sort query
    if(filters["search"] !== "") {
      filteredItems = filteredItems.filter(x => x.title.includes(filters["search"]));
    }
    
    //Filter by need    
    if(filters["need"] === "ltoh") {
      filteredItems = filteredItems.sort((a, b) => a.need > b.need ? -1 : 1)
    }
    else {
      filteredItems = filteredItems.sort((a, b) => a.need > b.need ? 1 : -1)
    }
    //Sort by name
    if(filters["name"] !== "none") {
      if(filters["name"] === "atoz") {
        filteredItems = filteredItems.sort((a,b) => a.title > b.title ? 1 : -1);
      }
      else {
        filteredItems = filteredItems.sort((a,b) => a.title > b.title ? -1 : 1);
      }
    }
    //Sort by price
    if(filters["price"] !== "none") {
      if(filters["price"] === "htol") {
        filteredItems = filteredItems.sort((a, b) => a.price > b.price ? -1 : 1);
      }
      else {
        filteredItems = filteredItems.sort((a, b) => a.price > b.price ? 1 : -1);
      }
    }

    return filteredItems;
  }

  clearFilters() {
    this.setState({
      filters: {
        type: "none",
        price: "none",
        name: "none",
        need: "htol",
        search: ""
      }
    });
  }

  hideTutorial() {
    this.props.cookies.set(hideTutorialKey, true);
    this.setState({
      showTutorial: false,
    });
  }

  render() {
    let filteredItems = this.filterItems();
    return (
      <div className="donate-content">
        <Header onSearch={this.onSearch} searchSuggestions={this.state.items.map(x => x.title)} language={this.props.language} showSearch/>
        <div className={"donate-sidebar-btn " + (this.state.showSidebar ? "expanded" : "")} onClick={this.toggleSidebar}>
          <p className="text">{translations["filter"][this.props.language]} <Glyphicon glyph={this.state.showSidebar ? "chevron-up" : "chevron-down"} className="filter-icon" /> </p> 
        </div>
        <div id="sidebar" className={"donate-sidebar " + (this.state.showSidebar ? "show" : "")}>
          <p className="filter-label">{translations["donationtype"][this.props.language]}:</p>
          <DropdownButton 
            id="type-dropdown" 
            title={translations[this.state.filters["type"]][this.props.language]} 
            onSelect={(key) => this.updateFilter(key, "type")}
            className="filter-dropdown"
          >
            <MenuItem eventKey="direct" disabled={this.state.filters["type"] === "direct"}>{translations["direct"][this.props.language]}</MenuItem>
            <MenuItem eventKey="fund" disabled={this.state.filters["type"] === "fund"}>{translations["fund"][this.props.language]}</MenuItem>
            <MenuItem eventKey="sponsor" disabled={this.state.filters["type"] === "sponsor"}>{translations["sponsor"][this.props.language]}</MenuItem>
            <MenuItem eventKey="none" disabled={this.state.filters["type"] === "none"}>{translations["none"][this.props.language]}</MenuItem>
          </DropdownButton>

          <p className="filter-label">{translations["price"][this.props.language]}:</p>
          <DropdownButton 
            id="price-dropdown" 
            title={translations[this.state.filters["price"]][this.props.language]} 
            onSelect={(key) => this.updateFilter(key, "price")}
            className="filter-dropdown"
          >
            <MenuItem eventKey="ltoh" disabled={this.state.filters["price"] === "ltoh"}>{translations["ltoh"][this.props.language]}</MenuItem>
            <MenuItem eventKey="htol" disabled={this.state.filters["price"] === "htol"}>{translations["htol"][this.props.language]}</MenuItem>
            <MenuItem eventKey="none" disabled={this.state.filters["price"] === "none"}>{translations["none"][this.props.language]}</MenuItem>
          </DropdownButton>

          <p className="filter-label">{translations["name"][this.props.language]}:</p>
          <DropdownButton 
            id="name-dropdown" 
            title={translations[this.state.filters["name"]][this.props.language]} 
            onSelect={(key) => this.updateFilter(key, "name")}
            className="filter-dropdown"
          >
            <MenuItem eventKey="atoz" disabled={this.state.filters["name"] === "atoz"}>{translations["atoz"][this.props.language]}</MenuItem>
            <MenuItem eventKey="ztoa" disabled={this.state.filters["name"] === "ztoa"}>{translations["ztoa"][this.props.language]}</MenuItem>
            <MenuItem eventKey="none" disabled={this.state.filters["name"] === "none"}>{translations["none"][this.props.language]}</MenuItem>
          </DropdownButton>

          <p className="filter-label">{translations["need"][this.props.language]}:</p>
          <DropdownButton 
            id="name-dropdown" 
            title={translations[this.state.filters["need"]][this.props.language]} 
            onSelect={(key) => this.updateFilter(key, "need")}
            disabled
            className="filter-dropdown"
          >
            <MenuItem eventKey="ltoh" disabled={this.state.filters["need"] === "ltoh"}>{translations["ltoh"][this.props.language]}</MenuItem>
            <MenuItem eventKey="htol" disabled={this.state.filters["need"] === "htol"}>{translations["htol"][this.props.language]}</MenuItem>
          </DropdownButton>

          <hr />
          <Button onClick={this.clearFilters} className="clear-btn">
            {translations["clear"][this.props.language]}
          </Button>
        </div>
        <div className="donate-items">
          { filteredItems.map((item) => {
              return <ItemPreview 
                key={item.itemID} 
                item={item} 
                currency={this.props.currency} 
                language={this.props.language} 
                itemClicked={this.itemClicked}
                currencyChanged={this.state.currencyChanged}
                languageChanged={this.state.languageChanged}
              />
            })
          }
          {this.state.loadingItems && 
            <div> 
              <div className="spinner-container">
                <Spinner />
              </div>
            </div>}
          {filteredItems.length === 0 && !this.state.loadingItems &&  
            <div className="empty-items"> 
              <h2>No items were found with the selected filters.</h2>
              <p className="modal-link" onClick={this.clearFilters}>{translations["clear"][this.props.language]}</p>
            </div>
          }

            {/* <div className="pagination-container"> 
              <ReactPaginate 
                pageCount={1}
                marginPagesDisplayed={1}
                pageRangeDisplayed={5}
                onPageChange={this.onPageChange}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
                previousLabel={translations["previous"][this.props.language]}
                nextLabel={translations["next"][this.props.language]}
              />
            </div> */}
          <DirectItemView 
            item={this.state.selectedItem} 
            currency={this.props.currency} 
            backClicked={this.backClicked} 
            show={this.state.selectedItem !== null && this.state.selectedItem.itemType === "direct"} 
            hide={this.backClicked} 
            language={this.props.language} 
            onDonate={this.onDirectDonation} 
            isLoggedIn={this.props.isLoggedIn} 
            forceLogin={this.props.forceLogin}
          />
          <FundItemView 
            item={this.state.selectedItem} 
            currency={this.props.currency} 
            backClicked={this.backClicked} 
            show={this.state.selectedItem !== null && this.state.selectedItem.itemType !== "direct"} 
            hide={this.backClicked} 
            language={this.props.language} 
            onDonate={this.onFundDonation} 
            isLoggedIn={this.props.isLoggedIn} 
            forceLogin={this.props.forceLogin}
          />
          
          <DonateTutorial show={this.state.showTutorial} language={this.props.language} currency={this.props.currency} onHide={this.hideTutorial} />
        </div>
      </div>
    );
  }
}

Donate.propTypes = {
  isLoggedIn: PropTypes.bool,
  cookies: PropTypes.object,
  userID: PropTypes.number,
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    symbol: PropTypes.string,
    symbolBefore: PropTypes.bool
  }),
  cartUpdated: PropTypes.func,
  forceLogin: PropTypes.func,
}

export default withRouter(Donate);