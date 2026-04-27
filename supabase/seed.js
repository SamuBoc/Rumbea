/**
 * Seed script - poblar Rumbea con establecimientos reales de Cali
 * Run: node supabase/seed.js
 */

const { createClient } = require('../apps/mobile/node_modules/@supabase/supabase-js');

const supabase = createClient(
  'https://lhvwubjppakhurwnyvfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxodnd1YmpwcGFraHVyd255dmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTU5OTMsImV4cCI6MjA5Mjc5MTk5M30.yMWguWRuppmwW7hWetvGg8of477564cHrnIuWfltwWg'
);

const OWNER_EMAIL = 'dueno@rumbea.co';
const OWNER_PASS  = 'Rumbea2025!';
const OWNER_ID    = 'a17a4421-491c-47ba-b4e5-16503f1f8a7b';

const ESTABLISHMENTS = [
  {
    name: 'Zaperoco Bar',
    address: 'Cl. 9N #14-22, El Granada, Cali',
    category: 'bar',
    theme: 'Salsa y tropicales en vivo',
    description: 'Uno de los bares más emblemáticos de Granada. Ambiente vintage, buena salsa y cocteles artesanales. Punto de encuentro de locales y turistas desde los años 80.',
    max_capacity: 180,
    cover_price: 0,
    current_occupancy: 65,
    photo_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200',
    is_premium: true,
    genres: ['Salsa', 'Champeta', 'Crossover'],
  },
  {
    name: 'Tin Tin Deo',
    address: 'Cl. 5 #38-71, La Quinta, Cali',
    category: 'discoteca',
    theme: 'Salsa clásica',
    description: 'La salsa-teca más tradicional de Cali. Reconocida mundialmente por sus bailarines y su sonido caleño puro. Aquí bailó la gente grande.',
    max_capacity: 300,
    cover_price: 15000,
    current_occupancy: 210,
    photo_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
    is_premium: true,
    genres: ['Salsa'],
  },
  {
    name: 'Kukaramacara',
    address: 'Av. 6N #17-38, Barrio Granada, Cali',
    category: 'discoteca',
    theme: 'Salsa y electrónica',
    description: 'Famoso club en plena Avenida Sexta. Mezcla de salsa dura y electrónica los fines de semana. Pistas grandes, buenas luces y ambiente vibrante.',
    max_capacity: 500,
    cover_price: 25000,
    current_occupancy: 380,
    photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200',
    is_premium: true,
    genres: ['Salsa', 'Electrónica', 'Reggaeton'],
  },
  {
    name: 'La Matraca',
    address: 'Cl. 5 #36-12, Centenario, Cali',
    category: 'bar',
    theme: 'Rock y cerveza artesanal',
    description: 'Bar de rock clásico y alternativo, con amplia selección de cervezas artesanales nacionales e importadas. Ambiente relajado, tarimas pequeñas con bandas locales los jueves.',
    max_capacity: 120,
    cover_price: 0,
    current_occupancy: 45,
    photo_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
    is_premium: false,
    genres: ['Rock', 'Indie'],
  },
  {
    name: 'Changó',
    address: 'Cr. 24 #2-54, El Peñón, Cali',
    category: 'bar',
    theme: 'Afrobeat y champeta urbana',
    description: 'El templo de la música afrolatina en Cali. Champeta, afrobeat y ritmos del Pacífico en un espacio acogedor con arte local en las paredes. Tragos caribeños y platillos del Pacífico.',
    max_capacity: 150,
    cover_price: 10000,
    current_occupancy: 90,
    photo_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
    is_premium: false,
    genres: ['Champeta', 'Salsa', 'Hip Hop'],
  },
  {
    name: 'El Social Cali',
    address: 'Cr. 10 #2-58, Barrio San Antonio, Cali',
    category: 'pub',
    theme: 'Craft beer & tapas',
    description: 'El pub de cervezas artesanales más popular del barrio San Antonio. Más de 20 tipos de cerveza en grifo, tapas españolas y ambiente tranquilo. Perfecto para conversar.',
    max_capacity: 90,
    cover_price: 0,
    current_occupancy: 30,
    photo_url: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=1200',
    is_premium: false,
    genres: ['Rock', 'Indie', 'Pop'],
  },
  {
    name: 'Bourbon Street',
    address: 'Av. 6N #21-05, Granada, Cali',
    category: 'bar',
    theme: 'Blues, jazz y bourbon americano',
    description: 'Inspirado en el famoso barrio de Nueva Orleans. Whiskeys americanos, bourbon selecto y música en vivo de blues y jazz todos los viernes y sábados.',
    max_capacity: 130,
    cover_price: 0,
    current_occupancy: 55,
    photo_url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200',
    is_premium: false,
    genres: ['Rock', 'Pop'],
  },
  {
    name: 'Mangos Av. Sexta',
    address: 'Av. 6N #16-80, El Granada, Cali',
    category: 'discoteca',
    theme: 'Reggaeton, pop urbano y reguetón',
    description: 'La discoteca más concurrida de la Avenida Sexta los sábados. Reggaeton, dembow y pop urbano toda la noche. Mesas VIP con servicio de botella.',
    max_capacity: 600,
    cover_price: 30000,
    current_occupancy: 420,
    photo_url: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=1200',
    is_premium: true,
    genres: ['Reggaeton', 'Pop', 'Hip Hop'],
  },
  {
    name: 'Sinestesia Lounge',
    address: 'Cl. 10N #8-35, Granada, Cali',
    category: 'lounge',
    theme: 'Deep house y lounge electrónico',
    description: 'Espacio minimalista y sofisticado con cocteles de autor y sesiones de deep house de DJs locales e internacionales. Dress code semiformal. Público 25+.',
    max_capacity: 200,
    cover_price: 35000,
    current_occupancy: 120,
    photo_url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=1200',
    is_premium: true,
    genres: ['Electrónica'],
  },
  {
    name: 'La Sucursal',
    address: 'Cr. 66 #11-25, Ciudad Jardín, Cali',
    category: 'cocteleria',
    theme: 'Coctelería de autor y maridaje',
    description: 'Coctelería de vanguardia en el exclusivo Ciudad Jardín. Cartas de temporada con ingredientes locales, bitters artesanales y mezclas inspiradas en las regiones de Colombia.',
    max_capacity: 70,
    cover_price: 0,
    current_occupancy: 20,
    photo_url: 'https://images.unsplash.com/photo-1560508180-03f285f67ded?w=1200',
    is_premium: true,
    genres: ['Pop', 'Indie'],
  },
  {
    name: 'La Topa Tolondra',
    address: 'Cl. 5 #33-57, Centenario, Cali',
    category: 'bar',
    theme: 'Vallenato y música popular colombiana',
    description: 'Viejo y querido bar de vallenato en Centenario. Tablas de quesos, aguardiente y cerveza bien fría. La gente mayor del barrio y los nostálgicos llenan el lugar cada fin de semana.',
    max_capacity: 100,
    cover_price: 0,
    current_occupancy: 70,
    photo_url: 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=1200',
    is_premium: false,
    genres: ['Vallenato', 'Salsa', 'Merengue'],
  },
  {
    name: 'Klimax Club',
    address: 'Cll 16 #4-90, Centro, Cali',
    category: 'discoteca',
    theme: 'Tech house y electrónica underground',
    description: 'Club underground referente de la electrónica en Cali. Sistema de sonido de alto nivel, pistas oscuras y sets de 6+ horas. El lugar al que van los que saben de música electrónica.',
    max_capacity: 400,
    cover_price: 40000,
    current_occupancy: 180,
    photo_url: 'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=1200',
    is_premium: true,
    genres: ['Electrónica'],
  },
];

async function main() {
  console.log('🔐 Iniciando sesión como dueño...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: OWNER_EMAIL,
    password: OWNER_PASS,
  });
  if (authErr) {
    console.error('Error login:', authErr.message);
    process.exit(1);
  }
  console.log('✅ Sesión iniciada como', authData.user.email);

  // Fetch genre IDs
  console.log('\n🎵 Cargando géneros musicales...');
  const { data: genres, error: genErr } = await supabase.from('musical_genres').select('id, name');
  if (genErr) { console.error('Error géneros:', genErr.message); process.exit(1); }
  const genreMap = Object.fromEntries(genres.map((g) => [g.name, g.id]));
  console.log('Géneros disponibles:', Object.keys(genreMap).join(', '));

  console.log('\n🏢 Insertando establecimientos...');
  for (const est of ESTABLISHMENTS) {
    const { genres: genreNames, ...estData } = est;

    const { data: inserted, error: insertErr } = await supabase
      .from('establishments')
      .insert({ ...estData, owner_id: OWNER_ID })
      .select('id, name')
      .single();

    if (insertErr) {
      console.error(`  ❌ ${est.name}:`, insertErr.message);
      continue;
    }

    // Link genres
    const genreLinks = genreNames
      .map((n) => genreMap[n])
      .filter(Boolean)
      .map((gid) => ({ establishment_id: inserted.id, genre_id: gid }));

    if (genreLinks.length) {
      const { error: glErr } = await supabase
        .from('establishment_genres')
        .insert(genreLinks);
      if (glErr) console.warn(`  ⚠️  Géneros de ${est.name}:`, glErr.message);
    }

    console.log(`  ✅ ${inserted.name} (${inserted.id.slice(0, 8)}...)`);
  }

  console.log('\n✨ Seed completado!');
  console.log('\n📋 Credenciales de prueba:');
  console.log('  👤 Cliente:  cliente@rumbea.co  /  Rumbea2025!');
  console.log('  🏢 Dueño:    dueno@rumbea.co    /  Rumbea2025!');
}

main().catch(console.error);
