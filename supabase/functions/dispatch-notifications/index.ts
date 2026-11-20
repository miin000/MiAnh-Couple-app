import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const expected = Deno.env.get("DISPATCH_NOTIFICATIONS_SECRET");
  const missing = [
    ["SUPABASE_URL", supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey],
    ["VAPID_SUBJECT", vapidSubject],
    ["VAPID_PUBLIC_KEY", vapidPublicKey],
    ["VAPID_PRIVATE_KEY", vapidPrivateKey],
    ["DISPATCH_NOTIFICATIONS_SECRET", expected],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) {
    console.error("Push dispatcher is missing Edge Function secrets:", missing.join(", "));
    return Response.json({ error: "Push dispatcher secrets are not configured." }, { status: 500 });
  }
  if (!expected || request.headers.get("x-dispatch-secret") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  const supabase = createClient(supabaseUrl!, serviceRoleKey!);
  webpush.setVapidDetails(vapidSubject!, vapidPublicKey!, vapidPrivateKey!);
  const { data: rows, error } = await supabase
    .from("notifications")
    .select("id, recipient_id, kind, title, body, data")
    .is("push_sent_at", null)
    .limit(100);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  let sent = 0;
  for (const row of rows ?? []) {
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("push_subscriptions").select("endpoint,p256dh,auth_key,auth")
      .eq("user_id", row.recipient_id);
    if (subscriptionError) {
      console.error("Push subscription lookup failed:", subscriptionError.message);
      continue;
    }
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
