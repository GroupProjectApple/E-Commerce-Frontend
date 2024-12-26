import React, { useState, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { Bvalue } from "./SignIn";

// Fix Leaflet marker icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Map = () => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const{Uid}=useContext(Bvalue);
  // Handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);

        // Send coordinates to the backend
       const addlocation=()=>{ axios
          .put("https://e-commerce-website-tioj.onrender.com/api/update", { 
            collectionName:"users",
            searchFields: { _id: Uid },
            updatedValues:{$set:{location:{lat, lng }}
        }})
          .then((response) => console.log("Location saved:", response.data))
          .catch((error) => console.error("Error saving location:", error));}
        if(Uid){
            addlocation();
        }
      },
    });
    return null;
  };

  return (
    <MapContainer center={[23.685, 90.356]} zoom={6} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <MapClickHandler />
      {markerPosition && (
        <Marker position={markerPosition}>
          <Popup>
            Latitude: {markerPosition[0]}, Longitude: {markerPosition[1]}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
