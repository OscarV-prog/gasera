"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

// Icons configuration
const movingIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const parkedIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const offlineIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Vehicle {
  vehicleId: string;
  vehicleName: string;
  latitude: number;
  longitude: number;
  status: string;
  speed: string | number;
}

interface FleetMapProps {
  vehicles?: Vehicle[];
}

export default function FleetMap({ vehicles = [] }: FleetMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  const getIcon = (status: string) => {
    switch (status) {
      case "moving":
      case "in_progress":
        return movingIcon;
      case "offline":
        return offlineIcon;
      default:
        return parkedIcon;
    }
  };

  const MAZATLAN_COORDS: [number, number] = [23.2494, -106.4111];

  return (
    <MapContainer
      center={MAZATLAN_COORDS}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle) =>
        vehicle.latitude && vehicle.longitude ? (
          <Marker
            key={vehicle.vehicleId}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={getIcon(vehicle.status)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{vehicle.vehicleName}</p>
                <p>
                  Estado:{" "}
                  {vehicle.status === "moving"
                    ? "En Movimiento"
                    : "Estacionado"}
                </p>
                {vehicle.status === "moving" && (
                  <p>Velocidad: {vehicle.speed} km/h</p>
                )}
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  );
}
