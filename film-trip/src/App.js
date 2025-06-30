import logo from './logo.svg';
import './App.css';
import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";



function App() {
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState();
  useEffect(() => {
      fetch('http://localhost:8080/moviedata')
      .then(res => res.json())
      .then(data => {console.log(data); setLocations(data)})
      .catch(err => console.log(err))
  }, []);

  navigator.geolocation.getCurrentPosition(position => setUserLocation([position.coords.latitude, position.coords.longitude]));

  return (
    <div className="App">
      {userLocation && <SimpleMap info={locations} userLocation={userLocation}></SimpleMap>}
    </div>
  );
}

function SimpleMap ({info, userLocation}) {
  const mapRef = useRef(null);
  const latitude = 51.505;
  const longitude = -0.09;

  return ( 
      <MapContainer center={userLocation} zoom={13} ref={mapRef} style={{height: "100vh", width: "100vw"}}>
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
