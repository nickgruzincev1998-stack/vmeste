import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

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

export interface YandexMapHandle {
  searchAddress: (address: string) => Promise<{ lat: number; lng: number } | null>;
  setCenter: (lat: number, lng: number, zoom?: number) => void;
}

declare global {
  interface Window { ymaps: any; ymapsReady?: boolean; }
}

const YandexMap = forwardRef<YandexMapHandle, Props>(({ activities = [], onMapReady }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useImperativeHandle(ref, () => ({
   async searchAddress(address: string) {
  try {
    const key = process.env.NEXT_PUBLIC_YANDEX_GEOCODER_KEY;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${key}&geocode=${encodeURIComponent(address)}&format=json&results=1`;
    const res = await fetch(url);
    const data = await res.json();
    const members = data?.response?.GeoObjectCollection?.featureMember;
    if (!members || members.length === 0) return null;
    const pos = members[0].GeoObject.Point.pos as string;
    const [lng, lat] = pos.split(" ").map(Number);
    return { lat, lng };
  } catch (e) {
    console.error("geocode error:", e);
    return null;
  }
},
    setCenter(lat: number, lng: number, zoom = 13) {
      mapInstance.current?.setCenter([lat, lng], zoom, { duration: 500 });
    },
  }));

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

        activities.forEach((a) => {
          const placemark = new window.ymaps.Placemark(
            [a.lat, a.lng],
            {
              balloonContent: `
                <div style="padding:8px;min-width:180px;">
                  <div style="font-weight:bold;margin-bottom:4px;">${a.icon} ${a.title}</div>
                  <a href="/activities/${a.id}" style="color:#2d5a3d;font-size:13px;">Подробнее →</a>
                </div>
              `,
              hintContent: a.title,
            },
            { preset: "islands#greenDotIconWithCaption", iconCaption: a.title.slice(0, 20) }
          );
          mapInstance.current.geoObjects.add(placemark);
        });

        onMapReady?.();
        // Геокодер готов после инициализации карты
        window.ymapsReady = true;
      });
    }

    if (window.ymaps) { initMap(); return; }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&load=package.full`;
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

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
});

YandexMap.displayName = "YandexMap";
export default YandexMap;