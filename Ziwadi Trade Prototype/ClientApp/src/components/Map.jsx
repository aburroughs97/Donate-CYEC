import React, {Component} from 'react';
import ReactMapGL, { Marker, GeolocateControl, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CityPin } from './Components';

const TOKEN = "pk.eyJ1IjoiYWJ1cnJvdWdoczk3IiwiYSI6ImNqeThyMHgybjBhZXUzb24xY2lleXhranEifQ.cpDs06oRd760Ced0YGeP3Q";
const mapsURL = 'https://www.google.com/maps/place/CYEC+and+Thunguma+Medical+Clinic/@-0.4384081,36.9833976,17z/data=!3m1!4b1!4m5!3m4!1s0x182860e8b00b4ad7:0xf414845654405d50!8m2!3d-0.4384135!4d36.9855863';

const latitude = -0.438511;
const longitude = 36.985718;

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: latitude,
        longitude: longitude,
        zoom: 8
      },
      markerHover: false
    }
  }

  toggleMarkerHover(markerHover) {
    this.setState({
      markerHover
    });
  }

  render() {
    return (
    <ReactMapGL
      mapboxApiAccessToken={TOKEN}
      reuseMap
      className="cyec-map"
      width="100%"
      height="100%"
      {...this.state.viewport}
      onViewportChange={(viewport) => {
        const {latitude, longitude, zoom} = viewport;
        let newViewport = {
          latitude,
          longitude,
          zoom
        };
        this.setState({
          viewport: newViewport
        })

      }}
    >
      <Marker latitude={latitude} longitude={longitude} offsetLeft={this.state.markerHover ? -97 : -37} offsetTop={-20} title="Get Directions">
        <div className="cyec-marker" 
          onMouseEnter={() => this.toggleMarkerHover(true)} 
          onMouseLeave={() => this.toggleMarkerHover(false)}
          style={this.state.markerHover ? {marginLeft: 100, paddingLeft: 2, paddingRight: 2} : {marginLeft: 40}}
        >
        {this.state.markerHover ? <a href={mapsURL} target="_blank" rel="noopener noreferrer" className="direction-link">Get Directions</a> : "CYEC"}
        </div> 
        <CityPin />
      </Marker>
      <GeolocateControl 
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
          style={{position: 'absolute', right: 0, top: 0}}
        />
      <div style={{position: 'absolute', right: 0, top: 30}}>
        <NavigationControl />
      </div>
    </ReactMapGL>
    );
  }
}