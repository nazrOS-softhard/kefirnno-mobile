import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase/client'
import { Colors } from '@/constants/Colors'
import type { KefirObject } from '@/lib/types'
import { DEMO_USER_ID } from '@/lib/types'

function timeAgo(s: string) {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000)
  if (m < 60) return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч назад`
  return `${Math.floor(h / 24)} д назад`
}

const PROJECT_COLORS = ['#7B5CF5', '#00D4AA', '#F5A623', '#5CC4F5', '#F55C5C', '#9B7FFA']

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<KefirObject[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [newTitle, setNewTitle]     = useState('')
  const [newDesc, setNewDesc]       = useState('')
  const [saving, setSaving]         = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('objects').select('*')
      .eq('type', 'project' as never)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
    setProjects((data ?? []) as KefirObject[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      await supabase.from('objects').insert({
        user_id: DEMO_USER_ID,
        type: 'project',
        title: newTitle.trim(),
        content: newDesc.trim() || null,
        tags: [],
        status: 'active',
        metadata: { progress: 0 },
      } as never)
      setNewTitle('')
      setNewDesc('')
      setShowModal(false)
      await load()
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать проект')
    }
    setSaving(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Проекты</Text>
          <Text style={styles.headerSub}>{projects.length} активных</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 32, opacity: 0.15, marginBottom: 8 }}>◧</Text>
              <Text style={styles.emptyText}>Аджна автоматически собирает проекты из твоих мыслей</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Создать первый проект</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const color = PROJECT_COLORS[index % PROJECT_COLORS.length]
          const progress = (item.metadata as { progress?: number })?.progress ?? Math.floor(Math.random() * 80) + 10
          return (
            <TouchableOpacity style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={[styles.projectAvatar, { backgroundColor: color }]}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                    {item.title[0]?.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
                  {item.content && (
                    <Text style={styles.projectDesc} numberOfLines={1}>{item.content}</Text>
                  )}
                </View>
                <Text style={styles.projectPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
              </View>
              <Text style={styles.projectTime}>{timeAgo(item.updated_at)}</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Новый проект</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Название проекта"
              placeholderTextColor={Colors.muted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Описание (необязательно)"
              placeholderTextColor={Colors.muted}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={{ color: Colors.muted }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreate, { opacity: newTitle.trim() ? 1 : 0.5 }]}
                onPress={handleCreate}
                disabled={!newTitle.trim() || saving}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {saving ? 'Создаём...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },

  projectCard: {
    padding: 14, marginBottom: 10, borderRadius: 14,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  projectHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  projectAvatar: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  projectTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  projectDesc: { fontSize: 12, color: Colors.muted, marginTop: 2 },
  projectPercent: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressFill: { height: 4, borderRadius: 2 },
  projectTime: { fontSize: 10, color: Colors.dim, marginTop: 8 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 13, color: Colors.muted, textAlign: 'center', paddingHorizontal: 40, marginBottom: 16 },
  emptyBtn: { backgroundColor: Colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalBox: {
    width: '100%', backgroundColor: Colors.panel, borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 14 },
  modalInput: {
    backgroundColor: Colors.card, borderRadius: 10, padding: 12,
    color: Colors.text, fontSize: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancel: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  modalCreate: {
    flex: 2, padding: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: Colors.accent,
  },
})
