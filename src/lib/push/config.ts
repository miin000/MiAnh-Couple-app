export function decodeVapidPublicKey(key: string) {
  const padding = "=".repeat((4 - key.length % 4) % 4);
  const bytes = Uint8Array.from(
    atob((key + padding).replace(/-/g, "+").replace(/_/g, "/")),
    (character) => character.charCodeAt(0),
  );
  if (bytes.length !== 65 || bytes[0] !== 4) {
    throw new Error("Khóa public VAPID không hợp lệ. Hãy kiểm tra lại cấu hình trên máy chủ.");
  }
  return bytes;
}

export async function getVapidPublicKey() {
  const response = await fetch("/api/push/config", { cache: "no-store" });
  if (!response.ok) throw new Error("Không tải được cấu hình thông báo từ máy chủ.");
  const result: unknown = await response.json();
  if (typeof result !== "object" || result === null || !("publicKey" in result)) return null;
  const key = result.publicKey;
  if (typeof key !== "string" || !key || key === "your-vapid-public-key") return null;
  decodeVapidPublicKey(key);
  return key;
}
