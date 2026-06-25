import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { supabase } from '@/lib/supabase/client'
import { Colors } from '@/constants/Colors'

interface Attachment {
  id: string
  object_id: string | null
  file_type: string
  mime_type: string | null
  url: string | null
  size_bytes: number | null
  created_at: string
  metadata: Record<string, unknown>
}

const FILE_ICONS: Record<string, string> = {
  image: '🖼', video: '🎬', audio: '🎵',
  pdf: '📄', doc: '📝', other: '📎',
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function ArtifactsScreen() {
  const [items, setItems] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('attachments').select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setItems((data ?? []) as unknown as Attachment[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => { setRefreshing(true); load() }

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })
    if (!result.canceled) {
      Alert.alert('Скоро', 'Загрузка файлов в облако будет добавлена в следующем обновлении')
    }
  }

  const handleAddFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({})
    if (result.assets?.length) {
      Alert.alert('Скоро', 'Загрузка файлов в облако будет добавлена в следующем обновлении')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Артефакты</Text>
          <Text style={styles.headerSub}>{items.length} файлов</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPhoto}>
            <Text style={{ fontSize: 16 }}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddFile}>
            <Text style={{ fontSize: 16 }}>📄</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 32, opacity: 0.15, marginBottom: 8 }}>◫</Text>
              <Text style={styles.emptyText}>
                Загружай фото, файлы и документы — они появятся здесь
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAddPhoto}>
                  <Text style={styles.emptyBtnText}>📷 Фото</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAddFile}>
                  <Text style={styles.emptyBtnText}>📄 Файл</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.fileCard}>
            <View style={styles.filePreview}>
              <Text style={{ fontSize: 32 }}>{FILE_ICONS[item.file_type] ?? '📎'}</Text>
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {(item.metadata as { name?: string })?.name ?? item.file_type}
            </Text>
            <Text style={styles.fileSize}>{formatSize(item.size_bytes)}</Text>
          </TouchableOpacity>
        )}
      />
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
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  fileCard: {
    flex: 1, padding: 12, marginBottom: 10, borderRadius: 14,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  filePreview: {
    height: 80, borderRadius: 10, backgroundColor: Colors.panel,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  fileName: { fontSize: 12, fontWeight: '500', color: Colors.text, marginBottom: 2 },
  fileSize: { fontSize: 10, color: Colors.dim },

  empty: { alignItems: 'center', paddingTop: 60, width: '100%' },
  emptyText: { fontSize: 13, color: Colors.muted, textAlign: 'center', paddingHorizontal: 40 },
  emptyBtn: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
  },
  emptyBtnText: { fontSize: 13, color: Colors.text },
})
