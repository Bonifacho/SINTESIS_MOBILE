import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function TraineeStudents() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Directorio de Estudiantes</Text>
        <Text style={styles.subtitle}>Busca a un alumno específico para auditar sus notas.</Text>
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aquí integraremos el buscador del profesor...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: '700', color: Colors.dark },
  subtitle: { fontSize: 14, color: Colors.gray, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: Colors.gray, fontStyle: 'italic' },
});