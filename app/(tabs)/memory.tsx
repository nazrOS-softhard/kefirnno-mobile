import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { Colors, TypeColors, TypeIcons, TypeLabels } from '@/constants/Colors'
import type { KefirObject } from '@/lib/types'

function timeAgo(s: string) {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  return `${Math.floor(h / 24)} д назад`
}

const FILTERS = [
  { key: 'all',      label: 'Все' },
  { key: 'thought',  label: 'Мысли' },
  { key: 'research', label: 'Исследования' },
  { key: 'event',    label: 'События' },
]

export default function MemoryScreen() {
  const [objects, setObjects] = useState<KefirObject[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('objects').select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(100)
    setObjects((data ?? []) as KefirObject[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const filtered = objects.filter(o => {
    if (filter !== 'all' && o.type !== filter) return false
    if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Память</Text>
        <Text style={styles.headerSub}>{objects.length} элементов</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={{ color: Colors.muted, marginRight: 6 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск по памяти..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={f => f.key}
        style={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 32, opacity: 0.15, marginBottom: 8 }}>◈</Text>
              <Text style={styles.emptyText}>
                {search ? 'Ничего не найдено' : 'Пиши в Поток — записи появятся здесь'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={[styles.cardIcon, { backgroundColor: `${TypeColors[item.type]}1f` }]}>
              <Text style={{ fontSize: 16, color: TypeColors[item.type] }}>{TypeIcons[item.type]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.content && (
                <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
              )}
              <View style={styles.cardMeta}>
                <Text style={[styles.cardType, { color: TypeColors[item.type] }]}>
                  {TypeLabels[item.type]}
                </Text>
                <Text style={styles.cardTime}>{timeAgo(item.updated_at)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 8, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },

  filterRow: { paddingHorizontal: 16, marginTop: 12, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.card, marginRight: 8, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, color: Colors.muted },
  filterTextActive: { color: 'white', fontWeight: '600' },

  card: {
    flexDirection: 'row', gap: 12, padding: 14, marginBottom: 8,
    backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
  },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 3 },
  cardContent: { fontSize: 12, color: Colors.muted, lineHeight: 16, marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardType: { fontSize: 11, fontWeight: '600' },
  cardTime: { fontSize: 11, color: Colors.dim },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 13, color: Colors.muted, textAlign: 'center', paddingHorizontal: 40 },
})
