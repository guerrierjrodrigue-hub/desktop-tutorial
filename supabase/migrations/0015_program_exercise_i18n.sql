-- 0015: French translations for the program / workout-day / exercise catalog.
--
-- Additive only: nullable *_fr columns (NULL falls back to the English column).
-- Controlled vocab (muscles, levels, categories) is translated in the app at
-- render time; free text lives here. Dollar-quoted strings ($x$...$x$) avoid
-- apostrophe escaping. No DROP, no deletes.

alter table programs
  add column if not exists title_fr text,
  add column if not exists description_fr text;

alter table workout_days
  add column if not exists title_fr text,
  add column if not exists focus_fr text;

alter table exercises
  add column if not exists name_fr text,
  add column if not exists instructions_fr text[];

-- Programs -------------------------------------------------------------------
update programs set title_fr = $x$Fondations de la force$x$,
  description_fr = $x$Bâtis une base solide avec des mouvements polyarticulaires et une progression disciplinée. Parfait pour retrouver la régularité.$x$
  where slug = 'foundations-of-strength';
update programs set title_fr = $x$Affûté et discipliné$x$,
  description_fr = $x$Un programme de conditionnement métabolique pour perdre du gras tout en bâtissant des habitudes durables de maîtrise de soi.$x$
  where slug = 'lean-and-disciplined';
update programs set title_fr = $x$Cours ta course$x$,
  description_fr = $x$Progression du canapé au 5 km avec des intervalles rythmés par l'Écriture. De l'endurance pour le corps et la foi.$x$
  where slug = 'run-your-race';
update programs set title_fr = $x$Mobilité et repos$x$,
  description_fr = $x$Retrouve ton amplitude de mouvement et la tranquillité. Des flows doux associés à une prière respirée guidée.$x$
  where slug = 'mobility-and-rest';
update programs set title_fr = $x$HIIT du guerrier$x$,
  description_fr = $x$Des intervalles de haute intensité pour forger la force mentale. Court, brutal, efficace.$x$
  where slug = 'warrior-hiit';
update programs set title_fr = $x$Au poids du corps, partout$x$,
  description_fr = $x$Pas de salle, pas d'excuses. Une progression complète de callisthénie à faire n'importe où.$x$
  where slug = 'bodyweight-anywhere';

-- Workout-day titles ---------------------------------------------------------
update workout_days set title_fr = $x$Chaos AMRAP$x$ where title = 'AMRAP Chaos';
update workout_days set title_fr = $x$Souffle et immobilité$x$ where title = 'Breath & Stillness';
update workout_days set title_fr = $x$Gainage et conditionnement$x$ where title = 'Core & Conditioning';
update workout_days set title_fr = $x$Focus gainage$x$ where title = 'Core Focus';
update workout_days set title_fr = $x$Grind EMOM$x$ where title = 'EMOM Grind';
update workout_days set title_fr = $x$Échelle finisher$x$ where title = 'Finisher Ladder';
update workout_days set title_fr = $x$Flow corps entier$x$ where title = 'Full Body Flow';
update workout_days set title_fr = $x$Brûle corps entier$x$ where title = 'Full-Body Burn';
update workout_days set title_fr = $x$Flow hanches et colonne$x$ where title = 'Hip & Spine Flow';
update workout_days set title_fr = $x$Course fractionnée$x$ where title = 'Interval Run';
update workout_days set title_fr = $x$Focus jambes$x$ where title = 'Legs Focus';
update workout_days set title_fr = $x$Course longue et lente$x$ where title = 'Long Slow Run';
update workout_days set title_fr = $x$Puissance bas du corps$x$ where title = 'Lower Body Power';
update workout_days set title_fr = $x$Relâchement bas du corps$x$ where title = 'Lower Body Release';
update workout_days set title_fr = $x$Circuit métabolique$x$ where title = 'Metabolic Circuit';
update workout_days set title_fr = $x$Focus tirage$x$ where title = 'Pull Focus';
update workout_days set title_fr = $x$Focus poussée$x$ where title = 'Push Focus';
update workout_days set title_fr = $x$Épaules et dorsales$x$ where title = 'Shoulder & T-Spine';
update workout_days set title_fr = $x$Fractionné sprint$x$ where title = 'Sprint Intervals';
update workout_days set title_fr = $x$Assaut Tabata$x$ where title = 'Tabata Assault';
update workout_days set title_fr = $x$Course tempo$x$ where title = 'Tempo Run';
update workout_days set title_fr = $x$Haut du corps — tirage$x$ where title = 'Upper Body Pull';
update workout_days set title_fr = $x$Haut du corps — poussée$x$ where title = 'Upper Body Push';

-- Workout-day focus ----------------------------------------------------------
update workout_days set focus_fr = $x$Abdos, obliques$x$ where focus = 'Abs, obliques';
update workout_days set focus_fr = $x$Endurance aérobie$x$ where focus = 'Aerobic endurance';
update workout_days set focus_fr = $x$Anaérobie$x$ where focus = 'Anaerobic';
update workout_days set focus_fr = $x$Puissance anaérobie$x$ where focus = 'Anaerobic power';
update workout_days set focus_fr = $x$Dos, biceps$x$ where focus = 'Back, biceps';
update workout_days set focus_fr = $x$Base cardio$x$ where focus = 'Cardio base';
update workout_days set focus_fr = $x$Pectoraux, épaules, triceps$x$ where focus = 'Chest, shoulders, triceps';
update workout_days set focus_fr = $x$Conditionnement$x$ where focus = 'Conditioning';
update workout_days set focus_fr = $x$Gainage, cardio$x$ where focus = 'Core, cardio';
update workout_days set focus_fr = $x$Mental$x$ where focus = 'Grit';
update workout_days set focus_fr = $x$Ischio-jambiers, mollets$x$ where focus = 'Hamstrings, calves';
update workout_days set focus_fr = $x$Hanches, colonne$x$ where focus = 'Hips, spine';
update workout_days set focus_fr = $x$Seuil lactique$x$ where focus = 'Lactate threshold';
update workout_days set focus_fr = $x$Endurance musculaire$x$ where focus = 'Muscular endurance';
update workout_days set focus_fr = $x$Quadriceps, fessiers, ischio-jambiers$x$ where focus = 'Quads, glutes, hamstrings';
update workout_days set focus_fr = $x$Récupération, prière$x$ where focus = 'Recovery, prayer';
update workout_days set focus_fr = $x$Épaules, haut du dos$x$ where focus = 'Shoulders, upper back';
update workout_days set focus_fr = $x$Conditionnement de force$x$ where focus = 'Strength conditioning';
update workout_days set focus_fr = $x$Endurance de force$x$ where focus = 'Strength endurance';
update workout_days set focus_fr = $x$Corps entier$x$ where focus = 'Whole body';

-- Exercise names + instructions ----------------------------------------------
update exercises set name_fr = $x$Squat arrière$x$, instructions_fr = array[
  $i$Cet exercice se réalise idéalement dans un rack à squat par sécurité. Place d'abord la barre sur le rack juste au-dessus des épaules. Une fois la hauteur réglée et la barre chargée, passe sous la barre et place le haut de ton dos (juste sous la nuque) contre elle.$i$,
  $i$Tiens la barre des deux mains de chaque côté et sors-la du rack en poussant avec les jambes tout en redressant le torse.$i$,
  $i$Écarte-toi du rack et place tes pieds à largeur d'épaules, pointes légèrement vers l'extérieur. Garde la tête haute et le dos droit en permanence. C'est ta position de départ.$i$,
  $i$Descends lentement en fléchissant les genoux et en reculant les hanches tout en gardant le dos droit et la tête haute. Descends jusqu'à ce que les ischio-jambiers touchent les mollets. Inspire pendant cette phase.$i$,
  $i$Remonte en expirant, en poussant dans le sol avec le talon ou le milieu du pied, en tendant les jambes et en ouvrant les hanches pour revenir à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Back Squat';

update exercises set name_fr = $x$Rowing barre$x$, instructions_fr = array[
  $i$Tiens une barre en prise pronation (paumes vers le bas), fléchis légèrement les genoux et penche le torse en avant en pliant à la taille, dos droit, jusqu'à ce qu'il soit presque parallèle au sol. Garde la tête haute. La barre pend devant toi, bras perpendiculaires au sol. C'est ta position de départ.$i$,
  $i$En gardant le torse immobile, expire et tire la barre vers toi. Garde les coudes près du corps et utilise seulement les avant-bras pour tenir la charge. En position haute contractée, serre les muscles du dos et marque une courte pause.$i$,
  $i$Puis inspire et redescends lentement la barre à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Barbell Row';

update exercises set name_fr = $x$Développé épaules à la barre$x$, instructions_fr = array[
  $i$Assieds-toi sur un banc avec dossier dans un rack à squat. Place une barre à une hauteur juste au-dessus de ta tête. Saisis-la en prise pronation (paumes vers l'avant).$i$,
  $i$Une fois la bonne largeur de prise choisie, soulève la barre au-dessus de la tête en verrouillant les bras. Tiens-la au niveau des épaules, légèrement devant la tête. C'est ta position de départ.$i$,
  $i$Descends lentement la barre vers les épaules en inspirant.$i$,
  $i$Remonte la barre à la position de départ en expirant.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Barbell Shoulder Press';

update exercises set name_fr = $x$Dips sur banc$x$, instructions_fr = array[
  $i$Place un banc derrière ton dos. Le banc perpendiculaire à ton corps et en lui tournant le dos, tiens le bord du banc, mains tendues écartées à largeur d'épaules. Les jambes sont tendues devant, le corps plié à la taille et perpendiculaire au torse. C'est ta position de départ.$i$,
  $i$Descends lentement en inspirant, en pliant les coudes jusqu'à un angle un peu inférieur à 90 degrés entre le bras et l'avant-bras. Garde les coudes aussi serrés que possible, avant-bras pointant vers le bas.$i$,
  $i$En utilisant tes triceps, remonte le torse jusqu'à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Bench Dips';

update exercises set name_fr = $x$Développé couché$x$, instructions_fr = array[
  $i$Allonge-toi sur un banc plat. Avec une prise moyenne (qui crée un angle de 90 degrés entre avant-bras et bras au milieu du mouvement), sors la barre du rack et tiens-la bras tendus au-dessus de toi. C'est ta position de départ.$i$,
  $i$Depuis la position de départ, inspire et descends lentement jusqu'à ce que la barre touche le milieu de la poitrine.$i$,
  $i$Après une courte pause, repousse la barre à la position de départ en expirant. Concentre-toi sur la poussée avec les pectoraux. Verrouille les bras et serre la poitrine en haut, tiens une seconde, puis redescends lentement. Idéalement, la descente dure environ deux fois plus longtemps que la montée.$i$,
  $i$Répète pour le nombre de répétitions prescrit.$i$,
  $i$Quand tu as terminé, repose la barre sur le rack.$i$
] where name = 'Bench Press';

update exercises set name_fr = $x$Respiration carrée$x$ where name = 'Box Breathing';

update exercises set name_fr = $x$Saut sur box$x$, instructions_fr = array[
  $i$Adopte une posture détendue face à la box ou à la plateforme, à environ une longueur de bras. Bras le long du corps et jambes légèrement fléchies.$i$,
  $i$En t'aidant des bras pour l'impulsion initiale, saute vers le haut et l'avant, en atterrissant des deux pieds en même temps sur la box.$i$,
  $i$Redescends ou resaute immédiatement à la position de départ, puis répète la séquence.$i$
] where name = 'Box Jump';

update exercises set name_fr = $x$Étirement des mollets au mur$x$, instructions_fr = array[
  $i$Tiens-toi face à un mur, à environ un mètre.$i$,
  $i$Appuie-toi contre le mur en plaçant ton poids sur les avant-bras.$i$,
  $i$Garde les talons au sol. Tiens 10 à 20 secondes. Tu peux t'éloigner ou te rapprocher du mur pour rendre l'étirement plus ou moins intense.$i$
] where name = 'Calf Stretch Against Wall';

update exercises set name_fr = $x$Chat-vache$x$, instructions_fr = array[
  $i$Mets-toi au sol à quatre pattes, sur les mains et les genoux.$i$,
  $i$Rentre le ventre et arrondis la colonne, le bas du dos, les épaules et la nuque, en laissant tomber la tête.$i$,
  $i$Tiens 15 secondes.$i$
] where name = 'Cat-Cow';

update exercises set name_fr = $x$Tractions en supination$x$, instructions_fr = array[
  $i$Saisis la barre de traction, paumes tournées vers toi, avec une prise plus serrée que la largeur d'épaules.$i$,
  $i$Bras tendus devant toi à la largeur choisie, garde le torse aussi droit que possible en creusant légèrement le bas du dos et en sortant la poitrine. C'est ta position de départ. Garder le torse droit maximise le travail des biceps et limite celui du dos.$i$,
  $i$En expirant, tire le torse vers le haut jusqu'à ce que la tête arrive au niveau de la barre. Concentre-toi sur les biceps. Garde les coudes près du corps ; seuls les bras bougent.$i$,
  $i$Après une seconde de contraction, redescends lentement le torse jusqu'à ce que les bras soient tendus. Inspire pendant cette phase.$i$,
  $i$Répète pour le nombre de répétitions prescrit.$i$
] where name = 'Chin-ups';

update exercises set name_fr = $x$Maintien en squat profond$x$, instructions_fr = array[
  $i$Tiens-toi debout, pieds à largeur d'épaules. Tu peux placer les mains derrière la tête. C'est ta position de départ.$i$,
  $i$Amorce le mouvement en fléchissant les genoux et les hanches, en reculant les hanches.$i$,
  $i$Descends jusqu'en bas si tu le peux, en gardant la tête et la poitrine hautes et en poussant les genoux vers l'extérieur ; tiens la position.$i$
] where name = 'Deep Squat Hold';

update exercises set name_fr = $x$Dips$x$, instructions_fr = array[
  $i$Pour la position de départ, tiens ton corps à bout de bras, bras presque verrouillés au-dessus des barres.$i$,
  $i$Inspire et descends lentement. Garde le torse droit et les coudes près du corps pour mieux cibler les triceps. Descends jusqu'à former un angle de 90 degrés entre bras et avant-bras.$i$,
  $i$Puis expire et repousse le torse vers le haut avec les triceps pour revenir à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions prescrit.$i$
] where name = 'Dips';

update exercises set name_fr = $x$Curl biceps haltères$x$, instructions_fr = array[
  $i$Tiens-toi droit, un haltère dans chaque main, bras tendus. Garde les coudes près du torse et tourne les paumes vers l'avant. C'est ta position de départ.$i$,
  $i$En gardant les bras immobiles, expire et enroule les charges en contractant les biceps jusqu'à ce que les haltères arrivent au niveau des épaules. Tiens la contraction un instant.$i$,
  $i$Puis inspire et redescends lentement les haltères à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Dumbbell Bicep Curl';

update exercises set name_fr = $x$Fente bulgare haltères$x$, instructions_fr = array[
  $i$Place-toi en fente, le pied arrière surélevé et le pied avant devant.$i$,
  $i$Tiens un haltère dans chaque main, le long du corps. C'est ta position de départ.$i$,
  $i$Descends en fléchissant le genou et la hanche. Garde une bonne posture et le genou avant aligné avec le pied.$i$,
  $i$En bas du mouvement, pousse dans le talon pour tendre le genou et la hanche et revenir à la position de départ.$i$
] where name = 'Dumbbell Split Squat';

update exercises set name_fr = $x$Étirement dynamique du dos$x$, instructions_fr = array[
  $i$Tiens-toi debout, pieds à largeur d'épaules. C'est ta position de départ.$i$,
  $i$En gardant les bras tendus, balance-les vers le haut devant toi 5 à 10 fois, en augmentant l'amplitude à chaque fois jusqu'à les lever au-dessus de la tête.$i$
] where name = 'Dynamic Back Stretch';

update exercises set name_fr = $x$Footing léger sur tapis$x$, instructions_fr = array[
  $i$Monte sur le tapis et choisis l'option souhaitée dans le menu. La plupart des tapis ont un réglage manuel, ou tu peux choisir un programme. Tu peux entrer ton âge et ton poids pour estimer les calories brûlées. L'inclinaison règle l'intensité.$i$,
  $i$Le tapis est pratique, bon pour le cœur et moins traumatisant que courir dehors. Garde une bonne posture en trottinant et ne tiens les poignées qu'au besoin, par exemple pour descendre ou vérifier ton rythme cardiaque.$i$
] where name = 'Easy Treadmill Jog';

update exercises set name_fr = $x$Squat sauté$x$, instructions_fr = array[
  $i$Croise les bras sur la poitrine.$i$,
  $i$Tête haute et dos droit, place les pieds à largeur d'épaules.$i$,
  $i$En gardant le dos droit et la poitrine haute, descends en squat en inspirant jusqu'à ce que les cuisses soient au moins parallèles au sol.$i$,
  $i$Puis, en poussant surtout sur l'avant des pieds, saute le plus haut possible en utilisant les cuisses comme des ressorts. Expire pendant cette phase.$i$,
  $i$Dès que tu touches le sol, redescends aussitôt en squat et saute à nouveau.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Freehand Jump Squat';

update exercises set name_fr = $x$Squat goblet$x$, instructions_fr = array[
  $i$Debout, tiens une kettlebell légère par les cornes près de la poitrine. C'est ta position de départ.$i$,
  $i$Descends en squat entre les jambes jusqu'à ce que les ischio-jambiers touchent les mollets. Garde la poitrine et la tête hautes et le dos droit.$i$,
  $i$En bas, marque une pause et utilise les coudes pour pousser les genoux vers l'extérieur. Reviens à la position de départ et répète pour 10 à 20 répétitions.$i$
] where name = 'Goblet Squat';

update exercises set name_fr = $x$Étirement des ischio-jambiers$x$, instructions_fr = array[
  $i$Allonge-toi sur le dos, une jambe tendue au-dessus de toi, hanche à 90 degrés. Garde l'autre jambe à plat au sol.$i$,
  $i$Passe une sangle, une bande ou une corde sous la plante du pied. C'est ta position de départ.$i$,
  $i$Tire sur la sangle pour créer une tension dans les mollets et les ischio-jambiers. Tiens 10 à 30 secondes, puis change de jambe.$i$
] where name = 'Hamstring Stretch';

update exercises set name_fr = $x$Progression de pompes en équilibre$x$, instructions_fr = array[
  $i$Dos au mur, penche-toi à la taille et place les deux mains au sol à largeur d'épaules.$i$,
  $i$Monte contre le mur bras tendus. Le corps doit être à l'envers, bras et jambes tendus, aussi droit que possible. Si c'est la première fois, fais-toi assister. Garde la tête face au mur plutôt que de regarder vers le bas.$i$,
  $i$Descends lentement en inspirant jusqu'à ce que la tête touche presque le sol. Il est essentiel de descendre lentement pour éviter toute blessure à la tête.$i$,
  $i$Repousse-toi lentement en expirant jusqu'à ce que les coudes soient presque verrouillés.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Handstand Push-Up Progression';

update exercises set name_fr = $x$Relevé de jambes suspendu (pike)$x$, instructions_fr = array[
  $i$Suspends-toi à une barre de traction, jambes et pieds joints, en prise pronation un peu plus large que les épaules. Tu peux utiliser des sangles de poignet pour mieux tenir.$i$,
  $i$Fléchis les genoux à 90 degrés et amène les cuisses vers l'avant, mollets perpendiculaires au sol et cuisses parallèles. C'est ta position de départ.$i$,
  $i$Monte les jambes en expirant jusqu'à presque toucher la barre avec les tibias. Essaie de tendre les jambes autant que possible en haut.$i$,
  $i$Redescends les jambes aussi lentement que possible jusqu'à la position de départ, sans te balancer ni utiliser l'élan.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Hanging Pike';

update exercises set name_fr = $x$Étirement hanches et fessiers$x$, instructions_fr = array[
  $i$Passe une sangle, une corde ou une bande autour d'un pied et amène cette jambe en travers du corps vers le côté opposé, jambe tendue, allongé au sol. C'est ta position de départ.$i$,
  $i$En gardant le pied décollé du sol, tire sur la sangle pour amener les orteils vers toi. Tiens 10 à 20 secondes, puis change de côté.$i$
] where name = 'Hip & Glute Stretch';

update exercises set name_fr = $x$Rowing inversé$x$, instructions_fr = array[
  $i$Place une barre dans un rack à hauteur de taille. Tu peux aussi utiliser une smith machine.$i$,
  $i$Prends une prise plus large que les épaules et place-toi suspendu sous la barre. Le corps droit, talons au sol et bras tendus. C'est ta position de départ.$i$,
  $i$Amorce en fléchissant les coudes, en tirant la poitrine vers la barre. Rapproche les omoplates pendant le mouvement.$i$,
  $i$Marque une pause en haut, puis reviens à la position de départ.$i$,
  $i$Répète pour le nombre de répétitions souhaité.$i$
] where name = 'Inverted Row';

update exercises set name_fr = $x$Pistol squat kettlebell$x$, instructions_fr = array[
  $i$Prends une kettlebell à deux mains par les cornes. Lève une jambe au-dessus du sol et descends en squat sur l'autre.$i$,
  $i$Descends en fléchissant le genou et en reculant les hanches, kettlebell tenue devant toi.$i$,
  $i$Tiens la position basse une seconde, puis inverse le mouvement en poussant dans le talon, tête et poitrine hautes.$i$,
  $i$Redescends et répète.$i$
] where name = 'Kettlebell Pistol Squat';

update exercises set name_fr = $x$Échelle de thrusters kettlebell$x$, instructions_fr = array[
  $i$Épaule deux kettlebells. Amène-les aux épaules en poussant avec les jambes et les hanches tout en tirant les kettlebells vers les épaules, en tournant les poignets. C'est ta position de départ.$i$,
  $i$Descends en squat en fléchissant hanches et genoux, hanches entre les jambes. Garde le dos droit et descends aussi bas que possible.$i$,
  $i$En bas, inverse le mouvement en tendant genoux et hanches, en poussant dans les talons. Dans l'élan, pousse les deux kettlebells au-dessus de la tête bras tendus.$i$,
  $i$Au début de la répétition suivante, ramène les charges aux épaules.$i$
] where name = 'Kettlebell Thruster Ladder';

update exercises set name_fr = $x$Relevés de jambes$x$, instructions_fr = array[
  $i$Suspends-toi à une barre de traction, bras tendus, en prise large ou moyenne. Les jambes pendent vers le bas, bassin légèrement rétroversé. C'est ta position de départ.$i$,
  $i$Monte les jambes jusqu'à ce que le torse forme un angle de 90 degrés avec elles. Expire pendant le mouvement et tiens la contraction une seconde.$i$,
  $i$Redescends lentement à la position de départ en inspirant.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Leg Raises';

update exercises set name_fr = $x$Passe de poitrine au medicine ball$x$, instructions_fr = array[
  $i$Il te faut un partenaire. À défaut, réalise le mouvement contre un mur.$i$,
  $i$Face à ton partenaire, tiens le medicine ball au niveau du torse à deux mains.$i$,
  $i$Amène le ballon à la poitrine, puis inverse le mouvement en tendant les coudes. Pour les applications sportives, tu peux faire un pas en lançant.$i$,
  $i$Ton partenaire rattrape le ballon et te le renvoie.$i$,
  $i$Réceptionne le lancer à deux mains, au niveau de la poitrine.$i$
] where name = 'Medicine Ball Chest Pass';

update exercises set name_fr = $x$Montées de genoux (mountain climbers)$x$, instructions_fr = array[
  $i$Place-toi en position de pompe, le poids sur les mains et les orteils. En fléchissant genou et hanche, ramène une jambe jusqu'à ce que le genou soit environ sous la hanche. C'est ta position de départ.$i$,
  $i$Inverse explosivement la position des jambes, en tendant la jambe fléchie et en ramenant l'autre pied hanche et genou fléchis. Alterne ainsi pendant 20 à 30 secondes.$i$
] where name = 'Mountain Climbers';

update exercises set name_fr = $x$Swing kettlebell à un bras$x$ where name = 'One-Arm Kettlebell Swing';

update exercises set name_fr = $x$Planche$x$, instructions_fr = array[
  $i$Mets-toi en position ventrale au sol, le poids sur les orteils et les avant-bras. Les bras sont fléchis, directement sous les épaules.$i$,
  $i$Garde le corps droit en permanence et tiens la position le plus longtemps possible. Pour augmenter la difficulté, lève un bras ou une jambe.$i$
] where name = 'Plank';

update exercises set name_fr = $x$Maintien en planche$x$, instructions_fr = array[
  $i$Mets-toi en position ventrale au sol, le poids sur les orteils et les avant-bras. Les bras sont fléchis, directement sous les épaules.$i$,
  $i$Garde le corps droit en permanence et tiens la position le plus longtemps possible. Pour augmenter la difficulté, lève un bras ou une jambe.$i$
] where name = 'Plank Hold';

update exercises set name_fr = $x$Épaulé (power clean)$x$, instructions_fr = array[
  $i$Debout, pieds un peu plus larges que les épaules, pointes légèrement vers l'extérieur.$i$,
  $i$Accroupis-toi et saisis la barre en prise pronation fermée, mains un peu plus larges que les épaules, à l'extérieur des genoux, coudes tendus.$i$,
  $i$Place la barre à environ 2 cm devant les tibias, au-dessus de l'avant des pieds. Dos plat ou légèrement cambré, poitrine haute et omoplates serrées.$i$,
  $i$Soulève la barre du sol en tendant puissamment hanches et genoux en expirant, le torse gardant le même angle, la barre restant près des tibias.$i$,
  $i$Quand la barre passe les genoux, projette les hanches vers l'avant et fléchis légèrement les genoux ; les cuisses touchent alors la barre.$i$,
  $i$Tends puissamment hanches et genoux et monte sur la pointe des pieds, puis hausse rapidement les épaules sans encore plier les coudes.$i$,
  $i$Quand les épaules atteignent leur point le plus haut, fléchis les coudes pour tirer ton corps sous la barre.$i$,
  $i$Passe le corps sous la barre en faisant tourner les bras autour et sous la barre, tout en fléchissant hanches et genoux en quart de squat.$i$,
  $i$Réceptionne la barre sur l'avant des épaules et des clavicules, torse gainé, tête neutre et pieds à plat, puis redresse-toi complètement.$i$,
  $i$Repose la barre sur les cuisses de façon contrôlée, puis jusqu'au sol, et recommence pour le nombre de répétitions recommandé.$i$
] where name = 'Power Clean';

update exercises set name_fr = $x$Prière respirée du Psaume 23$x$ where name = 'Psalm 23 Breath Prayer';

update exercises set name_fr = $x$Tractions$x$, instructions_fr = array[
  $i$Saisis la barre de traction, paumes vers l'avant, avec la prise prescrite. Prise large : mains plus écartées que les épaules ; prise moyenne : à largeur d'épaules ; prise serrée : plus rapprochée.$i$,
  $i$Bras tendus devant toi à la largeur choisie, incline le torse d'environ 30 degrés vers l'arrière en creusant le bas du dos et en sortant la poitrine. C'est ta position de départ.$i$,
  $i$Tire le torse vers le haut jusqu'à ce que la barre touche le haut de la poitrine, en tirant les épaules et les bras vers le bas et l'arrière. Expire. Serre bien les muscles du dos en haut ; seuls les bras bougent.$i$,
  $i$Après une seconde en contraction, inspire et redescends lentement jusqu'à ce que les bras soient tendus et les dorsaux complètement étirés.$i$,
  $i$Répète pour le nombre de répétitions prescrit.$i$
] where name = 'Pull-ups';

update exercises set name_fr = $x$Pompe$x$, instructions_fr = array[
  $i$Allonge-toi face au sol et place les mains à environ 90 cm l'une de l'autre, torse soutenu à bout de bras.$i$,
  $i$Descends jusqu'à ce que la poitrine touche presque le sol en inspirant.$i$,
  $i$Expire et repousse le haut du corps à la position de départ en serrant la poitrine.$i$,
  $i$Après une courte pause en haut, recommence à descendre pour autant de répétitions que nécessaire.$i$
] where name = 'Push-up';

update exercises set name_fr = $x$Pompe à planche latérale$x$, instructions_fr = array[
  $i$Place-toi en position de pompe sur les orteils, mains un peu plus larges que les épaules.$i$,
  $i$Réalise une pompe en fléchissant les coudes, le corps droit à la descente.$i$,
  $i$Fais une pompe et, en remontant, bascule le poids sur le côté gauche, pivote sur le côté en levant le bras droit vers le plafond en planche latérale.$i$,
  $i$Repose le bras au sol pour une nouvelle pompe, puis pivote de l'autre côté.$i$,
  $i$Répète en alternant les côtés, pour 10 répétitions ou plus.$i$
] where name = 'Push-Up to Side Plank';

update exercises set name_fr = $x$Variantes de pompes$x$, instructions_fr = array[
  $i$Allonge-toi face au sol et place les mains à environ 90 cm l'une de l'autre, torse soutenu à bout de bras.$i$,
  $i$Descends jusqu'à ce que la poitrine touche presque le sol en inspirant.$i$,
  $i$Expire et repousse le haut du corps à la position de départ en serrant la poitrine.$i$,
  $i$Après une courte pause en haut, recommence à descendre pour autant de répétitions que nécessaire.$i$
] where name = 'Push-up Variations';

update exercises set name_fr = $x$Rowing renégat$x$, instructions_fr = array[
  $i$Place deux kettlebells au sol à largeur d'épaules. Mets-toi sur les orteils et les mains comme pour une pompe, le corps droit et gainé. Utilise les poignées des kettlebells pour soutenir le haut du corps. Tu peux écarter les pieds pour plus de stabilité.$i$,
  $i$Pousse une kettlebell dans le sol et tire l'autre en rapprochant l'omoplate du côté qui travaille et en fléchissant le coude vers la hanche.$i$,
  $i$Repose la kettlebell au sol et recommence avec la main opposée. Répète sur plusieurs répétitions.$i$
] where name = 'Renegade Row';

update exercises set name_fr = $x$Soulevé de terre roumain$x$, instructions_fr = array[
  $i$Place une barre devant toi au sol et saisis-la en prise pronation un peu plus large que les épaules. Selon la charge, des sangles et une plateforme surélevée peuvent aider à l'amplitude.$i$,
  $i$Fléchis légèrement les genoux, tibias verticaux, hanches en arrière et dos droit. C'est ta position de départ.$i$,
  $i$En gardant le dos et les bras parfaitement droits, utilise les hanches pour soulever la barre en expirant. Le mouvement doit être régulier et contrôlé.$i$,
  $i$Une fois complètement debout, redescends la barre en reculant les hanches, genoux à peine fléchis, contrairement au squat. Inspire au début et garde la poitrine haute.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Romanian Deadlift';

update exercises set name_fr = $x$Russian twist$x$, instructions_fr = array[
  $i$Allonge-toi au sol, pieds bloqués sous un appui ou tenus par un partenaire. Les jambes sont fléchies aux genoux.$i$,
  $i$Relève le haut du corps pour former un V imaginaire avec les cuisses. Les bras sont tendus devant toi, perpendiculaires au torse, mains jointes. C'est la position de départ.$i$,
  $i$Tourne le torse vers la droite jusqu'à ce que les bras soient parallèles au sol, en expirant.$i$,
  $i$Tiens la contraction une seconde, reviens au centre, puis fais de même de l'autre côté.$i$,
  $i$Répète pour le nombre de répétitions recommandé.$i$
] where name = 'Russian Twist';

update exercises set name_fr = $x$Rotations d'épaules$x$, instructions_fr = array[
  $i$Épaules relâchées et bras le long du corps (ou sur les cuisses si tu es assis), roule doucement les épaules vers l'avant, le haut, l'arrière, puis le bas.$i$,
  $i$Inverse le sens. Tu peux faire l'exercice en alternant les épaules ou les deux en même temps.$i$
] where name = 'Shoulder Circles';

update exercises set name_fr = $x$Pont fessier unijambe$x$, instructions_fr = array[
  $i$Allonge-toi au sol, pieds à plat et genoux fléchis.$i$,
  $i$Lève une jambe du sol en ramenant le genou vers la poitrine. C'est ta position de départ.$i$,
  $i$Exécute le mouvement en poussant dans le talon, en tendant la hanche vers le haut et en décollant les fessiers du sol.$i$,
  $i$Monte au maximum, marque une pause, puis reviens à la position de départ.$i$
] where name = 'Single-Leg Glute Bridge';

update exercises set name_fr = $x$Étirement de la colonne$x$, instructions_fr = array[
  $i$Assieds-toi sur une chaise, dos droit et pieds à plat au sol.$i$,
  $i$Entrelace les doigts derrière la tête, coudes ouverts et menton baissé.$i$,
  $i$Tourne le haut du corps d'un côté en trois temps, aussi loin que possible. Puis penche-toi en avant et tourne le torse pour amener le coude vers le sol, à l'intérieur du genou.$i$,
  $i$Reviens droit, puis répète de l'autre côté.$i$
] where name = 'Spinal Stretch';

update exercises set name_fr = $x$Étirement debout ischios et mollets$x$, instructions_fr = array[
  $i$Commence par passer une sangle, une bande ou une corde autour d'un pied. Debout, avance ce pied.$i$,
  $i$Fléchis la jambe arrière en gardant la jambe avant tendue. Relève les orteils du pied avant et penche-toi en avant.$i$,
  $i$À l'aide de la sangle, tire sur le dessus du pied pour accentuer l'étirement du mollet. Tiens 10 à 20 secondes et change de pied.$i$
] where name = 'Standing Hamstring and Calf Stretch';

update exercises set name_fr = $x$Sprint vélo stationnaire$x$, instructions_fr = array[
  $i$Installe-toi sur le vélo et règle la selle à ta taille.$i$,
  $i$Choisis l'option souhaitée dans le menu. Il faut parfois pédaler pour l'allumer. Utilise le réglage manuel ou un programme. Tu peux entrer âge et poids pour estimer les calories. La résistance se modifie en cours de séance, et les poignées permettent de suivre ta fréquence cardiaque.$i$
] where name = 'Stationary Bike Sprint';

update exercises set name_fr = $x$Sprint rameur$x$, instructions_fr = array[
  $i$Installe-toi sur le rameur. Assure-toi que les talons reposent bien contre la base des cale-pieds et que les sangles sont serrées. Choisis un programme si besoin. Assieds-toi droit et penche-toi en avant à partir des hanches.$i$,
  $i$Le mouvement a trois phases. D'abord, tu avances sur le rameur : genoux fléchis vers la poitrine, haut du corps légèrement penché en avant en gardant une bonne posture. Ensuite, pousse sur les cale-pieds et tends les jambes en amenant les mains vers le haut de l'abdomen, en serrant les épaules vers l'arrière. Pour ménager le dos, utilise surtout les jambes et les hanches.$i$,
  $i$La phase de récupération consiste simplement à tendre les bras, fléchir les genoux et ramener le corps vers l'avant pour revenir à la première phase.$i$
] where name = 'Stationary Row Sprint';

update exercises set name_fr = $x$Intervalles au rameur$x$, instructions_fr = array[
  $i$Installe-toi sur le rameur. Assure-toi que les talons reposent bien contre la base des cale-pieds et que les sangles sont serrées. Choisis un programme si besoin. Assieds-toi droit et penche-toi en avant à partir des hanches.$i$,
  $i$Le mouvement a trois phases. D'abord, tu avances sur le rameur : genoux fléchis vers la poitrine, haut du corps légèrement penché en avant en gardant une bonne posture. Ensuite, pousse sur les cale-pieds et tends les jambes en amenant les mains vers le haut de l'abdomen, en serrant les épaules vers l'arrière. Pour ménager le dos, utilise surtout les jambes et les hanches.$i$,
  $i$La phase de récupération consiste simplement à tendre les bras, fléchir les genoux et ramener le corps vers l'avant pour revenir à la première phase.$i$
] where name = 'Stationary Rowing Intervals';

update exercises set name_fr = $x$Maintien superman$x$, instructions_fr = array[
  $i$Allonge-toi droit, face au sol, sur un tapis. Les bras sont tendus devant toi. C'est la position de départ.$i$,
  $i$Lève simultanément les bras, les jambes et la poitrine du sol et tiens la contraction 2 secondes. Serre le bas du dos et expire. En position haute, tu dois ressembler à Superman en plein vol.$i$,
  $i$Redescends lentement bras, jambes et poitrine à la position de départ en inspirant.$i$,
  $i$Répète pour le nombre de répétitions prescrit dans ton programme.$i$
] where name = 'Superman Hold';

update exercises set name_fr = $x$Course tempo sur tapis$x$, instructions_fr = array[
  $i$Monte sur le tapis et choisis l'option souhaitée dans le menu. La plupart des tapis ont un réglage manuel, ou tu peux choisir un programme. Tu peux entrer ton âge et ton poids pour estimer les calories. L'inclinaison règle l'intensité.$i$,
  $i$Le tapis est pratique, bon pour le cœur et moins traumatisant que courir dehors. Garde une bonne posture en courant et ne tiens les poignées qu'au besoin, par exemple pour descendre ou vérifier ton rythme cardiaque.$i$
] where name = 'Tempo Treadmill Run';

update exercises set name_fr = $x$Thruster$x$, instructions_fr = array[
  $i$Épaule deux kettlebells. Amène-les aux épaules en poussant avec les jambes et les hanches tout en tirant les kettlebells vers les épaules, en tournant les poignets. C'est ta position de départ.$i$,
  $i$Descends en squat en fléchissant hanches et genoux, hanches entre les jambes. Garde le dos droit et descends aussi bas que possible.$i$,
  $i$En bas, inverse le mouvement en tendant genoux et hanches, en poussant dans les talons. Dans l'élan, pousse les deux kettlebells au-dessus de la tête bras tendus.$i$,
  $i$Au début de la répétition suivante, ramène les charges aux épaules.$i$
] where name = 'Thruster';

update exercises set name_fr = $x$Course / marche en sentier$x$, instructions_fr = array[
  $i$Courir ou marcher en sentier fait monter le cœur presque immédiatement. Assure-toi d'avoir de bonnes chaussures. Tu utilises les mollets et les fessiers pour monter, mais les genoux, articulations et chevilles encaissent l'essentiel de l'impact à la descente. Fais de petits pas en descente, garde les genoux fléchis pour réduire l'impact et ralentis pour éviter de tomber.$i$,
  $i$Garde une bonne posture et adapte ton allure au terrain, en alternant course et marche selon ton niveau.$i$
] where name = 'Trail Run / Walk';

update exercises set name_fr = $x$Marche de récupération sur tapis$x$, instructions_fr = array[
  $i$Monte sur le tapis et choisis l'option souhaitée dans le menu. La plupart des tapis ont un réglage manuel, ou tu peux choisir un programme. L'inclinaison règle l'intensité.$i$,
  $i$Le tapis est pratique et moins traumatisant que marcher dehors. Marche à un rythme modéré à soutenu. Garde une bonne posture et ne tiens les poignées qu'au besoin, par exemple pour descendre ou vérifier ton rythme cardiaque.$i$
] where name = 'Treadmill Cool-down Walk';

update exercises set name_fr = $x$Intervalles de footing sur tapis$x$, instructions_fr = array[
  $i$Monte sur le tapis et choisis l'option souhaitée dans le menu. La plupart des tapis ont un réglage manuel, ou tu peux choisir un programme. L'inclinaison règle l'intensité.$i$,
  $i$Le tapis est pratique, bon pour le cœur et moins traumatisant que trottiner dehors. Garde une bonne posture et ne tiens les poignées qu'au besoin, par exemple pour descendre ou vérifier ton rythme cardiaque.$i$
] where name = 'Treadmill Jog Intervals';

update exercises set name_fr = $x$Marche d'échauffement sur tapis$x$, instructions_fr = array[
  $i$Monte sur le tapis et choisis l'option souhaitée dans le menu. La plupart des tapis ont un réglage manuel, ou tu peux choisir un programme. L'inclinaison règle l'intensité.$i$,
  $i$Le tapis est pratique et moins traumatisant que marcher dehors. Marche à un rythme modéré à soutenu. Garde une bonne posture et ne tiens les poignées qu'au besoin, par exemple pour descendre ou vérifier ton rythme cardiaque.$i$
] where name = 'Treadmill Walk Warm-up';

update exercises set name_fr = $x$Fente marchée$x$, instructions_fr = array[
  $i$Debout, pieds à largeur d'épaules et mains sur les hanches.$i$,
  $i$Avance d'une jambe en fléchissant les genoux pour descendre les hanches. Descends jusqu'à ce que le genou arrière touche presque le sol. Garde le torse droit et le genou avant au-dessus du pied.$i$,
  $i$Pousse dans le talon du pied avant et tends les deux genoux pour te relever.$i$,
  $i$Avance le pied arrière et répète la fente sur l'autre jambe.$i$
] where name = 'Walking Lunge';

update exercises set name_fr = $x$Le meilleur étirement du monde$x$, instructions_fr = array[
  $i$C'est un étirement en trois parties. Commence en fente avant, pied avant à plat et sur les orteils du pied arrière. Genoux fléchis, descends jusqu'à ce que le genou touche presque le sol. Garde le torse droit et tiens 10 à 20 secondes.$i$,
  $i$Ensuite, pose au sol le bras du même côté que la jambe avant, coude près du pied. L'autre main se place au sol, parallèle à la jambe avant, pour te soutenir.$i$,
  $i$Après 10 à 20 secondes, place les mains de part et d'autre du pied avant. Relève les orteils du pied avant et tends la jambe. Tu devras peut-être repositionner la jambe arrière. Tiens 10 à 20 secondes, puis répète toute la séquence de l'autre côté.$i$
] where name = 'World''s Greatest Stretch';
