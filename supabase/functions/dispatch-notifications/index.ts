import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

Deno.serve(async (request) => {
  const expected = Deno.env.get("DISPATCH_NOTIFICATIONS_SECRET");
  if (!expected || request.headers.get("x-dispatch-secret") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { data: rows, error } = await supabase
    .from("notifications")
    .select("id, recipient_id, kind, title, body, data")
    .is("push_sent_at", null)
    .limit(100);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  let sent = 0;
  for (const row of rows ?? []) {
    const { data: subscriptions } = await supabase
      .from("push_subscriptions").select("endpoint,p256dh,auth_key,auth")
      .eq("user_id", row.recipient_id);
    let delivered = 0;
    let failed = false;
    for (const subscription of subscriptions ?? []) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth_key || subscription.auth },
        }, JSON.stringify({ title: row.title, body: row.body, url: row.data?.url || "/home", tag: row.kind || row.id }));
        sent++;
        delivered++;
      } catch (sendError) {
        console.error("Push delivery failed", sendError);
        const statusCode = (sendError as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        } else {
          failed = true;
        }
      }
    }
    if (!failed && (delivered > 0 || !subscriptions?.length)) {
      await supabase.from("notifications").update({ push_sent_at: new Date().toISOString() }).eq("id", row.id);
    }
  }
  return Response.json({ sent });
});
