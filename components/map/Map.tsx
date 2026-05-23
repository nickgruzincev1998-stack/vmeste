"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

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
  const mapInstance = useRef<maptilersdk.Map | null>(null);

  useImperativeHandle(ref, () => ({
    async searchAddress(address: string) {
      try {
        const result = await maptilersdk.geocoding.forward(address, {
          language: maptilersdk.Language.RUSSIAN,
          country: "ru",
          limit: 1,
        });
        const feature = result.features[0];
        if (!feature) return null;
        const [lng, lat] = feature.center;
        return { lat, lng };
      } catch {
        return null;
      }
    },
    setCenter(lat: number, lng: number, zoom = 13) {
      mapInstance.current?.flyTo({ center: [lng, lat], zoom });
    },
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    maptilersdk.config.apiKey = "4gsAO4IEWVYOJzsCiMz0";

    mapInstance.current = new maptilersdk.Map({
      container: mapRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [37.618, 55.751],
      zoom: 11,
    });

    mapInstance.current.on("load", () => {
      activities.forEach((a) => {
        const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(`
          <div style="padding:4px;min-width:160px;">
            <div style="font-weight:bold;margin-bottom:4px;">${a.icon} ${a.title}</div>
            <a href="/activities/${a.id}" style="color:#2d5a3d;font-size:13px;">Подробнее →</a>
          </div>
        `);

        new maptilersdk.Marker({ color: "#2d5a3d" })
          .setLngLat([a.lng, a.lat])
          .setPopup(popup)
          .addTo(mapInstance.current!);
      });

      onMapReady?.();
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
});

Map.displayName = "Map";
export default Map;