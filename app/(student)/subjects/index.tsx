import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Mocks basados en tus modelos de la Base de Datos
const MOCK_SUBJECTS = [
  { id: '1', name: 'Química Orgánica', description: 'Nomenclatura de hidrocarburos y reacciones.', teacher: 'Prof. Carlos Ramírez' },
  { id: '2', name: 'Fisicoquímica', description: 'Termodinámica y cinética química.', teacher: 'Dra. María Gómez' },
  { id: '3', name: 'Bioquímica', description: 'Estructura y función de biomoléculas.', teacher: 'Prof. Luis Torres' },
];

export default function SubjectsScreen() {
  const router = useRouter();

  // Enrutamiento protegido hacia el OVA (ruta oculta en el Tab)
  const handleSelectSubject = (subjectName: string) => {
    router.push({ pathname: '/(student)/ovas', params: { name: subjectName } });
  };

  const renderSubjectCard = ({ item }: { item: typeof MOCK_SUBJECTS[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => handleSelectSubject(item.name)}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <IconSymbol name="book.fill" size={24} color={Colors.primary} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.teacherText}>{item.teacher}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.actionText}>Ver OVAs Disponibles</Text>
        <IconSymbol name="chevron.right" size={20} color={Colors.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Asignaturas</Text>
        <Text style={styles.subtitle}>Selecciona una materia para acceder a su contenido interactivo.</Text>
      </View>

      <FlatList
        data={MOCK_SUBJECTS}
        keyExtractor={(item) => item.id}
        renderItem={renderSubjectCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray, lineHeight: 20 },
  listContainer: { padding: 16, gap: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 3, // Elevación Material Design 3
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: Colors.window,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: `${Colors.primary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  teacherText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  cardDescription: { fontSize: 14, color: Colors.gray, lineHeight: 22, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.window },
  actionText: { fontSize: 14, fontWeight: '600', color: Colors.secondary },
});