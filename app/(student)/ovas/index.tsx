import { useThemeStore } from '@/src/store/themeStore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import type { AcademicTopic, AcademicOva } from '@/src/models/academic';

export default function OvasListScreen() {
  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);
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

  const handleOpenResource = async (ova: AcademicOva, topicTitle: string, resource: any) => {
    if (user?.id) {
      academicApi.trackProgress(
        user.id, ova.id, 'resource_opened',
        { topic_name: topicTitle, resource_name: resource.display_title }
      ).catch((err) => console.error('[Tracking] Error:', err));
    }

    if (resource.url) {
      router.push({
        pathname: '/(student)/ovas/video/[id]' as any,
        params: {
          id: ova.id,
          url: resource.url,
          title: resource.display_title,
        },
      });
    } else {
      Alert.alert('Recurso', `Abriendo contenido: ${resource.display_title}`);
    }
  };

  const handleOpenExam = async (ova: AcademicOva, topicTitle: string) => {
    if (user?.id) {
      academicApi.trackProgress(
        user.id, ova.id, 'exam_opened',
        { topic_name: topicTitle, resource_name: ova.exam_title || 'Examen' }
      ).catch((err) => console.error('[Tracking] Error:', err));
    }
    router.push(`/(student)/ovas/exam/${ova.id}` as any);
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
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.push('/(student)/subjects')}>
          <Text style={styles.retryText}>Volver a Materias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(student)/subjects')}>
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

              {ovas.map((ova) => (
                <View key={ova.id} style={styles.ovaContainer}>
                  <Text style={styles.ovaGroupTitle}>{ova.title}</Text>
                  
                  {/* Lista de Recursos */}
                  {ova.resources?.map((res) => (
                    <TouchableOpacity
                      key={res.id}
                      style={styles.ovaItem}
                      activeOpacity={0.7}
                      onPress={() => handleOpenResource(ova, topic.title, res)}
                    >
                      <View style={styles.iconBox}>
                        <Ionicons 
                          name={res.resource_type === 'video' ? 'play-circle' : 'document'} 
                          size={20} 
                          color={Colors.primary} 
                        />
                      </View>
                      <View style={styles.ovaInfo}>
                        <Text style={styles.ovaTitle}>{res.display_title}</Text>
                        <Text style={styles.ovaType}>Recurso interactivo</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                    </TouchableOpacity>
                  ))}

                  {/* Evaluación */}
                  {ova.has_exam && (
                    <TouchableOpacity
                      style={styles.ovaItem}
                      activeOpacity={0.7}
                      onPress={() => handleOpenExam(ova, topic.title)}
                    >
                      <View style={[styles.iconBox, styles.iconBoxExam]}>
                        <Ionicons name="document-text" size={20} color={Colors.surface} />
                      </View>
                      <View style={styles.ovaInfo}>
                        <Text style={styles.ovaTitle}>{ova.exam_title || 'Examen'}</Text>
                        <Text style={styles.ovaType}>Evaluación</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#121212' : Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 15, color: Colors.error, textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  header: { padding: 20, paddingTop: 48, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2C' : Colors.window },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: isDark ? '#FFFFFF' : Colors.dark },
  content: { padding: 20, gap: 16 },
  topicCard: { backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : Colors.window },
  topicTitle: { fontSize: 16, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark, marginBottom: 12 },
  emptyTopic: { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, fontStyle: 'italic', paddingVertical: 8 },
  ovaContainer: { marginBottom: 8, marginTop: 4 },
  ovaGroupTitle: { fontSize: 14, fontWeight: '600', color: isDark ? '#AAAAAA' : Colors.gray, marginBottom: 8, textTransform: 'uppercase' },
  ovaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: isDark ? '#2C2C2C' : Colors.window },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: isDark ? '#121212' : Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxExam: { backgroundColor: Colors.primary },
  ovaInfo: { flex: 1 },
  ovaTitle: { fontSize: 15, fontWeight: '600', color: isDark ? '#FFFFFF' : Colors.dark },
  ovaType: { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 2 },
});