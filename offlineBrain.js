/* ==========================================================================
   QuakeGuard - Offline Brain
   A fully on-device version of the AI server's safety assistant. It needs no
   internet and no Python server:
     1. 70 vetted safety topics (709 phrasings) from ai_server/data/knowledge_base.csv,
        matched with TF-IDF word + character n-gram similarity (tolerates typos).
     2. Calculators: warning time, S-P distance, magnitude meaning, kit sizing.
     3. Data lookups on the app's own database: historical quakes, faults,
        nearest shelter / hospital / police / fire station (uses GPS, which
        works without internet), and the last quake feed saved on this device.
     4. Tamil / Hindi answers for the most important emergency topics.
   Generated knowledge data lives in the OFFLINE_KB block below.
   ========================================================================== */
(function (root) {
  'use strict';

  const OFFLINE_KB = [{"i":"during_general","c":"during","q":["what should I do during an earthquake","earthquake is happening now","the ground is shaking right now what do I do","earthquake right now","shaking started what now","the building is shaking","everything is moving","its an earthquake","I feel a tremor what do I do","furniture is rattling","things are falling off the shelves","quake is happening","how to stay safe during shaking","what do I do if there is an earthquake","the room just lurched","sudden jolt and now the floor is rolling","the floor is swaying","what to do if the ground rolls","the lights are swinging","what is the right move when the floor moves","the whole place is vibrating","there is an earthquake","there is an earthquake right now","an earthquake is happening","earthquake","earthquake now","its an earthquake right now","we are having an earthquake","there is a quake happening here","it is shaking here","ceiling fan is swinging and I hear rumbling","I heard a rumble and the walls are shaking","is it safe to run out of the building while it shakes","should I run outside during an earthquake","floor is trembling what should I do"],"a":["DROP to your hands and knees. COVER your head and neck under a sturdy table or against an interior wall. HOLD ON until the shaking stops. Stay away from windows, glass and heavy furniture, and don't run outside while the ground is moving."]},{"i":"help_now","c":"during","q":["help","help me","HELP","oh my god earthquake","I am going to die","somebody help","please help me","what do I do","im panicking","i dont know what to do","emergency","its happening","please help earthquake","I am so scared please tell me what to do","I am freaking out what do I do","tell me what to do quickly","someone please help","I need help right now"],"a":["Stay calm - you can do this. If the ground is shaking: DROP down, COVER your head and neck, HOLD ON. Don't run. When it stops, check yourself for injuries, then move carefully to a safe open area. If anyone is in danger, call your local emergency number (for example 112 or 911)."]},{"i":"during_outdoors","c":"during","q":["I am outside during an earthquake","what to do outdoors during a quake","I am in the street and the ground is shaking","I am in a park when an earthquake hits","earthquake while walking on the road","I am outside near buildings and it is shaking","standing outside what do I do in a quake","I am walking on the pavement and the earth is trembling","the ground started shaking while I was walking outside"],"a":["Move away from buildings, trees, streetlights, signs and power lines to an open area, then drop, cover your head and neck, and hold on until the shaking stops. Falling glass and debris near buildings are the biggest danger outside."]},{"i":"during_car","c":"during","q":["I am driving during an earthquake","what to do in a car when earthquake hits","earthquake while driving","I am in my car and the road is shaking","I am on a bike or scooter during an earthquake","earthquake on the highway","quake while I am behind the wheel","I am in my car on a bridge and it is shaking","earthquake while driving over a flyover"],"a":["Slow down and pull over to a clear spot away from buildings, bridges, overpasses, trees and power lines. Stop, set the parking brake and stay inside with your seatbelt on until the shaking stops. Afterwards, avoid damaged roads and bridges. If you are on a two-wheeler, stop and stay away from poles and buildings."]},{"i":"during_bed","c":"during","q":["I am in bed during an earthquake","earthquake at night while sleeping","the earthquake woke me up","shaking in the middle of the night","I am lying down and the room is shaking","what to do if a quake hits while I sleep"],"a":["Stay where you are, turn face down and cover your head and neck with a pillow. Moving in the dark risks cuts from broken glass and injuries from falling objects. Once the shaking stops, put on shoes before you walk."]},{"i":"during_elevator","c":"during","q":["can I use the elevator in an earthquake","I am in an elevator during an earthquake","stuck in a lift when the earthquake started","lift is shaking","should I take the lift after a quake","elevator or stairs during an earthquake"],"a":["Avoid elevators during and after an earthquake. If you're already inside one when the shaking starts, press all the floor buttons and get out at the first opportunity, then use the stairs. If you're stuck, use the emergency call button and wait for help."]},{"i":"doorway","c":"during","q":["is standing in a doorway safe","should I stand in a doorway during an earthquake","is it better to hide in a doorway","do doorways protect you in an earthquake","stand under the door frame"],"a":["That's an old tip. Current guidance is Drop, Cover and Hold On. Doorways are not reliably stronger than the rest of the building and don't protect you from falling objects. Get under a sturdy table or desk instead."]},{"i":"during_mobility","c":"during","q":["I use a wheelchair or have limited mobility during an earthquake","I cannot get on the floor during an earthquake","I use a walker what do I do in a quake","my parent is in a wheelchair and there is an earthquake","I am elderly and cannot drop to the ground","my mother uses a walking frame and the building is shaking","a disabled person is with me during shaking","my senior citizen parent cannot get down on the floor","someone in a mobility scooter during a quake","I am on crutches and the ground is shaking"],"a":["Lock your wheels if you're in a wheelchair, bend forward and cover your head and neck with your arms, a bag or a book, and stay where you are until the shaking stops. If you can't get to the floor, protect your head and neck as best you can. Move away from windows and tall furniture if you can do it safely."]},{"i":"during_highrise","c":"during","q":["I am on a high floor during an earthquake","I live in an apartment tower and it is shaking","I am on the 10th floor and there is an earthquake","the tall building is swaying","should I run down the stairs from my flat","earthquake in a high rise","I am in a skyscraper and it is swaying","tall building is swaying badly what do I do","I am on the 20th floor and the building sways"],"a":["Drop, cover and hold on where you are, away from windows and balcony doors. Swaying in tall buildings is normal and expected. Don't run for the stairs or use the lift while it's shaking. Alarms and sprinklers may go off. Once it stops, leave via the stairs if the building is damaged or there is a fire or gas smell."]},{"i":"during_crowd","c":"during","q":["I am in a mall during an earthquake","earthquake in a cinema or theatre","I am in a stadium or crowded place and the ground is shaking","I am at a concert when a quake hits","earthquake at the market","I am in a supermarket and it is shaking","should I run to the exit in a crowd","I am in a busy public place and people are panicking","people are stampeding at the mall during a quake","huge crowd rushing to the exit during the shaking","we are in a hall full of people and it is shaking","I am in a restaurant full of people during a tremor","we are in a shopping mall and everyone is running","I am in a shopping centre and the earthquake started","crowded place and people are panicking during the quake","we are in a cinema theatre and it is shaking","at a market and the ground is shaking"],"a":["Drop, cover your head and neck (use your arms or a bag) and hold on right where you are, away from shelves, glass and hanging signs. Don't rush toward exits - crowd crushes injure people in quakes. When the shaking stops, leave calmly via stairs and keep walkways clear."]},{"i":"during_school_work","c":"during","q":["I am at school during an earthquake","I am in class and it is shaking","I am a teacher what do I tell students during a quake","earthquake at my office","I am at my desk and the building is shaking","earthquake in a classroom","my students are in the classroom and the walls are trembling","I am a teacher and the building is shuddering","kids in my class and it is shaking","I am in a meeting room and the building is shaking","staff at my workplace are panicking during a tremor","my child is at school and the building is rumbling","I am at the office and the building is shaking","we are in a classroom and it started shaking"],"a":["Get under your desk or a sturdy table, cover your head and neck and hold on. Teachers: calmly call out 'Drop, cover, hold on', and keep students away from windows and lights. When the shaking stops, evacuate in an orderly way via stairs to the open assembly area and take a head count."]},{"i":"during_mountains","c":"during","q":["I am hiking and there is an earthquake","earthquake in the mountains","I am on a hillside during a quake","landslide after earthquake","falling rocks during shaking","I am near a cliff when the ground shakes","I am on a hill and the ground is shaking","hiking on a slope and the earth is shaking"],"a":["Move away from steep slopes, cliffs and loose rock if you can, then drop and protect your head. Expect rockfalls and landslides during and after the shaking. Afterwards, avoid slopes, stream beds and damaged trails, and move to stable open ground."]},{"i":"during_rooms","c":"during","q":["I am in the kitchen during an earthquake","earthquake while cooking","I am in the bathroom when it starts shaking","I am in the shower during an earthquake","I am in the living room and the TV is shaking","quake while I am on the toilet","I was cooking when the shaking began","I am in the kitchen and it is shaking","I am in the bathroom during an earthquake","I am in the shower and the earth is shaking"],"a":["Don't try to run through the house. Drop, cover your head and neck and hold on where you are, away from glass, mirrors, cabinets and heavy objects that can fall. In the kitchen, step away from the stove and tall shelves. Afterwards, turn off the stove and check for gas smells."]},{"i":"during_transit","c":"during","q":["I am on a train during an earthquake","earthquake in the metro","I am on a bus when the ground shakes","I am on a bridge during a quake","earthquake in a tunnel","I am on a flyover and it is shaking"],"a":["On a train, bus or metro, hold on firmly, stay seated or crouch low, and stay put until it stops - follow the crew's instructions. On a bridge or flyover, stop if you're driving and stay in the vehicle; don't walk on the structure afterwards if it's damaged. Don't enter a tunnel after strong shaking."]},{"i":"during_pregnant_baby","c":"during","q":["I am pregnant and there is an earthquake","I am holding my baby during an earthquake","earthquake with a newborn","I have a toddler with me and it is shaking","what to do with a baby in a quake"],"a":["Get low and cover your head and neck, and protect your belly or your baby with your body. Hold on until the shaking stops. Afterwards, if you are pregnant and have pain, bleeding or reduced baby movement, or your child seems hurt, get medical help."]},{"i":"after_general","c":"after","q":["what should I do after an earthquake","earthquake is over what now","the shaking stopped","the quake just ended what next","what to do right after the shaking stops","first steps after a quake"],"a":["Check yourself and others for injuries and give first aid. Put on sturdy shoes, and check for hazards such as gas leaks, damaged wiring and fires. Expect aftershocks (Drop, Cover and Hold On again). Use text messages instead of calls to keep lines free, and follow official updates."]},{"i":"gas_leak","c":"after","q":["I smell gas after an earthquake","gas leak","smells like gas in my house","should I turn off the gas","LPG cylinder leaking after quake","hissing sound from the gas pipe","there is a gas odour in the kitchen","I can smell cooking gas","the cylinder is leaking","rotten egg smell in the house","smell of propane after the quake","there is a strong smell of fuel indoors"],"a":["Don't use flames, light switches, phones or electronics inside. Open windows, shut off the main gas valve only if you know how and it's safe, leave the building and call for help from outside."]},{"i":"aftershocks","c":"after","q":["what are aftershocks","will there be more shaking","another tremor just happened","is there going to be a second earthquake","how long do aftershocks last","I feel small tremors again"],"a":["Aftershocks are smaller quakes that follow the main shock and can go on for days or weeks. Some are strong enough to damage weakened buildings, so treat each one with Drop, Cover and Hold On and stay out of damaged structures."]},{"i":"tsunami","c":"after","q":["tsunami warning","I am near the coast after an earthquake","will there be a tsunami","the sea is pulling back","I live by the beach and felt strong shaking","the water level is dropping at the shore","is there a tsunami risk after this earthquake","I am at the beach and the ground shook hard","should I run away from the sea after the shaking","the ocean went out suddenly","we live on the coast and the shaking lasted over a minute","long strong shaking near the sea what should we do","I live near the beach and felt a big quake"],"a":["If you're near the coast and feel strong or long shaking, or get an official warning, move immediately to high ground or inland - don't wait for an alert. Don't go down to watch the sea. Stay away until authorities say it's safe, because waves can keep coming for hours."]},{"i":"trapped","c":"after","q":["I am trapped under rubble","help I am buried","I am stuck under debris","something heavy fell on me and I cannot move","I am trapped in a collapsed building","my family is trapped under the house","my leg is pinned under debris","I am pinned under a beam","stuck under a fallen wall","I cannot free myself from the rubble","a slab fell on my leg","there is concrete on top of me"],"a":["Try not to move around and kick up dust. Cover your mouth with cloth, tap on a pipe or wall or use a whistle instead of shouting, so you save your energy, and don't light matches. Call your local emergency number if you can. Rescuers are looking for you."]},{"i":"water_safety","c":"after","q":["is tap water safe after an earthquake","drinking water after quake","can I drink the water now","water looks cloudy after the earthquake","how to purify water in an emergency"],"a":["Pipes may be damaged or contaminated. Use stored water until authorities confirm the tap water is safe, and boil it (rolling boil for a minute or so) or treat it if you have no other option."]},{"i":"power_out","c":"after","q":["the power is out after an earthquake","no electricity","blackout after quake","should I use candles","can I run a generator indoors","there are sparks from the wires","downed power lines outside","electric wires fell on the road","live wires hanging on the street","cables sparking on the pole","electricity lines snapped after the quake","no power since the quake","there is no electricity after the earthquake","lights are out after the quake","current has gone after the earthquake"],"a":["Use flashlights instead of candles, keep the fridge closed, unplug appliances and only run generators outdoors, well away from windows, because of carbon monoxide. Stay far from fallen or sparking power lines and report them."]},{"i":"food_safety","c":"after","q":["is the food in my fridge safe after a power cut","how long does food last without electricity","should I throw away food after the earthquake","frozen food thawed","is my milk still good after the blackout","can I eat the food from the fridge after the outage","meat in the freezer thawed after no power for hours","is cooked food safe after the electricity went out","how do I keep food from spoiling when there is no electricity","will my food go bad without power"],"a":["A closed fridge keeps food cold for about 4 hours, a full freezer for roughly a day. Discard perishable food that has been above cold temperature for more than a couple of hours, and when in doubt, throw it out."]},{"i":"building_damage","c":"after","q":["can I go back inside my house","there are cracks in my wall after the earthquake","is my building safe after the earthquake","my house is leaning","should I stay inside after the quake","cracks in the ceiling and floor","when can I return home","is it safe to enter my cracked home","the walls have big cracks can I go inside","is the house safe to go in","my building tilted after the quake","the ceiling has a crack can we stay"],"a":["Don't re-enter if you see a leaning structure, large or widening cracks, a sagging roof or floor, a gas smell or flooding. Even if it looks fine, aftershocks can bring weakened parts down. Wait for a qualified engineer or the local authority to inspect it. Small hairline plaster cracks are common but should still be checked."]},{"i":"fire","c":"after","q":["there is a fire after the earthquake","smoke in the building","my neighbour's house is on fire","something is burning after the quake","sparks and fire from a wire","flames are coming from a building nearby","there is a blaze next door","the house across the road is burning","I see fire and smoke after the shaking","gas fire after an earthquake"],"a":["Get out fast, staying low under the smoke, and don't use elevators. Call your local emergency number from outside. If the fire is small and you know how, use an extinguisher, but never risk being cut off from the exit."]},{"i":"first_aid","c":"after","q":["someone is bleeding","my friend is unconscious","I think someone has a broken bone","how do I help an injured person after the quake","a person is not breathing","he is hurt and not moving","there is a person with a head injury","my neighbour is unconscious","a person is lying still and not responding","he fell and is bleeding badly","someone has a deep cut","I think her arm is broken","somebody is injured and in pain"],"a":["Call your local emergency number first if you can. For bleeding, press firmly on the wound with a clean cloth and keep pressing. Don't move someone with a suspected neck, back or head injury unless there is immediate danger. If a person isn't breathing and you're trained, start CPR."]},{"i":"contact_family","c":"after","q":["how do I contact my family after an earthquake","phone lines are jammed","I cannot reach my parents","how can I tell people I am safe","network is down after the quake","where is my family","I can't get a call through to my mother","calls are not connecting to my relatives","no signal to call my parents","how do I find out if my kids are safe","I can't phone my family"],"a":["Send text messages or use data-based apps instead of calling - voice lines jam quickly. Use a 'mark safe' feature if you have one, and contact your out-of-area contact so they can pass news around. Keep calls short and save your battery."]},{"i":"evacuate","c":"after","q":["should I evacuate","where should I go after an earthquake","do I need to leave my home","should we stay in the building","is it safe to stay home after the quake","where is the nearest shelter","do we need to move out of the building","is it time to leave our apartment","should we go to a shelter","should we sleep outside tonight","should I leave my flat now","do we need to go to a relief camp"],"a":["Leave if your building is damaged, there is a gas smell or fire, you're in a tsunami or landslide zone, or the authorities tell you to. Take your emergency kit, documents and medicines, and head for an open area or the official shelter. If your home is undamaged, staying put is often safest."]},{"i":"emergency_kit","c":"prepare","q":["what should be in an emergency kit","emergency supplies checklist","go bag","what to pack for an earthquake","how much water should I store","list of things to keep for a disaster","what is expected in an earthquake kit for 4 people","what should be in a kit for our family of five","kit for my family","how much water and food should we store for a family"],"a":["Water (about 4 litres / 1 gallon per person per day for at least 3 days), non-perishable food, a flashlight, battery or hand-crank radio, a first-aid kit, spare batteries, a power bank, a whistle, essential medicines, copies of documents, some cash, sturdy shoes and masks."]},{"i":"family_plan","c":"prepare","q":["how do I make a family emergency plan","family earthquake plan","where should we meet after an earthquake","how to prepare my family for a quake","emergency contact plan for family"],"a":["Pick meeting spots inside and outside your home, choose an out-of-area contact, make sure everyone knows how to shut off gas, water and electricity, practise drills twice a year and add emergency contacts in the app."]},{"i":"home_safety","c":"prepare","q":["how can I make my home safer","earthquake proof my house","how to secure furniture","what to fix at home before an earthquake","where should I keep heavy things","how do I secure my water heater or gas cylinder","how do I stop my bookcase from toppling","how to keep shelves from falling during a quake","how to fasten a wardrobe to the wall","what should I do about my heavy furniture and tv","keep objects from falling in my flat","secure my cupboard"],"a":["Anchor tall furniture and the water heater to walls, store heavy items low, move hanging objects and heavy frames away from beds and seats, know where your shutoff valves are and use flexible gas connectors."]},{"i":"renting","c":"prepare","q":["I rent my flat what can I do to prepare","I cannot drill into the walls","how to secure things as a tenant","I live in a rented apartment is there anything I can do","I am a tenant so I cannot drill into walls what can I do","landlord does not allow drilling holes how to secure furniture"],"a":["Use non-damaging options: museum putty or adhesive straps for small items, tension or strap kits for tall furniture (ask your landlord before drilling), put heavy things low, keep your bed away from windows and heavy shelves, and keep your kit and shoes by the bed."]},{"i":"kids_pets","c":"prepare","q":["what should I do about children and pets in an earthquake","how do I prepare my kids for earthquakes","how do I keep my dog safe in a quake","teach children what to do in an earthquake","pets and earthquakes","how can I protect my dog in an earthquake","what about my cat during a quake","pet safety in an earthquake","my dog gets scared in tremors","what should I do with my animals","how do I keep my pets calm during a quake"],"a":["Teach children to drop, cover and hold on as a game, and practise it. Keep them close during shaking. For pets, keep carriers, leashes, food and records near your emergency kit - frightened animals may bolt, so keep them leashed or contained afterwards."]},{"i":"drills","c":"prepare","q":["how often should we practise earthquake drills","how do I run an earthquake drill","earthquake drill at home","what is drop cover hold on","how to practice drop cover and hold on","how do we rehearse for a quake","how should my family practise for an earthquake","how to train for earthquakes","earthquake safety exercise at home","how do I practise for an earthquake at work"],"a":["Practise at least twice a year at home, school and work: Drop to your hands and knees, Cover your head and neck under a sturdy table, Hold On to it and shuffle with it if it moves. Time yourselves and talk through what to do afterwards."]},{"i":"elderly_disability_prep","c":"prepare","q":["how do I prepare my elderly parents for an earthquake","emergency plan for someone with a disability","I am blind or deaf how can I prepare","medicines for my grandparents in an emergency","prepare for a person who uses oxygen","how do I keep my elderly parents ready for disasters","preparing old parents for an earthquake","my grandparents are old how do we prepare","help my elderly mother prepare for earthquakes"],"a":["Keep at least a week of essential medicines and copies of prescriptions, spare glasses, hearing-aid batteries and mobility aids with your kit. Arrange a nearby 'buddy' who can check on you, plan accessible exit routes, and tell local emergency services about any equipment that needs power."]},{"i":"documents","c":"prepare","q":["how do I protect important documents","what documents should I keep ready","should I keep copies of my IDs","scan documents for a disaster"],"a":["Keep copies of IDs, insurance, property papers and medical records in a waterproof pouch in your go bag, and store digital copies in a secure cloud account or on an encrypted drive that a trusted person can also access."]},{"i":"building_check","c":"prepare","q":["is my building earthquake safe","how do I know if my home is earthquake resistant","what is retrofitting","should I get my house inspected","will my old building survive an earthquake","how safe is my apartment","can an engineer inspect if my flat would hold up in a big quake","would my building collapse in a strong earthquake","who can assess whether my house is safe from quakes","how can I find out if my building is quake resistant","is my old house structurally safe","how safe is a 20 year old concrete building in a quake","is my old building safe in an earthquake","is my apartment earthquake proof","is a concrete building safer than brick"],"a":["I can't judge a specific building. A licensed structural engineer can assess it and recommend retrofitting. Older masonry and buildings without proper reinforcement are generally more vulnerable, so ask for an inspection and check against local building codes."]},{"i":"magnitude_intensity","c":"science","q":["what is magnitude","magnitude vs intensity","difference between magnitude and intensity","what does MMI mean","what is the mercalli scale"],"a":["Magnitude measures the energy released at the source and is one number per earthquake. Intensity (such as the Modified Mercalli scale) describes shaking and damage at a particular place and changes with distance, depth and ground conditions."]},{"i":"richter","c":"science","q":["what is the richter scale","is richter scale still used","how much stronger is magnitude 7 than 6","how do magnitudes compare","how many times more powerful is a magnitude 7 than a 6","what is the energy difference between magnitudes","is every magnitude step ten times stronger","how much bigger is a 8 than a 7"],"a":["Seismologists now mostly use the moment magnitude scale, which replaced the Richter scale for large quakes. It's logarithmic: each whole number is about 10 times larger in wave amplitude and roughly 32 times more energy."]},{"i":"how_strong","c":"science","q":["how bad is a magnitude 6 earthquake","what does a magnitude 5 feel like","is magnitude 4 dangerous","can a magnitude 3 earthquake cause damage","how strong is a 7.0","is a 5.5 earthquake serious","how dangerous is a 6.2 quake","is a magnitude 4.5 big","what damage does a 6.5 do","is a 3.8 quake worth worrying about","what does magnitude 7 mean","how bad is a magnitude 6 earthquake"],"a":["Roughly: below M3 is rarely felt, M4 is felt indoors with little damage, M5 can damage weak buildings, M6 can cause serious damage near the epicentre, and M7+ is a major quake. Real impact depends a lot on depth, distance, ground and building quality."]},{"i":"early_warning","c":"science","q":["how does earthquake early warning work","how does the app detect earthquakes","how do you know an earthquake is coming","how do the phones sense the quake","what is an earthquake alert","how do p waves help alerts","how does the system send an alert before the shaking","what technology is behind the alerts","how do alerts get sent so fast","how does the phone warn me before the quake arrives","how do p waves help the app warn people"],"a":["Early warning detects the fast, weaker P-waves that arrive before the damaging S-waves, confirms them across multiple sensors and sends alerts. Warning time is usually seconds, depending on how far you are from the epicentre."]},{"i":"prediction","c":"science","q":["can earthquakes be predicted","can you tell when an earthquake will happen","will there be an earthquake tomorrow","when is the next big earthquake","is a big earthquake coming","can you predict earthquakes with AI","is there any way to know in advance if a quake is coming","can anyone foresee earthquakes","is a quake going to hit soon","can we forecast earthquakes","is there a method to know an earthquake is about to strike","can seismologists predict the next big one","can scientists predict earthquakes","is it possible to forecast earthquakes"],"a":["No. Nobody can reliably predict when or where an earthquake will strike - not scientists, not AI, not this app. Early warning detects a quake that has already started, and preparedness is the best protection."]},{"i":"warning_time","c":"science","q":["how much warning time will I get","how many seconds of warning","how early will the alert come","will I get an alert before the shaking","how long do I have to react"],"a":["It ranges from a few seconds to tens of seconds for distant quakes. Close to the epicentre there may be little or none, but even a few seconds is enough to drop, cover and hold on."]},{"i":"p_s_waves","c":"science","q":["what are P waves and S waves","what is a p-wave","difference between primary and secondary waves","which wave is more damaging","what is the difference between p and s waves","p waves versus s waves"],"a":["P-waves are faster, compressional waves that usually shake less. S-waves arrive later and move the ground side to side or up and down, causing most of the damage. Early warning uses the gap between them."]},{"i":"foreshock","c":"science","q":["are small tremors a sign of a bigger earthquake","I felt a small quake will a big one follow","what is a foreshock","does a small earthquake release the pressure","should I worry after a minor tremor","I felt a small tremor should I worry that a larger quake follows","does a minor quake mean a major one is coming","could the tremor today be a warning of a big earthquake","is a little tremor a sign of something bigger"],"a":["Most small quakes are not followed by a larger one, but a few are - and a quake only gets called a 'foreshock' in hindsight. It's no reason to panic, but it's a good prompt to check your kit and plan. Small quakes don't reliably 'release' enough energy to prevent a big one."]},{"i":"why_quakes","c":"science","q":["why do earthquakes happen","what causes earthquakes","what are tectonic plates","what is a fault line","what is the epicentre","what makes the ground shake","what causes the earth to move","how are earthquakes formed","why does the earth tremble","where do earthquakes come from","what is the difference between epicentre and focus","what is the epicentre of an earthquake","what is the focus or hypocentre"],"a":["Earth's outer shell is split into tectonic plates that slowly move. Stress builds up along faults and is released suddenly as seismic waves - an earthquake. The point where it starts underground is the focus; the point directly above on the surface is the epicentre."]},{"i":"quake_myths","c":"science","q":["do animals sense earthquakes","does hot weather cause earthquakes","is earthquake weather real","can dogs predict earthquakes","are there signs before an earthquake","does the moon cause earthquakes","do cats and dogs sense earthquakes before they happen","can animals warn us of a quake","does unusual behaviour in pets mean an earthquake is coming","do birds act weird before earthquakes","is there any warning sign before a quake"],"a":["There's no reliable evidence that animal behaviour, weather or the Moon can predict earthquakes. Don't count on warning signs - rely on preparedness and official alerts."]},{"i":"area_risk","c":"science","q":["is my city at risk of earthquakes","which areas are earthquake prone","what seismic zone am I in","how risky is my area","is there a fault near me","earthquake hazard map","does my region get earthquakes","how likely is a big quake where I live","is my town on a fault line","which seismic zone is my area in"],"a":["Open the AI Seismic Predictor page and enter your fault distance, depth and soil type to get a 0-100 hazard index. It's a formula-based estimate, not an official reading. For your exact seismic zone, check the national seismology agency's hazard map or your local building code. For reference, Coimbatore and most of Tamil Nadu sit in lower-to-moderate seismic zones, while the Himalayan belt, Gujarat and the north-east are higher."]},{"i":"live_quake_info","c":"science","q":["was that an earthquake","did I just feel an earthquake","was there an earthquake just now","where was the earthquake","what was the magnitude of today's earthquake","any earthquake today","did the ground just shake","is there an earthquake near me","earthquake just happened where","where did the quake hit","how strong was the earthquake that just happened","was it a big one","what was that shaking","is there an earthquake right now somewhere","was there a quake a minute ago","was there an earthquake just now","did an earthquake just happen near me","was that an earthquake"],"a":["I can't confirm a live quake while offline. The Live Map shows the last earthquake feed it downloaded, so open it to see those entries. If you felt strong shaking, treat it as real: Drop, Cover and Hold On, then check for hazards and expect aftershocks. Your national seismology agency has the official word once you have a connection."]},{"i":"notifications_off","c":"app","q":["notifications not working","how do I turn on alerts","I did not get an alert","the app did not warn me","why am I not receiving notifications","alerts are silent","no alert came when the quake hit","I never got a warning on my phone","my phone did not buzz when the quake hit","the app gave me no warning","I received no alert at all","alerts not coming through on my phone","no earthquake alert reached me"],"a":["Allow notifications and location for this site in your browser's site settings, and turn off battery saver or Do Not Disturb for the browser. Install the app (the browser's 'Install' option) so it can run in the background, and open it once while online so it caches properly."]},{"i":"report_felt","c":"app","q":["I felt shaking how do I report it","report an earthquake","how do I submit a felt report","where do I say I felt the quake"],"a":["Open the Community Reports page and submit a report: where you are, what you felt and how strong it was. Reports are stored on your device and shown in the citizen feed, and they sync when you're back online."]},{"i":"false_alarm","c":"app","q":["I got a false alert","the app sent an alert but nothing happened","why did I get an alarm without shaking","the alert was wrong","false alarm from the app","I got an alert but felt nothing","the app sent me a warning for no reason","got a warning but there was no earthquake","alert came but nothing happened"],"a":["Sorry about that. Alerts can arrive for a quake that's far away or weaker where you are, so you may feel little or nothing. If you do get one, dropping and covering costs nothing. You can note it on the Community Reports page."]},{"i":"battery","c":"app","q":["does the app drain my battery","battery usage of the app","will this app kill my phone battery","why is the app using so much battery"],"a":["Motion sensing and live maps use some battery. To reduce it, pause the globe's auto-rotation, close the Live Map when you don't need it, and turn on your phone's battery saver. The built-in offline map is lighter than live tile maps."]},{"i":"privacy_data","c":"app","q":["what data do you collect","do you track my location","is my data safe","who can see my location","do you sell my data","how is my privacy protected","delete my data","do you store my personal info","do you keep my personal information","do you save my chats","what personal information do you store"],"a":["Everything stored by this app, such as reports, family circle entries and cached map areas, lives in your browser on your device. Clear it from your browser's site data settings. For anything beyond that, read the Privacy Policy you were given with the app."]},{"i":"contacts_app","c":"app","q":["how do I add emergency contacts","add family to the app","how to share my status with my family","set up emergency contacts in the app"],"a":["Open the Family Safety Circle on the home dashboard to mark yourself safe and share your status with family. If networks are down, the Offline Messaging Center can pass messages to nearby devices."]},{"i":"accuracy","c":"app","q":["how accurate are the alerts","can the alert be wrong","will it miss an earthquake","how reliable is earthquake early warning","what is the false alarm rate","could an alert fail to arrive","might the system miss a quake","what if the alert does not come","are alerts always on time","can the warning not go off sometimes","how often are the alerts missed"],"a":["Early warning is fast but not perfect. Magnitude and location estimates improve over the first few seconds, alerts may be late or absent close to the epicentre, and occasionally a false or missed alert happens. Treat it as an extra few seconds, not a guarantee."]},{"i":"offline","c":"app","q":["does it work without internet","will the app work if the network is down","do I need data for alerts","does the app work offline"],"a":["Yes. QuakeGuard keeps working without internet: the safety assistant answers from a built-in knowledge base, the Offline Map and Offline Globe draw from data stored in the app, and the Offline Messaging Center can pass messages between nearby devices. Open the app once while online so everything gets cached. Keep a battery radio and a printed copy of the Drop, Cover, Hold On steps as a backup."]},{"i":"cost_support","c":"app","q":["is the app free","how much does it cost","I want to talk to a human","contact support","how do I reach customer care","I want to give feedback about the app","report a bug"],"a":["I don't have pricing or support contact details offline. Please use the contact option provided by whoever gave you this app."]},{"i":"languages","c":"app","q":["do you speak hindi","can you reply in tamil","is the app available in other languages","can you talk in spanish","change language","does the app work in hindi","does the app work in tamil","do you support tamil","can I use this app in hindi"],"a":["The app and this assistant work in English, Tamil (தமிழ்) and Hindi (हिंदी). Use the language switcher at the top of the page. For urgent help, call your local emergency number."]},{"i":"greeting","c":"chat","q":["hi","hello","hey","hey there","good morning","good evening","hii","hello bot","yo","namaste","hi there anyone here","sup","good afternoon","good day","hello there","greetings","hey hey","howdy","hiya","morning","evening","afternoon"],"a":["Hi! I'm Quake Guard's safety assistant. Ask me what to do during or after an earthquake, how to prepare, or how the app works.","Hello! I can help with earthquake safety and preparedness. What would you like to know?","Hey there. If you're in an emergency, tell me what's happening. Otherwise ask me anything about earthquake safety."]},{"i":"how_are_you","c":"chat","q":["how are you","how are you doing","how is it going","whats up","how do you do","are you ok"],"a":["I'm doing fine, thanks for asking. I'm here for earthquake safety questions whenever you need.","All good on my side! How can I help you stay prepared?"]},{"i":"thanks","c":"chat","q":["thanks","thank you","thank you so much","thanks a lot","thx","ty","that helped thanks","cheers","appreciate it","thank u"],"a":["You're welcome. Stay safe!","Glad that helped. Ask me anytime.","Happy to help - and a little preparation goes a long way."]},{"i":"goodbye","c":"chat","q":["bye","goodbye","see you later","talk to you later","gotta go","good night","ok bye","cya","have a good night","I am leaving now","that is all bye","signing off","until next time","see ya","see you","see you later","cya","later","talk to you later","ok bye"],"a":["Take care and stay safe!","Goodbye. Keep your emergency kit handy.","Bye for now - I'll be here if you need me."]},{"i":"who_are_you","c":"chat","q":["who are you","what are you","are you a robot","are you a human","what is your name","are you an AI","are you real"],"a":["I'm an automated safety assistant in the Quake Guard app, not a person. I answer from earthquake-safety guidance written by the team, so I can't give medical, legal or engineering advice."]},{"i":"capabilities","c":"chat","q":["what can you do","what can I ask you","what do you know","how can you help me","what topics do you cover","help menu","what are your features"],"a":["I can help with: what to do during and after an earthquake, preparing your home, family and emergency kit, how early warning and magnitudes work, and how to use the app. I can't predict earthquakes or give live quake data."]},{"i":"ack","c":"chat","q":["ok","okay","cool","got it","alright","fine","understood","I see","noted","makes sense","k","oh ok","right","ok great","alright then","sure","yes","yeah","no","nope","perfect","great","nice","sounds good","fair enough","good to know","I will do that","will do"],"a":["Okay. Ask me anything else about earthquake safety.","Got it. Anything else I can help with?","Sounds good."]},{"i":"compliment","c":"chat","q":["you are great","good bot","nice job","you are so helpful","awesome","love this app","well done","this is useful","you did well","well said","great answer","excellent","brilliant","good job","that was really clear","super helpful","you are the best","thats a good answer"],"a":["Thank you, that's kind. I'm glad it's useful!","Thanks! Staying prepared is the real win."]},{"i":"frustration","c":"chat","q":["this is useless","you are not helping","you did not answer my question","that is wrong","you are stupid","worst bot ever","that makes no sense","not what I asked","this app sucks","i hate this","this is rubbish","so annoying","wow terrible","ugh","you suck","useless bot","not helpful at all","what a waste of time","that was not helpful","you keep giving the same answer"],"a":["Sorry I missed the mark. Could you rephrase or give me a bit more detail, for example whether it's during or after a quake, or about preparing or the app? For urgent help, call your local emergency number.","I'm sorry about that. Tell me again what you need in a few words and I'll try again."]},{"i":"scared_anxious","c":"chat","q":["I am scared of earthquakes","I am so anxious about earthquakes","I cannot sleep since the earthquake","I keep feeling shaking even when nothing is happening","earthquakes terrify me","I am worried about my family","I am afraid another one will come","I have a fear of earthquakes","I feel so stressed about the tremors","I get panicky when I feel vibrations","any vibration makes me jump","I am so jumpy since the quake","I panic with every rumble","even a passing truck makes me think its a quake","I cannot relax since the tremor","I get nervous even at small tremors","I am anxious about earthquakes","even a small shake makes me panic","I am afraid of earthquakes"],"a":["That makes sense - earthquakes are frightening, and feeling on edge afterwards is common. Try slow breathing: in for 4 counts, out for 6, a few times. Doing something concrete helps too, like packing a kit or making a family plan. If the worry stays strong or affects your sleep and daily life, talking to someone you trust or a health professional can help.","You're not alone in feeling this way. A few slow breaths can settle your body, and a simple plan - a kit, a meeting spot, a drill - can bring back a sense of control. If it keeps getting worse, please consider reaching out to a doctor or counsellor."]},{"i":"out_of_scope","c":"chat","q":["best pizza recipe","tell me a joke","what is the weather today","who won the football match","write me a poem","what is 25 times 17","how do I learn python","who is the prime minister","what is the stock price of apple","recommend a movie","translate this sentence","what is the capital of france","sing a song","play music","book a flight","news today","what time is it","order food","tell me about football","how do I bake a cake","what is the meaning of life","recommend a good laptop","best phone to buy","who is the best cricketer","how do I lose weight","give me a recipe for biryani","tell me a story","explain quantum physics","help me with my homework","write an essay on climate","how to make tea","suggest some movies","is it going to rain tomorrow","what is bitcoin","how do I fix my car","who invented the telephone","translate hello into french","what is the population of india","how do I get a job","tell me about the moon landing","how do I cook rice","what should I name my puppy","do you like music","what is your favourite colour","help me write a cv","what is love","how to invest in shares","tell me something interesting","solve this maths problem","who is the richest man","what is the best programming language","how to start a business","what is the best way to cook pasta","how do I bake a cake","give me a recipe for rice","tell me a joke","who won the cricket match","how many times does the earth shake in a year","what is the stock market doing"],"a":["That's outside what I can help with - I focus on earthquake safety and the Quake Guard app. You can ask me about what to do during or after a quake, preparing your home, or how the alerts work.","I'm built just for earthquake safety questions, so I can't help with that one. Try asking me about emergency kits, drills or what to do when the ground shakes."]}];

  // ------------------------------------------------------------------ text features
  const norm = s => String(s || '').toLowerCase().replace(/[\u2018\u2019`]/g, "'").replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();

  function feats(text) {
    const words = norm(text).split(' ').filter(Boolean);
    const w = new Map(), c = new Map();
    const add = (m, k) => m.set(k, (m.get(k) || 0) + 1);
    words.forEach((t, i) => { add(w, t); if (i) add(w, words[i - 1] + ' ' + t); });
    words.forEach(t => {
      const p = ' ' + t + ' ';
      for (let n = 3; n <= 5; n++) for (let i = 0; i + n <= p.length; i++) add(c, p.substr(i, n));
    });
    return { w, c };
  }

  const N = OFFLINE_KB.reduce((a, r) => a + r.q.length, 0);
  const docs = [];                 // {intent, w:Map, c:Map}
  const dfW = new Map(), dfC = new Map();
  OFFLINE_KB.forEach(r => r.q.forEach(q => {
    const f = feats(q);
    docs.push({ intent: r.i, f });
    f.w.forEach((_, k) => dfW.set(k, (dfW.get(k) || 0) + 1));
    f.c.forEach((_, k) => dfC.set(k, (dfC.get(k) || 0) + 1));
  }));
  const idf = (df, k) => Math.log((1 + N) / (1 + (df.get(k) || 0))) + 1;

  function vec(map, df) {
    const v = new Map(); let n = 0;
    map.forEach((tf, k) => { const x = (1 + Math.log(tf)) * idf(df, k); v.set(k, x); n += x * x; });
    n = Math.sqrt(n) || 1;
    v.forEach((x, k) => v.set(k, x / n));
    return v;
  }
  // inverted indexes for fast dot products
  const invW = new Map(), invC = new Map();
  docs.forEach((d, i) => {
    d.vw = vec(d.f.w, dfW); d.vc = vec(d.f.c, dfC);
    d.vw.forEach((x, k) => { if (!invW.has(k)) invW.set(k, []); invW.get(k).push([i, x]); });
    d.vc.forEach((x, k) => { if (!invC.has(k)) invC.set(k, []); invC.get(k).push([i, x]); });
    delete d.f;
  });

  function similarities(text) {
    const f = feats(text), qw = vec(f.w, dfW), qc = vec(f.c, dfC);
    const sw = new Float32Array(docs.length), sc = new Float32Array(docs.length);
    qw.forEach((x, k) => { const l = invW.get(k); if (l) for (const [i, y] of l) sw[i] += x * y; });
    qc.forEach((x, k) => { const l = invC.get(k); if (l) for (const [i, y] of l) sc[i] += x * y; });
    return docs.map((d, i) => ({ intent: d.intent, s: 0.5 * sw[i] + 0.5 * sc[i] }));
  }

  // Score each intent by its best phrasing, nudged by its 2nd best (rewards agreement)
  function rank(text) {
    const best = new Map(), second = new Map();
    similarities(text).forEach(({ intent, s }) => {
      const b = best.get(intent) || 0;
      if (s > b) { second.set(intent, b); best.set(intent, s); }
      else if (s > (second.get(intent) || 0)) second.set(intent, s);
    });
    return [...best.entries()].map(([intent, b]) => ({ intent, score: b + 0.15 * (second.get(intent) || 0) }))
      .sort((a, b) => b.score - a.score);
  }

  const BY_INTENT = Object.fromEntries(OFFLINE_KB.map(r => [r.i, r]));
  const lastVariant = {};
  function pickAnswer(intent) {
    const a = BY_INTENT[intent].a;
    if (a.length === 1) return a[0];
    let i; do { i = Math.floor(Math.random() * a.length); } while (i === lastVariant[intent] && a.length > 1);
    lastVariant[intent] = i; return a[i];
  }

  const T_SURE = 0.50, T_OK = 0.30, T_ASK = 0.20;
  const URGENT_RE = /\b(trapped|bleeding|unconscious|not breathing|can'?t breathe|cannot breathe|heart attack|buried|collapsed on|stuck under|going to die|dying|on fire|not moving|head injury|broken (?:bone|leg|arm))\b/i;
  const URGENT_MSG = 'If someone is in immediate danger, call your local emergency number right now (India 112 or 108, Japan 119, US 911). ';
  const FALLBACK = "I'm not sure about that one. Could you rephrase it? I can help with what to do during or after an earthquake, shelters, emergency kits, tsunami and gas-leak safety, first aid, magnitude and warning-time questions, and the quake database. For urgent help call your local emergency number.";
  const EMO = {
    worry: /\b(worried|anxious|nervous|afraid|stress\w*|can'?t sleep|scared)\b/i,
    angry: /\b(useless|stupid|hate|rubbish|sucks|terrible)\b/i
  };
  const LEAD = { worry: "That sounds stressful, and it's okay to feel that way. ", angry: 'Sorry this is not going well. ' };

  function classify(text) {
    const r = rank(text);
    const top = r[0] || { intent: 'out_of_scope', score: 0 }, sec = r[1] || { score: 0 };
    return { ranked: r, top, margin: top.score - sec.score };
  }

  const api = { _classify: classify, _norm: norm, KB: OFFLINE_KB, T: { T_SURE, T_OK, T_ASK }, URGENT_RE, URGENT_MSG, FALLBACK, EMO, LEAD, pickAnswer, BY_INTENT };
    // ======================================================================== tools
  const hasNav = typeof navigator !== 'undefined';
  const RAD = Math.PI / 180;
  const hav = (a, b, c, d) => {
    const dLat = (c - a) * RAD, dLon = (d - b) * RAD;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * RAD) * Math.cos(c * RAD) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };
  const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
  const compass = (a, b, c, d) => {
    const y = Math.sin((d - b) * RAD) * Math.cos(c * RAD);
    const x = Math.cos(a * RAD) * Math.sin(c * RAD) - Math.sin(a * RAD) * Math.cos(c * RAD) * Math.cos((d - b) * RAD);
    return COMPASS[Math.round(((Math.atan2(y, x) / RAD + 360) % 360) / 45) % 8];
  };
  const DB = () => root.quakeDatabase || null;
  const lsGet = k => { try { return JSON.parse(root.localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const QW = /\b(earthquakes?|quakes?|tremors?|seismic|temblors?)\b/;

  // --- calculators (same maths as ai_server/brain.py) ---
  function warningTime(km) {
    const s = km / 3.5 - 6;
    return (s > 0
      ? `For a quake about ${km} km away, damaging S-waves take roughly ${Math.round(km / 3.5)} s to reach you. After about 6 s to detect, confirm and deliver the alert, that leaves about ${Math.round(s)} s of warning. `
      : `At about ${km} km you're likely inside the "blind zone": shaking may arrive before or together with the alert. `) +
      '(Rough estimate; real numbers depend on the network and the quake.)';
  }
  function kitCalc(people, days) {
    days = days || 3;
    return `For ${people} ${people === 1 ? 'person' : 'people'} for ${days} days: about ${4 * people * days} litres of water (4 L per person per day), ${days * 3 * people} meals of non-perishable food, plus a flashlight, first-aid kit, power bank and a week of any regular medicines for each person. Add a whistle, battery radio, copies of IDs and some cash.`;
  }
  const MAG_BANDS = {
    2: 'a micro or minor earthquake: usually not felt. No damage.',
    3: 'a minor earthquake: often not felt, or felt slightly by a few people. No damage.',
    4: 'a light earthquake: felt indoors, windows and objects rattle. Damage is rare.',
    5: 'a moderate earthquake: felt by everyone nearby and can damage weak or poorly built structures.',
    6: 'a strong earthquake: can cause considerable damage in populated areas within tens of kilometres.',
    7: 'a major earthquake: serious damage over a large area, and a real tsunami risk if it is near the coast.',
    8: 'a great earthquake: can destroy communities near the epicentre and is felt over hundreds of kilometres.',
    9: 'an enormous earthquake: among the largest ever recorded, with devastation over a very wide region.'
  };
  function energyNote(m) {
    const r = Math.pow(10, 1.5 * (m - 5));
    if (Math.abs(m - 5) < 0.05) return 'an M5 is the reference point here.';
    return r >= 1 ? `M${m} releases about ${Math.round(r).toLocaleString('en-US')} times the energy of an M5.` : `M${m} releases about ${Math.round(1 / r).toLocaleString('en-US')} times less energy than an M5.`;
  }
  function magnitudeInfo(m) {
    const band = MAG_BANDS[Math.max(2, Math.min(9, Math.floor(m)))];
    return `Magnitude ${m} is ${band} Each whole step up in magnitude means roughly 10 times larger ground motion and about 31.6 times more energy released, so ${energyNote(m)} What you actually feel (intensity) also depends on distance, depth and the ground you stand on.`;
  }
  function spDistance(sec) {
    const km = Math.round(sec * 8);
    return `A gap of ${sec} seconds between the first P-wave and the S-wave puts the quake roughly ${km} km away (rule of thumb: about 8 km per second of delay). Strong S-waves are the damaging ones, so use the gap you have to Drop, Cover and Hold On. With at least three stations seismologists triangulate the exact epicentre.`;
  }

  // --- quake database lookups ---
  const STOP = new Set(('earthquake earthquakes quake quakes tremor tremors the and for of in at on near about tell me what was were is are a an any there has have been ever happened ' +
    'history historical past biggest largest strongest deadliest worst major big list show database recorded record region area coast great which where when how many did does do with from that this').split(' '));
  const HIST_HINT = /\b(history|historical|past|biggest|largest|strongest|deadliest|worst|ever|happened|recorded|catalog(?:ue)?|database|list)\b|tell me about|what happened/;
  const casualtyNum = s => { const m = String(s || '').match(/(\d[\d,]*)/); return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0; };
  const fmtQuake = q => `• M${Number(q.mag).toFixed(1)}, ${q.place}${q.year ? ' (' + q.year + ')' : ''}, depth ${q.depth} km` +
    (q.casualties ? `, ${q.casualties}` : '') + (q.tsunami && !/^no/i.test(q.tsunami) ? `, tsunami: ${q.tsunami}` : '');

  function historyLookup(low) {
    const d = DB(); if (!d || !d.historicalQuakes) return null;
    if (!QW.test(low) && !/\b(1[89]\d\d|20\d\d)\b/.test(low)) return null;
    const words = (low.match(/[a-z0-9]+/g) || []).filter(w => w.length > 2 && !STOP.has(w) && !/^(1[89]\d\d|20\d\d)$/.test(w));
    const years = low.match(/\b(1[89]\d\d|20\d\d)\b/g) || [];
    const sup = /\b(biggest|largest|strongest|highest)\b/.test(low), dead = /\b(deadliest|worst|most (people|deaths|casualties))\b/.test(low);
    let hits = d.historicalQuakes.map(q => {
      const hay = norm(q.place).split(' '); let s = 0;
      words.forEach(w => { if (hay.includes(w) || (w.length > 4 && hay.some(h => h.startsWith(w)))) s++; });
      years.forEach(y => { if (String(q.year) === y) s += 2; });
      return { q, s };
    }).filter(x => x.s > 0);
    const placeGiven = words.length > 0 || years.length > 0;
    if (placeGiven && !hits.length) return null;
    if (!placeGiven) { if (!(sup || dead)) return null; hits = d.historicalQuakes.map(q => ({ q, s: 1 })); }
    const maxS = Math.max(...hits.map(h => h.s)); hits = hits.filter(h => h.s === maxS);
    hits.sort(dead ? (a, b) => casualtyNum(b.q.casualties) - casualtyNum(a.q.casualties) : (a, b) => b.q.mag - a.q.mag);
    const top = hits.slice(0, 3).map(h => fmtQuake(h.q));
    const head = dead ? 'Deadliest on record in the built-in database:' : sup ? 'Strongest in the built-in database:' : 'From the built-in earthquake database:';
    return head + '\n' + top.join('\n') + (hits.length > 3 ? `\n(${hits.length - 3} more in the Database Explorer.)` : '') + '\nThis catalogue is stored on your device, so it works offline.';
  }

  function faultLookup(low) {
    const d = DB(); if (!d || !d.faultLines) return null;
    if (!/\b(faults?|plates?|subduction|thrust|shear zone|trench|trough)\b/.test(low)) return null;
    const words = (low.match(/[a-z]+/g) || []).filter(w => w.length > 3 && !STOP.has(w) && !/^(fault|faults|plate|plates|zone|line|lines|near|major|active)$/.test(w));
    const alias = { coimbatore: 'moyar', chennai: 'tamil', madurai: 'tamil', kerala: 'tamil', tokyo: 'japan', california: 'san', himalaya: 'himalayan', nepal: 'himalayan', istanbul: 'anatolian', turkey: 'anatolian' };
    const keys = words.map(w => alias[w] || w);
    let hits = d.faultLines.filter(f => keys.some(k => norm(f.name).includes(k)));
    if (!hits.length && keys.length === 0) hits = d.faultLines;
    if (!hits.length) return null;
    return 'Fault lines in the built-in database:\n' + hits.slice(0, 4).map(f => `• ${f.name}: ${f.type}, about ${f.length}, slip rate ${f.slipRate}`).join('\n') +
      '\nTurn on the Fault Lines layer on the Live Map or the Offline Map to see them drawn.';
  }

  function feedLookup(low) {
    if (!QW.test(low)) return null;
    if (!/\b(latest|recent|today|last|just now|right now|happening|new|current|any)\b/.test(low)) return null;
    if (/\b(what|how|where|when)\b.*\b(do|should|to do)\b/.test(low)) return null;
    const feed = lsGet('qg_last_feed');
    if (feed && feed.quakes && feed.quakes.length) {
      const age = Math.max(1, Math.round((Date.now() - feed.savedAt) / 60000));
      const ago = age < 90 ? `${age} min` : age < 2880 ? `${Math.round(age / 60)} h` : `${Math.round(age / 1440)} days`;
      const top = feed.quakes.slice().sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 4);
      return `I'm offline, so this is the last live feed this device saved (${ago} ago). Newer quakes may have happened since:\n` +
        top.map(q => `• M${Number(q.mag).toFixed(1)}, ${q.place}, depth ${Math.round(q.depth)} km` + (q.time ? `, ${new Date(q.time).toLocaleString()}` : '')).join('\n');
    }
    return "I don't have a saved live earthquake feed on this device yet, and I can't fetch one offline. Open the Live Map once while online and it will keep the latest feed for next time. If you felt strong shaking, treat it as real: Drop, Cover and Hold On.";
  }

  // --- nearest facility (GPS works without internet) ---
  const FAC = [
    { key: 'shelters', re: /\b(shelters?|relief (hub|station|camp|centre|center)s?|camps?|safe place|refuge)\b/, label: 'relief shelter', info: f => `${f.capacity || ''}${f.phone ? ', ☎ ' + f.phone : ''}` },
    { key: 'hospitals', re: /\b(hospitals?|trauma|medical (centre|center|help)|ambulance|clinic|emergency room)\b/, label: 'hospital', info: f => `${f.traumaLevel || ''}${f.helpline ? ', ☎ ' + f.helpline : ''}` },
    { key: 'policeStations', re: /\b(police|rescue team|search and rescue|sar team)\b/, label: 'police / rescue command', info: f => `${f.units || ''}${f.phone ? ', ☎ ' + f.phone : ''}` },
    { key: 'fireStations', re: /\b(fire (station|brigade|department|service|rescue)s?|fire fighters?|firefighters?)\b/, label: 'fire & rescue station', info: f => `${f.trucks || ''}${f.phone ? ', ☎ ' + f.phone : ''}` }
  ];
  function getPosition() {
    return new Promise(resolve => {
      const cached = () => lsGet('qg_last_pos');
      if (!hasNav || !navigator.geolocation) return resolve(cached());
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve(cached()); } }, 7000);
      navigator.geolocation.getCurrentPosition(p => {
        if (done) return; done = true; clearTimeout(t);
        const o = { lat: p.coords.latitude, lng: p.coords.longitude, t: Date.now() }; lsSet('qg_last_pos', o); resolve(o);
      }, () => { if (done) return; done = true; clearTimeout(t); resolve(cached()); }, { timeout: 6000, maximumAge: 600000 });
    });
  }
  async function nearestLookup(low) {
    const d = DB(); if (!d) return null;
    if (!/\b(nearest|closest|near me|nearby|near here|around me|where (is|are|can i find)|find me)\b/.test(low)) return null;
    const fac = FAC.find(f => f.re.test(low)); if (!fac) return null;
    const list = d[fac.key] || [];
    const pos = await getPosition();
    if (!pos) {
      const names = list.filter(f => /india/i.test(f.city)).slice(0, 3).map(f => `• ${f.name}, ${f.city}`).join('\n') || list.slice(0, 3).map(f => `• ${f.name}, ${f.city}`).join('\n');
      return `I couldn't get your location (allow location access for this site; GPS works without internet). Meanwhile, ${fac.label}s in the built-in database include:\n${names}`;
    }
    const ranked = list.map(f => ({ f, km: hav(pos.lat, pos.lng, f.lat, f.lng) })).sort((a, b) => a.km - b.km).slice(0, 3);
    const stale = pos.t && Date.now() - pos.t > 15 * 60000 ? ' (using your last saved position)' : '';
    const far = ranked[0].km > 300 ? `\nThe nearest one in the database is far from you. The built-in list covers major cities only, so also ask local authorities.` : '';
    return `Nearest ${fac.label}${ranked.length > 1 ? 's' : ''} to you${stale}:\n` +
      ranked.map(({ f, km }) => `• ${f.name}, ${f.city}: ${km < 10 ? km.toFixed(1) : Math.round(km)} km ${compass(pos.lat, pos.lng, f.lat, f.lng)}` + (fac.info(f) ? ` (${fac.info(f)})` : '')).join('\n') +
      far + '\nOpen the Live Map and tap Navigate Evacuation Route for a route line that works from the saved map.';
  }

  async function runTools(t, low) {
    let m;
    if ((m = low.match(/(\d+(?:\.\d+)?)\s*(?:km|kilomet)/)) && /warn|alert|second|time|how long|early|reach/.test(low)) return { name: 'warning_time', answer: warningTime(parseFloat(m[1])) };
    if ((m = low.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)\b.*\b(gap|difference|interval|between|lag|delay)\b/) || low.match(/\b(?:s-?p|p-?s)\b.*?(\d+(?:\.\d+)?)\s*(?:s|sec|seconds?)/)) && /\b(p[- ]?wave|s[- ]?wave|s-?p|p-?s|epicent|distance|far)\b/.test(low)) return { name: 'sp_distance', answer: spDistance(parseFloat(m[1])) };
    if ((m = low.match(/(\d+)\s*(?:people|persons|members|of us|adults|kids|children)/)) && /kit|water|supplies|food|store|stock/.test(low)) return { name: 'kit_calc', answer: kitCalc(parseInt(m[1], 10), (low.match(/(\d+)\s*days?/) || [])[1] ? parseInt(low.match(/(\d+)\s*days?/)[1], 10) : 3) };
    if ((m = low.match(/\b(?:magnitude|mag|m)\s*(\d(?:\.\d)?)\b/) || low.match(/\b(\d(?:\.\d)?)\s*(?:magnitude|mag)\b/)) && /\b(mean|means|damage|strong|felt|big|dangerous|bad|energy|how|scale|powerful|serious)\b|magnitude/.test(low)) {
      const v = parseFloat(m[1]); if (v >= 1 && v <= 10) return { name: 'magnitude', answer: magnitudeInfo(v) };
    }
    const nr = await nearestLookup(low); if (nr) return { name: 'nearest', answer: nr };
    const hint = HIST_HINT.test(low);
    const cls = classify(t);
    const howTo = /\b(what (should|to|do)|how (do|should|can)|should i|is it safe)\b/.test(low);
    const safetyFirst = !hint && (howTo || (cls.top.score >= 0.4 && /^(during|after|help|first_aid|trapped|gas|tsunami|fire|evacuate)/.test(cls.top.intent)));
    if (!safetyFirst) {
      const f = faultLookup(low); if (f) return { name: 'faults', answer: f };
      const h = historyLookup(low); if (h) return { name: 'history', answer: h };
      const fd = feedLookup(low); if (fd) return { name: 'live_feed', answer: fd };
    }
    return null;
  }

  // ===================================================================== Tamil / Hindi
    const I18N = {
    help_now: { kw: ['உதவி', 'காப்பாற்ற', 'मदद', 'बचाओ', 'bachao'],
      ta: 'அமைதியாக இருங்கள். நிலம் அதிர்ந்தால்: கீழே குனியுங்கள் (DROP), தலை மற்றும் கழுத்தை மூடுங்கள் (COVER), பிடித்துக்கொள்ளுங்கள் (HOLD ON). ஓட வேண்டாம். அதிர்வு நின்றதும் உங்களையும் மற்றவர்களையும் காயங்களுக்காகப் பாருங்கள்; ஆபத்தில் இருந்தால் 112 அல்லது 108 அழையுங்கள்.',
      hi: 'शांत रहें। जमीन हिले तो: झुकें (DROP), सिर और गर्दन ढकें (COVER), पकड़ें (HOLD ON)। भागें नहीं। कंपन रुकने के बाद अपनी और दूसरों की चोटें देखें; खतरे में हों तो 112 या 108 पर कॉल करें।' },
    during_outdoors: { kw: ['வெளியில்', 'தெருவில்', 'திறந்த வெளி', 'बाहर हूं', 'बाहर हूँ', 'सड़क पर', 'खुले में'],
      ta: 'வெளியில் இருந்தால் கட்டிடங்கள், மரங்கள், மின்கம்பங்கள் மற்றும் மின்கம்பிகளிலிருந்து விலகி திறந்த வெளிக்குச் செல்லுங்கள். பிறகு கீழே குனிந்து தலை, கழுத்தை மூடிக்கொண்டு அதிர்வு நிற்கும் வரை பிடித்துக்கொள்ளுங்கள்.',
      hi: 'बाहर हों तो इमारतों, पेड़ों, बिजली के खंभों और तारों से दूर खुली जगह पर जाएं। फिर झुकें, सिर और गर्दन को ढकें और कंपन रुकने तक डटे रहें।' },
    during_car: { kw: ['காரில்', 'கார்', 'வாகன', 'ஓட்ட', 'பைக்', 'गाड़ी', 'कार ', 'ड्राइव', 'बाइक'],
      ta: 'வாகனம் ஓட்டினால் வேகத்தைக் குறைத்து, கட்டிடங்கள், பாலங்கள், மேம்பாலங்கள், மரங்கள், மின்கம்பிகள் இல்லாத இடத்தில் நிறுத்துங்கள். அதிர்வு நிற்கும் வரை சீட் பெல்ட்டுடன் வாகனத்துக்குள்ளேயே இருங்கள். பிறகு சேதமடைந்த சாலைகள், பாலங்களைத் தவிர்க்கவும்.',
      hi: 'गाड़ी चला रहे हों तो गति धीमी करें और इमारतों, पुलों, फ्लाईओवर, पेड़ों और बिजली के तारों से दूर रुकें। कंपन रुकने तक सीट बेल्ट बांधकर गाड़ी में ही रहें। बाद में क्षतिग्रस्त सड़कों और पुलों से बचें।' },
    during_bed: { kw: ['படுக்கை', 'தூங்க', 'உறங்க', 'बिस्तर', 'सो रहा', 'सो रही', 'नींद'],
      ta: 'படுக்கையில் இருந்தால் அங்கேயே இருங்கள்; முகம் கீழாகத் திரும்பி தலையணையால் தலை, கழுத்தை மூடிக்கொள்ளுங்கள். இருட்டில் நகர்ந்தால் உடைந்த பொருட்களால் காயம் ஏற்படலாம்.',
      hi: 'बिस्तर पर हों तो वहीं रहें, पेट के बल लेटकर तकिए से सिर और गर्दन को ढकें। अंधेरे में चलने से टूटी चीज़ों से चोट लग सकती है।' },
    during_elevator: { kw: ['லிஃப்ட்', 'லிப்ட்', 'लिफ्ट'],
      ta: 'நிலநடுக்கத்தின் போதும் பின்பும் லிஃப்ட் பயன்படுத்த வேண்டாம். லிஃப்டில் இருந்தால் எல்லா பொத்தான்களையும் அழுத்தி, முதலில் திறக்கும் தளத்தில் இறங்கி படிக்கட்டுகளைப் பயன்படுத்துங்கள். சிக்கிக்கொண்டால் அவசர அழைப்பு பொத்தானை அழுத்துங்கள்.',
      hi: 'भूकंप के दौरान और बाद में लिफ्ट का उपयोग न करें। लिफ्ट में हों तो सभी बटन दबाएं, जिस मंज़िल पर रुके वहीं उतरें और सीढ़ियों से जाएं। फंस जाएं तो इमरजेंसी बटन दबाएं।' },
    aftershocks: { kw: ['பின்அதிர்வு', 'பின் அதிர்வு', 'மீண்டும் அதிர்', 'आफ्टरशॉक', 'फिर से झटके', 'दोबारा झटके', 'बाद के झटके'],
      ta: 'பின்அதிர்வுகள் என்பவை முக்கிய நிலநடுக்கத்தைத் தொடர்ந்து வரும் சிறிய நிலநடுக்கங்கள்; அவை நாட்கள் அல்லது வாரங்கள் வரை நீடிக்கலாம். ஒவ்வொரு முறையும் குனிந்து, தலையை மூடி, பிடித்துக்கொள்ளுங்கள். சேதமடைந்த கட்டிடங்களுக்குள் செல்ல வேண்டாம்.',
      hi: 'आफ्टरशॉक मुख्य भूकंप के बाद आने वाले छोटे झटके हैं, जो दिनों या हफ्तों तक चल सकते हैं। हर बार झुकें, सिर ढकें और पकड़ें। क्षतिग्रस्त इमारतों में वापस न जाएं।' },
    building_damage: { kw: ['விரிசல்', 'கட்டிடம் சேதம்', 'சுவர் விரிசல்', 'दरार', 'इमारत क्षतिग्रस्त', 'मकान सुरक्षित', 'इमारत सुरक्षित'],
      ta: 'கட்டிடம் சாய்ந்திருந்தாலோ, பெரிய அல்லது விரிவடையும் விரிசல்கள் இருந்தாலோ, கூரை தொய்வடைந்திருந்தாலோ உள்ளே செல்ல வேண்டாம். ஒரு பொறியாளர் பரிசோதிக்கும் வரை பாதுகாப்பான இடத்தில் தங்குங்கள்.',
      hi: 'यदि इमारत झुकी हो, बड़ी या बढ़ती दरारें हों या छत लटक रही हो तो अंदर न जाएं। किसी इंजीनियर के जांचने तक सुरक्षित जगह पर रहें।' },
    power_out: { kw: ['மின்சாரம்', 'கரண்ட்', 'மின்தடை', 'बिजली', 'लाइट गई', 'बत्ती'],
      ta: 'மின்சாரம் இல்லையெனில் மெழுகுவர்த்திக்குப் பதிலாக டார்ச் பயன்படுத்துங்கள்; குளிர்சாதனப் பெட்டியைத் திறக்காமல் வைத்திருங்கள். அறுந்து விழுந்த மின்கம்பிகளிடமிருந்து தூரமாக இருந்து அதிகாரிகளுக்குத் தெரிவியுங்கள்.',
      hi: 'बिजली न हो तो मोमबत्ती की जगह टॉर्च इस्तेमाल करें और फ्रिज बंद रखें। गिरे हुए बिजली के तारों से दूर रहें और अधिकारियों को सूचित करें।' },
    water_safety: { kw: ['குடிநீர்', 'குழாய் நீர்', 'தண்ணீர் பாதுகாப்பு', 'पीने का पानी', 'नल का पानी', 'पानी सुरक्षित'],
      ta: 'குழாய்கள் சேதமடைந்திருக்கலாம். அதிகாரிகள் உறுதிப்படுத்தும் வரை சேமித்து வைத்த குடிநீரைப் பயன்படுத்துங்கள்; சந்தேகம் இருந்தால் தண்ணீரைக் கொதிக்க வைத்துக் குடியுங்கள்.',
      hi: 'पाइप क्षतिग्रस्त या दूषित हो सकते हैं। अधिकारियों की पुष्टि तक जमा किया हुआ पानी इस्तेमाल करें; संदेह हो तो पानी उबालकर पिएं।' },
    evacuate: { kw: ['வெளியேற', 'வெளியேறு', 'बाहर निकल', 'खाली करें', 'कब निकलें'],
      ta: 'உங்கள் கட்டிடம் சேதமடைந்திருந்தாலோ, கேஸ் வாசனை அல்லது தீ இருந்தாலோ, சுனாமி அல்லது நிலச்சரிவு அபாயம் இருந்தாலோ வெளியேறுங்கள். படிக்கட்டுகளைப் பயன்படுத்தி, அவசர கிட்டுடன் திறந்த பாதுகாப்பான இடத்துக்கு அமைதியாகச் செல்லுங்கள்.',
      hi: 'यदि इमारत क्षतिग्रस्त है, गैस की गंध या आग है, या सुनामी/भूस्खलन का खतरा है तो बाहर निकलें। सीढ़ियों का उपयोग करें और इमरजेंसी किट लेकर शांति से खुली सुरक्षित जगह जाएं।' },
    contact_family: { kw: ['குடும்பத்தை தொடர்பு', 'குடும்பத்துடன் தொடர்பு', 'செய்தி அனுப்ப', 'परिवार से संपर्क', 'संदेश भेज', 'फोन नहीं लग'],
      ta: 'அழைப்பதற்குப் பதிலாக குறுஞ்செய்தி அனுப்புங்கள்; குரல் அழைப்புகள் விரைவில் நெரிசலாகிவிடும். குடும்பப் பாதுகாப்பு வட்டத்தில் "பாதுகாப்பாக உள்ளேன்" எனக் குறிக்கவும்; இணையம் இல்லையெனில் ஆஃப்லைன் மெசேஜிங் மையத்தைப் பயன்படுத்தவும்.',
      hi: 'कॉल करने के बजाय संदेश भेजें; वॉइस लाइनें जल्दी जाम हो जाती हैं। फैमिली सेफ्टी सर्कल में खुद को सुरक्षित चिह्नित करें; इंटरनेट न हो तो ऑफलाइन मैसेजिंग सेंटर इस्तेमाल करें।' },
    scared_anxious: { kw: ['பயம்', 'பதற்றம்', 'கவலை', 'डर', 'घबरा', 'चिंता'],
      ta: 'நிலநடுக்கம் பயமுறுத்தக்கூடியது; அதன் பிறகு பதற்றமாக உணர்வது இயல்பே. மெதுவாக ஆழ்ந்து மூச்சு விடுங்கள், நம்பிக்கைக்குரிய ஒருவரிடம் பேசுங்கள். தொடர்ந்து சிரமமாக இருந்தால் ஆலோசகரை அணுகுங்கள்.',
      hi: 'भूकंप डरावना होता है और उसके बाद घबराहट महसूस होना आम बात है। धीरे-धीरे गहरी सांस लें और किसी भरोसेमंद व्यक्ति से बात करें। परेशानी बनी रहे तो काउंसलर से मिलें।' },
    fire: { kw: ['தீப்பிடி', 'புகை', 'आग', 'धुआं', 'धुआँ'],
      ta: 'புகை இருந்தால் தாழ்வாக நகர்ந்து விரைவாக வெளியேறுங்கள்; லிஃப்ட் பயன்படுத்த வேண்டாம். வெளியே சென்றதும் 101 (தீயணைப்பு) அழையுங்கள்.',
      hi: 'धुआं हो तो नीचे झुककर जल्दी बाहर निकलें, लिफ्ट का उपयोग न करें। बाहर पहुंचकर 101 (फायर) पर कॉल करें।' }
  };

  function i18nMatch(low, lang) {
    let best = null, bestN = 0;
    for (const [intent, e] of Object.entries(I18N)) {
      if (!e[lang]) continue;
      const n = e.kw.reduce((a, k) => a + (low.includes(k) ? 1 : 0), 0);
      if (n > bestN) { best = intent; bestN = n; }
    }
    return best ? { intent: best, answer: I18N[best][lang] } : null;
  }

  // ===================================================================== conversation
  const SITE_RE = /\b(shelters?|relief (hub|station|camp)s?|camps?|sensors?|radar|geophone|volunteers?|predictor|risk score|hazard index|community (reports?|feed)|citizen feed|family (circle|safety)|mutual aid|mesh)\b/i;
  const FOLLOW = /^(and|what about|how about|then|so|but)\b[ ,]*/i;
  const ctx = { intent: null, cat: null, askedPlace: false, lastAnswer: null, lastTopicVariant: {} };
  const NOT_SUGGESTED = new Set(['out_of_scope', 'ack', 'greeting', 'thanks', 'goodbye', 'how_are_you', 'compliment', 'who_are_you']);
  const CHIPS = ['What should I do during an earthquake?', 'What goes in an emergency kit?', 'Nearest shelter', 'Biggest earthquake in India', 'How strong is magnitude 6?', 'How to prepare my home'];

  async function answer(text, opts) {
    opts = opts || {};
    const t = String(text || '').trim();
    let lang = opts.lang || 'en';
    if (/[\u0B80-\u0BFF]/.test(t)) lang = 'ta'; else if (/[\u0900-\u097F]/.test(t)) lang = 'hi';   // answer in the script the person wrote in
    const low = t.toLowerCase();
    if (!t) return { answer: 'Type a question, for example: "what should I do during an earthquake?"', intent: null, source: 'local' };
    const done = (o) => { ctx.lastAnswer = o.answer; return Object.assign({ source: 'local', confidence: null }, o); };

    // repeat / more
    if (/^(repeat|say (that )?again|come again|pardon)\b/.test(low) && ctx.lastAnswer) return done({ answer: ctx.lastAnswer, intent: ctx.intent });
    if (/^(more|tell me more|go on|continue|elaborate|explain( more)?|what else)\??$/.test(low) && ctx.intent && BY_INTENT[ctx.intent] && BY_INTENT[ctx.intent].a.length > 1) {
      return done({ answer: pickAnswer(ctx.intent), intent: ctx.intent });
    }
    if (/^(more|tell me more|go on|continue|elaborate|what else)\??$/.test(low) && ctx.intent) {
      return done({ answer: "That's everything I have on that topic. You can ask a more specific question, for example about a different place (car, bed, outdoors, lift), or ask what to do after the shaking stops.", intent: ctx.intent, chips: CHIPS.slice(0, 3) });
    }

    // 1. tools (English text only; numbers and place names work in any language)
    if (lang === 'en' || /[a-z]/.test(low)) {
      const tool = await runTools(t, low);
      if (tool) return done({ answer: tool.answer, intent: tool.name, source: 'tool', confidence: 1 });
    }

    // 2. Tamil / Hindi
    if (lang !== 'en') {
      const m = i18nMatch(low, lang);
      if (m) { ctx.intent = m.intent; return done({ answer: m.answer, intent: m.intent, confidence: 0.9 }); }
      if (!/[a-z]{3}/.test(low)) return null;   // no Latin text: let the older keyword matcher try
    }

    // 3. app-specific topics (shelter lists, sensors, volunteers...) are answered by the page itself
    if (opts.deferSiteSpecific && lang === 'en' && SITE_RE.test(low)) return null;

    // 4. knowledge base
    let probe = t;
    if (FOLLOW.test(low) || low.split(/\s+/).length <= 3) probe = t.replace(FOLLOW, '');
    let cls = classify(probe);
    if (cls.top.score < T_OK && /[a-z]/.test(low) && ctx.cat && (ctx.cat === 'during' || ctx.cat === 'after') && low.split(/\s+/).length <= 8) {
      const c2 = classify(ctx.cat + ' earthquake ' + probe);
      if (c2.top.score > cls.top.score && c2.top.score >= T_OK) cls = c2;
    }
    const emo = Object.keys(EMO).find(k => EMO[k].test(t));
    const urgent = URGENT_RE.test(t);
    const { top } = cls;
    const second = cls.ranked.find(r => r.intent !== top.intent);

    if (top.score >= T_OK) {
      let a = pickAnswer(top.intent);
      const cat = BY_INTENT[top.intent].c;
      if (urgent && (cat === 'during' || cat === 'after')) a = URGENT_MSG + a;
      if (emo && LEAD[emo] && cat !== 'during' && cat !== 'chat') a = LEAD[emo] + a;
      if (top.intent === 'during_general' && !ctx.askedPlace) { a += '\n\nTell me where you are (indoors, in a car, outside, in bed, in a lift) and I will tailor the steps.'; ctx.askedPlace = true; }
      if (top.score < 0.40 && !urgent && second && !NOT_SUGGESTED.has(second.intent) && top.intent !== 'out_of_scope' && second.score >= 0.28) {
        a += `\n\n(If that's not what you meant, try: "${BY_INTENT[second.intent].q[0]}")`;
      }
      if (top.intent !== 'out_of_scope') { ctx.intent = top.intent; ctx.cat = cat; }
      return done({ answer: a, intent: top.intent, confidence: +top.score.toFixed(2), category: cat });
    }
    if (top.score >= T_ASK) {
      const opts2 = cls.ranked.filter(r => !NOT_SUGGESTED.has(r.intent)).slice(0, 2).map(r => BY_INTENT[r.intent].q[0]);
      return done({ answer: (urgent ? URGENT_MSG : '') + 'I want to get this right. Did you mean: ' + opts2.map(o => `"${o}"`).join(' or ') + '? Tell me a bit more and I will help.', intent: null, confidence: +top.score.toFixed(2), chips: opts2 });
    }
    return done({ answer: (urgent ? URGENT_MSG : '') + FALLBACK, intent: null, confidence: +top.score.toFixed(2), chips: CHIPS.slice(0, 4) });
  }

  api.answer = answer;
  api.tools = { warningTime, kitCalc, magnitudeInfo, spDistance, historyLookup, faultLookup, feedLookup, nearestLookup, runTools };
  api.reset = () => { ctx.intent = ctx.cat = ctx.lastAnswer = null; ctx.askedPlace = false; };

  root.offlineBrain = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
