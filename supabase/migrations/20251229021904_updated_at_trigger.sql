set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_checked_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if new.checked = true and (old.checked is distinct from true) then
    new.checked_at = now();
  elsif new.checked = false then
    new.checked_at = null;
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE TRIGGER trg_executions_checked_at BEFORE UPDATE OF checked ON public.executions FOR EACH ROW EXECUTE FUNCTION public.set_checked_at();

CREATE TRIGGER trg_executions_updated_at BEFORE UPDATE ON public.executions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


