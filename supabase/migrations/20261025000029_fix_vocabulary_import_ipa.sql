-- Preserve IPA values when vocabulary is imported through the admin batch flow.
create or replace function public.commit_vocabulary_import(p_batch_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare
  r record;
  v_count integer := 0;
  v_key text;
  v_id uuid;
  v_error integer := 0;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  perform 1 from public.vocab_import_batches
    where id = p_batch_id and created_by = auth.uid() and status in ('staging', 'validated') for update;
  if not found then raise exception 'INVALID_BATCH'; end if;

  for r in select * from public.vocab_import_rows where batch_id = p_batch_id order by row_number loop
    if nullif(btrim(r.payload->>'word'), '') is null
       or public.normalize_entry_type(r.payload->>'entry_type') is null
       or public.normalize_pos(r.payload->>'part_of_speech') is null
    then
      v_error := v_error + 1;
      update public.vocab_import_rows set error_message = 'Thiếu word, entry_type hoặc part_of_speech' where id = r.id;
    end if;
  end loop;
  if v_error > 0 then
    update public.vocab_import_batches set status = 'failed', error_count = v_error where id = p_batch_id;
    raise exception 'IMPORT_VALIDATION_FAILED';
  end if;

  for r in select * from public.vocab_import_rows where batch_id = p_batch_id order by row_number loop
    v_key := lower(regexp_replace(btrim(r.payload->>'word'), '\s+', ' ', 'g')) || ':' || public.normalize_entry_type(r.payload->>'entry_type');
    v_id := null;
    if nullif(btrim(r.payload->>'external_key'), '') is not null then
      select id into v_id from public.vocabulary_words where external_key = btrim(r.payload->>'external_key') for update;
    end if;
    if v_id is null then
      select id into v_id from public.vocabulary_words where natural_key = v_key for update;
    end if;
    if v_id is null then
      insert into public.vocabulary_words(external_key, word, entry_type, tags, note, ipa, part_of_speech, meaning_vi, example_en, example_vi, topic, level, is_active)
      values (nullif(btrim(r.payload->>'external_key'), ''), btrim(r.payload->>'word'),
        public.normalize_entry_type(r.payload->>'entry_type'), coalesce(array(select jsonb_array_elements_text(r.payload->'tags')), '{}'),
        r.payload->>'note', nullif(btrim(r.payload->>'ipa'), ''), public.normalize_pos(r.payload->>'part_of_speech'), btrim(r.payload->>'meaning_vi'),
        r.payload->>'example_en', r.payload->>'example_vi', coalesce(nullif(r.payload->>'topic', ''), 'general'),
        public.normalize_level(r.payload->>'level'), coalesce((r.payload->>'is_active')::boolean, true)) returning id into v_id;
    else
      update public.vocabulary_words set word = btrim(r.payload->>'word'), entry_type = public.normalize_entry_type(r.payload->>'entry_type'),
        tags = coalesce(array(select jsonb_array_elements_text(r.payload->'tags')), '{}'), note = r.payload->>'note',
        ipa = nullif(btrim(r.payload->>'ipa'), ''), part_of_speech = public.normalize_pos(r.payload->>'part_of_speech'), meaning_vi = btrim(r.payload->>'meaning_vi'),
        example_en = r.payload->>'example_en', example_vi = r.payload->>'example_vi',
        topic = coalesce(nullif(r.payload->>'topic', ''), 'general'), level = public.normalize_level(r.payload->>'level'),
        is_active = coalesce((r.payload->>'is_active')::boolean, true) where id = v_id;
    end if;
    if jsonb_typeof(r.payload->'collocations') = 'array' then
      insert into public.vocabulary_collocations(word_id, phrase, position)
      select v_id, btrim(value), row_number() over ()::smallint
      from jsonb_array_elements_text(r.payload->'collocations')
      where char_length(btrim(value)) between 1 and 120
      on conflict (word_id, phrase) do nothing;
    end if;
    v_count := v_count + 1;
  end loop;
  update public.vocab_import_batches set status = 'committed', committed_at = now() where id = p_batch_id;
  return v_count;
end;
$$;
