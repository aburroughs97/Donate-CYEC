import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal,  Button, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import { toast } from 'react-smart-toaster';
import ImageUploader from 'react-images-upload';
import * as _adminCalls from '../../API/AdminCalls';

export default class EditItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: null,
      imageChanged: false,
      image: null
    }

    this.updateItem = this.updateItem.bind(this);
    this.updateItemClicked = this.updateItemClicked.bind(this);
  }

  componentWillReceiveProps(props) {
    if(props.itemID !== -1) {
      _adminCalls.GetItemData(props.itemID)
      .then((response) => {
        if(response.isSuccess){
          this.setState({
            item: response.payload
          });
        }
        else {
          toast.error("Error loading item data: " + response.message);
          this.props.onHide();
        }
      });
    }
    else {
      this.setState({
        item: null
      });
    }
  }

  updateItem(updatedItem) {
    let { item } = this.state;
    item = {
      ...item,
      ...updatedItem
    };
    this.setState({
      item
    });
  }

  updateItemClicked() {
    _adminCalls.UpdateItem(this.state.item)
    .then((response) => {
      if(response.isSuccess) {
        toast.success("Item updated successfully");
        this.props.onHide(this.state.item);
      }
      else {
        toast.error("Error updating item: " + response.message);
      }
    });
  }

  render() {
    let { item, imageChanged, image } = this.state;
    if(item === null) return null;

    return (
      <Modal
        size="sm"
        show={this.props.show}
        onHide={() => this.props.onHide(null)}
        dialogClassName="edit-item"
      >
      <Modal.Header closeButton />
      <Modal.Body>
        <div className="info-container">
          <FormGroup controlId="input-group" className="single-group">
            <ControlLabel className="item-type-lbl">Item Type: </ControlLabel>
            <ToggleButtonGroup name="itemTypes" type="radio" defaultValue={item.selectedItemType} >
              <ToggleButton className="item-type-btn" disabled={item.selectedItemType !== "direct"} value={"direct"}>Direct</ToggleButton>
              <ToggleButton className="item-type-btn" disabled={item.selectedItemType !== "fund"} value={"fund"}>Fund</ToggleButton>
              <ToggleButton className="item-type-btn" disabled={item.selectedItemType !== "sponsor"} value={"sponsor"}>Sponsor</ToggleButton>
            </ToggleButtonGroup>
          </FormGroup>
          
          <hr />

          <ImageUploader
            withIcon={false}
            buttonText='Select Image'
            onChange={(pictures) => this.setState({imageChanged: true, image: pictures[0]})}
            imgExtension={['.jpg', '.png']}
            withPreview
            singleImage
            maxFileSize={5242880}
            className="image-uploader"
            label={imageChanged ? image.name : "Previous Image"}
            buttonClassName="upload-btn"
            //Load item image here
          />

          <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>English Name:</ControlLabel>
              <FormControl
                  placeholder="Name..."
                  name="itemName"
                  defaultValue={item.englishName}
                  onChange={e => this.updateItem({ englishName: e.target.value })}
                  required
              />
          </FormGroup>
          <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>Swahili Name:</ControlLabel>
              <FormControl
                  placeholder="Name..."
                  name="itemName"
                  defaultValue={item.swahiliName}
                  onChange={e => this.updateItem({ swahiliName: e.target.value })}
                  required
              />
          </FormGroup>  

          <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>English Description:</ControlLabel>
              <FormControl
                  placeholder="Description..."
                  componentClass="textarea"
                  name="itemDescription"
                  defaultValue={item.englishDescription}
                  onChange={e => this.updateItem({ englishDescription: e.target.value })}
                  required
              />
          </FormGroup>
          <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>Swahili Description:</ControlLabel>
              <FormControl
                  placeholder="Description..."
                  componentClass="textarea"
                  name="itemDescription"
                  defaultValue={item.swahiliDescription}
                  onChange={e => this.updateItem({ swahiliDescription: e.target.value })}
                  required
              />
          </FormGroup>

          <FormGroup controlId="input-group" className="single-group">
            <ControlLabel>{item.selectedItemType === "direct" ? "Item Cost: " : "Goal Amount:"}</ControlLabel>
            <InputGroup>
              <FormControl 
                type="number"
                name="itemPrice"
                defaultValue={item.price}
                onChange={e => this.updateItem({ price: Number.parseFloat(e.target.value) })}
                required          
              />
              <DropdownButton
                componentClass={InputGroup.Button}
                id="input-dropdown-addon"
                title={item.selectedItemCurrency + " "}
                defaultValue={item.selectedItemCurrency}
                onSelect={(key) => this.setState({ selectedItemCurrency: key})}
              >
                <MenuItem eventKey="USD">USD</MenuItem>
                <MenuItem eventKey="KES">KES</MenuItem>
              </DropdownButton>
            </InputGroup>
          </FormGroup>           

          {item.selectedItemType !== "direct" && 
            <FormGroup controlId="input-group" className="single-group">
              <ControlLabel>Current Need:</ControlLabel>
              <FormControl 
                  type="number"
                  name="itemNeed"
                  defaultValue={item.need}
                  onChange={e => this.updateItem({ need: Number.parseFloat(e.target.value) })}
                  required          
              />
            </FormGroup>
          }

          {item.selectedItemType === "direct" &&
          <div>
            <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>Goal Amount:</ControlLabel>
              <FormControl 
                  type="number"
                  name="goalAmount"
                  defaultValue={item.goalAmount}
                  onChange={e => this.updateItem({ goalAmount: Number.parseFloat(e.target.value) })}
                  required          
              />
            </FormGroup>
            <FormGroup controlId="input-group" className="double-group">
              <ControlLabel>Current Amount:</ControlLabel>
              <FormControl 
                  type="number"
                  name="currentAmount"
                  defaultValue={item.currentAmount}
                  onChange={e => this.updateItem({ currentAmount: Number.parseFloat(e.target.value) })}
                  required          
              />
            </FormGroup>
            <FormGroup controlId="input-group" className="single-group">
              <ControlLabel>Auto-Decrement: </ControlLabel>
              <InputGroup>
                <InputGroup.Addon>
                  <input type="checkbox" aria-label="..." defaultChecked={item.autoDecrement} onChange={(e) => this.updateItem({autoDecrement: e.target.checked})}/>
                </InputGroup.Addon>
                <FormControl
                  disabled={!item.autoDecrement} 
                  type="number"
                  name="decrementPerDay"
                  defaultValue={item.autoDecrement ? item.decrementPerDay : ""}
                  onChange={e => this.updateItem({ decrementPerDay: Number.parseFloat(e.target.value) })}
                  required          
                />
              </InputGroup>
            </FormGroup> 
          </div>
          } 
          <Button className="add-item-btn" onClick={this.updateItemClicked}>
            Update Item
          </Button>  
        </div> 
      </Modal.Body>
    </Modal>    
    )
  }
}

EditItem.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  itemID: PropTypes.number
}