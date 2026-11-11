
import { useState, useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";

import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "leaflet/dist/leaflet.css";
import "./App.css";

// Icon Leaflet
const gpsIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Posisi awal peta
const defaultPosition = [-7.3657, 108.53397];

// Mengambil satu posisi GPS
function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          long: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  });
}

// Mengatur posisi tengah peta
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(
        [position.lat, position.long],
        17
      );
    }
  }, [position, map]);

  return null;
}

function App() {
  const [gpsData, setGpsData] = useState([]);
  const [collecting, setCollecting] = useState(false);
  const [status, setStatus] = useState("Ready");

  // Mengambil 10 koordinat
  const startGPS = async () => {

    if (!navigator.geolocation) {
      setStatus("Browser tidak mendukung GPS");
      return;
    }

    setGpsData([]);
    setCollecting(true);
    setStatus("Mengambil koordinat...");

    try {
      for (let i = 0; i < 10; i++) {

        const position = await getPosition();

        setGpsData((previous) => [
          ...previous,
          position
        ]);

        setStatus(`GPS ${i + 1} / 10 berhasil`);

        // Jeda 1 detik antar pengambilan
        if (i < 9) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      }

      setStatus("10 koordinat berhasil dikumpulkan");

    } catch (error) {

      setStatus(
        "GPS Error: " + error.message
      );

    } finally {
      setCollecting(false);
    }
  };

  // Hapus seluruh data
  const clearGPS = () => {
    setGpsData([]);
    setStatus("Data dihapus");
  };

  const lastPosition =
    gpsData.length > 0
      ? gpsData[gpsData.length - 1]
      : null;

  const route = gpsData.map((item) => [
    item.lat,
    item.long
  ]);

  return (
    <div className="app">

      <header>
        <h1>GPS TRACKER</h1>
        <p>Vite + React + Leaflet</p>
      </header>

      <div className="controls">

        <button
          onClick={startGPS}
          disabled={collecting}
        >
          {collecting ? "MENGAMBIL GPS..." : "MULAI GPS"}
        </button>

        <button
          className="clear"
          onClick={clearGPS}
          disabled={collecting || gpsData.length === 0}
        >
          CLEAR
        </button>

      </div>

      <div className="status">
        {status}
      </div>

      <div className="counter">
        GPS DATA: {gpsData.length} / 10
      </div>

      <div className="map-container">

        <MapContainer
          center={defaultPosition}
          zoom={15}
          scrollWheelZoom={true}
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater position={lastPosition} />

          {gpsData.map((item, index) => (

            <Marker
              key={index}
              position={[item.lat, item.long]}
              icon={gpsIcon}
            >
              <Popup>
                <b>GPS {index + 1}</b>
                <br />
                Latitude: {item.lat}
                <br />
                Longitude: {item.long}
                <br />
                Accuracy: {item.accuracy.toFixed(1)} m
              </Popup>
            </Marker>

          ))}

          {gpsData.length > 1 && (
            <Polyline
              positions={route}
              color="blue"
              weight={4}
            />
          )}

        </MapContainer>

      </div>

      <h3>COORDINATE HISTORY</h3>

      <div className="gps-list">

        {gpsData.map((item, index) => (

          <div className="gps-item" key={index}>

            <b>GPS {index + 1}</b>

            <span>
              LAT: {item.lat.toFixed(7)}
            </span>

            <span>
              LONG: {item.long.toFixed(7)}
            </span>

            <span>
              ACC: {item.accuracy.toFixed(1)} m
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

export default App;
