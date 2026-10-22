/* Event content, part 3 of 3 (includes the seasonal events). Format: see js/events-content-1.js. */
(function (root) {
  'use strict';
  function add(c) { (root.EVENT_CONTENT = root.EVENT_CONTENT || []).push(c); }

  add({
    id: 'games', cat: 'Sports', emoji: '🏅', sym: '🏅', accent: '#d4a017', bg: ['#0a0f24', '#23306b', '#ffe07a'],
    music: 'march', catcher: '🕊️', boost: 6, yearRound: true,
    name: ['Gold Medal Games', 'Juegos de la Medalla de Oro'],
    title: ['Faster, higher, richer', 'Más rápido, más alto, más rico'],
    currency: ['Medal Marks', 'Marcas de Medalla'],
    intro: ['Light the torch! Athletes from every nation are arriving for the greatest games on Earth. Three days to take home the gold.',
      '¡Enciende la antorcha! Atletas de todas las naciones llegan a los mejores juegos de la Tierra. Tres días para llevarte el oro.'],
    biz: [
      ['🥤', 'Stadium Refreshments', 'Refrescos del Estadio', 'Hydration is a sport.', 'Hidratarse es un deporte.'],
      ['🏃', 'Track & Field Club', 'Club de Atletismo', 'On your marks, get set, profit.', 'Preparados, listos, ¡ganancias!'],
      ['🏊', 'Competition Pool', 'Piscina de Competición', 'Fifty meters of pure speed.', 'Cincuenta metros de pura velocidad.'],
      ['🤸', 'Gymnastics Hall', 'Pabellón de Gimnasia', 'Perfect tens all around.', 'Dieces perfectos para todos.'],
      ['🚴', 'Velodrome', 'Velódromo', 'Round and round, faster and faster.', 'Vueltas y vueltas, cada vez más rápido.'],
      ['🏋️', 'Weightlifting Arena', 'Arena de Halterofilia', 'Heavy lifting, heavy returns.', 'Levantamientos pesados, beneficios pesados.'],
      ['🔥', 'Torch Relay', 'Relevo de la Antorcha', 'Passed hand to hand, city to city.', 'De mano en mano, de ciudad en ciudad.'],
      ['🏟️', 'Opening Ceremony', 'Ceremonia de Apertura', 'Ten thousand drummers, one spotlight.', 'Diez mil tambores, un foco.'],
      ['🏘️', 'Athletes\' Village', 'Villa de los Atletas', 'The world\'s fittest neighborhood.', 'El barrio más en forma del mundo.'],
      ['🥇', 'Medal Podium', 'Podio de Medallas', 'Solid gold. Well, gold-plated.', 'Oro macizo. Bueno, chapado.']
    ],
    mgr: [
      ['Fizzy Hydrant', 'Refreshment Chief', 'Jefe de Refrescos', 'cap|🥤'],
      ['Dash Sprintley', 'Head Coach', 'Entrenador Jefe', 'headband|🏃'],
      ['Splash Butterfly', 'Pool Captain', 'Capitana de la Piscina', 'beanie|🏊'],
      ['Flippa Backhand', 'Gymnastics Judge', 'Jueza de Gimnasia', 'headband|🤸'],
      ['Spokes McPedal', 'Velodrome Boss', 'Jefe del Velódromo', 'helm|🚴'],
      ['Hercules Liftwell', 'Arena Master', 'Maestro de la Arena', 'headband|🏋️'],
      ['Flame Keeper Phoebe', 'Torchbearer', 'Portadora de la Antorcha', 'flower|🔥'],
      ['Pageant Maximus', 'Ceremony Director', 'Director de Ceremonias', 'tophat|🎆'],
      ['Mayor Marathon', 'Village Mayor', 'Alcaldesa de la Villa', 'cap|🏘️'],
      ['President Podium', 'Games President', 'Presidente de los Juegos', 'crown|🥇']
    ],
    cards: [
      ['🥇', 'Gold Medal', 'Medalla de Oro'], ['🥈', 'Silver Medal', 'Medalla de Plata'], ['🥉', 'Bronze Medal', 'Medalla de Bronce'],
      ['🔥', 'Eternal Flame', 'Llama Eterna'], ['🕊️', 'Dove of Peace', 'Paloma de la Paz'], ['🏅', 'Laurel of Victory', 'Laurel de la Victoria']
    ],
    news: [
      ['Sprinter so fast she finishes before the starting gun', 'Una velocista tan rápida que llega antes del disparo'],
      ['Synchronized swimmers accidentally sync with the whole audience', 'Nadadoras sincronizadas acaban sincronizando a todo el público'],
      ['Torch relay takes scenic route through three extra countries', 'El relevo de la antorcha toma un desvío por tres países más']
    ]
  });

  add({
    id: 'volcano', cat: 'Geography', emoji: '🌋', sym: '🔥', accent: '#e8421f', bg: ['#1a0402', '#6b160a', '#ffb05a'],
    music: 'arp', catcher: '🦜', boost: 4, yearRound: true,
    name: ['Island Volcano', 'Volcán Isleño'],
    title: ['Hot property, literally', 'Una propiedad ardiente, literalmente'],
    currency: ['Lava Lira', 'Liras de Lava'],
    intro: ['Aloha from the edge of a volcano! Tropical beaches on one side, bubbling lava on the other. Three days to build a red-hot resort.',
      '¡Aloha desde el borde de un volcán! Playas tropicales a un lado, lava burbujeante al otro. Tres días para levantar un resort al rojo vivo.'],
    biz: [
      ['🍍', 'Pineapple Smoothie Stand', 'Puesto de Batidos de Piña', 'Freshly blended, lightly smoked.', 'Recién batido, ligeramente ahumado.'],
      ['🌺', 'Flower Lei Shop', 'Tienda de Collares de Flores', 'Every guest leaves lei-ded.', 'Todos se van con collar.'],
      ['🏄', 'Surf School', 'Escuela de Surf', 'Hang ten, pay twenty.', 'Cuelga diez, paga veinte.'],
      ['🔥', 'Luau Feast', 'Banquete Luau', 'Fire dancers nightly.', 'Bailarines de fuego cada noche.'],
      ['🥾', 'Crater Hiking Trail', 'Sendero del Cráter', 'Bring water. And courage.', 'Trae agua. Y valor.'],
      ['♨️', 'Geothermal Spa', 'Spa Geotérmico', 'Heated by the planet itself.', 'Calentado por el propio planeta.'],
      ['🚁', 'Lava Helicopter Tours', 'Tours en Helicóptero sobre la Lava', 'The view is to die for (please don\'t).', 'Vistas de muerte (por favor, no).'],
      ['💎', 'Obsidian Jewelry Works', 'Joyería de Obsidiana', 'Volcanic glass, polished to perfection.', 'Vidrio volcánico pulido a la perfección.'],
      ['⚡', 'Magma Power Plant', 'Central de Magma', 'Clean energy with a rumble.', 'Energía limpia con estruendo.'],
      ['🏝️', 'Private Volcano Island', 'Isla Volcán Privada', 'Your own active crater. VIP only.', 'Tu propio cráter activo. Solo VIP.']
    ],
    mgr: [
      ['Pina Coladawell', 'Smoothie Chef', 'Chef de Batidos', 'flower|🍍'],
      ['Leilani Blossom', 'Lei Artisan', 'Artesana de Collares', 'flower|🌺'],
      ['Kai Wavecrest', 'Surf Instructor', 'Instructor de Surf', 'bandana|🏄'],
      ['Chief Firedance', 'Luau Host', 'Anfitrión del Luau', 'flower|🔥'],
      ['Ashley Cinders', 'Trail Ranger', 'Guardabosques del Sendero', 'pith|🥾'],
      ['Madame Steam', 'Spa Director', 'Directora del Spa', 'flower|♨️'],
      ['Captain Updraft', 'Chopper Pilot', 'Piloto de Helicóptero', 'headset|🚁'],
      ['Gemma Obsidian', 'Master Jeweler', 'Maestra Joyera', 'wizard|💎'],
      ['Engineer Rumbleton', 'Plant Manager', 'Director de la Central', 'hardhat|⚡'],
      ['Lord Magmaximus', 'Island Owner', 'Dueño de la Isla', 'crown|🏝️']
    ],
    cards: [
      ['🌋', 'Mighty Volcano', 'Volcán Poderoso'], ['🌺', 'Hibiscus Lei', 'Collar de Hibisco'], ['🏄', 'Legendary Surfboard', 'Tabla de Surf Legendaria'],
      ['🐢', 'Honu Sea Turtle', 'Tortuga Marina Honu'], ['💎', 'Obsidian Heart', 'Corazón de Obsidiana'], ['🔥', 'Fire Dancer\'s Torch', 'Antorcha del Bailarín de Fuego']
    ],
    news: [
      ['Volcano burps; tourists applaud', 'El volcán eructa; los turistas aplauden'],
      ['Surfer rides lava wave, claims it was "gnarly"', 'Un surfista cabalga una ola de lava y dice que fue «brutal»'],
      ['Island adds second volcano to meet demand', 'La isla añade un segundo volcán para atender la demanda']
    ]
  });

  add({
    id: 'spooky', cat: 'Holidays', emoji: '🎃', sym: '🍬', accent: '#ff7a1a', bg: ['#0d0514', '#3a1452', '#ff9a3a'],
    music: 'arp', catcher: '🦇', boost: 6, window: ['10-01', '11-03'], pins: ['10-31'],
    name: ['Monster Mash', 'Fiesta de Monstruos'],
    title: ['A spook-tacular fortune', 'Una fortuna de miedo'],
    currency: ['Candy Corn', 'Caramelos de Maíz'],
    intro: ['Boo! The monsters are throwing a party and they need a host. Carve pumpkins, haunt houses and hand out full-size candy bars for three frightful days.',
      '¡Bu! Los monstruos montan una fiesta y necesitan anfitrión. Talla calabazas, embruja casas y reparte chocolatinas grandes durante tres días de miedo.'],
    biz: [
      ['🍬', 'Trick-or-Treat Stand', 'Puesto de Truco o Trato', 'Full-size bars only.', 'Solo chocolatinas grandes.'],
      ['🎃', 'Pumpkin Patch', 'Huerto de Calabazas', 'Carve your own profits.', 'Talla tus propias ganancias.'],
      ['🧙', 'Costume Emporium', 'Emporio de Disfraces', 'Everyone\'s a wizard this year.', 'Este año todos van de mago.'],
      ['🍏', 'Caramel Apple Kitchen', 'Cocina de Manzanas Caramelizadas', 'Sticky, sweet, spooky.', 'Pegajosas, dulces, terroríficas.'],
      ['🦇', 'Bat Cave Tours', 'Tours por la Cueva de Murciélagos', 'Hang around a while.', 'Quédate colgado un rato.'],
      ['🏚️', 'Haunted House', 'Casa Encantada', 'The ghosts work for tips.', 'Los fantasmas trabajan por propinas.'],
      ['🧪', 'Mad Scientist Lab', 'Laboratorio del Científico Loco', 'It\'s alive! And profitable!', '¡Está vivo! ¡Y es rentable!'],
      ['⚰️', 'Midnight Graveyard Gala', 'Gala del Cementerio a Medianoche', 'Dress code: undead formal.', 'Etiqueta: gala no-muerta.'],
      ['🌕', 'Werewolf Moon Festival', 'Festival de la Luna del Hombre Lobo', 'Howling good business.', 'Un negocio de aullar.'],
      ['🏰', 'Count\'s Castle Ballroom', 'Salón de Baile del Castillo del Conde', 'Dancing till dawn — strictly.', 'Baile hasta el alba, estrictamente.']
    ],
    mgr: [
      ['Candy Gobbler', 'Treat Dispenser', 'Repartidora de Dulces', 'witch|🍬'],
      ['Jack O\'Lantern', 'Patch Keeper', 'Guardián del Huerto', 'beanie|🎃'],
      ['Madame Masquerade', 'Costume Designer', 'Diseñadora de Disfraces', 'witch|🎭'],
      ['Granny Caramel', 'Apple Dipper', 'Bañadora de Manzanas', 'bonnet|🍏'],
      ['Count Batsworth', 'Cave Guide', 'Guía de la Cueva', 'tophat|🦇'],
      ['Boo Radley-Ghost', 'Head Haunter', 'Asustador Jefe', '|👻'],
      ['Dr. Frankenfunds', 'Chief Scientist', 'Científico Jefe', 'hardhat|🧪'],
      ['Mortimer Gravesend', 'Gala Host', 'Anfitrión de la Gala', 'tophat|⚰️'],
      ['Howlin\' Harriet', 'Festival Chair', 'Presidenta del Festival', 'flower|🌕'],
      ['Count Countula', 'Castle Owner', 'Dueño del Castillo', 'crown|🧛']
    ],
    cards: [
      ['🎃', 'Jack-o\'-Lantern', 'Calabaza Tallada'], ['👻', 'Friendly Ghost', 'Fantasma Amistoso'], ['🦇', 'Midnight Bat', 'Murciélago de Medianoche'],
      ['🧙', 'Witch\'s Broom', 'Escoba de Bruja'], ['🕸️', 'Silver Spiderweb', 'Telaraña Plateada'], ['🧛', 'Count\'s Cape', 'Capa del Conde']
    ],
    news: [
      ['Ghost demands to be seen; nobody can', 'Un fantasma exige que lo vean; nadie puede'],
      ['Werewolf shaves, becomes regular wolf', 'Un hombre lobo se afeita y se convierte en lobo normal'],
      ['Vampire opens daytime-only bank; confusion ensues', 'Un vampiro abre un banco solo de día; reina la confusión']
    ]
  });

  add({
    id: 'harvest', cat: 'Holidays', emoji: '🦃', sym: '🥧', accent: '#c96a1f', bg: ['#1a0c04', '#6b3312', '#ffc070'],
    music: 'march', catcher: '🍂', boost: 7, window: ['11-01', '11-30'], pins: ['11-26'],
    name: ['Harvest Hoedown', 'Baile de la Cosecha'],
    title: ['Gravy by the gallon', 'Salsa a galones'],
    currency: ['Pie Slices', 'Porciones de Tarta'],
    intro: ['The leaves are falling and the feast is rising! Bake pies, stuff turkeys and throw the biggest harvest party in history. Three days, stretchy pants recommended.',
      '¡Caen las hojas y crece el banquete! Hornea tartas, rellena pavos y monta la mayor fiesta de la cosecha. Tres días; se recomiendan pantalones elásticos.'],
    biz: [
      ['🍂', 'Leaf Pile Jumping', 'Salto en Montones de Hojas', 'Crunchy, colorful, cheap.', 'Crujiente, colorido y barato.'],
      ['🌽', 'Cornbread Kitchen', 'Cocina de Pan de Maíz', 'Golden, buttery, gone.', 'Dorado, mantecoso, se acabó.'],
      ['🥧', 'Pie Bakery', 'Pastelería de Tartas', 'Pumpkin, pecan, apple, repeat.', 'Calabaza, nuez, manzana, repetir.'],
      ['🍎', 'Cider Mill', 'Molino de Sidra', 'Pressed fresh every hour.', 'Prensada fresca cada hora.'],
      ['🛻', 'Hayride Company', 'Paseos en Carro de Heno', 'Bumpy, scenic, itchy.', 'Movido, pintoresco, pica.'],
      ['🦃', 'Turkey Trot Race', 'Carrera del Pavo', 'Run now, eat later.', 'Corre ahora, come después.'],
      ['🎈', 'Giant Balloon Parade', 'Desfile de Globos Gigantes', 'Four stories of inflatable gratitude.', 'Cuatro pisos de gratitud hinchable.'],
      ['🍗', 'Grand Feast Hall', 'Gran Salón del Banquete', 'Seconds are mandatory.', 'Repetir es obligatorio.'],
      ['🌾', 'Harvest Festival Grounds', 'Recinto de la Fiesta de la Cosecha', 'Fiddles, bonfires and square dancing.', 'Violines, hogueras y baile country.'],
      ['🙏', 'Gratitude Foundation', 'Fundación Gratitud', 'Thankful for every donor.', 'Agradecidos con cada donante.']
    ],
    mgr: [
      ['Maple Crunchley', 'Leaf Supervisor', 'Supervisora de Hojas', 'beanie|🍂'],
      ['Cornelius Butterworth', 'Head Cook', 'Cocinero Jefe', 'chef|🌽'],
      ['Granny Crustworth', 'Pie Master', 'Maestra Tartera', 'bonnet|🥧'],
      ['Cider Sid', 'Mill Owner', 'Dueño del Molino', 'cap|🍎'],
      ['Hay Hayden', 'Wagon Driver', 'Conductor del Carro', 'cowboy|🛻'],
      ['Gobbles Gobblington', 'Race Official', 'Juez de Carrera', 'pilgrim|🦃'],
      ['Balloonie Floatsworth', 'Parade Marshal', 'Mariscal del Desfile', 'tophat|🎈'],
      ['Chef Gravy Boatman', 'Feast Master', 'Maestro del Banquete', 'chef|🍗'],
      ['Fiddlin\' Fern', 'Festival Caller', 'Animadora del Festival', 'cowboy|🎻'],
      ['Grace Thankful', 'Foundation Chair', 'Presidenta de la Fundación', 'pilgrim|🙏']
    ],
    cards: [
      ['🦃', 'Golden Turkey', 'Pavo Dorado'], ['🥧', 'Perfect Pumpkin Pie', 'Tarta de Calabaza Perfecta'], ['🌽', 'Harvest Corn', 'Maíz de Cosecha'],
      ['🍁', 'Maple Leaf', 'Hoja de Arce'], ['🧺', 'Cornucopia', 'Cornucopia'], ['🍂', 'Autumn Wreath', 'Corona de Otoño']
    ],
    news: [
      ['Turkey pardoned, starts consulting business', 'Indultan a un pavo, que abre una consultora'],
      ['Nation\'s gravy reserves dip to critical levels', 'Las reservas nacionales de salsa bajan a niveles críticos'],
      ['Uncle\'s story about the one time reaches hour three', 'La anécdota del tío sobre «aquella vez» llega a la tercera hora']
    ]
  });

  add({
    id: 'winter', cat: 'Holidays', emoji: '⛄', sym: '❄', accent: '#3aa0d8', bg: ['#040d1f', '#16386b', '#e8f6ff'],
    music: 'ambient', catcher: '🦌', boost: 5, window: ['12-01', '02-10'], pins: ['12-24'],
    name: ['Winter Wonderland', 'País de las Maravillas Invernal'],
    title: ['Snow much profit', 'Tanta ganancia como nieve'],
    currency: ['Snow Globes', 'Bolas de Nieve'],
    intro: ['Let it snow! Skating rinks, cozy cabins and twinkling lights are waiting. Three days to build the merriest winter village anywhere.',
      '¡Que nieve! Pistas de patinaje, cabañas acogedoras y luces brillantes te esperan. Tres días para crear la aldea invernal más alegre.'],
    biz: [
      ['⛄', 'Snowman Workshop', 'Taller de Muñecos de Nieve', 'Carrot noses in bulk.', 'Narices de zanahoria al por mayor.'],
      ['☕', 'Hot Cider Cart', 'Carrito de Sidra Caliente', 'Cinnamon stick included.', 'Rama de canela incluida.'],
      ['⛸️', 'Ice Skating Rink', 'Pista de Patinaje', 'Triple axels at triple prices.', 'Triples axel a triple precio.'],
      ['🧣', 'Cozy Sweater Knitters', 'Tejedores de Jerséis', 'Delightfully questionable patterns.', 'Estampados deliciosamente dudosos.'],
      ['🛷', 'Sledding Hill', 'Colina de Trineos', 'Wheeee! (Per ride.)', '¡Yujuuu! (Por viaje.)'],
      ['🍪', 'Gingerbread Bakery', 'Panadería de Jengibre', 'Gumdrop buttons, hand placed.', 'Botones de gominola puestos a mano.'],
      ['✨', 'Twinkle Light Festival', 'Festival de Luces', 'Visible from the space station.', 'Visible desde la estación espacial.'],
      ['🏔️', 'Ski Lodge Resort', 'Resort de Esquí', 'Fireplace, cocoa, slopes.', 'Chimenea, chocolate, pistas.'],
      ['🎁', 'Gift Wrapping Megacenter', 'Megacentro de Envolver Regalos', 'Perfect corners, every time.', 'Esquinas perfectas, siempre.'],
      ['🏰', 'Ice Palace', 'Palacio de Hielo', 'Glittering halls of frozen splendor.', 'Salones relucientes de esplendor helado.']
    ],
    mgr: [
      ['Frosty Carrotnose', 'Snow Sculptor', 'Escultor de Nieve', 'beanie|⛄'],
      ['Cinnamon Stickley', 'Cider Brewer', 'Sidrera', 'beanie|☕'],
      ['Axel Glidewell', 'Rink Manager', 'Gerente de la Pista', 'beanie|⛸️'],
      ['Nana Purlstitch', 'Master Knitter', 'Maestra Tejedora', 'bonnet|🧣'],
      ['Speedy Toboggan', 'Hill Patrol', 'Patrulla de la Colina', 'beanie|🛷'],
      ['Ginger Snapworth', 'Head Baker', 'Pastelera Jefa', 'chef|🍪'],
      ['Twinkle Brightside', 'Lights Director', 'Director de Luces', 'santa|✨'],
      ['Powder Pete', 'Lodge Host', 'Anfitrión del Resort', 'beanie|🏔️'],
      ['Ribbon Bowsworth', 'Wrap Supervisor', 'Supervisora de Envoltorios', 'santa|🎁'],
      ['Queen Snowdrift', 'Palace Monarch', 'Monarca del Palacio', 'crown|❄️']
    ],
    cards: [
      ['⛄', 'Top-Hat Snowman', 'Muñeco de Nieve con Chistera'], ['🦌', 'Red-Nosed Reindeer', 'Reno de Nariz Roja'], ['🎁', 'Mystery Gift', 'Regalo Misterioso'],
      ['❄️', 'Crystal Snowflake', 'Copo de Cristal'], ['🔔', 'Silver Sleigh Bell', 'Cascabel de Plata'], ['🕯️', 'Winter Candle', 'Vela de Invierno']
    ],
    news: [
      ['Snowman wins beauty contest, melts with joy', 'Un muñeco de nieve gana un concurso de belleza y se derrite de alegría'],
      ['Ugly sweater declared national treasure', 'Declaran tesoro nacional un jersey feo'],
      ['Reindeer demand flight hazard pay', 'Los renos exigen plus de peligrosidad por volar']
    ]
  });

  add({
    id: 'newyear', cat: 'Holidays', emoji: '🥳', sym: '🎉', accent: '#c9a0ff', bg: ['#07051a', '#2a1f5a', '#ffd86b'],
    music: 'fest', catcher: '🎉', boost: 8, window: ['12-27', '01-06'], pins: ['12-31'],
    name: ['New Year Countdown', 'Cuenta Atrás de Año Nuevo'],
    title: ['10… 9… 8… profit!', '10… 9… 8… ¡ganancias!'],
    currency: ['Confetti Cash', 'Dinero Confeti'],
    intro: ['Out with the old, in with the gold! Throw the biggest countdown party the galaxy has ever seen. Three days until the ball drops.',
      '¡Fuera lo viejo, que entre el oro! Monta la mayor fiesta de cuenta atrás que ha visto la galaxia. Tres días hasta que caiga la bola.'],
    biz: [
      ['🎊', 'Confetti Cannon Co.', 'Cañones de Confeti', 'Cleanup crew sold separately.', 'Equipo de limpieza aparte.'],
      ['🥳', 'Party Hat Factory', 'Fábrica de Gorros de Fiesta', 'Elastic strap of destiny.', 'La goma elástica del destino.'],
      ['📯', 'Noisemaker Workshop', 'Taller de Matasuegras', 'Maximum toot.', 'Pitido máximo.'],
      ['🍾', 'Sparkling Cider Cellar', 'Bodega de Sidra Espumosa', 'Pop, fizz, cheers.', 'Pop, burbujas, salud.'],
      ['🎆', 'Midnight Fireworks', 'Fuegos de Medianoche', 'Twelve bangs at twelve.', 'Doce estallidos a las doce.'],
      ['🕺', 'Disco Ballroom', 'Salón Disco', 'Mirror ball the size of a moon.', 'Bola de espejos del tamaño de una luna.'],
      ['📝', 'Resolution Coaching', 'Coaching de Propósitos', 'This year, for real.', 'Este año, de verdad.'],
      ['📺', 'Countdown Broadcast', 'Retransmisión de la Cuenta Atrás', 'Watched in every time zone, twice.', 'Vista en cada huso horario, dos veces.'],
      ['🏙️', 'Times Plaza Ball Drop', 'Caída de la Bola en la Plaza', 'The world\'s shiniest gravity.', 'La gravedad más brillante del mundo.'],
      ['⏳', 'Year Vault', 'Bóveda del Año', 'Stores 365 days of good luck.', 'Guarda 365 días de buena suerte.']
    ],
    mgr: [
      ['Poppy Blastwell', 'Cannon Captain', 'Capitana de Cañones', 'headband|🎊'],
      ['Conehead Carl', 'Hat Engineer', 'Ingeniero de Gorros', 'partyhat|🥳'],
      ['Tooty McHonk', 'Noise Director', 'Director de Ruido', 'partyhat|📯'],
      ['Bubbles Fizzington', 'Cellar Master', 'Maestra Bodeguera', 'tophat|🍾'],
      ['Sparky Midnight', 'Pyrotechnician', 'Pirotécnico', 'hardhat|🎆'],
      ['Disco Dolores', 'Dance Captain', 'Capitana de Baile', 'headband|🕺'],
      ['Coach Resolute', 'Life Coach', 'Coach de Vida', 'cap|📝'],
      ['Chuck Countdown', 'Broadcast Host', 'Presentador de la Retransmisión', 'headset|📺'],
      ['Mayor Balldrop', 'Plaza Mayor', 'Alcalde de la Plaza', 'tophat|🏙️'],
      ['Father Time Jr.', 'Keeper of the Year', 'Guardián del Año', 'wizard|⏳']
    ],
    cards: [
      ['🎆', 'Midnight Firework', 'Fuego de Medianoche'], ['🥂', 'Crystal Toast', 'Brindis de Cristal'], ['🪩', 'Disco Ball', 'Bola de Discoteca'],
      ['⏰', 'Countdown Clock', 'Reloj de Cuenta Atrás'], ['📜', 'Resolution Scroll', 'Pergamino de Propósitos'], ['🌟', 'Lucky Star', 'Estrella de la Suerte']
    ],
    news: [
      ['Resolution to "go to the gym" survives record 2 days', 'El propósito de «ir al gimnasio» dura un récord de 2 días'],
      ['Confetti still falling from last year\'s party', 'Sigue cayendo confeti de la fiesta del año pasado'],
      ['Clock refuses to strike midnight, wants to stay young', 'Un reloj se niega a dar la medianoche: quiere seguir joven']
    ]
  });

  add({
    id: 'hearts', cat: 'Holidays', emoji: '💘', sym: '💗', accent: '#ff4f86', bg: ['#1f0510', '#6b1438', '#ffb3cf'],
    music: 'fest', catcher: '💌', boost: 4, window: ['02-01', '02-20'], pins: ['02-14'],
    name: ['Sweetheart Social', 'Fiesta de los Enamorados'],
    title: ['Love is in the air (and so are profits)', 'Hay amor en el aire (y también ganancias)'],
    currency: ['Heartbeats', 'Latidos'],
    intro: ['Roses are red, violets are blue, this event is three days and all about you! Spread the love — and sell a lot of chocolate.',
      'Las rosas son rojas, las violetas azules, este evento dura tres días y es para ti. ¡Reparte amor y vende mucho chocolate!'],
    biz: [
      ['💌', 'Love Letter Stationery', 'Papelería de Cartas de Amor', 'Scented, sealed, delivered.', 'Perfumada, sellada, entregada.'],
      ['🌹', 'Rose Garden', 'Jardín de Rosas', 'A dozen for every sweetheart.', 'Una docena para cada enamorado.'],
      ['🍫', 'Chocolate Box Factory', 'Fábrica de Bombones', 'Nobody knows which one is caramel.', 'Nadie sabe cuál es el de caramelo.'],
      ['🧸', 'Teddy Bear Workshop', 'Taller de Osos de Peluche', 'Hug-tested, heart-approved.', 'Probados con abrazos, aprobados por el corazón.'],
      ['🎻', 'Serenade Service', 'Servicio de Serenatas', 'Violins on demand.', 'Violines bajo demanda.'],
      ['🍝', 'Candlelit Bistro', 'Bistró a la Luz de las Velas', 'Share one noodle, split the bill.', 'Compartid un fideo, pagad a medias.'],
      ['💃', 'Ballroom Dance Hall', 'Salón de Baile', 'Two left feet welcome.', 'Se admiten dos pies izquierdos.'],
      ['💍', 'Jewelry Boutique', 'Joyería', 'Put a ring on the balance sheet.', 'Ponle un anillo al balance.'],
      ['🎡', 'Tunnel of Love Park', 'Parque del Túnel del Amor', 'Swan boats, dim lights.', 'Barcas de cisne, luces tenues.'],
      ['🏰', 'Fairytale Wedding Castle', 'Castillo de Bodas de Cuento', 'Happily ever after, fully booked.', 'Felices para siempre, completo.']
    ],
    mgr: [
      ['Penny Paperheart', 'Stationer', 'Papelera', 'flower|💌'],
      ['Rosalind Thornless', 'Head Gardener', 'Jardinera Jefa', 'flower|🌹'],
      ['Coco Truffleworth', 'Chocolatier', 'Chocolatero', 'chef|🍫'],
      ['Snuggles McFluff', 'Bear Builder', 'Constructor de Osos', 'beanie|🧸'],
      ['Violetta Strings', 'Lead Violinist', 'Violinista Principal', 'flower|🎻'],
      ['Chef Amore', 'Bistro Chef', 'Chef del Bistró', 'chef|🍝'],
      ['Tango Twinkletoes', 'Dance Master', 'Maestro de Baile', 'tophat|💃'],
      ['Diamond Dazzle', 'Jeweler', 'Joyera', 'crown|💍'],
      ['Cupid Swanley', 'Park Manager', 'Gerente del Parque', 'headband|💘'],
      ['Duchess Everafter', 'Castle Hostess', 'Anfitriona del Castillo', 'crown|🏰']
    ],
    cards: [
      ['💘', 'Cupid\'s Arrow', 'Flecha de Cupido'], ['🌹', 'Eternal Rose', 'Rosa Eterna'], ['🍫', 'Heart-Shaped Box', 'Caja con Forma de Corazón'],
      ['💌', 'Secret Admirer Note', 'Nota del Admirador Secreto'], ['🧸', 'Cuddle Bear', 'Oso Abrazable'], ['💍', 'Promise Ring', 'Anillo de Promesa']
    ],
    news: [
      ['Cupid misses, hits tax auditor; auditor very happy', 'Cupido falla y acierta a un inspector de Hacienda, que está encantado'],
      ['Rose prices bloom 400%', 'El precio de las rosas florece un 400 %'],
      ['Chocolate box contains all caramel; nation rejoices', 'Una caja de bombones es toda de caramelo; el país lo celebra']
    ]
  });

  add({
    id: 'clover', cat: 'Holidays', emoji: '🍀', sym: '☘', accent: '#2fbf5a', bg: ['#031a0c', '#0f5a2e', '#b4f5a0'],
    music: 'fest', catcher: '🌈', boost: 7, window: ['03-01', '03-22'], pins: ['03-17'],
    name: ['Lucky Clover Carnival', 'Carnaval del Trébol de la Suerte'],
    title: ['Pots of gold at every rainbow', 'Ollas de oro en cada arcoíris'],
    currency: ['Lucky Coins', 'Monedas de la Suerte'],
    intro: ['Top of the morning, President! Rainbows are sprouting everywhere and each one ends in a business opportunity. Three lucky days — go green!',
      '¡Buenos días, Presidente! Brotan arcoíris por todas partes y cada uno acaba en una oportunidad de negocio. Tres días de suerte: ¡hazte verde!'],
    biz: [
      ['🍀', 'Four-Leaf Clover Farm', 'Granja de Tréboles de Cuatro Hojas', 'Lucky, by the acre.', 'Suerte por hectáreas.'],
      ['🎩', 'Green Hat Haberdashery', 'Sombrerería Verde', 'Buckles polished to a shine.', 'Hebillas pulidas y brillantes.'],
      ['🥔', 'Potato Feast Kitchen', 'Cocina del Banquete de Patatas', 'Mashed, fried, roasted, loved.', 'En puré, fritas, asadas, adoradas.'],
      ['🎻', 'Fiddle & Jig Pub', 'Pub de Violín y Giga', 'Dance until your shoes give up.', 'Baila hasta que se rindan los zapatos.'],
      ['🌈', 'Rainbow Bridge Tours', 'Tours por el Puente Arcoíris', 'Walk every color.', 'Camina por cada color.'],
      ['🥁', 'Bagpipe Parade', 'Desfile de Gaitas', 'Loud, proud and plaid.', 'Ruidoso, orgulloso y a cuadros.'],
      ['🏞️', 'Emerald Valley Resort', 'Resort del Valle Esmeralda', 'Forty shades of green.', 'Cuarenta tonos de verde.'],
      ['🏺', 'Pot of Gold Bank', 'Banco de la Olla de Oro', 'Found at the end of every rainbow.', 'Al final de cada arcoíris.'],
      ['🏰', 'Castle of Blarney-ish', 'Castillo de la Palabrería', 'Kiss the stone, gain the gab.', 'Besa la piedra, gana labia.'],
      ['✨', 'Leprechaun Treasury', 'Tesoro de los Duendes', 'Guarded by very small, very fast guards.', 'Custodiado por guardias muy pequeños y rápidos.']
    ],
    mgr: [
      ['Clover McLucky', 'Farm Keeper', 'Granjero', 'cap|🍀'],
      ['Buckles O\'Brimm', 'Hatter', 'Sombrerero', 'tophat|🎩'],
      ['Spud Mashington', 'Head Cook', 'Cocinero Jefe', 'chef|🥔'],
      ['Jiggy Fiddlesworth', 'Pub Fiddler', 'Violinista del Pub', 'beanie|🎻'],
      ['Rainbow Rory', 'Bridge Guide', 'Guía del Puente', 'headband|🌈'],
      ['Piper McDrone', 'Parade Leader', 'Líder del Desfile', 'bandcap|🥁'],
      ['Emerald Isla', 'Resort Owner', 'Dueña del Resort', 'flower|🏞️'],
      ['Goldie Potsworth', 'Bank Manager', 'Directora del Banco', 'tophat|🏺'],
      ['Sir Gabby Stone', 'Castle Keeper', 'Guardián del Castillo', 'crown|🏰'],
      ['Seamus Shamrock', 'Chief Leprechaun', 'Duende Jefe', 'tophat|✨']
    ],
    cards: [
      ['🍀', 'Four-Leaf Clover', 'Trébol de Cuatro Hojas'], ['🌈', 'Double Rainbow', 'Arcoíris Doble'], ['🏺', 'Pot of Gold', 'Olla de Oro'],
      ['🎩', 'Buckled Top Hat', 'Chistera con Hebilla'], ['🪙', 'Lucky Coin', 'Moneda de la Suerte'], ['🧚', 'Wee Folk Charm', 'Amuleto de los Duendes']
    ],
    news: [
      ['Leprechaun opens savings account; bank now very lucky', 'Un duende abre una cuenta de ahorros; el banco ahora tiene mucha suerte'],
      ['River dyed green, fish unbothered', 'Tiñen el río de verde; los peces ni se inmutan'],
      ['Rainbow ends in a parking lot; gold still there', 'Un arcoíris termina en un aparcamiento; el oro sigue ahí']
    ]
  });

  add({
    id: 'spring', cat: 'Holidays', emoji: '🌸', sym: '🌷', accent: '#f58ac0', bg: ['#1a0a18', '#5a2a5a', '#ffd6ec'],
    music: 'ambient', catcher: '🐝', boost: 5, window: ['03-20', '05-31'], pins: ['04-04'],
    name: ['Spring Blossom Fair', 'Feria de la Flor de Primavera'],
    title: ['Everything\'s coming up profits', 'Todo florece en ganancias'],
    currency: ['Petals', 'Pétalos'],
    intro: ['The flowers are blooming and the bunnies are busy! Plant gardens, hunt for eggs and throw the brightest spring fair ever. Three days in full bloom.',
      '¡Florecen las flores y los conejitos no paran! Planta jardines, busca huevos y monta la feria de primavera más colorida. Tres días en plena floración.'],
    biz: [
      ['🌱', 'Seedling Nursery', 'Vivero de Plantones', 'Tiny plants, big dreams.', 'Plantas pequeñas, grandes sueños.'],
      ['🌷', 'Tulip Stand', 'Puesto de Tulipanes', 'Every color of the rainbow.', 'Todos los colores del arcoíris.'],
      ['🐝', 'Honeybee Apiary', 'Colmenar', 'Buzzing with productivity.', 'Zumbando de productividad.'],
      ['🥚', 'Egg Hunt Park', 'Parque de Búsqueda de Huevos', 'We hid 10,000. We found 9,998.', 'Escondimos 10.000. Encontramos 9.998.'],
      ['🐰', 'Bunny Petting Farm', 'Granja de Conejitos', 'Softest business on Earth.', 'El negocio más suave del mundo.'],
      ['🪁', 'Kite Festival', 'Festival de Cometas', 'Strings attached, profits soaring.', 'Con hilos, pero las ganancias vuelan.'],
      ['🌸', 'Cherry Blossom Boulevard', 'Bulevar de los Cerezos', 'Pink petals as far as you can see.', 'Pétalos rosas hasta donde alcanza la vista.'],
      ['🦋', 'Butterfly Conservatory', 'Mariposario', 'Metamorphosis, on schedule.', 'Metamorfosis, puntual.'],
      ['🎨', 'Flower Show Pavilion', 'Pabellón de la Exposición Floral', 'Blue ribbons for every bloom.', 'Lazos azules para cada flor.'],
      ['🏵️', 'Royal Botanical Garden', 'Jardín Botánico Real', 'Rarest flowers in the known world.', 'Las flores más raras del mundo conocido.']
    ],
    mgr: [
      ['Sprout Greenthumb', 'Nursery Keeper', 'Encargado del Vivero', 'cap|🌱'],
      ['Tulip Van Bloom', 'Florist', 'Florista', 'flower|🌷'],
      ['Queenie Buzzworth', 'Beekeeper', 'Apicultora', 'pith|🐝'],
      ['Eggbert Hideaway', 'Hunt Master', 'Maestro de la Búsqueda', 'bunny|🥚'],
      ['Clover Cottontail', 'Farm Keeper', 'Granjera', 'bunny|🐰'],
      ['Breezy Highflier', 'Festival Chair', 'Presidente del Festival', 'cap|🪁'],
      ['Sakura Petalwind', 'Boulevard Curator', 'Curadora del Bulevar', 'flower|🌸'],
      ['Chrys Alis', 'Conservatory Director', 'Directora del Mariposario', 'flower|🦋'],
      ['Judge Petalworth', 'Show Judge', 'Juez de la Exposición', 'tophat|🎨'],
      ['Lady Wisteria', 'Royal Gardener', 'Jardinera Real', 'crown|🏵️']
    ],
    cards: [
      ['🌸', 'Cherry Blossom Branch', 'Rama de Cerezo'], ['🐰', 'Spring Bunny', 'Conejito de Primavera'], ['🥚', 'Golden Egg', 'Huevo Dorado'],
      ['🐝', 'Queen Bee', 'Abeja Reina'], ['🌷', 'Rainbow Tulip', 'Tulipán Arcoíris'], ['🪺', 'Robin\'s Nest', 'Nido de Petirrojo']
    ],
    news: [
      ['Last two eggs from the hunt found in 2031, still fine', 'Los dos últimos huevos de la búsqueda aparecen en 2031, aún bien'],
      ['Bees go on strike, demand more flowers', 'Las abejas hacen huelga y exigen más flores'],
      ['Pollen count reaches "yes"', 'El índice de polen alcanza el nivel «sí»']
    ]
  });

  add({
    id: 'beach', cat: 'Holidays', emoji: '🏖️', sym: '🐚', accent: '#1fc2d6', bg: ['#02202b', '#0b6b8a', '#ffe9a0'],
    music: 'fest', catcher: '🦀', boost: 6, window: ['06-01', '08-31'],
    name: ['Beach Bash', 'Fiesta en la Playa'],
    title: ['Surf, sand and sunny profits', 'Surf, arena y ganancias soleadas'],
    currency: ['Sand Dollars', 'Dólares de Arena'],
    intro: ['Summer\'s here, President! Grab your sunscreen and build the ultimate beach getaway. Three days of sun, surf and serious business.',
      '¡Llegó el verano, Presidente! Coge la crema solar y crea la escapada de playa definitiva. Tres días de sol, surf y negocios serios.'],
    biz: [
      ['🍦', 'Ice Cream Truck', 'Camión de Helados', 'The song never stops.', 'La canción nunca se detiene.'],
      ['⛱️', 'Umbrella Rentals', 'Alquiler de Sombrillas', 'Shade: the ultimate luxury.', 'Sombra: el lujo definitivo.'],
      ['🏐', 'Beach Volleyball Courts', 'Canchas de Vóley Playa', 'Bump, set, profit.', 'Recibe, coloca, ¡ganancia!'],
      ['🏰', 'Sandcastle Contest', 'Concurso de Castillos de Arena', 'Moats fill up fast.', 'Los fosos se llenan rápido.'],
      ['🏄', 'Surf Shop', 'Tienda de Surf', 'Wax on, wave on.', 'Cera puesta, ola hecha.'],
      ['🛥️', 'Jet Ski Rentals', 'Alquiler de Motos de Agua', 'Vroom, splash, repeat.', 'Brum, chapuzón, repetir.'],
      ['🍹', 'Tiki Bar', 'Bar Tiki', 'Tiny umbrellas, big tips.', 'Sombrillitas pequeñas, propinas grandes.'],
      ['🎢', 'Boardwalk Amusement Pier', 'Muelle de Atracciones', 'Roller coaster over the waves.', 'Montaña rusa sobre las olas.'],
      ['🛳️', 'Sunset Cruise Line', 'Cruceros al Atardecer', 'Golden hour, all day.', 'Hora dorada todo el día.'],
      ['🏝️', 'Tropical Mega Resort', 'Megaresort Tropical', 'All-inclusive, all summer.', 'Todo incluido, todo el verano.']
    ],
    mgr: [
      ['Mister Softserve', 'Truck Driver', 'Conductor del Camión', 'cap|🍦'],
      ['Shady Sunnyside', 'Rental Clerk', 'Encargada de Alquileres', 'cap|⛱️'],
      ['Spike Sandsworth', 'Court Captain', 'Capitán de Cancha', 'headband|🏐'],
      ['Turret Tidewell', 'Contest Judge', 'Jueza del Concurso', 'pith|🏰'],
      ['Dude Wavesworth', 'Shop Owner', 'Dueño de la Tienda', 'bandana|🏄'],
      ['Zoomie Splashton', 'Fleet Captain', 'Capitana de la Flota', 'cap|🛥️'],
      ['Tiki Tom', 'Head Mixologist', 'Coctelero Jefe', 'flower|🍹'],
      ['Carny Coastline', 'Pier Manager', 'Gerente del Muelle', 'tophat|🎢'],
      ['Captain Goldenhour', 'Cruise Captain', 'Capitán de Crucero', 'cap|🛳️'],
      ['Sunny Paradise', 'Resort Owner', 'Dueña del Resort', 'crown|🏝️']
    ],
    cards: [
      ['🏖️', 'Perfect Beach Day', 'Día de Playa Perfecto'], ['🐚', 'Singing Seashell', 'Concha Cantora'], ['🦀', 'Dancing Crab', 'Cangrejo Bailarín'],
      ['🏄', 'Golden Surfboard', 'Tabla de Surf Dorada'], ['🌅', 'Endless Sunset', 'Atardecer Infinito'], ['🏰', 'Champion Sandcastle', 'Castillo de Arena Campeón']
    ],
    news: [
      ['Sandcastle granted historic landmark status, then tide comes in', 'Declaran monumento histórico un castillo de arena; luego sube la marea'],
      ['Seagull steals entire boardwalk\'s fries', 'Una gaviota roba las patatas fritas de todo el paseo'],
      ['Ice cream truck song now stuck in 40 million heads', 'La canción del camión de helados, atascada en 40 millones de cabezas']
    ]
  });
  add({
    id: 'election', cat: 'Holidays', emoji: '🗳️', sym: '🗳️', accent: '#c8102e', bg: ['#070b1f', '#1b2a5c', '#f5c518'],
    music: 'march', catcher: '🦅', boost: 7, window: ['10-20', '11-08'], pins: ['11-03'],
    name: ['Election Night', 'Noche Electoral'],
    title: ['Too close to call', 'Demasiado reñido'],
    currency: ['Ballots', 'Papeletas'],
    intro: ['The polls are open and the pundits are sweating! Plant the yard signs, count every ballot and survive the longest night in politics. Three days, results may vary.',
      '¡Las urnas están abiertas y los tertulianos sudan! Planta carteles, cuenta cada papeleta y sobrevive a la noche más larga de la política. Tres días; los resultados pueden variar.'],
    biz: [
      ['🪧', 'Yard Sign Stand', 'Puesto de Carteles', 'One on every lawn.', 'Uno en cada jardín.'],
      ['🍩', 'Volunteer Donut Run', 'Donas de Voluntarios', 'Campaigns run on sprinkles.', 'Las campañas funcionan con chispas.'],
      ['📞', 'Phone Bank', 'Central Telefónica', 'Sorry to call during dinner.', 'Perdón por llamar en la cena.'],
      ['🚪', 'Door-Knocking Crew', 'Brigada Puerta a Puerta', 'Hi! Got a minute?', '¡Hola! ¿Tiene un minuto?'],
      ['🎈', 'Rally Arena', 'Estadio de Mítines', 'Balloons, confetti, echo.', 'Globos, confeti, eco.'],
      ['🗳️', 'Polling Station', 'Centro de Votación', '"I Voted" stickers, bulk order.', 'Pegatinas «Yo voté», al por mayor.'],
      ['🚌', 'Swing State Tour Bus', 'Autobús de Estados Clave', 'Every diner in every county.', 'Cada cafetería de cada condado.'],
      ['📺', 'Election Night Studio', 'Estudio Electoral', 'Giant touchscreen, bigger map.', 'Pantalla gigante, mapa mayor.'],
      ['📊', 'Exit Poll Institute', 'Instituto de Sondeos', 'Margin of error: yes.', 'Margen de error: sí.'],
      ['🏛️', 'Recount Headquarters', 'Cuartel del Recuento', 'Counting until it counts.', 'Contando hasta que cuente.']
    ],
    mgr: [
      ['Signa Lawnsworth', 'Yard Sign Captain', 'Capitana de Carteles', 'cap|🪧'],
      ['Sprinkles McVolunteer', 'Donut Coordinator', 'Coordinador de Donas', 'bandcap|🍩'],
      ['Dialtone Dave', 'Phone Bank Boss', 'Jefe de la Central', 'headset|📞'],
      ['Knock-Knock Nancy', 'Canvass Leader', 'Líder de Calle', 'beanie|🚪'],
      ['Rally Van Cheer', 'Hype Manager', 'Animador de Mítines', 'partyhat|🎈'],
      ['Poll Worker Pat', 'Station Captain', 'Jefa de Casilla', 'cap|🗳️'],
      ['Swingin\' Sam', 'Tour Bus Driver', 'Conductor del Autobús', 'cowboy|🚌'],
      ['Anchor Map-Touch', 'Election Night Anchor', 'Presentador Electoral', 'headset|📺'],
      ['Margin O\'Error', 'Chief Pollster', 'Encuestador Jefe', 'tophat|📊'],
      ['Recount Rosa', 'Recount Commissioner', 'Comisionada del Recuento', 'samhat|🏛️']
    ],
    cards: [
      ['🗳️', 'Golden Ballot', 'Papeleta Dorada'], ['🏷️', '"I Voted" Sticker', 'Pegatina «Yo voté»'], ['🪧', 'Classic Yard Sign', 'Cartel Clásico'],
      ['🗺️', 'Election Night Map', 'Mapa Electoral'], ['🎉', 'Victory Confetti', 'Confeti de la Victoria'], ['📊', 'Perfect Poll', 'Encuesta Perfecta']
    ],
    news: [
      ['Pundit predicts result, then its exact opposite, just in case', 'Un tertuliano predice el resultado y, por si acaso, lo contrario'],
      ['County counts final ballot; it was a grocery list', 'Un condado cuenta la última papeleta: era una lista de la compra'],
      ['Election-night touchscreen demands a union break', 'La pantalla táctil electoral exige un descanso sindical']
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
