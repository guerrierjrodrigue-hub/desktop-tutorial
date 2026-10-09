-- 0021_local_recipes.sql
-- Add Caribbean/Haitian + Québécois fitness-friendly recipes (French name_fr +
-- tags). ADDITIVE ONLY: inserts rows, idempotent by name. No drops/updates.
--
-- NOTE: the nutrition numbers are ROUNDED ESTIMATES (per serving), not lab
-- values — every recipe carries an 'Estimated' tag surfaced in the UI.

insert into public.recipes
  (name, name_fr, calories, protein_g, carbs_g, fat_g, minutes, tags, category)
select v.name, v.name_fr, v.calories, v.protein_g, v.carbs_g, v.fat_g, v.minutes, v.tags, v.category
from (values
  ('Haitian Rice & Beans (Diri ak Pwa)', 'Riz et pois haïtiens', 520, 18, 85, 10, 45, array['Estimated','Caribbean','Plant-based'], 'muscle-gain'),
  ('Grilled Snapper with Pikliz', 'Vivaneau grillé et pikliz', 380, 42, 8, 18, 30, array['Estimated','Caribbean','High protein','Low carb'], 'weight-loss'),
  ('Haitian Legim with Lean Beef', 'Légume haïtien au bœuf maigre', 410, 35, 24, 18, 60, array['Estimated','Caribbean','Vegetables'], 'muscle-gain'),
  ('Poulet Créole with Brown Rice', 'Poulet créole et riz brun', 560, 45, 60, 14, 40, array['Estimated','Caribbean','High protein'], 'muscle-gain'),
  ('Pikliz (Spicy Slaw)', 'Pikliz (salade piquante)', 60, 2, 12, 1, 20, array['Estimated','Caribbean','Vegetables','Low cal'], 'weight-loss'),
  ('Haitian Pumpkin Soup (Soup Joumou)', 'Soupe joumou', 320, 20, 40, 8, 60, array['Estimated','Caribbean','Comfort'], 'quick-easy'),
  ('Black Bean & Plantain Power Bowl', 'Bol haricots noirs et banane plantain', 480, 20, 78, 10, 25, array['Estimated','Caribbean','Plant-based','High fiber'], 'muscle-gain'),
  ('Jerk Chicken & Mango Quinoa', 'Poulet jerk et quinoa à la mangue', 520, 44, 52, 14, 35, array['Estimated','Caribbean','High protein'], 'muscle-gain'),
  ('Coconut Fish Stew', 'Poisson en sauce coco', 400, 38, 14, 20, 35, array['Estimated','Caribbean','Omega-3','Low carb'], 'weight-loss'),
  ('Griot-Style Lean Pork with Cabbage', 'Griot de porc maigre et chou', 440, 40, 12, 24, 50, array['Estimated','Caribbean','High protein','Low carb'], 'weight-loss'),
  ('Haitian Cornmeal (Mayi Moulen) with Beans', 'Mayi moulen aux haricots', 460, 16, 80, 9, 40, array['Estimated','Caribbean','Plant-based'], 'muscle-gain'),
  ('Caribbean Green Smoothie (Lime & Mango)', 'Smoothie vert caraïbe', 240, 20, 36, 3, 5, array['Estimated','Caribbean','Post-workout','Quick'], 'quick-easy'),
  ('Québécois Turkey Pâté Chinois', 'Pâté chinois à la dinde', 540, 40, 55, 16, 45, array['Estimated','Québécois','High protein','Family'], 'muscle-gain'),
  ('Maple-Dijon Salmon with Roasted Veg', 'Saumon érable-dijon et légumes rôtis', 460, 38, 22, 24, 30, array['Estimated','Québécois','Omega-3'], 'weight-loss'),
  ('Lighter Québec Baked Beans', 'Fèves au lard allégées', 380, 20, 58, 8, 50, array['Estimated','Québécois','High fiber','Plant-based'], 'quick-easy'),
  ('Tourtière-Spiced Lean Bowl', 'Bol épicé façon tourtière', 500, 38, 45, 18, 35, array['Estimated','Québécois','High protein'], 'muscle-gain'),
  ('Oatmeal with Québec Maple & Walnuts', 'Gruau à l''érable et aux noix', 360, 14, 52, 12, 10, array['Estimated','Québécois','Breakfast'], 'breakfast'),
  ('Lentil Cretons-Style Spread on Rye', 'Tartinade de lentilles façon cretons', 300, 18, 34, 10, 20, array['Estimated','Québécois','Plant-based','Breakfast'], 'breakfast')
) as v(name, name_fr, calories, protein_g, carbs_g, fat_g, minutes, tags, category)
where not exists (select 1 from public.recipes r where r.name = v.name);
