"use client";

import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

export interface MapPoint {
  lat: number;
  lng: number;
  accuracy_m?: number | null;
  label?: string;
  avatarUrl?: string | null;
}

function Recenter({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15);
    if (points.length > 1) {
      map.fitBounds(points.map((point) => [point.lat, point.lng] as [number, number]), { padding: [40, 40] });
    }

  }, [map, points]);
  return null;
}

function MapActions({ own, partner }: { own: MapPoint | null; partner: MapPoint | null }) {
  const map = useMap();
  const focus = (point: MapPoint | null) => {
    if (point) map.setView([point.lat, point.lng], 16);
  };
  const fitAll = () => {
    const points = [own, partner].filter((point): point is MapPoint => Boolean(point));
    if (points.length > 1) map.fitBounds(points.map((point) => [point.lat, point.lng] as [number, number]), { padding: [40, 40] });
    else if (points[0]) focus(points[0]);
  };
  return (
    <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
      <button type="button" aria-label="Căn giữa vào người ấy" onClick={() => focus(partner)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[#7C4DFF] shadow-md disabled:opacity-40" disabled={!partner}>♥</button>
      <button type="button" aria-label="Căn giữa vào tôi" onClick={() => focus(own)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[#2B8BE6] shadow-md disabled:opacity-40" disabled={!own}>●</button>
      <button type="button" aria-label="Xem cả hai" onClick={fitAll} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[#786D73] shadow-md" disabled={!own && !partner}>↔</button>
    </div>
  );
}

function markerIcon(point: MapPoint, own: boolean) {
  const borderColor = own ? "#2B8BE6" : "#7C4DFF";
  const content = `<span style="display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#fff;border:3px solid ${borderColor};box-shadow:0 2px 10px #5678;color:#6E56B8;font:bold 18px system-ui;overflow:hidden">${point.avatarUrl ? `<img src="${point.avatarUrl}" alt="" style="width:100%;height:100%;object-fit:cover">` : (point.label?.[0] || "?")}</span>`;
  return L.divIcon({ html: content, className: "", iconSize: [42, 42], iconAnchor: [21, 21] });
}

export function MapCanvas({ own, partner }: { own: MapPoint | null; partner: MapPoint | null }) {
  const points = [own, partner].filter((point): point is MapPoint => Boolean(point));
  const center = points[0] ? [points[0].lat, points[0].lng] as [number, number] : [16.0471, 108.2068] as [number, number];
  return (
    <div className="relative h-[440px] overflow-hidden rounded-3xl border border-[#E5E0D8]">
      <MapContainer center={center} zoom={13} className="h-full w-full" zoomControl={false}>
        <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Recenter points={points} />
        <MapActions own={own} partner={partner} />
        {own && <><Marker position={[own.lat, own.lng]} icon={markerIcon(own, true)} /><Circle center={[own.lat, own.lng]} radius={own.accuracy_m || 15} pathOptions={{ color: "#2B8BE6", fillColor: "#2B8BE6", fillOpacity: 0.12, weight: 1 }} /></>}
        {partner && <><Marker position={[partner.lat, partner.lng]} icon={markerIcon(partner, false)} /><Circle center={[partner.lat, partner.lng]} radius={partner.accuracy_m || 15} pathOptions={{ color: "#7C4DFF", fillColor: "#7C4DFF", fillOpacity: 0.12, weight: 1 }} /></>}
      </MapContainer>
    </div>
  );
}
