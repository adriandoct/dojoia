'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Spinner, LoadingCard } from '@/components/ui/spinner'
import { Send, Bot, User, Sparkles, Lightbulb, Trophy, Target, RotateCcw } from 'lucide-react'
import { generateAIResponse } from '@/lib/services/openai'
import { formatDate } from '@/lib/utils/helpers'
import type { AIMessage } from '@/types'

export default function AICoachPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [suggestions] = useState([
    '¿Cómo puedo mejorar en matemáticas?',
    'Muéstrame un truco para aprender inglés',
    '¿Qué habilidades debo desarrollar?',
    'Cuéntame sobre la disciplina del karate',
  ])

  useEffect(() => {
    // Load conversation history from Supabase
    loadConversationHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversationHistory() {
    if (!session) return

    try {
      const { data } = await supabase
        .from('ai_messages')
        .select(`
          *,
          conversation:ai_conversations(*)
        `)
        .eq('conversation.student_id', (session.user as any)?.id)
        .order('created_at', { ascending: true })
        .limit(50)

      const messagesData = data as any
      if (messagesData) {
        setMessages(
          messagesData.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
            conversation_id: messagesData[0]?.conversation?.id || '',
            tokens_used: 0,
          }))
        )
        if (messagesData[0]?.conversation?.id) {
          setConversationId(messagesData[0].conversation.id)
        } else {
          createNewConversation()
        }
      } else {
        createNewConversation()
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      createNewConversation()
    }
  }

  async function createNewConversation() {
    if (!session) return

    const { data } = await (supabase as any)
      .from('ai_conversations')
      .insert({
        student_id: (session.user as any)?.id,
        module_code: null, // General chat
        context: {},
      })
      .select()
      .single()

    if (data) setConversationId(data.id)
  }

  async function handleSendMessage(content: string) {
    if (!content.trim() || !session || !conversationId) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get student context
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          level:levels(*),
          progress:student_progress(*)
        `)
        .eq('user_id', session.user.id)
        .single()

      // Build AI context
      const context = {
        studentProfile: {
          name: profile?.full_name || 'Estudiante',
          level: profile?.level?.name || 'Principiante',
          interests: [], // TODO: Extract from activities
          weaknesses: [], // TODO: Extract from poor performance
        },
        currentLesson: null,
        recentProgress: {
          lessonsCompleted: profile?.progress?.length || 0,
          averageScore: 80, // TODO: Calculate from data
          streakDays: profile?.streak_days || 0,
        },
        conversationHistory: messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }

      // Get AI response
      const aiResponse = await generateAIResponse(context, content)

      // Save messages to DB
      await Promise.all([
        supabase.from('ai_messages').insert({
          conversation_id: conversationId,
          role: 'user',
          content: content.trim(),
          tokens_used: content.length / 4, // Approximation
        }),
        supabase.from('ai_messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse,
          tokens_used: aiResponse.length / 4,
        }),
      ])

      // Add assistant message to state
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, tuve un problema para responder. Por favor, intenta de nuevo más tarde. 🥋',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleSuggestionClick(suggestion: string) {
    handleSendMessage(suggestion)
  }

  function clearConversation() {
    setMessages([])
    createNewConversation()
  }

  return (
    <DashboardLayout userRole={session?.user.role as any}>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              DOJO AI Coach
            </h1>
            <p className="text-gray-600 mt-1">
              Tu sensei personal 24/7 🥋
            </p>
          </div>
          <Button variant="ghost" onClick={clearConversation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-dojo-red to-dojo-redDark rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  ¡Hola! Soy tu AI Coach 🥋
                </h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Estoy aquí para ayudarte en tu aprendizaje. Puedo explicarte conceptos,
                  darte consejos de estudio, motivarte y responder preguntas sobre cualquier módulo DOJO.
                </p>

                {/* Suggestions */}
                <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-dojo-red hover:bg-red-50 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar
                        fallback="AI"
                        size="sm"
                        levelColor="#E53E3E"
                      />
                    )}

                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-dojo-red text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(message.created_at, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <Avatar
                        fallback={session?.user?.name?.charAt(0) || 'U'}
                        size="sm"
                      />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar
                      fallback="AI"
                      size="sm"
                      levelColor="#E53E3E"
                    />
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Input Area */}
          {!messages.length && isLoading ? null : (
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(input)
                    }
                  }}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-dojo-red hover:bg-dojo-redDark"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <Sparkles className="w-3 h-3" />
                <span>
                  DOJO AI puede cometer errores. Verifica información importante.
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
