import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix icon in Vite (Leaflet sometimes has no icon)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationSelect?: (
    lat: number,
    lng: number,
    address?: string,
    adminRegion?: string
  ) => void;
}

// Component to handle map clicks and update marker position
function LocationMarker({
  initialPosition,
  onLocationSelect,
}: {
  initialPosition?: [number, number] | null;
  onLocationSelect?: (
    lat: number,
    lng: number,
    address?: string,
    adminRegion?: string
  ) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  );

  // Update marker when external coordinates change
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useMapEvents({
    click: async e => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Reverse geocoding with Nominatim
      try {
        const response = await fetch(
          `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1`
        );
        const data = await response.json();

        const feature = data?.features?.[0];
        const props = feature?.properties ?? {};

        const adminRegion =
          props.state || props.city || props.county || props.district || "";

        const displayName = [
          props.name,
          props.street,
          props.city,
          props.state,
          props.country,
        ]
          .filter(Boolean)
          .join(", ");

        onLocationSelect?.(
          lat,
          lng,
          displayName || undefined,
          adminRegion || undefined
        );
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        onLocationSelect?.(lat, lng);
      }
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}: LocationPickerProps) {
  // Default center: Brasília, Brazil
  const center: [number, number] =
    latitude && longitude ? [latitude, longitude] : [-15.7801, -47.9292];

  const initialPosition: [number, number] | null =
    latitude && longitude ? [latitude, longitude] : null;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={latitude && longitude ? 13 : 4}
        style={{ height: "100%", width: "100%" }}
        key={`${latitude}-${longitude}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker
          initialPosition={initialPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
    </div>
  );
}
