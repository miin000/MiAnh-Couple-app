export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;

  return Response.json(
    { publicKey },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
