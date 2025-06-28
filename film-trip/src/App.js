import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";



function App() {
  const [locations, setLocations] = useState([]);
  useEffect(() => {
      fetch('http://localhost:8080/moviedata')
      .then(res => res.json())
      .then(data => {console.log(data); setLocations(data)})
      .catch(err => console.log(err))
  }, [])
  return (
    <div className="App">
      {locations.map((location, index) => {
        return (
          <p>Latitude: {location.lat}   Longitude: {location.lon}</p>
        )
      })}
      <SimpleMap info={locations}></SimpleMap>
    </div>
  );
}

function SimpleMap ({info}) {
  const mapRef = useRef(null);
  const latitude = 51.505;
  const longitude = -0.09;

  return ( 
    // Make sure you set the height and width of the map container otherwise the map won't show
      <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{height: "100vh", width: "100vw"}}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {info && info.map((location, index) => (
          location?.lat != null && location?.lon != null && (
            <Marker key={index} position={[location.lat, location.lon]}>
              <Popup>
                {location.movieName} <br></br> {location.locationString}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
  );
}

export default App;
