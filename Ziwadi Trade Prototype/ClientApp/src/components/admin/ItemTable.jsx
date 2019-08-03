import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ProgressBar } from 'react-bootstrap';
import { EditItem } from '../Components';
import ReactTable from 'react-table';
import { toast } from 'react-smart-toaster';
import * as _donateCalls from '../../API/DonateCalls';

export default class ItemTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      loadingItems: true,
      selectedItemID: -1,
      currencyChanged: false,
      languageChanged: false
    };
    this.loadItemColumns = this.loadItemColumns.bind(this);
    this.handleUpdateItem = this.handleUpdateItem.bind(this);
    this.formatPrice = this.formatPrice.bind(this);
    this.editClosed = this.editClosed.bind(this);
  }

  formatPrice(price) {
    let roundDigits = this.props.currency.roundDigits > 0 ? this.props.currency.roundDigits : 0;
    price = price.toFixed(roundDigits);
    if(this.props.currency.symbolBefore) {
      return this.props.currency.currencySymbol +"" + price;
    }
    else {
      return price + "" + this.props.currency.currencySymbol
    }
  }

  componentWillReceiveProps(props) {
    let currencyChanged = props.currency.code !== this.props.currency.code;
    let languageChanged = props.language !== this.props.language;
    if(currencyChanged || languageChanged) {
      this.setState({
        currencyChanged,
        languageChanged
      })
      this.getItems(props.language, props.currency);
    }
  }

  loadItemColumns() { 
    return [{
      Header: "ID",
      accessor: "itemID",
      className: "table-cell",
      minWidth: 40,
      maxWidth: 40,
      pivot: true
    },
    {
      Header: "Title",
      accessor: "title",
      className: "table-cell",
    },
    {
      Header: "Price",
      accessor: "price",
      className: "table-cell",
      Cell: (props) => <span>{!this.state.currencyChanged ? this.formatPrice(props.value) : ""}</span>
    },
    {
      Header: "Need/Progress",
      //TODO: Figure out how to sort this based on need
      className: "table-cell",
      Cell: (props) => {
        let item = props.original;
        let need = item.need;
        let needValue = need;
        let needLabel;
        let needColor;

        if(item.itemType === "direct") {
          if(need <= .3) {
            needColor= "danger";
          }
          else if (need <= .6) {
            needColor = "warning";
          }
          else {
            needColor = "success";
          }
          needLabel= item.actualAmount + " / " + item.goalAmount;
        }
        else {
          needColor = item.itemType === "fund" ? "info" : "default";
          needValue = item.actualAmount / item.goalAmount;
          needLabel = (needValue * 100).toFixed(0) + "%"
        }      
        
        if(needColor === "default") {
          return <ProgressBar now={needValue * 100} label={needLabel}/>
        }
        else {
          return <ProgressBar bsStyle={needColor} now={needValue * 100} label={needLabel}/>
        }
      }
    },
    {
      Header: "Type",
      accessor: "itemType",
      className: "table-cell",
      //Capitalize first letter
      Cell: (props) => <span>{props.value}</span>
    },
    {
      Header: "",
      className: "table-cell",
      minWidth: 120,
      maxWidth: 200,
      Cell: (props) => { return <Button className="table-btn" onClick={() => this.handleUpdateItem(props.original)}>Edit</Button> } 
    }
  ];
}


handleUpdateItem(item) {
  this.setState({ selectedItemID: item.itemID })
}

getItems(language, currency) {
  _donateCalls.GetItems(language, currency.code)
    .then((response) => {
      if(response.isSuccess) {
        let items = response.payload.sort((x, y) => x.itemID < y.itemID ? -1 : 1);
        this.setState({
          items,
          loadingItems: false,
          currencyChanged: false,
          languageChanged: false
        });
      }
      else {
        toast.error("Error loading users.");
      }
    });
}

componentDidMount() {
  let { language, currency } = this.props;
  this.getItems(language, currency);
}

editClosed(updatedItem) {
  if(updatedItem !== null) {
    let { language, currency } = this.props;
    this.getItems(language, currency);
    this.setState({
      selectedItemID: -1
    });
  }
  else {
    this.setState({
      selectedItemID: -1
    });
  }
}

  render() {
    let { items, loadingItems, selectedItemID } = this.state;
    return (
      <div className="admin-body user">
          <ReactTable
            className="table"
            defaultPageSize={15}
            data={items}
            columns={this.loadItemColumns()}
            showPaginationTop
            showPaginationBottom={false}
            showPageSizeOptions={false}
            loading={loadingItems}
          />
        <EditItem show={selectedItemID !== -1} onHide={this.editClosed} itemID={selectedItemID} />
      </div>
    )
  }
}

ItemTable.propTypes = {
  language: PropTypes.string,
  currency: PropTypes.shape({
    code: PropTypes.string,
    currencySymbol: PropTypes.string,
    symbolBefore: PropTypes.bool,
    roundDigits: PropTypes.number
  }),
}