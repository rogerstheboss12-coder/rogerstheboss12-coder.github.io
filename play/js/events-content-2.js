/* Event content, part 2 of 3. Format: see js/events-content-1.js. */
(function (root) {
  'use strict';
  function add(c) { (root.EVENT_CONTENT = root.EVENT_CONTENT || []).push(c); }

  add({
    id: 'racing', cat: 'Sports', emoji: '🏁', sym: '🏁', accent: '#d7263d', bg: ['#140507', '#5a1119', '#ff8a8a'],
    music: 'synth', catcher: '🏎️', boost: 5, yearRound: true,
    name: ['Checkered Flag Frenzy', 'Frenesí de la Bandera a Cuadros'],
    title: ['Zero to profit in 2.9 seconds', 'De cero a ganancias en 2,9 segundos'],
    currency: ['Pit Stop Pesos', 'Pesos de Boxes'],
    intro: ['Gentlemen, ladies and robots — start your engines! Three days to build the fastest racing empire on the planet.',
      '¡Damas, caballeros y robots, enciendan motores! Tres días para crear el imperio de carreras más rápido del planeta.'],
    biz: [
      ['🧃', 'Grandstand Snack Cart', 'Carrito de Tribuna', 'Loud engines, louder popcorn.', 'Motores ruidosos, palomitas más ruidosas.'],
      ['🛞', 'Tire Swap Shop', 'Taller de Neumáticos', 'Four tires, 2.1 seconds.', 'Cuatro ruedas, 2,1 segundos.'],
      ['🏎️', 'Go-Kart Track', 'Circuito de Karts', 'Where legends start small.', 'Donde las leyendas empiezan pequeñas.'],
      ['⛽', 'Racing Fuel Depot', 'Depósito de Combustible', 'Premium, super-premium, ludicrous.', 'Premium, superpremium, absurdo.'],
      ['🧰', 'Pit Crew Academy', 'Academia de Mecánicos', 'Wrenches at the speed of sound.', 'Llaves a la velocidad del sonido.'],
      ['🏁', 'Speedway Oval', 'Óvalo de Velocidad', 'Turn left. Repeat 500 times.', 'Gira a la izquierda. Repite 500 veces.'],
      ['🛣️', 'Grand Prix Street Circuit', 'Circuito Urbano Gran Premio', 'Closed roads, open wallets.', 'Calles cerradas, carteras abiertas.'],
      ['🏜️', 'Desert Rally Raid', 'Rally Raid del Desierto', 'Sand in places you didn\'t know existed.', 'Arena en sitios que no sabías que existían.'],
      ['🚀', 'Rocket Car Land-Speed Run', 'Récord de Velocidad con Coche Cohete', 'Technically still a car.', 'Técnicamente sigue siendo un coche.'],
      ['🏆', 'Endurance 24 Hours', 'Resistencia 24 Horas', 'Sleep is for the pit lane.', 'Dormir es para el pit lane.']
    ],
    mgr: [
      ['Popcorn Petey', 'Snack Captain', 'Capitán de Aperitivos', 'cap|🍿'],
      ['Lug Nut Lucy', 'Tire Specialist', 'Especialista en Neumáticos', 'cap|🛞'],
      ['Kart Kowalski', 'Track Marshal', 'Comisario de Pista', 'helm|🏎️'],
      ['Octane Ollie', 'Fuel Chemist', 'Químico del Combustible', 'hardhat|⛽'],
      ['Wrench Wanda', 'Crew Chief', 'Jefa de Mecánicos', 'bandana|🧰'],
      ['Lefty Loopman', 'Oval Promoter', 'Promotor del Óvalo', 'cowboy|🏁'],
      ['Baron Von Chicane', 'Circuit Director', 'Director del Circuito', 'tophat|🛣️'],
      ['Dune Dakar-Dash', 'Rally Navigator', 'Navegante de Rally', 'bandana|🏜️'],
      ['Jet Thrustwell', 'Rocket Driver', 'Piloto Cohete', 'helm|🚀'],
      ['Madame Marathon', 'Endurance Legend', 'Leyenda de Resistencia', 'helm|🏆']
    ],
    cards: [
      ['🏁', 'Checkered Flag', 'Bandera a Cuadros'], ['🏎️', 'Vintage Racer', 'Coche Clásico de Carreras'], ['🛞', 'Golden Tire', 'Neumático Dorado'],
      ['🪖', 'Champion\'s Helmet', 'Casco del Campeón'], ['🍾', 'Podium Celebration', 'Celebración en el Podio'], ['🏆', 'Endurance Cup', 'Copa de Resistencia']
    ],
    news: [
      ['Driver finishes race, forgets to stop, crosses state line', 'Un piloto termina la carrera, olvida frenar y cruza de estado'],
      ['Pit crew changes tires on a moving bus to prove a point', 'Mecánicos cambian ruedas a un autobús en marcha para demostrar algo'],
      ['Traffic jam on speedway blamed on everyone going the same way', 'Culpan del atasco en el óvalo a que todos van en la misma dirección']
    ]
  });

  add({
    id: 'candy', cat: 'Fantasy', emoji: '🍭', sym: '🍬', accent: '#ff5fa2', bg: ['#2a0620', '#8a1f6b', '#ffc4e8'],
    music: 'fest', catcher: '🍭', boost: 4, yearRound: true,
    name: ['Candy Kingdom', 'Reino de Caramelo'],
    title: ['Sweet deals, sugar-coated', 'Tratos dulces, bañados en azúcar'],
    currency: ['Gumdrops', 'Gominolas'],
    intro: ['Welcome to a land where the rivers are chocolate and the tax code is written in frosting. Three days to become the Sugar Sovereign!',
      'Bienvenido a una tierra con ríos de chocolate y leyes fiscales escritas en glaseado. ¡Tres días para convertirte en el Soberano del Azúcar!'],
    biz: [
      ['🍬', 'Penny Candy Counter', 'Mostrador de Caramelos', 'Sticky fingers welcome.', 'Se admiten dedos pegajosos.'],
      ['🍭', 'Lollipop Garden', 'Jardín de Piruletas', 'Swirly, twirly, early.', 'Espiral, giratorio, madrugador.'],
      ['🧁', 'Cupcake Bakery', 'Pastelería de Cupcakes', 'Frosting-to-cake ratio: 3 to 1.', 'Proporción glaseado-bizcocho: 3 a 1.'],
      ['🍫', 'Chocolate River Cruise', 'Crucero del Río de Chocolate', 'Please do not drink the river.', 'Por favor, no se beba el río.'],
      ['🍩', 'Donut Ferris Wheel', 'Noria de Donuts', 'Sprinkles fall like confetti.', 'Las virutas caen como confeti.'],
      ['🍦', 'Ice Cream Mountain', 'Montaña de Helado', 'Ski season all year.', 'Temporada de esquí todo el año.'],
      ['🍪', 'Gingerbread Suburbs', 'Suburbios de Jengibre', 'Mortgage payable in gumdrops.', 'Hipoteca pagadera en gominolas.'],
      ['🎂', 'Royal Cake Palace', 'Palacio Real de Tarta', 'Seven tiers, zero regrets.', 'Siete pisos, cero arrepentimientos.'],
      ['🌈', 'Rainbow Taffy Mill', 'Molino de Caramelo Arcoíris', 'Stretched to perfection.', 'Estirado a la perfección.'],
      ['👑', 'Sugar Crown Treasury', 'Tesoro de la Corona de Azúcar', 'Sweetest vault in the realm.', 'La bóveda más dulce del reino.']
    ],
    mgr: [
      ['Penny Jellybean', 'Counter Clerk', 'Dependienta', 'beanie|🍬'],
      ['Lolly Swirlstick', 'Head Gardener', 'Jardinera Jefa', 'flower|🍭'],
      ['Chef Buttercream', 'Master Baker', 'Maestro Pastelero', 'chef|🧁'],
      ['Captain Cocoa', 'Riverboat Captain', 'Capitán Fluvial', 'cap|🍫'],
      ['Glazey Sprinkleton', 'Ride Operator', 'Operadora de Atracción', 'headband|🍩'],
      ['Scoops McCone', 'Mountain Guide', 'Guía de Montaña', 'beanie|🍦'],
      ['Mayor Snap Ginger', 'Suburb Mayor', 'Alcalde del Suburbio', 'tophat|🍪'],
      ['Duchess Fondant', 'Palace Steward', 'Mayordoma del Palacio', 'crown|🎂'],
      ['Taffy Pullman', 'Mill Foreman', 'Capataz del Molino', 'hardhat|🌈'],
      ['King Sucrose the Sweet', 'Sugar Sovereign', 'Soberano del Azúcar', 'crown|👑']
    ],
    cards: [
      ['🍭', 'Everlasting Lollipop', 'Piruleta Eterna'], ['🍫', 'Golden Ticket Bar', 'Tableta del Billete Dorado'], ['🧁', 'Royal Cupcake', 'Cupcake Real'],
      ['🍬', 'Rainbow Gumdrop', 'Gominola Arcoíris'], ['🍪', 'Gingerbread Knight', 'Caballero de Jengibre'], ['👑', 'Sugar Crown', 'Corona de Azúcar']
    ],
    news: [
      ['Gingerbread man outruns entire police department', 'El hombre de jengibre deja atrás a toda la policía'],
      ['Dentists declare national emergency, then ask for seconds', 'Los dentistas declaran emergencia nacional y luego piden repetir'],
      ['Chocolate river floods; residents rejoice', 'Se desborda el río de chocolate; los vecinos lo celebran']
    ]
  });

  add({
    id: 'arctic', cat: 'Geography', emoji: '🐧', sym: '❄', accent: '#5ab4e0', bg: ['#04131f', '#1f4f6b', '#e8f6ff'],
    music: 'ambient', catcher: '🐧', boost: 6, window: ['11-15', '03-15'],
    name: ['Polar Expedition', 'Expedición Polar'],
    title: ['Cold hands, hot profits', 'Manos frías, ganancias calientes'],
    currency: ['Snowflakes', 'Copos de Nieve'],
    intro: ['Bundle up, President! Penguins, polar bears and the northern lights are open for business. Three days to conquer the poles.',
      '¡Abrígate, Presidente! Pingüinos, osos polares y auroras boreales abren sus negocios. Tres días para conquistar los polos.'],
    biz: [
      ['☕', 'Hot Cocoa Hut', 'Cabaña de Chocolate Caliente', 'Marshmallows are mandatory.', 'Las nubes de azúcar son obligatorias.'],
      ['🧤', 'Mitten Factory', 'Fábrica de Manoplas', 'Thumbs sold separately. Kidding.', 'Pulgares aparte. Es broma.'],
      ['🐧', 'Penguin Parade', 'Desfile de Pingüinos', 'Tuxedos on every performer.', 'Esmoquin en cada artista.'],
      ['🛷', 'Dog Sled Express', 'Expreso en Trineo', 'Powered by very good dogs.', 'Impulsado por perros muy buenos.'],
      ['🎣', 'Ice Fishing Village', 'Aldea de Pesca en Hielo', 'Patience, with a side of frostbite.', 'Paciencia con guarnición de congelación.'],
      ['🏔️', 'Glacier Hiking Tours', 'Excursiones al Glaciar', 'Slow-moving, fast-selling.', 'Se mueve lento, se vende rápido.'],
      ['🏨', 'Ice Hotel', 'Hotel de Hielo', 'Rooms are cool. Very cool.', 'Habitaciones frescas. Muy frescas.'],
      ['🐻‍❄️', 'Polar Bear Reserve', 'Reserva de Osos Polares', 'Hugs strictly prohibited.', 'Abrazos estrictamente prohibidos.'],
      ['🌌', 'Aurora Light Show', 'Espectáculo de Auroras', 'Nature\'s own laser show.', 'El espectáculo láser de la naturaleza.'],
      ['🧭', 'North Pole Research Base', 'Base de Investigación del Polo Norte', 'Every direction is south.', 'Todas las direcciones son el sur.']
    ],
    mgr: [
      ['Cocoa Frostbyte', 'Cocoa Brewer', 'Chocolatero', 'beanie|☕'],
      ['Mitt Thermalton', 'Factory Owner', 'Dueño de Fábrica', 'beanie|🧤'],
      ['Waddles Tuxington', 'Parade Marshal', 'Mariscal del Desfile', 'tophat|🐧'],
      ['Mush McHusky', 'Sled Musher', 'Conductor de Trineo', 'beanie|🛷'],
      ['Old Salty Icehole', 'Village Elder', 'Anciano de la Aldea', 'beanie|🎣'],
      ['Crevasse Carla', 'Glacier Guide', 'Guía de Glaciar', 'helm|🏔️'],
      ['Igor Iglooski', 'Hotel Concierge', 'Conserje del Hotel', 'beanie|🏨'],
      ['Ranger Borealis', 'Reserve Warden', 'Guardabosques de la Reserva', 'beanie|🐻‍❄️'],
      ['Lumi Nightglow', 'Show Director', 'Directora del Espectáculo', 'flower|🌌'],
      ['Professor Permafrost', 'Base Commander', 'Comandante de la Base', 'beanie|🧭']
    ],
    cards: [
      ['🐧', 'Emperor Penguin', 'Pingüino Emperador'], ['🐻‍❄️', 'Polar Bear Cub', 'Osezno Polar'], ['🦭', 'Arctic Walrus', 'Morsa Ártica'],
      ['🌌', 'Northern Lights', 'Aurora Boreal'], ['❄️', 'Perfect Snowflake', 'Copo de Nieve Perfecto'], ['🧭', 'Explorer\'s Compass', 'Brújula del Explorador']
    ],
    news: [
      ['Penguin files complaint: "I can\'t fly and I\'m fine with it"', 'Un pingüino presenta queja: «No puedo volar y estoy bien así»'],
      ['Ice hotel reports zero complaints about heating', 'El hotel de hielo reporta cero quejas sobre la calefacción'],
      ['Northern lights extend show by popular demand', 'La aurora boreal alarga su espectáculo a petición del público']
    ]
  });

  add({
    id: 'pets', cat: 'Animals', emoji: '🐶', sym: '🦴', accent: '#e0943a', bg: ['#1f1206', '#6b4418', '#ffd9a0'],
    music: 'fest', catcher: '🐕', boost: 3, yearRound: true,
    name: ['Pet Parade', 'Desfile de Mascotas'],
    title: ['Who\'s a good tycoon? You are!', '¿Quién es un buen magnate? ¡Tú!'],
    currency: ['Kibble Coins', 'Monedas de Pienso'],
    intro: ['Paws up, President! Dogs, cats, hamsters and one very ambitious goldfish want the best of everything. Three days to spoil them all.',
      '¡Patitas arriba, Presidente! Perros, gatos, hámsteres y un pez muy ambicioso lo quieren todo. Tres días para mimarlos a todos.'],
    biz: [
      ['🦴', 'Treat Bakery', 'Pastelería de Premios', 'Bacon-flavored everything.', 'Todo sabor beicon.'],
      ['🧶', 'Cat Toy Workshop', 'Taller de Juguetes para Gatos', 'Yarn, but premium.', 'Lana, pero premium.'],
      ['🛁', 'Doggy Spa', 'Spa Canino', 'Blowouts and belly rubs.', 'Peinados y rascaditas de barriga.'],
      ['🐹', 'Hamster Wheel Power Co.', 'Eléctrica Rueda de Hámster', 'Renewable, adorable energy.', 'Energía renovable y adorable.'],
      ['🎾', 'Dog Park Deluxe', 'Parque Canino de Lujo', 'Infinite tennis balls.', 'Pelotas de tenis infinitas.'],
      ['🐠', 'Goldfish Grand Aquarium', 'Gran Acuario del Pez Dorado', 'He has big plans.', 'Tiene grandes planes.'],
      ['🏆', 'Best in Show Arena', 'Arena Mejor de la Exposición', 'Groomed to perfection.', 'Acicalados a la perfección.'],
      ['🐱', 'Cat Café Chain', 'Cadena de Cafés de Gatos', 'The cats run it. Obviously.', 'Lo dirigen los gatos. Obvio.'],
      ['📺', 'Pet Influencer Studio', 'Estudio de Mascotas Influencer', '10 million followers, zero opinions.', '10 millones de seguidores, cero opiniones.'],
      ['🏰', 'Pampered Pet Palace', 'Palacio de Mascotas Mimadas', 'Velvet cushions, gold bowls.', 'Cojines de terciopelo, cuencos de oro.']
    ],
    mgr: [
      ['Biscuit Barkley', 'Head Baker', 'Pastelero Jefe', 'chef|🦴'],
      ['Mittens Purrington', 'Toy Designer', 'Diseñadora de Juguetes', 'beanie|🧶'],
      ['Fluffy Suds', 'Spa Director', 'Directora del Spa', 'flower|🛁'],
      ['Hammy Spinwell', 'Chief Engineer', 'Ingeniero Jefe', 'hardhat|🐹'],
      ['Fetch Fetcherson', 'Park Ranger', 'Guardabosques del Parque', 'cap|🎾'],
      ['Sir Bubbles III', 'Aquarium Magnate', 'Magnate del Acuario', 'crown|🐠'],
      ['Judge Pawsworth', 'Head Judge', 'Juez Principal', 'tophat|🏆'],
      ['Whiskers Latte', 'Café Owner', 'Dueña del Café', 'beanie|🐱'],
      ['Scruffy Selfie', 'Talent Agent', 'Agente de Talentos', 'cap|📺'],
      ['Duchess Fluffernutter', 'Palace Owner', 'Dueña del Palacio', 'crown|🏰']
    ],
    cards: [
      ['🐶', 'Loyal Pup', 'Cachorro Leal'], ['🐱', 'Majestic Cat', 'Gato Majestuoso'], ['🐹', 'Speedy Hamster', 'Hámster Veloz'],
      ['🐠', 'Ambitious Goldfish', 'Pez Dorado Ambicioso'], ['🦜', 'Chatty Parakeet', 'Periquito Parlanchín'], ['🎀', 'Best in Show Ribbon', 'Lazo de Mejor de la Exposición']
    ],
    news: [
      ['Cat knocks stock market off table', 'Un gato tira la bolsa de valores de la mesa'],
      ['Dog discovers mailman is actually nice; world confused', 'Un perro descubre que el cartero es simpático; el mundo no entiende'],
      ['Goldfish forgets announcement, announces it again', 'Un pez dorado olvida su anuncio y lo vuelve a anunciar']
    ]
  });

  add({
    id: 'knights', cat: 'Fantasy', emoji: '🏰', sym: '🛡', accent: '#8a6bd1', bg: ['#0d0a1f', '#3a2a6b', '#d4af37'],
    music: 'march', catcher: '🐉', boost: 6, yearRound: true,
    name: ['Knights & Castles', 'Caballeros y Castillos'],
    title: ['A noble quest for profit', 'Una noble búsqueda de ganancias'],
    currency: ['Crowns', 'Coronas'],
    intro: ['Hear ye, hear ye! The realm needs castles, tournaments and at least one friendly dragon. Three days to be crowned High Monarch of Commerce.',
      '¡Oíd, oíd! El reino necesita castillos, torneos y al menos un dragón simpático. Tres días para ser coronado Gran Monarca del Comercio.'],
    biz: [
      ['🥖', 'Village Bakery', 'Panadería del Pueblo', 'Bread fit for a king. Priced like one.', 'Pan digno de un rey. Con precio de rey.'],
      ['🍺', 'Tavern of the Tipsy Squire', 'Taberna del Escudero Alegre', 'Bards play nightly.', 'Los bardos tocan cada noche.'],
      ['🗡️', 'Blacksmith Forge', 'Forja del Herrero', 'Swords sharpened while you wait.', 'Espadas afiladas al momento.'],
      ['🐎', 'Royal Stables', 'Establos Reales', 'Horsepower, the original kind.', 'Caballos de fuerza, los originales.'],
      ['🏹', 'Archery Range', 'Campo de Tiro con Arco', 'Bullseye or your money back.', 'Diana o le devolvemos el dinero.'],
      ['🛡️', 'Jousting Tournament', 'Torneo de Justas', 'Lances at dawn.', 'Lanzas al amanecer.'],
      ['📜', 'Wizard\'s Scroll Library', 'Biblioteca de Pergaminos', 'Overdue fines are cursed.', 'Las multas por retraso están malditas.'],
      ['🏰', 'Grand Castle', 'Gran Castillo', 'Moat included, alligators extra.', 'Foso incluido, caimanes aparte.'],
      ['🐉', 'Dragon Riding School', 'Escuela de Jinetes de Dragón', 'Helmets strongly recommended.', 'Se recomienda mucho el casco.'],
      ['👑', 'Crown Jewel Treasury', 'Tesoro de las Joyas de la Corona', 'Guarded by 400 knights and a goose.', 'Custodiado por 400 caballeros y un ganso.']
    ],
    mgr: [
      ['Baker Crustwell', 'Royal Baker', 'Panadero Real', 'chef|🥖'],
      ['Mistress Meadows', 'Innkeeper', 'Posadera', 'flower|🍺'],
      ['Anvil Hammersmith', 'Master Smith', 'Maestro Herrero', 'bandana|🗡️'],
      ['Sir Gallops-a-Lot', 'Stable Master', 'Caballerizo Mayor', 'helm|🐎'],
      ['Robin Longbow', 'Archery Master', 'Maestro Arquero', 'cap|🏹'],
      ['Sir Lance Tiltmore', 'Tournament Champion', 'Campeón del Torneo', 'helm|🛡️'],
      ['Merlina Quill', 'Court Wizard', 'Hechicera de la Corte', 'wizard|📜'],
      ['Lord Moatsworth', 'Castellan', 'Castellano', 'crown|🏰'],
      ['Scorch the Friendly', 'Dragon Instructor', 'Instructor de Dragones', 'helm|🐉'],
      ['Queen Regalia', 'High Monarch', 'Gran Monarca', 'crown|👑']
    ],
    cards: [
      ['🗡️', 'Sword in the Stone', 'Espada en la Piedra'], ['🛡️', 'Heraldic Shield', 'Escudo Heráldico'], ['🐉', 'Friendly Dragon', 'Dragón Amistoso'],
      ['📜', 'Royal Decree', 'Decreto Real'], ['🏆', 'Holy Chalice', 'Cáliz Sagrado'], ['👑', 'Crown of the Realm', 'Corona del Reino']
    ],
    news: [
      ['Dragon applies for job, cites "warm personality"', 'Un dragón pide trabajo alegando «personalidad cálida»'],
      ['Knight loses joust to a very determined goose', 'Un caballero pierde una justa ante un ganso muy decidido'],
      ['Castle moat declared public swimming pool', 'Declaran el foso del castillo piscina pública']
    ]
  });

  add({
    id: 'goal', cat: 'Sports', emoji: '⚽', sym: '⚽', accent: '#1f9e5a', bg: ['#031a0e', '#0f5a32', '#c8f5a0'],
    music: 'march', catcher: '⚽', boost: 5, yearRound: true,
    name: ['Global Goal Cup', 'Copa Global del Gol'],
    title: ['GOOOOOOOAL-den profits', 'Ganancias de GOOOOOOOL'],
    currency: ['Goal Coins', 'Monedas de Gol'],
    intro: ['The whole planet is watching! Build the greatest soccer tournament in history in three days. Extra time not included.',
      '¡Todo el planeta está mirando! Crea el mejor torneo de fútbol de la historia en tres días. La prórroga no está incluida.'],
    biz: [
      ['🧣', 'Fan Scarf Stall', 'Puesto de Bufandas', 'Knitted with pure passion.', 'Tejidas con pura pasión.'],
      ['🥅', 'Neighborhood Pitch', 'Campo del Barrio', 'Jumpers for goalposts.', 'Mochilas como postes.'],
      ['⚽', 'Ball Stitching Studio', 'Taller de Balones', '32 panels of perfection.', '32 paneles de perfección.'],
      ['📯', 'Vuvuzela Orchestra', 'Orquesta de Vuvuzelas', 'One note, maximum volume.', 'Una nota, volumen máximo.'],
      ['👕', 'Kit Design House', 'Casa de Diseño de Equipaciones', 'New away kit every week.', 'Nueva segunda equipación cada semana.'],
      ['🎓', 'Youth Academy', 'Cantera', 'Tomorrow\'s legends, today.', 'Las leyendas del mañana, hoy.'],
      ['🏟️', 'National Stadium', 'Estadio Nacional', '100,000 seats, 100,000 opinions.', '100.000 asientos, 100.000 opiniones.'],
      ['📺', 'Global Broadcast Rights', 'Derechos de Emisión Global', 'Watched by everyone, everywhere.', 'Lo ve todo el mundo, en todas partes.'],
      ['✈️', 'Superstar Transfer Market', 'Mercado de Fichajes Estrella', 'Record fee, every summer.', 'Traspaso récord, cada verano.'],
      ['🏆', 'Golden Cup Final', 'Final de la Copa Dorada', 'Ninety minutes of history.', 'Noventa minutos de historia.']
    ],
    mgr: [
      ['Scarfy McKnit', 'Stall Keeper', 'Encargada del Puesto', 'beanie|🧣'],
      ['Nutmeg Nelson', 'Pitch Captain', 'Capitán del Campo', 'headband|🥅'],
      ['Stitch Panelli', 'Ball Maker', 'Fabricante de Balones', 'cap|⚽'],
      ['Honk Hornsworth', 'Conductor', 'Director de Orquesta', 'bandcap|📯'],
      ['Kit Couture', 'Head Designer', 'Diseñadora Jefa', 'flower|👕'],
      ['Mister Dribbles', 'Academy Director', 'Director de la Cantera', 'cap|🎓'],
      ['Stadia Grandé', 'Stadium Manager', 'Gerente del Estadio', 'tophat|🏟️'],
      ['Goooool Gustavo', 'Star Commentator', 'Comentarista Estrella', 'headset|🎙️'],
      ['Agent Transferino', 'Super Agent', 'Superagente', 'tophat|✈️'],
      ['Madame Trophée', 'Cup President', 'Presidenta de la Copa', 'crown|🏆']
    ],
    cards: [
      ['⚽', 'Final Match Ball', 'Balón de la Final'], ['🧤', 'Golden Glove', 'Guante de Oro'], ['👟', 'Golden Boot', 'Bota de Oro'],
      ['🟨', 'Referee\'s Yellow Card', 'Tarjeta Amarilla del Árbitro'], ['🧣', 'Supporter\'s Scarf', 'Bufanda del Aficionado'], ['🏆', 'Golden Cup', 'Copa Dorada']
    ],
    news: [
      ['Commentator holds "GOAL" for 11 minutes, sets record', 'Un comentarista sostiene «GOL» 11 minutos y bate un récord'],
      ['Player dives so well he\'s signed by a swim team', 'Un jugador se tira tan bien que lo ficha un equipo de natación'],
      ['Penalty shootout enters its third day', 'La tanda de penaltis entra en su tercer día']
    ]
  });

  add({
    id: 'pyramids', cat: 'Geography', emoji: '🏜️', sym: '𓂀', accent: '#d9a441', bg: ['#1f1405', '#7a5518', '#ffe0a0'],
    music: 'arp', catcher: '🐪', boost: 7, yearRound: true,
    name: ['Desert Kingdoms', 'Reinos del Desierto'],
    title: ['Pyramid schemes (the legal kind)', 'Pirámides (de las legales)'],
    currency: ['Scarabs', 'Escarabajos'],
    intro: ['The sands hide ancient wonders — and prime real estate. Build pyramids, sail the great river and unearth treasure in three days.',
      'Las arenas esconden maravillas antiguas y terrenos de primera. Construye pirámides, navega el gran río y desentierra tesoros en tres días.'],
    biz: [
      ['🫖', 'Oasis Tea Tent', 'Tienda de Té del Oasis', 'Mint tea, maximum shade.', 'Té de menta, máxima sombra.'],
      ['🐪', 'Camel Caravan', 'Caravana de Camellos', 'One hump or two?', '¿Una joroba o dos?'],
      ['🏺', 'Pottery Bazaar', 'Bazar de Cerámica', 'Every urn a story.', 'Cada urna, una historia.'],
      ['⛵', 'River Felucca Cruise', 'Crucero en Faluca', 'Gentle breeze, grand views.', 'Brisa suave, vistas grandiosas.'],
      ['📜', 'Papyrus Press', 'Imprenta de Papiro', 'Hieroglyphs, now in bold.', 'Jeroglíficos, ahora en negrita.'],
      ['🐫', 'Desert Marathon', 'Maratón del Desierto', 'Hydrate or die-drate.', 'Hidrátate o deshidrátate.'],
      ['🔺', 'Pyramid Construction Co.', 'Constructora de Pirámides', 'Built to last 5,000 years.', 'Construidas para durar 5.000 años.'],
      ['🗝️', 'Tomb Explorer Tours', 'Tours por Tumbas', 'Curses are mostly symbolic.', 'Las maldiciones son casi simbólicas.'],
      ['🦁', 'Great Sphinx Riddle Show', 'Show de Acertijos de la Esfinge', 'Answer right, win big.', 'Acierta y gana a lo grande.'],
      ['☀️', 'Temple of the Sun', 'Templo del Sol', 'Solar-powered since antiquity.', 'Con energía solar desde la antigüedad.']
    ],
    mgr: [
      ['Minty Sandalwood', 'Tea Master', 'Maestro del Té', 'bandana|🫖'],
      ['Humphrey Dunes', 'Caravan Leader', 'Líder de Caravana', 'bandana|🐪'],
      ['Clay Urnsworth', 'Master Potter', 'Maestro Alfarero', 'bandana|🏺'],
      ['Captain Delta', 'River Captain', 'Capitán del Río', 'cap|⛵'],
      ['Scribe Inkhotep', 'Chief Scribe', 'Escriba Jefe', 'wizard|📜'],
      ['Sprinty Sahara', 'Race Director', 'Directora de Carrera', 'headband|🐫'],
      ['Architect Blockhotep', 'Master Builder', 'Maestro Constructor', 'hardhat|🔺'],
      ['Dusty Cryptkeeper', 'Tomb Guide', 'Guía de Tumbas', 'pith|🗝️'],
      ['The Sphinx-Master', 'Riddle Host', 'Presentador de Acertijos', 'crown|🦁'],
      ['Pharaoh Goldenra', 'Sun Pharaoh', 'Faraón del Sol', 'crown|☀️']
    ],
    cards: [
      ['🔺', 'Great Pyramid', 'Gran Pirámide'], ['🐪', 'Royal Camel', 'Camello Real'], ['🏺', 'Golden Urn', 'Urna Dorada'],
      ['🪲', 'Sacred Scarab', 'Escarabajo Sagrado'], ['📜', 'Book of Riddles', 'Libro de Acertijos'], ['🌞', 'Sun Disk Amulet', 'Amuleto del Disco Solar']
    ],
    news: [
      ['Sphinx asks riddle, answers it herself, very pleased', 'La esfinge plantea un acertijo, lo resuelve ella misma y queda encantada'],
      ['Mummy returns — to collect overdue library book', 'La momia regresa… para devolver un libro atrasado'],
      ['Camel negotiates better water benefits', 'Un camello negocia mejores prestaciones de agua']
    ]
  });

  add({
    id: 'music', cat: 'Culture', emoji: '🎸', sym: '♫', accent: '#e02f6b', bg: ['#16040d', '#5a1233', '#ff9ec4'],
    music: 'synth', catcher: '🎵', boost: 4, yearRound: true,
    name: ['Rock \'n\' Roll Road Trip', 'Gira de Rock and Roll'],
    title: ['Turn it up to eleven', 'Súbelo hasta el once'],
    currency: ['Gold Records', 'Discos de Oro'],
    intro: ['Grab your guitar, President! From garage gigs to stadium tours, three days to become the biggest act on the planet.',
      '¡Coge la guitarra, Presidente! De conciertos en el garaje a giras por estadios: tres días para ser el grupo más grande del planeta.'],
    biz: [
      ['🎸', 'Garage Band', 'Grupo de Garaje', 'Neighbors hate it. Fans love it.', 'Los vecinos lo odian. Los fans lo aman.'],
      ['📀', 'Vinyl Record Shop', 'Tienda de Vinilos', 'Crackle included at no charge.', 'Crujidos incluidos sin coste.'],
      ['🎧', 'Headphone Boutique', 'Boutique de Auriculares', 'Hear every bass drop.', 'Escucha cada caída del bajo.'],
      ['🚐', 'Tour Van Rentals', 'Alquiler de Furgonetas de Gira', 'Smells like teen spirit.', 'Huele a espíritu adolescente.'],
      ['🎹', 'Recording Studio', 'Estudio de Grabación', 'One more take. Just one more.', 'Una toma más. Solo una más.'],
      ['👕', 'Band Merch Empire', 'Imperio del Merchandising', 'Tour shirts outsell albums.', 'Las camisetas venden más que los discos.'],
      ['🎪', 'Summer Music Festival', 'Festival de Música de Verano', 'Mud, glitter and legends.', 'Barro, purpurina y leyendas.'],
      ['📻', 'Hit Radio Network', 'Red de Radios de Éxitos', 'Same song, every 45 minutes.', 'La misma canción cada 45 minutos.'],
      ['🏟️', 'World Stadium Tour', 'Gira Mundial por Estadios', 'Pyrotechnics on every chorus.', 'Pirotecnia en cada estribillo.'],
      ['🌟', 'Hall of Legends', 'Salón de las Leyendas', 'Immortalized in gold and neon.', 'Inmortalizados en oro y neón.']
    ],
    mgr: [
      ['Riff Garageman', 'Lead Guitar', 'Guitarra Principal', 'bandana|🎸'],
      ['Wax Spinwell', 'Record Collector', 'Coleccionista de Discos', 'beanie|📀'],
      ['Bassy McBoom', 'Audio Nerd', 'Friki del Audio', 'headset|🎧'],
      ['Roadie Rick', 'Tour Driver', 'Conductor de Gira', 'cap|🚐'],
      ['Mixy Fadersworth', 'Producer', 'Productora', 'headset|🎹'],
      ['Merch Mogul Mo', 'Merch Boss', 'Jefe del Merchandising', 'cap|👕'],
      ['Glitter Moonbeam', 'Festival Founder', 'Fundadora del Festival', 'flower|🎪'],
      ['DJ Deep Voice', 'Station Manager', 'Director de la Emisora', 'headset|📻'],
      ['Axel Encore', 'Stadium Headliner', 'Cabeza de Cartel', 'bandana|🏟️'],
      ['The Legend', 'Hall Curator', 'Curador del Salón', 'crown|🌟']
    ],
    cards: [
      ['🎸', 'Signed Guitar', 'Guitarra Firmada'], ['📀', 'Platinum Record', 'Disco de Platino'], ['🎤', 'Golden Microphone', 'Micrófono Dorado'],
      ['🥁', 'Legendary Drum Kit', 'Batería Legendaria'], ['🎟️', 'Backstage Pass', 'Pase de Backstage'], ['🌟', 'Walk of Fame Star', 'Estrella del Paseo de la Fama']
    ],
    news: [
      ['Drummer finally keeps time; band stunned', 'El batería por fin lleva el ritmo; la banda, atónita'],
      ['Rock ballad makes stadium cry, then mosh', 'Una balada rock hace llorar al estadio y luego pogo'],
      ['Guitar solo enters its fourth hour', 'El solo de guitarra entra en su cuarta hora']
    ]
  });

  add({
    id: 'farm', cat: 'Animals', emoji: '🐄', sym: '🌽', accent: '#c8742a', bg: ['#1a1005', '#6b4a18', '#f5e08a'],
    music: 'march', catcher: '🐓', boost: 6, yearRound: true,
    name: ['Barnyard Bonanza', 'Bonanza del Granero'],
    title: ['Farm fresh, fortune fast', 'Del campo fresco, fortuna rápida'],
    currency: ['Corn Coins', 'Monedas de Maíz'],
    intro: ['Rise and shine, President! The rooster\'s crowing, the cows are mooing and the market opens at dawn. Three days to grow the biggest farm in the land.',
      '¡Arriba, Presidente! El gallo canta, las vacas mugen y el mercado abre al alba. Tres días para cultivar la granja más grande del país.'],
    biz: [
      ['🥚', 'Egg Stand', 'Puesto de Huevos', 'Farm fresh, never scrambled.', 'Frescos de granja, nunca revueltos.'],
      ['🍎', 'Apple Orchard', 'Huerto de Manzanos', 'An apple a day keeps profits in play.', 'Una manzana al día mantiene las ganancias.'],
      ['🐄', 'Dairy Barn', 'Establo Lechero', 'Moo-ving product daily.', 'Producto que se mueve (y muge) a diario.'],
      ['🌽', 'Corn Maze', 'Laberinto de Maíz', 'Easy to enter, profitable to exit.', 'Fácil de entrar, rentable de salir.'],
      ['🐑', 'Wool Mill', 'Molino de Lana', 'Fluffy fleece, fluffy margins.', 'Vellón esponjoso, márgenes esponjosos.'],
      ['🚜', 'Tractor Pull Arena', 'Arena de Arrastre de Tractores', 'Horsepower meets hay bales.', 'Caballos de fuerza contra balas de paja.'],
      ['🧀', 'Artisan Cheese Cave', 'Cueva de Quesos Artesanos', 'Aged like fine wine.', 'Envejecido como el buen vino.'],
      ['🎡', 'County Fair', 'Feria del Condado', 'Blue ribbons for everyone.', 'Lazos azules para todos.'],
      ['🌾', 'Golden Wheat Plains', 'Llanuras de Trigo Dorado', 'Amber waves of grain.', 'Olas ámbar de grano.'],
      ['🏡', 'Farm-to-Table Empire', 'Imperio de la Granja a la Mesa', 'From our field to your fork.', 'De nuestro campo a tu tenedor.']
    ],
    mgr: [
      ['Henrietta Cluckworth', 'Egg Inspector', 'Inspectora de Huevos', 'bonnet|🥚'],
      ['Johnny Seedling', 'Orchard Keeper', 'Guardián del Huerto', 'cap|🍎'],
      ['Bessie Moovalot', 'Dairy Manager', 'Gerente Lechera', 'bonnet|🐄'],
      ['Maize Wanderer', 'Maze Designer', 'Diseñador de Laberintos', 'cowboy|🌽'],
      ['Woolly Shearling', 'Mill Master', 'Maestro Molinero', 'beanie|🐑'],
      ['Diesel Dan', 'Tractor Champion', 'Campeón de Tractores', 'cap|🚜'],
      ['Monsieur Brie', 'Cheese Affineur', 'Afinador de Quesos', 'chef|🧀'],
      ['Ribbon Rosie', 'Fair Organizer', 'Organizadora de la Feria', 'flower|🎡'],
      ['Harvest Hank', 'Grain Baron', 'Barón del Grano', 'cowboy|🌾'],
      ['Old MacDonald-Rich', 'Farm Tycoon', 'Magnate Granjero', 'cowboy|🏡']
    ],
    cards: [
      ['🐓', 'Rooster Alarm Clock', 'Gallo Despertador'], ['🐄', 'Prize Cow', 'Vaca Premiada'], ['🐖', 'Truffle Pig', 'Cerdo Trufero'],
      ['🥧', 'Blue-Ribbon Pie', 'Tarta con Lazo Azul'], ['🚜', 'Vintage Tractor', 'Tractor Antiguo'], ['🌻', 'Giant Sunflower', 'Girasol Gigante']
    ],
    news: [
      ['Scarecrow promoted to management', 'Ascienden al espantapájaros a la dirección'],
      ['Cow jumps over the moon; NASA requests interview', 'Una vaca salta sobre la Luna; la NASA pide entrevista'],
      ['Record pumpkin requires its own zip code', 'Una calabaza récord necesita su propio código postal']
    ]
  });

  add({
    id: 'wildwest', cat: 'Adventure', emoji: '🤠', sym: '🌵', accent: '#c0662a', bg: ['#1f0e05', '#7a3a18', '#ffc98a'],
    music: 'march', catcher: '🦅', boost: 5, yearRound: true,
    name: ['Wild West Showdown', 'Duelo en el Salvaje Oeste'],
    title: ['This town ain\'t big enough for two tycoons', 'Este pueblo no es tan grande para dos magnates'],
    currency: ['Gold Nuggets', 'Pepitas de Oro'],
    intro: ['Howdy, partner! There\'s gold in them thar hills and a frontier waiting for a mayor. Three days to tame the Wild West.',
      '¡Hola, forastero! Hay oro en esas colinas y una frontera que espera alcalde. Tres días para domar el Salvaje Oeste.'],
    biz: [
      ['🫘', 'Chuckwagon Chili', 'Chile del Carromato', 'Beans, beans and more beans.', 'Frijoles, frijoles y más frijoles.'],
      ['🐴', 'Horse Livery', 'Caballeriza', 'Saddles polished daily.', 'Sillas pulidas a diario.'],
      ['⛏️', 'Gold Panning Creek', 'Arroyo de Bateo de Oro', 'Shake, swirl, strike it rich.', 'Agita, remueve y hazte rico.'],
      ['🤠', 'Rodeo Grounds', 'Terreno de Rodeo', 'Eight seconds of glory.', 'Ocho segundos de gloria.'],
      ['🥃', 'Saloon & Piano Bar', 'Saloon y Piano Bar', 'Swinging doors, swinging profits.', 'Puertas batientes, ganancias batientes.'],
      ['🚂', 'Frontier Railroad', 'Ferrocarril de la Frontera', 'Next stop: everywhere.', 'Próxima parada: todas partes.'],
      ['🏦', 'Boomtown Bank', 'Banco del Pueblo Próspero', 'Robbery-proof. Mostly.', 'A prueba de atracos. Casi.'],
      ['🎪', 'Wild West Stage Show', 'Espectáculo del Oeste', 'Trick riders and sharpshooters.', 'Acróbatas a caballo y tiradores.'],
      ['🐂', 'Cattle Ranch Empire', 'Imperio Ganadero', 'Ten thousand head, one brand.', 'Diez mil cabezas, una marca.'],
      ['⭐', 'Sheriff\'s Gold Reserve', 'Reserva de Oro del Sheriff', 'Guarded by the fastest draw in the West.', 'Custodiada por el más rápido del Oeste.']
    ],
    mgr: [
      ['Cookie Beanswell', 'Trail Cook', 'Cocinero de Ruta', 'cowboy|🫘'],
      ['Saddle Sally', 'Stable Hand', 'Mozo de Cuadra', 'cowboy|🐴'],
      ['Prospector Pete', 'Gold Panner', 'Buscador de Oro', 'cowboy|⛏️'],
      ['Buckin\' Bronco Bea', 'Rodeo Queen', 'Reina del Rodeo', 'cowboy|🤠'],
      ['Honky Tonk Tess', 'Saloon Owner', 'Dueña del Saloon', 'flower|🥃'],
      ['Conductor Casey', 'Railroad Baron', 'Barón del Ferrocarril', 'bandcap|🚂'],
      ['Banker Silverspur', 'Bank President', 'Presidente del Banco', 'tophat|🏦'],
      ['Annie Sureshot', 'Star Performer', 'Artista Estrella', 'cowboy|🎯'],
      ['Big Tex Longhorn', 'Cattle Baron', 'Barón Ganadero', 'cowboy|🐂'],
      ['Sheriff Quickdraw', 'Town Sheriff', 'Sheriff del Pueblo', 'cowboy|⭐']
    ],
    cards: [
      ['⭐', 'Sheriff\'s Badge', 'Placa del Sheriff'], ['🤠', 'Ten-Gallon Hat', 'Sombrero de Diez Galones'], ['🐴', 'Trusty Steed', 'Corcel Fiel'],
      ['🌵', 'Desert Saguaro', 'Saguaro del Desierto'], ['📜', 'Wanted Poster', 'Cartel de Se Busca'], ['🪙', 'Mother Lode Nugget', 'Pepita de la Veta Madre']
    ],
    news: [
      ['Tumbleweed elected mayor in landslide', 'Una planta rodadora gana la alcaldía por goleada'],
      ['Duel at high noon postponed due to daylight saving', 'Se aplaza el duelo al mediodía por el cambio de hora'],
      ['Gold rush triggers rush on shovels', 'La fiebre del oro desata la fiebre de las palas']
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
