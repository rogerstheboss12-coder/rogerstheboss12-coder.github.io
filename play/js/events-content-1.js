/* Event content, part 1 of 3. Each entry: English + Spanish side by side.
 * biz: [emoji, name, nombre, flavor, sabor] ×10 (cheapest first) · mgr: [name, title, título, look] ×10
 * look = 'hat|prop' for a generated face or '@face' for an existing portrait · cards: [emoji, name, nombre] ×6
 * pins: holiday dates (MM-DD) the event is scheduled on · window: season it may rotate in · yearRound: rotates all year */
(function (root) {
  'use strict';
  function add(c) { (root.EVENT_CONTENT = root.EVENT_CONTENT || []).push(c); }

  add({
    id: 'fest', cat: 'Celebrations', emoji: '🎆', sym: 'F$', accent: '#f5c518', bg: ['#0b1433', '#1f3a93', '#c8102e'], bgImg: 'assets/worlds/event.jpg',
    music: 'fest', catcher: 'eagle', boost: 4, yearRound: true, pins: ['07-04'],
    name: ['Freedom Fest', 'Festival de la Libertad'],
    title: ['Fireworks, floats and freedom', 'Fuegos artificiales, carrozas y libertad'],
    currency: ['Fest Bucks', 'Festidólares'],
    intro: ['Freedom Fest is here! Build the biggest party in the galaxy in three days. Reward tiers pay Liberty Bucks, Time Warps, Library cards and permanent Liberty Badges.',
      '¡Llegó el Festival de la Libertad! Monta la mayor fiesta de la galaxia en tres días. Los niveles de recompensa dan Libertólares, Saltos Temporales, cartas de la Biblioteca e Insignias de la Libertad permanentes.'],
    biz: [
      ['🍖', 'Backyard BBQ Grill', 'Parrilla de Patio', 'Burgers, dogs, and patriotism.', 'Hamburguesas, perritos y patriotismo.'],
      ['🎏', 'Parade Float', 'Carroza del Desfile', 'Now 40% more bunting.', 'Ahora con un 40% más de banderines.'],
      ['🎈', 'Giant Balloon', 'Globo Gigante', 'Three stories of inflatable eagle.', 'Tres pisos de águila hinchable.'],
      ['🥁', 'Marching Band', 'Banda de Música', 'Seventy-six trombones, minimum.', 'Setenta y seis trombones, como mínimo.'],
      ['🎆', 'Mega Firework', 'Megacohete', 'Visible from Mars. Literally.', 'Visible desde Marte. Literalmente.'],
      ['🚀', 'Space Shuttle Flyover', 'Sobrevuelo del Transbordador', 'Low pass, high profits.', 'Pasada baja, ganancias altas.'],
      ['🎡', 'Liberty Ferris Wheel', 'Noria de la Libertad', 'Round and round the republic.', 'Vueltas y vueltas por la república.'],
      ['🌭', 'Hot Dog Eating Arena', 'Arena de Comer Perritos', 'Competitive chewing, prime time.', 'Masticación competitiva en horario estelar.'],
      ['🎤', 'Stadium Concert', 'Concierto en el Estadio', 'Encore! Encore! Encore!', '¡Otra! ¡Otra! ¡Otra!'],
      ['🗽', 'Fireworks Over Liberty', 'Fuegos sobre la Libertad', 'The grand finale of grand finales.', 'La gran final de las grandes finales.']
    ],
    mgr: [
      ['Ben Franklite', 'Kite & Grill Master', 'Maestro de Cometas y Parrillas', '@franklin'],
      ['Betsy Ross-Racer', 'Float Seamstress', 'Costurera de Carrozas', '@ross'],
      ['Paul Revere-Rocket', 'Balloon Handler', 'Encargado de Globos', '@revere'],
      ['John Philip Sousaphone', 'Band Leader', 'Director de Banda', '@sousa'],
      ['Lady Liberty', 'Pyrotechnics Chief', 'Jefa de Pirotecnia', '@liberty'],
      ['Uncle Sam Jr.', 'Flyover Captain', 'Capitán de Sobrevuelo', '@samjr'],
      ['Ferris Wheeler', 'Wheel Operator', 'Operador de la Noria', 'cap|🎡'],
      ['Frankie Furter', 'Arena Announcer', 'Presentador de la Arena', 'chef|🌭'],
      ['Rocky Mountain Rhodes', 'Headliner', 'Cabeza de cartel', 'bandana|🎸'],
      ['Grand Marshal Sparkle', 'Finale Director', 'Director del Gran Final', 'tophat|🎇']
    ],
    cards: [],
    news: [
      ['Record crowds at Freedom Fest; hot dog supply critical', 'Multitudes récord en el Festival de la Libertad; suministro de perritos crítico'],
      ['Parade float achieves low orbit', 'Una carroza del desfile alcanza la órbita baja'],
      ['Marching band refuses to stop, now in its 30th hour', 'La banda de música se niega a parar: ya van 30 horas']
    ]
  });

  add({
    id: 'gridiron', cat: 'Sports', emoji: '🏈', sym: '🏈', accent: '#2f8f3a', bg: ['#0a2410', '#1f6b2a', '#8fd16a'],
    music: 'march', catcher: '🏈', boost: 5, pins: ['02-08'], yearRound: true,
    name: ['Gridiron Glory', 'Gloria en el Emparrillado'],
    title: ['Fourth and long for profits', 'Cuarta y larga hacia las ganancias'],
    currency: ['Touchdown Tokens', 'Fichas de Anotación'],
    intro: ['Kickoff time, President! Build a football empire from sandlot to super-stadium before the final whistle blows in three days.',
      '¡Hora del saque inicial, Presidente! Construye un imperio del fútbol americano, del descampado al superestadio, antes del silbatazo final dentro de tres días.'],
    biz: [
      ['🍿', 'Tailgate Snack Stand', 'Puesto de Aperitivos de Tailgate', 'Nachos: the official food of Sunday.', 'Nachos: la comida oficial del domingo.'],
      ['🧢', 'Foam Finger Factory', 'Fábrica de Manos de Espuma', 'We\'re number one! (In foam.)', '¡Somos los número uno! (En espuma.)'],
      ['🏈', 'Pigskin Workshop', 'Taller de Balones', 'Laces out, profits in.', 'Cordones fuera, ganancias dentro.'],
      ['📣', 'Cheer Squad Academy', 'Academia de Animadoras', 'Give me a P! Give me an R-O-F-I-T!', '¡Dame una G! ¡Dame una A-N-A-N-C-I-A!'],
      ['🎽', 'Jersey Print Shop', 'Taller de Camisetas', 'Every fan\'s name is number 1.', 'Todos los fans llevan el número 1.'],
      ['📺', 'Instant Replay Booth', 'Cabina de Repetición', 'Upon further review… profit.', 'Tras revisar la jugada… ganancias.'],
      ['🏟️', 'Mega Stadium', 'Megaestadio', 'Retractable roof, retractable prices.', 'Techo retráctil, precios retráctiles.'],
      ['🎺', 'Halftime Spectacular', 'Espectáculo de Medio Tiempo', 'Fireworks, lasers and a marching tuba.', 'Fuegos, láseres y una tuba en marcha.'],
      ['📡', 'Broadcast Network', 'Cadena de Retransmisión', 'Commercials with a side of football.', 'Anuncios con guarnición de fútbol.'],
      ['🏆', 'Championship Trophy Vault', 'Bóveda del Trofeo', 'Shiny, silver and heavily insured.', 'Brillante, plateado y muy asegurado.']
    ],
    mgr: [
      ['Coach Nacho Libre-Throw', 'Snack Coordinator', 'Coordinador de Aperitivos', 'cap|🍿'],
      ['Foamy McFingers', 'Foam Engineer', 'Ingeniero de Espuma', 'beanie|☝️'],
      ['Stitch Lacewell', 'Ball Tailor', 'Sastre de Balones', 'cap|🏈'],
      ['Peppy Pompomski', 'Spirit Captain', 'Capitana del Ánimo', 'headband|📣'],
      ['Jersey Jones', 'Print Boss', 'Jefe de Estampado', 'cap|🎽'],
      ['Ref Slowmo', 'Replay Official', 'Árbitro de Repetición', 'cap|📺'],
      ['Duke Endzone', 'Stadium Owner', 'Dueño del Estadio', 'cowboy|🏟️'],
      ['Tuba Tina', 'Halftime Producer', 'Productora del Medio Tiempo', 'bandcap|🎺'],
      ['Chip Commentary', 'Play-by-Play Voice', 'Voz de la Narración', 'headset|🎙️'],
      ['Commissioner Goldberg-Ball', 'Commissioner', 'Comisionado', 'tophat|🏆']
    ],
    cards: [
      ['🏈', 'Game Ball', 'Balón del Partido'], ['🥇', 'Hall of Fame Ring', 'Anillo del Salón de la Fama'], ['🧤', 'Sticky Gloves', 'Guantes Pegajosos'],
      ['📋', 'Secret Playbook', 'Libro de Jugadas Secreto'], ['🦃', 'Holiday Doubleheader', 'Doble Jornada Festiva'], ['🏆', 'Championship Trophy', 'Trofeo de Campeonato']
    ],
    news: [
      ['Kicker attempts 90-yard field goal; ball still in orbit', 'Un pateador intenta un gol de campo de 90 yardas; el balón sigue en órbita'],
      ['Nation\'s couches report record weekend occupancy', 'Los sofás del país reportan ocupación récord el fin de semana'],
      ['Referee throws flag, flag files grievance', 'El árbitro lanza el pañuelo; el pañuelo presenta una queja']
    ]
  });

  add({
    id: 'safari', cat: 'Animals', emoji: '🦁', sym: '🦁', accent: '#d98b2b', bg: ['#2b1a06', '#8a5a18', '#f3c46b'],
    music: 'ambient', catcher: '🦜', boost: 6, yearRound: true,
    name: ['Savanna Safari', 'Safari en la Sabana'],
    title: ['Big cats, big herds, big profits', 'Grandes felinos, grandes manadas, grandes ganancias'],
    currency: ['Safari Shillings', 'Chelines Safari'],
    intro: ['The grasslands are calling! Open lodges, run tours and protect the herds. Three days to build the wildest safari on Earth.',
      '¡La sabana te llama! Abre refugios, organiza excursiones y protege las manadas. Tres días para crear el safari más salvaje de la Tierra.'],
    biz: [
      ['🥤', 'Watering Hole Café', 'Café del Abrevadero', 'Zebras tip surprisingly well.', 'Las cebras dejan propinas sorprendentes.'],
      ['🔭', 'Binocular Rental', 'Alquiler de Prismáticos', 'See a lion. From very far away.', 'Ve un león. Desde muy lejos.'],
      ['🦒', 'Giraffe Lookout', 'Mirador de Jirafas', 'Best view on the savanna.', 'La mejor vista de la sabana.'],
      ['🚙', 'Jeep Tour Company', 'Compañía de Tours en Jeep', 'Please keep arms inside the vehicle.', 'Mantenga los brazos dentro del vehículo.'],
      ['📸', 'Wildlife Photo Studio', 'Estudio de Fotos Salvajes', 'The hippos insist on their good side.', 'Los hipopótamos exigen su mejor perfil.'],
      ['🐘', 'Elephant Sanctuary', 'Santuario de Elefantes', 'They never forget a donor.', 'Nunca olvidan a un donante.'],
      ['🎈', 'Hot Air Balloon Safari', 'Safari en Globo', 'Sunrise over a million wildebeest.', 'Amanecer sobre un millón de ñus.'],
      ['🏕️', 'Luxury Tent Lodge', 'Refugio de Lujo', 'Glamping with a roar.', 'Glamping con rugidos.'],
      ['🎬', 'Nature Documentary Studio', 'Estudio de Documentales', 'Narrated in a very calm voice.', 'Narrado con una voz muy tranquila.'],
      ['🌅', 'Pride Rock Resort', 'Resort de la Roca Real', 'Everything the light touches is for rent.', 'Todo lo que toca la luz se alquila.']
    ],
    mgr: [
      ['Tusk Waterman', 'Barista of the Plains', 'Barista de las Llanuras', 'pith|🥤'],
      ['Specs Farsight', 'Lens Keeper', 'Guardián de Lentes', 'pith|🔭'],
      ['Stretch Longneck', 'Tower Warden', 'Guardián de la Torre', 'pith|🦒'],
      ['Dusty Offroad', 'Head Driver', 'Conductor Jefe', 'bandana|🚙'],
      ['Snappy Shutterbug', 'Chief Photographer', 'Fotógrafa Jefa', 'beanie|📸'],
      ['Trunk Keeper Ella', 'Sanctuary Director', 'Directora del Santuario', 'pith|🐘'],
      ['Captain Updraft', 'Balloon Pilot', 'Piloto de Globo', 'cap|🎈'],
      ['Lady Canvas', 'Lodge Hostess', 'Anfitriona del Refugio', 'flower|🏕️'],
      ['Sir Hushington', 'Documentary Narrator', 'Narrador de Documentales', '|🎬'],
      ['Rex Maneham', 'Resort King', 'Rey del Resort', 'crown|🦁']
    ],
    cards: [
      ['🦁', 'Lion of the Plains', 'León de las Llanuras'], ['🦓', 'Zebra Crossing', 'Paso de Cebra'], ['🦏', 'Rhino Guardian', 'Guardián Rinoceronte'],
      ['🐆', 'Speedy Cheetah', 'Guepardo Veloz'], ['🌳', 'Great Baobab', 'Gran Baobab'], ['🐘', 'Elephant Matriarch', 'Matriarca Elefante']
    ],
    news: [
      ['Lion demands royalties for every roar recorded', 'Un león exige derechos por cada rugido grabado'],
      ['Giraffe spots rival safari from three counties away', 'Una jirafa divisa un safari rival a tres condados'],
      ['Hippo named Employee of the Month for 40th month running', 'Un hipopótamo es Empleado del Mes por 40.º mes seguido']
    ]
  });

  add({
    id: 'tour', cat: 'Geography', emoji: '🗺️', sym: '✈', accent: '#2e86c1', bg: ['#07233a', '#1f5f8b', '#9fd3ff'],
    music: 'arp', catcher: '✈️', boost: 3, yearRound: true,
    name: ['Grand World Tour', 'Gran Vuelta al Mundo'],
    title: ['Seven continents, one itinerary', 'Siete continentes, un itinerario'],
    currency: ['Passport Points', 'Puntos de Pasaporte'],
    intro: ['Pack your bags! From Paris to the Pyramids, every landmark needs a gift shop. Three days to sell the whole planet a vacation.',
      '¡Haz las maletas! De París a las Pirámides, cada monumento necesita una tienda de recuerdos. Tres días para vender unas vacaciones a todo el planeta.'],
    biz: [
      ['🧳', 'Luggage Cart Rental', 'Alquiler de Carritos', 'Squeaky wheel included.', 'Rueda chirriante incluida.'],
      ['🗺️', 'Map & Guidebook Kiosk', 'Quiosco de Mapas y Guías', 'Folds into any shape but the original.', 'Se pliega de cualquier forma menos la original.'],
      ['🥐', 'Paris Croissant Café', 'Café de Cruasanes de París', 'Butter content: yes.', 'Contenido de mantequilla: sí.'],
      ['🚆', 'Alpine Express Train', 'Tren Expreso Alpino', 'On time to the millisecond.', 'Puntual al milisegundo.'],
      ['🏯', 'Kyoto Tea Garden', 'Jardín de Té de Kioto', 'Tranquility, by reservation.', 'Tranquilidad, con reserva.'],
      ['🦘', 'Outback Adventure Co.', 'Aventuras en el Outback', 'Kangaroos drive a hard bargain.', 'Los canguros regatean muchísimo.'],
      ['🗼', 'Eiffel Tower Elevator', 'Ascensor de la Torre Eiffel', 'Going up: prices and passengers.', 'Suben: precios y pasajeros.'],
      ['🛳️', 'Around-the-World Cruise', 'Crucero Alrededor del Mundo', '80 days, 12 buffets a day.', '80 días, 12 bufés al día.'],
      ['🌉', 'Wonder of the World Pass', 'Pase a las Maravillas', 'All the wonders, one lanyard.', 'Todas las maravillas, una acreditación.'],
      ['🌍', 'Global Airline Alliance', 'Alianza Aérea Global', 'Frequent flyer miles to the Moon.', 'Millas de viajero frecuente hasta la Luna.']
    ],
    mgr: [
      ['Wheelie Samsonite', 'Cart Captain', 'Capitán de Carritos', 'cap|🧳'],
      ['Atlas Foldwell', 'Chief Cartographer', 'Cartógrafo Jefe', 'pith|🗺️'],
      ['Pierre Flakey', 'Head Pâtissier', 'Pastelero Jefe', 'chef|🥐'],
      ['Heidi Schedule', 'Stationmaster', 'Jefa de Estación', 'bandcap|🚆'],
      ['Master Matcha', 'Garden Keeper', 'Guardián del Jardín', '|🍵'],
      ['Bluey Boomerang', 'Outback Guide', 'Guía del Outback', 'cowboy|🦘'],
      ['Gustave Liftwell', 'Tower Operator', 'Operador de la Torre', 'beanie|🗼'],
      ['Captain Buffet', 'Cruise Director', 'Director de Crucero', 'cap|🛳️'],
      ['Wanda Wonderlust', 'Wonders Curator', 'Curadora de Maravillas', 'flower|🌉'],
      ['Jetset Magellan', 'Alliance Chairman', 'Presidente de la Alianza', 'tophat|🌍']
    ],
    cards: [
      ['🗼', 'Eiffel Tower', 'Torre Eiffel'], ['🏯', 'Himeji Castle', 'Castillo de Himeji'], ['🗿', 'Easter Island Moai', 'Moái de Rapa Nui'],
      ['🕌', 'Taj Mahal', 'Taj Mahal'], ['🏛️', 'Parthenon', 'Partenón'], ['🧭', 'Golden Compass', 'Brújula Dorada']
    ],
    news: [
      ['Tourist sends 9,000 postcards, all saying "wish you were here"', 'Un turista envía 9.000 postales, todas con «ojalá estuvieras aquí»'],
      ['Leaning tower asks for a chiropractor', 'La torre inclinada pide un quiropráctico'],
      ['Airline adds legroom; passengers weep with joy', 'Una aerolínea añade espacio para las piernas; los pasajeros lloran de alegría']
    ]
  });

  add({
    id: 'pirates', cat: 'Adventure', emoji: '🏴‍☠️', sym: '🪙', accent: '#8a5a2b', bg: ['#081a26', '#12455c', '#e0b25a'],
    music: 'arp', catcher: '🦜', boost: 7, yearRound: true,
    name: ['Pirate Cove', 'Cala Pirata'],
    title: ['Yo-ho-ho and a bottle of profit', 'Yo-ho-ho y una botella de ganancias'],
    currency: ['Doubloons', 'Doblones'],
    intro: ['Ahoy, Captain President! Hoist the colors, bury the treasure and sell tickets to it. Three days before the tide turns.',
      '¡Ah del barco, Capitán Presidente! Iza la bandera, entierra el tesoro y vende entradas para verlo. Tres días antes de que cambie la marea.'],
    biz: [
      ['🦜', 'Parrot Rental', 'Alquiler de Loros', 'Pre-trained to say "pieces of eight".', 'Entrenados para decir «piezas de a ocho».'],
      ['🍌', 'Grog & Banana Stand', 'Puesto de Grog y Plátanos', 'Scurvy-free since yesterday.', 'Sin escorbuto desde ayer.'],
      ['🗺️', 'Treasure Map Printer', 'Imprenta de Mapas del Tesoro', 'X marks the gift shop.', 'La X marca la tienda de recuerdos.'],
      ['⚓', 'Anchor Forge', 'Forja de Anclas', 'Heavy metal, literally.', 'Metal pesado, literalmente.'],
      ['🏝️', 'Deserted Island Tours', 'Tours a Islas Desiertas', 'Now with a snack bar.', 'Ahora con cafetería.'],
      ['⛵', 'Sloop Shipyard', 'Astillero de Balandras', 'Sails that never say sorry.', 'Velas que nunca piden perdón.'],
      ['🍺', 'Tortuga Tavern', 'Taberna Tortuga', 'Sea shanties every hour.', 'Canciones marineras cada hora.'],
      ['💣', 'Cannonball Carnival', 'Carnaval de Cañonazos', 'Loud, round and profitable.', 'Ruidoso, redondo y rentable.'],
      ['🏴‍☠️', 'Jolly Roger Fleet', 'Flota Jolly Roger', 'Forty galleons, one dress code.', 'Cuarenta galeones, un solo código de vestimenta.'],
      ['💎', 'Legendary Treasure Vault', 'Bóveda del Tesoro Legendario', 'Cursed? Only a little.', '¿Maldito? Solo un poquito.']
    ],
    mgr: [
      ['Polly Crackersworth', 'Parrot Wrangler', 'Domadora de Loros', 'bandana|🦜'],
      ['Grog Bottomley', 'Galley Master', 'Maestro de Cocina', 'bandana|🍌'],
      ['Inky Scrollbeard', 'Map Forger', 'Falsificador de Mapas', 'tricorn|🗺️'],
      ['Iron Anchorage', 'Blacksmith', 'Herrero', 'bandana|⚓'],
      ['Sandy Shipwreck', 'Castaway Guide', 'Guía de Náufragos', 'pith|🏝️'],
      ['Mast McTimber', 'Shipwright', 'Carpintero Naval', 'beanie|⛵'],
      ['Madame Shanty', 'Tavern Keeper', 'Tabernera', 'flower|🍺'],
      ['Boom Boomsley', 'Master Gunner', 'Maestro Artillero', 'tricorn|💣'],
      ['Admiral Plankwalker', 'Fleet Admiral', 'Almirante de la Flota', 'tricorn|🏴‍☠️'],
      ['Captain Goldtooth', 'Pirate King', 'Rey Pirata', 'crown|💎']
    ],
    cards: [
      ['🦜', 'Talking Parrot', 'Loro Parlanchín'], ['🗺️', 'Torn Treasure Map', 'Mapa del Tesoro Roto'], ['🧭', 'Cursed Compass', 'Brújula Maldita'],
      ['🏴‍☠️', 'Jolly Roger Flag', 'Bandera Pirata'], ['🦑', 'Kraken Tentacle', 'Tentáculo del Kraken'], ['👑', 'Pirate King\'s Crown', 'Corona del Rey Pirata']
    ],
    news: [
      ['Pirates vote to replace plank with a comfy ramp', 'Los piratas votan cambiar la plancha por una rampa cómoda'],
      ['Treasure found; it was friendship (and 9 tons of gold)', 'Tesoro hallado: era la amistad (y 9 toneladas de oro)'],
      ['Parrot elected first mate after persuasive speech', 'Un loro es elegido primer oficial tras un discurso convincente']
    ]
  });

  add({
    id: 'ocean', cat: 'Animals', emoji: '🐙', sym: '🐚', accent: '#1aa3b8', bg: ['#021a2b', '#0b5470', '#5ef0c8'],
    music: 'ambient', catcher: '🐠', boost: 5, yearRound: true,
    name: ['Deep Sea Discovery', 'Descubrimiento Abisal'],
    title: ['Twenty thousand leagues of profit', 'Veinte mil leguas de ganancias'],
    currency: ['Sea Shells', 'Conchas Marinas'],
    intro: ['Dive, dive, dive! The ocean is 70% of the planet and 0% franchised. Three days to build an underwater empire.',
      '¡A sumergirse! El océano es el 70 % del planeta y el 0 % tiene franquicias. Tres días para levantar un imperio submarino.'],
    biz: [
      ['🐚', 'Seashell Souvenirs', 'Recuerdos de Conchas', 'You can hear the profits.', 'Se oyen las ganancias.'],
      ['🤿', 'Snorkel Shack', 'Caseta de Esnórquel', 'Breathe in, breathe out, pay up.', 'Inspira, espira, paga.'],
      ['🐠', 'Coral Reef Aquarium', 'Acuario de Arrecife', 'Now showing: fish.', 'En cartelera: peces.'],
      ['🐢', 'Sea Turtle Rescue', 'Rescate de Tortugas', 'Slow and steady wins donations.', 'Lento y constante gana donaciones.'],
      ['🚤', 'Submarine Rides', 'Paseos en Submarino', 'Yellow paint optional.', 'Pintura amarilla opcional.'],
      ['🦈', 'Shark Tank Theater', 'Teatro de Tiburones', 'The investors bite.', 'Los inversores muerden.'],
      ['🐬', 'Dolphin Academy', 'Academia de Delfines', 'Top of the class in click-speak.', 'Primeros de la clase en idioma clic.'],
      ['🏰', 'Atlantis Resort', 'Resort Atlántida', 'Found it. Built a hotel on it.', 'La encontramos. Construimos un hotel encima.'],
      ['🐋', 'Whale Song Records', 'Discográfica Canto de Ballena', 'Platinum in 40 oceans.', 'Disco de platino en 40 océanos.'],
      ['🌊', 'Mariana Trench Lab', 'Laboratorio de la Fosa de las Marianas', 'Deepest pockets on Earth.', 'Los bolsillos más profundos de la Tierra.']
    ],
    mgr: [
      ['Shelly Seashore', 'Shell Collector', 'Coleccionista de Conchas', 'flower|🐚'],
      ['Bubbles McFlipper', 'Dive Instructor', 'Instructor de Buceo', 'beanie|🤿'],
      ['Coral Reefington', 'Aquarium Curator', 'Curadora del Acuario', '|🐠'],
      ['Old Man Shelldon', 'Rescue Captain', 'Capitán de Rescate', 'cap|🐢'],
      ['Periscope Pete', 'Sub Pilot', 'Piloto de Submarino', 'cap|🚤'],
      ['Finn Chompers', 'Tank Host', 'Presentador del Tanque', '|🦈'],
      ['Professor Squeak', 'Dolphin Dean', 'Decano de Delfines', 'wizard|🐬'],
      ['Queen Marina', 'Resort Monarch', 'Monarca del Resort', 'crown|🔱'],
      ['Humphrey Baleen', 'Record Producer', 'Productor Discográfico', 'headset|🐋'],
      ['Doctor Abyss', 'Chief Oceanographer', 'Oceanógrafo Jefe', 'hardhat|🌊']
    ],
    cards: [
      ['🐙', 'Clever Octopus', 'Pulpo Listo'], ['🐋', 'Blue Whale', 'Ballena Azul'], ['🦀', 'Hermit Crab', 'Cangrejo Ermitaño'],
      ['🪸', 'Rainbow Coral', 'Coral Arcoíris'], ['🦭', 'Friendly Seal', 'Foca Amistosa'], ['🔱', 'Trident of Atlantis', 'Tridente de la Atlántida']
    ],
    news: [
      ['Octopus signs eight contracts at once', 'Un pulpo firma ocho contratos a la vez'],
      ['Whale song tops charts in 40 oceans', 'Un canto de ballena lidera las listas en 40 océanos'],
      ['Crab moves into bigger shell, cites housing market', 'Un cangrejo se muda a una concha mayor por el mercado inmobiliario']
    ]
  });

  add({
    id: 'hoops', cat: 'Sports', emoji: '🏀', sym: '🏀', accent: '#e8631c', bg: ['#1f0c02', '#7a3410', '#ffb36b'],
    music: 'synth', catcher: '🏀', boost: 6, pins: ['03-26'], yearRound: true,
    name: ['Hoop Dreams', 'Sueños de Canasta'],
    title: ['Nothing but net profit', 'Nada más que ganancia neta'],
    currency: ['Buzzer Bucks', 'Monedas de Bocina'],
    intro: ['From driveway hoops to sold-out arenas: shoot your shot, President! Three days until the final buzzer.',
      'De canastas en la entrada de casa a estadios llenos: ¡lánzate, Presidente! Tres días hasta la bocina final.'],
    biz: [
      ['🏀', 'Driveway Hoop', 'Canasta de la Entrada', 'Mom says be home by dinner.', 'Mamá dice que vuelvas para la cena.'],
      ['👟', 'Sneaker Boutique', 'Boutique de Zapatillas', 'Squeak-certified.', 'Certificadas para chirriar.'],
      ['🥤', 'Sports Drink Brewery', 'Fábrica de Bebidas Deportivas', 'Now in Electric Blue.', 'Ahora en Azul Eléctrico.'],
      ['🏫', 'Summer Hoops Camp', 'Campamento de Baloncesto', 'Layups, lunch, repeat.', 'Bandejas, almuerzo, repetir.'],
      ['🎥', 'Highlight Reel Studio', 'Estudio de Jugadas Destacadas', 'Every dunk in slow motion.', 'Cada mate a cámara lenta.'],
      ['🎟️', 'Courtside Seat Exchange', 'Bolsa de Asientos de Pista', 'Close enough to smell the sweat.', 'Tan cerca que hueles el sudor.'],
      ['🏟️', 'Downtown Arena', 'Estadio del Centro', 'Jumbotron the size of a building.', 'Pantalla gigante del tamaño de un edificio.'],
      ['🎊', 'Bracket Madness Tournament', 'Torneo de la Locura', '64 teams, 1 office pool.', '64 equipos, 1 porra de oficina.'],
      ['🌐', 'Global Exhibition Tour', 'Gira Mundial de Exhibición', 'Dunking on every continent.', 'Machacando en cada continente.'],
      ['💍', 'Championship Ring Mint', 'Ceca de Anillos de Campeón', 'Bling for every finger.', 'Brillo para cada dedo.']
    ],
    mgr: [
      ['Swish Backboard', 'Driveway Legend', 'Leyenda de la Entrada', 'headband|🏀'],
      ['Squeaky Solesworth', 'Sneakerhead', 'Coleccionista de Zapatillas', 'cap|👟'],
      ['Gatorade Gary', 'Flavor Scientist', 'Científico del Sabor', 'hardhat|🥤'],
      ['Coach Layla Layup', 'Camp Director', 'Directora del Campamento', 'cap|📋'],
      ['Replay Rodriguez', 'Film Editor', 'Editor de Vídeo', 'headset|🎥'],
      ['Courtney Side', 'Ticket Broker', 'Revendedora de Entradas', 'flower|🎟️'],
      ['Big Arena Arnie', 'Arena Owner', 'Dueño del Estadio', 'tophat|🏟️'],
      ['Bracket Betty', 'Tournament Chair', 'Presidenta del Torneo', 'headband|🎊'],
      ['Globetrotter Glen', 'Tour Captain', 'Capitán de la Gira', 'cap|🌐'],
      ['Ringmaster Rings', 'Jeweler of Champions', 'Joyero de Campeones', 'crown|💍']
    ],
    cards: [
      ['🏀', 'Game-Winning Ball', 'Balón de la Victoria'], ['👟', 'Golden Sneakers', 'Zapatillas Doradas'], ['⏱️', 'Buzzer Beater', 'Canasta sobre la Bocina'],
      ['🧺', 'Classic Peach Basket', 'Canasta de Melocotones'], ['🎽', 'Retired Jersey', 'Camiseta Retirada'], ['💍', 'Championship Ring', 'Anillo de Campeón']
    ],
    news: [
      ['Center grows two inches during pregame interview', 'Un pívot crece cinco centímetros durante la entrevista previa'],
      ['Mascot ejected for excessive dancing', 'Expulsan a la mascota por bailar demasiado'],
      ['Office bracket won by intern who picked by jersey color', 'Gana la porra de la oficina un becario que eligió por el color de camiseta']
    ]
  });

  add({
    id: 'robots', cat: 'Science', emoji: '🤖', sym: '⚙', accent: '#27b3e0', bg: ['#050d1f', '#16305a', '#27e0ff'],
    music: 'synth', catcher: '🛸', boost: 4, yearRound: true,
    name: ['Robot Rumble', 'Estruendo Robótico'],
    title: ['Beep boop, profits up', 'Bip bup, ganancias arriba'],
    currency: ['Gear Credits', 'Créditos Engranaje'],
    intro: ['The machines have arrived — and they want jobs! Build the most advanced robotics empire in three days. Please, no uprisings.',
      '¡Han llegado las máquinas y quieren trabajo! Construye el imperio robótico más avanzado en tres días. Por favor, sin rebeliones.'],
    biz: [
      ['🔋', 'Battery Recharge Bar', 'Bar de Recarga', 'Robots drink responsibly.', 'Los robots beben con responsabilidad.'],
      ['🔩', 'Bolt & Nut Emporium', 'Emporio de Tuercas y Tornillos', 'Tighten up those margins.', 'Aprieta esos márgenes.'],
      ['🧹', 'Robo-Vacuum Fleet', 'Flota de Robots Aspiradores', 'Mapping your living room since 2002.', 'Mapeando tu salón desde 2002.'],
      ['🦾', 'Cyber Limb Clinic', 'Clínica de Miembros Cibernéticos', 'High fives, hydraulically.', 'Chócala, hidráulicamente.'],
      ['🥊', 'Robot Boxing League', 'Liga de Boxeo Robótico', 'Sparks fly every round.', 'Saltan chispas en cada asalto.'],
      ['🏭', 'Automated Megafactory', 'Megafábrica Automatizada', 'Lights out, production on.', 'Luces apagadas, producción encendida.'],
      ['🧠', 'AI Brain Lab', 'Laboratorio de Cerebros IA', 'It\'s already reading this.', 'Ya está leyendo esto.'],
      ['🐕', 'Robo-Pet Kennel', 'Criadero de Robomascotas', 'Never needs a walk. Wants one anyway.', 'Nunca necesita paseo. Lo quiere igual.'],
      ['🛰️', 'Orbital Drone Network', 'Red de Drones Orbitales', 'Delivery in 30 seconds or less.', 'Entrega en 30 segundos o menos.'],
      ['🤖', 'Giant Mech Arena', 'Arena de Mechas Gigantes', 'Twelve stories of pure spectacle.', 'Doce pisos de puro espectáculo.']
    ],
    mgr: [
      ['Volt Amperson', 'Bartender Unit', 'Unidad Camarera', 'headset|🔋'],
      ['Nutsy Boltz', 'Hardware Clerk', 'Dependiente de Ferretería', 'hardhat|🔩'],
      ['Roomba Rhonda', 'Fleet Dispatcher', 'Despachadora de Flota', 'headband|🧹'],
      ['Dr. Servo Hand', 'Cyber Surgeon', 'Cirujano Cibernético', 'hardhat|🦾'],
      ['Sparky Knockout', 'League Promoter', 'Promotor de la Liga', 'cap|🥊'],
      ['Foreman Clank', 'Factory Overseer', 'Supervisor de Fábrica', 'hardhat|🏭'],
      ['Professor Neuron', 'Lab Director', 'Director del Laboratorio', 'wizard|🧠'],
      ['Byte the Beagle-Bot', 'Head Good Boy', 'Jefe de los Buenos Chicos', '|🐕'],
      ['Captain Rotor', 'Drone Commander', 'Comandante de Drones', 'headset|🛰️'],
      ['Mecha Mayor Titan', 'Arena Champion', 'Campeón de la Arena', 'helm|🤖']
    ],
    cards: [
      ['🤖', 'Friendly Bot', 'Bot Amistoso'], ['🦾', 'Titanium Arm', 'Brazo de Titanio'], ['🔋', 'Infinite Battery', 'Batería Infinita'],
      ['🧠', 'Positronic Brain', 'Cerebro Positrónico'], ['🛸', 'Hover Drone', 'Dron Flotante'], ['⚙️', 'Golden Gear', 'Engranaje Dorado']
    ],
    news: [
      ['Robot union demands more oil breaks', 'El sindicato robótico exige más pausas para el aceite'],
      ['AI writes a poem; it is about spreadsheets', 'Una IA escribe un poema; trata de hojas de cálculo'],
      ['Vacuum robot escapes, found cleaning a stadium', 'Un robot aspirador escapa y aparece limpiando un estadio']
    ]
  });

  add({
    id: 'jungle', cat: 'Geography', emoji: '🌴', sym: '🍌', accent: '#2fa34a', bg: ['#021a0a', '#0f5a28', '#9be07a'],
    music: 'ambient', catcher: '🦋', boost: 5, yearRound: true,
    name: ['Rainforest Rush', 'Fiebre de la Selva'],
    title: ['Lush, loud and lucrative', 'Frondosa, ruidosa y lucrativa'],
    currency: ['Banana Bucks', 'Platanólares'],
    intro: ['Welcome to the canopy! Monkeys, macaws and mystery fruits await. Three days to grow the greenest business in the rainforest.',
      '¡Bienvenido al dosel! Monos, guacamayos y frutas misteriosas te esperan. Tres días para cultivar el negocio más verde de la selva.'],
    biz: [
      ['🍌', 'Banana Stand', 'Puesto de Plátanos', 'There\'s always money in it.', 'Siempre hay dinero ahí.'],
      ['🥥', 'Coconut Juice Bar', 'Bar de Agua de Coco', 'Straw included, hammer extra.', 'Pajita incluida, martillo aparte.'],
      ['🦋', 'Butterfly Garden', 'Jardín de Mariposas', 'Flutter in, flutter out.', 'Entran revoloteando, salen revoloteando.'],
      ['🛶', 'River Canoe Tours', 'Tours en Canoa', 'Mind the piranhas.', 'Cuidado con las pirañas.'],
      ['🌿', 'Herbal Remedy Lab', 'Laboratorio de Remedios', 'Grows on trees, literally.', 'Crece en los árboles, literalmente.'],
      ['🐒', 'Monkey Business Inc.', 'Monadas S.A.', 'Serious about silliness.', 'Seriedad en las tonterías.'],
      ['🌉', 'Canopy Zipline', 'Tirolina del Dosel', 'Aaaaaaaaaah (with a view).', 'Aaaaaaaaaah (con vistas).'],
      ['☕', 'Cloud Forest Coffee', 'Café del Bosque Nuboso', 'Grown above the clouds.', 'Cultivado sobre las nubes.'],
      ['🏛️', 'Lost Temple Expedition', 'Expedición al Templo Perdido', 'Booby traps sold separately.', 'Trampas vendidas por separado.'],
      ['🌳', 'Tree of Life Sanctuary', 'Santuario del Árbol de la Vida', 'Oldest, tallest, richest.', 'El más viejo, alto y rico.']
    ],
    mgr: [
      ['Chiquita Peel', 'Banana Boss', 'Jefa del Plátano', 'flower|🍌'],
      ['Coco Nutley', 'Juice Mixer', 'Mezclador de Zumos', 'bandana|🥥'],
      ['Monarch Wingwright', 'Garden Keeper', 'Guardiana del Jardín', 'flower|🦋'],
      ['Paddles Rapidson', 'River Guide', 'Guía Fluvial', 'pith|🛶'],
      ['Doc Leafy', 'Herbalist', 'Herbolario', 'wizard|🌿'],
      ['Mango Mischief', 'Chief Prankster', 'Bromista Jefe', 'cap|🐒'],
      ['Tarzana Vinely', 'Zipline Master', 'Maestra de Tirolina', 'headband|🌉'],
      ['Joe Arabica', 'Coffee Grower', 'Caficultor', 'cowboy|☕'],
      ['Indy Relicsworth', 'Expedition Leader', 'Líder de Expedición', 'cowboy|🏛️'],
      ['Elder Mossbeard', 'Keeper of the Tree', 'Guardián del Árbol', 'crown|🌳']
    ],
    cards: [
      ['🦜', 'Scarlet Macaw', 'Guacamayo Escarlata'], ['🐸', 'Poison Dart Frog', 'Rana Dardo'], ['🦥', 'Sleepy Sloth', 'Perezoso Dormilón'],
      ['🐆', 'Shadow Jaguar', 'Jaguar Sombra'], ['🌺', 'Giant Orchid', 'Orquídea Gigante'], ['🗿', 'Temple Idol', 'Ídolo del Templo']
    ],
    news: [
      ['Sloth finishes marathon, sets record for longest nap mid-race', 'Un perezoso termina un maratón con la siesta más larga en carrera'],
      ['Monkeys unionize, demand more bananas', 'Los monos se sindicalizan y exigen más plátanos'],
      ['Rare frog discovered, immediately gets agent', 'Descubren una rana rara que enseguida consigue agente']
    ]
  });

  add({
    id: 'dino', cat: 'Science', emoji: '🦖', sym: '🦴', accent: '#6b9a2a', bg: ['#141a05', '#4a5a18', '#e0d06b'],
    music: 'march', catcher: '🦕', boost: 7, yearRound: true,
    name: ['Dino Dig', 'Excavación Jurásica'],
    title: ['Prehistoric profits, freshly excavated', 'Ganancias prehistóricas, recién excavadas'],
    currency: ['Fossil Funds', 'Fondos Fósiles'],
    intro: ['Grab a shovel, President! There are dinosaurs under the parking lot. Dig them up, build a museum and sell a lot of plush T. rexes.',
      '¡Coge una pala, Presidente! Hay dinosaurios bajo el aparcamiento. Desentiérralos, monta un museo y vende muchos T. rex de peluche.'],
    biz: [
      ['🦴', 'Fossil Gift Shop', 'Tienda de Fósiles', 'Genuine replica bones.', 'Huesos réplica auténticos.'],
      ['⛏️', 'Pickaxe Rentals', 'Alquiler de Picos', 'Dig responsibly.', 'Excava con responsabilidad.'],
      ['🥚', 'Egg Hatchery Exhibit', 'Exposición de Huevos', 'Do not tap the glass.', 'No golpee el cristal.'],
      ['🦕', 'Brontosaurus Rides', 'Paseos en Brontosaurio', 'Long neck, longer line.', 'Cuello largo, cola más larga.'],
      ['🌋', 'Prehistoric Theme Park', 'Parque Temático Prehistórico', 'Life finds a way (to the gift shop).', 'La vida se abre camino (a la tienda).'],
      ['🏛️', 'Natural History Museum', 'Museo de Historia Natural', 'Everything comes alive at night.', 'Todo cobra vida por la noche.'],
      ['🔬', 'Amber Research Lab', 'Laboratorio del Ámbar', 'We found a mosquito. Uh-oh.', 'Encontramos un mosquito. Ay, ay.'],
      ['🦖', 'T. Rex Arena', 'Arena del T. Rex', 'Tiny arms, giant applause.', 'Brazos diminutos, aplausos gigantes.'],
      ['☄️', 'Meteor Defense Program', 'Programa Antimeteoritos', 'Not this time, space rock.', 'Esta vez no, roca espacial.'],
      ['🧬', 'Dino DNA Institute', 'Instituto de ADN Dino', 'Cloning, but make it majestic.', 'Clonación, pero majestuosa.']
    ],
    mgr: [
      ['Bones Mahoney', 'Shopkeeper', 'Tendero', 'pith|🦴'],
      ['Rocky Chisel', 'Dig Foreman', 'Capataz de Excavación', 'hardhat|⛏️'],
      ['Nana Nestwell', 'Hatchery Keeper', 'Guardiana de Huevos', 'flower|🥚'],
      ['Long-Neck Larry', 'Ride Operator', 'Operador de Atracción', 'cowboy|🦕'],
      ['Gate Keeper Gert', 'Park Manager', 'Gerente del Parque', 'pith|🌋'],
      ['Curator Fossilworth', 'Museum Curator', 'Curador del Museo', 'tophat|🏛️'],
      ['Dr. Amber Resin', 'Lead Scientist', 'Científica Jefa', 'hardhat|🔬'],
      ['Rexford Roarington', 'Arena Announcer', 'Presentador de la Arena', 'cap|🦖'],
      ['Commander Crater', 'Planetary Defense', 'Defensa Planetaria', 'helm|☄️'],
      ['Professor Helix', 'Institute Director', 'Director del Instituto', 'wizard|🧬']
    ],
    cards: [
      ['🦖', 'Tyrannosaurus Rex', 'Tiranosaurio Rex'], ['🦕', 'Brontosaurus', 'Brontosaurio'], ['🦴', 'Triceratops Skull', 'Cráneo de Tricerátops'],
      ['🥚', 'Golden Dino Egg', 'Huevo Dorado de Dinosaurio'], ['🪶', 'Feathered Raptor', 'Raptor Emplumado'], ['🟠', 'Amber Mosquito', 'Mosquito en Ámbar']
    ],
    news: [
      ['T. rex tries to clap, gives up', 'Un T. rex intenta aplaudir y se rinde'],
      ['Fossil found in museum turns out to be the night guard', 'El fósil hallado en el museo resultó ser el vigilante nocturno'],
      ['Meteor spotted; defense program already on it', 'Avistan un meteorito; el programa de defensa ya se ocupa']
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
