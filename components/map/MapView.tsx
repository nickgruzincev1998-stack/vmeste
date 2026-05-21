"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { MOCK_ACTIVITIES } from "@/types";

// Фикс иконок Leaflet в Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Координаты для моковых событий (Москва)
const coords: Record<string, [number, number]> = {
  "1": [55.751, 37.628],
  "2": [55.763, 37.589],
  "3": [55.748, 37.542],
  "4": [55.794, 37.678],
  "5": [55.731, 37.601],
  "6": [55.788, 37.745],
};

export default function MapView() {
  return (
    <MapContainer
      center={[55.751, 37.618]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      className="rounded-3xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {MOCK_ACTIVITIES.map((activity) => {
        const pos = coords[activity.id];
        if (!pos) return null;
        return (
          <Marker key={activity.id} position={pos} icon={icon}>
            <Popup>
              <div className="p-1">
                <div className="font-bold text-sm mb-1">
                  {activity.category.icon} {activity.title}
                </div>
                <div className="text-xs text-gray-600 mb-2">{activity.placeName}</div>
                <Link
                  href={`/activities/${activity.id}`}
                  className="text-xs bg-green-800 text-white px-3 py-1 rounded-full"
                >
                  Подробнее
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}