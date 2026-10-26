-- Deliver queued inbox notifications through the existing Supabase Edge Function.
-- Configure the two Vault secrets described in README before this job can send.
do $block$
begin
  if to_regnamespace('cron') is null
     or to_regnamespace('net') is null
     or to_regnamespace('vault') is null then
    raise notice 'Web Push dispatcher schedule skipped: enable pg_cron, pg_net, and Vault first.';
    return;
  end if;

  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'mianh-dispatch-web-push';

  perform cron.schedule(
    'mianh-dispatch-web-push',
    '* * * * *',
    $job$
      do $dispatch$
      declare
        v_url text;
        v_secret text;
      begin
        select decrypted_secret into v_url from vault.decrypted_secrets where name = 'supabase_url';
        select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'dispatch_notifications_secret';
        if nullif(v_url, '') is not null and nullif(v_secret, '') is not null then
          perform net.http_post(
            url := v_url,
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'x-dispatch-secret', v_secret
            ),
            body := '{}'::jsonb,
            timeout_milliseconds := 10000
          );
        end if;
      end;
      $dispatch$;
    $job$
  );
end;
$block$;
