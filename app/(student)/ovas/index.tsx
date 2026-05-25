import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import type { AcademicTopic, AcademicOva } from '@/src/models/academic';

export default function OvasListScreen() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { groupId, name } = useLocalSearchParams<{ groupId: string; name: string }>();

  const [topics, setTopics] = useState<AcademicTopic[]>([]);
  const [ovasByTopic, setOvasByTopic] = useState<Record<number, AcademicOva[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener temas del grupo
        const topicsRes = await academicApi.getGroupTopics(Number(groupId));
        const fetchedTopics = topicsRes.data.data;
        setTopics(fetchedTopics);

        // 2. Obtener OVAs de cada tema en paralelo
        const ovasMap: Record<number, AcademicOva[]> = {};
        const ovasPromises = fetchedTopics.map(async (topic) => {
          const ovasRes = await academicApi.getOvasByTopic(topic.id);
          ovasMap[topic.id] = ovasRes.data.data;
        });
        await Promise.all(ovasPromises);
        setOvasByTopic(ovasMap);
      } catch (err) {
        console.error('[OVAs] Error cargando contenido:', err);
        setError('No se pudo cargar el contenido de esta materia.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleOpenResource = async (ova: AcademicOva) => {
    // ── Tracking Silencioso ──────────────────────────────────────────────────
    // Registra acceso al recurso para métricas del docente. Nunca bloquea la UI.
    if (user?.id) {
      academicApi.trackProgress(
        user.id, ova.id,
        ova.resources?.some(r => r.resource_type === 'text') ? 'resource_opened' : 'exam_opened'
      ).catch((err) => {
        console.error('[Tracking] Error registrando acceso al recurso:', err);
      });
    }

    // Detectar si la OVA tiene examen (por convención: resource_type o flag)
    const hasExam = ova.resources?.length === 0 || ova.title.toLowerCase().includes('evaluación') || ova.title.toLowerCase().includes('test');

    if (hasExam) {
      router.push(`/(student)/ovas/exam/${ova.id}` as any);
    } else {
      const videoResource = ova.resources?.find(r => r.resource_type === 'video');
      if (videoResource?.url) {
        // Navegación interna al reproductor embebido
        router.push({
          pathname: '/(student)/ovas/video/[id]' as any,
          params: {
            id: ova.id,
            url: videoResource.url,
            title: ova.title,
          },
        });
      } else {
        Alert.alert('Recurso', `Abriendo contenido: ${ova.title}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/(student)/subjects')}>
          <Text style={styles.retryText}>Volver a Materias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(student)/subjects')}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Materias</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{name ?? 'Material de estudio'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {topics.map((topic) => {
          const ovas = ovasByTopic[topic.id] ?? [];
          return (
            <View key={topic.id} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              
              {ovas.length === 0 && (
                <Text style={styles.emptyTopic}>Sin contenido disponible aún.</Text>
              )}

              {ovas.map((ova) => {
                const isExam = ova.resources?.length === 0 || ova.title.toLowerCase().includes('evaluación') || ova.title.toLowerCase().includes('test');
                
                const resourceType = ova.resources?.[0]?.resource_type;

                return (
                  <TouchableOpacity
                    key={ova.id}
                    style={styles.ovaItem}
                    activeOpacity={0.7}
                    onPress={() => handleOpenResource(ova)}
                  >
                    <View style={[styles.iconBox, isExam && styles.iconBoxExam]}>
                      <Ionicons 
                        name={isExam ? 'document-text' : (resourceType === 'video' ? 'play-circle' : 'book')} 
                        size={20} 
                        color={isExam ? Colors.surface : Colors.primary} 
                      />
                    </View>
                    <View style={styles.ovaInfo}>
                      <Text style={styles.ovaTitle}>{ova.title}</Text>
                      <Text style={styles.ovaType}>{isExam ? 'Evaluación' : 'Recurso interactivo'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  header: { padding: 20, paddingTop: 48, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.dark },
  content: { padding: 20, gap: 16 },
  topicCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.window },
  topicTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  emptyTopic: { fontSize: 13, color: Colors.gray, fontStyle: 'italic', paddingVertical: 8 },
  ovaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxExam: { backgroundColor: Colors.primary },
  ovaInfo: { flex: 1 },
  ovaTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  ovaType: { fontSize: 13, color: Colors.gray, marginTop: 2 },
});