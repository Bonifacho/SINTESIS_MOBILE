import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { useAuthStore } from '@/src/store/authStore';
import { useMockDB } from '@/src/store/mockDB';
import { Ionicons } from '@expo/vector-icons';

export default function TraineeGroupsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const getGroupsByTrainee = useMockDB((s) => s.getGroupsByTrainee);
  const getStudentsByGroup = useMockDB((s) => s.getStudentsByGroup);
  
  const myGroups = getGroupsByTrainee(user?.id || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Grupos Asignados</Text>
        <Text style={styles.subtitle}>Selecciona un grupo para observar su progreso.</Text>
      </View>
      
      <FlatList
        data={myGroups}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => {
          const studentCount = getStudentsByGroup(item.id).length;
          return (
            <TouchableOpacity 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(trainee)/students', params: { preselectedGroup: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="eye" size={24} color={Colors.info} />
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.studentCount}>{studentCount} Estudiantes en observación</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.info, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.dark },
  cardDesc: { fontSize: 14, color: Colors.gray, marginBottom: 16, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.window, paddingTop: 12 },
  studentCount: { fontSize: 13, fontWeight: '600', color: Colors.info }
});