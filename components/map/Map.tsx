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
  getSuggestions: (query: string) => Promise<{ name: string; lat: number; lng: number }[]>;
  setCenter: (lat: number, lng: number, zoom?: number) => void;
  setSearchMarker: (lat: number, lng: number) => void;
  setRadiusCircle: (lat: number, lng: number, radiusKm: number) => void;
  removeRadiusCircle: () => void;
}

const Map = forwardRef<MapHandle, Props>(({ activities = [], onMapReady }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maptilersdk.Map | null>(null);
  const searchMarker = useRef<maptilersdk.Marker | null>(null);
  const radiusCircle = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    async getSuggestions(query: string) {
      try {
        const result = await maptilersdk.geocoding.forward(query, {
          language: maptilersdk.Language.RUSSIAN,
          limit: 5,
        });
        return result.features.map((f: any) => ({
          name: f.place_name_ru || f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        }));
      } catch {
        return [];
      }
    },

    async searchAddress(address: string) {
      try {
        const result = await maptilersdk.geocoding.forward(address, {
          language: maptilersdk.Language.RUSSIAN,
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

    setSearchMarker(lat: number, lng: number) {
      if (searchMarker.current) searchMarker.current.remove();
      if (!mapInstance.current) return;
      searchMarker.current = new maptilersdk.Marker({ color: "#e74c3c" })
        .setLngLat([lng, lat])
        .addTo(mapInstance.current);
    },

    setRadiusCircle(lat: number, lng: number, radiusKm: number) {
      if (!mapInstance.current) return;

      const sourceId = "radius-circle";
      const layerId = "radius-layer";
      const borderLayerId = layerId + "-border";

      if (mapInstance.current.getLayer(borderLayerId)) mapInstance.current.removeLayer(borderLayerId);
      if (mapInstance.current.getLayer(layerId)) mapInstance.current.removeLayer(layerId);
      if (mapInstance.current.getSource(sourceId)) mapInstance.current.removeSource(sourceId);

      const points = 64;
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i * 360) / points;
        const rad = (angle * Math.PI) / 180;
        const dlat = (radiusKm / 111) * Math.cos(rad);
        const dlng = (radiusKm / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(rad);
        coords.push([lng + dlng, lat + dlat]);
      }
      coords.push(coords[0]);

      mapInstance.current.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [coords] },
          properties: {},
        },
      });

      mapInstance.current.addLayer({
        id: layerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#2d5a3d",
          "fill-opacity": 0.15,
        },
      });

      mapInstance.current.addLayer({
        id: borderLayerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#2d5a3d",
          "line-width": 2,
          "line-opacity": 0.6,
        },
      });

      radiusCircle.current = { sourceId, layerId, borderLayerId };
    },

    removeRadiusCircle() {
      if (!mapInstance.current || !radiusCircle.current) return;
      const { sourceId, layerId, borderLayerId } = radiusCircle.current;
      if (mapInstance.current.getLayer(borderLayerId)) mapInstance.current.removeLayer(borderLayerId);
      if (mapInstance.current.getLayer(layerId)) mapInstance.current.removeLayer(layerId);
      if (mapInstance.current.getSource(sourceId)) mapInstance.current.removeSource(sourceId);
      radiusCircle.current = null;
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