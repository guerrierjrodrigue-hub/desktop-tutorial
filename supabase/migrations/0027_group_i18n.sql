-- T2 — Community groups: French translations + a description. Additive only.
alter table groups add column if not exists name_fr text;
alter table groups add column if not exists description text not null default '';
alter table groups add column if not exists description_fr text not null default '';
