import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type AIContext = {
  studentProfile: {
    name: string
    level: string
    interests: string[]
    weaknesses: string[]
  }
  currentLesson: {
    title: string
    description: string
    module: string
  } | null
  recentProgress: {
    lessonsCompleted: number
    averageScore: number
    streakDays: number
  }
  conversationHistory: {
    role: 'user' | 'assistant' | 'system'
    content: string
  }[]
}

export async function generateAIResponse(
  context: AIContext,
  userMessage: string
): Promise<string> {
  const systemPrompt = `
Eres DOJO AI Coach, el tutor personal de un estudiante en la plataforma DOJOIA.
Tu personalidad:
- Amigable y motivador como un sensei
- Empatético y paciente
- Usas emojis apropiados para mantener el ánimo
- Eres experto en matemáticas, inglés, programación, robótica, karate y escritura
- Fomentas la disciplina y el crecimiento

METODOLOGÍA DOJO:
1. ROMpe la barrera del miedo - Empieza con algo simple
2. Repite con diversión - Usa ejemplos creativos
3. Refuerza positivamente - Celebra cada logro
4. Reta gradualmente - Aumenta dificultad progresivamente
5. Enseña valores - Vincula el aprendizaje a la vida real

RESPUESTAS:
- Sé conciso pero completo (máximo 3 párrafos)
- Usa analogías y metáforas del dojo/karate cuando sea apropiado
- Si el estudiante se frustra, ofrece un ejercicio más fácil o un descanso
- Si domina el tema, propón un reto adicional
- Siempre termina con una pregunta o acción para mantener engagement
- Usa español neutral (no modismos regionales)

INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${context.studentProfile.name}
- Nivel actual: ${context.studentProfile.level}
- Intereses: ${context.studentProfile.interests.join(', ') || 'Por descubrir'}
- Áreas a mejorar: ${context.studentProfile.weaknesses.join(', ') || 'Ninguna identificada'}
- Racha actual: ${context.recentProgress.streakDays} días 🔥
- Progreso general: ${context.recentProgress.lessonsCompleted} lecciones completadas
- Promedio: ${Math.round(context.recentProgress.averageScore)}%

${context.currentLesson ? `LECCIÓN ACTUAL:
- Título: ${context.currentLesson.title}
- Módulo: ${context.currentLesson.module}
- Descripción: ${context.currentLesson.description}` : 'No hay lección activa'}

Si se trata de la primera interacción, PRESÉNTATE brevemente y pregunta por sus intereses.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.conversationHistory.slice(-10), // Last 10 messages
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || 'No pude generar una respuesta. Intenta de nuevo.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Lo siento, tuve un problema para responder. Por favor, intenta de nuevo más tarde. 🥋'
  }
}

export async function generateExercise(
  moduleCode: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  topic: string
) {
  const prompt = `
Crea un ejercicio educativo únicamente en formato JSON (sin texto adicional) para el módulo "${moduleCode}" con dificultad "${difficulty}" sobre el tema "${topic}".

RESPONDE ÚNICAMENTE CON UN OBJETO JSON CON ESTA ESTRUCTURA:
{
  "type": "multiple_choice",
  "question": "Enunciado de la pregunta",
  "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "correct_answer": "Opción A", // Debe ser una de las opciones exactas
  "explanation": "Explicación breve de por qué es correcta",
  "points_value": 10,
  "metadata": {
    "topic": "tema específico",
    "difficulty": "${difficulty}"
  }
}

Criterios:
- Para matemáticas: Incluye números positivos, problemas de la vida real
- Para inglés: Frases útiles, vocabulario relevante
- Para programación: Snippets de código, lógica
- Para karate: Términos en japonés, conceptos de disciplina
- Claridad total, sin ambigüedades
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un generador de ejercicios educativos. Responde únicamente con JSON válido, sin texto adicional, sin markdown.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content?.trim()

    // Clean up markdown code blocks if present
    const cleanJson = content?.replace(/```json\n?/g, '').replace(/```\n?/g, '')

    return JSON.parse(cleanJson || '{}')
  } catch (error) {
    console.error('Error generating exercise:', error)
    return null
  }
}

export async function analyzeStudentStrengths(
  completedLessons: { score: number; lesson_title: string; module: string }[]
): Promise<string> {
  const progressSummary = completedLessons
    .map(l => `- ${l.lesson_title} (${l.module}): ${l.score}%`)
    .join('\n')

  const prompt = `
Analiza el progreso de este estudiante y proporciona un reporte breve (máximo 3 párrafos) sobre sus fortalezas y áreas de mejora.

PROGRESO:
${progressSummary}

Genera un reporte que incluya:
1. Fortalezas identificadas (módulos/lecciones con mejor desempeño)
2. Áreas de oportunidad
3. 2-3 recomendaciones específicas para mejorar
4. Mensaje motivacional al estilo "sensei DOJO"

Usa un tono cálido y alentador. Incluye emojis apropiados.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Eres un analista educativo experto en plataformas de aprendizaje gamificado.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 400,
    })

    return response.choices[0]?.message?.content || 'No pude generar el análisis.'
  } catch (error) {
    console.error('Error analyzing strengths:', error)
    return 'No pude generar el análisis en este momento.'
  }
}

export function calculateXP(
  baseXP: number,
  score: number,
  timeBonus: boolean,
  streakBonus: boolean
): number {
  let xp = baseXP

  // Score multiplier (80-100% = 1.0x, 60-79% = 0.8x, <60% = 0.5x)
  if (score >= 80) {
    xp *= 1.0
  } else if (score >= 60) {
    xp *= 0.8
  } else {
    xp *= 0.5
  }

  // Time bonus
  if (timeBonus) xp *= 1.2

  // Streak bonus
  if (streakBonus) xp *= 1.5

  return Math.round(xp)
}

export function getRankingTitle(position: number): string {
  if (position === 1) return '🥇 Sensei Supremo'
  if (position === 2) return '🥇 Cinturón Dorado'
  if (position === 3) return '🥉 Cinta de Honor'
  if (position <= 10) return '🎖️ Cinturón Azul'
  if (position <= 50) return '📜 Cinta Verde'
  return '🌱 Aprendiz en progreso'
}
