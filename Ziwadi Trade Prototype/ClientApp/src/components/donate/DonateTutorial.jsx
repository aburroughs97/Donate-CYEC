import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Glyphicon, Carousel, CarouselItem, ProgressBar } from 'react-bootstrap';
import { DirectItemView } from '../Components';
import { toast } from 'react-smart-toaster';
import * as _donateCalls from '../../API/DonateCalls';
// import logo from '../../media/CYEC-horizontal.jpg';

const translations = {
  "need": {
    "English": "Need",
    "Swahili": "Haja"
  },
  "verylow": {
    "English": "VERY LOW",
    "Swahili": "CHINI SANA"
  },
  "low": {
    "English": "LOW",
    "Swahili": "CHINI"
  },
  "medium": {
    "English": "MODERATE",
    "Swahili": "WASTANI"
  },
  "high": {
    "English": "HIGH",
    "Swahili": "JUU"
  },
  "critical": {
    "English": "CRITICAL",
    "Swahili": "MUHIMU"
  },
  "none": {
    "English": "NONE",
    "Swahili": "HAKUNA"
  },
}

export default class DonateTutorial extends Component {
  constructor(props){
    super(props);
    this.state = {
      index: 0,
      selectedItem: null,
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
    toast.success("Your test donation of " + numItems + " " + name +" was successful!");
  }

  hideItem() {
    this.setState({
      selectedItem: null
    });
  }

  render() {
    let { index } = this.state;
    let { language } = this.props;

    return (
      <Modal
      size="lg"
      backdrop="static"
      show={this.props.show}
      onHide={this.onHide}
      dialogClassName="donate-tutorial"
    >
    <Modal.Body>
      <Carousel defaultActiveIndex={0} controls={false} indicators slide interval={null} activeIndex={index}>

        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">Welcome!</h1>
            <hr />
            <div className="info nomargin">
              <p>If you're not looking to donate items directly, there are other ways to give.</p>
              <p className="list-head">If you're looking to:</p>
              <ul>
                <li>Support the CYEC monthly</li>
                <li>Sponsor a child anonymously</li>
                <li>Donate a larger sum of money</li>
              </ul>
              <p className="list-footer">Please check out our GlobalGiving page <a href="https://www.globalgiving.org/donate/5220/zawadi-fund-international/" rel="noopener noreferrer" target="_blank" className="modal-link">here</a>.</p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">How You Can Donate</h1>
            <hr />
            <div className="info nomargin">
            <p>There are two ways you can donate: </p>
              <ol className="sublist">
                <li><b>Bring a donation directly to the CYEC</b>
                  <ul className="sublist">
                    <li>For those in Nyeri and the surrounding area. No payments necessary.</li>
                  </ul>
                </li>
                <li><b>Provide funds for the CYEC to purchase specific items</b>
                  <ul className="sublist">
                    <li>MPESA only (Credit Card coming soon)</li>
                    <li>Once payment is received, the CYEC will purchase items as quickly as possible.</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">How Need Works</h1>
            <hr />
            <div className="info nomargin">
              <p>For many items, you'll find a red, yellow, or green progress bar representing the CYEC's current inventory of that item.
                These are items that you can donate directly to the CYEC.
              </p>
                <div className="sample-container">
                <div className="progress-bar-sample">
                  <li className="need-danger"><b>{translations["critical"][language]}</b></li>
                  <li className="need-danger"><b>{translations["high"][language]}</b></li>
                  <li className="need-warning"><b>{translations["medium"][language]}</b></li>
                  <li className="need-success"><b>{translations["low"][language]}</b></li>
                  <li className="need-success"><b>{translations["none"][language]}</b></li>
                </div>
                <div className="progress-bar-sample">
                  <ProgressBar className="first" now={10} bsStyle="danger" />
                  <ProgressBar now={30} bsStyle="danger" />
                  <ProgressBar now={50} bsStyle="warning" />
                  <ProgressBar now={80} bsStyle="success" />
                  <ProgressBar now={100} bsStyle="success" />
                </div>
              </div>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">How Need Works</h1>
            <hr />
            <div className="info nomargin">
              <p>For others, you'll find a blue progress bar that represents the progress the CYEC has raised towards a goal. </p>
              <p> These are campaigns to either <span className="need-info">raise funds for a specific purpose</span> or <span className="need-default">sponsor a child</span>.</p>
                <div className="sample-container">
                <div className="progress-bar-sample">
                    <li className="need-info"><b>$20 / $30</b></li>
                    <li className="need-default"><b>$50 /$100</b></li>
                  </div>
                  <div className="progress-bar-sample">
                    <ProgressBar className="first" bsStyle="info" now={66.67} />
                    <ProgressBar now={50} />
                  </div>
                </div>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem animateIn animateOut>
          <div className="content-container">
            <h1 className="title">Finally...</h1>
            <hr />
            <div className="info nomargin">
              <p>Items are displayed in order of need, meaning the CYEC's greatest needs will be displayed first. We encourage you
                to consider contributing to those items, but any and all donations will be greatly appreciated.
              </p>

              <Button className="get-started" onClick={this.onHide}>Get Started!</Button>
            </div>
          </div>
        </CarouselItem>
      </Carousel>
      <div className="btn-container">
        {index !== 4  && <Glyphicon glyph="arrow-right" className="next-btn" onClick={this.nextPage}/>}
        {index !== 4  && <p className="modal-link skip-btn" onClick={this.onHide}>Skip</p>}
        {index !== 0 && <Glyphicon glyph="arrow-left" className="prev-btn" onClick={this.prevPage}/>}
      </div>
      <DirectItemView item={this.state.selectedItem} currency={this.props.currency} backClicked={this.hideItem} show={this.state.selectedItem !== null && this.state.selectedItem.itemType === "direct"} hide={this.hideItem} language={this.props.language} onDonate={this.donateClicked} showDonateButtons isLoggedIn={true}/>
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