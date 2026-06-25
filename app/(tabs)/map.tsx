import { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg'
import { supabase } from '@/lib/supabase/client'
import { Colors, TypeColors } from '@/constants/Colors'
import type { KefirObject } from '@/lib/types'

interface Node {
  id: string
  label: string
  type: string
  x: number
  y: number
  size: number
}

const { width: SCREEN_W } = Dimensions.get('window')

function layoutCircular(objects: KefirObject[]): Node[] {
  const cx = SCREEN_W / 2
  const cy = 200
  const radius = Math.min(SCREEN_W * 0.38, 150)

  return objects.map((o, i) => {
    const angle = (i / Math.max(objects.length, 1)) * Math.PI * 2
    const r = o.type === 'project' ? radius * 0.5 : radius
    return {
      id: o.id,
      label: o.title.slice(0, 16),
      type: o.type,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      size: o.type === 'project' ? 12 : 8,
    }
  })
}

export default function MapScreen() {
  const [objects, setObjects] = useState<KefirObject[]>([])
  const [selected, setSelected] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('objects').select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(30)
    setObjects((data ?? []) as KefirObject[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const nodes = layoutCircular(objects)
  const selectedObj = objects.find(o => o.id === selected?.id)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Карта мыслей</Text>
        <Text style={styles.headerSub}>{nodes.length} узлов</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {!loading && nodes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }}>⊙</Text>
            <Text style={styles.emptyText}>
              Добавь мысли и проекты в Потоке — карта построится сама
            </Text>
          </View>
        ) : (
          <Svg width={SCREEN_W} height={420}>
            {/* Center hub */}
            <Circle cx={SCREEN_W / 2} cy={200} r={6} fill={Colors.accent} />

            {/* Lines from center */}
            {nodes.map(n => (
              <Line
                key={`line-${n.id}`}
                x1={SCREEN_W / 2} y1={200}
                x2={n.x} y2={n.y}
                stroke={Colors.border}
                strokeWidth={1}
                opacity={selected && selected.id !== n.id ? 0.2 : 0.5}
              />
            ))}

            {/* Nodes */}
            {nodes.map(n => {
              const color = TypeColors[n.type] ?? Colors.accent
              const isSelected = selected?.id === n.id
              return (
                <G key={n.id} onPress={() => setSelected(isSelected ? null : n)}>
                  {isSelected && (
                    <Circle cx={n.x} cy={n.y} r={n.size + 6} fill={`${color}30`} />
                  )}
                  <Circle
                    cx={n.x} cy={n.y} r={n.size}
                    fill={`${color}20`} stroke={color}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <Circle cx={n.x} cy={n.y} r={n.size * 0.4} fill={color} />
                  <SvgText
                    x={n.x} y={n.y + n.size + 14}
                    fontSize="9" fill={Colors.muted}
                    textAnchor="middle"
                  >
                    {n.label}
                  </SvgText>
                </G>
              )
            })}
          </Svg>
        )}

        {selectedObj && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: `${TypeColors[selectedObj.type]}20` }]}>
                <Text style={{ color: TypeColors[selectedObj.type], fontSize: 16 }}>●</Text>
              </View>
              <Text style={styles.detailTitle}>{selectedObj.title}</Text>
            </View>
            {selectedObj.content && (
              <Text style={styles.detailContent} numberOfLines={3}>{selectedObj.content}</Text>
            )}
            <TouchableOpacity style={styles.detailClose} onPress={() => setSelected(null)}>
              <Text style={{ color: Colors.muted, fontSize: 12 }}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(TypeColors).slice(0, 6).map(([type, color]) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{type}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.muted, marginTop: 2 },

  empty: { alignItems: 'center', paddingTop: 100, paddingHorizontal: 40 },
  emptyText: { fontSize: 13, color: Colors.muted, textAlign: 'center' },

  detailCard: {
    margin: 16, padding: 14, borderRadius: 14,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.accent,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  detailIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  detailTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, flex: 1 },
  detailContent: { fontSize: 12, color: Colors.muted, lineHeight: 17, marginBottom: 8 },
  detailClose: { alignSelf: 'flex-end' },

  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.muted },
})
