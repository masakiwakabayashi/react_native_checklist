
  create table "public"."executions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "item_id" uuid not null,
    "checked" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."items" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "template_id" uuid not null,
    "title" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );



  create table "public"."template_tags" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "template_id" uuid not null,
    "tag_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."templates" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


CREATE INDEX executions_checked_idx ON public.executions USING btree (checked);

CREATE INDEX executions_item_id_idx ON public.executions USING btree (item_id);

CREATE UNIQUE INDEX executions_pkey ON public.executions USING btree (id);

CREATE INDEX executions_user_id_idx ON public.executions USING btree (user_id);

CREATE UNIQUE INDEX executions_user_id_item_id_key ON public.executions USING btree (user_id, item_id);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id);

CREATE INDEX items_template_id_idx ON public.items USING btree (template_id);

CREATE INDEX items_user_id_idx ON public.items USING btree (user_id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE INDEX tags_user_id_idx ON public.tags USING btree (user_id);

CREATE UNIQUE INDEX tags_user_id_name_key ON public.tags USING btree (user_id, name);

CREATE UNIQUE INDEX template_tags_pkey ON public.template_tags USING btree (id);

CREATE INDEX template_tags_tag_id_idx ON public.template_tags USING btree (tag_id);

CREATE INDEX template_tags_template_id_idx ON public.template_tags USING btree (template_id);

CREATE UNIQUE INDEX template_tags_template_id_tag_id_key ON public.template_tags USING btree (template_id, tag_id);

CREATE INDEX template_tags_user_id_idx ON public.template_tags USING btree (user_id);

CREATE UNIQUE INDEX templates_pkey ON public.templates USING btree (id);

CREATE INDEX templates_user_id_idx ON public.templates USING btree (user_id);

alter table "public"."executions" add constraint "executions_pkey" PRIMARY KEY using index "executions_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."template_tags" add constraint "template_tags_pkey" PRIMARY KEY using index "template_tags_pkey";

alter table "public"."templates" add constraint "templates_pkey" PRIMARY KEY using index "templates_pkey";

alter table "public"."executions" add constraint "executions_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE not valid;

alter table "public"."executions" validate constraint "executions_item_id_fkey";

alter table "public"."executions" add constraint "executions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."executions" validate constraint "executions_user_id_fkey";

alter table "public"."executions" add constraint "executions_user_id_item_id_key" UNIQUE using index "executions_user_id_item_id_key";

alter table "public"."items" add constraint "items_template_id_fkey" FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "items_template_id_fkey";

alter table "public"."items" add constraint "items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "items_user_id_fkey";

alter table "public"."tags" add constraint "tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."tags" validate constraint "tags_user_id_fkey";

alter table "public"."tags" add constraint "tags_user_id_name_key" UNIQUE using index "tags_user_id_name_key";

alter table "public"."template_tags" add constraint "template_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."template_tags" validate constraint "template_tags_tag_id_fkey";

alter table "public"."template_tags" add constraint "template_tags_template_id_fkey" FOREIGN KEY (template_id) REFERENCES public.templates(id) ON DELETE CASCADE not valid;

alter table "public"."template_tags" validate constraint "template_tags_template_id_fkey";

alter table "public"."template_tags" add constraint "template_tags_template_id_tag_id_key" UNIQUE using index "template_tags_template_id_tag_id_key";

alter table "public"."template_tags" add constraint "template_tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."template_tags" validate constraint "template_tags_user_id_fkey";

alter table "public"."templates" add constraint "templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."templates" validate constraint "templates_user_id_fkey";

grant delete on table "public"."executions" to "anon";

grant insert on table "public"."executions" to "anon";

grant references on table "public"."executions" to "anon";

grant select on table "public"."executions" to "anon";

grant trigger on table "public"."executions" to "anon";

grant truncate on table "public"."executions" to "anon";

grant update on table "public"."executions" to "anon";

grant delete on table "public"."executions" to "authenticated";

grant insert on table "public"."executions" to "authenticated";

grant references on table "public"."executions" to "authenticated";

grant select on table "public"."executions" to "authenticated";

grant trigger on table "public"."executions" to "authenticated";

grant truncate on table "public"."executions" to "authenticated";

grant update on table "public"."executions" to "authenticated";

grant delete on table "public"."executions" to "postgres";

grant insert on table "public"."executions" to "postgres";

grant references on table "public"."executions" to "postgres";

grant select on table "public"."executions" to "postgres";

grant trigger on table "public"."executions" to "postgres";

grant truncate on table "public"."executions" to "postgres";

grant update on table "public"."executions" to "postgres";

grant delete on table "public"."executions" to "service_role";

grant insert on table "public"."executions" to "service_role";

grant references on table "public"."executions" to "service_role";

grant select on table "public"."executions" to "service_role";

grant trigger on table "public"."executions" to "service_role";

grant truncate on table "public"."executions" to "service_role";

grant update on table "public"."executions" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "postgres";

grant insert on table "public"."items" to "postgres";

grant references on table "public"."items" to "postgres";

grant select on table "public"."items" to "postgres";

grant trigger on table "public"."items" to "postgres";

grant truncate on table "public"."items" to "postgres";

grant update on table "public"."items" to "postgres";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "postgres";

grant insert on table "public"."tags" to "postgres";

grant references on table "public"."tags" to "postgres";

grant select on table "public"."tags" to "postgres";

grant trigger on table "public"."tags" to "postgres";

grant truncate on table "public"."tags" to "postgres";

grant update on table "public"."tags" to "postgres";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."template_tags" to "anon";

grant insert on table "public"."template_tags" to "anon";

grant references on table "public"."template_tags" to "anon";

grant select on table "public"."template_tags" to "anon";

grant trigger on table "public"."template_tags" to "anon";

grant truncate on table "public"."template_tags" to "anon";

grant update on table "public"."template_tags" to "anon";

grant delete on table "public"."template_tags" to "authenticated";

grant insert on table "public"."template_tags" to "authenticated";

grant references on table "public"."template_tags" to "authenticated";

grant select on table "public"."template_tags" to "authenticated";

grant trigger on table "public"."template_tags" to "authenticated";

grant truncate on table "public"."template_tags" to "authenticated";

grant update on table "public"."template_tags" to "authenticated";

grant delete on table "public"."template_tags" to "postgres";

grant insert on table "public"."template_tags" to "postgres";

grant references on table "public"."template_tags" to "postgres";

grant select on table "public"."template_tags" to "postgres";

grant trigger on table "public"."template_tags" to "postgres";

grant truncate on table "public"."template_tags" to "postgres";

grant update on table "public"."template_tags" to "postgres";

grant delete on table "public"."template_tags" to "service_role";

grant insert on table "public"."template_tags" to "service_role";

grant references on table "public"."template_tags" to "service_role";

grant select on table "public"."template_tags" to "service_role";

grant trigger on table "public"."template_tags" to "service_role";

grant truncate on table "public"."template_tags" to "service_role";

grant update on table "public"."template_tags" to "service_role";

grant delete on table "public"."templates" to "anon";

grant insert on table "public"."templates" to "anon";

grant references on table "public"."templates" to "anon";

grant select on table "public"."templates" to "anon";

grant trigger on table "public"."templates" to "anon";

grant truncate on table "public"."templates" to "anon";

grant update on table "public"."templates" to "anon";

grant delete on table "public"."templates" to "authenticated";

grant insert on table "public"."templates" to "authenticated";

grant references on table "public"."templates" to "authenticated";

grant select on table "public"."templates" to "authenticated";

grant trigger on table "public"."templates" to "authenticated";

grant truncate on table "public"."templates" to "authenticated";

grant update on table "public"."templates" to "authenticated";

grant delete on table "public"."templates" to "postgres";

grant insert on table "public"."templates" to "postgres";

grant references on table "public"."templates" to "postgres";

grant select on table "public"."templates" to "postgres";

grant trigger on table "public"."templates" to "postgres";

grant truncate on table "public"."templates" to "postgres";

grant update on table "public"."templates" to "postgres";

grant delete on table "public"."templates" to "service_role";

grant insert on table "public"."templates" to "service_role";

grant references on table "public"."templates" to "service_role";

grant select on table "public"."templates" to "service_role";

grant trigger on table "public"."templates" to "service_role";

grant truncate on table "public"."templates" to "service_role";

grant update on table "public"."templates" to "service_role";


