import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function TeacherResultsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultados de Exámenes</Text>
        <Text style={styles.subtitle}>Monitorea el rendimiento de tus estudiantes.</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Consultando métricas de evaluación...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.window },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.gray },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: Colors.gray, fontStyle: 'italic' },
});