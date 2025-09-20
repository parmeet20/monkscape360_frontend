"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet with Next.js
const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

type LeafletMapProps = {
    latitude: number;
    longitude: number;
    name: string;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ latitude, longitude, name }) => {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={customIcon}>
                <Popup>{name}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default LeafletMap;
