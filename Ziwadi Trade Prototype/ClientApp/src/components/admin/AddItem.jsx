import React, { Component } from 'react';
import { Button, ToggleButtonGroup, ToggleButton, FormGroup, FormControl, ControlLabel, InputGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import ImageUploader from 'react-images-upload';
import * as _adminCalls from '../../API/AdminCalls';
import { toast } from 'react-smart-toaster';

//const options = ["products", "users", "information"];

const defaultItem = {
  englishName: "",
  swahiliName: "",
  price: 0,
  goalAmount: 0,
  currentAmount: 0,
  englishDescription: "",
  swahiliDescription: "",
  need: 1,
  autoDecrement: false,
  decrementPerDay: 0,
  imageBase: ""
};

class AddItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItemType: "direct",
      selectedItemCurrency: "KES",
      item: { ...defaultItem },
      image: undefined
    };

    this.updateItem = this.updateItem.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  updateSelectedItemType(type) {
    this.setState({
      selectedItemType: type
    })
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

  addItem() {
    let { item, selectedItemCurrency, selectedItemType, image } = this.state;
    if(item.englishName === "" || item.swahiliName === "" || item.price === 0
      || item.englishDescription === "" || item.swahiliDescription === ""
      || image === undefined) {
        toast.error("Please fill out all fields.");
        return;
    }

    var reader = new FileReader();

    reader.onload = function() {
      item.imageBase = reader.result;
      let request = {
        ...item,
        selectedItemCurrency,
        selectedItemType
      };
  
      _adminCalls.AddItem(request)
      .then((response) => {
        if(response.isSuccess) {
          toast.success("Item added successfully.");
        }
        else {
          toast.error("Error adding item.");
        }
      });
    }
    reader.readAsDataURL(image);
  }

  render() {
    let { selectedItemType, selectedItemCurrency, item, image } = this.state;
    return (
      <div className="admin-body">
        <h1 className="add-item-title">Add An Item</h1>
        <hr />
        <FormGroup controlId="input-group" className="single-group">
          <ControlLabel className="item-type-lbl">Item Type: </ControlLabel>
          <ToggleButtonGroup name="itemTypes" type="radio" value={selectedItemType} onChange={(value) => this.setState({ selectedItemType: value })}>
            <ToggleButton className="item-type-btn" value={"direct"}>Direct</ToggleButton>
            <ToggleButton className="item-type-btn" value={"fund"}>Fund</ToggleButton>
            <ToggleButton className="item-type-btn" value={"sponsor"}>Sponsor</ToggleButton>
          </ToggleButtonGroup>
        </FormGroup>
        
        <hr />

        <ImageUploader
          withIcon={false}
          buttonText='Select Image'
          onChange={(pictures) => this.setState({image: pictures[0]})}
          imgExtension={['.jpg', '.png']}
          withPreview
          singleImage
          maxFileSize={5242880}
          className="image-uploader"
          label={image !== undefined ? image.name : ""}
          buttonClassName="upload-btn"
        />

        <FormGroup controlId="input-group" className="double-group">
            <ControlLabel>English Name:</ControlLabel>
            <FormControl
                placeholder="Name..."
                name="itemName"
                onChange={e => this.updateItem({ englishName: e.target.value })}
                required
            />
        </FormGroup>
        <FormGroup controlId="input-group" className="double-group">
            <ControlLabel>Swahili Name:</ControlLabel>
            <FormControl
                placeholder="Name..."
                name="itemName"
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
                onChange={e => this.updateItem({ swahiliDescription: e.target.value })}
                required
            />
        </FormGroup>

        <FormGroup controlId="input-group" className="single-group">
          <ControlLabel>{selectedItemType === "direct" ? "Item Cost: " : "Goal Amount:"}</ControlLabel>
          <InputGroup>
            <FormControl 
              type="number"
              name="itemPrice"
              onChange={e => this.updateItem({ price: Number.parseFloat(e.target.value) })}
              required          
            />
            <DropdownButton
              componentClass={InputGroup.Button}
              id="input-dropdown-addon"
              title={selectedItemCurrency + " "}
              onSelect={(key) => this.setState({ selectedItemCurrency: key})}
            >
              <MenuItem eventKey="USD">USD</MenuItem>
              <MenuItem eventKey="KES">KES</MenuItem>
            </DropdownButton>
          </InputGroup>
        </FormGroup>           

        {selectedItemType !== "direct" && 
          <FormGroup controlId="input-group" className="single-group">
            <ControlLabel>Current Need:</ControlLabel>
            <FormControl 
                type="number"
                name="itemNeed"
                onChange={e => this.updateItem({ need: Number.parseFloat(e.target.value) })}
                required          
            />
          </FormGroup>
        }

        {selectedItemType === "direct" &&
        <div>
          <FormGroup controlId="input-group" className="double-group">
            <ControlLabel>Goal Amount:</ControlLabel>
            <FormControl 
                type="number"
                name="itemNeed"
                onChange={e => this.updateItem({ goalAmount: Number.parseFloat(e.target.value) })}
                required          
            />
          </FormGroup>
          <FormGroup controlId="input-group" className="double-group">
            <ControlLabel>Current Amount:</ControlLabel>
            <FormControl 
                type="number"
                name="itemNeed"
                onChange={e => this.updateItem({ currentAmount: Number.parseFloat(e.target.value) })}
                required          
            />
          </FormGroup>
          <FormGroup controlId="input-group" className="single-group">
            <ControlLabel>Auto-Decrement: </ControlLabel>
            <InputGroup>
              <InputGroup.Addon>
                <input type="checkbox" aria-label="..." onChange={(e) => this.updateItem({autoDecrement: e.target.checked})}/>
              </InputGroup.Addon>
              <FormControl
                disabled={!item.autoDecrement} 
                type="number"
                name="decrementPerDay"
                onChange={e => this.updateItem({ decrementPerDay: Number.parseFloat(e.target.value) })}
                required          
              />
            </InputGroup>
          </FormGroup> 
        </div>
        } 
        <Button className="add-item-btn" onClick={this.addItem}>
          Add Item
        </Button>     
      </div>
    );
  }
};

export default AddItem
