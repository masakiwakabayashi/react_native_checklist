alter table "public"."executions" enable row level security;

alter table "public"."items" enable row level security;

alter table "public"."tags" enable row level security;

alter table "public"."template_tags" enable row level security;

alter table "public"."templates" enable row level security;


  create policy "executions_delete_own"
  on "public"."executions"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "executions_insert_own"
  on "public"."executions"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "executions_select_own"
  on "public"."executions"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "executions_update_own"
  on "public"."executions"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "items_delete_own"
  on "public"."items"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "items_insert_own"
  on "public"."items"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "items_select_own"
  on "public"."items"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "items_update_own"
  on "public"."items"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "tags_delete_own"
  on "public"."tags"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "tags_insert_own"
  on "public"."tags"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "tags_select_own"
  on "public"."tags"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "tags_update_own"
  on "public"."tags"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "template_tags_delete_own"
  on "public"."template_tags"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "template_tags_insert_own"
  on "public"."template_tags"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "template_tags_select_own"
  on "public"."template_tags"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "templates_delete_own"
  on "public"."templates"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "templates_insert_own"
  on "public"."templates"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "templates_select_own"
  on "public"."templates"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "templates_update_own"
  on "public"."templates"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



