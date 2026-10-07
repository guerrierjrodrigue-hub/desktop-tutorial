-- 0014: French translations for the badge and challenge catalogs.
--
-- Additive only. Catalog content (names/descriptions) was English-only, so a
-- French visitor saw English achievement and challenge copy. Add nullable
-- *_fr columns; a NULL means "fall back to the English column", so this is
-- safe for user-created challenges that have no translation.

alter table badges
  add column if not exists name_fr text,
  add column if not exists description_fr text;

alter table challenges
  add column if not exists title_fr text,
  add column if not exists description_fr text;

-- Badge catalog (keyed by stable slug).
update badges set name_fr = 'Premiers pas',        description_fr = 'A terminé son premier entraînement' where slug = 'first-steps';
update badges set name_fr = 'Discipline de fer',    description_fr = '50 entraînements enregistrés'        where slug = 'iron-discipline';
update badges set name_fr = 'Âme de marathonien',   description_fr = 'Série de 100 jours'                   where slug = 'marathon-soul';
update badges set name_fr = 'Pilier de prière',     description_fr = '100 prières enregistrées'             where slug = 'prayer-pillar';
update badges set name_fr = 'Feu de sept jours',    description_fr = 'Série de 7 jours'                     where slug = 'seven-day-fire';
update badges set name_fr = 'Guerrier de la Parole', description_fr = 'A lu les Écritures 30 jours'         where slug = 'word-warrior';

-- Seeded challenges (keyed by English title). User-created challenges keep
-- NULL translations and fall back to their original text.
update challenges
  set title_fr = '40 jours de discipline',
      description_fr = 'Fais un entraînement et une méditation chaque jour pendant 40 jours.'
  where title = '40 Days of Discipline';

update challenges
  set title_fr = 'Le fer aiguise le fer',
      description_fr = 'Toi et 3 amis : 12 entraînements en 2 semaines.'
  where title = 'Iron Sharpens Iron';

update challenges
  set title_fr = 'Église contre Église : 30 entraînements ce mois-ci',
      description_fr = 'Ton église contre les autres — enregistre 30 entraînements en 30 jours. Mesuré à partir de ton journal d''entraînement réel.'
  where title = 'Church vs. Church: 30 workouts this month';

update challenges
  set title_fr = 'Défi du repos du sabbat',
      description_fr = 'Protège une journée complète de repos chaque semaine pendant un mois.'
  where title = 'Sabbath Rest Challenge';
