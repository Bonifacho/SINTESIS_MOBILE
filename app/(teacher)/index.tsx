import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme/colors';

export default function TeacherGroupsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Grupos</Text>
        <Text style={styles.subtitle}>Selecciona un grupo para administrar su contenido.</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando grupos asignados...</Text>
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