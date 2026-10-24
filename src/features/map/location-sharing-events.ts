export const LOCATION_SHARING_CHANGED_EVENT = "mianh:location-sharing-changed";
export const LOCATION_UPDATED_EVENT = "mianh:location-updated";

export interface LocationUpdatedEventDetail {
  lat: number;
  lng: number;
  accuracy_m: number | null;
  updated_at: string;
}

export function notifyLocationSharingChanged() {
  window.dispatchEvent(new Event(LOCATION_SHARING_CHANGED_EVENT));
}
