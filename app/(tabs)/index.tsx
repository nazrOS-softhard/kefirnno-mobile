import { useState, useEffect, useRef } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { supabase } from '@/lib/supabase/client'
import { Colors, TypeColors, TypeIcons } from '@/constants/Colors'
import type { KefirObject } from '@/lib/types'
import { DEMO_USER_ID } from '@/lib/types'

const MODULES = [
  { id: '01', key: 'memory',    title: 'ПАМЯТЬ',     icon: '◈', color: '#7B5CF5',
    desc: 'Я храню и связываю знания, заметки, идеи, файлы и контекст.' },
  { id: '02', key: 'projects',  title: 'ПРОЕКТЫ',    icon: '◧', color: '#00D4AA',
    desc: 'Автоматически собранные проекты и направления. Ничего не создаёшь — я создаю за тебя.' },
  { id: '03', key: 'artifacts', title: 'АРТЕФАКТЫ',  icon: '◫', color: '#F5A623',
    desc: 'Документы, изображения, таблицы, отчёты и всё, что мы создали вместе.' },
  { id: '04', key: 'map',       title: 'КАРТА МЫСЛЕЙ', icon: '⊙', color: '#5CC4F5',
    desc: 'Связи между идеями, проектами, людьми и объектами.' },
  { id: '05', key: 'adjna',     title: 'АДЖНА',      icon: '✦', color: '#9B7FFA',
    desc: 'ИИ-агент. Отвечаю, напоминаю, анализирую, предлагаю и создаю.' },
]

export default function StreamScreen() {
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [recent, setRecent]     = useState<KefirObject[]>([])
  const [stats, setStats]       = useState({ thoughts: 0, projects: 0, artifacts: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('objects').select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(20)

    const objects = (data ?? []) as KefirObject[]
    setRecent(objects.slice(0, 4))
    setStats({
      thoughts:  objects.filter(o => o.type === 'thought').length,
      projects:  objects.filter(o => o.type === 'project').length,
      artifacts: objects.length,
    })
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setLoading(true)

    try {
      await supabase.from('objects').insert({
        user_id: DEMO_USER_ID,
        type: 'thought',
        title: input.trim().slice(0, 80),
        content: input.trim(),
        tags: [],
        status: 'active',
        metadata: {},
      } as never)

      setInput('')
      await loadData()
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись')
    }
    setLoading(false)
  }

  const handlePickImage = async () => {
    setShowMenu(false)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })
    if (!result.canceled) {
      Alert.alert('Фото добавлено', 'Сохраняем в Артефакты...')
      // TODO: upload to Supabase Storage in fix2
    }
  }

  const handlePickFile = async () => {
    setShowMenu(false)
    const result = await DocumentPicker.getDocumentAsync({})
    if (result.assets?.length) {
      Alert.alert('Файл добавлен', result.assets[0].name)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>В</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.logo}>КЕФИРНн<Text style={{ color: Colors.accent }}>О</Text></Text>
            <Text style={styles.tagline}>единое окно мышления</Text>
          </View>
          <TouchableOpacity style={styles.adjnaBtn}>
            <Text style={{ fontSize: 20, color: Colors.accent }}>✦</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Привет, Ваня.</Text>
          <Text style={styles.greetingSub}>Я — Аджна. Загружай всё. Я разберусь.</Text>
        </View>

        {/* Input box */}
        <View style={styles.inputBox}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Пиши, думай, загружай, спрашивай..."
            placeholderTextColor={Colors.muted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <View style={styles.inputToolbar}>
            <TouchableOpacity style={styles.plusBtn} onPress={() => setShowMenu(!showMenu)}>
              <Text style={{ fontSize: 20, color: Colors.text }}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={() => inputRef.current?.focus()}>
              <Text style={styles.toolBtnText}>Aあ Текст</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={handlePickImage}>
              <Text style={styles.toolBtnText}>📷 Фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={handlePickFile}>
              <Text style={styles.toolBtnText}>📄 Файл</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="white" />
                : <Text style={{ color: 'white', fontSize: 16 }}>↑</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent uploads strip */}
        {recent.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentStrip}>
            {recent.map(obj => (
              <View key={obj.id} style={styles.recentCard}>
                <View style={[styles.recentIcon, { backgroundColor: `${TypeColors[obj.type]}22` }]}>
                  <Text style={{ fontSize: 16, color: TypeColors[obj.type] }}>{TypeIcons[obj.type]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{obj.title}</Text>
                  <Text style={styles.recentSub}>сегодня</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Adjna analyzing banner */}
        <TouchableOpacity style={styles.analyzingBanner}>
          <Text style={{ fontSize: 16, color: Colors.accent }}>✦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.analyzingTitle}>Аджна анализирует</Text>
            <Text style={styles.analyzingSub}>Поняла {stats.artifacts} новых элементов</Text>
          </View>
          <Text style={{ color: Colors.muted, fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        {/* Module grid */}
        <View style={styles.grid}>
          {MODULES.map(mod => (
            <TouchableOpacity key={mod.id} style={styles.moduleCard}>
              <Text style={[styles.moduleNum, { color: mod.color }]}>{mod.id}</Text>
              <View style={[styles.moduleIconWrap, { backgroundColor: `${mod.color}18` }]}>
                <Text style={{ fontSize: 28, color: mod.color }}>{mod.icon}</Text>
              </View>
              <Text style={styles.moduleTitle}>{mod.title}</Text>
              <Text style={styles.moduleDesc}>{mod.desc}</Text>
              <View style={styles.moduleFooter}>
                <Text style={styles.moduleCount}>
                  {mod.key === 'memory' ? `${stats.thoughts} элементов` :
                   mod.key === 'projects' ? `${stats.projects} активных` :
                   mod.key === 'artifacts' ? `${stats.artifacts} файлов` :
                   mod.key === 'map' ? 'Смотреть карту' : 'Спросить'}
                </Text>
                <View style={styles.moduleArrow}>
                  <Text style={{ color: mod.color, fontSize: 14 }}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Focus projects */}
        <View style={styles.focusSection}>
          <View style={styles.focusHeader}>
            <Text style={{ fontSize: 14 }}>🎯</Text>
            <Text style={styles.focusTitle}>Сейчас в фокусе</Text>
            <Text style={styles.focusUpdated}>обновлено сейчас</Text>
          </View>
          <Text style={{ textAlign: 'center', color: Colors.dim, fontSize: 12, marginTop: 8 }}>
            Создай первый проект чтобы увидеть прогресс
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.accent2, borderWidth: 2, borderColor: Colors.bg,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  logo: { fontSize: 16, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  tagline: { fontSize: 10, color: Colors.muted, marginTop: 1 },
  adjnaBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  greeting: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  greetingTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  greetingSub: { fontSize: 14, color: Colors.muted },

  inputBox: {
    marginHorizontal: 16, borderRadius: 18,
    borderWidth: 1.5, borderColor: Colors.accent,
    backgroundColor: Colors.card, padding: 14,
  },
  input: { color: Colors.text, fontSize: 15, minHeight: 50, maxHeight: 120 },
  inputToolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  plusBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.panel, alignItems: 'center', justifyContent: 'center',
  },
  toolBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  toolBtnText: { fontSize: 11, color: Colors.muted },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    marginLeft: 'auto',
  },

  recentStrip: { marginTop: 16, paddingLeft: 16 },
  recentCard: {
    width: 160, marginRight: 10, padding: 10, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  recentIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  recentTitle: { fontSize: 12, color: Colors.text, fontWeight: '500' },
  recentSub: { fontSize: 10, color: Colors.dim, marginTop: 2 },

  analyzingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(123,92,245,0.08)', borderWidth: 1, borderColor: 'rgba(123,92,245,0.25)',
  },
  analyzingTitle: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  analyzingSub: { fontSize: 11, color: Colors.muted, marginTop: 1 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginTop: 16, gap: 10,
  },
  moduleCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
  },
  moduleNum: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  moduleIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  moduleTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6, letterSpacing: 0.3 },
  moduleDesc: { fontSize: 11, color: Colors.muted, lineHeight: 15, marginBottom: 12, minHeight: 45 },
  moduleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moduleCount: { fontSize: 11, color: Colors.dim, flex: 1 },
  moduleArrow: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  focusSection: {
    marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 14,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  focusHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, flex: 1 },
  focusUpdated: { fontSize: 10, color: Colors.dim },
})
