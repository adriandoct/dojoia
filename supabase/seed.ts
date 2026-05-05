import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedDatabase() {
  console.log('🌱 Seeding database...')

  // 1. Insert Levels
  const levels = [
    {
      code: 'white',
      name: 'Cinta Blanca',
      description: 'Nivel inicial. Fundamentos básicos.',
      min_points: 0,
      max_points: 1000,
      color_hex: '#FFFFFF',
      order_index: 1,
    },
    {
      code: 'yellow',
      name: 'Cinta Amarilla',
      description: 'Primer nivel intermedio.',
      min_points: 1000,
      max_points: 2500,
      color_hex: '#F6E05E',
      order_index: 2,
    },
    {
      code: 'orange',
      name: 'Cinta Naranja',
      description: 'Consolidación de conocimientos.',
      min_points: 2500,
      max_points: 5000,
      color_hex: '#ED8936',
      order_index: 3,
    },
    {
      code: 'green',
      name: 'Cinta Verde',
      description: 'Nivel avanzado.',
      min_points: 5000,
      max_points: 10000,
      color_hex: '#48BB78',
      order_index: 4,
    },
    {
      code: 'blue',
      name: 'Cinta Azul',
      description: 'Dominio técnico.',
      min_points: 10000,
      max_points: 20000,
      color_hex: '#4299E1',
      order_index: 5,
    },
    {
      code: 'brown',
      name: 'Cinta Café',
      description: 'Maestría intermedia.',
      min_points: 20000,
      max_points: 40000,
      color_hex: '#975A16',
      order_index: 6,
    },
    {
      code: 'black',
      name: 'Cinta Negra',
      description: 'Maestro. Nivel máximo.',
      min_points: 40000,
      max_points: 100000,
      color_hex: '#1A202C',
      order_index: 7,
    },
  ]

  for (const level of levels) {
    const { error } = await supabase.from('levels').upsert(level)
    if (error) console.error(`Error inserting level ${level.code}:`, error)
  }
  console.log('✅ Levels seeded')

  // 2. Insert Modules
  const modules = [
    { code: 'math', name: 'DOJO MATH', description: 'Matemáticas progresivas estilo Kumon', color_hex: '#3182CE' },
    { code: 'english', name: 'DOJO ENGLISH', description: 'Inglés conversacional con IA', color_hex: '#38A169' },
    { code: 'code', name: 'DOJO CODE', description: 'Programación desde cero', color_hex: '#805AD5' },
    { code: 'robotics', name: 'DOJO ROBOTICS', description: 'Robótica y automatización', color_hex: '#DD6B20' },
    { code: 'karate', name: 'DOJO KARATE', description: 'Artes marciales y valores', color_hex: '#E53E3E' },
    { code: 'read', name: 'DOJO READ', description: 'Lectura comprensiva y rápida', color_hex: '#00B5D8' },
    { code: 'write', name: 'DOJO WRITE', description: 'Escritura creativa', color_hex: '#D53F8C' },
  ]

  for (const module of modules) {
    const { error } = await supabase.from('modules').upsert({
      ...module,
      is_active: true,
    })
    if (error) console.error(`Error inserting module ${module.code}:`, error)
  }
  console.log('✅ Modules seeded')

  // 3. Insert Sample Lessons for DOJO MATH (White Level)
  const { data: mathModule } = await supabase
    .from('modules')
    .select('id')
    .eq('code', 'math')
    .single()

  const { data: whiteLevel } = await supabase
    .from('levels')
    .select('id')
    .eq('code', 'white')
    .single()

  if (mathModule && whiteLevel) {
    const mathLessons = [
      {
        module_id: mathModule.id,
        level_id: whiteLevel.id,
        title: 'Sumas básicas hasta 10',
        description: 'Aprende a sumar números del 1 al 10',
        content: { video_url: '', exercises: [] },
        order_index: 1,
        est_duration_min: 10,
        xp_reward: 50,
        is_locked: false,
      },
      {
        module_id: mathModule.id,
        level_id: whiteLevel.id,
        title: 'Restas básicas hasta 10',
        description: 'Aprende a restar números del 1 al 10',
        content: { video_url: '', exercises: [] },
        order_index: 2,
        est_duration_min: 10,
        xp_reward: 50,
        is_locked: true,
        unlock_criteria: { lesson_id: null, min_score: 80 },
      },
      {
        module_id: mathModule.id,
        level_id: whiteLevel.id,
        title: 'Sumas hasta 20',
        description: 'Amplía tus habilidades de suma',
        content: { video_url: '', exercises: [] },
        order_index: 3,
        est_duration_min: 15,
        xp_reward: 75,
        is_locked: true,
        unlock_criteria: { lesson_id: null, min_score: 80 },
      },
    ]

    for (const lesson of mathLessons) {
      const { error } = await supabase.from('lessons').insert(lesson)
      if (error) console.error(`Error inserting lesson:`, error)
    }
    console.log('✅ Math lessons seeded')
  }

  // 4. Insert Achievements
  const achievements = [
    {
      code: 'first_lesson',
      name: '¡Primer Paso!',
      description: 'Completa tu primera lección',
      points_reward: 100,
      dojicoins_reward: 10,
      criteria: { type: 'lessons_completed', count: 1 },
    },
    {
      code: 'streak_7',
      name: 'Racha Semanal',
      description: 'Estudia 7 días consecutivos',
      points_reward: 500,
      dojicoins_reward: 50,
      criteria: { type: 'streak', days: 7 },
    },
    {
      code: 'xp_1000',
      name: 'Aprendiz',
      description: 'Alcanza 1000 XP totales',
      points_reward: 200,
      dojicoins_reward: 20,
      criteria: { type: 'total_xp', amount: 1000 },
    },
    {
      code: 'level_up',
      name: 'Subida de Nivel',
      description: 'Avanza al siguiente nivel',
      points_reward: 300,
      dojicoins_reward: 30,
      criteria: { type: 'level_up' },
    },
  ]

  for (const achievement of achievements) {
    const { error } = await supabase.from('achievements').upsert({
      ...achievement,
      icon_url: null,
      is_hidden: false,
    })
    if (error) console.error(`Error inserting achievement:`, error)
  }
  console.log('✅ Achievements seeded')

  // 5. Insert Shop Items
  const shopItems = [
    { name: 'Gorra DOJOIA', description: 'Gorra oficial', category: 'avatar', price_dojicoins: 500, stock_quantity: 100, is_limited: false },
    { name: 'Traje de Sensei', description: 'Traje especial de maestro', category: 'avatar', price_dojicoins: 2000, stock_quantity: 50, is_limited: true },
    { name: ' Doble XP x1', description: 'Gana el doble de XP en la próxima lección', category: 'powerup', price_dojicoins: 100, stock_quantity: null, is_limited: false },
    { name: 'Tema Negro Oro', description: 'Tema premium para la app', category: 'theme', price_dojicoins: 1500, stock_quantity: null, is_limited: false },
  ]

  for (const item of shopItems) {
    const { error } = await supabase.from('shop_items').upsert({
      ...item,
      is_active: true,
      image_url: null,
    })
    if (error) console.error(`Error inserting shop item:`, error)
  }
  console.log('✅ Shop items seeded')

  console.log('🎉 Database seeding completed!')
}

seedDatabase().catch(console.error)
