"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Фикс иконок Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Activity {
  id: string;
  title: string;
  lat: number;
  lng: number;
  icon: string;
}

interface Props {
  activities?: Activity[];
  onMapReady?: () => void;
}

export interface MapHandle {
  searchAddress: (address: string) => Promise<{ lat: number; lng: number } | null>;
  setCenter: (lat: number, lng: number, zoom?: number) => void;
}

const Map = forwardRef<MapHandle, Props>(({ activities = [], onMapReady }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useImperativeHandle(ref, () => ({
    async searchAddress(address: string) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          { headers: { "Accept-Language": "ru" } }
        );
        const data = await res.json();
        if (!data || data.length === 0) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      } catch {
        return null;
      }
    },
    setCenter(lat: number, lng: number, zoom = 13) {
      mapInstance.current?.setView([lat, lng], zoom);
    },
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [55.751, 37.618],
      zoom: 11,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance.current);

    activities.forEach((a) => {
      const marker = L.marker([a.lat, a.lng]);
      marker.bindPopup(`
        <div style="padding:4px;min-width:160px;">
          <div style="font-weight:bold;margin-bottom:4px;">${a.icon} ${a.title}</div>
          <a href="/activities/${a.id}" style="color:#2d5a3d;font-size:13px;">Подробнее →</a>
        </div>
      `);
      marker.addTo(mapInstance.current!);
    });

    onMapReady?.();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
});

Map.displayName = "Map";
export default Map;