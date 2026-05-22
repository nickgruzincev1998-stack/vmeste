"use client";

import { useEffect, useRef } from "react";

interface Props {
  activities?: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    icon: string;
  }[];
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function YandexMap({ activities = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;

    function initMap() {
      if (!mapRef.current || mapInstance.current) return;

      window.ymaps.ready(() => {
        mapInstance.current = new window.ymaps.Map(mapRef.current, {
          center: [55.751, 37.618],
          zoom: 11,
          controls: ["zoomControl", "geolocationControl"],
        });

        // Добавляем метки
        activities.forEach((a) => {
          const placemark = new window.ymaps.Placemark(
            [a.lat, a.lng],
            {
              balloonContent: `
                <div style="padding: 8px; min-width: 180px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${a.icon} ${a.title}</div>
                  <a href="/activities/${a.id}" style="color: #2d5a3d; font-size: 13px;">Подробнее →</a>
                </div>
              `,
              hintContent: a.title,
            },
            {
              preset: "islands#greenDotIconWithCaption",
              iconCaption: a.title.slice(0, 20),
            }
          );
          mapInstance.current.geoObjects.add(placemark);
        });
      });
    }

    // Загружаем скрипт Яндекс Карт
    if (window.ymaps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
  );
}