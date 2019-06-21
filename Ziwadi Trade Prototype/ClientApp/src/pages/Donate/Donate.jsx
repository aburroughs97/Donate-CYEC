import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Header from '../../components/Header';
import ReactPaginate from 'react-paginate';
import ItemPreview from '../../components/donate/ItemPreview';
import ItemView from '../../components/donate/ItemView';
import { DropdownButton, MenuItem, Button } from 'react-bootstrap';
import { toast } from 'react-smart-toaster';
import * as _donateCalls from '../../API/DonateCalls'
import '../../styles/Donate.css';

class Donate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      filteredItems: [],
      filters: {
        type: "",
        price: "",
        name: ""
      },
      selectedItem: null
    };

    this.onSearch = this.onSearch.bind(this);
    this.loadImages = this.loadImages.bind(this);
    this.updateItems = this.updateItems.bind(this);
    this.itemClicked = this.itemClicked.bind(this);
    this.backClicked = this.backClicked.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  loadImages() {
    _donateCalls.LoadImages()
    .then((response) => {
      if(response.isSuccess) {
        let items = this.state.items;
        let images = response.payload;
        items.forEach(x => {
          x.imageBase = images.find(y => y.itemID === x.itemID).imageBase;
        });

        let filteredItems = this.state.filteredItems;
        filteredItems.forEach(x => {
          x.imageBase = items.find(y => y.itemID === x.itemID).imageBase;
        });

        this.setState({
          items,
          filteredItems
        })
      }
    });
  }

  updateItems(language, currency) {
    _donateCalls.GetItems(language, currency)
    .then((response) => {
      if(response.isSuccess) {
        let oldItems = this.state.items;
        let items = response.payload;
        items.forEach(x => {
          x.imageBase = oldItems.find(y => y.itemID === x.itemID).imageBase;
        });

        let oldFilteredItems = this.state.filteredItems;
        let filteredItems = [];
        oldFilteredItems.forEach(x => {
          let newItem = items.find(y => y.itemID === x.itemID);
          filteredItems.push(newItem);
        });

        this.setState({
          items,
          filteredItems
        })
      }
    });  
  }

  componentDidMount() {
    _donateCalls.GetItems(this.props.language, this.props.currency)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          items: response.payload,
          filteredItems: response.payload
        });
        this.loadImages();
      }
      else {
        toast.error(response.message);
      }
    }); 
  }

  onSearch(searchValue) {
    if(searchValue === "") {
      this.setState(state => ({
        filteredItems: state.items
      }));
      return;
    }
    let items = this.state.items;
    let filteredItems = items.filter(x => x.title.trim().toLowerCase().includes(searchValue.trim().toLowerCase()));
    this.setState({
      filteredItems
    })
  }

  componentWillReceiveProps(newProps) {
    if(newProps.currency !== this.props.currency || newProps.language !== this.props.language) {
      this.updateItems(newProps.language, newProps.currency);
    }
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

  render() {
    return (
      <div className="donate-content">
        <Header onSearch={this.onSearch} searchSuggestions={this.state.items.map(x => x.title)}/>
        <div className="donate-sidebar">
          <h2>Filter:</h2>
          <hr />
          <DropdownButton id="type-dropdown" title="Donation Type ">
            <MenuItem eventKey="1">Action</MenuItem>
            <MenuItem eventKey="2">Another action</MenuItem>
            <MenuItem eventKey="3">Something else here</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey="4">Separated link</MenuItem>
          </DropdownButton>
        </div>
        <div className="donate-items">
          { this.state.selectedItem === null && this.state.filteredItems.map((item) => {
            if(this.state.filters["type"] === "" || this.state.filters["type"] === item.itemType)
              return <ItemPreview key={item.itemID} item={item} currency={this.props.currency} itemClicked={this.itemClicked}/>
            else 
              return null;
            })
          }

          { this.state.selectedItem === null && 
            <div className="pagination-container"> 
              <ReactPaginate 
                pageCount={30}
                marginPagesDisplayed={1}
                pageRangeDisplayed={5}
                onPageChange={this.onPageChange}
                containerClassName={'pagination'}
                subContainerClassName={'pages pagination'}
                activeClassName={'active'}
              />
            </div>
          }

          { this.state.selectedItem !== null &&
            <div> 
              <ItemView item={this.state.selectedItem} currency={this.props.currency} backClicked={this.backClicked}/>
            </div>         
          }
        </div>
      </div>
    );
  }
}

Donate.propTypes = {
  language: PropTypes.string,
  currency: PropTypes.string,
}

export default withRouter(Donate);