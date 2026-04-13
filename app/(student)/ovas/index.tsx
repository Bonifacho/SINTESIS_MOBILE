import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useMockDB } from '@/src/store/mockDB';

export default function OvasListScreen() {
  const router = useRouter();
  const { groupId, name } = useLocalSearchParams<{ groupId: string; name: string }>();
  
  const getTopicsByGroup = useMockDB((s) => s.getTopicsByGroup);
  const getOvasByTopic   = useMockDB((s) => s.getOvasByTopic);

  const topics = getTopicsByGroup(Number(groupId));

  const handleOpenResource = async (ova: any) => {
    if (ova.has_exam || ova.resource_type === 'exam') {
      router.replace(`/(student)/ovas/exam/${ova.id}` as any);
    } else if (ova.resource_type === 'video' && ova.resource_url) {
      // Abre el enlace real en el celular (YouTube)
      const supported = await Linking.canOpenURL(ova.resource_url);
      if (supported) {
        await Linking.openURL(ova.resource_url);
      } else {
        Alert.alert('Error', 'No se puede abrir el video.');
      }
    } else {
      Alert.alert('Recurso', `Abriendo contenido: ${ova.title}`);
    }
  };

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
          const ovas = getOvasByTopic(topic.id);
          return (
            <View key={topic.id} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              
              {ovas.map((ova) => {
                const isExam = ova.has_exam; 
                
                return (
                  <TouchableOpacity
                    key={ova.id}
                    style={styles.ovaItem}
                    activeOpacity={0.7}
                    onPress={() => handleOpenResource(ova)}
                  >
                    <View style={[styles.iconBox, isExam && styles.iconBoxExam]}>
                      <Ionicons 
                        name={isExam ? 'document-text' : (ova.resource_type === 'video' ? 'play-circle' : 'book')} 
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
  header: { padding: 20, paddingTop: 48, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.dark },
  content: { padding: 20, gap: 16 },
  topicCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.window },
  topicTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 12 },
  ovaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxExam: { backgroundColor: Colors.primary },
  ovaInfo: { flex: 1 },
  ovaTitle: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  ovaType: { fontSize: 13, color: Colors.gray, marginTop: 2 },
});