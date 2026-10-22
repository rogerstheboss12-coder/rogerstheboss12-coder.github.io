/* Codex (#33): short parody bios for every main world, business and manager, English + Spanish.
 * Ids: 'w<world>', 'b<world>_<business>', 'm<world>_<manager>'. Entries unlock as you play (extras.js). */
(function (root) {
  'use strict';
  var C = {};
  function add(id, en, es) { C[id] = { en: en, es: es }; }

  // ---------- Earth ----------
  add('w0', 'Where it all began: one flag stand, one dream, and a suspicious amount of fireworks. Earth is small, but it has excellent pie.',
    'Donde todo empezó: un puesto de banderas, un sueño y una cantidad sospechosa de fuegos artificiales. La Tierra es pequeña, pero tiene un pastel excelente.');
  add('b0_0', 'The humble Flag Stand has waved continuously since 1776, pausing only once for a sneeze.', 'El humilde Puesto de Banderas ondea sin parar desde 1776; solo se detuvo una vez por un estornudo.');
  add('b0_1', 'Every eagle hatched here is issued a tiny sash and a strong opinion about freedom.', 'Cada águila que nace aquí recibe una banda diminuta y una opinión firme sobre la libertad.');
  add('b0_2', 'The secret recipe is locked in a vault next to the Constitution. The pie is better guarded.', 'La receta secreta está en una bóveda junto a la Constitución. El pastel está mejor vigilado.');
  add('b0_3', 'Safety inspectors visit yearly. They mostly just say "ooooh."', 'Los inspectores de seguridad vienen cada año. Sobre todo dicen "¡ooooh!".');
  add('b0_4', 'Every Sunday the trucks crush cars, records and, occasionally, expectations.', 'Cada domingo los camiones aplastan coches, récords y, de vez en cuando, expectativas.');
  add('b0_5', 'Runs 24 hours a day, mostly reporting on how long it has been running.', 'Emite las 24 horas del día, sobre todo informando de cuánto tiempo lleva emitiendo.');
  add('b0_6', 'Drills so deep it occasionally strikes other countries\' oil. Apologies are sent by fruit basket.', 'Perfora tan hondo que a veces encuentra petróleo de otros países. Se disculpa con cestas de fruta.');
  add('b0_7', 'Currently filming "Fireworks 12: The Fuse Awakens." Critics say it is loud.', 'Ahora rueda "Fuegos 12: La mecha despierta". La crítica dice que es ruidosa.');
  add('b0_8', 'The printer goes brrr. Economists go "hmm." Shareholders go "yay."', 'La impresora hace brrr. Los economistas dicen "hmm". Los accionistas dicen "¡bien!".');
  add('b0_9', 'Started as a model-rocket club. Nobody told them there was a limit.', 'Empezó como un club de cohetes de juguete. Nadie les dijo que había un límite.');
  add('m0_0', 'George Washingtun cannot tell a lie, which makes him a terrible poker player and an excellent flag salesman.', 'George Washingtun no sabe mentir: pésimo jugador de póquer, excelente vendedor de banderas.');
  add('m0_1', 'Teddy Roosebolt speaks softly and carries a very big bag of birdseed.', 'Teddy Roosebolt habla bajito y lleva una bolsa enorme de alpiste.');
  add('m0_2', 'Abe Lincorn keeps important documents in his hat. Also a slice of pie. Also a spare hat.', 'Abe Lincorn guarda documentos importantes en su sombrero. También un trozo de pastel. Y otro sombrero.');
  add('m0_3', 'Thomas Jeffersong wrote the Declaration of Boom in a single afternoon, then lit it.', 'Thomas Jeffersong escribió la Declaración del Bum en una tarde y luego la encendió.');
  add('m0_4', 'Ronald Raygun can make any announcement sound like the trailer for a blockbuster.', 'Ronald Raygun consigue que cualquier anuncio suene a tráiler de superproducción.');
  add('m0_5', 'Richard Nixin\' insists every broadcast is recorded. Every. Single. One.', 'Richard Nixin\' insiste en grabar todas las emisiones. Todas. Cada una.');
  add('m0_6', 'Dwight D. Eisenhauler plans every drilling operation like a five-star invasion.', 'Dwight D. Eisenhauler planea cada perforación como una invasión de cinco estrellas.');
  add('m0_7', 'Jack F. Kennedazzle chose to run Hollywood not because it is easy, but because it is glamorous.', 'Jack F. Kennedazzle eligió dirigir Hollywood no porque sea fácil, sino porque es glamuroso.');
  add('m0_8', 'Alexander Hamiltoon wrote 51 memos about the printer before breakfast. It still jams.', 'Alexander Hamiltoon escribió 51 memorandos sobre la impresora antes del desayuno. Sigue atascándose.');
  add('m0_9', 'Franklin D. Rocketvelt believes the only thing to fear is running out of rocket fuel.', 'Franklin D. Rocketvelt cree que lo único que hay que temer es quedarse sin combustible.');

  // ---------- Solar System ----------
  add('w1', 'Nine planets, one dwarf planet with a grudge, and zero sales tax. The Solar System is the Republic\'s first frontier.',
    'Nueve planetas, un planeta enano resentido y cero impuestos. El Sistema Solar es la primera frontera de la República.');
  add('b1_0', 'The hot dogs float, the buns float, the mustard floats. Customers have learned to chase lunch.', 'Las salchichas flotan, los panes flotan, la mostaza flota. Los clientes aprendieron a perseguir el almuerzo.');
  add('b1_1', 'In one-sixth gravity every kid is an Olympic jumper. Parents sign a very long waiver.', 'Con un sexto de gravedad, cada niño es saltador olímpico. Los padres firman un descargo larguísimo.');
  add('b1_2', 'Scientists were wrong for centuries. The Moon IS cheese. Mostly cheddar.', 'Los científicos se equivocaron durante siglos. La Luna SÍ es queso. Sobre todo cheddar.');
  add('b1_3', 'Mars cattle graze on terraformed grass and refuse to moo in low gravity.', 'El ganado marciano pasta hierba terraformada y se niega a mugir con poca gravedad.');
  add('b1_4', 'Each asteroid is inspected, polished and stamped "Property of the Republic."', 'Cada asteroide se inspecciona, se pule y se sella como "Propiedad de la República".');
  add('b1_5', 'The food court spans three orbits. Getting to the restrooms requires a launch window.', 'La zona de comidas ocupa tres órbitas. Para ir al baño hace falta una ventana de lanzamiento.');
  add('b1_6', 'Regular, premium or storm-grade hydrogen. The Great Red Spot is the car wash.', 'Hidrógeno normal, premium o de tormenta. La Gran Mancha Roja es el lavadero.');
  add('b1_7', 'All-inclusive, rings included (rings extra). Towels are gravitationally bound to the pool.', 'Todo incluido, anillos incluidos (anillos aparte). Las toallas están atadas por gravedad a la piscina.');
  add('b1_8', 'Sells sunlight by the month. The Sun has not been consulted.', 'Vende luz solar por mensualidades. Nadie consultó al Sol.');
  add('b1_9', 'A fence around the Sun. The Sun is technically now in a gated community.', 'Una valla alrededor del Sol. Técnicamente, el Sol vive ahora en una urbanización cerrada.');
  add('m1_0', 'Grover Grilland served two non-consecutive terms as Hot Dog Commissioner and considers it a personal brand.', 'Grover Grilland fue Comisionado de Perritos dos veces no consecutivas y lo considera su marca personal.');
  add('m1_1', 'Jimmy Cartwheel supervises bouncing with a big smile and a first-aid kit.', 'Jimmy Cartwheel supervisa los saltos con una gran sonrisa y un botiquín.');
  add('m1_2', 'Herbert Hooverboard glides between cheese caverns and promises a wheel in every cellar.', 'Herbert Hooverboard se desliza entre cavernas de queso y promete una rueda en cada sótano.');
  add('m1_3', 'Lyndon B. Ranchson calls every Martian cow by name and every cowboy "partner."', 'Lyndon B. Ranchson llama a cada vaca marciana por su nombre y a cada vaquero "socio".');
  add('m1_4', 'Gerald Ford-Drill has never tripped on an asteroid. He will tell you so, repeatedly.', 'Gerald Ford-Drill jamás ha tropezado con un asteroide. Te lo dirá una y otra vez.');
  add('m1_5', 'Warren G. Hard-Sell can upsell a spacesuit to an astronaut who is already wearing one.', 'Warren G. Hard-Sell puede venderle un traje espacial a un astronauta que ya lleva uno.');
  add('m1_6', 'James K. Polkadot promised four things and delivered all of them, plus a free air freshener.', 'James K. Polkadot prometió cuatro cosas y las cumplió todas, más un ambientador gratis.');
  add('m1_7', 'John Tiki Tyler greets every guest with a lei and a surprisingly long speech.', 'John Tiki Tyler recibe a cada huésped con un collar de flores y un discurso sorprendentemente largo.');
  add('m1_8', 'William McKinsolar wears sun visors on top of sun visors. Safety first.', 'William McKinsolar lleva viseras encima de viseras. La seguridad es lo primero.');
  add('m1_9', 'Harry S. Trumanaut keeps a sign on his desk: "The buck stops at the Sun."', 'Harry S. Trumanaut tiene un letrero en su mesa: "La responsabilidad se detiene en el Sol".');

  // ---------- Milky Way ----------
  add('w2', 'One hundred billion stars and, until recently, not a single diner. The Milky Way now has several. Aliens love the pancakes.',
    'Cien mil millones de estrellas y, hasta hace poco, ni una cafetería. Ahora la Vía Láctea tiene varias. A los alienígenas les encantan las tortitas.');
  add('b2_0', 'Visitors are asked to leave ray guns at the door and fill out a friendship form.', 'Se pide a los visitantes dejar las pistolas láser en la puerta y rellenar un formulario de amistad.');
  add('b2_1', 'Location, location, light-years. Every listing includes "close to a star."', 'Ubicación, ubicación, años luz. Todos los anuncios dicen "cerca de una estrella".');
  add('b2_2', 'Offers every color in the nebula, including three that human eyes cannot see.', 'Ofrece todos los colores de la nebulosa, incluidos tres que el ojo humano no ve.');
  add('b2_3', 'Bull riding in zero gravity: the bull and the rider both float away. Scores are generous.', 'Montar toros en gravedad cero: el toro y el jinete salen flotando. La puntuación es generosa.');
  add('b2_4', 'Test drives are strictly limited to three galaxies.', 'Las pruebas de manejo están limitadas a tres galaxias.');
  add('b2_5', 'Exact change only. Most drivers pay in comets.', 'Solo importe exacto. La mayoría paga con cometas.');
  add('b2_6', 'Every senator agrees with every other senator, because they are all the same senator.', 'Cada senador está de acuerdo con los demás, porque todos son el mismo senador.');
  add('b2_7', 'Talk radio at 700 pulses per second. Callers are placed on hold for light-years.', 'Radio de tertulia a 700 pulsos por segundo. Las llamadas esperan años luz.');
  add('b2_8', 'The house always wins, and then the house is spaghettified.', 'La casa siempre gana, y luego la casa se espaguetiza.');
  add('b2_9', 'Stars are hand-forged, polished and stamped "Made in the USA."', 'Las estrellas se forjan a mano, se pulen y se sellan "Hecho en EE. UU.".');
  add('m2_0', 'Senator Zorp has three hearts and gives all of them to public service.', 'El senador Zorp tiene tres corazones y todos los dedica al servicio público.');
  add('m2_1', 'James Monrover has a doctrine for everything, including which planets are "ours."', 'James Monrover tiene una doctrina para todo, incluso para decidir qué planetas son "nuestros".');
  add('m2_2', 'Martian Madison is the smallest commissioner in the galaxy and the loudest about paint.', 'Martian Madison es el comisionado más pequeño de la galaxia y el más ruidoso sobre la pintura.');
  add('m2_3', 'William Howard Taft-Off once got stuck in a zero-g hot tub. He calls it "floating research."', 'William Howard Taft-Off se quedó atascado una vez en un jacuzzi sin gravedad. Lo llama "investigación flotante".');
  add('m2_4', 'Ulysses S. Grantgravity closes every warp deal with a firm handshake and a cigar-shaped rocket.', 'Ulysses S. Grantgravity cierra cada venta con un apretón de manos y un cohete con forma de puro.');
  add('m2_5', 'Woodrow Wormhole-son has fourteen points about proper toll etiquette.', 'Woodrow Wormhole-son tiene catorce puntos sobre la etiqueta correcta en el peaje.');
  add('m2_6', 'Clone Washington #47 is majority leader. So are #1 through #46.', 'Clon Washington n.º 47 es líder de la mayoría. También del n.º 1 al 46.');
  add('m2_7', 'Grand Chancellor Gl\'orb hosts the loudest show in the galaxy. Literally: it is a pulsar.', 'El Gran Canciller Gl\'orb presenta el programa más ruidoso de la galaxia. Literalmente: es un púlsar.');
  add('m2_8', 'Andrew Jackpot never met a slot machine he couldn\'t lecture.', 'Andrew Jackpot nunca conoció una tragaperras a la que no pudiera sermonear.');
  add('m2_9', 'Robo-Lincoln 3000 was built to forge stars and to deliver the Gettysburg Address in binary.', 'Robo-Lincoln 3000 fue construido para forjar estrellas y recitar el Discurso de Gettysburg en binario.');

  // ---------- Known Universe ----------
  add('w3', 'Everything, everywhere, all incorporated. The Known Universe runs on dark matter, cosmic strings and very fine print.',
    'Todo, en todas partes, todo incorporado. El Universo Conocido funciona con materia oscura, cuerdas cósmicas y letra muy pequeña.');
  add('b3_0', 'No one has ever seen the product. Sales remain excellent.', 'Nadie ha visto nunca el producto. Las ventas siguen siendo excelentes.');
  add('b3_1', 'Visit 1776! Please do not step on any butterflies or founding fathers.', '¡Visita 1776! Por favor, no pises mariposas ni padres fundadores.');
  add('b3_2', 'Your savings, in every reality. Overdraft fees also in every reality.', 'Tus ahorros, en cada realidad. Las comisiones por descubierto, también.');
  add('b3_3', 'Cul-de-sacs the size of galaxies. The mail takes a while.', 'Callejones sin salida del tamaño de galaxias. El correo tarda un poco.');
  add('b3_4', 'Brighter than a trillion suns. The staff wear two pairs of sunglasses.', 'Más brillante que un billón de soles. El personal lleva dos pares de gafas de sol.');
  add('b3_5', 'The world\'s first yo-yo that walks the dog across spacetime.', 'El primer yoyó del mundo que pasea al perro a través del espaciotiempo.');
  add('b3_6', 'Covers heat death, cold death and "general weirdness." Claims department: closed.', 'Cubre la muerte térmica, la muerte fría y las "rarezas en general". Departamento de reclamaciones: cerrado.');
  add('b3_7', 'Nightly at 8. The opening scene is very, very loud.', 'Todas las noches a las 8. La primera escena es muy, muy ruidosa.');
  add('b3_8', 'The universe has an admin console. Please do not type "sudo."', 'El universo tiene consola de administración. Por favor, no escribas "sudo".');
  add('b3_9', 'We the Everyone, in order to form a more perfect Everything…', 'Nosotros, el Todo, a fin de formar un Todo más perfecto…');
  add('m3_0', 'Quantum Coolidge says very little, but in several states at once.', 'Quantum Coolidge habla muy poco, pero en varios estados a la vez.');
  add('m3_1', 'John Quincy Adams-Ant guides time tours and has personally met his father twelve times.', 'John Quincy Adams-Ant guía viajes en el tiempo y ha conocido a su padre doce veces.');
  add('m3_2', 'Martin Van Burenverse keeps an account in every reality. His sideburns have their own.', 'Martin Van Burenverse tiene una cuenta en cada realidad. Sus patillas tienen la suya propia.');
  add('m3_3', 'Chester A. Arthurverse zones suburbs by galaxy and mustache by mustache.', 'Chester A. Arthurverse urbaniza suburbios por galaxias, y bigotes por bigotes.');
  add('m3_4', 'Rutherford B. Hayesar operates the quasar and grows the beard to match.', 'Rutherford B. Hayesar opera el cuásar y se deja una barba a juego.');
  add('m3_5', 'Benjamin Harrisonic theorizes that every string eventually ties back to profit.', 'Benjamin Harrisonic sostiene que toda cuerda acaba atada a los beneficios.');
  add('m3_6', 'Millard Fillmore-verse has calculated the odds of everything. He is not telling.', 'Millard Fillmore-verse ha calculado las probabilidades de todo. No piensa decirlas.');
  add('m3_7', 'Zachary Taylor-Made directs the Big Bang reenactment in a sparkly suit.', 'Zachary Taylor-Made dirige la recreación del Big Bang con un traje brillante.');
  add('m3_8', 'The Admin has root access to reality. Please be nice to The Admin.', 'El Admin tiene acceso root a la realidad. Por favor, sé amable con el Admin.');
  add('m3_9', 'Cosmic Uncle Sam wants YOU — in every galaxy, dimension and timeline.', 'El Tío Sam Cósmico te quiere a TI, en cada galaxia, dimensión y línea temporal.');

  // ---------- The Multiverse ----------
  add('w4', 'Infinite Americas, each slightly different. In one, the eagle is a turkey. In another, you are the eagle. Business is booming in all of them.',
    'Infinitas Américas, cada una un poco distinta. En una, el águila es un pavo. En otra, tú eres el águila. El negocio prospera en todas.');
  add('b4_0', 'Souvenirs from timelines that never happened. The "Moon Is Cheese" mugs sell out.', 'Recuerdos de líneas temporales que nunca ocurrieron. Las tazas de "La Luna es queso" se agotan.');
  add('b4_1', 'One ticket parks your car in every reality. Finding it again is extra.', 'Un solo tique aparca tu coche en todas las realidades. Encontrarlo otra vez cuesta aparte.');
  add('b4_2', 'Every employee is you. Payroll is simple; meetings are awkward.', 'Cada empleado eres tú. La nómina es sencilla; las reuniones, incómodas.');
  add('b4_3', 'Butterflies flap here; hurricanes of profit form elsewhere. Very carefully fenced.', 'Las mariposas aletean aquí; en otra parte se forman huracanes de beneficios. Muy bien vallado.');
  add('b4_4', 'Every branching timeline passes through here. Exact change only, in any currency that exists somewhere.', 'Todas las líneas temporales pasan por aquí. Solo importe exacto, en cualquier moneda que exista en algún sitio.');
  add('b4_5', 'Films the "what if" of everything. "What If the Sequel Was Good" is in development.', 'Rueda el "¿y si…?" de todo. "¿Y si la secuela fuera buena?" está en desarrollo.');
  add('b4_6', 'Accidentally prevented your own birth? You\'re covered — retroactively.', '¿Evitaste tu propio nacimiento por accidente? Estás cubierto, con carácter retroactivo.');
  add('b4_7', 'Infinite monkeys, infinite typewriters. Mostly memos, occasionally Shakespeare.', 'Monos infinitos, máquinas de escribir infinitas. Sobre todo memorandos, a veces Shakespeare.');
  add('b4_8', 'Until you open the box, your sandwich is both perfect and a disaster.', 'Hasta que abres la caja, tu sándwich es a la vez perfecto y un desastre.');
  add('b4_9', 'Every America sends a delegate. Quorum is reached somewhere around infinity.', 'Cada América envía un delegado. El quórum se alcanza en algún punto cerca del infinito.');
  add('m4_0', 'John Adamsverse collects things that almost happened and argues with all of them.', 'John Adamsverse colecciona cosas que casi sucedieron y discute con todas ellas.');
  add('m4_1', 'William Henry Harri-Soon parks your car in a reality where his term lasted much longer.', 'William Henry Harri-Soon aparca tu coche en una realidad donde su mandato duró mucho más.');
  add('m4_2', 'Franklin Pierce-Through has met every one of his duplicates. They agree he is handsome.', 'Franklin Pierce-Through conoce a todos sus duplicados. Coinciden en que es guapo.');
  add('m4_3', 'James Buchanverse flaps the wings. Someone else, somewhere, deals with the consequences.', 'James Buchanverse agita las alas. Otra persona, en otro lugar, se ocupa de las consecuencias.');
  add('m4_4', 'Andrew Johnson Prime guards every branch point and keeps a very strict gate.', 'Andrew Johnson Prime vigila cada bifurcación y controla la puerta con mucha rigidez.');
  add('m4_5', 'James A. Garfold folds space so the studio can shoot every ending at once.', 'James A. Garfold pliega el espacio para que el estudio ruede todos los finales a la vez.');
  add('m4_6', 'Mirror Washington can tell a lie. He is very sorry about it. Mostly.', 'Mirror Washington sí sabe mentir. Lo siente mucho. Más o menos.');
  add('m4_7', 'Lincoln-B of Timeline 7 traded the beard for a handlebar mustache and never looked back.', 'Lincoln-B de la Línea Temporal 7 cambió la barba por un bigote de manillar y nunca miró atrás.');
  add('m4_8', 'President Timmy, Age 8, is in charge of opening the boxes. He takes it very seriously.', 'El presidente Timmy, de 8 años, se encarga de abrir las cajas. Se lo toma muy en serio.');
  add('m4_9', 'Auntie Sam wants you to finish your vegetables, then conquer infinity.', 'La Tía Sam quiere que te termines las verduras y luego conquistes el infinito.');

  root.GameData.CODEX = C;
})(typeof window !== 'undefined' ? window : globalThis);
