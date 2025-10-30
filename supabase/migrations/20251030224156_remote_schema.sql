revoke delete on table "public"."ai_generation_logs" from "anon";

revoke insert on table "public"."ai_generation_logs" from "anon";

revoke references on table "public"."ai_generation_logs" from "anon";

revoke select on table "public"."ai_generation_logs" from "anon";

revoke trigger on table "public"."ai_generation_logs" from "anon";

revoke truncate on table "public"."ai_generation_logs" from "anon";

revoke update on table "public"."ai_generation_logs" from "anon";

revoke delete on table "public"."ai_generation_logs" from "authenticated";

revoke insert on table "public"."ai_generation_logs" from "authenticated";

revoke references on table "public"."ai_generation_logs" from "authenticated";

revoke select on table "public"."ai_generation_logs" from "authenticated";

revoke trigger on table "public"."ai_generation_logs" from "authenticated";

revoke truncate on table "public"."ai_generation_logs" from "authenticated";

revoke update on table "public"."ai_generation_logs" from "authenticated";

revoke delete on table "public"."ai_generation_logs" from "service_role";

revoke insert on table "public"."ai_generation_logs" from "service_role";

revoke references on table "public"."ai_generation_logs" from "service_role";

revoke select on table "public"."ai_generation_logs" from "service_role";

revoke trigger on table "public"."ai_generation_logs" from "service_role";

revoke truncate on table "public"."ai_generation_logs" from "service_role";

revoke update on table "public"."ai_generation_logs" from "service_role";

revoke delete on table "public"."questions" from "anon";

revoke insert on table "public"."questions" from "anon";

revoke references on table "public"."questions" from "anon";

revoke select on table "public"."questions" from "anon";

revoke trigger on table "public"."questions" from "anon";

revoke truncate on table "public"."questions" from "anon";

revoke update on table "public"."questions" from "anon";

revoke delete on table "public"."questions" from "authenticated";

revoke insert on table "public"."questions" from "authenticated";

revoke references on table "public"."questions" from "authenticated";

revoke select on table "public"."questions" from "authenticated";

revoke trigger on table "public"."questions" from "authenticated";

revoke truncate on table "public"."questions" from "authenticated";

revoke update on table "public"."questions" from "authenticated";

revoke delete on table "public"."questions" from "service_role";

revoke insert on table "public"."questions" from "service_role";

revoke references on table "public"."questions" from "service_role";

revoke select on table "public"."questions" from "service_role";

revoke trigger on table "public"."questions" from "service_role";

revoke truncate on table "public"."questions" from "service_role";

revoke update on table "public"."questions" from "service_role";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;



