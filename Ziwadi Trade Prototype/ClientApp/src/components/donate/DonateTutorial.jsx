import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Glyphicon, Carousel, CarouselItem } from 'react-bootstrap';
import { DirectItemView } from '../Components';
import { toast } from 'react-smart-toaster';
import * as _donateCalls from '../../API/DonateCalls';
// import logo from '../../media/CYEC-horizontal.jpg';

export default class DonateTutorial extends Component {
  constructor(props){
    super(props);
    this.state = {
      index: 0,
      selectedItem: null
    };

    this.onHide = this.onHide.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.loadItem = this.loadItem.bind(this);
    this.hideItem = this.hideItem.bind(this);
    this.donateClicked = this.donateClicked.bind(this);
  }

  onHide() {
    this.setState({
      index: 0
    });
    this.props.onHide();
  }

  nextPage() {
    let { index } = this.state;
    this.setState({
      index: ++index,
    });
  }

  prevPage() {
    let { index } = this.state;
    this.setState({
      index: --index,
    });
  }

  loadItem() {
    _donateCalls.GetItem(1, this.props.language, this.props.currency.code)
    .then((response) => {
      if(response.isSuccess) {
        this.setState({
          selectedItem: response.payload,
        });
      }
      else {
        toast.error("Error fetching item data: " + response.message);
      }
    });
  }

  donateClicked(itemID, name, price, numItems, donateNow) {
    toast.success("Your test donation of " + numItems + name +" was successful!");
  }

  hideItem() {
    this.setState({
      selectedItem: null
    });
  }

  render() {
    let { index } = this.state;
    return (
      <Modal
      size="lg"
      backdrop="static"
      show={this.props.show}
      onHide={this.onHide}
      dialogClassName="donate-tutorial"
    >
    <Modal.Body>
      {/* <img
        alt="CYEC-Logo"
        src={logo}
        className="logo"
      /> */}
      <Carousel defaultActiveIndex={0} controls={false} indicators slide interval={null} activeIndex={index}>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">Welcome to the Donate Page</h1>
            <hr />
            <ul className="list">
              <li>In order to maximize your impact, we want to take a few minutes to explain how this website works.</li>
              <li>This website exists to help communicate the needs of the CYEC and allow you to donate directly to meet those needs.</li>
              <li>Our goal is to help you better understand the impact your donation can have at the CYEC</li>
            </ul>
            <div className="btn-container">
              <p className="modal-link skip-btn" onClick={this.onHide}>Skip</p>
              <Glyphicon glyph="arrow-right" className="next-btn" onClick={this.nextPage}/>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">First Things First</h1>
            <hr />
            <ul className="list">
              <li>This website isn't the only way you can donate</li>
              <li>If you're looking to:
                <ul className="sublist">
                  <li>Support the CYEC monthly</li>
                  <li>Sponsor a child anonymously</li>
                  <li>Donate a larger sum of money</li>
                </ul>
              </li>  
              <li>Please check out our GlobalGiving page <a href="https://www.globalgiving.org/donate/5220/zawadi-fund-international/" rel="noopener noreferrer" target="_blank" className="modal-link">here</a></li>
            </ul>

            <div className="btn-container">
              <Glyphicon glyph="arrow-right" className="next-btn" onClick={this.nextPage}/>
              <p className="modal-link skip-btn" onClick={this.onHide}>Skip</p>
              <Glyphicon glyph="arrow-left" className="prev-btn" onClick={this.prevPage}/>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">How This Site Works</h1>
            <hr />
            <ul className="list sublist">
              <li>There are two ways you can donate: </li>
              <ol className="sublist">
                <li><b>Bring a donation to the CYEC directly</b>
                  <ul className="sublist">
                    <li>For those in Nyeri and the surrounding area. No payments necessary</li>
                  </ul>
                </li>
                <li><b>Provide funds for the CYEC to purchase specific items</b>
                  <ul className="sublist">
                    <li>Through MPESA or Credit Card</li>
                    <li>Payments are secure and go directly to the CYEC</li>
                    <li>Once payment is received, the CYEC will work to purchase items as quickly as possible</li>
                  </ul>
                </li>
              </ol>
            </ul>
            <div className="btn-container">
              <Glyphicon glyph="arrow-right" className="next-btn" onClick={this.nextPage}/>
              <p className="modal-link skip-btn" onClick={this.onHide}>Skip</p>
              <Glyphicon glyph="arrow-left" className="prev-btn" onClick={this.prevPage}/>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">How Need Works</h1>
            <hr />
            <ul className="list sublist">
              <li>All items on this page are displayed with a progress bar
                <ul>
                  <li>Red, Yellow, and Green progress bars represent the CYEC's current stock of that item</li>
                  <li>Blue progress bars represent how close that item is to reaching it's goal</li>
                </ul>
              </li>
              <li>When you view an item, the progress bar will update to show the impact you can have</li>
              <li><span className="modal-link" onClick={this.loadItem}>Load an Item</span></li>
            </ul>
            <Button onClick={this.onHide}>Close</Button>
            <div className="btn-container">
              <Glyphicon glyph="arrow-left" className="prev-btn" onClick={this.prevPage}/>
            </div>
          </div>
        </CarouselItem>
      </Carousel>
      <DirectItemView item={this.state.selectedItem} currency={this.props.currency} backClicked={this.hideItem} show={this.state.selectedItem !== null && this.state.selectedItem.itemType === "direct"} hide={this.hideItem} language={this.props.language} onDonate={this.donateClicked} showDonateButtons/>
    </Modal.Body>
  </Modal>
    )
  }

}

DonateTutorial.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  language: PropTypes.string,
  currency: PropTypes.object
}