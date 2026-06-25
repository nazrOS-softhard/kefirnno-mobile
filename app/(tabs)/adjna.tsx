import { useState, useRef, useEffect } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase/client'
import { Colors } from '@/constants/Colors'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Что я записал на этой неделе?',
  'Покажи незавершённые проекты',
  'Создай мысль про назрОС',
]

export default function AdjnaScreen() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Привет, Ваня. Я — Аджна. Загружай всё — я разберусь.',
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      // Получаем контекст из БД напрямую (без серверного API route в мобильном)
      const { data: objects } = await supabase
        .from('objects').select('type, title, content, tags')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(20)

      const context = (objects ?? [])
        .map(o => `[${o.type}] ${o.title}${o.content ? ': ' + o.content.slice(0, 100) : ''}`)
        .join('\n')

      // Запрос напрямую к OpenAI (ключ нужен будет вынести через прокси в проде)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Ты — Аджна, ИИ-агент конгломерата назрОС. Отвечай кратко на русском. Зови пользователя Ваня.\n\nБаза знаний:\n${context}`,
            },
            ...next.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 500,
        }),
      })

      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content ?? 'Не удалось получить ответ'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка соединения. Попробуй снова.' }])
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 18, color: Colors.accent }}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Аджна</Text>
            <Text style={styles.headerSub}>ИИ-агент назрОС</Text>
          </View>
        </View>

        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.messages}>
          {messages.map((msg, i) => (
            <View key={i} style={[
              styles.msgRow,
              { justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' },
            ]}>
              {msg.role === 'assistant' && (
                <View style={styles.msgAvatar}>
                  <Text style={{ fontSize: 12, color: 'white' }}>✦</Text>
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  { color: msg.role === 'user' ? 'white' : Colors.text },
                ]}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.msgRow}>
              <View style={styles.msgAvatar}>
                <Text style={{ fontSize: 12, color: 'white' }}>✦</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <ActivityIndicator size="small" color={Colors.accent} />
              </View>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => send(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Спроси Аджну..."
            placeholderTextColor={Colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(123,92,245,0.15)', borderWidth: 1, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.muted },

  messages: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgAvatar: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 16 },
  bubbleUser: { backgroundColor: Colors.accent, borderBottomRightRadius: 4 },
  bubbleAssistant: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },

  suggestions: { marginTop: 8, gap: 8 },
  suggestionChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  suggestionText: { fontSize: 13, color: Colors.muted },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12, borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.sidebar,
  },
  input: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10,
    color: Colors.text, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
})
