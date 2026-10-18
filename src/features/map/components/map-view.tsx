"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Navigation, RefreshCw } from "lucide-react";

const MapCanvas = dynamic(() => import("./map-canvas").then((module) => module.MapCanvas), { ssr: false, loading: () => <div className="h-[440px] animate-pulse rounded-3xl bg-[#E8EEE8]" /> });

interface LocationRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  lat: number;
  lng: number;
  accuracy_m: number | null;
  updated_at: string;
  seconds_since_update: number;
}

interface MapViewProps { coupleId: string; ownName: string; ownAvatarUrl?: string | null; }

function distanceKm(a: LocationRow | null, b: { lat: number; lng: number } | null) {
  if (!a || !b) return null;
  const radians = (value: number) => value * Math.PI / 180;
  const x = radians(b.lng - a.lng) * Math.cos(radians((a.lat + b.lat) / 2));
  const y = radians(b.lat - a.lat);
  return Math.round(Math.sqrt(x * x + y * y) * 6371 * 10) / 10;
}

function relativeTime(seconds: number) {
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  return `${Math.floor(seconds / 3600)} giờ trước`;
}

export function MapView({ coupleId, ownName, ownAvatarUrl }: MapViewProps) {
  const supabase = useMemo(() => createClient(), []);
  const [partner, setPartner] = useState<LocationRow | null>(null);
  const [own, setOwn] = useState<{ lat: number; lng: number; accuracy_m: number | null } | null>(null);
  const [ownUpdatedAt, setOwnUpdatedAt] = useState<string | null>(null);
  const [sharingUntil, setSharingUntil] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [clock, setClock] = useState(0);
  const lastSent = useRef<{ lat: number; lng: number; at: number } | null>(null);
  const watchId = useRef<number | null>(null);

  const locateOwn = useCallback(() => {
    if (!navigator.geolocation) {
      setMessage("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOwn({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy_m: position.coords.accuracy,
        });
        setOwnUpdatedAt(new Date().toISOString());
      },
      (error) => setMessage(error.code === error.PERMISSION_DENIED
        ? "Bạn chưa cấp quyền vị trí. Hãy cho phép trong cài đặt trình duyệt để xem mình trên bản đồ."
        : "Không lấy được vị trí. Hãy thử lại khi GPS ổn định hơn."),
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 15000 }
    );
  }, []);

  const loadLocations = useCallback(async () => {
    const [{ data: status }, { data: partnerRow, error }] = await Promise.all([
      supabase.rpc("get_my_sharing_status"),
      supabase.rpc("get_partner_location"),
    ]);
    const currentStatus = status?.[0] as { is_sharing?: boolean } | undefined;
    setSharingUntil(currentStatus?.is_sharing ? "permanent" : null);
    if (error) setMessage("Không thể tải vị trí người ấy. Bạn hãy thử lại.");
    else setPartner((partnerRow?.[0] as LocationRow | undefined) || null);
  }, [supabase]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadLocations(), 0);
    const interval = window.setInterval(() => void loadLocations(), 30000);
    const channel = supabase.channel(`location-${coupleId}`).on("postgres_changes", { event: "*", schema: "public", table: "location_shares", filter: `couple_id=eq.${coupleId}` }, () => void loadLocations()).subscribe();
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [coupleId, loadLocations, supabase]);

  useEffect(() => {
    const interval = window.setInterval(() => setClock((value) => value + 1), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const sendPosition = useCallback((position: GeolocationPosition) => {
    const next = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy_m: position.coords.accuracy };
    const previous = lastSent.current;
    const moved = previous ? Math.hypot((next.lat - previous.lat) * 111000, (next.lng - previous.lng) * 111000) : Infinity;
    if (!previous || moved > 30 || Date.now() - previous.at > 60000) {
      lastSent.current = { lat: next.lat, lng: next.lng, at: Date.now() };
      setOwn(next);
      setOwnUpdatedAt(new Date().toISOString());
      void supabase.rpc("update_my_location", { p_lat: next.lat, p_lng: next.lng, p_accuracy: next.accuracy_m }).then(({ error }) => {
        if (error) setMessage("Không thể cập nhật vị trí. Bạn hãy kiểm tra kết nối.");
      });
    } else {
      setOwn(next);
      setOwnUpdatedAt(new Date().toISOString());
    }
  }, [supabase]);

  useEffect(() => {
    if (!sharingUntil) {
      if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current);
      watchId.current = null;
      return;
    }
    if (!navigator.geolocation) {
      window.setTimeout(() => setMessage("Trình duyệt không hỗ trợ định vị."), 0);
      return;
    }
    const startWatch = () => {
      watchId.current = navigator.geolocation.watchPosition(sendPosition, (error) => {
        setMessage(error.code === error.PERMISSION_DENIED ? "Bạn đã từ chối quyền định vị. Hãy bật lại quyền trong cài đặt trình duyệt." : "Không lấy được vị trí. Hãy thử lại khi GPS ổn định hơn.");
      }, { enableHighAccuracy: false, maximumAge: 15000, timeout: 15000 });
    };
    startWatch();
    const onVisible = () => {
      if (document.visibilityState === "visible") navigator.geolocation.getCurrentPosition(sendPosition, () => undefined, { enableHighAccuracy: false, maximumAge: 15000 });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [sendPosition, sharingUntil]);

  const secondsOld = partner ? partner.seconds_since_update + clock * 30 : 0;
  const distance = distanceKm(partner, own);
  const ownPoint = own ? { ...own, label: ownName, avatarUrl: ownAvatarUrl } : null;
  const partnerPoint = partner ? { lat: partner.lat, lng: partner.lng, accuracy_m: partner.accuracy_m, label: partner.display_name, avatarUrl: partner.avatar_url } : null;

  return (
    <div className="space-y-3">
      {message && <div className="rounded-2xl border border-[#F6D0D6] bg-white px-4 py-3 text-xs font-semibold text-[#6840B8]">{message}</div>}
      <MapCanvas own={ownPoint} partner={partnerPoint} />
      {!own && <Button variant="outline" className="w-full" onClick={locateOwn}><MapPin className="mr-2 h-4 w-4" />Hiện vị trí của tôi</Button>}
      {own && <Card className="p-3 text-xs text-[#786D73]"><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#2B8BE6]" />Vị trí của bạn cập nhật lần cuối: <strong className="text-[#201A1D]">{ownUpdatedAt ? new Date(ownUpdatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}</strong></Card>}
      {!partner && <Card className="p-4 text-center text-xs font-semibold text-[#786D73]">Người ấy chưa chia sẻ vị trí.</Card>}
      {partner && <Card className={`p-4 ${secondsOld > 600 ? "opacity-60" : ""}`}><div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-full bg-[#E7E2FA] text-center text-lg font-bold leading-10 text-[#6E56B8]">{partner.avatar_url ? <img src={partner.avatar_url} alt="" className="h-full w-full object-cover" /> : partner.display_name[0]}</div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{partner.display_name}</p><p className="text-[11px] text-[#786D73]" title={partner.updated_at}>Cập nhật lần cuối: {relativeTime(secondsOld)}{secondsOld > 600 ? " · Vị trí có thể đã cũ" : ""}</p></div><span className="h-2.5 w-2.5 rounded-full bg-[#2BA889]" /></div><div className="mt-3 grid grid-cols-2 border-t border-[#F0E5E0] pt-3 text-[11px] text-[#786D73]"><span><MapPin className="mr-1 inline h-3.5 w-3.5 text-[#7C4DFF]" />±{Math.round(partner.accuracy_m || 0)} m</span><span><Navigation className="mr-1 inline h-3.5 w-3.5 text-[#1B9B68]" />{distance === null ? "—" : distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance} km`}</span></div><a className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-[#2BA89A] text-sm font-bold text-white" href={`https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`} target="_blank" rel="noreferrer"><Navigation className="mr-2 h-4 w-4" />Chỉ đường</a></Card>}
      <Button variant="outline" className="w-full" onClick={() => void loadLocations()}><RefreshCw className="mr-2 h-4 w-4" />Cập nhật vị trí</Button>
    </div>
  );
}
